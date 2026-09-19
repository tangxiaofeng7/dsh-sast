# dsh-sast 架构总览

> 本文档是 `@tangxiaofeng7/dsh-sast` 的公开架构参考：领域模型、关键设计决策（ADR）、信任边界与
> 里程碑。产品需求见 [prd.md](prd.md)；工具与协议契约见 [tools-protocol.md](tools-protocol.md)。

## 1. 项目定位

`@tangxiaofeng7/dsh-sast` 是 DSH 白盒审计模式（White-box Audit Mode）：AI 驱动的 SAST，用户可输入
1～100 个代码仓库并指定自己/团队的白盒审计方法论；系统默认逐仓串行执行，动态生成任务与进度，安全
处理单仓阻塞，最后集中交付每仓报告、批次总报告和待确认项。

**术语**：「审计方法论（Audit Methodology）」= 用户/团队定义的白盒审计知识（查什么、怎么找、如何
判定、什么证据算完成）。它以 DSH 兼容 `SKILL.md` 打包，`ctx.skills` 只是可信承载机制；插件本身不
决定方法论内容。

## 2. 领域模型（storage domain `sast` v2）

domain `sast`，version 2，共十一表：单仓执行面七表 + 批次控制面四表。zod schema 在持久化边界逐条
校验。

### 一图概览

```
scan-1 ──spawns──▶ intent-1 ──yields──▶ fact-1 ──derived_from──▶ intent-3 ──proves──▶ finding-1
                        │                   │
                        │                   └──flows_to──▶ fact-4（污点传播：source → sink）
                        └──yields──▶ fact-2

asset-1 (repo) ──parent──▶ asset-2 (module) ──parent──▶ asset-3 (file) ──parent──▶ asset-4 (entrypoint)

skill:pay-callback ──check:sign-verify──▶ intent-4
                   └─check:replay-guard──▶ (todo，尚无 intent)
```

`skill` / `check` 不加入 `edges` 图——它们是清单快照，由 `intent.skillId/checkId` 引用。这让 `todo`
检查项在没有图节点时仍存在。

### 单仓七表

| 表 | 键 | 要点 |
| --- | --- | --- |
| `scans` | `sessionId`（恒 `scan-1`） | provider/脱敏 repoUrl/branch/commit/workspacePath/objective/scope/authorization/languages/fileCount；可选 `batchId/jobId`（仅批次 worker） |
| `skills` | `sessionId:id`（id=DSH Skill name） | 最小会话快照：title/source/sourceGroup/provider/category/applicability/checks/enabled/manifestDigest；**不存正文或绝对 path** |
| `intents` | `sessionId:id` | title/detail/category/scope/status/note/delegatedSessionId/skillId/checkId + 三时间戳（createdAt/startedAt/endedAt） |
| `facts` | `sessionId:id` | kind/path（必填、硬校验）/line/endLine/lineAdjusted/symbol/detail/snippet/confidence/source/engineRule/at |
| `findings` | `sessionId:id` | title/severity/vulnClass/cwe/confidence/description/codePath（≥1）/remediation/poc/status/triageReason/skillId/checkId/affectedAssetId/at/triagedAt |
| `assets` | `sessionId:id` | type（repo/module/file/entrypoint/package/datastore）/value/meta/at |
| `edges` | `sessionId:id` | kind/sourceId/targetId（6 种边） |

### 批次控制面四表

| 表 | 要点 |
| --- | --- |
| `batches` | ownerSession、目标/授权、固定方法论引用（含 digest/artifactRef）、不可变策略快照、状态、聚合计数 |
| `scan_jobs` | 唯一键 `(batchId, ordinal)`；脱敏 RepoSpec、workerSessionId、attempt、lease/deadline、终态、错误分类、fallback、coverageImpact、reviewStatus、报告 artifact id |
| `job_events` | append-only；claim/attempt/retry/fallback/降级/跳过/超时/报告固化/review 决策；`seq/at` 由 store 分配 |
| `report_artifacts` | 每仓 Markdown/SARIF/summary + 批次 Markdown/JSON 的 `uri/sha256/bytes/createdAt` |

### 枚举词汇

- `factKind`：`source | sink | sanitizer | route | config | dependency | secret | pattern | info`
- `severity`：`critical | high | medium | low | info`
- `vulnClass`：`injection | xss | deserialization | path-traversal | ssrf | auth | access-control | crypto | secret | config | dependency | dos | logic | other`
- `intentStatus`：`pending | running | done | blocked`（单调，禁止 `done→pending`）
- `intentCategory`：`recon | attack-surface | taint | config | dependency | verify | custom`
- `findingStatus`：`open | confirmed | false-positive | wont-fix`
- `assetType`：`repo | module | file | entrypoint | package | datastore`
- `edgeKind`：`spawns | yields | derived_from | proves | flows_to | parent`（`flows_to` 是污点传播边）
- `provider`：`gitlab | github | local`
- `skillSourceGroup`：`builtin | workspace | user`
- `factSource`：`llm | engine`（v1 恒 `llm`，为接外部引擎预留）
- **检查项状态不落字段**，从快照与 intent 推导：无 intent=`todo`、`pending`=`planned`、其余映射
  running/done/blocked。

### 状态机

**Job**：`queued → preparing → running → succeeded/degraded/skipped/failed/timed_out`（前五种是自动
执行终态，都释放队列推进下一仓）；`running` 可 `→ retry_wait → queued`；`cancelled`（用户取消）终结
job 且 batch 停止 claim 后续。

**Batch**：`queued → running → awaiting_review → completed | completed_with_issues`（用户重试部分
job 时回 `running`）。

### Store 纪律

确定性 id、内存 max-seq 缓存、每会话写队列（消除并发 id 竞争）、重置语义（先克隆成功→写 scan 行→
再清空旧图与 Skill 快照；失败时旧状态完整保留）、引用校验（同会话且存在）、节点+边原子写、提交全或
无回滚、数值序排序、dispose（先排空队列再关 domain 再清簿记）、键迁移（`sessionId:id` scoped 键）。

批次控制面新增纪律：Skill 可信解析（只接 name，从 `ctx.skills.get()` 权威解析）、Skill 快照稳定性
（同 digest 幂等，digest 变且无 intent 引用可替换，有引用则拒绝）、Skill 启停、检查项引用一致性、
Skill 容量护栏（每 Skill ≤256 checks、每会话 ≤64 Skills / 2048 checks）、**路径规范化与存在性硬校验**
（见 §4）、行号软钳制、片段截断（存储层 ≤2000 字符，投影 ≤240 字符预览）、裁决只改状态、状态单调性、
时钟注入（`now: () => number`）。

### 耐久层 vs 投影层（刻意不等同）

| 字段 | 耐久层（sqlite） | 投影层（`session/projection` 帧） |
| --- | --- | --- |
| `fact.snippet` | 完整（≤2000 字符） | 只有 `snippetPreview`（≤240 字符） |
| 时间戳 | 有，store 注入 | **无**——投影只看到 `tool/call` 事件 arguments |
| 记录条数 | 无上限 | 窗口：nodes 600 / assets 400 / edges 800 |
| Skill 快照 | 完整最小快照 | 同左，**不做滑动逐出**，由注册硬上限控体积 |

## 3. 信任边界与安全约束（最高优先级）

**审计不执行被审代码，且 agent 根本没有执行手段。**「没有 shell」是整套边界的支点。

### 路径硬校验（ADR-03）—— 抑制模型编造的核心手段

写 `fact` / `finding.codePath` 每一跳 / `asset`（file/module 类型）/ `sast_submit` 时：

1. 规范化：`\` → `/`、剥离前导 `./`、折叠重复 `/`；**拒绝**绝对路径、盘符前缀、`..` 段（防工作区
   逃逸）。
2. 解析为 `workspacePath + '/' + path`，要求**存在且是普通文件**（module 要求目录；不是符号链接）。
3. 不满足则**抛错且不落库**：`sast: path <p> does not exist in the scan workspace; only cite files
   you actually read`。
4. `line` 超出文件实际行数**不失败**，钳制到末行并置 `lineAdjusted: true`（软钳制）；`line: 0` 合法
   （整文件级）。

投影层**不镜像**路径校验（纯函数不碰文件系统），不会分叉——失败的调用不产生成功 `tool/call` 事件。

### 子 agent 无 shell（ADR-04）

预设子 agent 的 `toolFilter.deny` 列出：全部决策工具、`subagent`/`subagent_fork`。**不列**
`bash`/`pwsh`/`run_in_background`——预设从未在任何行注册这三个工具（没有 shell 行），而真实宿主的
`tools.restrict()` 对 `deny` 里任何未注册的工具名直接报错拒绝创建 agent（已在真实宿主验证：
`tools.restrict() names unknown global tools "bash", "pwsh", "run_in_background"`）；「不注册」
本身就是安全保证，在 `deny` 里重复列出是致命 bug 而非双重保险。子 agent 工具面收敛为：`tool-fs`
（只读）、`tool-fs-search`（ripgrep，白盒主力）、`sast_submit`、`tool-web`（`fetch: false` 仅搜索）、
`tool-skill`/`tool-todo` 等无副作用能力。**v1 不提供任何 git 历史工具**（与 `--depth 1` 浅克隆自洽）。


### 凭证管理（ADR-07）—— 安全硬要求

- 配置**只存环境变量名**（`gitlabTokenEnv`，默认 `SAST_GITLAB_TOKEN`），绝不存值。
- token 只经 `GIT_ASKPASS` 助手 + 环境变量传给 git 子进程：**不进 argv、不进 `.git/config`、不进
  日志**。
  - 助手脚本只 `echo $SAST_GIT_TOKEN`（脚本本身不含 token）；`GIT_TERMINAL_PROMPT=0`（认证失败立即
    失败不挂起）。
  - 克隆 URL 用 `https://oauth2@<host>/<ns>/<proj>.git`；结束后删脚本 + `git remote set-url origin
    <脱敏 URL>`。
- **明确不做**：不在会话中向用户索要 token（明文进会话日志不可接受）；**明确不用**
  `http.extraHeader="PRIVATE-TOKEN: ..."`（进程命令行 `ps` 可见）。
- **脱敏不变量**：入库/返回前剥离 URL 的 userinfo 与 `private_token`/`access_token` 查询参数；git
  stderr 转发给模型前过滤 token 字面量；投影/报告/错误信息一律用脱敏地址。

### 只读工作区加固（ADR-13）

| 约束 | 实现 |
| --- | --- |
| 没有执行手段 | 预设移除 `tool-bash`/`tool-pwsh`/`tool-jobs`；子 agent deny 列出决策工具/委派工具（不重复列 shell 工具名——它们从未注册，deny 一个未注册的工具名在真实宿主上是致命错误） |
| 工作区只读 | 克隆后去写权限（Windows 移除写 ACL；POSIX `chmod -R a-w`）；`tool-fs` 禁写该路径与仓库外路径 |
| 浅克隆 | `--depth 1 --single-branch --no-tags` |
| 禁 hooks | `-c core.hooksPath=<空目录>` |
| 不递归子模块 | `--no-recurse-submodules`（子模块是另一个仓库，应作独立 scan） |
| 不装依赖/不构建/不执行脚本/不出网 | 无 shell 即无手段；协议明令禁止；`tool-web` `fetch: false` |

### 方法论信任边界（ADR-14/15）

被审仓库是潜在恶意输入。Skill lookup 使用决策 agent **原有的受信 scope/cwd**，**不得把
`scan.workspacePath` 改成 Skill lookup cwd**；克隆目录里的 `.dsh/skills` / `.agents/skills` 不会被
自动加载。若团队要采用目标仓库携带的清单，先人工审阅，再复制或安装到受信 Skill 根。

## 4. ADR 决策速查（全部已锁定）

| ADR | 决定 |
| --- | --- |
| **01** 命名 | 包 `@tangxiaofeng7/dsh-sast` / 模式「白盒审计模式」/ 域 `sast` v2 / 工具前缀 `sast_` |
| **02** 主场景 | v1 **只做全量仓库审计**；MR/增量推到 v2，且不声明未实现的 `baseBranch` 参数 |
| **03** 代码位置 | `path` 不存在硬失败；`line` 超限软钳制并标注（见 §3） |
| **04** 子 agent 能力 | 无 shell、无 git 历史工具；只有只读 fs + ripgrep（见 §3） |
| **05** 污点链 | `flows_to` 一等边，虚线 + 区别色渲染 |
| **06** 外部引擎 | v1 不接外部静态分析引擎，但**现在就预留** `fact.source/engineRule`（v2 接入时 domain 不 bump） |
| **07** 凭证 | 环境变量名 + `GIT_ASKPASS`，不进 argv/.git/config/日志（见 §3） |
| **08** 启动方式 | 对话自然语言 + `/sast <repoUrl> [branch]`；浏览器保持只读投影 |
| **09** 报告 | 单仓 Markdown + SARIF；批次 Markdown/JSON + artifact manifest；**不做** MR 评论回写 |
| **10** 时间语义 | 耐久层 store 注入时钟（报告耗时真实墙钟）；投影层按 seq 序（顺序可靠，v1 时间线不显示墙钟） |
| **11** 投影窗口 | nodes 600 / assets 400 / edges 800；投影不带完整 snippet，只带 `snippetPreview` ≤240 |
| **12** 存储路由 | 保留 `routes.sast: sqlite`；共存冲突用测试 + README 手工合并说明（见 README） |
| **13** 工作区加固 | 只读浅克隆、禁 hooks、不执行代码（见 §3） |
| **14** 审计清单 | 阶段保留为骨架；检查内容来自 DSH Skill；每次 scan 另存**最小会话快照**（让 todo 可统计） |
| **15** 方法论语义 | 产品概念统一称「审计方法论」；内容由用户/团队定义，DSH Skill 只作可信承载 |
| **16** 多仓执行 | 1～100 仓、耐久 scheduler、v1 **固定 `concurrency=1`**、一仓一 worker session |
| **17** 阻塞处置 | 批次创建后**不因单仓问题追问**；安全重试→降级/跳过→继续；结束后集中确认；全局基础设施故障
  fail closed |

### 技术未知（spike）

| # | 未知 | 状态 |
| --- | --- | --- |
| spike-A | 会话日志是否带墙钟时间 | 不阻塞主线，影响时间线增强 |
| spike-B | 与其他插件的 storage route 是否互相覆盖 | 不阻塞，见 README 共存说明 |
| spike-C | nodeCap=600 的帧体积 | 退路：降 cap 或 fact 只留 path/line/kind |
| spike-D | 宿主能否创建/恢复/监督独立 repository worker session | **M5 硬闸门，已在本仓库测试环境验证通过**——见 §6 |

## 5. 七个里程碑

| 里程碑 | 交付物 | 判据 |
| --- | --- | --- |
| **M1** 单仓领域骨架 | 七表、14 单仓工具、方法论注册、路径校验、状态机、协议与无 shell 预设 | A3/A4/A5/A15/A16 |
| **M2** 仓库接入 | clone、凭证脱敏、只读沙箱、规模护栏、gitlab/github/local | A1/A2/A10/A11 |
| **M3** 单仓 UI | 投影、五标签、会话可见性、permalink、双覆盖率 | A6/A7/A8/A14 |
| **M4** 单仓报告 | 裁决、Markdown、SARIF、artifact 固化 | A9/A12/A17 |
| **M5** 批次控制面 | domain v2 四表、4 批次工具、DurableBatchScheduler、专用 worker、lease/recovery | A18/A19/A21/A25 |
| **M6** 批次 UI 与报告 | 批次投影、100 行总览、Review Inbox、聚合报告与 resolve/retry | A20/A22/A23/A24 |
| **M7** 交付 | bundle、release workflow、文档、截图、100 仓端到端测试 | A13 + 全部标准 |

单仓 M1 与批次 M5 是两道闸门：前者证明审计图可运行，后者证明自动化不是靠 prompt 循环。

## 6. spike-D：M5 的硬闸门

「宿主能否创建/恢复/监督独立 repository worker session」是 M5 的硬性验收前提。`ctx.agents.create/
resume` 是正确机制；`ctx.subagents.startContinuable` 产出的是 `origin: 'subagent'` 委派子 agent，
**明令禁止**用来冒充批次 worker——那条路没有耐久性和重启恢复，等于用 prompt 循环假装调度。

**已验证通过。** `@deepseek-ai/dsh-agent-loop`（提供 `ctx.agents.create/resume` 背后的 agent factory）
现已发布在 npm 上，与本仓库其余 DSH SDK 依赖同一版本线。`src/dsh-sast/tests/batch/worker-factory.spec.ts`
驱动真实的 `dsh-agent-loop` 包（配合确定性、无需 API key 的 `@deepseek-ai/dsh-llm-replay` 适配器，
不是手搓的假 `AgentFactory`）逐条验证了闸门要求的全部条目：worker session 的 id 与 owner 不同、
`origin !== 'subagent'`、`agentPreset`/`cwd` 正确传递、`cancel()` + deadline 能把挂起的 worker 打到
idle、`dispose()` 后 `resume({ resumeSessionId })` 能恢复同一 session。`src/dsh-sast/tests/batch/
batch-plugin.spec.ts` 进一步端到端驱动真实的 `sast-batch` 插件：真实的 `dsh-agent-loop` worker、真实的
`ctx.jobs` 后台调度、针对本地 git fixture 的真实克隆/扫描/报告循环。

`createAgentWorkerFactory`（`src/batch/worker.ts`）现在是这条闭环的真实实现：`ctx.agents.create()`
搭配 `meta.agentPreset: 'sast'`（组成与其他 repository worker 相同的只读、无 shell 工具面）与
`meta.cwd` = 批次 OWNER 自己的受信 cwd（**不是**该 job 自己的仓库克隆——ADR-14/15 要求 Skill 查找永远
走决策 agent 原有受信 cwd，若 worker 的 cwd 就是未审克隆本身，`sast_register_skill` 的方法论查找就会
解析到攻击者可控内容）。每个 worker 自己调用 `sast_start_scan` 克隆并扫描自己的那个仓库，与独立单仓
worker 完全一样；`sast_start_batch` 通过 `ctx.jobs` 把 `DurableBatchScheduler.run()` 作为无主
（unowned）后台任务发起，工具调用本身立即返回。

## 7. 与 Web 客户端的数据通路（零轮询）

- `sastBatch` 投影只带最多 100 行 job 摘要和最近事件，不携带各仓完整图。
- `sast` 投影按 worker session 折叠单仓日志；子 agent 提交实时进入父 worker 投影（合成 `tool/call`
  事件驱动）。
- 客户端**没有 sqlite 写入或轮询**；写操作通过受控工具执行。
- 标签页里的报告是投影视图（受窗口 cap 限制、片段是预览、无耗时）；`sast_report` 工具的报告读存储层
  （完整交付物）。

### 标签页可见性

命中任一即显示：(1) 当前会话或祖先链的预设名为 `sast` / `sast-*`；(2) 或当前会话 `sastMounted=true`。
祖先链带 `seen` 防环。普通 intent 子会话主动进入 SAST 但自身无 scan 时显示干净 null 空态。批次总览/
待确认两个子标签额外按 `sastBatch` 投影值（非空）门控，不按预设名硬编码——一个纯批次 owner 会话可能
从未自己调用 `sast_start_scan`。

## 8. 第三方组件

本项目自身代码遵循根目录 LICENSE（MIT）。`packages/dsh-storage-sqlite/` 是 vendored 的 sqlite 存储
后端构建产物（来自 DeepSeek Harness 上游 `@deepseek-ai/dsh-storage-sqlite@0.1.0-rc.6`），vendor 而非
声明为 npm 依赖的原因是 bundle 必须能从单一 tarball 完整安装。该组件按上游原始协议（MIT）随附协议
原文，见 `packages/dsh-storage-sqlite/LICENSE` 与同目录 `NOTICE`。
