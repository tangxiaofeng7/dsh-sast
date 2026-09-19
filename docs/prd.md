# dsh-sast 产品需求文档（PRD）

- 状态：M1–M7 全部实现，包括批次控制面的完整闭环（store/policy/methodology/scheduler/工具/投影/
  worker 工厂/UI）。spike-D 硬闸门（见 [architecture.md](architecture.md) §6）已在本仓库测试环境
  验证通过；在把批次自动化当作生产级能力对外宣布前，仍建议在自己的真实 DSH 部署里跑一次端到端验证
  （见 plan.md P6 的人工验证清单 V11-V15）
- 包名：`@tangxiaofeng7/dsh-sast`（ADR-01）
- 模式名：**白盒审计模式**（预设目录 `preset/sast`，storage domain `sast` v2）
- 批次范围：单次 1～100 仓，v1 默认且固定逐仓串行（ADR-16）

## 1. 背景与问题

传统 SAST 在真实工程里常见误报泛滥、过程黑盒和结论不可追溯。LLM agent 擅长读代码、理解业务语义并
解释推理，但也容易遗漏、编造或在长流程中丢失状态。`dsh-sast` 用强约束领域模型记录每一步，并把过程
实时投影到 UI；在单仓执行内核之外，再用宿主持久化批次控制面保证 100 仓自动化不依赖模型上下文。

## 2. 产品目标

| 目标 | 描述 | 可验证判据 |
| --- | --- | --- |
| G1 AI 执行 SAST | 用户只提供仓库、授权与可选方法论，系统自主完成测绘到报告 | 批次开始后无逐仓人工介入 |
| G2 用户方法论驱动 | 用户/团队定义“查什么、怎么找、如何判定” | 指定方法论可追溯到 digest；每仓任务按代码动态生成 |
| G3 过程可观测 | 随时看到批次和单仓在审什么、进度与覆盖缺口 | UI 零轮询刷新；每个 job/intent 有状态和产出 |
| G4 结论可追溯 | finding 必须有真实代码位置和证据链 | 路径不存在时拒绝落库（ADR-03） |
| G5 误报可裁决 | finding 支持 confirmed / false-positive 等裁决 | 报告保留裁决结果和理由 |
| G6 多仓无人值守 | 一次输入最多 100 仓，默认按顺序逐个执行 | 单仓失败不阻塞后续仓；重启可恢复 |
| G7 最终集中确认 | 执行中自动恢复/降级/跳过，结束后统一让用户处理缺口 | 总报告完整列出所有输入和待确认项 |
| G8 完整交付形态 | 单 tarball 自包含宿主插件、Web 客户端与存储后端 | `dsh plugin add` 一步安装，无额外依赖拉取 |

## 3. 目标用户与场景

### 用户角色

- **安全工程师**：使用自己或团队的方法论对一批仓库做深度审计。
- **研发 Owner**：复核单仓代码风险与证据链。
- **安全负责人**：需要每仓报告、批次汇总和未完成范围，不能把跳过误报为安全。

### 核心场景

**S1 单仓全量审计**

> 用户给出仓库和分支；系统只读克隆、识别技术栈、加载适用方法论、动态创建 intent、委派只读子 agent、
> 裁决 finding，输出 Markdown/SARIF。

**S2 用户指定白盒审计方法论**

> 用户指定 `company-authz` 和 `payment-callback`。它们是用户/团队维护的审计知识，不是 dsh-sast 写死
> 任务。DSH `ctx.skills` 只是可信承载机制；系统固定方法论版本，再根据每个仓库的 recon 结果动态生成
> 不同范围和数量的任务。

**S3 100 仓串行自动审计**

> 用户一次提供 100 个仓库。系统一次事务创建批次与 job，按 ordinal 严格串行；每仓使用独立 worker
> session。第 2 仓认证失败、第 50 仓超时、第 99 仓存在 unresolved blocked 时仍执行到第 100 仓，
> 最后统一报告成功、降级、跳过、失败和待确认项。

**S4 定向模块审计**

> 用户为某仓指定 `scope: src/auth/**`。覆盖率仅按范围内文件统计；批次中 RepoSpec 可分别覆盖 scope/ref。

**S5 增量 / MR 审计 — 后续版本**

> 相对 `baseBranch` 审 diff 及调用链。当前不在 `sast_start_scan` 中声明未实现参数。

### 非场景

- 不做 CI 强制门禁、GitLab MR 评论或 Code Quality 回写；SARIF 交由外部 CI 消费。
- 不做自动修复或提交 patch。
- 不执行被审代码，不安装依赖，不开放 shell，不递归子模块。
- 当前不接外部静态分析引擎；`facts.source/engineRule` 只做兼容预留。
- 审计方法论不能扩大工具权限、关闭路径/TLS 校验或把被审仓库自动提升为可信指令源。
- “无人值守”不包含绕过认证、授权或隔离。全局存储损坏等无法保证正确性的基础设施故障必须 fail closed。

## 4. 功能范围

### 4.1 输入与仓库接入

- 单仓支持 `sast_start_scan`；批次支持 `sast_start_batch.repositories[1..100]`。
- RepoSpec 支持 GitLab/GitHub URL 或本地绝对路径，以及 branch/ref/scope/objective 覆盖。
- 批次未指定 branch 时使用远端 HEAD，不在执行中追问；显式 ref 无效则记录并继续下一仓。
- 只读浅克隆，采集 commit、语言、规模、依赖清单和入口线索；凭证只通过 `GIT_ASKPASS` 环境注入。
- 规模护栏、默认排除 glob、禁 hooks、无子模块、无代码执行。

细节见 [architecture.md](architecture.md) §3（信任边界）与 [tools-protocol.md](tools-protocol.md) §2.1
（`sast_start_scan` 契约）。

### 4.2 耐久批次控制面

- `batches/scan_jobs/job_events/report_artifacts` 保存输入清单、游标、attempt、lease、deadline、错误、
  fallback、覆盖影响与报告引用；不依赖根 agent 记住第几个仓库。
- v1 批次 `concurrency=1`；单仓内部互不依赖 intent 仍可并发。
- 每仓独立 repository worker session 和工作区；同名项目不会碰撞，重复 `start_scan` 不会覆盖其它仓。
- 宿主 scheduler 原子 claim、续 lease、回收过期 worker；插件重启后从耐久游标继续。
- job 的成功、降级、跳过、失败、超时都是自动执行终态，都会释放队列执行下一仓；用户取消也终结 job，
  但 batch 会停止 claim 后续仓。
- active/awaiting_review 批次的工作区、固定方法论和报告 artifact 不受普通 LRU 清理。

权威设计见 [architecture.md](architecture.md) §2（批次控制面四表）与 §6（spike-D 硬闸门）。

### 4.3 单仓审计图

每个 repository worker 保留现有单仓图：

```text
scan → intent → fact → intent → finding
                └─ flows_to → fact
asset(repo → module → file → entrypoint/package)
```

- 一个 worker session 一个 `scan-1`；批次绝不在同一 session 中轮换 100 个 scan。
- intent 恰好锚定 scan 或 fact；fact/finding 路径必须在该 job 工作区真实存在。
- id 确定性；时间戳由 store 注入；所有引用同一 worker session 隔离。
- 单仓七表增加可选 `batchId/jobId` 关联，但批次 owner 只聚合摘要，不拼接 100 张完整图。

### 4.4 模型接口

共 18 个工具：

- 单仓 14 个：`sast_start_scan`、`sast_register_skill`、`sast_set_skill_enabled`、`sast_add_intent`、
  `sast_update_intent`、`sast_add_fact`、`sast_add_finding`、`sast_add_asset`、`sast_triage`、
  `sast_submit`、`sast_state`、`sast_graph`、`sast_coverage`、`sast_report`。
- 批次 4 个：`sast_start_batch`、`sast_batch_state`、`sast_batch_report`、`sast_batch_resolve`。

仓库队列由宿主 scheduler 执行，不由 LLM 轮询。repository worker 可用完整单仓决策工具；intent 子 agent
仍只有 `sast_submit` 写口。详见 [tools-protocol.md](tools-protocol.md)。

### 4.5 用户白盒审计方法论

审计方法论是用户/团队内容，以 DSH 兼容 `SKILL.md` 打包：frontmatter 的 `sast` 声明适用条件和 checks，
正文描述搜索、判定与证据要求。

- `ctx.skills` 负责受信发现和正文加载；SAST 负责扫描/批次快照，不造第二套 registry。
- 输入支持 `methodologies[]` 与 `explicit-only / explicit-plus-auto / auto`。
- 用户显式名称优先；未知/非法名称在批次创建前原子失败，不创建半批 jobs。
- 批次把显式方法论固定为 manifest/content digest + 本机内容寻址 artifact，100 仓使用同一版本。
- 被审克隆里的 Skill 不自动加载。
- 每个 check 创建一个动态根 intent；额外验证可由事实派生。检查项状态和双维覆盖率从成功事件推导。
- 固定的是权限角色和阶段分类，不是任务清单。intent 数量、范围、状态、finding 和覆盖率按仓动态变化。

当前 Demo 的方法论、intent、fact、finding 和推进脚本均为写死 mock，仅检查状态/指标等在前端推导。

### 4.6 无人值守阻塞策略

批次创建前只对无法形成合法批次的信息追问（空列表、超过 100、授权缺失、显式方法论无效）。创建成功后：

1. 对临时网络/宿主错误做有上限退避重试；
2. 在安全边界内尝试替代搜索路径、缩小假设或继续可执行 checks；
3. 记录 fallback 和 coverageImpact，归为 degraded/skipped/failed/timed_out；
4. 固化单仓 summary/报告并立即继续下一仓；
5. 全部仓结束后集中显示 Review Inbox。

认证失败不猜凭证，ref 无效不擅自审别的分支，超限不静默缩 scope，证据不足不宣称“无漏洞”。
单仓 unresolved `blocked` 归纳为 degraded，不阻塞队列。

### 4.7 Web 可观测性

单仓仍有审计链路、漏洞、代码资产、方法论与任务、报告五个标签。新增批次总览：

- 总进度、当前 ordinal、状态分布；
- 最多 100 行仓库状态、attempt、覆盖、finding、fallback 和待确认标记；
- 当前 job 跳转到对应 worker 的单仓视图；
- Review Inbox 集中展示降级、跳过、失败、超时、blocked 与未审范围；
- 批次 Markdown/JSON 和每仓报告/SARIF artifact。

浏览器仍是只读投影消费者；写操作通过受控工具执行。当前 Demo 只实现单仓 mock，不宣称批次 UI 已完成。

### 4.8 报告与最终确认

- 单仓 Markdown/SARIF 保留元数据、方法论/check、双覆盖率、finding、误报、资产和链路。
- 批次报告必须让每个输入 ordinal 恰好出现一次，列出状态、attempt、方法论 digest、finding、覆盖、
  fallback、未审范围和报告链接。
- 未扫描或降级范围标为 unknown，不能并入“无漏洞”。
- 全部 job 到执行终态后进入 `awaiting_review`。用户可接受缺口、确认跳过或只重试指定 job；其它成功仓不重跑。

## 5. 验收标准

**每一条都必须有对应测试才能标记为通过（plan.md P6：不允许在没有对应测试的情况下标记通过）。**
「测试覆盖」列给出具体文件与 `it()` 描述，全部可用 `npm test` 复验。

| # | 标准 | 测试覆盖 |
| --- | --- | --- |
| A1 | 单仓 URL + ref 可无人值守完成并产出 Markdown/SARIF | `src/dsh-sast/tests/tools.spec.ts`「clones a remote repository...」+「defaults to markdown and includes header metadata...」+「emits a SARIF 2.1.0 log with one result per finding」 |
| A2 | 克隆后展示仓库、ref、commit、语言和规模 | `src/dsh-sast/tests/tools.spec.ts`「clones a remote repository, hardens it read-only, and records the redacted URL and resolved commit/branch」+ `src/dsh-sast/tests/ingest/metadata.spec.ts`（语言/manifest/entrypoint 探测） |
| A3 | finding 无 `codePath` 时拒绝落库 | `src/dsh-sast/tests/tools.spec.ts`「rejects an empty codePath」 |
| A4 | 不存在/逃逸路径在 fact/finding/submit 中硬失败且无部分写入 | `src/dsh-sast/tests/paths.spec.ts`（25 项规范化/拒绝用例）+ `src/dsh-sast/tests/tools.spec.ts`「rejects a codePath hop pointing outside the workspace, indexed」 |
| A5 | 行号超限钳制并标注 | `src/dsh-sast/tests/paths.spec.ts` + `src/dsh-sast/tests/tools.spec.ts`（`lineAdjusted` 相关用例） |
| A6 | 代码位置生成正确 GitLab/GitHub permalink | `src/dsh-client-ui-sast/tests/permalink.client.spec.ts`（全部 9 项：GitLab/GitHub blob、行区间、`local` 返回 `undefined`、未解析 commit） |
| A7 | 子 agent 提交后父会话投影零刷新更新 | `src/dsh-sast/tests/projection.spec.ts`「replays a delegated submission and ignores malformed submission entries」+「replays the full parent log in seq order: turn-0 synthetic submissions fold after their anchors」 |
| A8 | 单仓 UI 显示方法论/check 状态、文件覆盖、检查完成度、intent 状态和产出 | `src/dsh-client-ui-sast/tests/sast-views.client.spec.tsx`（TasksView 相关用例）+ `src/dsh-sast/tests/coverage.spec.ts` |
| A9 | 误报移出主结论但保留理由 | `src/dsh-sast/tests/tools.spec.ts`「moves a triaged false-positive into SARIF suppressions without dropping the result」+「moves a triaged false-positive into the markdown excluded section」 |
| A10 | token/密码不进入返回、日志、投影、报告或 `.git/config` | `src/dsh-sast/tests/ingest/credentials.spec.ts` + `src/dsh-sast/tests/ingest/clone.spec.ts` + `src/dsh-sast/tests/ingest/url.spec.ts`（21 项合计） |
| A11 | 执行 agent 无 shell/后台任务/写工作区能力 | `tests/bundle.spec.ts`「agent.cordis.yml has no shell rows at all (ADR-04)」+「every subagent tool row denies every decision tool, delegation, and every shell/background-job tool」+ `src/dsh-sast/tests/ingest/sandbox.spec.ts`（只读加固） |
| A12 | SARIF 2.1.0 合法且 repository provenance 正确 | `src/dsh-sast/tests/report/sarif.spec.ts`「emits a well-formed SARIF 2.1.0 log envelope」+「carries versionControlProvenance with the redacted repoUrl and commit sha」 |
| A13 | 单 tarball 安装并注册预设 | `tests/bundle.spec.ts`（exports 存在性 + `files` 覆盖 + tarball 内容断言）；**单 tarball 安装本身仍需人工验证，见 P6 V11** |
| A14 | 会话标签可见性遵循预设/mounted/祖先链 | `src/dsh-client-ui-sast/tests/sast-apply.client.spec.ts`（预设名/mounted/祖先链/防环全部用例） |
| A15 | 方法论 3 checks 在无 intent 时显示 3 todo，执行后动态迁移状态 | `src/dsh-sast/tests/coverage.spec.ts`「derives todo for a check with no intent」+「derives planned for a pending intent」等状态推导用例 |
| A16 | 方法论只能从受信 `ctx.skills` 注册；非法定义不产生部分快照 | `src/dsh-sast/tests/skill-manifest.spec.ts`（拒绝非法 manifest 的全部用例）+ `src/dsh-sast/tests/tools.spec.ts`「rejects a Skill whose metadata.sast is missing or malformed」 |
| A17 | SARIF 有方法论归属时使用 `<skillId>/<checkId>` ruleId | `src/dsh-sast/tests/report/sarif.spec.ts`「maps a methodology-associated finding to ruleId = skillId/checkId」+「falls back ruleId to cwe, then vulnClass, then unclassified...」 |
| A18 | 一次输入 100 仓，按 ordinal 严格串行，任一时刻最多一个 repository worker running | `src/dsh-sast/tests/batch/scheduler.spec.ts`（小 N 单测）+ **`src/dsh-sast/tests/e2e/batch-100.spec.ts`「A18: strictly serial by ordinal...」（真实 100 仓）**；真实 worker 会话由 `src/dsh-sast/tests/batch/worker-factory.spec.ts`（spike-D）+ `src/dsh-sast/tests/batch/batch-plugin.spec.ts`（真实 `sast-batch` 插件端到端，2 仓）验证 |
| A19 | 第 2/50/99 仓分别认证失败/超时/blocked 时仍执行到第 100 仓 | `src/dsh-sast/tests/batch/scheduler.spec.ts`（小 N 单测，每种失败类别独立用例）+ **`src/dsh-sast/tests/e2e/batch-100.spec.ts`「A19: ordinal 2 (auth), 50 (timeout), and 99 (blocked)...」（真实 100 仓，三种故障同批注入）** |
| A20 | 每个输入在总报告恰好出现一次；聚合计数等于各 job summary 之和 | `src/dsh-sast/tests/batch/report.spec.ts`「totals equal the sum of each job's own findingsBySeverity (A20)」+ `src/dsh-sast/tests/batch/tools.spec.ts`「every input appears exactly once (A20)」+ **`src/dsh-sast/tests/e2e/batch-100.spec.ts`「A20: the batch job table lists every one of the 100 inputs exactly once...」** |
| A21 | 中途重启后回收 lease 并继续；已完成且报告 digest 有效的 job 不重跑 | `src/dsh-sast/tests/batch/store.spec.ts`（lease claim/renew/recover 全部用例）+ `src/dsh-sast/tests/batch/scheduler.spec.ts`「A21: does not re-run an already-terminal job」+ **`src/dsh-sast/tests/e2e/batch-100.spec.ts`「A21: a simulated process restart recovers ordinal 50's abandoned lease...」（真实进程重启模拟 + 100 仓规模）** |
| A22 | 用户显式方法论在整批使用同一 digest；源文件中途变化不影响后续仓 | `src/dsh-sast/tests/batch/methodology.spec.ts`「produces the same contentDigest for the same body...」+「a resolver that has changed since an earlier pin produces a different digest for a NEW pin (the earlier batch's already-computed digest is a value, not a live reference)」 |
| A23 | 所有自动 fallback、scope 收窄、跳过和未审范围进入 Review Inbox | `src/dsh-client-ui-sast/tests/batch-views.client.spec.tsx`「shows a skipped job's fallback text, and never renders a "0 findings" claim for it (A23)」+「marks an unaudited job (no fallback text) with the unaudited badge, not a success-shaped status」 |
| A24 | 用户只重试一个失败 job 时，其它 job 不重跑，原失败事件仍保留 | `src/dsh-sast/tests/batch/store.spec.ts`「setReviewStatus never touches status/errorClass/fallback (A24)」+ `src/dsh-sast/tests/batch/tools.spec.ts`「accept-gap and confirm-skip never rewrite the original errorClass/fallback (A24)」+「only retries the specified job — other pending jobs are untouched」 |
| A25 | 批次执行期间不因单仓问题询问用户；仅全局基础设施故障 fail closed | `src/dsh-sast/tests/batch/scheduler.spec.ts`「A25 fail-closed only for infra-class failures」 |

**A18–A25（批次，8 条）现状**：全部有对应测试且全绿，包括真实 100 仓规模的端到端验证
（`e2e/batch-100.spec.ts`）。这些测试使用注入的 fake `RepositoryWorkerFactory`/`JobOutcomeResolver`，
证明的是 store/scheduler 这一层的正确性，与规模无关。spike-D 本身（宿主能否真实创建/恢复独立 worker
session）已单独验证通过——见 `src/dsh-sast/tests/batch/worker-factory.spec.ts`（驱动真实
`@deepseek-ai/dsh-agent-loop`）与 `src/dsh-sast/tests/batch/batch-plugin.spec.ts`（真实 `sast-batch`
插件端到端：真实 worker、真实 `ctx.jobs` 后台调度、针对本地 fixture 的真实克隆/扫描/报告）。

## 6. 里程碑

| 里程碑 | 交付物 | 判据 |
| --- | --- | --- |
| **M1 单仓领域骨架** | 原七表、14 个单仓工具、方法论注册、路径校验、状态机、协议与无 shell 预设 | A3/A4/A5/A15/A16 |
| **M2 仓库接入** | clone、凭证脱敏、只读沙箱、规模护栏、GitLab/GitHub/local | A1/A2/A10/A11 |
| **M3 单仓 UI** | 投影、五标签、会话可见性、permalink、双覆盖率 | A6/A7/A8/A14 |
| **M4 单仓报告** | 裁决、Markdown、SARIF、artifact 固化 | A9/A12/A17 |
| **M5 批次控制面** | domain v2 四表、4 个批次工具、DurableBatchScheduler、专用 worker、lease/recovery | A18/A19/A21/A25 |
| **M6 批次 UI 与报告** | 批次投影、100 行总览、Review Inbox、聚合报告与 resolve/retry | A20/A22/A23/A24 |
| **M7 交付** | bundle、release workflow、文档、截图、100 仓端到端测试 | A13 + 全部标准 |

批次不是靠 prompt 循环实现；M5 必须通过宿主持久调度与重启恢复后才能宣称支持 100 仓。

## 7. 风险

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| LLM 编造代码位置 | 结论不可信 | codePath + 工作区路径硬校验 |
| 方法论被误解为固定任务 | 用户无法表达自己的审计方式 | 明确“用户内容/DSH 载体”；任务按仓动态；Demo 标记 mock |
| 方法论扫描中途变化 | 100 仓口径不一致 | 批次固定 manifest/content digest 和只读 artifact |
| 被审仓库提示注入 | 扩权或污染方法论 | 克隆不作为 Skill root；无 shell；方法论不能改权限 |
| LLM 上下文承担队列 | 中断后丢仓、重复扫描 | scheduler + sqlite jobs + lease + artifact |
| 单仓阻塞拖死整批 | 自动化失败 | 有界重试、degraded/skipped 终态、继续下一个、最终集中确认 |
| 自动 fallback 掩盖覆盖缺口 | 报告虚假完整 | 强制记录 coverageImpact，unknown 不计为安全 |
| 100 仓占用磁盘 | 工作区/报告被提前清理 | active batch pin + retention + 完成后 LRU |
| 大仓上下文爆炸 | 成本/超时 | 规模护栏、子 agent checkpoint、主 agent 只收摘要、job deadline |
| 凭证泄漏 | 严重安全事故 | GIT_ASKPASS、URL/stderr 脱敏、A10 硬验收 |
| 全局存储/隔离故障仍继续 | 数据串仓或丢失 | fail closed；这类故障不适用“跳过继续” |
