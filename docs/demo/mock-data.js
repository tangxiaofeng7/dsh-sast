/* dsh-sast UI demo — 写死的 mock 数据。
 * 字段与 docs/domain-model.md 的 storage domain `sast` 一一对应。
 * 没有后端、没有真实扫描：这里的每一条都是手写的假数据。 */

var MOCK = {};

/* ── scan（scans 表，一会话一行，id 恒为 scan-1） ───────────────── */
MOCK.scan = {
  id: 'scan-1',
  provider: 'gitlab',
  repoUrl: 'https://gitlab.corp.com/pay/gateway',
  branch: 'release-2.1',
  commit: 'a1b2c3d4e5f67890abcdef1234567890abcdef12',
  workspacePath: '$DSH_HOME/workspaces/sast/s-3ab1/gateway',
  objective: '审计认证与支付回调链路的安全性',
  scope: ['src/**', 'resources/**', 'pom.xml'],
  authorization: '由用户在会话中授权（安全组 2026-Q3 例行审计）',
  languages: 'java:412, xml:88, yaml:31',
  fileCount: 412
};

/* ── 会话列表：五行覆盖标签页可见性判定的四条命中路径 + 一条隐藏 ──
 * kind: primary 主审计会话（有完整投影）
 *       child   委派子会话（自身无 scan，投影为 null）
 *       mounted 重命名派生预设，靠 sastMounted 命中
 *       chain   自身无证据，靠祖先链命中
 *       none    无任何证据，标签隐藏 */
MOCK.sessions = [
  {
    id: 's-3ab1', name: 'pay/gateway 白盒审计', preset: 'sast', mounted: true, kind: 'primary',
    reason: '命中：预设名 = sast'
  },
  {
    id: 's-7f3a', name: '子任务：追踪订单查询污点链', preset: 'sast', mounted: true,
    parentId: 's-3ab1', kind: 'child',
    reason: '命中：预设名（子会话继承父预设）+ 自身日志有 sast_submit',
    note: '这是决策 agent 委派出去的审计子 agent 会话。它只调用 sast_submit 把结果直写父会话，自身从未调用 sast_start_scan，所以它自己的 sast 投影是 null —— 标签页显示，但内容为空。审计图始终只有一份，挂在父会话上。',
    conv: [
      { role: 'user', text: '【委派】父 intentId: intent-4。工作区 $DSH_HOME/workspaces/sast/s-3ab1/gateway（只读）。范围 src/web/** src/dao/** resources/mapper/**。任务：验证 OrderController.query 的 keyword 参数是否存在完整污点链。已知资产：asset-2 (module src/web)、asset-5 (entrypoint GET /api/order/query)。' },
      { role: 'assistant', text: '已定位 keyword 从控制器到 MyBatis 的三跳链路，无净化环节。' },
      { tool: 'sast_submit', text: 'Submitted 3 facts, 2 assets, and 1 findings to the parent session.' },
      { role: 'assistant', text: '提交完成：3 条事实、2 个资产、1 个漏洞（critical SQL 注入，三跳证据链已逐行读通）。' }
    ]
  },
  {
    id: 's-91c2', name: 'security-lab 例行审计', preset: 'audit-lab', mounted: true, kind: 'mounted',
    reason: '命中：预设名未命中，但本会话 sastMounted = true',
    note: '这是把 preset/sast 整目录复制后改名为 audit-lab 的派生预设。预设名判定不认识它，但本会话第一次请求时组装出了 sast_* 工具，sastMounted 被置真，标签页因此显示。—— 预设名不是能力，会话日志才是。',
    conv: [
      { role: 'user', text: '用 audit-lab 预设跑一下 internal/tooling 仓库。' },
      { role: 'assistant', text: '本会话已挂载白盒审计能力（sast_* 工具在目录中），但还没有开始扫描。给我仓库地址和分支我就开始。' }
    ]
  },
  {
    id: 's-2b7d', name: '子任务：审计鉴权与 CORS 配置', preset: 'audit-lab', mounted: false,
    parentId: 's-91c2', kind: 'chain',
    reason: '命中：自身无任何证据，靠祖先链（父会话 s-91c2）',
    note: '本会话自己的日志里没有 sast_* 证据（sastMounted = false），预设名也不命中。标签页显示的唯一依据是祖先链：沿 parentId 上溯到 s-91c2 命中。遍历带 seen 集合防环。',
    conv: [
      { role: 'user', text: '【委派】父 intentId: intent-3。任务：检查 SecurityFilterChain 与 CORS 配置。' },
      { role: 'assistant', text: '等待工作区路径。委派中未提供 workspacePath，无法开始读码。' }
    ]
  },
  {
    id: 's-5d40', name: '重构 order 模块', preset: 'standard', mounted: false, kind: 'none',
    reason: '不命中：预设 standard、无 sast_* 调用、祖先链无命中 → 标签隐藏',
    conv: [
      { role: 'user', text: '把 OrderService 里的分页逻辑抽成独立的 Pageable 工具类。' },
      { role: 'assistant', text: '好的。我先读一下 OrderService 现在的分页实现和它的调用方。' }
    ]
  }
];

/* ── 审计方法论（Skill）：审计清单不写死在协议里，由 skill 提供 ────
 * source: builtin  = bundle 内置示例方法论
 *         workspace= 受信编排工作区的 skill 目录（团队分发；不是被审计克隆）
 *         user     = 用户级 skill 目录（个人/组织常用）
 * 每个 check 是方法论的一条审计承诺；真实 agent 会按当前仓库动态创建 intent。
 * 本 Demo 的方法论、intent 与推进脚本仍全部是手写 mock。 */
MOCK.skills = [
  {
    id: 'spring-authz', name: 'Spring Security 鉴权与越权', source: 'builtin',
    category: 'config', enabled: true,
    desc: '按 Spring Security 的放行规则、方法级注解与资源归属校验三层排查鉴权缺陷',
    applies: 'java + spring-boot',
    checks: [
      { id: 'filter-chain', title: 'SecurityFilterChain 放行规则审计', scope: ['src/config/**'] },
      { id: 'method-annotation', title: '控制器方法级鉴权注解缺失', scope: ['src/web/**', 'src/pay/**'] },
      { id: 'idor-owner-check', title: '资源归属校验（IDOR / 水平越权）', scope: ['src/web/**', 'src/service/**'] }
    ]
  },
  {
    id: 'mybatis-sqli', name: 'MyBatis 注入', source: 'builtin',
    category: 'taint', enabled: true,
    desc: '定位 ${} 插值、动态 order by 与 like 拼接三类绕过预编译的写法',
    applies: 'java + mybatis',
    checks: [
      { id: 'dollar-interpolation', title: '${} 插值审计', scope: ['resources/mapper/**'] },
      { id: 'dynamic-orderby', title: 'order by 动态拼接', scope: ['resources/mapper/**', 'src/dao/**'] },
      { id: 'like-concat', title: 'like 条件字符串拼接', scope: ['src/dao/**'] }
    ]
  },
  {
    id: 'pay-callback', name: '支付回调验签清单', source: 'workspace',
    category: 'taint', enabled: true,
    desc: '团队自定义：支付回调必须过验签、金额校验与重放防护三关',
    applies: '本仓库 src/pay/**',
    checks: [
      { id: 'sign-verify', title: '回调验签是否可绕过', scope: ['src/pay/**'] },
      { id: 'amount-tamper', title: '金额篡改与入账幂等', scope: ['src/pay/**'] },
      { id: 'replay-guard', title: '重放攻击防护（tradeNo 去重）', scope: ['src/pay/**'] }
    ]
  },
  {
    id: 'java-deser', name: 'Java 反序列化', source: 'builtin',
    category: 'taint', enabled: false,
    desc: 'ObjectInputStream 入口与 fastjson autoType 配置',
    applies: 'java',
    checks: [
      { id: 'readobject', title: 'ObjectInputStream 反序列化入口', scope: ['src/**'] },
      { id: 'autotype', title: 'fastjson autoType 开关与白名单', scope: ['src/**', 'resources/**'] }
    ]
  },
  {
    id: 'secrets-scan', name: '硬编码凭证', source: 'user',
    category: 'config', enabled: false,
    desc: '源码与配置文件中的密钥、令牌、明文口令',
    applies: '任意语言',
    checks: [
      { id: 'hardcoded-key', title: '密钥 / 令牌硬编码为常量', scope: ['src/**'] },
      { id: 'config-plaintext', title: '配置文件明文口令', scope: ['resources/**'] }
    ]
  }
];

/* ── intents（审计意图） ───────────────────────────────────────
 * skillId / checkId 为空 = 内置流程（测绘、攻击面、依赖、复核）产出；
 * 非空 = 由启用的审计方法论的某条检查项驱动。 */
MOCK.intents = [
  { id: 'intent-1', title: '测绘控制器与路由', category: 'recon', scope: ['src/web/**'],
    detail: '识别 Spring MVC 控制器、请求映射与全局拦截器，登记为 entrypoint 资产',
    delegatedSessionId: 's-7f3a', anchor: { kind: 'spawns', from: 'scan-1' },
    skillId: '', checkId: '' },

  { id: 'intent-2', title: '枚举外部入口与文件操作面', category: 'attack-surface', scope: ['src/**'],
    detail: '定位上传/下载、反序列化、消息消费者与定时任务入口',
    delegatedSessionId: 's-8e02', anchor: { kind: 'spawns', from: 'scan-1' },
    skillId: '', checkId: '' },

  { id: 'intent-3', title: 'SecurityFilterChain 放行规则审计', category: 'config', scope: ['src/config/**', 'resources/**'],
    detail: '按 spring-authz 方法论的 filter-chain 检查项：逐条核对 permitAll / antMatchers 放行范围',
    delegatedSessionId: 's-2b7d', anchor: { kind: 'spawns', from: 'scan-1' },
    skillId: 'spring-authz', checkId: 'filter-chain' },

  { id: 'intent-4', title: '${} 插值审计（订单查询链路）', category: 'taint', scope: ['src/web/**', 'src/dao/**', 'resources/mapper/**'],
    detail: '按 mybatis-sqli 方法论的 dollar-interpolation 检查项，从 fact-1 的路由发现推导入口',
    delegatedSessionId: 's-7f3a', anchor: { kind: 'derived_from', from: 'fact-1' },
    skillId: 'mybatis-sqli', checkId: 'dollar-interpolation' },

  { id: 'intent-5', title: '回调验签是否可绕过', category: 'taint', scope: ['src/pay/**'],
    detail: '按 pay-callback 方法论的 sign-verify 检查项，从 fact-2 的无鉴权路由推导',
    delegatedSessionId: 's-4c19', anchor: { kind: 'derived_from', from: 'fact-2' },
    skillId: 'pay-callback', checkId: 'sign-verify' },

  { id: 'intent-6', title: '依赖已知漏洞审计', category: 'dependency', scope: ['pom.xml'],
    detail: '比对依赖清单与已知漏洞版本区间',
    delegatedSessionId: 's-6a03', anchor: { kind: 'spawns', from: 'scan-1' },
    skillId: '', checkId: '' },

  { id: 'intent-7', title: '复核路径拼接结论的可达性', category: 'verify', scope: ['src/web/**', 'src/util/**'],
    detail: '由 fact-7 的净化函数推导：确认 finding-5 是否被有效净化',
    delegatedSessionId: 's-8e02', anchor: { kind: 'derived_from', from: 'fact-7' },
    skillId: '', checkId: '' }
];

/* ── facts（代码事实，path 必填且必须真实存在） ────────────────── */
MOCK.facts = [
  { id: 'fact-1', intentId: 'intent-1', kind: 'route',
    path: 'src/web/OrderController.java', line: 38, endLine: 44, symbol: 'OrderController#query',
    detail: '暴露 GET /api/order/query，仅有 @PreAuthorize("isAuthenticated()")',
    snippet: '@GetMapping("/api/order/query")\npublic PageResult query(@RequestParam String keyword) {\n  return orderService.search(keyword);\n}',
    confidence: 0.95, source: 'llm' },

  { id: 'fact-2', intentId: 'intent-2', kind: 'route',
    path: 'src/pay/PayCallbackController.java', line: 26, endLine: 33, symbol: 'PayCallbackController#handle',
    detail: '暴露 POST /api/pay/callback，方法与类上均无鉴权注解',
    snippet: '@PostMapping("/api/pay/callback")\npublic String handle(@RequestBody CallbackDto dto) {\n  payService.settle(dto);\n  return "success";\n}',
    confidence: 0.9, source: 'llm' },

  { id: 'fact-3', intentId: 'intent-4', kind: 'source',
    path: 'src/web/OrderController.java', line: 42, symbol: 'query(String keyword)',
    detail: 'keyword 直接来自请求参数，无长度或字符集限制，用户完全可控',
    snippet: 'public PageResult query(@RequestParam String keyword) {',
    confidence: 0.95, source: 'llm' },

  { id: 'fact-4', intentId: 'intent-4', kind: 'sink', flowsFrom: 'fact-3',
    path: 'src/dao/OrderDao.java', line: 88, symbol: 'selectByKeyword',
    detail: 'keyword 未经处理拼接进 SQL 语句字符串',
    snippet: 'String sql = "select * from t_order where title like \'%" + keyword + "%\'";',
    confidence: 0.92, source: 'llm' },

  { id: 'fact-5', intentId: 'intent-4', kind: 'sink', flowsFrom: 'fact-4',
    path: 'resources/mapper/Order.xml', line: 15, symbol: 'selectByKeyword',
    detail: 'MyBatis 映射使用 ${keyword} 而非 #{keyword}，绕过预编译',
    snippet: '<select id="selectByKeyword" resultType="Order">\n  select * from t_order where title like \'%${keyword}%\'\n</select>',
    confidence: 0.98, source: 'llm' },

  { id: 'fact-6', intentId: 'intent-3', kind: 'config',
    path: 'src/config/WebSecurityConfig.java', line: 57, symbol: 'filterChain',
    detail: '/api/pay/** 被 permitAll()，与回调控制器缺少注解叠加为完全未鉴权',
    snippet: '.antMatchers("/api/pay/**").permitAll()',
    confidence: 0.93, source: 'llm' },

  { id: 'fact-7', intentId: 'intent-2', kind: 'sanitizer',
    path: 'src/util/FileNameValidator.java', line: 23, symbol: 'validate',
    detail: '对文件名做白名单校验，拒绝 .. 与路径分隔符',
    snippet: 'if (!NAME.matcher(name).matches()) throw new IllegalArgumentException("bad name");',
    confidence: 0.88, source: 'llm' },

  { id: 'fact-8', intentId: 'intent-3', kind: 'secret',
    path: 'src/pay/PayCallbackController.java', line: 81, lineAdjusted: true, symbol: 'SIGN_KEY',
    detail: '回调验签密钥以常量硬编码在控制器中',
    snippet: 'private static final String SIGN_KEY = "pay_gw_2021_default";',
    confidence: 0.9, source: 'llm' },

  { id: 'fact-9', intentId: 'intent-6', kind: 'dependency',
    path: 'pom.xml', line: 120, symbol: 'org.apache.logging.log4j:log4j-core',
    detail: 'log4j-core 2.14.0，落在 CVE-2021-44228 影响区间',
    snippet: '<dependency>\n  <artifactId>log4j-core</artifactId>\n  <version>2.14.0</version>\n</dependency>',
    confidence: 1, source: 'llm' },

  { id: 'fact-10', intentId: 'intent-2', kind: 'pattern',
    path: 'src/web/FileController.java', line: 31, symbol: 'download(String name)',
    detail: '下载接口以 name 参数拼接本地路径（是否可穿越取决于上游校验）',
    snippet: 'File f = new File(BASE_DIR + "/" + name);',
    confidence: 0.6, source: 'llm' }
];

/* ── findings（漏洞，codePath 至少一跳） ───────────────────────── */
MOCK.findings = [
  { id: 'finding-1', intentId: 'intent-4', title: '/api/order/query 存在 SQL 注入',
    severity: 'critical', vulnClass: 'injection', cwe: 'CWE-89', confidence: 0.95,
    description: 'keyword 参数从控制器一路拼接到 MyBatis 的 ${} 插值，未经过任何转义或参数化绑定，可读取整表并进行盲注。',
    codePath: [
      { path: 'src/web/OrderController.java', line: 42, symbol: 'query(String keyword)', note: '用户可控参数进入' },
      { path: 'src/dao/OrderDao.java', line: 88, symbol: 'selectByKeyword', note: '字符串拼接进入 SQL' },
      { path: 'resources/mapper/Order.xml', line: 15, symbol: 'selectByKeyword', note: '使用 ${} 而非 #{}，绕过预编译' }
    ],
    remediation: '改用 #{keyword} 参数化绑定；对 keyword 增加长度与字符白名单校验；为 t_order 查询增加只读账号。',
    poc: "GET /api/order/query?keyword=1' OR '1'='1",
    affectedAssetId: 'asset-5', status: 'confirmed', triageReason: '三跳链路已逐行读通，无任何净化环节',
    skillId: 'mybatis-sqli', checkId: 'dollar-interpolation' },

  { id: 'finding-2', intentId: 'intent-5', title: '/api/pay/callback 缺少鉴权与验签',
    severity: 'high', vulnClass: 'auth', cwe: 'CWE-306', confidence: 0.9,
    description: '安全配置对 /api/pay/** 放行，回调控制器又未校验签名，任意外部请求可直接触发入账逻辑。',
    codePath: [
      { path: 'src/config/WebSecurityConfig.java', line: 57, symbol: 'filterChain', note: '/api/pay/** permitAll' },
      { path: 'src/pay/PayCallbackController.java', line: 26, symbol: 'handle(CallbackDto)', note: '无验签直接进入 settle()' }
    ],
    remediation: '对回调改为验签放行而非 permitAll；校验商户签名、金额与订单幂等；拒绝重复 tradeNo。',
    poc: 'POST /api/pay/callback  {"tradeNo":"T1","amount":"0.01","status":"SUCCESS"}',
    affectedAssetId: 'asset-6', status: 'confirmed', triageReason: '配置与控制器双侧确认，无中间件补偿',
    skillId: 'pay-callback', checkId: 'sign-verify' },

  { id: 'finding-3', intentId: 'intent-3', title: '支付回调验签密钥硬编码',
    severity: 'high', vulnClass: 'secret', cwe: 'CWE-798', confidence: 0.85,
    description: '验签密钥以常量写死在源码中，随仓库分发；一旦泄漏即可伪造任意回调。',
    codePath: [
      { path: 'src/pay/PayCallbackController.java', line: 81, lineAdjusted: true, symbol: 'SIGN_KEY', note: '密钥硬编码为常量' }
    ],
    remediation: '迁移到配置中心或环境变量注入，并轮换现有密钥；在 CI 增加密钥扫描门禁。',
    poc: '', affectedAssetId: 'asset-4', status: 'open', triageReason: '',
    /* 顺带发现：子 agent 在审 filter-chain 时撞见的，不属于任何启用中的检查项。
       启用 secrets-scan 方法论后，这类结论会有对应的检查项归属。 */
    skillId: '', checkId: '' },

  { id: 'finding-4', intentId: 'intent-6', title: 'log4j-core 2.14.0 存在已知 RCE',
    severity: 'high', vulnClass: 'dependency', cwe: 'CWE-1104', confidence: 1,
    description: '依赖版本落在 CVE-2021-44228（Log4Shell）影响区间，且项目存在用户可控内容进入日志的路径。',
    codePath: [
      { path: 'pom.xml', line: 120, symbol: 'log4j-core', note: '声明版本 2.14.0' }
    ],
    remediation: '升级到 2.17.1 及以上；确认无其它传递依赖锁回旧版本。',
    poc: '', affectedAssetId: 'asset-8', status: 'open', triageReason: '',
    skillId: '', checkId: '' },

  { id: 'finding-5', intentId: 'intent-2', title: '文件下载接口路径穿越',
    severity: 'medium', vulnClass: 'path-traversal', cwe: 'CWE-22', confidence: 0.35,
    description: 'download 接口以 name 参数拼接本地路径，初判可通过 ../ 读取任意文件。',
    codePath: [
      { path: 'src/web/FileController.java', line: 31, symbol: 'download(String name)', note: 'name 参数拼接进 File 路径' }
    ],
    remediation: '（已判定为误报，无需修复）如后续移除校验，应改为按 id 查表取物理路径。',
    poc: 'GET /api/file/download?name=../../../../etc/passwd',
    affectedAssetId: '', status: 'false-positive',
    triageReason: '拼接前已由 FileNameValidator.validate 白名单校验（src/util/FileNameValidator.java:23），.. 与路径分隔符被拒绝，链路不可达',
    skillId: '', checkId: '' }
];

/* ── assets（代码资产） ───────────────────────────────────────── */
MOCK.assets = [
  { id: 'asset-1', type: 'repo', value: 'pay/gateway', meta: 'Java 17 / Spring Boot 2.7 / Maven' },
  { id: 'asset-2', type: 'module', value: 'src/web', meta: 'Spring MVC 控制器层', parentId: 'asset-1' },
  { id: 'asset-3', type: 'module', value: 'src/dao', meta: 'MyBatis 数据访问层', parentId: 'asset-1' },
  { id: 'asset-4', type: 'module', value: 'src/pay', meta: '支付与回调', parentId: 'asset-1' },
  { id: 'asset-5', type: 'entrypoint', value: 'GET /api/order/query', meta: '需登录；关联 1 个漏洞', parentId: 'asset-2' },
  { id: 'asset-6', type: 'entrypoint', value: 'POST /api/pay/callback', meta: '匿名可访问（permitAll）', parentId: 'asset-4', risky: true },
  { id: 'asset-7', type: 'entrypoint', value: 'GET /api/file/download', meta: '需登录；已做文件名白名单', parentId: 'asset-2' },
  { id: 'asset-8', type: 'package', value: 'log4j-core@2.14.0', meta: '存在已知漏洞 CVE-2021-44228', parentId: 'asset-1', risky: true },
  { id: 'asset-9', type: 'package', value: 'fastjson@1.2.83', meta: '当前版本无已知高危', parentId: 'asset-1' },
  { id: 'asset-10', type: 'file', value: 'resources/mapper/Order.xml', meta: 'MyBatis 映射，含 ${} 插值', parentId: 'asset-3', risky: true },
  { id: 'asset-11', type: 'datastore', value: 'MySQL order_db', meta: '应用账号具备写权限', parentId: 'asset-1' }
];

/* ── 覆盖率（按模块） ─────────────────────────────────────────── */
MOCK.modules = [
  { path: 'src/web',       inScope: 50, hotspot: '' },
  { path: 'src/dao',       inScope: 46, hotspot: '' },
  { path: 'src/pay',       inScope: 34, hotspot: '' },
  { path: 'src/config',    inScope: 18, hotspot: '' },
  { path: 'src/util',      inScope: 39, hotspot: 'src/util/CryptoUtil.java' },
  { path: 'resources',     inScope: 22, hotspot: '' },
  { path: '其它（未重点覆盖）', inScope: 203, hotspot: 'src/job/** 定时任务未审计' }
];

/* 每一步结束时各模块「已触达文件数」的快照增量：{ step: { module: touched } } */
MOCK.coverageAt = {
  8:  { 'src/web': 18 },
  14: { 'src/web': 34, 'src/pay': 9 },
  19: { 'src/config': 12, 'src/pay': 14 },
  25: { 'src/web': 46, 'src/dao': 21, 'resources': 9 },
  29: { 'src/dao': 28, 'resources': 14 },
  33: { 'src/pay': 19, 'src/util': 7 },
  38: { '其它（未重点覆盖）': 96 },
  42: { 'src/util': 7, '其它（未重点覆盖）': 118 }
};

/* ── 执行脚本：每一步 = 一条投影折叠事件（seq 即折叠序号） ───────
 * op: scan | intent | status | fact | finding | asset | triage | submit
 * 没有墙钟时间戳 —— 投影读不到 store 写入的时间（ADR-10）。 */
MOCK.script = [
  { op: 'scan' },
  { op: 'asset', id: 'asset-1' },

  { op: 'intent', id: 'intent-1' },
  { op: 'status', id: 'intent-1', status: 'running' },
  { op: 'intent', id: 'intent-2' },
  { op: 'status', id: 'intent-2', status: 'running' },

  { op: 'asset', id: 'asset-2' },
  { op: 'fact', id: 'fact-1' },
  { op: 'asset', id: 'asset-5' },
  { op: 'submit', session: 's-7f3a', facts: 1, assets: 2, findings: 0 },
  { op: 'status', id: 'intent-1', status: 'done' },

  { op: 'asset', id: 'asset-4' },
  { op: 'fact', id: 'fact-2' },
  { op: 'asset', id: 'asset-6' },
  { op: 'submit', session: 's-8e02', facts: 1, assets: 2, findings: 0 },

  { op: 'intent', id: 'intent-3' },
  { op: 'status', id: 'intent-3', status: 'running' },
  { op: 'fact', id: 'fact-6' },
  { op: 'fact', id: 'fact-8' },
  { op: 'finding', id: 'finding-3' },
  { op: 'submit', session: 's-2b7d', facts: 2, assets: 0, findings: 1 },

  { op: 'intent', id: 'intent-4' },
  { op: 'status', id: 'intent-4', status: 'running' },
  { op: 'asset', id: 'asset-3' },
  { op: 'fact', id: 'fact-3' },
  { op: 'fact', id: 'fact-4' },
  { op: 'asset', id: 'asset-10' },
  { op: 'fact', id: 'fact-5' },
  { op: 'finding', id: 'finding-1' },
  { op: 'submit', session: 's-7f3a', facts: 3, assets: 2, findings: 1 },
  { op: 'status', id: 'intent-4', status: 'done' },
  { op: 'asset', id: 'asset-11' },

  { op: 'intent', id: 'intent-5' },
  { op: 'status', id: 'intent-5', status: 'running' },
  { op: 'finding', id: 'finding-2' },
  { op: 'submit', session: 's-4c19', facts: 0, assets: 0, findings: 1 },
  { op: 'status', id: 'intent-5', status: 'done' },
  { op: 'status', id: 'intent-3', status: 'done' },

  { op: 'fact', id: 'fact-10' },
  { op: 'fact', id: 'fact-7' },
  { op: 'asset', id: 'asset-7' },
  { op: 'finding', id: 'finding-5' },
  { op: 'submit', session: 's-8e02', facts: 2, assets: 1, findings: 1 },
  { op: 'status', id: 'intent-2', status: 'done' },

  { op: 'intent', id: 'intent-6' },
  { op: 'status', id: 'intent-6', status: 'running' },
  { op: 'asset', id: 'asset-8' },
  { op: 'asset', id: 'asset-9' },
  { op: 'fact', id: 'fact-9' },
  { op: 'finding', id: 'finding-4' },
  { op: 'submit', session: 's-6a03', facts: 1, assets: 2, findings: 1 },
  { op: 'status', id: 'intent-6', status: 'blocked',
    note: 'pom.xml 的依赖版本由父 POM 管理，父 POM 不在本仓库，无法确认传递依赖的最终版本' },

  { op: 'intent', id: 'intent-7' },
  { op: 'status', id: 'intent-7', status: 'running' },
  { op: 'triage', id: 'finding-5', status: 'false-positive' },
  { op: 'triage', id: 'finding-1', status: 'confirmed' },
  { op: 'triage', id: 'finding-2', status: 'confirmed' },
  { op: 'status', id: 'intent-7', status: 'done' }
];
