//#region src/invariant.ts
const PACKAGE_NAME = "@tangxiaofeng7/dsh-sast";
const DOMAIN_NAME = "sast";
/** Tables whose records must reference an existing scan row of the session. */
const SCAN_OWNED_TABLES = [
	"intents",
	"facts",
	"findings",
	"assets",
	"edges"
];
/** A lowercase hex-encoded SHA-256 digest: exactly 64 hex characters. */
const SHA256_HEX_RE = /^[0-9a-f]{64}$/;
/** The source table an edge kind anchors on (validated for the same session). */
const SOURCE_TABLE_OF_EDGE = {
	spawns: "scans",
	yields: "intents",
	derived_from: "facts",
	proves: "intents",
	flows_to: "facts",
	parent: "assets"
};
/** The target table an edge kind points at. */
const TARGET_TABLE_OF_EDGE = {
	spawns: "intents",
	yields: "facts",
	derived_from: "intents",
	proves: "findings",
	flows_to: "facts",
	parent: "assets"
};
/** Cordis companion plugin name. */
const name = "sast-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/** Install the audit-graph checks against the open sast domain. */
const install = Object.assign((ctx, fail) => {
	ctx.on("domain/changed", (change) => {
		if (change.domain !== DOMAIN_NAME || change.operation !== "put") return;
		const domain = ctx.storage.form("domain").get(DOMAIN_NAME);
		if (domain === void 0) return fail(`domain/changed for '${DOMAIN_NAME}' emitted while that domain is not open`);
		if (change.table === "scans") {
			if (change.value.sessionId !== change.key) return fail(`scans row key '${change.key}' does not match its sessionId`);
			return;
		}
		if (change.table === "report_artifacts") {
			const artifact = change.value;
			if (artifact.id !== change.key) return fail(`report_artifacts row key '${change.key}' does not match its id`);
			if (!SHA256_HEX_RE.test(artifact.sha256)) return fail(`report_artifacts['${change.key}'].sha256 '${artifact.sha256}' is not a lowercase hex SHA-256 digest`);
			if (!Number.isInteger(artifact.bytes) || artifact.bytes < 0) return fail(`report_artifacts['${change.key}'].bytes ${artifact.bytes} is not a non-negative integer`);
			return;
		}
		if (!SCAN_OWNED_TABLES.includes(change.table)) return;
		const record = change.value;
		const scan = [...domain.table("scans").entries()].find(([, row]) => row.sessionId === record.sessionId);
		if (scan === void 0) return fail(`'${DOMAIN_NAME}'.'${change.table}'['${change.key}'] references unknown session '${record.sessionId}'`);
		const sameSession = (tableName, id) => {
			if (tableName === "scans") return scan[1].id === id;
			const row = domain.table(tableName).get(id);
			return row !== void 0 && row.sessionId === record.sessionId;
		};
		if (change.table === "edges") {
			const edge = record;
			if (!sameSession(SOURCE_TABLE_OF_EDGE[edge.kind], edge.sourceId)) return fail(`'${DOMAIN_NAME}'.edges['${change.key}'] ${edge.kind} source '${edge.sourceId}' is not a same-session ${SOURCE_TABLE_OF_EDGE[edge.kind]} row`);
			if (!sameSession(TARGET_TABLE_OF_EDGE[edge.kind], edge.targetId)) return fail(`'${DOMAIN_NAME}'.edges['${change.key}'] ${edge.kind} target '${edge.targetId}' is not a same-session ${TARGET_TABLE_OF_EDGE[edge.kind]} row`);
			return;
		}
		if (change.table === "findings") {
			const affectedAssetId = record.affectedAssetId;
			if (affectedAssetId !== void 0 && !sameSession("assets", affectedAssetId)) return fail(`'${DOMAIN_NAME}'.findings['${change.key}'] references unknown asset '${affectedAssetId}'`);
		}
	}, { global: true });
}, { inject: ["storage"] });
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns the installed registration's disposer after setup succeeds.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
