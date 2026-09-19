import { SessionId } from "@deepseek-ai/dsh-session";
import { TimeoutReason, deadline, timeoutOf } from "@deepseek-ai/dsh-timeout";
import { createUserMessage } from "@deepseek-ai/dsh-llm/message";
import { lstatSync, readFileSync, statSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
//#region src/report/artifact-store.ts
/** Copy and freeze one record before it crosses the service boundary. */
function snapshot$2(value) {
	return Object.freeze({ ...value });
}
/**
* Owning handle for the `report_artifacts` table — the single writer both
* `SastStore` and `BatchStore` delegate to once M5 composes them against
* the same domain.
*/
var ReportArtifactStore = class {
	domain;
	now;
	queue = Promise.resolve();
	counter;
	constructor(domain, now = () => Date.now()) {
		this.domain = domain;
		this.now = now;
	}
	/** Serialize id allocation and writes across every caller (SastStore and BatchStore alike). */
	enqueue(operation) {
		const current = this.queue.then(operation);
		this.queue = current.then(() => void 0, () => void 0);
		return current;
	}
	async nextId() {
		if (this.counter === void 0) {
			let max = 0;
			for (const [, row] of (await this.domain()).table("report_artifacts").entries()) {
				const seq = /^artifact-(\d+)$/.exec(row.id)?.[1];
				if (seq !== void 0) max = Math.max(max, Number(seq));
			}
			this.counter = max;
		}
		this.counter += 1;
		return `artifact-${this.counter}`;
	}
	/** Allocate an id and clock value, then persist one report artifact row. */
	async put(fields) {
		return this.enqueue(async () => {
			const id = await this.nextId();
			const record = snapshot$2({
				id,
				...fields,
				createdAt: this.now()
			});
			await (await this.domain()).table("report_artifacts").put(id, record);
			return record;
		});
	}
	/** Read one report artifact row by its durable id, if present. */
	async get(id) {
		return (await this.domain()).table("report_artifacts").get(id);
	}
	/** Reset in-memory state (mirrors the owning store's own `dispose()`). Never resets the underlying table. */
	reset() {
		this.counter = void 0;
		this.queue = Promise.resolve();
	}
};
//#endregion
//#region src/batch/store.ts
/** Physical key for a batch-scoped row (mirrors `store.ts`'s `recordKey`). */
function recordKey$1(batchId, id) {
	return `${batchId}:${id}`;
}
/** Copy and freeze one record before it crosses the service boundary (mirrors `store.ts`'s `snapshot`). */
function snapshot$1(value) {
	return Object.freeze({ ...value });
}
/** Legal job status transitions (CAS — every other edge is rejected). Terminal states have no outgoing edge (except `retry_wait -> queued`, modeled as `queued`'s own incoming set). */
const LEGAL_JOB_TRANSITIONS = {
	queued: /* @__PURE__ */ new Set(["preparing", "cancelled"]),
	preparing: /* @__PURE__ */ new Set([
		"running",
		"cancelled",
		"failed",
		"timed_out"
	]),
	running: /* @__PURE__ */ new Set([
		"retry_wait",
		"succeeded",
		"degraded",
		"skipped",
		"failed",
		"timed_out",
		"cancelled"
	]),
	retry_wait: /* @__PURE__ */ new Set(["queued", "cancelled"]),
	succeeded: /* @__PURE__ */ new Set([]),
	degraded: /* @__PURE__ */ new Set([]),
	skipped: /* @__PURE__ */ new Set([]),
	failed: /* @__PURE__ */ new Set([]),
	timed_out: /* @__PURE__ */ new Set([]),
	cancelled: /* @__PURE__ */ new Set([])
};
/** Automatic-execution terminal states: each releases the queue to advance to the next ordinal. */
const AUTO_TERMINAL_JOB_STATUSES = /* @__PURE__ */ new Set([
	"succeeded",
	"degraded",
	"skipped",
	"failed",
	"timed_out"
]);
/** Legal batch status transitions (CAS). A user retrying part of a batch moves it back to `running`. */
const LEGAL_BATCH_TRANSITIONS = {
	queued: /* @__PURE__ */ new Set(["running"]),
	running: /* @__PURE__ */ new Set([
		"awaiting_review",
		"completed",
		"completed_with_issues"
	]),
	awaiting_review: /* @__PURE__ */ new Set([
		"running",
		"completed",
		"completed_with_issues"
	]),
	completed: /* @__PURE__ */ new Set(["running"]),
	completed_with_issues: /* @__PURE__ */ new Set(["running"])
};
/**
* Owning handle for the batch control-plane tables. Not a Cordis service:
* a private helper constructed once per plugin `apply` fiber (M5), sharing
* the same open `sast` domain `SastStore` uses (see `SastStore`'s
* `sharedDomain` constructor parameter — the domain can only be opened
* once per facility).
*/
var BatchStore = class {
	domain;
	now;
	batchQueues = /* @__PURE__ */ new Map();
	eventSeqCache = /* @__PURE__ */ new Map();
	artifacts;
	/**
	* @param domain - shared opener resolving the already-open `sast` domain (see class doc).
	* @param now - injected clock (ADR-10): every timestamp here comes from this, never model input or the OS clock read elsewhere.
	* @param artifacts - optional shared `report_artifacts` store — MUST be the same instance `SastStore` uses once M5 composes both against the same domain (two independent id counters over one table can collide); defaults to a private instance over this store's own `domain()` opener.
	*/
	constructor(domain, now = () => Date.now(), artifacts) {
		this.domain = domain;
		this.now = now;
		this.artifacts = artifacts ?? new ReportArtifactStore(domain, now);
	}
	/** Serialize read/allocate/write transactions for one batch (mirrors `store.ts`'s per-session `enqueue`). */
	enqueue(batchId, operation) {
		const current = (this.batchQueues.get(batchId) ?? Promise.resolve()).then(operation);
		const settled = current.then(() => void 0, () => void 0);
		this.batchQueues.set(batchId, settled);
		return current;
	}
	/** Read one batch row, if present. */
	async getBatch(batchId) {
		return (await this.domain()).table("batches").get(batchId);
	}
	/**
	* Read the most recently created batch owned by one session (v1: an
	* owner session runs at most one batch at a time — the "active batch
	* pin" the tools layer resolves `sast_batch_state`/`sast_batch_report`
	* against when the model does not name a `batchId` explicitly).
	*/
	async getBatchByOwner(ownerSessionId) {
		return [...(await this.domain()).table("batches").entries()].map(([, row]) => row).filter((row) => row.ownerSessionId === ownerSessionId).sort((a, b) => b.createdAt - a.createdAt)[0];
	}
	/** Read one job row within a batch, if present. */
	async getJob(batchId, jobId) {
		return (await this.domain()).table("scan_jobs").get(recordKey$1(batchId, jobId));
	}
	/** Read every job row of one batch, ordered by ordinal. */
	async listJobs(batchId) {
		return [...(await this.domain()).table("scan_jobs").entries()].map(([, row]) => row).filter((row) => row.batchId === batchId).sort((a, b) => a.ordinal - b.ordinal);
	}
	/** Read every event of one batch, ordered by `seq`. */
	async listEvents(batchId) {
		return [...(await this.domain()).table("job_events").entries()].map(([, row]) => row).filter((row) => row.batchId === batchId).sort((a, b) => a.seq - b.seq);
	}
	/** The next `seq` for one batch's append-only event log — O(1) after the first call, rebuilt from the durable table on first touch. */
	async nextEventSeq(batchId) {
		let max = this.eventSeqCache.get(batchId);
		if (max === void 0) {
			max = 0;
			for (const [, row] of (await this.domain()).table("job_events").entries()) if (row.batchId === batchId) max = Math.max(max, row.seq);
		}
		const next = max + 1;
		this.eventSeqCache.set(batchId, next);
		return next;
	}
	/** Append one lifecycle/decision event to a batch's log (never mutated or deleted afterward). */
	async appendEvent(batchId, jobId, kind, detail) {
		const domain = await this.domain();
		const seq = await this.nextEventSeq(batchId);
		const id = `event-${batchId}-${seq}`;
		const event = snapshot$1({
			id,
			batchId,
			...jobId !== void 0 ? { jobId } : {},
			seq,
			kind,
			detail,
			at: this.now()
		});
		await domain.table("job_events").put(recordKey$1(batchId, id), event);
		return event;
	}
	/**
	* Atomically create one batch and every one of its jobs (1..100,
	* `ordinal` 1-based and unique within the batch). All-or-nothing: any
	* failure mid-write rolls back every row already put, so a partial batch
	* never becomes visible — the caller (`sast_start_batch`'s tool boundary)
	* is expected to have already validated repository count/authorization/
	* methodology resolution BEFORE calling this, so a failure here should
	* only ever be an id/backend problem, not a normal validation rejection.
	*/
	async createBatch(batchId, input) {
		return this.enqueue(batchId, async () => {
			const domain = await this.domain();
			if (input.repositories.length < 1 || input.repositories.length > 100) throw new Error("sast: a batch must contain between 1 and 100 repositories");
			const createdAt = this.now();
			const batch = snapshot$1({
				id: batchId,
				ownerSessionId: input.ownerSessionId,
				objective: input.objective,
				authorization: input.authorization ?? "",
				methodologies: [...input.methodologies ?? []],
				methodologyMode: input.methodologyMode ?? "explicit-only",
				policy: {
					maxAttempts: input.policy?.maxAttempts ?? 2,
					...input.policy?.cloneTimeoutMs !== void 0 ? { cloneTimeoutMs: input.policy.cloneTimeoutMs } : {},
					...input.policy?.jobTimeoutMs !== void 0 ? { jobTimeoutMs: input.policy.jobTimeoutMs } : {},
					autoNarrowScope: input.policy?.autoNarrowScope ?? true,
					deduplicate: input.policy?.deduplicate ?? true,
					concurrency: 1
				},
				status: "queued",
				total: input.repositories.length,
				createdAt
			});
			const written = [];
			try {
				await domain.table("batches").put(batchId, batch);
				written.push({
					table: "batches",
					key: batchId
				});
				const jobs = [];
				for (const [index, repo] of input.repositories.entries()) {
					const ordinal = index + 1;
					const jobId = `job-${ordinal}`;
					const job = snapshot$1({
						id: jobId,
						batchId,
						ordinal,
						repoSpec: {
							provider: repo.provider,
							repoUrl: repo.repoUrl,
							...repo.branch !== void 0 ? { branch: repo.branch } : {},
							...repo.ref !== void 0 ? { ref: repo.ref } : {},
							scope: [...repo.scope ?? []],
							...repo.objective !== void 0 ? { objective: repo.objective } : {}
						},
						attempt: 0,
						status: "queued",
						reviewStatus: "none",
						createdAt,
						updatedAt: createdAt
					});
					await domain.table("scan_jobs").put(recordKey$1(batchId, jobId), job);
					written.push({
						table: "scan_jobs",
						key: recordKey$1(batchId, jobId)
					});
					jobs.push(job);
				}
				await this.appendEvent(batchId, void 0, "batch-created", `${jobs.length} job(s)`);
				return {
					batch,
					jobs
				};
			} catch (error) {
				for (const { table, key } of written.reverse()) try {
					await domain.table(table).delete(key);
				} catch {}
				throw error;
			}
		});
	}
	/** CAS a batch's status. Throws (naming both states) on an illegal transition; a no-op when `to` already equals the current status. */
	async transitionBatch(batchId, to) {
		return this.enqueue(batchId, async () => {
			const domain = await this.domain();
			const current = domain.table("batches").get(batchId);
			if (current === void 0) throw new Error(`sast: batch ${batchId} does not exist`);
			if (current.status === to) return current;
			if (!LEGAL_BATCH_TRANSITIONS[current.status].has(to)) throw new Error(`sast: illegal batch transition ${current.status} -> ${to} for batch ${batchId}`);
			const updated = snapshot$1({
				...current,
				status: to
			});
			await domain.table("batches").put(batchId, updated);
			await this.appendEvent(batchId, void 0, "batch-status", `${current.status} -> ${to}`);
			return updated;
		});
	}
	/**
	* CAS one job's status. `cancelled` (user cancellation) is legal from
	* every non-terminal state and additionally moves the batch itself so the
	* scheduler stops claiming further ordinals (the caller drives that batch
	* transition; this method only enforces the job-level CAS and logs the
	* event with `detail`).
	*/
	async transitionJob(batchId, jobId, to, detail = "") {
		return this.enqueue(batchId, async () => {
			const domain = await this.domain();
			const key = recordKey$1(batchId, jobId);
			const current = domain.table("scan_jobs").get(key);
			if (current === void 0) throw new Error(`sast: job ${jobId} does not exist in batch ${batchId}`);
			if (current.status === to) return current;
			if (!LEGAL_JOB_TRANSITIONS[current.status].has(to)) throw new Error(`sast: illegal job transition ${current.status} -> ${to} for job ${jobId}`);
			const updated = snapshot$1({
				...current,
				status: to,
				updatedAt: this.now()
			});
			await domain.table("scan_jobs").put(key, updated);
			await this.appendEvent(batchId, jobId, "job-status", detail === "" ? `${current.status} -> ${to}` : `${current.status} -> ${to}: ${detail}`);
			return updated;
		});
	}
	/**
	* Record the worker session id the scheduler created for this job's
	* current attempt — the seam `sast_batch_state`/`sast_batch_report`'s
	* `JobSummaryResolver` uses to find that worker's own durable coverage/
	* findings (`workerSessionId`, declared in the schema but otherwise never
	* written: the scheduler computes the session id deterministically
	* itself, right after `claimJob`, so this is a plain informational write,
	* never load-bearing for the CAS state machine itself). Does not append a
	* `job_events` row — this is bookkeeping, not a status transition.
	*/
	async setWorkerSessionId(batchId, jobId, workerSessionId) {
		return this.enqueue(batchId, async () => {
			const domain = await this.domain();
			const key = recordKey$1(batchId, jobId);
			const current = domain.table("scan_jobs").get(key);
			if (current === void 0) throw new Error(`sast: job ${jobId} does not exist in batch ${batchId}`);
			const updated = snapshot$1({
				...current,
				workerSessionId,
				updatedAt: this.now()
			});
			await domain.table("scan_jobs").put(key, updated);
			return updated;
		});
	}
	/** Whether a job status is one of the five automatic-execution terminal states (each releases the queue to advance). */
	static isAutoTerminal(status) {
		return AUTO_TERMINAL_JOB_STATUSES.has(status);
	}
	/**
	* Attempt to claim a lease on one job for `leaseOwner`, bumping `attempt`.
	* Fails (returns `undefined`) when the job is not `queued` — including a
	* job already claimed by anyone (claiming moves it straight to
	* `preparing`, so a second claim attempt against the same job, same owner
	* or not, always sees a non-`queued` status and fails). The additional
	* lease-liveness check below guards the one path that can leave a job
	* `queued` again while still carrying a PRIOR lease's fields: the
	* `retry_wait -> queued` transition does not clear `leaseOwner`/
	* `leaseExpiresAt` (only {@link recoverExpiredLeases} does), so a
	* different owner racing a fresh claim just after that transition would
	* otherwise be able to grab a job whose earlier lease has not actually
	* expired yet.
	*/
	async claimJob(batchId, jobId, leaseOwner, leaseMs) {
		return this.enqueue(batchId, async () => {
			const domain = await this.domain();
			const key = recordKey$1(batchId, jobId);
			const current = domain.table("scan_jobs").get(key);
			if (current === void 0) return void 0;
			if (current.status !== "queued") return void 0;
			const now = this.now();
			if (current.leaseOwner !== void 0 && current.leaseExpiresAt !== void 0 && current.leaseExpiresAt > now && current.leaseOwner !== leaseOwner) return;
			const updated = snapshot$1({
				...current,
				status: "preparing",
				attempt: current.attempt + 1,
				leaseOwner,
				leaseExpiresAt: now + leaseMs,
				updatedAt: now
			});
			await domain.table("scan_jobs").put(key, updated);
			await this.appendEvent(batchId, jobId, "job-claimed", `owner=${leaseOwner} attempt=${updated.attempt}`);
			return updated;
		});
	}
	/** Renew an already-claimed job's lease (extends `leaseExpiresAt`; does not change `status` or `attempt`). Throws if `leaseOwner` does not match the current holder — a stale worker must not renew a lease it already lost. */
	async renewLease(batchId, jobId, leaseOwner, leaseMs) {
		return this.enqueue(batchId, async () => {
			const domain = await this.domain();
			const key = recordKey$1(batchId, jobId);
			const current = domain.table("scan_jobs").get(key);
			if (current === void 0) throw new Error(`sast: job ${jobId} does not exist in batch ${batchId}`);
			if (current.leaseOwner !== leaseOwner) throw new Error(`sast: job ${jobId}'s lease is held by '${current.leaseOwner}', not '${leaseOwner}'`);
			const updated = snapshot$1({
				...current,
				leaseExpiresAt: this.now() + leaseMs
			});
			await domain.table("scan_jobs").put(key, updated);
			return updated;
		});
	}
	/**
	* Recover every job whose lease has expired while still `preparing`/
	* `running` (a crashed or killed worker never reported a terminal
	* status) back to `queued` so the scheduler can re-claim it — called on
	* scheduler startup (A21: "中途重启后回收 lease 并继续"). Returns the
	* recovered jobs.
	*/
	async recoverExpiredLeases(batchId) {
		const domain = await this.domain();
		const now = this.now();
		const expired = [...domain.table("scan_jobs").entries()].map(([, row]) => row).filter((row) => row.batchId === batchId && (row.status === "preparing" || row.status === "running") && row.leaseExpiresAt !== void 0 && row.leaseExpiresAt <= now);
		const recovered = [];
		for (const job of expired) recovered.push(await this.enqueue(batchId, async () => {
			const key = recordKey$1(batchId, job.id);
			const current = domain.table("scan_jobs").get(key);
			if (current === void 0 || current.status !== "preparing" && current.status !== "running") return current ?? job;
			if (current.leaseExpiresAt === void 0 || current.leaseExpiresAt > this.now()) return current;
			const updated = snapshot$1({
				...current,
				status: "queued",
				leaseOwner: void 0,
				leaseExpiresAt: void 0,
				updatedAt: this.now()
			});
			await domain.table("scan_jobs").put(key, updated);
			await this.appendEvent(batchId, job.id, "lease-recovered", `stale owner=${current.leaseOwner ?? "unknown"}`);
			return updated;
		}));
		return recovered;
	}
	/** Set a job's `reviewStatus` (Review Inbox membership) — never touches `status`, `errorClass`, or `fallback` (A24: a resolve decision must not rewrite the original failure). */
	async setReviewStatus(batchId, jobId, reviewStatus, reason = "") {
		return this.enqueue(batchId, async () => {
			const domain = await this.domain();
			const key = recordKey$1(batchId, jobId);
			const current = domain.table("scan_jobs").get(key);
			if (current === void 0) throw new Error(`sast: job ${jobId} does not exist in batch ${batchId}`);
			const updated = snapshot$1({
				...current,
				reviewStatus,
				updatedAt: this.now()
			});
			await domain.table("scan_jobs").put(key, updated);
			await this.appendEvent(batchId, jobId, "review-decision", reason === "" ? reviewStatus : `${reviewStatus}: ${reason}`);
			return updated;
		});
	}
	/**
	* Put a `reviewStatus=pending` job back in the queue at the user's
	* explicit request (`sast_batch_resolve`'s `retry` action, A24) — the ONE
	* legal way to leave a terminal state, deliberately outside
	* `LEGAL_JOB_TRANSITIONS` (which the scheduler's own automatic state
	* machine uses and which has no outgoing edge from any terminal status).
	* Requires `reviewStatus === 'pending'`: retrying a job nobody flagged for
	* review, or one already resolved, is a caller bug, not a legal request.
	* Does not touch `errorClass`/`fallback` — the original failure record
	* is append-only and survives the retry, even if this attempt succeeds.
	*/
	async requeueForRetry(batchId, jobId, reason = "") {
		return this.enqueue(batchId, async () => {
			const domain = await this.domain();
			const key = recordKey$1(batchId, jobId);
			const current = domain.table("scan_jobs").get(key);
			if (current === void 0) throw new Error(`sast: job ${jobId} does not exist in batch ${batchId}`);
			if (current.reviewStatus !== "pending") throw new Error(`sast: job ${jobId} is not awaiting review (reviewStatus=${current.reviewStatus}); only a pending job may be retried`);
			const updated = snapshot$1({
				...current,
				status: "queued",
				reviewStatus: "retried",
				leaseOwner: void 0,
				leaseExpiresAt: void 0,
				updatedAt: this.now()
			});
			await domain.table("scan_jobs").put(key, updated);
			await this.appendEvent(batchId, jobId, "review-decision", reason === "" ? "retried" : `retried: ${reason}`);
			return updated;
		});
	}
	/** Record a job's terminal outcome fields (`errorClass`/`fallback`/`reportArtifactId`) alongside its status transition, in one write. */
	async recordJobOutcome(batchId, jobId, to, fields, detail = "") {
		return this.enqueue(batchId, async () => {
			const domain = await this.domain();
			const key = recordKey$1(batchId, jobId);
			const current = domain.table("scan_jobs").get(key);
			if (current === void 0) throw new Error(`sast: job ${jobId} does not exist in batch ${batchId}`);
			if (current.status === to) return current;
			if (!LEGAL_JOB_TRANSITIONS[current.status].has(to)) throw new Error(`sast: illegal job transition ${current.status} -> ${to} for job ${jobId}`);
			const updated = snapshot$1({
				...current,
				status: to,
				...fields.errorClass !== void 0 ? { errorClass: fields.errorClass } : {},
				...fields.fallback !== void 0 ? { fallback: fields.fallback } : {},
				...fields.reportArtifactId !== void 0 ? { reportArtifactId: fields.reportArtifactId } : {},
				updatedAt: this.now()
			});
			await domain.table("scan_jobs").put(key, updated);
			await this.appendEvent(batchId, jobId, "job-status", detail === "" ? `${current.status} -> ${to}` : `${current.status} -> ${to}: ${detail}`);
			return updated;
		});
	}
	/** Read one report artifact row by its durable id (batch reports link to per-job artifacts written through the same table M4 already uses). */
	async getReportArtifact(id) {
		return this.artifacts.get(id);
	}
	/**
	* Find the repo-level report a job's worker produced by calling
	* `sast_report`, keyed by the `jobId` `sast_start_scan`'s
	* `batchLineageOf` auto-tags every one of that worker's durable rows with
	* (never a `sessionId` lookup — a resumed worker's session id can differ
	* attempt to attempt, but its `jobId` never does). `undefined` when the
	* worker never called `sast_report` (e.g. it failed/timed out first).
	* Prefers `repo-markdown` over `repo-sarif` when a worker somehow wrote
	* both (the common case is exactly one call).
	*/
	async findReportArtifactByJob(jobId) {
		const candidates = [...(await this.domain()).table("report_artifacts").entries()].map(([, row]) => row).filter((row) => row.jobId === jobId && (row.kind === "repo-markdown" || row.kind === "repo-sarif"));
		return candidates.find((row) => row.kind === "repo-markdown") ?? candidates[0];
	}
	/** Persist one report artifact row (batch/JSON reports, pinned methodology content) through the shared allocator (see class doc's `artifacts` field). */
	async putReportArtifact(fields) {
		return this.artifacts.put(fields);
	}
};
//#endregion
//#region src/batch/policy.ts
/**
* Pure batch-execution decision logic (M5): error classification, retry/
* fallback/skip decisions, and `coverageImpact` text — none of it touches
* the domain, a clock, or an agent. Kept separate from `scheduler.ts` (which
* drives the actual claim/lease/dispatch loop) so the judgment calls are the
* easiest part of the batch control plane to unit test.
* @module @tangxiaofeng7/dsh-sast-host/src/batch/policy
*/
/**
* Classify a job failure from its raw error message (never the model's own
* classification — the message is the same text ADR-07/ADR-13 already
* scrub of credentials before it reaches this function). Falls back to
* `'unknown'` rather than guessing a more specific (and more automatically
* retryable) class from ambiguous text.
*/
function classifyError(error) {
	if (timeoutOf({ reason: error }, "SAST_JOB_TIMEOUT") !== void 0) return "timeout";
	if (timeoutOf({ reason: error }, "SAST_CLONE_TIMEOUT") !== void 0) return "timeout";
	const text = (error instanceof Error ? error.message : String(error)).toLowerCase();
	if (text.includes("authentication failed") || text.includes("check the configured token")) return "auth";
	if (text.includes("not found in") && (text.includes("branch") || text.includes("ref"))) return "ref-not-found";
	if (text.includes("audit scope limit")) return "scope-exceeded";
	if (text.includes("storage") && (text.includes("corrupt") || text.includes("unavailable"))) return "infra";
	if (text.includes("git is not available")) return "infra";
	return "unknown";
}
/** Error classes a bounded retry may plausibly resolve (a fresh clone attempt, not a credential guess or scope change). */
const RETRYABLE = /* @__PURE__ */ new Set(["timeout", "unknown"]);
/**
* Decide what a repository worker's finished (or failed) attempt means for
* queue progression. `attempt` is 1-based (this attempt's own number);
* `maxAttempts` comes from the batch's immutable policy snapshot.
* `autoNarrowScope` is the same policy flag — when true, a `scope-exceeded`
* failure gets one retry with a narrowed scope (the worker's own job, not
* this function's) before it is treated as unretryable; when false, it
* skips immediately rather than silently narrowing scope.
*
* - `infra` is the one class that must NOT continue past — ADR (PRD §risk
*   table, A25): a global storage/isolation failure means correctness
*   itself is no longer guaranteed, so the caller must fail the whole batch
*   closed rather than let the scheduler claim another repo.
* - `blocked` never retries (a bounded audit already ran to completion; more
*   attempts would not change an unresolved dependency) — always `degrade`.
* - Every other class retries while `attempt < maxAttempts`; once attempts
*   are exhausted, `auth`/`ref-not-found`/`scope-exceeded` become `skip`
*   (the job never produced a usable partial audit) while `timeout`/
*   `unknown` become `degrade` (a partial audit may still exist from before
*   the failure — the caller decides which is true from what was actually
*   recorded, this function only names the intended review-inbox category).
*/
function decideOutcome(errorClass, attempt, maxAttempts, autoNarrowScope = true) {
	if (errorClass === "infra") return { action: "fail-closed" };
	if (errorClass === "blocked") return {
		action: "degrade",
		coverageImpact: "unresolved blocked check after bounded recovery attempts"
	};
	if ((RETRYABLE.has(errorClass) || errorClass === "scope-exceeded" && autoNarrowScope) && attempt < maxAttempts) return { action: "retry" };
	if (errorClass === "auth") return {
		action: "skip",
		coverageImpact: "authentication failed; no credential was guessed or escalated (ADR-07)"
	};
	if (errorClass === "ref-not-found") return {
		action: "skip",
		coverageImpact: "requested branch/ref does not exist; no other branch was substituted"
	};
	if (errorClass === "scope-exceeded") return {
		action: "skip",
		coverageImpact: "repository exceeds the configured size/file-count guardrail; scope was not silently narrowed"
	};
	return {
		action: "degrade",
		coverageImpact: `job did not complete after ${attempt} attempt(s): ${errorClass}`
	};
}
//#endregion
//#region src/batch/scheduler.ts
/**
* `DurableBatchScheduler` (M5): drives one batch's jobs to completion,
* strictly serial by ordinal (ADR-16: `concurrency` is fixed at 1), never
* asking the user about a single job's problem (A25) — safe retry,
* degrade, or skip are the only responses to a job failure; only a global
* infrastructure failure (`policy.ts`'s `'infra'` class) stops the loop.
*
* The scheduler is a host-side driver, not a model: it claims a job
* (`BatchStore.claimJob`), creates or resumes its worker
* (`RepositoryWorkerFactory`), starts it with a delegation prompt, races its
* `whenIdle()` against the job's deadline, and asks a
* {@link JobOutcomeResolver} what actually happened once the worker goes
* idle or the deadline fires — the resolver is the seam that will read the
* worker's own durable state (did it call `sast_report`? does a
* `report_artifacts` row exist for its session?) once `SastStore`/worker
* wiring lands; here it is injected so this module is fully testable
* against fakes without a real agent (spike-D is still unverified).
* @module @tangxiaofeng7/dsh-sast-host/src/batch/scheduler
*/
/** Default lease duration when a batch's policy sets no `jobTimeoutMs` — generous enough for a real audit, short enough that a crashed worker's lease clears within one scheduler restart cycle. The lease and the job deadline share this value: the lease must outlive the worker's own deadline, or the scheduler's own claim could be treated as stale before the worker even times out. */
const DEFAULT_JOB_TIMEOUT_MS = 12e5;
/** Deadline code stamped on a scheduler-driven job timeout (matches `policy.ts`'s `classifyError`). */
const JOB_TIMEOUT_CODE = "SAST_JOB_TIMEOUT";
/** Terminal statuses that map directly onto a {@link JobRunResult} outcome label. */
const AUTO_TERMINAL_STATUSES = /* @__PURE__ */ new Set([
	"succeeded",
	"degraded",
	"skipped",
	"failed",
	"timed_out"
]);
/**
* Drives one batch to completion (or a fail-closed halt), strictly serial by
* ordinal, never asking the user about a single job's problem.
*/
var DurableBatchScheduler = class {
	options;
	/** This instance's stable lease-owner identity (see {@link DurableBatchSchedulerOptions.leaseOwner}'s doc) — resolved once, in the constructor, never regenerated per call. */
	leaseOwner;
	constructor(options) {
		this.options = options;
		this.leaseOwner = options.leaseOwner ?? `scheduler:${Math.random().toString(36).slice(2)}`;
	}
	/**
	* Recover any lease left dangling by a prior process instance (A21), then
	* run every remaining `queued` job of the batch in ordinal order to a
	* terminal or fail-closed outcome. Idempotent to call again on a batch
	* that already has some terminal jobs — it only ever claims `queued` ones,
	* so an already-`succeeded` job is never re-run (the other half of A21).
	*/
	async run(batchId) {
		const batch = await this.options.store.getBatch(batchId);
		if (batch === void 0) throw new Error(`sast: batch ${batchId} does not exist`);
		await this.options.store.recoverExpiredLeases(batchId);
		const results = [];
		while (true) {
			const next = (await this.options.store.listJobs(batchId)).find((job) => job.status === "queued");
			if (next === void 0) break;
			const result = await this.runOneJob(batchId, batch, next);
			results.push(result);
			if (result.outcome === "fail-closed") return {
				results,
				failedClosed: true
			};
		}
		return {
			results,
			failedClosed: false
		};
	}
	/** Claim, run, and finalize exactly one job — the unit A18 requires be strictly sequential (never called concurrently by `run`'s own loop, and callers must not call it concurrently for the same batch either). */
	async runOneJob(batchId, batch, job) {
		const timeoutMs = batch.policy.jobTimeoutMs ?? DEFAULT_JOB_TIMEOUT_MS;
		const claimed = await this.options.store.claimJob(batchId, job.id, this.leaseOwner, timeoutMs);
		if (claimed === void 0) {
			const current = await this.options.store.getJob(batchId, job.id) ?? job;
			return {
				job: current,
				outcome: outcomeOf(current.status)
			};
		}
		const workerInput = {
			sessionId: `worker-${batchId}-${claimed.ordinal}-${claimed.attempt}`,
			cwd: await this.options.workspaceOf(claimed),
			batchId,
			job: claimed
		};
		const worker = await this.options.workerFactory.create(workerInput);
		try {
			await this.options.store.transitionJob(batchId, job.id, "running");
			await this.options.store.setWorkerSessionId(batchId, job.id, worker.sessionId);
			const prompt = this.options.promptBuilder.build(claimed);
			worker.start(prompt);
			using timer = deadline(void 0, timeoutMs, JOB_TIMEOUT_CODE);
			if (!await raceIdleAgainstDeadline(worker, timer.signal)) {
				worker.cancel(JOB_TIMEOUT_CODE);
				return await this.finalize(batchId, batch, claimed, {
					kind: "failed",
					error: new TimeoutReason(JOB_TIMEOUT_CODE, timeoutMs)
				});
			}
			const outcome = await this.options.outcomeResolver.resolve(claimed, worker);
			return await this.finalize(batchId, batch, claimed, outcome);
		} finally {
			await worker.dispose();
		}
	}
	/** Apply `policy.ts`'s decision for one resolved outcome, writing the job's terminal (or retry) state. */
	async finalize(batchId, batch, job, outcome) {
		if (outcome.kind === "succeeded") return {
			job: await this.options.store.recordJobOutcome(batchId, job.id, "succeeded", {}),
			outcome: "succeeded"
		};
		if (outcome.kind === "degraded" || outcome.kind === "skipped") {
			const updated = await this.options.store.recordJobOutcome(batchId, job.id, outcome.kind, { fallback: outcome.coverageImpact });
			await this.options.store.setReviewStatus(batchId, job.id, "pending", outcome.coverageImpact);
			return {
				job: updated,
				outcome: outcome.kind
			};
		}
		const errorClass = classifyError(outcome.error);
		const decision = decideOutcome(errorClass, job.attempt, batch.policy.maxAttempts, batch.policy.autoNarrowScope);
		return await this.applyFailureDecision(batchId, job, errorClass, decision);
	}
	async applyFailureDecision(batchId, job, errorClass, decision) {
		if (decision.action === "fail-closed") return {
			job,
			outcome: "fail-closed"
		};
		if (decision.action === "retry") {
			await this.options.store.transitionJob(batchId, job.id, "retry_wait", errorClass);
			return {
				job: await this.options.store.transitionJob(batchId, job.id, "queued"),
				outcome: "retried"
			};
		}
		const terminal = decision.action === "skip" ? "skipped" : errorClass === "timeout" ? "timed_out" : "degraded";
		const updated = await this.options.store.recordJobOutcome(batchId, job.id, terminal, {
			errorClass,
			fallback: decision.coverageImpact
		});
		await this.options.store.setReviewStatus(batchId, job.id, "pending", decision.coverageImpact);
		return {
			job: updated,
			outcome: terminal
		};
	}
};
/** Race a worker's `whenIdle()` against an already-armed deadline signal. Returns `true` when the worker idled first, `false` when the deadline fired first. */
async function raceIdleAgainstDeadline(worker, signal) {
	if (signal.aborted) return false;
	const onAbort = () => {
		settleDeadline();
	};
	let settleDeadline = () => {};
	const deadlinePromise = new Promise((resolve) => {
		settleDeadline = resolve;
		signal.addEventListener("abort", onAbort, { once: true });
	});
	try {
		const idle = worker.whenIdle().then(() => "idle");
		const timedOut = deadlinePromise.then(() => "timeout");
		return await Promise.race([idle, timedOut]) === "idle";
	} finally {
		signal.removeEventListener("abort", onAbort);
	}
}
/** Map a job's current status back to the closest {@link JobRunResult} outcome label, for the claim-race-lost path — a job that is already auto-terminal is reported as such; anything else (still queued, retry_wait, cancelled) is reported as `'retried'` (the loop will simply re-read and try again, or stop if it was cancelled). */
function outcomeOf(status) {
	if (AUTO_TERMINAL_STATUSES.has(status)) return status;
	return "retried";
}
//#endregion
//#region src/batch/worker.ts
/** Wrap a live `AgentHandle` to satisfy {@link RepositoryWorker}. */
function workerOf(handle) {
	return {
		sessionId: handle.agent.session.header.id,
		start: (prompt) => {
			handle.agent.followup(createUserMessage({
				content: [{
					type: "text",
					text: prompt
				}],
				source: { kind: "user" }
			}));
		},
		whenIdle: () => handle.agent.whenIdle(),
		cancel: (cause) => {
			handle.agent.cancel({
				kind: "hook",
				reason: cause
			});
		},
		dispose: () => handle.dispose()
	};
}
/**
* The real spike-D-verified implementation: `ctx.agents.create/resume`
* backed by a registered `AgentFactory` (`@deepseek-ai/dsh-agent-loop` in
* production). `meta.agentPreset: 'sast'` is presentation metadata ONLY —
* it does not by itself compose any tool, prompt section, or `toolFilter`
* onto the new session (verified against a real `ctx.agents.create()` +
* `@deepseek-ai/dsh-agent-presets` mount: a worker created with only
* `meta.agentPreset` set sees none of the preset's scoped tools). The
* actual composition happens through `setup`, the one supported call site
* for `ctx.agentPresets.mount(agentCtx, presetId)` — this is what actually
* gives the worker the read-only, no-shell `sast` preset tool surface
* (`preset/sast/agent.cordis.yml`) instead of silently inheriting whatever
* the composing plugin's own `ctx` happens to have globally registered
* (which, on a real multi-preset host, could include tools from OTHER
* presets entirely). `meta.cwd` is the BATCH OWNER's own trusted cwd (see
* {@link CreateWorkerInput.cwd}'s doc for why — never a per-job repository
* clone). Never sets `origin` — leaving it `undefined` is what keeps this
* session from ever being mistaken for a `subagent` delegation.
*/
function createAgentWorkerFactory(ctx, config) {
	const lineage = /* @__PURE__ */ new Map();
	const resolveAgentOptions = (batchId) => typeof config.agentOptions === "function" ? config.agentOptions(batchId) : config.agentOptions;
	const presetId = config.presetId ?? "sast";
	const mountPreset = async (agentCtx) => {
		const agentPresets = agentCtx.get("agentPresets");
		if (agentPresets === void 0) throw new Error("sast-batch: no ctx.agentPresets service is composed on this host (expected from @deepseek-ai/dsh-agent-presets, shipped by dsh-web-app) — cannot compose the sast preset's tool restrictions onto a batch worker session; refusing to create an unrestricted one");
		await agentPresets.mount(agentCtx, presetId);
	};
	return {
		create: async (input) => {
			const handle = await ctx.agents.create({
				sessionId: SessionId(input.sessionId),
				meta: {
					cwd: input.cwd,
					agentPreset: presetId
				},
				agentOptions: resolveAgentOptions(input.batchId),
				setup: mountPreset
			});
			lineage.set(input.sessionId, {
				batchId: input.batchId,
				jobId: input.job.id
			});
			return workerOf(handle);
		},
		resume: async (sessionId) => {
			const lineageForSession = lineage.get(sessionId);
			const agentOptions = lineageForSession !== void 0 ? resolveAgentOptions(lineageForSession.batchId) : resolveAgentOptions("");
			return workerOf(await ctx.agents.resume({
				resumeSessionId: SessionId(sessionId),
				agentOptions,
				setup: mountPreset
			}));
		},
		lineageOf: (sessionId) => lineage.get(sessionId)
	};
}
//#endregion
//#region src/coverage.ts
const EMPTY_CHECKS = {
	total: 0,
	covered: 0,
	coverageRatio: 0,
	completed: 0,
	completionRatio: 0,
	blocked: 0,
	running: 0,
	planned: 0,
	todo: 0,
	skills: []
};
/** State of one check: no intent → todo; pending → planned; else the intent's own status. */
function deriveCheckState(intent) {
	if (intent === void 0) return "todo";
	if (intent.status === "pending") return "planned";
	return intent.status;
}
function ratioOf(numerator, denominator) {
	return denominator === 0 ? 0 : numerator / denominator;
}
function coverageOf(input) {
	const { scan, skills, intents, facts, findings, assets } = input;
	const intentBySkillCheck = /* @__PURE__ */ new Map();
	for (const intent of intents) {
		if (intent.skillId === void 0 || intent.checkId === void 0) continue;
		intentBySkillCheck.set(`${intent.skillId}:${intent.checkId}`, intent);
	}
	const findingsBySkillCheck = /* @__PURE__ */ new Map();
	const incidentalFindings = [];
	for (const finding of findings) {
		if (finding.skillId === void 0 || finding.checkId === void 0) {
			incidentalFindings.push(finding.id);
			continue;
		}
		const key = `${finding.skillId}:${finding.checkId}`;
		const list = findingsBySkillCheck.get(key) ?? [];
		list.push(finding.id);
		findingsBySkillCheck.set(key, list);
	}
	const skillEntries = skills.map((skill) => {
		const checkEntries = skill.checks.map((check) => {
			const key = `${skill.id}:${check.id}`;
			const state = deriveCheckState(intentBySkillCheck.get(key));
			return {
				checkId: check.id,
				title: check.title,
				state,
				findings: findingsBySkillCheck.get(key) ?? []
			};
		});
		return {
			skillId: skill.id,
			name: skill.title,
			source: skill.source,
			sourceGroup: skill.sourceGroup,
			enabled: skill.enabled,
			total: checkEntries.length,
			covered: checkEntries.filter((c) => c.state !== "todo").length,
			completed: checkEntries.filter((c) => c.state === "done").length,
			blocked: checkEntries.filter((c) => c.state === "blocked").length,
			running: checkEntries.filter((c) => c.state === "running").length,
			planned: checkEntries.filter((c) => c.state === "planned").length,
			todo: checkEntries.filter((c) => c.state === "todo").length,
			checks: checkEntries
		};
	});
	const activeSkillEntries = skillEntries.filter((entry) => entry.enabled);
	const checks = activeSkillEntries.length === 0 && skillEntries.length === 0 ? EMPTY_CHECKS : {
		total: activeSkillEntries.reduce((sum, s) => sum + s.total, 0),
		covered: activeSkillEntries.reduce((sum, s) => sum + s.covered, 0),
		coverageRatio: ratioOf(activeSkillEntries.reduce((sum, s) => sum + s.covered, 0), activeSkillEntries.reduce((sum, s) => sum + s.total, 0)),
		completed: activeSkillEntries.reduce((sum, s) => sum + s.completed, 0),
		completionRatio: ratioOf(activeSkillEntries.reduce((sum, s) => sum + s.completed, 0), activeSkillEntries.reduce((sum, s) => sum + s.total, 0)),
		blocked: activeSkillEntries.reduce((sum, s) => sum + s.blocked, 0),
		running: activeSkillEntries.reduce((sum, s) => sum + s.running, 0),
		planned: activeSkillEntries.reduce((sum, s) => sum + s.planned, 0),
		todo: activeSkillEntries.reduce((sum, s) => sum + s.todo, 0),
		skills: skillEntries
	};
	const touchedPaths = /* @__PURE__ */ new Set();
	for (const fact of facts) touchedPaths.add(fact.path);
	for (const finding of findings) for (const hop of finding.codePath) touchedPaths.add(hop.path);
	const findingCountByPath = /* @__PURE__ */ new Map();
	for (const finding of findings) for (const hop of finding.codePath) findingCountByPath.set(hop.path, (findingCountByPath.get(hop.path) ?? 0) + 1);
	const fileAssets = assets.filter((asset) => asset.type === "file");
	const modules = assets.filter((asset) => asset.type === "module").map((module) => {
		const children = fileAssets.filter((file) => file.value.startsWith(`${module.value}/`));
		const touched = children.filter((file) => touchedPaths.has(file.value));
		const findingsCount = children.reduce((sum, file) => sum + (findingCountByPath.get(file.value) ?? 0), 0);
		return {
			path: module.value,
			inScope: children.length,
			touched: touched.length,
			findings: findingsCount
		};
	});
	const untouchedHotspots = fileAssets.filter((file) => !touchedPaths.has(file.value)).map((file) => file.value);
	const inScope = scan?.fileCount || fileAssets.length;
	const touched = touchedPaths.size;
	return {
		files: {
			inScope,
			touched,
			ratio: ratioOf(touched, inScope),
			modules,
			untouchedHotspots
		},
		checks,
		incidentalFindings
	};
}
//#endregion
//#region src/paths.ts
/**
* Path hardening for white-box audit records (ADR-03): every `fact.path`,
* `finding.codePath[].path`, and file/module `asset.value` written into the
* durable store must be a repo-relative path that actually exists inside the
* scan workspace. This module is a pure, store-independent boundary check —
* it never touches the domain, so it can be unit tested against a fixture
* directory alone.
* @module @tangxiaofeng7/dsh-sast-host/src/paths
*/
/**
* Normalize a repo-relative path: backslashes become forward slashes, a
* leading `./` is stripped, and repeated `/` are collapsed. Rejects absolute
* paths (POSIX or `C:`-style), and any `..` segment (workspace escape).
* Throws `sast: path <p> is not a valid repo-relative path` on rejection.
*/
function normalizeRepoPath(raw) {
	const collapsed = raw.replaceAll("\\", "/").replace(/\/+/g, "/");
	const stripped = collapsed.startsWith("./") ? collapsed.slice(2) : collapsed;
	const trimmed = stripped.endsWith("/") && stripped.length > 1 ? stripped.slice(0, -1) : stripped;
	if (trimmed === "" || trimmed === ".") throw new Error(`sast: path ${raw} is not a valid repo-relative path`);
	if (trimmed.startsWith("/") || /^[A-Za-z]:/.test(trimmed)) throw new Error(`sast: path ${raw} is not a valid repo-relative path`);
	if (trimmed.split("/").some((segment) => segment === "..")) throw new Error(`sast: path ${raw} is not a valid repo-relative path`);
	return trimmed;
}
/**
* Require that `path` (already normalized) exists inside `workspacePath` as
* the requested kind: `file` must be a regular file, not a symlink (checked
* via `lstatSync` so a symlink is rejected even if its target is a real file
* inside the workspace); `module` must be a directory. Throws the exact
* ADR-03 error text on failure so every caller (fact/finding/asset/
* submission) surfaces the same guidance.
*/
function requireExistingFile(workspacePath, path, kind) {
	const normalized = normalizeRepoPath(path);
	const absolute = resolve(workspacePath, normalized);
	const fail = () => {
		throw new Error(`sast: path ${path} does not exist in the scan workspace; only cite files you actually read`);
	};
	if (absolute !== workspacePath && !absolute.startsWith(workspacePath + sep)) fail();
	let lstat;
	try {
		lstat = lstatSync(absolute, { throwIfNoEntry: false });
	} catch {
		lstat = void 0;
	}
	if (lstat === void 0) fail();
	if (kind === "file" && lstat.isSymbolicLink()) fail();
	let stat;
	try {
		stat = statSync(absolute, { throwIfNoEntry: false });
	} catch {
		stat = void 0;
	}
	if (stat === void 0) fail();
	if (kind === "module") {
		if (!stat.isDirectory()) fail();
		return;
	}
	if (!stat.isFile()) fail();
}
/**
* Soft-clamp a cited line number to the file's actual line count. `line: 0`
* is always legal (whole-file level) and never adjusted. A line beyond the
* file's last line is clamped to that last line with `lineAdjusted: true`
* rather than rejected (ADR-03).
*/
function clampLine(workspacePath, path, line) {
	if (line <= 0) return {
		line: 0,
		lineAdjusted: false
	};
	const normalized = normalizeRepoPath(path);
	const absolute = resolve(workspacePath, normalized);
	let contents;
	try {
		contents = readFileSync(absolute, "utf8");
	} catch {
		return {
			line,
			lineAdjusted: false
		};
	}
	const withoutTrailingNewline = contents.endsWith("\n") ? contents.slice(0, -1) : contents;
	const lineCount = withoutTrailingNewline.length === 0 ? 1 : withoutTrailingNewline.split("\n").length;
	if (line > lineCount) return {
		line: lineCount,
		lineAdjusted: true
	};
	return {
		line,
		lineAdjusted: false
	};
}
//#endregion
//#region ../../node_modules/zod/v4/core/util.js
function getEnumValues(entries) {
	const numericValues = Object.values(entries).filter((v) => typeof v === "number");
	return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
}
function joinValues(array, separator = "|") {
	return array.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
	if (typeof value === "bigint") return value.toString();
	return value;
}
var Cached = class {
	constructor(getter) {
		this._getter = getter;
		this._value = void 0;
	}
	get value() {
		const getter = this._getter;
		if (getter !== void 0) {
			this._value = getter();
			this._getter = void 0;
		}
		return this._value;
	}
};
function cached(getter) {
	return new Cached(getter);
}
function nullish(input) {
	return input === null || input === void 0;
}
function cleanRegex(source) {
	const start = source.startsWith("^") ? 1 : 0;
	const end = source.endsWith("$") ? source.length - 1 : source.length;
	return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
	const ratio = val / step;
	const roundedRatio = Math.round(ratio);
	const tolerance = 4 * Number.EPSILON * Math.max(Math.abs(ratio), 1);
	if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
	return ratio - roundedRatio;
}
function assignProp(target, prop, value) {
	Object.defineProperty(target, prop, {
		value,
		writable: true,
		enumerable: true,
		configurable: true
	});
}
/**
* Whichever object a def's `shape` currently answers from: the one the caller passed until the first read, the frozen copy after it.
*
* Its keys and descriptors read without invoking anything, which is what lets a discriminated union check its discriminator, and the cycle walk read a shape, without resolving a getter that references the schema being constructed. A def that answers `shape` from an accessor of its own has none.
*/
function rawShape(def) {
	const desc = Object.getOwnPropertyDescriptor(def, "shape");
	return desc?.get ? desc.get.raw : desc?.value;
}
function sourceShape(schema) {
	return rawShape(schema._zod.def) ?? schema._zod.def.shape;
}
function deferProp(target, key, getter) {
	Object.defineProperty(target, key, {
		get() {
			const value = getter();
			assignProp(this, key, value);
			return value;
		},
		enumerable: true,
		configurable: true
	});
}
function putProp(target, key, value) {
	if (key in target) assignProp(target, key, value);
	else target[key] = value;
}
/**
* Copies `keys` of `source`'s shape onto `target`, each value passed through `wrap`.
*
* A key the source has resolved is copied through now, so the derived shape states it outright and nothing has to resolve it to learn what it holds. A key the source still defers stays deferred, and reads back through the source's own `shape`, so it resolves once and both shapes get that one schema.
*/
function mirrorShape(target, source, keys, wrap) {
	const raw = sourceShape(source);
	for (const key of keys) {
		const desc = Object.getOwnPropertyDescriptor(raw, key);
		if (!desc.enumerable) continue;
		if (desc.get) deferProp(target, key, () => {
			const value = source._zod.def.shape[key];
			return wrap ? wrap(value, key) : value;
		});
		else putProp(target, key, wrap ? wrap(desc.value, key) : desc.value);
	}
}
function mirrorProps(target, source) {
	for (const key of Reflect.ownKeys(source)) {
		const desc = Object.getOwnPropertyDescriptor(source, key);
		if (!desc.enumerable) continue;
		if (desc.get) deferProp(target, key, () => source[key]);
		else putProp(target, key, desc.value);
	}
}
function mergeDefs(...defs) {
	const mergedDescriptors = {};
	for (const def of defs) {
		const descriptors = Object.getOwnPropertyDescriptors(def);
		Object.assign(mergedDescriptors, descriptors);
	}
	return Object.defineProperties({}, mergedDescriptors);
}
function esc(str) {
	return JSON.stringify(str);
}
function slugify(input) {
	return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject(data) {
	return typeof data === "object" && data !== null && !Array.isArray(data);
}
const allowsEval = /* @__PURE__*/ cached(() => {
	if (globalConfig.jitless) return false;
	if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
	try {
		new Function("");
		return true;
	} catch (_) {
		return false;
	}
});
function isPlainObject(o) {
	if (isObject(o) === false) return false;
	const ctor = o.constructor;
	if (ctor === void 0) return true;
	if (typeof ctor !== "function") return true;
	const prot = ctor.prototype;
	if (isObject(prot) === false) return false;
	if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
	return true;
}
function shallowClone(o) {
	if (isPlainObject(o)) return { ...o };
	if (Array.isArray(o)) return [...o];
	if (o instanceof Map) return new Map(o);
	if (o instanceof Set) return new Set(o);
	return o;
}
const propertyKeyTypes = /* @__PURE__*/ new Set([
	"string",
	"number",
	"symbol"
]);
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
	const cl = new inst._zod.constr(def ?? inst._zod.def);
	if (!def || params?.parent) cl._zod.parent = inst;
	return cl;
}
function normalizeParams(_params) {
	const params = _params;
	if (!params) return {};
	if (typeof params === "string") return { error: () => params };
	if (params?.message !== void 0) {
		if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
		params.error = params.message;
	}
	delete params.message;
	if (typeof params.error === "string") return {
		...params,
		error: () => params.error
	};
	return params;
}
function stringifyPrimitive(value) {
	if (typeof value === "bigint") return value.toString() + "n";
	if (typeof value === "string") return `"${value}"`;
	return `${value}`;
}
function optionalKeys(shape) {
	return Object.keys(shape).filter((k) => {
		return shape[k]._zod.optin !== void 0 && shape[k]._zod.optout === "optional";
	});
}
const NUMBER_FORMAT_RANGES = /*@__PURE__*/ (() => ({
	safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}))();
const BIGINT_FORMAT_RANGES = {
	int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
	uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")]
};
function pick(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
	const newShape = {};
	mirrorShape(newShape, schema, maskedKeys(schema, mask));
	return clone(schema, mergeDefs(currDef, {
		shape: newShape,
		checks: []
	}));
}
function maskedKeys(schema, mask) {
	const raw = sourceShape(schema);
	const keys = [];
	for (const key of Reflect.ownKeys(mask)) {
		if (!Object.getOwnPropertyDescriptor(raw, key)?.enumerable) throw new Error(`Unrecognized key: "${String(key)}"`);
		if (mask[key]) keys.push(key);
	}
	return keys;
}
function omit(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
	const omitted = new Set(maskedKeys(schema, mask));
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)).filter((key) => !omitted.has(key)));
	return clone(schema, mergeDefs(currDef, {
		shape: newShape,
		checks: []
	}));
}
function extend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) {
		const existingShape = sourceShape(schema);
		for (const key of Reflect.ownKeys(shape)) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
function extended(schema, shape) {
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)));
	mirrorProps(newShape, shape);
	return newShape;
}
function safeExtend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
	return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) }));
}
function merge(a, b) {
	if (!b?._zod?.def) throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
	if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	const newShape = {};
	mirrorShape(newShape, a, Reflect.ownKeys(sourceShape(a)));
	mirrorShape(newShape, b, Reflect.ownKeys(sourceShape(b)));
	return clone(a, mergeDefs(a._zod.def, {
		shape: newShape,
		get catchall() {
			return b._zod.def.catchall;
		},
		checks: b._zod.def.checks ?? []
	}));
}
function partial(Class, schema, mask, name = "partial") {
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) throw new Error(`.${name}() cannot be used on object schemas containing refinements`);
	const selected = mask ? new Set(maskedKeys(schema, mask)) : void 0;
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), Class && ((value, key) => selected && !selected.has(key) ? value : new Class({
		type: "optional",
		innerType: value
	})));
	return clone(schema, mergeDefs(schema._zod.def, {
		shape: newShape,
		checks: []
	}));
}
function required(Class, schema, mask) {
	const selected = mask ? new Set(maskedKeys(schema, mask)) : void 0;
	const newShape = {};
	mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), (value, key) => selected && !selected.has(key) ? value : new Class({
		type: "nonoptional",
		innerType: value
	}));
	return clone(schema, mergeDefs(schema._zod.def, { shape: newShape }));
}
function aborted(x, startIndex = 0) {
	if (x.aborted === true) return true;
	for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
	return false;
}
function explicitlyAborted(x, startIndex = 0) {
	if (x.aborted === true) return true;
	for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
	return false;
}
function prefixIssues(path, issues) {
	return issues.map((iss) => {
		var _a;
		(_a = iss).path ?? (_a.path = []);
		iss.path.unshift(path);
		return iss;
	});
}
function unwrapMessage(message) {
	return typeof message === "string" ? message : message?.message;
}
function attachSchema(issues, start, inst) {
	var _a;
	for (let i = start; i < issues.length; i++) (_a = issues[i]).schema ?? (_a.schema = inst);
}
function finalizeIssue(iss, ctx, config) {
	var _a;
	const traits = iss.inst?._zod?.traits;
	if (traits?.has("$ZodType")) {
		if (traits.has("$ZodCheck")) (_a = iss).schema ?? (_a.schema = iss.inst);
		else iss.schema = iss.inst;
	}
	const schemaError = iss.schema !== iss.inst ? iss.schema?._zod.def?.error : void 0;
	const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(schemaError?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
	const full = {};
	for (const k of Object.keys(iss)) {
		if (k === "inst" || k === "schema" || k === "continue" || k === "input" || k === "__proto__") continue;
		full[k] = iss[k];
	}
	full.path ?? (full.path = []);
	full.message = message;
	if (ctx?.reportInput) full.input = iss.input;
	return full;
}
const highSurrogate = /[\uD800-\uDBFF]/;
function codePointLength(str) {
	const units = str.length;
	if (!highSurrogate.test(str)) return units;
	let count = units;
	for (let i = 0; i < units - 1; i++) if ((str.charCodeAt(i) & 64512) === 55296 && (str.charCodeAt(i + 1) & 64512) === 56320) {
		count--;
		i++;
	}
	return count;
}
function getLengthableOrigin(input) {
	if (Array.isArray(input)) return "array";
	if (typeof input === "string") return "string";
	return "unknown";
}
function parsedType(data) {
	const t = typeof data;
	switch (t) {
		case "number": return Number.isNaN(data) ? "nan" : "number";
		case "object": {
			if (data === null) return "null";
			if (Array.isArray(data)) return "array";
			const obj = data;
			if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) return obj.constructor.name;
		}
	}
	return t;
}
function issue(...args) {
	const [iss, input, inst] = args;
	if (typeof iss === "string") return {
		message: iss,
		code: "custom",
		input,
		inst
	};
	return { ...iss };
}
/**
* Installs a trait's members on its prototype. Each value builds that member for the instance on first read; the built value shadows the accessor as an own property, so a detached `const { parse } = schema` keeps working.
*
* Call this from a `proto` initializer, which runs once per prototype — never per instance.
*/
function members(proto, table) {
	for (const key in table) {
		const desc = Object.getOwnPropertyDescriptor(table, key);
		if (desc.get) Object.defineProperty(proto, key, {
			...desc,
			enumerable: false
		});
		else defineBound(proto, key, desc.value);
	}
	for (const sym of Object.getOwnPropertySymbols(table)) defineBound(proto, sym, table[sym]);
}
/** Shadows a prototype member with an own value, so a getter that builds from the instance runs once. */
function own(inst, key, value, enumerable = true) {
	Object.defineProperty(inst, key, {
		configurable: true,
		writable: true,
		enumerable,
		value
	});
	return value;
}
/** Like {@link own}, for a member that was never an own data property and has to stay out of `Object.keys`. */
function hide(inst, key, value) {
	return own(inst, key, value, false);
}
/** Adds members a table derives from the instance: each builds on first read and shadows as own data, and assignment shadows the same way, as when these were own properties. */
function derived(computes, table) {
	for (const key in computes) {
		const compute = computes[key];
		Object.defineProperty(table, key, {
			configurable: true,
			enumerable: true,
			get() {
				return own(this, key, compute(this));
			},
			set(value) {
				own(this, key, value);
			}
		});
	}
	return table;
}
function defineBound(proto, key, fn) {
	Object.defineProperty(proto, key, {
		configurable: true,
		get() {
			return this == null ? fn : own(this, key, fn.bind(this));
		},
		set(value) {
			own(this, key, value);
		}
	});
}
/** Returns the prototype to install on, or `undefined` if this group is already installed on it. */
function claim(inst, sentinel) {
	const proto = Object.getPrototypeOf(inst);
	return sentinel in proto ? void 0 : proto;
}
let installing;
let broke = false;
const breaker = {
	configurable: true,
	get() {
		broke = true;
	}
};
/**
* Installs a lazily-derived internal on the `_zod` prototype of `inst`'s
* constructor, computed from the internals object itself and cached there on
* first read. One accessor per constructor rather than one per instance.
*/
function defineLazyInternal(inst, key, compute) {
	const proto = Object.getPrototypeOf(inst._zod);
	if (key in proto && installing !== inst._zod) {
		installing = void 0;
		return;
	}
	installing = inst._zod;
	Object.defineProperty(proto, key, {
		configurable: true,
		get() {
			Object.defineProperty(this, key, breaker);
			const outer = broke;
			broke = false;
			try {
				const value = compute(this);
				if (broke) delete this[key];
				else Object.defineProperty(this, key, {
					configurable: true,
					writable: true,
					value
				});
				broke = broke || outer;
				return value;
			} catch (err) {
				delete this[key];
				broke = broke || outer;
				throw err;
			}
		},
		set(value) {
			Object.defineProperty(this, key, {
				configurable: true,
				writable: true,
				value
			});
		}
	});
}
/**
* Installs `key` on `inst`'s prototype, computed by `make` on first read and cached there as an own
* data property. One accessor per constructor rather than one per instance, because an own accessor
* puts every instance after the first into v8 dictionary mode. The key doubles as the sentinel.
*/
function installLazyProp(inst, key, make, enumerable) {
	const proto = claim(inst, key);
	if (!proto) return;
	Object.defineProperty(proto, key, {
		configurable: true,
		get() {
			const desc = {
				configurable: true,
				writable: true,
				enumerable,
				value: void 0
			};
			Object.defineProperty(this, key, desc);
			desc.value = make(this);
			Object.defineProperty(this, key, desc);
			return desc.value;
		},
		set(value) {
			Object.defineProperty(this, key, {
				configurable: true,
				writable: true,
				enumerable,
				value
			});
		}
	});
}
/** Marks the thunk `_catch` synthesises for a constant catch value. `Function.length` cannot tell that thunk from a user callback — rest and defaulted parameters both report arity 0 — and a user callback reads `ctx.error`, whose issues only finalize correctly against the caller's per-parse error map. Provenance can say what arity cannot. A plain string key rather than `Symbol.for`, whose call at module scope no bundler can prove pure — the same shape that anchored `urlCanParse` into every build. */
const CONSTANT_CATCH = "~constantCatch";
/** Wraps a constant catch value in a thunk tagged with {@link CONSTANT_CATCH}. */
function constantCatch(value) {
	const fn = () => value;
	fn[CONSTANT_CATCH] = true;
	return fn;
}
//#endregion
//#region ../../node_modules/zod/v4/core/core.js
var _a$1;
const _zodDesc = {
	value: void 0,
	enumerable: false
};
let _E = "captureStackTrace" in Error ? Error : null;
function newError(Definition) {
	const E = _E;
	if (E) {
		const saved = E.stackTraceLimit;
		if (typeof saved === "number") {
			try {
				E.stackTraceLimit = 0;
			} catch {
				_E = null;
				return new Definition();
			}
			try {
				return new Definition();
			} finally {
				E.stackTraceLimit = saved;
			}
		}
	}
	return new Definition();
}
function $constructor(name, initializer, proto, params) {
	const zodProto = {};
	function Internals(def) {
		this.def = def;
		this.constr = _;
		this.traits = /* @__PURE__ */ new Set();
	}
	Internals.prototype = zodProto;
	const protoMembers = proto;
	const initialized = protoMembers && /* @__PURE__ */ new WeakSet();
	function init(inst, def) {
		if (!inst._zod) {
			_zodDesc.value = new Internals(def);
			try {
				Object.defineProperty(inst, "_zod", _zodDesc);
			} finally {
				_zodDesc.value = void 0;
			}
		}
		if (inst._zod.traits.has(name)) return;
		inst._zod.traits.add(name);
		initializer(inst, def);
		if (initialized) {
			const own = Object.getPrototypeOf(inst);
			const ctorProto = inst._zod.constr.prototype;
			let up = own;
			while (up && up !== ctorProto) up = Object.getPrototypeOf(up);
			const target = up ?? own;
			if (!initialized.has(target)) {
				initialized.add(target);
				members(target, protoMembers);
			}
		}
		const proto = _.prototype;
		for (const k in proto) {
			if (!Object.prototype.hasOwnProperty.call(proto, k)) continue;
			if (!(k in inst)) inst[k] = proto[k].bind(inst);
		}
	}
	const Parent = params?.Parent ?? Object;
	class Definition extends Parent {}
	Object.defineProperty(Definition, "name", { value: name });
	function _(def) {
		const inst = params?.Parent ? newError(Definition) : this;
		init(inst, def);
		const deferred = inst._zod.deferred;
		if (deferred) {
			for (const fn of deferred) fn();
			inst._zod.deferred = void 0;
		}
		const pp = globalThis.__zod_globalConfig?.postProcessor;
		if (pp) pp(inst);
		return inst;
	}
	Object.defineProperty(_, "init", { value: init });
	Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
		if (params?.Parent && inst instanceof params.Parent) return true;
		return inst?._zod?.traits?.has(name);
	} });
	Object.defineProperty(_, "name", { value: name });
	return _;
}
var $ZodAsyncError = class extends Error {
	constructor() {
		super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
	}
};
var $ZodEncodeError = class extends Error {
	constructor(name) {
		super(`Encountered unidirectional transform during encode: ${name}`);
		this.name = "ZodEncodeError";
	}
};
(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
const globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
	if (newConfig) Object.assign(globalConfig, newConfig);
	return globalConfig;
}
//#endregion
//#region ../../node_modules/zod/v4/core/errors.js
function _getMessage() {
	const internals = this._zod;
	internals.message ?? (internals.message = JSON.stringify(internals.def, jsonStringifyReplacer, 2));
	return internals.message;
}
function _setMessage(value) {
	this._zod.message = value;
}
const _messageDesc = {
	get: _getMessage,
	set: _setMessage,
	enumerable: true,
	configurable: true
};
const _issuesDesc = {
	value: void 0,
	enumerable: false
};
const _installedToString = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
const initializer$1 = (inst, def) => {
	inst.name = "$ZodError";
	_issuesDesc.value = def;
	Object.defineProperty(inst, "issues", _issuesDesc);
	_issuesDesc.value = void 0;
	Object.defineProperty(inst, "message", _messageDesc);
	const proto = Object.getPrototypeOf(inst);
	if (!_installedToString.has(proto)) {
		_installedToString.add(proto);
		Object.defineProperty(proto, "toString", {
			configurable: true,
			enumerable: false,
			get() {
				const value = () => this.message;
				Object.defineProperty(this, "toString", {
					value,
					configurable: true,
					writable: true
				});
				return value;
			},
			set(value) {
				Object.defineProperty(this, "toString", {
					value,
					configurable: true,
					writable: true
				});
			}
		});
	}
};
const $ZodError = $constructor("$ZodError", initializer$1);
$constructor("$ZodError", initializer$1, void 0, { Parent: Error });
/** Get-or-create `obj[key]` as an own data property. A path segment naming an inherited member
* ("toString", "constructor") would otherwise read through to the prototype, and assigning
* "__proto__" would hit the setter instead of creating a key. */
function node(obj, key, make) {
	if (!Object.prototype.hasOwnProperty.call(obj, key)) {
		if (key === "__proto__") Object.defineProperty(obj, key, {
			value: make(),
			writable: true,
			enumerable: true,
			configurable: true
		});
		else obj[key] = make();
	}
	return obj[key];
}
function flattenError(error, mapper = (issue) => issue.message) {
	const fieldErrors = {};
	const formErrors = [];
	for (const sub of error.issues) if (sub.path.length > 0) node(fieldErrors, sub.path[0], () => []).push(mapper(sub));
	else formErrors.push(mapper(sub));
	return {
		formErrors,
		fieldErrors
	};
}
function formatError(error, mapper = (issue) => issue.message) {
	const fieldErrors = { _errors: [] };
	const processError = (error, path = []) => {
		for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
		else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
		else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
		else {
			const fullpath = [...path, ...issue.path];
			if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
			else {
				let curr = fieldErrors;
				let i = 0;
				while (i < fullpath.length) {
					const el = fullpath[i];
					const terminal = i === fullpath.length - 1;
					if (el === "_errors") {
						if (terminal) curr._errors.push(mapper(issue));
						i++;
						continue;
					}
					if (!Object.prototype.hasOwnProperty.call(curr, el)) Object.defineProperty(curr, el, {
						value: { _errors: [] },
						enumerable: true,
						writable: true,
						configurable: true
					});
					const node = curr[el];
					if (terminal) node._errors.push(mapper(issue));
					curr = node;
					i++;
				}
			}
		}
	};
	processError(error);
	return fieldErrors;
}
//#endregion
//#region ../../node_modules/zod/v4/core/parse.js
function finalizeParams(callee, params) {
	return {
		callee: params?.callee ?? callee,
		Err: params?.Err
	};
}
const _parse = (_Err) => {
	const fn = (schema, value, _ctx, _params) => {
		const ctx = _ctx ? {
			..._ctx,
			async: false
		} : { async: false };
		const result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) throw new $ZodAsyncError();
		if (result.issues.length) {
			const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
			captureStackTrace(e, _params?.callee ?? fn);
			throw e;
		}
		return result.value;
	};
	return fn;
};
const _parseAsync = (_Err) => {
	const fn = async (schema, value, _ctx, params) => {
		const ctx = _ctx ? {
			..._ctx,
			async: true
		} : { async: true };
		let result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) result = await result;
		if (result.issues.length) {
			const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
			captureStackTrace(e, params?.callee ?? fn);
			throw e;
		}
		return result.value;
	};
	return fn;
};
const _safeParse = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: false
	} : { async: false };
	const result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	return result.issues.length ? failure(_Err, result.issues, ctx) : {
		success: true,
		data: result.value
	};
};
function failure(Err, issues, ctx) {
	let error;
	return {
		success: false,
		get error() {
			if (!error) {
				error = new Err(issues.map((iss) => finalizeIssue(iss, ctx, config())));
				issues = void 0;
				ctx = void 0;
			}
			return error;
		},
		set error(e) {
			error = e;
			issues = void 0;
			ctx = void 0;
		}
	};
}
const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: true
	} : { async: true };
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	return result.issues.length ? failure(_Err, result.issues, ctx) : {
		success: true,
		data: result.value
	};
};
const COMPILE_INVALID = /* @__PURE__ */ Symbol.for("zod.compile.invalid");
const COMPILE_FALLBACK = /* @__PURE__ */ Symbol.for("zod.compile.fallback");
const validate = ((schema, value, _ctx) => {
	const validator = schema._zod.bag.validator;
	if (validator !== void 0) {
		if (validator(value) !== COMPILE_INVALID) return true;
		if (validator.definite === true && _ctx === void 0) return false;
	}
	return validateFallback(schema, value, _ctx);
});
function validateFallback(schema, value, _ctx) {
	const ctx = _ctx ? {
		..._ctx,
		async: false,
		abortEarly: true
	} : {
		async: false,
		abortEarly: true
	};
	const fallbackRun = schema._zod.bag.fallbackRun;
	let result;
	if (fallbackRun) {
		ctx[COMPILE_FALLBACK] = true;
		result = fallbackRun({
			value,
			issues: []
		}, ctx);
	} else result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	return result.issues.length === 0;
}
const validateAsync$1 = async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: true,
		abortEarly: true
	} : {
		async: true,
		abortEarly: true
	};
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	return result.issues.length === 0;
};
const _encode = (_Err) => {
	const parse = _parse(_Err);
	const fn = (schema, value, _ctx, _params) => {
		const ctx = _ctx ? {
			..._ctx,
			direction: "backward"
		} : { direction: "backward" };
		return parse(schema, value, ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _decode = (_Err) => {
	const parse = _parse(_Err);
	const fn = (schema, value, _ctx, _params) => {
		return parse(schema, value, _ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _encodeAsync = (_Err) => {
	const parseAsync = _parseAsync(_Err);
	const fn = async (schema, value, _ctx, _params) => {
		const ctx = _ctx ? {
			..._ctx,
			direction: "backward"
		} : { direction: "backward" };
		return await parseAsync(schema, value, ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _decodeAsync = (_Err) => {
	const parseAsync = _parseAsync(_Err);
	const fn = async (schema, value, _ctx, _params) => {
		return await parseAsync(schema, value, _ctx, finalizeParams(fn, _params));
	};
	return fn;
};
const _safeEncode = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _safeParse(_Err)(schema, value, ctx);
};
const _safeDecode = (_Err) => (schema, value, _ctx) => {
	return _safeParse(_Err)(schema, value, _ctx);
};
const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _safeParseAsync(_Err)(schema, value, ctx);
};
const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
	return _safeParseAsync(_Err)(schema, value, _ctx);
};
//#endregion
//#region ../../node_modules/zod/v4/core/regexes.js
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link cuid2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const cuid = /^[cC][0-9a-z]{6,}$/;
const cuid2 = /^[0-9a-z]+$/;
const ulid = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/;
const xid = /^[0-9a-vA-V]{20}$/;
const ksuid = /^[A-Za-z0-9]{27}$/;
const nanoid = /^[a-zA-Z0-9_-]{21}$/;
function nanoidOfLength(length) {
	return new RegExp(`^[a-zA-Z0-9_-]{${length}}$`);
}
/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
const duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
/** Returns a regex for validating an RFC 9562/4122 UUID.
*
* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
const uuid = (version) => {
	if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
	return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
/** Practical email validation */
const email = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
const _emoji$1 = `^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$`;
function emoji() {
	return new RegExp(_emoji$1, "u");
}
const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
const base64url = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/;
const httpProtocol = /^https?$/;
const e164 = /^\+[1-9]\d{6,14}$/;
const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
/** Anchors a pattern source. The interpolation lives here rather than at the call site because
* esbuild will not drop a `@__PURE__` call whose own argument interpolates a variable, but it
* will drop `anchor(dateSource)`. Keeping it inline pinned `date` into every bundle. */
function anchor(source) {
	return new RegExp(`^${source}$`);
}
const date = /*@__PURE__*/ anchor(dateSource);
function timeSource(args) {
	const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
	return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : args.seconds ? `${hhmm}:[0-5]\\d(?:\\.\\d+)?` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function time(args) {
	return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
	const opts = ["Z"];
	if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
	const qualified = `${timeSource({
		precision: args.precision,
		seconds: true
	})}(?:${opts.join("|")})`;
	const timeRegex = args.local ? `${qualified}|${timeSource({ precision: args.precision })}` : qualified;
	return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
const anyString = /^[\s\S]{0,}$/;
const number$1 = /^-?\d+(?:\.\d+)?$/;
const boolean$1 = /^(?:true|false)$/i;
const lowercase = /^[^A-Z]*$/;
const uppercase = /^[^a-z]*$/;
//#endregion
//#region ../../node_modules/zod/v4/core/checks.js
const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
	var _a;
	inst._zod ?? (inst._zod = {});
	inst._zod.def = def;
	(_a = inst._zod).onattach ?? (_a.onattach = []);
});
/** Default `when` for length-based checks: run only on non-nullish values with a `length`. */
const _whenHasLength = (payload) => {
	const val = payload.value;
	return !nullish(val) && val.length !== void 0;
};
const numericOriginMap = {
	number: "number",
	bigint: "bigint",
	object: "date"
};
const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
		payload.issues.push({
			origin: numericOriginMap[typeof payload.value] ?? origin,
			code: "too_big",
			maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
		payload.issues.push({
			origin: numericOriginMap[typeof payload.value] ?? origin,
			code: "too_small",
			minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.check = (payload) => {
		if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
		if (typeof payload.value === "bigint" ? def.value !== BigInt(0) && payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
		payload.issues.push({
			origin: typeof payload.value,
			code: "not_multiple_of",
			divisor: def.value,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
	$ZodCheck.init(inst, def);
	def.format = def.format || "float64";
	const isInt = def.format?.includes("int");
	const origin = isInt ? "int" : "number";
	const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (isInt) {
			if (!Number.isInteger(input)) {
				payload.issues.push({
					expected: origin,
					format: def.format,
					code: "invalid_type",
					continue: false,
					input,
					inst
				});
				return;
			}
			if (!Number.isSafeInteger(input)) {
				if (input > 0) payload.issues.push({
					input,
					code: "too_big",
					maximum: Number.MAX_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					inclusive: true,
					continue: !def.abort
				});
				else payload.issues.push({
					input,
					code: "too_small",
					minimum: Number.MIN_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					inclusive: true,
					continue: !def.abort
				});
				return;
			}
		}
		if (input < minimum) payload.issues.push({
			origin: "number",
			input,
			code: "too_small",
			minimum,
			inclusive: true,
			inst,
			continue: !def.abort
		});
		if (input > maximum) payload.issues.push({
			origin: "number",
			input,
			code: "too_big",
			maximum,
			inclusive: true,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
	inst._zod.check = (payload) => {
		const input = payload.value;
		const units = input.length;
		if ((typeof input === "string" && units > def.maximum ? codePointLength(input) : units) <= def.maximum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_big",
			maximum: def.maximum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
	inst._zod.check = (payload) => {
		const input = payload.value;
		const units = input.length;
		if ((typeof input === "string" && units >= def.minimum && units < def.minimum * 2 ? codePointLength(input) : units) >= def.minimum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_small",
			minimum: def.minimum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = _whenHasLength);
	inst._zod.check = (payload) => {
		const input = payload.value;
		const units = input.length;
		const length = typeof input === "string" && units >= def.length && units <= def.length * 2 ? codePointLength(input) : units;
		if (length === def.length) return;
		const origin = getLengthableOrigin(input);
		const tooBig = length > def.length;
		payload.issues.push({
			origin,
			...tooBig ? {
				code: "too_big",
				maximum: def.length
			} : {
				code: "too_small",
				minimum: def.length
			},
			inclusive: true,
			exact: true,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
	var _a, _b;
	$ZodCheck.init(inst, def);
	if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: def.format,
			input: payload.value,
			...def.pattern ? { pattern: def.pattern.toString() } : {},
			inst,
			continue: !def.abort
		});
	});
	else (_b = inst._zod).check ?? (_b.check = () => {});
});
const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: payload.value,
			pattern: def.pattern.toString(),
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
	def.pattern ?? (def.pattern = lowercase);
	$ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
	def.pattern ?? (def.pattern = uppercase);
	$ZodCheckStringFormat.init(inst, def);
});
const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
	$ZodCheck.init(inst, def);
	const escapedRegex = escapeRegex(def.includes);
	def.pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position},}${escapedRegex}` : escapedRegex);
	inst._zod.check = (payload) => {
		if (payload.value.includes(def.includes, def.position)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: def.includes,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.check = (payload) => {
		if (payload.value.startsWith(def.prefix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: def.prefix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.check = (payload) => {
		if (payload.value.endsWith(def.suffix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: def.suffix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.check = (payload) => {
		payload.value = def.tx(payload.value);
	};
});
//#endregion
//#region ../../node_modules/zod/v4/core/doc.js
var Doc = class {
	constructor(args = [], closed = {}) {
		this.content = [];
		this.indent = 0;
		this.args = args;
		this.closed = closed;
	}
	indented(fn) {
		this.indent += 1;
		try {
			fn(this);
		} finally {
			this.indent -= 1;
		}
	}
	write(arg) {
		if (typeof arg === "function") {
			arg(this, { execution: "sync" });
			arg(this, { execution: "async" });
			return;
		}
		const lines = arg.split("\n").filter((x) => x);
		const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
		const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
		for (const line of dedented) this.content.push(line);
	}
	compile() {
		const F = Function;
		const content = this?.content ?? [``];
		return new F(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {\n${content.join("\n")}\n};`)(...Object.values(this.closed));
	}
};
//#endregion
//#region ../../node_modules/zod/v4/core/versions.js
const version = {
	major: 4,
	minor: 6,
	patch: 2
};
//#endregion
//#region ../../node_modules/zod/v4/core/schemas.js
const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
	var _a;
	inst ?? (inst = {});
	inst._zod.def = def;
	inst._zod.bag = inst._zod.bag || {};
	inst._zod.version = version;
	const defChecks = inst._zod.def.checks;
	const checks = inst._zod.traits.has("$ZodCheck") ? [inst, ...defChecks ?? []] : defChecks?.length ? [...defChecks] : [];
	for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
	if (checks.length === 0) {
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred?.push(() => {
			inst._zod.run = inst._zod.parse;
		});
	} else {
		const runChecks = (payload, checks, ctx) => {
			if (payload.memo) return payload;
			let isAborted = aborted(payload);
			let asyncResult;
			for (const ch of checks) {
				if (ch._zod.def.when) {
					if (explicitlyAborted(payload)) continue;
					if (!ch._zod.def.when(payload)) continue;
				} else if (isAborted) continue;
				const currLen = payload.issues.length;
				const _ = ch._zod.check(payload);
				if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
				if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
					await _;
					if (payload.issues.length === currLen) return;
					attachSchema(payload.issues, currLen, inst);
					if (!isAborted) isAborted = aborted(payload, currLen);
				});
				else {
					if (payload.issues.length === currLen) continue;
					attachSchema(payload.issues, currLen, inst);
					if (!isAborted) isAborted = aborted(payload, currLen);
				}
			}
			if (asyncResult) return asyncResult.then(() => {
				return payload;
			});
			return payload;
		};
		const handleCanaryResult = (canary, payload, ctx) => {
			if (aborted(canary)) {
				canary.aborted = true;
				return canary;
			}
			const checkResult = runChecks(payload, checks, ctx);
			if (checkResult instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
			}
			return inst._zod.parse(checkResult, ctx);
		};
		inst._zod.run = (payload, ctx) => {
			if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
			if (ctx.direction === "backward") {
				const canary = inst._zod.parse({
					value: payload.value,
					issues: []
				}, {
					...ctx,
					skipChecks: true
				});
				if (canary instanceof Promise) return canary.then((canary) => {
					return handleCanaryResult(canary, payload, ctx);
				});
				return handleCanaryResult(canary, payload, ctx);
			}
			const result = inst._zod.parse(payload, ctx);
			if (result instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return result.then((result) => runChecks(result, checks, ctx));
			}
			return runChecks(result, checks, ctx);
		};
	}
}, {
	get "~standard"() {
		return hide(this, "~standard", standardProps(this));
	},
	set "~standard"(value) {
		own(this, "~standard", value);
	}
});
/** The Standard Schema surface for `inst`. Shared so wrappers can extend it without forcing it. */
const toStandardResult = (r, ctx) => r.issues.length ? { issues: r.issues.map((iss) => finalizeIssue(iss, ctx, config())) } : { value: r.value };
async function validateAsync(inst, value) {
	const ctx = { async: true };
	return toStandardResult(await inst._zod.run({
		value,
		issues: []
	}, ctx), ctx);
}
function standardProps(inst) {
	return {
		validate: (value) => {
			const ctx = { async: false };
			try {
				const r = inst._zod.run({
					value,
					issues: []
				}, ctx);
				if (!(r instanceof Promise)) return toStandardResult(r, ctx);
			} catch (_) {}
			return validateAsync(inst, value);
		},
		vendor: "zod",
		version: 1
	};
}
const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = def.pattern ?? anyString;
	inst._zod.parse = (payload, _) => {
		if (def.coerce) try {
			payload.value = String(payload.value);
		} catch (_) {}
		if (typeof payload.value === "string") return payload;
		payload.issues.push({
			expected: "string",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	$ZodString.init(inst, def);
});
const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
	def.pattern ?? (def.pattern = guid);
	$ZodStringFormat.init(inst, def);
});
const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
	if (def.version) {
		const v = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[def.version];
		if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
		def.pattern ?? (def.pattern = uuid(v));
	} else def.pattern ?? (def.pattern = uuid());
	$ZodStringFormat.init(inst, def);
});
const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
	def.pattern ?? (def.pattern = email);
	$ZodStringFormat.init(inst, def);
});
/** Parses a URL for `$ZodURL`, applying the one guard the URL constructor cannot express. Returns the parsed URL, or a code naming the stage that rejected it — the runtime needs that distinction to pick an issue note, and compiled code only needs to know it is not a URL. */
function parseURLObject(trimmed, def) {
	if (!def.normalize && def.protocol?.source === httpProtocol.source && !/^https?:\/\//i.test(trimmed)) return 1;
	try {
		return new URL(trimmed);
	} catch {
		return 2;
	}
}
const asciiTabOrNewline = /[\t\n\r]/g;
/** The URL parser deletes every ASCII tab, LF and CR from its input before it parses, so `new URL("https://exa\nmple.com")` reports on `example.com`. Applying the same deletion to the returned value closes the half of that divergence which can move the host; the parser's other rewrite, stripping C0 controls at the edges, cannot. */
function stripTabAndNewline(value) {
	return value.replace(asciiTabOrNewline, "");
}
function urlHostnameOk(url, hostname) {
	hostname.lastIndex = 0;
	return hostname.test(url.hostname);
}
function urlProtocolOk(url, protocol) {
	protocol.lastIndex = 0;
	return protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol);
}
const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		try {
			const trimmed = payload.value.trim();
			const url = parseURLObject(trimmed, def);
			if (url === 1) {
				payload.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid URL format",
					input: payload.value,
					inst,
					continue: !def.abort
				});
				return;
			}
			if (url === 2) {
				payload.issues.push({
					code: "invalid_format",
					format: "url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
				return;
			}
			if (def.hostname && !urlHostnameOk(url, def.hostname)) payload.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: def.hostname.source,
				input: payload.value,
				inst,
				continue: !def.abort
			});
			if (def.protocol && !urlProtocolOk(url, def.protocol)) payload.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: def.protocol.source,
				input: payload.value,
				inst,
				continue: !def.abort
			});
			payload.value = def.normalize ? url.href : stripTabAndNewline(trimmed);
			return;
		} catch (_) {
			payload.issues.push({
				code: "invalid_format",
				format: "url",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
	def.pattern ?? (def.pattern = emoji());
	$ZodStringFormat.init(inst, def);
});
const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
	if (def.length !== void 0 && (!Number.isInteger(def.length) || def.length < 1)) throw new Error(`Invalid nanoid length: ${def.length}`);
	def.pattern ?? (def.pattern = def.length === void 0 ? nanoid : nanoidOfLength(def.length));
	$ZodStringFormat.init(inst, def);
});
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
	def.pattern ?? (def.pattern = cuid);
	$ZodStringFormat.init(inst, def);
});
const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
	def.pattern ?? (def.pattern = cuid2);
	$ZodStringFormat.init(inst, def);
});
const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
	def.pattern ?? (def.pattern = ulid);
	$ZodStringFormat.init(inst, def);
});
const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
	def.pattern ?? (def.pattern = xid);
	$ZodStringFormat.init(inst, def);
});
const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
	def.pattern ?? (def.pattern = ksuid);
	$ZodStringFormat.init(inst, def);
});
const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
	def.pattern ?? (def.pattern = datetime(def));
	$ZodStringFormat.init(inst, def);
});
const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
	def.pattern ?? (def.pattern = date);
	$ZodStringFormat.init(inst, def);
});
const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
	def.pattern ?? (def.pattern = time(def));
	$ZodStringFormat.init(inst, def);
});
const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
	def.pattern ?? (def.pattern = duration);
	$ZodStringFormat.init(inst, def);
});
const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
	def.pattern ?? (def.pattern = ipv4);
	$ZodStringFormat.init(inst, def);
});
/** An IPv6 address is written with hex digits, colons and dots, and nothing else. The guard is what makes the check below an IPv6 check: `new URL("http://[...]")` parses an authority, not an address, so `@` and `\` re-delimit it and `"::@1\\"` validates against the host `0.0.0.1`. The URL parser also deletes ASCII tab, LF and CR rather than failing, which is how `"::1\n"` validated as `::1`. */
const ipv6Alphabet = /^[0-9a-fA-F:.]+$/;
function isValidIPv6(value) {
	if (!ipv6Alphabet.test(value)) return false;
	try {
		new URL(`http://[${value}]`);
		return true;
	} catch {
		return false;
	}
}
const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
	def.pattern ?? (def.pattern = ipv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (!isValidIPv6(payload.value)) payload.issues.push({
			code: "invalid_format",
			format: "ipv6",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv4);
	$ZodStringFormat.init(inst, def);
});
function isValidCIDRv6(value) {
	const parts = value.split("/");
	if (parts.length !== 2) return false;
	const [address, prefix] = parts;
	if (!prefix) return false;
	const prefixNum = Number(prefix);
	if (`${prefixNum}` !== prefix) return false;
	if (prefixNum < 0 || prefixNum > 128) return false;
	return isValidIPv6(address);
}
const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (!isValidCIDRv6(payload.value)) payload.issues.push({
			code: "invalid_format",
			format: "cidrv6",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
function isValidBase64(data) {
	if (data === "") return true;
	if (/\s/.test(data)) return false;
	if (data.length % 4 !== 0) return false;
	try {
		atob(data);
		return true;
	} catch {
		return false;
	}
}
const base64Charset = /^[0-9a-zA-Z+/]*={0,2}$/;
const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
	def.pattern ?? (def.pattern = base64Charset);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidBase64(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const base64urlCharset = /^[A-Za-z0-9_-]*$/;
function isValidBase64URL(data) {
	if (!base64urlCharset.test(data)) return false;
	const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
	return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
}
const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
	def.pattern ?? (def.pattern = base64urlCharset);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidBase64URL(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
	def.pattern ?? (def.pattern = e164);
	$ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
	try {
		const tokensParts = token.split(".");
		if (tokensParts.length !== 3) return false;
		const [header] = tokensParts;
		if (!header) return false;
		const parsedHeader = JSON.parse(atob(header));
		if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
		if (!parsedHeader.alg) return false;
		if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
		return true;
	} catch {
		return false;
	}
}
const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidJWT(payload.value, def.alg)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = number$1;
	inst._zod.parse = (payload, _ctx) => {
		if (def.coerce) try {
			payload.value = Number(payload.value);
		} catch (_) {}
		const input = payload.value;
		if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
		const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? String(input) : void 0 : void 0;
		payload.issues.push({
			expected: "number",
			code: "invalid_type",
			input,
			inst,
			...received ? { received } : {}
		});
		return payload;
	};
});
const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
	$ZodCheckNumberFormat.init(inst, def);
	$ZodNumber.init(inst, def);
});
const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = boolean$1;
	inst._zod.parse = (payload, _ctx) => {
		if (def.coerce) try {
			payload.value = Boolean(payload.value);
		} catch (_) {}
		const input = payload.value;
		if (typeof input === "boolean") return payload;
		payload.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input,
			inst
		});
		return payload;
	};
});
const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload) => payload;
});
const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _ctx) => {
		payload.issues.push({
			expected: "never",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
function handleArrayResult(result, final, index) {
	if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
	final.value[index] = result.value;
}
const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
	$ZodType.init(inst, def);
	const memo = globalConfig.memoizer;
	memo?.attach(inst);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		if (!Array.isArray(input)) {
			payload.issues.push({
				expected: "array",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = memo ? memo.alloc(inst, payload, Array(input.length), ctx) : Array(input.length);
		const proms = [];
		const abortEarly = ctx?.abortEarly;
		for (let i = 0; i < input.length; i++) {
			const item = input[i];
			const result = def.element._zod.run({
				value: item,
				issues: []
			}, ctx);
			if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
			else {
				handleArrayResult(result, payload, i);
				if (abortEarly && result.issues.length !== 0 && aborted(result)) break;
			}
		}
		if (proms.length) return Promise.all(proms).then(() => payload);
		return payload;
	};
});
function handlePropertyResult(result, final, key, input, optin, optout) {
	const isPresent = key in input;
	const isOptionalOut = optout === "optional";
	if (!isPresent && isOptionalOut && optin === "optional") return;
	if (result.issues.length) {
		if (optin !== void 0 && isOptionalOut && !isPresent) return;
		final.issues.push(...prefixIssues(key, result.issues));
	}
	if (!isPresent && optin === void 0) {
		if (!result.issues.length) final.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [key]
		});
		return;
	}
	if (result.value === void 0) {
		if (isPresent || optin === "defaulted" && !isOptionalOut) final.value[key] = void 0;
	} else final.value[key] = result.value;
}
const NO_SYMBOL_KEYS = [];
function normalizeDef(def) {
	const keys = Object.keys(def.shape);
	const ownSymbols = Object.getOwnPropertySymbols(def.shape);
	const symbolKeys = ownSymbols.length ? ownSymbols : NO_SYMBOL_KEYS;
	const allKeys = symbolKeys.length ? [...keys, ...symbolKeys] : keys;
	for (const k of allKeys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${String(k)}": expected a Zod schema`);
	const okeys = optionalKeys(def.shape);
	return {
		...def,
		allKeys,
		symbolKeys,
		keySet: new Set(keys),
		numKeys: keys.length,
		optionalKeys: new Set(okeys)
	};
}
function handleCatchall(proms, input, payload, ctx, def, inst, abortEarly) {
	const unrecognized = [];
	const keySet = def.keySet;
	const _catchall = def.catchall._zod;
	const t = _catchall.def.type;
	const optin = _catchall.optin;
	const optout = _catchall.optout;
	let seen = 0;
	for (const key in input) {
		if (abortEarly && payload.issues.length !== seen) {
			if (aborted(payload, seen)) break;
			seen = payload.issues.length;
		}
		if (keySet.has(key)) continue;
		if (key === "__proto__") {
			if (t === "never") unrecognized.push(key);
			continue;
		}
		if (t === "never") {
			unrecognized.push(key);
			continue;
		}
		const r = _catchall.run({
			value: input[key],
			issues: []
		}, ctx);
		if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
		else handlePropertyResult(r, payload, key, input, optin, optout);
	}
	if (unrecognized.length) payload.issues.push({
		code: "unrecognized_keys",
		keys: unrecognized,
		input,
		inst,
		continue: true
	});
	if (!proms.length) return payload;
	return Promise.all(proms).then(() => {
		return payload;
	});
}
const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
	$ZodType.init(inst, def);
	const desc = Object.getOwnPropertyDescriptor(def, "shape");
	const sh = desc?.get ? desc.get.raw : def.shape ?? {};
	if (sh) {
		const get = () => {
			const newSh = { ...sh };
			Object.defineProperty(def, "shape", { value: newSh });
			get.raw = newSh;
			return newSh;
		};
		get.raw = sh;
		Object.defineProperty(def, "shape", { get });
	}
	const _normalized = cached(() => normalizeDef(def));
	defineLazyInternal(inst, "propValues", (zod) => {
		const shape = zod.def.shape;
		const propValues = {};
		for (const key in shape) {
			const field = shape[key]._zod;
			if (field.values) {
				if (!Object.prototype.hasOwnProperty.call(propValues, key)) assignProp(propValues, key, /* @__PURE__ */ new Set());
				for (const v of field.values) propValues[key].add(v);
				if (field.optin !== void 0) propValues[key].add(void 0);
			}
		}
		return propValues;
	});
	const isObject$2 = isObject;
	const catchall = def.catchall;
	let value;
	const memo = globalConfig.memoizer;
	memo?.attach(inst);
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject$2(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
		const proms = [];
		const shape = value.shape;
		const abortEarly = ctx?.abortEarly;
		let seen = payload.issues.length;
		for (const key of value.allKeys) {
			if (abortEarly && payload.issues.length !== seen) {
				if (aborted(payload, seen)) break;
				seen = payload.issues.length;
			}
			if (key === "__proto__") continue;
			const el = shape[key];
			const optin = el._zod.optin;
			const optout = el._zod.optout;
			const r = el._zod.run({
				value: input[key],
				issues: []
			}, ctx);
			if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, optin, optout)));
			else handlePropertyResult(r, payload, key, input, optin, optout);
		}
		if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
		return handleCatchall(proms, input, payload, ctx, _normalized.value, inst, abortEarly === true);
	};
});
const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
	$ZodObject.init(inst, def);
	const superParse = inst._zod.parse;
	const _normalized = cached(() => normalizeDef(def));
	const memo = globalConfig.memoizer;
	const generateFastpass = (shape) => {
		const normalized = _normalized.value;
		const syms = normalized.symbolKeys;
		const doc = new Doc(["payload", "ctx"], {
			shape,
			inst,
			memo,
			syms
		});
		const parseStr = (k) => `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
		const prefixStr = (id, k) => `
          let ${id}_ab = false;
          for (let i = 0; i < ${id}.issues.length; i++) {
            const iss = ${id}.issues[i];
            iss.path = iss.path ? [${k}, ...iss.path] : [${k}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${id}_ab = true;
          }
          if (${id}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
		doc.write(`const input = payload.value;`);
		const ids = Object.create(null);
		let counter = 0;
		for (const key of normalized.allKeys) ids[key] = `key_${counter++}`;
		doc.write(memo ? `const newResult = memo.alloc(inst, payload, {}, ctx);` : `const newResult = {};`);
		for (const key of normalized.allKeys) {
			if (key === "__proto__") continue;
			const id = ids[key];
			const k = typeof key === "symbol" ? `syms[${syms.indexOf(key)}]` : esc(key);
			const isPresent = `${k} in input`;
			const schema = shape[key];
			const optin = schema?._zod?.optin;
			const isOptionalIn = optin !== void 0;
			const isOptionalOut = schema?._zod?.optout === "optional";
			doc.write(`const ${id} = ${parseStr(k)};`);
			if (isOptionalIn && isOptionalOut) {
				const assign = optin === "optional" ? `${id}_present` : `${id}.value !== undefined || ${id}_present`;
				doc.write(`
        const ${id}_present = ${isPresent};
        if (!${id}.issues.length || ${id}_present) {
          if (${id}.issues.length) {${prefixStr(id, k)}
          }

          if (${assign}) {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
			} else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${isPresent};
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${id}_present) {
          newResult[${k}] = ${id}.value;
        }

      `);
			else {
				doc.write(`
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
      `);
				if (optin === "defaulted") doc.write(`newResult[${k}] = ${id}.value;`);
				else doc.write(`
        if (${id}.value !== undefined || ${isPresent}) {
          newResult[${k}] = ${id}.value;
        }
      `);
			}
		}
		doc.write(`payload.value = newResult;`);
		doc.write(`return payload;`);
		return doc.compile();
	};
	let fastpass;
	const isObject$1 = isObject;
	const jit = !globalConfig.jitless;
	const fastEnabled = jit && allowsEval.value;
	const catchall = def.catchall;
	let value;
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject$1(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
			if (!fastpass) fastpass = generateFastpass(def.shape);
			payload = fastpass(payload, ctx);
			if (!catchall) return payload;
			return handleCatchall([], input, payload, ctx, value, inst, ctx?.abortEarly === true);
		}
		return superParse(payload, ctx);
	};
});
function handleUnionResults(results, final, inst, ctx) {
	for (const result of results) if (result.issues.length === 0) {
		final.value = result.value;
		return final;
	}
	const nonaborted = results.filter((r) => !aborted(r));
	if (nonaborted.length === 1) {
		final.value = nonaborted[0].value;
		return nonaborted[0];
	}
	final.issues.push({
		code: "invalid_union",
		input: final.value,
		inst,
		errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	});
	return final;
}
const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : zod.def.options.some((o) => o._zod.optin !== void 0) ? "optional" : void 0);
	defineLazyInternal(inst, "optout", (zod) => zod.def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
	defineLazyInternal(inst, "values", (zod) => {
		if (zod.def.options.every((o) => o._zod.values)) return new Set(zod.def.options.flatMap((option) => Array.from(option._zod.values)));
	});
	defineLazyInternal(inst, "pattern", (zod) => {
		if (zod.def.options.every((o) => o._zod.pattern)) {
			const patterns = zod.def.options.map((o) => o._zod.pattern);
			return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
		}
	});
	const first = def.options.length === 1 ? def.options[0]._zod.run : null;
	inst._zod.parse = (payload, ctx) => {
		if (first) return first(payload, ctx);
		let async = false;
		const results = [];
		for (const option of def.options) {
			const result = option._zod.run({
				value: payload.value,
				issues: []
			}, ctx);
			if (result instanceof Promise) {
				results.push(result);
				async = true;
			} else {
				if (result.issues.length === 0) return result;
				results.push(result);
			}
		}
		if (!async) return handleUnionResults(results, payload, inst, ctx);
		return Promise.all(results).then((results) => {
			return handleUnionResults(results, payload, inst, ctx);
		});
	};
});
const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		const left = def.left._zod.run({
			value: input,
			issues: []
		}, ctx);
		const right = def.right._zod.run({
			value: input,
			issues: []
		}, ctx);
		if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
			return handleIntersectionResults(payload, left, right);
		});
		return handleIntersectionResults(payload, left, right);
	};
});
function mergeValues(a, b) {
	if (a === b) return {
		valid: true,
		data: a
	};
	if (a instanceof Date && b instanceof Date && +a === +b) return {
		valid: true,
		data: a
	};
	if (isPlainObject(a) && isPlainObject(b)) {
		const bKeys = Object.keys(b);
		const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
		const newObj = {
			...a,
			...b
		};
		if (Object.prototype.hasOwnProperty.call(newObj, "__proto__")) delete newObj.__proto__;
		for (const key of sharedKeys) {
			if (key === "__proto__") continue;
			const sharedValue = mergeValues(a[key], b[key]);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
			};
			newObj[key] = sharedValue.data;
		}
		return {
			valid: true,
			data: newObj
		};
	}
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return {
			valid: false,
			mergeErrorPath: []
		};
		const newArray = [];
		for (let index = 0; index < a.length; index++) {
			const itemA = a[index];
			const itemB = b[index];
			const sharedValue = mergeValues(itemA, itemB);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
			};
			newArray.push(sharedValue.data);
		}
		return {
			valid: true,
			data: newArray
		};
	}
	return {
		valid: false,
		mergeErrorPath: []
	};
}
function handleIntersectionResults(result, left, right) {
	const unrecKeys = /* @__PURE__ */ new Map();
	let unrecIssue;
	const keyIssues = /* @__PURE__ */ new Map();
	const collect = (iss, side) => {
		let keys;
		if (iss.code === "unrecognized_keys" && !iss.path?.length) {
			unrecIssue ?? (unrecIssue = iss);
			keys = iss.keys;
		} else if (iss.code === "invalid_key" && iss.origin === "record" && iss.path?.length === 1) {
			const k = String(iss.path[0]);
			if (!keyIssues.has(k)) keyIssues.set(k, iss);
			keys = [k];
		} else return false;
		for (const k of keys) {
			if (!unrecKeys.has(k)) unrecKeys.set(k, {});
			unrecKeys.get(k)[side] = true;
		}
		return true;
	};
	for (const iss of left.issues) if (!collect(iss, "l")) result.issues.push(iss);
	for (const iss of right.issues) if (!collect(iss, "r")) result.issues.push(iss);
	const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
	if (bothKeys.length) {
		const aggregated = unrecIssue ? bothKeys.filter((k) => unrecIssue.keys.includes(k)) : [];
		if (aggregated.length) result.issues.push({
			...unrecIssue,
			keys: aggregated
		});
		for (const k of bothKeys) if (!aggregated.includes(k) && keyIssues.has(k)) result.issues.push(keyIssues.get(k));
	}
	const merged = mergeValues(left.value, right.value);
	if (!merged.valid) {
		if (aborted(result)) return result;
		throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
	}
	result.value = merged.data;
	return result;
}
const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
	$ZodType.init(inst, def);
	const values = getEnumValues(def.entries);
	const valuesSet = new Set(values);
	inst._zod.values = valuesSet;
	defineLazyInternal(inst, "pattern", (zod) => {
		const patternValues = getEnumValues(zod.def.entries).filter((k) => propertyKeyTypes.has(typeof k));
		return new RegExp(patternValues.length ? `^(${patternValues.map((o) => escapeRegex(o.toString())).join("|")})$` : "^[^\\s\\S]$");
	});
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (valuesSet.has(input)) return payload;
		payload.issues.push({
			code: "invalid_value",
			values,
			input,
			inst
		});
		return payload;
	};
});
const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
	$ZodType.init(inst, def);
	const values = new Set(def.values);
	inst._zod.values = values;
	defineLazyInternal(inst, "pattern", (zod) => {
		const vals = zod.def.values;
		return new RegExp(vals.length ? `^(${vals.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$` : "^[^\\s\\S]$");
	});
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (values.has(input)) return payload;
		payload.issues.push({
			code: "invalid_value",
			values: def.values,
			input,
			inst
		});
		return payload;
	};
});
const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	globalConfig.memoizer?.guard(inst);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		const _out = def.transform(payload.value, payload);
		if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
			payload.value = output;
			return payload;
		});
		if (_out instanceof Promise) throw new $ZodAsyncError();
		payload.value = _out;
		return payload;
	};
});
function handleOptionalResult(payload, result) {
	payload.value = result.issues.length ? void 0 : result.value;
	return payload;
}
const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
	inst._zod.optout = "optional";
	defineLazyInternal(inst, "values", (zod) => {
		const values = zod.def.innerType._zod.values;
		return values ? /* @__PURE__ */ new Set([...values, void 0]) : void 0;
	});
	defineLazyInternal(inst, "pattern", (zod) => {
		const pattern = zod.def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === void 0) {
			if (def.innerType._zod.optin !== "defaulted") return payload;
			const result = def.innerType._zod.run({
				value: payload.value,
				issues: []
			}, ctx);
			if (result instanceof Promise) return result.then((result) => handleOptionalResult(payload, result));
			return handleOptionalResult(payload, result);
		}
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	defineLazyInternal(inst, "pattern", (zod) => zod.def.innerType._zod.pattern);
	inst._zod.parse = (payload, ctx) => {
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin);
	defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
	defineLazyInternal(inst, "pattern", (zod) => {
		const pattern = zod.def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
	});
	defineLazyInternal(inst, "values", (zod) => {
		return zod.def.innerType._zod.values ? /* @__PURE__ */ new Set([...zod.def.innerType._zod.values, null]) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === null) return payload;
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "defaulted";
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) {
			payload.value = def.defaultValue;
			/**
			* $ZodDefault returns the default value immediately in forward direction.
			* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
			return payload;
		}
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
		return handleDefaultResult(result, def);
	};
});
function handleDefaultResult(payload, def) {
	if (payload.value === void 0) payload.value = def.defaultValue;
	return payload;
}
const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "defaulted";
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) payload.value = def.defaultValue;
		return def.innerType._zod.run(payload, ctx);
	};
});
const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "values", (zod) => {
		const v = zod.def.innerType._zod.values;
		return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
		return handleNonOptionalResult(result, inst);
	};
});
function handleNonOptionalResult(payload, inst) {
	if (!payload.issues.length && payload.value === void 0) payload.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: payload.value,
		inst
	});
	return payload;
}
function handleCatchResult(payload, result, def, ctx) {
	if (!result.issues.length) {
		payload.value = result.value;
		if (result.memo) payload.memo = true;
		return payload;
	}
	payload.value = def.catchValue({
		...result,
		value: payload.value,
		error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
		input: payload.value
	});
	return payload;
}
const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
	defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run({
			value: payload.value,
			issues: []
		}, ctx);
		if (result instanceof Promise) return result.then((result) => handleCatchResult(payload, result, def, ctx));
		return handleCatchResult(payload, result, def, ctx);
	};
});
const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "values", (zod) => zod.def.in._zod.values);
	defineLazyInternal(inst, "optin", (zod) => zod.def.in._zod.optin);
	defineLazyInternal(inst, "optout", (zod) => zod.def.out._zod.optout);
	defineLazyInternal(inst, "propValues", (zod) => zod.def.in._zod.propValues);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") {
			const right = def.out._zod.run(payload, ctx);
			if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
			return handlePipeResult(right, def.in, ctx);
		}
		const left = def.in._zod.run(payload, ctx);
		if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
		return handlePipeResult(left, def.out, ctx);
	};
});
function handlePipeResult(left, next, ctx) {
	if (left.issues.some((iss) => iss.code !== "unrecognized_keys")) {
		left.aborted = true;
		return left;
	}
	return next._zod.run({
		value: left.value,
		issues: left.issues
	}, ctx);
}
const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazyInternal(inst, "propValues", (zod) => zod.def.innerType._zod.propValues);
	defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
	defineLazyInternal(inst, "optin", (zod) => zod.def.innerType?._zod?.optin);
	defineLazyInternal(inst, "optout", (zod) => zod.def.innerType?._zod?.optout);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then(handleReadonlyResult);
		return handleReadonlyResult(result);
	};
});
function handleReadonlyResult(payload) {
	if (!payload.memo) payload.value = Object.freeze(payload.value);
	return payload;
}
const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
	$ZodCheck.init(inst, def);
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _) => {
		return payload;
	};
	inst._zod.check = (payload) => {
		const input = payload.value;
		const r = def.fn(input);
		if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
		handleRefineResult(r, payload, input, inst);
	};
});
function handleRefineResult(result, payload, input, inst) {
	if (!result) {
		const _iss = {
			code: "custom",
			input,
			inst,
			path: [...inst._zod.def.path ?? []],
			continue: !inst._zod.def.abort
		};
		if (inst._zod.def.params) _iss.params = inst._zod.def.params;
		payload.issues.push(issue(_iss));
	}
}
//#endregion
//#region ../../node_modules/zod/v4/core/memoizer.js
var $ZodCyclicError = class extends Error {
	constructor() {
		super(`Cannot parse a reference cycle that closes through a transform`);
		this.name = "ZodCyclicError";
	}
};
/** Keyed off the context object every schema in one parse call already shares. */
const STATE = "~memo";
const NO_ISSUES = [];
function isRef(value) {
	return value !== null && (typeof value === "object" || typeof value === "function");
}
function cloneIssues(issues) {
	return issues.map((iss) => iss.path ? {
		...iss,
		path: iss.path.slice()
	} : { ...iss });
}
const recursive = /*@__PURE__*/ new WeakMap();
/** What the walk established, in order of certainty: ordered so the strongest answer among children wins. */
const NONE = 0;
const ASSUMED = 1;
const PROVEN = 2;
/** Whether this schema's subtree contains a cycle, so one parse can re-enter it. */
function isRecursive(inst, stack, resolve) {
	const cached = recursive.get(inst);
	if (cached !== void 0) return cached ? PROVEN : NONE;
	if (stack.has(inst)) return PROVEN;
	stack.add(inst);
	let result = NONE;
	const check = (child) => {
		if (result !== PROVEN && child?._zod) {
			const answer = isRecursive(child, stack, resolve);
			if (answer > result) result = answer;
		}
	};
	const shape = (sh, spread) => {
		let answer = NONE;
		for (const key of Reflect.ownKeys(sh)) {
			const desc = Object.getOwnPropertyDescriptor(sh, key);
			if (spread && !desc.enumerable) continue;
			const child = desc.get ? ASSUMED : desc.value?._zod ? isRecursive(desc.value, stack, resolve) : NONE;
			if (child > answer) answer = child;
		}
		return answer;
	};
	const merge = (answer) => {
		if (answer > result) result = answer;
	};
	const def = inst._zod.def;
	switch (def.type) {
		case "object": {
			const raw = rawShape(def);
			merge(raw ? shape(raw, true) : ASSUMED);
			check(def.catchall);
			break;
		}
		case "properties":
			merge(shape(def.shape, false));
			break;
		case "array":
			check(def.element);
			break;
		case "tuple":
			for (const el of def.items) check(el);
			check(def.rest);
			break;
		case "record":
		case "map":
			check(def.keyType);
			check(def.valueType);
			break;
		case "set":
			check(def.valueType);
			break;
		case "union":
			for (const el of def.options) check(el);
			break;
		case "intersection":
			check(def.left);
			check(def.right);
			break;
		case "optional":
		case "nullable":
		case "default":
		case "prefault":
		case "catch":
		case "readonly":
		case "nonoptional":
		case "promise":
		case "success":
			check(def.innerType);
			break;
		case "pipe":
			check(def.in);
			check(def.out);
			break;
		case "function":
			check(def.input);
			check(def.output);
			break;
		case "lazy": {
			const inner = def._cachedInner ?? (resolve ? inst._zod.innerType : void 0);
			merge(inner ? isRecursive(inner, stack, false) : ASSUMED);
			break;
		}
		case "template_literal":
		case "string":
		case "number":
		case "int":
		case "boolean":
		case "bigint":
		case "symbol":
		case "undefined":
		case "null":
		case "void":
		case "never":
		case "any":
		case "unknown":
		case "date":
		case "nan":
		case "enum":
		case "literal":
		case "file":
		case "transform":
		case "custom": break;
		default: for (const key in def) {
			const desc = Object.getOwnPropertyDescriptor(def, key);
			if (!desc || desc.get) continue;
			const value = desc.value;
			if (!value || typeof value !== "object") continue;
			if (value._zod) check(value);
			else if (Array.isArray(value)) for (const el of value) check(el);
		}
	}
	stack.delete(inst);
	return settle(inst, result);
}
/** An assumed answer must not outlive the resolution that settles it, so only a certain one is cached. */
function settle(inst, answer) {
	if (answer !== ASSUMED) recursive.set(inst, answer === PROVEN);
	return answer;
}
function bucketFor(state, inst) {
	let bucket = state.buckets.get(inst);
	if (!bucket) {
		bucket = /* @__PURE__ */ new WeakMap();
		state.buckets.set(inst, bucket);
	}
	return bucket;
}
let handoff;
const open = [];
const memo = {
	alloc(_inst, payload, empty) {
		const bucket = handoff;
		if (!bucket) return empty;
		handoff = void 0;
		const entry = {
			value: empty,
			issues: null
		};
		bucket.set(payload.value, entry);
		open.push(entry);
		return empty;
	},
	guard(inst) {
		var _a;
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred.push(() => {
			const base = inst._zod.parse;
			const wrapped = (payload, ctx) => {
				if (ctx.direction !== "backward" && isBackEdge(ctx, payload.value)) throw new $ZodCyclicError();
				return base(payload, ctx);
			};
			inst._zod.parse = wrapped;
			if (inst._zod.run === base) inst._zod.run = wrapped;
		});
	},
	attach(inst) {
		var _a;
		let isRecursiveInst;
		let rechecked = false;
		let lastCtx;
		let lastBucket;
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred.push(() => {
			const base = inst._zod.parse;
			const wrapped = (payload, ctx) => {
				if (isRecursiveInst === void 0) {
					const walked = isRecursive(inst, /* @__PURE__ */ new Set(), false);
					if (walked === NONE) {
						inst._zod.parse = base;
						if (inst._zod.run === wrapped) inst._zod.run = base;
						return base(payload, ctx);
					}
					if (walked === PROVEN || rechecked) isRecursiveInst = true;
					else rechecked = true;
				}
				const input = payload.value;
				if (!isRef(input)) return base(payload, ctx);
				let state = ctx[STATE];
				if (!state) {
					state = {
						buckets: /* @__PURE__ */ new WeakMap(),
						backEdges: void 0
					};
					ctx[STATE] = state;
				}
				let bucket;
				if (lastCtx === ctx) bucket = lastBucket;
				else {
					bucket = bucketFor(state, inst);
					lastCtx = ctx;
					lastBucket = bucket;
				}
				const hit = bucket.get(input);
				if (hit) {
					payload.value = hit.value;
					if (hit.issues) {
						if (hit.issues.length) payload.issues.push(...cloneIssues(hit.issues));
					} else {
						payload.memo = true;
						state.backEdges ?? (state.backEdges = /* @__PURE__ */ new WeakSet());
						state.backEdges.add(hit.value);
					}
					return payload;
				}
				handoff = bucket;
				const depth = open.length;
				const result = base(payload, ctx);
				handoff = void 0;
				const entry = open.length > depth ? open.pop() : void 0;
				if (result instanceof Promise) return result.then((r) => {
					if (entry) entry.issues = r.issues.length ? cloneIssues(r.issues) : NO_ISSUES;
					return r;
				});
				if (entry) entry.issues = result.issues.length ? cloneIssues(result.issues) : NO_ISSUES;
				return result;
			};
			inst._zod.parse = wrapped;
			if (inst._zod.run === base) inst._zod.run = wrapped;
		});
	}
};
/** The memoizer that gives containers cycle support. `zod` installs it by default; `zod/mini` opts in with `config({ memoizer: memoizer() })`. */
function memoizer() {
	return memo;
}
/** Whether this value is a node a back-edge resolved to before it finished. */
function isBackEdge(ctx, value) {
	const backEdges = ctx[STATE]?.backEdges;
	return backEdges !== void 0 && isRef(value) && backEdges.has(value);
}
//#endregion
//#region ../../node_modules/zod/v4/locales/en.js
const error = () => {
	const Sizable = {
		string: {
			unit: "characters",
			verb: "to have"
		},
		file: {
			unit: "bytes",
			verb: "to have"
		},
		array: {
			unit: "items",
			verb: "to have"
		},
		set: {
			unit: "items",
			verb: "to have"
		},
		map: {
			unit: "entries",
			verb: "to have"
		}
	};
	function getSizing(origin) {
		return Sizable[origin] ?? null;
	}
	const FormatDictionary = {
		regex: "input",
		email: "email address",
		url: "URL",
		emoji: "emoji",
		uuid: "UUID",
		uuidv4: "UUIDv4",
		uuidv6: "UUIDv6",
		nanoid: "nanoid",
		guid: "GUID",
		cuid: "cuid",
		cuid2: "cuid2",
		ulid: "ULID",
		xid: "XID",
		ksuid: "KSUID",
		datetime: "ISO datetime",
		date: "ISO date",
		time: "ISO time",
		duration: "ISO duration",
		ipv4: "IPv4 address",
		ipv6: "IPv6 address",
		mac: "MAC address",
		cidrv4: "IPv4 range",
		cidrv6: "IPv6 range",
		base64: "base64-encoded string",
		base64url: "base64url-encoded string",
		json_string: "JSON string",
		e164: "E.164 number",
		credit_card: "credit card number",
		iban: "IBAN",
		jwt: "JWT",
		template_literal: "input"
	};
	const TypeDictionary = { nan: "NaN" };
	function getTypeName(type, input) {
		if (type === "number" && typeof input === "number" && !Number.isFinite(input)) return String(input);
		return TypeDictionary[type] ?? type;
	}
	return (issue) => {
		switch (issue.code) {
			case "invalid_type": return `Invalid input: expected ${getTypeName(issue.expected)}, received ${getTypeName(parsedType(issue.input), issue.input)}`;
			case "invalid_value":
				if (issue.values.length === 1) return `Invalid input: expected ${stringifyPrimitive(issue.values[0])}`;
				return `Invalid option: expected one of ${joinValues(issue.values, "|")}`;
			case "too_big": {
				const adj = issue.exact ? "exactly " : issue.inclusive ? "<=" : "<";
				const sizing = getSizing(issue.origin);
				if (sizing) return `Too big: expected ${issue.origin ?? "value"} to have ${adj}${issue.maximum.toString()} ${sizing.unit ?? "elements"}`;
				return `Too big: expected ${issue.origin ?? "value"} to be ${adj}${issue.maximum.toString()}`;
			}
			case "too_small": {
				const adj = issue.exact ? "exactly " : issue.inclusive ? ">=" : ">";
				const sizing = getSizing(issue.origin);
				if (sizing) return `Too small: expected ${issue.origin} to have ${adj}${issue.minimum.toString()} ${sizing.unit}`;
				return `Too small: expected ${issue.origin} to be ${adj}${issue.minimum.toString()}`;
			}
			case "invalid_format": {
				const _issue = issue;
				if (_issue.format === "starts_with") return `Invalid string: must start with "${_issue.prefix}"`;
				if (_issue.format === "ends_with") return `Invalid string: must end with "${_issue.suffix}"`;
				if (_issue.format === "includes") return `Invalid string: must include "${_issue.includes}"`;
				if (_issue.format === "regex") return `Invalid string: must match pattern ${_issue.pattern}`;
				return `Invalid ${FormatDictionary[_issue.format] ?? issue.format}`;
			}
			case "not_multiple_of": return `Invalid number: must be a multiple of ${issue.divisor}`;
			case "unrecognized_keys": return `Unrecognized key${issue.keys.length > 1 ? "s" : ""}: ${joinValues(issue.keys, ", ")}`;
			case "invalid_key": return `Invalid key in ${issue.origin}`;
			case "invalid_union":
				if (issue.options && Array.isArray(issue.options) && issue.options.length > 0) return `Invalid discriminator value. Expected ${issue.options.map((o) => `'${o}'`).join(" | ")}`;
				if (issue.inclusive === false) return "Invalid input: more than one option matched";
				return "Invalid input";
			case "invalid_element": return `Invalid value in ${issue.origin}`;
			default: return `Invalid input`;
		}
	};
};
function en_default() {
	return { localeError: error() };
}
//#endregion
//#region ../../node_modules/zod/v4/core/registries.js
var _a;
var $ZodRegistry = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
	}
	add(schema, ..._meta) {
		const meta = _meta[0];
		this._map.set(schema, meta);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
		return this;
	}
	clear() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
		return this;
	}
	remove(schema) {
		const meta = this._map.get(schema);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
		this._map.delete(schema);
		return this;
	}
	get(schema) {
		const p = schema._zod.parent;
		if (p) {
			const pm = { ...this.get(p) ?? {} };
			delete pm.id;
			const f = {
				...pm,
				...this._map.get(schema)
			};
			return Object.keys(f).length ? f : void 0;
		}
		return this._map.get(schema);
	}
	has(schema) {
		return this._map.has(schema);
	}
};
function registry() {
	return new $ZodRegistry();
}
(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
const globalRegistry = globalThis.__zod_globalRegistry;
//#endregion
//#region ../../node_modules/zod/v4/core/api.js
// @__NO_SIDE_EFFECTS__
function _string(Class, params) {
	return new Class({
		type: "string",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _email(Class, params) {
	return new Class({
		type: "string",
		format: "email",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _guid(Class, params) {
	return new Class({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuid(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuidv4(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v4",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuidv6(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v6",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uuidv7(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v7",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _url(Class, params) {
	return new Class({
		type: "string",
		format: "url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _emoji(Class, params) {
	return new Class({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _nanoid(Class, params) {
	return new Class({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link _cuid2} instead.
* See https://github.com/paralleldrive/cuid.
*/
// @__NO_SIDE_EFFECTS__
function _cuid(Class, params) {
	return new Class({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _cuid2(Class, params) {
	return new Class({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ulid(Class, params) {
	return new Class({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _xid(Class, params) {
	return new Class({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ksuid(Class, params) {
	return new Class({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ipv4(Class, params) {
	return new Class({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _ipv6(Class, params) {
	return new Class({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _cidrv4(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _cidrv6(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _base64(Class, params) {
	return new Class({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _base64url(Class, params) {
	return new Class({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _e164(Class, params) {
	return new Class({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _jwt(Class, params) {
	return new Class({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoDateTime(Class, params) {
	return new Class({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: false,
		local: false,
		precision: null,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoDate(Class, params) {
	return new Class({
		type: "string",
		format: "date",
		check: "string_format",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoTime(Class, params) {
	return new Class({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _isoDuration(Class, params) {
	return new Class({
		type: "string",
		format: "duration",
		check: "string_format",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _number(Class, params) {
	return new Class({
		type: "number",
		checks: [],
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _int(Class, params) {
	return new Class({
		type: "number",
		check: "number_format",
		abort: false,
		format: "safeint",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _boolean(Class, params) {
	return new Class({
		type: "boolean",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _unknown(Class) {
	return new Class({ type: "unknown" });
}
// @__NO_SIDE_EFFECTS__
function _never(Class, params) {
	return new Class({
		type: "never",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _lt(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
// @__NO_SIDE_EFFECTS__
function _lte(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
// @__NO_SIDE_EFFECTS__
function _gt(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
// @__NO_SIDE_EFFECTS__
function _gte(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
// @__NO_SIDE_EFFECTS__
function _multipleOf(value, params) {
	return new $ZodCheckMultipleOf({
		check: "multiple_of",
		...normalizeParams(params),
		value
	});
}
// @__NO_SIDE_EFFECTS__
function _maxLength(maximum, params) {
	return new $ZodCheckMaxLength({
		check: "max_length",
		...normalizeParams(params),
		maximum
	});
}
// @__NO_SIDE_EFFECTS__
function _minLength(minimum, params) {
	return new $ZodCheckMinLength({
		check: "min_length",
		...normalizeParams(params),
		minimum
	});
}
// @__NO_SIDE_EFFECTS__
function _length(length, params) {
	return new $ZodCheckLengthEquals({
		check: "length_equals",
		...normalizeParams(params),
		length
	});
}
// @__NO_SIDE_EFFECTS__
function _regex(pattern, params) {
	return new $ZodCheckRegex({
		check: "string_format",
		format: "regex",
		...normalizeParams(params),
		pattern
	});
}
// @__NO_SIDE_EFFECTS__
function _lowercase(params) {
	return new $ZodCheckLowerCase({
		check: "string_format",
		format: "lowercase",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _uppercase(params) {
	return new $ZodCheckUpperCase({
		check: "string_format",
		format: "uppercase",
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _includes(includes, params) {
	return new $ZodCheckIncludes({
		check: "string_format",
		format: "includes",
		...normalizeParams(params),
		includes
	});
}
// @__NO_SIDE_EFFECTS__
function _startsWith(prefix, params) {
	return new $ZodCheckStartsWith({
		check: "string_format",
		format: "starts_with",
		...normalizeParams(params),
		prefix
	});
}
// @__NO_SIDE_EFFECTS__
function _endsWith(suffix, params) {
	return new $ZodCheckEndsWith({
		check: "string_format",
		format: "ends_with",
		...normalizeParams(params),
		suffix
	});
}
// @__NO_SIDE_EFFECTS__
function _overwrite(tx) {
	return new $ZodCheckOverwrite({
		check: "overwrite",
		tx
	});
}
// @__NO_SIDE_EFFECTS__
function _normalize(form) {
	return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
}
// @__NO_SIDE_EFFECTS__
function _trim() {
	return /* @__PURE__ */ _overwrite((input) => input.trim());
}
// @__NO_SIDE_EFFECTS__
function _toLowerCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function _toUpperCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function _slugify() {
	return /* @__PURE__ */ _overwrite((input) => slugify(input));
}
// @__NO_SIDE_EFFECTS__
function _array(Class, element, params) {
	return new Class({
		type: "array",
		element,
		...normalizeParams(params)
	});
}
// @__NO_SIDE_EFFECTS__
function _refine(Class, fn, _params) {
	return new Class({
		type: "custom",
		check: "custom",
		fn,
		...normalizeParams(_params)
	});
}
// @__NO_SIDE_EFFECTS__
function _superRefine(fn, params) {
	const ch = /* @__PURE__ */ _check((payload) => {
		payload.addIssue = (issue$2) => {
			if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
			else {
				const _issue = issue$2;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				if (!("input" in _issue)) _issue.input = payload.value;
				_issue.inst ?? (_issue.inst = ch);
				_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
				payload.issues.push(issue(_issue));
			}
		};
		return fn(payload.value, payload);
	}, params);
	return ch;
}
// @__NO_SIDE_EFFECTS__
function _check(fn, params) {
	const ch = new $ZodCheck({
		check: "custom",
		...normalizeParams(params)
	});
	ch._zod.check = fn;
	return ch;
}
//#endregion
//#region ../../node_modules/zod/v4/core/to-json-schema.js
function assignProps(target, ...sources) {
	for (const source of sources) for (const key of Reflect.ownKeys(source)) if (Object.prototype.propertyIsEnumerable.call(source, key)) assignProp(target, key, source[key]);
	return target;
}
function initializeContext(params) {
	let target = params?.target ?? "draft-2020-12";
	if (target === "draft-4") target = "draft-04";
	if (target === "draft-7") target = "draft-07";
	return {
		processors: params.processors ?? {},
		metadataRegistry: params?.metadata ?? globalRegistry,
		target,
		unrepresentable: params?.unrepresentable ?? "throw",
		override: params?.override ?? (() => {}),
		io: params?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		sharedDefsExtractedFor: void 0,
		sharedEmitDoneFor: void 0,
		cycles: params?.cycles ?? "ref",
		reused: params?.reused ?? "inline",
		intersections: [],
		deferred: [],
		external: params?.external ?? void 0
	};
}
/**
* Applies the `unrepresentable` setting at a site that has no JSON Schema equivalent. Throws
* `message` unless the setting (or the handler's return value) says otherwise. Returns `true` if a
* custom JSON Schema was written into `json`, in which case the caller must not write its own.
*/
function handleUnrepresentable(schema, ctx, json, params, message) {
	const result = typeof ctx.unrepresentable === "function" ? ctx.unrepresentable({
		zodSchema: schema,
		path: params.path,
		message
	}) : ctx.unrepresentable;
	if (result === "any") return false;
	if (result === void 0 || result === "throw") throw new Error(message);
	Object.assign(json, result);
	return true;
}
function processSchema(schema, ctx, _params = {
	path: [],
	schemaPath: []
}) {
	var _a;
	const def = schema._zod.def;
	const seen = ctx.seen.get(schema);
	if (seen) {
		seen.count++;
		if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
		return seen.schema;
	}
	const result = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: _params.path
	};
	ctx.seen.set(schema, result);
	ctx.sharedDefsExtractedFor = void 0;
	ctx.sharedEmitDoneFor = void 0;
	const overrideSchema = schema._zod.toJSONSchema?.();
	if (overrideSchema) result.schema = overrideSchema;
	else {
		const params = {
			..._params,
			schemaPath: [..._params.schemaPath, schema],
			path: _params.path
		};
		if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
		else {
			const _json = result.schema;
			const processor = ctx.processors[def.type];
			if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
			processor(schema, ctx, _json, params);
		}
		const parent = schema._zod.parent;
		if (parent) {
			if (!result.ref) result.ref = parent;
			processSchema(parent, ctx, params);
			ctx.seen.get(parent).isParent = true;
		}
	}
	const meta = ctx.metadataRegistry.get(schema);
	if (meta) assignProps(result.schema, meta);
	if (ctx.io === "input" && isTransforming(schema)) {
		delete result.schema.examples;
		delete result.schema.default;
	}
	if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
	delete result.schema._prefault;
	return ctx.seen.get(schema).schema;
}
function encodeJSONPointerSegment(segment) {
	return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}
function extractDefs(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	if (ctx.external && ctx.sharedDefsExtractedFor === ctx.external) return;
	const idToSchema = /* @__PURE__ */ new Map();
	for (const entry of ctx.seen.entries()) {
		const id = ctx.metadataRegistry.get(entry[0])?.id;
		if (id) {
			const existing = idToSchema.get(id);
			if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			idToSchema.set(id, entry[0]);
		}
	}
	const makeURI = (entry) => {
		const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
		if (ctx.external) {
			const externalId = ctx.external.registry.get(entry[0])?.id;
			const uriGenerator = ctx.external.uri ?? ((id) => id);
			if (externalId) return { ref: uriGenerator(externalId) };
			const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
			entry[1].defId = id;
			return {
				defId: id,
				ref: `${uriGenerator("__shared")}#/${defsSegment}/${encodeJSONPointerSegment(id)}`
			};
		}
		const uriPrefix = `#`;
		const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
		if (entry[1] === root && !entry[1].schema.id) return { ref: uriPrefix };
		const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
		return {
			defId,
			ref: defUriPrefix + encodeJSONPointerSegment(defId)
		};
	};
	const extractToDef = (entry) => {
		if (entry[1].schema.$ref) return;
		const seen = entry[1];
		const { ref, defId } = makeURI(entry);
		seen.def = { ...seen.schema };
		if (defId) seen.defId = defId;
		const schema = seen.schema;
		for (const key in schema) delete schema[key];
		schema.$ref = ref;
	};
	if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (schema === entry[0]) {
			extractToDef(entry);
			continue;
		}
		if (ctx.external) {
			const ext = ctx.external.registry.get(entry[0])?.id;
			if (schema !== entry[0] && ext) {
				extractToDef(entry);
				continue;
			}
		}
		if (ctx.metadataRegistry.get(entry[0])?.id) {
			extractToDef(entry);
			continue;
		}
		if (seen.cycle) {
			extractToDef(entry);
			continue;
		}
		if (seen.count > 1) {
			if (ctx.reused === "ref") extractToDef(entry);
		}
	}
	if (ctx.external) ctx.sharedDefsExtractedFor = ctx.external;
}
/** Rewrites `anyOf: [{type: "a"}, {type: "b"}]` to `type: ["a", "b"]`, which every JSON Schema draft treats as equivalent and most consumers render far better for the nullable case. Only branches that are a bare type assertion qualify — anything carrying a constraint, `$ref`, `const` or metadata is left alone. Runs after `flattenRef`, so a branch an override decorated or `$defs` extraction turned into a `$ref` is no longer bare and correctly stays in `anyOf`. `oneOf` is excluded: `integer` and `number` overlap, so "exactly one" and "at least one" are not the same there. OpenAPI 3.0 is excluded: its `type` must be a single string. */
function compactTypeUnion(schema) {
	const options = schema.anyOf;
	if (!Array.isArray(options) || options.length === 0 || schema.type !== void 0) return;
	const types = [];
	for (const option of options) {
		if (!option || typeof option !== "object") return;
		compactTypeUnion(option);
		const keys = Object.keys(option);
		if (keys.length !== 1 || keys[0] !== "type") return;
		const type = option.type;
		for (const member of Array.isArray(type) ? type : [type]) {
			if (typeof member !== "string") return;
			if (!types.includes(member)) types.push(member);
		}
	}
	delete schema.anyOf;
	schema.type = types.length === 1 ? types[0] : types;
}
/** Keywords `foldIntersection` knows how to combine. Anything else — `$ref`, `patternProperties`,
* an annotation like `description` — makes a member unfoldable, so a constraint this does not
* understand leaves the `allOf` alone instead of being silently dropped or misattributed. */
const FOLDABLE_KEYS = /* @__PURE__ */ new Set([
	"type",
	"properties",
	"required",
	"additionalProperties"
]);
const UNION_KEYS = ["oneOf", "anyOf"];
/** A member's constraint on a key it does not declare itself. A `catchall` states one; `false`, an absent `additionalProperties`, and the empty schema a loose object emits state nothing. */
function undeclaredConstraint(member) {
	const extra = member.additionalProperties;
	if (extra === void 0 || extra === false || typeof extra !== "object" || extra === null) return null;
	return Object.keys(extra).length ? extra : null;
}
/** Combines object members into the single object they describe together, or returns `null` if any of them carries a keyword outside {@link FOLDABLE_KEYS}. */
function foldObjects(members) {
	const objects = [];
	for (const member of members) {
		if (typeof member !== "object" || member.type !== "object") return null;
		for (const key in member) if (!FOLDABLE_KEYS.has(key)) return null;
		objects.push(member);
	}
	const properties = {};
	const required = /* @__PURE__ */ new Set();
	for (const object of objects) {
		for (const key in object.properties) {
			if (Object.prototype.hasOwnProperty.call(properties, key)) continue;
			const parts = [];
			for (const other of objects) {
				const part = other.properties?.[key] ?? undeclaredConstraint(other);
				if (part === null || part === void 0) continue;
				if (!parts.some((seen) => JSON.stringify(seen) === JSON.stringify(part))) parts.push(part);
			}
			assignProp(properties, key, parts.length === 1 ? parts[0] : foldObjects(parts) ?? { allOf: parts });
		}
		for (const key of object.required ?? []) required.add(key);
	}
	const folded = {
		type: "object",
		properties
	};
	if (required.size) folded.required = [...required];
	if (objects.every((object) => object.additionalProperties === false)) folded.additionalProperties = false;
	else {
		const constraints = [];
		for (const object of objects) {
			const constraint = undeclaredConstraint(object);
			if (constraint && !constraints.some((seen) => JSON.stringify(seen) === JSON.stringify(constraint))) constraints.push(constraint);
		}
		if (constraints.length === 1) folded.additionalProperties = constraints[0];
		else if (constraints.length > 1) folded.additionalProperties = { allOf: constraints };
	}
	return folded;
}
/** `additionalProperties` in an `allOf` member sees only that member's own `properties`, so two
* closed object members reject each other's keys and the schema validates nothing. Zod's parser
* pools the key sets instead — `handleIntersectionResults` reports a key as unrecognized only when
* *every* side rejects it — so the emitted schema has to pool them too, and folding the members
* into one object is the encoding that says so on every target.
*
* This runs from `finalize`, after `extractDefs`, which is what keeps it clear of the `$ref`
* machinery: a member extracted into `$defs` is already a `$ref` by now and declines to fold, so it
* keeps its reference and its own closedness rather than being inlined as a stale copy. */
function foldIntersection(json) {
	const allOf = json.allOf;
	if (!Array.isArray(allOf) || allOf.length < 2) return;
	for (const key of FOLDABLE_KEYS) if (key in json) return;
	const unions = allOf.filter((m) => UNION_KEYS.some((k) => Array.isArray(m[k])));
	let folded = null;
	if (!unions.length) folded = foldObjects(allOf);
	else {
		const union = unions[0];
		const keyword = UNION_KEYS.find((k) => Array.isArray(union[k]));
		if (Object.keys(union).length !== 1) return;
		const rest = allOf.filter((m) => m !== union);
		const branches = union[keyword].map((branch) => foldObjects([...rest, branch]));
		if (branches.some((b) => !b)) return;
		folded = { [keyword]: branches };
	}
	if (!folded) return;
	delete json.allOf;
	assignProps(json, folded);
}
function finalize(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	const flattenRef = (zodSchema) => {
		const seen = ctx.seen.get(zodSchema);
		if (seen.ref === null) return;
		const schema = seen.def ?? seen.schema;
		const _cached = { ...schema };
		const ref = seen.ref;
		seen.ref = null;
		if (ref) {
			flattenRef(ref);
			const refSeen = ctx.seen.get(ref);
			const refSchema = refSeen.schema;
			if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
				schema.allOf = schema.allOf ?? [];
				schema.allOf.push(refSchema);
			} else assignProps(schema, refSchema);
			assignProps(schema, _cached);
			if (zodSchema._zod.parent === ref) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (!(key in _cached)) delete schema[key];
			}
			if (refSchema.$ref && refSeen.def) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
			}
		}
		const parent = zodSchema._zod.parent;
		if (parent && parent !== ref) {
			flattenRef(parent);
			const parentSeen = ctx.seen.get(parent);
			if (parentSeen?.schema.$ref) {
				schema.$ref = parentSeen.schema.$ref;
				if (parentSeen.def) for (const key in schema) {
					if (key === "$ref" || key === "allOf") continue;
					if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
				}
			}
		}
		ctx.override({
			zodSchema,
			jsonSchema: schema,
			path: seen.path ?? []
		});
	};
	if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
		for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
		if (ctx.target !== "openapi-3.0") for (const entry of ctx.seen.entries()) compactTypeUnion(entry[1].def ?? entry[1].schema);
		for (const rewrite of ctx.deferred) rewrite();
		if (ctx.intersections.length) {
			const carriers = /* @__PURE__ */ new Map();
			for (const seen of ctx.seen.values()) for (const json of [seen.schema, seen.def]) {
				const allOf = json?.allOf;
				if (!Array.isArray(allOf)) continue;
				const existing = carriers.get(allOf);
				if (existing) existing.push(json);
				else carriers.set(allOf, [json]);
			}
			for (const allOf of ctx.intersections) for (const json of carriers.get(allOf) ?? []) foldIntersection(json);
		}
	}
	const result = {};
	if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
	else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
	else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
	else if (ctx.target === "openapi-3.0") {}
	if (ctx.external?.uri) {
		const id = ctx.external.registry.get(schema)?.id;
		if (!id) throw new Error("Schema is missing an `id` property");
		result.$id = ctx.external.uri(id);
	}
	assignProps(result, root.defId ? root.schema : root.def ?? root.schema);
	const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
	if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
	const defs = ctx.external?.defs ?? {};
	if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.def && seen.defId) {
			if (seen.def.id === seen.defId) delete seen.def.id;
			assignProp(defs, seen.defId, seen.def);
		}
	}
	if (ctx.external) ctx.sharedEmitDoneFor = ctx.external;
	if (ctx.external) {} else if (Object.keys(defs).length > 0) {
		if (ctx.target === "draft-2020-12") result.$defs = defs;
		else result.definitions = defs;
	}
	try {
		const finalized = JSON.parse(JSON.stringify(result));
		Object.defineProperty(finalized, "~standard", {
			value: {
				...schema["~standard"],
				jsonSchema: {
					input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
					output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
				}
			},
			enumerable: false,
			writable: false
		});
		return finalized;
	} catch (_err) {
		throw new Error("Error converting schema to JSON.");
	}
}
function isTransforming(_schema, _ctx) {
	const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
	if (ctx.seen.has(_schema)) return false;
	ctx.seen.add(_schema);
	const def = _schema._zod.def;
	if (def.type === "transform") return true;
	if (def.type === "array") return isTransforming(def.element, ctx);
	if (def.type === "set") return isTransforming(def.valueType, ctx);
	if (def.type === "lazy") return isTransforming(def.getter(), ctx);
	if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault" || def.type === "catch") return isTransforming(def.innerType, ctx);
	if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
	if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
	if (def.type === "pipe") {
		if (_schema._zod.traits.has("$ZodCodec")) return true;
		return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
	}
	if (def.type === "object") {
		for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
		return false;
	}
	if (def.type === "union") {
		for (const option of def.options) if (isTransforming(option, ctx)) return true;
		return false;
	}
	if (def.type === "tuple") {
		for (const item of def.items) if (isTransforming(item, ctx)) return true;
		if (def.rest && isTransforming(def.rest, ctx)) return true;
		return false;
	}
	return false;
}
/**
* Creates a toJSONSchema method for a schema instance.
* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
*/
const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
	const ctx = initializeContext({
		...params,
		processors
	});
	processSchema(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};
const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
	const { libraryOptions, target } = params ?? {};
	const ctx = initializeContext({
		...libraryOptions ?? {},
		target,
		io,
		processors
	});
	processSchema(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};
//#endregion
//#region ../../node_modules/zod/v4/core/json-schema-processors.js
const narrowMin = (agg, key, value) => {
	if (agg[key] === void 0 || value > agg[key]) agg[key] = value;
};
const narrowMax = (agg, key, value) => {
	if (agg[key] === void 0 || value < agg[key]) agg[key] = value;
};
const narrowBoth = (agg, value) => {
	narrowMin(agg, "minimum", value);
	narrowMax(agg, "maximum", value);
};
const addDivisor = (agg, value) => {
	agg.multipleOf ?? (agg.multipleOf = []);
	if (!agg.multipleOf.includes(value)) agg.multipleOf.push(value);
};
const addPattern = (agg, pattern) => {
	agg.patterns ?? (agg.patterns = /* @__PURE__ */ new Set());
	agg.patterns.add(pattern);
};
const intersectMime = (agg, mime) => {
	agg.mime = agg.mime ? agg.mime.filter((m) => mime.includes(m)) : [...mime];
};
const setFormat = (agg, format) => {
	agg.format = format;
	if (format.includes("int")) agg.isInt = true;
};
const minContributor = (agg, def) => narrowMin(agg, "minimum", def.minimum);
const maxContributor = (agg, def) => narrowMax(agg, "maximum", def.maximum);
const formatContributor = (ranges) => (agg, def) => {
	setFormat(agg, def.format);
	const [minimum, maximum] = ranges[def.format];
	narrowMin(agg, "minimum", minimum);
	narrowMax(agg, "maximum", maximum);
};
const contributors = {
	greater_than: (agg, def) => narrowMin(agg, def.inclusive ? "minimum" : "exclusiveMinimum", def.value),
	less_than: (agg, def) => narrowMax(agg, def.inclusive ? "maximum" : "exclusiveMaximum", def.value),
	multiple_of: (agg, def) => addDivisor(agg, def.value),
	number_format: formatContributor(NUMBER_FORMAT_RANGES),
	bigint_format: formatContributor(BIGINT_FORMAT_RANGES),
	min_length: minContributor,
	max_length: maxContributor,
	length_equals: (agg, def) => narrowBoth(agg, def.length),
	min_size: minContributor,
	max_size: maxContributor,
	size_equals: (agg, def) => narrowBoth(agg, def.size),
	string_format: (agg, def) => {
		setFormat(agg, def.format);
		if (def.pattern) addPattern(agg, def.pattern);
		if (def.format === "base64" || def.format === "base64url") agg.contentEncoding = def.format;
		if (def.local || def.precision === -1) agg.laxFormat = true;
	},
	mime_type: (agg, def) => intersectMime(agg, def.mime)
};
function aggregateChecks(schema) {
	const agg = {};
	const def = schema._zod.def;
	const list = schema._zod.traits.has("$ZodCheck") ? [schema, ...def.checks ?? []] : def.checks ?? [];
	for (const ch of list) contributors[ch._zod.def.check]?.(agg, ch._zod.def);
	const bag = schema._zod.bag;
	if (bag.minimum !== void 0) narrowMin(agg, "minimum", bag.minimum);
	if (bag.exclusiveMinimum !== void 0) narrowMin(agg, "exclusiveMinimum", bag.exclusiveMinimum);
	if (bag.maximum !== void 0) narrowMax(agg, "maximum", bag.maximum);
	if (bag.exclusiveMaximum !== void 0) narrowMax(agg, "exclusiveMaximum", bag.exclusiveMaximum);
	if (bag.multipleOf !== void 0) addDivisor(agg, bag.multipleOf);
	if (bag.format !== void 0) {
		agg.format ?? (agg.format = bag.format);
		if (bag.format.includes("int")) agg.isInt = true;
	}
	if (bag.mime) intersectMime(agg, bag.mime);
	for (const pattern of bag.patterns ?? []) addPattern(agg, pattern);
	return agg;
}
const formatMap = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
};
const exactPatterns = /* @__PURE__ */ new Map([[base64Charset, base64], [base64urlCharset, base64url]]);
const exactPattern = (p) => exactPatterns.get(p) ?? p;
const stringProcessor = (schema, ctx, _json, _params) => {
	const json = _json;
	json.type = "string";
	const { minimum, maximum, format, patterns, contentEncoding, laxFormat } = aggregateChecks(schema);
	if (typeof minimum === "number") json.minLength = minimum;
	if (typeof maximum === "number") json.maxLength = maximum;
	if (format) {
		json.format = formatMap[format] ?? format;
		if (json.format === "") delete json.format;
		if (format === "time" || laxFormat) delete json.format;
	}
	if (contentEncoding) json.contentEncoding = contentEncoding;
	if (patterns && patterns.size > 0) {
		const patternList = [...patterns].map(exactPattern);
		if (patternList.length === 1) json.pattern = patternList[0].source;
		else if (patternList.length > 1) json.allOf = [...patternList.map((regex) => ({
			...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: regex.source
		}))];
	}
};
const numberProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const { minimum, maximum, multipleOf, exclusiveMaximum, exclusiveMinimum, isInt } = aggregateChecks(schema);
	json.type = isInt ? "integer" : "number";
	const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
	const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
	const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
	if (exMin) {
		if (legacy) {
			json.minimum = exclusiveMinimum;
			json.exclusiveMinimum = true;
		} else json.exclusiveMinimum = exclusiveMinimum;
	} else if (typeof minimum === "number") json.minimum = minimum;
	if (exMax) {
		if (legacy) {
			json.maximum = exclusiveMaximum;
			json.exclusiveMaximum = true;
		} else json.exclusiveMaximum = exclusiveMaximum;
	} else if (typeof maximum === "number") json.maximum = maximum;
	if (multipleOf) {
		const divisors = /* @__PURE__ */ new Set();
		for (const divisor of multipleOf) if (Number.isFinite(divisor) && divisor !== 0) divisors.add(Math.abs(divisor));
		else handleUnrepresentable(schema, ctx, json, params, `A multipleOf divisor of ${divisor} cannot be represented in JSON Schema`);
		const [first, ...rest] = divisors;
		if (first !== void 0) json.multipleOf = first;
		if (rest.length) json.allOf = [...json.allOf ?? [], ...rest.map((m) => ({ multipleOf: m }))];
	}
};
const booleanProcessor = (_schema, _ctx, json, _params) => {
	json.type = "boolean";
};
const neverProcessor = (_schema, _ctx, json, _params) => {
	json.not = {};
};
const enumProcessor = (schema, _ctx, json, _params) => {
	const def = schema._zod.def;
	const values = getEnumValues(def.entries);
	if (values.length === 0) {
		json.not = {};
		return;
	}
	if (values.every((v) => typeof v === "number")) json.type = "number";
	if (values.every((v) => typeof v === "string")) json.type = "string";
	json.enum = values;
};
const literalProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	if (def.values.length === 0) {
		json.not = {};
		return;
	}
	const vals = [];
	for (const val of def.values) if (val === void 0) {
		if (handleUnrepresentable(schema, ctx, json, params, "Literal `undefined` cannot be represented in JSON Schema")) return;
	} else if (typeof val === "bigint") {
		if (handleUnrepresentable(schema, ctx, json, params, "BigInt literals cannot be represented in JSON Schema")) return;
		vals.push(Number(val));
	} else vals.push(val);
	if (vals.length === 0) {} else if (vals.length === 1) {
		const val = vals[0];
		json.type = val === null ? "null" : typeof val;
		if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
		else json.const = val;
	} else {
		if (vals.every((v) => typeof v === "number")) json.type = "number";
		if (vals.every((v) => typeof v === "string")) json.type = "string";
		if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
		if (vals.every((v) => v === null)) json.type = "null";
		json.enum = vals;
	}
};
const customProcessor = (schema, ctx, json, params) => {
	handleUnrepresentable(schema, ctx, json, params, "Custom types cannot be represented in JSON Schema");
};
const transformProcessor = (schema, ctx, json, params) => {
	handleUnrepresentable(schema, ctx, json, params, "Transforms cannot be represented in JSON Schema");
};
const arrayProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	const { minimum, maximum } = aggregateChecks(schema);
	if (typeof minimum === "number") json.minItems = minimum;
	if (typeof maximum === "number") json.maxItems = maximum;
	json.type = "array";
	json.items = processSchema(def.element, ctx, {
		...params,
		path: [...params.path, "items"]
	});
};
function inputOptin(schema) {
	const def = schema._zod.def;
	if (def.type === "pipe" && def.in._zod.traits.has("$ZodTransform")) return inputOptin(def.out);
	if (def.type === "catch") return inputOptin(def.innerType);
	return schema._zod.optin;
}
const objectProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	const shape = def.shape;
	if (Object.getOwnPropertySymbols(shape).length && handleUnrepresentable(schema, ctx, json, params, "Symbol keys cannot be represented in JSON Schema")) return;
	json.type = "object";
	json.properties = {};
	for (const key in shape) assignProp(json.properties, key, processSchema(shape[key], ctx, {
		...params,
		path: [
			...params.path,
			"properties",
			key
		]
	}));
	const allKeys = new Set(Object.keys(shape));
	const requiredKeys = new Set([...allKeys].filter((key) => {
		const field = def.shape[key];
		if (ctx.io === "input") return inputOptin(field) === void 0;
		else return field._zod.optout === void 0;
	}));
	if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
	if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
	else if (!def.catchall) {
		if (ctx.io === "output") json.additionalProperties = false;
	} else if (def.catchall) json.additionalProperties = processSchema(def.catchall, ctx, {
		...params,
		path: [...params.path, "additionalProperties"]
	});
};
const unionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const isExclusive = def.inclusive === false;
	const options = def.options.map((x, i) => processSchema(x, ctx, {
		...params,
		path: [
			...params.path,
			isExclusive ? "oneOf" : "anyOf",
			i
		]
	}));
	if (isExclusive) json.oneOf = options;
	else json.anyOf = options;
};
const intersectionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const a = processSchema(def.left, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			0
		]
	});
	const b = processSchema(def.right, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			1
		]
	});
	const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
	const allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
	json.allOf = allOf;
	ctx.intersections.push(allOf);
};
const nullableProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const inner = processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	if (ctx.target === "openapi-3.0") {
		seen.ref = def.innerType;
		json.nullable = true;
	} else json.anyOf = [inner, { type: "null" }];
};
const nonoptionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};
/** Round-trips a default value through JSON so the emitted schema is guaranteed to be valid JSON.
* A BigInt has no reliable encoding, so it goes through `unrepresentable` like any other
* unrepresentable value. Returns a sentinel when the caller must not write a default of its own. */
const UNREPRESENTABLE_DEFAULT = Symbol();
function serializeDefaultValue(value, schema, ctx, json, params) {
	let unrepresentable = false;
	const serialized = JSON.stringify(value, (_, val) => {
		if (typeof val !== "bigint") return val;
		unrepresentable = true;
		return null;
	});
	if (!unrepresentable) return JSON.parse(serialized);
	handleUnrepresentable(schema, ctx, json, params, "BigInt defaults cannot be represented in JSON Schema");
	return UNREPRESENTABLE_DEFAULT;
}
const defaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
	if (value !== UNREPRESENTABLE_DEFAULT) json.default = value;
};
const prefaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	if (ctx.io !== "input") return;
	const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
	if (value !== UNREPRESENTABLE_DEFAULT) json._prefault = value;
};
const catchProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	let catchValue;
	try {
		catchValue = def.catchValue(void 0);
	} catch {
		handleUnrepresentable(schema, ctx, json, params, "Dynamic catch values are not supported in JSON Schema");
		return;
	}
	json.default = catchValue;
};
const pipeProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	const inIsTransform = def.in._zod.traits.has("$ZodTransform");
	const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
	processSchema(innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = innerType;
};
const readonlyProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	json.readOnly = true;
};
const optionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	processSchema(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};
//#endregion
//#region ../../node_modules/zod/v4/classic/errors.js
const _installedErrorProtos = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function _lazyMethod(proto, key, make) {
	Object.defineProperty(proto, key, {
		configurable: true,
		enumerable: false,
		get() {
			const value = make(this);
			Object.defineProperty(this, key, {
				value,
				configurable: true,
				writable: true
			});
			return value;
		},
		set(value) {
			Object.defineProperty(this, key, {
				value,
				configurable: true,
				writable: true
			});
		}
	});
}
const initializer = (inst, issues) => {
	$ZodError.init(inst, issues);
	inst.name = "ZodError";
	const proto = Object.getPrototypeOf(inst);
	if (_installedErrorProtos.has(proto)) return;
	_installedErrorProtos.add(proto);
	_lazyMethod(proto, "format", (self) => (mapper) => formatError(self, mapper));
	_lazyMethod(proto, "flatten", (self) => (mapper) => flattenError(self, mapper));
	_lazyMethod(proto, "addIssue", (self) => (issue) => {
		self.issues.push(issue);
		self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
	});
	_lazyMethod(proto, "addIssues", (self) => (issues) => {
		self.issues.push(...issues);
		self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
	});
	Object.defineProperty(proto, "isEmpty", {
		configurable: true,
		enumerable: false,
		get() {
			return this.issues.length === 0;
		}
	});
};
const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, void 0, { Parent: Error });
//#endregion
//#region ../../node_modules/zod/v4/classic/parse.js
const parse = /* @__PURE__ */ _parse(ZodRealError);
const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
const encode = /* @__PURE__ */ _encode(ZodRealError);
const decode = /* @__PURE__ */ _decode(ZodRealError);
const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
//#endregion
//#region ../../node_modules/zod/v4/classic/schemas.js
function _ensureDefaultLocale() {
	if (!globalConfig.localeError) config(en_default());
}
function _ensureDefaultMemoizer() {
	if (!globalConfig.memoizer) config({ memoizer: memoizer() });
}
const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
	_ensureDefaultLocale();
	$ZodType.init(inst, def);
	inst.def = def;
	inst.type = def.type;
	return inst;
}, {
	check(...chks) {
		const def = this.def;
		return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
			check: ch,
			def: { check: "custom" },
			onattach: []
		} } : ch)] }), { parent: true });
	},
	with(...chks) {
		return this.check(...chks);
	},
	clone(def, params) {
		return clone(this, def, params);
	},
	brand() {
		return this;
	},
	register(reg, meta) {
		reg.add(this, meta);
		return this;
	},
	refine(check, params) {
		return this.check(refine(check, params));
	},
	superRefine(refinement, params) {
		return this.check(superRefine(refinement, params));
	},
	overwrite(fn) {
		return this.check(/* @__PURE__ */ _overwrite(fn));
	},
	optional() {
		return optional(this);
	},
	exactOptional() {
		return exactOptional(this);
	},
	nullable() {
		return nullable(this);
	},
	nullish() {
		return optional(nullable(this));
	},
	nonoptional(params) {
		return nonoptional(this, params);
	},
	array() {
		return array(this);
	},
	or(arg) {
		return union([this, arg]);
	},
	and(arg) {
		return intersection(this, arg);
	},
	transform(tx) {
		return pipe(this, transform(tx));
	},
	default(d) {
		return _default(this, d);
	},
	prefault(d) {
		return prefault(this, d);
	},
	catch(params) {
		return _catch(this, params);
	},
	pipe(target) {
		return pipe(this, target);
	},
	readonly() {
		return readonly(this);
	},
	describe(description) {
		const cl = this.clone();
		globalRegistry.add(cl, { description });
		return cl;
	},
	meta(...args) {
		if (args.length === 0) return globalRegistry.get(this);
		const cl = this.clone();
		globalRegistry.add(cl, args[0]);
		return cl;
	},
	isOptional() {
		return this.safeParse(void 0).success;
	},
	isNullable() {
		return this.safeParse(null).success;
	},
	apply(fn, ...args) {
		return args.length === 0 ? fn(this) : fn(this, ...args);
	},
	get "~standard"() {
		return hide(this, "~standard", {
			...standardProps(this),
			jsonSchema: {
				input: createStandardJSONSchemaMethod(this, "input"),
				output: createStandardJSONSchemaMethod(this, "output")
			}
		});
	},
	set "~standard"(value) {
		own(this, "~standard", value);
	},
	parse: function _parse(data, params) {
		return parse(this, data, params, { callee: _parse });
	},
	parseAsync: async function _parseAsync(data, params) {
		return await parseAsync(this, data, params, { callee: _parseAsync });
	},
	safeParse(data, params) {
		return safeParse(this, data, params);
	},
	async safeParseAsync(data, params) {
		return safeParseAsync(this, data, params);
	},
	get spa() {
		return this?.safeParseAsync;
	},
	set spa(value) {
		own(this, "spa", value);
	},
	validate(data, params) {
		return validate(this, data, params);
	},
	validateAsync(data, params) {
		return validateAsync$1(this, data, params);
	},
	encode: function _encode(data, params) {
		return encode(this, data, params, { callee: _encode });
	},
	decode: function _decode(data, params) {
		return decode(this, data, params, { callee: _decode });
	},
	encodeAsync: async function _encodeAsync(data, params) {
		return await encodeAsync(this, data, params, { callee: _encodeAsync });
	},
	decodeAsync: async function _decodeAsync(data, params) {
		return await decodeAsync(this, data, params, { callee: _decodeAsync });
	},
	safeEncode(data, params) {
		return safeEncode(this, data, params);
	},
	safeDecode(data, params) {
		return safeDecode(this, data, params);
	},
	async safeEncodeAsync(data, params) {
		return safeEncodeAsync(this, data, params);
	},
	async safeDecodeAsync(data, params) {
		return safeDecodeAsync(this, data, params);
	},
	toJSONSchema(params) {
		return createToJSONSchemaMethod(this, {})(params);
	},
	get description() {
		return globalRegistry.get(this)?.description;
	},
	get _def() {
		return this._zod.def;
	}
});
/** @internal */
const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
}, /*@__PURE__*/ derived({
	format: (inst) => aggregateChecks(inst).format ?? null,
	minLength: (inst) => aggregateChecks(inst).minimum ?? null,
	maxLength: (inst) => aggregateChecks(inst).maximum ?? null
}, {
	regex(...args) {
		return this.check(/* @__PURE__ */ _regex(...args));
	},
	includes(...args) {
		return this.check(/* @__PURE__ */ _includes(...args));
	},
	startsWith(...args) {
		return this.check(/* @__PURE__ */ _startsWith(...args));
	},
	endsWith(...args) {
		return this.check(/* @__PURE__ */ _endsWith(...args));
	},
	min(...args) {
		return this.check(/* @__PURE__ */ _minLength(...args));
	},
	max(...args) {
		return this.check(/* @__PURE__ */ _maxLength(...args));
	},
	length(...args) {
		return this.check(/* @__PURE__ */ _length(...args));
	},
	nonempty(...args) {
		return this.check(/* @__PURE__ */ _minLength(1, ...args));
	},
	lowercase(params) {
		return this.check(/* @__PURE__ */ _lowercase(params));
	},
	uppercase(params) {
		return this.check(/* @__PURE__ */ _uppercase(params));
	},
	trim() {
		return this.check(/* @__PURE__ */ _trim());
	},
	normalize(...args) {
		return this.check(/* @__PURE__ */ _normalize(...args));
	},
	toLowerCase() {
		return this.check(/* @__PURE__ */ _toLowerCase());
	},
	toUpperCase() {
		return this.check(/* @__PURE__ */ _toUpperCase());
	},
	slugify() {
		return this.check(/* @__PURE__ */ _slugify());
	}
}));
const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	_ZodString.init(inst, def);
}, {
	email(params) {
		return this.check(/* @__PURE__ */ _email(ZodEmail, params));
	},
	url(params) {
		return this.check(/* @__PURE__ */ _url(ZodURL, params));
	},
	jwt(params) {
		return this.check(/* @__PURE__ */ _jwt(ZodJWT, params));
	},
	emoji(params) {
		return this.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
	},
	guid(params) {
		return this.check(/* @__PURE__ */ _guid(ZodGUID, params));
	},
	uuid(params) {
		return this.check(/* @__PURE__ */ _uuid(ZodUUID, params));
	},
	uuidv4(params) {
		return this.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
	},
	uuidv6(params) {
		return this.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
	},
	uuidv7(params) {
		return this.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
	},
	nanoid(params) {
		return this.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
	},
	cuid(params) {
		return this.check(/* @__PURE__ */ _cuid(ZodCUID, params));
	},
	cuid2(params) {
		return this.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
	},
	ulid(params) {
		return this.check(/* @__PURE__ */ _ulid(ZodULID, params));
	},
	base64(params) {
		return this.check(/* @__PURE__ */ _base64(ZodBase64, params));
	},
	base64url(params) {
		return this.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
	},
	xid(params) {
		return this.check(/* @__PURE__ */ _xid(ZodXID, params));
	},
	ksuid(params) {
		return this.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
	},
	ipv4(params) {
		return this.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
	},
	ipv6(params) {
		return this.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
	},
	cidrv4(params) {
		return this.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
	},
	cidrv6(params) {
		return this.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
	},
	e164(params) {
		return this.check(/* @__PURE__ */ _e164(ZodE164, params));
	},
	datetime(params) {
		return this.check(/* @__PURE__ */ _isoDateTime(ZodISODateTime, params));
	},
	date(params) {
		return this.check(/* @__PURE__ */ _isoDate(ZodISODate, params));
	},
	time(params) {
		return this.check(/* @__PURE__ */ _isoTime(ZodISOTime, params));
	},
	duration(params) {
		return this.check(/* @__PURE__ */ _isoDuration(ZodISODuration, params));
	}
});
function string(params) {
	return /* @__PURE__ */ _string(ZodString, params);
}
const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	_ZodString.init(inst, def);
});
const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
	$ZodISODateTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
	$ZodISODate.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
	$ZodISOTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
	$ZodISODuration.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
	$ZodEmail.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
	$ZodGUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
	$ZodUUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
	$ZodURL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
	$ZodEmoji.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
	$ZodNanoID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
* See https://github.com/paralleldrive/cuid.
*/
const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
	$ZodCUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
	$ZodCUID2.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
	$ZodULID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
	$ZodXID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
	$ZodKSUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
	$ZodIPv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
	$ZodIPv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
	$ZodCIDRv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
	$ZodCIDRv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
	$ZodBase64.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
	$ZodBase64URL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
	$ZodE164.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
	$ZodJWT.init(inst, def);
	ZodStringFormat.init(inst, def);
});
const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
	$ZodNumber.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
	inst.isFinite = true;
}, /*@__PURE__*/ derived({
	minValue: (inst) => {
		const { minimum, exclusiveMinimum } = aggregateChecks(inst);
		return Math.max(minimum ?? Number.NEGATIVE_INFINITY, exclusiveMinimum ?? Number.NEGATIVE_INFINITY);
	},
	maxValue: (inst) => {
		const { maximum, exclusiveMaximum } = aggregateChecks(inst);
		return Math.min(maximum ?? Number.POSITIVE_INFINITY, exclusiveMaximum ?? Number.POSITIVE_INFINITY);
	},
	isInt: (inst) => {
		const { isInt, multipleOf } = aggregateChecks(inst);
		return !!isInt || !!multipleOf?.some(Number.isSafeInteger);
	},
	format: (inst) => aggregateChecks(inst).format ?? null
}, {
	gt(value, params) {
		return this.check(/* @__PURE__ */ _gt(value, params));
	},
	gte(value, params) {
		return this.check(/* @__PURE__ */ _gte(value, params));
	},
	min(value, params) {
		return this.check(/* @__PURE__ */ _gte(value, params));
	},
	lt(value, params) {
		return this.check(/* @__PURE__ */ _lt(value, params));
	},
	lte(value, params) {
		return this.check(/* @__PURE__ */ _lte(value, params));
	},
	max(value, params) {
		return this.check(/* @__PURE__ */ _lte(value, params));
	},
	int(params) {
		return this.check(int(params));
	},
	safe(params) {
		return this.check(int(params));
	},
	positive(params) {
		return this.check(/* @__PURE__ */ _gt(0, params));
	},
	nonnegative(params) {
		return this.check(/* @__PURE__ */ _gte(0, params));
	},
	negative(params) {
		return this.check(/* @__PURE__ */ _lt(0, params));
	},
	nonpositive(params) {
		return this.check(/* @__PURE__ */ _lte(0, params));
	},
	multipleOf(value, params) {
		return this.check(/* @__PURE__ */ _multipleOf(value, params));
	},
	step(value, params) {
		return this.check(/* @__PURE__ */ _multipleOf(value, params));
	},
	finite() {
		return this;
	}
}));
function number(params) {
	return /* @__PURE__ */ _number(ZodNumber, params);
}
const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
	$ZodNumberFormat.init(inst, def);
	ZodNumber.init(inst, def);
});
function int(params) {
	return /* @__PURE__ */ _int(ZodNumberFormat, params);
}
const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
	$ZodBoolean.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
});
function boolean(params) {
	return /* @__PURE__ */ _boolean(ZodBoolean, params);
}
const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
	$ZodUnknown.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => void 0;
});
function unknown() {
	return /* @__PURE__ */ _unknown(ZodUnknown);
}
const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
	$ZodNever.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
	return /* @__PURE__ */ _never(ZodNever, params);
}
const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodArray.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
	inst.element = def.element;
}, {
	min(n, params) {
		return this.check(/* @__PURE__ */ _minLength(n, params));
	},
	nonempty(params) {
		return this.check(/* @__PURE__ */ _minLength(1, params));
	},
	max(n, params) {
		return this.check(/* @__PURE__ */ _maxLength(n, params));
	},
	length(n, params) {
		return this.check(/* @__PURE__ */ _length(n, params));
	},
	unwrap() {
		return this.element;
	}
});
function array(element, params) {
	return /* @__PURE__ */ _array(ZodArray, element, params);
}
const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodObjectJIT.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
	installLazyProp(inst, "shape", (self) => self._zod.def.shape, false);
}, {
	keyof() {
		return _enum(Object.keys(this._zod.def.shape));
	},
	catchall(catchall) {
		return this.clone(mergeDefs(this._zod.def, { catchall }));
	},
	passthrough() {
		return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
	},
	loose() {
		return this.clone(mergeDefs(this._zod.def, { catchall: unknown() }));
	},
	strict() {
		return this.clone(mergeDefs(this._zod.def, { catchall: never() }));
	},
	strip() {
		return this.clone(mergeDefs(this._zod.def, { catchall: void 0 }));
	},
	extend(incoming) {
		return extend(this, incoming);
	},
	safeExtend(incoming) {
		return safeExtend(this, incoming);
	},
	merge(other) {
		return merge(this, other);
	},
	pick(mask) {
		return pick(this, mask);
	},
	omit(mask) {
		return omit(this, mask);
	},
	partial(...args) {
		return partial(ZodOptional, this, args[0]);
	},
	exactPartial(...args) {
		return partial(ZodExactOptional, this, args[0], "exactPartial");
	},
	required(...args) {
		return required(ZodNonOptional, this, args[0]);
	}
});
function object(shape, params) {
	const def = {
		type: "object",
		shape: shape ?? {},
		...normalizeParams(params)
	};
	return new ZodObject(def);
}
const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
	$ZodUnion.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
	inst.options = def.options;
});
function union(options, params) {
	return new ZodUnion({
		type: "union",
		options,
		...normalizeParams(params)
	});
}
const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
	$ZodIntersection.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
	return new ZodIntersection({
		type: "intersection",
		left,
		right
	});
}
const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
	$ZodEnum.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
	inst.enum = def.entries;
	inst.options = [...inst._zod.values];
	const keys = new Set(Object.keys(def.entries));
	inst.extract = (values, params) => {
		const newEntries = {};
		for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
	inst.exclude = (values, params) => {
		const newEntries = { ...def.entries };
		for (const value of values) if (keys.has(value)) delete newEntries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
});
function _enum(values, params) {
	const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
	return new ZodEnum({
		type: "enum",
		entries,
		...normalizeParams(params)
	});
}
const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
	$ZodLiteral.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
	inst.values = new Set(def.values);
	Object.defineProperty(inst, "value", { get() {
		if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return def.values[0];
	} });
});
function literal(value, params) {
	return new ZodLiteral({
		type: "literal",
		values: Array.isArray(value) ? value : [value],
		...normalizeParams(params)
	});
}
const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
	_ensureDefaultMemoizer();
	$ZodTransform.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
	inst._zod.parse = (payload, _ctx) => {
		if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		payload.addIssue = (issue$1) => {
			if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
			else {
				const _issue = issue$1;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				if (!("input" in _issue)) _issue.input = payload.value;
				_issue.inst ?? (_issue.inst = inst);
				payload.issues.push(issue(_issue));
			}
		};
		const output = def.transform(payload.value, payload);
		if (output instanceof Promise) return output.then((output) => {
			payload.value = output;
			return payload;
		});
		payload.value = output;
		return payload;
	};
});
function transform(fn) {
	return new ZodTransform({
		type: "transform",
		transform: fn
	});
}
const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
	return new ZodOptional({
		type: "optional",
		innerType
	});
}
const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
	$ZodExactOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
	return new ZodExactOptional({
		type: "optional",
		innerType
	});
}
const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
	$ZodNullable.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
	return new ZodNullable({
		type: "nullable",
		innerType
	});
}
const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
	$ZodDefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
	return new ZodDefault({
		type: "default",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
	$ZodPrefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
	return new ZodPrefault({
		type: "prefault",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
	$ZodNonOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
	return new ZodNonOptional({
		type: "nonoptional",
		innerType,
		...normalizeParams(params)
	});
}
const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
	$ZodCatch.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
	return new ZodCatch({
		type: "catch",
		innerType,
		catchValue: typeof catchValue === "function" ? catchValue : constantCatch(catchValue)
	});
}
const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
	$ZodPipe.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
	inst.in = def.in;
	inst.out = def.out;
});
function pipe(in_, out) {
	return new ZodPipe({
		type: "pipe",
		in: in_,
		out
	});
}
const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
	$ZodReadonly.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
	return new ZodReadonly({
		type: "readonly",
		innerType
	});
}
const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
	$ZodCustom.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
	return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
	return /* @__PURE__ */ _superRefine(fn, params);
}
//#endregion
//#region src/spec.ts
/**
* Durable storage-domain declaration for white-box audit mode: the per-repo
* audit graph plus the durable multi-repo batch control plane.
*
* One scan (per repository worker session) starts at **scan-1**; the audit
* advances along a chain — a scan spawns **intents**, an intent yields
* **facts**, a fact derives a new intent, and an intent proves a **finding**
* (vulnerability with a code evidence chain). Facts also carry a `flows_to`
* edge between an upstream and downstream fact for taint propagation.
* **Assets** (repo / module / file / entrypoint / package / datastore) form a
* second, parent-linked graph. **Skills** are the per-scan minimal snapshot
* of a registered user audit methodology's checks — they never join the
* `edges` graph; intents reference a skill/check by id so a check with no
* intent yet still exists as `todo`. Every graph relationship is an explicit
* **edge** row, so both graphs are fully reconstructible.
*
* The batch control plane (`batches`/`scan_jobs`/`job_events`/
* `report_artifacts`) is declared now — at domain `version: 2` from the
* start — so the durable schema never needs a breaking bump once M5 fills it
* in; its fields track docs/architecture.md §2 at outline depth and may
* still grow.
*
* Everything single-repo is scoped to one session: every record carries the
* owning `sessionId`. Record schemas are zod; the domain schema validates
* every stored record at the durable boundary (the storage-domain facility
* is the package's guard, so no separate event invariant companion is
* needed for referential shape — cross-table reference *existence* is still
* checked by the store, see store.ts).
* @module @tangxiaofeng7/dsh-sast-host/src/spec
*/
/** Kind of a recorded code fact / taint-chain element. */
const sastFactKindSchema = _enum([
	"source",
	"sink",
	"sanitizer",
	"route",
	"config",
	"dependency",
	"secret",
	"pattern",
	"info"
]);
/** Severity of a vulnerability finding. */
const sastSeveritySchema = _enum([
	"critical",
	"high",
	"medium",
	"low",
	"info"
]);
/** Vulnerability class of a finding. */
const sastVulnClassSchema = _enum([
	"injection",
	"xss",
	"deserialization",
	"path-traversal",
	"ssrf",
	"auth",
	"access-control",
	"crypto",
	"secret",
	"config",
	"dependency",
	"dos",
	"logic",
	"other"
]);
/** Lifecycle status of an audit intent; monotonic (`done` never reverts). */
const sastIntentStatusSchema = _enum([
	"pending",
	"running",
	"done",
	"blocked"
]);
/** Category grouping for an audit intent. */
const sastIntentCategorySchema = _enum([
	"recon",
	"attack-surface",
	"taint",
	"config",
	"dependency",
	"verify",
	"custom"
]);
/** Triage status of a finding. */
const sastFindingStatusSchema = _enum([
	"open",
	"confirmed",
	"false-positive",
	"wont-fix"
]);
/** Kind of a recorded code asset. */
const sastAssetTypeSchema = _enum([
	"repo",
	"module",
	"file",
	"entrypoint",
	"package",
	"datastore"
]);
/** Kind of an audit/asset graph edge. */
const sastEdgeKindSchema = _enum([
	"spawns",
	"yields",
	"derived_from",
	"proves",
	"flows_to",
	"parent"
]);
/** Repository hosting provider. */
const sastProviderSchema = _enum([
	"gitlab",
	"github",
	"local"
]);
/** Trust/origin grouping of a registered audit methodology Skill. */
const sastSkillSourceGroupSchema = _enum([
	"builtin",
	"workspace",
	"user"
]);
/** Origin of a recorded fact: v1 is always `llm`; reserved for external engines (ADR-06). */
const sastFactSourceSchema = _enum(["llm", "engine"]);
/** Non-empty id. */
const id = string().min(1);
/** One hop of a finding's code evidence chain. */
const sastCodePathHopSchema = object({
	path: string().min(1),
	line: number().int().min(0).optional(),
	lineAdjusted: boolean().optional(),
	symbol: string().optional(),
	note: string().optional()
});
/** The minimal per-scan snapshot of one registered audit methodology check. */
const sastSkillCheckSchema = object({
	id: string().min(1),
	title: string().min(1),
	scope: array(string()).default([])
});
/** The current scan for a repository worker session: one per session, reset by the next scan. */
const sastScanSchema = object({
	id,
	sessionId: id,
	provider: sastProviderSchema,
	/** Redacted repository URL (or absolute local path for `provider: 'local'`); userinfo/token query params stripped before storage (ADR-07). */
	repoUrl: string(),
	branch: string().default(""),
	commit: string().default(""),
	workspacePath: string(),
	objective: string(),
	scope: array(string()).default([]),
	/** Declarative authorization note (audit target / written-permission reference); recorded as an auditable fact, not a gate. */
	authorization: string().default(""),
	languages: array(string()).default([]),
	fileCount: number().int().min(0).default(0),
	/** Present only when this scan runs as a batch job (repository worker). */
	batchId: id.optional(),
	jobId: id.optional()
});
/** The per-scan minimal snapshot of a registered user audit methodology. */
const sastSkillSchema = object({
	id,
	sessionId: id,
	title: string().min(1),
	/** Raw DSH Skill `source` this snapshot was resolved from (e.g. `project-dsh`, `user-dsh`, `bundled`). */
	source: string(),
	sourceGroup: sastSkillSourceGroupSchema,
	provider: string(),
	category: sastIntentCategorySchema.default("custom"),
	applicability: object({
		languages: array(string()).default([]),
		frameworks: array(string()).default([]),
		paths: array(string()).default([])
	}).default({
		languages: [],
		frameworks: [],
		paths: []
	}),
	checks: array(sastSkillCheckSchema).min(1).max(256),
	enabled: boolean().default(true),
	/** sha256 of the normalized methodology definition; same-name+same-digest registration is idempotent. */
	manifestDigest: string().min(1)
});
/** One audit intent (what to verify / pursue next). Anchor edges (`spawns`/`derived_from`) live only in `edges`. */
const sastIntentSchema = object({
	id,
	sessionId: id,
	title: string().min(1),
	detail: string().default(""),
	category: sastIntentCategorySchema.default("custom"),
	scope: array(string()).default([]),
	status: sastIntentStatusSchema.default("pending"),
	note: string().default(""),
	delegatedSessionId: id.optional(),
	/** Driving methodology check, when this intent traces to one (ADR-14). */
	skillId: id.optional(),
	checkId: string().optional(),
	/** Store-injected clock timestamps (ms epoch); never trusted from model input (ADR-10). */
	createdAt: number(),
	startedAt: number().optional(),
	endedAt: number().optional()
});
/** One recorded code fact (evidence) yielded by an intent. */
const sastFactSchema = object({
	id,
	sessionId: id,
	/** Yielding intent (source of the `yields` edge). */
	intentId: id,
	kind: sastFactKindSchema,
	path: string().min(1),
	line: number().int().min(0).default(0),
	endLine: number().int().min(0).optional(),
	lineAdjusted: boolean().default(false),
	symbol: string().optional(),
	detail: string().min(1),
	/** Full code snippet (durable layer only; ≤2000 chars, enforced by the store before write). */
	snippet: string().max(2e3).optional(),
	confidence: number().min(0).max(1).default(.5),
	source: sastFactSourceSchema.default("llm"),
	engineRule: string().default(""),
	at: number()
});
/** One vulnerability finding proved by an intent, with a code evidence chain. */
const sastFindingSchema = object({
	id,
	sessionId: id,
	/** Proving intent (source of the `proves` edge). */
	intentId: id,
	title: string().min(1),
	severity: sastSeveritySchema,
	vulnClass: sastVulnClassSchema.optional(),
	cwe: string().optional(),
	confidence: number().min(0).max(1).default(.5),
	description: string().default(""),
	/** Ordered code evidence chain (min one hop, ADR-03). */
	codePath: array(sastCodePathHopSchema).min(1),
	remediation: string().default(""),
	poc: string().default(""),
	status: sastFindingStatusSchema.default("open"),
	triageReason: string().default(""),
	/** Driving methodology check, when this finding traces to one; omitted for incidental findings. */
	skillId: id.optional(),
	checkId: string().optional(),
	affectedAssetId: id.optional(),
	at: number(),
	triagedAt: number().optional()
});
/** One recorded code asset; parent linkage lives on the `parent` edge row. */
const sastAssetSchema = object({
	id,
	sessionId: id,
	type: sastAssetTypeSchema,
	value: string().min(1),
	meta: string().default(""),
	at: number()
});
/** One graph edge: source → target with a semantic kind. */
const sastEdgeSchema = object({
	id,
	sessionId: id,
	kind: sastEdgeKindSchema,
	sourceId: id,
	targetId: id
});
/** Lifecycle status of a batch. */
const sastBatchStatusSchema = _enum([
	"queued",
	"running",
	"awaiting_review",
	"completed",
	"completed_with_issues"
]);
/** Lifecycle status of one scan job. */
const sastJobStatusSchema = _enum([
	"queued",
	"preparing",
	"running",
	"retry_wait",
	"succeeded",
	"degraded",
	"skipped",
	"failed",
	"timed_out",
	"cancelled"
]);
/** Review disposition of a terminal job awaiting owner confirmation. */
const sastJobReviewStatusSchema = _enum([
	"none",
	"pending",
	"accepted",
	"retried",
	"confirmed-skip"
]);
/** One durable multi-repo audit batch: owner session, fixed methodology references, immutable policy snapshot. */
const sastBatchSchema = object({
	id,
	ownerSessionId: id,
	objective: string(),
	authorization: string().default(""),
	/** User-named methodology references fixed at batch creation (name + manifest/content digest + artifact ref). */
	methodologies: array(object({
		name: string().min(1),
		manifestDigest: string().min(1),
		contentDigest: string().min(1),
		artifactId: id
	})).default([]),
	methodologyMode: _enum([
		"explicit-only",
		"explicit-plus-auto",
		"auto"
	]).default("explicit-only"),
	policy: object({
		maxAttempts: number().int().min(1).default(2),
		cloneTimeoutMs: number().int().min(1).optional(),
		jobTimeoutMs: number().int().min(1).optional(),
		autoNarrowScope: boolean().default(true),
		deduplicate: boolean().default(true),
		/** Fixed at 1 for the durable scheduler (ADR-16); recorded for report provenance, not tunable. */
		concurrency: literal(1).default(1)
	}),
	status: sastBatchStatusSchema.default("queued"),
	total: number().int().min(1).max(100),
	createdAt: number()
});
/** One scan job within a batch; unique on `(batchId, ordinal)`. */
const sastScanJobSchema = object({
	id,
	batchId: id,
	ordinal: number().int().min(1).max(100),
	/** Redacted repo spec (provider/repoUrl/branch/ref/scope/objective); no credentials. */
	repoSpec: object({
		provider: sastProviderSchema,
		repoUrl: string(),
		branch: string().optional(),
		ref: string().optional(),
		scope: array(string()).default([]),
		objective: string().optional()
	}),
	workerSessionId: id.optional(),
	attempt: number().int().min(0).default(0),
	leaseOwner: string().optional(),
	leaseExpiresAt: number().optional(),
	deadlineAt: number().optional(),
	status: sastJobStatusSchema.default("queued"),
	errorClass: string().optional(),
	fallback: string().optional(),
	reviewStatus: sastJobReviewStatusSchema.default("none"),
	reportArtifactId: id.optional(),
	createdAt: number(),
	updatedAt: number()
});
/** One append-only batch/job decision or lifecycle event. */
const sastJobEventSchema = object({
	id,
	batchId: id,
	jobId: id.optional(),
	seq: number().int().min(1),
	kind: string().min(1),
	detail: string().default(""),
	at: number()
});
/** One durable report artifact (per-repo or per-batch Markdown/SARIF/JSON, or a pinned methodology content copy), with a content digest. */
const sastReportArtifactSchema = object({
	id,
	batchId: id.optional(),
	jobId: id.optional(),
	kind: _enum([
		"repo-markdown",
		"repo-sarif",
		"repo-summary",
		"batch-markdown",
		"batch-json",
		"methodology-content"
	]),
	uri: string().min(1),
	sha256: string().min(1),
	bytes: number().int().min(0),
	createdAt: number()
});
/** The whole sast domain: single-repo audit graph (7 tables) + durable batch control plane (4 tables). */
const sastDomainSpec = defineDomain({
	name: "sast",
	version: 2,
	tables: {
		scans: domainTable(sastScanSchema),
		skills: domainTable(sastSkillSchema),
		intents: domainTable(sastIntentSchema),
		facts: domainTable(sastFactSchema),
		findings: domainTable(sastFindingSchema),
		assets: domainTable(sastAssetSchema),
		edges: domainTable(sastEdgeSchema),
		batches: domainTable(sastBatchSchema),
		scan_jobs: domainTable(sastScanJobSchema),
		job_events: domainTable(sastJobEventSchema),
		report_artifacts: domainTable(sastReportArtifactSchema)
	}
});
//#endregion
//#region src/store.ts
/** The record table owning each id kind. */
const TABLE_OF_ID_KIND = {
	scan: "scans",
	intent: "intents",
	fact: "facts",
	finding: "findings",
	asset: "assets",
	edge: "edges"
};
/** Tables whose ids participate in the per-session `<kind>-<n>` sequence. */
const SEQUENCED_TABLES = [
	"intents",
	"facts",
	"findings",
	"assets",
	"edges"
];
/** Every table cleared on scan reset: the graph plus the Skill snapshot list. */
const CLEARED_ON_RESET_TABLES = ["skills", ...SEQUENCED_TABLES];
/** Every Skill may declare at most this many checks (mirrors `spec.ts`'s zod `.max(256)`, enforced again here for defense in depth). */
const MAX_CHECKS_PER_SKILL = 256;
/** A session may register at most this many Skills. */
const MAX_SKILLS_PER_SESSION = 64;
/** A session's Skills may declare at most this many checks in total. */
const MAX_CHECKS_PER_SESSION = 2048;
/** Physical key for a session-local graph node, edge, or Skill snapshot. */
function recordKey(sessionId, id) {
	return `${sessionId}:${id}`;
}
/** Copy and freeze one record before it crosses the service boundary. */
function snapshot(value) {
	return Object.freeze({ ...value });
}
/**
* Owning handle for the lazily opened sast domain. Not a Cordis service: it
* is a private helper owned by the plugin `apply` fiber and disposed with it.
*
* `domain` is an optional shared opener — the sast domain can be opened only
* ONCE per `DomainFacility` (`already-open` otherwise), so when a
* `BatchStore` shares the same context (M5), `index.ts` opens the domain a
* single time and hands both stores the same `() => Promise<Domain>`
* accessor. Omitted (single-repo-only composition, or every existing test),
* this store opens the domain itself exactly as before.
*/
var SastStore = class {
	ctx;
	now;
	sharedDomain;
	domainPromise;
	sessionQueues = /* @__PURE__ */ new Map();
	/** Per-session max id sequence per kind, mirroring the durable tables. */
	sessionCounters = /* @__PURE__ */ new Map();
	/** Shared `report_artifacts` allocator/writer — shared with `BatchStore` once M5 composes both against the same domain (two independent counters over the same table could collide). Defaults to a private instance when the composing plugin supplies none (single-repo-only composition, or every existing test). */
	artifacts;
	/**
	* @param ctx - carries `storageDomain` when no shared `domain` opener is supplied; may be omitted when `sharedDomain` is given (e.g. `batch/orchestrator.ts`'s worker-outcome readers, which never open their own domain).
	* @param now - injected clock (ADR-10): timestamps are never trusted from model input, only from here.
	* @param sharedDomain - optional shared opener (see class doc); defaults to opening the domain itself via `ctx`.
	* @param artifacts - optional shared `report_artifacts` store (see field doc); defaults to a private instance over this store's own `domain()`.
	*/
	constructor(ctx, now = () => Date.now(), sharedDomain, artifacts) {
		this.ctx = ctx;
		this.now = now;
		this.sharedDomain = sharedDomain;
		this.artifacts = artifacts ?? new ReportArtifactStore(() => this.domain(), now);
	}
	/** Resolve the opened domain, opening it lazily on first use (or delegating to the shared opener, see class doc). */
	domain() {
		if (this.sharedDomain !== void 0) return this.sharedDomain();
		if (this.ctx === void 0) throw new Error("sast: SastStore constructed without ctx and without sharedDomain — cannot open the domain");
		if (this.domainPromise === void 0) this.domainPromise = this.ctx.storageDomain.open(sastDomainSpec);
		return this.domainPromise;
	}
	/**
	* The shared-opener form of {@link domain}, for another plugin composed
	* alongside this one to reuse this exact open domain (`DomainFacility.open`
	* rejects a second open of the same name) — e.g. the `sast-batch` plugin's
	* `BatchStore`/outcome-reading `SastStore`, provided this instance via
	* `ctx.provide('sastStore', store)` in `index.ts`.
	*/
	openedDomain() {
		return this.domain();
	}
	/** The shared `report_artifacts` allocator this instance is using (own or injected) — for `sast-batch`'s `BatchStore` to pass into its own constructor, so `report_artifacts` id allocation is never split across two independent in-memory counters over the same domain table. See {@link openedDomain}'s doc. */
	artifactStore() {
		return this.artifacts;
	}
	/** Close the domain and release its backend unit (idempotent). A no-op on the domain itself when `sharedDomain` was supplied — the opener's owner closes it exactly once. */
	async dispose() {
		await Promise.all([...this.sessionQueues.values()]);
		if (this.sharedDomain === void 0) {
			const pending = this.domainPromise;
			if (pending !== void 0) {
				this.domainPromise = void 0;
				await (await pending).close();
			}
		}
		this.sessionQueues.clear();
		this.sessionCounters.clear();
	}
	/** Serialize read/allocate/write transactions for one session. */
	enqueue(sessionId, operation) {
		const current = (this.sessionQueues.get(sessionId) ?? Promise.resolve()).then(operation);
		const settled = current.then(() => void 0, () => void 0);
		this.sessionQueues.set(sessionId, settled);
		return current;
	}
	/** Read one session's scan row, if present. */
	async getScan(sessionId) {
		return (await this.domain()).table("scans").get(sessionId);
	}
	/** Read the scan row, failing with a guiding error when absent. */
	async requireScan(sessionId) {
		const scan = await this.getScan(sessionId);
		if (scan === void 0) throw new Error("sast: scan is not initialized; call sast_start_scan with repoUrl and objective first");
		return scan;
	}
	/**
	* The next deterministic id for one kind in one session. Allocation is O(1)
	* from the in-memory max-sequence cache (the store is the domain's single
	* writer, and every allocation runs inside the session's serialized queue);
	* the cache is (re)built from the durable tables on first touch of a
	* session and dropped wholesale when the session's scan resets.
	*/
	async nextId(kind, sessionId) {
		let counters = this.sessionCounters.get(sessionId);
		if (counters === void 0) {
			counters = /* @__PURE__ */ new Map();
			for (const name of SEQUENCED_TABLES) {
				const table = (await this.domain()).table(name);
				for (const [, row] of table.entries()) {
					const record = row;
					if (record.sessionId !== sessionId) continue;
					const [kindOfId, seq] = /^([a-z]+)-(\d+)$/.exec(record.id)?.slice(1) ?? [];
					if (kindOfId === void 0 || seq === void 0) continue;
					if (kindOfId === "intent" || kindOfId === "fact" || kindOfId === "finding" || kindOfId === "asset" || kindOfId === "edge") counters.set(kindOfId, Math.max(counters.get(kindOfId) ?? 0, Number(seq)));
				}
			}
			this.sessionCounters.set(sessionId, counters);
		}
		const next = (counters.get(kind) ?? 0) + 1;
		counters.set(kind, next);
		return `${kind}-${next}`;
	}
	/** Delete every audit-graph and Skill-snapshot row of one session (scan reset). */
	async clearSession(sessionId) {
		const domain = await this.domain();
		for (const name of CLEARED_ON_RESET_TABLES) {
			const table = domain.table(name);
			for (const [key, row] of table.entries()) if (row.sessionId === sessionId) await table.delete(key);
		}
	}
	/**
	* Create or reset the scan. A new scan clears the whole audit graph and
	* every registered Skill snapshot of the session, and restarts fresh
	* counters. The caller (ingest, M2) must only reach this after a successful
	* clone/local-path validation — a failed clone must never call this, so the
	* old scan (if any) stays intact.
	*/
	async initScan(sessionId, input) {
		return this.enqueue(sessionId, async () => {
			const scan = snapshot({
				id: "scan-1",
				sessionId,
				provider: input.provider,
				repoUrl: input.repoUrl,
				branch: input.branch,
				commit: input.commit,
				workspacePath: input.workspacePath,
				objective: input.objective,
				scope: [...input.scope],
				authorization: input.authorization,
				languages: [...input.languages],
				fileCount: input.fileCount,
				...input.batchId !== void 0 ? { batchId: input.batchId } : {},
				...input.jobId !== void 0 ? { jobId: input.jobId } : {}
			});
			await (await this.domain()).table("scans").put(sessionId, scan);
			await this.clearSession(sessionId);
			this.sessionCounters.delete(sessionId);
			return scan;
		});
	}
	/** Validate a reference row (same session, expected table) or fail loud. */
	async requireRef(sessionId, tableName, refId, label) {
		const row = (await this.domain()).table(tableName).get(recordKey(sessionId, refId));
		if (row === void 0) throw new Error(`sast: unknown ${label} ${refId}`);
		/* v8 ignore next -- session-scoped keys are normalized at write time and the domain has one writer. */
		if (row.sessionId !== sessionId) throw new Error(`sast: ${label} ${refId} belongs to another session`);
	}
	/** Validate an intent reference and return the row (callers need its skillId/checkId). */
	async requireIntentRef(sessionId, intentId) {
		const row = (await this.domain()).table("intents").get(recordKey(sessionId, intentId));
		if (row === void 0 || row.sessionId !== sessionId) throw new Error(`sast: unknown intent ${intentId}`);
		return row;
	}
	/** Validate that a Skill/check reference is registered, enabled, and not already claimed by another intent. */
	async requireEnabledSkillCheck(sessionId, skillId, checkId) {
		const domain = await this.domain();
		const skill = domain.table("skills").get(recordKey(sessionId, skillId));
		if (skill === void 0 || skill.sessionId !== sessionId) throw new Error(`sast: unknown skill ${skillId}`);
		if (!skill.enabled) throw new Error(`sast: skill ${skillId} is disabled`);
		if (!skill.checks.some((check) => check.id === checkId)) throw new Error(`sast: unknown check ${checkId} in skill ${skillId}`);
		if ([...domain.table("intents").entries()].some(([, row]) => row.sessionId === sessionId && row.skillId === skillId && row.checkId === checkId)) throw new Error(`sast: check ${checkId} of skill ${skillId} already has an intent`);
		return skill;
	}
	/** Register (or idempotently retry, or digest-replace) one Skill's minimal per-scan snapshot. */
	async registerSkill(sessionId, input) {
		if (input.checks.length === 0 || input.checks.length > MAX_CHECKS_PER_SKILL) throw new Error(`sast: skill ${input.id} must declare between 1 and ${MAX_CHECKS_PER_SKILL} checks`);
		const checkIds = /* @__PURE__ */ new Set();
		for (const check of input.checks) {
			if (checkIds.has(check.id)) throw new Error(`sast: duplicate check id ${check.id} in skill ${input.id}`);
			checkIds.add(check.id);
		}
		return this.enqueue(sessionId, async () => {
			await this.requireScan(sessionId);
			const domain = await this.domain();
			const key = recordKey(sessionId, input.id);
			const existing = domain.table("skills").get(key);
			if (existing !== void 0 && existing.manifestDigest === input.manifestDigest) return existing;
			if (existing !== void 0) {
				if ([...domain.table("intents").entries()].some(([, row]) => row.sessionId === sessionId && row.skillId === input.id)) throw new Error(`sast: skill ${input.id} has a different manifest digest and is already referenced by an intent; use a new skill name or start a new scan`);
			} else {
				const otherSkills = [...domain.table("skills").entries()].map(([, row]) => row).filter((row) => row.sessionId === sessionId);
				if (otherSkills.length >= MAX_SKILLS_PER_SESSION) throw new Error(`sast: session already has ${MAX_SKILLS_PER_SESSION} registered skills`);
				if (otherSkills.reduce((sum, row) => sum + row.checks.length, 0) + input.checks.length > MAX_CHECKS_PER_SESSION) throw new Error(`sast: session would exceed ${MAX_CHECKS_PER_SESSION} total checks across all registered skills`);
			}
			const skill = snapshot({
				id: input.id,
				sessionId,
				title: input.title,
				source: input.source,
				sourceGroup: input.sourceGroup,
				provider: input.provider,
				category: input.category,
				applicability: {
					languages: [...input.applicability.languages],
					frameworks: [...input.applicability.frameworks],
					paths: [...input.applicability.paths]
				},
				checks: input.checks.map((check) => ({
					...check,
					scope: [...check.scope]
				})),
				enabled: input.enabled,
				manifestDigest: input.manifestDigest
			});
			await domain.table("skills").put(key, skill);
			return skill;
		});
	}
	/** Enable or disable a registered Skill; existing intents/findings/snapshots are untouched. */
	async setSkillEnabled(sessionId, skillId, enabled) {
		return this.enqueue(sessionId, async () => {
			await this.requireScan(sessionId);
			const domain = await this.domain();
			const key = recordKey(sessionId, skillId);
			const existing = domain.table("skills").get(key);
			if (existing === void 0 || existing.sessionId !== sessionId) throw new Error(`sast: unknown skill ${skillId}`);
			const updated = snapshot({
				...existing,
				enabled
			});
			await domain.table("skills").put(key, updated);
			return updated;
		});
	}
	/** Mint one node (and its connecting edge) in one write. */
	async addNode(sessionId, edgeKind, sourceId, nodeKind, node) {
		const domain = await this.domain();
		const nodeId = await this.nextId(nodeKind, sessionId);
		const record = snapshot({
			id: nodeId,
			sessionId,
			...node
		});
		await domain.table(TABLE_OF_ID_KIND[nodeKind]).put(recordKey(sessionId, nodeId), record);
		if (edgeKind === void 0) return { nodeId };
		const edgeId = await this.nextId("edge", sessionId);
		const edge = snapshot({
			id: edgeId,
			sessionId,
			kind: edgeKind,
			sourceId,
			targetId: nodeId
		});
		try {
			await domain.table("edges").put(recordKey(sessionId, edgeId), edge);
		} catch (error) {
			await domain.table(TABLE_OF_ID_KIND[nodeKind]).delete(recordKey(sessionId, nodeId));
			throw error;
		}
		return {
			nodeId,
			edge: {
				id: edgeId,
				kind: edgeKind,
				sourceId,
				targetId: nodeId
			}
		};
	}
	/** Record one intent spawned by the scan or derived from a fact. */
	async addIntent(sessionId, input) {
		if ((input.scanId !== void 0 ? 1 : 0) + (input.derivedFromFactId !== void 0 ? 1 : 0) !== 1) throw new Error("sast_add_intent requires exactly one anchor: scanId (spawns) or derivedFromFactId (derived_from)");
		if (input.skillId === void 0 !== (input.checkId === void 0)) throw new Error("sast_add_intent requires skillId and checkId together or neither");
		return this.enqueue(sessionId, async () => {
			const scan = await this.requireScan(sessionId);
			if (input.skillId !== void 0 && input.checkId !== void 0) await this.requireEnabledSkillCheck(sessionId, input.skillId, input.checkId);
			const node = {
				title: input.title,
				detail: input.detail,
				category: input.category,
				scope: [...input.scope],
				status: "pending",
				note: "",
				...input.skillId !== void 0 ? {
					skillId: input.skillId,
					checkId: input.checkId
				} : {},
				createdAt: this.now()
			};
			if (input.scanId !== void 0) {
				if (input.scanId !== scan.id) throw new Error(`sast: unknown scan ${input.scanId}`);
				return this.addNode(sessionId, "spawns", input.scanId, "intent", node);
			}
			const derivedFromFactId = input.derivedFromFactId;
			await this.requireRef(sessionId, "facts", derivedFromFactId, "fact");
			return this.addNode(sessionId, "derived_from", derivedFromFactId, "intent", node);
		});
	}
	/** Update one intent's lifecycle status; `done -> pending` is rejected (monotonic, ADR-10). */
	async updateIntent(sessionId, intentId, input) {
		return this.enqueue(sessionId, async () => {
			await this.requireScan(sessionId);
			const domain = await this.domain();
			const key = recordKey(sessionId, intentId);
			const existing = domain.table("intents").get(key);
			if (existing === void 0 || existing.sessionId !== sessionId) throw new Error(`sast: unknown intent ${intentId}`);
			if (existing.status === "done" && input.status === "pending") throw new Error("sast: intent status cannot move from done back to pending");
			const now = this.now();
			const enteringProgress = input.status === "running" || input.status === "done" || input.status === "blocked";
			const enteringTerminal = input.status === "done" || input.status === "blocked";
			const startedAt = existing.startedAt ?? (enteringProgress ? now : void 0);
			const endedAt = existing.endedAt ?? (enteringTerminal ? now : void 0);
			const updated = snapshot({
				...existing,
				status: input.status,
				note: input.note ?? existing.note,
				...input.delegatedSessionId !== void 0 ? { delegatedSessionId: input.delegatedSessionId } : {},
				...startedAt !== void 0 ? { startedAt } : {},
				...endedAt !== void 0 ? { endedAt } : {}
			});
			await domain.table("intents").put(key, updated);
			return updated;
		});
	}
	/** Record one fact yielded by an intent, hardening `path` against the scan workspace (ADR-03). */
	async addFact(sessionId, input) {
		return this.enqueue(sessionId, async () => {
			const scan = await this.requireScan(sessionId);
			await this.requireRef(sessionId, "intents", input.intentId, "intent");
			if (input.fromFactId !== void 0) await this.requireRef(sessionId, "facts", input.fromFactId, "fact");
			const normalized = normalizeRepoPath(input.path);
			requireExistingFile(scan.workspacePath, normalized, "file");
			const { line, lineAdjusted } = clampLine(scan.workspacePath, normalized, input.line ?? 0);
			const write = await this.addNode(sessionId, "yields", input.intentId, "fact", {
				intentId: input.intentId,
				kind: input.kind,
				path: normalized,
				line,
				...input.endLine !== void 0 ? { endLine: input.endLine } : {},
				lineAdjusted,
				...input.symbol !== void 0 ? { symbol: input.symbol } : {},
				detail: input.detail,
				...input.snippet !== void 0 ? { snippet: input.snippet } : {},
				confidence: input.confidence,
				source: "llm",
				engineRule: "",
				at: this.now()
			});
			if (input.fromFactId === void 0) return {
				...write,
				line,
				lineAdjusted
			};
			const domain = await this.domain();
			try {
				const flowEdgeId = await this.nextId("edge", sessionId);
				const flowEdge = snapshot({
					id: flowEdgeId,
					sessionId,
					kind: "flows_to",
					sourceId: input.fromFactId,
					targetId: write.nodeId
				});
				await domain.table("edges").put(recordKey(sessionId, flowEdgeId), flowEdge);
				return {
					...write,
					line,
					lineAdjusted,
					flowEdge: {
						id: flowEdgeId,
						sourceId: input.fromFactId,
						targetId: write.nodeId
					}
				};
			} catch (error) {
				if (write.edge !== void 0) await domain.table("edges").delete(recordKey(sessionId, write.edge.id));
				await domain.table("facts").delete(recordKey(sessionId, write.nodeId));
				throw error;
			}
		});
	}
	/** Harden one code-path hop against the scan workspace, rewrapping any failure with its index (ADR-03). */
	hardenHop(workspacePath, hop, describeFailure) {
		try {
			const normalized = normalizeRepoPath(hop.path);
			requireExistingFile(workspacePath, normalized, "file");
			const { line, lineAdjusted } = clampLine(workspacePath, normalized, hop.line ?? 0);
			return {
				path: normalized,
				line,
				...lineAdjusted ? { lineAdjusted } : {},
				...hop.symbol !== void 0 ? { symbol: hop.symbol } : {},
				...hop.note !== void 0 ? { note: hop.note } : {}
			};
		} catch {
			throw new Error(describeFailure(hop.path));
		}
	}
	/** Validate the skillId/checkId pairing and cross-reference rule shared by `addFinding` and `addSubmission`. */
	checkFindingSkillRef(input, intent) {
		if (input.skillId === void 0 !== (input.checkId === void 0)) throw new Error("sast_add_finding requires skillId and checkId together or neither");
		if (input.skillId !== void 0 && (input.skillId !== intent.skillId || input.checkId !== intent.checkId)) throw new Error("sast: finding skillId/checkId must match the proving intent's own skillId/checkId");
	}
	/** Record one finding proved by an intent, with a hardened code evidence chain (ADR-03). */
	async addFinding(sessionId, input) {
		if (input.codePath.length === 0) throw new Error("sast_add_finding requires at least one code location");
		return this.enqueue(sessionId, async () => {
			const scan = await this.requireScan(sessionId);
			const intent = await this.requireIntentRef(sessionId, input.intentId);
			if (input.affectedAssetId !== void 0) await this.requireRef(sessionId, "assets", input.affectedAssetId, "asset");
			this.checkFindingSkillRef(input, intent);
			const codePath = input.codePath.map((hop, index) => this.hardenHop(scan.workspacePath, hop, (raw) => `sast: codePath[${index}].path ${raw} does not exist in the scan workspace; only cite files you actually read`));
			return this.addNode(sessionId, "proves", input.intentId, "finding", {
				intentId: input.intentId,
				title: input.title,
				severity: input.severity,
				...input.vulnClass !== void 0 ? { vulnClass: input.vulnClass } : {},
				...input.cwe !== void 0 ? { cwe: input.cwe } : {},
				confidence: input.confidence,
				description: input.description ?? "",
				codePath,
				remediation: input.remediation ?? "",
				poc: input.poc ?? "",
				status: "open",
				triageReason: "",
				...input.skillId !== void 0 ? {
					skillId: input.skillId,
					checkId: input.checkId
				} : {},
				...input.affectedAssetId !== void 0 ? { affectedAssetId: input.affectedAssetId } : {},
				at: this.now()
			});
		});
	}
	/** Record one asset; `file`/`module` values are path-hardened (ADR-03), other types are opaque. */
	async addAsset(sessionId, input) {
		const parentId = input.parentId === "" ? void 0 : input.parentId;
		return this.enqueue(sessionId, async () => {
			const scan = await this.requireScan(sessionId);
			if (parentId !== void 0) await this.requireRef(sessionId, "assets", parentId, "asset");
			let value = input.value;
			if (input.type === "file" || input.type === "module") {
				value = normalizeRepoPath(input.value);
				requireExistingFile(scan.workspacePath, value, input.type);
			}
			return this.addNode(sessionId, parentId === void 0 ? void 0 : "parent", parentId ?? "", "asset", {
				type: input.type,
				value,
				meta: input.meta,
				at: this.now()
			});
		});
	}
	/** Triage one finding; only `status`/`triageReason`/`triagedAt` change, the finding is never deleted. */
	async triage(sessionId, findingId, status, reason) {
		return this.enqueue(sessionId, async () => {
			await this.requireScan(sessionId);
			const domain = await this.domain();
			const key = recordKey(sessionId, findingId);
			const existing = domain.table("findings").get(key);
			if (existing === void 0 || existing.sessionId !== sessionId) throw new Error(`sast: unknown finding ${findingId}`);
			const updated = snapshot({
				...existing,
				status,
				triageReason: reason,
				triagedAt: this.now()
			});
			await domain.table("findings").put(key, updated);
			return updated;
		});
	}
	/**
	* Persist one delegated submission as an all-or-nothing session write.
	* Every reference (`fromFactId`/`parentId`/`affectedAssetId`/skillId+checkId
	* pairing) is validated up front; path hardening happens per item during
	* the write pass so a bad path can be reported with its exact index, but a
	* failure at any point rolls back every row this call has written so far —
	* the batch is genuinely all-or-nothing, matching `sast_submit`'s contract.
	*/
	async addSubmission(sessionId, intentId, facts, assets, findings) {
		return this.enqueue(sessionId, async () => {
			const scan = await this.requireScan(sessionId);
			const intent = await this.requireIntentRef(sessionId, intentId);
			for (const fact of facts) if (fact.fromFactId !== void 0) await this.requireRef(sessionId, "facts", fact.fromFactId, "fact");
			for (const asset of assets) {
				const parentId = asset.parentId === "" ? void 0 : asset.parentId;
				if (parentId !== void 0) await this.requireRef(sessionId, "assets", parentId, "asset");
			}
			for (const finding of findings) {
				if (finding.codePath.length === 0) throw new Error("sast_add_finding requires at least one code location");
				if (finding.affectedAssetId !== void 0) await this.requireRef(sessionId, "assets", finding.affectedAssetId, "asset");
				this.checkFindingSkillRef(finding, intent);
			}
			const domain = await this.domain();
			const created = [];
			try {
				for (const [index, fact] of facts.entries()) {
					const normalized = normalizeRepoPath(fact.path);
					try {
						requireExistingFile(scan.workspacePath, normalized, "file");
					} catch {
						throw new Error(`sast: facts[${index}].path ${fact.path} does not exist in the scan workspace; only cite files you actually read`);
					}
					const { line, lineAdjusted } = clampLine(scan.workspacePath, normalized, fact.line ?? 0);
					const write = await this.addNode(sessionId, "yields", intentId, "fact", {
						intentId,
						kind: fact.kind,
						path: normalized,
						line,
						...fact.endLine !== void 0 ? { endLine: fact.endLine } : {},
						lineAdjusted,
						...fact.symbol !== void 0 ? { symbol: fact.symbol } : {},
						detail: fact.detail,
						...fact.snippet !== void 0 ? { snippet: fact.snippet } : {},
						confidence: fact.confidence,
						source: "llm",
						engineRule: "",
						at: this.now()
					});
					created.push({
						table: "facts",
						key: recordKey(sessionId, write.nodeId)
					});
					if (write.edge !== void 0) created.push({
						table: "edges",
						key: recordKey(sessionId, write.edge.id)
					});
					if (fact.fromFactId !== void 0) {
						const flowEdgeId = await this.nextId("edge", sessionId);
						const flowEdge = snapshot({
							id: flowEdgeId,
							sessionId,
							kind: "flows_to",
							sourceId: fact.fromFactId,
							targetId: write.nodeId
						});
						await domain.table("edges").put(recordKey(sessionId, flowEdgeId), flowEdge);
						created.push({
							table: "edges",
							key: recordKey(sessionId, flowEdgeId)
						});
					}
				}
				for (const asset of assets) {
					const parentId = asset.parentId === "" ? void 0 : asset.parentId;
					let value = asset.value;
					if (asset.type === "file" || asset.type === "module") try {
						value = normalizeRepoPath(asset.value);
						requireExistingFile(scan.workspacePath, value, asset.type);
					} catch {
						throw new Error(`sast: asset ${asset.value} does not exist in the scan workspace; only cite files you actually read`);
					}
					const write = await this.addNode(sessionId, parentId === void 0 ? void 0 : "parent", parentId ?? "", "asset", {
						type: asset.type,
						value,
						meta: asset.meta,
						at: this.now()
					});
					created.push({
						table: "assets",
						key: recordKey(sessionId, write.nodeId)
					});
					if (write.edge !== void 0) created.push({
						table: "edges",
						key: recordKey(sessionId, write.edge.id)
					});
				}
				for (const [index, finding] of findings.entries()) {
					const codePath = finding.codePath.map((hop, hopIndex) => this.hardenHop(scan.workspacePath, hop, (raw) => `sast: findings[${index}].codePath[${hopIndex}].path ${raw} does not exist in the scan workspace; only cite files you actually read`));
					const write = await this.addNode(sessionId, "proves", intentId, "finding", {
						intentId,
						title: finding.title,
						severity: finding.severity,
						...finding.vulnClass !== void 0 ? { vulnClass: finding.vulnClass } : {},
						...finding.cwe !== void 0 ? { cwe: finding.cwe } : {},
						confidence: finding.confidence,
						description: finding.description ?? "",
						codePath,
						remediation: finding.remediation ?? "",
						poc: finding.poc ?? "",
						status: "open",
						triageReason: "",
						...finding.skillId !== void 0 ? {
							skillId: finding.skillId,
							checkId: finding.checkId
						} : {},
						...finding.affectedAssetId !== void 0 ? { affectedAssetId: finding.affectedAssetId } : {},
						at: this.now()
					});
					created.push({
						table: "findings",
						key: recordKey(sessionId, write.nodeId)
					});
					if (write.edge !== void 0) created.push({
						table: "edges",
						key: recordKey(sessionId, write.edge.id)
					});
				}
			} catch (error) {
				for (const { table, key } of created.reverse()) try {
					await domain.table(table).delete(key);
				} catch {}
				throw error;
			}
			return {
				facts: facts.length,
				assets: assets.length,
				findings: findings.length
			};
		});
	}
	/** Read all audit rows of one session, ordered by numeric id sequence (Skills sort by their stable name). */
	async sessionData(sessionId) {
		const domain = await this.domain();
		const bySession = (rows) => [...rows].map(([, row]) => row).filter((row) => row.sessionId === sessionId).sort((a, b) => {
			return Number(/-(\d+)$/.exec(a.id)?.[1] ?? Number.MAX_SAFE_INTEGER) - Number(/-(\d+)$/.exec(b.id)?.[1] ?? Number.MAX_SAFE_INTEGER);
		});
		const skills = [...domain.table("skills").entries()].map(([, row]) => row).filter((row) => row.sessionId === sessionId).sort((a, b) => a.id.localeCompare(b.id));
		return {
			scan: await this.getScan(sessionId),
			skills,
			intents: bySession(domain.table("intents").entries()),
			facts: bySession(domain.table("facts").entries()),
			findings: bySession(domain.table("findings").entries()),
			assets: bySession(domain.table("assets").entries()),
			edges: bySession(domain.table("edges").entries())
		};
	}
	/** Derive the two-dimensional coverage view for one session (pure over the session snapshot, coverage.ts). */
	async coverage(sessionId) {
		const { scan, skills, intents, facts, findings, assets } = await this.sessionData(sessionId);
		return coverageOf({
			scan,
			skills,
			intents,
			facts,
			findings,
			assets
		});
	}
	/**
	* Persist one report artifact row (M4) through the shared allocator
	* (`ReportArtifactStore` — see this class's `artifacts` field doc for why
	* this delegates rather than allocating its own id). `fields` is
	* everything {@link writeArtifact} already computed (kind/uri/sha256/
	* bytes, plus batchId/jobId when present); the shared store assigns id
	* and createdAt (the injected clock, ADR-10 — never trusted from a
	* caller). Not part of the per-session audit graph — `report_artifacts`
	* carries no `sessionId` and is deliberately excluded from
	* `CLEARED_ON_RESET_TABLES`, so a repeat scan of the same session never
	* deletes a previously delivered report.
	*/
	async putReportArtifact(fields) {
		return this.artifacts.put(fields);
	}
	/** Read one report artifact row by its durable id, if present. */
	async getReportArtifact(id) {
		return this.artifacts.get(id);
	}
	/** Build the model-visible summary view for one session. */
	async view(sessionId) {
		const { scan, skills, intents, facts, findings, assets, edges } = await this.sessionData(sessionId);
		if (scan === void 0) return {
			initialized: false,
			skills: [],
			intents: [],
			facts: [],
			findings: [],
			assets: [],
			edges: [],
			counts: {
				skills: 0,
				intents: 0,
				facts: 0,
				findings: 0,
				assets: 0
			}
		};
		return snapshot({
			initialized: true,
			scan,
			skills,
			intents,
			facts,
			findings,
			assets,
			edges,
			counts: {
				skills: skills.length,
				intents: intents.length,
				facts: facts.length,
				findings: findings.length,
				assets: assets.length
			}
		});
	}
};
//#endregion
//#region src/batch/orchestrator.ts
/**
* Builds the delegation prompt for one job's worker: the repo to scan, the
* batch-wide objective/authorization, and the pinned methodology names (if
* any) — the worker calls `sast_start_scan` and `sast_register_skill`
* itself, exactly like a standalone single-repo worker, so this prompt
* names WHAT to do, never HOW (no clone/skill-lookup instructions — those
* are the worker's own protocol, unchanged for batch execution).
*/
function batchPromptBuilder(context) {
	return { build: (job) => {
		const repo = job.repoSpec;
		const lines = [
			`你是本批次第 ${job.ordinal} 个仓库的 repository worker，只对这一个仓库负责。`,
			`仓库：${repo.repoUrl}${repo.provider !== "local" ? ` (provider: ${repo.provider})` : ""}${repo.branch !== void 0 ? ` branch: ${repo.branch}` : ""}${repo.ref !== void 0 ? ` ref: ${repo.ref}` : ""}`,
			`目标：${repo.objective ?? context.objective}`,
			`授权：${context.authorization}`
		];
		if (context.methodologyNames.length > 0) lines.push(`本批次固定的审计方法论（全部按名调用 sast_register_skill 登记，不要臆造未列出的方法论）：${context.methodologyNames.join("、")}`);
		if (repo.scope.length > 0) lines.push(`审计范围限定：${repo.scope.join("、")}`);
		lines.push("先调用 sast_start_scan 完成克隆与元数据，再照常规单仓协议推进，最后调用 sast_report 固化报告。");
		lines.push("这是批次执行：不要调用任何 sast_batch_* 工具，也不要就单仓问题询问用户——遇到阻塞就记录并在 sast_report 中如实标注。");
		return lines.join("\n");
	} };
}
/**
* Resolves a finished worker attempt's outcome by reading that worker's OWN
* durable `SastStore` state — never a self-reported claim. Precedence:
* 1. A `report_artifacts` row for this job (the worker called `sast_report`)
*    → `succeeded`.
* 2. No report, but the worker's coverage shows at least one `blocked`
*    check → `degraded` (an audit ran, just didn't finish everything).
* 3. No report and no scan at all (the worker never even started, or
*    `sast_start_scan` itself threw — auth/timeout/scope failures surface
*    this way) → `failed`, classified from... there is no raw error text
*    to classify from here (the worker's own turn already absorbed it), so
*    this resolver reports a generic transient failure and lets
*    `policy.ts`'s `classifyError` fall through to `'unknown'` (bounded
*    retry, matching the conservative default for an unclassifiable
*    failure).
*/
function createStoreBackedOutcomeResolver(domain, batchStore) {
	return { resolve: async (job, worker) => {
		const workerStore = new SastStore(void 0, () => Date.now(), domain);
		if (await batchStore.findReportArtifactByJob(job.id) !== void 0) return { kind: "succeeded" };
		if (await workerStore.getScan(worker.sessionId) === void 0) return {
			kind: "failed",
			error: /* @__PURE__ */ new Error("sast: worker attempt ended without ever starting a scan")
		};
		const coverage = await workerStore.coverage(worker.sessionId);
		if (coverage.checks.blocked > 0) return {
			kind: "degraded",
			coverageImpact: `${coverage.checks.blocked} check(s) blocked after the worker's own bounded recovery attempts`
		};
		return {
			kind: "failed",
			error: /* @__PURE__ */ new Error("sast: worker attempt idled without calling sast_report")
		};
	} };
}
/**
* Resolves `sast_batch_state`/`sast_batch_report`'s per-job summary by
* reading that job's worker session's own coverage/findings — the same
* `SastStore` the outcome resolver reads, over the same shared domain.
*/
function createStoreBackedSummaryResolver(domain) {
	const store = new SastStore(void 0, () => Date.now(), domain);
	return { resolve: async (_jobId, workerSessionId) => {
		if (workerSessionId === void 0) return { findingsBySeverity: {} };
		if (await store.getScan(workerSessionId) === void 0) return { findingsBySeverity: {} };
		const data = await store.sessionData(workerSessionId);
		const coverage = await store.coverage(workerSessionId);
		const findingsBySeverity = {};
		for (const finding of data.findings) {
			if (finding.status === "false-positive" || finding.status === "wont-fix") continue;
			findingsBySeverity[finding.severity] = (findingsBySeverity[finding.severity] ?? 0) + 1;
		}
		return {
			findingsBySeverity,
			fileCoverageRatio: coverage.files.ratio,
			checkCompletionRatio: coverage.checks.completionRatio
		};
	} };
}
//#endregion
//#region src/batch/report.ts
function ratioOrUnknown(ratio) {
	return ratio ?? "unknown";
}
const SEVERITY_ORDER = [
	"critical",
	"high",
	"medium",
	"low",
	"info"
];
/** Sum one severity's count across every row (0 for a row that never reported that severity). */
function totalOf(rows, severity) {
	return rows.reduce((sum, row) => sum + (row.summary.findingsBySeverity[severity] ?? 0), 0);
}
/** Build the cross-repo Markdown report. Every row in `rows` must be present exactly once, covering every job of the batch — the caller (`sast_batch_report`'s tool boundary) is responsible for passing the full, deduplicated set (A20); this function does not itself deduplicate or fill in missing ordinals, so a caller bug there is visible as a gap in the output rather than silently patched over. */
function buildBatchMarkdownReport(batch, rows) {
	const sorted = [...rows].sort((a, b) => a.job.ordinal - b.job.ordinal);
	const totalsLine = SEVERITY_ORDER.map((severity) => `${severity} ${totalOf(sorted, severity)}`).join(" / ");
	const reviewPending = sorted.filter((row) => row.job.reviewStatus === "pending");
	const jobLines = sorted.map((row) => {
		const { job, summary } = row;
		const severityCounts = SEVERITY_ORDER.map((severity) => [severity, summary.findingsBySeverity[severity] ?? 0]).filter(([, count]) => count > 0).map(([severity, count]) => `${severity} ${count}`).join(", ");
		const findingsLabel = severityCounts === "" ? "0 findings" : severityCounts;
		const fileRatio = ratioOrUnknown(summary.fileCoverageRatio);
		const checkRatio = ratioOrUnknown(summary.checkCompletionRatio);
		const fallbackNote = job.fallback === void 0 || job.fallback === "" ? "" : ` — ${job.fallback}`;
		return [
			`### ${job.ordinal}. ${job.repoSpec.repoUrl}`,
			`- 状态: ${job.status}（尝试 ${job.attempt} 次）${fallbackNote}`,
			`- 文件覆盖率: ${fileRatio === "unknown" ? "unknown（未审）" : `${Math.round(fileRatio * 100)}%`}`,
			`- 检查项完成度: ${checkRatio === "unknown" ? "unknown（未审）" : `${Math.round(checkRatio * 100)}%`}`,
			`- 漏洞: ${findingsLabel}`
		].join("\n");
	});
	const reviewLines = reviewPending.length === 0 ? ["（无）"] : reviewPending.map((row) => `- ordinal ${row.job.ordinal}（${row.job.status}）: ${row.job.fallback ?? "（未说明）"}`);
	return [
		"# 批次审计报告",
		"",
		`- 批次目标: ${batch.objective}`,
		`- 授权: ${batch.authorization === "" ? "未声明" : batch.authorization}`,
		`- 仓库总数: ${batch.total}`,
		`- 状态: ${batch.status}`,
		"",
		"## 汇总",
		`- 漏洞合计（按严重度）: ${totalsLine}`,
		`- 待确认项: ${reviewPending.length}`,
		"",
		"## 各仓明细",
		...jobLines,
		"",
		"## 待确认（Review Inbox）",
		...reviewLines,
		""
	].join("\n");
}
/** Build the cross-repo JSON report — same coverage/A20/A23 discipline as {@link buildBatchMarkdownReport}, machine-readable for `format: json`. */
function buildBatchJsonReport(batch, rows) {
	const sorted = [...rows].sort((a, b) => a.job.ordinal - b.job.ordinal);
	const totals = Object.fromEntries(SEVERITY_ORDER.map((severity) => [severity, totalOf(sorted, severity)]));
	return {
		batchId: batch.id,
		objective: batch.objective,
		authorization: batch.authorization,
		total: batch.total,
		status: batch.status,
		totals,
		jobs: sorted.map(({ job, summary }) => ({
			ordinal: job.ordinal,
			repoUrl: job.repoSpec.repoUrl,
			status: job.status,
			attempt: job.attempt,
			reviewStatus: job.reviewStatus,
			...job.fallback !== void 0 ? { fallback: job.fallback } : {},
			fileCoverageRatio: ratioOrUnknown(summary.fileCoverageRatio),
			checkCompletionRatio: ratioOrUnknown(summary.checkCompletionRatio),
			findingsBySeverity: summary.findingsBySeverity,
			...job.reportArtifactId !== void 0 ? { reportArtifactId: job.reportArtifactId } : {}
		}))
	};
}
//#endregion
//#region src/report/artifacts.ts
/**
* Report artifact persistence (M4, `report_artifacts` table): writes a
* finished report to disk under a configured root and returns the
* durable-record fields a `SastStore` write needs — digest, byte count, and
* URI. A pure I/O boundary, independent of the domain: `sha256` is computed
* over the exact `Buffer` written (not the source string, to avoid encoding
* ambiguity for multi-byte content). `id` and `createdAt` are NOT assigned
* here — like every other durable write in this package, those come from
* `SastStore.putReportArtifact` (deterministic id allocation, injected
* clock, ADR-10), never from this I/O-only boundary.
* @module @tangxiaofeng7/dsh-sast-host/src/report/artifacts
*/
/** File extension for each artifact kind (matches its `content` format). */
const EXTENSION_OF_KIND = {
	"repo-markdown": "md",
	"repo-sarif": "sarif.json",
	"repo-summary": "json",
	"batch-markdown": "md",
	"batch-json": "json",
	"methodology-content": "md"
};
/**
* Directory an artifact of one session/batch is written under:
* `<root>/<batchId>/<jobId>` when both are known (a batch job's own report),
* `<root>/<batchId>` for a batch-scoped rollup, otherwise `<root>/<sessionId>`
* for a plain single-repo session.
*/
function artifactDir(root, sessionId, batchId, jobId) {
	if (batchId !== void 0 && jobId !== void 0) return join(root, batchId, jobId);
	if (batchId !== void 0) return join(root, batchId);
	return join(root, sessionId);
}
/**
* Write one report artifact to disk under `root` and return the fields
* `SastStore.putReportArtifact` needs to persist it. The written path never
* escapes `root` — it is built entirely from validated internal identifiers
* (session/batch/job ids, a fixed per-kind filename, an optional caller-
* validated `nameHint`), never from model-supplied content.
*/
async function writeArtifact(input) {
	const rootAbsolute = resolve(input.root);
	const dir = artifactDir(rootAbsolute, input.sessionId, input.batchId, input.jobId);
	const filename = input.nameHint !== void 0 ? `${input.kind}-${input.nameHint}.${EXTENSION_OF_KIND[input.kind]}` : `${input.kind}.${EXTENSION_OF_KIND[input.kind]}`;
	const absolute = resolve(dir, filename);
	if (absolute !== rootAbsolute && !absolute.startsWith(rootAbsolute + sep)) throw new Error(`sast: report artifact path ${absolute} escaped its root`);
	await mkdir(dir, { recursive: true });
	const buffer = Buffer.from(input.content, "utf8");
	await writeFile(absolute, buffer);
	return {
		...input.batchId !== void 0 ? { batchId: input.batchId } : {},
		...input.jobId !== void 0 ? { jobId: input.jobId } : {},
		kind: input.kind,
		uri: pathToFileURL(absolute).toString(),
		sha256: createHash("sha256").update(buffer).digest("hex"),
		bytes: buffer.byteLength
	};
}
//#endregion
//#region src/skill-manifest.ts
/**
* Trusted parsing/validation of a registered audit-methodology Skill's
* `metadata.sast` frontmatter into `SkillRegistrationInput` (§5.1). Pure —
* no filesystem or `ctx.skills` access, so it can be unit tested against a
* fixture `SkillDefinition`-shaped object alone. The store (registerSkill)
* still enforces the check-count/id-uniqueness invariants at the durable
* boundary; this module's job is turning an untrusted `metadata` blob into
* the store's typed input or a guiding rejection — it never partially
* accepts a malformed manifest.
* @module @tangxiaofeng7/dsh-sast-host/src/skill-manifest
*/
const KEBAB_CASE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_CHECKS = 256;
const INTENT_CATEGORIES = /* @__PURE__ */ new Set([
	"recon",
	"attack-surface",
	"taint",
	"config",
	"dependency",
	"verify",
	"custom"
]);
/** Map a raw DSH `SkillSource` value to the SAST-domain trust bucket (§5.2). */
function sourceGroupOf(source) {
	if (source === "bundled") return "builtin";
	if (source === "project-dsh" || source === "project-agents") return "workspace";
	return "user";
}
function fail(name, reason) {
	throw new Error(`sast: skill ${name} has an invalid metadata.sast manifest: ${reason}`);
}
/** Validate one raw check entry from `metadata.sast.checks`. */
function checkOf(name, raw, index) {
	if (raw === null || typeof raw !== "object") fail(name, `checks[${index}] must be an object`);
	const entry = raw;
	if (typeof entry.id !== "string" || !KEBAB_CASE_RE.test(entry.id)) fail(name, `checks[${index}].id must be a kebab-case string`);
	if (typeof entry.title !== "string" || entry.title === "") fail(name, `checks[${index}].title must be a non-empty string`);
	const scope = entry.scope === void 0 ? [] : entry.scope;
	if (!Array.isArray(scope) || !scope.every((s) => typeof s === "string")) fail(name, `checks[${index}].scope must be an array of strings`);
	return {
		id: entry.id,
		title: entry.title,
		scope
	};
}
/**
* Parse and strictly validate one resolved Skill's `metadata.sast` into a
* `SkillRegistrationInput` the store can register, plus a stable
* `manifestDigest` (sha256 of the normalized checks + name + category) so
* an unrelated body/whitespace edit does not change the digest but a real
* check-set change does. Throws with an actionable message on any
* malformation — never a partial/best-effort registration.
*/
function parseSkillManifest(skill) {
	if (!skill.invocation.modelInvocable) fail(skill.name, "the resolved Skill is not model-invocable (invocation.modelInvocable is false)");
	if (!KEBAB_CASE_RE.test(skill.name)) fail(skill.name, "the Skill name itself must be kebab-case");
	const sast = skill.metadata?.sast;
	if (sast === null || typeof sast !== "object") fail(skill.name, "metadata.sast is missing or not an object");
	const raw = sast;
	const category = raw.category === void 0 ? "custom" : raw.category;
	if (typeof category !== "string" || !INTENT_CATEGORIES.has(category)) fail(skill.name, `metadata.sast.category must be one of: ${[...INTENT_CATEGORIES].join(", ")}`);
	const rawChecks = raw.checks;
	if (!Array.isArray(rawChecks) || rawChecks.length === 0) fail(skill.name, "metadata.sast.checks must be a non-empty array");
	if (rawChecks.length > MAX_CHECKS) fail(skill.name, `metadata.sast.checks must declare at most ${MAX_CHECKS} checks`);
	const checks = rawChecks.map((check, index) => checkOf(skill.name, check, index));
	const seenIds = /* @__PURE__ */ new Set();
	for (const check of checks) {
		if (seenIds.has(check.id)) fail(skill.name, `duplicate check id ${check.id}`);
		seenIds.add(check.id);
	}
	const languages = Array.isArray(raw.languages) && raw.languages.every((l) => typeof l === "string") ? raw.languages : [];
	const frameworks = Array.isArray(raw.frameworks) && raw.frameworks.every((f) => typeof f === "string") ? raw.frameworks : [];
	const paths = Array.isArray(raw.paths) && raw.paths.every((p) => typeof p === "string") ? raw.paths : [];
	const digestInput = JSON.stringify({
		name: skill.name,
		category,
		checks: [...checks].sort((a, b) => a.id.localeCompare(b.id))
	});
	const manifestDigest = createHash("sha256").update(digestInput).digest("hex");
	return {
		id: skill.name,
		title: typeof raw.displayName === "string" && raw.displayName !== "" ? raw.displayName : skill.description,
		source: skill.source,
		sourceGroup: sourceGroupOf(skill.source),
		provider: skill.provider,
		category,
		applicability: {
			languages,
			frameworks,
			paths
		},
		checks,
		enabled: true,
		manifestDigest
	};
}
//#endregion
//#region src/batch/methodology.ts
/**
* `MethodologyArtifactStore` (M5): resolves the user-named audit
* methodologies a batch pins at creation time into the
* `sastBatchSchema.methodologies` entries — name, `manifestDigest` (the
* check-list digest `parseSkillManifest` already computes),
* `contentDigest` (a sha256 over the resolved Skill's full body), and
* `artifactId` (a read-only durable copy of that body, written through the
* same `report/artifacts.ts` boundary M4 already uses).
*
* ADR-14/15 discipline: lookup uses the caller's OWN trusted scope/cwd,
* never `scan.workspacePath` — the cloned repository is untrusted input and
* must never become a Skill lookup root, so `cwd` is deliberately not a
* parameter here; callers pass whatever trusted cwd their own session
* already resolves Skills against. A batch fixes each methodology's digest
* ONCE at creation (A22): every job in that batch reads the SAME pinned
* content, so a mid-batch edit to the source Skill file never reaches
* later jobs — this module's whole job is making that pin durable and
* independent of anything still on disk.
* @module @tangxiaofeng7/dsh-sast-host/src/batch/methodology
*/
/**
* Resolve and pin every named methodology for one batch. Throws (naming the
* unresolvable name) if any name fails to resolve or fails manifest
* validation — batch creation is all-or-nothing (docs/architecture.md §3's
* "非法定义不产生部分快照" ADR-16 discipline), so a partial pin set must
* never reach the caller.
*/
async function pinMethodologies(resolver, names, writeRoot) {
	const pinned = [];
	for (const name of names) {
		const skill = await resolver.resolve(name);
		if (skill === void 0) throw new Error(`sast: methodology '${name}' could not be resolved from the trusted Skill registry`);
		const manifest = parseSkillManifest(skill);
		const contentDigest = createHash("sha256").update(skill.content, "utf8").digest("hex");
		const artifact = await writeArtifact({
			root: writeRoot.root,
			sessionId: writeRoot.sessionId,
			batchId: writeRoot.batchId,
			kind: "methodology-content",
			nameHint: name,
			content: skill.content
		});
		pinned.push({
			methodology: {
				name,
				manifestDigest: manifest.manifestDigest,
				contentDigest
			},
			artifact
		});
	}
	return pinned;
}
//#endregion
//#region src/batch/tools.ts
const PROVIDERS = [
	"gitlab",
	"github",
	"local"
];
const METHODOLOGY_MODES = [
	"explicit-only",
	"explicit-plus-auto",
	"auto"
];
const REPORT_FORMATS = ["markdown", "json"];
const RESOLVE_ACTIONS = [
	"accept-gap",
	"retry",
	"confirm-skip"
];
/** Resolve the calling session id or fail a non-agent caller. */
function sessionIdOf(exec) {
	if (!exec.agent) throw new Error("sast_batch_* tools require an owning agent session");
	return exec.agent.session.id;
}
function requiredString(value, name) {
	if (typeof value !== "string" || value === "") throw new Error(`sast_batch_* requires ${name}`);
	return value;
}
const EMPTY_SUMMARY = { findingsBySeverity: {} };
/** Default resolver: no worker wiring yet, so every job reports the empty/unknown summary rather than guessing. */
const noopSummaryResolver = { resolve: async () => EMPTY_SUMMARY };
/** Register the 4 `sast_batch_*` tools on the caller's tool registry. */
function registerSastBatchTools(ctx, store, config = {}, summaryResolver = noopSummaryResolver) {
	const reportRoot = config.reportRoot ?? "/tmp/dsh-sast-reports";
	ctx.tools.register(defineTool({
		name: "sast_start_batch",
		description: "Atomically create a durable multi-repo audit batch: 1..100 repositories, one job per repository, and (if named) every methodology pinned to a fixed manifest/content digest for the whole batch (A22). Any precheck failure — empty/oversized repository list, missing authorization, an unresolvable named methodology — aborts with zero rows written. Does not itself loop repositories or ask about a single job's problem afterward; the durable scheduler executes strictly one job at a time.",
		parameters: {
			repositories: {
				type: "array",
				required: true,
				description: "1..100 repository specs.",
				items: {
					type: "object",
					additionalProperties: false,
					properties: {
						repoUrl: {
							type: "string",
							required: true
						},
						provider: {
							type: "string",
							enum: PROVIDERS
						},
						branch: { type: "string" },
						ref: { type: "string" },
						scope: {
							type: "array",
							items: { type: "string" }
						},
						objective: { type: "string" }
					}
				}
			},
			objective: {
				type: "string",
				required: true,
				description: "The batch-wide completion judgement."
			},
			authorization: {
				type: "string",
				required: true,
				description: "Batch-wide authorization note."
			},
			methodologies: {
				type: "array",
				description: "User-named audit methodologies to pin for every job.",
				items: { type: "string" }
			},
			methodologyMode: {
				type: "string",
				enum: METHODOLOGY_MODES,
				description: "Default explicit-only."
			},
			policy: {
				type: "object",
				additionalProperties: true,
				properties: {
					maxAttempts: { type: "number" },
					cloneTimeoutMs: { type: "number" },
					jobTimeoutMs: { type: "number" },
					autoNarrowScope: { type: "boolean" },
					deduplicate: { type: "boolean" }
				}
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					batchId: {
						type: "string",
						required: true
					},
					total: {
						type: "number",
						required: true
					},
					status: {
						type: "string",
						required: true
					}
				}
			},
			render: (_a, v) => [{
				type: "text",
				text: `Created batch ${v.batchId} with ${v.total} job(s), status ${v.status}.`
			}]
		},
		execute: async (args, exec) => {
			const ownerSessionId = sessionIdOf(exec);
			const repositories = args.repositories;
			if (!Array.isArray(repositories) || repositories.length < 1 || repositories.length > 100) throw new Error("sast_start_batch requires between 1 and 100 repositories");
			const authorization = requiredString(args.authorization, "authorization");
			const objective = requiredString(args.objective, "objective");
			const methodologyNames = args.methodologies ?? [];
			const batchId = `batch-${ownerSessionId}-${Date.now()}`;
			let pinned = [];
			if (methodologyNames.length > 0) {
				const cwd = (exec.agent?.session)?.header?.cwd;
				const skills = ctx.get("skills");
				if (skills === void 0) throw new Error("sast_start_batch: no skill registry (ctx.skills) is composed on this agent; mount @deepseek-ai/dsh-tool-skill and a skill provider");
				pinned = await pinMethodologies({ resolve: async (name) => {
					return await skills.get(name, { cwd });
				} }, methodologyNames, {
					root: reportRoot,
					sessionId: ownerSessionId,
					batchId
				});
			}
			const provider = (repo) => {
				const explicit = repo.provider;
				if (explicit !== void 0) return explicit;
				return typeof repo.repoUrl === "string" && /^https?:\/\//i.test(repo.repoUrl) ? "gitlab" : "local";
			};
			const { batch } = await store.createBatch(batchId, {
				ownerSessionId,
				objective,
				authorization,
				methodologyMode: args.methodologyMode ?? "explicit-only",
				policy: args.policy,
				methodologies: await Promise.all(pinned.map(async (p) => {
					const artifact = await store.putReportArtifact(p.artifact);
					return {
						name: p.methodology.name,
						manifestDigest: p.methodology.manifestDigest,
						contentDigest: p.methodology.contentDigest,
						artifactId: artifact.id
					};
				})),
				repositories: repositories.map((repo) => ({
					provider: provider(repo),
					repoUrl: requiredString(repo.repoUrl, "repositories[].repoUrl"),
					branch: repo.branch,
					ref: repo.ref,
					scope: repo.scope,
					objective: repo.objective
				}))
			});
			config.onBatchCreated?.(batch.id, exec.agent?.options);
			return {
				batchId: batch.id,
				total: batch.total,
				status: batch.status
			};
		}
	}));
	ctx.tools.register(defineTool({
		name: "sast_batch_state",
		description: "Read the calling owner session's active batch: its cursor, aggregate counts, and a redacted per-job summary (ordinal, redacted repo/ref, status/reviewStatus, attempt, finding/coverage summary, fallback). Never returns the full per-repo audit graph of any job.",
		parameters: { batchId: {
			type: "string",
			description: "Explicit batch id; defaults to the calling session's most recently created batch."
		} },
		output: {
			schema: {
				type: "object",
				additionalProperties: true,
				properties: {
					batch: {
						type: "object",
						required: true,
						additionalProperties: true,
						properties: {}
					},
					jobs: {
						type: "array",
						required: true,
						items: {
							type: "object",
							additionalProperties: true,
							properties: {}
						}
					}
				}
			},
			render: (_a, v) => [{
				type: "text",
				text: `Batch ${v.batch.id}: ${v.batch.status}, ${v.jobs.length} job(s).`
			}]
		},
		execute: async (args, exec) => {
			const ownerSessionId = sessionIdOf(exec);
			const batch = args.batchId !== void 0 ? await store.getBatch(args.batchId) : await store.getBatchByOwner(ownerSessionId);
			if (batch === void 0) throw new Error("sast_batch_state: no batch found for this session");
			const jobs = await store.listJobs(batch.id);
			return {
				batch,
				jobs: await Promise.all(jobs.map(async (job) => ({
					ordinal: job.ordinal,
					repoUrl: job.repoSpec.repoUrl,
					...job.repoSpec.branch !== void 0 ? { branch: job.repoSpec.branch } : {},
					...job.repoSpec.ref !== void 0 ? { ref: job.repoSpec.ref } : {},
					status: job.status,
					reviewStatus: job.reviewStatus,
					attempt: job.attempt,
					...job.fallback !== void 0 ? { fallback: job.fallback } : {},
					...job.errorClass !== void 0 ? { errorClass: job.errorClass } : {},
					summary: await summaryResolver.resolve(job.id, job.workerSessionId)
				})))
			};
		}
	}));
	ctx.tools.register(defineTool({
		name: "sast_batch_report",
		description: "Generate the cross-repo batch report (markdown or json, default markdown). Every input appears exactly once; aggregate counts are the sum of each job's own summary. Persisted as a durable report_artifacts row. A call before every job reaches an execution terminal state still generates a snapshot (the report itself is not blocked on completion — callers should check sast_batch_state's job statuses to know whether it is final).",
		parameters: {
			format: {
				type: "string",
				enum: REPORT_FORMATS,
				description: "Report format (default markdown)."
			},
			batchId: {
				type: "string",
				description: "Explicit batch id; defaults to the calling session's most recently created batch."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					markdown: { type: "string" },
					json: {
						type: "object",
						additionalProperties: true,
						properties: {}
					},
					artifactId: {
						type: "string",
						required: true
					},
					uri: {
						type: "string",
						required: true
					},
					sha256: {
						type: "string",
						required: true
					},
					bytes: {
						type: "number",
						required: true
					}
				}
			},
			render: (_a, v) => [{
				type: "text",
				text: v.markdown ?? JSON.stringify(v.json)
			}]
		},
		execute: async (args, exec) => {
			const ownerSessionId = sessionIdOf(exec);
			const format = args.format ?? "markdown";
			const batch = args.batchId !== void 0 ? await store.getBatch(args.batchId) : await store.getBatchByOwner(ownerSessionId);
			if (batch === void 0) throw new Error("sast_batch_report: no batch found for this session");
			const jobs = await store.listJobs(batch.id);
			const rows = await Promise.all(jobs.map(async (job) => ({
				job,
				summary: await summaryResolver.resolve(job.id, job.workerSessionId)
			})));
			if (format === "json") {
				const json = buildBatchJsonReport(batch, rows);
				const written = await writeArtifact({
					root: reportRoot,
					sessionId: ownerSessionId,
					batchId: batch.id,
					kind: "batch-json",
					content: JSON.stringify(json, null, 2)
				});
				const artifact = await store.putReportArtifact(written);
				return {
					json,
					artifactId: artifact.id,
					uri: artifact.uri,
					sha256: artifact.sha256,
					bytes: artifact.bytes
				};
			}
			const markdown = buildBatchMarkdownReport(batch, rows);
			const written = await writeArtifact({
				root: reportRoot,
				sessionId: ownerSessionId,
				batchId: batch.id,
				kind: "batch-markdown",
				content: markdown
			});
			const artifact = await store.putReportArtifact(written);
			return {
				markdown,
				artifactId: artifact.id,
				uri: artifact.uri,
				sha256: artifact.sha256,
				bytes: artifact.bytes
			};
		}
	}));
	ctx.tools.register(defineTool({
		name: "sast_batch_resolve",
		description: "Finalize Review Inbox decisions for specific jobs (only reviewStatus=pending jobs are affected). \"retry\" puts the job back in the queue for the scheduler; \"accept-gap\" and \"confirm-skip\" write an append-only decision event and clear reviewStatus to accepted — neither ever rewrites the job's original error/fallback fields.",
		parameters: {
			batchId: {
				type: "string",
				description: "Explicit batch id; defaults to the calling session's most recently created batch."
			},
			decisions: {
				type: "array",
				required: true,
				items: {
					type: "object",
					additionalProperties: false,
					properties: {
						jobId: {
							type: "string",
							required: true
						},
						action: {
							type: "string",
							required: true,
							enum: RESOLVE_ACTIONS
						},
						reason: { type: "string" }
					}
				}
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: { applied: {
					type: "array",
					required: true,
					items: {
						type: "object",
						additionalProperties: true,
						properties: {}
					}
				} }
			},
			render: (_a, v) => [{
				type: "text",
				text: `Applied ${v.applied.length} decision(s).`
			}]
		},
		execute: async (args, exec) => {
			const ownerSessionId = sessionIdOf(exec);
			const batch = args.batchId !== void 0 ? await store.getBatch(args.batchId) : await store.getBatchByOwner(ownerSessionId);
			if (batch === void 0) throw new Error("sast_batch_resolve: no batch found for this session");
			const decisions = args.decisions;
			const applied = [];
			let requeued = false;
			for (const decision of decisions) {
				const job = await store.getJob(batch.id, decision.jobId);
				if (job === void 0) {
					applied.push({
						jobId: decision.jobId,
						action: decision.action,
						skipped: "job does not exist"
					});
					continue;
				}
				if (job.reviewStatus !== "pending") {
					applied.push({
						jobId: decision.jobId,
						action: decision.action,
						skipped: `reviewStatus is ${job.reviewStatus}, not pending`
					});
					continue;
				}
				if (decision.action === "retry") {
					await store.requeueForRetry(batch.id, job.id, decision.reason ?? "");
					requeued = true;
				} else {
					const reviewStatus = decision.action === "accept-gap" ? "accepted" : "confirmed-skip";
					await store.setReviewStatus(batch.id, job.id, reviewStatus, decision.reason ?? "");
				}
				applied.push({
					jobId: decision.jobId,
					action: decision.action
				});
			}
			if (requeued) config.onBatchResumed?.(batch.id);
			return { applied };
		}
	}));
}
//#endregion
//#region src/batch-plugin.ts
/** Plugin identity. */
const name = "sast-batch";
/**
* Services required before this plugin can register tools, claim/observe
* jobs, and create worker sessions. `sastStore` is NOT provided by this
* plugin itself — it is the sibling `sast` plugin's (`index.ts`) service —
* but it must still be declared here: Cordis only *waits* for a dependency
* before calling `apply()` when it is named in `inject`; an optimistic
* `ctx.get('sastStore')` at the top of `apply()` (with no `inject` entry)
* races the sibling row's own async provisioning and fails intermittently
* depending on plugin load order — reproduced against a real preset mount
* (`agentPreset.select` → `agent-preset-invalid`) even though the preset
* YAML lists the `sast` row before `sast-batch`; YAML row order is not a
* Cordis load-order guarantee.
*/
const inject = [
	"tools",
	"storageDomain",
	"sessions",
	"agents",
	"jobs",
	"sastStore"
];
/**
* Activate the durable batch control plane. Requires the sibling `sast`
* plugin (`index.ts`) to already be composed and to have provided its
* `SastStore` on `ctx.sastStore` — this plugin never opens its own `sast`
* domain (`DomainFacility.open` rejects a second open of the same name) —
* and provides `ctx.sastBatchLineageOf` back onto the SAME context so
* `index.ts`'s `sast_start_scan`/`sast_report` (composed on this same
* context) can auto-tag their durable rows with the calling worker's
* `(batchId, jobId)`.
*/
function apply(ctx, config) {
	const sastStore = ctx.sastStore;
	const domain = () => sastStore.openedDomain();
	const store = new BatchStore(domain, () => Date.now(), sastStore.artifactStore());
	const workerAgentOptionsByBatch = /* @__PURE__ */ new Map();
	const workerFactory = createAgentWorkerFactory(ctx, { agentOptions: (batchId) => {
		const override = workerAgentOptionsByBatch.get(batchId);
		if (override?.provider !== void 0 && override.model !== void 0) return {
			provider: override.provider,
			model: override.model
		};
		return config.workerAgentOptions;
	} });
	ctx.provide("sastBatchLineageOf", (sessionId) => workerFactory.lineageOf(sessionId));
	const outcomeResolver = createStoreBackedOutcomeResolver(domain, store);
	const summaryResolver = createStoreBackedSummaryResolver(domain);
	const runState = /* @__PURE__ */ new Map();
	/** Kick off (or resume) `DurableBatchScheduler.run(batchId)` as an unowned background job, so the triggering tool call never blocks on it. Coalesces concurrent requests for the same batch into one run followed by at most one more (see `runState`'s doc) — never two overlapping scheduler instances. */
	const runInBackground = (batchId) => {
		const existing = runState.get(batchId);
		if (existing !== void 0) {
			existing.rerunRequested = true;
			return;
		}
		const state = { rerunRequested: false };
		runState.set(batchId, state);
		ctx.jobs.start({
			kind: "sast-batch",
			label: `sast batch ${batchId}`,
			run: () => {
				const controller = new AbortController();
				return {
					cancel: () => controller.abort(),
					done: (async () => {
						let lastSummary;
						try {
							do {
								state.rerunRequested = false;
								const batch = await store.getBatch(batchId);
								if (batch === void 0) throw new Error(`sast-batch: batch ${batchId} does not exist`);
								const cwd = ctx.sessions.get(SessionId(batch.ownerSessionId))?.header.cwd;
								if (cwd === void 0) throw new Error(`sast-batch: owner session ${batch.ownerSessionId} of batch ${batchId} has no cwd (session may have been disposed)`);
								lastSummary = await new DurableBatchScheduler({
									store,
									workerFactory,
									outcomeResolver,
									promptBuilder: batchPromptBuilder({
										objective: batch.objective,
										authorization: batch.authorization,
										methodologyNames: batch.methodologies.map((m) => m.name)
									}),
									workspaceOf: async () => cwd
								}).run(batchId);
							} while (state.rerunRequested);
							return {
								status: "completed",
								detail: lastSummary?.failedClosed ? "fail-closed" : `${lastSummary?.results.length ?? 0} job(s) run`
							};
						} catch (error) {
							return {
								status: "failed",
								detail: error instanceof Error ? error.message : String(error)
							};
						} finally {
							workerAgentOptionsByBatch.delete(batchId);
							runState.delete(batchId);
						}
					})(),
					read: void 0
				};
			}
		});
	};
	registerSastBatchTools(ctx, store, {
		...config,
		onBatchCreated: (batchId, ownerAgentOptions) => {
			if (ownerAgentOptions !== void 0) workerAgentOptionsByBatch.set(batchId, ownerAgentOptions);
			config.onBatchCreated?.(batchId, ownerAgentOptions);
			runInBackground(batchId);
		},
		onBatchResumed: (batchId) => {
			config.onBatchResumed?.(batchId);
			runInBackground(batchId);
		}
	}, summaryResolver);
}
//#endregion
export { apply, inject, name };
