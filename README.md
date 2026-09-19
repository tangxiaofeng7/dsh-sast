# dsh-sast — DSH 白盒审计模式

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（dsh）的白盒代码审计模式：
输入代码仓库与用户/团队的审计方法论，记录审计意图、代码事实、污点链路、漏洞与代码资产，
并在 Web 中以审计链路、漏洞、代码资产、任务与进度、报告等视图展示。

## 安装

### 最快体验方式

```sh
npx --yes --legacy-peer-deps @tangxiaofeng7/dsh-sast
```
说明：
- npm 包名是 scoped 的 `@tangxiaofeng7/dsh-sast`（`npx` 对只有单一 bin 的包会直接运行它）；
- 本包以**精确版本**声明 dsh 宿主的 peer 依赖（见 `bundle.spec.ts` 契约），独立安装时 npm 会因
  上游 peer 网络无法自动调和而报 ERESOLVE，因此 quick-start 需要携带 `--legacy-peer-deps`；
  在 dsh 宿主内正常组合安装时不受影响。

### 手工安装（同一条路径）

#### 从 Release URL 安装

```powershell
dsh plugin --profile web add https://github.com/tangxiaofeng7/dsh-sast/releases/latest/download/dsh-sast.tar.gz
```
重启 dsh 后，在新会话中选择自动注册的「白盒审计模式」。

## License

[LICENSE](LICENSE)


