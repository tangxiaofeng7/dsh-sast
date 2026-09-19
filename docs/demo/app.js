/* dsh-sast UI demo — 渲染与交互。纯前端，无网络请求。
 * 刻意照搬 docs 里的两处设计：
 *  1. graph.ts 的 depthsOf(BFS) + stackByDepth 分层布局；
 *  2. 受限 Markdown 渲染（只认固定子集，全程 textContent，绝不 innerHTML 数据）。 */

/* ══ i18n ══════════════════════════════════════════════════════ */
var DICT = {
  zh: {
    'view.conversation': '对话', 'view.sast': '白盒审计',
    'tab.explore': '审计链路', 'tab.findings': '漏洞', 'tab.assets': '代码资产',
    'tab.tasks': '任务与进度', 'tab.report': '报告',
    'empty.title': '尚未开始审计',
    'empty.body': '在对话中给出 GitLab 仓库地址与分支（或使用 /sast 命令）。决策 agent 会调用 sast_start_scan 完成只读浅克隆并开始测绘。',
    'empty.nullProjection': '本会话的 sast 投影为 null',
    'empty.nullBody': '标签页显示，但内容为空 —— 这个会话自己没有调用过 sast_start_scan。',
    'empty.why': '为什么标签页在这里可见？',
    'empty.rule': '判定结果：',
    'pb.onlyPrimary': '重放只作用于主审计会话（s-3ab1）',
    'demo.tag': '演示',
    'demo.pathcheck': '路径硬校验（ADR-03）：模型引用了工作区里不存在的文件会怎样？',
    'demo.show': '看一眼', 'demo.hide': '收起',
    'reject.badge': '写入被拒绝',
    'reject.head': '整条 finding 未落库，没有部分写入',
    'reject.call': '模型发起的调用',
    'reject.err': '工具层抛出的错误',
    'reject.n1': '路径必须规范化后在工作区内真实存在且是普通文件，否则整条写入被拒。',
    'reject.n2': '第 2 跳的文件名是模型按命名习惯猜的（真实文件叫 OrderDao.java），这类编造就是被这道闸门拦下的。',
    'reject.n3': '行号写错不会失败：超出文件行数时钳制到末行并标注「行号已校正」——下面 finding-3 的第一跳就是这种情况。',
    'hdr.objective': '目标', 'hdr.scope': '范围', 'hdr.scopeAll': '全仓',
    'hdr.size': '规模', 'hdr.auth': '授权', 'hdr.authNone': '未声明', 'hdr.files': '个文件',
    'count.intents': '意图', 'count.facts': '事实', 'count.findings': '漏洞', 'count.assets': '资产',
    'count.window': '窗口视图',
    'count.windowTip': '投影只保留最近 600 节点 / 400 资产 / 800 边，代码片段为 240 字符预览。完整记录以 sast_report 为准。',
    'cov.label': '覆盖率', 'cov.of': '已触达 {a} / 范围内 {b} 个文件',
    'stage.recon': '测绘', 'stage.attack-surface': '攻击面', 'stage.taint': '污点审计',
    'stage.config': '配置', 'stage.dependency': '依赖', 'stage.verify': '复核',
    'stage.custom': '自定义',
    'stage.ready': '准备中', 'stage.allDone': '已完成', 'stage.blocked': '存在阻塞',
    'skills.title': '用户审计方法论',
    'skills.hint': '“查什么、怎么找、如何判定”由用户/团队方法论提供；DSH SKILL.md / ctx.skills 只是受信承载机制。本 Demo 数据写死，仅状态与指标按 mock intent 推导。',
    'skills.included': '检查项已纳入', 'skills.completed': '已完成',
    'skills.enabled': '已启用', 'skills.disabled': '未启用',
    'skills.src.builtin': '内置基线', 'skills.src.workspace': '团队方法论', 'skills.src.user': '用户方法论',
    'skills.checks': '项', 'skills.applies': '适用',
    'skills.genOne': '模拟生成审计意图', 'skills.genAll': '模拟生成全部未覆盖意图',
    'skills.check.done': '已完成', 'skills.check.running': '进行中',
    'skills.check.planned': '已计划', 'skills.check.blocked': '阻塞',
    'skills.builtinFlow': '内置流程',
    'skills.add': '+ 模拟添加用户方法论',
    'skills.added': '已在 Demo 内存中添加方法论',
    'skills.form.name': '方法论 id（kebab-case）', 'skills.form.cat': '类别',
    'skills.form.desc': '一句话说明', 'skills.form.descPh': '例如：本团队多租户越权审计方法',
    'skills.form.checks': '检查项，每行一条：标题 | 路径 glob（glob 可省略）',
    'skills.form.hint': '这里只修改浏览器内存。目标产品由用户在受信根维护方法论 SKILL.md，ctx.skills 负责发现，SAST 按 digest 固定；被审克隆不会成为方法论来源。',
    'skills.form.submit': '模拟添加并启用', 'skills.form.cancel': '取消',
    'skills.form.err': '请填写方法论 id 和至少一条检查项',
    'skills.form.dup': '该方法论 id 已存在',
    'skills.form.noDesc': '（无说明）', 'skills.form.userAdded': '本次 Demo 临时添加',
    'skills.howto': '真实使用：把用户/团队审计方法论写成 SKILL.md，安装到受信 workspace/user 根；DSH 只负责加载，方法论内容不由 dsh-sast 写死。批次开始后按 digest 固定版本。',
    'tasks.notDelegated': '尚未委派',
    'kind.scan': '扫描', 'kind.intent': '意图', 'kind.fact': '事实', 'kind.finding': '漏洞',
    'edge.spawns': '意图链', 'edge.yields': '产出', 'edge.derived_from': '推导自',
    'edge.proves': '证实', 'edge.flows_to': '污点流', 'edge.parent': '隶属',
    'graph.empty': '尚未展开审计链路：等待第一个审计意图与代码事实。',
    'graph.fit': '适应窗口', 'graph.reset': '复位',
    'legend.chain': '链路推进', 'legend.flow': '污点传播（flows_to）',
    'legend.hint': '滚轮缩放 · 拖拽平移 · 点击节点看详情',
    'fact.adjusted': '行号已校正',
    'drawer.title': '节点详情', 'drawer.close': '关闭详情',
    'field.kind': '类型', 'field.detail': '说明', 'field.location': '代码位置',
    'field.symbol': '符号', 'field.confidence': '置信度', 'field.snippet': '代码片段预览',
    'field.severity': '风险等级', 'field.cwe': 'CWE', 'field.class': '漏洞类别',
    'field.status': '状态', 'field.category': '意图类别', 'field.scope': '范围',
    'field.session': '执行子会话', 'field.assetType': '资产类型', 'field.assetValue': '资产值',
    'field.meta': '元数据', 'field.source': '证据来源', 'field.skill': '审计方法论 / 检查项',
    'act.copy': '复制', 'act.copyLoc': '复制位置', 'act.gitlab': 'GitLab ↗',
    'filter.severity': '严重度', 'filter.status': '裁决状态', 'filter.all': '全部',
    'status.open': '待裁决', 'status.confirmed': '已确认',
    'status.false-positive': '误报', 'status.wont-fix': '不修复',
    'st.pending': '待办', 'st.running': '进行中', 'st.done': '已完成', 'st.blocked': '阻塞',
    'findings.empty': '尚未记录漏洞。有代码位置的结论才是 finding，否则只是 fact。',
    'findings.excluded': '已排除（误报裁决）',
    'f.codepath': '代码证据链', 'f.affected': '影响资产', 'f.poc': '触发方式',
    'f.fix': '修复建议', 'f.reason': '裁决理由', 'f.conf': '置信度',
    'assets.empty': '尚未记录代码资产。',
    'assets.mode.list': '列表', 'assets.mode.graph': '图',
    'asset.type.repo': '仓库', 'asset.type.module': '模块', 'asset.type.file': '文件',
    'asset.type.entrypoint': '入口', 'asset.type.package': '第三方依赖', 'asset.type.datastore': '数据源',
    'tasks.intents': '审计意图', 'tasks.coverage': '覆盖率', 'tasks.timeline': '执行时间线',
    'tasks.empty': '尚无审计意图。', 'tasks.facts': '事实', 'tasks.findings': '漏洞',
    'tasks.session': '子会话', 'tasks.hotspot': '未触达热点',
    'tasks.noTime': '时间线按投影折叠序号排序，顺序可靠。墙钟耗时来自存储层的耐久时间戳，只出现在 sast_report 的报告里——投影读不到它。',
    'tl.scan': '扫描', 'tl.intent': '意图', 'tl.status': '状态', 'tl.fact': '事实',
    'tl.finding': '漏洞', 'tl.asset': '资产', 'tl.triage': '裁决', 'tl.submit': '提交',
    'report.copy': '复制 Markdown', 'report.download': '下载 .md', 'report.sarif': '导出 SARIF',
    'report.copied': '已复制到剪贴板',
    'report.notice': '此处是投影的实时预览：受窗口上限限制、片段是 240 字符预览、且不含墙钟耗时。完整报告请让 agent 调用 sast_report（读存储层）。',
    'conv.hint': '演示工具调用卡片如何出现在对话流里。它与「白盒审计」标签页读同一份记录：一个呈现过程，一个呈现结构。',
    'toast.copied': '已复制：', 'toast.permalink': 'GitLab permalink（demo 不跳转，已复制）：'
  },
  en: {
    'view.conversation': 'Chat', 'view.sast': 'SAST',
    'tab.explore': 'Audit chain', 'tab.findings': 'Findings', 'tab.assets': 'Code assets',
    'tab.tasks': 'Tasks & progress', 'tab.report': 'Report',
    'empty.title': 'No scan yet',
    'empty.body': 'Give a GitLab repository URL and branch in chat (or use /sast). The decision agent calls sast_start_scan to make a read-only shallow clone and start mapping.',
    'empty.nullProjection': 'The sast projection of this session is null',
    'empty.nullBody': 'The tab is visible but empty — this session never called sast_start_scan itself.',
    'empty.why': 'Why is the tab visible here?',
    'empty.rule': 'Verdict:',
    'pb.onlyPrimary': 'Replay applies to the primary audit session (s-3ab1) only',
    'demo.tag': 'demo',
    'demo.pathcheck': 'Path hard check (ADR-03): what happens when the model cites a file that is not in the workspace?',
    'demo.show': 'Show me', 'demo.hide': 'Hide',
    'reject.badge': 'write rejected',
    'reject.head': 'The whole finding was not persisted — no partial write',
    'reject.call': 'Call issued by the model',
    'reject.err': 'Error thrown by the tool layer',
    'reject.n1': 'Every path must normalise to an existing regular file inside the workspace, otherwise the whole write is rejected.',
    'reject.n2': 'The file name in step 2 was guessed from naming habits (the real file is OrderDao.java). This gate is exactly what catches such fabrication.',
    'reject.n3': 'A wrong line number does not fail: it is clamped to the last line and flagged as line corrected — see step 1 of finding-3 below.',
    'hdr.objective': 'Objective', 'hdr.scope': 'Scope', 'hdr.scopeAll': 'whole repo',
    'hdr.size': 'Size', 'hdr.auth': 'Authorization', 'hdr.authNone': 'undeclared', 'hdr.files': 'files',
    'count.intents': 'intents', 'count.facts': 'facts', 'count.findings': 'findings', 'count.assets': 'assets',
    'count.window': 'window view',
    'count.windowTip': 'The projection keeps the latest 600 nodes / 400 assets / 800 edges, with 240-char snippet previews. See sast_report for the complete record.',
    'cov.label': 'Coverage', 'cov.of': '{a} of {b} files touched',
    'stage.recon': 'Recon', 'stage.attack-surface': 'Attack surface', 'stage.taint': 'Taint',
    'stage.config': 'Config', 'stage.dependency': 'Dependencies', 'stage.verify': 'Verify',
    'stage.custom': 'Custom',
    'stage.ready': 'Preparing', 'stage.allDone': 'Complete', 'stage.blocked': 'Blocked',
    'skills.title': 'User audit methodologies',
    'skills.hint': 'Users or teams define what to inspect and how to judge it. DSH SKILL.md / ctx.skills is only the trusted carrier. This Demo uses fixed data; only states and metrics are derived from mock intents.',
    'skills.included': 'Checks included', 'skills.completed': 'Completed',
    'skills.enabled': 'enabled', 'skills.disabled': 'disabled',
    'skills.src.builtin': 'builtin baseline', 'skills.src.workspace': 'team methodology', 'skills.src.user': 'user methodology',
    'skills.checks': 'checks', 'skills.applies': 'applies to',
    'skills.genOne': 'Simulate intent', 'skills.genAll': 'Simulate all missing intents',
    'skills.check.done': 'done', 'skills.check.running': 'running',
    'skills.check.planned': 'planned', 'skills.check.blocked': 'blocked',
    'skills.builtinFlow': 'builtin flow',
    'skills.add': '+ Simulate a user methodology',
    'skills.added': 'Methodology added to Demo memory',
    'skills.form.name': 'Methodology id (kebab-case)', 'skills.form.cat': 'Category',
    'skills.form.desc': 'One-line description', 'skills.form.descPh': 'e.g. our multi-tenant authorization methodology',
    'skills.form.checks': 'One check per line: title | path glob (glob optional)',
    'skills.form.hint': 'This only changes browser memory. In the target product users maintain methodology SKILL.md files in trusted roots; ctx.skills discovers them and SAST pins their digests. The audited clone is never a methodology source.',
    'skills.form.submit': 'Simulate add & enable', 'skills.form.cancel': 'Cancel',
    'skills.form.err': 'A methodology id and at least one check are required',
    'skills.form.dup': 'That methodology id already exists',
    'skills.form.noDesc': '(no description)', 'skills.form.userAdded': 'temporarily added to this Demo',
    'skills.howto': 'Real usage: package user/team audit methodology as SKILL.md under a trusted workspace/user root. DSH only loads it; dsh-sast does not hard-code its content. Batch execution pins one digest.',
    'tasks.notDelegated': 'not delegated yet',
    'kind.scan': 'scan', 'kind.intent': 'intent', 'kind.fact': 'fact', 'kind.finding': 'finding',
    'edge.spawns': 'spawns', 'edge.yields': 'yields', 'edge.derived_from': 'derived from',
    'edge.proves': 'proves', 'edge.flows_to': 'flows to', 'edge.parent': 'parent',
    'graph.empty': 'The audit chain is empty: waiting for the first intent and code fact.',
    'graph.fit': 'Fit view', 'graph.reset': 'Reset',
    'legend.chain': 'Chain progression', 'legend.flow': 'Taint propagation (flows_to)',
    'legend.hint': 'Scroll to zoom · drag to pan · click a node for details',
    'fact.adjusted': 'line corrected',
    'drawer.title': 'Node details', 'drawer.close': 'Close details',
    'field.kind': 'Kind', 'field.detail': 'Detail', 'field.location': 'Location',
    'field.symbol': 'Symbol', 'field.confidence': 'Confidence', 'field.snippet': 'Snippet preview',
    'field.severity': 'Severity', 'field.cwe': 'CWE', 'field.class': 'Vulnerability class',
    'field.status': 'Status', 'field.category': 'Category', 'field.scope': 'Scope',
    'field.session': 'Delegated session', 'field.assetType': 'Asset type', 'field.assetValue': 'Asset value',
    'field.meta': 'Metadata', 'field.source': 'Evidence source', 'field.skill': 'Methodology / check',
    'act.copy': 'Copy', 'act.copyLoc': 'Copy location', 'act.gitlab': 'GitLab ↗',
    'filter.severity': 'Severity', 'filter.status': 'Triage', 'filter.all': 'All',
    'status.open': 'open', 'status.confirmed': 'confirmed',
    'status.false-positive': 'false positive', 'status.wont-fix': 'wont fix',
    'st.pending': 'pending', 'st.running': 'running', 'st.done': 'done', 'st.blocked': 'blocked',
    'findings.empty': 'No findings yet. Without a code location a conclusion is a fact, not a finding.',
    'findings.excluded': 'Excluded (triaged as false positive)',
    'f.codepath': 'Code evidence path', 'f.affected': 'Affected asset', 'f.poc': 'Trigger',
    'f.fix': 'Remediation', 'f.reason': 'Triage reason', 'f.conf': 'Confidence',
    'assets.empty': 'No code assets yet.',
    'assets.mode.list': 'List', 'assets.mode.graph': 'Graph',
    'asset.type.repo': 'Repository', 'asset.type.module': 'Module', 'asset.type.file': 'File',
    'asset.type.entrypoint': 'Entrypoint', 'asset.type.package': 'Dependency', 'asset.type.datastore': 'Datastore',
    'tasks.intents': 'Audit intents', 'tasks.coverage': 'Coverage', 'tasks.timeline': 'Execution timeline',
    'tasks.empty': 'No audit intents yet.', 'tasks.facts': 'facts', 'tasks.findings': 'findings',
    'tasks.session': 'session', 'tasks.hotspot': 'Untouched hotspot',
    'tasks.noTime': 'The timeline is ordered by projection fold sequence, which is always correct. Wall-clock durations come from durable store timestamps and appear only in the sast_report output — the projection cannot see them.',
    'tl.scan': 'scan', 'tl.intent': 'intent', 'tl.status': 'status', 'tl.fact': 'fact',
    'tl.finding': 'finding', 'tl.asset': 'asset', 'tl.triage': 'triage', 'tl.submit': 'submit',
    'report.copy': 'Copy Markdown', 'report.download': 'Download .md', 'report.sarif': 'Export SARIF',
    'report.copied': 'Copied to clipboard',
    'report.notice': 'This is a live preview of the projection: capped by the window, snippets are 240-char previews, and no wall-clock durations. Ask the agent to call sast_report for the complete document.',
    'conv.hint': 'Shows how tool-call cards appear in the chat stream. It reads the same records as the SAST tab: one shows the process, the other the structure.',
    'toast.copied': 'Copied: ', 'toast.permalink': 'GitLab permalink (demo does not navigate, copied): '
  }
};
var lang = 'zh';
function t(k, vars) {
  var s = (DICT[lang] && DICT[lang][k]) || DICT.zh[k] || k;
  if (vars) Object.keys(vars).forEach(function (n) { s = s.split('{' + n + '}').join(vars[n]); });
  return s;
}

/* ══ DOM helpers（全程 textContent，数据永不进 innerHTML） ══════ */
function el(tag, props, kids) {
  var n = document.createElement(tag);
  if (props) Object.keys(props).forEach(function (k) {
    if (k === 'text') n.textContent = props[k];
    else if (k === 'cls') n.className = props[k];
    else if (k === 'on') Object.keys(props[k]).forEach(function (ev) { n.addEventListener(ev, props[k][ev]); });
    else if (props[k] !== null && props[k] !== undefined && props[k] !== false) n.setAttribute(k, props[k]);
  });
  (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
  return n;
}
function svgEl(tag, props) {
  var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.keys(props || {}).forEach(function (k) { n.setAttribute(k, props[k]); });
  return n;
}
function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
function $(id) { return document.getElementById(id); }

function copyText(text, prefix) {
  var done = function () { toast((prefix || t('toast.copied')) + text); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function () { fallback(); });
  } else fallback();
  function fallback() {
    var ta = el('textarea', { text: text });
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* demo 环境无剪贴板权限时静默 */ }
    document.body.removeChild(ta); done();
  }
}
function toast(msg, isErr) {
  var root = $('toast-root');
  var box = el('div', { cls: 'toast' + (isErr ? ' err' : ''), text: msg });
  root.appendChild(box);
  setTimeout(function () { if (box.parentNode) root.removeChild(box); }, isErr ? 6500 : 3200);
}
function download(name, text, mime) {
  var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = el('a', { href: url, download: name });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ══ permalink（repo-ingest.md §7 的规则） ══════════════════════ */
function permalink(scan, step) {
  if (!scan || scan.provider === 'local') return '';
  var base = scan.repoUrl.replace(/\.git$/, '');
  var frag = step.line ? (scan.provider === 'github' ? '#L' + step.line : '#L' + step.line) : '';
  var mid = scan.provider === 'github' ? '/blob/' : '/-/blob/';
  return base + mid + scan.commit + '/' + step.path + frag;
}
function loc(step) { return step.path + (step.line ? ':' + step.line : ''); }

/* ══ 状态重建：cursor → 可见投影 ═══════════════════════════════ */
var byId = {};
['intents', 'facts', 'findings', 'assets'].forEach(function (c) {
  MOCK[c].forEach(function (x) { byId[x.id] = x; });
});

var state = null;
var cursor = MOCK.script.length;

function rebuild() {
  var s = {
    scan: null, intents: [], facts: [], findings: [], assets: [],
    timeline: [], conv: [], coverage: {}
  };
  var seen = {};
  var push = function (coll, id, seq, extra) {
    var base = byId[id]; if (!base) return null;
    var copy = {}; Object.keys(base).forEach(function (k) { copy[k] = base[k]; });
    copy.seq = seq;
    if (extra) Object.keys(extra).forEach(function (k) { copy[k] = extra[k]; });
    s[coll].push(copy); seen[id] = copy; return copy;
  };

  for (var i = 0; i < cursor; i++) {
    var op = MOCK.script[i], seq = i + 1;
    if (op.op === 'scan') {
      s.scan = MOCK.scan;
      s.timeline.push({ seq: seq, kind: 'scan', text: '启动扫描 ' + MOCK.scan.repoUrl.split('/').slice(-2).join('/') + ' @ ' + MOCK.scan.branch + '（' + MOCK.scan.fileCount + ' 个文件纳入范围）' });
      s.conv.push({ seq: seq, tool: 'sast_start_scan', text: 'Started scan scan-1 → pay/gateway @ release-2.1 (a1b2c3d), 412 files in scope, languages java:412, xml:88, yaml:31.' });
    } else if (op.op === 'intent') {
      var it = push('intents', op.id, seq, { status: 'pending', note: '' });
      if (it) {
        s.timeline.push({ seq: seq, kind: 'intent', text: '创建 ' + it.id + '「' + it.title + '」(' + it.category + ')' });
        s.conv.push({ seq: seq, tool: 'sast_add_intent', text: 'Recorded intent ' + it.id + '「' + it.title + '」(' + it.anchor.kind + ' ' + it.anchor.from + ' → ' + it.id + ').' });
      }
    } else if (op.op === 'status') {
      var tgt = seen[op.id];
      if (tgt) {
        tgt.status = op.status;
        if (op.note) tgt.note = op.note;
        s.timeline.push({ seq: seq, kind: 'status', text: tgt.id + ' → ' + t('st.' + op.status) + (op.note ? '：' + op.note : '') });
        s.conv.push({ seq: seq, tool: 'sast_update_intent', text: 'Updated ' + tgt.id + ' status to ' + op.status + '.' });
      }
    } else if (op.op === 'fact') {
      var f = push('facts', op.id, seq);
      if (f) {
        s.timeline.push({ seq: seq, kind: 'fact', text: f.id + ' [' + f.kind + '] ' + loc(f) + ' — ' + f.detail });
        s.conv.push({ seq: seq, tool: 'sast_add_fact', text: 'Recorded fact ' + f.id + ' [' + f.kind + '] ' + loc(f) + (f.lineAdjusted ? ' (line corrected to file end)' : '') + '.' });
      }
    } else if (op.op === 'finding') {
      var fd = push('findings', op.id, seq, { status: 'open', triageReason: '' });
      if (fd) {
        s.timeline.push({ seq: seq, kind: 'finding', text: fd.id + ' [' + fd.severity + '] ' + fd.cwe + ' ' + fd.title });
        s.conv.push({ seq: seq, tool: 'sast_add_finding', text: 'Recorded finding ' + fd.id + ' [' + fd.severity + '] ' + fd.title + ' with ' + fd.codePath.length + ' code location(s).' });
      }
    } else if (op.op === 'asset') {
      var a = push('assets', op.id, seq);
      if (a) {
        s.timeline.push({ seq: seq, kind: 'asset', text: a.id + ' [' + a.type + '] ' + a.value });
        s.conv.push({ seq: seq, tool: 'sast_add_asset', text: 'Recorded asset ' + a.id + ' [' + a.type + '] ' + a.value + '.' });
      }
    } else if (op.op === 'triage') {
      var target = seen[op.id];
      if (target) {
        target.status = op.status;
        target.triageReason = byId[op.id].triageReason;
        s.timeline.push({ seq: seq, kind: 'triage', text: target.id + ' → ' + t('status.' + op.status) + '：' + (target.triageReason || '—') });
        s.conv.push({ seq: seq, tool: 'sast_triage', text: 'Triaged ' + target.id + ' as ' + op.status + '.' });
      }
    } else if (op.op === 'submit') {
      s.timeline.push({ seq: seq, kind: 'submit', text: '子会话 ' + op.session + ' 提交 ' + op.facts + ' 事实 / ' + op.assets + ' 资产 / ' + op.findings + ' 漏洞' });
      s.conv.push({ seq: seq, tool: 'sast_submit', text: 'Submitted ' + op.facts + ' facts, ' + op.assets + ' assets, and ' + op.findings + ' findings to the parent session. (' + op.session + ')' });
    }
    if (MOCK.coverageAt[seq]) {
      var cov = MOCK.coverageAt[seq];
      Object.keys(cov).forEach(function (m) { s.coverage[m] = cov[m]; });
    }
  }
  /* 用户从技能检查项生成的意图：只在扫描已启动、且所属技能仍启用时参与 */
  if (s.scan) {
    plannedIntents.forEach(function (p) {
      var sk = skillById(p.skillId);
      if (sk && sk.enabled) s.intents.push(p);
    });
  }
  state = s;
}

/* 边：由可见实体推导，两端都可见才保留（悬挂边清理） */
function edgesOf() {
  var vis = {}; if (state.scan) vis['scan-1'] = 1;
  ['intents', 'facts', 'findings', 'assets'].forEach(function (c) {
    state[c].forEach(function (x) { vis[x.id] = 1; });
  });
  var out = [], n = 0;
  var add = function (kind, from, to) {
    if (!vis[from] || !vis[to]) return;
    out.push({ id: 'edge-' + (++n), kind: kind, sourceId: from, targetId: to });
  };
  state.intents.forEach(function (i) { add(i.anchor.kind, i.anchor.from, i.id); });
  state.facts.forEach(function (f) {
    add('yields', f.intentId, f.id);
    if (f.flowsFrom) add('flows_to', f.flowsFrom, f.id);
  });
  state.findings.forEach(function (f) { add('proves', f.intentId, f.id); });
  state.assets.forEach(function (a) { if (a.parentId) add('parent', a.parentId, a.id); });
  return out;
}

/* ══ 布局：graph.ts 的 depthsOf + stackByDepth ═════════════════ */
var CHAIN = { spawns: 1, yields: 1, derived_from: 1, proves: 1 };
function depthsOf(roots, edges) {
  var depth = {}, queue = roots.slice();
  roots.forEach(function (r) { depth[r] = 0; });
  for (var i = 0; i < queue.length; i++) {
    var id = queue[i], lvl = depth[id];
    for (var j = 0; j < edges.length; j++) {
      var e = edges[j];
      if (e.sourceId !== id) continue;
      if (depth[e.targetId] !== undefined) continue;
      depth[e.targetId] = lvl + 1; queue.push(e.targetId);
    }
  }
  return depth;
}
function stackByDepth(items, depth, colGap, rowGap) {
  var max = 0;
  items.forEach(function (x) { if (depth[x.id] !== undefined && depth[x.id] > max) max = depth[x.id]; });
  var rows = {};
  items.forEach(function (x) {
    var lvl = depth[x.id] === undefined ? max + 1 : depth[x.id];
    (rows[lvl] = rows[lvl] || []).push(x);
  });
  var out = [];
  Object.keys(rows).map(Number).sort(function (a, b) { return a - b; }).forEach(function (lvl) {
    rows[lvl].forEach(function (x, idx) {
      x.x = lvl * colGap; x.y = idx * rowGap; out.push(x);
    });
  });
  return out;
}

/* ══ 通用图渲染（HTML 节点 + SVG 边 + 药丸标签） ═══════════════ */
function renderGraph(host, nodes, edges, size, gaps, nodeRenderer, onPick) {
  var wrap = el('div', { cls: 'graph-wrap' });
  var vp = el('div', { cls: 'graph-viewport' });
  var svg = svgEl('svg', { class: 'graph-edges' });
  vp.appendChild(svg);

  var depth = depthsOf(nodes.length && nodes[0].__root ? [nodes[0].id] : rootsOf(nodes, edges), edges.filter(function (e) { return CHAIN[e.kind] || e.kind === 'parent'; }));
  var placed = stackByDepth(nodes, depth, gaps[0], gaps[1]);

  var maxX = 0, maxY = 0;
  placed.forEach(function (n) { maxX = Math.max(maxX, n.x + size[0]); maxY = Math.max(maxY, n.y + size[1]); });
  svg.setAttribute('width', maxX + 60); svg.setAttribute('height', maxY + 60);

  var pos = {};
  placed.forEach(function (n) { pos[n.id] = n; });

  edges.forEach(function (e) {
    var a = pos[e.sourceId], b = pos[e.targetId];
    if (!a || !b) return;
    var sx = a.x + size[0], sy = a.y + size[1] / 2;
    var tx = b.x, ty = b.y + size[1] / 2;
    var c = Math.max(36, (tx - sx) / 2);
    var flow = e.kind === 'flows_to';
    svg.appendChild(svgEl('path', {
      d: 'M ' + sx + ' ' + sy + ' C ' + (sx + c) + ' ' + sy + ', ' + (tx - c) + ' ' + ty + ', ' + tx + ' ' + ty,
      fill: 'none',
      stroke: flow ? '#ff8fb1' : '#4a4e5c',
      'stroke-width': flow ? 1.6 : 1.4,
      'stroke-dasharray': flow ? '5 4' : ''
    }));
    vp.appendChild(el('div', {
      cls: 'edge-label' + (flow ? ' flow' : ''),
      style: 'left:' + ((sx + tx) / 2) + 'px; top:' + ((sy + ty) / 2) + 'px',
      text: t('edge.' + e.kind)
    }));
  });

  placed.forEach(function (n) {
    var card = nodeRenderer(n);
    card.className = 'gnode';
    card.style.left = n.x + 'px'; card.style.top = n.y + 'px';
    card.style.width = size[0] + 'px'; card.style.height = size[1] + 'px';
    card.setAttribute('data-kind', n.kind || n.type);
    card.addEventListener('click', function () { onPick(n); });
    vp.appendChild(card);
  });

  wrap.appendChild(vp);

  /* pan / zoom */
  var k = 1, tx0 = 24, ty0 = 24, dragging = false, lx = 0, ly = 0;
  var apply = function () { vp.style.transform = 'translate(' + tx0 + 'px,' + ty0 + 'px) scale(' + k + ')'; };
  var fit = function () {
    var w = wrap.clientWidth - 48, h = wrap.clientHeight - 96;
    if (maxX <= 0 || maxY <= 0) return;
    k = Math.min(1, Math.min(w / maxX, h / maxY));
    if (!isFinite(k) || k <= 0) k = 1;
    tx0 = 24; ty0 = 24; apply();
  };
  wrap.addEventListener('wheel', function (ev) {
    ev.preventDefault();
    var f = ev.deltaY < 0 ? 1.1 : 0.9;
    var nk = Math.max(0.25, Math.min(2, k * f));
    var r = wrap.getBoundingClientRect(), px = ev.clientX - r.left, py = ev.clientY - r.top;
    tx0 = px - (px - tx0) * (nk / k); ty0 = py - (py - ty0) * (nk / k); k = nk; apply();
  }, { passive: false });
  wrap.addEventListener('mousedown', function (ev) {
    if (ev.target.closest('.gnode')) return;
    dragging = true; lx = ev.clientX; ly = ev.clientY; wrap.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', function (ev) {
    if (!dragging) return;
    tx0 += ev.clientX - lx; ty0 += ev.clientY - ly; lx = ev.clientX; ly = ev.clientY; apply();
  });
  window.addEventListener('mouseup', function () { dragging = false; wrap.style.cursor = ''; });

  var bar = el('div', { cls: 'graph-toolbar' }, [
    el('button', { text: t('graph.fit'), on: { click: fit } }),
    el('button', { text: t('graph.reset'), on: { click: function () { k = 1; tx0 = 24; ty0 = 24; apply(); } } })
  ]);
  wrap.appendChild(bar);
  host.appendChild(wrap);
  apply();
  setTimeout(fit, 0);
  return wrap;
}
function rootsOf(nodes, edges) {
  var hasIn = {};
  edges.forEach(function (e) { if (CHAIN[e.kind] || e.kind === 'parent') hasIn[e.targetId] = 1; });
  var r = nodes.filter(function (n) { return !hasIn[n.id]; }).map(function (n) { return n.id; });
  return r.length ? r : (nodes.length ? [nodes[0].id] : []);
}

/* ══ 抽屉 ══════════════════════════════════════════════════════ */
function openDrawer(title, fields, actions) {
  closeDrawer();
  var root = $('drawer-root');
  var back = el('button', { cls: 'backdrop', 'aria-hidden': 'true', tabindex: '-1', on: { click: closeDrawer } });
  var dl = el('dl');
  fields.forEach(function (f) {
    if (!f.value) return;
    dl.appendChild(el('dt', { text: f.label }));
    if (f.pre) { var dd = el('dd'); dd.appendChild(el('pre', { text: f.value })); dl.appendChild(dd); }
    else dl.appendChild(el('dd', { cls: f.mono ? 'mono' : '', text: f.value }));
  });
  var panel = el('aside', { cls: 'drawer', 'aria-label': t('drawer.title') }, [
    el('button', { cls: 'drawer-close', 'aria-label': t('drawer.close'), text: '×', on: { click: closeDrawer } }),
    el('h3', { text: title }), dl
  ]);
  if (actions && actions.length) {
    var acts = el('div', { cls: 'drawer-acts' });
    actions.forEach(function (a) { acts.appendChild(el('button', { cls: 'mini', text: a.label, on: { click: a.run } })); });
    panel.appendChild(acts);
  }
  root.appendChild(back); root.appendChild(panel);
  document.addEventListener('keydown', escClose);
}
function escClose(ev) { if (ev.key === 'Escape') closeDrawer(); }
function closeDrawer() {
  clear($('drawer-root'));
  document.removeEventListener('keydown', escClose);
}

/* ══ 视图：审计链路 ════════════════════════════════════════════ */
function viewExplore(host) {
  host.className = 'sub-content no-pad';
  var edges = edgesOf().filter(function (e) { return e.kind !== 'parent'; });
  var nodes = [];
  if (state.scan) nodes.push({
    id: 'scan-1', kind: 'scan', seq: 0, __root: true,
    title: state.scan.repoUrl.split('/').slice(-2).join('/') + ' @ ' + state.scan.branch,
    sub: state.scan.commit.slice(0, 7) + ' · ' + state.scan.fileCount + ' ' + t('hdr.files'),
    detail: state.scan.objective
  });
  state.intents.forEach(function (i) {
    nodes.push({
      id: i.id, kind: 'intent', seq: i.seq, title: i.title,
      sub: i.category + ' · ' + (i.skillId ? i.skillId + '/' + i.checkId : (i.scope[0] || 'src/**')),
      status: i.status, ref: i
    });
  });
  state.facts.forEach(function (f) {
    nodes.push({ id: f.id, kind: 'fact', seq: f.seq, title: f.detail, sub: loc(f) + ' · [' + f.kind + '] · ' + f.confidence, factKind: f.kind, ref: f });
  });
  state.findings.forEach(function (f) {
    nodes.push({ id: f.id, kind: 'finding', seq: f.seq, title: f.title, sub: f.cwe + ' · ' + f.vulnClass, severity: f.severity, ref: f });
  });
  nodes.sort(function (a, b) { return a.seq - b.seq; });

  if (nodes.length <= 1) {
    host.className = 'sub-content';
    host.appendChild(el('p', { cls: 'empty-state', text: t('graph.empty') }));
    return;
  }

  var KCOLOR = {
    scan: 'var(--accent)', intent: 'var(--st-running)', fact: 'var(--muted)', finding: 'var(--critical)'
  };
  var wrap = renderGraph(host, nodes, edges, [236, 104], [292, 128], function (n) {
    var card = el('div');
    var color = n.kind === 'fact' ? 'var(--k-' + n.factKind + ')'
      : n.kind === 'finding' ? 'var(--' + n.severity + ')' : KCOLOR[n.kind];
    var head = el('div', { cls: 'gnode-head' }, [
      el('span', { cls: 'gbadge', style: 'color:' + color, text: n.kind === 'fact' ? n.factKind : t('kind.' + n.kind) }),
      el('span', { cls: 'gnode-id', text: n.id })
    ]);
    card.appendChild(head);
    card.appendChild(el('div', { cls: 'gnode-title', text: n.title, title: n.title }));
    if (n.sub) card.appendChild(el('div', { cls: 'gnode-sub', text: n.sub, title: n.sub }));
    var foot = el('div', { cls: 'gnode-foot' });
    if (n.status) {
      foot.appendChild(el('span', { cls: 'dot', style: 'background:var(--st-' + n.status + ')' }));
      foot.appendChild(el('span', { style: 'font-size:10.5px;color:var(--muted-2)', text: t('st.' + n.status) }));
    }
    if (n.severity) foot.appendChild(el('span', { cls: 'sev', 'data-severity': n.severity, text: n.severity }));
    if (n.ref && n.ref.lineAdjusted) foot.appendChild(el('span', { cls: 'adjusted', text: t('fact.adjusted') }));
    if (foot.childNodes.length) card.appendChild(foot);
    return card;
  }, function (n) { pickNode(n); });

  var legend = el('div', { cls: 'graph-legend' }, [
    el('span', { cls: 'lg' }, [el('i'), el('span', { text: t('legend.chain') })]),
    el('span', { cls: 'lg' }, [el('i', { cls: 'dash' }), el('span', { text: t('legend.flow') })]),
    el('span', { text: t('legend.hint'), style: 'color:var(--muted-2)' })
  ]);
  wrap.appendChild(legend);
}

function pickNode(n) {
  var scan = state.scan;
  if (n.kind === 'scan') {
    openDrawer(n.title, [
      { label: t('field.kind'), value: t('kind.scan') },
      { label: t('hdr.objective'), value: scan.objective },
      { label: t('hdr.scope'), value: scan.scope.join(', ') },
      { label: t('hdr.auth'), value: scan.authorization },
      { label: 'commit', value: scan.commit, mono: true },
      { label: 'workspace', value: scan.workspacePath, mono: true }
    ]);
    return;
  }
  var r = n.ref;
  if (n.kind === 'intent') {
    openDrawer(r.title, [
      { label: t('field.kind'), value: t('kind.intent') + ' · ' + r.id },
      { label: t('field.detail'), value: r.detail },
      { label: t('field.category'), value: r.category },
      { label: t('field.skill'), value: r.skillId ? r.skillId + ' / ' + r.checkId : t('skills.builtinFlow'), mono: !!r.skillId },
      { label: t('field.scope'), value: r.scope.join(', ') },
      { label: t('field.status'), value: t('st.' + r.status) + (r.note ? ' — ' + r.note : '') },
      { label: t('field.session'), value: r.delegatedSessionId || t('tasks.notDelegated'), mono: true }
    ]);
  } else if (n.kind === 'fact') {
    var link = permalink(scan, r);
    openDrawer(r.detail, [
      { label: t('field.kind'), value: r.kind + ' · ' + r.id },
      { label: t('field.location'), value: loc(r) + (r.lineAdjusted ? '  (' + t('fact.adjusted') + ')' : ''), mono: true },
      { label: t('field.symbol'), value: r.symbol, mono: true },
      { label: t('field.confidence'), value: String(r.confidence) },
      { label: t('field.source'), value: r.source + (r.engineRule ? ' · ' + r.engineRule : '') },
      { label: t('field.snippet'), value: (r.snippet || '').slice(0, 240), pre: true }
    ], [
      { label: t('act.copyLoc'), run: function () { copyText(loc(r)); } },
      link ? { label: t('act.gitlab'), run: function () { copyText(link, t('toast.permalink')); } } : null
    ].filter(Boolean));
  } else if (n.kind === 'finding') {
    openDrawer(r.title, [
      { label: t('field.kind'), value: t('kind.finding') + ' · ' + r.id },
      { label: t('field.severity'), value: r.severity },
      { label: t('field.cwe'), value: r.cwe },
      { label: t('field.class'), value: r.vulnClass },
      { label: t('f.conf'), value: String(r.confidence) },
      { label: t('field.skill'), value: r.skillId ? r.skillId + ' / ' + r.checkId : t('skills.builtinFlow'), mono: !!r.skillId },
      { label: t('field.status'), value: t('status.' + r.status) },
      { label: t('field.detail'), value: r.description },
      { label: t('f.codepath'), value: r.codePath.map(function (s, i2) { return (i2 + 1) + '. ' + loc(s) + (s.symbol ? '  ' + s.symbol : '') + ' — ' + s.note; }).join('\n'), pre: true },
      { label: t('f.fix'), value: r.remediation }
    ]);
  }
}

/* ══ 视图：漏洞 ════════════════════════════════════════════════ */
var fSev = 'all', fStatus = 'all', showReject = false;

/* 路径硬校验（ADR-03）的内联演示：模型引用不存在的文件时发生什么 */
function rejectCard() {
  var call = [
    'sast_add_finding {',
    '  intentId: "intent-4",',
    '  title: "OrderRepository 存在 SQL 注入",',
    '  severity: "critical",',
    '  codePath: [',
    '    { path: "src/web/OrderController.java", line: 42,   note: "用户可控参数进入" },',
    '    { path: "src/dao/OrderRepository.java", line: 61,   note: "拼接后执行" }',
    '  ]',
    '}'
  ].join('\n');
  return el('div', { cls: 'reject-card' }, [
    el('div', { cls: 'reject-head' }, [
      el('span', { cls: 'reject-badge', text: t('reject.badge') }),
      el('span', { text: t('reject.head') })
    ]),
    el('div', { cls: 'reject-sub', text: t('reject.call') }),
    el('pre', { cls: 'data', text: call }),
    el('div', { cls: 'reject-sub', text: t('reject.err') }),
    el('pre', { cls: 'reject-err', text: 'sast: codePath[1].path src/dao/OrderRepository.java does not exist in the scan workspace; only cite files you actually read' }),
    el('p', { cls: 'reject-note' }, [
      el('b', { text: t('reject.n1') }), el('span', { text: t('reject.n2') })
    ]),
    el('p', { cls: 'reject-note', text: t('reject.n3') })
  ]);
}

function viewFindings(host) {
  var strip = el('div', { cls: 'demo-strip' }, [
    el('span', { cls: 'demo-tag', text: t('demo.tag') }),
    el('span', { text: t('demo.pathcheck') }),
    el('button', {
      cls: 'mini', text: showReject ? t('demo.hide') : t('demo.show'),
      on: { click: function () { showReject = !showReject; render(); } }
    })
  ]);
  host.appendChild(strip);
  if (showReject) host.appendChild(rejectCard());

  var SEVS = ['critical', 'high', 'medium', 'low', 'info'];
  var STATUSES = ['open', 'confirmed', 'false-positive'];
  var bar = el('div', { cls: 'filterbar' });
  var g1 = el('div', { cls: 'filtergroup' }, [el('span', { text: t('filter.severity') })]);
  ['all'].concat(SEVS).forEach(function (s) {
    g1.appendChild(el('button', {
      cls: 'chip', 'aria-pressed': String(fSev === s),
      text: s === 'all' ? t('filter.all') : s,
      on: { click: function () { fSev = s; render(); } }
    }));
  });
  var g2 = el('div', { cls: 'filtergroup' }, [el('span', { text: t('filter.status') })]);
  ['all'].concat(STATUSES).forEach(function (s) {
    g2.appendChild(el('button', {
      cls: 'chip', 'aria-pressed': String(fStatus === s),
      text: s === 'all' ? t('filter.all') : t('status.' + s),
      on: { click: function () { fStatus = s; render(); } }
    }));
  });
  bar.appendChild(g1); bar.appendChild(g2);
  host.appendChild(bar);

  var list = state.findings.filter(function (f) {
    return (fSev === 'all' || f.severity === fSev) && (fStatus === 'all' || f.status === fStatus);
  });
  var rank = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  list.sort(function (a, b) { return rank[a.severity] - rank[b.severity]; });
  var main = list.filter(function (f) { return f.status !== 'false-positive'; });
  var excl = list.filter(function (f) { return f.status === 'false-positive'; });

  if (!list.length) { host.appendChild(el('p', { cls: 'empty-state', text: t('findings.empty') })); return; }
  main.forEach(function (f) { host.appendChild(findingCard(f)); });
  if (excl.length) {
    host.appendChild(el('div', { cls: 'section-title', text: t('findings.excluded') + ' · ' + excl.length }));
    excl.forEach(function (f) { var c = findingCard(f); c.className += ' excluded'; host.appendChild(c); });
  }
}

function findingCard(f) {
  var scan = state.scan;
  var card = el('div', { cls: 'finding', 'data-severity': f.severity });
  var head = el('div', { cls: 'f-head' }, [
    el('span', { cls: 'sev', 'data-severity': f.severity, text: f.severity }),
    el('span', { cls: 'f-title', text: f.title }),
    f.cwe ? el('span', { cls: 'f-tag', text: f.cwe }) : null,
    el('span', { cls: 'f-tag', text: f.vulnClass }),
    el('span', { cls: 'f-tag', text: t('f.conf') + ' ' + f.confidence }),
    el('span', {
      cls: 't-skill', 'data-builtin': f.skillId ? '0' : '1',
      text: f.skillId ? f.skillId + ' / ' + f.checkId : t('skills.builtinFlow')
    }),
    el('span', { cls: 'f-id', text: f.id }),
    el('span', { cls: 'f-status', 'data-s': f.status, text: t('status.' + f.status) })
  ]);
  card.appendChild(head);
  if (f.description) card.appendChild(el('p', { cls: 'f-desc', text: f.description }));

  card.appendChild(el('div', { cls: 'f-sub', text: t('f.codepath') }));
  var ol = el('ul', { cls: 'codepath' });
  f.codePath.forEach(function (s, i) {
    var link = permalink(scan, s);
    ol.appendChild(el('li', {}, [
      el('span', { cls: 'cp-n', text: (i + 1) + '.' }),
      el('span', { cls: 'cp-loc', text: loc(s) }),
      s.lineAdjusted ? el('span', { cls: 'adjusted', text: t('fact.adjusted') }) : null,
      s.symbol ? el('span', { cls: 'cp-sym', text: s.symbol }) : null,
      el('span', { cls: 'cp-note', text: s.note }),
      el('span', { cls: 'cp-acts' }, [
        el('button', { cls: 'mini', text: t('act.copy'), on: { click: function () { copyText(loc(s)); } } }),
        link ? el('button', { cls: 'mini', text: t('act.gitlab'), on: { click: function () { copyText(link, t('toast.permalink')); } } }) : null
      ])
    ]));
  });
  card.appendChild(ol);

  if (f.affectedAssetId) {
    var a = state.assets.filter(function (x) { return x.id === f.affectedAssetId; })[0];
    if (a) card.appendChild(el('p', { cls: 'f-desc', text: t('f.affected') + '：[' + a.type + '] ' + a.value }));
  }
  if (f.poc) card.appendChild(el('p', { cls: 'f-desc' }, [
    el('span', { text: t('f.poc') + '：' }), el('code', { text: f.poc })
  ]));
  if (f.remediation) card.appendChild(el('div', { cls: 'f-fix' }, [
    el('b', { text: t('f.fix') + '：' }), el('span', { text: f.remediation })
  ]));
  if (f.triageReason) card.appendChild(el('div', { cls: 'f-reason', text: t('f.reason') + '：' + f.triageReason }));
  return card;
}

/* ══ 视图：代码资产 ════════════════════════════════════════════ */
var assetMode = 'list';
var ASSET_TYPES = ['repo', 'module', 'file', 'entrypoint', 'package', 'datastore'];
function viewAssets(host) {
  var modeBar = el('div', { cls: 'mode-bar' });
  ['list', 'graph'].forEach(function (m) {
    modeBar.appendChild(el('button', {
      cls: 'chip', 'aria-pressed': String(assetMode === m), text: t('assets.mode.' + m),
      on: { click: function () { assetMode = m; render(); } }
    }));
  });

  if (!state.assets.length) {
    host.appendChild(modeBar);
    host.appendChild(el('p', { cls: 'empty-state', text: t('assets.empty') }));
    return;
  }

  if (assetMode === 'graph') {
    host.className = 'sub-content no-pad';
    var col = el('div', { style: 'display:flex;flex-direction:column;flex:1;min-width:0' });
    var pad = el('div', { style: 'padding:12px 20px 0' }); pad.appendChild(modeBar); col.appendChild(pad);
    var gh = el('div', { style: 'flex:1;min-height:0;display:flex' });
    col.appendChild(gh); host.appendChild(col);
    var nodes = state.assets.map(function (a) { return { id: a.id, type: a.type, value: a.value, meta: a.meta, risky: a.risky, ref: a }; });
    var edges = edgesOf().filter(function (e) { return e.kind === 'parent'; });
    renderGraph(gh, nodes, edges, [212, 84], [268, 108], function (n) {
      var card = el('div');
      card.appendChild(el('div', { cls: 'gnode-head' }, [
        el('span', { cls: 'gbadge', style: 'color:' + (n.risky ? 'var(--high)' : 'var(--accent)'), text: t('asset.type.' + n.type) }),
        el('span', { cls: 'gnode-id', text: n.id })
      ]));
      card.appendChild(el('div', { cls: 'gnode-title', text: n.value, title: n.value }));
      if (n.meta) card.appendChild(el('div', { cls: 'gnode-sub', text: n.meta, title: n.meta }));
      return card;
    }, function (n) {
      openDrawer(n.value, [
        { label: t('field.assetType'), value: t('asset.type.' + n.type) + ' · ' + n.id },
        { label: t('field.assetValue'), value: n.value, mono: true },
        { label: t('field.meta'), value: n.meta }
      ]);
    });
    return;
  }

  host.appendChild(modeBar);
  var parentOf = {};
  edgesOf().forEach(function (e) { if (e.kind === 'parent') parentOf[e.targetId] = e.sourceId; });
  var nameOf = {};
  state.assets.forEach(function (a) { nameOf[a.id] = a.value; });

  ASSET_TYPES.forEach(function (type) {
    var rows = state.assets.filter(function (a) { return a.type === type; });
    if (!rows.length) return;
    var sec = el('section', { cls: 'asset-group' }, [
      el('h4', { text: t('asset.type.' + type) + ' · ' + rows.length })
    ]);
    var ul = el('ul', { cls: 'asset-list' });
    rows.forEach(function (a) {
      var p = parentOf[a.id];
      ul.appendChild(el('li', { cls: 'asset-row' }, [
        el('span', { cls: 'asset-val', text: a.value }),
        a.meta ? el('span', { cls: 'asset-meta', text: '（' + a.meta + '）' }) : null,
        a.risky ? el('span', { cls: 'asset-warn', text: '!' }) : null,
        p ? el('span', { cls: 'asset-parent', text: '← ' + nameOf[p] }) : null
      ]));
    });
    sec.appendChild(ul); host.appendChild(sec);
  });
}

/* ══ 用户审计方法论（DSH Skill 仅为技术载体） ════════════════
 * 本 Demo 的方法论与 intent 数据写死；这里只模拟按 check 派生意图和指标。
 * 真实产品从受信 ctx.skills 加载用户/团队方法论，并在批次内固定 digest。 */
var skillState = null;      // 运行时副本，允许增删改
var plannedIntents = [];    // 用户从检查项生成的意图（尚未委派）
var plannedSeq = 100;
var showSkillForm = false;
var skillFormErr = '';

function skills() {
  if (!skillState) skillState = MOCK.skills.map(function (s) {
    return {
      id: s.id, name: s.name, source: s.source, category: s.category,
      enabled: s.enabled, desc: s.desc, applies: s.applies,
      checks: s.checks.map(function (c) { return { id: c.id, title: c.title, scope: c.scope.slice() }; })
    };
  });
  return skillState;
}
function skillById(id) {
  return skills().filter(function (s) { return s.id === id; })[0];
}
/* 检查项状态：todo 未覆盖 / planned 已计划 / running 进行中 / done 已完成 / blocked 阻塞 */
function checkState(skillId, checkId) {
  var it = state.intents.filter(function (i) { return i.skillId === skillId && i.checkId === checkId; })[0];
  if (!it) return 'todo';
  if (it.status === 'done') return 'done';
  if (it.status === 'running') return 'running';
  if (it.status === 'blocked') return 'blocked';
  return 'planned';
}
function checkTotals() {
  var total = 0, covered = 0, completed = 0, blocked = 0;
  skills().forEach(function (s) {
    if (!s.enabled) return;
    s.checks.forEach(function (c) {
      var st = checkState(s.id, c.id);
      total++;
      if (st !== 'todo') covered++;
      if (st === 'done') completed++;
      if (st === 'blocked') blocked++;
    });
  });
  return {
    total: total, covered: covered, completed: completed, blocked: blocked,
    ratio: total ? Math.round(covered / total * 100) : 0,
    completionRatio: total ? Math.round(completed / total * 100) : 0
  };
}
/* 把一条检查项变成审计意图（模拟决策 agent 调用 sast_add_intent） */
function planCheck(skill, check) {
  if (checkState(skill.id, check.id) !== 'todo') return;
  plannedSeq++;
  plannedIntents.push({
    id: 'intent-' + plannedSeq,
    title: check.title,
    detail: '按用户方法论 ' + skill.id + ' 的 ' + check.id + ' 检查项模拟创建',
    category: skill.category, scope: check.scope.slice(),
    status: 'pending', note: '', delegatedSessionId: '',
    anchor: { kind: 'spawns', from: 'scan-1' },
    skillId: skill.id, checkId: check.id, planned: true, seq: 1000 + plannedSeq
  });
}
function planAll(skill) {
  skill.checks.forEach(function (c) { planCheck(skill, c); });
}

function viewSkills(host) {
  var cov = checkTotals();
  var head = el('div', { cls: 'skillbar-head' }, [
    el('h4', { text: t('skills.title') }),
    el('span', { cls: 'skill-cov' }, [
      el('span', { text: t('skills.included') }),
      el('span', { cls: 'bar' }, [el('i', { style: 'width:' + cov.ratio + '%' })]),
      el('span', { text: cov.covered + ' / ' + cov.total + '（' + cov.ratio + '%）' }),
      el('span', { text: '·' }),
      el('span', { text: t('skills.completed') }),
      el('span', { cls: 'bar' }, [el('i', { style: 'width:' + cov.completionRatio + '%' })]),
      el('span', { text: cov.completed + ' / ' + cov.total + '（' + cov.completionRatio + '%）' })
    ])
  ]);
  var box = el('div', { cls: 'skillbar' }, [head, el('p', { cls: 'skillbar-hint', text: t('skills.hint') })]);

  var list = el('div', { cls: 'skill-list' });
  skills().forEach(function (s) {
    var doneN = s.checks.filter(function (c) { return checkState(s.id, c.id) === 'done'; }).length;
    var row = el('div', { cls: 'skill-row' }, [
      el('span', { cls: 'skill-name data', text: s.id }),
      el('span', { cls: 'skill-label data', text: s.name }),
      el('span', { cls: 'skill-src', 'data-s': s.source, text: t('skills.src.' + s.source) }),
      el('span', { cls: 'skill-acts' }, [
        el('span', { cls: 'skill-count', text: doneN + '/' + s.checks.length + ' ' + t('skills.checks') }),
        s.enabled && doneN < s.checks.length
          ? el('button', { cls: 'mini', text: t('skills.genAll'), on: { click: function () { planAll(s); render(); } } })
          : null,
        el('button', {
          cls: 'toggle', 'aria-pressed': String(s.enabled),
          text: s.enabled ? t('skills.enabled') : t('skills.disabled'),
          on: { click: function () { s.enabled = !s.enabled; render(); } }
        })
      ]),
      el('span', { cls: 'skill-desc data', text: s.desc + '　·　' + t('skills.applies') + ' ' + s.applies })
    ]);
    var card = el('div', { cls: 'skill' + (s.enabled ? ' on' : '') }, [row]);
    if (s.enabled) {
      var ul = el('ul', { cls: 'check-list' });
      s.checks.forEach(function (c) {
        var st = checkState(s.id, c.id);
        var mark = st === 'done' ? '✔' : st === 'running' ? '●' : st === 'blocked' ? '▲' : st === 'planned' ? '◔' : '○';
        ul.appendChild(el('li', { cls: 'check', 'data-s': st }, [
          el('span', { cls: 'check-mark', text: mark }),
          el('span', { cls: 'data', text: c.title }),
          el('span', { cls: 'check-id data', text: c.id }),
          el('span', { cls: 'check-scope data', text: c.scope.join(' ') }),
          el('span', { cls: 'check-acts' }, [
            st === 'todo'
              ? el('button', { cls: 'mini', text: t('skills.genOne'), on: { click: function () { planCheck(s, c); render(); } } })
              : el('span', { cls: 'check-state', text: t('skills.check.' + st) })
          ])
        ]));
      });
      card.appendChild(ul);
    }
    list.appendChild(card);
  });
  box.appendChild(list);

  /* 自定义技能表单 */
  var add = el('div', { cls: 'skill-add' });
  if (!showSkillForm) {
    add.appendChild(el('button', {
      cls: 'btn', text: t('skills.add'),
      on: { click: function () { showSkillForm = true; skillFormErr = ''; render(); } }
    }));
    add.appendChild(el('p', { cls: 'skill-howto', text: t('skills.howto') }));
  } else {
    var nameIn = el('input', { type: 'text', placeholder: 'my-authz-checklist', value: '' });
    var descIn = el('input', { type: 'text', placeholder: t('skills.form.descPh'), value: '' });
    var catSel = el('select');
    ['recon', 'attack-surface', 'taint', 'config', 'dependency', 'verify', 'custom'].forEach(function (c) {
      catSel.appendChild(el('option', { value: c, text: c }));
    });
    catSel.value = 'custom';
    var checksIn = el('textarea', { placeholder: '越权：资源归属校验 | src/service/**\n多租户隔离 | src/**' });
    var form = el('div', { cls: 'skill-form' }, [
      el('div', { cls: 'row' }, [
        el('label', {}, [el('span', { text: t('skills.form.name') }), nameIn]),
        el('label', {}, [el('span', { text: t('skills.form.cat') }), catSel])
      ]),
      el('label', {}, [el('span', { text: t('skills.form.desc') }), descIn]),
      el('label', {}, [el('span', { text: t('skills.form.checks') }), checksIn]),
      el('p', { cls: 'hintline', text: t('skills.form.hint') }),
      skillFormErr ? el('p', { cls: 'err', text: skillFormErr }) : null,
      el('div', { cls: 'row' }, [
        el('button', {
          cls: 'btn primary', text: t('skills.form.submit'),
          on: {
            click: function () {
              var id = (nameIn.value || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
              var lines = (checksIn.value || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
              if (!id || !lines.length) { skillFormErr = t('skills.form.err'); render(); return; }
              if (skillById(id)) { skillFormErr = t('skills.form.dup'); render(); return; }
              skills().push({
                id: id, name: (descIn.value || '').trim() || id, source: 'user',
                category: catSel.value, enabled: true,
                desc: (descIn.value || '').trim() || t('skills.form.noDesc'),
                applies: t('skills.form.userAdded'),
                checks: lines.map(function (l, i) {
                  var parts = l.split('|');
                  var title = (parts[0] || '').trim() || ('check-' + (i + 1));
                  var scope = (parts[1] || '').trim();
                  return {
                    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || ('check-' + (i + 1)),
                    title: title, scope: scope ? scope.split(/\s+/) : ['src/**']
                  };
                })
              });
              showSkillForm = false; skillFormErr = '';
              toast(t('skills.added') + ' ' + id + '（' + lines.length + ' ' + t('skills.checks') + '）');
              render();
            }
          }
        }),
        el('button', { cls: 'btn', text: t('skills.form.cancel'), on: { click: function () { showSkillForm = false; skillFormErr = ''; render(); } } })
      ])
    ]);
    add.appendChild(form);
    add.appendChild(el('p', { cls: 'skill-howto', text: t('skills.howto') }));
  }
  box.appendChild(add);
  host.appendChild(box);
}

/* ══ 视图：任务与进度 ══════════════════════════════════════════ */
var STAGE_ORDER = ['recon', 'attack-surface', 'taint', 'config', 'dependency', 'verify', 'custom'];
function stageStates() {
  var out = {};
  /* 启用中的技能声明了某个类别，这个阶段就该出现在阶段条上（哪怕还没生成意图）——
     否则用户启用了技能却看不到「这个阶段已被规划」。 */
  var declared = {};
  skills().forEach(function (s) { if (s.enabled) declared[s.category] = 1; });
  STAGE_ORDER.forEach(function (cat) {
    var xs = state.intents.filter(function (i) { return i.category === cat; });
    if (!xs.length) { out[cat] = declared[cat] ? 'pending' : 'none'; return; }
    if (xs.some(function (i) { return i.status === 'running'; })) out[cat] = 'running';
    else if (xs.some(function (i) { return i.status === 'blocked'; })) out[cat] = 'blocked';
    else if (xs.every(function (i) { return i.status === 'done'; })) out[cat] = 'done';
    else out[cat] = 'pending';
  });
  return out;
}
function currentStage() {
  if (!state.intents.length) return t('stage.ready');
  var ss = stageStates();
  for (var i = 0; i < STAGE_ORDER.length; i++) if (ss[STAGE_ORDER[i]] === 'running') return t('stage.' + STAGE_ORDER[i]);
  for (var j = 0; j < STAGE_ORDER.length; j++) if (ss[STAGE_ORDER[j]] === 'blocked') return t('stage.blocked');
  var any = STAGE_ORDER.some(function (c) { return ss[c] !== 'none'; });
  return any ? t('stage.allDone') : t('stage.ready');
}
function coverageTotals() {
  var touched = 0, inScope = 0;
  MOCK.modules.forEach(function (m) { inScope += m.inScope; touched += Math.min(m.inScope, state.coverage[m.path] || 0); });
  return { touched: touched, inScope: inScope, ratio: inScope ? Math.round(touched / inScope * 100) : 0 };
}
function viewTasks(host) {
  var ss = stageStates();
  var sb = el('div', { cls: 'stagebar' });
  STAGE_ORDER.forEach(function (cat) {
    var st = ss[cat];
    if (st === 'none' && cat === 'custom') return;   // 没有自定义技能时不显示这一格
    var mark = st === 'done' ? '✔ ' : st === 'running' ? '● ' : st === 'blocked' ? '▲ ' : '○ ';
    sb.appendChild(el('span', { cls: 'stage', 'data-s': st, text: mark + t('stage.' + cat) }));
  });
  host.appendChild(sb);

  viewSkills(host);

  host.appendChild(el('div', { cls: 'f-sub', text: t('tasks.intents') }));
  if (!state.intents.length) host.appendChild(el('p', { cls: 'empty-state', text: t('tasks.empty') }));
  state.intents.forEach(function (i) {
    var nf = state.facts.filter(function (f) { return f.intentId === i.id; }).length;
    var nd = state.findings.filter(function (f) { return f.intentId === i.id; }).length;
    var card = el('div', { cls: 'task', 'data-s': i.status }, [
      el('div', { cls: 't-head' }, [
        el('span', { cls: 'st', 'data-s': i.status, text: t('st.' + i.status) }),
        el('span', { cls: 't-cat', text: i.category }),
        el('span', {
          cls: 't-skill', 'data-builtin': i.skillId ? '0' : '1',
          text: i.skillId ? i.skillId + ' / ' + i.checkId : t('skills.builtinFlow')
        }),
        el('span', { cls: 't-title', text: i.title }),
        el('span', { cls: 't-id', text: i.id })
      ]),
      el('div', { cls: 't-meta' }, [
        el('span', { text: t('field.scope') + ' ' + i.scope.join(', ') }),
        el('span', { text: t('tasks.facts') + ' ' + nf }),
        el('span', { text: t('tasks.findings') + ' ' + nd }),
        el('span', {
          text: i.delegatedSessionId
            ? t('tasks.session') + ' ' + i.delegatedSessionId
            : t('tasks.notDelegated')
        })
      ])
    ]);
    if (i.note) card.appendChild(el('div', { cls: 't-note', text: '▲ ' + i.note }));
    host.appendChild(card);
  });

  host.appendChild(el('div', { cls: 'f-sub', style: 'margin-top:22px', text: t('tasks.coverage') }));
  MOCK.modules.forEach(function (m) {
    var touched = Math.min(m.inScope, state.coverage[m.path] || 0);
    var pct = Math.round(touched / m.inScope * 100);
    host.appendChild(el('div', { cls: 'covrow' }, [
      el('span', { cls: 'mod', text: m.path }),
      el('span', { cls: 'bar' }, [el('i', { style: 'width:' + pct + '%' })]),
      el('span', { cls: 'num', text: pct + '%  (' + touched + '/' + m.inScope + ')' }),
      m.hotspot && pct < 40 ? el('span', { cls: 'hotspot', text: '← ' + t('tasks.hotspot') + '：' + m.hotspot }) : null
    ]));
  });

  host.appendChild(el('div', { cls: 'f-sub', style: 'margin-top:22px', text: t('tasks.timeline') }));
  var ul = el('ul', { cls: 'timeline' });
  state.timeline.slice().reverse().forEach(function (e) {
    ul.appendChild(el('li', { cls: 'tl' }, [
      el('span', { cls: 'tl-seq', text: '#' + e.seq }),
      el('span', { cls: 'tl-kind', text: t('tl.' + e.kind) }),
      el('span', { cls: 'tl-text', text: e.text })
    ]));
  });
  host.appendChild(ul);
  host.appendChild(el('p', { cls: 'note-inline', text: t('tasks.noTime') }));
}

/* ══ 视图：报告 ════════════════════════════════════════════════ */
function buildMarkdown() {
  var s = state.scan;
  if (!s) return ['# 白盒审计报告', '', '（未初始化：尚未调用 sast_start_scan。）'].join('\n');
  var cov = coverageTotals();
  var sevCount = {};
  state.findings.forEach(function (f) { if (f.status !== 'false-positive') sevCount[f.severity] = (sevCount[f.severity] || 0) + 1; });
  var statusCount = { done: 0, running: 0, blocked: 0, pending: 0 };
  state.intents.forEach(function (i) { statusCount[i.status]++; });
  var rank = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  var open = state.findings.filter(function (f) { return f.status !== 'false-positive'; })
    .sort(function (a, b) { return rank[a.severity] - rank[b.severity]; });
  var fp = state.findings.filter(function (f) { return f.status === 'false-positive'; });
  var parentOf = {}; edgesOf().forEach(function (e) { if (e.kind === 'parent') parentOf[e.targetId] = e.sourceId; });
  var nameOf = {}; state.assets.forEach(function (a) { nameOf[a.id] = a.value; });
  var anchor = {}; edgesOf().forEach(function (e) { if (!anchor[e.targetId] && e.kind !== 'flows_to') anchor[e.targetId] = e.kind + ' ' + e.sourceId; });

  var L = [];
  L.push('# 白盒审计报告', '');
  L.push('- 仓库: ' + s.repoUrl);
  L.push('- 分支/引用: ' + s.branch + ' @ ' + s.commit.slice(0, 7));
  L.push('- 审计目标: ' + s.objective);
  L.push('- 审计范围: ' + (s.scope.length ? s.scope.join(', ') : '全仓'));
  L.push('- 授权: ' + (s.authorization || '（未声明）'));
  L.push('- 代码规模: ' + s.fileCount + ' 个文件（' + s.languages + '）');
  L.push('');
  L.push('## 审计概要');
  L.push('- 审计意图 ' + state.intents.length + '（已完成 ' + statusCount.done + ' / 进行中 ' + statusCount.running + ' / 阻塞 ' + statusCount.blocked + ' / 待办 ' + statusCount.pending + '）');
  L.push('- 事实 ' + state.facts.length + ' · 漏洞 ' + state.findings.length + ' · 资产 ' + state.assets.length);
  L.push('- 有效漏洞按严重度: ' + (Object.keys(sevCount).length ? Object.keys(sevCount).map(function (k) { return k + ' ' + sevCount[k]; }).join(' / ') : '（无）'));
  L.push('- 文件覆盖率: 已触达 ' + cov.touched + ' / 范围内 ' + cov.inScope + ' 个文件（' + cov.ratio + '%）');
  var ck = checkTotals();
  L.push('- 检查项纳入率: ' + ck.covered + ' / ' + ck.total + '（' + ck.ratio + '%，非 todo）');
  L.push('- 检查项完成度: ' + ck.completed + ' / ' + ck.total + '（' + ck.completionRatio + '%，blocked ' + ck.blocked + '）');
  L.push('- 总耗时: （Demo 无存储层，不能提供真实墙钟耗时；目标实现以 sast_report 为准）');
  L.push('');
  L.push('## 用户审计方法论与检查项覆盖');
  var enabled = skills().filter(function (s) { return s.enabled; });
  if (!enabled.length) L.push('（未启用任何用户审计方法论：本次仅展示内置流程）');
  enabled.forEach(function (s) {
    var doneN = s.checks.filter(function (c) { return checkState(s.id, c.id) === 'done'; }).length;
    L.push('### ' + s.id + ' — ' + s.name + '（' + s.source + '，' + doneN + '/' + s.checks.length + ' 已完成）');
    s.checks.forEach(function (c) {
      var st = checkState(s.id, c.id);
      var nds = state.findings.filter(function (f) { return f.skillId === s.id && f.checkId === c.id; });
      L.push('- [' + st + '] ' + c.id + ' ' + c.title
        + '（范围 ' + c.scope.join(' ') + '）'
        + (nds.length ? ' → 漏洞 ' + nds.map(function (f) { return f.id; }).join(', ') : ''));
    });
    L.push('');
  });
  var incidental = state.findings.filter(function (f) { return !f.skillId; });
  if (incidental.length) {
    L.push('### 检查清单之外的发现（内置流程 / 顺带发现）');
    incidental.forEach(function (f) {
      L.push('- ' + f.id + ' [' + f.severity + '] ' + f.title);
    });
    L.push('');
  }
  L.push('## 漏洞明细');
  if (!open.length) L.push('（无）');
  open.forEach(function (f) {
    L.push('### ' + f.id + ' [' + f.severity + '] ' + (f.cwe ? f.cwe + ' · ' : '') + f.vulnClass + ' · ' + f.title);
    L.push('- 置信度: ' + f.confidence + '  · 状态: ' + f.status
      + '  · 来源: ' + (f.skillId ? f.skillId + ' / ' + f.checkId : '内置流程'));
    L.push('- 成因: ' + (f.description || '（无）'));
    var a = state.assets.filter(function (x) { return x.id === f.affectedAssetId; })[0];
    L.push('- 影响资产: ' + (a ? '[' + a.type + '] ' + a.value : '（未关联）'));
    L.push('- 代码证据链:');
    f.codePath.forEach(function (st, i) {
      L.push('  ' + (i + 1) + '. ' + loc(st) + (st.symbol ? '  ' + st.symbol : '') + ' — ' + st.note + (st.lineAdjusted ? '（行号已校正）' : ''));
    });
    if (f.poc) L.push('- 触发方式: ' + f.poc);
    if (f.remediation) L.push('- 修复建议: ' + f.remediation);
    L.push('');
  });
  L.push('## 已排除（误报裁决）');
  if (!fp.length) L.push('（无）');
  fp.forEach(function (f) {
    L.push('- ' + f.id + ' [' + f.severity + '] ' + f.title + ' — false-positive：' + f.triageReason);
  });
  L.push('');
  L.push('## 代码资产');
  if (!state.assets.length) L.push('（无）');
  state.assets.forEach(function (a) {
    var p = parentOf[a.id];
    L.push('- [' + a.type + '] ' + a.value + (a.meta ? '（' + a.meta + '）' : '') + (p ? ' ← ' + nameOf[p] : ''));
  });
  L.push('');
  L.push('## 审计链路');
  L.push('- 扫描 (scan ' + s.id + ')「' + s.repoUrl.split('/').slice(-2).join('/') + ' @ ' + s.branch + '」— 目标: ' + s.objective);
  state.intents.forEach(function (i) {
    L.push('- 意图 (intent ' + i.id + ')「' + i.title + '」(' + (anchor[i.id] || '?') + ') — 状态: ' + i.status);
  });
  state.facts.forEach(function (f) {
    L.push('- 事实 (fact ' + f.id + ') [' + f.kind + '] ' + loc(f) + ' ' + f.detail + ' (' + (anchor[f.id] || '?') + ')');
  });
  state.findings.forEach(function (f) {
    L.push('- 漏洞 (finding ' + f.id + ') [' + f.severity + '] ' + f.title + ' (' + (anchor[f.id] || '?') + ')');
  });
  L.push('');
  return L.join('\n');
}

/* 受限 Markdown 渲染：只认 # ## ### / - / "  N." —— 数据全程 textContent */
function renderMarkdown(host, md) {
  var box = el('div', { cls: 'md' });
  md.split('\n').forEach(function (line) {
    if (line === '') { box.appendChild(el('div', { cls: 'blank' })); return; }
    if (line.indexOf('### ') === 0) { box.appendChild(el('h3', { text: line.slice(4) })); return; }
    if (line.indexOf('## ') === 0) { box.appendChild(el('h2', { text: line.slice(3) })); return; }
    if (line.indexOf('# ') === 0) { box.appendChild(el('h1', { text: line.slice(2) })); return; }
    if (line.indexOf('- ') === 0) { box.appendChild(el('p', { cls: 'bullet', text: '· ' + line.slice(2) })); return; }
    if (/^ {2}\d+\. /.test(line)) { box.appendChild(el('p', { cls: 'step', text: line.trim() })); return; }
    box.appendChild(el('p', { text: line }));
  });
  host.appendChild(box);
}

function buildSarif() {
  var s = state.scan;
  return JSON.stringify({
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [{
      tool: { driver: { name: 'dsh-sast', informationUri: 'https://github.com/tangxiaofeng7/dsh-sast', version: '0.1.0' } },
      versionControlProvenance: s ? [{ repositoryUri: s.repoUrl, revisionId: s.commit, branch: s.branch }] : [],
      results: state.findings.map(function (f) {
        var r = {
          /* 有技能检查项时用它当 ruleId，外部平台就能按检查项聚合；否则回落 CWE */
          ruleId: f.skillId ? f.skillId + '/' + f.checkId : (f.cwe || f.vulnClass),
          level: f.severity === 'critical' || f.severity === 'high' ? 'error' : f.severity === 'medium' ? 'warning' : 'note',
          message: { text: f.title + ' — ' + f.description },
          properties: {
            'security-severity': ({ critical: '9.5', high: '8.0', medium: '5.0', low: '3.0', info: '1.0' })[f.severity],
            confidence: f.confidence, vulnClass: f.vulnClass, cwe: f.cwe,
            skillId: f.skillId, checkId: f.checkId
          },
          locations: [{ physicalLocation: { artifactLocation: { uri: f.codePath[0].path }, region: { startLine: f.codePath[0].line || 1 } } }],
          codeFlows: [{ threadFlows: [{ locations: f.codePath.map(function (st) {
            return { location: { physicalLocation: { artifactLocation: { uri: st.path }, region: { startLine: st.line || 1 } }, message: { text: st.note } } };
          }) }] }]
        };
        if (f.status === 'false-positive') r.suppressions = [{ kind: 'external', justification: f.triageReason }];
        return r;
      })
    }]
  }, null, 2);
}

function viewReport(host) {
  var md = buildMarkdown();
  var acts = el('div', { cls: 'report-actions' }, [
    el('button', { cls: 'btn primary', text: t('report.copy'), on: { click: function () { copyText(md, t('report.copied') + '：'); } } }),
    el('button', { cls: 'btn', text: t('report.download'), on: { click: function () { download('sast-report-gateway-a1b2c3d.md', md, 'text/markdown;charset=utf-8'); } } }),
    el('button', { cls: 'btn', text: t('report.sarif'), on: { click: function () { download('sast-gateway-a1b2c3d.sarif', buildSarif(), 'application/json'); } } })
  ]);
  host.appendChild(acts);
  host.appendChild(el('div', { cls: 'report-notice', text: t('report.notice') }));
  renderMarkdown(host, md);
}

/* ══ 头部卡片 ══════════════════════════════════════════════════ */
function renderHeader() {
  var host = $('scan-header'); clear(host);
  var s = state.scan; if (!s) return;
  var cov = coverageTotals();
  host.appendChild(el('div', { cls: 'sh-top' }, [
    el('span', { cls: 'sh-repo data', text: s.repoUrl.split('/').slice(-2).join('/') }),
    el('span', { cls: 'sh-ref data', text: s.branch + ' @ ' + s.commit.slice(0, 7) }),
    el('span', { cls: 'sh-stage', text: currentStage() })
  ]));
  host.appendChild(el('div', { cls: 'sh-line' }, [
    el('span', { text: t('hdr.objective') + '：' }), el('b', { cls: 'data', text: s.objective })
  ]));
  host.appendChild(el('div', { cls: 'sh-line' }, [
    el('span', { text: t('hdr.scope') + '：' }),
    el('b', { cls: 'data', text: s.scope.length ? s.scope.join(' ') : t('hdr.scopeAll') }),
    el('span', { text: '　·　' + t('hdr.size') + '：' }),
    el('b', {}, [el('span', { cls: 'data', text: String(s.fileCount) }), el('span', { text: ' ' + t('hdr.files') })]),
    el('span', { cls: 'data', text: '（' + s.languages + '）' })
  ]));
  host.appendChild(el('div', { cls: 'sh-line' }, [
    el('span', { text: t('hdr.auth') + '：' }),
    el('b', { cls: 'data', text: s.authorization || t('hdr.authNone') })
  ]));
  var counts = el('div', { cls: 'sh-counts' }, [
    el('span', { cls: 'sh-count' }, [el('b', { text: String(state.intents.length) }), el('span', { text: ' ' + t('count.intents') })]),
    el('span', { cls: 'sh-count' }, [el('b', { text: String(state.facts.length) }), el('span', { text: ' ' + t('count.facts') })]),
    el('span', { cls: 'sh-count' }, [el('b', { text: String(state.findings.length) }), el('span', { text: ' ' + t('count.findings') })]),
    el('span', { cls: 'sh-count' }, [el('b', { text: String(state.assets.length) }), el('span', { text: ' ' + t('count.assets') })]),
    el('span', { cls: 'window-tip', title: t('count.windowTip'), text: t('count.window') + ' ⓘ' })
  ]);
  host.appendChild(counts);
  var ck = checkTotals();
  host.appendChild(el('div', { cls: 'cov-wrap' }, [
    el('span', { text: t('cov.label') }),
    el('span', { cls: 'bar' }, [el('i', { style: 'width:' + cov.ratio + '%' })]),
    el('span', { text: cov.ratio + '%　' + t('cov.of', { a: cov.touched, b: cov.inScope }) }),
    el('span', { text: '　·　' + t('skills.included') }),
    el('span', { cls: 'bar', style: 'width:110px' }, [el('i', { style: 'width:' + ck.ratio + '%' })]),
    el('span', { text: ck.covered + ' / ' + ck.total }),
    el('span', { text: '　·　' + t('skills.completed') }),
    el('span', { cls: 'bar', style: 'width:110px' }, [el('i', { style: 'width:' + ck.completionRatio + '%' })]),
    el('span', { text: ck.completed + ' / ' + ck.total })
  ]));
}

/* ══ 会话与标签页可见性 ════════════════════════════════════════
 * 照搬 src/client/index.ts 的 isSastSession：预设名 → sastMounted →
 * 沿 parentId 上溯祖先链，遍历带 seen 集合防环。 */
var sessionId = 's-3ab1';
function sessionOf(id) {
  return MOCK.sessions.filter(function (s) { return s.id === id; })[0];
}
function currentSession() { return sessionOf(sessionId); }
function tabVisible(id) {
  var seen = {}, cursorId = id;
  while (cursorId && !seen[cursorId]) {
    seen[cursorId] = 1;
    var s = sessionOf(cursorId);
    if (!s) return false;
    if (s.preset === 'sast' || s.preset.indexOf('sast-') === 0) return true;
    if (s.mounted === true) return true;
    cursorId = s.parentId;
  }
  return false;
}

/* ══ 侧栏 / 对话 / 标签 ════════════════════════════════════════ */
function renderSidebar() {
  var ul = $('session-list'); clear(ul);
  MOCK.sessions.forEach(function (s) {
    var visible = tabVisible(s.id);
    var row = el('button', {
      cls: 'session-row' + (s.id === sessionId ? ' active' : ''),
      title: s.reason,
      on: { click: function () { switchSession(s.id); } }
    }, [
      el('div', { cls: 'session-name', text: s.name }),
      el('div', { cls: 'session-meta' }, [
        el('span', { text: s.id }),
        el('span', { cls: 'tagchip', text: s.preset }),
        el('span', {
          cls: 'tagchip ' + (visible ? 'on' : 'off'),
          text: t('view.sast') + (visible ? ' ✓' : ' ✕')
        })
      ]),
      el('div', { cls: 'session-meta', text: s.reason })
    ]);
    ul.appendChild(el('li', {}, [row]));
  });
}

function switchSession(id) {
  sessionId = id;
  closeDrawer();
  setPlaying(false);
  /* 主视图按会话保存，不能继承刚离开的会话。首次进入：主审计会话看 SAST，
     其余会话看自己的对话；用户之后主动切换的选择只属于当前会话。 */
  var remembered = activeViewBySession[id];
  activeView = remembered && (remembered !== 'sast' || tabVisible(id))
    ? remembered
    : defaultViewOf(id);
  activeViewBySession[id] = activeView;
  render();
}

function renderConversation() {
  var host = $('conv-scroll'); clear(host);
  var s = currentSession();

  if (s.kind !== 'primary') {
    (s.conv || []).forEach(function (c) {
      if (c.tool) {
        host.appendChild(el('div', { cls: 'msg' }, [
          el('div', { cls: 'toolcard' }, [
            el('div', { cls: 'toolcard-head' }, [el('span', { cls: 'toolcard-name', text: c.tool })]),
            el('div', { cls: 'toolcard-body', text: c.text })
          ])
        ]));
        return;
      }
      host.appendChild(el('div', { cls: 'msg' + (c.role === 'user' ? ' msg-user' : '') }, [
        el('div', { cls: 'msg-role', text: c.role }),
        el('div', { cls: 'msg-body', text: c.text })
      ]));
    });
    host.appendChild(el('p', { cls: 'conv-hint', text: s.reason }));
    host.scrollTop = host.scrollHeight;
    return;
  }

  host.appendChild(el('div', { cls: 'msg msg-user' }, [
    el('div', { cls: 'msg-role', text: 'user' }),
    el('div', { cls: 'msg-body', text: '审计 https://gitlab.corp.com/pay/gateway 的 release-2.1 分支，重点看认证和支付回调。范围限定 src/** 和 resources/**。' })
  ]));
  if (state.conv.length) {
    var m = el('div', { cls: 'msg' }, [el('div', { cls: 'msg-role', text: 'assistant' })]);
    m.appendChild(el('div', { cls: 'msg-body', text: '收到。先建立扫描记录并完成只读克隆，然后分阶段并发委派审计子 agent。' }));
    state.conv.forEach(function (c) {
      m.appendChild(el('div', { cls: 'toolcard' }, [
        el('div', { cls: 'toolcard-head' }, [
          el('span', { cls: 'toolcard-name', text: c.tool }),
          el('span', { cls: 'toolcard-seq', text: '#' + c.seq })
        ]),
        el('div', { cls: 'toolcard-body', text: c.text })
      ]));
    });
    host.appendChild(m);
  }
  host.appendChild(el('p', { cls: 'conv-hint', text: t('conv.hint') }));
  host.scrollTop = host.scrollHeight;
}

function defaultViewOf(id) {
  var sess = sessionOf(id);
  return sess && sess.kind === 'primary' && tabVisible(id) ? 'sast' : 'conversation';
}
var activeViewBySession = {};
var activeView = defaultViewOf(sessionId);
activeViewBySession[sessionId] = activeView;
var activeTab = 'explore';
var TABS = ['explore', 'findings', 'assets', 'tasks', 'report'];

function selectView(id) {
  activeView = id;
  activeViewBySession[sessionId] = id;
}

function renderViewTabs() {
  var host = $('view-tabs'); clear(host);
  var ids = ['conversation'];
  if (tabVisible(sessionId)) ids.push('sast');
  ids.forEach(function (id) {
    var b = el('button', {
      cls: 'view-tab', 'aria-selected': String(activeView === id),
      on: { click: function () { selectView(id); render(); } }
    }, [el('span', { text: t('view.' + id) })]);
    if (id === 'sast') b.appendChild(el('span', { cls: 'order', text: 'order 20' }));
    host.appendChild(b);
  });
}

function renderSubTabs() {
  var host = $('sub-tabs'); clear(host);
  var counts = { findings: state.findings.length, assets: state.assets.length, tasks: state.intents.length };
  TABS.forEach(function (id) {
    var b = el('button', {
      cls: 'sub-tab', 'aria-pressed': String(activeTab === id),
      on: { click: function () { activeTab = id; render(); } }
    }, [el('span', { text: t('tab.' + id) })]);
    if (counts[id] !== undefined) b.appendChild(el('span', { cls: 'cnt', text: String(counts[id]) }));
    host.appendChild(b);
  });
}

/* ══ 主渲染 ════════════════════════════════════════════════════ */
function render() {
  rebuild();
  var sess = currentSession();
  var isPrimary = sess.kind === 'primary';
  /* 非主审计会话没有自己的 scan：投影为 null（子会话只调 sast_submit）。
     同时清空主会话集合，避免任何残留数据被误渲染成当前会话内容。 */
  if (!isPrimary) {
    state = {
      scan: null, intents: [], facts: [], findings: [], assets: [],
      timeline: [], conv: [], coverage: {}
    };
  }
  if (activeView === 'sast' && !tabVisible(sessionId)) selectView('conversation');

  renderSidebar();
  renderViewTabs();
  renderConversation();

  $('view-conversation').className = 'view' + (activeView === 'conversation' ? ' active' : '');
  $('view-sast').className = 'view' + (activeView === 'sast' ? ' active' : '');

  /* 重放只对主审计会话有意义；语言切换始终可用 */
  ['btn-play', 'btn-step', 'btn-reset', 'scrub'].forEach(function (id) {
    $(id).classList.toggle('pb-disabled', !isPrimary);
  });
  $('pb-note').textContent = isPrimary ? '' : t('pb.onlyPrimary');

  var empty = $('sast-empty'), body = $('sast-body');
  if (!state.scan) {
    /* 不只依赖 hidden：同步清掉上一会话的 SAST DOM，杜绝旧图/头部在空态下重现。 */
    clear($('scan-header'));
    clear($('sub-tabs'));
    var staleContent = $('sub-content');
    staleContent.className = 'sub-content';
    clear(staleContent);
    body.hidden = true;
    body.style.display = 'none';
    empty.hidden = false; clear(empty);
    empty.appendChild(el('h3', { text: isPrimary ? t('empty.title') : t('empty.nullProjection') }));
    empty.appendChild(el('p', { text: isPrimary ? t('empty.body') : t('empty.nullBody') }));
    if (!isPrimary && sess.note) {
      empty.appendChild(el('div', { cls: 'why-card' }, [
        el('h4', { cls: 'chrome', text: t('empty.why') }),
        el('p', { cls: 'data', text: sess.note }),
        el('p', { cls: 'why-rule' }, [
          el('span', { cls: 'chrome', text: t('empty.rule') }),
          el('span', { cls: 'data', text: '　' + sess.reason })
        ])
      ]));
    }
  } else {
    clear(empty); empty.hidden = true;
    body.hidden = false;
    body.style.removeProperty('display');
    renderHeader(); renderSubTabs();
    var host = $('sub-content');
    host.className = 'sub-content'; clear(host);
    if (activeTab === 'explore') viewExplore(host);
    else if (activeTab === 'findings') viewFindings(host);
    else if (activeTab === 'assets') viewAssets(host);
    else if (activeTab === 'tasks') viewTasks(host);
    else viewReport(host);
  }

  var max = MOCK.script.length;
  var scrub = $('scrub');
  scrub.max = String(max); scrub.value = String(cursor);
  $('scrub-label').textContent = cursor + ' / ' + max;
}

/* ══ 播放控制 ══════════════════════════════════════════════════ */
var timer = null;
function setPlaying(on) {
  if (timer) { clearInterval(timer); timer = null; }
  $('btn-play').textContent = on ? '⏸ 暂停' : '▶ 模拟审计推进';
  if (!on) return;
  timer = setInterval(function () {
    if (cursor >= MOCK.script.length) { setPlaying(false); return; }
    cursor++; render();
  }, 520);
}
$('btn-play').addEventListener('click', function () {
  if (timer) { setPlaying(false); return; }
  if (cursor >= MOCK.script.length) cursor = 0;
  setPlaying(true);
});
$('btn-step').addEventListener('click', function () {
  setPlaying(false);
  if (cursor < MOCK.script.length) { cursor++; render(); }
});
$('btn-reset').addEventListener('click', function () {
  setPlaying(false);
  cursor = 0;
  plannedIntents = [];     // 用户生成的意图随重置一起清掉
  skillState = null;       // 技能启用状态回到默认
  showSkillForm = false; showReject = false;
  render();
});
$('scrub').addEventListener('input', function (ev) { setPlaying(false); cursor = Number(ev.target.value); render(); });
$('btn-lang').addEventListener('click', function () {
  lang = lang === 'zh' ? 'en' : 'zh';
  $('btn-lang').textContent = lang === 'zh' ? 'EN' : '中';
  render();
});
render();
