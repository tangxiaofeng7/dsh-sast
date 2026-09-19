window.__ModuleLoader__.load({
  id: "@tangxiaofeng7/dsh-sast",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    (function () {
      var css = ".GraphDetailDrawer-module__layer {\n  z-index: 10;\n  position: absolute;\n  inset: 0;\n}\n\n.GraphDetailDrawer-module__backdrop {\n  cursor: default;\n  background: #0000002e;\n  border: 0;\n  width: 100%;\n  position: absolute;\n  inset: 0;\n}\n\n.GraphDetailDrawer-module__drawer {\n  border-left: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-base);\n  flex-direction: column;\n  width: min(360px, 88%);\n  display: flex;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  right: 0;\n  box-shadow: -8px 0 24px #00000024;\n}\n\n.GraphDetailDrawer-module__header {\n  border-bottom: 1px solid var(--dsw-alias-border-l2);\n  align-items: flex-start;\n  gap: 12px;\n  padding: 16px;\n  display: flex;\n}\n\n.GraphDetailDrawer-module__title {\n  overflow-wrap: anywhere;\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n  flex: auto;\n  margin: 0;\n  font-size: 15px;\n  line-height: 22px;\n}\n\n.GraphDetailDrawer-module__close {\n  width: 28px;\n  height: 28px;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n  background: none;\n  border: 0;\n  border-radius: 4px;\n  flex: none;\n  padding: 0;\n  font-size: 22px;\n  line-height: 28px;\n}\n\n.GraphDetailDrawer-module__close:hover, .GraphDetailDrawer-module__close:focus-visible {\n  background: var(--dsw-alias-bg-layer-2);\n  outline: none;\n}\n\n.GraphDetailDrawer-module__fields {\n  flex-direction: column;\n  gap: 14px;\n  margin: 0;\n  padding: 16px;\n  display: flex;\n  overflow-y: auto;\n}\n\n.GraphDetailDrawer-module__field {\n  flex-direction: column;\n  gap: 4px;\n  display: flex;\n}\n\n.GraphDetailDrawer-module__field dt {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  line-height: 18px;\n}\n\n.GraphDetailDrawer-module__field dd {\n  overflow-wrap: anywhere;\n  color: var(--dsw-alias-label-primary);\n  margin: 0;\n  font-size: 13px;\n  line-height: 20px;\n}\n.AssetsView-module__root {\n  flex-direction: column;\n  flex: auto;\n  gap: 10px;\n  min-height: 0;\n  display: flex;\n}\n\n.AssetsView-module__modeBar {\n  flex: none;\n  gap: 4px;\n  display: flex;\n}\n\n.AssetsView-module__modeButton {\n  appearance: none;\n  color: var(--dsw-alias-label-tertiary);\n  cursor: pointer;\n  background: none;\n  border: 0;\n  border-radius: 999px;\n  padding: 4px 12px;\n  font-size: 12px;\n  line-height: 20px;\n}\n\n.AssetsView-module__modeButton:hover {\n  color: var(--dsw-alias-label-secondary);\n}\n\n.AssetsView-module__modeButton[aria-pressed=\"true\"] {\n  color: var(--dsw-alias-label-primary);\n  background: var(--dsw-alias-bg-layer-2);\n  font-weight: 600;\n}\n\n.AssetsView-module__list {\n  flex-direction: column;\n  flex: auto;\n  gap: 12px;\n  display: flex;\n  overflow-y: auto;\n}\n\n.AssetsView-module__group {\n  flex-direction: column;\n  gap: 4px;\n  min-width: 0;\n  display: flex;\n}\n\n.AssetsView-module__groupTitle {\n  color: var(--dsw-alias-label-tertiary);\n  margin: 0;\n  padding-left: 2px;\n  font-size: 12px;\n  font-weight: 600;\n  line-height: 20px;\n}\n\n.AssetsView-module__rows {\n  flex-direction: column;\n  gap: 4px;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n}\n\n.AssetsView-module__row {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-base);\n  border-radius: 8px;\n  align-items: baseline;\n  gap: 8px;\n  min-width: 0;\n  padding: 6px 10px;\n  font-size: 13px;\n  line-height: 20px;\n  display: flex;\n}\n\n.AssetsView-module__rowValue {\n  color: var(--dsw-alias-label-primary);\n  overflow-wrap: anywhere;\n  font-weight: 500;\n}\n\n.AssetsView-module__rowMeta {\n  color: var(--dsw-alias-label-tertiary);\n}\n\n.AssetsView-module__rowParent {\n  color: var(--dsw-alias-label-caption);\n}\n\n.AssetsView-module__graph {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-base);\n  border-radius: 8px;\n  flex: auto;\n  min-height: 320px;\n  position: relative;\n  overflow: hidden;\n}\n\n.AssetsView-module__graph .react-flow__controls {\n  border: 1px solid var(--dsw-alias-border-l2);\n  box-shadow: none;\n  background: var(--dsw-alias-bg-layer-1);\n  border-radius: 6px;\n  overflow: hidden;\n}\n\n.AssetsView-module__graph .react-flow__controls-button {\n  border-bottom-color: var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  color: var(--dsw-alias-label-secondary);\n}\n\n.AssetsView-module__graph .react-flow__controls-button:hover {\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-primary);\n}\n\n.AssetsView-module__graph .react-flow__controls-button svg {\n  fill: currentColor;\n}\n\n.AssetsView-module__empty {\n  text-align: center;\n  color: var(--dsw-alias-label-caption);\n  margin: 0;\n  padding: 24px 0;\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.AssetsView-module__node {\n  box-sizing: border-box;\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  cursor: pointer;\n  border-radius: 8px;\n  flex-direction: column;\n  gap: 4px;\n  width: 220px;\n  height: 100px;\n  padding: 8px 10px;\n  font-size: 12px;\n  line-height: 18px;\n  display: flex;\n  overflow: hidden;\n}\n\n.AssetsView-module__node:hover {\n  border-color: var(--dsw-alias-border-l1);\n}\n\n.AssetsView-module__nodeBadge {\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  border-radius: 999px;\n  align-self: flex-start;\n  padding: 0 8px;\n  font-size: 11px;\n  line-height: 18px;\n}\n\n.AssetsView-module__node[data-type=\"repo\"] .AssetsView-module__nodeBadge {\n  color: var(--dsw-alias-brand-primary);\n  background: var(--dsw-alias-state-business-tertiary);\n}\n\n.AssetsView-module__node[data-type=\"entrypoint\"] .AssetsView-module__nodeBadge, .AssetsView-module__node[data-type=\"package\"] .AssetsView-module__nodeBadge {\n  color: var(--dsw-alias-state-success-primary);\n  background: var(--dsw-alias-state-success-tertiary);\n}\n\n.AssetsView-module__nodeValue {\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-weight: 600;\n  overflow: hidden;\n}\n\n.AssetsView-module__nodeMeta {\n  min-width: 0;\n  color: var(--dsw-alias-label-tertiary);\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  display: -webkit-box;\n  overflow: hidden;\n}\n\n.AssetsView-module__handle {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-2);\n  border-radius: 999px;\n  width: 8px;\n  height: 8px;\n}\n\n.AssetsView-module__edgeLabel {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  pointer-events: none;\n  white-space: nowrap;\n  border-radius: 999px;\n  padding: 2px 8px;\n  font-size: 11px;\n  line-height: 16px;\n  position: absolute;\n}\n.BatchView-module__root {\n  flex-direction: column;\n  gap: 12px;\n  display: flex;\n  overflow-y: auto;\n}\n\n.BatchView-module__header {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  border-radius: 10px;\n  flex-direction: column;\n  gap: 4px;\n  padding: 12px 14px;\n  display: flex;\n}\n\n.BatchView-module__objective {\n  color: var(--dsw-alias-label-primary);\n  margin: 0;\n  font-size: 13px;\n  font-weight: 600;\n  line-height: 20px;\n}\n\n.BatchView-module__authorization {\n  color: var(--dsw-alias-label-secondary);\n  margin: 0;\n  font-size: 12px;\n  line-height: 18px;\n}\n\n.BatchView-module__status {\n  color: var(--dsw-alias-label-tertiary);\n  margin: 0;\n  font-size: 12px;\n  line-height: 18px;\n}\n\n.BatchView-module__methodologies {\n  flex-wrap: wrap;\n  gap: 6px;\n  margin: 4px 0 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n}\n\n.BatchView-module__methodology {\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  border-radius: 999px;\n  padding: 0 8px;\n  font-size: 11px;\n  line-height: 18px;\n}\n\n.BatchView-module__jobs {\n  flex-direction: column;\n  gap: 4px;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n}\n\n.BatchView-module__job {\n  background: var(--dsw-alias-bg-layer-1);\n  border-radius: 8px;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 8px;\n  min-width: 0;\n  padding: 6px 10px;\n  font-size: 12px;\n  line-height: 18px;\n  display: flex;\n}\n\n.BatchView-module__ordinal {\n  min-width: 24px;\n  color: var(--dsw-alias-label-caption);\n  flex: none;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\n}\n\n.BatchView-module__repoUrl {\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n  overflow-wrap: anywhere;\n  flex: auto;\n}\n\n.BatchView-module__jobStatus {\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  border-radius: 999px;\n  flex: none;\n  padding: 0 6px;\n  font-size: 10px;\n  line-height: 16px;\n}\n\n.BatchView-module__jobStatus[data-status=\"succeeded\"] {\n  color: #fff;\n  background: var(--dsw-alias-state-success-primary);\n}\n\n.BatchView-module__jobStatus[data-status=\"running\"] {\n  color: #fff;\n  background: var(--dsw-alias-state-business-primary);\n}\n\n.BatchView-module__jobStatus[data-status=\"failed\"], .BatchView-module__jobStatus[data-status=\"timed_out\"] {\n  color: #fff;\n  background: var(--dsw-alias-state-error-primary);\n}\n\n.BatchView-module__jobStatus[data-status=\"degraded\"], .BatchView-module__jobStatus[data-status=\"skipped\"] {\n  color: #fff;\n  background: var(--dsw-alias-state-warn-primary);\n}\n\n.BatchView-module__attempt {\n  color: var(--dsw-alias-label-caption);\n  flex: none;\n}\n\n.BatchView-module__unaudited {\n  color: var(--dsw-alias-label-caption);\n  flex: none;\n  font-style: italic;\n}\n\n.BatchView-module__fallback {\n  min-width: 0;\n  color: var(--dsw-alias-state-warn-primary);\n  overflow-wrap: anywhere;\n  flex: 100%;\n}\n.ExploreView-module__graph {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-base);\n  border-radius: 8px;\n  flex: auto;\n  min-height: 320px;\n  position: relative;\n  overflow: hidden;\n}\n\n.ExploreView-module__graph .react-flow__controls {\n  border: 1px solid var(--dsw-alias-border-l2);\n  box-shadow: none;\n  background: var(--dsw-alias-bg-layer-1);\n  border-radius: 6px;\n  overflow: hidden;\n}\n\n.ExploreView-module__graph .react-flow__controls-button {\n  border-bottom-color: var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  color: var(--dsw-alias-label-secondary);\n}\n\n.ExploreView-module__graph .react-flow__controls-button:hover {\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-primary);\n}\n\n.ExploreView-module__graph .react-flow__controls-button svg {\n  fill: currentColor;\n}\n\n.ExploreView-module__empty {\n  box-sizing: border-box;\n  text-align: center;\n  height: 100%;\n  color: var(--dsw-alias-label-caption);\n  place-items: center;\n  padding: 24px;\n  font-size: 13px;\n  line-height: 20px;\n  display: grid;\n}\n\n.ExploreView-module__node {\n  box-sizing: border-box;\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  cursor: pointer;\n  border-radius: 8px;\n  flex-direction: column;\n  gap: 4px;\n  width: 236px;\n  height: 120px;\n  padding: 8px 10px;\n  font-size: 12px;\n  line-height: 18px;\n  display: flex;\n  overflow: hidden;\n}\n\n.ExploreView-module__node:hover {\n  border-color: var(--dsw-alias-border-l1);\n}\n\n.ExploreView-module__node[data-kind=\"scan\"] {\n  border-color: var(--dsw-alias-border-l1);\n  background: var(--dsw-alias-bg-layer-2);\n}\n\n.ExploreView-module__handle {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-2);\n  border-radius: 999px;\n  width: 8px;\n  height: 8px;\n}\n\n.ExploreView-module__edgeLabel {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  pointer-events: none;\n  white-space: nowrap;\n  border-radius: 999px;\n  padding: 2px 8px;\n  font-size: 11px;\n  line-height: 16px;\n  position: absolute;\n}\n\n.ExploreView-module__flowEdgePath {\n  stroke: var(--dsw-alias-state-business-primary);\n  stroke-dasharray: 6 4;\n}\n\n.ExploreView-module__flowEdgeLabel {\n  border: 1px solid var(--dsw-alias-state-business-primary);\n  background: var(--dsw-alias-state-business-tertiary);\n  color: var(--dsw-alias-state-business-primary);\n  pointer-events: none;\n  white-space: nowrap;\n  border-radius: 999px;\n  padding: 2px 8px;\n  font-size: 11px;\n  line-height: 16px;\n  position: absolute;\n}\n\n.ExploreView-module__badge {\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  border-radius: 999px;\n  align-self: flex-start;\n  padding: 0 8px;\n  font-size: 11px;\n  line-height: 18px;\n}\n\n.ExploreView-module__node[data-kind=\"scan\"] .ExploreView-module__badge {\n  color: var(--dsw-alias-brand-primary);\n  background: var(--dsw-alias-state-business-tertiary);\n}\n\n.ExploreView-module__node[data-kind=\"fact\"] .ExploreView-module__badge {\n  color: var(--dsw-alias-state-business-primary);\n  background: var(--dsw-alias-state-business-tertiary);\n}\n\n.ExploreView-module__node[data-kind=\"finding\"] .ExploreView-module__badge {\n  color: var(--dsw-alias-state-warn-primary);\n  background: var(--dsw-alias-state-warn-tertiary);\n}\n\n.ExploreView-module__title {\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-weight: 600;\n  overflow: hidden;\n}\n\n.ExploreView-module__detail {\n  min-width: 0;\n  color: var(--dsw-alias-label-tertiary);\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  display: -webkit-box;\n  overflow: hidden;\n}\n\n.ExploreView-module__severity {\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  border-radius: 999px;\n  align-self: flex-start;\n  padding: 0 8px;\n  font-size: 11px;\n  line-height: 18px;\n}\n\n.ExploreView-module__severity[data-severity=\"critical\"], .ExploreView-module__severity[data-severity=\"high\"] {\n  color: #fff;\n  background: var(--dsw-alias-state-error-primary);\n}\n\n.ExploreView-module__severity[data-severity=\"medium\"] {\n  color: #fff;\n  background: var(--dsw-alias-state-warn-primary);\n}\n.FindingsView-module__list {\n  flex-direction: column;\n  gap: 10px;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n}\n\n.FindingsView-module__finding {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  border-radius: 12px;\n  flex-direction: column;\n  gap: 8px;\n  min-width: 0;\n  padding: 12px 14px;\n  display: flex;\n}\n\n.FindingsView-module__header {\n  align-items: center;\n  gap: 10px;\n  min-width: 0;\n  display: flex;\n}\n\n.FindingsView-module__severity {\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  border-radius: 999px;\n  flex: none;\n  padding: 0 10px;\n  font-size: 12px;\n  line-height: 22px;\n}\n\n.FindingsView-module__severity[data-severity=\"critical\"], .FindingsView-module__severity[data-severity=\"high\"] {\n  color: #fff;\n  background: var(--dsw-alias-state-error-primary);\n}\n\n.FindingsView-module__severity[data-severity=\"medium\"] {\n  color: #fff;\n  background: var(--dsw-alias-state-warn-primary);\n}\n\n.FindingsView-module__severity[data-severity=\"low\"] {\n  color: #fff;\n  background: var(--dsw-alias-state-business-primary);\n}\n\n.FindingsView-module__title {\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n  overflow-wrap: anywhere;\n  flex: auto;\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  line-height: 22px;\n}\n\n.FindingsView-module__id {\n  color: var(--dsw-alias-label-caption);\n  flex: none;\n  font-size: 11px;\n  line-height: 20px;\n}\n\n.FindingsView-module__tags {\n  gap: 8px;\n  margin: 0;\n  display: flex;\n}\n\n.FindingsView-module__tag {\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  border-radius: 999px;\n  padding: 0 8px;\n  font-size: 11px;\n  line-height: 18px;\n}\n\n.FindingsView-module__description {\n  color: var(--dsw-alias-label-secondary);\n  overflow-wrap: anywhere;\n  margin: 0;\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.FindingsView-module__codePathBlock {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-base);\n  border-radius: 8px;\n  flex-direction: column;\n  gap: 4px;\n  padding: 8px 10px;\n  display: flex;\n}\n\n.FindingsView-module__codePathLabel {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 11px;\n  font-weight: 600;\n  line-height: 18px;\n}\n\n.FindingsView-module__codePath {\n  color: var(--dsw-alias-label-secondary);\n  flex-direction: column;\n  gap: 2px;\n  margin: 0;\n  padding: 0;\n  font-size: 13px;\n  line-height: 20px;\n  list-style: none;\n  display: flex;\n}\n\n.FindingsView-module__hop {\n  align-items: baseline;\n  gap: 6px;\n  min-width: 0;\n  display: flex;\n}\n\n.FindingsView-module__hopIndex {\n  color: var(--dsw-alias-label-caption);\n  flex: none;\n}\n\n.FindingsView-module__hopLocation {\n  overflow-wrap: anywhere;\n  flex: auto;\n  min-width: 0;\n}\n\n.FindingsView-module__hopSymbol {\n  background: var(--dsw-alias-bg-layer-2);\n  border-radius: 4px;\n  margin-left: 6px;\n  padding: 0 4px;\n  font-size: 12px;\n}\n\n.FindingsView-module__hopActions {\n  flex: none;\n  gap: 4px;\n  display: flex;\n}\n\n.FindingsView-module__hopAction {\n  appearance: none;\n  color: var(--dsw-alias-label-tertiary);\n  cursor: pointer;\n  background: none;\n  border: 0;\n  border-radius: 4px;\n  padding: 0 4px;\n  font-size: 12px;\n  line-height: 18px;\n  text-decoration: none;\n}\n\n.FindingsView-module__hopAction:hover {\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-primary);\n}\n\n.FindingsView-module__asset {\n  color: var(--dsw-alias-label-tertiary);\n  margin: 0;\n  font-size: 12px;\n  line-height: 20px;\n}\n\n.FindingsView-module__origin {\n  color: var(--dsw-alias-label-caption);\n  margin: 0;\n  font-size: 12px;\n  line-height: 20px;\n}\n\n.FindingsView-module__empty {\n  text-align: center;\n  color: var(--dsw-alias-label-caption);\n  margin: 0;\n  padding: 24px 0;\n  font-size: 13px;\n  line-height: 20px;\n}\n.ReportView-module__root {\n  flex-direction: column;\n  flex: auto;\n  gap: 10px;\n  min-height: 0;\n  display: flex;\n}\n\n.ReportView-module__toolbar {\n  justify-content: space-between;\n  align-items: center;\n  gap: 12px;\n  display: flex;\n}\n\n.ReportView-module__hint {\n  color: var(--dsw-alias-label-tertiary);\n  margin: 0;\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.ReportView-module__actions {\n  flex: none;\n  gap: 8px;\n  display: flex;\n}\n\n.ReportView-module__action {\n  appearance: none;\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n  border-radius: 6px;\n  padding: 5px 10px;\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.ReportView-module__action:hover {\n  color: var(--dsw-alias-label-primary);\n  border-color: var(--dsw-alias-brand-primary);\n}\n\n.ReportView-module__error {\n  color: var(--dsw-alias-state-error-primary);\n  margin: 0;\n  font-size: 12px;\n  line-height: 18px;\n}\n\n.ReportView-module__markdown {\n  box-sizing: border-box;\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-base);\n  min-height: 240px;\n  color: var(--dsw-alias-label-secondary);\n  overflow-wrap: anywhere;\n  border-radius: 6px;\n  flex: auto;\n  margin: 0;\n  padding: 14px;\n  font-size: 13px;\n  line-height: 20px;\n  overflow: auto;\n}\n\n.ReportView-module__markdown h1, .ReportView-module__markdown h2, .ReportView-module__markdown h3, .ReportView-module__markdown p {\n  margin: 0;\n}\n\n.ReportView-module__markdown h1 {\n  border-bottom: 1px solid var(--dsw-alias-border-l2);\n  color: var(--dsw-alias-label-primary);\n  padding-bottom: 10px;\n  font-size: 18px;\n  line-height: 26px;\n}\n\n.ReportView-module__markdown h2 {\n  color: var(--dsw-alias-label-primary);\n  margin-top: 16px;\n  font-size: 15px;\n  line-height: 24px;\n}\n\n.ReportView-module__markdown h3 {\n  color: var(--dsw-alias-label-primary);\n  margin-top: 12px;\n  font-size: 14px;\n  line-height: 22px;\n}\n\n.ReportView-module__bullet {\n  padding-left: 14px;\n}\n\n.ReportView-module__bullet:before {\n  content: \"•\";\n  color: var(--dsw-alias-label-tertiary);\n  margin-left: -12px;\n  margin-right: 6px;\n}\n\n.ReportView-module__step {\n  white-space: pre-wrap;\n  padding-left: 28px;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\n  font-size: 12px;\n}\n.ReviewInboxView-module__root {\n  flex-direction: column;\n  gap: 10px;\n  display: flex;\n  overflow-y: auto;\n}\n\n.ReviewInboxView-module__hint {\n  color: var(--dsw-alias-label-tertiary);\n  margin: 0;\n  font-size: 12px;\n  line-height: 18px;\n}\n\n.ReviewInboxView-module__items {\n  flex-direction: column;\n  gap: 8px;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n}\n\n.ReviewInboxView-module__item {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  border-radius: 10px;\n  flex-direction: column;\n  gap: 4px;\n  padding: 10px 12px;\n  display: flex;\n}\n\n.ReviewInboxView-module__itemHeader {\n  align-items: baseline;\n  gap: 8px;\n  min-width: 0;\n  display: flex;\n}\n\n.ReviewInboxView-module__ordinal {\n  color: var(--dsw-alias-label-caption);\n  flex: none;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\n}\n\n.ReviewInboxView-module__repoUrl {\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n  overflow-wrap: anywhere;\n  flex: auto;\n  font-size: 13px;\n  font-weight: 600;\n}\n\n.ReviewInboxView-module__jobStatus {\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  border-radius: 999px;\n  flex: none;\n  padding: 0 6px;\n  font-size: 10px;\n  line-height: 16px;\n}\n\n.ReviewInboxView-module__fallback {\n  color: var(--dsw-alias-state-warn-primary);\n  overflow-wrap: anywhere;\n  margin: 0;\n  font-size: 12px;\n  line-height: 18px;\n}\n\n.ReviewInboxView-module__actionsHint {\n  color: var(--dsw-alias-label-caption);\n  margin: 0;\n  font-size: 11px;\n  line-height: 16px;\n}\n\n.ReviewInboxView-module__empty {\n  text-align: center;\n  color: var(--dsw-alias-label-caption);\n  margin: 0;\n  padding: 24px 0;\n  font-size: 13px;\n  line-height: 20px;\n}\n.TasksView-module__root {\n  flex-direction: column;\n  gap: 12px;\n  display: flex;\n  overflow-y: auto;\n}\n\n.TasksView-module__summary {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  border-radius: 10px;\n  flex-wrap: wrap;\n  gap: 16px;\n  padding: 12px 14px;\n  display: flex;\n}\n\n.TasksView-module__metric {\n  flex-direction: column;\n  gap: 2px;\n  min-width: 0;\n  display: flex;\n}\n\n.TasksView-module__metricLabel {\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 11px;\n  line-height: 16px;\n}\n\n.TasksView-module__metricValue {\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n  font-weight: 600;\n  line-height: 20px;\n}\n\n.TasksView-module__skills {\n  flex-direction: column;\n  gap: 10px;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n}\n\n.TasksView-module__skill {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  border-radius: 10px;\n  flex-direction: column;\n  gap: 6px;\n  min-width: 0;\n  padding: 10px 12px;\n  display: flex;\n}\n\n.TasksView-module__skillHeader {\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n  display: flex;\n}\n\n.TasksView-module__sourceBadge {\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  text-transform: capitalize;\n  border-radius: 999px;\n  flex: none;\n  padding: 0 8px;\n  font-size: 11px;\n  line-height: 18px;\n}\n\n.TasksView-module__sourceBadge[data-source=\"builtin\"] {\n  color: var(--dsw-alias-brand-primary);\n  background: var(--dsw-alias-state-business-tertiary);\n}\n\n.TasksView-module__skillTitle {\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n  overflow-wrap: anywhere;\n  flex: auto;\n  margin: 0;\n  font-size: 13px;\n  font-weight: 600;\n  line-height: 20px;\n}\n\n.TasksView-module__skillStatus {\n  color: var(--dsw-alias-label-tertiary);\n  flex: none;\n  font-size: 11px;\n  line-height: 18px;\n}\n\n.TasksView-module__skillStatus[data-enabled=\"false\"] {\n  color: var(--dsw-alias-label-caption);\n}\n\n.TasksView-module__skillProgress {\n  color: var(--dsw-alias-label-secondary);\n  flex: none;\n  font-size: 12px;\n  font-weight: 600;\n  line-height: 20px;\n}\n\n.TasksView-module__checks {\n  flex-direction: column;\n  gap: 4px;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: flex;\n}\n\n.TasksView-module__check {\n  background: var(--dsw-alias-bg-base);\n  border-radius: 6px;\n  align-items: baseline;\n  gap: 8px;\n  min-width: 0;\n  padding: 4px 8px;\n  font-size: 12px;\n  line-height: 18px;\n  display: flex;\n}\n\n.TasksView-module__checkState {\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  border-radius: 999px;\n  flex: none;\n  padding: 0 6px;\n  font-size: 10px;\n  line-height: 16px;\n}\n\n.TasksView-module__checkState[data-state=\"done\"] {\n  color: #fff;\n  background: var(--dsw-alias-state-success-primary);\n}\n\n.TasksView-module__checkState[data-state=\"running\"] {\n  color: #fff;\n  background: var(--dsw-alias-state-business-primary);\n}\n\n.TasksView-module__checkState[data-state=\"blocked\"] {\n  color: #fff;\n  background: var(--dsw-alias-state-error-primary);\n}\n\n.TasksView-module__checkId {\n  color: var(--dsw-alias-label-caption);\n  flex: none;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\n}\n\n.TasksView-module__checkTitle {\n  min-width: 0;\n  color: var(--dsw-alias-label-secondary);\n  overflow-wrap: anywhere;\n  flex: auto;\n}\n\n.TasksView-module__empty {\n  text-align: center;\n  color: var(--dsw-alias-label-caption);\n  margin: 0;\n  padding: 24px 0;\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.TasksView-module__noMethodology {\n  color: var(--dsw-alias-label-tertiary);\n  margin: 0;\n  padding: 8px 0;\n  font-size: 12px;\n  line-height: 18px;\n}\n.SastView-module__root {\n  box-sizing: border-box;\n  flex-direction: column;\n  gap: 12px;\n  height: 100%;\n  padding: 16px 20px;\n  display: flex;\n  overflow-y: auto;\n}\n\n.SastView-module__card {\n  background: var(--dsw-alias-bg-layer-1);\n  border: 1px solid var(--dsw-alias-border-l1);\n  border-radius: 12px;\n  flex-direction: column;\n  flex: none;\n  gap: 8px;\n  min-width: 0;\n  padding: 14px 16px;\n  display: flex;\n}\n\n.SastView-module__cardTitle {\n  align-items: baseline;\n  gap: 12px;\n  min-width: 0;\n  display: flex;\n}\n\n.SastView-module__repo {\n  min-width: 0;\n  color: var(--dsw-alias-label-primary);\n  overflow-wrap: anywhere;\n  flex: auto;\n  margin: 0;\n  font-size: 16px;\n  font-weight: 600;\n  line-height: 24px;\n}\n\n.SastView-module__branch {\n  color: var(--dsw-alias-label-secondary);\n  flex: none;\n  font-size: 13px;\n  line-height: 24px;\n}\n\n.SastView-module__objective {\n  color: var(--dsw-alias-label-secondary);\n  overflow-wrap: anywhere;\n  margin: 0;\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.SastView-module__counts {\n  color: var(--dsw-alias-label-tertiary);\n  margin: 0;\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.SastView-module__authorization {\n  color: var(--dsw-alias-label-secondary);\n  overflow-wrap: anywhere;\n  margin: 0;\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.SastView-module__tabs {\n  border-bottom: 1px solid var(--dsw-alias-border-l1);\n  flex: none;\n  gap: 4px;\n  display: flex;\n}\n\n.SastView-module__tab {\n  appearance: none;\n  color: var(--dsw-alias-label-tertiary);\n  cursor: pointer;\n  background: none;\n  border: 0;\n  border-radius: 8px 8px 0 0;\n  padding: 6px 12px;\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.SastView-module__tab:hover {\n  color: var(--dsw-alias-label-secondary);\n}\n\n.SastView-module__tab[aria-pressed=\"true\"] {\n  color: var(--dsw-alias-label-primary);\n  box-shadow: inset 0 -2px 0 var(--dsw-alias-brand-primary);\n  font-weight: 600;\n}\n\n.SastView-module__content {\n  flex-direction: column;\n  flex: auto;\n  min-height: 0;\n  display: flex;\n}\n\n.SastView-module__empty {\n  box-sizing: border-box;\n  place-items: center;\n  height: 100%;\n  padding: 24px;\n  display: grid;\n}\n\n.SastView-module__emptyText {\n  text-align: center;\n  max-width: 480px;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 13px;\n  line-height: 22px;\n}\n";
      var tagId = "@tangxiaofeng7/dsh-sast/modules";
      if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') === null) {
        var tag = document.createElement('style');
        tag.dataset.plugin = "@tangxiaofeng7/dsh-sast";
        tag.dataset.pluginCss = tagId;
        tag.textContent = css;
        document.head.appendChild(tag);
      }
    })();
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    //#region \0rolldown/runtime.js
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
    var __copyProps = (to, from, except, desc) => {
    	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
    		key = keys[i];
    		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
    			get: ((k) => from[k]).bind(null, key),
    			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    		});
    	}
    	return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
    	value: mod,
    	enumerable: true
    }) : target, mod));
    //#endregion
    let react = require("react");
    react = __toESM(react, 1);
    let react_jsx_runtime = require("react/jsx-runtime");
    //#region ../../node_modules/classcat/index.js
    function cc(names) {
    	if (typeof names === "string" || typeof names === "number") return "" + names;
    	let out = "";
    	if (Array.isArray(names)) {
    		for (let i = 0, tmp; i < names.length; i++) if ((tmp = cc(names[i])) !== "") out += (out && " ") + tmp;
    	} else for (let k in names) if (names[k]) out += (out && " ") + k;
    	return out;
    }
    //#endregion
    //#region ../../node_modules/d3-dispatch/src/dispatch.js
    var noop = { value: () => {} };
    function dispatch() {
    	for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    		if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    		_[t] = [];
    	}
    	return new Dispatch(_);
    }
    function Dispatch(_) {
    	this._ = _;
    }
    function parseTypenames$1(typenames, types) {
    	return typenames.trim().split(/^|\s+/).map(function(t) {
    		var name = "", i = t.indexOf(".");
    		if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    		if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    		return {
    			type: t,
    			name
    		};
    	});
    }
    Dispatch.prototype = dispatch.prototype = {
    	constructor: Dispatch,
    	on: function(typename, callback) {
    		var _ = this._, T = parseTypenames$1(typename + "", _), t, i = -1, n = T.length;
    		if (arguments.length < 2) {
    			while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
    			return;
    		}
    		if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    		while (++i < n) if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
    		else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
    		return this;
    	},
    	copy: function() {
    		var copy = {}, _ = this._;
    		for (var t in _) copy[t] = _[t].slice();
    		return new Dispatch(copy);
    	},
    	call: function(type, that) {
    		if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    		if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    		for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    	},
    	apply: function(type, that, args) {
    		if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    		for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    	}
    };
    function get$1(type, name) {
    	for (var i = 0, n = type.length, c; i < n; ++i) if ((c = type[i]).name === name) return c.value;
    }
    function set$1(type, name, callback) {
    	for (var i = 0, n = type.length; i < n; ++i) if (type[i].name === name) {
    		type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
    		break;
    	}
    	if (callback != null) type.push({
    		name,
    		value: callback
    	});
    	return type;
    }
    var namespaces_default = {
    	svg: "http://www.w3.org/2000/svg",
    	xhtml: "http://www.w3.org/1999/xhtml",
    	xlink: "http://www.w3.org/1999/xlink",
    	xml: "http://www.w3.org/XML/1998/namespace",
    	xmlns: "http://www.w3.org/2000/xmlns/"
    };
    //#endregion
    //#region ../../node_modules/d3-selection/src/namespace.js
    function namespace_default(name) {
    	var prefix = name += "", i = prefix.indexOf(":");
    	if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    	return namespaces_default.hasOwnProperty(prefix) ? {
    		space: namespaces_default[prefix],
    		local: name
    	} : name;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/creator.js
    function creatorInherit(name) {
    	return function() {
    		var document = this.ownerDocument, uri = this.namespaceURI;
    		return uri === "http://www.w3.org/1999/xhtml" && document.documentElement.namespaceURI === "http://www.w3.org/1999/xhtml" ? document.createElement(name) : document.createElementNS(uri, name);
    	};
    }
    function creatorFixed(fullname) {
    	return function() {
    		return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    	};
    }
    function creator_default(name) {
    	var fullname = namespace_default(name);
    	return (fullname.local ? creatorFixed : creatorInherit)(fullname);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selector.js
    function none() {}
    function selector_default(selector) {
    	return selector == null ? none : function() {
    		return this.querySelector(selector);
    	};
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/select.js
    function select_default$2(select) {
    	if (typeof select !== "function") select = selector_default(select);
    	for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
    		if ("__data__" in node) subnode.__data__ = node.__data__;
    		subgroup[i] = subnode;
    	}
    	return new Selection$1(subgroups, this._parents);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/array.js
    function array(x) {
    	return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selectorAll.js
    function empty() {
    	return [];
    }
    function selectorAll_default(selector) {
    	return selector == null ? empty : function() {
    		return this.querySelectorAll(selector);
    	};
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/selectAll.js
    function arrayAll(select) {
    	return function() {
    		return array(select.apply(this, arguments));
    	};
    }
    function selectAll_default$1(select) {
    	if (typeof select === "function") select = arrayAll(select);
    	else select = selectorAll_default(select);
    	for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) if (node = group[i]) {
    		subgroups.push(select.call(node, node.__data__, i, group));
    		parents.push(node);
    	}
    	return new Selection$1(subgroups, parents);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/matcher.js
    function matcher_default(selector) {
    	return function() {
    		return this.matches(selector);
    	};
    }
    function childMatcher(selector) {
    	return function(node) {
    		return node.matches(selector);
    	};
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/selectChild.js
    var find = Array.prototype.find;
    function childFind(match) {
    	return function() {
    		return find.call(this.children, match);
    	};
    }
    function childFirst() {
    	return this.firstElementChild;
    }
    function selectChild_default(match) {
    	return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/selectChildren.js
    var filter = Array.prototype.filter;
    function children() {
    	return Array.from(this.children);
    }
    function childrenFilter(match) {
    	return function() {
    		return filter.call(this.children, match);
    	};
    }
    function selectChildren_default(match) {
    	return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/filter.js
    function filter_default$1(match) {
    	if (typeof match !== "function") match = matcher_default(match);
    	for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) if ((node = group[i]) && match.call(node, node.__data__, i, group)) subgroup.push(node);
    	return new Selection$1(subgroups, this._parents);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/sparse.js
    function sparse_default(update) {
    	return new Array(update.length);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/enter.js
    function enter_default() {
    	return new Selection$1(this._enter || this._groups.map(sparse_default), this._parents);
    }
    function EnterNode(parent, datum) {
    	this.ownerDocument = parent.ownerDocument;
    	this.namespaceURI = parent.namespaceURI;
    	this._next = null;
    	this._parent = parent;
    	this.__data__ = datum;
    }
    EnterNode.prototype = {
    	constructor: EnterNode,
    	appendChild: function(child) {
    		return this._parent.insertBefore(child, this._next);
    	},
    	insertBefore: function(child, next) {
    		return this._parent.insertBefore(child, next);
    	},
    	querySelector: function(selector) {
    		return this._parent.querySelector(selector);
    	},
    	querySelectorAll: function(selector) {
    		return this._parent.querySelectorAll(selector);
    	}
    };
    //#endregion
    //#region ../../node_modules/d3-selection/src/constant.js
    function constant_default$3(x) {
    	return function() {
    		return x;
    	};
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/data.js
    function bindIndex(parent, group, enter, update, exit, data) {
    	var i = 0, node, groupLength = group.length, dataLength = data.length;
    	for (; i < dataLength; ++i) if (node = group[i]) {
    		node.__data__ = data[i];
    		update[i] = node;
    	} else enter[i] = new EnterNode(parent, data[i]);
    	for (; i < groupLength; ++i) if (node = group[i]) exit[i] = node;
    }
    function bindKey(parent, group, enter, update, exit, data, key) {
    	var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
    	for (i = 0; i < groupLength; ++i) if (node = group[i]) {
    		keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
    		if (nodeByKeyValue.has(keyValue)) exit[i] = node;
    		else nodeByKeyValue.set(keyValue, node);
    	}
    	for (i = 0; i < dataLength; ++i) {
    		keyValue = key.call(parent, data[i], i, data) + "";
    		if (node = nodeByKeyValue.get(keyValue)) {
    			update[i] = node;
    			node.__data__ = data[i];
    			nodeByKeyValue.delete(keyValue);
    		} else enter[i] = new EnterNode(parent, data[i]);
    	}
    	for (i = 0; i < groupLength; ++i) if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) exit[i] = node;
    }
    function datum(node) {
    	return node.__data__;
    }
    function data_default(value, key) {
    	if (!arguments.length) return Array.from(this, datum);
    	var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
    	if (typeof value !== "function") value = constant_default$3(value);
    	for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    		var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength);
    		bind(parent, group, enterGroup, updateGroup, exit[j] = new Array(groupLength), data, key);
    		for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) if (previous = enterGroup[i0]) {
    			if (i0 >= i1) i1 = i0 + 1;
    			while (!(next = updateGroup[i1]) && ++i1 < dataLength);
    			previous._next = next || null;
    		}
    	}
    	update = new Selection$1(update, parents);
    	update._enter = enter;
    	update._exit = exit;
    	return update;
    }
    function arraylike(data) {
    	return typeof data === "object" && "length" in data ? data : Array.from(data);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/exit.js
    function exit_default() {
    	return new Selection$1(this._exit || this._groups.map(sparse_default), this._parents);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/join.js
    function join_default(onenter, onupdate, onexit) {
    	var enter = this.enter(), update = this, exit = this.exit();
    	if (typeof onenter === "function") {
    		enter = onenter(enter);
    		if (enter) enter = enter.selection();
    	} else enter = enter.append(onenter + "");
    	if (onupdate != null) {
    		update = onupdate(update);
    		if (update) update = update.selection();
    	}
    	if (onexit == null) exit.remove();
    	else onexit(exit);
    	return enter && update ? enter.merge(update).order() : update;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/merge.js
    function merge_default$1(context) {
    	var selection = context.selection ? context.selection() : context;
    	for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) if (node = group0[i] || group1[i]) merge[i] = node;
    	for (; j < m0; ++j) merges[j] = groups0[j];
    	return new Selection$1(merges, this._parents);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/order.js
    function order_default() {
    	for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) if (node = group[i]) {
    		if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
    		next = node;
    	}
    	return this;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/sort.js
    function sort_default(compare) {
    	if (!compare) compare = ascending;
    	function compareNode(a, b) {
    		return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    	}
    	for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    		for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) if (node = group[i]) sortgroup[i] = node;
    		sortgroup.sort(compareNode);
    	}
    	return new Selection$1(sortgroups, this._parents).order();
    }
    function ascending(a, b) {
    	return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/call.js
    function call_default() {
    	var callback = arguments[0];
    	arguments[0] = this;
    	callback.apply(null, arguments);
    	return this;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/nodes.js
    function nodes_default() {
    	return Array.from(this);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/node.js
    function node_default() {
    	for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
    		var node = group[i];
    		if (node) return node;
    	}
    	return null;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/size.js
    function size_default() {
    	let size = 0;
    	for (const node of this) ++size;
    	return size;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/empty.js
    function empty_default() {
    	return !this.node();
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/each.js
    function each_default(callback) {
    	for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) if (node = group[i]) callback.call(node, node.__data__, i, group);
    	return this;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/attr.js
    function attrRemove$1(name) {
    	return function() {
    		this.removeAttribute(name);
    	};
    }
    function attrRemoveNS$1(fullname) {
    	return function() {
    		this.removeAttributeNS(fullname.space, fullname.local);
    	};
    }
    function attrConstant$1(name, value) {
    	return function() {
    		this.setAttribute(name, value);
    	};
    }
    function attrConstantNS$1(fullname, value) {
    	return function() {
    		this.setAttributeNS(fullname.space, fullname.local, value);
    	};
    }
    function attrFunction$1(name, value) {
    	return function() {
    		var v = value.apply(this, arguments);
    		if (v == null) this.removeAttribute(name);
    		else this.setAttribute(name, v);
    	};
    }
    function attrFunctionNS$1(fullname, value) {
    	return function() {
    		var v = value.apply(this, arguments);
    		if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    		else this.setAttributeNS(fullname.space, fullname.local, v);
    	};
    }
    function attr_default$1(name, value) {
    	var fullname = namespace_default(name);
    	if (arguments.length < 2) {
    		var node = this.node();
    		return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
    	}
    	return this.each((value == null ? fullname.local ? attrRemoveNS$1 : attrRemove$1 : typeof value === "function" ? fullname.local ? attrFunctionNS$1 : attrFunction$1 : fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, value));
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/window.js
    function window_default(node) {
    	return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/style.js
    function styleRemove$1(name) {
    	return function() {
    		this.style.removeProperty(name);
    	};
    }
    function styleConstant$1(name, value, priority) {
    	return function() {
    		this.style.setProperty(name, value, priority);
    	};
    }
    function styleFunction$1(name, value, priority) {
    	return function() {
    		var v = value.apply(this, arguments);
    		if (v == null) this.style.removeProperty(name);
    		else this.style.setProperty(name, v, priority);
    	};
    }
    function style_default$1(name, value, priority) {
    	return arguments.length > 1 ? this.each((value == null ? styleRemove$1 : typeof value === "function" ? styleFunction$1 : styleConstant$1)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
    }
    function styleValue(node, name) {
    	return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/property.js
    function propertyRemove(name) {
    	return function() {
    		delete this[name];
    	};
    }
    function propertyConstant(name, value) {
    	return function() {
    		this[name] = value;
    	};
    }
    function propertyFunction(name, value) {
    	return function() {
    		var v = value.apply(this, arguments);
    		if (v == null) delete this[name];
    		else this[name] = v;
    	};
    }
    function property_default(name, value) {
    	return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/classed.js
    function classArray(string) {
    	return string.trim().split(/^|\s+/);
    }
    function classList(node) {
    	return node.classList || new ClassList(node);
    }
    function ClassList(node) {
    	this._node = node;
    	this._names = classArray(node.getAttribute("class") || "");
    }
    ClassList.prototype = {
    	add: function(name) {
    		if (this._names.indexOf(name) < 0) {
    			this._names.push(name);
    			this._node.setAttribute("class", this._names.join(" "));
    		}
    	},
    	remove: function(name) {
    		var i = this._names.indexOf(name);
    		if (i >= 0) {
    			this._names.splice(i, 1);
    			this._node.setAttribute("class", this._names.join(" "));
    		}
    	},
    	contains: function(name) {
    		return this._names.indexOf(name) >= 0;
    	}
    };
    function classedAdd(node, names) {
    	var list = classList(node), i = -1, n = names.length;
    	while (++i < n) list.add(names[i]);
    }
    function classedRemove(node, names) {
    	var list = classList(node), i = -1, n = names.length;
    	while (++i < n) list.remove(names[i]);
    }
    function classedTrue(names) {
    	return function() {
    		classedAdd(this, names);
    	};
    }
    function classedFalse(names) {
    	return function() {
    		classedRemove(this, names);
    	};
    }
    function classedFunction(names, value) {
    	return function() {
    		(value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    	};
    }
    function classed_default(name, value) {
    	var names = classArray(name + "");
    	if (arguments.length < 2) {
    		var list = classList(this.node()), i = -1, n = names.length;
    		while (++i < n) if (!list.contains(names[i])) return false;
    		return true;
    	}
    	return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/text.js
    function textRemove() {
    	this.textContent = "";
    }
    function textConstant$1(value) {
    	return function() {
    		this.textContent = value;
    	};
    }
    function textFunction$1(value) {
    	return function() {
    		var v = value.apply(this, arguments);
    		this.textContent = v == null ? "" : v;
    	};
    }
    function text_default$1(value) {
    	return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction$1 : textConstant$1)(value)) : this.node().textContent;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/html.js
    function htmlRemove() {
    	this.innerHTML = "";
    }
    function htmlConstant(value) {
    	return function() {
    		this.innerHTML = value;
    	};
    }
    function htmlFunction(value) {
    	return function() {
    		var v = value.apply(this, arguments);
    		this.innerHTML = v == null ? "" : v;
    	};
    }
    function html_default(value) {
    	return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/raise.js
    function raise() {
    	if (this.nextSibling) this.parentNode.appendChild(this);
    }
    function raise_default() {
    	return this.each(raise);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/lower.js
    function lower() {
    	if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
    }
    function lower_default() {
    	return this.each(lower);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/append.js
    function append_default(name) {
    	var create = typeof name === "function" ? name : creator_default(name);
    	return this.select(function() {
    		return this.appendChild(create.apply(this, arguments));
    	});
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/insert.js
    function constantNull() {
    	return null;
    }
    function insert_default(name, before) {
    	var create = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
    	return this.select(function() {
    		return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    	});
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/remove.js
    function remove() {
    	var parent = this.parentNode;
    	if (parent) parent.removeChild(this);
    }
    function remove_default$1() {
    	return this.each(remove);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/clone.js
    function selection_cloneShallow() {
    	var clone = this.cloneNode(false), parent = this.parentNode;
    	return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }
    function selection_cloneDeep() {
    	var clone = this.cloneNode(true), parent = this.parentNode;
    	return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }
    function clone_default(deep) {
    	return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/datum.js
    function datum_default(value) {
    	return arguments.length ? this.property("__data__", value) : this.node().__data__;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/on.js
    function contextListener(listener) {
    	return function(event) {
    		listener.call(this, event, this.__data__);
    	};
    }
    function parseTypenames(typenames) {
    	return typenames.trim().split(/^|\s+/).map(function(t) {
    		var name = "", i = t.indexOf(".");
    		if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    		return {
    			type: t,
    			name
    		};
    	});
    }
    function onRemove(typename) {
    	return function() {
    		var on = this.__on;
    		if (!on) return;
    		for (var j = 0, i = -1, m = on.length, o; j < m; ++j) if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) this.removeEventListener(o.type, o.listener, o.options);
    		else on[++i] = o;
    		if (++i) on.length = i;
    		else delete this.__on;
    	};
    }
    function onAdd(typename, value, options) {
    	return function() {
    		var on = this.__on, o, listener = contextListener(value);
    		if (on) {
    			for (var j = 0, m = on.length; j < m; ++j) if ((o = on[j]).type === typename.type && o.name === typename.name) {
    				this.removeEventListener(o.type, o.listener, o.options);
    				this.addEventListener(o.type, o.listener = listener, o.options = options);
    				o.value = value;
    				return;
    			}
    		}
    		this.addEventListener(typename.type, listener, options);
    		o = {
    			type: typename.type,
    			name: typename.name,
    			value,
    			listener,
    			options
    		};
    		if (!on) this.__on = [o];
    		else on.push(o);
    	};
    }
    function on_default$1(typename, value, options) {
    	var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;
    	if (arguments.length < 2) {
    		var on = this.node().__on;
    		if (on) {
    			for (var j = 0, m = on.length, o; j < m; ++j) for (i = 0, o = on[j]; i < n; ++i) if ((t = typenames[i]).type === o.type && t.name === o.name) return o.value;
    		}
    		return;
    	}
    	on = value ? onAdd : onRemove;
    	for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
    	return this;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/dispatch.js
    function dispatchEvent(node, type, params) {
    	var window = window_default(node), event = window.CustomEvent;
    	if (typeof event === "function") event = new event(type, params);
    	else {
    		event = window.document.createEvent("Event");
    		if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    		else event.initEvent(type, false, false);
    	}
    	node.dispatchEvent(event);
    }
    function dispatchConstant(type, params) {
    	return function() {
    		return dispatchEvent(this, type, params);
    	};
    }
    function dispatchFunction(type, params) {
    	return function() {
    		return dispatchEvent(this, type, params.apply(this, arguments));
    	};
    }
    function dispatch_default(type, params) {
    	return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/iterator.js
    function* iterator_default() {
    	for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) if (node = group[i]) yield node;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/selection/index.js
    var root = [null];
    function Selection$1(groups, parents) {
    	this._groups = groups;
    	this._parents = parents;
    }
    function selection() {
    	return new Selection$1([[document.documentElement]], root);
    }
    function selection_selection() {
    	return this;
    }
    Selection$1.prototype = selection.prototype = {
    	constructor: Selection$1,
    	select: select_default$2,
    	selectAll: selectAll_default$1,
    	selectChild: selectChild_default,
    	selectChildren: selectChildren_default,
    	filter: filter_default$1,
    	data: data_default,
    	enter: enter_default,
    	exit: exit_default,
    	join: join_default,
    	merge: merge_default$1,
    	selection: selection_selection,
    	order: order_default,
    	sort: sort_default,
    	call: call_default,
    	nodes: nodes_default,
    	node: node_default,
    	size: size_default,
    	empty: empty_default,
    	each: each_default,
    	attr: attr_default$1,
    	style: style_default$1,
    	property: property_default,
    	classed: classed_default,
    	text: text_default$1,
    	html: html_default,
    	raise: raise_default,
    	lower: lower_default,
    	append: append_default,
    	insert: insert_default,
    	remove: remove_default$1,
    	clone: clone_default,
    	datum: datum_default,
    	on: on_default$1,
    	dispatch: dispatch_default,
    	[Symbol.iterator]: iterator_default
    };
    //#endregion
    //#region ../../node_modules/d3-selection/src/select.js
    function select_default$1(selector) {
    	return typeof selector === "string" ? new Selection$1([[document.querySelector(selector)]], [document.documentElement]) : new Selection$1([[selector]], root);
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/sourceEvent.js
    function sourceEvent_default(event) {
    	let sourceEvent;
    	while (sourceEvent = event.sourceEvent) event = sourceEvent;
    	return event;
    }
    //#endregion
    //#region ../../node_modules/d3-selection/src/pointer.js
    function pointer_default(event, node) {
    	event = sourceEvent_default(event);
    	if (node === void 0) node = event.currentTarget;
    	if (node) {
    		var svg = node.ownerSVGElement || node;
    		if (svg.createSVGPoint) {
    			var point = svg.createSVGPoint();
    			point.x = event.clientX, point.y = event.clientY;
    			point = point.matrixTransform(node.getScreenCTM().inverse());
    			return [point.x, point.y];
    		}
    		if (node.getBoundingClientRect) {
    			var rect = node.getBoundingClientRect();
    			return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    		}
    	}
    	return [event.pageX, event.pageY];
    }
    //#endregion
    //#region ../../node_modules/d3-drag/src/noevent.js
    const nonpassive = { passive: false };
    const nonpassivecapture = {
    	capture: true,
    	passive: false
    };
    function nopropagation$1(event) {
    	event.stopImmediatePropagation();
    }
    function noevent_default$1(event) {
    	event.preventDefault();
    	event.stopImmediatePropagation();
    }
    //#endregion
    //#region ../../node_modules/d3-drag/src/nodrag.js
    function nodrag_default(view) {
    	var root = view.document.documentElement, selection = select_default$1(view).on("dragstart.drag", noevent_default$1, nonpassivecapture);
    	if ("onselectstart" in root) selection.on("selectstart.drag", noevent_default$1, nonpassivecapture);
    	else {
    		root.__noselect = root.style.MozUserSelect;
    		root.style.MozUserSelect = "none";
    	}
    }
    function yesdrag(view, noclick) {
    	var root = view.document.documentElement, selection = select_default$1(view).on("dragstart.drag", null);
    	if (noclick) {
    		selection.on("click.drag", noevent_default$1, nonpassivecapture);
    		setTimeout(function() {
    			selection.on("click.drag", null);
    		}, 0);
    	}
    	if ("onselectstart" in root) selection.on("selectstart.drag", null);
    	else {
    		root.style.MozUserSelect = root.__noselect;
    		delete root.__noselect;
    	}
    }
    //#endregion
    //#region ../../node_modules/d3-drag/src/constant.js
    var constant_default$2 = (x) => () => x;
    //#endregion
    //#region ../../node_modules/d3-drag/src/event.js
    function DragEvent(type, { sourceEvent, subject, target, identifier, active, x, y, dx, dy, dispatch }) {
    	Object.defineProperties(this, {
    		type: {
    			value: type,
    			enumerable: true,
    			configurable: true
    		},
    		sourceEvent: {
    			value: sourceEvent,
    			enumerable: true,
    			configurable: true
    		},
    		subject: {
    			value: subject,
    			enumerable: true,
    			configurable: true
    		},
    		target: {
    			value: target,
    			enumerable: true,
    			configurable: true
    		},
    		identifier: {
    			value: identifier,
    			enumerable: true,
    			configurable: true
    		},
    		active: {
    			value: active,
    			enumerable: true,
    			configurable: true
    		},
    		x: {
    			value: x,
    			enumerable: true,
    			configurable: true
    		},
    		y: {
    			value: y,
    			enumerable: true,
    			configurable: true
    		},
    		dx: {
    			value: dx,
    			enumerable: true,
    			configurable: true
    		},
    		dy: {
    			value: dy,
    			enumerable: true,
    			configurable: true
    		},
    		_: { value: dispatch }
    	});
    }
    DragEvent.prototype.on = function() {
    	var value = this._.on.apply(this._, arguments);
    	return value === this._ ? this : value;
    };
    //#endregion
    //#region ../../node_modules/d3-drag/src/drag.js
    function defaultFilter$1(event) {
    	return !event.ctrlKey && !event.button;
    }
    function defaultContainer() {
    	return this.parentNode;
    }
    function defaultSubject(event, d) {
    	return d == null ? {
    		x: event.x,
    		y: event.y
    	} : d;
    }
    function defaultTouchable$1() {
    	return navigator.maxTouchPoints || "ontouchstart" in this;
    }
    function drag_default() {
    	var filter = defaultFilter$1, container = defaultContainer, subject = defaultSubject, touchable = defaultTouchable$1, gestures = {}, listeners = dispatch("start", "drag", "end"), active = 0, mousedownx, mousedowny, mousemoving, touchending, clickDistance2 = 0;
    	function drag(selection) {
    		selection.on("mousedown.drag", mousedowned).filter(touchable).on("touchstart.drag", touchstarted).on("touchmove.drag", touchmoved, nonpassive).on("touchend.drag touchcancel.drag", touchended).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    	}
    	function mousedowned(event, d) {
    		if (touchending || !filter.call(this, event, d)) return;
    		var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
    		if (!gesture) return;
    		select_default$1(event.view).on("mousemove.drag", mousemoved, nonpassivecapture).on("mouseup.drag", mouseupped, nonpassivecapture);
    		nodrag_default(event.view);
    		nopropagation$1(event);
    		mousemoving = false;
    		mousedownx = event.clientX;
    		mousedowny = event.clientY;
    		gesture("start", event);
    	}
    	function mousemoved(event) {
    		noevent_default$1(event);
    		if (!mousemoving) {
    			var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
    			mousemoving = dx * dx + dy * dy > clickDistance2;
    		}
    		gestures.mouse("drag", event);
    	}
    	function mouseupped(event) {
    		select_default$1(event.view).on("mousemove.drag mouseup.drag", null);
    		yesdrag(event.view, mousemoving);
    		noevent_default$1(event);
    		gestures.mouse("end", event);
    	}
    	function touchstarted(event, d) {
    		if (!filter.call(this, event, d)) return;
    		var touches = event.changedTouches, c = container.call(this, event, d), n = touches.length, i = 0, gesture;
    		for (; i < n; ++i) if (gesture = beforestart(this, c, event, d, touches[i].identifier, touches[i])) {
    			nopropagation$1(event);
    			gesture("start", event, touches[i]);
    		}
    	}
    	function touchmoved(event) {
    		var touches = event.changedTouches, n = touches.length, i = 0, gesture;
    		for (; i < n; ++i) if (gesture = gestures[touches[i].identifier]) {
    			noevent_default$1(event);
    			gesture("drag", event, touches[i]);
    		}
    	}
    	function touchended(event) {
    		var touches = event.changedTouches, n = touches.length, i, gesture;
    		if (touchending) clearTimeout(touchending);
    		touchending = setTimeout(function() {
    			touchending = null;
    		}, 500);
    		for (i = 0; i < n; ++i) if (gesture = gestures[touches[i].identifier]) {
    			nopropagation$1(event);
    			gesture("end", event, touches[i]);
    		}
    	}
    	function beforestart(that, container, event, d, identifier, touch) {
    		var dispatch = listeners.copy(), p = pointer_default(touch || event, container), dx, dy, s;
    		if ((s = subject.call(that, new DragEvent("beforestart", {
    			sourceEvent: event,
    			target: drag,
    			identifier,
    			active,
    			x: p[0],
    			y: p[1],
    			dx: 0,
    			dy: 0,
    			dispatch
    		}), d)) == null) return;
    		dx = s.x - p[0] || 0;
    		dy = s.y - p[1] || 0;
    		return function gesture(type, event, touch) {
    			var p0 = p, n;
    			switch (type) {
    				case "start":
    					gestures[identifier] = gesture, n = active++;
    					break;
    				case "end": delete gestures[identifier], --active;
    				case "drag": p = pointer_default(touch || event, container), n = active;
    			}
    			dispatch.call(type, that, new DragEvent(type, {
    				sourceEvent: event,
    				subject: s,
    				target: drag,
    				identifier,
    				active: n,
    				x: p[0] + dx,
    				y: p[1] + dy,
    				dx: p[0] - p0[0],
    				dy: p[1] - p0[1],
    				dispatch
    			}), d);
    		};
    	}
    	drag.filter = function(_) {
    		return arguments.length ? (filter = typeof _ === "function" ? _ : constant_default$2(!!_), drag) : filter;
    	};
    	drag.container = function(_) {
    		return arguments.length ? (container = typeof _ === "function" ? _ : constant_default$2(_), drag) : container;
    	};
    	drag.subject = function(_) {
    		return arguments.length ? (subject = typeof _ === "function" ? _ : constant_default$2(_), drag) : subject;
    	};
    	drag.touchable = function(_) {
    		return arguments.length ? (touchable = typeof _ === "function" ? _ : constant_default$2(!!_), drag) : touchable;
    	};
    	drag.on = function() {
    		var value = listeners.on.apply(listeners, arguments);
    		return value === listeners ? drag : value;
    	};
    	drag.clickDistance = function(_) {
    		return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
    	};
    	return drag;
    }
    //#endregion
    //#region ../../node_modules/d3-color/src/define.js
    function define_default(constructor, factory, prototype) {
    	constructor.prototype = factory.prototype = prototype;
    	prototype.constructor = constructor;
    }
    function extend(parent, definition) {
    	var prototype = Object.create(parent.prototype);
    	for (var key in definition) prototype[key] = definition[key];
    	return prototype;
    }
    //#endregion
    //#region ../../node_modules/d3-color/src/color.js
    function Color() {}
    var darker = .7;
    var brighter = 1 / darker;
    var reI = "\\s*([+-]?\\d+)\\s*";
    var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
    var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
    var reHex = /^#([0-9a-f]{3,8})$/;
    var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
    var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
    var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
    var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
    var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
    var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
    var named = {
    	aliceblue: 15792383,
    	antiquewhite: 16444375,
    	aqua: 65535,
    	aquamarine: 8388564,
    	azure: 15794175,
    	beige: 16119260,
    	bisque: 16770244,
    	black: 0,
    	blanchedalmond: 16772045,
    	blue: 255,
    	blueviolet: 9055202,
    	brown: 10824234,
    	burlywood: 14596231,
    	cadetblue: 6266528,
    	chartreuse: 8388352,
    	chocolate: 13789470,
    	coral: 16744272,
    	cornflowerblue: 6591981,
    	cornsilk: 16775388,
    	crimson: 14423100,
    	cyan: 65535,
    	darkblue: 139,
    	darkcyan: 35723,
    	darkgoldenrod: 12092939,
    	darkgray: 11119017,
    	darkgreen: 25600,
    	darkgrey: 11119017,
    	darkkhaki: 12433259,
    	darkmagenta: 9109643,
    	darkolivegreen: 5597999,
    	darkorange: 16747520,
    	darkorchid: 10040012,
    	darkred: 9109504,
    	darksalmon: 15308410,
    	darkseagreen: 9419919,
    	darkslateblue: 4734347,
    	darkslategray: 3100495,
    	darkslategrey: 3100495,
    	darkturquoise: 52945,
    	darkviolet: 9699539,
    	deeppink: 16716947,
    	deepskyblue: 49151,
    	dimgray: 6908265,
    	dimgrey: 6908265,
    	dodgerblue: 2003199,
    	firebrick: 11674146,
    	floralwhite: 16775920,
    	forestgreen: 2263842,
    	fuchsia: 16711935,
    	gainsboro: 14474460,
    	ghostwhite: 16316671,
    	gold: 16766720,
    	goldenrod: 14329120,
    	gray: 8421504,
    	green: 32768,
    	greenyellow: 11403055,
    	grey: 8421504,
    	honeydew: 15794160,
    	hotpink: 16738740,
    	indianred: 13458524,
    	indigo: 4915330,
    	ivory: 16777200,
    	khaki: 15787660,
    	lavender: 15132410,
    	lavenderblush: 16773365,
    	lawngreen: 8190976,
    	lemonchiffon: 16775885,
    	lightblue: 11393254,
    	lightcoral: 15761536,
    	lightcyan: 14745599,
    	lightgoldenrodyellow: 16448210,
    	lightgray: 13882323,
    	lightgreen: 9498256,
    	lightgrey: 13882323,
    	lightpink: 16758465,
    	lightsalmon: 16752762,
    	lightseagreen: 2142890,
    	lightskyblue: 8900346,
    	lightslategray: 7833753,
    	lightslategrey: 7833753,
    	lightsteelblue: 11584734,
    	lightyellow: 16777184,
    	lime: 65280,
    	limegreen: 3329330,
    	linen: 16445670,
    	magenta: 16711935,
    	maroon: 8388608,
    	mediumaquamarine: 6737322,
    	mediumblue: 205,
    	mediumorchid: 12211667,
    	mediumpurple: 9662683,
    	mediumseagreen: 3978097,
    	mediumslateblue: 8087790,
    	mediumspringgreen: 64154,
    	mediumturquoise: 4772300,
    	mediumvioletred: 13047173,
    	midnightblue: 1644912,
    	mintcream: 16121850,
    	mistyrose: 16770273,
    	moccasin: 16770229,
    	navajowhite: 16768685,
    	navy: 128,
    	oldlace: 16643558,
    	olive: 8421376,
    	olivedrab: 7048739,
    	orange: 16753920,
    	orangered: 16729344,
    	orchid: 14315734,
    	palegoldenrod: 15657130,
    	palegreen: 10025880,
    	paleturquoise: 11529966,
    	palevioletred: 14381203,
    	papayawhip: 16773077,
    	peachpuff: 16767673,
    	peru: 13468991,
    	pink: 16761035,
    	plum: 14524637,
    	powderblue: 11591910,
    	purple: 8388736,
    	rebeccapurple: 6697881,
    	red: 16711680,
    	rosybrown: 12357519,
    	royalblue: 4286945,
    	saddlebrown: 9127187,
    	salmon: 16416882,
    	sandybrown: 16032864,
    	seagreen: 3050327,
    	seashell: 16774638,
    	sienna: 10506797,
    	silver: 12632256,
    	skyblue: 8900331,
    	slateblue: 6970061,
    	slategray: 7372944,
    	slategrey: 7372944,
    	snow: 16775930,
    	springgreen: 65407,
    	steelblue: 4620980,
    	tan: 13808780,
    	teal: 32896,
    	thistle: 14204888,
    	tomato: 16737095,
    	turquoise: 4251856,
    	violet: 15631086,
    	wheat: 16113331,
    	white: 16777215,
    	whitesmoke: 16119285,
    	yellow: 16776960,
    	yellowgreen: 10145074
    };
    define_default(Color, color, {
    	copy(channels) {
    		return Object.assign(new this.constructor(), this, channels);
    	},
    	displayable() {
    		return this.rgb().displayable();
    	},
    	hex: color_formatHex,
    	formatHex: color_formatHex,
    	formatHex8: color_formatHex8,
    	formatHsl: color_formatHsl,
    	formatRgb: color_formatRgb,
    	toString: color_formatRgb
    });
    function color_formatHex() {
    	return this.rgb().formatHex();
    }
    function color_formatHex8() {
    	return this.rgb().formatHex8();
    }
    function color_formatHsl() {
    	return hslConvert(this).formatHsl();
    }
    function color_formatRgb() {
    	return this.rgb().formatRgb();
    }
    function color(format) {
    	var m, l;
    	format = (format + "").trim().toLowerCase();
    	return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
    }
    function rgbn(n) {
    	return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
    }
    function rgba(r, g, b, a) {
    	if (a <= 0) r = g = b = NaN;
    	return new Rgb(r, g, b, a);
    }
    function rgbConvert(o) {
    	if (!(o instanceof Color)) o = color(o);
    	if (!o) return new Rgb();
    	o = o.rgb();
    	return new Rgb(o.r, o.g, o.b, o.opacity);
    }
    function rgb(r, g, b, opacity) {
    	return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }
    function Rgb(r, g, b, opacity) {
    	this.r = +r;
    	this.g = +g;
    	this.b = +b;
    	this.opacity = +opacity;
    }
    define_default(Rgb, rgb, extend(Color, {
    	brighter(k) {
    		k = k == null ? brighter : Math.pow(brighter, k);
    		return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    	},
    	darker(k) {
    		k = k == null ? darker : Math.pow(darker, k);
    		return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    	},
    	rgb() {
    		return this;
    	},
    	clamp() {
    		return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
    	},
    	displayable() {
    		return -.5 <= this.r && this.r < 255.5 && -.5 <= this.g && this.g < 255.5 && -.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
    	},
    	hex: rgb_formatHex,
    	formatHex: rgb_formatHex,
    	formatHex8: rgb_formatHex8,
    	formatRgb: rgb_formatRgb,
    	toString: rgb_formatRgb
    }));
    function rgb_formatHex() {
    	return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
    }
    function rgb_formatHex8() {
    	return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
    }
    function rgb_formatRgb() {
    	const a = clampa(this.opacity);
    	return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
    }
    function clampa(opacity) {
    	return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
    }
    function clampi(value) {
    	return Math.max(0, Math.min(255, Math.round(value) || 0));
    }
    function hex(value) {
    	value = clampi(value);
    	return (value < 16 ? "0" : "") + value.toString(16);
    }
    function hsla(h, s, l, a) {
    	if (a <= 0) h = s = l = NaN;
    	else if (l <= 0 || l >= 1) h = s = NaN;
    	else if (s <= 0) h = NaN;
    	return new Hsl(h, s, l, a);
    }
    function hslConvert(o) {
    	if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    	if (!(o instanceof Color)) o = color(o);
    	if (!o) return new Hsl();
    	if (o instanceof Hsl) return o;
    	o = o.rgb();
    	var r = o.r / 255, g = o.g / 255, b = o.b / 255, min = Math.min(r, g, b), max = Math.max(r, g, b), h = NaN, s = max - min, l = (max + min) / 2;
    	if (s) {
    		if (r === max) h = (g - b) / s + (g < b) * 6;
    		else if (g === max) h = (b - r) / s + 2;
    		else h = (r - g) / s + 4;
    		s /= l < .5 ? max + min : 2 - max - min;
    		h *= 60;
    	} else s = l > 0 && l < 1 ? 0 : h;
    	return new Hsl(h, s, l, o.opacity);
    }
    function hsl(h, s, l, opacity) {
    	return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }
    function Hsl(h, s, l, opacity) {
    	this.h = +h;
    	this.s = +s;
    	this.l = +l;
    	this.opacity = +opacity;
    }
    define_default(Hsl, hsl, extend(Color, {
    	brighter(k) {
    		k = k == null ? brighter : Math.pow(brighter, k);
    		return new Hsl(this.h, this.s, this.l * k, this.opacity);
    	},
    	darker(k) {
    		k = k == null ? darker : Math.pow(darker, k);
    		return new Hsl(this.h, this.s, this.l * k, this.opacity);
    	},
    	rgb() {
    		var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < .5 ? l : 1 - l) * s, m1 = 2 * l - m2;
    		return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
    	},
    	clamp() {
    		return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
    	},
    	displayable() {
    		return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
    	},
    	formatHsl() {
    		const a = clampa(this.opacity);
    		return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
    	}
    }));
    function clamph(value) {
    	value = (value || 0) % 360;
    	return value < 0 ? value + 360 : value;
    }
    function clampt(value) {
    	return Math.max(0, Math.min(1, value || 0));
    }
    function hsl2rgb(h, m1, m2) {
    	return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
    }
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/constant.js
    var constant_default$1 = (x) => () => x;
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/color.js
    function linear(a, d) {
    	return function(t) {
    		return a + t * d;
    	};
    }
    function exponential(a, b, y) {
    	return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    		return Math.pow(a + t * b, y);
    	};
    }
    function gamma(y) {
    	return (y = +y) === 1 ? nogamma : function(a, b) {
    		return b - a ? exponential(a, b, y) : constant_default$1(isNaN(a) ? b : a);
    	};
    }
    function nogamma(a, b) {
    	var d = b - a;
    	return d ? linear(a, d) : constant_default$1(isNaN(a) ? b : a);
    }
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/rgb.js
    var rgb_default = (function rgbGamma(y) {
    	var color = gamma(y);
    	function rgb$1(start, end) {
    		var r = color((start = rgb(start)).r, (end = rgb(end)).r), g = color(start.g, end.g), b = color(start.b, end.b), opacity = nogamma(start.opacity, end.opacity);
    		return function(t) {
    			start.r = r(t);
    			start.g = g(t);
    			start.b = b(t);
    			start.opacity = opacity(t);
    			return start + "";
    		};
    	}
    	rgb$1.gamma = rgbGamma;
    	return rgb$1;
    })(1);
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/numberArray.js
    function numberArray_default(a, b) {
    	if (!b) b = [];
    	var n = a ? Math.min(b.length, a.length) : 0, c = b.slice(), i;
    	return function(t) {
    		for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
    		return c;
    	};
    }
    function isNumberArray(x) {
    	return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/array.js
    function genericArray(a, b) {
    	var nb = b ? b.length : 0, na = a ? Math.min(nb, a.length) : 0, x = new Array(na), c = new Array(nb), i = 0;
    	for (; i < na; ++i) x[i] = value_default(a[i], b[i]);
    	for (; i < nb; ++i) c[i] = b[i];
    	return function(t) {
    		for (i = 0; i < na; ++i) c[i] = x[i](t);
    		return c;
    	};
    }
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/date.js
    function date_default(a, b) {
    	var d = /* @__PURE__ */ new Date();
    	return a = +a, b = +b, function(t) {
    		return d.setTime(a * (1 - t) + b * t), d;
    	};
    }
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/number.js
    function number_default(a, b) {
    	return a = +a, b = +b, function(t) {
    		return a * (1 - t) + b * t;
    	};
    }
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/object.js
    function object_default(a, b) {
    	var i = {}, c = {}, k;
    	if (a === null || typeof a !== "object") a = {};
    	if (b === null || typeof b !== "object") b = {};
    	for (k in b) if (k in a) i[k] = value_default(a[k], b[k]);
    	else c[k] = b[k];
    	return function(t) {
    		for (k in i) c[k] = i[k](t);
    		return c;
    	};
    }
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/string.js
    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
    var reB = new RegExp(reA.source, "g");
    function zero(b) {
    	return function() {
    		return b;
    	};
    }
    function one(b) {
    	return function(t) {
    		return b(t) + "";
    	};
    }
    function string_default(a, b) {
    	var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
    	a = a + "", b = b + "";
    	while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    		if ((bs = bm.index) > bi) {
    			bs = b.slice(bi, bs);
    			if (s[i]) s[i] += bs;
    			else s[++i] = bs;
    		}
    		if ((am = am[0]) === (bm = bm[0])) {
    			if (s[i]) s[i] += bm;
    			else s[++i] = bm;
    		} else {
    			s[++i] = null;
    			q.push({
    				i,
    				x: number_default(am, bm)
    			});
    		}
    		bi = reB.lastIndex;
    	}
    	if (bi < b.length) {
    		bs = b.slice(bi);
    		if (s[i]) s[i] += bs;
    		else s[++i] = bs;
    	}
    	return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
    		for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
    		return s.join("");
    	});
    }
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/value.js
    function value_default(a, b) {
    	var t = typeof b, c;
    	return b == null || t === "boolean" ? constant_default$1(b) : (t === "number" ? number_default : t === "string" ? (c = color(b)) ? (b = c, rgb_default) : string_default : b instanceof color ? rgb_default : b instanceof Date ? date_default : isNumberArray(b) ? numberArray_default : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object_default : number_default)(a, b);
    }
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/transform/decompose.js
    var degrees = 180 / Math.PI;
    var identity$1 = {
    	translateX: 0,
    	translateY: 0,
    	rotate: 0,
    	skewX: 0,
    	scaleX: 1,
    	scaleY: 1
    };
    function decompose_default(a, b, c, d, e, f) {
    	var scaleX, scaleY, skewX;
    	if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    	if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    	if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    	if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    	return {
    		translateX: e,
    		translateY: f,
    		rotate: Math.atan2(b, a) * degrees,
    		skewX: Math.atan(skewX) * degrees,
    		scaleX,
    		scaleY
    	};
    }
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/transform/parse.js
    var svgNode;
    function parseCss(value) {
    	const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
    	return m.isIdentity ? identity$1 : decompose_default(m.a, m.b, m.c, m.d, m.e, m.f);
    }
    function parseSvg(value) {
    	if (value == null) return identity$1;
    	if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    	svgNode.setAttribute("transform", value);
    	if (!(value = svgNode.transform.baseVal.consolidate())) return identity$1;
    	value = value.matrix;
    	return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
    }
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/transform/index.js
    function interpolateTransform(parse, pxComma, pxParen, degParen) {
    	function pop(s) {
    		return s.length ? s.pop() + " " : "";
    	}
    	function translate(xa, ya, xb, yb, s, q) {
    		if (xa !== xb || ya !== yb) {
    			var i = s.push("translate(", null, pxComma, null, pxParen);
    			q.push({
    				i: i - 4,
    				x: number_default(xa, xb)
    			}, {
    				i: i - 2,
    				x: number_default(ya, yb)
    			});
    		} else if (xb || yb) s.push("translate(" + xb + pxComma + yb + pxParen);
    	}
    	function rotate(a, b, s, q) {
    		if (a !== b) {
    			if (a - b > 180) b += 360;
    			else if (b - a > 180) a += 360;
    			q.push({
    				i: s.push(pop(s) + "rotate(", null, degParen) - 2,
    				x: number_default(a, b)
    			});
    		} else if (b) s.push(pop(s) + "rotate(" + b + degParen);
    	}
    	function skewX(a, b, s, q) {
    		if (a !== b) q.push({
    			i: s.push(pop(s) + "skewX(", null, degParen) - 2,
    			x: number_default(a, b)
    		});
    		else if (b) s.push(pop(s) + "skewX(" + b + degParen);
    	}
    	function scale(xa, ya, xb, yb, s, q) {
    		if (xa !== xb || ya !== yb) {
    			var i = s.push(pop(s) + "scale(", null, ",", null, ")");
    			q.push({
    				i: i - 4,
    				x: number_default(xa, xb)
    			}, {
    				i: i - 2,
    				x: number_default(ya, yb)
    			});
    		} else if (xb !== 1 || yb !== 1) s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    	}
    	return function(a, b) {
    		var s = [], q = [];
    		a = parse(a), b = parse(b);
    		translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    		rotate(a.rotate, b.rotate, s, q);
    		skewX(a.skewX, b.skewX, s, q);
    		scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    		a = b = null;
    		return function(t) {
    			var i = -1, n = q.length, o;
    			while (++i < n) s[(o = q[i]).i] = o.x(t);
    			return s.join("");
    		};
    	};
    }
    var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
    var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");
    //#endregion
    //#region ../../node_modules/d3-interpolate/src/zoom.js
    var epsilon2 = 1e-12;
    function cosh(x) {
    	return ((x = Math.exp(x)) + 1 / x) / 2;
    }
    function sinh(x) {
    	return ((x = Math.exp(x)) - 1 / x) / 2;
    }
    function tanh(x) {
    	return ((x = Math.exp(2 * x)) - 1) / (x + 1);
    }
    var zoom_default$1 = (function zoomRho(rho, rho2, rho4) {
    	function zoom(p0, p1) {
    		var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
    		if (d2 < epsilon2) {
    			S = Math.log(w1 / w0) / rho;
    			i = function(t) {
    				return [
    					ux0 + t * dx,
    					uy0 + t * dy,
    					w0 * Math.exp(rho * t * S)
    				];
    			};
    		} else {
    			var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
    			S = (Math.log(Math.sqrt(b1 * b1 + 1) - b1) - r0) / rho;
    			i = function(t) {
    				var s = t * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
    				return [
    					ux0 + u * dx,
    					uy0 + u * dy,
    					w0 * coshr0 / cosh(rho * s + r0)
    				];
    			};
    		}
    		i.duration = S * 1e3 * rho / Math.SQRT2;
    		return i;
    	}
    	zoom.rho = function(_) {
    		var _1 = Math.max(.001, +_), _2 = _1 * _1;
    		return zoomRho(_1, _2, _2 * _2);
    	};
    	return zoom;
    })(Math.SQRT2, 2, 4);
    //#endregion
    //#region ../../node_modules/d3-timer/src/timer.js
    var frame = 0;
    var timeout = 0;
    var interval = 0;
    var pokeDelay = 1e3;
    var taskHead;
    var taskTail;
    var clockLast = 0;
    var clockNow = 0;
    var clockSkew = 0;
    var clock = typeof performance === "object" && performance.now ? performance : Date;
    var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
    	setTimeout(f, 17);
    };
    function now() {
    	return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
    }
    function clearNow() {
    	clockNow = 0;
    }
    function Timer() {
    	this._call = this._time = this._next = null;
    }
    Timer.prototype = timer.prototype = {
    	constructor: Timer,
    	restart: function(callback, delay, time) {
    		if (typeof callback !== "function") throw new TypeError("callback is not a function");
    		time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    		if (!this._next && taskTail !== this) {
    			if (taskTail) taskTail._next = this;
    			else taskHead = this;
    			taskTail = this;
    		}
    		this._call = callback;
    		this._time = time;
    		sleep();
    	},
    	stop: function() {
    		if (this._call) {
    			this._call = null;
    			this._time = Infinity;
    			sleep();
    		}
    	}
    };
    function timer(callback, delay, time) {
    	var t = new Timer();
    	t.restart(callback, delay, time);
    	return t;
    }
    function timerFlush() {
    	now();
    	++frame;
    	var t = taskHead, e;
    	while (t) {
    		if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
    		t = t._next;
    	}
    	--frame;
    }
    function wake() {
    	clockNow = (clockLast = clock.now()) + clockSkew;
    	frame = timeout = 0;
    	try {
    		timerFlush();
    	} finally {
    		frame = 0;
    		nap();
    		clockNow = 0;
    	}
    }
    function poke() {
    	var now = clock.now(), delay = now - clockLast;
    	if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
    }
    function nap() {
    	var t0, t1 = taskHead, t2, time = Infinity;
    	while (t1) if (t1._call) {
    		if (time > t1._time) time = t1._time;
    		t0 = t1, t1 = t1._next;
    	} else {
    		t2 = t1._next, t1._next = null;
    		t1 = t0 ? t0._next = t2 : taskHead = t2;
    	}
    	taskTail = t0;
    	sleep(time);
    }
    function sleep(time) {
    	if (frame) return;
    	if (timeout) timeout = clearTimeout(timeout);
    	if (time - clockNow > 24) {
    		if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
    		if (interval) interval = clearInterval(interval);
    	} else {
    		if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    		frame = 1, setFrame(wake);
    	}
    }
    //#endregion
    //#region ../../node_modules/d3-timer/src/timeout.js
    function timeout_default(callback, delay, time) {
    	var t = new Timer();
    	delay = delay == null ? 0 : +delay;
    	t.restart((elapsed) => {
    		t.stop();
    		callback(elapsed + delay);
    	}, delay, time);
    	return t;
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/schedule.js
    var emptyOn = dispatch("start", "end", "cancel", "interrupt");
    var emptyTween = [];
    function schedule_default(node, name, id, index, group, timing) {
    	var schedules = node.__transition;
    	if (!schedules) node.__transition = {};
    	else if (id in schedules) return;
    	create(node, id, {
    		name,
    		index,
    		group,
    		on: emptyOn,
    		tween: emptyTween,
    		time: timing.time,
    		delay: timing.delay,
    		duration: timing.duration,
    		ease: timing.ease,
    		timer: null,
    		state: 0
    	});
    }
    function init(node, id) {
    	var schedule = get(node, id);
    	if (schedule.state > 0) throw new Error("too late; already scheduled");
    	return schedule;
    }
    function set(node, id) {
    	var schedule = get(node, id);
    	if (schedule.state > 3) throw new Error("too late; already running");
    	return schedule;
    }
    function get(node, id) {
    	var schedule = node.__transition;
    	if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
    	return schedule;
    }
    function create(node, id, self) {
    	var schedules = node.__transition, tween;
    	schedules[id] = self;
    	self.timer = timer(schedule, 0, self.time);
    	function schedule(elapsed) {
    		self.state = 1;
    		self.timer.restart(start, self.delay, self.time);
    		if (self.delay <= elapsed) start(elapsed - self.delay);
    	}
    	function start(elapsed) {
    		var i, j, n, o;
    		if (self.state !== 1) return stop();
    		for (i in schedules) {
    			o = schedules[i];
    			if (o.name !== self.name) continue;
    			if (o.state === 3) return timeout_default(start);
    			if (o.state === 4) {
    				o.state = 6;
    				o.timer.stop();
    				o.on.call("interrupt", node, node.__data__, o.index, o.group);
    				delete schedules[i];
    			} else if (+i < id) {
    				o.state = 6;
    				o.timer.stop();
    				o.on.call("cancel", node, node.__data__, o.index, o.group);
    				delete schedules[i];
    			}
    		}
    		timeout_default(function() {
    			if (self.state === 3) {
    				self.state = 4;
    				self.timer.restart(tick, self.delay, self.time);
    				tick(elapsed);
    			}
    		});
    		self.state = 2;
    		self.on.call("start", node, node.__data__, self.index, self.group);
    		if (self.state !== 2) return;
    		self.state = 3;
    		tween = new Array(n = self.tween.length);
    		for (i = 0, j = -1; i < n; ++i) if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) tween[++j] = o;
    		tween.length = j + 1;
    	}
    	function tick(elapsed) {
    		var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = 5, 1), i = -1, n = tween.length;
    		while (++i < n) tween[i].call(node, t);
    		if (self.state === 5) {
    			self.on.call("end", node, node.__data__, self.index, self.group);
    			stop();
    		}
    	}
    	function stop() {
    		self.state = 6;
    		self.timer.stop();
    		delete schedules[id];
    		for (var i in schedules) return;
    		delete node.__transition;
    	}
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/interrupt.js
    function interrupt_default$1(node, name) {
    	var schedules = node.__transition, schedule, active, empty = true, i;
    	if (!schedules) return;
    	name = name == null ? null : name + "";
    	for (i in schedules) {
    		if ((schedule = schedules[i]).name !== name) {
    			empty = false;
    			continue;
    		}
    		active = schedule.state > 2 && schedule.state < 5;
    		schedule.state = 6;
    		schedule.timer.stop();
    		schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
    		delete schedules[i];
    	}
    	if (empty) delete node.__transition;
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/selection/interrupt.js
    function interrupt_default(name) {
    	return this.each(function() {
    		interrupt_default$1(this, name);
    	});
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/tween.js
    function tweenRemove(id, name) {
    	var tween0, tween1;
    	return function() {
    		var schedule = set(this, id), tween = schedule.tween;
    		if (tween !== tween0) {
    			tween1 = tween0 = tween;
    			for (var i = 0, n = tween1.length; i < n; ++i) if (tween1[i].name === name) {
    				tween1 = tween1.slice();
    				tween1.splice(i, 1);
    				break;
    			}
    		}
    		schedule.tween = tween1;
    	};
    }
    function tweenFunction(id, name, value) {
    	var tween0, tween1;
    	if (typeof value !== "function") throw new Error();
    	return function() {
    		var schedule = set(this, id), tween = schedule.tween;
    		if (tween !== tween0) {
    			tween1 = (tween0 = tween).slice();
    			for (var t = {
    				name,
    				value
    			}, i = 0, n = tween1.length; i < n; ++i) if (tween1[i].name === name) {
    				tween1[i] = t;
    				break;
    			}
    			if (i === n) tween1.push(t);
    		}
    		schedule.tween = tween1;
    	};
    }
    function tween_default(name, value) {
    	var id = this._id;
    	name += "";
    	if (arguments.length < 2) {
    		var tween = get(this.node(), id).tween;
    		for (var i = 0, n = tween.length, t; i < n; ++i) if ((t = tween[i]).name === name) return t.value;
    		return null;
    	}
    	return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
    }
    function tweenValue(transition, name, value) {
    	var id = transition._id;
    	transition.each(function() {
    		var schedule = set(this, id);
    		(schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
    	});
    	return function(node) {
    		return get(node, id).value[name];
    	};
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/interpolate.js
    function interpolate_default(a, b) {
    	var c;
    	return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c = color(b)) ? (b = c, rgb_default) : string_default)(a, b);
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/attr.js
    function attrRemove(name) {
    	return function() {
    		this.removeAttribute(name);
    	};
    }
    function attrRemoveNS(fullname) {
    	return function() {
    		this.removeAttributeNS(fullname.space, fullname.local);
    	};
    }
    function attrConstant(name, interpolate, value1) {
    	var string00, string1 = value1 + "", interpolate0;
    	return function() {
    		var string0 = this.getAttribute(name);
    		return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    	};
    }
    function attrConstantNS(fullname, interpolate, value1) {
    	var string00, string1 = value1 + "", interpolate0;
    	return function() {
    		var string0 = this.getAttributeNS(fullname.space, fullname.local);
    		return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    	};
    }
    function attrFunction(name, interpolate, value) {
    	var string00, string10, interpolate0;
    	return function() {
    		var string0, value1 = value(this), string1;
    		if (value1 == null) return void this.removeAttribute(name);
    		string0 = this.getAttribute(name);
    		string1 = value1 + "";
    		return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    	};
    }
    function attrFunctionNS(fullname, interpolate, value) {
    	var string00, string10, interpolate0;
    	return function() {
    		var string0, value1 = value(this), string1;
    		if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    		string0 = this.getAttributeNS(fullname.space, fullname.local);
    		string1 = value1 + "";
    		return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    	};
    }
    function attr_default(name, value) {
    	var fullname = namespace_default(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
    	return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname) : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/attrTween.js
    function attrInterpolate(name, i) {
    	return function(t) {
    		this.setAttribute(name, i.call(this, t));
    	};
    }
    function attrInterpolateNS(fullname, i) {
    	return function(t) {
    		this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
    	};
    }
    function attrTweenNS(fullname, value) {
    	var t0, i0;
    	function tween() {
    		var i = value.apply(this, arguments);
    		if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    		return t0;
    	}
    	tween._value = value;
    	return tween;
    }
    function attrTween(name, value) {
    	var t0, i0;
    	function tween() {
    		var i = value.apply(this, arguments);
    		if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
    		return t0;
    	}
    	tween._value = value;
    	return tween;
    }
    function attrTween_default(name, value) {
    	var key = "attr." + name;
    	if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    	if (value == null) return this.tween(key, null);
    	if (typeof value !== "function") throw new Error();
    	var fullname = namespace_default(name);
    	return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/delay.js
    function delayFunction(id, value) {
    	return function() {
    		init(this, id).delay = +value.apply(this, arguments);
    	};
    }
    function delayConstant(id, value) {
    	return value = +value, function() {
    		init(this, id).delay = value;
    	};
    }
    function delay_default(value) {
    	var id = this._id;
    	return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id, value)) : get(this.node(), id).delay;
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/duration.js
    function durationFunction(id, value) {
    	return function() {
    		set(this, id).duration = +value.apply(this, arguments);
    	};
    }
    function durationConstant(id, value) {
    	return value = +value, function() {
    		set(this, id).duration = value;
    	};
    }
    function duration_default(value) {
    	var id = this._id;
    	return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id, value)) : get(this.node(), id).duration;
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/ease.js
    function easeConstant(id, value) {
    	if (typeof value !== "function") throw new Error();
    	return function() {
    		set(this, id).ease = value;
    	};
    }
    function ease_default(value) {
    	var id = this._id;
    	return arguments.length ? this.each(easeConstant(id, value)) : get(this.node(), id).ease;
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/easeVarying.js
    function easeVarying(id, value) {
    	return function() {
    		var v = value.apply(this, arguments);
    		if (typeof v !== "function") throw new Error();
    		set(this, id).ease = v;
    	};
    }
    function easeVarying_default(value) {
    	if (typeof value !== "function") throw new Error();
    	return this.each(easeVarying(this._id, value));
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/filter.js
    function filter_default(match) {
    	if (typeof match !== "function") match = matcher_default(match);
    	for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) if ((node = group[i]) && match.call(node, node.__data__, i, group)) subgroup.push(node);
    	return new Transition(subgroups, this._parents, this._name, this._id);
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/merge.js
    function merge_default(transition) {
    	if (transition._id !== this._id) throw new Error();
    	for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) if (node = group0[i] || group1[i]) merge[i] = node;
    	for (; j < m0; ++j) merges[j] = groups0[j];
    	return new Transition(merges, this._parents, this._name, this._id);
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/on.js
    function start(name) {
    	return (name + "").trim().split(/^|\s+/).every(function(t) {
    		var i = t.indexOf(".");
    		if (i >= 0) t = t.slice(0, i);
    		return !t || t === "start";
    	});
    }
    function onFunction(id, name, listener) {
    	var on0, on1, sit = start(name) ? init : set;
    	return function() {
    		var schedule = sit(this, id), on = schedule.on;
    		if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
    		schedule.on = on1;
    	};
    }
    function on_default(name, listener) {
    	var id = this._id;
    	return arguments.length < 2 ? get(this.node(), id).on.on(name) : this.each(onFunction(id, name, listener));
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/remove.js
    function removeFunction(id) {
    	return function() {
    		var parent = this.parentNode;
    		for (var i in this.__transition) if (+i !== id) return;
    		if (parent) parent.removeChild(this);
    	};
    }
    function remove_default() {
    	return this.on("end.remove", removeFunction(this._id));
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/select.js
    function select_default(select) {
    	var name = this._name, id = this._id;
    	if (typeof select !== "function") select = selector_default(select);
    	for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
    		if ("__data__" in node) subnode.__data__ = node.__data__;
    		subgroup[i] = subnode;
    		schedule_default(subgroup[i], name, id, i, subgroup, get(node, id));
    	}
    	return new Transition(subgroups, this._parents, name, id);
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/selectAll.js
    function selectAll_default(select) {
    	var name = this._name, id = this._id;
    	if (typeof select !== "function") select = selectorAll_default(select);
    	for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) if (node = group[i]) {
    		for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) if (child = children[k]) schedule_default(child, name, id, k, children, inherit);
    		subgroups.push(children);
    		parents.push(node);
    	}
    	return new Transition(subgroups, parents, name, id);
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/selection.js
    var Selection = selection.prototype.constructor;
    function selection_default() {
    	return new Selection(this._groups, this._parents);
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/style.js
    function styleNull(name, interpolate) {
    	var string00, string10, interpolate0;
    	return function() {
    		var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
    		return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
    	};
    }
    function styleRemove(name) {
    	return function() {
    		this.style.removeProperty(name);
    	};
    }
    function styleConstant(name, interpolate, value1) {
    	var string00, string1 = value1 + "", interpolate0;
    	return function() {
    		var string0 = styleValue(this, name);
    		return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    	};
    }
    function styleFunction(name, interpolate, value) {
    	var string00, string10, interpolate0;
    	return function() {
    		var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
    		if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    		return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    	};
    }
    function styleMaybeRemove(id, name) {
    	var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
    	return function() {
    		var schedule = set(this, id), on = schedule.on, listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : void 0;
    		if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
    		schedule.on = on1;
    	};
    }
    function style_default(name, value, priority) {
    	var i = (name += "") === "transform" ? interpolateTransformCss : interpolate_default;
    	return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove(name)) : typeof value === "function" ? this.styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant(name, i, value), priority).on("end.style." + name, null);
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/styleTween.js
    function styleInterpolate(name, i, priority) {
    	return function(t) {
    		this.style.setProperty(name, i.call(this, t), priority);
    	};
    }
    function styleTween(name, value, priority) {
    	var t, i0;
    	function tween() {
    		var i = value.apply(this, arguments);
    		if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
    		return t;
    	}
    	tween._value = value;
    	return tween;
    }
    function styleTween_default(name, value, priority) {
    	var key = "style." + (name += "");
    	if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    	if (value == null) return this.tween(key, null);
    	if (typeof value !== "function") throw new Error();
    	return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/text.js
    function textConstant(value) {
    	return function() {
    		this.textContent = value;
    	};
    }
    function textFunction(value) {
    	return function() {
    		var value1 = value(this);
    		this.textContent = value1 == null ? "" : value1;
    	};
    }
    function text_default(value) {
    	return this.tween("text", typeof value === "function" ? textFunction(tweenValue(this, "text", value)) : textConstant(value == null ? "" : value + ""));
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/textTween.js
    function textInterpolate(i) {
    	return function(t) {
    		this.textContent = i.call(this, t);
    	};
    }
    function textTween(value) {
    	var t0, i0;
    	function tween() {
    		var i = value.apply(this, arguments);
    		if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
    		return t0;
    	}
    	tween._value = value;
    	return tween;
    }
    function textTween_default(value) {
    	var key = "text";
    	if (arguments.length < 1) return (key = this.tween(key)) && key._value;
    	if (value == null) return this.tween(key, null);
    	if (typeof value !== "function") throw new Error();
    	return this.tween(key, textTween(value));
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/transition.js
    function transition_default$1() {
    	var name = this._name, id0 = this._id, id1 = newId();
    	for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) if (node = group[i]) {
    		var inherit = get(node, id0);
    		schedule_default(node, name, id1, i, group, {
    			time: inherit.time + inherit.delay + inherit.duration,
    			delay: 0,
    			duration: inherit.duration,
    			ease: inherit.ease
    		});
    	}
    	return new Transition(groups, this._parents, name, id1);
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/end.js
    function end_default() {
    	var on0, on1, that = this, id = that._id, size = that.size();
    	return new Promise(function(resolve, reject) {
    		var cancel = { value: reject }, end = { value: function() {
    			if (--size === 0) resolve();
    		} };
    		that.each(function() {
    			var schedule = set(this, id), on = schedule.on;
    			if (on !== on0) {
    				on1 = (on0 = on).copy();
    				on1._.cancel.push(cancel);
    				on1._.interrupt.push(cancel);
    				on1._.end.push(end);
    			}
    			schedule.on = on1;
    		});
    		if (size === 0) resolve();
    	});
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/transition/index.js
    var id = 0;
    function Transition(groups, parents, name, id) {
    	this._groups = groups;
    	this._parents = parents;
    	this._name = name;
    	this._id = id;
    }
    function transition(name) {
    	return selection().transition(name);
    }
    function newId() {
    	return ++id;
    }
    var selection_prototype = selection.prototype;
    Transition.prototype = transition.prototype = {
    	constructor: Transition,
    	select: select_default,
    	selectAll: selectAll_default,
    	selectChild: selection_prototype.selectChild,
    	selectChildren: selection_prototype.selectChildren,
    	filter: filter_default,
    	merge: merge_default,
    	selection: selection_default,
    	transition: transition_default$1,
    	call: selection_prototype.call,
    	nodes: selection_prototype.nodes,
    	node: selection_prototype.node,
    	size: selection_prototype.size,
    	empty: selection_prototype.empty,
    	each: selection_prototype.each,
    	on: on_default,
    	attr: attr_default,
    	attrTween: attrTween_default,
    	style: style_default,
    	styleTween: styleTween_default,
    	text: text_default,
    	textTween: textTween_default,
    	remove: remove_default,
    	tween: tween_default,
    	delay: delay_default,
    	duration: duration_default,
    	ease: ease_default,
    	easeVarying: easeVarying_default,
    	end: end_default,
    	[Symbol.iterator]: selection_prototype[Symbol.iterator]
    };
    //#endregion
    //#region ../../node_modules/d3-ease/src/cubic.js
    function cubicInOut(t) {
    	return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/selection/transition.js
    var defaultTiming = {
    	time: null,
    	delay: 0,
    	duration: 250,
    	ease: cubicInOut
    };
    function inherit(node, id) {
    	var timing;
    	while (!(timing = node.__transition) || !(timing = timing[id])) if (!(node = node.parentNode)) throw new Error(`transition ${id} not found`);
    	return timing;
    }
    function transition_default(name) {
    	var id, timing;
    	if (name instanceof Transition) id = name._id, name = name._name;
    	else id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    	for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) if (node = group[i]) schedule_default(node, name, id, i, group, timing || inherit(node, id));
    	return new Transition(groups, this._parents, name, id);
    }
    //#endregion
    //#region ../../node_modules/d3-transition/src/selection/index.js
    selection.prototype.interrupt = interrupt_default;
    selection.prototype.transition = transition_default;
    //#endregion
    //#region ../../node_modules/d3-zoom/src/constant.js
    var constant_default = (x) => () => x;
    //#endregion
    //#region ../../node_modules/d3-zoom/src/event.js
    function ZoomEvent(type, { sourceEvent, target, transform, dispatch }) {
    	Object.defineProperties(this, {
    		type: {
    			value: type,
    			enumerable: true,
    			configurable: true
    		},
    		sourceEvent: {
    			value: sourceEvent,
    			enumerable: true,
    			configurable: true
    		},
    		target: {
    			value: target,
    			enumerable: true,
    			configurable: true
    		},
    		transform: {
    			value: transform,
    			enumerable: true,
    			configurable: true
    		},
    		_: { value: dispatch }
    	});
    }
    //#endregion
    //#region ../../node_modules/d3-zoom/src/transform.js
    function Transform(k, x, y) {
    	this.k = k;
    	this.x = x;
    	this.y = y;
    }
    Transform.prototype = {
    	constructor: Transform,
    	scale: function(k) {
    		return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
    	},
    	translate: function(x, y) {
    		return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
    	},
    	apply: function(point) {
    		return [point[0] * this.k + this.x, point[1] * this.k + this.y];
    	},
    	applyX: function(x) {
    		return x * this.k + this.x;
    	},
    	applyY: function(y) {
    		return y * this.k + this.y;
    	},
    	invert: function(location) {
    		return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
    	},
    	invertX: function(x) {
    		return (x - this.x) / this.k;
    	},
    	invertY: function(y) {
    		return (y - this.y) / this.k;
    	},
    	rescaleX: function(x) {
    		return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
    	},
    	rescaleY: function(y) {
    		return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
    	},
    	toString: function() {
    		return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
    	}
    };
    var identity = new Transform(1, 0, 0);
    transform.prototype = Transform.prototype;
    function transform(node) {
    	while (!node.__zoom) if (!(node = node.parentNode)) return identity;
    	return node.__zoom;
    }
    //#endregion
    //#region ../../node_modules/d3-zoom/src/noevent.js
    function nopropagation(event) {
    	event.stopImmediatePropagation();
    }
    function noevent_default(event) {
    	event.preventDefault();
    	event.stopImmediatePropagation();
    }
    //#endregion
    //#region ../../node_modules/d3-zoom/src/zoom.js
    function defaultFilter(event) {
    	return (!event.ctrlKey || event.type === "wheel") && !event.button;
    }
    function defaultExtent() {
    	var e = this;
    	if (e instanceof SVGElement) {
    		e = e.ownerSVGElement || e;
    		if (e.hasAttribute("viewBox")) {
    			e = e.viewBox.baseVal;
    			return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
    		}
    		return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
    	}
    	return [[0, 0], [e.clientWidth, e.clientHeight]];
    }
    function defaultTransform() {
    	return this.__zoom || identity;
    }
    function defaultWheelDelta(event) {
    	return -event.deltaY * (event.deltaMode === 1 ? .05 : event.deltaMode ? 1 : .002) * (event.ctrlKey ? 10 : 1);
    }
    function defaultTouchable() {
    	return navigator.maxTouchPoints || "ontouchstart" in this;
    }
    function defaultConstrain(transform, extent, translateExtent) {
    	var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0], dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0], dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1], dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
    	return transform.translate(dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1), dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1));
    }
    function zoom_default() {
    	var filter = defaultFilter, extent = defaultExtent, constrain = defaultConstrain, wheelDelta = defaultWheelDelta, touchable = defaultTouchable, scaleExtent = [0, Infinity], translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]], duration = 250, interpolate = zoom_default$1, listeners = dispatch("start", "zoom", "end"), touchstarting, touchfirst, touchending, touchDelay = 500, wheelDelay = 150, clickDistance2 = 0, tapDistance = 10;
    	function zoom(selection) {
    		selection.property("__zoom", defaultTransform).on("wheel.zoom", wheeled, { passive: false }).on("mousedown.zoom", mousedowned).on("dblclick.zoom", dblclicked).filter(touchable).on("touchstart.zoom", touchstarted).on("touchmove.zoom", touchmoved).on("touchend.zoom touchcancel.zoom", touchended).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    	}
    	zoom.transform = function(collection, transform, point, event) {
    		var selection = collection.selection ? collection.selection() : collection;
    		selection.property("__zoom", defaultTransform);
    		if (collection !== selection) schedule(collection, transform, point, event);
    		else selection.interrupt().each(function() {
    			gesture(this, arguments).event(event).start().zoom(null, typeof transform === "function" ? transform.apply(this, arguments) : transform).end();
    		});
    	};
    	zoom.scaleBy = function(selection, k, p, event) {
    		zoom.scaleTo(selection, function() {
    			return this.__zoom.k * (typeof k === "function" ? k.apply(this, arguments) : k);
    		}, p, event);
    	};
    	zoom.scaleTo = function(selection, k, p, event) {
    		zoom.transform(selection, function() {
    			var e = extent.apply(this, arguments), t0 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p, p1 = t0.invert(p0), k1 = typeof k === "function" ? k.apply(this, arguments) : k;
    			return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
    		}, p, event);
    	};
    	zoom.translateBy = function(selection, x, y, event) {
    		zoom.transform(selection, function() {
    			return constrain(this.__zoom.translate(typeof x === "function" ? x.apply(this, arguments) : x, typeof y === "function" ? y.apply(this, arguments) : y), extent.apply(this, arguments), translateExtent);
    		}, null, event);
    	};
    	zoom.translateTo = function(selection, x, y, p, event) {
    		zoom.transform(selection, function() {
    			var e = extent.apply(this, arguments), t = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
    			return constrain(identity.translate(p0[0], p0[1]).scale(t.k).translate(typeof x === "function" ? -x.apply(this, arguments) : -x, typeof y === "function" ? -y.apply(this, arguments) : -y), e, translateExtent);
    		}, p, event);
    	};
    	function scale(transform, k) {
    		k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
    		return k === transform.k ? transform : new Transform(k, transform.x, transform.y);
    	}
    	function translate(transform, p0, p1) {
    		var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
    		return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
    	}
    	function centroid(extent) {
    		return [(+extent[0][0] + +extent[1][0]) / 2, (+extent[0][1] + +extent[1][1]) / 2];
    	}
    	function schedule(transition, transform, point, event) {
    		transition.on("start.zoom", function() {
    			gesture(this, arguments).event(event).start();
    		}).on("interrupt.zoom end.zoom", function() {
    			gesture(this, arguments).event(event).end();
    		}).tween("zoom", function() {
    			var that = this, args = arguments, g = gesture(that, args).event(event), e = extent.apply(that, args), p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point, w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]), a = that.__zoom, b = typeof transform === "function" ? transform.apply(that, args) : transform, i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
    			return function(t) {
    				if (t === 1) t = b;
    				else {
    					var l = i(t), k = w / l[2];
    					t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k);
    				}
    				g.zoom(null, t);
    			};
    		});
    	}
    	function gesture(that, args, clean) {
    		return !clean && that.__zooming || new Gesture(that, args);
    	}
    	function Gesture(that, args) {
    		this.that = that;
    		this.args = args;
    		this.active = 0;
    		this.sourceEvent = null;
    		this.extent = extent.apply(that, args);
    		this.taps = 0;
    	}
    	Gesture.prototype = {
    		event: function(event) {
    			if (event) this.sourceEvent = event;
    			return this;
    		},
    		start: function() {
    			if (++this.active === 1) {
    				this.that.__zooming = this;
    				this.emit("start");
    			}
    			return this;
    		},
    		zoom: function(key, transform) {
    			if (this.mouse && key !== "mouse") this.mouse[1] = transform.invert(this.mouse[0]);
    			if (this.touch0 && key !== "touch") this.touch0[1] = transform.invert(this.touch0[0]);
    			if (this.touch1 && key !== "touch") this.touch1[1] = transform.invert(this.touch1[0]);
    			this.that.__zoom = transform;
    			this.emit("zoom");
    			return this;
    		},
    		end: function() {
    			if (--this.active === 0) {
    				delete this.that.__zooming;
    				this.emit("end");
    			}
    			return this;
    		},
    		emit: function(type) {
    			var d = select_default$1(this.that).datum();
    			listeners.call(type, this.that, new ZoomEvent(type, {
    				sourceEvent: this.sourceEvent,
    				target: zoom,
    				type,
    				transform: this.that.__zoom,
    				dispatch: listeners
    			}), d);
    		}
    	};
    	function wheeled(event, ...args) {
    		if (!filter.apply(this, arguments)) return;
    		var g = gesture(this, args).event(event), t = this.__zoom, k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))), p = pointer_default(event);
    		if (g.wheel) {
    			if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) g.mouse[1] = t.invert(g.mouse[0] = p);
    			clearTimeout(g.wheel);
    		} else if (t.k === k) return;
    		else {
    			g.mouse = [p, t.invert(p)];
    			interrupt_default$1(this);
    			g.start();
    		}
    		noevent_default(event);
    		g.wheel = setTimeout(wheelidled, wheelDelay);
    		g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));
    		function wheelidled() {
    			g.wheel = null;
    			g.end();
    		}
    	}
    	function mousedowned(event, ...args) {
    		if (touchending || !filter.apply(this, arguments)) return;
    		var currentTarget = event.currentTarget, g = gesture(this, args, true).event(event), v = select_default$1(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true), p = pointer_default(event, currentTarget), x0 = event.clientX, y0 = event.clientY;
    		nodrag_default(event.view);
    		nopropagation(event);
    		g.mouse = [p, this.__zoom.invert(p)];
    		interrupt_default$1(this);
    		g.start();
    		function mousemoved(event) {
    			noevent_default(event);
    			if (!g.moved) {
    				var dx = event.clientX - x0, dy = event.clientY - y0;
    				g.moved = dx * dx + dy * dy > clickDistance2;
    			}
    			g.event(event).zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer_default(event, currentTarget), g.mouse[1]), g.extent, translateExtent));
    		}
    		function mouseupped(event) {
    			v.on("mousemove.zoom mouseup.zoom", null);
    			yesdrag(event.view, g.moved);
    			noevent_default(event);
    			g.event(event).end();
    		}
    	}
    	function dblclicked(event, ...args) {
    		if (!filter.apply(this, arguments)) return;
    		var t0 = this.__zoom, p0 = pointer_default(event.changedTouches ? event.changedTouches[0] : event, this), p1 = t0.invert(p0), k1 = t0.k * (event.shiftKey ? .5 : 2), t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);
    		noevent_default(event);
    		if (duration > 0) select_default$1(this).transition().duration(duration).call(schedule, t1, p0, event);
    		else select_default$1(this).call(zoom.transform, t1, p0, event);
    	}
    	function touchstarted(event, ...args) {
    		if (!filter.apply(this, arguments)) return;
    		var touches = event.touches, n = touches.length, g = gesture(this, args, event.changedTouches.length === n).event(event), started, i, t, p;
    		nopropagation(event);
    		for (i = 0; i < n; ++i) {
    			t = touches[i], p = pointer_default(t, this);
    			p = [
    				p,
    				this.__zoom.invert(p),
    				t.identifier
    			];
    			if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
    			else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
    		}
    		if (touchstarting) touchstarting = clearTimeout(touchstarting);
    		if (started) {
    			if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() {
    				touchstarting = null;
    			}, touchDelay);
    			interrupt_default$1(this);
    			g.start();
    		}
    	}
    	function touchmoved(event, ...args) {
    		if (!this.__zooming) return;
    		var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t, p, l;
    		noevent_default(event);
    		for (i = 0; i < n; ++i) {
    			t = touches[i], p = pointer_default(t, this);
    			if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
    			else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
    		}
    		t = g.that.__zoom;
    		if (g.touch1) {
    			var p0 = g.touch0[0], l0 = g.touch0[1], p1 = g.touch1[0], l1 = g.touch1[1], dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp, dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
    			t = scale(t, Math.sqrt(dp / dl));
    			p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
    			l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
    		} else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
    		else return;
    		g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
    	}
    	function touchended(event, ...args) {
    		if (!this.__zooming) return;
    		var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t;
    		nopropagation(event);
    		if (touchending) clearTimeout(touchending);
    		touchending = setTimeout(function() {
    			touchending = null;
    		}, touchDelay);
    		for (i = 0; i < n; ++i) {
    			t = touches[i];
    			if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
    			else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
    		}
    		if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
    		if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
    		else {
    			g.end();
    			if (g.taps === 2) {
    				t = pointer_default(t, this);
    				if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
    					var p = select_default$1(this).on("dblclick.zoom");
    					if (p) p.apply(this, arguments);
    				}
    			}
    		}
    	}
    	zoom.wheelDelta = function(_) {
    		return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant_default(+_), zoom) : wheelDelta;
    	};
    	zoom.filter = function(_) {
    		return arguments.length ? (filter = typeof _ === "function" ? _ : constant_default(!!_), zoom) : filter;
    	};
    	zoom.touchable = function(_) {
    		return arguments.length ? (touchable = typeof _ === "function" ? _ : constant_default(!!_), zoom) : touchable;
    	};
    	zoom.extent = function(_) {
    		return arguments.length ? (extent = typeof _ === "function" ? _ : constant_default([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
    	};
    	zoom.scaleExtent = function(_) {
    		return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
    	};
    	zoom.translateExtent = function(_) {
    		return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
    	};
    	zoom.constrain = function(_) {
    		return arguments.length ? (constrain = _, zoom) : constrain;
    	};
    	zoom.duration = function(_) {
    		return arguments.length ? (duration = +_, zoom) : duration;
    	};
    	zoom.interpolate = function(_) {
    		return arguments.length ? (interpolate = _, zoom) : interpolate;
    	};
    	zoom.on = function() {
    		var value = listeners.on.apply(listeners, arguments);
    		return value === listeners ? zoom : value;
    	};
    	zoom.clickDistance = function(_) {
    		return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
    	};
    	zoom.tapDistance = function(_) {
    		return arguments.length ? (tapDistance = +_, zoom) : tapDistance;
    	};
    	return zoom;
    }
    //#endregion
    //#region ../../node_modules/@xyflow/system/dist/esm/index.js
    const errorMessages = {
    	error001: (lib = "react") => `Seems like you have not used ${lib === "svelte" ? "SvelteFlowProvider" : "ReactFlowProvider"} as an ancestor. Help: https://${lib}flow.dev/error#001`,
    	error002: () => "It looks like you've created a new nodeTypes or edgeTypes object. If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them.",
    	error003: (nodeType) => `Node type "${nodeType}" not found. Using fallback type "default".`,
    	error004: () => "The parent container needs a width and a height to render the graph.",
    	error005: () => "Only child nodes can use a parent extent.",
    	error006: () => "Can't create edge. An edge needs a source and a target.",
    	error007: (id) => `The old edge with id=${id} does not exist.`,
    	error009: (type) => `Marker type "${type}" doesn't exist.`,
    	error008: (handleType, { id, sourceHandle, targetHandle }) => `Couldn't create edge for ${handleType} handle id: "${handleType === "source" ? sourceHandle : targetHandle}", edge id: ${id}.`,
    	error010: () => "Handle: No node id found. Make sure to only use a Handle inside a custom Node.",
    	error011: (edgeType) => `Edge type "${edgeType}" not found. Using fallback type "default".`,
    	error012: (id) => `Node with id "${id}" does not exist, it may have been removed. This can happen when a node is deleted before the "onNodeClick" handler is called.`,
    	error013: (lib = "react") => `It seems that you haven't loaded the styles. Please import '@xyflow/${lib}/dist/style.css' or base.css to make sure everything is working properly.`,
    	error014: () => "useNodeConnections: No node ID found. Call useNodeConnections inside a custom Node or provide a node ID.",
    	error015: () => "It seems that you are trying to drag a node that is not initialized. Please use onNodesChange as explained in the docs.",
    	error016: (id) => `Edge with id "${id}" does not exist, it may have been removed. This can happen when an edge is deleted before the "onEdgeClick" handler is called.`
    };
    const infiniteExtent = [[Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY], [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]];
    const elementSelectionKeys = [
    	"Enter",
    	" ",
    	"Escape"
    ];
    const defaultAriaLabelConfig = {
    	"node.a11yDescription.default": "Press enter or space to select a node. Press delete to remove it and escape to cancel.",
    	"node.a11yDescription.keyboardDisabled": "Press enter or space to select a node. You can then use the arrow keys to move the node around. Press delete to remove it and escape to cancel.",
    	"node.a11yDescription.ariaLiveMessage": ({ direction, x, y }) => `Moved selected node ${direction}. New position, x: ${x}, y: ${y}`,
    	"edge.a11yDescription.default": "Press enter or space to select an edge. You can then press delete to remove it or escape to cancel.",
    	"controls.ariaLabel": "Control Panel",
    	"controls.zoomIn.ariaLabel": "Zoom In",
    	"controls.zoomOut.ariaLabel": "Zoom Out",
    	"controls.fitView.ariaLabel": "Fit View",
    	"controls.interactive.ariaLabel": "Toggle Interactivity",
    	"minimap.ariaLabel": "Mini Map",
    	"handle.ariaLabel": "Handle"
    };
    /**
    * The `ConnectionMode` is used to set the mode of connection between nodes.
    * The `Strict` mode is the default one and only allows source to target edges.
    * `Loose` mode allows source to source and target to target edges as well.
    *
    * @public
    */
    var ConnectionMode;
    (function(ConnectionMode) {
    	ConnectionMode["Strict"] = "strict";
    	ConnectionMode["Loose"] = "loose";
    })(ConnectionMode || (ConnectionMode = {}));
    /**
    * This enum is used to set the different modes of panning the viewport when the
    * user scrolls. The `Free` mode allows the user to pan in any direction by scrolling
    * with a device like a trackpad. The `Vertical` and `Horizontal` modes restrict
    * scroll panning to only the vertical or horizontal axis, respectively.
    *
    * @public
    */
    var PanOnScrollMode;
    (function(PanOnScrollMode) {
    	PanOnScrollMode["Free"] = "free";
    	PanOnScrollMode["Vertical"] = "vertical";
    	PanOnScrollMode["Horizontal"] = "horizontal";
    })(PanOnScrollMode || (PanOnScrollMode = {}));
    var SelectionMode;
    (function(SelectionMode) {
    	SelectionMode["Partial"] = "partial";
    	SelectionMode["Full"] = "full";
    })(SelectionMode || (SelectionMode = {}));
    const initialConnection = {
    	inProgress: false,
    	isValid: null,
    	from: null,
    	fromHandle: null,
    	fromPosition: null,
    	fromNode: null,
    	to: null,
    	toHandle: null,
    	toPosition: null,
    	toNode: null,
    	pointer: null
    };
    /**
    * If you set the `connectionLineType` prop on your [`<ReactFlow />`](/api-reference/react-flow#connection-connectionLineType)
    *component, it will dictate the style of connection line rendered when creating
    *new edges.
    *
    * @public
    *
    * @remarks If you choose to render a custom connection line component, this value will be
    *passed to your component as part of its [`ConnectionLineComponentProps`](/api-reference/types/connection-line-component-props).
    */
    var ConnectionLineType;
    (function(ConnectionLineType) {
    	ConnectionLineType["Bezier"] = "default";
    	ConnectionLineType["Straight"] = "straight";
    	ConnectionLineType["Step"] = "step";
    	ConnectionLineType["SmoothStep"] = "smoothstep";
    	ConnectionLineType["SimpleBezier"] = "simplebezier";
    })(ConnectionLineType || (ConnectionLineType = {}));
    /**
    * Edges may optionally have a marker on either end. The MarkerType type enumerates
    * the options available to you when configuring a given marker.
    *
    * @public
    */
    var MarkerType;
    (function(MarkerType) {
    	MarkerType["Arrow"] = "arrow";
    	MarkerType["ArrowClosed"] = "arrowclosed";
    })(MarkerType || (MarkerType = {}));
    /**
    * While [`PanelPosition`](/api-reference/types/panel-position) can be used to place a
    * component in the corners of a container, the `Position` enum is less precise and used
    * primarily in relation to edges and handles.
    *
    * @public
    */
    var Position;
    (function(Position) {
    	Position["Left"] = "left";
    	Position["Top"] = "top";
    	Position["Right"] = "right";
    	Position["Bottom"] = "bottom";
    })(Position || (Position = {}));
    const oppositePosition = {
    	[Position.Left]: Position.Right,
    	[Position.Right]: Position.Left,
    	[Position.Top]: Position.Bottom,
    	[Position.Bottom]: Position.Top
    };
    /**
    * Test whether an object is usable as an Edge
    * @public
    * @remarks In TypeScript this is a type guard that will narrow the type of whatever you pass in to Edge if it returns true
    * @param element - The element to test
    * @returns A boolean indicating whether the element is an Edge
    */
    const isEdgeBase = (element) => !!element && typeof element === "object" && "id" in element && "source" in element && "target" in element;
    /**
    * Test whether an object is usable as a Node
    * @public
    * @remarks In TypeScript this is a type guard that will narrow the type of whatever you pass in to Node if it returns true
    * @param element - The element to test
    * @returns A boolean indicating whether the element is an Node
    */
    const isNodeBase = (element) => !!element && typeof element === "object" && "id" in element && "position" in element && !("source" in element) && !("target" in element);
    const isInternalNodeBase = (element) => !!element && typeof element === "object" && "id" in element && "internals" in element && !("source" in element) && !("target" in element);
    const getNodePositionWithOrigin = (node, nodeOrigin = [0, 0]) => {
    	const { width, height } = getNodeDimensions(node);
    	const origin = node.origin ?? nodeOrigin;
    	const offsetX = width * origin[0];
    	const offsetY = height * origin[1];
    	return {
    		x: node.position.x - offsetX,
    		y: node.position.y - offsetY
    	};
    };
    /**
    * Returns the bounding box that contains all the given nodes in an array. This can
    * be useful when combined with [`getViewportForBounds`](/api-reference/utils/get-viewport-for-bounds)
    * to calculate the correct transform to fit the given nodes in a viewport.
    * @public
    * @remarks Useful when combined with {@link getViewportForBounds} to calculate the correct transform to fit the given nodes in a viewport.
    * @param nodes - Nodes to calculate the bounds for.
    * @returns Bounding box enclosing all nodes.
    *
    * @remarks This function was previously called `getRectOfNodes`
    *
    * @example
    * ```js
    *import { getNodesBounds } from '@xyflow/react';
    *
    *const nodes = [
    *  {
    *    id: 'a',
    *    position: { x: 0, y: 0 },
    *    data: { label: 'a' },
    *    width: 50,
    *    height: 25,
    *  },
    *  {
    *    id: 'b',
    *    position: { x: 100, y: 100 },
    *    data: { label: 'b' },
    *    width: 50,
    *    height: 25,
    *  },
    *];
    *
    *const bounds = getNodesBounds(nodes);
    *```
    */
    const getNodesBounds = (nodes, params = { nodeOrigin: [0, 0] }) => {
    	if (nodes.length === 0) return {
    		x: 0,
    		y: 0,
    		width: 0,
    		height: 0
    	};
    	let hasNode = false;
    	const box = nodes.reduce((currBox, nodeOrId) => {
    		const isId = typeof nodeOrId === "string";
    		let currentNode = !params.nodeLookup && !isId ? nodeOrId : void 0;
    		if (params.nodeLookup) currentNode = isId ? params.nodeLookup.get(nodeOrId) : !isInternalNodeBase(nodeOrId) ? params.nodeLookup.get(nodeOrId.id) : nodeOrId;
    		if (!currentNode) return currBox;
    		hasNode = true;
    		return getBoundsOfBoxes(currBox, nodeToBox(currentNode, params.nodeOrigin));
    	}, {
    		x: Infinity,
    		y: Infinity,
    		x2: -Infinity,
    		y2: -Infinity
    	});
    	return hasNode ? boxToRect(box) : {
    		x: 0,
    		y: 0,
    		width: 0,
    		height: 0
    	};
    };
    /**
    * Determines a bounding box that contains all given nodes in an array
    * @internal
    */
    const getInternalNodesBounds = (nodeLookup, params = {}) => {
    	let box = {
    		x: Infinity,
    		y: Infinity,
    		x2: -Infinity,
    		y2: -Infinity
    	};
    	let hasVisibleNodes = false;
    	nodeLookup.forEach((node) => {
    		if (params.filter === void 0 || params.filter(node)) {
    			box = getBoundsOfBoxes(box, nodeToBox(node));
    			hasVisibleNodes = true;
    		}
    	});
    	return hasVisibleNodes ? boxToRect(box) : {
    		x: 0,
    		y: 0,
    		width: 0,
    		height: 0
    	};
    };
    const getNodesInside = (nodes, rect, [tx, ty, tScale] = [
    	0,
    	0,
    	1
    ], partially = false, excludeNonSelectableNodes = false) => {
    	const paneX = (rect.x - tx) / tScale;
    	const paneY = (rect.y - ty) / tScale;
    	const paneWidth = rect.width / tScale;
    	const paneHeight = rect.height / tScale;
    	const visibleNodes = [];
    	for (const node of nodes.values()) {
    		const { measured, selectable = true, hidden = false } = node;
    		if (excludeNonSelectableNodes && !selectable || hidden) continue;
    		const width = measured.width ?? node.width ?? node.initialWidth ?? 0;
    		const height = measured.height ?? node.height ?? node.initialHeight ?? 0;
    		const { x, y } = node.internals.positionAbsolute;
    		const overlappingArea = getRectsOverlappingArea(paneX, paneY, paneWidth, paneHeight, x, y, width, height);
    		const area = width * height;
    		const partiallyVisible = partially && overlappingArea > 0;
    		if (!node.internals.handleBounds || partiallyVisible || overlappingArea >= area || node.dragging) visibleNodes.push(node);
    	}
    	return visibleNodes;
    };
    /**
    * This utility filters an array of edges, keeping only those where either the source or target
    * node is present in the given array of nodes.
    * @public
    * @param nodes - Nodes you want to get the connected edges for.
    * @param edges - All edges.
    * @returns Array of edges that connect any of the given nodes with each other.
    *
    * @example
    * ```js
    *import { getConnectedEdges } from '@xyflow/react';
    *
    *const nodes = [
    *  { id: 'a', position: { x: 0, y: 0 } },
    *  { id: 'b', position: { x: 100, y: 0 } },
    *];
    *
    *const edges = [
    *  { id: 'a->c', source: 'a', target: 'c' },
    *  { id: 'c->d', source: 'c', target: 'd' },
    *];
    *
    *const connectedEdges = getConnectedEdges(nodes, edges);
    * // => [{ id: 'a->c', source: 'a', target: 'c' }]
    *```
    */
    const getConnectedEdges = (nodes, edges) => {
    	const nodeIds = /* @__PURE__ */ new Set();
    	nodes.forEach((node) => {
    		nodeIds.add(node.id);
    	});
    	return edges.filter((edge) => nodeIds.has(edge.source) || nodeIds.has(edge.target));
    };
    function getFitViewNodes(nodeLookup, options) {
    	const fitViewNodes = /* @__PURE__ */ new Map();
    	const optionNodeIds = options?.nodes ? new Set(options.nodes.map((node) => node.id)) : null;
    	nodeLookup.forEach((n) => {
    		let isVisible;
    		if (options?.includeHiddenNodes) {
    			const { width, height } = getNodeDimensions(n);
    			isVisible = width > 0 && height > 0;
    		} else isVisible = Boolean(n.measured.width && n.measured.height && !n.hidden);
    		if (isVisible && (!optionNodeIds || optionNodeIds.has(n.id))) fitViewNodes.set(n.id, n);
    	});
    	return fitViewNodes;
    }
    async function fitViewport({ nodes, width, height, panZoom, minZoom, maxZoom }, options) {
    	if (nodes.size === 0) return true;
    	const nodesToFit = getFitViewNodes(nodes, options);
    	const bounds = getInternalNodesBounds(nodesToFit);
    	const viewport = getViewportForBounds(bounds, width, height, options?.minZoom ?? minZoom, options?.maxZoom ?? maxZoom, options?.padding ?? .1);
    	await panZoom.setViewport(viewport, {
    		duration: options?.duration,
    		ease: options?.ease,
    		interpolate: options?.interpolate
    	});
    	return true;
    }
    /**
    * This function calculates the next position of a node, taking into account the node's extent, parent node, and origin.
    *
    * @internal
    * @returns position, positionAbsolute
    */
    function calculateNodePosition({ nodeId, nextPosition, nodeLookup, nodeOrigin = [0, 0], nodeExtent, onError }) {
    	const node = nodeLookup.get(nodeId);
    	const parentNode = node.parentId ? nodeLookup.get(node.parentId) : void 0;
    	const { x: parentX, y: parentY } = parentNode ? parentNode.internals.positionAbsolute : {
    		x: 0,
    		y: 0
    	};
    	const origin = node.origin ?? nodeOrigin;
    	let extent = node.extent || nodeExtent;
    	if (node.extent === "parent" && !node.expandParent) {
    		if (!parentNode) onError?.("005", errorMessages["error005"]());
    		else {
    			const { width: parentWidth, height: parentHeight } = getNodeDimensions(parentNode);
    			if (parentWidth && parentHeight) extent = [[parentX, parentY], [parentX + parentWidth, parentY + parentHeight]];
    		}
    	} else if (parentNode && isCoordinateExtent(node.extent)) extent = [[node.extent[0][0] + parentX, node.extent[0][1] + parentY], [node.extent[1][0] + parentX, node.extent[1][1] + parentY]];
    	const positionAbsolute = isCoordinateExtent(extent) ? clampPosition(nextPosition, extent, node.measured) : nextPosition;
    	if (node.measured.width === void 0 || node.measured.height === void 0) onError?.("015", errorMessages["error015"]());
    	return {
    		position: {
    			x: positionAbsolute.x - parentX + (node.measured.width ?? 0) * origin[0],
    			y: positionAbsolute.y - parentY + (node.measured.height ?? 0) * origin[1]
    		},
    		positionAbsolute
    	};
    }
    /**
    * Pass in nodes & edges to delete, get arrays of nodes and edges that actually can be deleted
    * @internal
    * @param param.nodesToRemove - The nodes to remove
    * @param param.edgesToRemove - The edges to remove
    * @param param.nodes - All nodes
    * @param param.edges - All edges
    * @param param.onBeforeDelete - Callback to check which nodes and edges can be deleted
    * @returns nodes: nodes that can be deleted, edges: edges that can be deleted
    */
    async function getElementsToRemove({ nodesToRemove = [], edgesToRemove = [], nodes, edges, onBeforeDelete }) {
    	const nodeIds = new Set(nodesToRemove.map((node) => node.id));
    	const matchingNodes = [];
    	for (const node of nodes) {
    		if (node.deletable === false) continue;
    		const isIncluded = nodeIds.has(node.id);
    		const parentHit = !isIncluded && node.parentId && matchingNodes.find((n) => n.id === node.parentId);
    		if (isIncluded || parentHit) matchingNodes.push(node);
    	}
    	const edgeIds = new Set(edgesToRemove.map((edge) => edge.id));
    	const deletableEdges = edges.filter((edge) => edge.deletable !== false);
    	const matchingEdges = getConnectedEdges(matchingNodes, deletableEdges);
    	for (const edge of deletableEdges) if (edgeIds.has(edge.id) && !matchingEdges.find((e) => e.id === edge.id)) matchingEdges.push(edge);
    	if (!onBeforeDelete) return {
    		edges: matchingEdges,
    		nodes: matchingNodes
    	};
    	const onBeforeDeleteResult = await onBeforeDelete({
    		nodes: matchingNodes,
    		edges: matchingEdges
    	});
    	if (typeof onBeforeDeleteResult === "boolean") return onBeforeDeleteResult ? {
    		edges: matchingEdges,
    		nodes: matchingNodes
    	} : {
    		edges: [],
    		nodes: []
    	};
    	return onBeforeDeleteResult;
    }
    const clamp = (val, min = 0, max = 1) => Math.min(Math.max(val, min), max);
    const clampPosition = (position = {
    	x: 0,
    	y: 0
    }, extent, dimensions) => ({
    	x: clamp(position.x, extent[0][0], extent[1][0] - (dimensions?.width ?? 0)),
    	y: clamp(position.y, extent[0][1], extent[1][1] - (dimensions?.height ?? 0))
    });
    function clampPositionToParent(childPosition, childDimensions, parent) {
    	const { width: parentWidth, height: parentHeight } = getNodeDimensions(parent);
    	const { x: parentX, y: parentY } = parent.internals.positionAbsolute;
    	return clampPosition(childPosition, [[parentX, parentY], [parentX + parentWidth, parentY + parentHeight]], childDimensions);
    }
    /**
    * Calculates the velocity of panning when the mouse is close to the edge of the canvas
    * @internal
    * @param value - One dimensional poition of the mouse (x or y)
    * @param min - Minimal position on canvas before panning starts
    * @param max - Maximal position on canvas before panning starts
    * @returns - A number between 0 and 1 that represents the velocity of panning
    */
    const calcAutoPanVelocity = (value, min, max) => {
    	if (value < min) return clamp(Math.abs(value - min), 1, min) / min;
    	else if (value > max) return -clamp(Math.abs(value - max), 1, min) / min;
    	return 0;
    };
    const calcAutoPan = (pos, bounds, speed = 15, distance = 40) => {
    	return [calcAutoPanVelocity(pos.x, distance, bounds.width - distance) * speed, calcAutoPanVelocity(pos.y, distance, bounds.height - distance) * speed];
    };
    const getBoundsOfBoxes = (box1, box2) => ({
    	x: Math.min(box1.x, box2.x),
    	y: Math.min(box1.y, box2.y),
    	x2: Math.max(box1.x2, box2.x2),
    	y2: Math.max(box1.y2, box2.y2)
    });
    const rectToBox = ({ x, y, width, height }) => ({
    	x,
    	y,
    	x2: x + width,
    	y2: y + height
    });
    const boxToRect = ({ x, y, x2, y2 }) => ({
    	x,
    	y,
    	width: x2 - x,
    	height: y2 - y
    });
    const nodeToRect = (node, nodeOrigin = [0, 0]) => {
    	const { x, y } = isInternalNodeBase(node) ? node.internals.positionAbsolute : getNodePositionWithOrigin(node, nodeOrigin);
    	return {
    		x,
    		y,
    		width: node.measured?.width ?? node.width ?? node.initialWidth ?? 0,
    		height: node.measured?.height ?? node.height ?? node.initialHeight ?? 0
    	};
    };
    const nodeToBox = (node, nodeOrigin = [0, 0]) => {
    	const { x, y } = isInternalNodeBase(node) ? node.internals.positionAbsolute : getNodePositionWithOrigin(node, nodeOrigin);
    	return {
    		x,
    		y,
    		x2: x + (node.measured?.width ?? node.width ?? node.initialWidth ?? 0),
    		y2: y + (node.measured?.height ?? node.height ?? node.initialHeight ?? 0)
    	};
    };
    const getBoundsOfRects = (rect1, rect2) => boxToRect(getBoundsOfBoxes(rectToBox(rect1), rectToBox(rect2)));
    const getRectsOverlappingArea = (aX, aY, aWidth, aHeight, bX, bY, bWidth, bHeight) => {
    	const xOverlap = Math.max(0, Math.min(aX + aWidth, bX + bWidth) - Math.max(aX, bX));
    	const yOverlap = Math.max(0, Math.min(aY + aHeight, bY + bHeight) - Math.max(aY, bY));
    	return Math.ceil(xOverlap * yOverlap);
    };
    const getOverlappingArea = (rectA, rectB) => getRectsOverlappingArea(rectA.x, rectA.y, rectA.width, rectA.height, rectB.x, rectB.y, rectB.width, rectB.height);
    const isRectObject = (obj) => isNumeric(obj.width) && isNumeric(obj.height) && isNumeric(obj.x) && isNumeric(obj.y);
    const isNumeric = (n) => !isNaN(n) && isFinite(n);
    const createDevWarn = (lib, helpUrl) => (id, message) => {};
    const snapPosition = (position, snapGrid = [1, 1]) => {
    	return {
    		x: snapGrid[0] * Math.round(position.x / snapGrid[0]),
    		y: snapGrid[1] * Math.round(position.y / snapGrid[1])
    	};
    };
    const pointToRendererPoint = ({ x, y }, [tx, ty, tScale], snapToGrid = false, snapGrid = [1, 1]) => {
    	const position = {
    		x: (x - tx) / tScale,
    		y: (y - ty) / tScale
    	};
    	return snapToGrid ? snapPosition(position, snapGrid) : position;
    };
    const rendererPointToPoint = ({ x, y }, [tx, ty, tScale]) => {
    	return {
    		x: x * tScale + tx,
    		y: y * tScale + ty
    	};
    };
    /**
    * Parses a single padding value to a number
    * @internal
    * @param padding - Padding to parse
    * @param viewport - Width or height of the viewport
    * @returns The padding in pixels
    */
    function parsePadding(padding, viewport) {
    	if (typeof padding === "number") return Math.floor((viewport - viewport / (1 + padding)) * .5);
    	if (typeof padding === "string" && padding.endsWith("px")) {
    		const paddingValue = parseFloat(padding);
    		if (!Number.isNaN(paddingValue)) return Math.floor(paddingValue);
    	}
    	if (typeof padding === "string" && padding.endsWith("%")) {
    		const paddingValue = parseFloat(padding);
    		if (!Number.isNaN(paddingValue)) return Math.floor(viewport * paddingValue * .01);
    	}
    	console.error(`The padding value "${padding}" is invalid. Please provide a number or a string with a valid unit (px or %).`);
    	return 0;
    }
    /**
    * Parses the paddings to an object with top, right, bottom, left, x and y paddings
    * @internal
    * @param padding - Padding to parse
    * @param width - Width of the viewport
    * @param height - Height of the viewport
    * @returns An object with the paddings in pixels
    */
    function parsePaddings(padding, width, height) {
    	if (typeof padding === "string" || typeof padding === "number") {
    		const paddingY = parsePadding(padding, height);
    		const paddingX = parsePadding(padding, width);
    		return {
    			top: paddingY,
    			right: paddingX,
    			bottom: paddingY,
    			left: paddingX,
    			x: paddingX * 2,
    			y: paddingY * 2
    		};
    	}
    	if (typeof padding === "object") {
    		const top = parsePadding(padding.top ?? padding.y ?? 0, height);
    		const bottom = parsePadding(padding.bottom ?? padding.y ?? 0, height);
    		const left = parsePadding(padding.left ?? padding.x ?? 0, width);
    		const right = parsePadding(padding.right ?? padding.x ?? 0, width);
    		return {
    			top,
    			right,
    			bottom,
    			left,
    			x: left + right,
    			y: top + bottom
    		};
    	}
    	return {
    		top: 0,
    		right: 0,
    		bottom: 0,
    		left: 0,
    		x: 0,
    		y: 0
    	};
    }
    /**
    * Calculates the resulting paddings if the new viewport is applied
    * @internal
    * @param bounds - Bounds to fit inside viewport
    * @param x - X position of the viewport
    * @param y - Y position of the viewport
    * @param zoom - Zoom level of the viewport
    * @param width - Width of the viewport
    * @param height - Height of the viewport
    * @returns An object with the minimum padding required to fit the bounds inside the viewport
    */
    function calculateAppliedPaddings(bounds, x, y, zoom, width, height) {
    	const { x: left, y: top } = rendererPointToPoint(bounds, [
    		x,
    		y,
    		zoom
    	]);
    	const { x: boundRight, y: boundBottom } = rendererPointToPoint({
    		x: bounds.x + bounds.width,
    		y: bounds.y + bounds.height
    	}, [
    		x,
    		y,
    		zoom
    	]);
    	const right = width - boundRight;
    	const bottom = height - boundBottom;
    	return {
    		left: Math.floor(left),
    		top: Math.floor(top),
    		right: Math.floor(right),
    		bottom: Math.floor(bottom)
    	};
    }
    /**
    * Returns a viewport that encloses the given bounds with padding.
    * @public
    * @remarks You can determine bounds of nodes with {@link getNodesBounds} and {@link getBoundsOfRects}
    * @param bounds - Bounds to fit inside viewport.
    * @param width - Width of the viewport.
    * @param height  - Height of the viewport.
    * @param minZoom - Minimum zoom level of the resulting viewport.
    * @param maxZoom - Maximum zoom level of the resulting viewport.
    * @param padding - Padding around the bounds.
    * @returns A transformed {@link Viewport} that encloses the given bounds which you can pass to e.g. {@link setViewport}.
    * @example
    * const { x, y, zoom } = getViewportForBounds(
    * { x: 0, y: 0, width: 100, height: 100},
    * 1200, 800, 0.5, 2);
    */
    const getViewportForBounds = (bounds, width, height, minZoom, maxZoom, padding) => {
    	const p = parsePaddings(padding, width, height);
    	const xZoom = (width - p.x) / bounds.width;
    	const yZoom = (height - p.y) / bounds.height;
    	const clampedZoom = clamp(Math.min(xZoom, yZoom), minZoom, maxZoom);
    	const boundsCenterX = bounds.x + bounds.width / 2;
    	const boundsCenterY = bounds.y + bounds.height / 2;
    	const x = width / 2 - boundsCenterX * clampedZoom;
    	const y = height / 2 - boundsCenterY * clampedZoom;
    	const newPadding = calculateAppliedPaddings(bounds, x, y, clampedZoom, width, height);
    	const offset = {
    		left: Math.min(newPadding.left - p.left, 0),
    		top: Math.min(newPadding.top - p.top, 0),
    		right: Math.min(newPadding.right - p.right, 0),
    		bottom: Math.min(newPadding.bottom - p.bottom, 0)
    	};
    	return {
    		x: x - offset.left + offset.right,
    		y: y - offset.top + offset.bottom,
    		zoom: clampedZoom
    	};
    };
    const isMacOs = () => typeof navigator !== "undefined" && navigator?.userAgent?.indexOf("Mac") >= 0;
    function isCoordinateExtent(extent) {
    	return extent !== void 0 && extent !== null && extent !== "parent";
    }
    function getNodeDimensions(node) {
    	return {
    		width: node.measured?.width ?? node.width ?? node.initialWidth ?? 0,
    		height: node.measured?.height ?? node.height ?? node.initialHeight ?? 0
    	};
    }
    function nodeHasDimensions(node) {
    	return (node.measured?.width ?? node.width ?? node.initialWidth) !== void 0 && (node.measured?.height ?? node.height ?? node.initialHeight) !== void 0;
    }
    /**
    * Convert child position to absolute position
    *
    * @internal
    * @param position
    * @param parentId
    * @param nodeLookup
    * @param nodeOrigin
    * @returns an internal node with an absolute position
    */
    function evaluateAbsolutePosition(position, dimensions = {
    	width: 0,
    	height: 0
    }, parentId, nodeLookup, nodeOrigin) {
    	const positionAbsolute = { ...position };
    	const parent = nodeLookup.get(parentId);
    	if (parent) {
    		const origin = parent.origin || nodeOrigin;
    		positionAbsolute.x += parent.internals.positionAbsolute.x - (dimensions.width ?? 0) * origin[0];
    		positionAbsolute.y += parent.internals.positionAbsolute.y - (dimensions.height ?? 0) * origin[1];
    	}
    	return positionAbsolute;
    }
    function areSetsEqual(a, b) {
    	if (a.size !== b.size) return false;
    	for (const item of a) if (!b.has(item)) return false;
    	return true;
    }
    /**
    * Polyfill for Promise.withResolvers until we can use it in all browsers
    * @internal
    */
    function withResolvers() {
    	let resolve;
    	let reject;
    	return {
    		promise: new Promise((res, rej) => {
    			resolve = res;
    			reject = rej;
    		}),
    		resolve,
    		reject
    	};
    }
    function mergeAriaLabelConfig(partial) {
    	return {
    		...defaultAriaLabelConfig,
    		...partial || {}
    	};
    }
    function getConnectionStatus(isValid) {
    	return isValid === null ? null : isValid ? "valid" : "invalid";
    }
    function getPointerPosition(event, { snapGrid = [0, 0], snapToGrid = false, transform, containerBounds }) {
    	const { x, y } = getEventPosition(event);
    	const pointerPos = pointToRendererPoint({
    		x: x - (containerBounds?.left ?? 0),
    		y: y - (containerBounds?.top ?? 0)
    	}, transform);
    	const { x: xSnapped, y: ySnapped } = snapToGrid ? snapPosition(pointerPos, snapGrid) : pointerPos;
    	return {
    		xSnapped,
    		ySnapped,
    		...pointerPos
    	};
    }
    const getDimensions = (node) => ({
    	width: node.offsetWidth,
    	height: node.offsetHeight
    });
    const getHostForElement = (element) => element?.getRootNode?.() || window?.document;
    const inputTags = [
    	"INPUT",
    	"SELECT",
    	"TEXTAREA"
    ];
    function isInputDOMNode(event) {
    	const target = event.composedPath?.()?.[0] || event.target;
    	if (target?.nodeType !== 1) return false;
    	return inputTags.includes(target.nodeName) || target.hasAttribute("contenteditable") || !!target.closest(".nokey");
    }
    const isMouseEvent = (event) => "clientX" in event;
    const getEventPosition = (event, bounds) => {
    	const isMouse = isMouseEvent(event);
    	const evtX = isMouse ? event.clientX : event.touches?.[0].clientX;
    	const evtY = isMouse ? event.clientY : event.touches?.[0].clientY;
    	return {
    		x: evtX - (bounds?.left ?? 0),
    		y: evtY - (bounds?.top ?? 0)
    	};
    };
    const getHandleBounds = (type, nodeElement, nodeBounds, zoom, nodeId) => {
    	const handles = nodeElement.querySelectorAll(`.${type}`);
    	if (!handles || !handles.length) return null;
    	return Array.from(handles).map((handle) => {
    		const handleBounds = handle.getBoundingClientRect();
    		return {
    			id: handle.getAttribute("data-handleid"),
    			type,
    			nodeId,
    			position: handle.getAttribute("data-handlepos"),
    			x: (handleBounds.left - nodeBounds.left) / zoom,
    			y: (handleBounds.top - nodeBounds.top) / zoom,
    			...getDimensions(handle)
    		};
    	});
    };
    function getBezierEdgeCenter({ sourceX, sourceY, targetX, targetY, sourceControlX, sourceControlY, targetControlX, targetControlY }) {
    	const centerX = sourceX * .125 + sourceControlX * .375 + targetControlX * .375 + targetX * .125;
    	const centerY = sourceY * .125 + sourceControlY * .375 + targetControlY * .375 + targetY * .125;
    	return [
    		centerX,
    		centerY,
    		Math.abs(centerX - sourceX),
    		Math.abs(centerY - sourceY)
    	];
    }
    function calculateControlOffset(distance, curvature) {
    	if (distance >= 0) return .5 * distance;
    	return curvature * 25 * Math.sqrt(-distance);
    }
    function getControlWithCurvature({ pos, x1, y1, x2, y2, c }) {
    	switch (pos) {
    		case Position.Left: return [x1 - calculateControlOffset(x1 - x2, c), y1];
    		case Position.Right: return [x1 + calculateControlOffset(x2 - x1, c), y1];
    		case Position.Top: return [x1, y1 - calculateControlOffset(y1 - y2, c)];
    		case Position.Bottom: return [x1, y1 + calculateControlOffset(y2 - y1, c)];
    	}
    }
    /**
    * The `getBezierPath` util returns everything you need to render a bezier edge
    *between two nodes.
    * @public
    * @returns A path string you can use in an SVG, the `labelX` and `labelY` position (center of path)
    * and `offsetX`, `offsetY` between source handle and label.
    * - `path`: the path to use in an SVG `<path>` element.
    * - `labelX`: the `x` position you can use to render a label for this edge.
    * - `labelY`: the `y` position you can use to render a label for this edge.
    * - `offsetX`: the absolute difference between the source `x` position and the `x` position of the
    * middle of this path.
    * - `offsetY`: the absolute difference between the source `y` position and the `y` position of the
    * middle of this path.
    * @example
    * ```js
    *  const source = { x: 0, y: 20 };
    *  const target = { x: 150, y: 100 };
    *
    *  const [path, labelX, labelY, offsetX, offsetY] = getBezierPath({
    *    sourceX: source.x,
    *    sourceY: source.y,
    *    sourcePosition: Position.Right,
    *    targetX: target.x,
    *    targetY: target.y,
    *    targetPosition: Position.Left,
    *});
    *```
    *
    * @remarks This function returns a tuple (aka a fixed-size array) to make it easier to
    *work with multiple edge paths at once.
    */
    function getBezierPath({ sourceX, sourceY, sourcePosition = Position.Bottom, targetX, targetY, targetPosition = Position.Top, curvature = .25 }) {
    	const [sourceControlX, sourceControlY] = getControlWithCurvature({
    		pos: sourcePosition,
    		x1: sourceX,
    		y1: sourceY,
    		x2: targetX,
    		y2: targetY,
    		c: curvature
    	});
    	const [targetControlX, targetControlY] = getControlWithCurvature({
    		pos: targetPosition,
    		x1: targetX,
    		y1: targetY,
    		x2: sourceX,
    		y2: sourceY,
    		c: curvature
    	});
    	const [labelX, labelY, offsetX, offsetY] = getBezierEdgeCenter({
    		sourceX,
    		sourceY,
    		targetX,
    		targetY,
    		sourceControlX,
    		sourceControlY,
    		targetControlX,
    		targetControlY
    	});
    	return [
    		`M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`,
    		labelX,
    		labelY,
    		offsetX,
    		offsetY
    	];
    }
    function getEdgeCenter({ sourceX, sourceY, targetX, targetY }) {
    	const xOffset = Math.abs(targetX - sourceX) / 2;
    	const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;
    	const yOffset = Math.abs(targetY - sourceY) / 2;
    	return [
    		centerX,
    		targetY < sourceY ? targetY + yOffset : targetY - yOffset,
    		xOffset,
    		yOffset
    	];
    }
    /**
    * Returns the z-index for an edge based on the node it connects and whether it is selected.
    * By default, edges are rendered below nodes. This behaviour is different for edges that are
    * connected to nodes with a parent, as they are rendered above the parent node.
    */
    function getElevatedEdgeZIndex({ sourceNode, targetNode, selected = false, zIndex = 0, elevateOnSelect = false, zIndexMode = "basic" }) {
    	if (zIndexMode === "manual") return zIndex;
    	return (elevateOnSelect && selected ? zIndex + 1e3 : zIndex) + Math.max(sourceNode.parentId || elevateOnSelect && sourceNode.selected ? sourceNode.internals.z : 0, targetNode.parentId || elevateOnSelect && targetNode.selected ? targetNode.internals.z : 0);
    }
    function isEdgeVisible({ sourceNode, targetNode, width, height, transform }) {
    	const edgeBox = getBoundsOfBoxes(nodeToBox(sourceNode), nodeToBox(targetNode));
    	if (edgeBox.x === edgeBox.x2) edgeBox.x2 += 1;
    	if (edgeBox.y === edgeBox.y2) edgeBox.y2 += 1;
    	const viewRect = {
    		x: -transform[0] / transform[2],
    		y: -transform[1] / transform[2],
    		width: width / transform[2],
    		height: height / transform[2]
    	};
    	return getOverlappingArea(viewRect, boxToRect(edgeBox)) > 0;
    }
    /**
    * The default edge ID generator function. Generates an ID based on the source, target, and handles.
    * @public
    * @param params - The connection or edge to generate an ID for.
    * @returns The generated edge ID.
    */
    const getEdgeId = ({ source, sourceHandle, target, targetHandle }) => `xy-edge__${source}${sourceHandle || ""}-${target}${targetHandle || ""}`;
    const connectionExists = (edge, edges) => {
    	return edges.some((el) => el.source === edge.source && el.target === edge.target && (el.sourceHandle === edge.sourceHandle || !el.sourceHandle && !edge.sourceHandle) && (el.targetHandle === edge.targetHandle || !el.targetHandle && !edge.targetHandle));
    };
    /**
    * This util is a convenience function to add a new Edge to an array of edges. It also performs some validation to make sure you don't add an invalid edge or duplicate an existing one.
    * @public
    * @param edgeParams - Either an `Edge` or a `Connection` you want to add.
    * @param edges - The array of all current edges.
    * @param options - Optional configuration object.
    * @returns A new array of edges with the new edge added.
    *
    * @remarks If an edge with the same `target` and `source` already exists (and the same
    *`targetHandle` and `sourceHandle` if those are set), then this util won't add
    *a new edge even if the `id` property is different.
    *
    */
    const addEdge$1 = (edgeParams, edges, options = {}) => {
    	if (!edgeParams.source || !edgeParams.target) {
    		options.onError?.("006", errorMessages["error006"]());
    		return edges;
    	}
    	const edgeIdGenerator = options.getEdgeId || getEdgeId;
    	let edge;
    	if (isEdgeBase(edgeParams)) edge = { ...edgeParams };
    	else edge = {
    		...edgeParams,
    		id: edgeIdGenerator(edgeParams)
    	};
    	if (connectionExists(edge, edges)) return edges;
    	if (edge.sourceHandle === null) delete edge.sourceHandle;
    	if (edge.targetHandle === null) delete edge.targetHandle;
    	return edges.concat(edge);
    };
    /**
    * Calculates the straight line path between two points.
    * @public
    * @returns A path string you can use in an SVG, the `labelX` and `labelY` position (center of path)
    * and `offsetX`, `offsetY` between source handle and label.
    *
    * - `path`: the path to use in an SVG `<path>` element.
    * - `labelX`: the `x` position you can use to render a label for this edge.
    * - `labelY`: the `y` position you can use to render a label for this edge.
    * - `offsetX`: the absolute difference between the source `x` position and the `x` position of the
    * middle of this path.
    * - `offsetY`: the absolute difference between the source `y` position and the `y` position of the
    * middle of this path.
    * @example
    * ```js
    *  const source = { x: 0, y: 20 };
    *  const target = { x: 150, y: 100 };
    *
    *  const [path, labelX, labelY, offsetX, offsetY] = getStraightPath({
    *    sourceX: source.x,
    *    sourceY: source.y,
    *    sourcePosition: Position.Right,
    *    targetX: target.x,
    *    targetY: target.y,
    *    targetPosition: Position.Left,
    *  });
    * ```
    * @remarks This function returns a tuple (aka a fixed-size array) to make it easier to work with multiple edge paths at once.
    */
    function getStraightPath({ sourceX, sourceY, targetX, targetY }) {
    	const [labelX, labelY, offsetX, offsetY] = getEdgeCenter({
    		sourceX,
    		sourceY,
    		targetX,
    		targetY
    	});
    	return [
    		`M ${sourceX},${sourceY}L ${targetX},${targetY}`,
    		labelX,
    		labelY,
    		offsetX,
    		offsetY
    	];
    }
    const handleDirections = {
    	[Position.Left]: {
    		x: -1,
    		y: 0
    	},
    	[Position.Right]: {
    		x: 1,
    		y: 0
    	},
    	[Position.Top]: {
    		x: 0,
    		y: -1
    	},
    	[Position.Bottom]: {
    		x: 0,
    		y: 1
    	}
    };
    const getDirection = ({ source, sourcePosition = Position.Bottom, target }) => {
    	if (sourcePosition === Position.Left || sourcePosition === Position.Right) return source.x < target.x ? {
    		x: 1,
    		y: 0
    	} : {
    		x: -1,
    		y: 0
    	};
    	return source.y < target.y ? {
    		x: 0,
    		y: 1
    	} : {
    		x: 0,
    		y: -1
    	};
    };
    const distance = (a, b) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    function getPoints({ source, sourcePosition = Position.Bottom, target, targetPosition = Position.Top, center, offset, stepPosition }) {
    	const sourceDir = handleDirections[sourcePosition];
    	const targetDir = handleDirections[targetPosition];
    	const sourceGapped = {
    		x: source.x + sourceDir.x * offset,
    		y: source.y + sourceDir.y * offset
    	};
    	const targetGapped = {
    		x: target.x + targetDir.x * offset,
    		y: target.y + targetDir.y * offset
    	};
    	const dir = getDirection({
    		source: sourceGapped,
    		sourcePosition,
    		target: targetGapped
    	});
    	const dirAccessor = dir.x !== 0 ? "x" : "y";
    	const currDir = dir[dirAccessor];
    	let points = [];
    	let centerX, centerY;
    	const sourceGapOffset = {
    		x: 0,
    		y: 0
    	};
    	const targetGapOffset = {
    		x: 0,
    		y: 0
    	};
    	const [, , defaultOffsetX, defaultOffsetY] = getEdgeCenter({
    		sourceX: source.x,
    		sourceY: source.y,
    		targetX: target.x,
    		targetY: target.y
    	});
    	if (sourceDir[dirAccessor] * targetDir[dirAccessor] === -1) {
    		if (dirAccessor === "x") {
    			centerX = center.x ?? sourceGapped.x + (targetGapped.x - sourceGapped.x) * stepPosition;
    			centerY = center.y ?? (sourceGapped.y + targetGapped.y) / 2;
    		} else {
    			centerX = center.x ?? (sourceGapped.x + targetGapped.x) / 2;
    			centerY = center.y ?? sourceGapped.y + (targetGapped.y - sourceGapped.y) * stepPosition;
    		}
    		const verticalSplit = [{
    			x: centerX,
    			y: sourceGapped.y
    		}, {
    			x: centerX,
    			y: targetGapped.y
    		}];
    		const horizontalSplit = [{
    			x: sourceGapped.x,
    			y: centerY
    		}, {
    			x: targetGapped.x,
    			y: centerY
    		}];
    		if (sourceDir[dirAccessor] === currDir) points = dirAccessor === "x" ? verticalSplit : horizontalSplit;
    		else points = dirAccessor === "x" ? horizontalSplit : verticalSplit;
    	} else {
    		const sourceTarget = [{
    			x: sourceGapped.x,
    			y: targetGapped.y
    		}];
    		const targetSource = [{
    			x: targetGapped.x,
    			y: sourceGapped.y
    		}];
    		if (dirAccessor === "x") points = sourceDir.x === currDir ? targetSource : sourceTarget;
    		else points = sourceDir.y === currDir ? sourceTarget : targetSource;
    		if (sourcePosition === targetPosition) {
    			const diff = Math.abs(source[dirAccessor] - target[dirAccessor]);
    			if (diff <= offset) {
    				const gapOffset = Math.min(offset - 1, offset - diff);
    				if (sourceDir[dirAccessor] === currDir) sourceGapOffset[dirAccessor] = (sourceGapped[dirAccessor] > source[dirAccessor] ? -1 : 1) * gapOffset;
    				else targetGapOffset[dirAccessor] = (targetGapped[dirAccessor] > target[dirAccessor] ? -1 : 1) * gapOffset;
    			}
    		}
    		if (sourcePosition !== targetPosition) {
    			const dirAccessorOpposite = dirAccessor === "x" ? "y" : "x";
    			const isSameDir = sourceDir[dirAccessor] === targetDir[dirAccessorOpposite];
    			const sourceGtTargetOppo = sourceGapped[dirAccessorOpposite] > targetGapped[dirAccessorOpposite];
    			const sourceLtTargetOppo = sourceGapped[dirAccessorOpposite] < targetGapped[dirAccessorOpposite];
    			if (sourceDir[dirAccessor] === 1 && (!isSameDir && sourceGtTargetOppo || isSameDir && sourceLtTargetOppo) || sourceDir[dirAccessor] !== 1 && (!isSameDir && sourceLtTargetOppo || isSameDir && sourceGtTargetOppo)) points = dirAccessor === "x" ? sourceTarget : targetSource;
    		}
    		const sourceGapPoint = {
    			x: sourceGapped.x + sourceGapOffset.x,
    			y: sourceGapped.y + sourceGapOffset.y
    		};
    		const targetGapPoint = {
    			x: targetGapped.x + targetGapOffset.x,
    			y: targetGapped.y + targetGapOffset.y
    		};
    		if (Math.max(Math.abs(sourceGapPoint.x - points[0].x), Math.abs(targetGapPoint.x - points[0].x)) >= Math.max(Math.abs(sourceGapPoint.y - points[0].y), Math.abs(targetGapPoint.y - points[0].y))) {
    			centerX = (sourceGapPoint.x + targetGapPoint.x) / 2;
    			centerY = points[0].y;
    		} else {
    			centerX = points[0].x;
    			centerY = (sourceGapPoint.y + targetGapPoint.y) / 2;
    		}
    	}
    	const gappedSource = {
    		x: sourceGapped.x + sourceGapOffset.x,
    		y: sourceGapped.y + sourceGapOffset.y
    	};
    	const gappedTarget = {
    		x: targetGapped.x + targetGapOffset.x,
    		y: targetGapped.y + targetGapOffset.y
    	};
    	return [
    		[
    			source,
    			...gappedSource.x !== points[0].x || gappedSource.y !== points[0].y ? [gappedSource] : [],
    			...points,
    			...gappedTarget.x !== points[points.length - 1].x || gappedTarget.y !== points[points.length - 1].y ? [gappedTarget] : [],
    			target
    		],
    		centerX,
    		centerY,
    		defaultOffsetX,
    		defaultOffsetY
    	];
    }
    function getBend(a, b, c, size) {
    	const bendSize = Math.min(distance(a, b) / 2, distance(b, c) / 2, size);
    	const { x, y } = b;
    	if (a.x === x && x === c.x || a.y === y && y === c.y) return `L${x} ${y}`;
    	if (a.y === y) {
    		const xDir = a.x < c.x ? -1 : 1;
    		const yDir = a.y < c.y ? 1 : -1;
    		return `L ${x + bendSize * xDir},${y}Q ${x},${y} ${x},${y + bendSize * yDir}`;
    	}
    	const xDir = a.x < c.x ? 1 : -1;
    	return `L ${x},${y + bendSize * (a.y < c.y ? -1 : 1)}Q ${x},${y} ${x + bendSize * xDir},${y}`;
    }
    /**
    * The `getSmoothStepPath` util returns everything you need to render a stepped path
    * between two nodes. The `borderRadius` property can be used to choose how rounded
    * the corners of those steps are.
    * @public
    * @returns A path string you can use in an SVG, the `labelX` and `labelY` position (center of path)
    * and `offsetX`, `offsetY` between source handle and label.
    *
    * - `path`: the path to use in an SVG `<path>` element.
    * - `labelX`: the `x` position you can use to render a label for this edge.
    * - `labelY`: the `y` position you can use to render a label for this edge.
    * - `offsetX`: the absolute difference between the source `x` position and the `x` position of the
    * middle of this path.
    * - `offsetY`: the absolute difference between the source `y` position and the `y` position of the
    * middle of this path.
    * @example
    * ```js
    *  const source = { x: 0, y: 20 };
    *  const target = { x: 150, y: 100 };
    *
    *  const [path, labelX, labelY, offsetX, offsetY] = getSmoothStepPath({
    *    sourceX: source.x,
    *    sourceY: source.y,
    *    sourcePosition: Position.Right,
    *    targetX: target.x,
    *    targetY: target.y,
    *    targetPosition: Position.Left,
    *  });
    * ```
    * @remarks This function returns a tuple (aka a fixed-size array) to make it easier to work with multiple edge paths at once.
    */
    function getSmoothStepPath({ sourceX, sourceY, sourcePosition = Position.Bottom, targetX, targetY, targetPosition = Position.Top, borderRadius = 5, centerX, centerY, offset = 20, stepPosition = .5 }) {
    	const [points, labelX, labelY, offsetX, offsetY] = getPoints({
    		source: {
    			x: sourceX,
    			y: sourceY
    		},
    		sourcePosition,
    		target: {
    			x: targetX,
    			y: targetY
    		},
    		targetPosition,
    		center: {
    			x: centerX,
    			y: centerY
    		},
    		offset,
    		stepPosition
    	});
    	let path = `M${points[0].x} ${points[0].y}`;
    	for (let i = 1; i < points.length - 1; i++) path += getBend(points[i - 1], points[i], points[i + 1], borderRadius);
    	path += `L${points[points.length - 1].x} ${points[points.length - 1].y}`;
    	return [
    		path,
    		labelX,
    		labelY,
    		offsetX,
    		offsetY
    	];
    }
    function isNodeInitialized(node) {
    	return node && !!(node.internals.handleBounds || node.handles?.length) && !!(node.measured.width || node.width || node.initialWidth);
    }
    function getEdgePosition(params) {
    	const { sourceNode, targetNode } = params;
    	if (!isNodeInitialized(sourceNode) || !isNodeInitialized(targetNode)) return null;
    	const sourceHandleBounds = sourceNode.internals.handleBounds || toHandleBounds(sourceNode.handles);
    	const targetHandleBounds = targetNode.internals.handleBounds || toHandleBounds(targetNode.handles);
    	const sourceHandle = getHandle$1(sourceHandleBounds?.source ?? [], params.sourceHandle);
    	const targetHandle = getHandle$1(params.connectionMode === ConnectionMode.Strict ? targetHandleBounds?.target ?? [] : (targetHandleBounds?.target ?? []).concat(targetHandleBounds?.source ?? []), params.targetHandle);
    	if (!sourceHandle || !targetHandle) {
    		params.onError?.("008", errorMessages["error008"](!sourceHandle ? "source" : "target", {
    			id: params.id,
    			sourceHandle: params.sourceHandle,
    			targetHandle: params.targetHandle
    		}));
    		return null;
    	}
    	const sourcePosition = sourceHandle?.position || Position.Bottom;
    	const targetPosition = targetHandle?.position || Position.Top;
    	const source = getHandlePosition(sourceNode, sourceHandle, sourcePosition);
    	const target = getHandlePosition(targetNode, targetHandle, targetPosition);
    	return {
    		sourceX: source.x,
    		sourceY: source.y,
    		targetX: target.x,
    		targetY: target.y,
    		sourcePosition,
    		targetPosition
    	};
    }
    function toHandleBounds(handles) {
    	if (!handles) return null;
    	const source = [];
    	const target = [];
    	for (const handle of handles) {
    		handle.width = handle.width ?? 1;
    		handle.height = handle.height ?? 1;
    		if (handle.type === "source") source.push(handle);
    		else if (handle.type === "target") target.push(handle);
    	}
    	return {
    		source,
    		target
    	};
    }
    function getHandlePosition(node, handle, fallbackPosition = Position.Left, center = false) {
    	const x = (handle?.x ?? 0) + node.internals.positionAbsolute.x;
    	const y = (handle?.y ?? 0) + node.internals.positionAbsolute.y;
    	const { width, height } = handle ?? getNodeDimensions(node);
    	if (center) return {
    		x: x + width / 2,
    		y: y + height / 2
    	};
    	switch (handle?.position ?? fallbackPosition) {
    		case Position.Top: return {
    			x: x + width / 2,
    			y
    		};
    		case Position.Right: return {
    			x: x + width,
    			y: y + height / 2
    		};
    		case Position.Bottom: return {
    			x: x + width / 2,
    			y: y + height
    		};
    		case Position.Left: return {
    			x,
    			y: y + height / 2
    		};
    	}
    }
    function getHandle$1(bounds, handleId) {
    	if (!bounds) return null;
    	return (!handleId ? bounds[0] : bounds.find((d) => d.id === handleId)) || null;
    }
    function getMarkerId(marker, id) {
    	if (!marker) return "";
    	if (typeof marker === "string") return marker;
    	return `${id ? `${id}__` : ""}${Object.keys(marker).sort().map((key) => `${key}=${marker[key]}`).join("&")}`;
    }
    function createMarkerIds(edges, { id, defaultColor, defaultMarkerStart, defaultMarkerEnd }) {
    	const ids = /* @__PURE__ */ new Set();
    	return edges.reduce((markers, edge) => {
    		[edge.markerStart || defaultMarkerStart, edge.markerEnd || defaultMarkerEnd].forEach((marker) => {
    			if (marker && typeof marker === "object") {
    				const markerId = getMarkerId(marker, id);
    				if (!ids.has(markerId)) {
    					markers.push({
    						id: markerId,
    						color: marker.color || defaultColor,
    						...marker
    					});
    					ids.add(markerId);
    				}
    			}
    		});
    		return markers;
    	}, []).sort((a, b) => a.id.localeCompare(b.id));
    }
    const SELECTED_NODE_Z = 1e3;
    const ROOT_PARENT_Z_INCREMENT = 10;
    const defaultOptions = {
    	nodeOrigin: [0, 0],
    	nodeExtent: infiniteExtent,
    	elevateNodesOnSelect: true,
    	zIndexMode: "basic",
    	defaults: {}
    };
    const adoptUserNodesDefaultOptions = {
    	...defaultOptions,
    	checkEquality: true
    };
    function mergeObjects(base, incoming) {
    	const result = { ...base };
    	for (const key in incoming) if (incoming[key] !== void 0) result[key] = incoming[key];
    	return result;
    }
    function updateAbsolutePositions(nodeLookup, parentLookup, options) {
    	const _options = mergeObjects(defaultOptions, options);
    	for (const node of nodeLookup.values()) if (node.parentId) updateChildNode(node, nodeLookup, parentLookup, _options);
    	else {
    		const positionWithOrigin = getNodePositionWithOrigin(node, _options.nodeOrigin);
    		const extent = isCoordinateExtent(node.extent) ? node.extent : _options.nodeExtent;
    		const clampedPosition = clampPosition(positionWithOrigin, extent, getNodeDimensions(node));
    		node.internals.positionAbsolute = clampedPosition;
    	}
    }
    function parseHandles(userNode, internalNode) {
    	if (!userNode.handles) return !userNode.measured ? void 0 : internalNode?.internals.handleBounds;
    	const source = [];
    	const target = [];
    	for (const handle of userNode.handles) {
    		const handleBounds = {
    			id: handle.id,
    			width: handle.width ?? 1,
    			height: handle.height ?? 1,
    			nodeId: userNode.id,
    			x: handle.x,
    			y: handle.y,
    			position: handle.position,
    			type: handle.type
    		};
    		if (handle.type === "source") source.push(handleBounds);
    		else if (handle.type === "target") target.push(handleBounds);
    	}
    	return {
    		source,
    		target
    	};
    }
    function isManualZIndexMode(zIndexMode) {
    	return zIndexMode === "manual";
    }
    function adoptUserNodes(nodes, nodeLookup, parentLookup, options = {}) {
    	const _options = mergeObjects(adoptUserNodesDefaultOptions, options);
    	const rootParentIndex = { i: 0 };
    	const tmpLookup = new Map(nodeLookup);
    	const selectedNodeZ = _options?.elevateNodesOnSelect && !isManualZIndexMode(_options.zIndexMode) ? SELECTED_NODE_Z : 0;
    	let nodesInitialized = nodes.length > 0;
    	let hasSelectedNodes = false;
    	nodeLookup.clear();
    	parentLookup.clear();
    	for (const userNode of nodes) {
    		let internalNode = tmpLookup.get(userNode.id);
    		if (_options.checkEquality && userNode === internalNode?.internals.userNode) nodeLookup.set(userNode.id, internalNode);
    		else {
    			const positionWithOrigin = getNodePositionWithOrigin(userNode, _options.nodeOrigin);
    			const extent = isCoordinateExtent(userNode.extent) ? userNode.extent : _options.nodeExtent;
    			const clampedPosition = clampPosition(positionWithOrigin, extent, getNodeDimensions(userNode));
    			internalNode = {
    				..._options.defaults,
    				...userNode,
    				measured: {
    					width: userNode.measured?.width,
    					height: userNode.measured?.height
    				},
    				internals: {
    					positionAbsolute: clampedPosition,
    					handleBounds: parseHandles(userNode, internalNode),
    					z: calculateZ(userNode, selectedNodeZ, _options.zIndexMode),
    					userNode
    				}
    			};
    			nodeLookup.set(userNode.id, internalNode);
    		}
    		if ((internalNode.measured === void 0 || internalNode.measured.width === void 0 || internalNode.measured.height === void 0) && !internalNode.hidden) nodesInitialized = false;
    		if (userNode.parentId) updateChildNode(internalNode, nodeLookup, parentLookup, options, rootParentIndex);
    		hasSelectedNodes ||= userNode.selected ?? false;
    	}
    	return {
    		nodesInitialized,
    		hasSelectedNodes
    	};
    }
    function updateParentLookup(node, parentLookup) {
    	if (!node.parentId) return;
    	const childNodes = parentLookup.get(node.parentId);
    	if (childNodes) childNodes.set(node.id, node);
    	else parentLookup.set(node.parentId, /* @__PURE__ */ new Map([[node.id, node]]));
    }
    /**
    * Updates positionAbsolute and zIndex of a child node and the parentLookup.
    */
    function updateChildNode(node, nodeLookup, parentLookup, options, rootParentIndex) {
    	const { elevateNodesOnSelect, nodeOrigin, nodeExtent, zIndexMode } = mergeObjects(defaultOptions, options);
    	const parentId = node.parentId;
    	const parentNode = nodeLookup.get(parentId);
    	if (!parentNode) {
    		console.warn(`Parent node ${parentId} not found. Please make sure that parent nodes are in front of their child nodes in the nodes array.`);
    		return;
    	}
    	updateParentLookup(node, parentLookup);
    	if (rootParentIndex && !parentNode.parentId && parentNode.internals.rootParentIndex === void 0 && zIndexMode === "auto") {
    		parentNode.internals.rootParentIndex = ++rootParentIndex.i;
    		parentNode.internals.z = parentNode.internals.z + rootParentIndex.i * ROOT_PARENT_Z_INCREMENT;
    	}
    	if (rootParentIndex && parentNode.internals.rootParentIndex !== void 0) rootParentIndex.i = parentNode.internals.rootParentIndex;
    	const { x, y, z } = calculateChildXYZ(node, parentNode, nodeOrigin, nodeExtent, elevateNodesOnSelect && !isManualZIndexMode(zIndexMode) ? SELECTED_NODE_Z : 0, zIndexMode);
    	const { positionAbsolute } = node.internals;
    	const positionChanged = x !== positionAbsolute.x || y !== positionAbsolute.y;
    	if (positionChanged || z !== node.internals.z) nodeLookup.set(node.id, {
    		...node,
    		internals: {
    			...node.internals,
    			positionAbsolute: positionChanged ? {
    				x,
    				y
    			} : positionAbsolute,
    			z
    		}
    	});
    }
    function calculateZ(node, selectedNodeZ, zIndexMode) {
    	const zIndex = isNumeric(node.zIndex) ? node.zIndex : 0;
    	if (isManualZIndexMode(zIndexMode)) return zIndex;
    	return zIndex + (node.selected ? selectedNodeZ : 0);
    }
    function calculateChildXYZ(childNode, parentNode, nodeOrigin, nodeExtent, selectedNodeZ, zIndexMode) {
    	const { x: parentX, y: parentY } = parentNode.internals.positionAbsolute;
    	const childDimensions = getNodeDimensions(childNode);
    	const positionWithOrigin = getNodePositionWithOrigin(childNode, nodeOrigin);
    	const clampedPosition = isCoordinateExtent(childNode.extent) ? clampPosition(positionWithOrigin, childNode.extent, childDimensions) : positionWithOrigin;
    	let absolutePosition = clampPosition({
    		x: parentX + clampedPosition.x,
    		y: parentY + clampedPosition.y
    	}, nodeExtent, childDimensions);
    	if (childNode.extent === "parent") absolutePosition = clampPositionToParent(absolutePosition, childDimensions, parentNode);
    	const childZ = calculateZ(childNode, selectedNodeZ, zIndexMode);
    	const parentZ = parentNode.internals.z ?? 0;
    	return {
    		x: absolutePosition.x,
    		y: absolutePosition.y,
    		z: parentZ >= childZ ? parentZ + 1 : childZ
    	};
    }
    function handleExpandParent(children, nodeLookup, parentLookup, nodeOrigin = [0, 0]) {
    	const changes = [];
    	const parentExpansions = /* @__PURE__ */ new Map();
    	for (const child of children) {
    		const parent = nodeLookup.get(child.parentId);
    		if (!parent) continue;
    		const parentRect = parentExpansions.get(child.parentId)?.expandedRect ?? nodeToRect(parent);
    		const expandedRect = getBoundsOfRects(parentRect, child.rect);
    		parentExpansions.set(child.parentId, {
    			expandedRect,
    			parent
    		});
    	}
    	if (parentExpansions.size > 0) parentExpansions.forEach(({ expandedRect, parent }, parentId) => {
    		const positionAbsolute = parent.internals.positionAbsolute;
    		const dimensions = getNodeDimensions(parent);
    		const origin = parent.origin ?? nodeOrigin;
    		const xChange = expandedRect.x < positionAbsolute.x ? Math.round(Math.abs(positionAbsolute.x - expandedRect.x)) : 0;
    		const yChange = expandedRect.y < positionAbsolute.y ? Math.round(Math.abs(positionAbsolute.y - expandedRect.y)) : 0;
    		const newWidth = Math.max(dimensions.width, Math.round(expandedRect.width));
    		const newHeight = Math.max(dimensions.height, Math.round(expandedRect.height));
    		const widthChange = (newWidth - dimensions.width) * origin[0];
    		const heightChange = (newHeight - dimensions.height) * origin[1];
    		if (xChange > 0 || yChange > 0 || widthChange || heightChange) {
    			changes.push({
    				id: parentId,
    				type: "position",
    				position: {
    					x: parent.position.x - xChange + widthChange,
    					y: parent.position.y - yChange + heightChange
    				}
    			});
    			parentLookup.get(parentId)?.forEach((childNode) => {
    				if (!children.some((child) => child.id === childNode.id)) changes.push({
    					id: childNode.id,
    					type: "position",
    					position: {
    						x: childNode.position.x + xChange,
    						y: childNode.position.y + yChange
    					}
    				});
    			});
    		}
    		if (dimensions.width < expandedRect.width || dimensions.height < expandedRect.height || xChange || yChange) changes.push({
    			id: parentId,
    			type: "dimensions",
    			setAttributes: true,
    			dimensions: {
    				width: newWidth + (xChange ? origin[0] * xChange - widthChange : 0),
    				height: newHeight + (yChange ? origin[1] * yChange - heightChange : 0)
    			}
    		});
    	});
    	return changes;
    }
    function updateNodeInternals(updates, nodeLookup, parentLookup, domNode, nodeOrigin, nodeExtent, zIndexMode) {
    	const viewportNode = domNode?.querySelector(".xyflow__viewport");
    	let updatedInternals = false;
    	if (!viewportNode) return {
    		changes: [],
    		updatedInternals
    	};
    	const changes = [];
    	const style = window.getComputedStyle(viewportNode);
    	const { m22: zoom } = new window.DOMMatrixReadOnly(style.transform);
    	const parentExpandChildren = [];
    	for (const update of updates.values()) {
    		const node = nodeLookup.get(update.id);
    		if (!node) continue;
    		if (node.hidden) {
    			nodeLookup.set(node.id, {
    				...node,
    				internals: {
    					...node.internals,
    					handleBounds: void 0
    				}
    			});
    			updatedInternals = true;
    			continue;
    		}
    		const dimensions = getDimensions(update.nodeElement);
    		const dimensionChanged = node.measured.width !== dimensions.width || node.measured.height !== dimensions.height;
    		if (!!(dimensions.width && dimensions.height && (dimensionChanged || !node.internals.handleBounds || update.force))) {
    			const nodeBounds = update.nodeElement.getBoundingClientRect();
    			const extent = isCoordinateExtent(node.extent) ? node.extent : nodeExtent;
    			let { positionAbsolute } = node.internals;
    			if (node.parentId && node.extent === "parent") {
    				const parentNode = nodeLookup.get(node.parentId);
    				if (parentNode) positionAbsolute = clampPositionToParent(positionAbsolute, dimensions, parentNode);
    			} else if (extent) positionAbsolute = clampPosition(positionAbsolute, extent, dimensions);
    			const newNode = {
    				...node,
    				measured: dimensions,
    				internals: {
    					...node.internals,
    					positionAbsolute,
    					handleBounds: {
    						source: getHandleBounds("source", update.nodeElement, nodeBounds, zoom, node.id),
    						target: getHandleBounds("target", update.nodeElement, nodeBounds, zoom, node.id)
    					}
    				}
    			};
    			nodeLookup.set(node.id, newNode);
    			if (node.parentId) updateChildNode(newNode, nodeLookup, parentLookup, {
    				nodeOrigin,
    				zIndexMode
    			});
    			updatedInternals = true;
    			if (dimensionChanged) {
    				changes.push({
    					id: node.id,
    					type: "dimensions",
    					dimensions
    				});
    				if (node.expandParent && node.parentId) parentExpandChildren.push({
    					id: node.id,
    					parentId: node.parentId,
    					rect: nodeToRect(newNode, nodeOrigin)
    				});
    			}
    		}
    	}
    	if (parentExpandChildren.length > 0) {
    		const parentExpandChanges = handleExpandParent(parentExpandChildren, nodeLookup, parentLookup, nodeOrigin);
    		changes.push(...parentExpandChanges);
    	}
    	return {
    		changes,
    		updatedInternals
    	};
    }
    async function panBy({ delta, panZoom, transform, translateExtent, width, height }) {
    	if (!panZoom || !delta.x && !delta.y) return false;
    	const nextViewport = await panZoom.setViewportConstrained({
    		x: transform[0] + delta.x,
    		y: transform[1] + delta.y,
    		zoom: transform[2]
    	}, [[0, 0], [width, height]], translateExtent);
    	return !!nextViewport && (nextViewport.x !== transform[0] || nextViewport.y !== transform[1] || nextViewport.k !== transform[2]);
    }
    /**
    * this function adds the connection to the connectionLookup
    * at the following keys: nodeId-type-handleId, nodeId-type and nodeId
    * @param type type of the connection
    * @param connection connection that should be added to the lookup
    * @param connectionKey at which key the connection should be added
    * @param connectionLookup reference to the connection lookup
    * @param nodeId nodeId of the connection
    * @param handleId handleId of the connection
    */
    function addConnectionToLookup(type, connection, connectionKey, connectionLookup, nodeId, handleId) {
    	let key = nodeId;
    	const nodeMap = connectionLookup.get(key) || /* @__PURE__ */ new Map();
    	connectionLookup.set(key, nodeMap.set(connectionKey, connection));
    	key = `${nodeId}-${type}`;
    	const typeMap = connectionLookup.get(key) || /* @__PURE__ */ new Map();
    	connectionLookup.set(key, typeMap.set(connectionKey, connection));
    	if (handleId) {
    		key = `${nodeId}-${type}-${handleId}`;
    		const handleMap = connectionLookup.get(key) || /* @__PURE__ */ new Map();
    		connectionLookup.set(key, handleMap.set(connectionKey, connection));
    	}
    }
    function updateConnectionLookup(connectionLookup, edgeLookup, edges) {
    	connectionLookup.clear();
    	edgeLookup.clear();
    	for (const edge of edges) {
    		const { source: sourceNode, target: targetNode, sourceHandle = null, targetHandle = null } = edge;
    		const connection = {
    			edgeId: edge.id,
    			source: sourceNode,
    			target: targetNode,
    			sourceHandle,
    			targetHandle
    		};
    		const sourceKey = `${sourceNode}-${sourceHandle}--${targetNode}-${targetHandle}`;
    		addConnectionToLookup("source", connection, `${targetNode}-${targetHandle}--${sourceNode}-${sourceHandle}`, connectionLookup, sourceNode, sourceHandle);
    		addConnectionToLookup("target", connection, sourceKey, connectionLookup, targetNode, targetHandle);
    		edgeLookup.set(edge.id, edge);
    	}
    }
    function isParentSelected(node, nodeLookup) {
    	if (!node.parentId) return false;
    	const parentNode = nodeLookup.get(node.parentId);
    	if (!parentNode) return false;
    	if (parentNode.selected) return true;
    	return isParentSelected(parentNode, nodeLookup);
    }
    function hasSelector(target, selector, domNode) {
    	let current = target;
    	do {
    		if (current?.matches?.(selector)) return true;
    		if (current === domNode) return false;
    		current = current?.parentElement;
    	} while (current);
    	return false;
    }
    function getDragItems(nodeLookup, nodesDraggable, mousePos, nodeId) {
    	const dragItems = /* @__PURE__ */ new Map();
    	for (const [id, node] of nodeLookup) if ((node.selected || node.id === nodeId) && (!node.parentId || !isParentSelected(node, nodeLookup)) && (node.draggable || nodesDraggable && typeof node.draggable === "undefined")) {
    		const internalNode = nodeLookup.get(id);
    		if (internalNode) dragItems.set(id, {
    			id,
    			position: internalNode.position || {
    				x: 0,
    				y: 0
    			},
    			distance: {
    				x: mousePos.x - internalNode.internals.positionAbsolute.x,
    				y: mousePos.y - internalNode.internals.positionAbsolute.y
    			},
    			extent: internalNode.extent,
    			parentId: internalNode.parentId,
    			origin: internalNode.origin,
    			expandParent: internalNode.expandParent,
    			internals: { positionAbsolute: internalNode.internals.positionAbsolute || {
    				x: 0,
    				y: 0
    			} },
    			measured: {
    				width: internalNode.measured.width ?? 0,
    				height: internalNode.measured.height ?? 0
    			}
    		});
    	}
    	return dragItems;
    }
    function getEventHandlerParams({ nodeId, dragItems, nodeLookup, dragging = true }) {
    	const nodesFromDragItems = [];
    	for (const [id, dragItem] of dragItems) {
    		const node = nodeLookup.get(id)?.internals.userNode;
    		if (node) nodesFromDragItems.push({
    			...node,
    			position: dragItem.position,
    			dragging
    		});
    	}
    	if (!nodeId) return [nodesFromDragItems[0], nodesFromDragItems];
    	const node = nodeLookup.get(nodeId)?.internals.userNode;
    	return [!node ? nodesFromDragItems[0] : {
    		...node,
    		position: dragItems.get(nodeId)?.position || node.position,
    		dragging
    	}, nodesFromDragItems];
    }
    /**
    * If a selection is being dragged we want to apply the same snap offset to all nodes in the selection.
    * This function calculates the snap offset based on the first node in the selection.
    */
    function calculateSnapOffset({ dragItems, snapGrid, x, y }) {
    	const refDragItem = dragItems.values().next().value;
    	if (!refDragItem) return null;
    	const refPos = {
    		x: x - refDragItem.distance.x,
    		y: y - refDragItem.distance.y
    	};
    	const refPosSnapped = snapPosition(refPos, snapGrid);
    	return {
    		x: refPosSnapped.x - refPos.x,
    		y: refPosSnapped.y - refPos.y
    	};
    }
    function XYDrag({ onNodeMouseDown, getStoreItems, onDragStart, onDrag, onDragStop }) {
    	let lastPos = {
    		x: null,
    		y: null
    	};
    	let autoPanId = 0;
    	let dragItems = /* @__PURE__ */ new Map();
    	let autoPanStarted = false;
    	let mousePosition = {
    		x: 0,
    		y: 0
    	};
    	let containerBounds = null;
    	let dragStarted = false;
    	let d3Selection = null;
    	let abortDrag = false;
    	let nodePositionsChanged = false;
    	let dragEvent = null;
    	function update({ noDragClassName, handleSelector, domNode, isSelectable, nodeId, nodeClickDistance = 0 }) {
    		d3Selection = select_default$1(domNode);
    		function updateNodes({ x, y }) {
    			const { nodeLookup, nodeExtent, snapGrid, snapToGrid, nodeOrigin, onNodeDrag, onSelectionDrag, onError, updateNodePositions } = getStoreItems();
    			lastPos = {
    				x,
    				y
    			};
    			let hasChange = false;
    			const isMultiDrag = dragItems.size > 1;
    			const nodesBox = isMultiDrag && nodeExtent ? rectToBox(getInternalNodesBounds(dragItems)) : null;
    			const multiDragSnapOffset = isMultiDrag && snapToGrid ? calculateSnapOffset({
    				dragItems,
    				snapGrid,
    				x,
    				y
    			}) : null;
    			for (const [id, dragItem] of dragItems) {
    				if (!nodeLookup.has(id)) continue;
    				let nextPosition = {
    					x: x - dragItem.distance.x,
    					y: y - dragItem.distance.y
    				};
    				if (snapToGrid) nextPosition = multiDragSnapOffset ? {
    					x: Math.round(nextPosition.x + multiDragSnapOffset.x),
    					y: Math.round(nextPosition.y + multiDragSnapOffset.y)
    				} : snapPosition(nextPosition, snapGrid);
    				let adjustedNodeExtent = null;
    				if (isMultiDrag && nodeExtent && !dragItem.extent && nodesBox) {
    					const { positionAbsolute } = dragItem.internals;
    					const x1 = positionAbsolute.x - nodesBox.x + nodeExtent[0][0];
    					const x2 = positionAbsolute.x + dragItem.measured.width - nodesBox.x2 + nodeExtent[1][0];
    					const y1 = positionAbsolute.y - nodesBox.y + nodeExtent[0][1];
    					const y2 = positionAbsolute.y + dragItem.measured.height - nodesBox.y2 + nodeExtent[1][1];
    					adjustedNodeExtent = [[x1, y1], [x2, y2]];
    				}
    				const { position, positionAbsolute } = calculateNodePosition({
    					nodeId: id,
    					nextPosition,
    					nodeLookup,
    					nodeExtent: adjustedNodeExtent ? adjustedNodeExtent : nodeExtent,
    					nodeOrigin,
    					onError
    				});
    				hasChange = hasChange || dragItem.position.x !== position.x || dragItem.position.y !== position.y;
    				dragItem.position = position;
    				dragItem.internals.positionAbsolute = positionAbsolute;
    			}
    			nodePositionsChanged = nodePositionsChanged || hasChange;
    			if (!hasChange) return;
    			updateNodePositions(dragItems, true);
    			if (dragEvent && (onDrag || onNodeDrag || !nodeId && onSelectionDrag)) {
    				const [currentNode, currentNodes] = getEventHandlerParams({
    					nodeId,
    					dragItems,
    					nodeLookup
    				});
    				onDrag?.(dragEvent, dragItems, currentNode, currentNodes);
    				onNodeDrag?.(dragEvent, currentNode, currentNodes);
    				if (!nodeId) onSelectionDrag?.(dragEvent, currentNodes);
    			}
    		}
    		async function autoPan() {
    			if (!containerBounds) return;
    			const { transform, panBy, autoPanSpeed, autoPanOnNodeDrag } = getStoreItems();
    			if (!autoPanOnNodeDrag) {
    				autoPanStarted = false;
    				cancelAnimationFrame(autoPanId);
    				return;
    			}
    			const [xMovement, yMovement] = calcAutoPan(mousePosition, containerBounds, autoPanSpeed);
    			if (xMovement !== 0 || yMovement !== 0) {
    				lastPos.x = (lastPos.x ?? 0) - xMovement / transform[2];
    				lastPos.y = (lastPos.y ?? 0) - yMovement / transform[2];
    				if (await panBy({
    					x: xMovement,
    					y: yMovement
    				})) updateNodes(lastPos);
    			}
    			autoPanId = requestAnimationFrame(autoPan);
    		}
    		function startDrag(event) {
    			const { nodeLookup, multiSelectionActive, nodesDraggable, transform, snapGrid, snapToGrid, selectNodesOnDrag, onNodeDragStart, onSelectionDragStart, unselectNodesAndEdges } = getStoreItems();
    			dragStarted = true;
    			if ((!selectNodesOnDrag || !isSelectable) && !multiSelectionActive && nodeId) {
    				if (!nodeLookup.get(nodeId)?.selected) unselectNodesAndEdges();
    			}
    			if (isSelectable && selectNodesOnDrag && nodeId) onNodeMouseDown?.(nodeId);
    			const pointerPos = getPointerPosition(event.sourceEvent, {
    				transform,
    				snapGrid,
    				snapToGrid,
    				containerBounds
    			});
    			lastPos = pointerPos;
    			dragItems = getDragItems(nodeLookup, nodesDraggable, pointerPos, nodeId);
    			if (dragItems.size > 0 && (onDragStart || onNodeDragStart || !nodeId && onSelectionDragStart)) {
    				const [currentNode, currentNodes] = getEventHandlerParams({
    					nodeId,
    					dragItems,
    					nodeLookup
    				});
    				onDragStart?.(event.sourceEvent, dragItems, currentNode, currentNodes);
    				onNodeDragStart?.(event.sourceEvent, currentNode, currentNodes);
    				if (!nodeId) onSelectionDragStart?.(event.sourceEvent, currentNodes);
    			}
    		}
    		const d3DragInstance = drag_default().clickDistance(nodeClickDistance).on("start", (event) => {
    			const { domNode, nodeDragThreshold, transform, snapGrid, snapToGrid } = getStoreItems();
    			containerBounds = domNode?.getBoundingClientRect() || null;
    			abortDrag = false;
    			nodePositionsChanged = false;
    			dragEvent = event.sourceEvent;
    			if (nodeDragThreshold === 0) startDrag(event);
    			lastPos = getPointerPosition(event.sourceEvent, {
    				transform,
    				snapGrid,
    				snapToGrid,
    				containerBounds
    			});
    			mousePosition = getEventPosition(event.sourceEvent, containerBounds);
    		}).on("drag", (event) => {
    			const { autoPanOnNodeDrag, transform, snapGrid, snapToGrid, nodeDragThreshold, nodeLookup } = getStoreItems();
    			const pointerPos = getPointerPosition(event.sourceEvent, {
    				transform,
    				snapGrid,
    				snapToGrid,
    				containerBounds
    			});
    			dragEvent = event.sourceEvent;
    			if (event.sourceEvent.type === "touchmove" && event.sourceEvent.touches.length > 1 || nodeId && !nodeLookup.has(nodeId)) abortDrag = true;
    			if (abortDrag) return;
    			if (!autoPanStarted && autoPanOnNodeDrag && dragStarted) {
    				autoPanStarted = true;
    				autoPan();
    			}
    			if (!dragStarted) {
    				const currentMousePosition = getEventPosition(event.sourceEvent, containerBounds);
    				const x = currentMousePosition.x - mousePosition.x;
    				const y = currentMousePosition.y - mousePosition.y;
    				if (Math.sqrt(x * x + y * y) > nodeDragThreshold) startDrag(event);
    			}
    			if ((lastPos.x !== pointerPos.xSnapped || lastPos.y !== pointerPos.ySnapped) && dragItems && dragStarted) {
    				mousePosition = getEventPosition(event.sourceEvent, containerBounds);
    				updateNodes(pointerPos);
    			}
    		}).on("end", (event) => {
    			if (!dragStarted || abortDrag) {
    				if (abortDrag && dragItems.size > 0) getStoreItems().updateNodePositions(dragItems, false);
    				return;
    			}
    			autoPanStarted = false;
    			dragStarted = false;
    			cancelAnimationFrame(autoPanId);
    			if (dragItems.size > 0) {
    				const { nodeLookup, updateNodePositions, onNodeDragStop, onSelectionDragStop } = getStoreItems();
    				if (nodePositionsChanged) {
    					updateNodePositions(dragItems, false);
    					nodePositionsChanged = false;
    				}
    				if (onDragStop || onNodeDragStop || !nodeId && onSelectionDragStop) {
    					const [currentNode, currentNodes] = getEventHandlerParams({
    						nodeId,
    						dragItems,
    						nodeLookup,
    						dragging: false
    					});
    					onDragStop?.(event.sourceEvent, dragItems, currentNode, currentNodes);
    					onNodeDragStop?.(event.sourceEvent, currentNode, currentNodes);
    					if (!nodeId) onSelectionDragStop?.(event.sourceEvent, currentNodes);
    				}
    			}
    		}).filter((event) => {
    			const target = event.target;
    			return !event.button && (!noDragClassName || !hasSelector(target, `.${noDragClassName}`, domNode)) && (!handleSelector || hasSelector(target, handleSelector, domNode));
    		});
    		d3Selection.call(d3DragInstance);
    	}
    	function destroy() {
    		d3Selection?.on(".drag", null);
    	}
    	return {
    		update,
    		destroy
    	};
    }
    function getNodesWithinDistance(position, nodeLookup, distance) {
    	const nodes = [];
    	const rect = {
    		x: position.x - distance,
    		y: position.y - distance,
    		width: distance * 2,
    		height: distance * 2
    	};
    	for (const node of nodeLookup.values()) if (getOverlappingArea(rect, nodeToRect(node)) > 0) nodes.push(node);
    	return nodes;
    }
    const ADDITIONAL_DISTANCE = 250;
    function getClosestHandle(position, connectionRadius, nodeLookup, fromHandle) {
    	let closestHandles = [];
    	let minDistance = Infinity;
    	const closeNodes = getNodesWithinDistance(position, nodeLookup, connectionRadius + ADDITIONAL_DISTANCE);
    	for (const node of closeNodes) {
    		const allHandles = [...node.internals.handleBounds?.source ?? [], ...node.internals.handleBounds?.target ?? []];
    		for (const handle of allHandles) {
    			if (fromHandle.nodeId === handle.nodeId && fromHandle.type === handle.type && fromHandle.id === handle.id) continue;
    			const { x, y } = getHandlePosition(node, handle, handle.position, true);
    			const distance = Math.sqrt(Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2));
    			if (distance > connectionRadius) continue;
    			if (distance < minDistance) {
    				closestHandles = [{
    					...handle,
    					x,
    					y
    				}];
    				minDistance = distance;
    			} else if (distance === minDistance) closestHandles.push({
    				...handle,
    				x,
    				y
    			});
    		}
    	}
    	if (!closestHandles.length) return null;
    	if (closestHandles.length > 1) {
    		const oppositeHandleType = fromHandle.type === "source" ? "target" : "source";
    		return closestHandles.find((handle) => handle.type === oppositeHandleType) ?? closestHandles[0];
    	}
    	return closestHandles[0];
    }
    function getHandle(nodeId, handleType, handleId, nodeLookup, connectionMode, withAbsolutePosition = false) {
    	const node = nodeLookup.get(nodeId);
    	if (!node) return null;
    	const handles = connectionMode === "strict" ? node.internals.handleBounds?.[handleType] : [...node.internals.handleBounds?.source ?? [], ...node.internals.handleBounds?.target ?? []];
    	const handle = (handleId ? handles?.find((h) => h.id === handleId) : handles?.[0]) ?? null;
    	return handle && withAbsolutePosition ? {
    		...handle,
    		...getHandlePosition(node, handle, handle.position, true)
    	} : handle;
    }
    function getHandleType(edgeUpdaterType, handleDomNode) {
    	if (edgeUpdaterType) return edgeUpdaterType;
    	else if (handleDomNode?.classList.contains("target")) return "target";
    	else if (handleDomNode?.classList.contains("source")) return "source";
    	return null;
    }
    function isConnectionValid(isInsideConnectionRadius, isHandleValid) {
    	let isValid = null;
    	if (isHandleValid) isValid = true;
    	else if (isInsideConnectionRadius && !isHandleValid) isValid = false;
    	return isValid;
    }
    const alwaysValid = () => true;
    function onPointerDown(event, { connectionMode, connectionRadius, handleId, nodeId, edgeUpdaterType, isTarget, domNode, nodeLookup, lib, autoPanOnConnect, flowId, panBy, cancelConnection, onConnectStart, onConnect, onConnectEnd, isValidConnection = alwaysValid, onReconnectEnd, updateConnection, getTransform, getFromHandle, autoPanSpeed, dragThreshold = 1, handleDomNode }) {
    	const doc = getHostForElement(event.target);
    	let autoPanId = 0;
    	let closestHandle;
    	const { x, y } = getEventPosition(event);
    	const handleType = getHandleType(edgeUpdaterType, handleDomNode);
    	const containerBounds = domNode?.getBoundingClientRect();
    	let connectionStarted = false;
    	if (!containerBounds || !handleType) return;
    	const fromHandleInternal = getHandle(nodeId, handleType, handleId, nodeLookup, connectionMode);
    	if (!fromHandleInternal) return;
    	let position = getEventPosition(event, containerBounds);
    	let autoPanStarted = false;
    	let connection = null;
    	let isValid = false;
    	let resultHandleDomNode = null;
    	function autoPan() {
    		if (!autoPanOnConnect || !containerBounds) return;
    		const [x, y] = calcAutoPan(position, containerBounds, autoPanSpeed);
    		panBy({
    			x,
    			y
    		});
    		autoPanId = requestAnimationFrame(autoPan);
    	}
    	const fromHandle = {
    		...fromHandleInternal,
    		nodeId,
    		type: handleType,
    		position: fromHandleInternal.position
    	};
    	const fromInternalNode = nodeLookup.get(nodeId);
    	let previousConnection = {
    		inProgress: true,
    		isValid: null,
    		from: getHandlePosition(fromInternalNode, fromHandle, Position.Left, true),
    		fromHandle,
    		fromPosition: fromHandle.position,
    		fromNode: fromInternalNode,
    		to: position,
    		toHandle: null,
    		toPosition: oppositePosition[fromHandle.position],
    		toNode: null,
    		pointer: position
    	};
    	function startConnection() {
    		connectionStarted = true;
    		updateConnection(previousConnection);
    		onConnectStart?.(event, {
    			nodeId,
    			handleId,
    			handleType
    		});
    	}
    	if (dragThreshold === 0) startConnection();
    	function onPointerMove(event) {
    		if (!connectionStarted) {
    			const { x: evtX, y: evtY } = getEventPosition(event);
    			const dx = evtX - x;
    			const dy = evtY - y;
    			if (!(dx * dx + dy * dy > dragThreshold * dragThreshold)) return;
    			startConnection();
    		}
    		if (!getFromHandle() || !fromHandle) {
    			onPointerUp(event);
    			return;
    		}
    		const transform = getTransform();
    		position = getEventPosition(event, containerBounds);
    		closestHandle = getClosestHandle(pointToRendererPoint(position, transform, false, [1, 1]), connectionRadius, nodeLookup, fromHandle);
    		if (!autoPanStarted) {
    			autoPan();
    			autoPanStarted = true;
    		}
    		const result = isValidHandle(event, {
    			handle: closestHandle,
    			connectionMode,
    			fromNodeId: nodeId,
    			fromHandleId: handleId,
    			fromType: isTarget ? "target" : "source",
    			isValidConnection,
    			doc,
    			lib,
    			flowId,
    			nodeLookup
    		});
    		resultHandleDomNode = result.handleDomNode;
    		connection = result.connection;
    		isValid = isConnectionValid(!!closestHandle, result.isValid);
    		const fromInternalNode = nodeLookup.get(nodeId);
    		const from = fromInternalNode ? getHandlePosition(fromInternalNode, fromHandle, Position.Left, true) : previousConnection.from;
    		const newConnection = {
    			...previousConnection,
    			from,
    			isValid,
    			to: result.toHandle && isValid ? rendererPointToPoint({
    				x: result.toHandle.x,
    				y: result.toHandle.y
    			}, transform) : position,
    			toHandle: result.toHandle,
    			toPosition: isValid && result.toHandle ? result.toHandle.position : oppositePosition[fromHandle.position],
    			toNode: result.toHandle ? nodeLookup.get(result.toHandle.nodeId) : null,
    			pointer: position
    		};
    		updateConnection(newConnection);
    		previousConnection = newConnection;
    	}
    	function onPointerUp(event) {
    		if ("touches" in event && event.touches.length > 0) return;
    		if (connectionStarted) {
    			if ((closestHandle || resultHandleDomNode) && connection && isValid) onConnect?.(connection);
    			const { inProgress, ...connectionState } = previousConnection;
    			const finalConnectionState = {
    				...connectionState,
    				toPosition: previousConnection.toHandle ? previousConnection.toPosition : null
    			};
    			onConnectEnd?.(event, finalConnectionState);
    			if (edgeUpdaterType) onReconnectEnd?.(event, finalConnectionState);
    		}
    		cancelConnection();
    		cancelAnimationFrame(autoPanId);
    		autoPanStarted = false;
    		isValid = false;
    		connection = null;
    		resultHandleDomNode = null;
    		doc.removeEventListener("mousemove", onPointerMove);
    		doc.removeEventListener("mouseup", onPointerUp);
    		doc.removeEventListener("touchmove", onPointerMove);
    		doc.removeEventListener("touchend", onPointerUp);
    	}
    	doc.addEventListener("mousemove", onPointerMove);
    	doc.addEventListener("mouseup", onPointerUp);
    	doc.addEventListener("touchmove", onPointerMove);
    	doc.addEventListener("touchend", onPointerUp);
    }
    function isValidHandle(event, { handle, connectionMode, fromNodeId, fromHandleId, fromType, doc, lib, flowId, isValidConnection = alwaysValid, nodeLookup }) {
    	const isTarget = fromType === "target";
    	const handleDomNode = handle ? doc.querySelector(`.${lib}-flow__handle[data-id="${flowId}-${handle?.nodeId}-${handle?.id}-${handle?.type}"]`) : null;
    	const { x, y } = getEventPosition(event);
    	const handleBelow = doc.elementFromPoint(x, y);
    	const handleToCheck = handleBelow?.classList.contains(`${lib}-flow__handle`) ? handleBelow : handleDomNode;
    	const result = {
    		handleDomNode: handleToCheck,
    		isValid: false,
    		connection: null,
    		toHandle: null
    	};
    	if (handleToCheck) {
    		const handleType = getHandleType(void 0, handleToCheck);
    		const handleNodeId = handleToCheck.getAttribute("data-nodeid");
    		const handleId = handleToCheck.getAttribute("data-handleid");
    		const connectable = handleToCheck.classList.contains("connectable");
    		const connectableEnd = handleToCheck.classList.contains("connectableend");
    		if (!handleNodeId || !handleType) return result;
    		const connection = {
    			source: isTarget ? handleNodeId : fromNodeId,
    			sourceHandle: isTarget ? handleId : fromHandleId,
    			target: isTarget ? fromNodeId : handleNodeId,
    			targetHandle: isTarget ? fromHandleId : handleId
    		};
    		result.connection = connection;
    		result.isValid = connectable && connectableEnd && (connectionMode === ConnectionMode.Strict ? isTarget && handleType === "source" || !isTarget && handleType === "target" : handleNodeId !== fromNodeId || handleId !== fromHandleId) && isValidConnection(connection);
    		result.toHandle = getHandle(handleNodeId, handleType, handleId, nodeLookup, connectionMode, true);
    	}
    	return result;
    }
    const XYHandle = {
    	onPointerDown,
    	isValid: isValidHandle
    };
    function XYMinimap({ domNode, panZoom, getTransform, getViewScale }) {
    	const selection = select_default$1(domNode);
    	function update({ translateExtent, width, height, zoomStep = 1, pannable = true, zoomable = true, inversePan = false }) {
    		const zoomHandler = (event) => {
    			if (event.sourceEvent.type !== "wheel" || !panZoom) return;
    			const transform = getTransform();
    			const factor = event.sourceEvent.ctrlKey && isMacOs() ? 10 : 1;
    			const pinchDelta = -event.sourceEvent.deltaY * (event.sourceEvent.deltaMode === 1 ? .05 : event.sourceEvent.deltaMode ? 1 : .002) * zoomStep;
    			const nextZoom = transform[2] * Math.pow(2, pinchDelta * factor);
    			panZoom.scaleTo(nextZoom);
    		};
    		let panStart = [0, 0];
    		const panStartHandler = (event) => {
    			if (event.sourceEvent.type === "mousedown" || event.sourceEvent.type === "touchstart") panStart = [event.sourceEvent.clientX ?? event.sourceEvent.touches[0].clientX, event.sourceEvent.clientY ?? event.sourceEvent.touches[0].clientY];
    		};
    		const panHandler = (event) => {
    			const transform = getTransform();
    			if (event.sourceEvent.type !== "mousemove" && event.sourceEvent.type !== "touchmove" || !panZoom) return;
    			const panCurrent = [event.sourceEvent.clientX ?? event.sourceEvent.touches[0].clientX, event.sourceEvent.clientY ?? event.sourceEvent.touches[0].clientY];
    			const panDelta = [panCurrent[0] - panStart[0], panCurrent[1] - panStart[1]];
    			panStart = panCurrent;
    			const moveScale = getViewScale() * Math.max(transform[2], Math.log(transform[2])) * (inversePan ? -1 : 1);
    			const position = {
    				x: transform[0] - panDelta[0] * moveScale,
    				y: transform[1] - panDelta[1] * moveScale
    			};
    			const extent = [[0, 0], [width, height]];
    			panZoom.setViewportConstrained({
    				x: position.x,
    				y: position.y,
    				zoom: transform[2]
    			}, extent, translateExtent);
    		};
    		const zoomAndPanHandler = zoom_default().on("start", panStartHandler).on("zoom", pannable ? panHandler : null).on("zoom.wheel", zoomable ? zoomHandler : null);
    		selection.call(zoomAndPanHandler, {});
    	}
    	function destroy() {
    		selection.on("zoom", null);
    	}
    	return {
    		update,
    		destroy,
    		pointer: pointer_default
    	};
    }
    const transformToViewport = (transform) => ({
    	x: transform.x,
    	y: transform.y,
    	zoom: transform.k
    });
    const viewportToTransform = ({ x, y, zoom }) => identity.translate(x, y).scale(zoom);
    const isWrappedWithClass = (event, className) => event.target.closest(`.${className}`);
    const isRightClickPan = (panOnDrag, usedButton) => usedButton === 2 && Array.isArray(panOnDrag) && panOnDrag.includes(2);
    const defaultEase = (t) => ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
    const getD3Transition = (selection, duration = 0, ease = defaultEase, onEnd = () => {}) => {
    	const hasDuration = typeof duration === "number" && duration > 0;
    	if (!hasDuration) onEnd();
    	return hasDuration ? selection.transition().duration(duration).ease(ease).on("end", onEnd) : selection;
    };
    const wheelDelta = (event) => {
    	const factor = event.ctrlKey && isMacOs() ? 10 : 1;
    	return -event.deltaY * (event.deltaMode === 1 ? .05 : event.deltaMode ? 1 : .002) * factor;
    };
    function createPanOnScrollHandler({ zoomPanValues, noWheelClassName, d3Selection, d3Zoom, panOnScrollMode, panOnScrollSpeed, zoomOnPinch, onPanZoomStart, onPanZoom, onPanZoomEnd }) {
    	return (event) => {
    		if (isWrappedWithClass(event, noWheelClassName)) {
    			if (event.ctrlKey) event.preventDefault();
    			return false;
    		}
    		event.preventDefault();
    		event.stopImmediatePropagation();
    		const currentZoom = d3Selection.property("__zoom").k || 1;
    		if (event.ctrlKey && zoomOnPinch) {
    			const point = pointer_default(event);
    			const pinchDelta = wheelDelta(event);
    			const zoom = currentZoom * Math.pow(2, pinchDelta);
    			d3Zoom.scaleTo(d3Selection, zoom, point, event);
    			return;
    		}
    		const deltaNormalize = event.deltaMode === 1 ? 20 : 1;
    		let deltaX = panOnScrollMode === PanOnScrollMode.Vertical ? 0 : event.deltaX * deltaNormalize;
    		let deltaY = panOnScrollMode === PanOnScrollMode.Horizontal ? 0 : event.deltaY * deltaNormalize;
    		if (!isMacOs() && event.shiftKey && panOnScrollMode !== PanOnScrollMode.Vertical) {
    			deltaX = event.deltaY * deltaNormalize;
    			deltaY = 0;
    		}
    		d3Zoom.translateBy(d3Selection, -(deltaX / currentZoom) * panOnScrollSpeed, -(deltaY / currentZoom) * panOnScrollSpeed, { internal: true });
    		const nextViewport = transformToViewport(d3Selection.property("__zoom"));
    		clearTimeout(zoomPanValues.panScrollTimeout);
    		if (!zoomPanValues.isPanScrolling) {
    			zoomPanValues.isPanScrolling = true;
    			onPanZoomStart?.(event, nextViewport);
    		} else onPanZoom?.(event, nextViewport);
    		zoomPanValues.panScrollTimeout = setTimeout(() => {
    			onPanZoomEnd?.(event, nextViewport);
    			zoomPanValues.isPanScrolling = false;
    		}, 150);
    	};
    }
    function createZoomOnScrollHandler({ noWheelClassName, preventScrolling, d3ZoomHandler }) {
    	return function(event, d) {
    		const isWheel = event.type === "wheel";
    		const preventZoom = !preventScrolling && isWheel && !event.ctrlKey;
    		const hasNoWheelClass = isWrappedWithClass(event, noWheelClassName);
    		if (event.ctrlKey && isWheel && hasNoWheelClass) event.preventDefault();
    		if (preventZoom || hasNoWheelClass) return null;
    		event.preventDefault();
    		d3ZoomHandler.call(this, event, d);
    	};
    }
    function createPanZoomStartHandler({ zoomPanValues, onDraggingChange, onPanZoomStart }) {
    	return (event) => {
    		if (event.sourceEvent?.internal) return;
    		const viewport = transformToViewport(event.transform);
    		zoomPanValues.mouseButton = event.sourceEvent?.button || 0;
    		zoomPanValues.isZoomingOrPanning = true;
    		zoomPanValues.prevViewport = viewport;
    		if (event.sourceEvent?.type === "mousedown") onDraggingChange(true);
    		if (onPanZoomStart) onPanZoomStart?.(event.sourceEvent, viewport);
    	};
    }
    function createPanZoomHandler({ zoomPanValues, panOnDrag, onPaneContextMenu, onTransformChange, onPanZoom }) {
    	return (event) => {
    		zoomPanValues.usedRightMouseButton = !!(onPaneContextMenu && isRightClickPan(panOnDrag, zoomPanValues.mouseButton ?? 0));
    		if (!event.sourceEvent?.sync) onTransformChange([
    			event.transform.x,
    			event.transform.y,
    			event.transform.k
    		]);
    		if (onPanZoom && !event.sourceEvent?.internal) onPanZoom?.(event.sourceEvent, transformToViewport(event.transform));
    	};
    }
    function createPanZoomEndHandler({ zoomPanValues, panOnDrag, panOnScroll, onDraggingChange, onPanZoomEnd, onPaneContextMenu }) {
    	return (event) => {
    		if (event.sourceEvent?.internal) return;
    		zoomPanValues.isZoomingOrPanning = false;
    		if (onPaneContextMenu && isRightClickPan(panOnDrag, zoomPanValues.mouseButton ?? 0) && !zoomPanValues.usedRightMouseButton && event.sourceEvent) onPaneContextMenu(event.sourceEvent);
    		zoomPanValues.usedRightMouseButton = false;
    		onDraggingChange(false);
    		if (onPanZoomEnd) {
    			const viewport = transformToViewport(event.transform);
    			zoomPanValues.prevViewport = viewport;
    			clearTimeout(zoomPanValues.timerId);
    			zoomPanValues.timerId = setTimeout(() => {
    				onPanZoomEnd?.(event.sourceEvent, viewport);
    			}, panOnScroll ? 150 : 0);
    		}
    	};
    }
    function createFilter({ panActivationKeyPressed, zoomActivationKeyPressed, zoomOnScroll, zoomOnPinch, panOnDrag, panOnScroll, zoomOnDoubleClick, userSelectionActive, noWheelClassName, noPanClassName, lib, connectionInProgress }) {
    	return (event) => {
    		const zoomScroll = zoomActivationKeyPressed || zoomOnScroll;
    		const pinchZoom = zoomOnPinch && event.ctrlKey;
    		const isWheelEvent = event.type === "wheel";
    		if (event.button === 1 && event.type === "mousedown" && (isWrappedWithClass(event, `${lib}-flow__node`) || isWrappedWithClass(event, `${lib}-flow__edge`) || isWrappedWithClass(event, `${lib}-flow__selection`) || isWrappedWithClass(event, `${lib}-flow__nodesselection`))) return true;
    		if (!panOnDrag && !zoomScroll && !panOnScroll && !zoomOnDoubleClick && !zoomOnPinch) return false;
    		if (userSelectionActive) return false;
    		if (connectionInProgress && !isWheelEvent) return false;
    		if (isWrappedWithClass(event, noWheelClassName) && isWheelEvent) return false;
    		if (isWrappedWithClass(event, noPanClassName) && (!isWheelEvent || panOnScroll && isWheelEvent && !zoomActivationKeyPressed)) return false;
    		if (!zoomOnPinch && event.ctrlKey && isWheelEvent) return false;
    		if (!zoomOnPinch && event.type === "touchstart" && event.touches?.length > 1) {
    			event.preventDefault();
    			return false;
    		}
    		if (!zoomScroll && !panOnScroll && !pinchZoom && isWheelEvent) return false;
    		if (!panOnDrag && (event.type === "mousedown" || event.type === "touchstart")) return false;
    		if (Array.isArray(panOnDrag) && !panOnDrag.includes(event.button) && event.type === "mousedown") return false;
    		const buttonAllowed = Array.isArray(panOnDrag) && panOnDrag.includes(event.button) || !event.button || event.button <= 1;
    		return (!event.ctrlKey || isWheelEvent || panActivationKeyPressed) && buttonAllowed;
    	};
    }
    function XYPanZoom({ domNode, minZoom, maxZoom, translateExtent, viewport, onPanZoom, onPanZoomStart, onPanZoomEnd, onDraggingChange }) {
    	const zoomPanValues = {
    		isZoomingOrPanning: false,
    		usedRightMouseButton: false,
    		prevViewport: {},
    		mouseButton: 0,
    		timerId: void 0,
    		panScrollTimeout: void 0,
    		isPanScrolling: false
    	};
    	const bbox = domNode.getBoundingClientRect();
    	let cachedExtent = [[0, 0], [bbox.width, bbox.height]];
    	(typeof ResizeObserver !== "undefined" ? new ResizeObserver((entries) => {
    		const entry = entries[0];
    		if (entry) cachedExtent = [[0, 0], [entry.contentRect.width, entry.contentRect.height]];
    	}) : null)?.observe(domNode);
    	const d3ZoomInstance = zoom_default().extent(() => cachedExtent).scaleExtent([minZoom, maxZoom]).translateExtent(translateExtent);
    	const d3Selection = select_default$1(domNode).call(d3ZoomInstance);
    	setViewportConstrained({
    		x: viewport.x,
    		y: viewport.y,
    		zoom: clamp(viewport.zoom, minZoom, maxZoom)
    	}, [[0, 0], [bbox.width, bbox.height]], translateExtent);
    	const d3ZoomHandler = d3Selection.on("wheel.zoom");
    	const d3DblClickZoomHandler = d3Selection.on("dblclick.zoom");
    	d3ZoomInstance.wheelDelta(wheelDelta);
    	async function setTransform(transform, options) {
    		if (d3Selection) return new Promise((resolve) => {
    			d3ZoomInstance?.interpolate(options?.interpolate === "linear" ? value_default : zoom_default$1).transform(getD3Transition(d3Selection, options?.duration, options?.ease, () => resolve(true)), transform);
    		});
    		return false;
    	}
    	function update({ noWheelClassName, noPanClassName, onPaneContextMenu, userSelectionActive, panOnScroll, panOnDrag, panOnScrollMode, panOnScrollSpeed, preventScrolling, zoomOnPinch, zoomOnScroll, zoomOnDoubleClick, panActivationKeyPressed = false, zoomActivationKeyPressed, lib, onTransformChange, connectionInProgress, paneClickDistance, selectionOnDrag }) {
    		if (userSelectionActive && !zoomPanValues.isZoomingOrPanning) destroy();
    		const isPanOnScroll = panOnScroll && !zoomActivationKeyPressed && !userSelectionActive;
    		d3ZoomInstance.clickDistance(selectionOnDrag ? Infinity : !isNumeric(paneClickDistance) || paneClickDistance < 0 ? 0 : paneClickDistance);
    		const wheelHandler = isPanOnScroll ? createPanOnScrollHandler({
    			zoomPanValues,
    			noWheelClassName,
    			d3Selection,
    			d3Zoom: d3ZoomInstance,
    			panOnScrollMode,
    			panOnScrollSpeed,
    			zoomOnPinch,
    			onPanZoomStart,
    			onPanZoom,
    			onPanZoomEnd
    		}) : createZoomOnScrollHandler({
    			noWheelClassName,
    			preventScrolling,
    			d3ZoomHandler
    		});
    		d3Selection.on("wheel.zoom", wheelHandler, { passive: false });
    		const startHandler = createPanZoomStartHandler({
    			zoomPanValues,
    			onDraggingChange,
    			onPanZoomStart
    		});
    		d3ZoomInstance.on("start", startHandler);
    		const panZoomHandler = createPanZoomHandler({
    			zoomPanValues,
    			panOnDrag,
    			onPaneContextMenu: !!onPaneContextMenu,
    			onPanZoom,
    			onTransformChange
    		});
    		d3ZoomInstance.on("zoom", panZoomHandler);
    		const panZoomEndHandler = createPanZoomEndHandler({
    			zoomPanValues,
    			panOnDrag,
    			panOnScroll,
    			onPaneContextMenu,
    			onPanZoomEnd,
    			onDraggingChange
    		});
    		d3ZoomInstance.on("end", panZoomEndHandler);
    		const filter = createFilter({
    			panActivationKeyPressed,
    			zoomActivationKeyPressed,
    			panOnDrag,
    			zoomOnScroll,
    			panOnScroll,
    			zoomOnDoubleClick,
    			zoomOnPinch,
    			userSelectionActive,
    			noPanClassName,
    			noWheelClassName,
    			lib,
    			connectionInProgress
    		});
    		d3ZoomInstance.filter(filter);
    		if (zoomOnDoubleClick) d3Selection.on("dblclick.zoom", d3DblClickZoomHandler);
    		else d3Selection.on("dblclick.zoom", null);
    	}
    	function destroy() {
    		d3ZoomInstance.on("zoom", null);
    	}
    	async function setViewportConstrained(viewport, extent, translateExtent) {
    		const nextTransform = viewportToTransform(viewport);
    		const contrainedTransform = d3ZoomInstance?.constrain()(nextTransform, extent, translateExtent);
    		if (contrainedTransform) await setTransform(contrainedTransform);
    		return contrainedTransform;
    	}
    	async function setViewport(viewport, options) {
    		const nextTransform = viewportToTransform(viewport);
    		await setTransform(nextTransform, options);
    		return nextTransform;
    	}
    	function syncViewport(viewport) {
    		if (d3Selection) {
    			const nextTransform = viewportToTransform(viewport);
    			const currentTransform = d3Selection.property("__zoom");
    			if (currentTransform.k !== viewport.zoom || currentTransform.x !== viewport.x || currentTransform.y !== viewport.y) d3ZoomInstance?.transform(d3Selection, nextTransform, null, { sync: true });
    		}
    	}
    	function getViewport() {
    		const transform$1 = d3Selection ? transform(d3Selection.node()) : {
    			x: 0,
    			y: 0,
    			k: 1
    		};
    		return {
    			x: transform$1.x,
    			y: transform$1.y,
    			zoom: transform$1.k
    		};
    	}
    	async function scaleTo(zoom, options) {
    		if (d3Selection) return new Promise((resolve) => {
    			d3ZoomInstance?.interpolate(options?.interpolate === "linear" ? value_default : zoom_default$1).scaleTo(getD3Transition(d3Selection, options?.duration, options?.ease, () => resolve(true)), zoom);
    		});
    		return false;
    	}
    	async function scaleBy(factor, options) {
    		if (d3Selection) return new Promise((resolve) => {
    			d3ZoomInstance?.interpolate(options?.interpolate === "linear" ? value_default : zoom_default$1).scaleBy(getD3Transition(d3Selection, options?.duration, options?.ease, () => resolve(true)), factor);
    		});
    		return false;
    	}
    	function setScaleExtent(scaleExtent) {
    		d3ZoomInstance?.scaleExtent(scaleExtent);
    	}
    	function setTranslateExtent(translateExtent) {
    		d3ZoomInstance?.translateExtent(translateExtent);
    	}
    	function setClickDistance(distance) {
    		const validDistance = !isNumeric(distance) || distance < 0 ? 0 : distance;
    		d3ZoomInstance?.clickDistance(validDistance);
    	}
    	return {
    		update,
    		destroy,
    		setViewport,
    		setViewportConstrained,
    		getViewport,
    		scaleTo,
    		scaleBy,
    		setScaleExtent,
    		setTranslateExtent,
    		syncViewport,
    		setClickDistance
    	};
    }
    /**
    * Used to determine the variant of the resize control
    *
    * @public
    */
    var ResizeControlVariant;
    (function(ResizeControlVariant) {
    	ResizeControlVariant["Line"] = "line";
    	ResizeControlVariant["Handle"] = "handle";
    })(ResizeControlVariant || (ResizeControlVariant = {}));
    /**
    * Get all connecting edges for a given set of nodes
    * @param width - new width of the node
    * @param prevWidth - previous width of the node
    * @param height - new height of the node
    * @param prevHeight - previous height of the node
    * @param affectsX - whether to invert the resize direction for the x axis
    * @param affectsY - whether to invert the resize direction for the y axis
    * @returns array of two numbers representing the direction of the resize for each axis, 0 = no change, 1 = increase, -1 = decrease
    */
    function getResizeDirection({ width, prevWidth, height, prevHeight, affectsX, affectsY }) {
    	const deltaWidth = width - prevWidth;
    	const deltaHeight = height - prevHeight;
    	const direction = [deltaWidth > 0 ? 1 : deltaWidth < 0 ? -1 : 0, deltaHeight > 0 ? 1 : deltaHeight < 0 ? -1 : 0];
    	if (deltaWidth && affectsX) direction[0] = direction[0] * -1;
    	if (deltaHeight && affectsY) direction[1] = direction[1] * -1;
    	return direction;
    }
    /**
    * Parses the control position that is being dragged to dimensions that are being resized
    * @param controlPosition - position of the control that is being dragged
    * @returns isHorizontal, isVertical, affectsX, affectsY,
    */
    function getControlDirection(controlPosition) {
    	return {
    		isHorizontal: controlPosition.includes("right") || controlPosition.includes("left"),
    		isVertical: controlPosition.includes("bottom") || controlPosition.includes("top"),
    		affectsX: controlPosition.includes("left"),
    		affectsY: controlPosition.includes("top")
    	};
    }
    function getLowerExtentClamp(lowerExtent, lowerBound) {
    	return Math.max(0, lowerBound - lowerExtent);
    }
    function getUpperExtentClamp(upperExtent, upperBound) {
    	return Math.max(0, upperExtent - upperBound);
    }
    function getSizeClamp(size, minSize, maxSize) {
    	return Math.max(0, minSize - size, size - maxSize);
    }
    function xor(a, b) {
    	return a ? !b : b;
    }
    /**
    * Calculates new width & height and x & y of node after resize based on pointer position
    * @description - Buckle up, this is a chunky one... If you want to determine the new dimensions of a node after a resize,
    * you have to account for all possible restrictions: min/max width/height of the node, the maximum extent the node is allowed
    * to move in (in this case: resize into) determined by the parent node, the minimal extent determined by child nodes
    * with expandParent or extent: 'parent' set and oh yeah, these things also have to work with keepAspectRatio!
    * The way this is done is by determining how much each of these restricting actually restricts the resize and then applying the
    * strongest restriction. Because the resize affects x, y and width, height and width, height of a opposing side with keepAspectRatio,
    * the resize amount is always kept in distX & distY amount (the distance in mouse movement)
    * Instead of clamping each value, we first calculate the biggest 'clamp' (for the lack of a better name) and then apply it to all values.
    * To complicate things nodeOrigin has to be taken into account as well. This is done by offsetting the nodes as if their origin is [0, 0],
    * then calculating the restrictions as usual
    * @param startValues - starting values of resize
    * @param controlDirection - dimensions affected by the resize
    * @param pointerPosition - the current pointer position corrected for snapping
    * @param boundaries - minimum and maximum dimensions of the node
    * @param keepAspectRatio - prevent changes of asprect ratio
    * @returns x, y, width and height of the node after resize
    */
    function getDimensionsAfterResize(startValues, controlDirection, pointerPosition, boundaries, keepAspectRatio, nodeOrigin, extent, childExtent) {
    	let { affectsX, affectsY } = controlDirection;
    	const { isHorizontal, isVertical } = controlDirection;
    	const isDiagonal = isHorizontal && isVertical;
    	const { xSnapped, ySnapped } = pointerPosition;
    	const { minWidth, maxWidth, minHeight, maxHeight } = boundaries;
    	const { x: startX, y: startY, width: startWidth, height: startHeight, aspectRatio } = startValues;
    	let distX = Math.floor(isHorizontal ? xSnapped - startValues.pointerX : 0);
    	let distY = Math.floor(isVertical ? ySnapped - startValues.pointerY : 0);
    	const newWidth = startWidth + (affectsX ? -distX : distX);
    	const newHeight = startHeight + (affectsY ? -distY : distY);
    	const originOffsetX = -nodeOrigin[0] * startWidth;
    	const originOffsetY = -nodeOrigin[1] * startHeight;
    	let clampX = getSizeClamp(newWidth, minWidth, maxWidth);
    	let clampY = getSizeClamp(newHeight, minHeight, maxHeight);
    	if (extent) {
    		let xExtentClamp = 0;
    		let yExtentClamp = 0;
    		if (affectsX && distX < 0) xExtentClamp = getLowerExtentClamp(startX + distX + originOffsetX, extent[0][0]);
    		else if (!affectsX && distX > 0) xExtentClamp = getUpperExtentClamp(startX + newWidth + originOffsetX, extent[1][0]);
    		if (affectsY && distY < 0) yExtentClamp = getLowerExtentClamp(startY + distY + originOffsetY, extent[0][1]);
    		else if (!affectsY && distY > 0) yExtentClamp = getUpperExtentClamp(startY + newHeight + originOffsetY, extent[1][1]);
    		clampX = Math.max(clampX, xExtentClamp);
    		clampY = Math.max(clampY, yExtentClamp);
    	}
    	if (childExtent) {
    		let xExtentClamp = 0;
    		let yExtentClamp = 0;
    		if (affectsX && distX > 0) xExtentClamp = getUpperExtentClamp(startX + distX, childExtent[0][0]);
    		else if (!affectsX && distX < 0) xExtentClamp = getLowerExtentClamp(startX + newWidth, childExtent[1][0]);
    		if (affectsY && distY > 0) yExtentClamp = getUpperExtentClamp(startY + distY, childExtent[0][1]);
    		else if (!affectsY && distY < 0) yExtentClamp = getLowerExtentClamp(startY + newHeight, childExtent[1][1]);
    		clampX = Math.max(clampX, xExtentClamp);
    		clampY = Math.max(clampY, yExtentClamp);
    	}
    	if (keepAspectRatio) {
    		if (isHorizontal) {
    			const aspectHeightClamp = getSizeClamp(newWidth / aspectRatio, minHeight, maxHeight) * aspectRatio;
    			clampX = Math.max(clampX, aspectHeightClamp);
    			if (extent) {
    				let aspectExtentClamp = 0;
    				if (!affectsX && !affectsY || affectsX && !affectsY && isDiagonal) aspectExtentClamp = getUpperExtentClamp(startY + originOffsetY + newWidth / aspectRatio, extent[1][1]) * aspectRatio;
    				else aspectExtentClamp = getLowerExtentClamp(startY + originOffsetY + (affectsX ? distX : -distX) / aspectRatio, extent[0][1]) * aspectRatio;
    				clampX = Math.max(clampX, aspectExtentClamp);
    			}
    			if (childExtent) {
    				let aspectExtentClamp = 0;
    				if (!affectsX && !affectsY || affectsX && !affectsY && isDiagonal) aspectExtentClamp = getLowerExtentClamp(startY + newWidth / aspectRatio, childExtent[1][1]) * aspectRatio;
    				else aspectExtentClamp = getUpperExtentClamp(startY + (affectsX ? distX : -distX) / aspectRatio, childExtent[0][1]) * aspectRatio;
    				clampX = Math.max(clampX, aspectExtentClamp);
    			}
    		}
    		if (isVertical) {
    			const aspectWidthClamp = getSizeClamp(newHeight * aspectRatio, minWidth, maxWidth) / aspectRatio;
    			clampY = Math.max(clampY, aspectWidthClamp);
    			if (extent) {
    				let aspectExtentClamp = 0;
    				if (!affectsX && !affectsY || affectsY && !affectsX && isDiagonal) aspectExtentClamp = getUpperExtentClamp(startX + newHeight * aspectRatio + originOffsetX, extent[1][0]) / aspectRatio;
    				else aspectExtentClamp = getLowerExtentClamp(startX + (affectsY ? distY : -distY) * aspectRatio + originOffsetX, extent[0][0]) / aspectRatio;
    				clampY = Math.max(clampY, aspectExtentClamp);
    			}
    			if (childExtent) {
    				let aspectExtentClamp = 0;
    				if (!affectsX && !affectsY || affectsY && !affectsX && isDiagonal) aspectExtentClamp = getLowerExtentClamp(startX + newHeight * aspectRatio, childExtent[1][0]) / aspectRatio;
    				else aspectExtentClamp = getUpperExtentClamp(startX + (affectsY ? distY : -distY) * aspectRatio, childExtent[0][0]) / aspectRatio;
    				clampY = Math.max(clampY, aspectExtentClamp);
    			}
    		}
    	}
    	distY = distY + (distY < 0 ? clampY : -clampY);
    	distX = distX + (distX < 0 ? clampX : -clampX);
    	if (keepAspectRatio) {
    		if (isDiagonal) {
    			if (newWidth > newHeight * aspectRatio) distY = (xor(affectsX, affectsY) ? -distX : distX) / aspectRatio;
    			else distX = (xor(affectsX, affectsY) ? -distY : distY) * aspectRatio;
    		} else if (isHorizontal) {
    			distY = distX / aspectRatio;
    			affectsY = affectsX;
    		} else {
    			distX = distY * aspectRatio;
    			affectsX = affectsY;
    		}
    	}
    	const x = affectsX ? startX + distX : startX;
    	const y = affectsY ? startY + distY : startY;
    	return {
    		width: startWidth + (affectsX ? -distX : distX),
    		height: startHeight + (affectsY ? -distY : distY),
    		x: nodeOrigin[0] * distX * (!affectsX ? 1 : -1) + x,
    		y: nodeOrigin[1] * distY * (!affectsY ? 1 : -1) + y
    	};
    }
    const initPrevValues$1 = {
    	width: 0,
    	height: 0,
    	x: 0,
    	y: 0
    };
    const initStartValues = {
    	...initPrevValues$1,
    	pointerX: 0,
    	pointerY: 0,
    	aspectRatio: 1
    };
    function nodeToChildExtent(child, parent, nodeOrigin) {
    	const x = parent.position.x + child.position.x;
    	const y = parent.position.y + child.position.y;
    	const width = child.measured.width ?? 0;
    	const height = child.measured.height ?? 0;
    	const originOffsetX = nodeOrigin[0] * width;
    	const originOffsetY = nodeOrigin[1] * height;
    	return [[x - originOffsetX, y - originOffsetY], [x + width - originOffsetX, y + height - originOffsetY]];
    }
    function XYResizer({ domNode, nodeId, getStoreItems, onChange, onEnd }) {
    	const selection = select_default$1(domNode);
    	let params = {
    		controlDirection: getControlDirection("bottom-right"),
    		boundaries: {
    			minWidth: 0,
    			minHeight: 0,
    			maxWidth: Number.MAX_VALUE,
    			maxHeight: Number.MAX_VALUE
    		},
    		resizeDirection: void 0,
    		keepAspectRatio: false
    	};
    	function update({ controlPosition, boundaries, keepAspectRatio, resizeDirection, onResizeStart, onResize, onResizeEnd, shouldResize }) {
    		let prevValues = { ...initPrevValues$1 };
    		let startValues = { ...initStartValues };
    		params = {
    			boundaries,
    			resizeDirection,
    			keepAspectRatio,
    			controlDirection: getControlDirection(controlPosition)
    		};
    		let node = void 0;
    		let containerBounds = null;
    		let childNodes = [];
    		let parentNode = void 0;
    		let nodeExtent = void 0;
    		let childExtent = void 0;
    		let resizeDetected = false;
    		const dragHandler = drag_default().on("start", (event) => {
    			const { nodeLookup, transform, snapGrid, snapToGrid, nodeOrigin, paneDomNode } = getStoreItems();
    			node = nodeLookup.get(nodeId);
    			if (!node) return;
    			containerBounds = paneDomNode?.getBoundingClientRect() ?? null;
    			const { xSnapped, ySnapped } = getPointerPosition(event.sourceEvent, {
    				transform,
    				snapGrid,
    				snapToGrid,
    				containerBounds
    			});
    			prevValues = {
    				width: node.measured.width ?? 0,
    				height: node.measured.height ?? 0,
    				x: node.position.x ?? 0,
    				y: node.position.y ?? 0
    			};
    			startValues = {
    				...prevValues,
    				pointerX: xSnapped,
    				pointerY: ySnapped,
    				aspectRatio: prevValues.width / prevValues.height
    			};
    			parentNode = void 0;
    			nodeExtent = isCoordinateExtent(node.extent) ? node.extent : void 0;
    			if (node.parentId && (node.extent === "parent" || node.expandParent)) parentNode = nodeLookup.get(node.parentId);
    			if (parentNode && node.extent === "parent") nodeExtent = [[0, 0], [parentNode.measured.width, parentNode.measured.height]];
    			childNodes = [];
    			childExtent = void 0;
    			for (const [childId, child] of nodeLookup) if (child.parentId === nodeId) {
    				childNodes.push({
    					id: childId,
    					position: { ...child.position },
    					extent: child.extent
    				});
    				if (child.extent === "parent" || child.expandParent) {
    					const extent = nodeToChildExtent(child, node, child.origin ?? nodeOrigin);
    					if (childExtent) childExtent = [[Math.min(extent[0][0], childExtent[0][0]), Math.min(extent[0][1], childExtent[0][1])], [Math.max(extent[1][0], childExtent[1][0]), Math.max(extent[1][1], childExtent[1][1])]];
    					else childExtent = extent;
    				}
    			}
    			onResizeStart?.(event, { ...prevValues });
    		}).on("drag", (event) => {
    			const { transform, snapGrid, snapToGrid, nodeOrigin: storeNodeOrigin } = getStoreItems();
    			const pointerPosition = getPointerPosition(event.sourceEvent, {
    				transform,
    				snapGrid,
    				snapToGrid,
    				containerBounds
    			});
    			const childChanges = [];
    			if (!node) return;
    			const { x: prevX, y: prevY, width: prevWidth, height: prevHeight } = prevValues;
    			const change = {};
    			const nodeOrigin = node.origin ?? storeNodeOrigin;
    			const { width, height, x, y } = getDimensionsAfterResize(startValues, params.controlDirection, pointerPosition, params.boundaries, params.keepAspectRatio, nodeOrigin, nodeExtent, childExtent);
    			const isWidthChange = width !== prevWidth;
    			const isHeightChange = height !== prevHeight;
    			const isXPosChange = x !== prevX && isWidthChange;
    			const isYPosChange = y !== prevY && isHeightChange;
    			if (!isXPosChange && !isYPosChange && !isWidthChange && !isHeightChange) return;
    			if (isXPosChange || isYPosChange || nodeOrigin[0] === 1 || nodeOrigin[1] === 1) {
    				change.x = isXPosChange ? x : prevValues.x;
    				change.y = isYPosChange ? y : prevValues.y;
    				prevValues.x = change.x;
    				prevValues.y = change.y;
    				if (childNodes.length > 0) {
    					const xChange = x - prevX;
    					const yChange = y - prevY;
    					for (const childNode of childNodes) {
    						childNode.position = {
    							x: childNode.position.x - xChange + nodeOrigin[0] * (width - prevWidth),
    							y: childNode.position.y - yChange + nodeOrigin[1] * (height - prevHeight)
    						};
    						childChanges.push(childNode);
    					}
    				}
    			}
    			if (isWidthChange || isHeightChange) {
    				change.width = isWidthChange && (!params.resizeDirection || params.resizeDirection === "horizontal") ? width : prevValues.width;
    				change.height = isHeightChange && (!params.resizeDirection || params.resizeDirection === "vertical") ? height : prevValues.height;
    				prevValues.width = change.width;
    				prevValues.height = change.height;
    			}
    			if (parentNode && node.expandParent) {
    				const xLimit = nodeOrigin[0] * (change.width ?? 0);
    				if (change.x && change.x < xLimit) {
    					prevValues.x = xLimit;
    					startValues.x = startValues.x - (change.x - xLimit);
    				}
    				const yLimit = nodeOrigin[1] * (change.height ?? 0);
    				if (change.y && change.y < yLimit) {
    					prevValues.y = yLimit;
    					startValues.y = startValues.y - (change.y - yLimit);
    				}
    			}
    			const direction = getResizeDirection({
    				width: prevValues.width,
    				prevWidth,
    				height: prevValues.height,
    				prevHeight,
    				affectsX: params.controlDirection.affectsX,
    				affectsY: params.controlDirection.affectsY
    			});
    			const nextValues = {
    				...prevValues,
    				direction
    			};
    			if (shouldResize?.(event, nextValues) === false) return;
    			resizeDetected = true;
    			onResize?.(event, nextValues);
    			onChange(change, childChanges);
    		}).on("end", (event) => {
    			if (!resizeDetected) return;
    			onResizeEnd?.(event, { ...prevValues });
    			onEnd?.({ ...prevValues });
    			resizeDetected = false;
    		});
    		selection.call(dragHandler);
    	}
    	function destroy() {
    		selection.on(".drag", null);
    	}
    	return {
    		update,
    		destroy
    	};
    }
    //#endregion
    //#region ../../node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.min.js
    /**
    * @license React
    * use-sync-external-store-shim.production.min.js
    *
    * Copyright (c) Facebook, Inc. and its affiliates.
    *
    * This source code is licensed under the MIT license found in the
    * LICENSE file in the root directory of this source tree.
    */
    var require_use_sync_external_store_shim_production_min = /* @__PURE__ */ __commonJSMin(((exports) => {
    	var e = require("react");
    	function h(a, b) {
    		return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
    	}
    	var k = "function" === typeof Object.is ? Object.is : h;
    	var l = e.useState;
    	var m = e.useEffect;
    	var n = e.useLayoutEffect;
    	var p = e.useDebugValue;
    	function q(a, b) {
    		var d = b(), f = l({ inst: {
    			value: d,
    			getSnapshot: b
    		} }), c = f[0].inst, g = f[1];
    		n(function() {
    			c.value = d;
    			c.getSnapshot = b;
    			r(c) && g({ inst: c });
    		}, [
    			a,
    			d,
    			b
    		]);
    		m(function() {
    			r(c) && g({ inst: c });
    			return a(function() {
    				r(c) && g({ inst: c });
    			});
    		}, [a]);
    		p(d);
    		return d;
    	}
    	function r(a) {
    		var b = a.getSnapshot;
    		a = a.value;
    		try {
    			var d = b();
    			return !k(a, d);
    		} catch (f) {
    			return !0;
    		}
    	}
    	function t(a, b) {
    		return b();
    	}
    	var u = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? t : q;
    	exports.useSyncExternalStore = void 0 !== e.useSyncExternalStore ? e.useSyncExternalStore : u;
    }));
    //#endregion
    //#region ../../node_modules/use-sync-external-store/shim/index.js
    var require_shim = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    	module.exports = require_use_sync_external_store_shim_production_min();
    }));
    //#endregion
    //#region ../../node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.production.min.js
    /**
    * @license React
    * use-sync-external-store-shim/with-selector.production.min.js
    *
    * Copyright (c) Facebook, Inc. and its affiliates.
    *
    * This source code is licensed under the MIT license found in the
    * LICENSE file in the root directory of this source tree.
    */
    var require_with_selector_production_min = /* @__PURE__ */ __commonJSMin(((exports) => {
    	var h = require("react");
    	var n = require_shim();
    	function p(a, b) {
    		return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
    	}
    	var q = "function" === typeof Object.is ? Object.is : p;
    	var r = n.useSyncExternalStore;
    	var t = h.useRef;
    	var u = h.useEffect;
    	var v = h.useMemo;
    	var w = h.useDebugValue;
    	exports.useSyncExternalStoreWithSelector = function(a, b, e, l, g) {
    		var c = t(null);
    		if (null === c.current) {
    			var f = {
    				hasValue: !1,
    				value: null
    			};
    			c.current = f;
    		} else f = c.current;
    		c = v(function() {
    			function a(a) {
    				if (!c) {
    					c = !0;
    					d = a;
    					a = l(a);
    					if (void 0 !== g && f.hasValue) {
    						var b = f.value;
    						if (g(b, a)) return k = b;
    					}
    					return k = a;
    				}
    				b = k;
    				if (q(d, a)) return b;
    				var e = l(a);
    				if (void 0 !== g && g(b, e)) return b;
    				d = a;
    				return k = e;
    			}
    			var c = !1, d, k, m = void 0 === e ? null : e;
    			return [function() {
    				return a(b());
    			}, null === m ? void 0 : function() {
    				return a(m());
    			}];
    		}, [
    			b,
    			e,
    			l,
    			g
    		]);
    		var d = r(a, c[0], c[1]);
    		u(function() {
    			f.hasValue = !0;
    			f.value = d;
    		}, [d]);
    		w(d);
    		return d;
    	};
    }));
    //#endregion
    //#region ../../node_modules/zustand/esm/vanilla.mjs
    var import_with_selector = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
    	module.exports = require_with_selector_production_min();
    })))(), 1);
    const createStoreImpl = (createState) => {
    	let state;
    	const listeners = /* @__PURE__ */ new Set();
    	const setState = (partial, replace) => {
    		const nextState = typeof partial === "function" ? partial(state) : partial;
    		if (!Object.is(nextState, state)) {
    			const previousState = state;
    			state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
    			listeners.forEach((listener) => listener(state, previousState));
    		}
    	};
    	const getState = () => state;
    	const subscribe = (listener) => {
    		listeners.add(listener);
    		return () => listeners.delete(listener);
    	};
    	const destroy = () => {
    		if (({}.env ? {}.env.MODE : void 0) !== "production") console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected.");
    		listeners.clear();
    	};
    	const api = {
    		setState,
    		getState,
    		subscribe,
    		destroy
    	};
    	state = createState(setState, getState, api);
    	return api;
    };
    const createStore$1 = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;
    //#endregion
    //#region ../../node_modules/zustand/esm/traditional.mjs
    const { useDebugValue } = react.default;
    const { useSyncExternalStoreWithSelector } = import_with_selector.default;
    function useStoreWithEqualityFn(api, selector = api.getState, equalityFn) {
    	const slice = useSyncExternalStoreWithSelector(api.subscribe, api.getState, api.getServerState || api.getState, selector, equalityFn);
    	useDebugValue(slice);
    	return slice;
    }
    const createWithEqualityFnImpl = (createState, defaultEqualityFn) => {
    	const api = createStore$1(createState);
    	const useBoundStoreWithEqualityFn = (selector, equalityFn = defaultEqualityFn) => useStoreWithEqualityFn(api, selector, equalityFn);
    	Object.assign(useBoundStoreWithEqualityFn, api);
    	return useBoundStoreWithEqualityFn;
    };
    const createWithEqualityFn = (createState, defaultEqualityFn) => createState ? createWithEqualityFnImpl(createState, defaultEqualityFn) : createWithEqualityFnImpl;
    //#endregion
    //#region ../../node_modules/zustand/esm/shallow.mjs
    function shallow$1(objA, objB) {
    	if (Object.is(objA, objB)) return true;
    	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) return false;
    	if (objA instanceof Map && objB instanceof Map) {
    		if (objA.size !== objB.size) return false;
    		for (const [key, value] of objA) if (!Object.is(value, objB.get(key))) return false;
    		return true;
    	}
    	if (objA instanceof Set && objB instanceof Set) {
    		if (objA.size !== objB.size) return false;
    		for (const value of objA) if (!objB.has(value)) return false;
    		return true;
    	}
    	const keysA = Object.keys(objA);
    	if (keysA.length !== Object.keys(objB).length) return false;
    	for (let i = 0; i < keysA.length; i++) if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) return false;
    	return true;
    }
    //#endregion
    //#region ../../node_modules/scheduler/cjs/scheduler.production.min.js
    /**
    * @license React
    * scheduler.production.min.js
    *
    * Copyright (c) Facebook, Inc. and its affiliates.
    *
    * This source code is licensed under the MIT license found in the
    * LICENSE file in the root directory of this source tree.
    */
    var require_scheduler_production_min = /* @__PURE__ */ __commonJSMin(((exports) => {
    	function f(a, b) {
    		var c = a.length;
    		a.push(b);
    		a: for (; 0 < c;) {
    			var d = c - 1 >>> 1, e = a[d];
    			if (0 < g(e, b)) a[d] = b, a[c] = e, c = d;
    			else break a;
    		}
    	}
    	function h(a) {
    		return 0 === a.length ? null : a[0];
    	}
    	function k(a) {
    		if (0 === a.length) return null;
    		var b = a[0], c = a.pop();
    		if (c !== b) {
    			a[0] = c;
    			a: for (var d = 0, e = a.length, w = e >>> 1; d < w;) {
    				var m = 2 * (d + 1) - 1, C = a[m], n = m + 1, x = a[n];
    				if (0 > g(C, c)) n < e && 0 > g(x, C) ? (a[d] = x, a[n] = c, d = n) : (a[d] = C, a[m] = c, d = m);
    				else if (n < e && 0 > g(x, c)) a[d] = x, a[n] = c, d = n;
    				else break a;
    			}
    		}
    		return b;
    	}
    	function g(a, b) {
    		var c = a.sortIndex - b.sortIndex;
    		return 0 !== c ? c : a.id - b.id;
    	}
    	if ("object" === typeof performance && "function" === typeof performance.now) {
    		var l = performance;
    		exports.unstable_now = function() {
    			return l.now();
    		};
    	} else {
    		var p = Date, q = p.now();
    		exports.unstable_now = function() {
    			return p.now() - q;
    		};
    	}
    	var r = [];
    	var t = [];
    	var u = 1;
    	var v = null;
    	var y = 3;
    	var z = !1;
    	var A = !1;
    	var B = !1;
    	var D = "function" === typeof setTimeout ? setTimeout : null;
    	var E = "function" === typeof clearTimeout ? clearTimeout : null;
    	var F = "undefined" !== typeof setImmediate ? setImmediate : null;
    	"undefined" !== typeof navigator && void 0 !== navigator.scheduling && void 0 !== navigator.scheduling.isInputPending && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    	function G(a) {
    		for (var b = h(t); null !== b;) {
    			if (null === b.callback) k(t);
    			else if (b.startTime <= a) k(t), b.sortIndex = b.expirationTime, f(r, b);
    			else break;
    			b = h(t);
    		}
    	}
    	function H(a) {
    		B = !1;
    		G(a);
    		if (!A) if (null !== h(r)) A = !0, I(J);
    		else {
    			var b = h(t);
    			null !== b && K(H, b.startTime - a);
    		}
    	}
    	function J(a, b) {
    		A = !1;
    		B && (B = !1, E(L), L = -1);
    		z = !0;
    		var c = y;
    		try {
    			G(b);
    			for (v = h(r); null !== v && (!(v.expirationTime > b) || a && !M());) {
    				var d = v.callback;
    				if ("function" === typeof d) {
    					v.callback = null;
    					y = v.priorityLevel;
    					var e = d(v.expirationTime <= b);
    					b = exports.unstable_now();
    					"function" === typeof e ? v.callback = e : v === h(r) && k(r);
    					G(b);
    				} else k(r);
    				v = h(r);
    			}
    			if (null !== v) var w = !0;
    			else {
    				var m = h(t);
    				null !== m && K(H, m.startTime - b);
    				w = !1;
    			}
    			return w;
    		} finally {
    			v = null, y = c, z = !1;
    		}
    	}
    	var N = !1;
    	var O = null;
    	var L = -1;
    	var P = 5;
    	var Q = -1;
    	function M() {
    		return exports.unstable_now() - Q < P ? !1 : !0;
    	}
    	function R() {
    		if (null !== O) {
    			var a = exports.unstable_now();
    			Q = a;
    			var b = !0;
    			try {
    				b = O(!0, a);
    			} finally {
    				b ? S() : (N = !1, O = null);
    			}
    		} else N = !1;
    	}
    	var S;
    	if ("function" === typeof F) S = function() {
    		F(R);
    	};
    	else if ("undefined" !== typeof MessageChannel) {
    		var T = new MessageChannel(), U = T.port2;
    		T.port1.onmessage = R;
    		S = function() {
    			U.postMessage(null);
    		};
    	} else S = function() {
    		D(R, 0);
    	};
    	function I(a) {
    		O = a;
    		N || (N = !0, S());
    	}
    	function K(a, b) {
    		L = D(function() {
    			a(exports.unstable_now());
    		}, b);
    	}
    	exports.unstable_IdlePriority = 5;
    	exports.unstable_ImmediatePriority = 1;
    	exports.unstable_LowPriority = 4;
    	exports.unstable_NormalPriority = 3;
    	exports.unstable_Profiling = null;
    	exports.unstable_UserBlockingPriority = 2;
    	exports.unstable_cancelCallback = function(a) {
    		a.callback = null;
    	};
    	exports.unstable_continueExecution = function() {
    		A || z || (A = !0, I(J));
    	};
    	exports.unstable_forceFrameRate = function(a) {
    		0 > a || 125 < a ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P = 0 < a ? Math.floor(1e3 / a) : 5;
    	};
    	exports.unstable_getCurrentPriorityLevel = function() {
    		return y;
    	};
    	exports.unstable_getFirstCallbackNode = function() {
    		return h(r);
    	};
    	exports.unstable_next = function(a) {
    		switch (y) {
    			case 1:
    			case 2:
    			case 3:
    				var b = 3;
    				break;
    			default: b = y;
    		}
    		var c = y;
    		y = b;
    		try {
    			return a();
    		} finally {
    			y = c;
    		}
    	};
    	exports.unstable_pauseExecution = function() {};
    	exports.unstable_requestPaint = function() {};
    	exports.unstable_runWithPriority = function(a, b) {
    		switch (a) {
    			case 1:
    			case 2:
    			case 3:
    			case 4:
    			case 5: break;
    			default: a = 3;
    		}
    		var c = y;
    		y = a;
    		try {
    			return b();
    		} finally {
    			y = c;
    		}
    	};
    	exports.unstable_scheduleCallback = function(a, b, c) {
    		var d = exports.unstable_now();
    		"object" === typeof c && null !== c ? (c = c.delay, c = "number" === typeof c && 0 < c ? d + c : d) : c = d;
    		switch (a) {
    			case 1:
    				var e = -1;
    				break;
    			case 2:
    				e = 250;
    				break;
    			case 5:
    				e = 1073741823;
    				break;
    			case 4:
    				e = 1e4;
    				break;
    			default: e = 5e3;
    		}
    		e = c + e;
    		a = {
    			id: u++,
    			callback: b,
    			priorityLevel: a,
    			startTime: c,
    			expirationTime: e,
    			sortIndex: -1
    		};
    		c > d ? (a.sortIndex = c, f(t, a), null === h(r) && a === h(t) && (B ? (E(L), L = -1) : B = !0, K(H, c - d))) : (a.sortIndex = e, f(r, a), A || z || (A = !0, I(J)));
    		return a;
    	};
    	exports.unstable_shouldYield = M;
    	exports.unstable_wrapCallback = function(a) {
    		var b = y;
    		return function() {
    			var c = y;
    			y = b;
    			try {
    				return a.apply(this, arguments);
    			} finally {
    				y = c;
    			}
    		};
    	};
    }));
    //#endregion
    //#region ../../node_modules/scheduler/index.js
    var require_scheduler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
    	module.exports = require_scheduler_production_min();
    }));
    //#endregion
    //#region ../../node_modules/react-dom/cjs/react-dom.production.min.js
    /**
    * @license React
    * react-dom.production.min.js
    *
    * Copyright (c) Facebook, Inc. and its affiliates.
    *
    * This source code is licensed under the MIT license found in the
    * LICENSE file in the root directory of this source tree.
    */
    var require_react_dom_production_min = /* @__PURE__ */ __commonJSMin(((exports) => {
    	var aa = require("react");
    	var ca = require_scheduler();
    	function p(a) {
    		for (var b = "https://reactjs.org/docs/error-decoder.html?invariant=" + a, c = 1; c < arguments.length; c++) b += "&args[]=" + encodeURIComponent(arguments[c]);
    		return "Minified React error #" + a + "; visit " + b + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
    	}
    	var da = /* @__PURE__ */ new Set();
    	var ea = {};
    	function fa(a, b) {
    		ha(a, b);
    		ha(a + "Capture", b);
    	}
    	function ha(a, b) {
    		ea[a] = b;
    		for (a = 0; a < b.length; a++) da.add(b[a]);
    	}
    	var ia = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement);
    	var ja = Object.prototype.hasOwnProperty;
    	var ka = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/;
    	var la = {};
    	var ma = {};
    	function oa(a) {
    		if (ja.call(ma, a)) return !0;
    		if (ja.call(la, a)) return !1;
    		if (ka.test(a)) return ma[a] = !0;
    		la[a] = !0;
    		return !1;
    	}
    	function pa(a, b, c, d) {
    		if (null !== c && 0 === c.type) return !1;
    		switch (typeof b) {
    			case "function":
    			case "symbol": return !0;
    			case "boolean":
    				if (d) return !1;
    				if (null !== c) return !c.acceptsBooleans;
    				a = a.toLowerCase().slice(0, 5);
    				return "data-" !== a && "aria-" !== a;
    			default: return !1;
    		}
    	}
    	function qa(a, b, c, d) {
    		if (null === b || "undefined" === typeof b || pa(a, b, c, d)) return !0;
    		if (d) return !1;
    		if (null !== c) switch (c.type) {
    			case 3: return !b;
    			case 4: return !1 === b;
    			case 5: return isNaN(b);
    			case 6: return isNaN(b) || 1 > b;
    		}
    		return !1;
    	}
    	function v(a, b, c, d, e, f, g) {
    		this.acceptsBooleans = 2 === b || 3 === b || 4 === b;
    		this.attributeName = d;
    		this.attributeNamespace = e;
    		this.mustUseProperty = c;
    		this.propertyName = a;
    		this.type = b;
    		this.sanitizeURL = f;
    		this.removeEmptyString = g;
    	}
    	var z = {};
    	"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a) {
    		z[a] = new v(a, 0, !1, a, null, !1, !1);
    	});
    	[
    		["acceptCharset", "accept-charset"],
    		["className", "class"],
    		["htmlFor", "for"],
    		["httpEquiv", "http-equiv"]
    	].forEach(function(a) {
    		var b = a[0];
    		z[b] = new v(b, 1, !1, a[1], null, !1, !1);
    	});
    	[
    		"contentEditable",
    		"draggable",
    		"spellCheck",
    		"value"
    	].forEach(function(a) {
    		z[a] = new v(a, 2, !1, a.toLowerCase(), null, !1, !1);
    	});
    	[
    		"autoReverse",
    		"externalResourcesRequired",
    		"focusable",
    		"preserveAlpha"
    	].forEach(function(a) {
    		z[a] = new v(a, 2, !1, a, null, !1, !1);
    	});
    	"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a) {
    		z[a] = new v(a, 3, !1, a.toLowerCase(), null, !1, !1);
    	});
    	[
    		"checked",
    		"multiple",
    		"muted",
    		"selected"
    	].forEach(function(a) {
    		z[a] = new v(a, 3, !0, a, null, !1, !1);
    	});
    	["capture", "download"].forEach(function(a) {
    		z[a] = new v(a, 4, !1, a, null, !1, !1);
    	});
    	[
    		"cols",
    		"rows",
    		"size",
    		"span"
    	].forEach(function(a) {
    		z[a] = new v(a, 6, !1, a, null, !1, !1);
    	});
    	["rowSpan", "start"].forEach(function(a) {
    		z[a] = new v(a, 5, !1, a.toLowerCase(), null, !1, !1);
    	});
    	var ra = /[\-:]([a-z])/g;
    	function sa(a) {
    		return a[1].toUpperCase();
    	}
    	"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a) {
    		var b = a.replace(ra, sa);
    		z[b] = new v(b, 1, !1, a, null, !1, !1);
    	});
    	"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a) {
    		var b = a.replace(ra, sa);
    		z[b] = new v(b, 1, !1, a, "http://www.w3.org/1999/xlink", !1, !1);
    	});
    	[
    		"xml:base",
    		"xml:lang",
    		"xml:space"
    	].forEach(function(a) {
    		var b = a.replace(ra, sa);
    		z[b] = new v(b, 1, !1, a, "http://www.w3.org/XML/1998/namespace", !1, !1);
    	});
    	["tabIndex", "crossOrigin"].forEach(function(a) {
    		z[a] = new v(a, 1, !1, a.toLowerCase(), null, !1, !1);
    	});
    	z.xlinkHref = new v("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
    	[
    		"src",
    		"href",
    		"action",
    		"formAction"
    	].forEach(function(a) {
    		z[a] = new v(a, 1, !1, a.toLowerCase(), null, !0, !0);
    	});
    	function ta(a, b, c, d) {
    		var e = z.hasOwnProperty(b) ? z[b] : null;
    		if (null !== e ? 0 !== e.type : d || !(2 < b.length) || "o" !== b[0] && "O" !== b[0] || "n" !== b[1] && "N" !== b[1]) qa(b, c, e, d) && (c = null), d || null === e ? oa(b) && (null === c ? a.removeAttribute(b) : a.setAttribute(b, "" + c)) : e.mustUseProperty ? a[e.propertyName] = null === c ? 3 === e.type ? !1 : "" : c : (b = e.attributeName, d = e.attributeNamespace, null === c ? a.removeAttribute(b) : (e = e.type, c = 3 === e || 4 === e && !0 === c ? "" : "" + c, d ? a.setAttributeNS(d, b, c) : a.setAttribute(b, c)));
    	}
    	var ua = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    	var va = Symbol.for("react.element");
    	var wa = Symbol.for("react.portal");
    	var ya = Symbol.for("react.fragment");
    	var za = Symbol.for("react.strict_mode");
    	var Aa = Symbol.for("react.profiler");
    	var Ba = Symbol.for("react.provider");
    	var Ca = Symbol.for("react.context");
    	var Da = Symbol.for("react.forward_ref");
    	var Ea = Symbol.for("react.suspense");
    	var Fa = Symbol.for("react.suspense_list");
    	var Ga = Symbol.for("react.memo");
    	var Ha = Symbol.for("react.lazy");
    	var Ia = Symbol.for("react.offscreen");
    	var Ja = Symbol.iterator;
    	function Ka(a) {
    		if (null === a || "object" !== typeof a) return null;
    		a = Ja && a[Ja] || a["@@iterator"];
    		return "function" === typeof a ? a : null;
    	}
    	var A = Object.assign;
    	var La;
    	function Ma(a) {
    		if (void 0 === La) try {
    			throw Error();
    		} catch (c) {
    			var b = c.stack.trim().match(/\n( *(at )?)/);
    			La = b && b[1] || "";
    		}
    		return "\n" + La + a;
    	}
    	var Na = !1;
    	function Oa(a, b) {
    		if (!a || Na) return "";
    		Na = !0;
    		var c = Error.prepareStackTrace;
    		Error.prepareStackTrace = void 0;
    		try {
    			if (b) if (b = function() {
    				throw Error();
    			}, Object.defineProperty(b.prototype, "props", { set: function() {
    				throw Error();
    			} }), "object" === typeof Reflect && Reflect.construct) {
    				try {
    					Reflect.construct(b, []);
    				} catch (l) {
    					var d = l;
    				}
    				Reflect.construct(a, [], b);
    			} else {
    				try {
    					b.call();
    				} catch (l) {
    					d = l;
    				}
    				a.call(b.prototype);
    			}
    			else {
    				try {
    					throw Error();
    				} catch (l) {
    					d = l;
    				}
    				a();
    			}
    		} catch (l) {
    			if (l && d && "string" === typeof l.stack) {
    				for (var e = l.stack.split("\n"), f = d.stack.split("\n"), g = e.length - 1, h = f.length - 1; 1 <= g && 0 <= h && e[g] !== f[h];) h--;
    				for (; 1 <= g && 0 <= h; g--, h--) if (e[g] !== f[h]) {
    					if (1 !== g || 1 !== h) do
    						if (g--, h--, 0 > h || e[g] !== f[h]) {
    							var k = "\n" + e[g].replace(" at new ", " at ");
    							a.displayName && k.includes("<anonymous>") && (k = k.replace("<anonymous>", a.displayName));
    							return k;
    						}
    					while (1 <= g && 0 <= h);
    					break;
    				}
    			}
    		} finally {
    			Na = !1, Error.prepareStackTrace = c;
    		}
    		return (a = a ? a.displayName || a.name : "") ? Ma(a) : "";
    	}
    	function Pa(a) {
    		switch (a.tag) {
    			case 5: return Ma(a.type);
    			case 16: return Ma("Lazy");
    			case 13: return Ma("Suspense");
    			case 19: return Ma("SuspenseList");
    			case 0:
    			case 2:
    			case 15: return a = Oa(a.type, !1), a;
    			case 11: return a = Oa(a.type.render, !1), a;
    			case 1: return a = Oa(a.type, !0), a;
    			default: return "";
    		}
    	}
    	function Qa(a) {
    		if (null == a) return null;
    		if ("function" === typeof a) return a.displayName || a.name || null;
    		if ("string" === typeof a) return a;
    		switch (a) {
    			case ya: return "Fragment";
    			case wa: return "Portal";
    			case Aa: return "Profiler";
    			case za: return "StrictMode";
    			case Ea: return "Suspense";
    			case Fa: return "SuspenseList";
    		}
    		if ("object" === typeof a) switch (a.$$typeof) {
    			case Ca: return (a.displayName || "Context") + ".Consumer";
    			case Ba: return (a._context.displayName || "Context") + ".Provider";
    			case Da:
    				var b = a.render;
    				a = a.displayName;
    				a || (a = b.displayName || b.name || "", a = "" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
    				return a;
    			case Ga: return b = a.displayName || null, null !== b ? b : Qa(a.type) || "Memo";
    			case Ha:
    				b = a._payload;
    				a = a._init;
    				try {
    					return Qa(a(b));
    				} catch (c) {}
    		}
    		return null;
    	}
    	function Ra(a) {
    		var b = a.type;
    		switch (a.tag) {
    			case 24: return "Cache";
    			case 9: return (b.displayName || "Context") + ".Consumer";
    			case 10: return (b._context.displayName || "Context") + ".Provider";
    			case 18: return "DehydratedFragment";
    			case 11: return a = b.render, a = a.displayName || a.name || "", b.displayName || ("" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
    			case 7: return "Fragment";
    			case 5: return b;
    			case 4: return "Portal";
    			case 3: return "Root";
    			case 6: return "Text";
    			case 16: return Qa(b);
    			case 8: return b === za ? "StrictMode" : "Mode";
    			case 22: return "Offscreen";
    			case 12: return "Profiler";
    			case 21: return "Scope";
    			case 13: return "Suspense";
    			case 19: return "SuspenseList";
    			case 25: return "TracingMarker";
    			case 1:
    			case 0:
    			case 17:
    			case 2:
    			case 14:
    			case 15:
    				if ("function" === typeof b) return b.displayName || b.name || null;
    				if ("string" === typeof b) return b;
    		}
    		return null;
    	}
    	function Sa(a) {
    		switch (typeof a) {
    			case "boolean":
    			case "number":
    			case "string":
    			case "undefined": return a;
    			case "object": return a;
    			default: return "";
    		}
    	}
    	function Ta(a) {
    		var b = a.type;
    		return (a = a.nodeName) && "input" === a.toLowerCase() && ("checkbox" === b || "radio" === b);
    	}
    	function Ua(a) {
    		var b = Ta(a) ? "checked" : "value", c = Object.getOwnPropertyDescriptor(a.constructor.prototype, b), d = "" + a[b];
    		if (!a.hasOwnProperty(b) && "undefined" !== typeof c && "function" === typeof c.get && "function" === typeof c.set) {
    			var e = c.get, f = c.set;
    			Object.defineProperty(a, b, {
    				configurable: !0,
    				get: function() {
    					return e.call(this);
    				},
    				set: function(a) {
    					d = "" + a;
    					f.call(this, a);
    				}
    			});
    			Object.defineProperty(a, b, { enumerable: c.enumerable });
    			return {
    				getValue: function() {
    					return d;
    				},
    				setValue: function(a) {
    					d = "" + a;
    				},
    				stopTracking: function() {
    					a._valueTracker = null;
    					delete a[b];
    				}
    			};
    		}
    	}
    	function Va(a) {
    		a._valueTracker || (a._valueTracker = Ua(a));
    	}
    	function Wa(a) {
    		if (!a) return !1;
    		var b = a._valueTracker;
    		if (!b) return !0;
    		var c = b.getValue();
    		var d = "";
    		a && (d = Ta(a) ? a.checked ? "true" : "false" : a.value);
    		a = d;
    		return a !== c ? (b.setValue(a), !0) : !1;
    	}
    	function Xa(a) {
    		a = a || ("undefined" !== typeof document ? document : void 0);
    		if ("undefined" === typeof a) return null;
    		try {
    			return a.activeElement || a.body;
    		} catch (b) {
    			return a.body;
    		}
    	}
    	function Ya(a, b) {
    		var c = b.checked;
    		return A({}, b, {
    			defaultChecked: void 0,
    			defaultValue: void 0,
    			value: void 0,
    			checked: null != c ? c : a._wrapperState.initialChecked
    		});
    	}
    	function Za(a, b) {
    		var c = null == b.defaultValue ? "" : b.defaultValue, d = null != b.checked ? b.checked : b.defaultChecked;
    		c = Sa(null != b.value ? b.value : c);
    		a._wrapperState = {
    			initialChecked: d,
    			initialValue: c,
    			controlled: "checkbox" === b.type || "radio" === b.type ? null != b.checked : null != b.value
    		};
    	}
    	function ab(a, b) {
    		b = b.checked;
    		null != b && ta(a, "checked", b, !1);
    	}
    	function bb(a, b) {
    		ab(a, b);
    		var c = Sa(b.value), d = b.type;
    		if (null != c) if ("number" === d) {
    			if (0 === c && "" === a.value || a.value != c) a.value = "" + c;
    		} else a.value !== "" + c && (a.value = "" + c);
    		else if ("submit" === d || "reset" === d) {
    			a.removeAttribute("value");
    			return;
    		}
    		b.hasOwnProperty("value") ? cb(a, b.type, c) : b.hasOwnProperty("defaultValue") && cb(a, b.type, Sa(b.defaultValue));
    		null == b.checked && null != b.defaultChecked && (a.defaultChecked = !!b.defaultChecked);
    	}
    	function db(a, b, c) {
    		if (b.hasOwnProperty("value") || b.hasOwnProperty("defaultValue")) {
    			var d = b.type;
    			if (!("submit" !== d && "reset" !== d || void 0 !== b.value && null !== b.value)) return;
    			b = "" + a._wrapperState.initialValue;
    			c || b === a.value || (a.value = b);
    			a.defaultValue = b;
    		}
    		c = a.name;
    		"" !== c && (a.name = "");
    		a.defaultChecked = !!a._wrapperState.initialChecked;
    		"" !== c && (a.name = c);
    	}
    	function cb(a, b, c) {
    		if ("number" !== b || Xa(a.ownerDocument) !== a) null == c ? a.defaultValue = "" + a._wrapperState.initialValue : a.defaultValue !== "" + c && (a.defaultValue = "" + c);
    	}
    	var eb = Array.isArray;
    	function fb(a, b, c, d) {
    		a = a.options;
    		if (b) {
    			b = {};
    			for (var e = 0; e < c.length; e++) b["$" + c[e]] = !0;
    			for (c = 0; c < a.length; c++) e = b.hasOwnProperty("$" + a[c].value), a[c].selected !== e && (a[c].selected = e), e && d && (a[c].defaultSelected = !0);
    		} else {
    			c = "" + Sa(c);
    			b = null;
    			for (e = 0; e < a.length; e++) {
    				if (a[e].value === c) {
    					a[e].selected = !0;
    					d && (a[e].defaultSelected = !0);
    					return;
    				}
    				null !== b || a[e].disabled || (b = a[e]);
    			}
    			null !== b && (b.selected = !0);
    		}
    	}
    	function gb(a, b) {
    		if (null != b.dangerouslySetInnerHTML) throw Error(p(91));
    		return A({}, b, {
    			value: void 0,
    			defaultValue: void 0,
    			children: "" + a._wrapperState.initialValue
    		});
    	}
    	function hb(a, b) {
    		var c = b.value;
    		if (null == c) {
    			c = b.children;
    			b = b.defaultValue;
    			if (null != c) {
    				if (null != b) throw Error(p(92));
    				if (eb(c)) {
    					if (1 < c.length) throw Error(p(93));
    					c = c[0];
    				}
    				b = c;
    			}
    			b ??= "";
    			c = b;
    		}
    		a._wrapperState = { initialValue: Sa(c) };
    	}
    	function ib(a, b) {
    		var c = Sa(b.value), d = Sa(b.defaultValue);
    		null != c && (c = "" + c, c !== a.value && (a.value = c), null == b.defaultValue && a.defaultValue !== c && (a.defaultValue = c));
    		null != d && (a.defaultValue = "" + d);
    	}
    	function jb(a) {
    		var b = a.textContent;
    		b === a._wrapperState.initialValue && "" !== b && null !== b && (a.value = b);
    	}
    	function kb(a) {
    		switch (a) {
    			case "svg": return "http://www.w3.org/2000/svg";
    			case "math": return "http://www.w3.org/1998/Math/MathML";
    			default: return "http://www.w3.org/1999/xhtml";
    		}
    	}
    	function lb(a, b) {
    		return null == a || "http://www.w3.org/1999/xhtml" === a ? kb(b) : "http://www.w3.org/2000/svg" === a && "foreignObject" === b ? "http://www.w3.org/1999/xhtml" : a;
    	}
    	var mb;
    	var nb = function(a) {
    		return "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction ? function(b, c, d, e) {
    			MSApp.execUnsafeLocalFunction(function() {
    				return a(b, c, d, e);
    			});
    		} : a;
    	}(function(a, b) {
    		if ("http://www.w3.org/2000/svg" !== a.namespaceURI || "innerHTML" in a) a.innerHTML = b;
    		else {
    			mb = mb || document.createElement("div");
    			mb.innerHTML = "<svg>" + b.valueOf().toString() + "</svg>";
    			for (b = mb.firstChild; a.firstChild;) a.removeChild(a.firstChild);
    			for (; b.firstChild;) a.appendChild(b.firstChild);
    		}
    	});
    	function ob(a, b) {
    		if (b) {
    			var c = a.firstChild;
    			if (c && c === a.lastChild && 3 === c.nodeType) {
    				c.nodeValue = b;
    				return;
    			}
    		}
    		a.textContent = b;
    	}
    	var pb = {
    		animationIterationCount: !0,
    		aspectRatio: !0,
    		borderImageOutset: !0,
    		borderImageSlice: !0,
    		borderImageWidth: !0,
    		boxFlex: !0,
    		boxFlexGroup: !0,
    		boxOrdinalGroup: !0,
    		columnCount: !0,
    		columns: !0,
    		flex: !0,
    		flexGrow: !0,
    		flexPositive: !0,
    		flexShrink: !0,
    		flexNegative: !0,
    		flexOrder: !0,
    		gridArea: !0,
    		gridRow: !0,
    		gridRowEnd: !0,
    		gridRowSpan: !0,
    		gridRowStart: !0,
    		gridColumn: !0,
    		gridColumnEnd: !0,
    		gridColumnSpan: !0,
    		gridColumnStart: !0,
    		fontWeight: !0,
    		lineClamp: !0,
    		lineHeight: !0,
    		opacity: !0,
    		order: !0,
    		orphans: !0,
    		tabSize: !0,
    		widows: !0,
    		zIndex: !0,
    		zoom: !0,
    		fillOpacity: !0,
    		floodOpacity: !0,
    		stopOpacity: !0,
    		strokeDasharray: !0,
    		strokeDashoffset: !0,
    		strokeMiterlimit: !0,
    		strokeOpacity: !0,
    		strokeWidth: !0
    	};
    	var qb = [
    		"Webkit",
    		"ms",
    		"Moz",
    		"O"
    	];
    	Object.keys(pb).forEach(function(a) {
    		qb.forEach(function(b) {
    			b = b + a.charAt(0).toUpperCase() + a.substring(1);
    			pb[b] = pb[a];
    		});
    	});
    	function rb(a, b, c) {
    		return null == b || "boolean" === typeof b || "" === b ? "" : c || "number" !== typeof b || 0 === b || pb.hasOwnProperty(a) && pb[a] ? ("" + b).trim() : b + "px";
    	}
    	function sb(a, b) {
    		a = a.style;
    		for (var c in b) if (b.hasOwnProperty(c)) {
    			var d = 0 === c.indexOf("--"), e = rb(c, b[c], d);
    			"float" === c && (c = "cssFloat");
    			d ? a.setProperty(c, e) : a[c] = e;
    		}
    	}
    	var tb = A({ menuitem: !0 }, {
    		area: !0,
    		base: !0,
    		br: !0,
    		col: !0,
    		embed: !0,
    		hr: !0,
    		img: !0,
    		input: !0,
    		keygen: !0,
    		link: !0,
    		meta: !0,
    		param: !0,
    		source: !0,
    		track: !0,
    		wbr: !0
    	});
    	function ub(a, b) {
    		if (b) {
    			if (tb[a] && (null != b.children || null != b.dangerouslySetInnerHTML)) throw Error(p(137, a));
    			if (null != b.dangerouslySetInnerHTML) {
    				if (null != b.children) throw Error(p(60));
    				if ("object" !== typeof b.dangerouslySetInnerHTML || !("__html" in b.dangerouslySetInnerHTML)) throw Error(p(61));
    			}
    			if (null != b.style && "object" !== typeof b.style) throw Error(p(62));
    		}
    	}
    	function vb(a, b) {
    		if (-1 === a.indexOf("-")) return "string" === typeof b.is;
    		switch (a) {
    			case "annotation-xml":
    			case "color-profile":
    			case "font-face":
    			case "font-face-src":
    			case "font-face-uri":
    			case "font-face-format":
    			case "font-face-name":
    			case "missing-glyph": return !1;
    			default: return !0;
    		}
    	}
    	var wb = null;
    	function xb(a) {
    		a = a.target || a.srcElement || window;
    		a.correspondingUseElement && (a = a.correspondingUseElement);
    		return 3 === a.nodeType ? a.parentNode : a;
    	}
    	var yb = null;
    	var zb = null;
    	var Ab = null;
    	function Bb(a) {
    		if (a = Cb(a)) {
    			if ("function" !== typeof yb) throw Error(p(280));
    			var b = a.stateNode;
    			b && (b = Db(b), yb(a.stateNode, a.type, b));
    		}
    	}
    	function Eb(a) {
    		zb ? Ab ? Ab.push(a) : Ab = [a] : zb = a;
    	}
    	function Fb() {
    		if (zb) {
    			var a = zb, b = Ab;
    			Ab = zb = null;
    			Bb(a);
    			if (b) for (a = 0; a < b.length; a++) Bb(b[a]);
    		}
    	}
    	function Gb(a, b) {
    		return a(b);
    	}
    	function Hb() {}
    	var Ib = !1;
    	function Jb(a, b, c) {
    		if (Ib) return a(b, c);
    		Ib = !0;
    		try {
    			return Gb(a, b, c);
    		} finally {
    			if (Ib = !1, null !== zb || null !== Ab) Hb(), Fb();
    		}
    	}
    	function Kb(a, b) {
    		var c = a.stateNode;
    		if (null === c) return null;
    		var d = Db(c);
    		if (null === d) return null;
    		c = d[b];
    		a: switch (b) {
    			case "onClick":
    			case "onClickCapture":
    			case "onDoubleClick":
    			case "onDoubleClickCapture":
    			case "onMouseDown":
    			case "onMouseDownCapture":
    			case "onMouseMove":
    			case "onMouseMoveCapture":
    			case "onMouseUp":
    			case "onMouseUpCapture":
    			case "onMouseEnter":
    				(d = !d.disabled) || (a = a.type, d = !("button" === a || "input" === a || "select" === a || "textarea" === a));
    				a = !d;
    				break a;
    			default: a = !1;
    		}
    		if (a) return null;
    		if (c && "function" !== typeof c) throw Error(p(231, b, typeof c));
    		return c;
    	}
    	var Lb = !1;
    	if (ia) try {
    		var Mb = {};
    		Object.defineProperty(Mb, "passive", { get: function() {
    			Lb = !0;
    		} });
    		window.addEventListener("test", Mb, Mb);
    		window.removeEventListener("test", Mb, Mb);
    	} catch (a) {
    		Lb = !1;
    	}
    	function Nb(a, b, c, d, e, f, g, h, k) {
    		var l = Array.prototype.slice.call(arguments, 3);
    		try {
    			b.apply(c, l);
    		} catch (m) {
    			this.onError(m);
    		}
    	}
    	var Ob = !1;
    	var Pb = null;
    	var Qb = !1;
    	var Rb = null;
    	var Sb = { onError: function(a) {
    		Ob = !0;
    		Pb = a;
    	} };
    	function Tb(a, b, c, d, e, f, g, h, k) {
    		Ob = !1;
    		Pb = null;
    		Nb.apply(Sb, arguments);
    	}
    	function Ub(a, b, c, d, e, f, g, h, k) {
    		Tb.apply(this, arguments);
    		if (Ob) {
    			if (Ob) {
    				var l = Pb;
    				Ob = !1;
    				Pb = null;
    			} else throw Error(p(198));
    			Qb || (Qb = !0, Rb = l);
    		}
    	}
    	function Vb(a) {
    		var b = a, c = a;
    		if (a.alternate) for (; b.return;) b = b.return;
    		else {
    			a = b;
    			do
    				b = a, 0 !== (b.flags & 4098) && (c = b.return), a = b.return;
    			while (a);
    		}
    		return 3 === b.tag ? c : null;
    	}
    	function Wb(a) {
    		if (13 === a.tag) {
    			var b = a.memoizedState;
    			null === b && (a = a.alternate, null !== a && (b = a.memoizedState));
    			if (null !== b) return b.dehydrated;
    		}
    		return null;
    	}
    	function Xb(a) {
    		if (Vb(a) !== a) throw Error(p(188));
    	}
    	function Yb(a) {
    		var b = a.alternate;
    		if (!b) {
    			b = Vb(a);
    			if (null === b) throw Error(p(188));
    			return b !== a ? null : a;
    		}
    		for (var c = a, d = b;;) {
    			var e = c.return;
    			if (null === e) break;
    			var f = e.alternate;
    			if (null === f) {
    				d = e.return;
    				if (null !== d) {
    					c = d;
    					continue;
    				}
    				break;
    			}
    			if (e.child === f.child) {
    				for (f = e.child; f;) {
    					if (f === c) return Xb(e), a;
    					if (f === d) return Xb(e), b;
    					f = f.sibling;
    				}
    				throw Error(p(188));
    			}
    			if (c.return !== d.return) c = e, d = f;
    			else {
    				for (var g = !1, h = e.child; h;) {
    					if (h === c) {
    						g = !0;
    						c = e;
    						d = f;
    						break;
    					}
    					if (h === d) {
    						g = !0;
    						d = e;
    						c = f;
    						break;
    					}
    					h = h.sibling;
    				}
    				if (!g) {
    					for (h = f.child; h;) {
    						if (h === c) {
    							g = !0;
    							c = f;
    							d = e;
    							break;
    						}
    						if (h === d) {
    							g = !0;
    							d = f;
    							c = e;
    							break;
    						}
    						h = h.sibling;
    					}
    					if (!g) throw Error(p(189));
    				}
    			}
    			if (c.alternate !== d) throw Error(p(190));
    		}
    		if (3 !== c.tag) throw Error(p(188));
    		return c.stateNode.current === c ? a : b;
    	}
    	function Zb(a) {
    		a = Yb(a);
    		return null !== a ? $b(a) : null;
    	}
    	function $b(a) {
    		if (5 === a.tag || 6 === a.tag) return a;
    		for (a = a.child; null !== a;) {
    			var b = $b(a);
    			if (null !== b) return b;
    			a = a.sibling;
    		}
    		return null;
    	}
    	var ac = ca.unstable_scheduleCallback;
    	var bc = ca.unstable_cancelCallback;
    	var cc = ca.unstable_shouldYield;
    	var dc = ca.unstable_requestPaint;
    	var B = ca.unstable_now;
    	var ec = ca.unstable_getCurrentPriorityLevel;
    	var fc = ca.unstable_ImmediatePriority;
    	var gc = ca.unstable_UserBlockingPriority;
    	var hc = ca.unstable_NormalPriority;
    	var ic = ca.unstable_LowPriority;
    	var jc = ca.unstable_IdlePriority;
    	var kc = null;
    	var lc = null;
    	function mc(a) {
    		if (lc && "function" === typeof lc.onCommitFiberRoot) try {
    			lc.onCommitFiberRoot(kc, a, void 0, 128 === (a.current.flags & 128));
    		} catch (b) {}
    	}
    	var oc = Math.clz32 ? Math.clz32 : nc;
    	var pc = Math.log;
    	var qc = Math.LN2;
    	function nc(a) {
    		a >>>= 0;
    		return 0 === a ? 32 : 31 - (pc(a) / qc | 0) | 0;
    	}
    	var rc = 64;
    	var sc = 4194304;
    	function tc(a) {
    		switch (a & -a) {
    			case 1: return 1;
    			case 2: return 2;
    			case 4: return 4;
    			case 8: return 8;
    			case 16: return 16;
    			case 32: return 32;
    			case 64:
    			case 128:
    			case 256:
    			case 512:
    			case 1024:
    			case 2048:
    			case 4096:
    			case 8192:
    			case 16384:
    			case 32768:
    			case 65536:
    			case 131072:
    			case 262144:
    			case 524288:
    			case 1048576:
    			case 2097152: return a & 4194240;
    			case 4194304:
    			case 8388608:
    			case 16777216:
    			case 33554432:
    			case 67108864: return a & 130023424;
    			case 134217728: return 134217728;
    			case 268435456: return 268435456;
    			case 536870912: return 536870912;
    			case 1073741824: return 1073741824;
    			default: return a;
    		}
    	}
    	function uc(a, b) {
    		var c = a.pendingLanes;
    		if (0 === c) return 0;
    		var d = 0, e = a.suspendedLanes, f = a.pingedLanes, g = c & 268435455;
    		if (0 !== g) {
    			var h = g & ~e;
    			0 !== h ? d = tc(h) : (f &= g, 0 !== f && (d = tc(f)));
    		} else g = c & ~e, 0 !== g ? d = tc(g) : 0 !== f && (d = tc(f));
    		if (0 === d) return 0;
    		if (0 !== b && b !== d && 0 === (b & e) && (e = d & -d, f = b & -b, e >= f || 16 === e && 0 !== (f & 4194240))) return b;
    		0 !== (d & 4) && (d |= c & 16);
    		b = a.entangledLanes;
    		if (0 !== b) for (a = a.entanglements, b &= d; 0 < b;) c = 31 - oc(b), e = 1 << c, d |= a[c], b &= ~e;
    		return d;
    	}
    	function vc(a, b) {
    		switch (a) {
    			case 1:
    			case 2:
    			case 4: return b + 250;
    			case 8:
    			case 16:
    			case 32:
    			case 64:
    			case 128:
    			case 256:
    			case 512:
    			case 1024:
    			case 2048:
    			case 4096:
    			case 8192:
    			case 16384:
    			case 32768:
    			case 65536:
    			case 131072:
    			case 262144:
    			case 524288:
    			case 1048576:
    			case 2097152: return b + 5e3;
    			case 4194304:
    			case 8388608:
    			case 16777216:
    			case 33554432:
    			case 67108864: return -1;
    			case 134217728:
    			case 268435456:
    			case 536870912:
    			case 1073741824: return -1;
    			default: return -1;
    		}
    	}
    	function wc(a, b) {
    		for (var c = a.suspendedLanes, d = a.pingedLanes, e = a.expirationTimes, f = a.pendingLanes; 0 < f;) {
    			var g = 31 - oc(f), h = 1 << g, k = e[g];
    			if (-1 === k) {
    				if (0 === (h & c) || 0 !== (h & d)) e[g] = vc(h, b);
    			} else k <= b && (a.expiredLanes |= h);
    			f &= ~h;
    		}
    	}
    	function xc(a) {
    		a = a.pendingLanes & -1073741825;
    		return 0 !== a ? a : a & 1073741824 ? 1073741824 : 0;
    	}
    	function yc() {
    		var a = rc;
    		rc <<= 1;
    		0 === (rc & 4194240) && (rc = 64);
    		return a;
    	}
    	function Ac(a, b, c) {
    		a.pendingLanes |= b;
    		536870912 !== b && (a.suspendedLanes = 0, a.pingedLanes = 0);
    		a = a.eventTimes;
    		b = 31 - oc(b);
    		a[b] = c;
    	}
    	function Bc(a, b) {
    		var c = a.pendingLanes & ~b;
    		a.pendingLanes = b;
    		a.suspendedLanes = 0;
    		a.pingedLanes = 0;
    		a.expiredLanes &= b;
    		a.mutableReadLanes &= b;
    		a.entangledLanes &= b;
    		b = a.entanglements;
    		var d = a.eventTimes;
    		for (a = a.expirationTimes; 0 < c;) {
    			var e = 31 - oc(c), f = 1 << e;
    			b[e] = 0;
    			d[e] = -1;
    			a[e] = -1;
    			c &= ~f;
    		}
    	}
    	function Cc(a, b) {
    		var c = a.entangledLanes |= b;
    		for (a = a.entanglements; c;) {
    			var d = 31 - oc(c), e = 1 << d;
    			e & b | a[d] & b && (a[d] |= b);
    			c &= ~e;
    		}
    	}
    	var C = 0;
    	function Dc(a) {
    		a &= -a;
    		return 1 < a ? 4 < a ? 0 !== (a & 268435455) ? 16 : 536870912 : 4 : 1;
    	}
    	var Ec;
    	var Fc;
    	var Gc;
    	var Hc;
    	var Ic;
    	var Jc = !1;
    	var Kc = [];
    	var Lc = null;
    	var Mc = null;
    	var Nc = null;
    	var Oc = /* @__PURE__ */ new Map();
    	var Pc = /* @__PURE__ */ new Map();
    	var Qc = [];
    	var Rc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
    	function Sc(a, b) {
    		switch (a) {
    			case "focusin":
    			case "focusout":
    				Lc = null;
    				break;
    			case "dragenter":
    			case "dragleave":
    				Mc = null;
    				break;
    			case "mouseover":
    			case "mouseout":
    				Nc = null;
    				break;
    			case "pointerover":
    			case "pointerout":
    				Oc.delete(b.pointerId);
    				break;
    			case "gotpointercapture":
    			case "lostpointercapture": Pc.delete(b.pointerId);
    		}
    	}
    	function Tc(a, b, c, d, e, f) {
    		if (null === a || a.nativeEvent !== f) return a = {
    			blockedOn: b,
    			domEventName: c,
    			eventSystemFlags: d,
    			nativeEvent: f,
    			targetContainers: [e]
    		}, null !== b && (b = Cb(b), null !== b && Fc(b)), a;
    		a.eventSystemFlags |= d;
    		b = a.targetContainers;
    		null !== e && -1 === b.indexOf(e) && b.push(e);
    		return a;
    	}
    	function Uc(a, b, c, d, e) {
    		switch (b) {
    			case "focusin": return Lc = Tc(Lc, a, b, c, d, e), !0;
    			case "dragenter": return Mc = Tc(Mc, a, b, c, d, e), !0;
    			case "mouseover": return Nc = Tc(Nc, a, b, c, d, e), !0;
    			case "pointerover":
    				var f = e.pointerId;
    				Oc.set(f, Tc(Oc.get(f) || null, a, b, c, d, e));
    				return !0;
    			case "gotpointercapture": return f = e.pointerId, Pc.set(f, Tc(Pc.get(f) || null, a, b, c, d, e)), !0;
    		}
    		return !1;
    	}
    	function Vc(a) {
    		var b = Wc(a.target);
    		if (null !== b) {
    			var c = Vb(b);
    			if (null !== c) {
    				if (b = c.tag, 13 === b) {
    					if (b = Wb(c), null !== b) {
    						a.blockedOn = b;
    						Ic(a.priority, function() {
    							Gc(c);
    						});
    						return;
    					}
    				} else if (3 === b && c.stateNode.current.memoizedState.isDehydrated) {
    					a.blockedOn = 3 === c.tag ? c.stateNode.containerInfo : null;
    					return;
    				}
    			}
    		}
    		a.blockedOn = null;
    	}
    	function Xc(a) {
    		if (null !== a.blockedOn) return !1;
    		for (var b = a.targetContainers; 0 < b.length;) {
    			var c = Yc(a.domEventName, a.eventSystemFlags, b[0], a.nativeEvent);
    			if (null === c) {
    				c = a.nativeEvent;
    				var d = new c.constructor(c.type, c);
    				wb = d;
    				c.target.dispatchEvent(d);
    				wb = null;
    			} else return b = Cb(c), null !== b && Fc(b), a.blockedOn = c, !1;
    			b.shift();
    		}
    		return !0;
    	}
    	function Zc(a, b, c) {
    		Xc(a) && c.delete(b);
    	}
    	function $c() {
    		Jc = !1;
    		null !== Lc && Xc(Lc) && (Lc = null);
    		null !== Mc && Xc(Mc) && (Mc = null);
    		null !== Nc && Xc(Nc) && (Nc = null);
    		Oc.forEach(Zc);
    		Pc.forEach(Zc);
    	}
    	function ad(a, b) {
    		a.blockedOn === b && (a.blockedOn = null, Jc || (Jc = !0, ca.unstable_scheduleCallback(ca.unstable_NormalPriority, $c)));
    	}
    	function bd(a) {
    		function b(b) {
    			return ad(b, a);
    		}
    		if (0 < Kc.length) {
    			ad(Kc[0], a);
    			for (var c = 1; c < Kc.length; c++) {
    				var d = Kc[c];
    				d.blockedOn === a && (d.blockedOn = null);
    			}
    		}
    		null !== Lc && ad(Lc, a);
    		null !== Mc && ad(Mc, a);
    		null !== Nc && ad(Nc, a);
    		Oc.forEach(b);
    		Pc.forEach(b);
    		for (c = 0; c < Qc.length; c++) d = Qc[c], d.blockedOn === a && (d.blockedOn = null);
    		for (; 0 < Qc.length && (c = Qc[0], null === c.blockedOn);) Vc(c), null === c.blockedOn && Qc.shift();
    	}
    	var cd = ua.ReactCurrentBatchConfig;
    	var dd = !0;
    	function ed(a, b, c, d) {
    		var e = C, f = cd.transition;
    		cd.transition = null;
    		try {
    			C = 1, fd(a, b, c, d);
    		} finally {
    			C = e, cd.transition = f;
    		}
    	}
    	function gd(a, b, c, d) {
    		var e = C, f = cd.transition;
    		cd.transition = null;
    		try {
    			C = 4, fd(a, b, c, d);
    		} finally {
    			C = e, cd.transition = f;
    		}
    	}
    	function fd(a, b, c, d) {
    		if (dd) {
    			var e = Yc(a, b, c, d);
    			if (null === e) hd(a, b, d, id, c), Sc(a, d);
    			else if (Uc(e, a, b, c, d)) d.stopPropagation();
    			else if (Sc(a, d), b & 4 && -1 < Rc.indexOf(a)) {
    				for (; null !== e;) {
    					var f = Cb(e);
    					null !== f && Ec(f);
    					f = Yc(a, b, c, d);
    					null === f && hd(a, b, d, id, c);
    					if (f === e) break;
    					e = f;
    				}
    				null !== e && d.stopPropagation();
    			} else hd(a, b, d, null, c);
    		}
    	}
    	var id = null;
    	function Yc(a, b, c, d) {
    		id = null;
    		a = xb(d);
    		a = Wc(a);
    		if (null !== a) if (b = Vb(a), null === b) a = null;
    		else if (c = b.tag, 13 === c) {
    			a = Wb(b);
    			if (null !== a) return a;
    			a = null;
    		} else if (3 === c) {
    			if (b.stateNode.current.memoizedState.isDehydrated) return 3 === b.tag ? b.stateNode.containerInfo : null;
    			a = null;
    		} else b !== a && (a = null);
    		id = a;
    		return null;
    	}
    	function jd(a) {
    		switch (a) {
    			case "cancel":
    			case "click":
    			case "close":
    			case "contextmenu":
    			case "copy":
    			case "cut":
    			case "auxclick":
    			case "dblclick":
    			case "dragend":
    			case "dragstart":
    			case "drop":
    			case "focusin":
    			case "focusout":
    			case "input":
    			case "invalid":
    			case "keydown":
    			case "keypress":
    			case "keyup":
    			case "mousedown":
    			case "mouseup":
    			case "paste":
    			case "pause":
    			case "play":
    			case "pointercancel":
    			case "pointerdown":
    			case "pointerup":
    			case "ratechange":
    			case "reset":
    			case "resize":
    			case "seeked":
    			case "submit":
    			case "touchcancel":
    			case "touchend":
    			case "touchstart":
    			case "volumechange":
    			case "change":
    			case "selectionchange":
    			case "textInput":
    			case "compositionstart":
    			case "compositionend":
    			case "compositionupdate":
    			case "beforeblur":
    			case "afterblur":
    			case "beforeinput":
    			case "blur":
    			case "fullscreenchange":
    			case "focus":
    			case "hashchange":
    			case "popstate":
    			case "select":
    			case "selectstart": return 1;
    			case "drag":
    			case "dragenter":
    			case "dragexit":
    			case "dragleave":
    			case "dragover":
    			case "mousemove":
    			case "mouseout":
    			case "mouseover":
    			case "pointermove":
    			case "pointerout":
    			case "pointerover":
    			case "scroll":
    			case "toggle":
    			case "touchmove":
    			case "wheel":
    			case "mouseenter":
    			case "mouseleave":
    			case "pointerenter":
    			case "pointerleave": return 4;
    			case "message": switch (ec()) {
    				case fc: return 1;
    				case gc: return 4;
    				case hc:
    				case ic: return 16;
    				case jc: return 536870912;
    				default: return 16;
    			}
    			default: return 16;
    		}
    	}
    	var kd = null;
    	var ld = null;
    	var md = null;
    	function nd() {
    		if (md) return md;
    		var a, b = ld, c = b.length, d, e = "value" in kd ? kd.value : kd.textContent, f = e.length;
    		for (a = 0; a < c && b[a] === e[a]; a++);
    		var g = c - a;
    		for (d = 1; d <= g && b[c - d] === e[f - d]; d++);
    		return md = e.slice(a, 1 < d ? 1 - d : void 0);
    	}
    	function od(a) {
    		var b = a.keyCode;
    		"charCode" in a ? (a = a.charCode, 0 === a && 13 === b && (a = 13)) : a = b;
    		10 === a && (a = 13);
    		return 32 <= a || 13 === a ? a : 0;
    	}
    	function pd() {
    		return !0;
    	}
    	function qd() {
    		return !1;
    	}
    	function rd(a) {
    		function b(b, d, e, f, g) {
    			this._reactName = b;
    			this._targetInst = e;
    			this.type = d;
    			this.nativeEvent = f;
    			this.target = g;
    			this.currentTarget = null;
    			for (var c in a) a.hasOwnProperty(c) && (b = a[c], this[c] = b ? b(f) : f[c]);
    			this.isDefaultPrevented = (null != f.defaultPrevented ? f.defaultPrevented : !1 === f.returnValue) ? pd : qd;
    			this.isPropagationStopped = qd;
    			return this;
    		}
    		A(b.prototype, {
    			preventDefault: function() {
    				this.defaultPrevented = !0;
    				var a = this.nativeEvent;
    				a && (a.preventDefault ? a.preventDefault() : "unknown" !== typeof a.returnValue && (a.returnValue = !1), this.isDefaultPrevented = pd);
    			},
    			stopPropagation: function() {
    				var a = this.nativeEvent;
    				a && (a.stopPropagation ? a.stopPropagation() : "unknown" !== typeof a.cancelBubble && (a.cancelBubble = !0), this.isPropagationStopped = pd);
    			},
    			persist: function() {},
    			isPersistent: pd
    		});
    		return b;
    	}
    	var sd = {
    		eventPhase: 0,
    		bubbles: 0,
    		cancelable: 0,
    		timeStamp: function(a) {
    			return a.timeStamp || Date.now();
    		},
    		defaultPrevented: 0,
    		isTrusted: 0
    	};
    	var td = rd(sd);
    	var ud = A({}, sd, {
    		view: 0,
    		detail: 0
    	});
    	var vd = rd(ud);
    	var wd;
    	var xd;
    	var yd;
    	var Ad = A({}, ud, {
    		screenX: 0,
    		screenY: 0,
    		clientX: 0,
    		clientY: 0,
    		pageX: 0,
    		pageY: 0,
    		ctrlKey: 0,
    		shiftKey: 0,
    		altKey: 0,
    		metaKey: 0,
    		getModifierState: zd,
    		button: 0,
    		buttons: 0,
    		relatedTarget: function(a) {
    			return void 0 === a.relatedTarget ? a.fromElement === a.srcElement ? a.toElement : a.fromElement : a.relatedTarget;
    		},
    		movementX: function(a) {
    			if ("movementX" in a) return a.movementX;
    			a !== yd && (yd && "mousemove" === a.type ? (wd = a.screenX - yd.screenX, xd = a.screenY - yd.screenY) : xd = wd = 0, yd = a);
    			return wd;
    		},
    		movementY: function(a) {
    			return "movementY" in a ? a.movementY : xd;
    		}
    	});
    	var Bd = rd(Ad);
    	var Dd = rd(A({}, Ad, { dataTransfer: 0 }));
    	var Fd = rd(A({}, ud, { relatedTarget: 0 }));
    	var Hd = rd(A({}, sd, {
    		animationName: 0,
    		elapsedTime: 0,
    		pseudoElement: 0
    	}));
    	var Jd = rd(A({}, sd, { clipboardData: function(a) {
    		return "clipboardData" in a ? a.clipboardData : window.clipboardData;
    	} }));
    	var Ld = rd(A({}, sd, { data: 0 }));
    	var Md = {
    		Esc: "Escape",
    		Spacebar: " ",
    		Left: "ArrowLeft",
    		Up: "ArrowUp",
    		Right: "ArrowRight",
    		Down: "ArrowDown",
    		Del: "Delete",
    		Win: "OS",
    		Menu: "ContextMenu",
    		Apps: "ContextMenu",
    		Scroll: "ScrollLock",
    		MozPrintableKey: "Unidentified"
    	};
    	var Nd = {
    		8: "Backspace",
    		9: "Tab",
    		12: "Clear",
    		13: "Enter",
    		16: "Shift",
    		17: "Control",
    		18: "Alt",
    		19: "Pause",
    		20: "CapsLock",
    		27: "Escape",
    		32: " ",
    		33: "PageUp",
    		34: "PageDown",
    		35: "End",
    		36: "Home",
    		37: "ArrowLeft",
    		38: "ArrowUp",
    		39: "ArrowRight",
    		40: "ArrowDown",
    		45: "Insert",
    		46: "Delete",
    		112: "F1",
    		113: "F2",
    		114: "F3",
    		115: "F4",
    		116: "F5",
    		117: "F6",
    		118: "F7",
    		119: "F8",
    		120: "F9",
    		121: "F10",
    		122: "F11",
    		123: "F12",
    		144: "NumLock",
    		145: "ScrollLock",
    		224: "Meta"
    	};
    	var Od = {
    		Alt: "altKey",
    		Control: "ctrlKey",
    		Meta: "metaKey",
    		Shift: "shiftKey"
    	};
    	function Pd(a) {
    		var b = this.nativeEvent;
    		return b.getModifierState ? b.getModifierState(a) : (a = Od[a]) ? !!b[a] : !1;
    	}
    	function zd() {
    		return Pd;
    	}
    	var Rd = rd(A({}, ud, {
    		key: function(a) {
    			if (a.key) {
    				var b = Md[a.key] || a.key;
    				if ("Unidentified" !== b) return b;
    			}
    			return "keypress" === a.type ? (a = od(a), 13 === a ? "Enter" : String.fromCharCode(a)) : "keydown" === a.type || "keyup" === a.type ? Nd[a.keyCode] || "Unidentified" : "";
    		},
    		code: 0,
    		location: 0,
    		ctrlKey: 0,
    		shiftKey: 0,
    		altKey: 0,
    		metaKey: 0,
    		repeat: 0,
    		locale: 0,
    		getModifierState: zd,
    		charCode: function(a) {
    			return "keypress" === a.type ? od(a) : 0;
    		},
    		keyCode: function(a) {
    			return "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
    		},
    		which: function(a) {
    			return "keypress" === a.type ? od(a) : "keydown" === a.type || "keyup" === a.type ? a.keyCode : 0;
    		}
    	}));
    	var Td = rd(A({}, Ad, {
    		pointerId: 0,
    		width: 0,
    		height: 0,
    		pressure: 0,
    		tangentialPressure: 0,
    		tiltX: 0,
    		tiltY: 0,
    		twist: 0,
    		pointerType: 0,
    		isPrimary: 0
    	}));
    	var Vd = rd(A({}, ud, {
    		touches: 0,
    		targetTouches: 0,
    		changedTouches: 0,
    		altKey: 0,
    		metaKey: 0,
    		ctrlKey: 0,
    		shiftKey: 0,
    		getModifierState: zd
    	}));
    	var Xd = rd(A({}, sd, {
    		propertyName: 0,
    		elapsedTime: 0,
    		pseudoElement: 0
    	}));
    	var Zd = rd(A({}, Ad, {
    		deltaX: function(a) {
    			return "deltaX" in a ? a.deltaX : "wheelDeltaX" in a ? -a.wheelDeltaX : 0;
    		},
    		deltaY: function(a) {
    			return "deltaY" in a ? a.deltaY : "wheelDeltaY" in a ? -a.wheelDeltaY : "wheelDelta" in a ? -a.wheelDelta : 0;
    		},
    		deltaZ: 0,
    		deltaMode: 0
    	}));
    	var $d = [
    		9,
    		13,
    		27,
    		32
    	];
    	var ae = ia && "CompositionEvent" in window;
    	var be = null;
    	ia && "documentMode" in document && (be = document.documentMode);
    	var ce = ia && "TextEvent" in window && !be;
    	var de = ia && (!ae || be && 8 < be && 11 >= be);
    	var ee = String.fromCharCode(32);
    	var fe = !1;
    	function ge(a, b) {
    		switch (a) {
    			case "keyup": return -1 !== $d.indexOf(b.keyCode);
    			case "keydown": return 229 !== b.keyCode;
    			case "keypress":
    			case "mousedown":
    			case "focusout": return !0;
    			default: return !1;
    		}
    	}
    	function he(a) {
    		a = a.detail;
    		return "object" === typeof a && "data" in a ? a.data : null;
    	}
    	var ie = !1;
    	function je(a, b) {
    		switch (a) {
    			case "compositionend": return he(b);
    			case "keypress":
    				if (32 !== b.which) return null;
    				fe = !0;
    				return ee;
    			case "textInput": return a = b.data, a === ee && fe ? null : a;
    			default: return null;
    		}
    	}
    	function ke(a, b) {
    		if (ie) return "compositionend" === a || !ae && ge(a, b) ? (a = nd(), md = ld = kd = null, ie = !1, a) : null;
    		switch (a) {
    			case "paste": return null;
    			case "keypress":
    				if (!(b.ctrlKey || b.altKey || b.metaKey) || b.ctrlKey && b.altKey) {
    					if (b.char && 1 < b.char.length) return b.char;
    					if (b.which) return String.fromCharCode(b.which);
    				}
    				return null;
    			case "compositionend": return de && "ko" !== b.locale ? null : b.data;
    			default: return null;
    		}
    	}
    	var le = {
    		color: !0,
    		date: !0,
    		datetime: !0,
    		"datetime-local": !0,
    		email: !0,
    		month: !0,
    		number: !0,
    		password: !0,
    		range: !0,
    		search: !0,
    		tel: !0,
    		text: !0,
    		time: !0,
    		url: !0,
    		week: !0
    	};
    	function me(a) {
    		var b = a && a.nodeName && a.nodeName.toLowerCase();
    		return "input" === b ? !!le[a.type] : "textarea" === b ? !0 : !1;
    	}
    	function ne(a, b, c, d) {
    		Eb(d);
    		b = oe(b, "onChange");
    		0 < b.length && (c = new td("onChange", "change", null, c, d), a.push({
    			event: c,
    			listeners: b
    		}));
    	}
    	var pe = null;
    	var qe = null;
    	function re(a) {
    		se(a, 0);
    	}
    	function te(a) {
    		if (Wa(ue(a))) return a;
    	}
    	function ve(a, b) {
    		if ("change" === a) return b;
    	}
    	var we = !1;
    	if (ia) {
    		var xe;
    		if (ia) {
    			var ye = "oninput" in document;
    			if (!ye) {
    				var ze = document.createElement("div");
    				ze.setAttribute("oninput", "return;");
    				ye = "function" === typeof ze.oninput;
    			}
    			xe = ye;
    		} else xe = !1;
    		we = xe && (!document.documentMode || 9 < document.documentMode);
    	}
    	function Ae() {
    		pe && (pe.detachEvent("onpropertychange", Be), qe = pe = null);
    	}
    	function Be(a) {
    		if ("value" === a.propertyName && te(qe)) {
    			var b = [];
    			ne(b, qe, a, xb(a));
    			Jb(re, b);
    		}
    	}
    	function Ce(a, b, c) {
    		"focusin" === a ? (Ae(), pe = b, qe = c, pe.attachEvent("onpropertychange", Be)) : "focusout" === a && Ae();
    	}
    	function De(a) {
    		if ("selectionchange" === a || "keyup" === a || "keydown" === a) return te(qe);
    	}
    	function Ee(a, b) {
    		if ("click" === a) return te(b);
    	}
    	function Fe(a, b) {
    		if ("input" === a || "change" === a) return te(b);
    	}
    	function Ge(a, b) {
    		return a === b && (0 !== a || 1 / a === 1 / b) || a !== a && b !== b;
    	}
    	var He = "function" === typeof Object.is ? Object.is : Ge;
    	function Ie(a, b) {
    		if (He(a, b)) return !0;
    		if ("object" !== typeof a || null === a || "object" !== typeof b || null === b) return !1;
    		var c = Object.keys(a), d = Object.keys(b);
    		if (c.length !== d.length) return !1;
    		for (d = 0; d < c.length; d++) {
    			var e = c[d];
    			if (!ja.call(b, e) || !He(a[e], b[e])) return !1;
    		}
    		return !0;
    	}
    	function Je(a) {
    		for (; a && a.firstChild;) a = a.firstChild;
    		return a;
    	}
    	function Ke(a, b) {
    		var c = Je(a);
    		a = 0;
    		for (var d; c;) {
    			if (3 === c.nodeType) {
    				d = a + c.textContent.length;
    				if (a <= b && d >= b) return {
    					node: c,
    					offset: b - a
    				};
    				a = d;
    			}
    			a: {
    				for (; c;) {
    					if (c.nextSibling) {
    						c = c.nextSibling;
    						break a;
    					}
    					c = c.parentNode;
    				}
    				c = void 0;
    			}
    			c = Je(c);
    		}
    	}
    	function Le(a, b) {
    		return a && b ? a === b ? !0 : a && 3 === a.nodeType ? !1 : b && 3 === b.nodeType ? Le(a, b.parentNode) : "contains" in a ? a.contains(b) : a.compareDocumentPosition ? !!(a.compareDocumentPosition(b) & 16) : !1 : !1;
    	}
    	function Me() {
    		for (var a = window, b = Xa(); b instanceof a.HTMLIFrameElement;) {
    			try {
    				var c = "string" === typeof b.contentWindow.location.href;
    			} catch (d) {
    				c = !1;
    			}
    			if (c) a = b.contentWindow;
    			else break;
    			b = Xa(a.document);
    		}
    		return b;
    	}
    	function Ne(a) {
    		var b = a && a.nodeName && a.nodeName.toLowerCase();
    		return b && ("input" === b && ("text" === a.type || "search" === a.type || "tel" === a.type || "url" === a.type || "password" === a.type) || "textarea" === b || "true" === a.contentEditable);
    	}
    	function Oe(a) {
    		var b = Me(), c = a.focusedElem, d = a.selectionRange;
    		if (b !== c && c && c.ownerDocument && Le(c.ownerDocument.documentElement, c)) {
    			if (null !== d && Ne(c)) {
    				if (b = d.start, a = d.end, void 0 === a && (a = b), "selectionStart" in c) c.selectionStart = b, c.selectionEnd = Math.min(a, c.value.length);
    				else if (a = (b = c.ownerDocument || document) && b.defaultView || window, a.getSelection) {
    					a = a.getSelection();
    					var e = c.textContent.length, f = Math.min(d.start, e);
    					d = void 0 === d.end ? f : Math.min(d.end, e);
    					!a.extend && f > d && (e = d, d = f, f = e);
    					e = Ke(c, f);
    					var g = Ke(c, d);
    					e && g && (1 !== a.rangeCount || a.anchorNode !== e.node || a.anchorOffset !== e.offset || a.focusNode !== g.node || a.focusOffset !== g.offset) && (b = b.createRange(), b.setStart(e.node, e.offset), a.removeAllRanges(), f > d ? (a.addRange(b), a.extend(g.node, g.offset)) : (b.setEnd(g.node, g.offset), a.addRange(b)));
    				}
    			}
    			b = [];
    			for (a = c; a = a.parentNode;) 1 === a.nodeType && b.push({
    				element: a,
    				left: a.scrollLeft,
    				top: a.scrollTop
    			});
    			"function" === typeof c.focus && c.focus();
    			for (c = 0; c < b.length; c++) a = b[c], a.element.scrollLeft = a.left, a.element.scrollTop = a.top;
    		}
    	}
    	var Pe = ia && "documentMode" in document && 11 >= document.documentMode;
    	var Qe = null;
    	var Re = null;
    	var Se = null;
    	var Te = !1;
    	function Ue(a, b, c) {
    		var d = c.window === c ? c.document : 9 === c.nodeType ? c : c.ownerDocument;
    		Te || null == Qe || Qe !== Xa(d) || (d = Qe, "selectionStart" in d && Ne(d) ? d = {
    			start: d.selectionStart,
    			end: d.selectionEnd
    		} : (d = (d.ownerDocument && d.ownerDocument.defaultView || window).getSelection(), d = {
    			anchorNode: d.anchorNode,
    			anchorOffset: d.anchorOffset,
    			focusNode: d.focusNode,
    			focusOffset: d.focusOffset
    		}), Se && Ie(Se, d) || (Se = d, d = oe(Re, "onSelect"), 0 < d.length && (b = new td("onSelect", "select", null, b, c), a.push({
    			event: b,
    			listeners: d
    		}), b.target = Qe)));
    	}
    	function Ve(a, b) {
    		var c = {};
    		c[a.toLowerCase()] = b.toLowerCase();
    		c["Webkit" + a] = "webkit" + b;
    		c["Moz" + a] = "moz" + b;
    		return c;
    	}
    	var We = {
    		animationend: Ve("Animation", "AnimationEnd"),
    		animationiteration: Ve("Animation", "AnimationIteration"),
    		animationstart: Ve("Animation", "AnimationStart"),
    		transitionend: Ve("Transition", "TransitionEnd")
    	};
    	var Xe = {};
    	var Ye = {};
    	ia && (Ye = document.createElement("div").style, "AnimationEvent" in window || (delete We.animationend.animation, delete We.animationiteration.animation, delete We.animationstart.animation), "TransitionEvent" in window || delete We.transitionend.transition);
    	function Ze(a) {
    		if (Xe[a]) return Xe[a];
    		if (!We[a]) return a;
    		var b = We[a], c;
    		for (c in b) if (b.hasOwnProperty(c) && c in Ye) return Xe[a] = b[c];
    		return a;
    	}
    	var $e = Ze("animationend");
    	var af = Ze("animationiteration");
    	var bf = Ze("animationstart");
    	var cf = Ze("transitionend");
    	var df = /* @__PURE__ */ new Map();
    	var ef = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    	function ff(a, b) {
    		df.set(a, b);
    		fa(b, [a]);
    	}
    	for (var gf = 0; gf < ef.length; gf++) {
    		var hf = ef[gf];
    		ff(hf.toLowerCase(), "on" + (hf[0].toUpperCase() + hf.slice(1)));
    	}
    	ff($e, "onAnimationEnd");
    	ff(af, "onAnimationIteration");
    	ff(bf, "onAnimationStart");
    	ff("dblclick", "onDoubleClick");
    	ff("focusin", "onFocus");
    	ff("focusout", "onBlur");
    	ff(cf, "onTransitionEnd");
    	ha("onMouseEnter", ["mouseout", "mouseover"]);
    	ha("onMouseLeave", ["mouseout", "mouseover"]);
    	ha("onPointerEnter", ["pointerout", "pointerover"]);
    	ha("onPointerLeave", ["pointerout", "pointerover"]);
    	fa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
    	fa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
    	fa("onBeforeInput", [
    		"compositionend",
    		"keypress",
    		"textInput",
    		"paste"
    	]);
    	fa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
    	fa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
    	fa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    	var lf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ");
    	var mf = new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
    	function nf(a, b, c) {
    		var d = a.type || "unknown-event";
    		a.currentTarget = c;
    		Ub(d, b, void 0, a);
    		a.currentTarget = null;
    	}
    	function se(a, b) {
    		b = 0 !== (b & 4);
    		for (var c = 0; c < a.length; c++) {
    			var d = a[c], e = d.event;
    			d = d.listeners;
    			a: {
    				var f = void 0;
    				if (b) for (var g = d.length - 1; 0 <= g; g--) {
    					var h = d[g], k = h.instance, l = h.currentTarget;
    					h = h.listener;
    					if (k !== f && e.isPropagationStopped()) break a;
    					nf(e, h, l);
    					f = k;
    				}
    				else for (g = 0; g < d.length; g++) {
    					h = d[g];
    					k = h.instance;
    					l = h.currentTarget;
    					h = h.listener;
    					if (k !== f && e.isPropagationStopped()) break a;
    					nf(e, h, l);
    					f = k;
    				}
    			}
    		}
    		if (Qb) throw a = Rb, Qb = !1, Rb = null, a;
    	}
    	function D(a, b) {
    		var c = b[of];
    		void 0 === c && (c = b[of] = /* @__PURE__ */ new Set());
    		var d = a + "__bubble";
    		c.has(d) || (pf(b, a, 2, !1), c.add(d));
    	}
    	function qf(a, b, c) {
    		var d = 0;
    		b && (d |= 4);
    		pf(c, a, d, b);
    	}
    	var rf = "_reactListening" + Math.random().toString(36).slice(2);
    	function sf(a) {
    		if (!a[rf]) {
    			a[rf] = !0;
    			da.forEach(function(b) {
    				"selectionchange" !== b && (mf.has(b) || qf(b, !1, a), qf(b, !0, a));
    			});
    			var b = 9 === a.nodeType ? a : a.ownerDocument;
    			null === b || b[rf] || (b[rf] = !0, qf("selectionchange", !1, b));
    		}
    	}
    	function pf(a, b, c, d) {
    		switch (jd(b)) {
    			case 1:
    				var e = ed;
    				break;
    			case 4:
    				e = gd;
    				break;
    			default: e = fd;
    		}
    		c = e.bind(null, b, c, a);
    		e = void 0;
    		!Lb || "touchstart" !== b && "touchmove" !== b && "wheel" !== b || (e = !0);
    		d ? void 0 !== e ? a.addEventListener(b, c, {
    			capture: !0,
    			passive: e
    		}) : a.addEventListener(b, c, !0) : void 0 !== e ? a.addEventListener(b, c, { passive: e }) : a.addEventListener(b, c, !1);
    	}
    	function hd(a, b, c, d, e) {
    		var f = d;
    		if (0 === (b & 1) && 0 === (b & 2) && null !== d) a: for (;;) {
    			if (null === d) return;
    			var g = d.tag;
    			if (3 === g || 4 === g) {
    				var h = d.stateNode.containerInfo;
    				if (h === e || 8 === h.nodeType && h.parentNode === e) break;
    				if (4 === g) for (g = d.return; null !== g;) {
    					var k = g.tag;
    					if (3 === k || 4 === k) {
    						if (k = g.stateNode.containerInfo, k === e || 8 === k.nodeType && k.parentNode === e) return;
    					}
    					g = g.return;
    				}
    				for (; null !== h;) {
    					g = Wc(h);
    					if (null === g) return;
    					k = g.tag;
    					if (5 === k || 6 === k) {
    						d = f = g;
    						continue a;
    					}
    					h = h.parentNode;
    				}
    			}
    			d = d.return;
    		}
    		Jb(function() {
    			var d = f, e = xb(c), g = [];
    			a: {
    				var h = df.get(a);
    				if (void 0 !== h) {
    					var k = td, n = a;
    					switch (a) {
    						case "keypress": if (0 === od(c)) break a;
    						case "keydown":
    						case "keyup":
    							k = Rd;
    							break;
    						case "focusin":
    							n = "focus";
    							k = Fd;
    							break;
    						case "focusout":
    							n = "blur";
    							k = Fd;
    							break;
    						case "beforeblur":
    						case "afterblur":
    							k = Fd;
    							break;
    						case "click": if (2 === c.button) break a;
    						case "auxclick":
    						case "dblclick":
    						case "mousedown":
    						case "mousemove":
    						case "mouseup":
    						case "mouseout":
    						case "mouseover":
    						case "contextmenu":
    							k = Bd;
    							break;
    						case "drag":
    						case "dragend":
    						case "dragenter":
    						case "dragexit":
    						case "dragleave":
    						case "dragover":
    						case "dragstart":
    						case "drop":
    							k = Dd;
    							break;
    						case "touchcancel":
    						case "touchend":
    						case "touchmove":
    						case "touchstart":
    							k = Vd;
    							break;
    						case $e:
    						case af:
    						case bf:
    							k = Hd;
    							break;
    						case cf:
    							k = Xd;
    							break;
    						case "scroll":
    							k = vd;
    							break;
    						case "wheel":
    							k = Zd;
    							break;
    						case "copy":
    						case "cut":
    						case "paste":
    							k = Jd;
    							break;
    						case "gotpointercapture":
    						case "lostpointercapture":
    						case "pointercancel":
    						case "pointerdown":
    						case "pointermove":
    						case "pointerout":
    						case "pointerover":
    						case "pointerup": k = Td;
    					}
    					var t = 0 !== (b & 4), J = !t && "scroll" === a, x = t ? null !== h ? h + "Capture" : null : h;
    					t = [];
    					for (var w = d, u; null !== w;) {
    						u = w;
    						var F = u.stateNode;
    						5 === u.tag && null !== F && (u = F, null !== x && (F = Kb(w, x), null != F && t.push(tf(w, F, u))));
    						if (J) break;
    						w = w.return;
    					}
    					0 < t.length && (h = new k(h, n, null, c, e), g.push({
    						event: h,
    						listeners: t
    					}));
    				}
    			}
    			if (0 === (b & 7)) {
    				a: {
    					h = "mouseover" === a || "pointerover" === a;
    					k = "mouseout" === a || "pointerout" === a;
    					if (h && c !== wb && (n = c.relatedTarget || c.fromElement) && (Wc(n) || n[uf])) break a;
    					if (k || h) {
    						h = e.window === e ? e : (h = e.ownerDocument) ? h.defaultView || h.parentWindow : window;
    						if (k) {
    							if (n = c.relatedTarget || c.toElement, k = d, n = n ? Wc(n) : null, null !== n && (J = Vb(n), n !== J || 5 !== n.tag && 6 !== n.tag)) n = null;
    						} else k = null, n = d;
    						if (k !== n) {
    							t = Bd;
    							F = "onMouseLeave";
    							x = "onMouseEnter";
    							w = "mouse";
    							if ("pointerout" === a || "pointerover" === a) t = Td, F = "onPointerLeave", x = "onPointerEnter", w = "pointer";
    							J = null == k ? h : ue(k);
    							u = null == n ? h : ue(n);
    							h = new t(F, w + "leave", k, c, e);
    							h.target = J;
    							h.relatedTarget = u;
    							F = null;
    							Wc(e) === d && (t = new t(x, w + "enter", n, c, e), t.target = u, t.relatedTarget = J, F = t);
    							J = F;
    							if (k && n) b: {
    								t = k;
    								x = n;
    								w = 0;
    								for (u = t; u; u = vf(u)) w++;
    								u = 0;
    								for (F = x; F; F = vf(F)) u++;
    								for (; 0 < w - u;) t = vf(t), w--;
    								for (; 0 < u - w;) x = vf(x), u--;
    								for (; w--;) {
    									if (t === x || null !== x && t === x.alternate) break b;
    									t = vf(t);
    									x = vf(x);
    								}
    								t = null;
    							}
    							else t = null;
    							null !== k && wf(g, h, k, t, !1);
    							null !== n && null !== J && wf(g, J, n, t, !0);
    						}
    					}
    				}
    				a: {
    					h = d ? ue(d) : window;
    					k = h.nodeName && h.nodeName.toLowerCase();
    					if ("select" === k || "input" === k && "file" === h.type) var na = ve;
    					else if (me(h)) if (we) na = Fe;
    					else {
    						na = De;
    						var xa = Ce;
    					}
    					else (k = h.nodeName) && "input" === k.toLowerCase() && ("checkbox" === h.type || "radio" === h.type) && (na = Ee);
    					if (na && (na = na(a, d))) {
    						ne(g, na, c, e);
    						break a;
    					}
    					xa && xa(a, h, d);
    					"focusout" === a && (xa = h._wrapperState) && xa.controlled && "number" === h.type && cb(h, "number", h.value);
    				}
    				xa = d ? ue(d) : window;
    				switch (a) {
    					case "focusin":
    						if (me(xa) || "true" === xa.contentEditable) Qe = xa, Re = d, Se = null;
    						break;
    					case "focusout":
    						Se = Re = Qe = null;
    						break;
    					case "mousedown":
    						Te = !0;
    						break;
    					case "contextmenu":
    					case "mouseup":
    					case "dragend":
    						Te = !1;
    						Ue(g, c, e);
    						break;
    					case "selectionchange": if (Pe) break;
    					case "keydown":
    					case "keyup": Ue(g, c, e);
    				}
    				var $a;
    				if (ae) b: {
    					switch (a) {
    						case "compositionstart":
    							var ba = "onCompositionStart";
    							break b;
    						case "compositionend":
    							ba = "onCompositionEnd";
    							break b;
    						case "compositionupdate":
    							ba = "onCompositionUpdate";
    							break b;
    					}
    					ba = void 0;
    				}
    				else ie ? ge(a, c) && (ba = "onCompositionEnd") : "keydown" === a && 229 === c.keyCode && (ba = "onCompositionStart");
    				ba && (de && "ko" !== c.locale && (ie || "onCompositionStart" !== ba ? "onCompositionEnd" === ba && ie && ($a = nd()) : (kd = e, ld = "value" in kd ? kd.value : kd.textContent, ie = !0)), xa = oe(d, ba), 0 < xa.length && (ba = new Ld(ba, a, null, c, e), g.push({
    					event: ba,
    					listeners: xa
    				}), $a ? ba.data = $a : ($a = he(c), null !== $a && (ba.data = $a))));
    				if ($a = ce ? je(a, c) : ke(a, c)) d = oe(d, "onBeforeInput"), 0 < d.length && (e = new Ld("onBeforeInput", "beforeinput", null, c, e), g.push({
    					event: e,
    					listeners: d
    				}), e.data = $a);
    			}
    			se(g, b);
    		});
    	}
    	function tf(a, b, c) {
    		return {
    			instance: a,
    			listener: b,
    			currentTarget: c
    		};
    	}
    	function oe(a, b) {
    		for (var c = b + "Capture", d = []; null !== a;) {
    			var e = a, f = e.stateNode;
    			5 === e.tag && null !== f && (e = f, f = Kb(a, c), null != f && d.unshift(tf(a, f, e)), f = Kb(a, b), null != f && d.push(tf(a, f, e)));
    			a = a.return;
    		}
    		return d;
    	}
    	function vf(a) {
    		if (null === a) return null;
    		do
    			a = a.return;
    		while (a && 5 !== a.tag);
    		return a ? a : null;
    	}
    	function wf(a, b, c, d, e) {
    		for (var f = b._reactName, g = []; null !== c && c !== d;) {
    			var h = c, k = h.alternate, l = h.stateNode;
    			if (null !== k && k === d) break;
    			5 === h.tag && null !== l && (h = l, e ? (k = Kb(c, f), null != k && g.unshift(tf(c, k, h))) : e || (k = Kb(c, f), null != k && g.push(tf(c, k, h))));
    			c = c.return;
    		}
    		0 !== g.length && a.push({
    			event: b,
    			listeners: g
    		});
    	}
    	var xf = /\r\n?/g;
    	var yf = /\u0000|\uFFFD/g;
    	function zf(a) {
    		return ("string" === typeof a ? a : "" + a).replace(xf, "\n").replace(yf, "");
    	}
    	function Af(a, b, c) {
    		b = zf(b);
    		if (zf(a) !== b && c) throw Error(p(425));
    	}
    	function Bf() {}
    	var Cf = null;
    	var Df = null;
    	function Ef(a, b) {
    		return "textarea" === a || "noscript" === a || "string" === typeof b.children || "number" === typeof b.children || "object" === typeof b.dangerouslySetInnerHTML && null !== b.dangerouslySetInnerHTML && null != b.dangerouslySetInnerHTML.__html;
    	}
    	var Ff = "function" === typeof setTimeout ? setTimeout : void 0;
    	var Gf = "function" === typeof clearTimeout ? clearTimeout : void 0;
    	var Hf = "function" === typeof Promise ? Promise : void 0;
    	var Jf = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof Hf ? function(a) {
    		return Hf.resolve(null).then(a).catch(If);
    	} : Ff;
    	function If(a) {
    		setTimeout(function() {
    			throw a;
    		});
    	}
    	function Kf(a, b) {
    		var c = b, d = 0;
    		do {
    			var e = c.nextSibling;
    			a.removeChild(c);
    			if (e && 8 === e.nodeType) if (c = e.data, "/$" === c) {
    				if (0 === d) {
    					a.removeChild(e);
    					bd(b);
    					return;
    				}
    				d--;
    			} else "$" !== c && "$?" !== c && "$!" !== c || d++;
    			c = e;
    		} while (c);
    		bd(b);
    	}
    	function Lf(a) {
    		for (; null != a; a = a.nextSibling) {
    			var b = a.nodeType;
    			if (1 === b || 3 === b) break;
    			if (8 === b) {
    				b = a.data;
    				if ("$" === b || "$!" === b || "$?" === b) break;
    				if ("/$" === b) return null;
    			}
    		}
    		return a;
    	}
    	function Mf(a) {
    		a = a.previousSibling;
    		for (var b = 0; a;) {
    			if (8 === a.nodeType) {
    				var c = a.data;
    				if ("$" === c || "$!" === c || "$?" === c) {
    					if (0 === b) return a;
    					b--;
    				} else "/$" === c && b++;
    			}
    			a = a.previousSibling;
    		}
    		return null;
    	}
    	var Nf = Math.random().toString(36).slice(2);
    	var Of = "__reactFiber$" + Nf;
    	var Pf = "__reactProps$" + Nf;
    	var uf = "__reactContainer$" + Nf;
    	var of = "__reactEvents$" + Nf;
    	var Qf = "__reactListeners$" + Nf;
    	var Rf = "__reactHandles$" + Nf;
    	function Wc(a) {
    		var b = a[Of];
    		if (b) return b;
    		for (var c = a.parentNode; c;) {
    			if (b = c[uf] || c[Of]) {
    				c = b.alternate;
    				if (null !== b.child || null !== c && null !== c.child) for (a = Mf(a); null !== a;) {
    					if (c = a[Of]) return c;
    					a = Mf(a);
    				}
    				return b;
    			}
    			a = c;
    			c = a.parentNode;
    		}
    		return null;
    	}
    	function Cb(a) {
    		a = a[Of] || a[uf];
    		return !a || 5 !== a.tag && 6 !== a.tag && 13 !== a.tag && 3 !== a.tag ? null : a;
    	}
    	function ue(a) {
    		if (5 === a.tag || 6 === a.tag) return a.stateNode;
    		throw Error(p(33));
    	}
    	function Db(a) {
    		return a[Pf] || null;
    	}
    	var Sf = [];
    	var Tf = -1;
    	function Uf(a) {
    		return { current: a };
    	}
    	function E(a) {
    		0 > Tf || (a.current = Sf[Tf], Sf[Tf] = null, Tf--);
    	}
    	function G(a, b) {
    		Tf++;
    		Sf[Tf] = a.current;
    		a.current = b;
    	}
    	var Vf = {};
    	var H = Uf(Vf);
    	var Wf = Uf(!1);
    	var Xf = Vf;
    	function Yf(a, b) {
    		var c = a.type.contextTypes;
    		if (!c) return Vf;
    		var d = a.stateNode;
    		if (d && d.__reactInternalMemoizedUnmaskedChildContext === b) return d.__reactInternalMemoizedMaskedChildContext;
    		var e = {}, f;
    		for (f in c) e[f] = b[f];
    		d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = b, a.__reactInternalMemoizedMaskedChildContext = e);
    		return e;
    	}
    	function Zf(a) {
    		a = a.childContextTypes;
    		return null !== a && void 0 !== a;
    	}
    	function $f() {
    		E(Wf);
    		E(H);
    	}
    	function ag(a, b, c) {
    		if (H.current !== Vf) throw Error(p(168));
    		G(H, b);
    		G(Wf, c);
    	}
    	function bg(a, b, c) {
    		var d = a.stateNode;
    		b = b.childContextTypes;
    		if ("function" !== typeof d.getChildContext) return c;
    		d = d.getChildContext();
    		for (var e in d) if (!(e in b)) throw Error(p(108, Ra(a) || "Unknown", e));
    		return A({}, c, d);
    	}
    	function cg(a) {
    		a = (a = a.stateNode) && a.__reactInternalMemoizedMergedChildContext || Vf;
    		Xf = H.current;
    		G(H, a);
    		G(Wf, Wf.current);
    		return !0;
    	}
    	function dg(a, b, c) {
    		var d = a.stateNode;
    		if (!d) throw Error(p(169));
    		c ? (a = bg(a, b, Xf), d.__reactInternalMemoizedMergedChildContext = a, E(Wf), E(H), G(H, a)) : E(Wf);
    		G(Wf, c);
    	}
    	var eg = null;
    	var fg = !1;
    	var gg = !1;
    	function hg(a) {
    		null === eg ? eg = [a] : eg.push(a);
    	}
    	function ig(a) {
    		fg = !0;
    		hg(a);
    	}
    	function jg() {
    		if (!gg && null !== eg) {
    			gg = !0;
    			var a = 0, b = C;
    			try {
    				var c = eg;
    				for (C = 1; a < c.length; a++) {
    					var d = c[a];
    					do
    						d = d(!0);
    					while (null !== d);
    				}
    				eg = null;
    				fg = !1;
    			} catch (e) {
    				throw null !== eg && (eg = eg.slice(a + 1)), ac(fc, jg), e;
    			} finally {
    				C = b, gg = !1;
    			}
    		}
    		return null;
    	}
    	var kg = [];
    	var lg = 0;
    	var mg = null;
    	var ng = 0;
    	var og = [];
    	var pg = 0;
    	var qg = null;
    	var rg = 1;
    	var sg = "";
    	function tg(a, b) {
    		kg[lg++] = ng;
    		kg[lg++] = mg;
    		mg = a;
    		ng = b;
    	}
    	function ug(a, b, c) {
    		og[pg++] = rg;
    		og[pg++] = sg;
    		og[pg++] = qg;
    		qg = a;
    		var d = rg;
    		a = sg;
    		var e = 32 - oc(d) - 1;
    		d &= ~(1 << e);
    		c += 1;
    		var f = 32 - oc(b) + e;
    		if (30 < f) {
    			var g = e - e % 5;
    			f = (d & (1 << g) - 1).toString(32);
    			d >>= g;
    			e -= g;
    			rg = 1 << 32 - oc(b) + e | c << e | d;
    			sg = f + a;
    		} else rg = 1 << f | c << e | d, sg = a;
    	}
    	function vg(a) {
    		null !== a.return && (tg(a, 1), ug(a, 1, 0));
    	}
    	function wg(a) {
    		for (; a === mg;) mg = kg[--lg], kg[lg] = null, ng = kg[--lg], kg[lg] = null;
    		for (; a === qg;) qg = og[--pg], og[pg] = null, sg = og[--pg], og[pg] = null, rg = og[--pg], og[pg] = null;
    	}
    	var xg = null;
    	var yg = null;
    	var I = !1;
    	var zg = null;
    	function Ag(a, b) {
    		var c = Bg(5, null, null, 0);
    		c.elementType = "DELETED";
    		c.stateNode = b;
    		c.return = a;
    		b = a.deletions;
    		null === b ? (a.deletions = [c], a.flags |= 16) : b.push(c);
    	}
    	function Cg(a, b) {
    		switch (a.tag) {
    			case 5:
    				var c = a.type;
    				b = 1 !== b.nodeType || c.toLowerCase() !== b.nodeName.toLowerCase() ? null : b;
    				return null !== b ? (a.stateNode = b, xg = a, yg = Lf(b.firstChild), !0) : !1;
    			case 6: return b = "" === a.pendingProps || 3 !== b.nodeType ? null : b, null !== b ? (a.stateNode = b, xg = a, yg = null, !0) : !1;
    			case 13: return b = 8 !== b.nodeType ? null : b, null !== b ? (c = null !== qg ? {
    				id: rg,
    				overflow: sg
    			} : null, a.memoizedState = {
    				dehydrated: b,
    				treeContext: c,
    				retryLane: 1073741824
    			}, c = Bg(18, null, null, 0), c.stateNode = b, c.return = a, a.child = c, xg = a, yg = null, !0) : !1;
    			default: return !1;
    		}
    	}
    	function Dg(a) {
    		return 0 !== (a.mode & 1) && 0 === (a.flags & 128);
    	}
    	function Eg(a) {
    		if (I) {
    			var b = yg;
    			if (b) {
    				var c = b;
    				if (!Cg(a, b)) {
    					if (Dg(a)) throw Error(p(418));
    					b = Lf(c.nextSibling);
    					var d = xg;
    					b && Cg(a, b) ? Ag(d, c) : (a.flags = a.flags & -4097 | 2, I = !1, xg = a);
    				}
    			} else {
    				if (Dg(a)) throw Error(p(418));
    				a.flags = a.flags & -4097 | 2;
    				I = !1;
    				xg = a;
    			}
    		}
    	}
    	function Fg(a) {
    		for (a = a.return; null !== a && 5 !== a.tag && 3 !== a.tag && 13 !== a.tag;) a = a.return;
    		xg = a;
    	}
    	function Gg(a) {
    		if (a !== xg) return !1;
    		if (!I) return Fg(a), I = !0, !1;
    		var b;
    		(b = 3 !== a.tag) && !(b = 5 !== a.tag) && (b = a.type, b = "head" !== b && "body" !== b && !Ef(a.type, a.memoizedProps));
    		if (b && (b = yg)) {
    			if (Dg(a)) throw Hg(), Error(p(418));
    			for (; b;) Ag(a, b), b = Lf(b.nextSibling);
    		}
    		Fg(a);
    		if (13 === a.tag) {
    			a = a.memoizedState;
    			a = null !== a ? a.dehydrated : null;
    			if (!a) throw Error(p(317));
    			a: {
    				a = a.nextSibling;
    				for (b = 0; a;) {
    					if (8 === a.nodeType) {
    						var c = a.data;
    						if ("/$" === c) {
    							if (0 === b) {
    								yg = Lf(a.nextSibling);
    								break a;
    							}
    							b--;
    						} else "$" !== c && "$!" !== c && "$?" !== c || b++;
    					}
    					a = a.nextSibling;
    				}
    				yg = null;
    			}
    		} else yg = xg ? Lf(a.stateNode.nextSibling) : null;
    		return !0;
    	}
    	function Hg() {
    		for (var a = yg; a;) a = Lf(a.nextSibling);
    	}
    	function Ig() {
    		yg = xg = null;
    		I = !1;
    	}
    	function Jg(a) {
    		null === zg ? zg = [a] : zg.push(a);
    	}
    	var Kg = ua.ReactCurrentBatchConfig;
    	function Lg(a, b, c) {
    		a = c.ref;
    		if (null !== a && "function" !== typeof a && "object" !== typeof a) {
    			if (c._owner) {
    				c = c._owner;
    				if (c) {
    					if (1 !== c.tag) throw Error(p(309));
    					var d = c.stateNode;
    				}
    				if (!d) throw Error(p(147, a));
    				var e = d, f = "" + a;
    				if (null !== b && null !== b.ref && "function" === typeof b.ref && b.ref._stringRef === f) return b.ref;
    				b = function(a) {
    					var b = e.refs;
    					null === a ? delete b[f] : b[f] = a;
    				};
    				b._stringRef = f;
    				return b;
    			}
    			if ("string" !== typeof a) throw Error(p(284));
    			if (!c._owner) throw Error(p(290, a));
    		}
    		return a;
    	}
    	function Mg(a, b) {
    		a = Object.prototype.toString.call(b);
    		throw Error(p(31, "[object Object]" === a ? "object with keys {" + Object.keys(b).join(", ") + "}" : a));
    	}
    	function Ng(a) {
    		var b = a._init;
    		return b(a._payload);
    	}
    	function Og(a) {
    		function b(b, c) {
    			if (a) {
    				var d = b.deletions;
    				null === d ? (b.deletions = [c], b.flags |= 16) : d.push(c);
    			}
    		}
    		function c(c, d) {
    			if (!a) return null;
    			for (; null !== d;) b(c, d), d = d.sibling;
    			return null;
    		}
    		function d(a, b) {
    			for (a = /* @__PURE__ */ new Map(); null !== b;) null !== b.key ? a.set(b.key, b) : a.set(b.index, b), b = b.sibling;
    			return a;
    		}
    		function e(a, b) {
    			a = Pg(a, b);
    			a.index = 0;
    			a.sibling = null;
    			return a;
    		}
    		function f(b, c, d) {
    			b.index = d;
    			if (!a) return b.flags |= 1048576, c;
    			d = b.alternate;
    			if (null !== d) return d = d.index, d < c ? (b.flags |= 2, c) : d;
    			b.flags |= 2;
    			return c;
    		}
    		function g(b) {
    			a && null === b.alternate && (b.flags |= 2);
    			return b;
    		}
    		function h(a, b, c, d) {
    			if (null === b || 6 !== b.tag) return b = Qg(c, a.mode, d), b.return = a, b;
    			b = e(b, c);
    			b.return = a;
    			return b;
    		}
    		function k(a, b, c, d) {
    			var f = c.type;
    			if (f === ya) return m(a, b, c.props.children, d, c.key);
    			if (null !== b && (b.elementType === f || "object" === typeof f && null !== f && f.$$typeof === Ha && Ng(f) === b.type)) return d = e(b, c.props), d.ref = Lg(a, b, c), d.return = a, d;
    			d = Rg(c.type, c.key, c.props, null, a.mode, d);
    			d.ref = Lg(a, b, c);
    			d.return = a;
    			return d;
    		}
    		function l(a, b, c, d) {
    			if (null === b || 4 !== b.tag || b.stateNode.containerInfo !== c.containerInfo || b.stateNode.implementation !== c.implementation) return b = Sg(c, a.mode, d), b.return = a, b;
    			b = e(b, c.children || []);
    			b.return = a;
    			return b;
    		}
    		function m(a, b, c, d, f) {
    			if (null === b || 7 !== b.tag) return b = Tg(c, a.mode, d, f), b.return = a, b;
    			b = e(b, c);
    			b.return = a;
    			return b;
    		}
    		function q(a, b, c) {
    			if ("string" === typeof b && "" !== b || "number" === typeof b) return b = Qg("" + b, a.mode, c), b.return = a, b;
    			if ("object" === typeof b && null !== b) {
    				switch (b.$$typeof) {
    					case va: return c = Rg(b.type, b.key, b.props, null, a.mode, c), c.ref = Lg(a, null, b), c.return = a, c;
    					case wa: return b = Sg(b, a.mode, c), b.return = a, b;
    					case Ha:
    						var d = b._init;
    						return q(a, d(b._payload), c);
    				}
    				if (eb(b) || Ka(b)) return b = Tg(b, a.mode, c, null), b.return = a, b;
    				Mg(a, b);
    			}
    			return null;
    		}
    		function r(a, b, c, d) {
    			var e = null !== b ? b.key : null;
    			if ("string" === typeof c && "" !== c || "number" === typeof c) return null !== e ? null : h(a, b, "" + c, d);
    			if ("object" === typeof c && null !== c) {
    				switch (c.$$typeof) {
    					case va: return c.key === e ? k(a, b, c, d) : null;
    					case wa: return c.key === e ? l(a, b, c, d) : null;
    					case Ha: return e = c._init, r(a, b, e(c._payload), d);
    				}
    				if (eb(c) || Ka(c)) return null !== e ? null : m(a, b, c, d, null);
    				Mg(a, c);
    			}
    			return null;
    		}
    		function y(a, b, c, d, e) {
    			if ("string" === typeof d && "" !== d || "number" === typeof d) return a = a.get(c) || null, h(b, a, "" + d, e);
    			if ("object" === typeof d && null !== d) {
    				switch (d.$$typeof) {
    					case va: return a = a.get(null === d.key ? c : d.key) || null, k(b, a, d, e);
    					case wa: return a = a.get(null === d.key ? c : d.key) || null, l(b, a, d, e);
    					case Ha:
    						var f = d._init;
    						return y(a, b, c, f(d._payload), e);
    				}
    				if (eb(d) || Ka(d)) return a = a.get(c) || null, m(b, a, d, e, null);
    				Mg(b, d);
    			}
    			return null;
    		}
    		function n(e, g, h, k) {
    			for (var l = null, m = null, u = g, w = g = 0, x = null; null !== u && w < h.length; w++) {
    				u.index > w ? (x = u, u = null) : x = u.sibling;
    				var n = r(e, u, h[w], k);
    				if (null === n) {
    					null === u && (u = x);
    					break;
    				}
    				a && u && null === n.alternate && b(e, u);
    				g = f(n, g, w);
    				null === m ? l = n : m.sibling = n;
    				m = n;
    				u = x;
    			}
    			if (w === h.length) return c(e, u), I && tg(e, w), l;
    			if (null === u) {
    				for (; w < h.length; w++) u = q(e, h[w], k), null !== u && (g = f(u, g, w), null === m ? l = u : m.sibling = u, m = u);
    				I && tg(e, w);
    				return l;
    			}
    			for (u = d(e, u); w < h.length; w++) x = y(u, e, w, h[w], k), null !== x && (a && null !== x.alternate && u.delete(null === x.key ? w : x.key), g = f(x, g, w), null === m ? l = x : m.sibling = x, m = x);
    			a && u.forEach(function(a) {
    				return b(e, a);
    			});
    			I && tg(e, w);
    			return l;
    		}
    		function t(e, g, h, k) {
    			var l = Ka(h);
    			if ("function" !== typeof l) throw Error(p(150));
    			h = l.call(h);
    			if (null == h) throw Error(p(151));
    			for (var u = l = null, m = g, w = g = 0, x = null, n = h.next(); null !== m && !n.done; w++, n = h.next()) {
    				m.index > w ? (x = m, m = null) : x = m.sibling;
    				var t = r(e, m, n.value, k);
    				if (null === t) {
    					null === m && (m = x);
    					break;
    				}
    				a && m && null === t.alternate && b(e, m);
    				g = f(t, g, w);
    				null === u ? l = t : u.sibling = t;
    				u = t;
    				m = x;
    			}
    			if (n.done) return c(e, m), I && tg(e, w), l;
    			if (null === m) {
    				for (; !n.done; w++, n = h.next()) n = q(e, n.value, k), null !== n && (g = f(n, g, w), null === u ? l = n : u.sibling = n, u = n);
    				I && tg(e, w);
    				return l;
    			}
    			for (m = d(e, m); !n.done; w++, n = h.next()) n = y(m, e, w, n.value, k), null !== n && (a && null !== n.alternate && m.delete(null === n.key ? w : n.key), g = f(n, g, w), null === u ? l = n : u.sibling = n, u = n);
    			a && m.forEach(function(a) {
    				return b(e, a);
    			});
    			I && tg(e, w);
    			return l;
    		}
    		function J(a, d, f, h) {
    			"object" === typeof f && null !== f && f.type === ya && null === f.key && (f = f.props.children);
    			if ("object" === typeof f && null !== f) {
    				switch (f.$$typeof) {
    					case va:
    						a: {
    							for (var k = f.key, l = d; null !== l;) {
    								if (l.key === k) {
    									k = f.type;
    									if (k === ya) {
    										if (7 === l.tag) {
    											c(a, l.sibling);
    											d = e(l, f.props.children);
    											d.return = a;
    											a = d;
    											break a;
    										}
    									} else if (l.elementType === k || "object" === typeof k && null !== k && k.$$typeof === Ha && Ng(k) === l.type) {
    										c(a, l.sibling);
    										d = e(l, f.props);
    										d.ref = Lg(a, l, f);
    										d.return = a;
    										a = d;
    										break a;
    									}
    									c(a, l);
    									break;
    								} else b(a, l);
    								l = l.sibling;
    							}
    							f.type === ya ? (d = Tg(f.props.children, a.mode, h, f.key), d.return = a, a = d) : (h = Rg(f.type, f.key, f.props, null, a.mode, h), h.ref = Lg(a, d, f), h.return = a, a = h);
    						}
    						return g(a);
    					case wa:
    						a: {
    							for (l = f.key; null !== d;) {
    								if (d.key === l) if (4 === d.tag && d.stateNode.containerInfo === f.containerInfo && d.stateNode.implementation === f.implementation) {
    									c(a, d.sibling);
    									d = e(d, f.children || []);
    									d.return = a;
    									a = d;
    									break a;
    								} else {
    									c(a, d);
    									break;
    								}
    								else b(a, d);
    								d = d.sibling;
    							}
    							d = Sg(f, a.mode, h);
    							d.return = a;
    							a = d;
    						}
    						return g(a);
    					case Ha: return l = f._init, J(a, d, l(f._payload), h);
    				}
    				if (eb(f)) return n(a, d, f, h);
    				if (Ka(f)) return t(a, d, f, h);
    				Mg(a, f);
    			}
    			return "string" === typeof f && "" !== f || "number" === typeof f ? (f = "" + f, null !== d && 6 === d.tag ? (c(a, d.sibling), d = e(d, f), d.return = a, a = d) : (c(a, d), d = Qg(f, a.mode, h), d.return = a, a = d), g(a)) : c(a, d);
    		}
    		return J;
    	}
    	var Ug = Og(!0);
    	var Vg = Og(!1);
    	var Wg = Uf(null);
    	var Xg = null;
    	var Yg = null;
    	var Zg = null;
    	function $g() {
    		Zg = Yg = Xg = null;
    	}
    	function ah(a) {
    		var b = Wg.current;
    		E(Wg);
    		a._currentValue = b;
    	}
    	function bh(a, b, c) {
    		for (; null !== a;) {
    			var d = a.alternate;
    			(a.childLanes & b) !== b ? (a.childLanes |= b, null !== d && (d.childLanes |= b)) : null !== d && (d.childLanes & b) !== b && (d.childLanes |= b);
    			if (a === c) break;
    			a = a.return;
    		}
    	}
    	function ch(a, b) {
    		Xg = a;
    		Zg = Yg = null;
    		a = a.dependencies;
    		null !== a && null !== a.firstContext && (0 !== (a.lanes & b) && (dh = !0), a.firstContext = null);
    	}
    	function eh(a) {
    		var b = a._currentValue;
    		if (Zg !== a) if (a = {
    			context: a,
    			memoizedValue: b,
    			next: null
    		}, null === Yg) {
    			if (null === Xg) throw Error(p(308));
    			Yg = a;
    			Xg.dependencies = {
    				lanes: 0,
    				firstContext: a
    			};
    		} else Yg = Yg.next = a;
    		return b;
    	}
    	var fh = null;
    	function gh(a) {
    		null === fh ? fh = [a] : fh.push(a);
    	}
    	function hh(a, b, c, d) {
    		var e = b.interleaved;
    		null === e ? (c.next = c, gh(b)) : (c.next = e.next, e.next = c);
    		b.interleaved = c;
    		return ih(a, d);
    	}
    	function ih(a, b) {
    		a.lanes |= b;
    		var c = a.alternate;
    		null !== c && (c.lanes |= b);
    		c = a;
    		for (a = a.return; null !== a;) a.childLanes |= b, c = a.alternate, null !== c && (c.childLanes |= b), c = a, a = a.return;
    		return 3 === c.tag ? c.stateNode : null;
    	}
    	var jh = !1;
    	function kh(a) {
    		a.updateQueue = {
    			baseState: a.memoizedState,
    			firstBaseUpdate: null,
    			lastBaseUpdate: null,
    			shared: {
    				pending: null,
    				interleaved: null,
    				lanes: 0
    			},
    			effects: null
    		};
    	}
    	function lh(a, b) {
    		a = a.updateQueue;
    		b.updateQueue === a && (b.updateQueue = {
    			baseState: a.baseState,
    			firstBaseUpdate: a.firstBaseUpdate,
    			lastBaseUpdate: a.lastBaseUpdate,
    			shared: a.shared,
    			effects: a.effects
    		});
    	}
    	function mh(a, b) {
    		return {
    			eventTime: a,
    			lane: b,
    			tag: 0,
    			payload: null,
    			callback: null,
    			next: null
    		};
    	}
    	function nh(a, b, c) {
    		var d = a.updateQueue;
    		if (null === d) return null;
    		d = d.shared;
    		if (0 !== (K & 2)) {
    			var e = d.pending;
    			null === e ? b.next = b : (b.next = e.next, e.next = b);
    			d.pending = b;
    			return ih(a, c);
    		}
    		e = d.interleaved;
    		null === e ? (b.next = b, gh(d)) : (b.next = e.next, e.next = b);
    		d.interleaved = b;
    		return ih(a, c);
    	}
    	function oh(a, b, c) {
    		b = b.updateQueue;
    		if (null !== b && (b = b.shared, 0 !== (c & 4194240))) {
    			var d = b.lanes;
    			d &= a.pendingLanes;
    			c |= d;
    			b.lanes = c;
    			Cc(a, c);
    		}
    	}
    	function ph(a, b) {
    		var c = a.updateQueue, d = a.alternate;
    		if (null !== d && (d = d.updateQueue, c === d)) {
    			var e = null, f = null;
    			c = c.firstBaseUpdate;
    			if (null !== c) {
    				do {
    					var g = {
    						eventTime: c.eventTime,
    						lane: c.lane,
    						tag: c.tag,
    						payload: c.payload,
    						callback: c.callback,
    						next: null
    					};
    					null === f ? e = f = g : f = f.next = g;
    					c = c.next;
    				} while (null !== c);
    				null === f ? e = f = b : f = f.next = b;
    			} else e = f = b;
    			c = {
    				baseState: d.baseState,
    				firstBaseUpdate: e,
    				lastBaseUpdate: f,
    				shared: d.shared,
    				effects: d.effects
    			};
    			a.updateQueue = c;
    			return;
    		}
    		a = c.lastBaseUpdate;
    		null === a ? c.firstBaseUpdate = b : a.next = b;
    		c.lastBaseUpdate = b;
    	}
    	function qh(a, b, c, d) {
    		var e = a.updateQueue;
    		jh = !1;
    		var f = e.firstBaseUpdate, g = e.lastBaseUpdate, h = e.shared.pending;
    		if (null !== h) {
    			e.shared.pending = null;
    			var k = h, l = k.next;
    			k.next = null;
    			null === g ? f = l : g.next = l;
    			g = k;
    			var m = a.alternate;
    			null !== m && (m = m.updateQueue, h = m.lastBaseUpdate, h !== g && (null === h ? m.firstBaseUpdate = l : h.next = l, m.lastBaseUpdate = k));
    		}
    		if (null !== f) {
    			var q = e.baseState;
    			g = 0;
    			m = l = k = null;
    			h = f;
    			do {
    				var r = h.lane, y = h.eventTime;
    				if ((d & r) === r) {
    					null !== m && (m = m.next = {
    						eventTime: y,
    						lane: 0,
    						tag: h.tag,
    						payload: h.payload,
    						callback: h.callback,
    						next: null
    					});
    					a: {
    						var n = a, t = h;
    						r = b;
    						y = c;
    						switch (t.tag) {
    							case 1:
    								n = t.payload;
    								if ("function" === typeof n) {
    									q = n.call(y, q, r);
    									break a;
    								}
    								q = n;
    								break a;
    							case 3: n.flags = n.flags & -65537 | 128;
    							case 0:
    								n = t.payload;
    								r = "function" === typeof n ? n.call(y, q, r) : n;
    								if (null === r || void 0 === r) break a;
    								q = A({}, q, r);
    								break a;
    							case 2: jh = !0;
    						}
    					}
    					null !== h.callback && 0 !== h.lane && (a.flags |= 64, r = e.effects, null === r ? e.effects = [h] : r.push(h));
    				} else y = {
    					eventTime: y,
    					lane: r,
    					tag: h.tag,
    					payload: h.payload,
    					callback: h.callback,
    					next: null
    				}, null === m ? (l = m = y, k = q) : m = m.next = y, g |= r;
    				h = h.next;
    				if (null === h) if (h = e.shared.pending, null === h) break;
    				else r = h, h = r.next, r.next = null, e.lastBaseUpdate = r, e.shared.pending = null;
    			} while (1);
    			null === m && (k = q);
    			e.baseState = k;
    			e.firstBaseUpdate = l;
    			e.lastBaseUpdate = m;
    			b = e.shared.interleaved;
    			if (null !== b) {
    				e = b;
    				do
    					g |= e.lane, e = e.next;
    				while (e !== b);
    			} else null === f && (e.shared.lanes = 0);
    			rh |= g;
    			a.lanes = g;
    			a.memoizedState = q;
    		}
    	}
    	function sh(a, b, c) {
    		a = b.effects;
    		b.effects = null;
    		if (null !== a) for (b = 0; b < a.length; b++) {
    			var d = a[b], e = d.callback;
    			if (null !== e) {
    				d.callback = null;
    				d = c;
    				if ("function" !== typeof e) throw Error(p(191, e));
    				e.call(d);
    			}
    		}
    	}
    	var th = {};
    	var uh = Uf(th);
    	var vh = Uf(th);
    	var wh = Uf(th);
    	function xh(a) {
    		if (a === th) throw Error(p(174));
    		return a;
    	}
    	function yh(a, b) {
    		G(wh, b);
    		G(vh, a);
    		G(uh, th);
    		a = b.nodeType;
    		switch (a) {
    			case 9:
    			case 11:
    				b = (b = b.documentElement) ? b.namespaceURI : lb(null, "");
    				break;
    			default: a = 8 === a ? b.parentNode : b, b = a.namespaceURI || null, a = a.tagName, b = lb(b, a);
    		}
    		E(uh);
    		G(uh, b);
    	}
    	function zh() {
    		E(uh);
    		E(vh);
    		E(wh);
    	}
    	function Ah(a) {
    		xh(wh.current);
    		var b = xh(uh.current);
    		var c = lb(b, a.type);
    		b !== c && (G(vh, a), G(uh, c));
    	}
    	function Bh(a) {
    		vh.current === a && (E(uh), E(vh));
    	}
    	var L = Uf(0);
    	function Ch(a) {
    		for (var b = a; null !== b;) {
    			if (13 === b.tag) {
    				var c = b.memoizedState;
    				if (null !== c && (c = c.dehydrated, null === c || "$?" === c.data || "$!" === c.data)) return b;
    			} else if (19 === b.tag && void 0 !== b.memoizedProps.revealOrder) {
    				if (0 !== (b.flags & 128)) return b;
    			} else if (null !== b.child) {
    				b.child.return = b;
    				b = b.child;
    				continue;
    			}
    			if (b === a) break;
    			for (; null === b.sibling;) {
    				if (null === b.return || b.return === a) return null;
    				b = b.return;
    			}
    			b.sibling.return = b.return;
    			b = b.sibling;
    		}
    		return null;
    	}
    	var Dh = [];
    	function Eh() {
    		for (var a = 0; a < Dh.length; a++) Dh[a]._workInProgressVersionPrimary = null;
    		Dh.length = 0;
    	}
    	var Fh = ua.ReactCurrentDispatcher;
    	var Gh = ua.ReactCurrentBatchConfig;
    	var Hh = 0;
    	var M = null;
    	var N = null;
    	var O = null;
    	var Ih = !1;
    	var Jh = !1;
    	var Kh = 0;
    	var Lh = 0;
    	function P() {
    		throw Error(p(321));
    	}
    	function Mh(a, b) {
    		if (null === b) return !1;
    		for (var c = 0; c < b.length && c < a.length; c++) if (!He(a[c], b[c])) return !1;
    		return !0;
    	}
    	function Nh(a, b, c, d, e, f) {
    		Hh = f;
    		M = b;
    		b.memoizedState = null;
    		b.updateQueue = null;
    		b.lanes = 0;
    		Fh.current = null === a || null === a.memoizedState ? Oh : Ph;
    		a = c(d, e);
    		if (Jh) {
    			f = 0;
    			do {
    				Jh = !1;
    				Kh = 0;
    				if (25 <= f) throw Error(p(301));
    				f += 1;
    				O = N = null;
    				b.updateQueue = null;
    				Fh.current = Qh;
    				a = c(d, e);
    			} while (Jh);
    		}
    		Fh.current = Rh;
    		b = null !== N && null !== N.next;
    		Hh = 0;
    		O = N = M = null;
    		Ih = !1;
    		if (b) throw Error(p(300));
    		return a;
    	}
    	function Sh() {
    		var a = 0 !== Kh;
    		Kh = 0;
    		return a;
    	}
    	function Th() {
    		var a = {
    			memoizedState: null,
    			baseState: null,
    			baseQueue: null,
    			queue: null,
    			next: null
    		};
    		null === O ? M.memoizedState = O = a : O = O.next = a;
    		return O;
    	}
    	function Uh() {
    		if (null === N) {
    			var a = M.alternate;
    			a = null !== a ? a.memoizedState : null;
    		} else a = N.next;
    		var b = null === O ? M.memoizedState : O.next;
    		if (null !== b) O = b, N = a;
    		else {
    			if (null === a) throw Error(p(310));
    			N = a;
    			a = {
    				memoizedState: N.memoizedState,
    				baseState: N.baseState,
    				baseQueue: N.baseQueue,
    				queue: N.queue,
    				next: null
    			};
    			null === O ? M.memoizedState = O = a : O = O.next = a;
    		}
    		return O;
    	}
    	function Vh(a, b) {
    		return "function" === typeof b ? b(a) : b;
    	}
    	function Wh(a) {
    		var b = Uh(), c = b.queue;
    		if (null === c) throw Error(p(311));
    		c.lastRenderedReducer = a;
    		var d = N, e = d.baseQueue, f = c.pending;
    		if (null !== f) {
    			if (null !== e) {
    				var g = e.next;
    				e.next = f.next;
    				f.next = g;
    			}
    			d.baseQueue = e = f;
    			c.pending = null;
    		}
    		if (null !== e) {
    			f = e.next;
    			d = d.baseState;
    			var h = g = null, k = null, l = f;
    			do {
    				var m = l.lane;
    				if ((Hh & m) === m) null !== k && (k = k.next = {
    					lane: 0,
    					action: l.action,
    					hasEagerState: l.hasEagerState,
    					eagerState: l.eagerState,
    					next: null
    				}), d = l.hasEagerState ? l.eagerState : a(d, l.action);
    				else {
    					var q = {
    						lane: m,
    						action: l.action,
    						hasEagerState: l.hasEagerState,
    						eagerState: l.eagerState,
    						next: null
    					};
    					null === k ? (h = k = q, g = d) : k = k.next = q;
    					M.lanes |= m;
    					rh |= m;
    				}
    				l = l.next;
    			} while (null !== l && l !== f);
    			null === k ? g = d : k.next = h;
    			He(d, b.memoizedState) || (dh = !0);
    			b.memoizedState = d;
    			b.baseState = g;
    			b.baseQueue = k;
    			c.lastRenderedState = d;
    		}
    		a = c.interleaved;
    		if (null !== a) {
    			e = a;
    			do
    				f = e.lane, M.lanes |= f, rh |= f, e = e.next;
    			while (e !== a);
    		} else null === e && (c.lanes = 0);
    		return [b.memoizedState, c.dispatch];
    	}
    	function Xh(a) {
    		var b = Uh(), c = b.queue;
    		if (null === c) throw Error(p(311));
    		c.lastRenderedReducer = a;
    		var d = c.dispatch, e = c.pending, f = b.memoizedState;
    		if (null !== e) {
    			c.pending = null;
    			var g = e = e.next;
    			do
    				f = a(f, g.action), g = g.next;
    			while (g !== e);
    			He(f, b.memoizedState) || (dh = !0);
    			b.memoizedState = f;
    			null === b.baseQueue && (b.baseState = f);
    			c.lastRenderedState = f;
    		}
    		return [f, d];
    	}
    	function Yh() {}
    	function Zh(a, b) {
    		var c = M, d = Uh(), e = b(), f = !He(d.memoizedState, e);
    		f && (d.memoizedState = e, dh = !0);
    		d = d.queue;
    		$h(ai.bind(null, c, d, a), [a]);
    		if (d.getSnapshot !== b || f || null !== O && O.memoizedState.tag & 1) {
    			c.flags |= 2048;
    			bi(9, ci.bind(null, c, d, e, b), void 0, null);
    			if (null === Q) throw Error(p(349));
    			0 !== (Hh & 30) || di(c, b, e);
    		}
    		return e;
    	}
    	function di(a, b, c) {
    		a.flags |= 16384;
    		a = {
    			getSnapshot: b,
    			value: c
    		};
    		b = M.updateQueue;
    		null === b ? (b = {
    			lastEffect: null,
    			stores: null
    		}, M.updateQueue = b, b.stores = [a]) : (c = b.stores, null === c ? b.stores = [a] : c.push(a));
    	}
    	function ci(a, b, c, d) {
    		b.value = c;
    		b.getSnapshot = d;
    		ei(b) && fi(a);
    	}
    	function ai(a, b, c) {
    		return c(function() {
    			ei(b) && fi(a);
    		});
    	}
    	function ei(a) {
    		var b = a.getSnapshot;
    		a = a.value;
    		try {
    			var c = b();
    			return !He(a, c);
    		} catch (d) {
    			return !0;
    		}
    	}
    	function fi(a) {
    		var b = ih(a, 1);
    		null !== b && gi(b, a, 1, -1);
    	}
    	function hi(a) {
    		var b = Th();
    		"function" === typeof a && (a = a());
    		b.memoizedState = b.baseState = a;
    		a = {
    			pending: null,
    			interleaved: null,
    			lanes: 0,
    			dispatch: null,
    			lastRenderedReducer: Vh,
    			lastRenderedState: a
    		};
    		b.queue = a;
    		a = a.dispatch = ii.bind(null, M, a);
    		return [b.memoizedState, a];
    	}
    	function bi(a, b, c, d) {
    		a = {
    			tag: a,
    			create: b,
    			destroy: c,
    			deps: d,
    			next: null
    		};
    		b = M.updateQueue;
    		null === b ? (b = {
    			lastEffect: null,
    			stores: null
    		}, M.updateQueue = b, b.lastEffect = a.next = a) : (c = b.lastEffect, null === c ? b.lastEffect = a.next = a : (d = c.next, c.next = a, a.next = d, b.lastEffect = a));
    		return a;
    	}
    	function ji() {
    		return Uh().memoizedState;
    	}
    	function ki(a, b, c, d) {
    		var e = Th();
    		M.flags |= a;
    		e.memoizedState = bi(1 | b, c, void 0, void 0 === d ? null : d);
    	}
    	function li(a, b, c, d) {
    		var e = Uh();
    		d = void 0 === d ? null : d;
    		var f = void 0;
    		if (null !== N) {
    			var g = N.memoizedState;
    			f = g.destroy;
    			if (null !== d && Mh(d, g.deps)) {
    				e.memoizedState = bi(b, c, f, d);
    				return;
    			}
    		}
    		M.flags |= a;
    		e.memoizedState = bi(1 | b, c, f, d);
    	}
    	function mi(a, b) {
    		return ki(8390656, 8, a, b);
    	}
    	function $h(a, b) {
    		return li(2048, 8, a, b);
    	}
    	function ni(a, b) {
    		return li(4, 2, a, b);
    	}
    	function oi(a, b) {
    		return li(4, 4, a, b);
    	}
    	function pi(a, b) {
    		if ("function" === typeof b) return a = a(), b(a), function() {
    			b(null);
    		};
    		if (null !== b && void 0 !== b) return a = a(), b.current = a, function() {
    			b.current = null;
    		};
    	}
    	function qi(a, b, c) {
    		c = null !== c && void 0 !== c ? c.concat([a]) : null;
    		return li(4, 4, pi.bind(null, b, a), c);
    	}
    	function ri() {}
    	function si(a, b) {
    		var c = Uh();
    		b = void 0 === b ? null : b;
    		var d = c.memoizedState;
    		if (null !== d && null !== b && Mh(b, d[1])) return d[0];
    		c.memoizedState = [a, b];
    		return a;
    	}
    	function ti(a, b) {
    		var c = Uh();
    		b = void 0 === b ? null : b;
    		var d = c.memoizedState;
    		if (null !== d && null !== b && Mh(b, d[1])) return d[0];
    		a = a();
    		c.memoizedState = [a, b];
    		return a;
    	}
    	function ui(a, b, c) {
    		if (0 === (Hh & 21)) return a.baseState && (a.baseState = !1, dh = !0), a.memoizedState = c;
    		He(c, b) || (c = yc(), M.lanes |= c, rh |= c, a.baseState = !0);
    		return b;
    	}
    	function vi(a, b) {
    		var c = C;
    		C = 0 !== c && 4 > c ? c : 4;
    		a(!0);
    		var d = Gh.transition;
    		Gh.transition = {};
    		try {
    			a(!1), b();
    		} finally {
    			C = c, Gh.transition = d;
    		}
    	}
    	function wi() {
    		return Uh().memoizedState;
    	}
    	function xi(a, b, c) {
    		var d = yi(a);
    		c = {
    			lane: d,
    			action: c,
    			hasEagerState: !1,
    			eagerState: null,
    			next: null
    		};
    		if (zi(a)) Ai(b, c);
    		else if (c = hh(a, b, c, d), null !== c) {
    			var e = R();
    			gi(c, a, d, e);
    			Bi(c, b, d);
    		}
    	}
    	function ii(a, b, c) {
    		var d = yi(a), e = {
    			lane: d,
    			action: c,
    			hasEagerState: !1,
    			eagerState: null,
    			next: null
    		};
    		if (zi(a)) Ai(b, e);
    		else {
    			var f = a.alternate;
    			if (0 === a.lanes && (null === f || 0 === f.lanes) && (f = b.lastRenderedReducer, null !== f)) try {
    				var g = b.lastRenderedState, h = f(g, c);
    				e.hasEagerState = !0;
    				e.eagerState = h;
    				if (He(h, g)) {
    					var k = b.interleaved;
    					null === k ? (e.next = e, gh(b)) : (e.next = k.next, k.next = e);
    					b.interleaved = e;
    					return;
    				}
    			} catch (l) {}
    			c = hh(a, b, e, d);
    			null !== c && (e = R(), gi(c, a, d, e), Bi(c, b, d));
    		}
    	}
    	function zi(a) {
    		var b = a.alternate;
    		return a === M || null !== b && b === M;
    	}
    	function Ai(a, b) {
    		Jh = Ih = !0;
    		var c = a.pending;
    		null === c ? b.next = b : (b.next = c.next, c.next = b);
    		a.pending = b;
    	}
    	function Bi(a, b, c) {
    		if (0 !== (c & 4194240)) {
    			var d = b.lanes;
    			d &= a.pendingLanes;
    			c |= d;
    			b.lanes = c;
    			Cc(a, c);
    		}
    	}
    	var Rh = {
    		readContext: eh,
    		useCallback: P,
    		useContext: P,
    		useEffect: P,
    		useImperativeHandle: P,
    		useInsertionEffect: P,
    		useLayoutEffect: P,
    		useMemo: P,
    		useReducer: P,
    		useRef: P,
    		useState: P,
    		useDebugValue: P,
    		useDeferredValue: P,
    		useTransition: P,
    		useMutableSource: P,
    		useSyncExternalStore: P,
    		useId: P,
    		unstable_isNewReconciler: !1
    	};
    	var Oh = {
    		readContext: eh,
    		useCallback: function(a, b) {
    			Th().memoizedState = [a, void 0 === b ? null : b];
    			return a;
    		},
    		useContext: eh,
    		useEffect: mi,
    		useImperativeHandle: function(a, b, c) {
    			c = null !== c && void 0 !== c ? c.concat([a]) : null;
    			return ki(4194308, 4, pi.bind(null, b, a), c);
    		},
    		useLayoutEffect: function(a, b) {
    			return ki(4194308, 4, a, b);
    		},
    		useInsertionEffect: function(a, b) {
    			return ki(4, 2, a, b);
    		},
    		useMemo: function(a, b) {
    			var c = Th();
    			b = void 0 === b ? null : b;
    			a = a();
    			c.memoizedState = [a, b];
    			return a;
    		},
    		useReducer: function(a, b, c) {
    			var d = Th();
    			b = void 0 !== c ? c(b) : b;
    			d.memoizedState = d.baseState = b;
    			a = {
    				pending: null,
    				interleaved: null,
    				lanes: 0,
    				dispatch: null,
    				lastRenderedReducer: a,
    				lastRenderedState: b
    			};
    			d.queue = a;
    			a = a.dispatch = xi.bind(null, M, a);
    			return [d.memoizedState, a];
    		},
    		useRef: function(a) {
    			var b = Th();
    			a = { current: a };
    			return b.memoizedState = a;
    		},
    		useState: hi,
    		useDebugValue: ri,
    		useDeferredValue: function(a) {
    			return Th().memoizedState = a;
    		},
    		useTransition: function() {
    			var a = hi(!1), b = a[0];
    			a = vi.bind(null, a[1]);
    			Th().memoizedState = a;
    			return [b, a];
    		},
    		useMutableSource: function() {},
    		useSyncExternalStore: function(a, b, c) {
    			var d = M, e = Th();
    			if (I) {
    				if (void 0 === c) throw Error(p(407));
    				c = c();
    			} else {
    				c = b();
    				if (null === Q) throw Error(p(349));
    				0 !== (Hh & 30) || di(d, b, c);
    			}
    			e.memoizedState = c;
    			var f = {
    				value: c,
    				getSnapshot: b
    			};
    			e.queue = f;
    			mi(ai.bind(null, d, f, a), [a]);
    			d.flags |= 2048;
    			bi(9, ci.bind(null, d, f, c, b), void 0, null);
    			return c;
    		},
    		useId: function() {
    			var a = Th(), b = Q.identifierPrefix;
    			if (I) {
    				var c = sg;
    				var d = rg;
    				c = (d & ~(1 << 32 - oc(d) - 1)).toString(32) + c;
    				b = ":" + b + "R" + c;
    				c = Kh++;
    				0 < c && (b += "H" + c.toString(32));
    				b += ":";
    			} else c = Lh++, b = ":" + b + "r" + c.toString(32) + ":";
    			return a.memoizedState = b;
    		},
    		unstable_isNewReconciler: !1
    	};
    	var Ph = {
    		readContext: eh,
    		useCallback: si,
    		useContext: eh,
    		useEffect: $h,
    		useImperativeHandle: qi,
    		useInsertionEffect: ni,
    		useLayoutEffect: oi,
    		useMemo: ti,
    		useReducer: Wh,
    		useRef: ji,
    		useState: function() {
    			return Wh(Vh);
    		},
    		useDebugValue: ri,
    		useDeferredValue: function(a) {
    			return ui(Uh(), N.memoizedState, a);
    		},
    		useTransition: function() {
    			return [Wh(Vh)[0], Uh().memoizedState];
    		},
    		useMutableSource: Yh,
    		useSyncExternalStore: Zh,
    		useId: wi,
    		unstable_isNewReconciler: !1
    	};
    	var Qh = {
    		readContext: eh,
    		useCallback: si,
    		useContext: eh,
    		useEffect: $h,
    		useImperativeHandle: qi,
    		useInsertionEffect: ni,
    		useLayoutEffect: oi,
    		useMemo: ti,
    		useReducer: Xh,
    		useRef: ji,
    		useState: function() {
    			return Xh(Vh);
    		},
    		useDebugValue: ri,
    		useDeferredValue: function(a) {
    			var b = Uh();
    			return null === N ? b.memoizedState = a : ui(b, N.memoizedState, a);
    		},
    		useTransition: function() {
    			return [Xh(Vh)[0], Uh().memoizedState];
    		},
    		useMutableSource: Yh,
    		useSyncExternalStore: Zh,
    		useId: wi,
    		unstable_isNewReconciler: !1
    	};
    	function Ci(a, b) {
    		if (a && a.defaultProps) {
    			b = A({}, b);
    			a = a.defaultProps;
    			for (var c in a) void 0 === b[c] && (b[c] = a[c]);
    			return b;
    		}
    		return b;
    	}
    	function Di(a, b, c, d) {
    		b = a.memoizedState;
    		c = c(d, b);
    		c = null === c || void 0 === c ? b : A({}, b, c);
    		a.memoizedState = c;
    		0 === a.lanes && (a.updateQueue.baseState = c);
    	}
    	var Ei = {
    		isMounted: function(a) {
    			return (a = a._reactInternals) ? Vb(a) === a : !1;
    		},
    		enqueueSetState: function(a, b, c) {
    			a = a._reactInternals;
    			var d = R(), e = yi(a), f = mh(d, e);
    			f.payload = b;
    			void 0 !== c && null !== c && (f.callback = c);
    			b = nh(a, f, e);
    			null !== b && (gi(b, a, e, d), oh(b, a, e));
    		},
    		enqueueReplaceState: function(a, b, c) {
    			a = a._reactInternals;
    			var d = R(), e = yi(a), f = mh(d, e);
    			f.tag = 1;
    			f.payload = b;
    			void 0 !== c && null !== c && (f.callback = c);
    			b = nh(a, f, e);
    			null !== b && (gi(b, a, e, d), oh(b, a, e));
    		},
    		enqueueForceUpdate: function(a, b) {
    			a = a._reactInternals;
    			var c = R(), d = yi(a), e = mh(c, d);
    			e.tag = 2;
    			void 0 !== b && null !== b && (e.callback = b);
    			b = nh(a, e, d);
    			null !== b && (gi(b, a, d, c), oh(b, a, d));
    		}
    	};
    	function Fi(a, b, c, d, e, f, g) {
    		a = a.stateNode;
    		return "function" === typeof a.shouldComponentUpdate ? a.shouldComponentUpdate(d, f, g) : b.prototype && b.prototype.isPureReactComponent ? !Ie(c, d) || !Ie(e, f) : !0;
    	}
    	function Gi(a, b, c) {
    		var d = !1, e = Vf;
    		var f = b.contextType;
    		"object" === typeof f && null !== f ? f = eh(f) : (e = Zf(b) ? Xf : H.current, d = b.contextTypes, f = (d = null !== d && void 0 !== d) ? Yf(a, e) : Vf);
    		b = new b(c, f);
    		a.memoizedState = null !== b.state && void 0 !== b.state ? b.state : null;
    		b.updater = Ei;
    		a.stateNode = b;
    		b._reactInternals = a;
    		d && (a = a.stateNode, a.__reactInternalMemoizedUnmaskedChildContext = e, a.__reactInternalMemoizedMaskedChildContext = f);
    		return b;
    	}
    	function Hi(a, b, c, d) {
    		a = b.state;
    		"function" === typeof b.componentWillReceiveProps && b.componentWillReceiveProps(c, d);
    		"function" === typeof b.UNSAFE_componentWillReceiveProps && b.UNSAFE_componentWillReceiveProps(c, d);
    		b.state !== a && Ei.enqueueReplaceState(b, b.state, null);
    	}
    	function Ii(a, b, c, d) {
    		var e = a.stateNode;
    		e.props = c;
    		e.state = a.memoizedState;
    		e.refs = {};
    		kh(a);
    		var f = b.contextType;
    		"object" === typeof f && null !== f ? e.context = eh(f) : (f = Zf(b) ? Xf : H.current, e.context = Yf(a, f));
    		e.state = a.memoizedState;
    		f = b.getDerivedStateFromProps;
    		"function" === typeof f && (Di(a, b, f, c), e.state = a.memoizedState);
    		"function" === typeof b.getDerivedStateFromProps || "function" === typeof e.getSnapshotBeforeUpdate || "function" !== typeof e.UNSAFE_componentWillMount && "function" !== typeof e.componentWillMount || (b = e.state, "function" === typeof e.componentWillMount && e.componentWillMount(), "function" === typeof e.UNSAFE_componentWillMount && e.UNSAFE_componentWillMount(), b !== e.state && Ei.enqueueReplaceState(e, e.state, null), qh(a, c, e, d), e.state = a.memoizedState);
    		"function" === typeof e.componentDidMount && (a.flags |= 4194308);
    	}
    	function Ji(a, b) {
    		try {
    			var c = "", d = b;
    			do
    				c += Pa(d), d = d.return;
    			while (d);
    			var e = c;
    		} catch (f) {
    			e = "\nError generating stack: " + f.message + "\n" + f.stack;
    		}
    		return {
    			value: a,
    			source: b,
    			stack: e,
    			digest: null
    		};
    	}
    	function Ki(a, b, c) {
    		return {
    			value: a,
    			source: null,
    			stack: null != c ? c : null,
    			digest: null != b ? b : null
    		};
    	}
    	function Li(a, b) {
    		try {
    			console.error(b.value);
    		} catch (c) {
    			setTimeout(function() {
    				throw c;
    			});
    		}
    	}
    	var Mi = "function" === typeof WeakMap ? WeakMap : Map;
    	function Ni(a, b, c) {
    		c = mh(-1, c);
    		c.tag = 3;
    		c.payload = { element: null };
    		var d = b.value;
    		c.callback = function() {
    			Oi || (Oi = !0, Pi = d);
    			Li(a, b);
    		};
    		return c;
    	}
    	function Qi(a, b, c) {
    		c = mh(-1, c);
    		c.tag = 3;
    		var d = a.type.getDerivedStateFromError;
    		if ("function" === typeof d) {
    			var e = b.value;
    			c.payload = function() {
    				return d(e);
    			};
    			c.callback = function() {
    				Li(a, b);
    			};
    		}
    		var f = a.stateNode;
    		null !== f && "function" === typeof f.componentDidCatch && (c.callback = function() {
    			Li(a, b);
    			"function" !== typeof d && (null === Ri ? Ri = /* @__PURE__ */ new Set([this]) : Ri.add(this));
    			var c = b.stack;
    			this.componentDidCatch(b.value, { componentStack: null !== c ? c : "" });
    		});
    		return c;
    	}
    	function Si(a, b, c) {
    		var d = a.pingCache;
    		if (null === d) {
    			d = a.pingCache = new Mi();
    			var e = /* @__PURE__ */ new Set();
    			d.set(b, e);
    		} else e = d.get(b), void 0 === e && (e = /* @__PURE__ */ new Set(), d.set(b, e));
    		e.has(c) || (e.add(c), a = Ti.bind(null, a, b, c), b.then(a, a));
    	}
    	function Ui(a) {
    		do {
    			var b;
    			if (b = 13 === a.tag) b = a.memoizedState, b = null !== b ? null !== b.dehydrated ? !0 : !1 : !0;
    			if (b) return a;
    			a = a.return;
    		} while (null !== a);
    		return null;
    	}
    	function Vi(a, b, c, d, e) {
    		if (0 === (a.mode & 1)) return a === b ? a.flags |= 65536 : (a.flags |= 128, c.flags |= 131072, c.flags &= -52805, 1 === c.tag && (null === c.alternate ? c.tag = 17 : (b = mh(-1, 1), b.tag = 2, nh(c, b, 1))), c.lanes |= 1), a;
    		a.flags |= 65536;
    		a.lanes = e;
    		return a;
    	}
    	var Wi = ua.ReactCurrentOwner;
    	var dh = !1;
    	function Xi(a, b, c, d) {
    		b.child = null === a ? Vg(b, null, c, d) : Ug(b, a.child, c, d);
    	}
    	function Yi(a, b, c, d, e) {
    		c = c.render;
    		var f = b.ref;
    		ch(b, e);
    		d = Nh(a, b, c, d, f, e);
    		c = Sh();
    		if (null !== a && !dh) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Zi(a, b, e);
    		I && c && vg(b);
    		b.flags |= 1;
    		Xi(a, b, d, e);
    		return b.child;
    	}
    	function $i(a, b, c, d, e) {
    		if (null === a) {
    			var f = c.type;
    			if ("function" === typeof f && !aj(f) && void 0 === f.defaultProps && null === c.compare && void 0 === c.defaultProps) return b.tag = 15, b.type = f, bj(a, b, f, d, e);
    			a = Rg(c.type, null, d, b, b.mode, e);
    			a.ref = b.ref;
    			a.return = b;
    			return b.child = a;
    		}
    		f = a.child;
    		if (0 === (a.lanes & e)) {
    			var g = f.memoizedProps;
    			c = c.compare;
    			c = null !== c ? c : Ie;
    			if (c(g, d) && a.ref === b.ref) return Zi(a, b, e);
    		}
    		b.flags |= 1;
    		a = Pg(f, d);
    		a.ref = b.ref;
    		a.return = b;
    		return b.child = a;
    	}
    	function bj(a, b, c, d, e) {
    		if (null !== a) {
    			var f = a.memoizedProps;
    			if (Ie(f, d) && a.ref === b.ref) if (dh = !1, b.pendingProps = d = f, 0 !== (a.lanes & e)) 0 !== (a.flags & 131072) && (dh = !0);
    			else return b.lanes = a.lanes, Zi(a, b, e);
    		}
    		return cj(a, b, c, d, e);
    	}
    	function dj(a, b, c) {
    		var d = b.pendingProps, e = d.children, f = null !== a ? a.memoizedState : null;
    		if ("hidden" === d.mode) if (0 === (b.mode & 1)) b.memoizedState = {
    			baseLanes: 0,
    			cachePool: null,
    			transitions: null
    		}, G(ej, fj), fj |= c;
    		else {
    			if (0 === (c & 1073741824)) return a = null !== f ? f.baseLanes | c : c, b.lanes = b.childLanes = 1073741824, b.memoizedState = {
    				baseLanes: a,
    				cachePool: null,
    				transitions: null
    			}, b.updateQueue = null, G(ej, fj), fj |= a, null;
    			b.memoizedState = {
    				baseLanes: 0,
    				cachePool: null,
    				transitions: null
    			};
    			d = null !== f ? f.baseLanes : c;
    			G(ej, fj);
    			fj |= d;
    		}
    		else null !== f ? (d = f.baseLanes | c, b.memoizedState = null) : d = c, G(ej, fj), fj |= d;
    		Xi(a, b, e, c);
    		return b.child;
    	}
    	function gj(a, b) {
    		var c = b.ref;
    		if (null === a && null !== c || null !== a && a.ref !== c) b.flags |= 512, b.flags |= 2097152;
    	}
    	function cj(a, b, c, d, e) {
    		var f = Zf(c) ? Xf : H.current;
    		f = Yf(b, f);
    		ch(b, e);
    		c = Nh(a, b, c, d, f, e);
    		d = Sh();
    		if (null !== a && !dh) return b.updateQueue = a.updateQueue, b.flags &= -2053, a.lanes &= ~e, Zi(a, b, e);
    		I && d && vg(b);
    		b.flags |= 1;
    		Xi(a, b, c, e);
    		return b.child;
    	}
    	function hj(a, b, c, d, e) {
    		if (Zf(c)) {
    			var f = !0;
    			cg(b);
    		} else f = !1;
    		ch(b, e);
    		if (null === b.stateNode) ij(a, b), Gi(b, c, d), Ii(b, c, d, e), d = !0;
    		else if (null === a) {
    			var g = b.stateNode, h = b.memoizedProps;
    			g.props = h;
    			var k = g.context, l = c.contextType;
    			"object" === typeof l && null !== l ? l = eh(l) : (l = Zf(c) ? Xf : H.current, l = Yf(b, l));
    			var m = c.getDerivedStateFromProps, q = "function" === typeof m || "function" === typeof g.getSnapshotBeforeUpdate;
    			q || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== d || k !== l) && Hi(b, g, d, l);
    			jh = !1;
    			var r = b.memoizedState;
    			g.state = r;
    			qh(b, d, g, e);
    			k = b.memoizedState;
    			h !== d || r !== k || Wf.current || jh ? ("function" === typeof m && (Di(b, c, m, d), k = b.memoizedState), (h = jh || Fi(b, c, h, d, r, k, l)) ? (q || "function" !== typeof g.UNSAFE_componentWillMount && "function" !== typeof g.componentWillMount || ("function" === typeof g.componentWillMount && g.componentWillMount(), "function" === typeof g.UNSAFE_componentWillMount && g.UNSAFE_componentWillMount()), "function" === typeof g.componentDidMount && (b.flags |= 4194308)) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), b.memoizedProps = d, b.memoizedState = k), g.props = d, g.state = k, g.context = l, d = h) : ("function" === typeof g.componentDidMount && (b.flags |= 4194308), d = !1);
    		} else {
    			g = b.stateNode;
    			lh(a, b);
    			h = b.memoizedProps;
    			l = b.type === b.elementType ? h : Ci(b.type, h);
    			g.props = l;
    			q = b.pendingProps;
    			r = g.context;
    			k = c.contextType;
    			"object" === typeof k && null !== k ? k = eh(k) : (k = Zf(c) ? Xf : H.current, k = Yf(b, k));
    			var y = c.getDerivedStateFromProps;
    			(m = "function" === typeof y || "function" === typeof g.getSnapshotBeforeUpdate) || "function" !== typeof g.UNSAFE_componentWillReceiveProps && "function" !== typeof g.componentWillReceiveProps || (h !== q || r !== k) && Hi(b, g, d, k);
    			jh = !1;
    			r = b.memoizedState;
    			g.state = r;
    			qh(b, d, g, e);
    			var n = b.memoizedState;
    			h !== q || r !== n || Wf.current || jh ? ("function" === typeof y && (Di(b, c, y, d), n = b.memoizedState), (l = jh || Fi(b, c, l, d, r, n, k) || !1) ? (m || "function" !== typeof g.UNSAFE_componentWillUpdate && "function" !== typeof g.componentWillUpdate || ("function" === typeof g.componentWillUpdate && g.componentWillUpdate(d, n, k), "function" === typeof g.UNSAFE_componentWillUpdate && g.UNSAFE_componentWillUpdate(d, n, k)), "function" === typeof g.componentDidUpdate && (b.flags |= 4), "function" === typeof g.getSnapshotBeforeUpdate && (b.flags |= 1024)) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 1024), b.memoizedProps = d, b.memoizedState = n), g.props = d, g.state = n, g.context = k, d = l) : ("function" !== typeof g.componentDidUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 4), "function" !== typeof g.getSnapshotBeforeUpdate || h === a.memoizedProps && r === a.memoizedState || (b.flags |= 1024), d = !1);
    		}
    		return jj(a, b, c, d, f, e);
    	}
    	function jj(a, b, c, d, e, f) {
    		gj(a, b);
    		var g = 0 !== (b.flags & 128);
    		if (!d && !g) return e && dg(b, c, !1), Zi(a, b, f);
    		d = b.stateNode;
    		Wi.current = b;
    		var h = g && "function" !== typeof c.getDerivedStateFromError ? null : d.render();
    		b.flags |= 1;
    		null !== a && g ? (b.child = Ug(b, a.child, null, f), b.child = Ug(b, null, h, f)) : Xi(a, b, h, f);
    		b.memoizedState = d.state;
    		e && dg(b, c, !0);
    		return b.child;
    	}
    	function kj(a) {
    		var b = a.stateNode;
    		b.pendingContext ? ag(a, b.pendingContext, b.pendingContext !== b.context) : b.context && ag(a, b.context, !1);
    		yh(a, b.containerInfo);
    	}
    	function lj(a, b, c, d, e) {
    		Ig();
    		Jg(e);
    		b.flags |= 256;
    		Xi(a, b, c, d);
    		return b.child;
    	}
    	var mj = {
    		dehydrated: null,
    		treeContext: null,
    		retryLane: 0
    	};
    	function nj(a) {
    		return {
    			baseLanes: a,
    			cachePool: null,
    			transitions: null
    		};
    	}
    	function oj(a, b, c) {
    		var d = b.pendingProps, e = L.current, f = !1, g = 0 !== (b.flags & 128), h;
    		(h = g) || (h = null !== a && null === a.memoizedState ? !1 : 0 !== (e & 2));
    		if (h) f = !0, b.flags &= -129;
    		else if (null === a || null !== a.memoizedState) e |= 1;
    		G(L, e & 1);
    		if (null === a) {
    			Eg(b);
    			a = b.memoizedState;
    			if (null !== a && (a = a.dehydrated, null !== a)) return 0 === (b.mode & 1) ? b.lanes = 1 : "$!" === a.data ? b.lanes = 8 : b.lanes = 1073741824, null;
    			g = d.children;
    			a = d.fallback;
    			return f ? (d = b.mode, f = b.child, g = {
    				mode: "hidden",
    				children: g
    			}, 0 === (d & 1) && null !== f ? (f.childLanes = 0, f.pendingProps = g) : f = pj(g, d, 0, null), a = Tg(a, d, c, null), f.return = b, a.return = b, f.sibling = a, b.child = f, b.child.memoizedState = nj(c), b.memoizedState = mj, a) : qj(b, g);
    		}
    		e = a.memoizedState;
    		if (null !== e && (h = e.dehydrated, null !== h)) return rj(a, b, g, d, h, e, c);
    		if (f) {
    			f = d.fallback;
    			g = b.mode;
    			e = a.child;
    			h = e.sibling;
    			var k = {
    				mode: "hidden",
    				children: d.children
    			};
    			0 === (g & 1) && b.child !== e ? (d = b.child, d.childLanes = 0, d.pendingProps = k, b.deletions = null) : (d = Pg(e, k), d.subtreeFlags = e.subtreeFlags & 14680064);
    			null !== h ? f = Pg(h, f) : (f = Tg(f, g, c, null), f.flags |= 2);
    			f.return = b;
    			d.return = b;
    			d.sibling = f;
    			b.child = d;
    			d = f;
    			f = b.child;
    			g = a.child.memoizedState;
    			g = null === g ? nj(c) : {
    				baseLanes: g.baseLanes | c,
    				cachePool: null,
    				transitions: g.transitions
    			};
    			f.memoizedState = g;
    			f.childLanes = a.childLanes & ~c;
    			b.memoizedState = mj;
    			return d;
    		}
    		f = a.child;
    		a = f.sibling;
    		d = Pg(f, {
    			mode: "visible",
    			children: d.children
    		});
    		0 === (b.mode & 1) && (d.lanes = c);
    		d.return = b;
    		d.sibling = null;
    		null !== a && (c = b.deletions, null === c ? (b.deletions = [a], b.flags |= 16) : c.push(a));
    		b.child = d;
    		b.memoizedState = null;
    		return d;
    	}
    	function qj(a, b) {
    		b = pj({
    			mode: "visible",
    			children: b
    		}, a.mode, 0, null);
    		b.return = a;
    		return a.child = b;
    	}
    	function sj(a, b, c, d) {
    		null !== d && Jg(d);
    		Ug(b, a.child, null, c);
    		a = qj(b, b.pendingProps.children);
    		a.flags |= 2;
    		b.memoizedState = null;
    		return a;
    	}
    	function rj(a, b, c, d, e, f, g) {
    		if (c) {
    			if (b.flags & 256) return b.flags &= -257, d = Ki(Error(p(422))), sj(a, b, g, d);
    			if (null !== b.memoizedState) return b.child = a.child, b.flags |= 128, null;
    			f = d.fallback;
    			e = b.mode;
    			d = pj({
    				mode: "visible",
    				children: d.children
    			}, e, 0, null);
    			f = Tg(f, e, g, null);
    			f.flags |= 2;
    			d.return = b;
    			f.return = b;
    			d.sibling = f;
    			b.child = d;
    			0 !== (b.mode & 1) && Ug(b, a.child, null, g);
    			b.child.memoizedState = nj(g);
    			b.memoizedState = mj;
    			return f;
    		}
    		if (0 === (b.mode & 1)) return sj(a, b, g, null);
    		if ("$!" === e.data) {
    			d = e.nextSibling && e.nextSibling.dataset;
    			if (d) var h = d.dgst;
    			d = h;
    			f = Error(p(419));
    			d = Ki(f, d, void 0);
    			return sj(a, b, g, d);
    		}
    		h = 0 !== (g & a.childLanes);
    		if (dh || h) {
    			d = Q;
    			if (null !== d) {
    				switch (g & -g) {
    					case 4:
    						e = 2;
    						break;
    					case 16:
    						e = 8;
    						break;
    					case 64:
    					case 128:
    					case 256:
    					case 512:
    					case 1024:
    					case 2048:
    					case 4096:
    					case 8192:
    					case 16384:
    					case 32768:
    					case 65536:
    					case 131072:
    					case 262144:
    					case 524288:
    					case 1048576:
    					case 2097152:
    					case 4194304:
    					case 8388608:
    					case 16777216:
    					case 33554432:
    					case 67108864:
    						e = 32;
    						break;
    					case 536870912:
    						e = 268435456;
    						break;
    					default: e = 0;
    				}
    				e = 0 !== (e & (d.suspendedLanes | g)) ? 0 : e;
    				0 !== e && e !== f.retryLane && (f.retryLane = e, ih(a, e), gi(d, a, e, -1));
    			}
    			tj();
    			d = Ki(Error(p(421)));
    			return sj(a, b, g, d);
    		}
    		if ("$?" === e.data) return b.flags |= 128, b.child = a.child, b = uj.bind(null, a), e._reactRetry = b, null;
    		a = f.treeContext;
    		yg = Lf(e.nextSibling);
    		xg = b;
    		I = !0;
    		zg = null;
    		null !== a && (og[pg++] = rg, og[pg++] = sg, og[pg++] = qg, rg = a.id, sg = a.overflow, qg = b);
    		b = qj(b, d.children);
    		b.flags |= 4096;
    		return b;
    	}
    	function vj(a, b, c) {
    		a.lanes |= b;
    		var d = a.alternate;
    		null !== d && (d.lanes |= b);
    		bh(a.return, b, c);
    	}
    	function wj(a, b, c, d, e) {
    		var f = a.memoizedState;
    		null === f ? a.memoizedState = {
    			isBackwards: b,
    			rendering: null,
    			renderingStartTime: 0,
    			last: d,
    			tail: c,
    			tailMode: e
    		} : (f.isBackwards = b, f.rendering = null, f.renderingStartTime = 0, f.last = d, f.tail = c, f.tailMode = e);
    	}
    	function xj(a, b, c) {
    		var d = b.pendingProps, e = d.revealOrder, f = d.tail;
    		Xi(a, b, d.children, c);
    		d = L.current;
    		if (0 !== (d & 2)) d = d & 1 | 2, b.flags |= 128;
    		else {
    			if (null !== a && 0 !== (a.flags & 128)) a: for (a = b.child; null !== a;) {
    				if (13 === a.tag) null !== a.memoizedState && vj(a, c, b);
    				else if (19 === a.tag) vj(a, c, b);
    				else if (null !== a.child) {
    					a.child.return = a;
    					a = a.child;
    					continue;
    				}
    				if (a === b) break a;
    				for (; null === a.sibling;) {
    					if (null === a.return || a.return === b) break a;
    					a = a.return;
    				}
    				a.sibling.return = a.return;
    				a = a.sibling;
    			}
    			d &= 1;
    		}
    		G(L, d);
    		if (0 === (b.mode & 1)) b.memoizedState = null;
    		else switch (e) {
    			case "forwards":
    				c = b.child;
    				for (e = null; null !== c;) a = c.alternate, null !== a && null === Ch(a) && (e = c), c = c.sibling;
    				c = e;
    				null === c ? (e = b.child, b.child = null) : (e = c.sibling, c.sibling = null);
    				wj(b, !1, e, c, f);
    				break;
    			case "backwards":
    				c = null;
    				e = b.child;
    				for (b.child = null; null !== e;) {
    					a = e.alternate;
    					if (null !== a && null === Ch(a)) {
    						b.child = e;
    						break;
    					}
    					a = e.sibling;
    					e.sibling = c;
    					c = e;
    					e = a;
    				}
    				wj(b, !0, c, null, f);
    				break;
    			case "together":
    				wj(b, !1, null, null, void 0);
    				break;
    			default: b.memoizedState = null;
    		}
    		return b.child;
    	}
    	function ij(a, b) {
    		0 === (b.mode & 1) && null !== a && (a.alternate = null, b.alternate = null, b.flags |= 2);
    	}
    	function Zi(a, b, c) {
    		null !== a && (b.dependencies = a.dependencies);
    		rh |= b.lanes;
    		if (0 === (c & b.childLanes)) return null;
    		if (null !== a && b.child !== a.child) throw Error(p(153));
    		if (null !== b.child) {
    			a = b.child;
    			c = Pg(a, a.pendingProps);
    			b.child = c;
    			for (c.return = b; null !== a.sibling;) a = a.sibling, c = c.sibling = Pg(a, a.pendingProps), c.return = b;
    			c.sibling = null;
    		}
    		return b.child;
    	}
    	function yj(a, b, c) {
    		switch (b.tag) {
    			case 3:
    				kj(b);
    				Ig();
    				break;
    			case 5:
    				Ah(b);
    				break;
    			case 1:
    				Zf(b.type) && cg(b);
    				break;
    			case 4:
    				yh(b, b.stateNode.containerInfo);
    				break;
    			case 10:
    				var d = b.type._context, e = b.memoizedProps.value;
    				G(Wg, d._currentValue);
    				d._currentValue = e;
    				break;
    			case 13:
    				d = b.memoizedState;
    				if (null !== d) {
    					if (null !== d.dehydrated) return G(L, L.current & 1), b.flags |= 128, null;
    					if (0 !== (c & b.child.childLanes)) return oj(a, b, c);
    					G(L, L.current & 1);
    					a = Zi(a, b, c);
    					return null !== a ? a.sibling : null;
    				}
    				G(L, L.current & 1);
    				break;
    			case 19:
    				d = 0 !== (c & b.childLanes);
    				if (0 !== (a.flags & 128)) {
    					if (d) return xj(a, b, c);
    					b.flags |= 128;
    				}
    				e = b.memoizedState;
    				null !== e && (e.rendering = null, e.tail = null, e.lastEffect = null);
    				G(L, L.current);
    				if (d) break;
    				else return null;
    			case 22:
    			case 23: return b.lanes = 0, dj(a, b, c);
    		}
    		return Zi(a, b, c);
    	}
    	var zj = function(a, b) {
    		for (var c = b.child; null !== c;) {
    			if (5 === c.tag || 6 === c.tag) a.appendChild(c.stateNode);
    			else if (4 !== c.tag && null !== c.child) {
    				c.child.return = c;
    				c = c.child;
    				continue;
    			}
    			if (c === b) break;
    			for (; null === c.sibling;) {
    				if (null === c.return || c.return === b) return;
    				c = c.return;
    			}
    			c.sibling.return = c.return;
    			c = c.sibling;
    		}
    	};
    	var Bj = function(a, b, c, d) {
    		var e = a.memoizedProps;
    		if (e !== d) {
    			a = b.stateNode;
    			xh(uh.current);
    			var f = null;
    			switch (c) {
    				case "input":
    					e = Ya(a, e);
    					d = Ya(a, d);
    					f = [];
    					break;
    				case "select":
    					e = A({}, e, { value: void 0 });
    					d = A({}, d, { value: void 0 });
    					f = [];
    					break;
    				case "textarea":
    					e = gb(a, e);
    					d = gb(a, d);
    					f = [];
    					break;
    				default: "function" !== typeof e.onClick && "function" === typeof d.onClick && (a.onclick = Bf);
    			}
    			ub(c, d);
    			var g;
    			c = null;
    			for (l in e) if (!d.hasOwnProperty(l) && e.hasOwnProperty(l) && null != e[l]) if ("style" === l) {
    				var h = e[l];
    				for (g in h) h.hasOwnProperty(g) && (c || (c = {}), c[g] = "");
    			} else "dangerouslySetInnerHTML" !== l && "children" !== l && "suppressContentEditableWarning" !== l && "suppressHydrationWarning" !== l && "autoFocus" !== l && (ea.hasOwnProperty(l) ? f || (f = []) : (f = f || []).push(l, null));
    			for (l in d) {
    				var k = d[l];
    				h = null != e ? e[l] : void 0;
    				if (d.hasOwnProperty(l) && k !== h && (null != k || null != h)) if ("style" === l) if (h) {
    					for (g in h) !h.hasOwnProperty(g) || k && k.hasOwnProperty(g) || (c || (c = {}), c[g] = "");
    					for (g in k) k.hasOwnProperty(g) && h[g] !== k[g] && (c || (c = {}), c[g] = k[g]);
    				} else c || (f || (f = []), f.push(l, c)), c = k;
    				else "dangerouslySetInnerHTML" === l ? (k = k ? k.__html : void 0, h = h ? h.__html : void 0, null != k && h !== k && (f = f || []).push(l, k)) : "children" === l ? "string" !== typeof k && "number" !== typeof k || (f = f || []).push(l, "" + k) : "suppressContentEditableWarning" !== l && "suppressHydrationWarning" !== l && (ea.hasOwnProperty(l) ? (null != k && "onScroll" === l && D("scroll", a), f || h === k || (f = [])) : (f = f || []).push(l, k));
    			}
    			c && (f = f || []).push("style", c);
    			var l = f;
    			if (b.updateQueue = l) b.flags |= 4;
    		}
    	};
    	var Cj = function(a, b, c, d) {
    		c !== d && (b.flags |= 4);
    	};
    	function Dj(a, b) {
    		if (!I) switch (a.tailMode) {
    			case "hidden":
    				b = a.tail;
    				for (var c = null; null !== b;) null !== b.alternate && (c = b), b = b.sibling;
    				null === c ? a.tail = null : c.sibling = null;
    				break;
    			case "collapsed":
    				c = a.tail;
    				for (var d = null; null !== c;) null !== c.alternate && (d = c), c = c.sibling;
    				null === d ? b || null === a.tail ? a.tail = null : a.tail.sibling = null : d.sibling = null;
    		}
    	}
    	function S(a) {
    		var b = null !== a.alternate && a.alternate.child === a.child, c = 0, d = 0;
    		if (b) for (var e = a.child; null !== e;) c |= e.lanes | e.childLanes, d |= e.subtreeFlags & 14680064, d |= e.flags & 14680064, e.return = a, e = e.sibling;
    		else for (e = a.child; null !== e;) c |= e.lanes | e.childLanes, d |= e.subtreeFlags, d |= e.flags, e.return = a, e = e.sibling;
    		a.subtreeFlags |= d;
    		a.childLanes = c;
    		return b;
    	}
    	function Ej(a, b, c) {
    		var d = b.pendingProps;
    		wg(b);
    		switch (b.tag) {
    			case 2:
    			case 16:
    			case 15:
    			case 0:
    			case 11:
    			case 7:
    			case 8:
    			case 12:
    			case 9:
    			case 14: return S(b), null;
    			case 1: return Zf(b.type) && $f(), S(b), null;
    			case 3:
    				d = b.stateNode;
    				zh();
    				E(Wf);
    				E(H);
    				Eh();
    				d.pendingContext && (d.context = d.pendingContext, d.pendingContext = null);
    				if (null === a || null === a.child) Gg(b) ? b.flags |= 4 : null === a || a.memoizedState.isDehydrated && 0 === (b.flags & 256) || (b.flags |= 1024, null !== zg && (Fj(zg), zg = null));
    				S(b);
    				return null;
    			case 5:
    				Bh(b);
    				var e = xh(wh.current);
    				c = b.type;
    				if (null !== a && null != b.stateNode) Bj(a, b, c, d, e), a.ref !== b.ref && (b.flags |= 512, b.flags |= 2097152);
    				else {
    					if (!d) {
    						if (null === b.stateNode) throw Error(p(166));
    						S(b);
    						return null;
    					}
    					a = xh(uh.current);
    					if (Gg(b)) {
    						d = b.stateNode;
    						c = b.type;
    						var f = b.memoizedProps;
    						d[Of] = b;
    						d[Pf] = f;
    						a = 0 !== (b.mode & 1);
    						switch (c) {
    							case "dialog":
    								D("cancel", d);
    								D("close", d);
    								break;
    							case "iframe":
    							case "object":
    							case "embed":
    								D("load", d);
    								break;
    							case "video":
    							case "audio":
    								for (e = 0; e < lf.length; e++) D(lf[e], d);
    								break;
    							case "source":
    								D("error", d);
    								break;
    							case "img":
    							case "image":
    							case "link":
    								D("error", d);
    								D("load", d);
    								break;
    							case "details":
    								D("toggle", d);
    								break;
    							case "input":
    								Za(d, f);
    								D("invalid", d);
    								break;
    							case "select":
    								d._wrapperState = { wasMultiple: !!f.multiple };
    								D("invalid", d);
    								break;
    							case "textarea": hb(d, f), D("invalid", d);
    						}
    						ub(c, f);
    						e = null;
    						for (var g in f) if (f.hasOwnProperty(g)) {
    							var h = f[g];
    							"children" === g ? "string" === typeof h ? d.textContent !== h && (!0 !== f.suppressHydrationWarning && Af(d.textContent, h, a), e = ["children", h]) : "number" === typeof h && d.textContent !== "" + h && (!0 !== f.suppressHydrationWarning && Af(d.textContent, h, a), e = ["children", "" + h]) : ea.hasOwnProperty(g) && null != h && "onScroll" === g && D("scroll", d);
    						}
    						switch (c) {
    							case "input":
    								Va(d);
    								db(d, f, !0);
    								break;
    							case "textarea":
    								Va(d);
    								jb(d);
    								break;
    							case "select":
    							case "option": break;
    							default: "function" === typeof f.onClick && (d.onclick = Bf);
    						}
    						d = e;
    						b.updateQueue = d;
    						null !== d && (b.flags |= 4);
    					} else {
    						g = 9 === e.nodeType ? e : e.ownerDocument;
    						"http://www.w3.org/1999/xhtml" === a && (a = kb(c));
    						"http://www.w3.org/1999/xhtml" === a ? "script" === c ? (a = g.createElement("div"), a.innerHTML = "<script><\/script>", a = a.removeChild(a.firstChild)) : "string" === typeof d.is ? a = g.createElement(c, { is: d.is }) : (a = g.createElement(c), "select" === c && (g = a, d.multiple ? g.multiple = !0 : d.size && (g.size = d.size))) : a = g.createElementNS(a, c);
    						a[Of] = b;
    						a[Pf] = d;
    						zj(a, b, !1, !1);
    						b.stateNode = a;
    						a: {
    							g = vb(c, d);
    							switch (c) {
    								case "dialog":
    									D("cancel", a);
    									D("close", a);
    									e = d;
    									break;
    								case "iframe":
    								case "object":
    								case "embed":
    									D("load", a);
    									e = d;
    									break;
    								case "video":
    								case "audio":
    									for (e = 0; e < lf.length; e++) D(lf[e], a);
    									e = d;
    									break;
    								case "source":
    									D("error", a);
    									e = d;
    									break;
    								case "img":
    								case "image":
    								case "link":
    									D("error", a);
    									D("load", a);
    									e = d;
    									break;
    								case "details":
    									D("toggle", a);
    									e = d;
    									break;
    								case "input":
    									Za(a, d);
    									e = Ya(a, d);
    									D("invalid", a);
    									break;
    								case "option":
    									e = d;
    									break;
    								case "select":
    									a._wrapperState = { wasMultiple: !!d.multiple };
    									e = A({}, d, { value: void 0 });
    									D("invalid", a);
    									break;
    								case "textarea":
    									hb(a, d);
    									e = gb(a, d);
    									D("invalid", a);
    									break;
    								default: e = d;
    							}
    							ub(c, e);
    							h = e;
    							for (f in h) if (h.hasOwnProperty(f)) {
    								var k = h[f];
    								"style" === f ? sb(a, k) : "dangerouslySetInnerHTML" === f ? (k = k ? k.__html : void 0, null != k && nb(a, k)) : "children" === f ? "string" === typeof k ? ("textarea" !== c || "" !== k) && ob(a, k) : "number" === typeof k && ob(a, "" + k) : "suppressContentEditableWarning" !== f && "suppressHydrationWarning" !== f && "autoFocus" !== f && (ea.hasOwnProperty(f) ? null != k && "onScroll" === f && D("scroll", a) : null != k && ta(a, f, k, g));
    							}
    							switch (c) {
    								case "input":
    									Va(a);
    									db(a, d, !1);
    									break;
    								case "textarea":
    									Va(a);
    									jb(a);
    									break;
    								case "option":
    									null != d.value && a.setAttribute("value", "" + Sa(d.value));
    									break;
    								case "select":
    									a.multiple = !!d.multiple;
    									f = d.value;
    									null != f ? fb(a, !!d.multiple, f, !1) : null != d.defaultValue && fb(a, !!d.multiple, d.defaultValue, !0);
    									break;
    								default: "function" === typeof e.onClick && (a.onclick = Bf);
    							}
    							switch (c) {
    								case "button":
    								case "input":
    								case "select":
    								case "textarea":
    									d = !!d.autoFocus;
    									break a;
    								case "img":
    									d = !0;
    									break a;
    								default: d = !1;
    							}
    						}
    						d && (b.flags |= 4);
    					}
    					null !== b.ref && (b.flags |= 512, b.flags |= 2097152);
    				}
    				S(b);
    				return null;
    			case 6:
    				if (a && null != b.stateNode) Cj(a, b, a.memoizedProps, d);
    				else {
    					if ("string" !== typeof d && null === b.stateNode) throw Error(p(166));
    					c = xh(wh.current);
    					xh(uh.current);
    					if (Gg(b)) {
    						d = b.stateNode;
    						c = b.memoizedProps;
    						d[Of] = b;
    						if (f = d.nodeValue !== c) {
    							if (a = xg, null !== a) switch (a.tag) {
    								case 3:
    									Af(d.nodeValue, c, 0 !== (a.mode & 1));
    									break;
    								case 5: !0 !== a.memoizedProps.suppressHydrationWarning && Af(d.nodeValue, c, 0 !== (a.mode & 1));
    							}
    						}
    						f && (b.flags |= 4);
    					} else d = (9 === c.nodeType ? c : c.ownerDocument).createTextNode(d), d[Of] = b, b.stateNode = d;
    				}
    				S(b);
    				return null;
    			case 13:
    				E(L);
    				d = b.memoizedState;
    				if (null === a || null !== a.memoizedState && null !== a.memoizedState.dehydrated) {
    					if (I && null !== yg && 0 !== (b.mode & 1) && 0 === (b.flags & 128)) Hg(), Ig(), b.flags |= 98560, f = !1;
    					else if (f = Gg(b), null !== d && null !== d.dehydrated) {
    						if (null === a) {
    							if (!f) throw Error(p(318));
    							f = b.memoizedState;
    							f = null !== f ? f.dehydrated : null;
    							if (!f) throw Error(p(317));
    							f[Of] = b;
    						} else Ig(), 0 === (b.flags & 128) && (b.memoizedState = null), b.flags |= 4;
    						S(b);
    						f = !1;
    					} else null !== zg && (Fj(zg), zg = null), f = !0;
    					if (!f) return b.flags & 65536 ? b : null;
    				}
    				if (0 !== (b.flags & 128)) return b.lanes = c, b;
    				d = null !== d;
    				d !== (null !== a && null !== a.memoizedState) && d && (b.child.flags |= 8192, 0 !== (b.mode & 1) && (null === a || 0 !== (L.current & 1) ? 0 === T && (T = 3) : tj()));
    				null !== b.updateQueue && (b.flags |= 4);
    				S(b);
    				return null;
    			case 4: return zh(), null === a && sf(b.stateNode.containerInfo), S(b), null;
    			case 10: return ah(b.type._context), S(b), null;
    			case 17: return Zf(b.type) && $f(), S(b), null;
    			case 19:
    				E(L);
    				f = b.memoizedState;
    				if (null === f) return S(b), null;
    				d = 0 !== (b.flags & 128);
    				g = f.rendering;
    				if (null === g) if (d) Dj(f, !1);
    				else {
    					if (0 !== T || null !== a && 0 !== (a.flags & 128)) for (a = b.child; null !== a;) {
    						g = Ch(a);
    						if (null !== g) {
    							b.flags |= 128;
    							Dj(f, !1);
    							d = g.updateQueue;
    							null !== d && (b.updateQueue = d, b.flags |= 4);
    							b.subtreeFlags = 0;
    							d = c;
    							for (c = b.child; null !== c;) f = c, a = d, f.flags &= 14680066, g = f.alternate, null === g ? (f.childLanes = 0, f.lanes = a, f.child = null, f.subtreeFlags = 0, f.memoizedProps = null, f.memoizedState = null, f.updateQueue = null, f.dependencies = null, f.stateNode = null) : (f.childLanes = g.childLanes, f.lanes = g.lanes, f.child = g.child, f.subtreeFlags = 0, f.deletions = null, f.memoizedProps = g.memoizedProps, f.memoizedState = g.memoizedState, f.updateQueue = g.updateQueue, f.type = g.type, a = g.dependencies, f.dependencies = null === a ? null : {
    								lanes: a.lanes,
    								firstContext: a.firstContext
    							}), c = c.sibling;
    							G(L, L.current & 1 | 2);
    							return b.child;
    						}
    						a = a.sibling;
    					}
    					null !== f.tail && B() > Gj && (b.flags |= 128, d = !0, Dj(f, !1), b.lanes = 4194304);
    				}
    				else {
    					if (!d) if (a = Ch(g), null !== a) {
    						if (b.flags |= 128, d = !0, c = a.updateQueue, null !== c && (b.updateQueue = c, b.flags |= 4), Dj(f, !0), null === f.tail && "hidden" === f.tailMode && !g.alternate && !I) return S(b), null;
    					} else 2 * B() - f.renderingStartTime > Gj && 1073741824 !== c && (b.flags |= 128, d = !0, Dj(f, !1), b.lanes = 4194304);
    					f.isBackwards ? (g.sibling = b.child, b.child = g) : (c = f.last, null !== c ? c.sibling = g : b.child = g, f.last = g);
    				}
    				if (null !== f.tail) return b = f.tail, f.rendering = b, f.tail = b.sibling, f.renderingStartTime = B(), b.sibling = null, c = L.current, G(L, d ? c & 1 | 2 : c & 1), b;
    				S(b);
    				return null;
    			case 22:
    			case 23: return Hj(), d = null !== b.memoizedState, null !== a && null !== a.memoizedState !== d && (b.flags |= 8192), d && 0 !== (b.mode & 1) ? 0 !== (fj & 1073741824) && (S(b), b.subtreeFlags & 6 && (b.flags |= 8192)) : S(b), null;
    			case 24: return null;
    			case 25: return null;
    		}
    		throw Error(p(156, b.tag));
    	}
    	function Ij(a, b) {
    		wg(b);
    		switch (b.tag) {
    			case 1: return Zf(b.type) && $f(), a = b.flags, a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
    			case 3: return zh(), E(Wf), E(H), Eh(), a = b.flags, 0 !== (a & 65536) && 0 === (a & 128) ? (b.flags = a & -65537 | 128, b) : null;
    			case 5: return Bh(b), null;
    			case 13:
    				E(L);
    				a = b.memoizedState;
    				if (null !== a && null !== a.dehydrated) {
    					if (null === b.alternate) throw Error(p(340));
    					Ig();
    				}
    				a = b.flags;
    				return a & 65536 ? (b.flags = a & -65537 | 128, b) : null;
    			case 19: return E(L), null;
    			case 4: return zh(), null;
    			case 10: return ah(b.type._context), null;
    			case 22:
    			case 23: return Hj(), null;
    			case 24: return null;
    			default: return null;
    		}
    	}
    	var Jj = !1;
    	var U = !1;
    	var Kj = "function" === typeof WeakSet ? WeakSet : Set;
    	var V = null;
    	function Lj(a, b) {
    		var c = a.ref;
    		if (null !== c) if ("function" === typeof c) try {
    			c(null);
    		} catch (d) {
    			W(a, b, d);
    		}
    		else c.current = null;
    	}
    	function Mj(a, b, c) {
    		try {
    			c();
    		} catch (d) {
    			W(a, b, d);
    		}
    	}
    	var Nj = !1;
    	function Oj(a, b) {
    		Cf = dd;
    		a = Me();
    		if (Ne(a)) {
    			if ("selectionStart" in a) var c = {
    				start: a.selectionStart,
    				end: a.selectionEnd
    			};
    			else a: {
    				c = (c = a.ownerDocument) && c.defaultView || window;
    				var d = c.getSelection && c.getSelection();
    				if (d && 0 !== d.rangeCount) {
    					c = d.anchorNode;
    					var e = d.anchorOffset, f = d.focusNode;
    					d = d.focusOffset;
    					try {
    						c.nodeType, f.nodeType;
    					} catch (F) {
    						c = null;
    						break a;
    					}
    					var g = 0, h = -1, k = -1, l = 0, m = 0, q = a, r = null;
    					b: for (;;) {
    						for (var y;;) {
    							q !== c || 0 !== e && 3 !== q.nodeType || (h = g + e);
    							q !== f || 0 !== d && 3 !== q.nodeType || (k = g + d);
    							3 === q.nodeType && (g += q.nodeValue.length);
    							if (null === (y = q.firstChild)) break;
    							r = q;
    							q = y;
    						}
    						for (;;) {
    							if (q === a) break b;
    							r === c && ++l === e && (h = g);
    							r === f && ++m === d && (k = g);
    							if (null !== (y = q.nextSibling)) break;
    							q = r;
    							r = q.parentNode;
    						}
    						q = y;
    					}
    					c = -1 === h || -1 === k ? null : {
    						start: h,
    						end: k
    					};
    				} else c = null;
    			}
    			c = c || {
    				start: 0,
    				end: 0
    			};
    		} else c = null;
    		Df = {
    			focusedElem: a,
    			selectionRange: c
    		};
    		dd = !1;
    		for (V = b; null !== V;) if (b = V, a = b.child, 0 !== (b.subtreeFlags & 1028) && null !== a) a.return = b, V = a;
    		else for (; null !== V;) {
    			b = V;
    			try {
    				var n = b.alternate;
    				if (0 !== (b.flags & 1024)) switch (b.tag) {
    					case 0:
    					case 11:
    					case 15: break;
    					case 1:
    						if (null !== n) {
    							var t = n.memoizedProps, J = n.memoizedState, x = b.stateNode;
    							x.__reactInternalSnapshotBeforeUpdate = x.getSnapshotBeforeUpdate(b.elementType === b.type ? t : Ci(b.type, t), J);
    						}
    						break;
    					case 3:
    						var u = b.stateNode.containerInfo;
    						1 === u.nodeType ? u.textContent = "" : 9 === u.nodeType && u.documentElement && u.removeChild(u.documentElement);
    						break;
    					case 5:
    					case 6:
    					case 4:
    					case 17: break;
    					default: throw Error(p(163));
    				}
    			} catch (F) {
    				W(b, b.return, F);
    			}
    			a = b.sibling;
    			if (null !== a) {
    				a.return = b.return;
    				V = a;
    				break;
    			}
    			V = b.return;
    		}
    		n = Nj;
    		Nj = !1;
    		return n;
    	}
    	function Pj(a, b, c) {
    		var d = b.updateQueue;
    		d = null !== d ? d.lastEffect : null;
    		if (null !== d) {
    			var e = d = d.next;
    			do {
    				if ((e.tag & a) === a) {
    					var f = e.destroy;
    					e.destroy = void 0;
    					void 0 !== f && Mj(b, c, f);
    				}
    				e = e.next;
    			} while (e !== d);
    		}
    	}
    	function Qj(a, b) {
    		b = b.updateQueue;
    		b = null !== b ? b.lastEffect : null;
    		if (null !== b) {
    			var c = b = b.next;
    			do {
    				if ((c.tag & a) === a) {
    					var d = c.create;
    					c.destroy = d();
    				}
    				c = c.next;
    			} while (c !== b);
    		}
    	}
    	function Rj(a) {
    		var b = a.ref;
    		if (null !== b) {
    			var c = a.stateNode;
    			switch (a.tag) {
    				case 5:
    					a = c;
    					break;
    				default: a = c;
    			}
    			"function" === typeof b ? b(a) : b.current = a;
    		}
    	}
    	function Sj(a) {
    		var b = a.alternate;
    		null !== b && (a.alternate = null, Sj(b));
    		a.child = null;
    		a.deletions = null;
    		a.sibling = null;
    		5 === a.tag && (b = a.stateNode, null !== b && (delete b[Of], delete b[Pf], delete b[of], delete b[Qf], delete b[Rf]));
    		a.stateNode = null;
    		a.return = null;
    		a.dependencies = null;
    		a.memoizedProps = null;
    		a.memoizedState = null;
    		a.pendingProps = null;
    		a.stateNode = null;
    		a.updateQueue = null;
    	}
    	function Tj(a) {
    		return 5 === a.tag || 3 === a.tag || 4 === a.tag;
    	}
    	function Uj(a) {
    		a: for (;;) {
    			for (; null === a.sibling;) {
    				if (null === a.return || Tj(a.return)) return null;
    				a = a.return;
    			}
    			a.sibling.return = a.return;
    			for (a = a.sibling; 5 !== a.tag && 6 !== a.tag && 18 !== a.tag;) {
    				if (a.flags & 2) continue a;
    				if (null === a.child || 4 === a.tag) continue a;
    				else a.child.return = a, a = a.child;
    			}
    			if (!(a.flags & 2)) return a.stateNode;
    		}
    	}
    	function Vj(a, b, c) {
    		var d = a.tag;
    		if (5 === d || 6 === d) a = a.stateNode, b ? 8 === c.nodeType ? c.parentNode.insertBefore(a, b) : c.insertBefore(a, b) : (8 === c.nodeType ? (b = c.parentNode, b.insertBefore(a, c)) : (b = c, b.appendChild(a)), c = c._reactRootContainer, null !== c && void 0 !== c || null !== b.onclick || (b.onclick = Bf));
    		else if (4 !== d && (a = a.child, null !== a)) for (Vj(a, b, c), a = a.sibling; null !== a;) Vj(a, b, c), a = a.sibling;
    	}
    	function Wj(a, b, c) {
    		var d = a.tag;
    		if (5 === d || 6 === d) a = a.stateNode, b ? c.insertBefore(a, b) : c.appendChild(a);
    		else if (4 !== d && (a = a.child, null !== a)) for (Wj(a, b, c), a = a.sibling; null !== a;) Wj(a, b, c), a = a.sibling;
    	}
    	var X = null;
    	var Xj = !1;
    	function Yj(a, b, c) {
    		for (c = c.child; null !== c;) Zj(a, b, c), c = c.sibling;
    	}
    	function Zj(a, b, c) {
    		if (lc && "function" === typeof lc.onCommitFiberUnmount) try {
    			lc.onCommitFiberUnmount(kc, c);
    		} catch (h) {}
    		switch (c.tag) {
    			case 5: U || Lj(c, b);
    			case 6:
    				var d = X, e = Xj;
    				X = null;
    				Yj(a, b, c);
    				X = d;
    				Xj = e;
    				null !== X && (Xj ? (a = X, c = c.stateNode, 8 === a.nodeType ? a.parentNode.removeChild(c) : a.removeChild(c)) : X.removeChild(c.stateNode));
    				break;
    			case 18:
    				null !== X && (Xj ? (a = X, c = c.stateNode, 8 === a.nodeType ? Kf(a.parentNode, c) : 1 === a.nodeType && Kf(a, c), bd(a)) : Kf(X, c.stateNode));
    				break;
    			case 4:
    				d = X;
    				e = Xj;
    				X = c.stateNode.containerInfo;
    				Xj = !0;
    				Yj(a, b, c);
    				X = d;
    				Xj = e;
    				break;
    			case 0:
    			case 11:
    			case 14:
    			case 15:
    				if (!U && (d = c.updateQueue, null !== d && (d = d.lastEffect, null !== d))) {
    					e = d = d.next;
    					do {
    						var f = e, g = f.destroy;
    						f = f.tag;
    						void 0 !== g && (0 !== (f & 2) ? Mj(c, b, g) : 0 !== (f & 4) && Mj(c, b, g));
    						e = e.next;
    					} while (e !== d);
    				}
    				Yj(a, b, c);
    				break;
    			case 1:
    				if (!U && (Lj(c, b), d = c.stateNode, "function" === typeof d.componentWillUnmount)) try {
    					d.props = c.memoizedProps, d.state = c.memoizedState, d.componentWillUnmount();
    				} catch (h) {
    					W(c, b, h);
    				}
    				Yj(a, b, c);
    				break;
    			case 21:
    				Yj(a, b, c);
    				break;
    			case 22:
    				c.mode & 1 ? (U = (d = U) || null !== c.memoizedState, Yj(a, b, c), U = d) : Yj(a, b, c);
    				break;
    			default: Yj(a, b, c);
    		}
    	}
    	function ak(a) {
    		var b = a.updateQueue;
    		if (null !== b) {
    			a.updateQueue = null;
    			var c = a.stateNode;
    			null === c && (c = a.stateNode = new Kj());
    			b.forEach(function(b) {
    				var d = bk.bind(null, a, b);
    				c.has(b) || (c.add(b), b.then(d, d));
    			});
    		}
    	}
    	function ck(a, b) {
    		var c = b.deletions;
    		if (null !== c) for (var d = 0; d < c.length; d++) {
    			var e = c[d];
    			try {
    				var f = a, g = b, h = g;
    				a: for (; null !== h;) {
    					switch (h.tag) {
    						case 5:
    							X = h.stateNode;
    							Xj = !1;
    							break a;
    						case 3:
    							X = h.stateNode.containerInfo;
    							Xj = !0;
    							break a;
    						case 4:
    							X = h.stateNode.containerInfo;
    							Xj = !0;
    							break a;
    					}
    					h = h.return;
    				}
    				if (null === X) throw Error(p(160));
    				Zj(f, g, e);
    				X = null;
    				Xj = !1;
    				var k = e.alternate;
    				null !== k && (k.return = null);
    				e.return = null;
    			} catch (l) {
    				W(e, b, l);
    			}
    		}
    		if (b.subtreeFlags & 12854) for (b = b.child; null !== b;) dk(b, a), b = b.sibling;
    	}
    	function dk(a, b) {
    		var c = a.alternate, d = a.flags;
    		switch (a.tag) {
    			case 0:
    			case 11:
    			case 14:
    			case 15:
    				ck(b, a);
    				ek(a);
    				if (d & 4) {
    					try {
    						Pj(3, a, a.return), Qj(3, a);
    					} catch (t) {
    						W(a, a.return, t);
    					}
    					try {
    						Pj(5, a, a.return);
    					} catch (t) {
    						W(a, a.return, t);
    					}
    				}
    				break;
    			case 1:
    				ck(b, a);
    				ek(a);
    				d & 512 && null !== c && Lj(c, c.return);
    				break;
    			case 5:
    				ck(b, a);
    				ek(a);
    				d & 512 && null !== c && Lj(c, c.return);
    				if (a.flags & 32) {
    					var e = a.stateNode;
    					try {
    						ob(e, "");
    					} catch (t) {
    						W(a, a.return, t);
    					}
    				}
    				if (d & 4 && (e = a.stateNode, null != e)) {
    					var f = a.memoizedProps, g = null !== c ? c.memoizedProps : f, h = a.type, k = a.updateQueue;
    					a.updateQueue = null;
    					if (null !== k) try {
    						"input" === h && "radio" === f.type && null != f.name && ab(e, f);
    						vb(h, g);
    						var l = vb(h, f);
    						for (g = 0; g < k.length; g += 2) {
    							var m = k[g], q = k[g + 1];
    							"style" === m ? sb(e, q) : "dangerouslySetInnerHTML" === m ? nb(e, q) : "children" === m ? ob(e, q) : ta(e, m, q, l);
    						}
    						switch (h) {
    							case "input":
    								bb(e, f);
    								break;
    							case "textarea":
    								ib(e, f);
    								break;
    							case "select":
    								var r = e._wrapperState.wasMultiple;
    								e._wrapperState.wasMultiple = !!f.multiple;
    								var y = f.value;
    								null != y ? fb(e, !!f.multiple, y, !1) : r !== !!f.multiple && (null != f.defaultValue ? fb(e, !!f.multiple, f.defaultValue, !0) : fb(e, !!f.multiple, f.multiple ? [] : "", !1));
    						}
    						e[Pf] = f;
    					} catch (t) {
    						W(a, a.return, t);
    					}
    				}
    				break;
    			case 6:
    				ck(b, a);
    				ek(a);
    				if (d & 4) {
    					if (null === a.stateNode) throw Error(p(162));
    					e = a.stateNode;
    					f = a.memoizedProps;
    					try {
    						e.nodeValue = f;
    					} catch (t) {
    						W(a, a.return, t);
    					}
    				}
    				break;
    			case 3:
    				ck(b, a);
    				ek(a);
    				if (d & 4 && null !== c && c.memoizedState.isDehydrated) try {
    					bd(b.containerInfo);
    				} catch (t) {
    					W(a, a.return, t);
    				}
    				break;
    			case 4:
    				ck(b, a);
    				ek(a);
    				break;
    			case 13:
    				ck(b, a);
    				ek(a);
    				e = a.child;
    				e.flags & 8192 && (f = null !== e.memoizedState, e.stateNode.isHidden = f, !f || null !== e.alternate && null !== e.alternate.memoizedState || (fk = B()));
    				d & 4 && ak(a);
    				break;
    			case 22:
    				m = null !== c && null !== c.memoizedState;
    				a.mode & 1 ? (U = (l = U) || m, ck(b, a), U = l) : ck(b, a);
    				ek(a);
    				if (d & 8192) {
    					l = null !== a.memoizedState;
    					if ((a.stateNode.isHidden = l) && !m && 0 !== (a.mode & 1)) for (V = a, m = a.child; null !== m;) {
    						for (q = V = m; null !== V;) {
    							r = V;
    							y = r.child;
    							switch (r.tag) {
    								case 0:
    								case 11:
    								case 14:
    								case 15:
    									Pj(4, r, r.return);
    									break;
    								case 1:
    									Lj(r, r.return);
    									var n = r.stateNode;
    									if ("function" === typeof n.componentWillUnmount) {
    										d = r;
    										c = r.return;
    										try {
    											b = d, n.props = b.memoizedProps, n.state = b.memoizedState, n.componentWillUnmount();
    										} catch (t) {
    											W(d, c, t);
    										}
    									}
    									break;
    								case 5:
    									Lj(r, r.return);
    									break;
    								case 22: if (null !== r.memoizedState) {
    									gk(q);
    									continue;
    								}
    							}
    							null !== y ? (y.return = r, V = y) : gk(q);
    						}
    						m = m.sibling;
    					}
    					a: for (m = null, q = a;;) {
    						if (5 === q.tag) {
    							if (null === m) {
    								m = q;
    								try {
    									e = q.stateNode, l ? (f = e.style, "function" === typeof f.setProperty ? f.setProperty("display", "none", "important") : f.display = "none") : (h = q.stateNode, k = q.memoizedProps.style, g = void 0 !== k && null !== k && k.hasOwnProperty("display") ? k.display : null, h.style.display = rb("display", g));
    								} catch (t) {
    									W(a, a.return, t);
    								}
    							}
    						} else if (6 === q.tag) {
    							if (null === m) try {
    								q.stateNode.nodeValue = l ? "" : q.memoizedProps;
    							} catch (t) {
    								W(a, a.return, t);
    							}
    						} else if ((22 !== q.tag && 23 !== q.tag || null === q.memoizedState || q === a) && null !== q.child) {
    							q.child.return = q;
    							q = q.child;
    							continue;
    						}
    						if (q === a) break a;
    						for (; null === q.sibling;) {
    							if (null === q.return || q.return === a) break a;
    							m === q && (m = null);
    							q = q.return;
    						}
    						m === q && (m = null);
    						q.sibling.return = q.return;
    						q = q.sibling;
    					}
    				}
    				break;
    			case 19:
    				ck(b, a);
    				ek(a);
    				d & 4 && ak(a);
    				break;
    			case 21: break;
    			default: ck(b, a), ek(a);
    		}
    	}
    	function ek(a) {
    		var b = a.flags;
    		if (b & 2) {
    			try {
    				a: {
    					for (var c = a.return; null !== c;) {
    						if (Tj(c)) {
    							var d = c;
    							break a;
    						}
    						c = c.return;
    					}
    					throw Error(p(160));
    				}
    				switch (d.tag) {
    					case 5:
    						var e = d.stateNode;
    						d.flags & 32 && (ob(e, ""), d.flags &= -33);
    						Wj(a, Uj(a), e);
    						break;
    					case 3:
    					case 4:
    						var g = d.stateNode.containerInfo;
    						Vj(a, Uj(a), g);
    						break;
    					default: throw Error(p(161));
    				}
    			} catch (k) {
    				W(a, a.return, k);
    			}
    			a.flags &= -3;
    		}
    		b & 4096 && (a.flags &= -4097);
    	}
    	function hk(a, b, c) {
    		V = a;
    		ik(a, b, c);
    	}
    	function ik(a, b, c) {
    		for (var d = 0 !== (a.mode & 1); null !== V;) {
    			var e = V, f = e.child;
    			if (22 === e.tag && d) {
    				var g = null !== e.memoizedState || Jj;
    				if (!g) {
    					var h = e.alternate, k = null !== h && null !== h.memoizedState || U;
    					h = Jj;
    					var l = U;
    					Jj = g;
    					if ((U = k) && !l) for (V = e; null !== V;) g = V, k = g.child, 22 === g.tag && null !== g.memoizedState ? jk(e) : null !== k ? (k.return = g, V = k) : jk(e);
    					for (; null !== f;) V = f, ik(f, b, c), f = f.sibling;
    					V = e;
    					Jj = h;
    					U = l;
    				}
    				kk(a, b, c);
    			} else 0 !== (e.subtreeFlags & 8772) && null !== f ? (f.return = e, V = f) : kk(a, b, c);
    		}
    	}
    	function kk(a) {
    		for (; null !== V;) {
    			var b = V;
    			if (0 !== (b.flags & 8772)) {
    				var c = b.alternate;
    				try {
    					if (0 !== (b.flags & 8772)) switch (b.tag) {
    						case 0:
    						case 11:
    						case 15:
    							U || Qj(5, b);
    							break;
    						case 1:
    							var d = b.stateNode;
    							if (b.flags & 4 && !U) if (null === c) d.componentDidMount();
    							else {
    								var e = b.elementType === b.type ? c.memoizedProps : Ci(b.type, c.memoizedProps);
    								d.componentDidUpdate(e, c.memoizedState, d.__reactInternalSnapshotBeforeUpdate);
    							}
    							var f = b.updateQueue;
    							null !== f && sh(b, f, d);
    							break;
    						case 3:
    							var g = b.updateQueue;
    							if (null !== g) {
    								c = null;
    								if (null !== b.child) switch (b.child.tag) {
    									case 5:
    										c = b.child.stateNode;
    										break;
    									case 1: c = b.child.stateNode;
    								}
    								sh(b, g, c);
    							}
    							break;
    						case 5:
    							var h = b.stateNode;
    							if (null === c && b.flags & 4) {
    								c = h;
    								var k = b.memoizedProps;
    								switch (b.type) {
    									case "button":
    									case "input":
    									case "select":
    									case "textarea":
    										k.autoFocus && c.focus();
    										break;
    									case "img": k.src && (c.src = k.src);
    								}
    							}
    							break;
    						case 6: break;
    						case 4: break;
    						case 12: break;
    						case 13:
    							if (null === b.memoizedState) {
    								var l = b.alternate;
    								if (null !== l) {
    									var m = l.memoizedState;
    									if (null !== m) {
    										var q = m.dehydrated;
    										null !== q && bd(q);
    									}
    								}
    							}
    							break;
    						case 19:
    						case 17:
    						case 21:
    						case 22:
    						case 23:
    						case 25: break;
    						default: throw Error(p(163));
    					}
    					U || b.flags & 512 && Rj(b);
    				} catch (r) {
    					W(b, b.return, r);
    				}
    			}
    			if (b === a) {
    				V = null;
    				break;
    			}
    			c = b.sibling;
    			if (null !== c) {
    				c.return = b.return;
    				V = c;
    				break;
    			}
    			V = b.return;
    		}
    	}
    	function gk(a) {
    		for (; null !== V;) {
    			var b = V;
    			if (b === a) {
    				V = null;
    				break;
    			}
    			var c = b.sibling;
    			if (null !== c) {
    				c.return = b.return;
    				V = c;
    				break;
    			}
    			V = b.return;
    		}
    	}
    	function jk(a) {
    		for (; null !== V;) {
    			var b = V;
    			try {
    				switch (b.tag) {
    					case 0:
    					case 11:
    					case 15:
    						var c = b.return;
    						try {
    							Qj(4, b);
    						} catch (k) {
    							W(b, c, k);
    						}
    						break;
    					case 1:
    						var d = b.stateNode;
    						if ("function" === typeof d.componentDidMount) {
    							var e = b.return;
    							try {
    								d.componentDidMount();
    							} catch (k) {
    								W(b, e, k);
    							}
    						}
    						var f = b.return;
    						try {
    							Rj(b);
    						} catch (k) {
    							W(b, f, k);
    						}
    						break;
    					case 5:
    						var g = b.return;
    						try {
    							Rj(b);
    						} catch (k) {
    							W(b, g, k);
    						}
    				}
    			} catch (k) {
    				W(b, b.return, k);
    			}
    			if (b === a) {
    				V = null;
    				break;
    			}
    			var h = b.sibling;
    			if (null !== h) {
    				h.return = b.return;
    				V = h;
    				break;
    			}
    			V = b.return;
    		}
    	}
    	var lk = Math.ceil;
    	var mk = ua.ReactCurrentDispatcher;
    	var nk = ua.ReactCurrentOwner;
    	var ok = ua.ReactCurrentBatchConfig;
    	var K = 0;
    	var Q = null;
    	var Y = null;
    	var Z = 0;
    	var fj = 0;
    	var ej = Uf(0);
    	var T = 0;
    	var pk = null;
    	var rh = 0;
    	var qk = 0;
    	var rk = 0;
    	var sk = null;
    	var tk = null;
    	var fk = 0;
    	var Gj = Infinity;
    	var uk = null;
    	var Oi = !1;
    	var Pi = null;
    	var Ri = null;
    	var vk = !1;
    	var wk = null;
    	var xk = 0;
    	var yk = 0;
    	var zk = null;
    	var Ak = -1;
    	var Bk = 0;
    	function R() {
    		return 0 !== (K & 6) ? B() : -1 !== Ak ? Ak : Ak = B();
    	}
    	function yi(a) {
    		if (0 === (a.mode & 1)) return 1;
    		if (0 !== (K & 2) && 0 !== Z) return Z & -Z;
    		if (null !== Kg.transition) return 0 === Bk && (Bk = yc()), Bk;
    		a = C;
    		if (0 !== a) return a;
    		a = window.event;
    		a = void 0 === a ? 16 : jd(a.type);
    		return a;
    	}
    	function gi(a, b, c, d) {
    		if (50 < yk) throw yk = 0, zk = null, Error(p(185));
    		Ac(a, c, d);
    		if (0 === (K & 2) || a !== Q) a === Q && (0 === (K & 2) && (qk |= c), 4 === T && Ck(a, Z)), Dk(a, d), 1 === c && 0 === K && 0 === (b.mode & 1) && (Gj = B() + 500, fg && jg());
    	}
    	function Dk(a, b) {
    		var c = a.callbackNode;
    		wc(a, b);
    		var d = uc(a, a === Q ? Z : 0);
    		if (0 === d) null !== c && bc(c), a.callbackNode = null, a.callbackPriority = 0;
    		else if (b = d & -d, a.callbackPriority !== b) {
    			null != c && bc(c);
    			if (1 === b) 0 === a.tag ? ig(Ek.bind(null, a)) : hg(Ek.bind(null, a)), Jf(function() {
    				0 === (K & 6) && jg();
    			}), c = null;
    			else {
    				switch (Dc(d)) {
    					case 1:
    						c = fc;
    						break;
    					case 4:
    						c = gc;
    						break;
    					case 16:
    						c = hc;
    						break;
    					case 536870912:
    						c = jc;
    						break;
    					default: c = hc;
    				}
    				c = Fk(c, Gk.bind(null, a));
    			}
    			a.callbackPriority = b;
    			a.callbackNode = c;
    		}
    	}
    	function Gk(a, b) {
    		Ak = -1;
    		Bk = 0;
    		if (0 !== (K & 6)) throw Error(p(327));
    		var c = a.callbackNode;
    		if (Hk() && a.callbackNode !== c) return null;
    		var d = uc(a, a === Q ? Z : 0);
    		if (0 === d) return null;
    		if (0 !== (d & 30) || 0 !== (d & a.expiredLanes) || b) b = Ik(a, d);
    		else {
    			b = d;
    			var e = K;
    			K |= 2;
    			var f = Jk();
    			if (Q !== a || Z !== b) uk = null, Gj = B() + 500, Kk(a, b);
    			do
    				try {
    					Lk();
    					break;
    				} catch (h) {
    					Mk(a, h);
    				}
    			while (1);
    			$g();
    			mk.current = f;
    			K = e;
    			null !== Y ? b = 0 : (Q = null, Z = 0, b = T);
    		}
    		if (0 !== b) {
    			2 === b && (e = xc(a), 0 !== e && (d = e, b = Nk(a, e)));
    			if (1 === b) throw c = pk, Kk(a, 0), Ck(a, d), Dk(a, B()), c;
    			if (6 === b) Ck(a, d);
    			else {
    				e = a.current.alternate;
    				if (0 === (d & 30) && !Ok(e) && (b = Ik(a, d), 2 === b && (f = xc(a), 0 !== f && (d = f, b = Nk(a, f))), 1 === b)) throw c = pk, Kk(a, 0), Ck(a, d), Dk(a, B()), c;
    				a.finishedWork = e;
    				a.finishedLanes = d;
    				switch (b) {
    					case 0:
    					case 1: throw Error(p(345));
    					case 2:
    						Pk(a, tk, uk);
    						break;
    					case 3:
    						Ck(a, d);
    						if ((d & 130023424) === d && (b = fk + 500 - B(), 10 < b)) {
    							if (0 !== uc(a, 0)) break;
    							e = a.suspendedLanes;
    							if ((e & d) !== d) {
    								R();
    								a.pingedLanes |= a.suspendedLanes & e;
    								break;
    							}
    							a.timeoutHandle = Ff(Pk.bind(null, a, tk, uk), b);
    							break;
    						}
    						Pk(a, tk, uk);
    						break;
    					case 4:
    						Ck(a, d);
    						if ((d & 4194240) === d) break;
    						b = a.eventTimes;
    						for (e = -1; 0 < d;) {
    							var g = 31 - oc(d);
    							f = 1 << g;
    							g = b[g];
    							g > e && (e = g);
    							d &= ~f;
    						}
    						d = e;
    						d = B() - d;
    						d = (120 > d ? 120 : 480 > d ? 480 : 1080 > d ? 1080 : 1920 > d ? 1920 : 3e3 > d ? 3e3 : 4320 > d ? 4320 : 1960 * lk(d / 1960)) - d;
    						if (10 < d) {
    							a.timeoutHandle = Ff(Pk.bind(null, a, tk, uk), d);
    							break;
    						}
    						Pk(a, tk, uk);
    						break;
    					case 5:
    						Pk(a, tk, uk);
    						break;
    					default: throw Error(p(329));
    				}
    			}
    		}
    		Dk(a, B());
    		return a.callbackNode === c ? Gk.bind(null, a) : null;
    	}
    	function Nk(a, b) {
    		var c = sk;
    		a.current.memoizedState.isDehydrated && (Kk(a, b).flags |= 256);
    		a = Ik(a, b);
    		2 !== a && (b = tk, tk = c, null !== b && Fj(b));
    		return a;
    	}
    	function Fj(a) {
    		null === tk ? tk = a : tk.push.apply(tk, a);
    	}
    	function Ok(a) {
    		for (var b = a;;) {
    			if (b.flags & 16384) {
    				var c = b.updateQueue;
    				if (null !== c && (c = c.stores, null !== c)) for (var d = 0; d < c.length; d++) {
    					var e = c[d], f = e.getSnapshot;
    					e = e.value;
    					try {
    						if (!He(f(), e)) return !1;
    					} catch (g) {
    						return !1;
    					}
    				}
    			}
    			c = b.child;
    			if (b.subtreeFlags & 16384 && null !== c) c.return = b, b = c;
    			else {
    				if (b === a) break;
    				for (; null === b.sibling;) {
    					if (null === b.return || b.return === a) return !0;
    					b = b.return;
    				}
    				b.sibling.return = b.return;
    				b = b.sibling;
    			}
    		}
    		return !0;
    	}
    	function Ck(a, b) {
    		b &= ~rk;
    		b &= ~qk;
    		a.suspendedLanes |= b;
    		a.pingedLanes &= ~b;
    		for (a = a.expirationTimes; 0 < b;) {
    			var c = 31 - oc(b), d = 1 << c;
    			a[c] = -1;
    			b &= ~d;
    		}
    	}
    	function Ek(a) {
    		if (0 !== (K & 6)) throw Error(p(327));
    		Hk();
    		var b = uc(a, 0);
    		if (0 === (b & 1)) return Dk(a, B()), null;
    		var c = Ik(a, b);
    		if (0 !== a.tag && 2 === c) {
    			var d = xc(a);
    			0 !== d && (b = d, c = Nk(a, d));
    		}
    		if (1 === c) throw c = pk, Kk(a, 0), Ck(a, b), Dk(a, B()), c;
    		if (6 === c) throw Error(p(345));
    		a.finishedWork = a.current.alternate;
    		a.finishedLanes = b;
    		Pk(a, tk, uk);
    		Dk(a, B());
    		return null;
    	}
    	function Qk(a, b) {
    		var c = K;
    		K |= 1;
    		try {
    			return a(b);
    		} finally {
    			K = c, 0 === K && (Gj = B() + 500, fg && jg());
    		}
    	}
    	function Rk(a) {
    		null !== wk && 0 === wk.tag && 0 === (K & 6) && Hk();
    		var b = K;
    		K |= 1;
    		var c = ok.transition, d = C;
    		try {
    			if (ok.transition = null, C = 1, a) return a();
    		} finally {
    			C = d, ok.transition = c, K = b, 0 === (K & 6) && jg();
    		}
    	}
    	function Hj() {
    		fj = ej.current;
    		E(ej);
    	}
    	function Kk(a, b) {
    		a.finishedWork = null;
    		a.finishedLanes = 0;
    		var c = a.timeoutHandle;
    		-1 !== c && (a.timeoutHandle = -1, Gf(c));
    		if (null !== Y) for (c = Y.return; null !== c;) {
    			var d = c;
    			wg(d);
    			switch (d.tag) {
    				case 1:
    					d = d.type.childContextTypes;
    					null !== d && void 0 !== d && $f();
    					break;
    				case 3:
    					zh();
    					E(Wf);
    					E(H);
    					Eh();
    					break;
    				case 5:
    					Bh(d);
    					break;
    				case 4:
    					zh();
    					break;
    				case 13:
    					E(L);
    					break;
    				case 19:
    					E(L);
    					break;
    				case 10:
    					ah(d.type._context);
    					break;
    				case 22:
    				case 23: Hj();
    			}
    			c = c.return;
    		}
    		Q = a;
    		Y = a = Pg(a.current, null);
    		Z = fj = b;
    		T = 0;
    		pk = null;
    		rk = qk = rh = 0;
    		tk = sk = null;
    		if (null !== fh) {
    			for (b = 0; b < fh.length; b++) if (c = fh[b], d = c.interleaved, null !== d) {
    				c.interleaved = null;
    				var e = d.next, f = c.pending;
    				if (null !== f) {
    					var g = f.next;
    					f.next = e;
    					d.next = g;
    				}
    				c.pending = d;
    			}
    			fh = null;
    		}
    		return a;
    	}
    	function Mk(a, b) {
    		do {
    			var c = Y;
    			try {
    				$g();
    				Fh.current = Rh;
    				if (Ih) {
    					for (var d = M.memoizedState; null !== d;) {
    						var e = d.queue;
    						null !== e && (e.pending = null);
    						d = d.next;
    					}
    					Ih = !1;
    				}
    				Hh = 0;
    				O = N = M = null;
    				Jh = !1;
    				Kh = 0;
    				nk.current = null;
    				if (null === c || null === c.return) {
    					T = 1;
    					pk = b;
    					Y = null;
    					break;
    				}
    				a: {
    					var f = a, g = c.return, h = c, k = b;
    					b = Z;
    					h.flags |= 32768;
    					if (null !== k && "object" === typeof k && "function" === typeof k.then) {
    						var l = k, m = h, q = m.tag;
    						if (0 === (m.mode & 1) && (0 === q || 11 === q || 15 === q)) {
    							var r = m.alternate;
    							r ? (m.updateQueue = r.updateQueue, m.memoizedState = r.memoizedState, m.lanes = r.lanes) : (m.updateQueue = null, m.memoizedState = null);
    						}
    						var y = Ui(g);
    						if (null !== y) {
    							y.flags &= -257;
    							Vi(y, g, h, f, b);
    							y.mode & 1 && Si(f, l, b);
    							b = y;
    							k = l;
    							var n = b.updateQueue;
    							if (null === n) {
    								var t = /* @__PURE__ */ new Set();
    								t.add(k);
    								b.updateQueue = t;
    							} else n.add(k);
    							break a;
    						} else {
    							if (0 === (b & 1)) {
    								Si(f, l, b);
    								tj();
    								break a;
    							}
    							k = Error(p(426));
    						}
    					} else if (I && h.mode & 1) {
    						var J = Ui(g);
    						if (null !== J) {
    							0 === (J.flags & 65536) && (J.flags |= 256);
    							Vi(J, g, h, f, b);
    							Jg(Ji(k, h));
    							break a;
    						}
    					}
    					f = k = Ji(k, h);
    					4 !== T && (T = 2);
    					null === sk ? sk = [f] : sk.push(f);
    					f = g;
    					do {
    						switch (f.tag) {
    							case 3:
    								f.flags |= 65536;
    								b &= -b;
    								f.lanes |= b;
    								var x = Ni(f, k, b);
    								ph(f, x);
    								break a;
    							case 1:
    								h = k;
    								var w = f.type, u = f.stateNode;
    								if (0 === (f.flags & 128) && ("function" === typeof w.getDerivedStateFromError || null !== u && "function" === typeof u.componentDidCatch && (null === Ri || !Ri.has(u)))) {
    									f.flags |= 65536;
    									b &= -b;
    									f.lanes |= b;
    									var F = Qi(f, h, b);
    									ph(f, F);
    									break a;
    								}
    						}
    						f = f.return;
    					} while (null !== f);
    				}
    				Sk(c);
    			} catch (na) {
    				b = na;
    				Y === c && null !== c && (Y = c = c.return);
    				continue;
    			}
    			break;
    		} while (1);
    	}
    	function Jk() {
    		var a = mk.current;
    		mk.current = Rh;
    		return null === a ? Rh : a;
    	}
    	function tj() {
    		if (0 === T || 3 === T || 2 === T) T = 4;
    		null === Q || 0 === (rh & 268435455) && 0 === (qk & 268435455) || Ck(Q, Z);
    	}
    	function Ik(a, b) {
    		var c = K;
    		K |= 2;
    		var d = Jk();
    		if (Q !== a || Z !== b) uk = null, Kk(a, b);
    		do
    			try {
    				Tk();
    				break;
    			} catch (e) {
    				Mk(a, e);
    			}
    		while (1);
    		$g();
    		K = c;
    		mk.current = d;
    		if (null !== Y) throw Error(p(261));
    		Q = null;
    		Z = 0;
    		return T;
    	}
    	function Tk() {
    		for (; null !== Y;) Uk(Y);
    	}
    	function Lk() {
    		for (; null !== Y && !cc();) Uk(Y);
    	}
    	function Uk(a) {
    		var b = Vk(a.alternate, a, fj);
    		a.memoizedProps = a.pendingProps;
    		null === b ? Sk(a) : Y = b;
    		nk.current = null;
    	}
    	function Sk(a) {
    		var b = a;
    		do {
    			var c = b.alternate;
    			a = b.return;
    			if (0 === (b.flags & 32768)) {
    				if (c = Ej(c, b, fj), null !== c) {
    					Y = c;
    					return;
    				}
    			} else {
    				c = Ij(c, b);
    				if (null !== c) {
    					c.flags &= 32767;
    					Y = c;
    					return;
    				}
    				if (null !== a) a.flags |= 32768, a.subtreeFlags = 0, a.deletions = null;
    				else {
    					T = 6;
    					Y = null;
    					return;
    				}
    			}
    			b = b.sibling;
    			if (null !== b) {
    				Y = b;
    				return;
    			}
    			Y = b = a;
    		} while (null !== b);
    		0 === T && (T = 5);
    	}
    	function Pk(a, b, c) {
    		var d = C, e = ok.transition;
    		try {
    			ok.transition = null, C = 1, Wk(a, b, c, d);
    		} finally {
    			ok.transition = e, C = d;
    		}
    		return null;
    	}
    	function Wk(a, b, c, d) {
    		do
    			Hk();
    		while (null !== wk);
    		if (0 !== (K & 6)) throw Error(p(327));
    		c = a.finishedWork;
    		var e = a.finishedLanes;
    		if (null === c) return null;
    		a.finishedWork = null;
    		a.finishedLanes = 0;
    		if (c === a.current) throw Error(p(177));
    		a.callbackNode = null;
    		a.callbackPriority = 0;
    		var f = c.lanes | c.childLanes;
    		Bc(a, f);
    		a === Q && (Y = Q = null, Z = 0);
    		0 === (c.subtreeFlags & 2064) && 0 === (c.flags & 2064) || vk || (vk = !0, Fk(hc, function() {
    			Hk();
    			return null;
    		}));
    		f = 0 !== (c.flags & 15990);
    		if (0 !== (c.subtreeFlags & 15990) || f) {
    			f = ok.transition;
    			ok.transition = null;
    			var g = C;
    			C = 1;
    			var h = K;
    			K |= 4;
    			nk.current = null;
    			Oj(a, c);
    			dk(c, a);
    			Oe(Df);
    			dd = !!Cf;
    			Df = Cf = null;
    			a.current = c;
    			hk(c, a, e);
    			dc();
    			K = h;
    			C = g;
    			ok.transition = f;
    		} else a.current = c;
    		vk && (vk = !1, wk = a, xk = e);
    		f = a.pendingLanes;
    		0 === f && (Ri = null);
    		mc(c.stateNode, d);
    		Dk(a, B());
    		if (null !== b) for (d = a.onRecoverableError, c = 0; c < b.length; c++) e = b[c], d(e.value, {
    			componentStack: e.stack,
    			digest: e.digest
    		});
    		if (Oi) throw Oi = !1, a = Pi, Pi = null, a;
    		0 !== (xk & 1) && 0 !== a.tag && Hk();
    		f = a.pendingLanes;
    		0 !== (f & 1) ? a === zk ? yk++ : (yk = 0, zk = a) : yk = 0;
    		jg();
    		return null;
    	}
    	function Hk() {
    		if (null !== wk) {
    			var a = Dc(xk), b = ok.transition, c = C;
    			try {
    				ok.transition = null;
    				C = 16 > a ? 16 : a;
    				if (null === wk) var d = !1;
    				else {
    					a = wk;
    					wk = null;
    					xk = 0;
    					if (0 !== (K & 6)) throw Error(p(331));
    					var e = K;
    					K |= 4;
    					for (V = a.current; null !== V;) {
    						var f = V, g = f.child;
    						if (0 !== (V.flags & 16)) {
    							var h = f.deletions;
    							if (null !== h) {
    								for (var k = 0; k < h.length; k++) {
    									var l = h[k];
    									for (V = l; null !== V;) {
    										var m = V;
    										switch (m.tag) {
    											case 0:
    											case 11:
    											case 15: Pj(8, m, f);
    										}
    										var q = m.child;
    										if (null !== q) q.return = m, V = q;
    										else for (; null !== V;) {
    											m = V;
    											var r = m.sibling, y = m.return;
    											Sj(m);
    											if (m === l) {
    												V = null;
    												break;
    											}
    											if (null !== r) {
    												r.return = y;
    												V = r;
    												break;
    											}
    											V = y;
    										}
    									}
    								}
    								var n = f.alternate;
    								if (null !== n) {
    									var t = n.child;
    									if (null !== t) {
    										n.child = null;
    										do {
    											var J = t.sibling;
    											t.sibling = null;
    											t = J;
    										} while (null !== t);
    									}
    								}
    								V = f;
    							}
    						}
    						if (0 !== (f.subtreeFlags & 2064) && null !== g) g.return = f, V = g;
    						else b: for (; null !== V;) {
    							f = V;
    							if (0 !== (f.flags & 2048)) switch (f.tag) {
    								case 0:
    								case 11:
    								case 15: Pj(9, f, f.return);
    							}
    							var x = f.sibling;
    							if (null !== x) {
    								x.return = f.return;
    								V = x;
    								break b;
    							}
    							V = f.return;
    						}
    					}
    					var w = a.current;
    					for (V = w; null !== V;) {
    						g = V;
    						var u = g.child;
    						if (0 !== (g.subtreeFlags & 2064) && null !== u) u.return = g, V = u;
    						else b: for (g = w; null !== V;) {
    							h = V;
    							if (0 !== (h.flags & 2048)) try {
    								switch (h.tag) {
    									case 0:
    									case 11:
    									case 15: Qj(9, h);
    								}
    							} catch (na) {
    								W(h, h.return, na);
    							}
    							if (h === g) {
    								V = null;
    								break b;
    							}
    							var F = h.sibling;
    							if (null !== F) {
    								F.return = h.return;
    								V = F;
    								break b;
    							}
    							V = h.return;
    						}
    					}
    					K = e;
    					jg();
    					if (lc && "function" === typeof lc.onPostCommitFiberRoot) try {
    						lc.onPostCommitFiberRoot(kc, a);
    					} catch (na) {}
    					d = !0;
    				}
    				return d;
    			} finally {
    				C = c, ok.transition = b;
    			}
    		}
    		return !1;
    	}
    	function Xk(a, b, c) {
    		b = Ji(c, b);
    		b = Ni(a, b, 1);
    		a = nh(a, b, 1);
    		b = R();
    		null !== a && (Ac(a, 1, b), Dk(a, b));
    	}
    	function W(a, b, c) {
    		if (3 === a.tag) Xk(a, a, c);
    		else for (; null !== b;) {
    			if (3 === b.tag) {
    				Xk(b, a, c);
    				break;
    			} else if (1 === b.tag) {
    				var d = b.stateNode;
    				if ("function" === typeof b.type.getDerivedStateFromError || "function" === typeof d.componentDidCatch && (null === Ri || !Ri.has(d))) {
    					a = Ji(c, a);
    					a = Qi(b, a, 1);
    					b = nh(b, a, 1);
    					a = R();
    					null !== b && (Ac(b, 1, a), Dk(b, a));
    					break;
    				}
    			}
    			b = b.return;
    		}
    	}
    	function Ti(a, b, c) {
    		var d = a.pingCache;
    		null !== d && d.delete(b);
    		b = R();
    		a.pingedLanes |= a.suspendedLanes & c;
    		Q === a && (Z & c) === c && (4 === T || 3 === T && (Z & 130023424) === Z && 500 > B() - fk ? Kk(a, 0) : rk |= c);
    		Dk(a, b);
    	}
    	function Yk(a, b) {
    		0 === b && (0 === (a.mode & 1) ? b = 1 : (b = sc, sc <<= 1, 0 === (sc & 130023424) && (sc = 4194304)));
    		var c = R();
    		a = ih(a, b);
    		null !== a && (Ac(a, b, c), Dk(a, c));
    	}
    	function uj(a) {
    		var b = a.memoizedState, c = 0;
    		null !== b && (c = b.retryLane);
    		Yk(a, c);
    	}
    	function bk(a, b) {
    		var c = 0;
    		switch (a.tag) {
    			case 13:
    				var d = a.stateNode;
    				var e = a.memoizedState;
    				null !== e && (c = e.retryLane);
    				break;
    			case 19:
    				d = a.stateNode;
    				break;
    			default: throw Error(p(314));
    		}
    		null !== d && d.delete(b);
    		Yk(a, c);
    	}
    	var Vk = function(a, b, c) {
    		if (null !== a) if (a.memoizedProps !== b.pendingProps || Wf.current) dh = !0;
    		else {
    			if (0 === (a.lanes & c) && 0 === (b.flags & 128)) return dh = !1, yj(a, b, c);
    			dh = 0 !== (a.flags & 131072) ? !0 : !1;
    		}
    		else dh = !1, I && 0 !== (b.flags & 1048576) && ug(b, ng, b.index);
    		b.lanes = 0;
    		switch (b.tag) {
    			case 2:
    				var d = b.type;
    				ij(a, b);
    				a = b.pendingProps;
    				var e = Yf(b, H.current);
    				ch(b, c);
    				e = Nh(null, b, d, a, e, c);
    				var f = Sh();
    				b.flags |= 1;
    				"object" === typeof e && null !== e && "function" === typeof e.render && void 0 === e.$$typeof ? (b.tag = 1, b.memoizedState = null, b.updateQueue = null, Zf(d) ? (f = !0, cg(b)) : f = !1, b.memoizedState = null !== e.state && void 0 !== e.state ? e.state : null, kh(b), e.updater = Ei, b.stateNode = e, e._reactInternals = b, Ii(b, d, a, c), b = jj(null, b, d, !0, f, c)) : (b.tag = 0, I && f && vg(b), Xi(null, b, e, c), b = b.child);
    				return b;
    			case 16:
    				d = b.elementType;
    				a: {
    					ij(a, b);
    					a = b.pendingProps;
    					e = d._init;
    					d = e(d._payload);
    					b.type = d;
    					e = b.tag = Zk(d);
    					a = Ci(d, a);
    					switch (e) {
    						case 0:
    							b = cj(null, b, d, a, c);
    							break a;
    						case 1:
    							b = hj(null, b, d, a, c);
    							break a;
    						case 11:
    							b = Yi(null, b, d, a, c);
    							break a;
    						case 14:
    							b = $i(null, b, d, Ci(d.type, a), c);
    							break a;
    					}
    					throw Error(p(306, d, ""));
    				}
    				return b;
    			case 0: return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), cj(a, b, d, e, c);
    			case 1: return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), hj(a, b, d, e, c);
    			case 3:
    				a: {
    					kj(b);
    					if (null === a) throw Error(p(387));
    					d = b.pendingProps;
    					f = b.memoizedState;
    					e = f.element;
    					lh(a, b);
    					qh(b, d, null, c);
    					var g = b.memoizedState;
    					d = g.element;
    					if (f.isDehydrated) if (f = {
    						element: d,
    						isDehydrated: !1,
    						cache: g.cache,
    						pendingSuspenseBoundaries: g.pendingSuspenseBoundaries,
    						transitions: g.transitions
    					}, b.updateQueue.baseState = f, b.memoizedState = f, b.flags & 256) {
    						e = Ji(Error(p(423)), b);
    						b = lj(a, b, d, c, e);
    						break a;
    					} else if (d !== e) {
    						e = Ji(Error(p(424)), b);
    						b = lj(a, b, d, c, e);
    						break a;
    					} else for (yg = Lf(b.stateNode.containerInfo.firstChild), xg = b, I = !0, zg = null, c = Vg(b, null, d, c), b.child = c; c;) c.flags = c.flags & -3 | 4096, c = c.sibling;
    					else {
    						Ig();
    						if (d === e) {
    							b = Zi(a, b, c);
    							break a;
    						}
    						Xi(a, b, d, c);
    					}
    					b = b.child;
    				}
    				return b;
    			case 5: return Ah(b), null === a && Eg(b), d = b.type, e = b.pendingProps, f = null !== a ? a.memoizedProps : null, g = e.children, Ef(d, e) ? g = null : null !== f && Ef(d, f) && (b.flags |= 32), gj(a, b), Xi(a, b, g, c), b.child;
    			case 6: return null === a && Eg(b), null;
    			case 13: return oj(a, b, c);
    			case 4: return yh(b, b.stateNode.containerInfo), d = b.pendingProps, null === a ? b.child = Ug(b, null, d, c) : Xi(a, b, d, c), b.child;
    			case 11: return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), Yi(a, b, d, e, c);
    			case 7: return Xi(a, b, b.pendingProps, c), b.child;
    			case 8: return Xi(a, b, b.pendingProps.children, c), b.child;
    			case 12: return Xi(a, b, b.pendingProps.children, c), b.child;
    			case 10:
    				a: {
    					d = b.type._context;
    					e = b.pendingProps;
    					f = b.memoizedProps;
    					g = e.value;
    					G(Wg, d._currentValue);
    					d._currentValue = g;
    					if (null !== f) if (He(f.value, g)) {
    						if (f.children === e.children && !Wf.current) {
    							b = Zi(a, b, c);
    							break a;
    						}
    					} else for (f = b.child, null !== f && (f.return = b); null !== f;) {
    						var h = f.dependencies;
    						if (null !== h) {
    							g = f.child;
    							for (var k = h.firstContext; null !== k;) {
    								if (k.context === d) {
    									if (1 === f.tag) {
    										k = mh(-1, c & -c);
    										k.tag = 2;
    										var l = f.updateQueue;
    										if (null !== l) {
    											l = l.shared;
    											var m = l.pending;
    											null === m ? k.next = k : (k.next = m.next, m.next = k);
    											l.pending = k;
    										}
    									}
    									f.lanes |= c;
    									k = f.alternate;
    									null !== k && (k.lanes |= c);
    									bh(f.return, c, b);
    									h.lanes |= c;
    									break;
    								}
    								k = k.next;
    							}
    						} else if (10 === f.tag) g = f.type === b.type ? null : f.child;
    						else if (18 === f.tag) {
    							g = f.return;
    							if (null === g) throw Error(p(341));
    							g.lanes |= c;
    							h = g.alternate;
    							null !== h && (h.lanes |= c);
    							bh(g, c, b);
    							g = f.sibling;
    						} else g = f.child;
    						if (null !== g) g.return = f;
    						else for (g = f; null !== g;) {
    							if (g === b) {
    								g = null;
    								break;
    							}
    							f = g.sibling;
    							if (null !== f) {
    								f.return = g.return;
    								g = f;
    								break;
    							}
    							g = g.return;
    						}
    						f = g;
    					}
    					Xi(a, b, e.children, c);
    					b = b.child;
    				}
    				return b;
    			case 9: return e = b.type, d = b.pendingProps.children, ch(b, c), e = eh(e), d = d(e), b.flags |= 1, Xi(a, b, d, c), b.child;
    			case 14: return d = b.type, e = Ci(d, b.pendingProps), e = Ci(d.type, e), $i(a, b, d, e, c);
    			case 15: return bj(a, b, b.type, b.pendingProps, c);
    			case 17: return d = b.type, e = b.pendingProps, e = b.elementType === d ? e : Ci(d, e), ij(a, b), b.tag = 1, Zf(d) ? (a = !0, cg(b)) : a = !1, ch(b, c), Gi(b, d, e), Ii(b, d, e, c), jj(null, b, d, !0, a, c);
    			case 19: return xj(a, b, c);
    			case 22: return dj(a, b, c);
    		}
    		throw Error(p(156, b.tag));
    	};
    	function Fk(a, b) {
    		return ac(a, b);
    	}
    	function $k(a, b, c, d) {
    		this.tag = a;
    		this.key = c;
    		this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
    		this.index = 0;
    		this.ref = null;
    		this.pendingProps = b;
    		this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
    		this.mode = d;
    		this.subtreeFlags = this.flags = 0;
    		this.deletions = null;
    		this.childLanes = this.lanes = 0;
    		this.alternate = null;
    	}
    	function Bg(a, b, c, d) {
    		return new $k(a, b, c, d);
    	}
    	function aj(a) {
    		a = a.prototype;
    		return !(!a || !a.isReactComponent);
    	}
    	function Zk(a) {
    		if ("function" === typeof a) return aj(a) ? 1 : 0;
    		if (void 0 !== a && null !== a) {
    			a = a.$$typeof;
    			if (a === Da) return 11;
    			if (a === Ga) return 14;
    		}
    		return 2;
    	}
    	function Pg(a, b) {
    		var c = a.alternate;
    		null === c ? (c = Bg(a.tag, b, a.key, a.mode), c.elementType = a.elementType, c.type = a.type, c.stateNode = a.stateNode, c.alternate = a, a.alternate = c) : (c.pendingProps = b, c.type = a.type, c.flags = 0, c.subtreeFlags = 0, c.deletions = null);
    		c.flags = a.flags & 14680064;
    		c.childLanes = a.childLanes;
    		c.lanes = a.lanes;
    		c.child = a.child;
    		c.memoizedProps = a.memoizedProps;
    		c.memoizedState = a.memoizedState;
    		c.updateQueue = a.updateQueue;
    		b = a.dependencies;
    		c.dependencies = null === b ? null : {
    			lanes: b.lanes,
    			firstContext: b.firstContext
    		};
    		c.sibling = a.sibling;
    		c.index = a.index;
    		c.ref = a.ref;
    		return c;
    	}
    	function Rg(a, b, c, d, e, f) {
    		var g = 2;
    		d = a;
    		if ("function" === typeof a) aj(a) && (g = 1);
    		else if ("string" === typeof a) g = 5;
    		else a: switch (a) {
    			case ya: return Tg(c.children, e, f, b);
    			case za:
    				g = 8;
    				e |= 8;
    				break;
    			case Aa: return a = Bg(12, c, b, e | 2), a.elementType = Aa, a.lanes = f, a;
    			case Ea: return a = Bg(13, c, b, e), a.elementType = Ea, a.lanes = f, a;
    			case Fa: return a = Bg(19, c, b, e), a.elementType = Fa, a.lanes = f, a;
    			case Ia: return pj(c, e, f, b);
    			default:
    				if ("object" === typeof a && null !== a) switch (a.$$typeof) {
    					case Ba:
    						g = 10;
    						break a;
    					case Ca:
    						g = 9;
    						break a;
    					case Da:
    						g = 11;
    						break a;
    					case Ga:
    						g = 14;
    						break a;
    					case Ha:
    						g = 16;
    						d = null;
    						break a;
    				}
    				throw Error(p(130, null == a ? a : typeof a, ""));
    		}
    		b = Bg(g, c, b, e);
    		b.elementType = a;
    		b.type = d;
    		b.lanes = f;
    		return b;
    	}
    	function Tg(a, b, c, d) {
    		a = Bg(7, a, d, b);
    		a.lanes = c;
    		return a;
    	}
    	function pj(a, b, c, d) {
    		a = Bg(22, a, d, b);
    		a.elementType = Ia;
    		a.lanes = c;
    		a.stateNode = { isHidden: !1 };
    		return a;
    	}
    	function Qg(a, b, c) {
    		a = Bg(6, a, null, b);
    		a.lanes = c;
    		return a;
    	}
    	function Sg(a, b, c) {
    		b = Bg(4, null !== a.children ? a.children : [], a.key, b);
    		b.lanes = c;
    		b.stateNode = {
    			containerInfo: a.containerInfo,
    			pendingChildren: null,
    			implementation: a.implementation
    		};
    		return b;
    	}
    	function cl(a, b, c) {
    		var d = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
    		return {
    			$$typeof: wa,
    			key: null == d ? null : "" + d,
    			children: a,
    			containerInfo: b,
    			implementation: c
    		};
    	}
    	function dl(a) {
    		if (!a) return Vf;
    		a = a._reactInternals;
    		a: {
    			if (Vb(a) !== a || 1 !== a.tag) throw Error(p(170));
    			var b = a;
    			do {
    				switch (b.tag) {
    					case 3:
    						b = b.stateNode.context;
    						break a;
    					case 1: if (Zf(b.type)) {
    						b = b.stateNode.__reactInternalMemoizedMergedChildContext;
    						break a;
    					}
    				}
    				b = b.return;
    			} while (null !== b);
    			throw Error(p(171));
    		}
    		if (1 === a.tag) {
    			var c = a.type;
    			if (Zf(c)) return bg(a, c, b);
    		}
    		return b;
    	}
    	function fl(a, b, c, d) {
    		var e = b.current, f = R(), g = yi(e);
    		c = dl(c);
    		null === b.context ? b.context = c : b.pendingContext = c;
    		b = mh(f, g);
    		b.payload = { element: a };
    		d = void 0 === d ? null : d;
    		null !== d && (b.callback = d);
    		a = nh(e, b, g);
    		null !== a && (gi(a, e, g, f), oh(a, e, g));
    		return g;
    	}
    	function hl(a, b) {
    		a = a.memoizedState;
    		if (null !== a && null !== a.dehydrated) {
    			var c = a.retryLane;
    			a.retryLane = 0 !== c && c < b ? c : b;
    		}
    	}
    	function il(a, b) {
    		hl(a, b);
    		(a = a.alternate) && hl(a, b);
    	}
    	function jl() {
    		return null;
    	}
    	function ll(a) {
    		this._internalRoot = a;
    	}
    	ml.prototype.render = ll.prototype.render = function(a) {
    		var b = this._internalRoot;
    		if (null === b) throw Error(p(409));
    		fl(a, b, null, null);
    	};
    	ml.prototype.unmount = ll.prototype.unmount = function() {
    		var a = this._internalRoot;
    		if (null !== a) {
    			this._internalRoot = null;
    			var b = a.containerInfo;
    			Rk(function() {
    				fl(null, a, null, null);
    			});
    			b[uf] = null;
    		}
    	};
    	function ml(a) {
    		this._internalRoot = a;
    	}
    	ml.prototype.unstable_scheduleHydration = function(a) {
    		if (a) {
    			var b = Hc();
    			a = {
    				blockedOn: null,
    				target: a,
    				priority: b
    			};
    			for (var c = 0; c < Qc.length && 0 !== b && b < Qc[c].priority; c++);
    			Qc.splice(c, 0, a);
    			0 === c && Vc(a);
    		}
    	};
    	function nl(a) {
    		return !(!a || 1 !== a.nodeType && 9 !== a.nodeType && 11 !== a.nodeType);
    	}
    	Ec = function(a) {
    		switch (a.tag) {
    			case 3:
    				var b = a.stateNode;
    				if (b.current.memoizedState.isDehydrated) {
    					var c = tc(b.pendingLanes);
    					0 !== c && (Cc(b, c | 1), Dk(b, B()), 0 === (K & 6) && (Gj = B() + 500, jg()));
    				}
    				break;
    			case 13: Rk(function() {
    				var b = ih(a, 1);
    				if (null !== b) gi(b, a, 1, R());
    			}), il(a, 1);
    		}
    	};
    	Fc = function(a) {
    		if (13 === a.tag) {
    			var b = ih(a, 134217728);
    			if (null !== b) gi(b, a, 134217728, R());
    			il(a, 134217728);
    		}
    	};
    	Gc = function(a) {
    		if (13 === a.tag) {
    			var b = yi(a), c = ih(a, b);
    			if (null !== c) gi(c, a, b, R());
    			il(a, b);
    		}
    	};
    	Hc = function() {
    		return C;
    	};
    	Ic = function(a, b) {
    		var c = C;
    		try {
    			return C = a, b();
    		} finally {
    			C = c;
    		}
    	};
    	yb = function(a, b, c) {
    		switch (b) {
    			case "input":
    				bb(a, c);
    				b = c.name;
    				if ("radio" === c.type && null != b) {
    					for (c = a; c.parentNode;) c = c.parentNode;
    					c = c.querySelectorAll("input[name=" + JSON.stringify("" + b) + "][type=\"radio\"]");
    					for (b = 0; b < c.length; b++) {
    						var d = c[b];
    						if (d !== a && d.form === a.form) {
    							var e = Db(d);
    							if (!e) throw Error(p(90));
    							Wa(d);
    							bb(d, e);
    						}
    					}
    				}
    				break;
    			case "textarea":
    				ib(a, c);
    				break;
    			case "select": b = c.value, null != b && fb(a, !!c.multiple, b, !1);
    		}
    	};
    	Gb = Qk;
    	Hb = Rk;
    	var tl = {
    		findFiberByHostInstance: Wc,
    		bundleType: 0,
    		version: "18.3.1",
    		rendererPackageName: "react-dom"
    	};
    	var ul = {
    		bundleType: tl.bundleType,
    		version: tl.version,
    		rendererPackageName: tl.rendererPackageName,
    		rendererConfig: tl.rendererConfig,
    		overrideHookState: null,
    		overrideHookStateDeletePath: null,
    		overrideHookStateRenamePath: null,
    		overrideProps: null,
    		overridePropsDeletePath: null,
    		overridePropsRenamePath: null,
    		setErrorHandler: null,
    		setSuspenseHandler: null,
    		scheduleUpdate: null,
    		currentDispatcherRef: ua.ReactCurrentDispatcher,
    		findHostInstanceByFiber: function(a) {
    			a = Zb(a);
    			return null === a ? null : a.stateNode;
    		},
    		findFiberByHostInstance: tl.findFiberByHostInstance || jl,
    		findHostInstancesForRefresh: null,
    		scheduleRefresh: null,
    		scheduleRoot: null,
    		setRefreshHandler: null,
    		getCurrentFiber: null,
    		reconcilerVersion: "18.3.1-next-f1338f8080-20240426"
    	};
    	if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
    		var vl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    		if (!vl.isDisabled && vl.supportsFiber) try {
    			kc = vl.inject(ul), lc = vl;
    		} catch (a) {}
    	}
    	exports.createPortal = function(a, b) {
    		var c = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
    		if (!nl(b)) throw Error(p(200));
    		return cl(a, b, null, c);
    	};
    }));
    //#endregion
    //#region ../../node_modules/@xyflow/react/dist/esm/index.js
    var import_react_dom = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
    	function checkDCE() {
    		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
    		try {
    			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    		} catch (err) {
    			console.error(err);
    		}
    	}
    	checkDCE();
    	module.exports = require_react_dom_production_min();
    })))();
    const StoreContext = (0, react.createContext)(null);
    const Provider$1 = StoreContext.Provider;
    const zustandErrorMessage = errorMessages["error001"]("react");
    /**
    * This hook can be used to subscribe to internal state changes of the React Flow
    * component. The `useStore` hook is re-exported from the [Zustand](https://github.com/pmndrs/zustand)
    * state management library, so you should check out their docs for more details.
    *
    * @public
    * @param selector - A selector function that returns a slice of the flow's internal state.
    * Extracting or transforming just the state you need is a good practice to avoid unnecessary
    * re-renders.
    * @param equalityFn - A function to compare the previous and next value. This is incredibly useful
    * for preventing unnecessary re-renders. Good sensible defaults are using `Object.is` or importing
    * `zustand/shallow`, but you can be as granular as you like.
    * @returns The selected state slice.
    *
    * @example
    * ```ts
    * const nodes = useStore((state) => state.nodes);
    * ```
    *
    * @remarks This hook should only be used if there is no other way to access the internal
    * state. For many of the common use cases, there are dedicated hooks available
    * such as {@link useReactFlow}, {@link useViewport}, etc.
    */
    function useStore(selector, equalityFn) {
    	const store = (0, react.useContext)(StoreContext);
    	if (store === null) throw new Error(zustandErrorMessage);
    	return useStoreWithEqualityFn(store, selector, equalityFn);
    }
    /**
    * In some cases, you might need to access the store directly. This hook returns the store object which can be used on demand to access the state or dispatch actions.
    *
    * @returns The store object.
    * @example
    * ```ts
    * const store = useStoreApi();
    * ```
    *
    * @remarks This hook should only be used if there is no other way to access the internal
    * state. For many of the common use cases, there are dedicated hooks available
    * such as {@link useReactFlow}, {@link useViewport}, etc.
    */
    function useStoreApi() {
    	const store = (0, react.useContext)(StoreContext);
    	if (store === null) throw new Error(zustandErrorMessage);
    	return (0, react.useMemo)(() => ({
    		getState: store.getState,
    		setState: store.setState,
    		subscribe: store.subscribe
    	}), [store]);
    }
    const style = { display: "none" };
    const ariaLiveStyle = {
    	position: "absolute",
    	width: 1,
    	height: 1,
    	margin: -1,
    	border: 0,
    	padding: 0,
    	overflow: "hidden",
    	clip: "rect(0px, 0px, 0px, 0px)",
    	clipPath: "inset(100%)"
    };
    const ARIA_NODE_DESC_KEY = "react-flow__node-desc";
    const ARIA_EDGE_DESC_KEY = "react-flow__edge-desc";
    const ARIA_LIVE_MESSAGE = "react-flow__aria-live";
    const ariaLiveSelector = (s) => s.ariaLiveMessage;
    const ariaLabelConfigSelector = (s) => s.ariaLabelConfig;
    function AriaLiveMessage({ rfId }) {
    	const ariaLiveMessage = useStore(ariaLiveSelector);
    	return (0, react_jsx_runtime.jsx)("div", {
    		id: `${ARIA_LIVE_MESSAGE}-${rfId}`,
    		"aria-live": "assertive",
    		"aria-atomic": "true",
    		style: ariaLiveStyle,
    		children: ariaLiveMessage
    	});
    }
    function A11yDescriptions({ rfId, disableKeyboardA11y }) {
    	const ariaLabelConfig = useStore(ariaLabelConfigSelector);
    	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
    		(0, react_jsx_runtime.jsx)("div", {
    			id: `${ARIA_NODE_DESC_KEY}-${rfId}`,
    			style,
    			children: disableKeyboardA11y ? ariaLabelConfig["node.a11yDescription.default"] : ariaLabelConfig["node.a11yDescription.keyboardDisabled"]
    		}),
    		(0, react_jsx_runtime.jsx)("div", {
    			id: `${ARIA_EDGE_DESC_KEY}-${rfId}`,
    			style,
    			children: ariaLabelConfig["edge.a11yDescription.default"]
    		}),
    		!disableKeyboardA11y && (0, react_jsx_runtime.jsx)(AriaLiveMessage, { rfId })
    	] });
    }
    /**
    * The `<Panel />` component helps you position content above the viewport.
    * It is used internally by the [`<MiniMap />`](/api-reference/components/minimap)
    * and [`<Controls />`](/api-reference/components/controls) components.
    *
    * @public
    *
    * @example
    * ```jsx
    *import { ReactFlow, Background, Panel } from '@xyflow/react';
    *
    *export default function Flow() {
    *  return (
    *    <ReactFlow nodes={[]} fitView>
    *      <Panel position="top-left">top-left</Panel>
    *      <Panel position="top-center">top-center</Panel>
    *      <Panel position="top-right">top-right</Panel>
    *      <Panel position="bottom-left">bottom-left</Panel>
    *      <Panel position="bottom-center">bottom-center</Panel>
    *      <Panel position="bottom-right">bottom-right</Panel>
    *    </ReactFlow>
    *  );
    *}
    *```
    */
    const Panel = (0, react.forwardRef)(({ position = "top-left", children, className, style, ...rest }, ref) => {
    	const positionClasses = `${position}`.split("-");
    	return (0, react_jsx_runtime.jsx)("div", {
    		className: cc([
    			"react-flow__panel",
    			className,
    			...positionClasses
    		]),
    		style,
    		ref,
    		...rest,
    		children
    	});
    });
    Panel.displayName = "Panel";
    const link = `https://reactflow.dev?utm_source=attribution`;
    /**
    * React Flow is independent and entirely funded by its users.
    * If you hide the attribution, please support our work by subscribing to React Flow Pro: https://reactflow.dev/remove-attribution
    */
    function Attribution({ proOptions, position = "bottom-right" }) {
    	(0, react.useEffect)(() => {}, []);
    	if (proOptions?.hideAttribution) return null;
    	return (0, react_jsx_runtime.jsx)(Panel, {
    		position,
    		className: "react-flow__attribution",
    		"data-message": `Please only hide this attribution when you are subscribed to React Flow Pro: ${link}`,
    		children: (0, react_jsx_runtime.jsx)("a", {
    			href: link,
    			target: "_blank",
    			rel: "noopener noreferrer",
    			"aria-label": "React Flow attribution",
    			children: "React Flow"
    		})
    	});
    }
    const selector$l = (s) => {
    	const selectedNodes = [];
    	const selectedEdges = [];
    	for (const [, node] of s.nodeLookup) if (node.selected) selectedNodes.push(node.internals.userNode);
    	for (const [, edge] of s.edgeLookup) if (edge.selected) selectedEdges.push(edge);
    	return {
    		selectedNodes,
    		selectedEdges
    	};
    };
    const selectId = (obj) => obj.id;
    function areEqual$1(a, b) {
    	return shallow$1(a.selectedNodes.map(selectId), b.selectedNodes.map(selectId)) && shallow$1(a.selectedEdges.map(selectId), b.selectedEdges.map(selectId));
    }
    function SelectionListenerInner({ onSelectionChange }) {
    	const store = useStoreApi();
    	const { selectedNodes, selectedEdges } = useStore(selector$l, areEqual$1);
    	(0, react.useEffect)(() => {
    		const params = {
    			nodes: selectedNodes,
    			edges: selectedEdges
    		};
    		onSelectionChange?.(params);
    		store.getState().onSelectionChangeHandlers.forEach((fn) => fn(params));
    	}, [
    		selectedNodes,
    		selectedEdges,
    		onSelectionChange
    	]);
    	return null;
    }
    const changeSelector = (s) => !!s.onSelectionChangeHandlers;
    function SelectionListener({ onSelectionChange }) {
    	const storeHasSelectionChangeHandlers = useStore(changeSelector);
    	if (onSelectionChange || storeHasSelectionChangeHandlers) return (0, react_jsx_runtime.jsx)(SelectionListenerInner, { onSelectionChange });
    	return null;
    }
    const defaultNodeOrigin = [0, 0];
    const defaultViewport = {
    	x: 0,
    	y: 0,
    	zoom: 1
    };
    const fieldsToTrack = [...[
    	"nodes",
    	"edges",
    	"defaultNodes",
    	"defaultEdges",
    	"onConnect",
    	"onConnectStart",
    	"onConnectEnd",
    	"onClickConnectStart",
    	"onClickConnectEnd",
    	"nodesDraggable",
    	"autoPanOnNodeFocus",
    	"nodesConnectable",
    	"nodesFocusable",
    	"edgesFocusable",
    	"edgesReconnectable",
    	"elevateNodesOnSelect",
    	"elevateEdgesOnSelect",
    	"minZoom",
    	"maxZoom",
    	"nodeExtent",
    	"onNodesChange",
    	"onEdgesChange",
    	"elementsSelectable",
    	"connectionMode",
    	"snapGrid",
    	"snapToGrid",
    	"translateExtent",
    	"connectOnClick",
    	"defaultEdgeOptions",
    	"fitView",
    	"fitViewOptions",
    	"onNodesDelete",
    	"onEdgesDelete",
    	"onDelete",
    	"onNodeDrag",
    	"onNodeDragStart",
    	"onNodeDragStop",
    	"onSelectionDrag",
    	"onSelectionDragStart",
    	"onSelectionDragStop",
    	"onMoveStart",
    	"onMove",
    	"onMoveEnd",
    	"noPanClassName",
    	"nodeOrigin",
    	"autoPanOnConnect",
    	"autoPanOnNodeDrag",
    	"onError",
    	"connectionRadius",
    	"isValidConnection",
    	"selectNodesOnDrag",
    	"nodeDragThreshold",
    	"connectionDragThreshold",
    	"onBeforeDelete",
    	"debug",
    	"autoPanSpeed",
    	"ariaLabelConfig",
    	"zIndexMode"
    ], "rfId"];
    const selector$k = (s) => ({
    	setNodes: s.setNodes,
    	setEdges: s.setEdges,
    	setMinZoom: s.setMinZoom,
    	setMaxZoom: s.setMaxZoom,
    	setTranslateExtent: s.setTranslateExtent,
    	setNodeExtent: s.setNodeExtent,
    	reset: s.reset,
    	setDefaultNodesAndEdges: s.setDefaultNodesAndEdges
    });
    const initPrevValues = {
    	translateExtent: infiniteExtent,
    	nodeOrigin: defaultNodeOrigin,
    	minZoom: .5,
    	maxZoom: 2,
    	elementsSelectable: true,
    	noPanClassName: "nopan",
    	rfId: "1"
    };
    function StoreUpdater(props) {
    	const { setNodes, setEdges, setMinZoom, setMaxZoom, setTranslateExtent, setNodeExtent, reset, setDefaultNodesAndEdges } = useStore(selector$k, shallow$1);
    	const store = useStoreApi();
    	(0, react.useEffect)(() => {
    		setDefaultNodesAndEdges(props.defaultNodes, props.defaultEdges);
    		return () => {
    			previousFields.current = initPrevValues;
    			reset();
    		};
    	}, []);
    	const previousFields = (0, react.useRef)(initPrevValues);
    	(0, react.useEffect)(() => {
    		for (const fieldName of fieldsToTrack) {
    			const fieldValue = props[fieldName];
    			if (fieldValue === previousFields.current[fieldName]) continue;
    			if (typeof props[fieldName] === "undefined") continue;
    			if (fieldName === "nodes") setNodes(fieldValue);
    			else if (fieldName === "edges") setEdges(fieldValue);
    			else if (fieldName === "minZoom") setMinZoom(fieldValue);
    			else if (fieldName === "maxZoom") setMaxZoom(fieldValue);
    			else if (fieldName === "translateExtent") setTranslateExtent(fieldValue);
    			else if (fieldName === "nodeExtent") setNodeExtent(fieldValue);
    			else if (fieldName === "ariaLabelConfig") store.setState({ ariaLabelConfig: mergeAriaLabelConfig(fieldValue) });
    			else if (fieldName === "fitView") store.setState({ fitViewQueued: fieldValue });
    			else if (fieldName === "fitViewOptions") store.setState({ fitViewOptions: fieldValue });
    			else store.setState({ [fieldName]: fieldValue });
    		}
    		previousFields.current = props;
    	}, fieldsToTrack.map((fieldName) => props[fieldName]));
    	return null;
    }
    function getMediaQuery() {
    	if (typeof window === "undefined" || !window.matchMedia) return null;
    	return window.matchMedia("(prefers-color-scheme: dark)");
    }
    /**
    * Hook for receiving the current color mode class 'dark' or 'light'.
    *
    * @internal
    * @param colorMode - The color mode to use ('dark', 'light' or 'system')
    */
    function useColorModeClass(colorMode) {
    	const [colorModeClass, setColorModeClass] = (0, react.useState)(colorMode === "system" ? null : colorMode);
    	(0, react.useEffect)(() => {
    		if (colorMode !== "system") {
    			setColorModeClass(colorMode);
    			return;
    		}
    		const mediaQuery = getMediaQuery();
    		const updateColorModeClass = () => setColorModeClass(mediaQuery?.matches ? "dark" : "light");
    		updateColorModeClass();
    		mediaQuery?.addEventListener("change", updateColorModeClass);
    		return () => {
    			mediaQuery?.removeEventListener("change", updateColorModeClass);
    		};
    	}, [colorMode]);
    	return colorModeClass !== null ? colorModeClass : getMediaQuery()?.matches ? "dark" : "light";
    }
    const defaultDoc = typeof document !== "undefined" ? document : null;
    /**
    * This hook lets you listen for specific key codes and tells you whether they are
    * currently pressed or not.
    *
    * @public
    * @param options - Options
    *
    * @example
    * ```tsx
    *import { useKeyPress } from '@xyflow/react';
    *
    *export default function () {
    *  const spacePressed = useKeyPress('Space');
    *  const cmdAndSPressed = useKeyPress(['Meta+s', 'Strg+s']);
    *
    *  return (
    *    <div>
    *     {spacePressed && <p>Space pressed!</p>}
    *     {cmdAndSPressed && <p>Cmd + S pressed!</p>}
    *    </div>
    *  );
    *}
    *```
    */
    function useKeyPress(keyCode = null, options = {
    	target: defaultDoc,
    	actInsideInputWithModifier: true
    }) {
    	const [keyPressed, setKeyPressed] = (0, react.useState)(false);
    	const modifierPressed = (0, react.useRef)(false);
    	const pressedKeys = (0, react.useRef)(/* @__PURE__ */ new Set([]));
    	const [keyCodes, keysToWatch] = (0, react.useMemo)(() => {
    		if (keyCode !== null) {
    			const keys = (Array.isArray(keyCode) ? keyCode : [keyCode]).filter((kc) => typeof kc === "string").map((kc) => kc.replace(/\+/g, "\n").replace("\n\n", "\n+").split("\n"));
    			return [keys, keys.reduce((res, item) => res.concat(...item), [])];
    		}
    		return [[], []];
    	}, [keyCode]);
    	(0, react.useEffect)(() => {
    		const target = options?.target ?? defaultDoc;
    		const actInsideInputWithModifier = options?.actInsideInputWithModifier ?? true;
    		if (keyCode !== null) {
    			const downHandler = (event) => {
    				modifierPressed.current = event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
    				if ((!modifierPressed.current || modifierPressed.current && !actInsideInputWithModifier) && isInputDOMNode(event)) return false;
    				const keyOrCode = useKeyOrCode(event.code, keysToWatch);
    				pressedKeys.current.add(event[keyOrCode]);
    				if (isMatchingKey(keyCodes, pressedKeys.current, false)) {
    					const target = event.composedPath?.()?.[0] || event.target;
    					const isInteractiveElement = target?.nodeName === "BUTTON" || target?.nodeName === "A";
    					if (options.preventDefault !== false && (modifierPressed.current || !isInteractiveElement)) event.preventDefault();
    					setKeyPressed(true);
    				}
    			};
    			const upHandler = (event) => {
    				const keyOrCode = useKeyOrCode(event.code, keysToWatch);
    				if (isMatchingKey(keyCodes, pressedKeys.current, true)) {
    					setKeyPressed(false);
    					pressedKeys.current.clear();
    				} else pressedKeys.current.delete(event[keyOrCode]);
    				if (event.key === "Meta") pressedKeys.current.clear();
    				modifierPressed.current = false;
    			};
    			const resetHandler = () => {
    				pressedKeys.current.clear();
    				setKeyPressed(false);
    			};
    			target?.addEventListener("keydown", downHandler);
    			target?.addEventListener("keyup", upHandler);
    			window.addEventListener("blur", resetHandler);
    			window.addEventListener("contextmenu", resetHandler);
    			return () => {
    				target?.removeEventListener("keydown", downHandler);
    				target?.removeEventListener("keyup", upHandler);
    				window.removeEventListener("blur", resetHandler);
    				window.removeEventListener("contextmenu", resetHandler);
    			};
    		}
    	}, [keyCode, setKeyPressed]);
    	return keyPressed;
    }
    function isMatchingKey(keyCodes, pressedKeys, isUp) {
    	return keyCodes.filter((keys) => isUp || keys.length === pressedKeys.size).some((keys) => keys.every((k) => pressedKeys.has(k)));
    }
    function useKeyOrCode(eventCode, keysToWatch) {
    	return keysToWatch.includes(eventCode) ? "code" : "key";
    }
    /**
    * Hook for getting viewport helper functions.
    *
    * @internal
    * @returns viewport helper functions
    */
    const useViewportHelper = () => {
    	const store = useStoreApi();
    	return (0, react.useMemo)(() => {
    		return {
    			zoomIn: async (options) => {
    				const { panZoom } = store.getState();
    				return panZoom ? panZoom.scaleBy(1.2, options) : false;
    			},
    			zoomOut: async (options) => {
    				const { panZoom } = store.getState();
    				return panZoom ? panZoom.scaleBy(1 / 1.2, options) : false;
    			},
    			zoomTo: async (zoomLevel, options) => {
    				const { panZoom } = store.getState();
    				return panZoom ? panZoom.scaleTo(zoomLevel, options) : false;
    			},
    			getZoom: () => store.getState().transform[2],
    			setViewport: async (viewport, options) => {
    				const { transform: [tX, tY, tZoom], panZoom } = store.getState();
    				if (!panZoom) return false;
    				await panZoom.setViewport({
    					x: viewport.x ?? tX,
    					y: viewport.y ?? tY,
    					zoom: viewport.zoom ?? tZoom
    				}, options);
    				return true;
    			},
    			getViewport: () => {
    				const [x, y, zoom] = store.getState().transform;
    				return {
    					x,
    					y,
    					zoom
    				};
    			},
    			setCenter: async (x, y, options) => {
    				return store.getState().setCenter(x, y, options);
    			},
    			fitBounds: async (bounds, options) => {
    				const { width, height, minZoom, maxZoom, panZoom } = store.getState();
    				const viewport = getViewportForBounds(bounds, width, height, minZoom, maxZoom, options?.padding ?? .1);
    				if (!panZoom) return false;
    				await panZoom.setViewport(viewport, {
    					duration: options?.duration,
    					ease: options?.ease,
    					interpolate: options?.interpolate
    				});
    				return true;
    			},
    			screenToFlowPosition: (clientPosition, options = {}) => {
    				const { transform, snapGrid, snapToGrid, domNode } = store.getState();
    				if (!domNode) return clientPosition;
    				const { x: domX, y: domY } = domNode.getBoundingClientRect();
    				const correctedPosition = {
    					x: clientPosition.x - domX,
    					y: clientPosition.y - domY
    				};
    				const _snapGrid = options.snapGrid ?? snapGrid;
    				const _snapToGrid = options.snapToGrid ?? snapToGrid;
    				return pointToRendererPoint(correctedPosition, transform, _snapToGrid, _snapGrid);
    			},
    			flowToScreenPosition: (flowPosition) => {
    				const { transform, domNode } = store.getState();
    				if (!domNode) return flowPosition;
    				const { x: domX, y: domY } = domNode.getBoundingClientRect();
    				const rendererPosition = rendererPointToPoint(flowPosition, transform);
    				return {
    					x: rendererPosition.x + domX,
    					y: rendererPosition.y + domY
    				};
    			}
    		};
    	}, []);
    };
    function applyChanges(changes, elements) {
    	const updatedElements = [];
    	const changesMap = /* @__PURE__ */ new Map();
    	const addItemChanges = [];
    	for (const change of changes) if (change.type === "add") {
    		addItemChanges.push(change);
    		continue;
    	} else if (change.type === "remove" || change.type === "replace") changesMap.set(change.id, [change]);
    	else {
    		const elementChanges = changesMap.get(change.id);
    		if (elementChanges) elementChanges.push(change);
    		else changesMap.set(change.id, [change]);
    	}
    	for (const element of elements) {
    		const changes = changesMap.get(element.id);
    		if (!changes) {
    			updatedElements.push(element);
    			continue;
    		}
    		if (changes[0].type === "remove") continue;
    		if (changes[0].type === "replace") {
    			updatedElements.push({ ...changes[0].item });
    			continue;
    		}
    		/**
    		* For other types of changes, we want to start with a shallow copy of the
    		* object so React knows this element has changed. Sequential changes will
    		* each _mutate_ this object, so there's only ever one copy.
    		*/
    		const updatedElement = { ...element };
    		for (const change of changes) applyChange(change, updatedElement);
    		updatedElements.push(updatedElement);
    	}
    	if (addItemChanges.length) addItemChanges.forEach((change) => {
    		if (change.index !== void 0) updatedElements.splice(change.index, 0, { ...change.item });
    		else updatedElements.push({ ...change.item });
    	});
    	return updatedElements;
    }
    function applyChange(change, element) {
    	switch (change.type) {
    		case "select":
    			element.selected = change.selected;
    			break;
    		case "position":
    			if (typeof change.position !== "undefined") element.position = change.position;
    			if (typeof change.dragging !== "undefined") element.dragging = change.dragging;
    			break;
    		case "dimensions":
    			if (typeof change.dimensions !== "undefined") {
    				element.measured = { ...change.dimensions };
    				if (change.setAttributes) {
    					if (change.setAttributes === true || change.setAttributes === "width") element.width = change.dimensions.width;
    					if (change.setAttributes === true || change.setAttributes === "height") element.height = change.dimensions.height;
    				}
    			}
    			if (typeof change.resizing === "boolean") element.resizing = change.resizing;
    	}
    }
    /**
    * Drop in function that applies node changes to an array of nodes.
    * @public
    * @param changes - Array of changes to apply.
    * @param nodes - Array of nodes to apply the changes to.
    * @returns Array of updated nodes.
    * @example
    *```tsx
    *import { useState, useCallback } from 'react';
    *import { ReactFlow, applyNodeChanges, type Node, type Edge, type OnNodesChange } from '@xyflow/react';
    *
    *export default function Flow() {
    *  const [nodes, setNodes] = useState<Node[]>([]);
    *  const [edges, setEdges] = useState<Edge[]>([]);
    *  const onNodesChange: OnNodesChange = useCallback(
    *    (changes) => {
    *      setNodes((oldNodes) => applyNodeChanges(changes, oldNodes));
    *    },
    *    [setNodes],
    *  );
    *
    *  return (
    *    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} />
    *  );
    *}
    *```
    * @remarks Various events on the <ReactFlow /> component can produce an {@link NodeChange}
    * that describes how to update the edges of your flow in some way.
    * If you don't need any custom behaviour, this util can be used to take an array
    * of these changes and apply them to your edges.
    */
    function applyNodeChanges(changes, nodes) {
    	return applyChanges(changes, nodes);
    }
    /**
    * Drop in function that applies edge changes to an array of edges.
    * @public
    * @param changes - Array of changes to apply.
    * @param edges - Array of edge to apply the changes to.
    * @returns Array of updated edges.
    * @example
    * ```tsx
    *import { useState, useCallback } from 'react';
    *import { ReactFlow, applyEdgeChanges } from '@xyflow/react';
    *
    *export default function Flow() {
    *  const [nodes, setNodes] = useState([]);
    *  const [edges, setEdges] = useState([]);
    *  const onEdgesChange = useCallback(
    *    (changes) => {
    *      setEdges((oldEdges) => applyEdgeChanges(changes, oldEdges));
    *    },
    *    [setEdges],
    *  );
    *
    *  return (
    *    <ReactFlow nodes={nodes} edges={edges} onEdgesChange={onEdgesChange} />
    *  );
    *}
    *```
    * @remarks Various events on the <ReactFlow /> component can produce an {@link EdgeChange}
    * that describes how to update the edges of your flow in some way.
    * If you don't need any custom behaviour, this util can be used to take an array
    * of these changes and apply them to your edges.
    */
    function applyEdgeChanges(changes, edges) {
    	return applyChanges(changes, edges);
    }
    function createSelectionChange(id, selected) {
    	return {
    		id,
    		type: "select",
    		selected
    	};
    }
    function getSelectionChanges(items, selectedIds = /* @__PURE__ */ new Set(), mutateItem = false) {
    	const changes = [];
    	for (const [id, item] of items) {
    		const willBeSelected = selectedIds.has(id);
    		if (!(item.selected === void 0 && !willBeSelected) && item.selected !== willBeSelected) {
    			if (mutateItem) item.selected = willBeSelected;
    			changes.push(createSelectionChange(item.id, willBeSelected));
    		}
    	}
    	return changes;
    }
    function getElementsDiffChanges({ items = [], lookup }) {
    	const changes = [];
    	const itemsLookup = new Map(items.map((item) => [item.id, item]));
    	for (const [index, item] of items.entries()) {
    		const lookupItem = lookup.get(item.id);
    		const storeItem = lookupItem?.internals?.userNode ?? lookupItem;
    		if (storeItem !== void 0 && storeItem !== item) changes.push({
    			id: item.id,
    			item,
    			type: "replace"
    		});
    		if (storeItem === void 0) changes.push({
    			item,
    			type: "add",
    			index
    		});
    	}
    	for (const [id] of lookup) if (itemsLookup.get(id) === void 0) changes.push({
    		id,
    		type: "remove"
    	});
    	return changes;
    }
    function elementToRemoveChange(item) {
    	return {
    		id: item.id,
    		type: "remove"
    	};
    }
    const defaultOnError = createDevWarn("React Flow", "https://reactflow.dev/");
    function addEdge(edgeParams, edges, options = {}) {
    	return addEdge$1(edgeParams, edges, {
    		...options,
    		onError: options.onError ?? defaultOnError
    	});
    }
    /**
    * Test whether an object is usable as an [`Node`](/api-reference/types/node).
    * In TypeScript this is a type guard that will narrow the type of whatever you pass in to
    * [`Node`](/api-reference/types/node) if it returns `true`.
    *
    * @public
    * @remarks In TypeScript this is a type guard that will narrow the type of whatever you pass in to Node if it returns true
    * @param element - The element to test.
    * @returns Tests whether the provided value can be used as a `Node`. If you're using TypeScript,
    * this function acts as a type guard and will narrow the type of the value to `Node` if it returns
    * `true`.
    *
    * @example
    * ```js
    *import { isNode } from '@xyflow/react';
    *
    *if (isNode(node)) {
    * // ...
    *}
    *```
    */
    const isNode = (element) => isNodeBase(element);
    /**
    * Test whether an object is usable as an [`Edge`](/api-reference/types/edge).
    * In TypeScript this is a type guard that will narrow the type of whatever you pass in to
    * [`Edge`](/api-reference/types/edge) if it returns `true`.
    *
    * @public
    * @remarks In TypeScript this is a type guard that will narrow the type of whatever you pass in to Edge if it returns true
    * @param element - The element to test
    * @returns Tests whether the provided value can be used as an `Edge`. If you're using TypeScript,
    * this function acts as a type guard and will narrow the type of the value to `Edge` if it returns
    * `true`.
    *
    * @example
    * ```js
    *import { isEdge } from '@xyflow/react';
    *
    *if (isEdge(edge)) {
    * // ...
    *}
    *```
    */
    const isEdge = (element) => isEdgeBase(element);
    function fixedForwardRef(render) {
    	return (0, react.forwardRef)(render);
    }
    const useIsomorphicLayoutEffect = typeof window !== "undefined" ? react.useLayoutEffect : react.useEffect;
    /**
    * This hook returns a queue that can be used to batch updates.
    *
    * @param runQueue - a function that gets called when the queue is flushed
    * @internal
    *
    * @returns a Queue object
    */
    function useQueue(runQueue) {
    	const [serial, setSerial] = (0, react.useState)(BigInt(0));
    	const [queue] = (0, react.useState)(() => createQueue(() => setSerial((n) => n + BigInt(1))));
    	useIsomorphicLayoutEffect(() => {
    		const queueItems = queue.get();
    		if (queueItems.length) {
    			runQueue(queueItems);
    			queue.reset();
    		}
    	}, [serial]);
    	return queue;
    }
    function createQueue(cb) {
    	let queue = [];
    	return {
    		get: () => queue,
    		reset: () => {
    			queue = [];
    		},
    		push: (item) => {
    			queue.push(item);
    			cb();
    		}
    	};
    }
    const BatchContext = (0, react.createContext)(null);
    /**
    * This is a context provider that holds and processes the node and edge update queues
    * that are needed to handle setNodes, addNodes, setEdges and addEdges.
    *
    * @internal
    */
    function BatchProvider({ children }) {
    	const store = useStoreApi();
    	const nodeQueue = useQueue((0, react.useCallback)((queueItems) => {
    		const { nodes = [], setNodes, hasDefaultNodes, onNodesChange, nodeLookup, fitViewQueued, onNodesChangeMiddlewareMap } = store.getState();
    		let next = nodes;
    		for (const payload of queueItems) next = typeof payload === "function" ? payload(next) : payload;
    		let changes = getElementsDiffChanges({
    			items: next,
    			lookup: nodeLookup
    		});
    		for (const middleware of onNodesChangeMiddlewareMap.values()) changes = middleware(changes);
    		if (hasDefaultNodes) setNodes(next);
    		if (changes.length > 0) onNodesChange?.(changes);
    		else if (fitViewQueued) window.requestAnimationFrame(() => {
    			const { fitViewQueued, nodes, setNodes } = store.getState();
    			if (fitViewQueued) setNodes(nodes);
    		});
    	}, []));
    	const edgeQueue = useQueue((0, react.useCallback)((queueItems) => {
    		const { edges = [], setEdges, hasDefaultEdges, onEdgesChange, edgeLookup } = store.getState();
    		let next = edges;
    		for (const payload of queueItems) next = typeof payload === "function" ? payload(next) : payload;
    		if (hasDefaultEdges) setEdges(next);
    		else if (onEdgesChange) onEdgesChange(getElementsDiffChanges({
    			items: next,
    			lookup: edgeLookup
    		}));
    	}, []));
    	const value = (0, react.useMemo)(() => ({
    		nodeQueue,
    		edgeQueue
    	}), []);
    	return (0, react_jsx_runtime.jsx)(BatchContext.Provider, {
    		value,
    		children
    	});
    }
    function useBatchContext() {
    	const batchContext = (0, react.useContext)(BatchContext);
    	if (!batchContext) throw new Error("useBatchContext must be used within a BatchProvider");
    	return batchContext;
    }
    const selector$j = (s) => !!s.panZoom;
    /**
    * This hook returns a ReactFlowInstance that can be used to update nodes and edges, manipulate the viewport, or query the current state of the flow.
    *
    * @public
    * @example
    * ```jsx
    *import { useCallback, useState } from 'react';
    *import { useReactFlow } from '@xyflow/react';
    *
    *export function NodeCounter() {
    *  const reactFlow = useReactFlow();
    *  const [count, setCount] = useState(0);
    *  const countNodes = useCallback(() => {
    *    setCount(reactFlow.getNodes().length);
    *    // you need to pass it as a dependency if you are using it with useEffect or useCallback
    *    // because at the first render, it's not initialized yet and some functions might not work.
    *  }, [reactFlow]);
    *
    *  return (
    *    <div>
    *      <button onClick={countNodes}>Update count</button>
    *      <p>There are {count} nodes in the flow.</p>
    *    </div>
    *  );
    *}
    *```
    */
    function useReactFlow() {
    	const viewportHelper = useViewportHelper();
    	const store = useStoreApi();
    	const batchContext = useBatchContext();
    	const viewportInitialized = useStore(selector$j);
    	const generalHelper = (0, react.useMemo)(() => {
    		const getInternalNode = (id) => store.getState().nodeLookup.get(id);
    		const setNodes = (payload) => {
    			batchContext.nodeQueue.push(payload);
    		};
    		const setEdges = (payload) => {
    			batchContext.edgeQueue.push(payload);
    		};
    		const getNodeRect = (node) => {
    			const { nodeLookup, nodeOrigin } = store.getState();
    			const nodeToUse = isNode(node) ? node : nodeLookup.get(node.id);
    			const position = nodeToUse.parentId ? evaluateAbsolutePosition(nodeToUse.position, nodeToUse.measured, nodeToUse.parentId, nodeLookup, nodeOrigin) : nodeToUse.position;
    			const nodeWithPosition = {
    				...nodeToUse,
    				position,
    				width: nodeToUse.measured?.width ?? nodeToUse.width,
    				height: nodeToUse.measured?.height ?? nodeToUse.height
    			};
    			return nodeToRect(nodeWithPosition);
    		};
    		const updateNode = (id, nodeUpdate, options = { replace: false }) => {
    			setNodes((prevNodes) => prevNodes.map((node) => {
    				if (node.id === id) {
    					const nextNode = typeof nodeUpdate === "function" ? nodeUpdate(node) : nodeUpdate;
    					return options.replace && isNode(nextNode) ? nextNode : {
    						...node,
    						...nextNode
    					};
    				}
    				return node;
    			}));
    		};
    		const updateEdge = (id, edgeUpdate, options = { replace: false }) => {
    			setEdges((prevEdges) => prevEdges.map((edge) => {
    				if (edge.id === id) {
    					const nextEdge = typeof edgeUpdate === "function" ? edgeUpdate(edge) : edgeUpdate;
    					return options.replace && isEdge(nextEdge) ? nextEdge : {
    						...edge,
    						...nextEdge
    					};
    				}
    				return edge;
    			}));
    		};
    		return {
    			getNodes: () => store.getState().nodes.map((n) => ({ ...n })),
    			getNode: (id) => getInternalNode(id)?.internals.userNode,
    			getInternalNode,
    			getEdges: () => {
    				const { edges = [] } = store.getState();
    				return edges.map((e) => ({ ...e }));
    			},
    			getEdge: (id) => store.getState().edgeLookup.get(id),
    			setNodes,
    			setEdges,
    			addNodes: (payload) => {
    				const newNodes = Array.isArray(payload) ? payload : [payload];
    				batchContext.nodeQueue.push((nodes) => [...nodes, ...newNodes]);
    			},
    			addEdges: (payload) => {
    				const newEdges = Array.isArray(payload) ? payload : [payload];
    				batchContext.edgeQueue.push((edges) => [...edges, ...newEdges]);
    			},
    			toObject: () => {
    				const { nodes = [], edges = [], transform } = store.getState();
    				const [x, y, zoom] = transform;
    				return {
    					nodes: nodes.map((n) => ({ ...n })),
    					edges: edges.map((e) => ({ ...e })),
    					viewport: {
    						x,
    						y,
    						zoom
    					}
    				};
    			},
    			deleteElements: async ({ nodes: nodesToRemove = [], edges: edgesToRemove = [] }) => {
    				const { nodes, edges, onNodesDelete, onEdgesDelete, triggerNodeChanges, triggerEdgeChanges, onDelete, onBeforeDelete } = store.getState();
    				const { nodes: matchingNodes, edges: matchingEdges } = await getElementsToRemove({
    					nodesToRemove,
    					edgesToRemove,
    					nodes,
    					edges,
    					onBeforeDelete
    				});
    				const hasMatchingEdges = matchingEdges.length > 0;
    				const hasMatchingNodes = matchingNodes.length > 0;
    				if (hasMatchingEdges) {
    					const edgeChanges = matchingEdges.map(elementToRemoveChange);
    					onEdgesDelete?.(matchingEdges);
    					triggerEdgeChanges(edgeChanges);
    				}
    				if (hasMatchingNodes) {
    					const nodeChanges = matchingNodes.map(elementToRemoveChange);
    					onNodesDelete?.(matchingNodes);
    					triggerNodeChanges(nodeChanges);
    				}
    				if (hasMatchingNodes || hasMatchingEdges) onDelete?.({
    					nodes: matchingNodes,
    					edges: matchingEdges
    				});
    				return {
    					deletedNodes: matchingNodes,
    					deletedEdges: matchingEdges
    				};
    			},
    			/**
    			* Partial is defined as "the 2 nodes/areas are intersecting partially".
    			* If a is contained in b or b is contained in a, they are both
    			* considered fully intersecting.
    			*/
    			getIntersectingNodes: (nodeOrRect, partially = true, nodes) => {
    				const isRect = isRectObject(nodeOrRect);
    				const nodeRect = isRect ? nodeOrRect : getNodeRect(nodeOrRect);
    				const hasNodesOption = nodes !== void 0;
    				if (!nodeRect) return [];
    				return (nodes || store.getState().nodes).filter((n) => {
    					const internalNode = store.getState().nodeLookup.get(n.id);
    					if (internalNode && !isRect && (n.id === nodeOrRect.id || !internalNode.internals.positionAbsolute)) return false;
    					const currNodeRect = nodeToRect(hasNodesOption ? n : internalNode);
    					const overlappingArea = getOverlappingArea(currNodeRect, nodeRect);
    					return partially && overlappingArea > 0 || overlappingArea >= currNodeRect.width * currNodeRect.height || overlappingArea >= nodeRect.width * nodeRect.height;
    				});
    			},
    			isNodeIntersecting: (nodeOrRect, area, partially = true) => {
    				const nodeRect = isRectObject(nodeOrRect) ? nodeOrRect : getNodeRect(nodeOrRect);
    				if (!nodeRect) return false;
    				const overlappingArea = getOverlappingArea(nodeRect, area);
    				return partially && overlappingArea > 0 || overlappingArea >= area.width * area.height || overlappingArea >= nodeRect.width * nodeRect.height;
    			},
    			updateNode,
    			updateNodeData: (id, dataUpdate, options = { replace: false }) => {
    				updateNode(id, (node) => {
    					const nextData = typeof dataUpdate === "function" ? dataUpdate(node) : dataUpdate;
    					return options.replace ? {
    						...node,
    						data: nextData
    					} : {
    						...node,
    						data: {
    							...node.data,
    							...nextData
    						}
    					};
    				}, options);
    			},
    			updateEdge,
    			updateEdgeData: (id, dataUpdate, options = { replace: false }) => {
    				updateEdge(id, (edge) => {
    					const nextData = typeof dataUpdate === "function" ? dataUpdate(edge) : dataUpdate;
    					return options.replace ? {
    						...edge,
    						data: nextData
    					} : {
    						...edge,
    						data: {
    							...edge.data,
    							...nextData
    						}
    					};
    				}, options);
    			},
    			getNodesBounds: (nodes) => {
    				const { nodeLookup, nodeOrigin } = store.getState();
    				return getNodesBounds(nodes, {
    					nodeLookup,
    					nodeOrigin
    				});
    			},
    			getHandleConnections: ({ type, id, nodeId }) => Array.from(store.getState().connectionLookup.get(`${nodeId}-${type}${id ? `-${id}` : ""}`)?.values() ?? []),
    			getNodeConnections: ({ type, handleId, nodeId }) => Array.from(store.getState().connectionLookup.get(`${nodeId}${type ? handleId ? `-${type}-${handleId}` : `-${type}` : ""}`)?.values() ?? []),
    			fitView: async (options) => {
    				const fitViewResolver = store.getState().fitViewResolver ?? withResolvers();
    				store.setState({
    					fitViewQueued: true,
    					fitViewOptions: options,
    					fitViewResolver
    				});
    				batchContext.nodeQueue.push((nodes) => [...nodes]);
    				return fitViewResolver.promise;
    			}
    		};
    	}, []);
    	return (0, react.useMemo)(() => {
    		return {
    			...generalHelper,
    			...viewportHelper,
    			viewportInitialized
    		};
    	}, [viewportInitialized]);
    }
    const selected = (item) => item.selected;
    const win$1 = typeof window !== "undefined" ? window : void 0;
    /**
    * Hook for handling global key events.
    *
    * @internal
    */
    function useGlobalKeyHandler({ deleteKeyCode, multiSelectionKeyCode }) {
    	const store = useStoreApi();
    	const { deleteElements } = useReactFlow();
    	const deleteKeyPressed = useKeyPress(deleteKeyCode, { actInsideInputWithModifier: false });
    	const multiSelectionKeyPressed = useKeyPress(multiSelectionKeyCode, { target: win$1 });
    	(0, react.useEffect)(() => {
    		if (deleteKeyPressed) {
    			const { edges, nodes } = store.getState();
    			deleteElements({
    				nodes: nodes.filter(selected),
    				edges: edges.filter(selected)
    			});
    			store.setState({ nodesSelectionActive: false });
    		}
    	}, [deleteKeyPressed]);
    	(0, react.useEffect)(() => {
    		store.setState({ multiSelectionActive: multiSelectionKeyPressed });
    	}, [multiSelectionKeyPressed]);
    }
    /**
    * Hook for handling resize events.
    *
    * @internal
    */
    function useResizeHandler(domNode) {
    	const store = useStoreApi();
    	(0, react.useEffect)(() => {
    		const updateDimensions = () => {
    			if (!domNode.current || !(domNode.current.checkVisibility?.() ?? true)) return false;
    			const size = getDimensions(domNode.current);
    			if (size.height === 0 || size.width === 0) store.getState().onError?.("004", errorMessages["error004"]());
    			store.setState({
    				width: size.width || 500,
    				height: size.height || 500
    			});
    		};
    		if (domNode.current) {
    			updateDimensions();
    			window.addEventListener("resize", updateDimensions);
    			const resizeObserver = new ResizeObserver(() => updateDimensions());
    			resizeObserver.observe(domNode.current);
    			return () => {
    				window.removeEventListener("resize", updateDimensions);
    				if (resizeObserver && domNode.current) resizeObserver.unobserve(domNode.current);
    			};
    		}
    	}, []);
    }
    const containerStyle = {
    	position: "absolute",
    	width: "100%",
    	height: "100%",
    	top: 0,
    	left: 0
    };
    const selector$i = (s) => ({
    	userSelectionActive: s.userSelectionActive,
    	lib: s.lib,
    	connectionInProgress: s.connection.inProgress
    });
    function ZoomPane({ onPaneContextMenu, zoomOnScroll = true, zoomOnPinch = true, panOnScroll = false, panActivationKeyPressed, panOnScrollSpeed = .5, panOnScrollMode = PanOnScrollMode.Free, zoomOnDoubleClick = true, panOnDrag = true, defaultViewport, translateExtent, minZoom, maxZoom, zoomActivationKeyCode, preventScrolling = true, children, noWheelClassName, noPanClassName, onViewportChange, isControlledViewport, paneClickDistance, selectionOnDrag }) {
    	const store = useStoreApi();
    	const zoomPane = (0, react.useRef)(null);
    	const { userSelectionActive, lib, connectionInProgress } = useStore(selector$i, shallow$1);
    	const zoomActivationKeyPressed = useKeyPress(zoomActivationKeyCode);
    	const panZoom = (0, react.useRef)();
    	useResizeHandler(zoomPane);
    	const onTransformChange = (0, react.useCallback)((transform) => {
    		onViewportChange?.({
    			x: transform[0],
    			y: transform[1],
    			zoom: transform[2]
    		});
    		if (!isControlledViewport) store.setState({ transform });
    	}, [onViewportChange, isControlledViewport]);
    	(0, react.useEffect)(() => {
    		if (zoomPane.current) {
    			panZoom.current = XYPanZoom({
    				domNode: zoomPane.current,
    				minZoom,
    				maxZoom,
    				translateExtent,
    				viewport: defaultViewport,
    				onDraggingChange: (paneDragging) => store.setState((prevState) => prevState.paneDragging === paneDragging ? prevState : { paneDragging }),
    				onPanZoomStart: (event, vp) => {
    					const { onViewportChangeStart, onMoveStart } = store.getState();
    					onMoveStart?.(event, vp);
    					onViewportChangeStart?.(vp);
    				},
    				onPanZoom: (event, vp) => {
    					const { onViewportChange, onMove } = store.getState();
    					onMove?.(event, vp);
    					onViewportChange?.(vp);
    				},
    				onPanZoomEnd: (event, vp) => {
    					const { onViewportChangeEnd, onMoveEnd } = store.getState();
    					onMoveEnd?.(event, vp);
    					onViewportChangeEnd?.(vp);
    				}
    			});
    			const { x, y, zoom } = panZoom.current.getViewport();
    			store.setState({
    				panZoom: panZoom.current,
    				transform: [
    					x,
    					y,
    					zoom
    				],
    				domNode: zoomPane.current.closest(".react-flow")
    			});
    			return () => {
    				panZoom.current?.destroy();
    			};
    		}
    	}, []);
    	(0, react.useEffect)(() => {
    		panZoom.current?.update({
    			onPaneContextMenu,
    			zoomOnScroll,
    			zoomOnPinch,
    			panOnScroll,
    			panActivationKeyPressed,
    			panOnScrollSpeed,
    			panOnScrollMode,
    			zoomOnDoubleClick,
    			panOnDrag,
    			zoomActivationKeyPressed,
    			preventScrolling,
    			noPanClassName,
    			userSelectionActive,
    			noWheelClassName,
    			lib,
    			onTransformChange,
    			connectionInProgress,
    			selectionOnDrag,
    			paneClickDistance
    		});
    	}, [
    		onPaneContextMenu,
    		zoomOnScroll,
    		zoomOnPinch,
    		panOnScroll,
    		panActivationKeyPressed,
    		panOnScrollSpeed,
    		panOnScrollMode,
    		zoomOnDoubleClick,
    		panOnDrag,
    		zoomActivationKeyPressed,
    		preventScrolling,
    		noPanClassName,
    		userSelectionActive,
    		noWheelClassName,
    		lib,
    		onTransformChange,
    		connectionInProgress,
    		selectionOnDrag,
    		paneClickDistance
    	]);
    	return (0, react_jsx_runtime.jsx)("div", {
    		className: "react-flow__renderer",
    		ref: zoomPane,
    		style: containerStyle,
    		children
    	});
    }
    const selector$h = (s) => ({
    	userSelectionActive: s.userSelectionActive,
    	userSelectionRect: s.userSelectionRect
    });
    function UserSelection() {
    	const { userSelectionActive, userSelectionRect } = useStore(selector$h, shallow$1);
    	if (!(userSelectionActive && userSelectionRect)) return null;
    	return (0, react_jsx_runtime.jsx)("div", {
    		className: "react-flow__selection react-flow__container",
    		style: {
    			width: userSelectionRect.width,
    			height: userSelectionRect.height,
    			transform: `translate(${userSelectionRect.x}px, ${userSelectionRect.y}px)`
    		}
    	});
    }
    const wrapHandler = (handler, containerRef) => {
    	return (event) => {
    		if (event.target !== containerRef.current) return;
    		handler?.(event);
    	};
    };
    const selector$g = (s) => ({
    	userSelectionActive: s.userSelectionActive,
    	elementsSelectable: s.elementsSelectable,
    	dragging: s.paneDragging,
    	panBy: s.panBy,
    	autoPanSpeed: s.autoPanSpeed
    });
    function Pane({ isSelecting, selectionKeyPressed, selectionMode = SelectionMode.Full, panOnDrag, autoPanOnSelection, paneClickDistance, selectionOnDrag, onSelectionStart, onSelectionEnd, onPaneClick, onPaneContextMenu, onPaneScroll, onPaneMouseEnter, onPaneMouseMove, onPaneMouseLeave, children }) {
    	const autoPanId = (0, react.useRef)(0);
    	const store = useStoreApi();
    	const { userSelectionActive, elementsSelectable, dragging, panBy, autoPanSpeed } = useStore(selector$g, shallow$1);
    	const isSelectionEnabled = elementsSelectable && (isSelecting || userSelectionActive);
    	const container = (0, react.useRef)(null);
    	const containerBounds = (0, react.useRef)();
    	const selectedNodeIds = (0, react.useRef)(/* @__PURE__ */ new Set());
    	const selectedEdgeIds = (0, react.useRef)(/* @__PURE__ */ new Set());
    	const connectionEndedOnPane = (0, react.useRef)(false);
    	const selectionInProgress = (0, react.useRef)(false);
    	const position = (0, react.useRef)({
    		x: 0,
    		y: 0
    	});
    	const autoPanStarted = (0, react.useRef)(false);
    	const onClick = (event) => {
    		if (selectionInProgress.current || connectionEndedOnPane.current || store.getState().connection.inProgress) {
    			selectionInProgress.current = false;
    			connectionEndedOnPane.current = false;
    			return;
    		}
    		onPaneClick?.(event);
    		store.getState().resetSelectedElements();
    		store.setState({ nodesSelectionActive: false });
    	};
    	const onContextMenu = (event) => {
    		if (Array.isArray(panOnDrag) && panOnDrag?.includes(2)) {
    			event.preventDefault();
    			return;
    		}
    		onPaneContextMenu?.(event);
    	};
    	const onWheel = onPaneScroll ? (event) => onPaneScroll(event) : void 0;
    	const onClickCapture = (event) => {
    		if (selectionInProgress.current) {
    			event.stopPropagation();
    			selectionInProgress.current = false;
    		}
    	};
    	const onPointerDownCapture = (event) => {
    		if (event.pointerType === "touch" && panOnDrag !== false && !selectionKeyPressed) return;
    		const { domNode, transform } = store.getState();
    		containerBounds.current = domNode?.getBoundingClientRect();
    		if (!containerBounds.current) return;
    		const eventTargetIsContainer = event.target === container.current;
    		if (!eventTargetIsContainer && !!event.target.closest(".nokey") || !isSelecting || !(selectionOnDrag && eventTargetIsContainer || selectionKeyPressed) || event.button !== 0 || !event.isPrimary) return;
    		event.target?.setPointerCapture?.(event.pointerId);
    		selectionInProgress.current = false;
    		const { x, y } = getEventPosition(event.nativeEvent, containerBounds.current);
    		const userSelectionStartPosition = pointToRendererPoint({
    			x,
    			y
    		}, transform);
    		store.setState({ userSelectionRect: {
    			width: 0,
    			height: 0,
    			startX: userSelectionStartPosition.x,
    			startY: userSelectionStartPosition.y,
    			x,
    			y
    		} });
    		if (!eventTargetIsContainer) {
    			event.stopPropagation();
    			event.preventDefault();
    		}
    	};
    	function commitUserSelectionRect(mouseX, mouseY) {
    		const { userSelectionRect } = store.getState();
    		if (!userSelectionRect) return;
    		const { transform, nodeLookup, edgeLookup, connectionLookup, triggerNodeChanges, triggerEdgeChanges, defaultEdgeOptions } = store.getState();
    		const userStartPosition = {
    			x: userSelectionRect.startX,
    			y: userSelectionRect.startY
    		};
    		const { x: screenStartX, y: screenStartY } = rendererPointToPoint(userStartPosition, transform);
    		const nextUserSelectRect = {
    			startX: userStartPosition.x,
    			startY: userStartPosition.y,
    			x: mouseX < screenStartX ? mouseX : screenStartX,
    			y: mouseY < screenStartY ? mouseY : screenStartY,
    			width: Math.abs(mouseX - screenStartX),
    			height: Math.abs(mouseY - screenStartY)
    		};
    		const prevSelectedNodeIds = selectedNodeIds.current;
    		const prevSelectedEdgeIds = selectedEdgeIds.current;
    		selectedNodeIds.current = new Set(getNodesInside(nodeLookup, nextUserSelectRect, transform, selectionMode === SelectionMode.Partial, true).map((node) => node.id));
    		selectedEdgeIds.current = /* @__PURE__ */ new Set();
    		const edgesSelectable = defaultEdgeOptions?.selectable ?? true;
    		for (const nodeId of selectedNodeIds.current) {
    			const connections = connectionLookup.get(nodeId);
    			if (!connections) continue;
    			for (const { edgeId } of connections.values()) {
    				const edge = edgeLookup.get(edgeId);
    				if (edge && (edge.selectable ?? edgesSelectable)) selectedEdgeIds.current.add(edgeId);
    			}
    		}
    		if (!areSetsEqual(prevSelectedNodeIds, selectedNodeIds.current)) triggerNodeChanges(getSelectionChanges(nodeLookup, selectedNodeIds.current, true));
    		if (!areSetsEqual(prevSelectedEdgeIds, selectedEdgeIds.current)) triggerEdgeChanges(getSelectionChanges(edgeLookup, selectedEdgeIds.current));
    		store.setState({
    			userSelectionRect: nextUserSelectRect,
    			userSelectionActive: true,
    			nodesSelectionActive: false
    		});
    	}
    	function autoPan() {
    		if (!autoPanOnSelection || !containerBounds.current) return;
    		const [x, y] = calcAutoPan(position.current, containerBounds.current, autoPanSpeed);
    		panBy({
    			x,
    			y
    		}).then((panned) => {
    			if (!selectionInProgress.current || !panned) {
    				autoPanId.current = requestAnimationFrame(autoPan);
    				return;
    			}
    			const { x: mx, y: my } = position.current;
    			commitUserSelectionRect(mx, my);
    			autoPanId.current = requestAnimationFrame(autoPan);
    		});
    	}
    	const cleanupAutoPan = () => {
    		cancelAnimationFrame(autoPanId.current);
    		autoPanId.current = 0;
    		autoPanStarted.current = false;
    	};
    	(0, react.useEffect)(() => {
    		return () => cleanupAutoPan();
    	}, []);
    	const onPointerMove = (event) => {
    		const { userSelectionRect, transform, resetSelectedElements } = store.getState();
    		if (!containerBounds.current || !userSelectionRect) return;
    		const { x: mouseX, y: mouseY } = getEventPosition(event.nativeEvent, containerBounds.current);
    		position.current = {
    			x: mouseX,
    			y: mouseY
    		};
    		const screenStart = rendererPointToPoint({
    			x: userSelectionRect.startX,
    			y: userSelectionRect.startY
    		}, transform);
    		if (!selectionInProgress.current) {
    			const requiredDistance = selectionKeyPressed ? 0 : paneClickDistance;
    			if (Math.hypot(mouseX - screenStart.x, mouseY - screenStart.y) <= requiredDistance) return;
    			resetSelectedElements();
    			onSelectionStart?.(event);
    		}
    		selectionInProgress.current = true;
    		if (!autoPanStarted.current) {
    			autoPan();
    			autoPanStarted.current = true;
    		}
    		commitUserSelectionRect(mouseX, mouseY);
    	};
    	const onPointerUp = (event) => {
    		if (!isSelectionEnabled) {
    			if (event.target === container.current && store.getState().connection.inProgress) connectionEndedOnPane.current = true;
    			return;
    		}
    		if (event.button !== 0) return;
    		event.target?.releasePointerCapture?.(event.pointerId);
    		if (!userSelectionActive && event.target === container.current && store.getState().userSelectionRect) onClick?.(event);
    		store.setState({
    			userSelectionActive: false,
    			userSelectionRect: null
    		});
    		if (selectionInProgress.current) {
    			onSelectionEnd?.(event);
    			store.setState({ nodesSelectionActive: selectedNodeIds.current.size > 0 });
    		}
    		cleanupAutoPan();
    	};
    	const onPointerCancel = (event) => {
    		event.target?.releasePointerCapture?.(event.pointerId);
    		cleanupAutoPan();
    	};
    	const draggable = panOnDrag === true || Array.isArray(panOnDrag) && panOnDrag.includes(0);
    	return (0, react_jsx_runtime.jsxs)("div", {
    		className: cc(["react-flow__pane", {
    			draggable,
    			dragging,
    			selection: isSelecting
    		}]),
    		onClick: isSelectionEnabled ? void 0 : wrapHandler(onClick, container),
    		onContextMenu: wrapHandler(onContextMenu, container),
    		onWheel: wrapHandler(onWheel, container),
    		onPointerEnter: isSelectionEnabled ? void 0 : onPaneMouseEnter,
    		onPointerMove: isSelectionEnabled ? onPointerMove : onPaneMouseMove,
    		onPointerUp,
    		onPointerCancel: isSelectionEnabled ? onPointerCancel : void 0,
    		onPointerDownCapture: isSelectionEnabled ? onPointerDownCapture : void 0,
    		onClickCapture: isSelectionEnabled ? onClickCapture : void 0,
    		onPointerLeave: onPaneMouseLeave,
    		ref: container,
    		style: containerStyle,
    		children: [children, (0, react_jsx_runtime.jsx)(UserSelection, {})]
    	});
    }
    function handleNodeClick({ id, store, unselect = false, nodeRef }) {
    	const { addSelectedNodes, unselectNodesAndEdges, multiSelectionActive, nodeLookup, onError } = store.getState();
    	const node = nodeLookup.get(id);
    	if (!node) {
    		onError?.("012", errorMessages["error012"](id));
    		return;
    	}
    	store.setState({ nodesSelectionActive: false });
    	if (!node.selected) addSelectedNodes([id]);
    	else if (unselect || node.selected && multiSelectionActive) {
    		unselectNodesAndEdges({
    			nodes: [node],
    			edges: []
    		});
    		requestAnimationFrame(() => nodeRef?.current?.blur());
    	}
    }
    /**
    * Hook for calling XYDrag helper from @xyflow/system.
    *
    * @internal
    */
    function useDrag({ nodeRef, disabled = false, noDragClassName, handleSelector, nodeId, isSelectable, nodeClickDistance }) {
    	const store = useStoreApi();
    	const [dragging, setDragging] = (0, react.useState)(false);
    	const xyDrag = (0, react.useRef)();
    	(0, react.useEffect)(() => {
    		if (disabled) return;
    		xyDrag.current = XYDrag({
    			getStoreItems: () => store.getState(),
    			onNodeMouseDown: (id) => {
    				handleNodeClick({
    					id,
    					store,
    					nodeRef
    				});
    			},
    			onDragStart: () => {
    				setDragging(true);
    			},
    			onDragStop: () => {
    				setDragging(false);
    			}
    		});
    		return () => {
    			xyDrag.current?.destroy();
    			xyDrag.current = void 0;
    		};
    	}, [
    		disabled,
    		store,
    		nodeRef
    	]);
    	(0, react.useEffect)(() => {
    		if (disabled || !nodeRef.current || !xyDrag.current) return;
    		xyDrag.current.update({
    			noDragClassName,
    			handleSelector,
    			domNode: nodeRef.current,
    			isSelectable,
    			nodeId,
    			nodeClickDistance
    		});
    	}, [
    		noDragClassName,
    		handleSelector,
    		disabled,
    		isSelectable,
    		nodeRef,
    		nodeId,
    		nodeClickDistance
    	]);
    	return dragging;
    }
    const selectedAndDraggable = (nodesDraggable) => (n) => n.selected && (n.draggable || nodesDraggable && typeof n.draggable === "undefined");
    /**
    * Hook for updating node positions by passing a direction and factor
    *
    * @internal
    * @returns function for updating node positions
    */
    function useMoveSelectedNodes() {
    	const store = useStoreApi();
    	return (0, react.useCallback)((params) => {
    		const { nodeExtent, snapToGrid, snapGrid, nodesDraggable, onError, updateNodePositions, nodeLookup, nodeOrigin } = store.getState();
    		const nodeUpdates = /* @__PURE__ */ new Map();
    		const isSelected = selectedAndDraggable(nodesDraggable);
    		const xVelo = snapToGrid ? snapGrid[0] : 5;
    		const yVelo = snapToGrid ? snapGrid[1] : 5;
    		const xDiff = params.direction.x * xVelo * params.factor;
    		const yDiff = params.direction.y * yVelo * params.factor;
    		for (const [, node] of nodeLookup) {
    			if (!isSelected(node)) continue;
    			let nextPosition = {
    				x: node.internals.positionAbsolute.x + xDiff,
    				y: node.internals.positionAbsolute.y + yDiff
    			};
    			if (snapToGrid) nextPosition = snapPosition(nextPosition, snapGrid);
    			const { position, positionAbsolute } = calculateNodePosition({
    				nodeId: node.id,
    				nextPosition,
    				nodeLookup,
    				nodeExtent,
    				nodeOrigin,
    				onError
    			});
    			node.position = position;
    			node.internals.positionAbsolute = positionAbsolute;
    			nodeUpdates.set(node.id, node);
    		}
    		updateNodePositions(nodeUpdates);
    	}, []);
    }
    const NodeIdContext = (0, react.createContext)(null);
    const Provider = NodeIdContext.Provider;
    NodeIdContext.Consumer;
    /**
    * You can use this hook to get the id of the node it is used inside. It is useful
    * if you need the node's id deeper in the render tree but don't want to manually
    * drill down the id as a prop.
    *
    * @public
    * @returns The id for a node in the flow.
    *
    * @example
    *```jsx
    *import { useNodeId } from '@xyflow/react';
    *
    *export default function CustomNode() {
    *  return (
    *    <div>
    *      <span>This node has an id of </span>
    *      <NodeIdDisplay />
    *    </div>
    *  );
    *}
    *
    *function NodeIdDisplay() {
    *  const nodeId = useNodeId();
    *
    *  return <span>{nodeId}</span>;
    *}
    *```
    */
    const useNodeId = () => {
    	return (0, react.useContext)(NodeIdContext);
    };
    const selector$f = (s) => ({
    	connectOnClick: s.connectOnClick,
    	noPanClassName: s.noPanClassName,
    	rfId: s.rfId
    });
    const HandleConfigContext = (0, react.createContext)(null);
    function HandleConfigProvider({ children }) {
    	const config = useStore(selector$f, shallow$1);
    	return (0, react_jsx_runtime.jsx)(HandleConfigContext.Provider, {
    		value: config,
    		children
    	});
    }
    function useHandleConfig() {
    	const config = (0, react.useContext)(HandleConfigContext);
    	if (!config) throw new Error("useHandleConfig must be used within a HandleConfigProvider");
    	return config;
    }
    const idleConnectingState = {
    	connectingFrom: false,
    	connectingTo: false,
    	clickConnecting: false,
    	isPossibleEndHandle: true,
    	connectionInProcess: false,
    	clickConnectionInProcess: false,
    	valid: false
    };
    const connectingSelector = (nodeId, handleId, type) => (state) => {
    	const { connectionClickStartHandle: clickHandle, connectionMode, connection } = state;
    	const { fromHandle, toHandle, isValid } = connection;
    	if (!fromHandle && !clickHandle) return idleConnectingState;
    	const connectingTo = toHandle?.nodeId === nodeId && toHandle?.id === handleId && toHandle?.type === type;
    	return {
    		connectingFrom: fromHandle?.nodeId === nodeId && fromHandle?.id === handleId && fromHandle?.type === type,
    		connectingTo,
    		clickConnecting: clickHandle?.nodeId === nodeId && clickHandle?.id === handleId && clickHandle?.type === type,
    		isPossibleEndHandle: connectionMode === ConnectionMode.Strict ? fromHandle?.type !== type : nodeId !== fromHandle?.nodeId || handleId !== fromHandle?.id,
    		connectionInProcess: !!fromHandle,
    		clickConnectionInProcess: !!clickHandle,
    		valid: connectingTo && isValid
    	};
    };
    function HandleComponent({ type = "source", position = Position.Top, isValidConnection, isConnectable = true, isConnectableStart = true, isConnectableEnd = true, id, onConnect, children, className, onMouseDown, onTouchStart, ...rest }, ref) {
    	const handleId = id || null;
    	const isTarget = type === "target";
    	const store = useStoreApi();
    	const nodeId = useNodeId();
    	const { connectOnClick, noPanClassName, rfId } = useHandleConfig();
    	const { connectingFrom, connectingTo, clickConnecting, isPossibleEndHandle, connectionInProcess, clickConnectionInProcess, valid } = useStore(connectingSelector(nodeId, handleId, type), shallow$1);
    	if (!nodeId) store.getState().onError?.("010", errorMessages["error010"]());
    	const onConnectExtended = (params) => {
    		const { defaultEdgeOptions, onConnect: onConnectAction, hasDefaultEdges } = store.getState();
    		const edgeParams = {
    			...defaultEdgeOptions,
    			...params
    		};
    		if (hasDefaultEdges) {
    			const { edges, setEdges, onError } = store.getState();
    			setEdges(addEdge(edgeParams, edges, { onError }));
    		}
    		onConnectAction?.(edgeParams);
    		onConnect?.(edgeParams);
    	};
    	const onPointerDown = (event) => {
    		if (!nodeId) return;
    		const isMouseTriggered = isMouseEvent(event.nativeEvent);
    		if (isConnectableStart && (isMouseTriggered && event.button === 0 || !isMouseTriggered)) {
    			const currentStore = store.getState();
    			XYHandle.onPointerDown(event.nativeEvent, {
    				handleDomNode: event.currentTarget,
    				autoPanOnConnect: currentStore.autoPanOnConnect,
    				connectionMode: currentStore.connectionMode,
    				connectionRadius: currentStore.connectionRadius,
    				domNode: currentStore.domNode,
    				nodeLookup: currentStore.nodeLookup,
    				lib: currentStore.lib,
    				isTarget,
    				handleId,
    				nodeId,
    				flowId: currentStore.rfId,
    				panBy: currentStore.panBy,
    				cancelConnection: currentStore.cancelConnection,
    				onConnectStart: currentStore.onConnectStart,
    				onConnectEnd: (...args) => store.getState().onConnectEnd?.(...args),
    				updateConnection: currentStore.updateConnection,
    				onConnect: onConnectExtended,
    				isValidConnection: isValidConnection || ((...args) => store.getState().isValidConnection?.(...args) ?? true),
    				getTransform: () => store.getState().transform,
    				getFromHandle: () => store.getState().connection.fromHandle,
    				autoPanSpeed: currentStore.autoPanSpeed,
    				dragThreshold: currentStore.connectionDragThreshold
    			});
    		}
    		if (isMouseTriggered) onMouseDown?.(event);
    		else onTouchStart?.(event);
    	};
    	const onClick = (event) => {
    		const { onClickConnectStart, onClickConnectEnd, connectionClickStartHandle, connectionMode, isValidConnection: isValidConnectionStore, lib, rfId: flowId, nodeLookup, connection: connectionState } = store.getState();
    		if (!nodeId || !connectionClickStartHandle && !isConnectableStart) return;
    		if (!connectionClickStartHandle) {
    			onClickConnectStart?.(event.nativeEvent, {
    				nodeId,
    				handleId,
    				handleType: type
    			});
    			store.setState({ connectionClickStartHandle: {
    				nodeId,
    				type,
    				id: handleId
    			} });
    			return;
    		}
    		const doc = getHostForElement(event.target);
    		const isValidConnectionHandler = isValidConnection || isValidConnectionStore;
    		const { connection, isValid } = XYHandle.isValid(event.nativeEvent, {
    			handle: {
    				nodeId,
    				id: handleId,
    				type
    			},
    			connectionMode,
    			fromNodeId: connectionClickStartHandle.nodeId,
    			fromHandleId: connectionClickStartHandle.id || null,
    			fromType: connectionClickStartHandle.type,
    			isValidConnection: isValidConnectionHandler,
    			flowId,
    			doc,
    			lib,
    			nodeLookup
    		});
    		if (isValid && connection) onConnectExtended(connection);
    		const connectionClone = structuredClone(connectionState);
    		delete connectionClone.inProgress;
    		connectionClone.toPosition = connectionClone.toHandle ? connectionClone.toHandle.position : null;
    		onClickConnectEnd?.(event, connectionClone);
    		store.setState({ connectionClickStartHandle: null });
    	};
    	return (0, react_jsx_runtime.jsx)("div", {
    		"data-handleid": handleId,
    		"data-nodeid": nodeId,
    		"data-handlepos": position,
    		"data-id": `${rfId}-${nodeId}-${handleId}-${type}`,
    		className: cc([
    			"react-flow__handle",
    			`react-flow__handle-${position}`,
    			"nodrag",
    			noPanClassName,
    			className,
    			{
    				source: !isTarget,
    				target: isTarget,
    				connectable: isConnectable,
    				connectablestart: isConnectableStart,
    				connectableend: isConnectableEnd,
    				clickconnecting: clickConnecting,
    				connectingfrom: connectingFrom,
    				connectingto: connectingTo,
    				valid,
    				connectionindicator: isConnectable && (!connectionInProcess || isPossibleEndHandle) && (connectionInProcess || clickConnectionInProcess ? isConnectableEnd : isConnectableStart)
    			}
    		]),
    		onMouseDown: onPointerDown,
    		onTouchStart: onPointerDown,
    		onClick: connectOnClick ? onClick : void 0,
    		ref,
    		...rest,
    		children
    	});
    }
    /**
    * The `<Handle />` component is used in your [custom nodes](/learn/customization/custom-nodes)
    * to define connection points.
    *
    *@public
    *
    *@example
    *
    *```jsx
    *import { Handle, Position } from '@xyflow/react';
    *
    *export function CustomNode({ data }) {
    *  return (
    *    <>
    *      <div style={{ padding: '10px 20px' }}>
    *        {data.label}
    *      </div>
    *
    *      <Handle type="target" position={Position.Left} />
    *      <Handle type="source" position={Position.Right} />
    *    </>
    *  );
    *};
    *```
    */
    const Handle = (0, react.memo)(fixedForwardRef(HandleComponent));
    function InputNode({ data, isConnectable, sourcePosition = Position.Bottom }) {
    	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [data?.label, (0, react_jsx_runtime.jsx)(Handle, {
    		type: "source",
    		position: sourcePosition,
    		isConnectable
    	})] });
    }
    function DefaultNode({ data, isConnectable, targetPosition = Position.Top, sourcePosition = Position.Bottom }) {
    	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
    		(0, react_jsx_runtime.jsx)(Handle, {
    			type: "target",
    			position: targetPosition,
    			isConnectable
    		}),
    		data?.label,
    		(0, react_jsx_runtime.jsx)(Handle, {
    			type: "source",
    			position: sourcePosition,
    			isConnectable
    		})
    	] });
    }
    function GroupNode() {
    	return null;
    }
    function OutputNode({ data, isConnectable, targetPosition = Position.Top }) {
    	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(Handle, {
    		type: "target",
    		position: targetPosition,
    		isConnectable
    	}), data?.label] });
    }
    const arrowKeyDiffs = {
    	ArrowUp: {
    		x: 0,
    		y: -1
    	},
    	ArrowDown: {
    		x: 0,
    		y: 1
    	},
    	ArrowLeft: {
    		x: -1,
    		y: 0
    	},
    	ArrowRight: {
    		x: 1,
    		y: 0
    	}
    };
    const builtinNodeTypes = {
    	input: InputNode,
    	default: DefaultNode,
    	output: OutputNode,
    	group: GroupNode
    };
    function getNodeInlineStyleDimensions(node) {
    	if (node.internals.handleBounds === void 0) return {
    		width: node.width ?? node.initialWidth ?? node.style?.width,
    		height: node.height ?? node.initialHeight ?? node.style?.height
    	};
    	return {
    		width: node.width ?? node.style?.width,
    		height: node.height ?? node.style?.height
    	};
    }
    const selector$e = (s) => {
    	const { width, height, x, y } = getInternalNodesBounds(s.nodeLookup, { filter: (node) => !!node.selected });
    	return {
    		width: isNumeric(width) ? width : null,
    		height: isNumeric(height) ? height : null,
    		userSelectionActive: s.userSelectionActive,
    		transformString: `translate(${s.transform[0]}px,${s.transform[1]}px) scale(${s.transform[2]}) translate(${x}px,${y}px)`
    	};
    };
    function NodesSelection({ onSelectionContextMenu, noPanClassName, disableKeyboardA11y }) {
    	const store = useStoreApi();
    	const { width, height, transformString, userSelectionActive } = useStore(selector$e, shallow$1);
    	const moveSelectedNodes = useMoveSelectedNodes();
    	const nodeRef = (0, react.useRef)(null);
    	(0, react.useEffect)(() => {
    		if (!disableKeyboardA11y) nodeRef.current?.focus({ preventScroll: true });
    	}, [disableKeyboardA11y]);
    	const shouldRender = !userSelectionActive && width !== null && height !== null;
    	useDrag({
    		nodeRef,
    		disabled: !shouldRender
    	});
    	if (!shouldRender) return null;
    	const onContextMenu = onSelectionContextMenu ? (event) => {
    		onSelectionContextMenu(event, store.getState().nodes.filter((n) => n.selected));
    	} : void 0;
    	const onKeyDown = (event) => {
    		if (Object.prototype.hasOwnProperty.call(arrowKeyDiffs, event.key)) {
    			event.preventDefault();
    			moveSelectedNodes({
    				direction: arrowKeyDiffs[event.key],
    				factor: event.shiftKey ? 4 : 1
    			});
    		}
    	};
    	return (0, react_jsx_runtime.jsx)("div", {
    		className: cc([
    			"react-flow__nodesselection",
    			"react-flow__container",
    			noPanClassName
    		]),
    		style: { transform: transformString },
    		children: (0, react_jsx_runtime.jsx)("div", {
    			ref: nodeRef,
    			className: "react-flow__nodesselection-rect",
    			onContextMenu,
    			tabIndex: disableKeyboardA11y ? void 0 : -1,
    			onKeyDown: disableKeyboardA11y ? void 0 : onKeyDown,
    			style: {
    				width,
    				height
    			}
    		})
    	});
    }
    const win = typeof window !== "undefined" ? window : void 0;
    const selector$d = (s) => {
    	return {
    		nodesSelectionActive: s.nodesSelectionActive,
    		userSelectionActive: s.userSelectionActive
    	};
    };
    function FlowRendererComponent({ children, onPaneClick, onPaneMouseEnter, onPaneMouseMove, onPaneMouseLeave, onPaneContextMenu, onPaneScroll, paneClickDistance, deleteKeyCode, selectionKeyCode, selectionOnDrag, selectionMode, onSelectionStart, onSelectionEnd, multiSelectionKeyCode, panActivationKeyCode, zoomActivationKeyCode, elementsSelectable, zoomOnScroll, zoomOnPinch, panOnScroll: _panOnScroll, panOnScrollSpeed, panOnScrollMode, zoomOnDoubleClick, panOnDrag: _panOnDrag, autoPanOnSelection, defaultViewport, translateExtent, minZoom, maxZoom, preventScrolling, onSelectionContextMenu, noWheelClassName, noPanClassName, disableKeyboardA11y, onViewportChange, isControlledViewport }) {
    	const { nodesSelectionActive, userSelectionActive } = useStore(selector$d, shallow$1);
    	const selectionKeyPressed = useKeyPress(selectionKeyCode, { target: win });
    	const panActivationKeyPressed = useKeyPress(panActivationKeyCode, { target: win });
    	const panOnDrag = panActivationKeyPressed || _panOnDrag;
    	const panOnScroll = panActivationKeyPressed || _panOnScroll;
    	const _selectionOnDrag = selectionOnDrag && panOnDrag !== true;
    	const isSelecting = selectionKeyPressed || userSelectionActive || _selectionOnDrag;
    	useGlobalKeyHandler({
    		deleteKeyCode,
    		multiSelectionKeyCode
    	});
    	return (0, react_jsx_runtime.jsx)(ZoomPane, {
    		onPaneContextMenu,
    		elementsSelectable,
    		zoomOnScroll,
    		zoomOnPinch,
    		panOnScroll,
    		panActivationKeyPressed,
    		panOnScrollSpeed,
    		panOnScrollMode,
    		zoomOnDoubleClick,
    		panOnDrag: !selectionKeyPressed && panOnDrag,
    		defaultViewport,
    		translateExtent,
    		minZoom,
    		maxZoom,
    		zoomActivationKeyCode,
    		preventScrolling,
    		noWheelClassName,
    		noPanClassName,
    		onViewportChange,
    		isControlledViewport,
    		paneClickDistance,
    		selectionOnDrag: _selectionOnDrag,
    		children: (0, react_jsx_runtime.jsxs)(Pane, {
    			onSelectionStart,
    			onSelectionEnd,
    			onPaneClick,
    			onPaneMouseEnter,
    			onPaneMouseMove,
    			onPaneMouseLeave,
    			onPaneContextMenu,
    			onPaneScroll,
    			panOnDrag,
    			autoPanOnSelection,
    			isSelecting: !!isSelecting,
    			selectionMode,
    			selectionKeyPressed,
    			paneClickDistance,
    			selectionOnDrag: _selectionOnDrag,
    			children: [children, nodesSelectionActive && (0, react_jsx_runtime.jsx)(NodesSelection, {
    				onSelectionContextMenu,
    				noPanClassName,
    				disableKeyboardA11y
    			})]
    		})
    	});
    }
    FlowRendererComponent.displayName = "FlowRenderer";
    const FlowRenderer = (0, react.memo)(FlowRendererComponent);
    const selector$c = (onlyRenderVisible) => (s) => {
    	return onlyRenderVisible ? getNodesInside(s.nodeLookup, {
    		x: 0,
    		y: 0,
    		width: s.width,
    		height: s.height
    	}, s.transform, true).map((node) => node.id) : Array.from(s.nodeLookup.keys());
    };
    /**
    * Hook for getting the visible node ids from the store.
    *
    * @internal
    * @param onlyRenderVisible
    * @returns array with visible node ids
    */
    function useVisibleNodeIds(onlyRenderVisible) {
    	return useStore((0, react.useCallback)(selector$c(onlyRenderVisible), [onlyRenderVisible]), shallow$1);
    }
    const selector$b = (s) => s.updateNodeInternals;
    function useResizeObserver() {
    	const updateNodeInternals = useStore(selector$b);
    	const [resizeObserver] = (0, react.useState)(() => {
    		if (typeof ResizeObserver === "undefined") return null;
    		return new ResizeObserver((entries) => {
    			const updates = /* @__PURE__ */ new Map();
    			entries.forEach((entry) => {
    				const id = entry.target.getAttribute("data-id");
    				updates.set(id, {
    					id,
    					nodeElement: entry.target,
    					force: true
    				});
    			});
    			updateNodeInternals(updates);
    		});
    	});
    	(0, react.useEffect)(() => {
    		return () => {
    			resizeObserver?.disconnect();
    		};
    	}, [resizeObserver]);
    	return resizeObserver;
    }
    /**
    * Hook to handle the resize observation + internal updates for the passed node.
    *
    * @internal
    * @returns nodeRef - reference to the node element
    */
    function useNodeObserver({ node, nodeType, hasDimensions, resizeObserver }) {
    	const store = useStoreApi();
    	const nodeRef = (0, react.useRef)(null);
    	const observedNode = (0, react.useRef)(null);
    	const prevSourcePosition = (0, react.useRef)(node.sourcePosition);
    	const prevTargetPosition = (0, react.useRef)(node.targetPosition);
    	const prevType = (0, react.useRef)(nodeType);
    	const isInitialized = hasDimensions && !!node.internals.handleBounds;
    	(0, react.useEffect)(() => {
    		if (nodeRef.current && !node.hidden && (!isInitialized || observedNode.current !== nodeRef.current)) {
    			if (observedNode.current) resizeObserver?.unobserve(observedNode.current);
    			resizeObserver?.observe(nodeRef.current);
    			observedNode.current = nodeRef.current;
    		}
    	}, [isInitialized, node.hidden]);
    	(0, react.useEffect)(() => {
    		return () => {
    			if (observedNode.current) {
    				resizeObserver?.unobserve(observedNode.current);
    				observedNode.current = null;
    			}
    		};
    	}, []);
    	(0, react.useEffect)(() => {
    		if (nodeRef.current) {
    			const typeChanged = prevType.current !== nodeType;
    			const sourcePosChanged = prevSourcePosition.current !== node.sourcePosition;
    			const targetPosChanged = prevTargetPosition.current !== node.targetPosition;
    			if (typeChanged || sourcePosChanged || targetPosChanged) {
    				prevType.current = nodeType;
    				prevSourcePosition.current = node.sourcePosition;
    				prevTargetPosition.current = node.targetPosition;
    				store.getState().updateNodeInternals(/* @__PURE__ */ new Map([[node.id, {
    					id: node.id,
    					nodeElement: nodeRef.current,
    					force: true
    				}]]));
    			}
    		}
    	}, [
    		node.id,
    		nodeType,
    		node.sourcePosition,
    		node.targetPosition
    	]);
    	return nodeRef;
    }
    function NodeWrapper({ id, onClick, onMouseEnter, onMouseMove, onMouseLeave, onContextMenu, onDoubleClick, nodesDraggable, elementsSelectable, nodesConnectable, nodesFocusable, resizeObserver, noDragClassName, noPanClassName, disableKeyboardA11y, rfId, nodeTypes, nodeClickDistance, onError }) {
    	const { node, internals, isParent } = useStore((s) => {
    		const node = s.nodeLookup.get(id);
    		const isParent = s.parentLookup.has(id);
    		return {
    			node,
    			internals: node.internals,
    			isParent
    		};
    	}, shallow$1);
    	let nodeType = node.type || "default";
    	let NodeComponent = nodeTypes?.[nodeType] || builtinNodeTypes[nodeType];
    	if (NodeComponent === void 0) {
    		onError?.("003", errorMessages["error003"](nodeType));
    		nodeType = "default";
    		NodeComponent = nodeTypes?.["default"] || builtinNodeTypes.default;
    	}
    	const isDraggable = !!(node.draggable || nodesDraggable && typeof node.draggable === "undefined");
    	const isSelectable = !!(node.selectable || elementsSelectable && typeof node.selectable === "undefined");
    	const isConnectable = !!(node.connectable || nodesConnectable && typeof node.connectable === "undefined");
    	const isFocusable = !!(node.focusable || nodesFocusable && typeof node.focusable === "undefined");
    	const store = useStoreApi();
    	const hasDimensions = nodeHasDimensions(node);
    	const nodeRef = useNodeObserver({
    		node,
    		nodeType,
    		hasDimensions,
    		resizeObserver
    	});
    	const dragging = useDrag({
    		nodeRef,
    		disabled: node.hidden || !isDraggable,
    		noDragClassName,
    		handleSelector: node.dragHandle,
    		nodeId: id,
    		isSelectable,
    		nodeClickDistance
    	});
    	const moveSelectedNodes = useMoveSelectedNodes();
    	if (node.hidden) return null;
    	const nodeDimensions = getNodeDimensions(node);
    	const inlineDimensions = getNodeInlineStyleDimensions(node);
    	const hasPointerEvents = isSelectable || isDraggable || onClick || onMouseEnter || onMouseMove || onMouseLeave;
    	const onMouseEnterHandler = onMouseEnter ? (event) => onMouseEnter(event, { ...internals.userNode }) : void 0;
    	const onMouseMoveHandler = onMouseMove ? (event) => onMouseMove(event, { ...internals.userNode }) : void 0;
    	const onMouseLeaveHandler = onMouseLeave ? (event) => onMouseLeave(event, { ...internals.userNode }) : void 0;
    	const onContextMenuHandler = onContextMenu ? (event) => onContextMenu(event, { ...internals.userNode }) : void 0;
    	const onDoubleClickHandler = onDoubleClick ? (event) => onDoubleClick(event, { ...internals.userNode }) : void 0;
    	const onSelectNodeHandler = (event) => {
    		const { selectNodesOnDrag, nodeDragThreshold } = store.getState();
    		if (isSelectable && (!selectNodesOnDrag || !isDraggable || nodeDragThreshold > 0)) handleNodeClick({
    			id,
    			store,
    			nodeRef
    		});
    		if (onClick) onClick(event, { ...internals.userNode });
    	};
    	const onKeyDown = (event) => {
    		if (isInputDOMNode(event.nativeEvent) || disableKeyboardA11y) return;
    		if (elementSelectionKeys.includes(event.key) && isSelectable) {
    			const unselect = event.key === "Escape";
    			handleNodeClick({
    				id,
    				store,
    				unselect,
    				nodeRef
    			});
    		} else if (isDraggable && node.selected && Object.prototype.hasOwnProperty.call(arrowKeyDiffs, event.key)) {
    			event.preventDefault();
    			const { ariaLabelConfig } = store.getState();
    			store.setState({ ariaLiveMessage: ariaLabelConfig["node.a11yDescription.ariaLiveMessage"]({
    				direction: event.key.replace("Arrow", "").toLowerCase(),
    				x: ~~internals.positionAbsolute.x,
    				y: ~~internals.positionAbsolute.y
    			}) });
    			moveSelectedNodes({
    				direction: arrowKeyDiffs[event.key],
    				factor: event.shiftKey ? 4 : 1
    			});
    		}
    	};
    	const onFocus = () => {
    		if (disableKeyboardA11y || !nodeRef.current?.matches(":focus-visible")) return;
    		const { transform, width, height, autoPanOnNodeFocus, setCenter } = store.getState();
    		if (!autoPanOnNodeFocus) return;
    		if (!(getNodesInside(/* @__PURE__ */ new Map([[id, node]]), {
    			x: 0,
    			y: 0,
    			width,
    			height
    		}, transform, true).length > 0)) setCenter(node.position.x + nodeDimensions.width / 2, node.position.y + nodeDimensions.height / 2, { zoom: transform[2] });
    	};
    	return (0, react_jsx_runtime.jsx)("div", {
    		className: cc([
    			"react-flow__node",
    			`react-flow__node-${nodeType}`,
    			{ [noPanClassName]: isDraggable },
    			node.className,
    			{
    				selected: node.selected,
    				selectable: isSelectable,
    				parent: isParent,
    				draggable: isDraggable,
    				dragging
    			}
    		]),
    		ref: nodeRef,
    		style: {
    			zIndex: internals.z,
    			transform: `translate(${internals.positionAbsolute.x}px,${internals.positionAbsolute.y}px)`,
    			pointerEvents: hasPointerEvents ? "all" : "none",
    			visibility: hasDimensions ? "visible" : "hidden",
    			...node.style,
    			...inlineDimensions
    		},
    		"data-id": id,
    		"data-testid": `rf__node-${id}`,
    		onMouseEnter: onMouseEnterHandler,
    		onMouseMove: onMouseMoveHandler,
    		onMouseLeave: onMouseLeaveHandler,
    		onContextMenu: onContextMenuHandler,
    		onClick: onSelectNodeHandler,
    		onDoubleClick: onDoubleClickHandler,
    		onKeyDown: isFocusable ? onKeyDown : void 0,
    		tabIndex: isFocusable ? 0 : void 0,
    		onFocus: isFocusable ? onFocus : void 0,
    		role: node.ariaRole ?? (isFocusable ? "group" : void 0),
    		"aria-roledescription": "node",
    		"aria-describedby": disableKeyboardA11y ? void 0 : `${ARIA_NODE_DESC_KEY}-${rfId}`,
    		"aria-label": node.ariaLabel,
    		...node.domAttributes,
    		children: (0, react_jsx_runtime.jsx)(Provider, {
    			value: id,
    			children: (0, react_jsx_runtime.jsx)(NodeComponent, {
    				id,
    				data: node.data,
    				type: nodeType,
    				positionAbsoluteX: internals.positionAbsolute.x,
    				positionAbsoluteY: internals.positionAbsolute.y,
    				selected: node.selected ?? false,
    				selectable: isSelectable,
    				draggable: isDraggable,
    				deletable: node.deletable ?? true,
    				isConnectable,
    				sourcePosition: node.sourcePosition,
    				targetPosition: node.targetPosition,
    				dragging,
    				dragHandle: node.dragHandle,
    				zIndex: internals.z,
    				parentId: node.parentId,
    				...nodeDimensions
    			})
    		})
    	});
    }
    var NodeWrapper$1 = (0, react.memo)(NodeWrapper);
    const selector$a = (s) => ({
    	nodesConnectable: s.nodesConnectable,
    	nodesFocusable: s.nodesFocusable,
    	elementsSelectable: s.elementsSelectable,
    	onError: s.onError
    });
    function NodeRendererComponent(props) {
    	const { nodesConnectable, nodesFocusable, elementsSelectable, onError } = useStore(selector$a, shallow$1);
    	const nodeIds = useVisibleNodeIds(props.onlyRenderVisibleElements);
    	const resizeObserver = useResizeObserver();
    	return (0, react_jsx_runtime.jsx)("div", {
    		className: "react-flow__nodes",
    		style: containerStyle,
    		children: nodeIds.map((nodeId) => {
    			return (0, react_jsx_runtime.jsx)(NodeWrapper$1, {
    				id: nodeId,
    				nodeTypes: props.nodeTypes,
    				nodeExtent: props.nodeExtent,
    				onClick: props.onNodeClick,
    				onMouseEnter: props.onNodeMouseEnter,
    				onMouseMove: props.onNodeMouseMove,
    				onMouseLeave: props.onNodeMouseLeave,
    				onContextMenu: props.onNodeContextMenu,
    				onDoubleClick: props.onNodeDoubleClick,
    				noDragClassName: props.noDragClassName,
    				noPanClassName: props.noPanClassName,
    				rfId: props.rfId,
    				disableKeyboardA11y: props.disableKeyboardA11y,
    				resizeObserver,
    				nodesDraggable: props.nodesDraggable ?? true,
    				nodesConnectable,
    				nodesFocusable,
    				elementsSelectable,
    				nodeClickDistance: props.nodeClickDistance,
    				onError
    			}, nodeId);
    		})
    	});
    }
    NodeRendererComponent.displayName = "NodeRenderer";
    const NodeRenderer = (0, react.memo)(NodeRendererComponent);
    /**
    * Hook for getting the visible edge ids from the store.
    *
    * @internal
    * @param onlyRenderVisible
    * @returns array with visible edge ids
    */
    function useVisibleEdgeIds(onlyRenderVisible) {
    	return useStore((0, react.useCallback)((s) => {
    		if (!onlyRenderVisible) return s.edges.map((edge) => edge.id);
    		const visibleEdgeIds = [];
    		if (s.width && s.height) for (const edge of s.edges) {
    			const sourceNode = s.nodeLookup.get(edge.source);
    			const targetNode = s.nodeLookup.get(edge.target);
    			if (sourceNode && targetNode && isEdgeVisible({
    				sourceNode,
    				targetNode,
    				width: s.width,
    				height: s.height,
    				transform: s.transform
    			})) visibleEdgeIds.push(edge.id);
    		}
    		return visibleEdgeIds;
    	}, [onlyRenderVisible]), shallow$1);
    }
    const ArrowSymbol = ({ color = "none", strokeWidth = 1 }) => {
    	const style = {
    		strokeWidth,
    		...color && { stroke: color }
    	};
    	return (0, react_jsx_runtime.jsx)("polyline", {
    		className: "arrow",
    		style,
    		strokeLinecap: "round",
    		fill: "none",
    		strokeLinejoin: "round",
    		points: "-5,-4 0,0 -5,4"
    	});
    };
    const ArrowClosedSymbol = ({ color = "none", strokeWidth = 1 }) => {
    	const style = {
    		strokeWidth,
    		...color && {
    			stroke: color,
    			fill: color
    		}
    	};
    	return (0, react_jsx_runtime.jsx)("polyline", {
    		className: "arrowclosed",
    		style,
    		strokeLinecap: "round",
    		strokeLinejoin: "round",
    		points: "-5,-4 0,0 -5,4 -5,-4"
    	});
    };
    const MarkerSymbols = {
    	[MarkerType.Arrow]: ArrowSymbol,
    	[MarkerType.ArrowClosed]: ArrowClosedSymbol
    };
    function useMarkerSymbol(type) {
    	const store = useStoreApi();
    	return (0, react.useMemo)(() => {
    		if (!Object.prototype.hasOwnProperty.call(MarkerSymbols, type)) {
    			store.getState().onError?.("009", errorMessages["error009"](type));
    			return null;
    		}
    		return MarkerSymbols[type];
    	}, [type]);
    }
    const Marker = ({ id, type, color, width = 12.5, height = 12.5, markerUnits = "strokeWidth", strokeWidth, orient = "auto-start-reverse" }) => {
    	const Symbol = useMarkerSymbol(type);
    	if (!Symbol) return null;
    	return (0, react_jsx_runtime.jsx)("marker", {
    		className: "react-flow__arrowhead",
    		id,
    		markerWidth: `${width}`,
    		markerHeight: `${height}`,
    		viewBox: "-10 -10 20 20",
    		markerUnits,
    		orient,
    		refX: "0",
    		refY: "0",
    		children: (0, react_jsx_runtime.jsx)(Symbol, {
    			color,
    			strokeWidth
    		})
    	});
    };
    const MarkerDefinitions = ({ defaultColor, rfId }) => {
    	const edges = useStore((s) => s.edges);
    	const defaultEdgeOptions = useStore((s) => s.defaultEdgeOptions);
    	const markers = (0, react.useMemo)(() => {
    		return createMarkerIds(edges, {
    			id: rfId,
    			defaultColor,
    			defaultMarkerStart: defaultEdgeOptions?.markerStart,
    			defaultMarkerEnd: defaultEdgeOptions?.markerEnd
    		});
    	}, [
    		edges,
    		defaultEdgeOptions,
    		rfId,
    		defaultColor
    	]);
    	if (!markers.length) return null;
    	return (0, react_jsx_runtime.jsx)("svg", {
    		className: "react-flow__marker",
    		"aria-hidden": "true",
    		children: (0, react_jsx_runtime.jsx)("defs", { children: markers.map((marker) => (0, react_jsx_runtime.jsx)(Marker, {
    			id: marker.id,
    			type: marker.type,
    			color: marker.color,
    			width: marker.width,
    			height: marker.height,
    			markerUnits: marker.markerUnits,
    			strokeWidth: marker.strokeWidth,
    			orient: marker.orient
    		}, marker.id)) })
    	});
    };
    MarkerDefinitions.displayName = "MarkerDefinitions";
    var MarkerDefinitions$1 = (0, react.memo)(MarkerDefinitions);
    function EdgeTextComponent({ x, y, label, labelStyle, labelShowBg = true, labelBgStyle, labelBgPadding = [2, 4], labelBgBorderRadius = 2, children, className, ...rest }) {
    	const [edgeTextBbox, setEdgeTextBbox] = (0, react.useState)({
    		x: 1,
    		y: 0,
    		width: 0,
    		height: 0
    	});
    	const edgeTextClasses = cc(["react-flow__edge-textwrapper", className]);
    	const edgeTextRef = (0, react.useRef)(null);
    	(0, react.useEffect)(() => {
    		if (edgeTextRef.current) {
    			const textBbox = edgeTextRef.current.getBBox();
    			setEdgeTextBbox({
    				x: textBbox.x,
    				y: textBbox.y,
    				width: textBbox.width,
    				height: textBbox.height
    			});
    		}
    	}, [label]);
    	if (!label) return null;
    	return (0, react_jsx_runtime.jsxs)("g", {
    		transform: `translate(${x - edgeTextBbox.width / 2} ${y - edgeTextBbox.height / 2})`,
    		className: edgeTextClasses,
    		visibility: edgeTextBbox.width ? "visible" : "hidden",
    		...rest,
    		children: [
    			labelShowBg && (0, react_jsx_runtime.jsx)("rect", {
    				width: edgeTextBbox.width + 2 * labelBgPadding[0],
    				x: -labelBgPadding[0],
    				y: -labelBgPadding[1],
    				height: edgeTextBbox.height + 2 * labelBgPadding[1],
    				className: "react-flow__edge-textbg",
    				style: labelBgStyle,
    				rx: labelBgBorderRadius,
    				ry: labelBgBorderRadius
    			}),
    			(0, react_jsx_runtime.jsx)("text", {
    				className: "react-flow__edge-text",
    				y: edgeTextBbox.height / 2,
    				dy: "0.3em",
    				ref: edgeTextRef,
    				style: labelStyle,
    				children: label
    			}),
    			children
    		]
    	});
    }
    EdgeTextComponent.displayName = "EdgeText";
    /**
    * You can use the `<EdgeText />` component as a helper component to display text
    * within your custom edges.
    *
    * @public
    *
    * @example
    * ```jsx
    * import { EdgeText } from '@xyflow/react';
    *
    * export function CustomEdgeLabel({ label }) {
    *   return (
    *     <EdgeText
    *       x={100}
    *       y={100}
    *       label={label}
    *       labelStyle={{ fill: 'white' }}
    *       labelShowBg
    *       labelBgStyle={{ fill: 'red' }}
    *       labelBgPadding={[2, 4]}
    *       labelBgBorderRadius={2}
    *     />
    *   );
    * }
    *```
    */
    const EdgeText = (0, react.memo)(EdgeTextComponent);
    /**
    * The `<BaseEdge />` component gets used internally for all the edges. It can be
    * used inside a custom edge and handles the invisible helper edge and the edge label
    * for you.
    *
    * @public
    * @example
    * ```jsx
    *import { BaseEdge } from '@xyflow/react';
    *
    *export function CustomEdge({ sourceX, sourceY, targetX, targetY, ...props }) {
    *  const [edgePath] = getStraightPath({
    *    sourceX,
    *    sourceY,
    *    targetX,
    *    targetY,
    *  });
    *
    *  return <BaseEdge path={edgePath} {...props} />;
    *}
    *```
    *
    * @remarks If you want to use an edge marker with the [`<BaseEdge />`](/api-reference/components/base-edge) component,
    * you can pass the `markerStart` or `markerEnd` props passed to your custom edge
    * through to the [`<BaseEdge />`](/api-reference/components/base-edge) component.
    * You can see all the props passed to a custom edge by looking at the [`EdgeProps`](/api-reference/types/edge-props) type.
    */
    function BaseEdge({ path, labelX, labelY, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, interactionWidth = 20, ...props }) {
    	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
    		(0, react_jsx_runtime.jsx)("path", {
    			...props,
    			d: path,
    			fill: "none",
    			className: cc(["react-flow__edge-path", props.className])
    		}),
    		interactionWidth ? (0, react_jsx_runtime.jsx)("path", {
    			d: path,
    			fill: "none",
    			strokeOpacity: 0,
    			strokeWidth: interactionWidth,
    			className: "react-flow__edge-interaction"
    		}) : null,
    		label && isNumeric(labelX) && isNumeric(labelY) ? (0, react_jsx_runtime.jsx)(EdgeText, {
    			x: labelX,
    			y: labelY,
    			label,
    			labelStyle,
    			labelShowBg,
    			labelBgStyle,
    			labelBgPadding,
    			labelBgBorderRadius
    		}) : null
    	] });
    }
    function getControl({ pos, x1, y1, x2, y2 }) {
    	if (pos === Position.Left || pos === Position.Right) return [.5 * (x1 + x2), y1];
    	return [x1, .5 * (y1 + y2)];
    }
    /**
    * The `getSimpleBezierPath` util returns everything you need to render a simple
    * bezier edge between two nodes.
    * @public
    * @returns
    * - `path`: the path to use in an SVG `<path>` element.
    * - `labelX`: the `x` position you can use to render a label for this edge.
    * - `labelY`: the `y` position you can use to render a label for this edge.
    * - `offsetX`: the absolute difference between the source `x` position and the `x` position of the
    * middle of this path.
    * - `offsetY`: the absolute difference between the source `y` position and the `y` position of the
    * middle of this path.
    */
    function getSimpleBezierPath({ sourceX, sourceY, sourcePosition = Position.Bottom, targetX, targetY, targetPosition = Position.Top }) {
    	const [sourceControlX, sourceControlY] = getControl({
    		pos: sourcePosition,
    		x1: sourceX,
    		y1: sourceY,
    		x2: targetX,
    		y2: targetY
    	});
    	const [targetControlX, targetControlY] = getControl({
    		pos: targetPosition,
    		x1: targetX,
    		y1: targetY,
    		x2: sourceX,
    		y2: sourceY
    	});
    	const [labelX, labelY, offsetX, offsetY] = getBezierEdgeCenter({
    		sourceX,
    		sourceY,
    		targetX,
    		targetY,
    		sourceControlX,
    		sourceControlY,
    		targetControlX,
    		targetControlY
    	});
    	return [
    		`M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`,
    		labelX,
    		labelY,
    		offsetX,
    		offsetY
    	];
    }
    function createSimpleBezierEdge(params) {
    	return (0, react.memo)(({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style, markerEnd, markerStart, interactionWidth }) => {
    		const [path, labelX, labelY] = getSimpleBezierPath({
    			sourceX,
    			sourceY,
    			sourcePosition,
    			targetX,
    			targetY,
    			targetPosition
    		});
    		const _id = params.isInternal ? void 0 : id;
    		return (0, react_jsx_runtime.jsx)(BaseEdge, {
    			id: _id,
    			path,
    			labelX,
    			labelY,
    			label,
    			labelStyle,
    			labelShowBg,
    			labelBgStyle,
    			labelBgPadding,
    			labelBgBorderRadius,
    			style,
    			markerEnd,
    			markerStart,
    			interactionWidth
    		});
    	});
    }
    const SimpleBezierEdge = createSimpleBezierEdge({ isInternal: false });
    const SimpleBezierEdgeInternal = createSimpleBezierEdge({ isInternal: true });
    SimpleBezierEdge.displayName = "SimpleBezierEdge";
    SimpleBezierEdgeInternal.displayName = "SimpleBezierEdgeInternal";
    function createSmoothStepEdge(params) {
    	return (0, react.memo)(({ id, sourceX, sourceY, targetX, targetY, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style, sourcePosition = Position.Bottom, targetPosition = Position.Top, markerEnd, markerStart, pathOptions, interactionWidth }) => {
    		const [path, labelX, labelY] = getSmoothStepPath({
    			sourceX,
    			sourceY,
    			sourcePosition,
    			targetX,
    			targetY,
    			targetPosition,
    			borderRadius: pathOptions?.borderRadius,
    			offset: pathOptions?.offset,
    			stepPosition: pathOptions?.stepPosition
    		});
    		const _id = params.isInternal ? void 0 : id;
    		return (0, react_jsx_runtime.jsx)(BaseEdge, {
    			id: _id,
    			path,
    			labelX,
    			labelY,
    			label,
    			labelStyle,
    			labelShowBg,
    			labelBgStyle,
    			labelBgPadding,
    			labelBgBorderRadius,
    			style,
    			markerEnd,
    			markerStart,
    			interactionWidth
    		});
    	});
    }
    /**
    * Component that can be used inside a custom edge to render a smooth step edge.
    *
    * @public
    * @example
    *
    * ```tsx
    * import { SmoothStepEdge } from '@xyflow/react';
    *
    * function CustomEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }) {
    *   return (
    *     <SmoothStepEdge
    *       sourceX={sourceX}
    *       sourceY={sourceY}
    *       targetX={targetX}
    *       targetY={targetY}
    *       sourcePosition={sourcePosition}
    *       targetPosition={targetPosition}
    *     />
    *   );
    * }
    * ```
    */
    const SmoothStepEdge = createSmoothStepEdge({ isInternal: false });
    /**
    * @internal
    */
    const SmoothStepEdgeInternal = createSmoothStepEdge({ isInternal: true });
    SmoothStepEdge.displayName = "SmoothStepEdge";
    SmoothStepEdgeInternal.displayName = "SmoothStepEdgeInternal";
    function createStepEdge(params) {
    	return (0, react.memo)(({ id, ...props }) => {
    		const _id = params.isInternal ? void 0 : id;
    		return (0, react_jsx_runtime.jsx)(SmoothStepEdge, {
    			...props,
    			id: _id,
    			pathOptions: (0, react.useMemo)(() => ({
    				borderRadius: 0,
    				offset: props.pathOptions?.offset
    			}), [props.pathOptions?.offset])
    		});
    	});
    }
    /**
    * Component that can be used inside a custom edge to render a step edge.
    *
    * @public
    * @example
    *
    * ```tsx
    * import { StepEdge } from '@xyflow/react';
    *
    * function CustomEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }) {
    *   return (
    *     <StepEdge
    *       sourceX={sourceX}
    *       sourceY={sourceY}
    *       targetX={targetX}
    *       targetY={targetY}
    *       sourcePosition={sourcePosition}
    *       targetPosition={targetPosition}
    *     />
    *   );
    * }
    * ```
    */
    const StepEdge = createStepEdge({ isInternal: false });
    /**
    * @internal
    */
    const StepEdgeInternal = createStepEdge({ isInternal: true });
    StepEdge.displayName = "StepEdge";
    StepEdgeInternal.displayName = "StepEdgeInternal";
    function createStraightEdge(params) {
    	return (0, react.memo)(({ id, sourceX, sourceY, targetX, targetY, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style, markerEnd, markerStart, interactionWidth }) => {
    		const [path, labelX, labelY] = getStraightPath({
    			sourceX,
    			sourceY,
    			targetX,
    			targetY
    		});
    		const _id = params.isInternal ? void 0 : id;
    		return (0, react_jsx_runtime.jsx)(BaseEdge, {
    			id: _id,
    			path,
    			labelX,
    			labelY,
    			label,
    			labelStyle,
    			labelShowBg,
    			labelBgStyle,
    			labelBgPadding,
    			labelBgBorderRadius,
    			style,
    			markerEnd,
    			markerStart,
    			interactionWidth
    		});
    	});
    }
    /**
    * Component that can be used inside a custom edge to render a straight line.
    *
    * @public
    * @example
    *
    * ```tsx
    * import { StraightEdge } from '@xyflow/react';
    *
    * function CustomEdge({ sourceX, sourceY, targetX, targetY }) {
    *   return (
    *     <StraightEdge
    *       sourceX={sourceX}
    *       sourceY={sourceY}
    *       targetX={targetX}
    *       targetY={targetY}
    *     />
    *   );
    * }
    * ```
    */
    const StraightEdge = createStraightEdge({ isInternal: false });
    /**
    * @internal
    */
    const StraightEdgeInternal = createStraightEdge({ isInternal: true });
    StraightEdge.displayName = "StraightEdge";
    StraightEdgeInternal.displayName = "StraightEdgeInternal";
    function createBezierEdge(params) {
    	return (0, react.memo)(({ id, sourceX, sourceY, targetX, targetY, sourcePosition = Position.Bottom, targetPosition = Position.Top, label, labelStyle, labelShowBg, labelBgStyle, labelBgPadding, labelBgBorderRadius, style, markerEnd, markerStart, pathOptions, interactionWidth }) => {
    		const [path, labelX, labelY] = getBezierPath({
    			sourceX,
    			sourceY,
    			sourcePosition,
    			targetX,
    			targetY,
    			targetPosition,
    			curvature: pathOptions?.curvature
    		});
    		const _id = params.isInternal ? void 0 : id;
    		return (0, react_jsx_runtime.jsx)(BaseEdge, {
    			id: _id,
    			path,
    			labelX,
    			labelY,
    			label,
    			labelStyle,
    			labelShowBg,
    			labelBgStyle,
    			labelBgPadding,
    			labelBgBorderRadius,
    			style,
    			markerEnd,
    			markerStart,
    			interactionWidth
    		});
    	});
    }
    /**
    * Component that can be used inside a custom edge to render a bezier curve.
    *
    * @public
    * @example
    *
    * ```tsx
    * import { BezierEdge } from '@xyflow/react';
    *
    * function CustomEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }) {
    *   return (
    *     <BezierEdge
    *       sourceX={sourceX}
    *       sourceY={sourceY}
    *       targetX={targetX}
    *       targetY={targetY}
    *       sourcePosition={sourcePosition}
    *       targetPosition={targetPosition}
    *     />
    *   );
    * }
    * ```
    */
    const BezierEdge = createBezierEdge({ isInternal: false });
    /**
    * @internal
    */
    const BezierEdgeInternal = createBezierEdge({ isInternal: true });
    BezierEdge.displayName = "BezierEdge";
    BezierEdgeInternal.displayName = "BezierEdgeInternal";
    const builtinEdgeTypes = {
    	default: BezierEdgeInternal,
    	straight: StraightEdgeInternal,
    	step: StepEdgeInternal,
    	smoothstep: SmoothStepEdgeInternal,
    	simplebezier: SimpleBezierEdgeInternal
    };
    const nullPosition = {
    	sourceX: null,
    	sourceY: null,
    	targetX: null,
    	targetY: null,
    	sourcePosition: null,
    	targetPosition: null,
    	zIndex: void 0
    };
    const shiftX = (x, shift, position) => {
    	if (position === Position.Left) return x - shift;
    	if (position === Position.Right) return x + shift;
    	return x;
    };
    const shiftY = (y, shift, position) => {
    	if (position === Position.Top) return y - shift;
    	if (position === Position.Bottom) return y + shift;
    	return y;
    };
    const EdgeUpdaterClassName = "react-flow__edgeupdater";
    /**
    * @internal
    */
    function EdgeAnchor({ position, centerX, centerY, radius = 10, onMouseDown, onMouseEnter, onMouseOut, type }) {
    	return (0, react_jsx_runtime.jsx)("circle", {
    		onMouseDown,
    		onMouseEnter,
    		onMouseOut,
    		className: cc([EdgeUpdaterClassName, `${EdgeUpdaterClassName}-${type}`]),
    		cx: shiftX(centerX, radius, position),
    		cy: shiftY(centerY, radius, position),
    		r: radius,
    		stroke: "transparent",
    		fill: "transparent"
    	});
    }
    function EdgeUpdateAnchors({ isReconnectable, reconnectRadius, edge, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, onReconnect, onReconnectStart, onReconnectEnd, setReconnecting, setUpdateHover }) {
    	const store = useStoreApi();
    	const handleEdgeUpdater = (event, oppositeHandle) => {
    		if (event.button !== 0) return;
    		const { autoPanOnConnect, domNode, connectionMode, connectionRadius, lib, onConnectStart, cancelConnection, nodeLookup, rfId: flowId, panBy, updateConnection } = store.getState();
    		const isTarget = oppositeHandle.type === "target";
    		const _onReconnectEnd = (evt, connectionState) => {
    			setReconnecting(false);
    			onReconnectEnd?.(evt, edge, oppositeHandle.type, connectionState);
    		};
    		const onConnectEdge = (connection) => onReconnect?.(edge, connection);
    		const _onConnectStart = (_event, params) => {
    			setReconnecting(true);
    			onReconnectStart?.(event, edge, oppositeHandle.type);
    			onConnectStart?.(_event, params);
    		};
    		XYHandle.onPointerDown(event.nativeEvent, {
    			autoPanOnConnect,
    			connectionMode,
    			connectionRadius,
    			domNode,
    			handleId: oppositeHandle.id,
    			nodeId: oppositeHandle.nodeId,
    			nodeLookup,
    			isTarget,
    			edgeUpdaterType: oppositeHandle.type,
    			lib,
    			flowId,
    			cancelConnection,
    			panBy,
    			isValidConnection: (...args) => store.getState().isValidConnection?.(...args) ?? true,
    			onConnect: onConnectEdge,
    			onConnectStart: _onConnectStart,
    			onConnectEnd: (...args) => store.getState().onConnectEnd?.(...args),
    			onReconnectEnd: _onReconnectEnd,
    			updateConnection,
    			getTransform: () => store.getState().transform,
    			getFromHandle: () => store.getState().connection.fromHandle,
    			dragThreshold: store.getState().connectionDragThreshold,
    			handleDomNode: event.currentTarget
    		});
    	};
    	const onReconnectSourceMouseDown = (event) => handleEdgeUpdater(event, {
    		nodeId: edge.target,
    		id: edge.targetHandle ?? null,
    		type: "target"
    	});
    	const onReconnectTargetMouseDown = (event) => handleEdgeUpdater(event, {
    		nodeId: edge.source,
    		id: edge.sourceHandle ?? null,
    		type: "source"
    	});
    	const onReconnectMouseEnter = () => setUpdateHover(true);
    	const onReconnectMouseOut = () => setUpdateHover(false);
    	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(isReconnectable === true || isReconnectable === "source") && (0, react_jsx_runtime.jsx)(EdgeAnchor, {
    		position: sourcePosition,
    		centerX: sourceX,
    		centerY: sourceY,
    		radius: reconnectRadius,
    		onMouseDown: onReconnectSourceMouseDown,
    		onMouseEnter: onReconnectMouseEnter,
    		onMouseOut: onReconnectMouseOut,
    		type: "source"
    	}), (isReconnectable === true || isReconnectable === "target") && (0, react_jsx_runtime.jsx)(EdgeAnchor, {
    		position: targetPosition,
    		centerX: targetX,
    		centerY: targetY,
    		radius: reconnectRadius,
    		onMouseDown: onReconnectTargetMouseDown,
    		onMouseEnter: onReconnectMouseEnter,
    		onMouseOut: onReconnectMouseOut,
    		type: "target"
    	})] });
    }
    function EdgeWrapper({ id, edgesFocusable, edgesReconnectable, elementsSelectable, onClick, onDoubleClick, onContextMenu, onMouseEnter, onMouseMove, onMouseLeave, reconnectRadius, onReconnect, onReconnectStart, onReconnectEnd, rfId, edgeTypes, noPanClassName, onError, disableKeyboardA11y }) {
    	let edge = useStore((s) => s.edgeLookup.get(id));
    	const defaultEdgeOptions = useStore((s) => s.defaultEdgeOptions);
    	edge = defaultEdgeOptions ? {
    		...defaultEdgeOptions,
    		...edge
    	} : edge;
    	let edgeType = edge.type || "default";
    	let EdgeComponent = edgeTypes?.[edgeType] || builtinEdgeTypes[edgeType];
    	if (EdgeComponent === void 0) {
    		onError?.("011", errorMessages["error011"](edgeType));
    		edgeType = "default";
    		EdgeComponent = edgeTypes?.["default"] || builtinEdgeTypes.default;
    	}
    	const isFocusable = !!(edge.focusable || edgesFocusable && typeof edge.focusable === "undefined");
    	const isReconnectable = typeof onReconnect !== "undefined" && (edge.reconnectable || edgesReconnectable && typeof edge.reconnectable === "undefined");
    	const isSelectable = !!(edge.selectable || elementsSelectable && typeof edge.selectable === "undefined");
    	const edgeRef = (0, react.useRef)(null);
    	const [updateHover, setUpdateHover] = (0, react.useState)(false);
    	const [reconnecting, setReconnecting] = (0, react.useState)(false);
    	const store = useStoreApi();
    	const { zIndex = edge.zIndex, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = useStore((0, react.useCallback)((store) => {
    		const sourceNode = store.nodeLookup.get(edge.source);
    		const targetNode = store.nodeLookup.get(edge.target);
    		if (!sourceNode || !targetNode) return nullPosition;
    		const edgePosition = getEdgePosition({
    			id,
    			sourceNode,
    			targetNode,
    			sourceHandle: edge.sourceHandle || null,
    			targetHandle: edge.targetHandle || null,
    			connectionMode: store.connectionMode,
    			onError
    		});
    		const zIndex = getElevatedEdgeZIndex({
    			selected: edge.selected,
    			zIndex: edge.zIndex,
    			sourceNode,
    			targetNode,
    			elevateOnSelect: store.elevateEdgesOnSelect,
    			zIndexMode: store.zIndexMode
    		});
    		return {
    			...edgePosition || nullPosition,
    			zIndex
    		};
    	}, [
    		edge.source,
    		edge.target,
    		edge.sourceHandle,
    		edge.targetHandle,
    		edge.selected,
    		edge.zIndex,
    		onError
    	]), shallow$1);
    	const markerStartUrl = (0, react.useMemo)(() => edge.markerStart ? `url('#${getMarkerId(edge.markerStart, rfId)}')` : void 0, [edge.markerStart, rfId]);
    	const markerEndUrl = (0, react.useMemo)(() => edge.markerEnd ? `url('#${getMarkerId(edge.markerEnd, rfId)}')` : void 0, [edge.markerEnd, rfId]);
    	if (edge.hidden || sourceX === null || sourceY === null || targetX === null || targetY === null) return null;
    	const onEdgeClick = (event) => {
    		const { addSelectedEdges, unselectNodesAndEdges, multiSelectionActive } = store.getState();
    		if (isSelectable) {
    			store.setState({ nodesSelectionActive: false });
    			if (edge.selected && multiSelectionActive) {
    				unselectNodesAndEdges({
    					nodes: [],
    					edges: [edge]
    				});
    				edgeRef.current?.blur();
    			} else addSelectedEdges([id]);
    		}
    		if (onClick) onClick(event, edge);
    	};
    	const onEdgeDoubleClick = onDoubleClick ? (event) => {
    		onDoubleClick(event, { ...edge });
    	} : void 0;
    	const onEdgeContextMenu = onContextMenu ? (event) => {
    		onContextMenu(event, { ...edge });
    	} : void 0;
    	const onEdgeMouseEnter = onMouseEnter ? (event) => {
    		onMouseEnter(event, { ...edge });
    	} : void 0;
    	const onEdgeMouseMove = onMouseMove ? (event) => {
    		onMouseMove(event, { ...edge });
    	} : void 0;
    	const onEdgeMouseLeave = onMouseLeave ? (event) => {
    		onMouseLeave(event, { ...edge });
    	} : void 0;
    	const onKeyDown = (event) => {
    		if (!disableKeyboardA11y && elementSelectionKeys.includes(event.key) && isSelectable) {
    			const { unselectNodesAndEdges, addSelectedEdges } = store.getState();
    			if (event.key === "Escape") {
    				edgeRef.current?.blur();
    				unselectNodesAndEdges({ edges: [edge] });
    			} else addSelectedEdges([id]);
    		}
    	};
    	return (0, react_jsx_runtime.jsx)("svg", {
    		style: { zIndex },
    		children: (0, react_jsx_runtime.jsxs)("g", {
    			className: cc([
    				"react-flow__edge",
    				`react-flow__edge-${edgeType}`,
    				edge.className,
    				noPanClassName,
    				{
    					selected: edge.selected,
    					animated: edge.animated,
    					inactive: !isSelectable && !onClick,
    					updating: updateHover,
    					selectable: isSelectable
    				}
    			]),
    			onClick: onEdgeClick,
    			onDoubleClick: onEdgeDoubleClick,
    			onContextMenu: onEdgeContextMenu,
    			onMouseEnter: onEdgeMouseEnter,
    			onMouseMove: onEdgeMouseMove,
    			onMouseLeave: onEdgeMouseLeave,
    			onKeyDown: isFocusable ? onKeyDown : void 0,
    			tabIndex: isFocusable ? 0 : void 0,
    			role: edge.ariaRole ?? (isFocusable ? "group" : "img"),
    			"aria-roledescription": "edge",
    			"data-id": id,
    			"data-testid": `rf__edge-${id}`,
    			"aria-label": edge.ariaLabel === null ? void 0 : edge.ariaLabel || `Edge from ${edge.source} to ${edge.target}`,
    			"aria-describedby": isFocusable ? `${ARIA_EDGE_DESC_KEY}-${rfId}` : void 0,
    			ref: edgeRef,
    			...edge.domAttributes,
    			children: [!reconnecting && (0, react_jsx_runtime.jsx)(EdgeComponent, {
    				id,
    				source: edge.source,
    				target: edge.target,
    				type: edge.type,
    				selected: edge.selected,
    				animated: edge.animated,
    				selectable: isSelectable,
    				deletable: edge.deletable ?? true,
    				label: edge.label,
    				labelStyle: edge.labelStyle,
    				labelShowBg: edge.labelShowBg,
    				labelBgStyle: edge.labelBgStyle,
    				labelBgPadding: edge.labelBgPadding,
    				labelBgBorderRadius: edge.labelBgBorderRadius,
    				sourceX,
    				sourceY,
    				targetX,
    				targetY,
    				sourcePosition,
    				targetPosition,
    				data: edge.data,
    				style: edge.style,
    				sourceHandleId: edge.sourceHandle,
    				targetHandleId: edge.targetHandle,
    				markerStart: markerStartUrl,
    				markerEnd: markerEndUrl,
    				pathOptions: "pathOptions" in edge ? edge.pathOptions : void 0,
    				interactionWidth: edge.interactionWidth
    			}), isReconnectable && (0, react_jsx_runtime.jsx)(EdgeUpdateAnchors, {
    				edge,
    				isReconnectable,
    				reconnectRadius,
    				onReconnect,
    				onReconnectStart,
    				onReconnectEnd,
    				sourceX,
    				sourceY,
    				targetX,
    				targetY,
    				sourcePosition,
    				targetPosition,
    				setUpdateHover,
    				setReconnecting
    			})]
    		})
    	});
    }
    var EdgeWrapper$1 = (0, react.memo)(EdgeWrapper);
    const selector$9 = (s) => ({
    	edgesFocusable: s.edgesFocusable,
    	edgesReconnectable: s.edgesReconnectable,
    	elementsSelectable: s.elementsSelectable,
    	connectionMode: s.connectionMode,
    	onError: s.onError
    });
    function EdgeRendererComponent({ defaultMarkerColor, onlyRenderVisibleElements, rfId, edgeTypes, noPanClassName, onReconnect, onEdgeContextMenu, onEdgeMouseEnter, onEdgeMouseMove, onEdgeMouseLeave, onEdgeClick, reconnectRadius, onEdgeDoubleClick, onReconnectStart, onReconnectEnd, disableKeyboardA11y }) {
    	const { edgesFocusable, edgesReconnectable, elementsSelectable, onError } = useStore(selector$9, shallow$1);
    	const edgeIds = useVisibleEdgeIds(onlyRenderVisibleElements);
    	return (0, react_jsx_runtime.jsxs)("div", {
    		className: "react-flow__edges",
    		children: [(0, react_jsx_runtime.jsx)(MarkerDefinitions$1, {
    			defaultColor: defaultMarkerColor,
    			rfId
    		}), edgeIds.map((id) => {
    			return (0, react_jsx_runtime.jsx)(EdgeWrapper$1, {
    				id,
    				edgesFocusable,
    				edgesReconnectable,
    				elementsSelectable,
    				noPanClassName,
    				onReconnect,
    				onContextMenu: onEdgeContextMenu,
    				onMouseEnter: onEdgeMouseEnter,
    				onMouseMove: onEdgeMouseMove,
    				onMouseLeave: onEdgeMouseLeave,
    				onClick: onEdgeClick,
    				reconnectRadius,
    				onDoubleClick: onEdgeDoubleClick,
    				onReconnectStart,
    				onReconnectEnd,
    				rfId,
    				onError,
    				edgeTypes,
    				disableKeyboardA11y
    			}, id);
    		})]
    	});
    }
    EdgeRendererComponent.displayName = "EdgeRenderer";
    const EdgeRenderer = (0, react.memo)(EdgeRendererComponent);
    const toTransformString = (transform) => `translate(${transform[0]}px,${transform[1]}px) scale(${transform[2]})`;
    function Viewport({ children }) {
    	const store = useStoreApi();
    	const viewportRef = (0, react.useRef)(null);
    	const [initialTransform] = (0, react.useState)(() => store.getState().transform);
    	useIsomorphicLayoutEffect(() => {
    		let prevTransform = null;
    		const applyTransform = () => {
    			const transform = store.getState().transform;
    			if (prevTransform && transform[0] === prevTransform[0] && transform[1] === prevTransform[1] && transform[2] === prevTransform[2]) return;
    			prevTransform = transform;
    			if (viewportRef.current) viewportRef.current.style.transform = toTransformString(transform);
    		};
    		applyTransform();
    		return store.subscribe(applyTransform);
    	}, [store]);
    	return (0, react_jsx_runtime.jsx)("div", {
    		ref: viewportRef,
    		className: "react-flow__viewport xyflow__viewport react-flow__container",
    		style: { transform: toTransformString(initialTransform) },
    		children
    	});
    }
    /**
    * Hook for calling onInit handler.
    *
    * @internal
    */
    function useOnInitHandler(onInit) {
    	const rfInstance = useReactFlow();
    	const isInitialized = (0, react.useRef)(false);
    	(0, react.useEffect)(() => {
    		if (!isInitialized.current && rfInstance.viewportInitialized && onInit) {
    			setTimeout(() => onInit(rfInstance), 1);
    			isInitialized.current = true;
    		}
    	}, [onInit, rfInstance.viewportInitialized]);
    }
    const selector$8 = (state) => state.panZoom?.syncViewport;
    /**
    * Hook for syncing the viewport with the panzoom instance.
    *
    * @internal
    * @param viewport
    */
    function useViewportSync(viewport) {
    	const syncViewport = useStore(selector$8);
    	const store = useStoreApi();
    	(0, react.useEffect)(() => {
    		if (viewport) {
    			syncViewport?.(viewport);
    			store.setState({ transform: [
    				viewport.x,
    				viewport.y,
    				viewport.zoom
    			] });
    		}
    	}, [viewport, syncViewport]);
    	return null;
    }
    function storeSelector$1(s) {
    	return s.connection.inProgress ? {
    		...s.connection,
    		to: pointToRendererPoint(s.connection.to, s.transform)
    	} : { ...s.connection };
    }
    function getSelector(connectionSelector) {
    	if (connectionSelector) {
    		const combinedSelector = (s) => {
    			return connectionSelector(storeSelector$1(s));
    		};
    		return combinedSelector;
    	}
    	return storeSelector$1;
    }
    /**
    * The `useConnection` hook returns the current connection when there is an active
    * connection interaction. If no connection interaction is active, it returns null
    * for every property. A typical use case for this hook is to colorize handles
    * based on a certain condition (e.g. if the connection is valid or not).
    *
    * @public
    * @param connectionSelector - An optional selector function used to extract a slice of the
    * `ConnectionState` data. Using a selector can prevent component re-renders where data you don't
    * otherwise care about might change. If a selector is not provided, the entire `ConnectionState`
    * object is returned unchanged.
    * @example
    *
    * ```tsx
    *import { useConnection } from '@xyflow/react';
    *
    *function App() {
    *  const connection = useConnection();
    *
    *  return (
    *    <div> {connection ? `Someone is trying to make a connection from ${connection.fromNode} to this one.` : 'There are currently no incoming connections!'}
    *
    *   </div>
    *   );
    * }
    * ```
    *
    * @returns ConnectionState
    */
    function useConnection(connectionSelector) {
    	return useStore(getSelector(connectionSelector), shallow$1);
    }
    const selector$7 = (s) => ({
    	nodesConnectable: s.nodesConnectable,
    	isValid: s.connection.isValid,
    	inProgress: s.connection.inProgress,
    	width: s.width,
    	height: s.height
    });
    function ConnectionLineWrapper({ containerStyle, style, type, component }) {
    	const { nodesConnectable, width, height, isValid, inProgress } = useStore(selector$7, shallow$1);
    	if (!!!(width && nodesConnectable && inProgress)) return null;
    	return (0, react_jsx_runtime.jsx)("svg", {
    		style: containerStyle,
    		width,
    		height,
    		className: "react-flow__connectionline react-flow__container",
    		children: (0, react_jsx_runtime.jsx)("g", {
    			className: cc(["react-flow__connection", getConnectionStatus(isValid)]),
    			children: (0, react_jsx_runtime.jsx)(ConnectionLine, {
    				style,
    				type,
    				CustomComponent: component,
    				isValid
    			})
    		})
    	});
    }
    const ConnectionLine = ({ style, type = ConnectionLineType.Bezier, CustomComponent, isValid }) => {
    	const { inProgress, from, fromNode, fromHandle, fromPosition, to, toNode, toHandle, toPosition, pointer } = useConnection();
    	if (!inProgress) return;
    	if (CustomComponent) return (0, react_jsx_runtime.jsx)(CustomComponent, {
    		connectionLineType: type,
    		connectionLineStyle: style,
    		fromNode,
    		fromHandle,
    		fromX: from.x,
    		fromY: from.y,
    		toX: to.x,
    		toY: to.y,
    		fromPosition,
    		toPosition,
    		connectionStatus: getConnectionStatus(isValid),
    		toNode,
    		toHandle,
    		pointer
    	});
    	let path = "";
    	const pathParams = {
    		sourceX: from.x,
    		sourceY: from.y,
    		sourcePosition: fromPosition,
    		targetX: to.x,
    		targetY: to.y,
    		targetPosition: toPosition
    	};
    	switch (type) {
    		case ConnectionLineType.Bezier:
    			[path] = getBezierPath(pathParams);
    			break;
    		case ConnectionLineType.SimpleBezier:
    			[path] = getSimpleBezierPath(pathParams);
    			break;
    		case ConnectionLineType.Step:
    			[path] = getSmoothStepPath({
    				...pathParams,
    				borderRadius: 0
    			});
    			break;
    		case ConnectionLineType.SmoothStep:
    			[path] = getSmoothStepPath(pathParams);
    			break;
    		default: [path] = getStraightPath(pathParams);
    	}
    	return (0, react_jsx_runtime.jsx)("path", {
    		d: path,
    		fill: "none",
    		className: "react-flow__connection-path",
    		style
    	});
    };
    ConnectionLine.displayName = "ConnectionLine";
    const emptyTypes = {};
    function useNodeOrEdgeTypesWarning(nodeOrEdgeTypes = emptyTypes) {
    	(0, react.useRef)(nodeOrEdgeTypes);
    	useStoreApi();
    	(0, react.useEffect)(() => {}, [nodeOrEdgeTypes]);
    }
    function useStylesLoadedWarning() {
    	useStoreApi();
    	(0, react.useRef)(false);
    	(0, react.useEffect)(() => {}, []);
    }
    function GraphViewComponent({ nodeTypes, edgeTypes, onInit, onNodeClick, onEdgeClick, onNodeDoubleClick, onEdgeDoubleClick, onNodeMouseEnter, onNodeMouseMove, onNodeMouseLeave, onNodeContextMenu, onSelectionContextMenu, onSelectionStart, onSelectionEnd, connectionLineType, connectionLineStyle, connectionLineComponent, connectionLineContainerStyle, selectionKeyCode, selectionOnDrag, selectionMode, multiSelectionKeyCode, panActivationKeyCode, zoomActivationKeyCode, deleteKeyCode, onlyRenderVisibleElements, elementsSelectable, defaultViewport, translateExtent, minZoom, maxZoom, preventScrolling, defaultMarkerColor, zoomOnScroll, zoomOnPinch, panOnScroll, panOnScrollSpeed, panOnScrollMode, zoomOnDoubleClick, panOnDrag, autoPanOnSelection, onPaneClick, onPaneMouseEnter, onPaneMouseMove, onPaneMouseLeave, onPaneScroll, onPaneContextMenu, paneClickDistance, nodeClickDistance, onEdgeContextMenu, onEdgeMouseEnter, onEdgeMouseMove, onEdgeMouseLeave, reconnectRadius, onReconnect, onReconnectStart, onReconnectEnd, noDragClassName, noWheelClassName, noPanClassName, disableKeyboardA11y, nodeExtent, rfId, viewport, onViewportChange, nodesDraggable }) {
    	useNodeOrEdgeTypesWarning(nodeTypes);
    	useNodeOrEdgeTypesWarning(edgeTypes);
    	useStylesLoadedWarning();
    	useOnInitHandler(onInit);
    	useViewportSync(viewport);
    	return (0, react_jsx_runtime.jsx)(FlowRenderer, {
    		onPaneClick,
    		onPaneMouseEnter,
    		onPaneMouseMove,
    		onPaneMouseLeave,
    		onPaneContextMenu,
    		onPaneScroll,
    		paneClickDistance,
    		deleteKeyCode,
    		selectionKeyCode,
    		selectionOnDrag,
    		selectionMode,
    		onSelectionStart,
    		onSelectionEnd,
    		multiSelectionKeyCode,
    		panActivationKeyCode,
    		zoomActivationKeyCode,
    		elementsSelectable,
    		zoomOnScroll,
    		zoomOnPinch,
    		zoomOnDoubleClick,
    		panOnScroll,
    		panOnScrollSpeed,
    		panOnScrollMode,
    		panOnDrag,
    		autoPanOnSelection,
    		defaultViewport,
    		translateExtent,
    		minZoom,
    		maxZoom,
    		onSelectionContextMenu,
    		preventScrolling,
    		noDragClassName,
    		noWheelClassName,
    		noPanClassName,
    		disableKeyboardA11y,
    		onViewportChange,
    		isControlledViewport: !!viewport,
    		children: (0, react_jsx_runtime.jsxs)(Viewport, { children: [
    			(0, react_jsx_runtime.jsx)(EdgeRenderer, {
    				edgeTypes,
    				onEdgeClick,
    				onEdgeDoubleClick,
    				onReconnect,
    				onReconnectStart,
    				onReconnectEnd,
    				onlyRenderVisibleElements,
    				onEdgeContextMenu,
    				onEdgeMouseEnter,
    				onEdgeMouseMove,
    				onEdgeMouseLeave,
    				reconnectRadius,
    				defaultMarkerColor,
    				noPanClassName,
    				disableKeyboardA11y,
    				rfId
    			}),
    			(0, react_jsx_runtime.jsx)(ConnectionLineWrapper, {
    				style: connectionLineStyle,
    				type: connectionLineType,
    				component: connectionLineComponent,
    				containerStyle: connectionLineContainerStyle
    			}),
    			(0, react_jsx_runtime.jsx)("div", { className: "react-flow__edgelabel-renderer" }),
    			(0, react_jsx_runtime.jsx)(NodeRenderer, {
    				nodeTypes,
    				onNodeClick,
    				onNodeDoubleClick,
    				onNodeMouseEnter,
    				onNodeMouseMove,
    				onNodeMouseLeave,
    				onNodeContextMenu,
    				nodeClickDistance,
    				onlyRenderVisibleElements,
    				noPanClassName,
    				noDragClassName,
    				disableKeyboardA11y,
    				nodeExtent,
    				rfId,
    				nodesDraggable
    			}),
    			(0, react_jsx_runtime.jsx)("div", { className: "react-flow__viewport-portal" })
    		] })
    	});
    }
    GraphViewComponent.displayName = "GraphView";
    const GraphView = (0, react.memo)(GraphViewComponent);
    const devWarn = createDevWarn("React Flow", "https://reactflow.dev/");
    const getInitialState = ({ nodes, edges, defaultNodes, defaultEdges, width, height, fitView, fitViewOptions, minZoom = .5, maxZoom = 2, nodeOrigin, nodeExtent, zIndexMode = "basic" } = {}) => {
    	const nodeLookup = /* @__PURE__ */ new Map();
    	const parentLookup = /* @__PURE__ */ new Map();
    	const connectionLookup = /* @__PURE__ */ new Map();
    	const edgeLookup = /* @__PURE__ */ new Map();
    	const storeEdges = defaultEdges ?? edges ?? [];
    	const storeNodes = defaultNodes ?? nodes ?? [];
    	const storeNodeOrigin = nodeOrigin ?? [0, 0];
    	const storeNodeExtent = nodeExtent ?? infiniteExtent;
    	updateConnectionLookup(connectionLookup, edgeLookup, storeEdges);
    	const { nodesInitialized } = adoptUserNodes(storeNodes, nodeLookup, parentLookup, {
    		nodeOrigin: storeNodeOrigin,
    		nodeExtent: storeNodeExtent,
    		zIndexMode
    	});
    	let transform = [
    		0,
    		0,
    		1
    	];
    	if (fitView && width && height) {
    		const bounds = getInternalNodesBounds(nodeLookup, { filter: (node) => !!((node.width || node.initialWidth) && (node.height || node.initialHeight)) });
    		const { x, y, zoom } = getViewportForBounds(bounds, width, height, minZoom, maxZoom, fitViewOptions?.padding ?? .1);
    		transform = [
    			x,
    			y,
    			zoom
    		];
    	}
    	return {
    		rfId: "1",
    		width: width ?? 0,
    		height: height ?? 0,
    		transform,
    		nodes: storeNodes,
    		nodesInitialized,
    		nodeLookup,
    		parentLookup,
    		edges: storeEdges,
    		edgeLookup,
    		connectionLookup,
    		onNodesChange: null,
    		onEdgesChange: null,
    		hasDefaultNodes: defaultNodes !== void 0,
    		hasDefaultEdges: defaultEdges !== void 0,
    		panZoom: null,
    		minZoom,
    		maxZoom,
    		translateExtent: infiniteExtent,
    		nodeExtent: storeNodeExtent,
    		nodesSelectionActive: false,
    		userSelectionActive: false,
    		userSelectionRect: null,
    		connectionMode: ConnectionMode.Strict,
    		domNode: null,
    		paneDragging: false,
    		noPanClassName: "nopan",
    		nodeOrigin: storeNodeOrigin,
    		nodeDragThreshold: 1,
    		connectionDragThreshold: 1,
    		snapGrid: [15, 15],
    		snapToGrid: false,
    		nodesDraggable: true,
    		nodesConnectable: true,
    		nodesFocusable: true,
    		edgesFocusable: true,
    		edgesReconnectable: true,
    		elementsSelectable: true,
    		elevateNodesOnSelect: true,
    		elevateEdgesOnSelect: true,
    		selectNodesOnDrag: true,
    		multiSelectionActive: false,
    		fitViewQueued: fitView ?? false,
    		fitViewOptions,
    		fitViewResolver: null,
    		connection: { ...initialConnection },
    		connectionClickStartHandle: null,
    		connectOnClick: true,
    		ariaLiveMessage: "",
    		autoPanOnConnect: true,
    		autoPanOnNodeDrag: true,
    		autoPanOnNodeFocus: true,
    		autoPanSpeed: 15,
    		connectionRadius: 20,
    		onError: devWarn,
    		isValidConnection: void 0,
    		onSelectionChangeHandlers: [],
    		lib: "react",
    		debug: false,
    		ariaLabelConfig: defaultAriaLabelConfig,
    		zIndexMode,
    		defaultEdgeOptions: void 0,
    		onNodesChangeMiddlewareMap: /* @__PURE__ */ new Map(),
    		onEdgesChangeMiddlewareMap: /* @__PURE__ */ new Map(),
    		onNodesDelete: void 0,
    		onEdgesDelete: void 0,
    		onDelete: void 0,
    		onBeforeDelete: void 0,
    		onViewportChangeStart: void 0,
    		onViewportChange: void 0,
    		onViewportChangeEnd: void 0,
    		onNodeDragStart: void 0,
    		onNodeDrag: void 0,
    		onNodeDragStop: void 0,
    		onSelectionDragStart: void 0,
    		onSelectionDrag: void 0,
    		onSelectionDragStop: void 0,
    		onMoveStart: void 0,
    		onMove: void 0,
    		onMoveEnd: void 0,
    		onConnect: void 0,
    		onConnectStart: void 0,
    		onConnectEnd: void 0,
    		onClickConnectStart: void 0,
    		onClickConnectEnd: void 0
    	};
    };
    const createStore = ({ nodes, edges, defaultNodes, defaultEdges, width, height, fitView, fitViewOptions, minZoom, maxZoom, nodeOrigin, nodeExtent, zIndexMode }) => createWithEqualityFn((set, get) => {
    	async function resolveFitView() {
    		const { nodeLookup, panZoom, fitViewOptions, fitViewResolver, width, height, minZoom, maxZoom } = get();
    		if (!panZoom) return;
    		await fitViewport({
    			nodes: nodeLookup,
    			width,
    			height,
    			panZoom,
    			minZoom,
    			maxZoom
    		}, fitViewOptions);
    		fitViewResolver?.resolve(true);
    		/**
    		* wait for the fitViewport to resolve before deleting the resolver,
    		* we want to reuse the old resolver if the user calls fitView again in the mean time
    		*/
    		set({ fitViewResolver: null });
    	}
    	return {
    		...getInitialState({
    			nodes,
    			edges,
    			width,
    			height,
    			fitView,
    			fitViewOptions,
    			minZoom,
    			maxZoom,
    			nodeOrigin,
    			nodeExtent,
    			defaultNodes,
    			defaultEdges,
    			zIndexMode
    		}),
    		setNodes: (nodes) => {
    			const { nodeLookup, parentLookup, nodeOrigin, nodeExtent, elevateNodesOnSelect, fitViewQueued, zIndexMode, nodesSelectionActive } = get();
    			const { nodesInitialized, hasSelectedNodes } = adoptUserNodes(nodes, nodeLookup, parentLookup, {
    				nodeOrigin,
    				nodeExtent,
    				elevateNodesOnSelect,
    				checkEquality: true,
    				zIndexMode
    			});
    			const nextNodesSelectionActive = nodesSelectionActive && hasSelectedNodes;
    			if (fitViewQueued && nodesInitialized) {
    				resolveFitView();
    				set({
    					nodes,
    					nodesInitialized,
    					fitViewQueued: false,
    					fitViewOptions: void 0,
    					nodesSelectionActive: nextNodesSelectionActive
    				});
    			} else set({
    				nodes,
    				nodesInitialized,
    				nodesSelectionActive: nextNodesSelectionActive
    			});
    		},
    		setEdges: (edges) => {
    			const { connectionLookup, edgeLookup } = get();
    			updateConnectionLookup(connectionLookup, edgeLookup, edges);
    			set({ edges });
    		},
    		setDefaultNodesAndEdges: (nodes, edges) => {
    			if (nodes) {
    				const { setNodes } = get();
    				setNodes(nodes);
    				set({ hasDefaultNodes: true });
    			}
    			if (edges) {
    				const { setEdges } = get();
    				setEdges(edges);
    				set({ hasDefaultEdges: true });
    			}
    		},
    		updateNodeInternals: (updates) => {
    			const { triggerNodeChanges, nodeLookup, parentLookup, domNode, nodeOrigin, nodeExtent, debug, fitViewQueued, zIndexMode } = get();
    			const { changes, updatedInternals } = updateNodeInternals(updates, nodeLookup, parentLookup, domNode, nodeOrigin, nodeExtent, zIndexMode);
    			if (!updatedInternals) return;
    			updateAbsolutePositions(nodeLookup, parentLookup, {
    				nodeOrigin,
    				nodeExtent,
    				zIndexMode
    			});
    			if (fitViewQueued) {
    				resolveFitView();
    				set({
    					fitViewQueued: false,
    					fitViewOptions: void 0
    				});
    			} else set({});
    			if (changes?.length > 0) {
    				if (debug) console.log("React Flow: trigger node changes", changes);
    				triggerNodeChanges?.(changes);
    			}
    		},
    		updateNodePositions: (nodeDragItems, dragging = false) => {
    			const parentExpandChildren = [];
    			let changes = [];
    			const { nodeLookup, triggerNodeChanges, connection, updateConnection, onNodesChangeMiddlewareMap } = get();
    			for (const [id, dragItem] of nodeDragItems) {
    				const node = nodeLookup.get(id);
    				const expandParent = !!(node?.expandParent && node?.parentId && dragItem?.position);
    				const change = {
    					id,
    					type: "position",
    					position: expandParent ? {
    						x: Math.max(0, dragItem.position.x),
    						y: Math.max(0, dragItem.position.y)
    					} : dragItem.position,
    					dragging
    				};
    				if (node && connection.inProgress && connection.fromNode.id === node.id) {
    					const updatedFrom = getHandlePosition(node, connection.fromHandle, Position.Left, true);
    					updateConnection({
    						...connection,
    						from: updatedFrom
    					});
    				}
    				if (expandParent && node.parentId) parentExpandChildren.push({
    					id,
    					parentId: node.parentId,
    					rect: {
    						...dragItem.internals.positionAbsolute,
    						width: dragItem.measured.width ?? 0,
    						height: dragItem.measured.height ?? 0
    					}
    				});
    				changes.push(change);
    			}
    			if (parentExpandChildren.length > 0) {
    				const { parentLookup, nodeOrigin } = get();
    				const parentExpandChanges = handleExpandParent(parentExpandChildren, nodeLookup, parentLookup, nodeOrigin);
    				changes.push(...parentExpandChanges);
    			}
    			for (const middleware of onNodesChangeMiddlewareMap.values()) changes = middleware(changes);
    			triggerNodeChanges(changes);
    		},
    		triggerNodeChanges: (changes) => {
    			const { onNodesChange, setNodes, nodes, hasDefaultNodes, debug } = get();
    			if (changes?.length) {
    				if (hasDefaultNodes) setNodes(applyNodeChanges(changes, nodes));
    				if (debug) console.log("React Flow: trigger node changes", changes);
    				onNodesChange?.(changes);
    			}
    		},
    		triggerEdgeChanges: (changes) => {
    			const { onEdgesChange, setEdges, edges, hasDefaultEdges, debug } = get();
    			if (changes?.length) {
    				if (hasDefaultEdges) setEdges(applyEdgeChanges(changes, edges));
    				if (debug) console.log("React Flow: trigger edge changes", changes);
    				onEdgesChange?.(changes);
    			}
    		},
    		addSelectedNodes: (selectedNodeIds) => {
    			const { multiSelectionActive, edgeLookup, nodeLookup, triggerNodeChanges, triggerEdgeChanges } = get();
    			if (multiSelectionActive) {
    				triggerNodeChanges(selectedNodeIds.map((nodeId) => createSelectionChange(nodeId, true)));
    				return;
    			}
    			triggerNodeChanges(getSelectionChanges(nodeLookup, /* @__PURE__ */ new Set([...selectedNodeIds]), true));
    			triggerEdgeChanges(getSelectionChanges(edgeLookup));
    		},
    		addSelectedEdges: (selectedEdgeIds) => {
    			const { multiSelectionActive, edgeLookup, nodeLookup, triggerNodeChanges, triggerEdgeChanges } = get();
    			if (multiSelectionActive) {
    				triggerEdgeChanges(selectedEdgeIds.map((edgeId) => createSelectionChange(edgeId, true)));
    				return;
    			}
    			triggerEdgeChanges(getSelectionChanges(edgeLookup, /* @__PURE__ */ new Set([...selectedEdgeIds])));
    			triggerNodeChanges(getSelectionChanges(nodeLookup, /* @__PURE__ */ new Set(), true));
    		},
    		unselectNodesAndEdges: ({ nodes, edges } = {}) => {
    			const { edges: storeEdges, nodes: storeNodes, nodeLookup, triggerNodeChanges, triggerEdgeChanges } = get();
    			const nodesToUnselect = nodes ? nodes : storeNodes;
    			const edgesToUnselect = edges ? edges : storeEdges;
    			const nodeChanges = [];
    			for (const node of nodesToUnselect) {
    				if (!node.selected) continue;
    				const internalNode = nodeLookup.get(node.id);
    				if (internalNode) internalNode.selected = false;
    				nodeChanges.push(createSelectionChange(node.id, false));
    			}
    			const edgeChanges = [];
    			for (const edge of edgesToUnselect) {
    				if (!edge.selected) continue;
    				edgeChanges.push(createSelectionChange(edge.id, false));
    			}
    			triggerNodeChanges(nodeChanges);
    			triggerEdgeChanges(edgeChanges);
    		},
    		setMinZoom: (minZoom) => {
    			const { panZoom, maxZoom } = get();
    			panZoom?.setScaleExtent([minZoom, maxZoom]);
    			set({ minZoom });
    		},
    		setMaxZoom: (maxZoom) => {
    			const { panZoom, minZoom } = get();
    			panZoom?.setScaleExtent([minZoom, maxZoom]);
    			set({ maxZoom });
    		},
    		setTranslateExtent: (translateExtent) => {
    			get().panZoom?.setTranslateExtent(translateExtent);
    			set({ translateExtent });
    		},
    		resetSelectedElements: () => {
    			const { edges, nodes, triggerNodeChanges, triggerEdgeChanges, elementsSelectable } = get();
    			if (!elementsSelectable) return;
    			const nodeChanges = nodes.reduce((res, node) => node.selected ? [...res, createSelectionChange(node.id, false)] : res, []);
    			const edgeChanges = edges.reduce((res, edge) => edge.selected ? [...res, createSelectionChange(edge.id, false)] : res, []);
    			triggerNodeChanges(nodeChanges);
    			triggerEdgeChanges(edgeChanges);
    		},
    		setNodeExtent: (nextNodeExtent) => {
    			const { nodes, nodeLookup, parentLookup, nodeOrigin, elevateNodesOnSelect, nodeExtent, zIndexMode } = get();
    			if (nextNodeExtent[0][0] === nodeExtent[0][0] && nextNodeExtent[0][1] === nodeExtent[0][1] && nextNodeExtent[1][0] === nodeExtent[1][0] && nextNodeExtent[1][1] === nodeExtent[1][1]) return;
    			adoptUserNodes(nodes, nodeLookup, parentLookup, {
    				nodeOrigin,
    				nodeExtent: nextNodeExtent,
    				elevateNodesOnSelect,
    				checkEquality: false,
    				zIndexMode
    			});
    			set({ nodeExtent: nextNodeExtent });
    		},
    		panBy: (delta) => {
    			const { transform, width, height, panZoom, translateExtent } = get();
    			return panBy({
    				delta,
    				panZoom,
    				transform,
    				translateExtent,
    				width,
    				height
    			});
    		},
    		setCenter: async (x, y, options) => {
    			const { width, height, maxZoom, panZoom } = get();
    			if (!panZoom) return false;
    			const nextZoom = typeof options?.zoom !== "undefined" ? options.zoom : maxZoom;
    			await panZoom.setViewport({
    				x: width / 2 - x * nextZoom,
    				y: height / 2 - y * nextZoom,
    				zoom: nextZoom
    			}, {
    				duration: options?.duration,
    				ease: options?.ease,
    				interpolate: options?.interpolate
    			});
    			return true;
    		},
    		cancelConnection: () => {
    			set({ connection: { ...initialConnection } });
    		},
    		updateConnection: (connection) => {
    			set({ connection });
    		},
    		reset: () => set({ ...getInitialState() })
    	};
    }, Object.is);
    /**
    * The `<ReactFlowProvider />` component is a [context provider](https://react.dev/learn/passing-data-deeply-with-context#)
    * that makes it possible to access a flow's internal state outside of the
    * [`<ReactFlow />`](/api-reference/react-flow) component. Many of the hooks we
    * provide rely on this component to work.
    * @public
    *
    * @example
    * ```tsx
    *import { ReactFlow, ReactFlowProvider, useNodes } from '@xyflow/react'
    *
    *export default function Flow() {
    *  return (
    *    <ReactFlowProvider>
    *      <ReactFlow nodes={...} edges={...} />
    *      <Sidebar />
    *    </ReactFlowProvider>
    *  );
    *}
    *
    *function Sidebar() {
    *  // This hook will only work if the component it's used in is a child of a
    *  // <ReactFlowProvider />.
    *  const nodes = useNodes()
    *
    *  return <aside>do something with nodes</aside>;
    *}
    *```
    *
    * @remarks If you're using a router and want your flow's state to persist across routes,
    * it's vital that you place the `<ReactFlowProvider />` component _outside_ of
    * your router. If you have multiple flows on the same page you will need to use a separate
    * `<ReactFlowProvider />` for each flow.
    */
    function ReactFlowProvider({ initialNodes: nodes, initialEdges: edges, defaultNodes, defaultEdges, initialWidth: width, initialHeight: height, initialMinZoom: minZoom, initialMaxZoom: maxZoom, initialFitViewOptions: fitViewOptions, fitView, nodeOrigin, nodeExtent, zIndexMode, children }) {
    	const [store] = (0, react.useState)(() => createStore({
    		nodes,
    		edges,
    		defaultNodes,
    		defaultEdges,
    		width,
    		height,
    		fitView,
    		minZoom,
    		maxZoom,
    		fitViewOptions,
    		nodeOrigin,
    		nodeExtent,
    		zIndexMode
    	}));
    	return (0, react_jsx_runtime.jsx)(Provider$1, {
    		value: store,
    		children: (0, react_jsx_runtime.jsx)(BatchProvider, { children: (0, react_jsx_runtime.jsx)(HandleConfigProvider, { children }) })
    	});
    }
    function Wrapper({ children, nodes, edges, defaultNodes, defaultEdges, width, height, fitView, fitViewOptions, minZoom, maxZoom, nodeOrigin, nodeExtent, zIndexMode }) {
    	if ((0, react.useContext)(StoreContext)) return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children });
    	return (0, react_jsx_runtime.jsx)(ReactFlowProvider, {
    		initialNodes: nodes,
    		initialEdges: edges,
    		defaultNodes,
    		defaultEdges,
    		initialWidth: width,
    		initialHeight: height,
    		fitView,
    		initialFitViewOptions: fitViewOptions,
    		initialMinZoom: minZoom,
    		initialMaxZoom: maxZoom,
    		nodeOrigin,
    		nodeExtent,
    		zIndexMode,
    		children
    	});
    }
    const wrapperStyle = {
    	width: "100%",
    	height: "100%",
    	overflow: "hidden",
    	position: "relative",
    	zIndex: 0
    };
    function ReactFlow({ nodes, edges, defaultNodes, defaultEdges, className, nodeTypes, edgeTypes, onNodeClick, onEdgeClick, onInit, onMove, onMoveStart, onMoveEnd, onConnect, onConnectStart, onConnectEnd, onClickConnectStart, onClickConnectEnd, onNodeMouseEnter, onNodeMouseMove, onNodeMouseLeave, onNodeContextMenu, onNodeDoubleClick, onNodeDragStart, onNodeDrag, onNodeDragStop, onNodesDelete, onEdgesDelete, onDelete, onSelectionChange, onSelectionDragStart, onSelectionDrag, onSelectionDragStop, onSelectionContextMenu, onSelectionStart, onSelectionEnd, onBeforeDelete, connectionMode, connectionLineType = ConnectionLineType.Bezier, connectionLineStyle, connectionLineComponent, connectionLineContainerStyle, deleteKeyCode = "Backspace", selectionKeyCode = "Shift", selectionOnDrag = false, selectionMode = SelectionMode.Full, panActivationKeyCode = "Space", multiSelectionKeyCode = isMacOs() ? "Meta" : "Control", zoomActivationKeyCode = isMacOs() ? "Meta" : "Control", snapToGrid, snapGrid, onlyRenderVisibleElements = false, selectNodesOnDrag, nodesDraggable, autoPanOnNodeFocus, nodesConnectable, nodesFocusable, nodeOrigin = defaultNodeOrigin, edgesFocusable, edgesReconnectable, elementsSelectable = true, defaultViewport: defaultViewport$1 = defaultViewport, minZoom = .5, maxZoom = 2, translateExtent = infiniteExtent, preventScrolling = true, nodeExtent, defaultMarkerColor = "#b1b1b7", zoomOnScroll = true, zoomOnPinch = true, panOnScroll = false, panOnScrollSpeed = .5, panOnScrollMode = PanOnScrollMode.Free, zoomOnDoubleClick = true, panOnDrag = true, onPaneClick, onPaneMouseEnter, onPaneMouseMove, onPaneMouseLeave, onPaneScroll, onPaneContextMenu, paneClickDistance = 1, nodeClickDistance = 0, children, onReconnect, onReconnectStart, onReconnectEnd, onEdgeContextMenu, onEdgeDoubleClick, onEdgeMouseEnter, onEdgeMouseMove, onEdgeMouseLeave, reconnectRadius = 10, onNodesChange, onEdgesChange, noDragClassName = "nodrag", noWheelClassName = "nowheel", noPanClassName = "nopan", fitView, fitViewOptions, connectOnClick, attributionPosition, proOptions, defaultEdgeOptions, elevateNodesOnSelect = true, elevateEdgesOnSelect = false, disableKeyboardA11y = false, autoPanOnConnect, autoPanOnNodeDrag, autoPanOnSelection = true, autoPanSpeed, connectionRadius, isValidConnection, onError, style, id, nodeDragThreshold, connectionDragThreshold, viewport, onViewportChange, width, height, colorMode = "light", debug, onScroll, ariaLabelConfig, zIndexMode = "basic", ...rest }, ref) {
    	const rfId = id || "1";
    	const colorModeClassName = useColorModeClass(colorMode);
    	const wrapperOnScroll = (0, react.useCallback)((e) => {
    		e.currentTarget.scrollTo({
    			top: 0,
    			left: 0,
    			behavior: "instant"
    		});
    		onScroll?.(e);
    	}, [onScroll]);
    	return (0, react_jsx_runtime.jsx)("div", {
    		"data-testid": "rf__wrapper",
    		...rest,
    		onScroll: wrapperOnScroll,
    		style: {
    			...style,
    			...wrapperStyle
    		},
    		ref,
    		className: cc([
    			"react-flow",
    			className,
    			colorModeClassName
    		]),
    		id,
    		role: "application",
    		children: (0, react_jsx_runtime.jsxs)(Wrapper, {
    			nodes,
    			edges,
    			width,
    			height,
    			fitView,
    			fitViewOptions,
    			minZoom,
    			maxZoom,
    			nodeOrigin,
    			nodeExtent,
    			zIndexMode,
    			children: [
    				(0, react_jsx_runtime.jsx)(StoreUpdater, {
    					nodes,
    					edges,
    					defaultNodes,
    					defaultEdges,
    					onConnect,
    					onConnectStart,
    					onConnectEnd,
    					onClickConnectStart,
    					onClickConnectEnd,
    					nodesDraggable,
    					autoPanOnNodeFocus,
    					nodesConnectable,
    					nodesFocusable,
    					edgesFocusable,
    					edgesReconnectable,
    					elementsSelectable,
    					elevateNodesOnSelect,
    					elevateEdgesOnSelect,
    					minZoom,
    					maxZoom,
    					nodeExtent,
    					onNodesChange,
    					onEdgesChange,
    					snapToGrid,
    					snapGrid,
    					connectionMode,
    					translateExtent,
    					connectOnClick,
    					defaultEdgeOptions,
    					fitView,
    					fitViewOptions,
    					onNodesDelete,
    					onEdgesDelete,
    					onDelete,
    					onNodeDragStart,
    					onNodeDrag,
    					onNodeDragStop,
    					onSelectionDrag,
    					onSelectionDragStart,
    					onSelectionDragStop,
    					onMove,
    					onMoveStart,
    					onMoveEnd,
    					noPanClassName,
    					nodeOrigin,
    					rfId,
    					autoPanOnConnect,
    					autoPanOnNodeDrag,
    					autoPanSpeed,
    					onError,
    					connectionRadius,
    					isValidConnection,
    					selectNodesOnDrag,
    					nodeDragThreshold,
    					connectionDragThreshold,
    					onBeforeDelete,
    					debug,
    					ariaLabelConfig,
    					zIndexMode
    				}),
    				(0, react_jsx_runtime.jsx)(GraphView, {
    					onInit,
    					onNodeClick,
    					onEdgeClick,
    					onNodeMouseEnter,
    					onNodeMouseMove,
    					onNodeMouseLeave,
    					onNodeContextMenu,
    					onNodeDoubleClick,
    					nodeTypes,
    					edgeTypes,
    					connectionLineType,
    					connectionLineStyle,
    					connectionLineComponent,
    					connectionLineContainerStyle,
    					selectionKeyCode,
    					selectionOnDrag,
    					selectionMode,
    					deleteKeyCode,
    					multiSelectionKeyCode,
    					panActivationKeyCode,
    					zoomActivationKeyCode,
    					onlyRenderVisibleElements,
    					defaultViewport: defaultViewport$1,
    					translateExtent,
    					minZoom,
    					maxZoom,
    					preventScrolling,
    					zoomOnScroll,
    					zoomOnPinch,
    					zoomOnDoubleClick,
    					panOnScroll,
    					panOnScrollSpeed,
    					panOnScrollMode,
    					panOnDrag,
    					autoPanOnSelection,
    					onPaneClick,
    					onPaneMouseEnter,
    					onPaneMouseMove,
    					onPaneMouseLeave,
    					onPaneScroll,
    					onPaneContextMenu,
    					paneClickDistance,
    					nodeClickDistance,
    					onSelectionContextMenu,
    					onSelectionStart,
    					onSelectionEnd,
    					onReconnect,
    					onReconnectStart,
    					onReconnectEnd,
    					onEdgeContextMenu,
    					onEdgeDoubleClick,
    					onEdgeMouseEnter,
    					onEdgeMouseMove,
    					onEdgeMouseLeave,
    					reconnectRadius,
    					defaultMarkerColor,
    					noDragClassName,
    					noWheelClassName,
    					noPanClassName,
    					rfId,
    					disableKeyboardA11y,
    					nodeExtent,
    					viewport,
    					onViewportChange,
    					nodesDraggable
    				}),
    				(0, react_jsx_runtime.jsx)(SelectionListener, { onSelectionChange }),
    				children,
    				(0, react_jsx_runtime.jsx)(Attribution, {
    					proOptions,
    					position: attributionPosition
    				}),
    				(0, react_jsx_runtime.jsx)(A11yDescriptions, {
    					rfId,
    					disableKeyboardA11y
    				})
    			]
    		})
    	});
    }
    /**
    * The `<ReactFlow />` component is the heart of your React Flow application.
    * It renders your nodes and edges and handles user interaction
    *
    * @public
    *
    * @example
    * ```tsx
    *import { ReactFlow } from '@xyflow/react'
    *
    *export default function Flow() {
    *  return (<ReactFlow
    *    nodes={...}
    *    edges={...}
    *    onNodesChange={...}
    *    ...
    *  />);
    *}
    *```
    */
    var index = fixedForwardRef(ReactFlow);
    const selector$6 = (s) => s.domNode?.querySelector(".react-flow__edgelabel-renderer");
    /**
    * Edges are SVG-based. If you want to render more complex labels you can use the
    * `<EdgeLabelRenderer />` component to access a div based renderer. This component
    * is a portal that renders the label in a `<div />` that is positioned on top of
    * the edges. You can see an example usage of the component in the
    * [edge label renderer example](/examples/edges/edge-label-renderer).
    * @public
    *
    * @example
    * ```jsx
    * import React from 'react';
    * import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
    *
    * export function CustomEdge({ id, data, ...props }) {
    *   const [edgePath, labelX, labelY] = getBezierPath(props);
    *
    *   return (
    *     <>
    *       <BaseEdge id={id} path={edgePath} />
    *       <EdgeLabelRenderer>
    *         <div
    *           style={{
    *             position: 'absolute',
    *             transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
    *             background: '#ffcc00',
    *             padding: 10,
    *         }}
    *           className="nodrag nopan"
    *         >
    *          {data.label}
    *         </div>
    *       </EdgeLabelRenderer>
    *     </>
    *   );
    * };
    * ```
    *
    * @remarks The `<EdgeLabelRenderer />` has no pointer events by default. If you want to
    * add mouse interactions you need to set the style `pointerEvents: all` and add
    * the `nopan` class on the label or the element you want to interact with.
    */
    function EdgeLabelRenderer({ children }) {
    	const edgeLabelRenderer = useStore(selector$6);
    	if (!edgeLabelRenderer) return null;
    	return (0, import_react_dom.createPortal)(children, edgeLabelRenderer);
    }
    errorMessages["error014"]();
    function LinePattern({ dimensions, lineWidth, variant, className }) {
    	return (0, react_jsx_runtime.jsx)("path", {
    		strokeWidth: lineWidth,
    		d: `M${dimensions[0] / 2} 0 V${dimensions[1]} M0 ${dimensions[1] / 2} H${dimensions[0]}`,
    		className: cc([
    			"react-flow__background-pattern",
    			variant,
    			className
    		])
    	});
    }
    function DotPattern({ radius, className }) {
    	return (0, react_jsx_runtime.jsx)("circle", {
    		cx: radius,
    		cy: radius,
    		r: radius,
    		className: cc([
    			"react-flow__background-pattern",
    			"dots",
    			className
    		])
    	});
    }
    /**
    * The three variants are exported as an enum for convenience. You can either import
    * the enum and use it like `BackgroundVariant.Lines` or you can use the raw string
    * value directly.
    * @public
    */
    var BackgroundVariant;
    (function(BackgroundVariant) {
    	BackgroundVariant["Lines"] = "lines";
    	BackgroundVariant["Dots"] = "dots";
    	BackgroundVariant["Cross"] = "cross";
    })(BackgroundVariant || (BackgroundVariant = {}));
    const defaultSize = {
    	[BackgroundVariant.Dots]: 1,
    	[BackgroundVariant.Lines]: 1,
    	[BackgroundVariant.Cross]: 6
    };
    const selector$3 = (s) => ({
    	transform: s.transform,
    	patternId: `pattern-${s.rfId}`
    });
    function BackgroundComponent({ id, variant = BackgroundVariant.Dots, gap = 20, size, lineWidth = 1, offset = 0, color, bgColor, style, className, patternClassName }) {
    	const ref = (0, react.useRef)(null);
    	const { transform, patternId } = useStore(selector$3, shallow$1);
    	const patternSize = size || defaultSize[variant];
    	const isDots = variant === BackgroundVariant.Dots;
    	const isCross = variant === BackgroundVariant.Cross;
    	const gapXY = Array.isArray(gap) ? gap : [gap, gap];
    	const scaledGap = [gapXY[0] * transform[2] || 1, gapXY[1] * transform[2] || 1];
    	const scaledSize = patternSize * transform[2];
    	const offsetXY = Array.isArray(offset) ? offset : [offset, offset];
    	const patternDimensions = isCross ? [scaledSize, scaledSize] : scaledGap;
    	const scaledOffset = [offsetXY[0] * transform[2] + patternDimensions[0] / 2, offsetXY[1] * transform[2] + patternDimensions[1] / 2];
    	const _patternId = `${patternId}${id ? id : ""}`;
    	return (0, react_jsx_runtime.jsxs)("svg", {
    		className: cc(["react-flow__background", className]),
    		style: {
    			...style,
    			...containerStyle,
    			"--xy-background-color-props": bgColor,
    			"--xy-background-pattern-color-props": color
    		},
    		ref,
    		"data-testid": "rf__background",
    		children: [(0, react_jsx_runtime.jsx)("pattern", {
    			id: _patternId,
    			x: transform[0] % scaledGap[0],
    			y: transform[1] % scaledGap[1],
    			width: scaledGap[0],
    			height: scaledGap[1],
    			patternUnits: "userSpaceOnUse",
    			patternTransform: `translate(-${scaledOffset[0]},-${scaledOffset[1]})`,
    			children: isDots ? (0, react_jsx_runtime.jsx)(DotPattern, {
    				radius: scaledSize / 2,
    				className: patternClassName
    			}) : (0, react_jsx_runtime.jsx)(LinePattern, {
    				dimensions: patternDimensions,
    				lineWidth,
    				variant,
    				className: patternClassName
    			})
    		}), (0, react_jsx_runtime.jsx)("rect", {
    			x: "0",
    			y: "0",
    			width: "100%",
    			height: "100%",
    			fill: `url(#${_patternId})`
    		})]
    	});
    }
    BackgroundComponent.displayName = "Background";
    /**
    * The `<Background />` component makes it convenient to render different types of backgrounds common in node-based UIs. It comes with three variants: lines, dots and cross.
    *
    * @example
    *
    * A simple example of how to use the Background component.
    *
    * ```tsx
    * import { useState } from 'react';
    * import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';
    *
    * export default function Flow() {
    *   return (
    *     <ReactFlow defaultNodes={[...]} defaultEdges={[...]}>
    *       <Background color="#ccc" variant={BackgroundVariant.Dots} />
    *     </ReactFlow>
    *   );
    * }
    * ```
    *
    * @example
    *
    * In this example you can see how to combine multiple backgrounds
    *
    * ```tsx
    * import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';
    * import '@xyflow/react/dist/style.css';
    *
    * export default function Flow() {
    *   return (
    *     <ReactFlow defaultNodes={[...]} defaultEdges={[...]}>
    *       <Background
    *         id="1"
    *         gap={10}
    *         color="#f1f1f1"
    *         variant={BackgroundVariant.Lines}
    *       />
    *       <Background
    *         id="2"
    *         gap={100}
    *         color="#ccc"
    *         variant={BackgroundVariant.Lines}
    *       />
    *     </ReactFlow>
    *   );
    * }
    * ```
    *
    * @remarks
    *
    * When combining multiple <Background /> components it’s important to give each of them a unique id prop!
    *
    */
    const Background = (0, react.memo)(BackgroundComponent);
    function PlusIcon() {
    	return (0, react_jsx_runtime.jsx)("svg", {
    		xmlns: "http://www.w3.org/2000/svg",
    		viewBox: "0 0 32 32",
    		children: (0, react_jsx_runtime.jsx)("path", { d: "M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" })
    	});
    }
    function MinusIcon() {
    	return (0, react_jsx_runtime.jsx)("svg", {
    		xmlns: "http://www.w3.org/2000/svg",
    		viewBox: "0 0 32 5",
    		children: (0, react_jsx_runtime.jsx)("path", { d: "M0 0h32v4.2H0z" })
    	});
    }
    function FitViewIcon() {
    	return (0, react_jsx_runtime.jsx)("svg", {
    		xmlns: "http://www.w3.org/2000/svg",
    		viewBox: "0 0 32 30",
    		children: (0, react_jsx_runtime.jsx)("path", { d: "M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" })
    	});
    }
    function LockIcon() {
    	return (0, react_jsx_runtime.jsx)("svg", {
    		xmlns: "http://www.w3.org/2000/svg",
    		viewBox: "0 0 25 32",
    		children: (0, react_jsx_runtime.jsx)("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" })
    	});
    }
    function UnlockIcon() {
    	return (0, react_jsx_runtime.jsx)("svg", {
    		xmlns: "http://www.w3.org/2000/svg",
    		viewBox: "0 0 25 32",
    		children: (0, react_jsx_runtime.jsx)("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z" })
    	});
    }
    /**
    * You can add buttons to the control panel by using the `<ControlButton />` component
    * and pass it as a child to the [`<Controls />`](/api-reference/components/controls) component.
    *
    * @public
    * @example
    *```jsx
    *import { MagicWand } from '@radix-ui/react-icons'
    *import { ReactFlow, Controls, ControlButton } from '@xyflow/react'
    *
    *export default function Flow() {
    *  return (
    *    <ReactFlow nodes={[...]} edges={[...]}>
    *      <Controls>
    *        <ControlButton onClick={() => alert('Something magical just happened. ✨')}>
    *          <MagicWand />
    *        </ControlButton>
    *      </Controls>
    *    </ReactFlow>
    *  )
    *}
    *```
    */
    function ControlButton({ children, className, ...rest }) {
    	return (0, react_jsx_runtime.jsx)("button", {
    		type: "button",
    		className: cc(["react-flow__controls-button", className]),
    		...rest,
    		children
    	});
    }
    const selector$2 = (s) => ({
    	isInteractive: s.nodesDraggable || s.nodesConnectable || s.elementsSelectable,
    	minZoomReached: s.transform[2] <= s.minZoom,
    	maxZoomReached: s.transform[2] >= s.maxZoom,
    	ariaLabelConfig: s.ariaLabelConfig
    });
    function ControlsComponent({ style, showZoom = true, showFitView = true, showInteractive = true, fitViewOptions, onZoomIn, onZoomOut, onFitView, onInteractiveChange, className, children, position = "bottom-left", orientation = "vertical", "aria-label": ariaLabel }) {
    	const store = useStoreApi();
    	const { isInteractive, minZoomReached, maxZoomReached, ariaLabelConfig } = useStore(selector$2, shallow$1);
    	const { zoomIn, zoomOut, fitView } = useReactFlow();
    	const onZoomInHandler = () => {
    		zoomIn();
    		onZoomIn?.();
    	};
    	const onZoomOutHandler = () => {
    		zoomOut();
    		onZoomOut?.();
    	};
    	const onFitViewHandler = () => {
    		fitView(fitViewOptions);
    		onFitView?.();
    	};
    	const onToggleInteractivity = () => {
    		store.setState({
    			nodesDraggable: !isInteractive,
    			nodesConnectable: !isInteractive,
    			elementsSelectable: !isInteractive
    		});
    		onInteractiveChange?.(!isInteractive);
    	};
    	return (0, react_jsx_runtime.jsxs)(Panel, {
    		className: cc([
    			"react-flow__controls",
    			orientation === "horizontal" ? "horizontal" : "vertical",
    			className
    		]),
    		position,
    		style,
    		"data-testid": "rf__controls",
    		"aria-label": ariaLabel ?? ariaLabelConfig["controls.ariaLabel"],
    		children: [
    			showZoom && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(ControlButton, {
    				onClick: onZoomInHandler,
    				className: "react-flow__controls-zoomin",
    				title: ariaLabelConfig["controls.zoomIn.ariaLabel"],
    				"aria-label": ariaLabelConfig["controls.zoomIn.ariaLabel"],
    				disabled: maxZoomReached,
    				children: (0, react_jsx_runtime.jsx)(PlusIcon, {})
    			}), (0, react_jsx_runtime.jsx)(ControlButton, {
    				onClick: onZoomOutHandler,
    				className: "react-flow__controls-zoomout",
    				title: ariaLabelConfig["controls.zoomOut.ariaLabel"],
    				"aria-label": ariaLabelConfig["controls.zoomOut.ariaLabel"],
    				disabled: minZoomReached,
    				children: (0, react_jsx_runtime.jsx)(MinusIcon, {})
    			})] }),
    			showFitView && (0, react_jsx_runtime.jsx)(ControlButton, {
    				className: "react-flow__controls-fitview",
    				onClick: onFitViewHandler,
    				title: ariaLabelConfig["controls.fitView.ariaLabel"],
    				"aria-label": ariaLabelConfig["controls.fitView.ariaLabel"],
    				children: (0, react_jsx_runtime.jsx)(FitViewIcon, {})
    			}),
    			showInteractive && (0, react_jsx_runtime.jsx)(ControlButton, {
    				className: "react-flow__controls-interactive",
    				onClick: onToggleInteractivity,
    				title: ariaLabelConfig["controls.interactive.ariaLabel"],
    				"aria-label": ariaLabelConfig["controls.interactive.ariaLabel"],
    				children: isInteractive ? (0, react_jsx_runtime.jsx)(UnlockIcon, {}) : (0, react_jsx_runtime.jsx)(LockIcon, {})
    			}),
    			children
    		]
    	});
    }
    ControlsComponent.displayName = "Controls";
    /**
    * The `<Controls />` component renders a small panel that contains convenient
    * buttons to zoom in, zoom out, fit the view, and lock the viewport.
    *
    * @public
    * @example
    *```tsx
    *import { ReactFlow, Controls } from '@xyflow/react'
    *
    *export default function Flow() {
    *  return (
    *    <ReactFlow nodes={[...]} edges={[...]}>
    *      <Controls />
    *    </ReactFlow>
    *  )
    *}
    *```
    *
    * @remarks To extend or customise the controls, you can use the [`<ControlButton />`](/api-reference/components/control-button) component
    *
    */
    const Controls = (0, react.memo)(ControlsComponent);
    function MiniMapNodeComponent({ id, x, y, width, height, style, color, strokeColor, strokeWidth, className, borderRadius, shapeRendering, selected, onClick }) {
    	const { background, backgroundColor } = style || {};
    	const fill = color || background || backgroundColor;
    	return (0, react_jsx_runtime.jsx)("rect", {
    		className: cc([
    			"react-flow__minimap-node",
    			{ selected },
    			className
    		]),
    		x,
    		y,
    		rx: borderRadius,
    		ry: borderRadius,
    		width,
    		height,
    		style: {
    			fill,
    			stroke: strokeColor,
    			strokeWidth
    		},
    		shapeRendering,
    		onClick: onClick ? (event) => onClick(event, id) : void 0
    	});
    }
    const MiniMapNode = (0, react.memo)(MiniMapNodeComponent);
    const selectorNodeIds = (s) => s.nodes.map((node) => node.id);
    const getAttrFunction = (func) => func instanceof Function ? func : () => func;
    function MiniMapNodes({ nodeStrokeColor, nodeColor, nodeClassName = "", nodeBorderRadius = 5, nodeStrokeWidth, nodeComponent: NodeComponent = MiniMapNode, onClick }) {
    	const nodeIds = useStore(selectorNodeIds, shallow$1);
    	const nodeColorFunc = getAttrFunction(nodeColor);
    	const nodeStrokeColorFunc = getAttrFunction(nodeStrokeColor);
    	const nodeClassNameFunc = getAttrFunction(nodeClassName);
    	const shapeRendering = typeof window === "undefined" || !!window.chrome ? "crispEdges" : "geometricPrecision";
    	return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: nodeIds.map((nodeId) => (0, react_jsx_runtime.jsx)(NodeComponentWrapper, {
    		id: nodeId,
    		nodeColorFunc,
    		nodeStrokeColorFunc,
    		nodeClassNameFunc,
    		nodeBorderRadius,
    		nodeStrokeWidth,
    		NodeComponent,
    		onClick,
    		shapeRendering
    	}, nodeId)) });
    }
    function NodeComponentWrapperInner({ id, nodeColorFunc, nodeStrokeColorFunc, nodeClassNameFunc, nodeBorderRadius, nodeStrokeWidth, shapeRendering, NodeComponent, onClick }) {
    	const { node, x, y, width, height } = useStore((s) => {
    		const node = s.nodeLookup.get(id);
    		if (!node) return {
    			node: void 0,
    			x: 0,
    			y: 0,
    			width: 0,
    			height: 0
    		};
    		const userNode = node.internals.userNode;
    		const { x, y } = node.internals.positionAbsolute;
    		const { width, height } = getNodeDimensions(userNode);
    		return {
    			node: userNode,
    			x,
    			y,
    			width,
    			height
    		};
    	}, shallow$1);
    	if (!node || node.hidden || !nodeHasDimensions(node)) return null;
    	return (0, react_jsx_runtime.jsx)(NodeComponent, {
    		x,
    		y,
    		width,
    		height,
    		style: node.style,
    		selected: !!node.selected,
    		className: nodeClassNameFunc(node),
    		color: nodeColorFunc(node),
    		borderRadius: nodeBorderRadius,
    		strokeColor: nodeStrokeColorFunc(node),
    		strokeWidth: nodeStrokeWidth,
    		shapeRendering,
    		onClick,
    		id: node.id
    	});
    }
    const NodeComponentWrapper = (0, react.memo)(NodeComponentWrapperInner);
    var MiniMapNodes$1 = (0, react.memo)(MiniMapNodes);
    const defaultWidth = 200;
    const defaultHeight = 150;
    const filterHidden = (node) => !node.hidden;
    const selector$1 = (s) => {
    	const viewBB = {
    		x: -s.transform[0] / s.transform[2],
    		y: -s.transform[1] / s.transform[2],
    		width: s.width / s.transform[2],
    		height: s.height / s.transform[2]
    	};
    	let hasVisibleNode = false;
    	for (const node of s.nodeLookup.values()) if (!node.hidden) {
    		hasVisibleNode = true;
    		break;
    	}
    	return {
    		viewBB,
    		boundingRect: hasVisibleNode ? getBoundsOfRects(getInternalNodesBounds(s.nodeLookup, { filter: filterHidden }), viewBB) : viewBB,
    		rfId: s.rfId,
    		panZoom: s.panZoom,
    		translateExtent: s.translateExtent,
    		flowWidth: s.width,
    		flowHeight: s.height,
    		ariaLabelConfig: s.ariaLabelConfig
    	};
    };
    const rectEqual = (a, b) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
    const areEqual = (a, b) => rectEqual(a.viewBB, b.viewBB) && rectEqual(a.boundingRect, b.boundingRect) && a.rfId === b.rfId && a.panZoom === b.panZoom && a.translateExtent === b.translateExtent && a.flowWidth === b.flowWidth && a.flowHeight === b.flowHeight && a.ariaLabelConfig === b.ariaLabelConfig;
    const ARIA_LABEL_KEY = "react-flow__minimap-desc";
    function MiniMapComponent({ style, className, nodeStrokeColor, nodeColor, nodeClassName = "", nodeBorderRadius = 5, nodeStrokeWidth, nodeComponent, bgColor, maskColor, maskStrokeColor, maskStrokeWidth, position = "bottom-right", onClick, onNodeClick, pannable = false, zoomable = false, ariaLabel, inversePan, zoomStep = 1, offsetScale = 5 }) {
    	const store = useStoreApi();
    	const svg = (0, react.useRef)(null);
    	const { boundingRect, panZoom, viewBB, rfId, translateExtent, flowWidth, flowHeight, ariaLabelConfig } = useStore(selector$1, areEqual);
    	const elementWidth = style?.width ?? defaultWidth;
    	const elementHeight = style?.height ?? defaultHeight;
    	const scaledWidth = boundingRect.width / elementWidth;
    	const scaledHeight = boundingRect.height / elementHeight;
    	const viewScale = Math.max(scaledWidth, scaledHeight);
    	const viewWidth = viewScale * elementWidth;
    	const viewHeight = viewScale * elementHeight;
    	const offset = offsetScale * viewScale;
    	const x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
    	const y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;
    	const width = viewWidth + offset * 2;
    	const height = viewHeight + offset * 2;
    	const labelledBy = `${ARIA_LABEL_KEY}-${rfId}`;
    	const viewScaleRef = (0, react.useRef)(0);
    	const minimapInstance = (0, react.useRef)();
    	viewScaleRef.current = viewScale;
    	(0, react.useEffect)(() => {
    		const currentPanZoom = store.getState().panZoom;
    		if (svg.current && currentPanZoom) {
    			minimapInstance.current = XYMinimap({
    				domNode: svg.current,
    				panZoom: currentPanZoom,
    				getTransform: () => store.getState().transform,
    				getViewScale: () => viewScaleRef.current
    			});
    			return () => {
    				minimapInstance.current?.destroy();
    			};
    		}
    	}, [panZoom]);
    	(0, react.useEffect)(() => {
    		minimapInstance.current?.update({
    			translateExtent,
    			width: flowWidth,
    			height: flowHeight,
    			inversePan,
    			pannable,
    			zoomStep,
    			zoomable
    		});
    	}, [
    		pannable,
    		zoomable,
    		inversePan,
    		zoomStep,
    		translateExtent,
    		flowWidth,
    		flowHeight
    	]);
    	const onSvgClick = onClick ? (event) => {
    		const [x, y] = minimapInstance.current?.pointer(event) || [0, 0];
    		onClick(event, {
    			x,
    			y
    		});
    	} : void 0;
    	const nodeClickHandler = (0, react.useCallback)((event, nodeId) => {
    		const node = store.getState().nodeLookup.get(nodeId).internals.userNode;
    		onNodeClick?.(event, node);
    	}, [onNodeClick]);
    	const onSvgNodeClick = onNodeClick ? nodeClickHandler : void 0;
    	const _ariaLabel = ariaLabel ?? ariaLabelConfig["minimap.ariaLabel"];
    	return (0, react_jsx_runtime.jsx)(Panel, {
    		position,
    		style: {
    			...style,
    			"--xy-minimap-background-color-props": typeof bgColor === "string" ? bgColor : void 0,
    			"--xy-minimap-mask-background-color-props": typeof maskColor === "string" ? maskColor : void 0,
    			"--xy-minimap-mask-stroke-color-props": typeof maskStrokeColor === "string" ? maskStrokeColor : void 0,
    			"--xy-minimap-mask-stroke-width-props": typeof maskStrokeWidth === "number" ? maskStrokeWidth * viewScale : void 0,
    			"--xy-minimap-node-background-color-props": typeof nodeColor === "string" ? nodeColor : void 0,
    			"--xy-minimap-node-stroke-color-props": typeof nodeStrokeColor === "string" ? nodeStrokeColor : void 0,
    			"--xy-minimap-node-stroke-width-props": typeof nodeStrokeWidth === "number" ? nodeStrokeWidth : void 0
    		},
    		className: cc(["react-flow__minimap", className]),
    		"data-testid": "rf__minimap",
    		children: (0, react_jsx_runtime.jsxs)("svg", {
    			width: elementWidth,
    			height: elementHeight,
    			viewBox: `${x} ${y} ${width} ${height}`,
    			className: "react-flow__minimap-svg",
    			role: "img",
    			"aria-labelledby": labelledBy,
    			ref: svg,
    			onClick: onSvgClick,
    			children: [
    				_ariaLabel && (0, react_jsx_runtime.jsx)("title", {
    					id: labelledBy,
    					children: _ariaLabel
    				}),
    				(0, react_jsx_runtime.jsx)(MiniMapNodes$1, {
    					onClick: onSvgNodeClick,
    					nodeColor,
    					nodeStrokeColor,
    					nodeBorderRadius,
    					nodeClassName,
    					nodeStrokeWidth,
    					nodeComponent
    				}),
    				(0, react_jsx_runtime.jsx)("path", {
    					className: "react-flow__minimap-mask",
    					d: `M${x - offset},${y - offset}h${width + offset * 2}v${height + offset * 2}h${-width - offset * 2}z
            M${viewBB.x},${viewBB.y}h${viewBB.width}v${viewBB.height}h${-viewBB.width}z`,
    					fillRule: "evenodd",
    					pointerEvents: "none"
    				})
    			]
    		})
    	});
    }
    MiniMapComponent.displayName = "MiniMap";
    (0, react.memo)(MiniMapComponent);
    const scaleSelector = (calculateScale) => (store) => calculateScale ? `${Math.max(1 / store.transform[2], 1)}` : void 0;
    const defaultPositions = {
    	[ResizeControlVariant.Line]: "right",
    	[ResizeControlVariant.Handle]: "bottom-right"
    };
    function ResizeControl({ nodeId, position, variant = ResizeControlVariant.Handle, className, style = void 0, children, color, minWidth = 10, minHeight = 10, maxWidth = Number.MAX_VALUE, maxHeight = Number.MAX_VALUE, keepAspectRatio = false, resizeDirection, autoScale = true, shouldResize, onResizeStart, onResize, onResizeEnd }) {
    	const contextNodeId = useNodeId();
    	const id = typeof nodeId === "string" ? nodeId : contextNodeId;
    	const store = useStoreApi();
    	const resizeControlRef = (0, react.useRef)(null);
    	const isHandleControl = variant === ResizeControlVariant.Handle;
    	const scale = useStore((0, react.useCallback)(scaleSelector(isHandleControl && autoScale), [isHandleControl, autoScale]), shallow$1);
    	const resizer = (0, react.useRef)(null);
    	const controlPosition = position ?? defaultPositions[variant];
    	(0, react.useEffect)(() => {
    		if (!resizeControlRef.current || !id) return;
    		if (!resizer.current) resizer.current = XYResizer({
    			domNode: resizeControlRef.current,
    			nodeId: id,
    			getStoreItems: () => {
    				const { nodeLookup, transform, snapGrid, snapToGrid, nodeOrigin, domNode } = store.getState();
    				return {
    					nodeLookup,
    					transform,
    					snapGrid,
    					snapToGrid,
    					nodeOrigin,
    					paneDomNode: domNode
    				};
    			},
    			onChange: (change, childChanges) => {
    				const { triggerNodeChanges, nodeLookup, parentLookup, nodeOrigin } = store.getState();
    				const changes = [];
    				const nextPosition = {
    					x: change.x,
    					y: change.y
    				};
    				const node = nodeLookup.get(id);
    				if (node && node.expandParent && node.parentId) {
    					const origin = node.origin ?? nodeOrigin;
    					const width = change.width ?? node.measured.width ?? 0;
    					const height = change.height ?? node.measured.height ?? 0;
    					const parentExpandChanges = handleExpandParent([{
    						id: node.id,
    						parentId: node.parentId,
    						rect: {
    							width,
    							height,
    							...evaluateAbsolutePosition({
    								x: change.x ?? node.position.x,
    								y: change.y ?? node.position.y
    							}, {
    								width,
    								height
    							}, node.parentId, nodeLookup, origin)
    						}
    					}], nodeLookup, parentLookup, nodeOrigin);
    					changes.push(...parentExpandChanges);
    					nextPosition.x = change.x ? Math.max(origin[0] * width, change.x) : void 0;
    					nextPosition.y = change.y ? Math.max(origin[1] * height, change.y) : void 0;
    				}
    				if (nextPosition.x !== void 0 && nextPosition.y !== void 0) {
    					const positionChange = {
    						id,
    						type: "position",
    						position: { ...nextPosition }
    					};
    					changes.push(positionChange);
    				}
    				if (change.width !== void 0 && change.height !== void 0) {
    					const dimensionChange = {
    						id,
    						type: "dimensions",
    						resizing: true,
    						setAttributes: !resizeDirection ? true : resizeDirection === "horizontal" ? "width" : "height",
    						dimensions: {
    							width: change.width,
    							height: change.height
    						}
    					};
    					changes.push(dimensionChange);
    				}
    				for (const childChange of childChanges) {
    					const positionChange = {
    						...childChange,
    						type: "position"
    					};
    					changes.push(positionChange);
    				}
    				triggerNodeChanges(changes);
    			},
    			onEnd: ({ width, height }) => {
    				const dimensionChange = {
    					id,
    					type: "dimensions",
    					resizing: false,
    					dimensions: {
    						width,
    						height
    					}
    				};
    				store.getState().triggerNodeChanges([dimensionChange]);
    			}
    		});
    		resizer.current.update({
    			controlPosition,
    			boundaries: {
    				minWidth,
    				minHeight,
    				maxWidth,
    				maxHeight
    			},
    			keepAspectRatio,
    			resizeDirection,
    			onResizeStart,
    			onResize,
    			onResizeEnd,
    			shouldResize
    		});
    		return () => {
    			resizer.current?.destroy();
    		};
    	}, [
    		controlPosition,
    		minWidth,
    		minHeight,
    		maxWidth,
    		maxHeight,
    		keepAspectRatio,
    		onResizeStart,
    		onResize,
    		onResizeEnd,
    		shouldResize
    	]);
    	const positionClassNames = controlPosition.split("-");
    	return (0, react_jsx_runtime.jsx)("div", {
    		className: cc([
    			"react-flow__resize-control",
    			"nodrag",
    			...positionClassNames,
    			variant,
    			className
    		]),
    		ref: resizeControlRef,
    		style: {
    			...style,
    			scale,
    			...color && { [isHandleControl ? "backgroundColor" : "borderColor"]: color }
    		},
    		children
    	});
    }
    (0, react.memo)(ResizeControl);
    //#endregion
    //#region \0dsh-raw-css:node_modules/@xyflow/react/dist/style.css.mjs
    const css = "/* this gets exported as style.css and can be used for the default theming */\n/* these are the necessary styles for React/Svelte Flow, they get used by base.css and style.css */\n.react-flow {\n  direction: ltr;\n\n  --xy-edge-stroke-default: #b1b1b7;\n  --xy-edge-stroke-width-default: 1;\n  --xy-edge-stroke-selected-default: #555;\n\n  --xy-connectionline-stroke-default: #b1b1b7;\n  --xy-connectionline-stroke-width-default: 1;\n\n  --xy-attribution-background-color-default: rgba(255, 255, 255, 0.5);\n\n  --xy-minimap-background-color-default: #fff;\n  --xy-minimap-mask-background-color-default: rgba(240, 240, 240, 0.6);\n  --xy-minimap-mask-stroke-color-default: transparent;\n  --xy-minimap-mask-stroke-width-default: 1;\n  --xy-minimap-node-background-color-default: #e2e2e2;\n  --xy-minimap-node-stroke-color-default: transparent;\n  --xy-minimap-node-stroke-width-default: 2;\n\n  --xy-background-color-default: transparent;\n  --xy-background-pattern-dots-color-default: #91919a;\n  --xy-background-pattern-lines-color-default: #eee;\n  --xy-background-pattern-cross-color-default: #e2e2e2;\n  background-color: var(--xy-background-color, var(--xy-background-color-default));\n  --xy-node-color-default: inherit;\n  --xy-node-border-default: 1px solid #1a192b;\n  --xy-node-background-color-default: #fff;\n  --xy-node-group-background-color-default: rgba(240, 240, 240, 0.25);\n  --xy-node-boxshadow-hover-default: 0 1px 4px 1px rgba(0, 0, 0, 0.08);\n  --xy-node-boxshadow-selected-default: 0 0 0 0.5px #1a192b;\n  --xy-node-border-radius-default: 3px;\n\n  --xy-handle-background-color-default: #1a192b;\n  --xy-handle-border-color-default: #fff;\n\n  --xy-selection-background-color-default: rgba(0, 89, 220, 0.08);\n  --xy-selection-border-default: 1px dotted rgba(0, 89, 220, 0.8);\n\n  --xy-controls-button-background-color-default: #fefefe;\n  --xy-controls-button-background-color-hover-default: #f4f4f4;\n  --xy-controls-button-color-default: inherit;\n  --xy-controls-button-color-hover-default: inherit;\n  --xy-controls-button-border-color-default: #eee;\n  --xy-controls-box-shadow-default: 0 0 2px 1px rgba(0, 0, 0, 0.08);\n\n  --xy-edge-label-background-color-default: #ffffff;\n  --xy-edge-label-color-default: inherit;\n  --xy-resize-background-color-default: #3367d9;\n}\n.react-flow.dark {\n  --xy-edge-stroke-default: #3e3e3e;\n  --xy-edge-stroke-width-default: 1;\n  --xy-edge-stroke-selected-default: #727272;\n\n  --xy-connectionline-stroke-default: #b1b1b7;\n  --xy-connectionline-stroke-width-default: 1;\n\n  --xy-attribution-background-color-default: rgba(150, 150, 150, 0.25);\n\n  --xy-minimap-background-color-default: #141414;\n  --xy-minimap-mask-background-color-default: rgba(60, 60, 60, 0.6);\n  --xy-minimap-mask-stroke-color-default: transparent;\n  --xy-minimap-mask-stroke-width-default: 1;\n  --xy-minimap-node-background-color-default: #2b2b2b;\n  --xy-minimap-node-stroke-color-default: transparent;\n  --xy-minimap-node-stroke-width-default: 2;\n\n  --xy-background-color-default: #141414;\n  --xy-background-pattern-dots-color-default: #555;\n  --xy-background-pattern-lines-color-default: #333;\n  --xy-background-pattern-cross-color-default: #333;\n  --xy-node-color-default: #f8f8f8;\n  --xy-node-border-default: 1px solid #3c3c3c;\n  --xy-node-background-color-default: #1e1e1e;\n  --xy-node-group-background-color-default: rgba(240, 240, 240, 0.25);\n  --xy-node-boxshadow-hover-default: 0 1px 4px 1px rgba(255, 255, 255, 0.08);\n  --xy-node-boxshadow-selected-default: 0 0 0 0.5px #999;\n\n  --xy-handle-background-color-default: #bebebe;\n  --xy-handle-border-color-default: #1e1e1e;\n\n  --xy-selection-background-color-default: rgba(200, 200, 220, 0.08);\n  --xy-selection-border-default: 1px dotted rgba(200, 200, 220, 0.8);\n\n  --xy-controls-button-background-color-default: #2b2b2b;\n  --xy-controls-button-background-color-hover-default: #3e3e3e;\n  --xy-controls-button-color-default: #f8f8f8;\n  --xy-controls-button-color-hover-default: #fff;\n  --xy-controls-button-border-color-default: #5b5b5b;\n  --xy-controls-box-shadow-default: 0 0 2px 1px rgba(0, 0, 0, 0.08);\n\n  --xy-edge-label-background-color-default: #141414;\n  --xy-edge-label-color-default: #f8f8f8;\n}\n.react-flow__background {\n  background-color: var(--xy-background-color-props, var(--xy-background-color, var(--xy-background-color-default)));\n  pointer-events: none;\n  z-index: -1;\n}\n.react-flow__container {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  top: 0;\n  left: 0;\n}\n.react-flow__pane {\n  z-index: 1;\n  touch-action: none;\n}\n.react-flow__pane.draggable {\n    cursor: grab;\n  }\n.react-flow__pane.dragging {\n    cursor: grabbing;\n  }\n.react-flow__pane.selection {\n    cursor: pointer;\n  }\n.react-flow__viewport {\n  transform-origin: 0 0;\n  z-index: 2;\n  pointer-events: none;\n}\n.react-flow__renderer {\n  z-index: 4;\n}\n.react-flow__selection {\n  z-index: 6;\n}\n.react-flow__nodesselection-rect:focus,\n.react-flow__nodesselection-rect:focus-visible {\n  outline: none;\n}\n.react-flow__edge-path {\n  stroke: var(--xy-edge-stroke, var(--xy-edge-stroke-default));\n  stroke-width: var(--xy-edge-stroke-width, var(--xy-edge-stroke-width-default));\n  fill: none;\n}\n.react-flow__connection-path {\n  stroke: var(--xy-connectionline-stroke, var(--xy-connectionline-stroke-default));\n  stroke-width: var(--xy-connectionline-stroke-width, var(--xy-connectionline-stroke-width-default));\n  fill: none;\n}\n.react-flow .react-flow__edges {\n  position: absolute;\n}\n.react-flow .react-flow__edges svg {\n    overflow: visible;\n    position: absolute;\n    pointer-events: none;\n  }\n.react-flow__edge {\n  pointer-events: visibleStroke;\n}\n.react-flow__edge.selectable {\n    cursor: pointer;\n  }\n.react-flow__edge.animated path {\n    stroke-dasharray: 5;\n    animation: dashdraw 0.5s linear infinite;\n  }\n.react-flow__edge.animated path.react-flow__edge-interaction {\n    stroke-dasharray: none;\n    animation: none;\n  }\n.react-flow__edge.inactive {\n    pointer-events: none;\n  }\n.react-flow__edge.selected,\n  .react-flow__edge:focus,\n  .react-flow__edge:focus-visible {\n    outline: none;\n  }\n.react-flow__edge.selected .react-flow__edge-path,\n  .react-flow__edge.selectable:focus .react-flow__edge-path,\n  .react-flow__edge.selectable:focus-visible .react-flow__edge-path {\n    stroke: var(--xy-edge-stroke-selected, var(--xy-edge-stroke-selected-default));\n  }\n.react-flow__edge-textwrapper {\n    pointer-events: all;\n  }\n.react-flow__edge .react-flow__edge-text {\n    pointer-events: none;\n    -webkit-user-select: none;\n       -moz-user-select: none;\n            user-select: none;\n  }\n/* Arrowhead marker styles - use CSS custom properties as default */\n.react-flow__arrowhead polyline {\n  stroke: var(--xy-edge-stroke, var(--xy-edge-stroke-default));\n}\n.react-flow__arrowhead polyline.arrowclosed {\n  fill: var(--xy-edge-stroke, var(--xy-edge-stroke-default));\n}\n.react-flow__connection {\n  pointer-events: none;\n}\n.react-flow__connection .animated {\n    stroke-dasharray: 5;\n    animation: dashdraw 0.5s linear infinite;\n  }\nsvg.react-flow__connectionline {\n  z-index: 1001;\n  overflow: visible;\n  position: absolute;\n}\n.react-flow__nodes {\n  pointer-events: none;\n  transform-origin: 0 0;\n}\n.react-flow__node {\n  position: absolute;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n  pointer-events: all;\n  transform-origin: 0 0;\n  box-sizing: border-box;\n  cursor: default;\n}\n.react-flow__node.selectable {\n    cursor: pointer;\n  }\n.react-flow__node.draggable {\n    cursor: grab;\n    pointer-events: all;\n  }\n.react-flow__node.draggable.dragging {\n      cursor: grabbing;\n    }\n.react-flow__nodesselection {\n  z-index: 3;\n  transform-origin: left top;\n  pointer-events: none;\n}\n.react-flow__nodesselection-rect {\n    position: absolute;\n    pointer-events: all;\n    cursor: grab;\n  }\n.react-flow__handle {\n  position: absolute;\n  pointer-events: none;\n  min-width: 5px;\n  min-height: 5px;\n  width: 6px;\n  height: 6px;\n  background-color: var(--xy-handle-background-color, var(--xy-handle-background-color-default));\n  border: 1px solid var(--xy-handle-border-color, var(--xy-handle-border-color-default));\n  border-radius: 100%;\n}\n.react-flow__handle.connectingfrom {\n    pointer-events: all;\n  }\n.react-flow__handle.connectionindicator {\n    pointer-events: all;\n    cursor: crosshair;\n  }\n.react-flow__handle-bottom {\n    top: auto;\n    left: 50%;\n    bottom: 0;\n    transform: translate(-50%, 50%);\n  }\n.react-flow__handle-top {\n    top: 0;\n    left: 50%;\n    transform: translate(-50%, -50%);\n  }\n.react-flow__handle-left {\n    top: 50%;\n    left: 0;\n    transform: translate(-50%, -50%);\n  }\n.react-flow__handle-right {\n    top: 50%;\n    right: 0;\n    transform: translate(50%, -50%);\n  }\n.react-flow__edgeupdater {\n  cursor: move;\n  pointer-events: all;\n}\n.react-flow__pane.selection .react-flow__panel {\n  pointer-events: none;\n}\n.react-flow__panel {\n  position: absolute;\n  z-index: 5;\n  margin: 15px;\n}\n.react-flow__panel.top {\n    top: 0;\n  }\n.react-flow__panel.bottom {\n    bottom: 0;\n  }\n.react-flow__panel.top.center, .react-flow__panel.bottom.center {\n      left: 50%;\n      transform: translateX(-15px) translateX(-50%);\n    }\n.react-flow__panel.left {\n    left: 0;\n  }\n.react-flow__panel.right {\n    right: 0;\n  }\n.react-flow__panel.left.center, .react-flow__panel.right.center {\n      top: 50%;\n      transform: translateY(-15px) translateY(-50%);\n    }\n.react-flow__attribution {\n  font-size: 10px;\n  background: var(--xy-attribution-background-color, var(--xy-attribution-background-color-default));\n  padding: 2px 3px;\n  margin: 0;\n}\n.react-flow__attribution a {\n    text-decoration: none;\n    color: #999;\n  }\n@keyframes dashdraw {\n  from {\n    stroke-dashoffset: 10;\n  }\n}\n.react-flow__edgelabel-renderer {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n  left: 0;\n  top: 0;\n}\n.react-flow__viewport-portal {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n          user-select: none;\n}\n.react-flow__minimap {\n  background: var(\n    --xy-minimap-background-color-props,\n    var(--xy-minimap-background-color, var(--xy-minimap-background-color-default))\n  );\n}\n.react-flow__minimap-svg {\n    display: block;\n  }\n.react-flow__minimap-mask {\n    fill: var(\n      --xy-minimap-mask-background-color-props,\n      var(--xy-minimap-mask-background-color, var(--xy-minimap-mask-background-color-default))\n    );\n    stroke: var(\n      --xy-minimap-mask-stroke-color-props,\n      var(--xy-minimap-mask-stroke-color, var(--xy-minimap-mask-stroke-color-default))\n    );\n    stroke-width: var(\n      --xy-minimap-mask-stroke-width-props,\n      var(--xy-minimap-mask-stroke-width, var(--xy-minimap-mask-stroke-width-default))\n    );\n  }\n.react-flow__minimap-node {\n    fill: var(\n      --xy-minimap-node-background-color-props,\n      var(--xy-minimap-node-background-color, var(--xy-minimap-node-background-color-default))\n    );\n    stroke: var(\n      --xy-minimap-node-stroke-color-props,\n      var(--xy-minimap-node-stroke-color, var(--xy-minimap-node-stroke-color-default))\n    );\n    stroke-width: var(\n      --xy-minimap-node-stroke-width-props,\n      var(--xy-minimap-node-stroke-width, var(--xy-minimap-node-stroke-width-default))\n    );\n  }\n.react-flow__background-pattern.dots {\n    fill: var(\n      --xy-background-pattern-color-props,\n      var(--xy-background-pattern-color, var(--xy-background-pattern-dots-color-default))\n    );\n  }\n.react-flow__background-pattern.lines {\n    stroke: var(\n      --xy-background-pattern-color-props,\n      var(--xy-background-pattern-color, var(--xy-background-pattern-lines-color-default))\n    );\n  }\n.react-flow__background-pattern.cross {\n    stroke: var(\n      --xy-background-pattern-color-props,\n      var(--xy-background-pattern-color, var(--xy-background-pattern-cross-color-default))\n    );\n  }\n.react-flow__controls {\n  display: flex;\n  flex-direction: column;\n  box-shadow: var(--xy-controls-box-shadow, var(--xy-controls-box-shadow-default));\n}\n.react-flow__controls.horizontal {\n    flex-direction: row;\n  }\n.react-flow__controls-button {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    height: 26px;\n    width: 26px;\n    padding: 4px;\n    border: none;\n    background: var(--xy-controls-button-background-color, var(--xy-controls-button-background-color-default));\n    border-bottom: 1px solid\n      var(\n        --xy-controls-button-border-color-props,\n        var(--xy-controls-button-border-color, var(--xy-controls-button-border-color-default))\n      );\n    color: var(\n      --xy-controls-button-color-props,\n      var(--xy-controls-button-color, var(--xy-controls-button-color-default))\n    );\n    cursor: pointer;\n    -webkit-user-select: none;\n       -moz-user-select: none;\n            user-select: none;\n  }\n.react-flow__controls-button svg {\n      width: 100%;\n      max-width: 12px;\n      max-height: 12px;\n      fill: currentColor;\n    }\n.react-flow__edge.updating .react-flow__edge-path {\n      stroke: #777;\n    }\n.react-flow__edge-text {\n    font-size: 10px;\n  }\n.react-flow__node.selectable:focus,\n  .react-flow__node.selectable:focus-visible {\n    outline: none;\n  }\n.react-flow__node-input,\n.react-flow__node-default,\n.react-flow__node-output,\n.react-flow__node-group {\n  padding: 10px;\n  border-radius: var(--xy-node-border-radius, var(--xy-node-border-radius-default));\n  width: 150px;\n  font-size: 12px;\n  color: var(--xy-node-color, var(--xy-node-color-default));\n  text-align: center;\n  border: var(--xy-node-border, var(--xy-node-border-default));\n  background-color: var(--xy-node-background-color, var(--xy-node-background-color-default));\n}\n.react-flow__node-input.selectable:hover, .react-flow__node-default.selectable:hover, .react-flow__node-output.selectable:hover, .react-flow__node-group.selectable:hover {\n      box-shadow: var(--xy-node-boxshadow-hover, var(--xy-node-boxshadow-hover-default));\n    }\n.react-flow__node-input.selectable.selected,\n    .react-flow__node-input.selectable:focus,\n    .react-flow__node-input.selectable:focus-visible,\n    .react-flow__node-default.selectable.selected,\n    .react-flow__node-default.selectable:focus,\n    .react-flow__node-default.selectable:focus-visible,\n    .react-flow__node-output.selectable.selected,\n    .react-flow__node-output.selectable:focus,\n    .react-flow__node-output.selectable:focus-visible,\n    .react-flow__node-group.selectable.selected,\n    .react-flow__node-group.selectable:focus,\n    .react-flow__node-group.selectable:focus-visible {\n      box-shadow: var(--xy-node-boxshadow-selected, var(--xy-node-boxshadow-selected-default));\n    }\n.react-flow__node-group {\n  background-color: var(--xy-node-group-background-color, var(--xy-node-group-background-color-default));\n}\n.react-flow__nodesselection-rect,\n.react-flow__selection {\n  background: var(--xy-selection-background-color, var(--xy-selection-background-color-default));\n  border: var(--xy-selection-border, var(--xy-selection-border-default));\n}\n.react-flow__nodesselection-rect:focus,\n  .react-flow__nodesselection-rect:focus-visible,\n  .react-flow__selection:focus,\n  .react-flow__selection:focus-visible {\n    outline: none;\n  }\n.react-flow__controls-button:hover {\n      background: var(\n        --xy-controls-button-background-color-hover-props,\n        var(--xy-controls-button-background-color-hover, var(--xy-controls-button-background-color-hover-default))\n      );\n      color: var(\n        --xy-controls-button-color-hover-props,\n        var(--xy-controls-button-color-hover, var(--xy-controls-button-color-hover-default))\n      );\n    }\n.react-flow__controls-button:disabled {\n      pointer-events: none;\n    }\n.react-flow__controls-button:disabled svg {\n        fill-opacity: 0.4;\n      }\n.react-flow__controls-button:last-child {\n    border-bottom: none;\n  }\n.react-flow__controls.horizontal .react-flow__controls-button {\n    border-bottom: none;\n    border-right: 1px solid\n      var(\n        --xy-controls-button-border-color-props,\n        var(--xy-controls-button-border-color, var(--xy-controls-button-border-color-default))\n      );\n  }\n.react-flow__controls.horizontal .react-flow__controls-button:last-child {\n    border-right: none;\n  }\n.react-flow__resize-control {\n  position: absolute;\n}\n.react-flow__resize-control.left,\n.react-flow__resize-control.right {\n  cursor: ew-resize;\n}\n.react-flow__resize-control.top,\n.react-flow__resize-control.bottom {\n  cursor: ns-resize;\n}\n.react-flow__resize-control.top.left,\n.react-flow__resize-control.bottom.right {\n  cursor: nwse-resize;\n}\n.react-flow__resize-control.bottom.left,\n.react-flow__resize-control.top.right {\n  cursor: nesw-resize;\n}\n/* handle styles */\n.react-flow__resize-control.handle {\n  width: 5px;\n  height: 5px;\n  border: 1px solid #fff;\n  border-radius: 1px;\n  background-color: var(--xy-resize-background-color, var(--xy-resize-background-color-default));\n  translate: -50% -50%;\n}\n.react-flow__resize-control.handle.left {\n  left: 0;\n  top: 50%;\n}\n.react-flow__resize-control.handle.right {\n  left: 100%;\n  top: 50%;\n}\n.react-flow__resize-control.handle.top {\n  left: 50%;\n  top: 0;\n}\n.react-flow__resize-control.handle.bottom {\n  left: 50%;\n  top: 100%;\n}\n.react-flow__resize-control.handle.top.left {\n  left: 0;\n}\n.react-flow__resize-control.handle.bottom.left {\n  left: 0;\n}\n.react-flow__resize-control.handle.top.right {\n  left: 100%;\n}\n.react-flow__resize-control.handle.bottom.right {\n  left: 100%;\n}\n/* line styles */\n.react-flow__resize-control.line {\n  border-color: var(--xy-resize-background-color, var(--xy-resize-background-color-default));\n  border-width: 0;\n  border-style: solid;\n}\n.react-flow__resize-control.line.left,\n.react-flow__resize-control.line.right {\n  width: 1px;\n  transform: translate(-50%, 0);\n  top: 0;\n  height: 100%;\n}\n.react-flow__resize-control.line.left {\n  left: 0;\n  border-left-width: 1px;\n}\n.react-flow__resize-control.line.right {\n  left: 100%;\n  border-right-width: 1px;\n}\n.react-flow__resize-control.line.top,\n.react-flow__resize-control.line.bottom {\n  height: 1px;\n  transform: translate(0, -50%);\n  left: 0;\n  width: 100%;\n}\n.react-flow__resize-control.line.top {\n  top: 0;\n  border-top-width: 1px;\n}\n.react-flow__resize-control.line.bottom {\n  border-bottom-width: 1px;\n  top: 100%;\n}\n.react-flow__edge-textbg {\n  fill: var(--xy-edge-label-background-color, var(--xy-edge-label-background-color-default));\n}\n.react-flow__edge-text {\n  fill: var(--xy-edge-label-color, var(--xy-edge-label-color-default));\n}\n";
    const tagId = "@tangxiaofeng7/dsh-sast/raw";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
    	const tag = document.createElement("style");
    	tag.dataset.plugin = "@tangxiaofeng7/dsh-sast";
    	tag.dataset.pluginCss = tagId;
    	tag.textContent = css;
    	document.head.appendChild(tag);
    }
    //#endregion
    //#region src/client/graph.ts
    /** Fixed graph-card dimensions; layout spacing must leave room around them. */
    const EXPLORE_NODE_SIZE = {
    	width: 236,
    	height: 120
    };
    const ASSET_NODE_SIZE = {
    	width: 220,
    	height: 100
    };
    /** The chain edge kinds laid out by BFS depth (parent and flows_to edges belong elsewhere). */
    const CHAIN_EDGE_KINDS = /* @__PURE__ */ new Set([
    	"spawns",
    	"yields",
    	"derived_from",
    	"proves"
    ]);
    /** Assign every reachable id a BFS depth from the roots; others hang below. */
    function depthsOf(roots, edges) {
    	const depth = /* @__PURE__ */ new Map();
    	const queue = [];
    	for (const root of roots) {
    		depth.set(root, 0);
    		queue.push({
    			id: root,
    			level: 0
    		});
    	}
    	for (const { id, level } of queue) for (const edge of edges) {
    		if (edge.sourceId !== id || depth.has(edge.targetId)) continue;
    		depth.set(edge.targetId, level + 1);
    		queue.push({
    			id: edge.targetId,
    			level: level + 1
    		});
    	}
    	return depth;
    }
    /** Stack items into columns by depth, assigning x/y positions. */
    function stackByDepth(items, depth, columnGap, rowGap) {
    	const maxDepth = Math.max(0, ...depth.values());
    	const rows = /* @__PURE__ */ new Map();
    	for (const item of items) {
    		const level = depth.get(item.id) ?? maxDepth + 1;
    		const row = rows.get(level) ?? [];
    		row.push(item);
    		rows.set(level, row);
    	}
    	const placed = [];
    	for (const [level, row] of [...rows.entries()].sort((a, b) => a[0] - b[0])) for (const [index, item] of row.entries()) placed.push({
    		...item,
    		x: level * columnGap,
    		y: index * rowGap
    	});
    	return placed;
    }
    /** The display title of one folded node. */
    function titleOf(node) {
    	switch (node.kind) {
    		case "intent": return node.title;
    		case "fact": return node.detail;
    		case "finding": return node.title;
    	}
    }
    /** The display detail line of one folded node. */
    function detailOf(node) {
    	switch (node.kind) {
    		case "intent": return node.detail;
    		case "fact": return `${node.path}:${node.line} [${node.factKind}] · ${node.confidence}`;
    		case "finding": return node.description;
    	}
    }
    /**
    * Layered layout of the audit chain: the scan at column 0, every node one
    * column per hop along its chain edges (`spawns`/`yields`/`derived_from`/
    * `proves`); nodes unreachable from the scan hang in the last column.
    * `flows_to` and `parent` edges are excluded from the returned edge list —
    * callers render taint-propagation edges separately (ADR-05).
    * @param projection - the standing sast projection.
    * @returns the placed nodes and their chain edges.
    */
    function layoutExploration(projection) {
    	const edges = projection.edges.filter((edge) => CHAIN_EDGE_KINDS.has(edge.kind));
    	const flowEdges = projection.edges.filter((edge) => edge.kind === "flows_to");
    	const scanId = projection.scan === null ? "scan-1" : projection.scan.id;
    	const depth = depthsOf([scanId], edges);
    	return {
    		nodes: stackByDepth([{
    			id: scanId,
    			kind: "scan",
    			title: projection.scan === null ? "" : projection.scan.repoUrl,
    			detail: projection.scan === null ? "" : projection.scan.objective,
    			severity: void 0,
    			x: 0,
    			y: 0
    		}, ...projection.nodes.map((node) => ({
    			id: node.id,
    			kind: node.kind,
    			title: titleOf(node),
    			detail: detailOf(node),
    			severity: node.kind === "finding" ? node.severity : void 0
    		}))], depth, 320, 152),
    		edges,
    		flowEdges
    	};
    }
    /**
    * Layered layout of the asset graph: roots (assets without a parent edge) at
    * column 0, children one column deeper per parent hop.
    * @param projection - the standing sast projection.
    * @returns the placed asset nodes and their parent edges.
    */
    function layoutAssets(projection) {
    	const edges = projection.edges.filter((edge) => edge.kind === "parent");
    	const children = new Set(edges.map((edge) => edge.targetId));
    	const depth = depthsOf(projection.assets.filter((asset) => !children.has(asset.id)).map((asset) => asset.id), edges);
    	return {
    		nodes: stackByDepth(projection.assets, depth, 292, 132),
    		edges
    	};
    }
    //#endregion
    //#region src/client/GraphDetailDrawer.module.css
    var GraphDetailDrawer_module_default = {
    	"backdrop": "GraphDetailDrawer-module__backdrop",
    	"close": "GraphDetailDrawer-module__close",
    	"drawer": "GraphDetailDrawer-module__drawer",
    	"field": "GraphDetailDrawer-module__field",
    	"fields": "GraphDetailDrawer-module__fields",
    	"header": "GraphDetailDrawer-module__header",
    	"layer": "GraphDetailDrawer-module__layer",
    	"title": "GraphDetailDrawer-module__title"
    };
    //#endregion
    //#region src/client/GraphDetailDrawer.tsx
    /** A graph-scoped right drawer that keeps complete node data available. */
    function GraphDetailDrawer({ title, fields, onClose, t }) {
    	(0, react.useEffect)(() => {
    		const closeOnEscape = (event) => {
    			if (event.key === "Escape") onClose();
    		};
    		window.addEventListener("keydown", closeOnEscape);
    		return () => {
    			window.removeEventListener("keydown", closeOnEscape);
    		};
    	}, [onClose]);
    	const closeLabel = t("detail.close");
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    		className: GraphDetailDrawer_module_default.layer,
    		"data-testid": "graph-detail-drawer",
    		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
    			type: "button",
    			className: GraphDetailDrawer_module_default.backdrop,
    			"aria-hidden": "true",
    			tabIndex: -1,
    			onClick: onClose
    		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
    			className: GraphDetailDrawer_module_default.drawer,
    			"aria-label": t("detail.node"),
    			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
    				className: GraphDetailDrawer_module_default.header,
    				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
    					className: GraphDetailDrawer_module_default.title,
    					children: title
    				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
    					type: "button",
    					className: GraphDetailDrawer_module_default.close,
    					"aria-label": closeLabel,
    					onClick: onClose,
    					children: "×"
    				})]
    			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dl", {
    				className: GraphDetailDrawer_module_default.fields,
    				children: fields.filter((field) => field.value !== "").map((field) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    					className: GraphDetailDrawer_module_default.field,
    					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: field.label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: field.value })]
    				}, field.label))
    			})]
    		})]
    	});
    }
    //#endregion
    //#region src/client/AssetsView.module.css
    var AssetsView_module_default = {
    	"edgeLabel": "AssetsView-module__edgeLabel",
    	"empty": "AssetsView-module__empty",
    	"graph": "AssetsView-module__graph",
    	"group": "AssetsView-module__group",
    	"groupTitle": "AssetsView-module__groupTitle",
    	"handle": "AssetsView-module__handle",
    	"list": "AssetsView-module__list",
    	"modeBar": "AssetsView-module__modeBar",
    	"modeButton": "AssetsView-module__modeButton",
    	"node": "AssetsView-module__node",
    	"nodeBadge": "AssetsView-module__nodeBadge",
    	"nodeMeta": "AssetsView-module__nodeMeta",
    	"nodeValue": "AssetsView-module__nodeValue",
    	"root": "AssetsView-module__root",
    	"row": "AssetsView-module__row",
    	"rowMeta": "AssetsView-module__rowMeta",
    	"rowParent": "AssetsView-module__rowParent",
    	"rows": "AssetsView-module__rows",
    	"rowValue": "AssetsView-module__rowValue"
    };
    //#endregion
    //#region src/client/AssetsView.tsx
    /**
    * AssetsView: the 代码资产 sub-tab of the 白盒审计 view, with a 列表/图 mode
    * toggle. List mode groups assets by type (repo → module → file →
    * entrypoint → package → datastore) and shows each parent link inline;
    * graph mode renders the parent-child asset tree with @xyflow/react
    * (positions from the pure `layoutAssets` helper).
    */
    /** Asset type label keys, in display order. */
    const ASSET_TYPES = [
    	"repo",
    	"module",
    	"file",
    	"entrypoint",
    	"package",
    	"datastore"
    ];
    /** Asset type badge label keys. */
    const TYPE_LABELS = {
    	repo: "asset.type.repo",
    	module: "asset.type.module",
    	file: "asset.type.file",
    	entrypoint: "asset.type.entrypoint",
    	package: "asset.type.package",
    	datastore: "asset.type.datastore"
    };
    /** Resolve the parent value of every asset from the parent edges. */
    function rowsOf(projection) {
    	return projection.assets.map((asset) => {
    		const parentEdge = projection.edges.find((edge) => edge.kind === "parent" && edge.targetId === asset.id);
    		const parent = parentEdge === void 0 ? void 0 : projection.assets.find((candidate) => candidate.id === parentEdge.sourceId);
    		return {
    			id: asset.id,
    			type: asset.type,
    			value: asset.value,
    			meta: asset.meta,
    			parentValue: parent?.value ?? ""
    		};
    	});
    }
    /** Group asset rows by type in display order. */
    function groupByType(rows) {
    	return ASSET_TYPES.map((type) => ({
    		type,
    		rows: rows.filter((row) => row.type === type)
    	})).filter((group) => group.rows.length > 0);
    }
    /** List mode: sections per asset type with inline parent links. */
    function AssetList({ sast, t }) {
    	const groups = groupByType(rowsOf(sast));
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
    		className: AssetsView_module_default.list,
    		"data-testid": "sast-assets-list",
    		children: groups.map((group) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
    			className: AssetsView_module_default.group,
    			"data-testid": "sast-asset-group",
    			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
    				className: AssetsView_module_default.groupTitle,
    				children: t(TYPE_LABELS[group.type])
    			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
    				className: AssetsView_module_default.rows,
    				children: group.rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
    					className: AssetsView_module_default.row,
    					"data-testid": "sast-asset-row",
    					children: [
    						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    							className: AssetsView_module_default.rowValue,
    							children: row.value
    						}),
    						row.meta !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
    							className: AssetsView_module_default.rowMeta,
    							children: [
    								"（",
    								row.meta,
    								"）"
    							]
    						}),
    						row.parentValue !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
    							className: AssetsView_module_default.rowParent,
    							children: ["← ", row.parentValue]
    						})
    					]
    				}, row.id))
    			})]
    		}, group.type))
    	});
    }
    /** One custom flow node: an asset-type badge over the value, with source/target handles. */
    function AssetFlowNode({ data, t }) {
    	const asset = data.asset;
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    		className: AssetsView_module_default.node,
    		"data-type": asset.type,
    		"data-testid": "explore-node-asset",
    		children: [
    			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Handle, {
    				type: "target",
    				position: Position.Left,
    				className: AssetsView_module_default.handle
    			}),
    			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    				className: AssetsView_module_default.nodeBadge,
    				children: t(TYPE_LABELS[asset.type])
    			}),
    			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    				className: AssetsView_module_default.nodeValue,
    				title: asset.value,
    				children: asset.value
    			}),
    			asset.meta !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    				className: AssetsView_module_default.nodeMeta,
    				title: asset.meta,
    				children: asset.meta
    			}),
    			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Handle, {
    				type: "source",
    				position: Position.Right,
    				className: AssetsView_module_default.handle
    			})
    		]
    	});
    }
    /** One custom edge: a bezier curve with a visible 隶属 pill at its midpoint. */
    function AssetEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label }) {
    	const [path, labelX, labelY] = getBezierPath({
    		sourceX,
    		sourceY,
    		sourcePosition,
    		targetPosition,
    		targetX,
    		targetY
    	});
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BaseEdge, {
    		id,
    		path
    	}), label !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EdgeLabelRenderer, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
    		className: AssetsView_module_default.edgeLabel,
    		style: { transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` },
    		children: label
    	}) })] });
    }
    /** Graph mode: the parent-child asset tree. */
    function AssetGraph({ sast, t }) {
    	const { nodes, edges } = (0, react.useMemo)(() => layoutAssets(sast), [sast]);
    	const [selectedAsset, setSelectedAsset] = (0, react.useState)(null);
    	const flowNodes = (0, react.useMemo)(() => nodes.map((node) => ({
    		id: node.id,
    		type: "sast",
    		position: {
    			x: node.x,
    			y: node.y
    		},
    		data: { asset: node },
    		style: ASSET_NODE_SIZE
    	})), [nodes]);
    	const flowEdges = (0, react.useMemo)(() => edges.map((edge) => ({
    		id: edge.id,
    		type: "sast",
    		source: edge.sourceId,
    		target: edge.targetId,
    		label: t("edge.parent")
    	})), [edges, t]);
    	const nodeTypes = (0, react.useMemo)(() => ({ sast: (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetFlowNode, {
    		...props,
    		t
    	}) }), [t]);
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    		className: AssetsView_module_default.graph,
    		"data-testid": "sast-assets-graph",
    		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(index, {
    			nodes: flowNodes,
    			edges: flowEdges,
    			nodeTypes,
    			edgeTypes: { sast: AssetEdge },
    			fitView: true,
    			fitViewOptions: { padding: .25 },
    			proOptions: { hideAttribution: true },
    			onNodeClick: (_, flowNode) => {
    				setSelectedAsset(flowNode.data.asset);
    			},
    			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Background, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Controls, { showInteractive: false })]
    		}), selectedAsset !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphDetailDrawer, {
    			title: selectedAsset.value,
    			fields: [
    				{
    					label: t("detail.field.assetType"),
    					value: t(TYPE_LABELS[selectedAsset.type])
    				},
    				{
    					label: t("detail.field.assetValue"),
    					value: selectedAsset.value
    				},
    				{
    					label: t("detail.field.meta"),
    					value: selectedAsset.meta
    				}
    			],
    			onClose: () => {
    				setSelectedAsset(null);
    			},
    			t
    		})]
    	});
    }
    function AssetsView({ sast, t }) {
    	const [mode, setMode] = (0, react.useState)("list");
    	if (sast.assets.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    		className: AssetsView_module_default.empty,
    		"data-testid": "sast-assets-empty",
    		children: t("assets.empty")
    	});
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    		className: AssetsView_module_default.root,
    		"data-testid": "sast-assets",
    		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
    			className: AssetsView_module_default.modeBar,
    			children: ["list", "graph"].map((modeKey) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
    				type: "button",
    				className: AssetsView_module_default.modeButton,
    				"aria-pressed": mode === modeKey,
    				"data-testid": `sast-assets-mode-${modeKey}`,
    				onClick: () => {
    					setMode(modeKey);
    				},
    				children: t(modeKey === "list" ? "assets.mode.list" : "assets.mode.graph")
    			}, modeKey))
    		}), mode === "list" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetList, {
    			sast,
    			t
    		}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetGraph, {
    			sast,
    			t
    		})]
    	});
    }
    //#endregion
    //#region src/client/BatchView.module.css
    var BatchView_module_default = {
    	"attempt": "BatchView-module__attempt",
    	"authorization": "BatchView-module__authorization",
    	"fallback": "BatchView-module__fallback",
    	"header": "BatchView-module__header",
    	"job": "BatchView-module__job",
    	"jobs": "BatchView-module__jobs",
    	"jobStatus": "BatchView-module__jobStatus",
    	"methodologies": "BatchView-module__methodologies",
    	"methodology": "BatchView-module__methodology",
    	"objective": "BatchView-module__objective",
    	"ordinal": "BatchView-module__ordinal",
    	"repoUrl": "BatchView-module__repoUrl",
    	"root": "BatchView-module__root",
    	"status": "BatchView-module__status",
    	"unaudited": "BatchView-module__unaudited"
    };
    //#endregion
    //#region src/client/BatchView.tsx
    /** Statuses that mean "this job never produced a usable audit" — the caller must render coverage as unknown, never as 0 findings (A23: never mistake "not audited" for "audited and clean"). */
    const UNAUDITED_STATUSES = /* @__PURE__ */ new Set([
    	"queued",
    	"preparing",
    	"running",
    	"retry_wait",
    	"skipped",
    	"failed",
    	"timed_out",
    	"cancelled"
    ]);
    const JOB_STATUS_LABELS = {
    	queued: "batch.job.status.queued",
    	preparing: "batch.job.status.preparing",
    	running: "batch.job.status.running",
    	retry_wait: "batch.job.status.retry_wait",
    	succeeded: "batch.job.status.succeeded",
    	degraded: "batch.job.status.degraded",
    	skipped: "batch.job.status.skipped",
    	failed: "batch.job.status.failed",
    	timed_out: "batch.job.status.timed_out",
    	cancelled: "batch.job.status.cancelled"
    };
    const BATCH_STATUS_LABELS = {
    	queued: "batch.status.queued",
    	running: "batch.status.running",
    	awaiting_review: "batch.status.awaiting_review",
    	completed: "batch.status.completed",
    	completed_with_issues: "batch.status.completed_with_issues"
    };
    function BatchView({ sastBatch, t }) {
    	const pendingCount = sastBatch.jobs.filter((job) => job.reviewStatus === "pending").length;
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    		className: BatchView_module_default.root,
    		"data-testid": "sast-batch-view",
    		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
    			className: BatchView_module_default.header,
    			"data-testid": "sast-batch-header",
    			children: [
    				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    					className: BatchView_module_default.objective,
    					children: t("batch.objective", { objective: sastBatch.objective })
    				}),
    				sastBatch.authorization !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    					className: BatchView_module_default.authorization,
    					children: t("batch.authorization", { authorization: sastBatch.authorization })
    				}),
    				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
    					className: BatchView_module_default.status,
    					children: [
    						t("batch.status", { status: t(BATCH_STATUS_LABELS[sastBatch.status]) }),
    						" · ",
    						t("batch.total", { total: sastBatch.total }),
    						pendingCount > 0 && ` · ${t("batch.pendingReview", { count: pendingCount })}`
    					]
    				}),
    				sastBatch.methodologies.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
    					className: BatchView_module_default.methodologies,
    					"data-testid": "sast-batch-methodologies",
    					children: sastBatch.methodologies.map((methodology) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
    						className: BatchView_module_default.methodology,
    						children: methodology.name
    					}, methodology.name))
    				})
    			]
    		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
    			className: BatchView_module_default.jobs,
    			"data-testid": "sast-batch-jobs",
    			children: sastBatch.jobs.map((job) => {
    				const unaudited = UNAUDITED_STATUSES.has(job.status);
    				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
    					className: BatchView_module_default.job,
    					"data-testid": "sast-batch-job",
    					children: [
    						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    							className: BatchView_module_default.ordinal,
    							children: job.ordinal
    						}),
    						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
    							className: BatchView_module_default.repoUrl,
    							children: [job.repoUrl, job.branch !== void 0 && job.branch !== "" ? `@${job.branch}` : ""]
    						}),
    						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    							className: BatchView_module_default.jobStatus,
    							"data-status": job.status,
    							children: t(JOB_STATUS_LABELS[job.status])
    						}),
    						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    							className: BatchView_module_default.attempt,
    							children: t("batch.job.attempt", { attempt: job.attempt })
    						}),
    						unaudited && job.fallback === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    							className: BatchView_module_default.unaudited,
    							children: t("batch.job.unaudited")
    						}),
    						job.fallback !== void 0 && job.fallback !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    							className: BatchView_module_default.fallback,
    							"data-testid": "sast-batch-job-fallback",
    							children: job.fallback
    						})
    					]
    				}, job.ordinal);
    			})
    		})]
    	});
    }
    //#endregion
    //#region src/client/ExploreView.module.css
    var ExploreView_module_default = {
    	"badge": "ExploreView-module__badge",
    	"detail": "ExploreView-module__detail",
    	"edgeLabel": "ExploreView-module__edgeLabel",
    	"empty": "ExploreView-module__empty",
    	"flowEdgeLabel": "ExploreView-module__flowEdgeLabel",
    	"flowEdgePath": "ExploreView-module__flowEdgePath",
    	"graph": "ExploreView-module__graph",
    	"handle": "ExploreView-module__handle",
    	"node": "ExploreView-module__node",
    	"severity": "ExploreView-module__severity",
    	"title": "ExploreView-module__title"
    };
    //#endregion
    //#region src/client/ExploreView.tsx
    /**
    * ExploreView: the 审计链路 sub-tab of the 白盒审计 view. Renders the audit
    * chain (scan → intent → fact → derived intent → finding) as an interactive
    * graph with @xyflow/react; positions come from the pure `layoutExploration`
    * helper, nodes carry kind badges and connection handles, chain edges render
    * a visible relationship pill (意图链 / 产出 / 推导自 / 证实), and `flows_to`
    * taint-propagation edges (ADR-05) render with a distinct dashed style and
    * color.
    */
    /** Kind badge label keys per node kind. */
    const KIND_LABELS = {
    	scan: "kind.scan",
    	intent: "kind.intent",
    	fact: "kind.fact",
    	finding: "kind.finding"
    };
    /** Relationship label keys per chain edge kind (parent/flows_to edges never reach the chain-edge renderer). */
    const EDGE_LABELS = {
    	spawns: "edge.spawns",
    	yields: "edge.yields",
    	derived_from: "edge.derived_from",
    	proves: "edge.proves",
    	flows_to: "edge.flows_to",
    	parent: "edge.parent"
    };
    /** Severity badge label keys. */
    const SEVERITY_LABELS$1 = {
    	critical: "severity.critical",
    	high: "severity.high",
    	medium: "severity.medium",
    	low: "severity.low",
    	info: "severity.info"
    };
    /** One custom flow node: a kind badge over the title and detail line, with source/target handles. */
    function ChainNode({ data, t }) {
    	const node = data.node;
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    		className: ExploreView_module_default.node,
    		"data-kind": node.kind,
    		"data-severity": node.severity,
    		"data-testid": `explore-node-${node.kind}`,
    		children: [
    			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Handle, {
    				type: "target",
    				position: Position.Left,
    				className: ExploreView_module_default.handle
    			}),
    			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    				className: ExploreView_module_default.badge,
    				children: t(KIND_LABELS[node.kind])
    			}),
    			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    				className: ExploreView_module_default.title,
    				title: node.title,
    				children: node.title
    			}),
    			node.detail !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    				className: ExploreView_module_default.detail,
    				title: node.detail,
    				children: node.detail
    			}),
    			node.severity !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    				className: ExploreView_module_default.severity,
    				"data-severity": node.severity,
    				children: t(SEVERITY_LABELS$1[node.severity])
    			}),
    			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Handle, {
    				type: "source",
    				position: Position.Right,
    				className: ExploreView_module_default.handle
    			})
    		]
    	});
    }
    /** One custom edge: a bezier curve with a visible relationship pill at its midpoint. */
    function ChainEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label }) {
    	const [path, labelX, labelY] = getBezierPath({
    		sourceX,
    		sourceY,
    		sourcePosition,
    		targetPosition,
    		targetX,
    		targetY
    	});
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BaseEdge, {
    		id,
    		path
    	}), label !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EdgeLabelRenderer, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
    		className: ExploreView_module_default.edgeLabel,
    		style: { transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` },
    		children: label
    	}) })] });
    }
    /** One taint-propagation edge (ADR-05): a dashed bezier curve in a distinct color, with the 污点传播 pill. */
    function FlowEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label }) {
    	const [path, labelX, labelY] = getBezierPath({
    		sourceX,
    		sourceY,
    		sourcePosition,
    		targetPosition,
    		targetX,
    		targetY
    	});
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BaseEdge, {
    		id,
    		path,
    		className: ExploreView_module_default.flowEdgePath
    	}), label !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EdgeLabelRenderer, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
    		className: ExploreView_module_default.flowEdgeLabel,
    		style: { transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` },
    		children: label
    	}) })] });
    }
    function ExploreView({ sast, t }) {
    	const { nodes, edges, flowEdges } = (0, react.useMemo)(() => layoutExploration(sast), [sast]);
    	const [selectedNode, setSelectedNode] = (0, react.useState)(null);
    	const positionById = (0, react.useMemo)(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
    	const flowNodes = (0, react.useMemo)(() => nodes.map((node) => ({
    		id: node.id,
    		type: "sast",
    		position: {
    			x: node.x,
    			y: node.y
    		},
    		data: { node },
    		style: EXPLORE_NODE_SIZE
    	})), [nodes]);
    	const flowEdgesFlow = (0, react.useMemo)(() => [...edges.map((edge) => ({
    		id: edge.id,
    		type: "chain",
    		source: edge.sourceId,
    		target: edge.targetId,
    		label: t(EDGE_LABELS[edge.kind])
    	})), ...flowEdges.filter((edge) => positionById.has(edge.sourceId) && positionById.has(edge.targetId)).map((edge) => ({
    		id: edge.id,
    		type: "flow",
    		source: edge.sourceId,
    		target: edge.targetId,
    		label: t(EDGE_LABELS[edge.kind])
    	}))], [
    		edges,
    		flowEdges,
    		positionById,
    		t
    	]);
    	const nodeTypes = (0, react.useMemo)(() => ({ sast: (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChainNode, {
    		...props,
    		t
    	}) }), [t]);
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    		className: ExploreView_module_default.graph,
    		"data-testid": "sast-explore",
    		children: [nodes.length <= 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    			className: ExploreView_module_default.empty,
    			"data-testid": "sast-explore-empty",
    			children: t("explore.empty")
    		}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(index, {
    			nodes: flowNodes,
    			edges: flowEdgesFlow,
    			nodeTypes,
    			edgeTypes: {
    				chain: ChainEdge,
    				flow: FlowEdge
    			},
    			fitView: true,
    			fitViewOptions: { padding: .25 },
    			proOptions: { hideAttribution: true },
    			onNodeClick: (_, flowNode) => {
    				setSelectedNode(flowNode.data.node);
    			},
    			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Background, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Controls, { showInteractive: false })]
    		}), selectedNode !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphDetailDrawer, {
    			title: selectedNode.title,
    			fields: [
    				{
    					label: t("detail.field.kind"),
    					value: t(KIND_LABELS[selectedNode.kind])
    				},
    				{
    					label: t("detail.field.detail"),
    					value: selectedNode.detail
    				},
    				...selectedNode.severity === void 0 ? [] : [{
    					label: t("detail.field.severity"),
    					value: t(SEVERITY_LABELS$1[selectedNode.severity])
    				}]
    			],
    			onClose: () => {
    				setSelectedNode(null);
    			},
    			t
    		})]
    	});
    }
    //#endregion
    //#region src/client/permalink.ts
    /** The line-range fragment: `#L<line>` or `#L<line>-L<endLine>` when both are given and distinct. */
    function lineFragment(location) {
    	if (location.line === void 0 || location.line <= 0) return "";
    	if (location.endLine !== void 0 && location.endLine > location.line) return `#L${location.line}-L${location.endLine}`;
    	return `#L${location.line}`;
    }
    /**
    * Build a permalink to one code location in the scanned repository, or
    * `undefined` when the provider has no hosted blob view (`local`) or the
    * scan has no resolved commit yet.
    */
    function permalinkOf(scan, location) {
    	if (scan.commit === "") return void 0;
    	const base = scan.repoUrl.replace(/\/+$/, "").replace(/\.git$/, "");
    	if (scan.provider === "gitlab") return `${base}/-/blob/${scan.commit}/${location.path}${lineFragment(location)}`;
    	if (scan.provider === "github") return `${base}/blob/${scan.commit}/${location.path}${lineFragment(location)}`;
    }
    //#endregion
    //#region src/client/FindingsView.module.css
    var FindingsView_module_default = {
    	"asset": "FindingsView-module__asset",
    	"codePath": "FindingsView-module__codePath",
    	"codePathBlock": "FindingsView-module__codePathBlock",
    	"codePathLabel": "FindingsView-module__codePathLabel",
    	"description": "FindingsView-module__description",
    	"empty": "FindingsView-module__empty",
    	"finding": "FindingsView-module__finding",
    	"header": "FindingsView-module__header",
    	"hop": "FindingsView-module__hop",
    	"hopAction": "FindingsView-module__hopAction",
    	"hopActions": "FindingsView-module__hopActions",
    	"hopIndex": "FindingsView-module__hopIndex",
    	"hopLocation": "FindingsView-module__hopLocation",
    	"hopSymbol": "FindingsView-module__hopSymbol",
    	"id": "FindingsView-module__id",
    	"list": "FindingsView-module__list",
    	"origin": "FindingsView-module__origin",
    	"severity": "FindingsView-module__severity",
    	"tag": "FindingsView-module__tag",
    	"tags": "FindingsView-module__tags",
    	"title": "FindingsView-module__title"
    };
    //#endregion
    //#region src/client/FindingsView.tsx
    /**
    * FindingsView: the 漏洞 sub-tab of the 白盒审计 view. Lists every
    * vulnerability finding of the audit — severity badge, title, description,
    * the code evidence chain (codePath: path:line + symbol + note, each hop a
    * permalink into the source repository when the scan has resolved a commit,
    * with a copy-path affordance), CWE/vulnClass, methodology origin
    * (skillId/checkId, or "检查清单之外的发现" when incidental), and the
    * affected asset when linked.
    */
    /** Severity badge label keys. */
    const SEVERITY_LABELS = {
    	critical: "severity.critical",
    	high: "severity.high",
    	medium: "severity.medium",
    	low: "severity.low",
    	info: "severity.info"
    };
    /** Narrow the projection nodes to findings. */
    function findingsOf(projection) {
    	return projection.nodes.filter((node) => node.kind === "finding");
    }
    /** One code-evidence-chain hop: path:line, an optional symbol, a permalink, and a copy-path button. */
    function CodePathHop({ hop, index, sast, t }) {
    	const [copied, setCopied] = (0, react.useState)(false);
    	const url = sast.scan === null ? void 0 : permalinkOf(sast.scan, hop);
    	const copy = async () => {
    		try {
    			await navigator.clipboard.writeText(hop.path);
    			setCopied(true);
    			setTimeout(() => {
    				setCopied(false);
    			}, 1500);
    		} catch {}
    	};
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
    		className: FindingsView_module_default.hop,
    		children: [
    			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
    				className: FindingsView_module_default.hopIndex,
    				children: [index + 1, "."]
    			}),
    			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
    				className: FindingsView_module_default.hopLocation,
    				children: [
    					hop.path,
    					":",
    					hop.line,
    					hop.symbol !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
    						className: FindingsView_module_default.hopSymbol,
    						children: hop.symbol
    					})
    				]
    			}),
    			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
    				className: FindingsView_module_default.hopActions,
    				children: [url !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
    					className: FindingsView_module_default.hopAction,
    					href: url,
    					target: "_blank",
    					rel: "noreferrer",
    					title: t("permalink.open"),
    					children: "↗"
    				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
    					type: "button",
    					className: FindingsView_module_default.hopAction,
    					onClick: () => {
    						copy();
    					},
    					title: t("copy.path"),
    					children: copied ? t("copy.done") : "⧉"
    				})]
    			})
    		]
    	});
    }
    function FindingsView({ sast, t }) {
    	const findings = findingsOf(sast);
    	if (findings.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    		className: FindingsView_module_default.empty,
    		"data-testid": "sast-findings-empty",
    		children: t("findings.empty")
    	});
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
    		className: FindingsView_module_default.list,
    		"data-testid": "sast-findings",
    		children: findings.map((finding) => {
    			const asset = finding.affectedAssetId === void 0 ? void 0 : sast.assets.find((candidate) => candidate.id === finding.affectedAssetId);
    			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
    				className: FindingsView_module_default.finding,
    				"data-testid": "sast-finding",
    				children: [
    					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
    						className: FindingsView_module_default.header,
    						children: [
    							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    								className: FindingsView_module_default.severity,
    								"data-severity": finding.severity,
    								children: t(SEVERITY_LABELS[finding.severity])
    							}),
    							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
    								className: FindingsView_module_default.title,
    								children: finding.title
    							}),
    							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    								className: FindingsView_module_default.id,
    								children: finding.id
    							})
    						]
    					}),
    					(finding.cwe !== void 0 || finding.vulnClass !== void 0) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
    						className: FindingsView_module_default.tags,
    						children: [finding.cwe !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
    							className: FindingsView_module_default.tag,
    							children: [
    								t("finding.cwe"),
    								": ",
    								finding.cwe
    							]
    						}), finding.vulnClass !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
    							className: FindingsView_module_default.tag,
    							children: [
    								t("finding.vulnClass"),
    								": ",
    								finding.vulnClass
    							]
    						})]
    					}),
    					finding.description !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    						className: FindingsView_module_default.description,
    						children: finding.description
    					}),
    					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    						className: FindingsView_module_default.codePathBlock,
    						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    							className: FindingsView_module_default.codePathLabel,
    							children: t("finding.codePath")
    						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", {
    							className: FindingsView_module_default.codePath,
    							children: finding.codePath.map((hop, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CodePathHop, {
    								hop,
    								index,
    								sast,
    								t
    							}, index))
    						})]
    					}),
    					asset !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
    						className: FindingsView_module_default.asset,
    						children: [
    							t("finding.affected"),
    							": [",
    							asset.type,
    							"] ",
    							asset.value
    						]
    					}),
    					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
    						className: FindingsView_module_default.origin,
    						children: [
    							t("finding.origin"),
    							": ",
    							finding.skillId !== void 0 ? `${finding.skillId} / ${finding.checkId}` : t("finding.incidental")
    						]
    					})
    				]
    			}, finding.id);
    		})
    	});
    }
    //#endregion
    //#region src/client/ReportView.module.css
    var ReportView_module_default = {
    	"action": "ReportView-module__action",
    	"actions": "ReportView-module__actions",
    	"bullet": "ReportView-module__bullet",
    	"error": "ReportView-module__error",
    	"hint": "ReportView-module__hint",
    	"markdown": "ReportView-module__markdown",
    	"root": "ReportView-module__root",
    	"step": "ReportView-module__step",
    	"toolbar": "ReportView-module__toolbar"
    };
    //#endregion
    //#region src/client/ReportView.tsx
    /**
    * ReportView: render, copy, and download the current sast projection as
    * Markdown. This is a projection-view render (windowed nodes, no real
    * elapsed time — the projection never sees store timestamps), distinct from
    * `sast_report`'s storage-layer report (docs/architecture.md §7).
    */
    function reportOf(sast, t) {
    	if (sast.scan === null) return `# ${t("report.title")}\n\n${t("report.uninitialized")}\n`;
    	const findings = sast.nodes.filter((node) => node.kind === "finding");
    	const chain = sast.nodes.map((node) => {
    		const anchor = sast.edges.find((edge) => edge.targetId === node.id);
    		const relation = anchor === void 0 ? "" : ` (${anchor.kind} ${anchor.sourceId})`;
    		if (node.kind === "intent") return `- ${t("kind.intent")} (${node.id}) ${node.title}${node.detail === "" ? "" : `: ${node.detail}`}${relation}`;
    		if (node.kind === "fact") return `- ${t("kind.fact")} (${node.id}) [${node.factKind}] ${node.path}:${node.line} ${node.detail}${relation}`;
    		return `- ${t("kind.finding")} (${node.id}) [${node.severity}] ${node.title}${relation}`;
    	});
    	const findingSections = findings.flatMap((finding) => {
    		const asset = finding.affectedAssetId === void 0 ? void 0 : sast.assets.find((candidate) => candidate.id === finding.affectedAssetId);
    		return [
    			`### ${finding.id} [${finding.severity}] ${finding.title}`,
    			`- ${t("report.description")}: ${finding.description === "" ? t("report.none") : finding.description}`,
    			`- ${t("finding.affected")}: ${asset === void 0 ? t("report.unlinked") : `[${asset.type}] ${asset.value}`}`,
    			`- ${t("finding.codePath")}:`,
    			...finding.codePath.map((hop, index) => `  ${index + 1}. ${hop.path}:${hop.line}${hop.symbol === void 0 ? "" : ` \`${hop.symbol}\``}`),
    			""
    		];
    	});
    	const assetLines = sast.assets.map((asset) => {
    		const edge = sast.edges.find((candidate) => candidate.kind === "parent" && candidate.targetId === asset.id);
    		const parent = edge === void 0 ? void 0 : sast.assets.find((candidate) => candidate.id === edge.sourceId);
    		return `- [${asset.type}] ${asset.value}${asset.meta === "" ? "" : ` (${asset.meta})`}${parent === void 0 ? "" : ` <- ${parent.value}`}`;
    	});
    	return [
    		`# ${t("report.title")}`,
    		"",
    		`- ${t("report.repo")}: ${sast.scan.repoUrl}`,
    		`- ${t("report.branch")}: ${sast.scan.branch === "" ? t("report.undeclared") : sast.scan.branch}`,
    		`- ${t("report.objective")}: ${sast.scan.objective}`,
    		`- ${t("report.authorization")}: ${sast.scan.authorization === "" ? t("report.undeclared") : sast.scan.authorization}`,
    		"",
    		`## ${t("report.chain")}`,
    		...chain.length === 0 ? [t("report.chainEmpty")] : chain,
    		"",
    		`## ${t("report.findings")}`,
    		...findingSections.length === 0 ? [t("report.none")] : findingSections,
    		`## ${t("report.assets")}`,
    		...assetLines.length === 0 ? [t("report.none")] : assetLines,
    		""
    	].join("\n");
    }
    function filenameOf(repoUrl) {
    	const name = repoUrl.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
    	return `sast-report-${name === "" ? "session" : name}.md`;
    }
    /** Render the report's small, fixed Markdown subset without interpreting HTML. */
    function MarkdownPreview({ markdown }) {
    	const rows = [];
    	for (const [index, line] of markdown.split("\n").entries()) {
    		if (line === "") continue;
    		if (line.startsWith("### ")) rows.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: line.slice(4) }, index));
    		else if (line.startsWith("## ")) rows.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: line.slice(3) }, index));
    		else if (line.startsWith("# ")) rows.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: line.slice(2) }, index));
    		else if (line.startsWith("- ")) rows.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    			className: ReportView_module_default.bullet,
    			children: line.slice(2)
    		}, index));
    		else if (/^  \d+\. /.test(line)) rows.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    			className: ReportView_module_default.step,
    			children: line.trim()
    		}, index));
    		else rows.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: line }, index));
    	}
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("article", {
    		className: ReportView_module_default.markdown,
    		"data-testid": "sast-report-markdown",
    		children: rows
    	});
    }
    function ReportView({ sast, t }) {
    	const markdown = reportOf(sast, t);
    	const [copyState, setCopyState] = (0, react.useState)("idle");
    	const copy = async () => {
    		try {
    			await navigator.clipboard.writeText(markdown);
    			setCopyState("done");
    		} catch {
    			setCopyState("failed");
    		}
    	};
    	const download = () => {
    		const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    		const url = URL.createObjectURL(blob);
    		const link = document.createElement("a");
    		link.href = url;
    		link.download = filenameOf(sast.scan?.repoUrl ?? "");
    		link.click();
    		URL.revokeObjectURL(url);
    	};
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
    		className: ReportView_module_default.root,
    		"data-testid": "sast-report",
    		children: [
    			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
    				className: ReportView_module_default.toolbar,
    				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    					className: ReportView_module_default.hint,
    					children: t("report.hint")
    				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    					className: ReportView_module_default.actions,
    					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
    						type: "button",
    						className: ReportView_module_default.action,
    						onClick: () => {
    							copy();
    						},
    						"data-testid": "sast-report-copy",
    						children: t(copyState === "done" ? "report.copied" : "report.copy")
    					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
    						type: "button",
    						className: ReportView_module_default.action,
    						onClick: download,
    						"data-testid": "sast-report-download",
    						children: t("report.download")
    					})]
    				})]
    			}),
    			copyState === "failed" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    				className: ReportView_module_default.error,
    				role: "status",
    				children: t("report.copyFailed")
    			}),
    			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkdownPreview, { markdown })
    		]
    	});
    }
    //#endregion
    //#region src/client/ReviewInboxView.module.css
    var ReviewInboxView_module_default = {
    	"actionsHint": "ReviewInboxView-module__actionsHint",
    	"empty": "ReviewInboxView-module__empty",
    	"fallback": "ReviewInboxView-module__fallback",
    	"hint": "ReviewInboxView-module__hint",
    	"item": "ReviewInboxView-module__item",
    	"itemHeader": "ReviewInboxView-module__itemHeader",
    	"items": "ReviewInboxView-module__items",
    	"jobStatus": "ReviewInboxView-module__jobStatus",
    	"ordinal": "ReviewInboxView-module__ordinal",
    	"repoUrl": "ReviewInboxView-module__repoUrl",
    	"root": "ReviewInboxView-module__root"
    };
    //#endregion
    //#region src/client/ReviewInboxView.tsx
    function ReviewInboxView({ sastBatch, t }) {
    	const pending = sastBatch.jobs.filter((job) => job.reviewStatus === "pending");
    	if (pending.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    		className: ReviewInboxView_module_default.empty,
    		"data-testid": "sast-review-inbox-empty",
    		children: t("reviewInbox.empty")
    	});
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    		className: ReviewInboxView_module_default.root,
    		"data-testid": "sast-review-inbox",
    		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    			className: ReviewInboxView_module_default.hint,
    			children: t("reviewInbox.hint")
    		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
    			className: ReviewInboxView_module_default.items,
    			"data-testid": "sast-review-inbox-items",
    			children: pending.map((job) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
    				className: ReviewInboxView_module_default.item,
    				"data-testid": "sast-review-inbox-item",
    				children: [
    					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
    						className: ReviewInboxView_module_default.itemHeader,
    						children: [
    							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    								className: ReviewInboxView_module_default.ordinal,
    								children: job.ordinal
    							}),
    							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    								className: ReviewInboxView_module_default.repoUrl,
    								children: job.repoUrl
    							}),
    							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    								className: ReviewInboxView_module_default.jobStatus,
    								"data-status": job.status,
    								children: job.status
    							})
    						]
    					}),
    					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    						className: ReviewInboxView_module_default.fallback,
    						"data-testid": "sast-review-inbox-fallback",
    						children: job.fallback !== void 0 && job.fallback !== "" ? job.fallback : t("reviewInbox.noDetail")
    					}),
    					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    						className: ReviewInboxView_module_default.actionsHint,
    						children: t("reviewInbox.actionsHint")
    					})
    				]
    			}, job.ordinal))
    		})]
    	});
    }
    //#endregion
    //#region src/client/TasksView.module.css
    var TasksView_module_default = {
    	"check": "TasksView-module__check",
    	"checkId": "TasksView-module__checkId",
    	"checks": "TasksView-module__checks",
    	"checkState": "TasksView-module__checkState",
    	"checkTitle": "TasksView-module__checkTitle",
    	"empty": "TasksView-module__empty",
    	"metric": "TasksView-module__metric",
    	"metricLabel": "TasksView-module__metricLabel",
    	"metricValue": "TasksView-module__metricValue",
    	"noMethodology": "TasksView-module__noMethodology",
    	"root": "TasksView-module__root",
    	"skill": "TasksView-module__skill",
    	"skillHeader": "TasksView-module__skillHeader",
    	"skillProgress": "TasksView-module__skillProgress",
    	"skills": "TasksView-module__skills",
    	"skillStatus": "TasksView-module__skillStatus",
    	"skillTitle": "TasksView-module__skillTitle",
    	"sourceBadge": "TasksView-module__sourceBadge",
    	"summary": "TasksView-module__summary"
    };
    //#endregion
    //#region src/client/TasksView.tsx
    const CHECK_STATE_LABELS = {
    	todo: "checkState.todo",
    	planned: "checkState.planned",
    	running: "checkState.running",
    	done: "checkState.done",
    	blocked: "checkState.blocked"
    };
    const INTENT_STATUS_LABELS = {
    	pending: "intentStatus.pending",
    	running: "intentStatus.running",
    	done: "intentStatus.done",
    	blocked: "intentStatus.blocked"
    };
    /** State of one check: no intent → todo; pending → planned; else the intent's own status (mirrors coverage.ts's deriveCheckState). */
    function checkStateOf(projection, skillId, checkId) {
    	const found = projection.nodes.find((node) => node.kind === "intent" && node.skillId === skillId && node.checkId === checkId);
    	if (found === void 0 || found.kind !== "intent") return "todo";
    	if (found.status === "pending") return "planned";
    	return found.status;
    }
    /** One skill's check-count rollup, mirroring coverage.ts's CoverageSkillEntry shape at the fields this tab needs. */
    function rollupOf(projection, skill) {
    	const states = skill.checks.map((check) => checkStateOf(projection, skill.id, check.id));
    	return {
    		total: states.length,
    		covered: states.filter((state) => state !== "todo").length,
    		completed: states.filter((state) => state === "done").length
    	};
    }
    function TasksView({ sast, t }) {
    	const intentCounts = {
    		pending: 0,
    		running: 0,
    		done: 0,
    		blocked: 0
    	};
    	for (const node of sast.nodes) if (node.kind === "intent") intentCounts[node.status] += 1;
    	const hasIntents = intentCounts.pending + intentCounts.running + intentCounts.done + intentCounts.blocked > 0;
    	if (sast.skills.length === 0 && !hasIntents) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    		className: TasksView_module_default.empty,
    		"data-testid": "sast-tasks-empty",
    		children: t("tasks.empty")
    	});
    	const totals = sast.skills.filter((skill) => skill.enabled).reduce((sum, skill) => {
    		const rollup = rollupOf(sast, skill);
    		return {
    			total: sum.total + rollup.total,
    			covered: sum.covered + rollup.covered,
    			completed: sum.completed + rollup.completed
    		};
    	}, {
    		total: 0,
    		covered: 0,
    		completed: 0
    	});
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    		className: TasksView_module_default.root,
    		"data-testid": "sast-tasks",
    		children: [
    			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
    				className: TasksView_module_default.summary,
    				"data-testid": "sast-tasks-summary",
    				children: [sast.skills.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    					className: TasksView_module_default.metric,
    					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    						className: TasksView_module_default.metricLabel,
    						children: t("tasks.coverage.checksIncluded")
    					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
    						className: TasksView_module_default.metricValue,
    						children: [
    							totals.covered,
    							" / ",
    							totals.total
    						]
    					})]
    				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    					className: TasksView_module_default.metric,
    					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    						className: TasksView_module_default.metricLabel,
    						children: t("tasks.coverage.checksCompleted")
    					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
    						className: TasksView_module_default.metricValue,
    						children: [
    							totals.completed,
    							" / ",
    							totals.total
    						]
    					})]
    				})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    					className: TasksView_module_default.metric,
    					"data-testid": "sast-tasks-intent-status",
    					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    						className: TasksView_module_default.metricLabel,
    						children: t("tasks.intents.byStatus")
    					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    						className: TasksView_module_default.metricValue,
    						children: [
    							"pending",
    							"running",
    							"done",
    							"blocked"
    						].map((status) => `${t(INTENT_STATUS_LABELS[status])} ${intentCounts[status]}`).join(" · ")
    					})]
    				})]
    			}),
    			sast.skills.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    				className: TasksView_module_default.noMethodology,
    				"data-testid": "sast-tasks-no-methodology",
    				children: t("tasks.noMethodology")
    			}),
    			sast.skills.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
    				className: TasksView_module_default.skills,
    				"data-testid": "sast-tasks-skills",
    				children: sast.skills.map((skill) => {
    					const rollup = rollupOf(sast, skill);
    					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
    						className: TasksView_module_default.skill,
    						"data-testid": "sast-tasks-skill",
    						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
    							className: TasksView_module_default.skillHeader,
    							children: [
    								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    									className: TasksView_module_default.sourceBadge,
    									"data-source": skill.sourceGroup,
    									children: skill.sourceGroup
    								}),
    								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
    									className: TasksView_module_default.skillTitle,
    									children: skill.title
    								}),
    								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    									className: TasksView_module_default.skillStatus,
    									"data-enabled": skill.enabled,
    									children: t(skill.enabled ? "tasks.skill.enabled" : "tasks.skill.disabled")
    								}),
    								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
    									className: TasksView_module_default.skillProgress,
    									children: [
    										rollup.completed,
    										"/",
    										rollup.total
    									]
    								})
    							]
    						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
    							className: TasksView_module_default.checks,
    							children: skill.checks.map((check) => {
    								const state = checkStateOf(sast, skill.id, check.id);
    								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
    									className: TasksView_module_default.check,
    									"data-testid": "sast-tasks-check",
    									children: [
    										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    											className: TasksView_module_default.checkState,
    											"data-state": state,
    											children: t(CHECK_STATE_LABELS[state])
    										}),
    										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    											className: TasksView_module_default.checkId,
    											children: check.id
    										}),
    										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    											className: TasksView_module_default.checkTitle,
    											children: check.title
    										})
    									]
    								}, check.id);
    							})
    						})]
    					}, skill.id);
    				})
    			})
    		]
    	});
    }
    //#endregion
    //#region src/client/SastView.module.css
    var SastView_module_default = {
    	"authorization": "SastView-module__authorization",
    	"branch": "SastView-module__branch",
    	"card": "SastView-module__card",
    	"cardTitle": "SastView-module__cardTitle",
    	"content": "SastView-module__content",
    	"counts": "SastView-module__counts",
    	"empty": "SastView-module__empty",
    	"emptyText": "SastView-module__emptyText",
    	"objective": "SastView-module__objective",
    	"repo": "SastView-module__repo",
    	"root": "SastView-module__root",
    	"tab": "SastView-module__tab",
    	"tabs": "SastView-module__tabs"
    };
    //#endregion
    //#region src/client/SastView.tsx
    /**
    * SastView: the 白盒审计 conversation-view tab. A pure projection-mode
    * surface — the standing `sast` projection (scan plus the audit graph)
    * arrives through `useProjection('sast')`, so the tab owns no store and
    * needs no host RPC. The view renders one scan header card (repo, branch,
    * objective, authorization, node counts) over a sub-tab bar: 审计链路 (the
    * chain as an interactive graph), 漏洞 (findings with code evidence chains),
    * 代码资产 (list or graph), 任务与进度 (methodology check coverage), and
    * 报告 (copyable Markdown). A batch owner session additionally gets 批次总览
    * and 待确认 sub-tabs (M6) — gated on `sastBatch` being non-null, NOT on any
    * preset name, since a pure batch owner may never itself call
    * `sast_start_scan` (its jobs run under separate worker sessions) and so
    * would otherwise never see the empty-`sast` guard fall through. Absent
    * projection (capability or session not composed) or both projections null
    * renders the guiding empty note.
    */
    /** The five single-repo sub-tabs of the view, always present. */
    const SAST_TABS = [
    	"explore",
    	"findings",
    	"assets",
    	"tasks",
    	"report"
    ];
    /** The two batch-owner-only sub-tabs (M6), shown only while `sastBatch` is non-null. */
    const BATCH_TABS = ["batch", "reviewInbox"];
    /** Sub-tab label keys. */
    const TAB_LABELS = {
    	explore: "view.tab.explore",
    	findings: "view.tab.findings",
    	assets: "view.tab.assets",
    	tasks: "view.tab.tasks",
    	report: "view.tab.report",
    	batch: "view.tab.batch",
    	reviewInbox: "view.tab.reviewInbox"
    };
    function SastView({ useProjection, t }) {
    	const sast = useProjection("sast");
    	const sastBatch = useProjection("sastBatch");
    	const hasSast = sast !== void 0 && sast !== null;
    	const hasBatch = sastBatch !== void 0 && sastBatch !== null;
    	const tabs = hasBatch ? [...SAST_TABS, ...BATCH_TABS] : SAST_TABS;
    	const [tab, setTab] = (0, react.useState)(hasSast ? "explore" : "batch");
    	if (!hasSast && !hasBatch) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
    		className: SastView_module_default.empty,
    		"data-testid": "sast-view",
    		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    			className: SastView_module_default.emptyText,
    			children: t("view.empty")
    		})
    	});
    	const activeTab = tabs.includes(tab) ? tab : tabs[0];
    	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
    		className: SastView_module_default.root,
    		"data-testid": "sast-view",
    		children: [
    			hasSast && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
    				className: SastView_module_default.card,
    				children: [
    					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    						className: SastView_module_default.cardTitle,
    						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
    							className: SastView_module_default.repo,
    							children: sast.scan === null ? "" : sast.scan.repoUrl
    						}), sast.scan !== null && sast.scan.branch !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
    							className: SastView_module_default.branch,
    							children: t("header.branch", { branch: sast.scan.branch })
    						})]
    					}),
    					sast.scan !== null && sast.scan.objective !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    						className: SastView_module_default.objective,
    						children: t("header.objective", { objective: sast.scan.objective })
    					}),
    					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    						className: SastView_module_default.counts,
    						children: t("counts", {
    							skills: sast.skills.length,
    							intents: sast.counts.intents,
    							facts: sast.counts.facts,
    							findings: sast.counts.findings,
    							assets: sast.counts.assets
    						})
    					}),
    					sast.scan !== null && sast.scan.authorization !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
    						className: SastView_module_default.authorization,
    						children: t("header.authorization", { authorization: sast.scan.authorization })
    					})
    				]
    			}),
    			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
    				className: SastView_module_default.tabs,
    				"data-testid": "sast-tabs",
    				children: tabs.map((tabKey) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
    					type: "button",
    					className: SastView_module_default.tab,
    					"aria-pressed": activeTab === tabKey,
    					"data-testid": `sast-tab-${tabKey}`,
    					onClick: () => {
    						setTab(tabKey);
    					},
    					children: [
    						t(TAB_LABELS[tabKey]),
    						tabKey === "findings" && hasSast ? ` (${sast.counts.findings})` : "",
    						tabKey === "assets" && hasSast ? ` (${sast.counts.assets})` : ""
    					]
    				}, tabKey))
    			}),
    			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
    				className: SastView_module_default.content,
    				children: [
    					activeTab === "explore" && hasSast && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExploreView, {
    						sast,
    						t
    					}),
    					activeTab === "findings" && hasSast && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FindingsView, {
    						sast,
    						t
    					}),
    					activeTab === "assets" && hasSast && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetsView, {
    						sast,
    						t
    					}),
    					activeTab === "tasks" && hasSast && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TasksView, {
    						sast,
    						t
    					}),
    					activeTab === "report" && hasSast && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReportView, {
    						sast,
    						t
    					}),
    					activeTab === "batch" && hasBatch && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BatchView, {
    						sastBatch,
    						t
    					}),
    					activeTab === "reviewInbox" && hasBatch && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewInboxView, {
    						sastBatch,
    						t
    					})
    				]
    			})
    		]
    	});
    }
    //#endregion
    //#region src/client/locales.ts
    /** `sast` namespace dictionaries. */
    /** Dictionary namespace owned by this plugin. */
    const NS = "sast";
    /** Simplified Chinese dictionary (the key-set source of truth). */
    const zh = {
    	"counts": "技能 {skills} · 意图 {intents} · 事实 {facts} · 漏洞 {findings} · 资产 {assets}",
    	"view.tab.explore": "审计链路",
    	"view.tab.findings": "漏洞",
    	"view.tab.assets": "代码资产",
    	"view.tab.tasks": "任务与进度",
    	"view.tab.report": "报告",
    	"view.sast": "白盒审计",
    	"view.empty": "当前会话还没有白盒审计记录。在「白盒审计模式」预设下发送仓库地址与审计目的后，这里会显示审计链路。",
    	"header.objective": "目的：{objective}",
    	"header.authorization": "授权：{authorization}",
    	"header.branch": "分支：{branch}",
    	"explore.empty": "审计链路为空。先调用 sast_start_scan 记录仓库与审计目的。",
    	"findings.empty": "暂无漏洞记录",
    	"assets.empty": "暂无资产记录",
    	"assets.mode.list": "列表",
    	"assets.mode.graph": "图",
    	"tasks.empty": "尚未注册任何审计方法论。",
    	"tasks.noMethodology": "尚未注册任何审计方法论，以下为当前意图状态分布。",
    	"tasks.skill.enabled": "已启用",
    	"tasks.skill.disabled": "已停用",
    	"tasks.coverage.files": "文件覆盖",
    	"tasks.coverage.checksIncluded": "检查项纳入",
    	"tasks.coverage.checksCompleted": "检查项完成",
    	"tasks.intents.byStatus": "意图状态分布",
    	"report.title": "白盒审计报告",
    	"report.hint": "报告基于当前会话记录实时生成",
    	"report.copy": "复制",
    	"report.copied": "已复制",
    	"report.copyFailed": "复制失败，请手动选择报告内容复制",
    	"report.download": "保存 .md",
    	"report.repo": "仓库",
    	"report.branch": "分支",
    	"report.objective": "目的",
    	"report.authorization": "授权",
    	"report.chain": "审计链路",
    	"report.findings": "漏洞发现",
    	"report.assets": "代码资产",
    	"report.description": "成因",
    	"report.none": "（无）",
    	"report.unlinked": "（未关联）",
    	"report.undeclared": "（未声明）",
    	"report.chainEmpty": "（仅扫描，尚未展开）",
    	"report.uninitialized": "（未初始化：尚未调用 sast_start_scan。）",
    	"finding.affected": "影响资产",
    	"finding.codePath": "代码证据链",
    	"finding.cwe": "CWE",
    	"finding.vulnClass": "漏洞类型",
    	"finding.origin": "来源",
    	"finding.incidental": "检查清单之外的发现",
    	"permalink.open": "在代码仓库中查看",
    	"copy.path": "复制路径",
    	"copy.done": "已复制",
    	"detail.close": "关闭详情",
    	"detail.node": "节点详情",
    	"detail.field.kind": "类型",
    	"detail.field.detail": "说明",
    	"detail.field.severity": "风险等级",
    	"detail.field.assetType": "资产类型",
    	"detail.field.assetValue": "资产值",
    	"detail.field.meta": "元数据",
    	"kind.scan": "扫描",
    	"kind.intent": "意图",
    	"kind.fact": "事实",
    	"kind.finding": "漏洞",
    	"edge.spawns": "意图链",
    	"edge.yields": "产出",
    	"edge.derived_from": "推导自",
    	"edge.proves": "证实",
    	"edge.flows_to": "污点传播",
    	"edge.parent": "隶属",
    	"severity.critical": "严重",
    	"severity.high": "高危",
    	"severity.medium": "中危",
    	"severity.low": "低危",
    	"severity.info": "提示",
    	"factKind.source": "污点源",
    	"factKind.sink": "污点汇",
    	"factKind.sanitizer": "净化器",
    	"factKind.route": "路由",
    	"factKind.config": "配置",
    	"factKind.dependency": "依赖",
    	"factKind.secret": "密钥",
    	"factKind.pattern": "模式",
    	"factKind.info": "信息",
    	"intentCategory.recon": "测绘",
    	"intentCategory.attack-surface": "攻击面",
    	"intentCategory.taint": "污点",
    	"intentCategory.config": "配置",
    	"intentCategory.dependency": "依赖",
    	"intentCategory.verify": "复核",
    	"intentCategory.custom": "自定义",
    	"intentStatus.pending": "待办",
    	"intentStatus.running": "进行中",
    	"intentStatus.done": "已完成",
    	"intentStatus.blocked": "阻塞",
    	"checkState.todo": "待办",
    	"checkState.planned": "已计划",
    	"checkState.running": "进行中",
    	"checkState.done": "已完成",
    	"checkState.blocked": "阻塞",
    	"asset.type.repo": "仓库",
    	"asset.type.module": "模块",
    	"asset.type.file": "文件",
    	"asset.type.entrypoint": "入口",
    	"asset.type.package": "第三方依赖",
    	"asset.type.datastore": "数据源",
    	"view.tab.batch": "批次总览",
    	"view.tab.reviewInbox": "待确认",
    	"view.sastBatch": "批次审计",
    	"batch.objective": "批次目标：{objective}",
    	"batch.authorization": "授权：{authorization}",
    	"batch.status": "状态：{status}",
    	"batch.total": "共 {total} 仓",
    	"batch.pendingReview": "{count} 项待确认",
    	"batch.status.queued": "排队中",
    	"batch.status.running": "执行中",
    	"batch.status.awaiting_review": "待确认",
    	"batch.status.completed": "已完成",
    	"batch.status.completed_with_issues": "已完成（有缺口）",
    	"batch.job.attempt": "第 {attempt} 次尝试",
    	"batch.job.unaudited": "未审",
    	"batch.job.status.queued": "排队中",
    	"batch.job.status.preparing": "准备中",
    	"batch.job.status.running": "执行中",
    	"batch.job.status.retry_wait": "待重试",
    	"batch.job.status.succeeded": "成功",
    	"batch.job.status.degraded": "降级",
    	"batch.job.status.skipped": "已跳过",
    	"batch.job.status.failed": "失败",
    	"batch.job.status.timed_out": "超时",
    	"batch.job.status.cancelled": "已取消",
    	"reviewInbox.empty": "暂无待确认项。",
    	"reviewInbox.hint": "以下仓库需要用户确认；调用 sast_batch_resolve 接受缺口、确认跳过或重试。",
    	"reviewInbox.noDetail": "（未说明详情）",
    	"reviewInbox.actionsHint": "可执行操作：接受缺口 / 重试 / 确认跳过（在对话中调用 sast_batch_resolve）"
    };
    /** English dictionary, checked complete against the zh key set. */
    const en = {
    	"counts": "Skills {skills} · Intents {intents} · Facts {facts} · Findings {findings} · Assets {assets}",
    	"view.tab.explore": "Audit Chain",
    	"view.tab.findings": "Findings",
    	"view.tab.assets": "Assets",
    	"view.tab.tasks": "Tasks & Progress",
    	"view.tab.report": "Report",
    	"view.sast": "White-box Audit",
    	"view.empty": "No white-box audit records in this session yet. Start an audit on the 白盒审计模式 preset and the audit chain will appear here.",
    	"header.objective": "Objective: {objective}",
    	"header.authorization": "Authorization: {authorization}",
    	"header.branch": "Branch: {branch}",
    	"explore.empty": "The audit chain is empty. Start by recording a scan with sast_start_scan.",
    	"findings.empty": "No findings recorded yet",
    	"assets.empty": "No assets recorded yet",
    	"assets.mode.list": "List",
    	"assets.mode.graph": "Graph",
    	"tasks.empty": "No audit methodology has been registered yet.",
    	"tasks.noMethodology": "No audit methodology has been registered yet. Showing intent status distribution below.",
    	"tasks.skill.enabled": "Enabled",
    	"tasks.skill.disabled": "Disabled",
    	"tasks.coverage.files": "File coverage",
    	"tasks.coverage.checksIncluded": "Checks included",
    	"tasks.coverage.checksCompleted": "Checks completed",
    	"tasks.intents.byStatus": "Intent status distribution",
    	"report.title": "White-box Audit Report",
    	"report.hint": "Generated from the current session record",
    	"report.copy": "Copy",
    	"report.copied": "Copied",
    	"report.copyFailed": "Copy failed. Select the report content and copy it manually.",
    	"report.download": "Save .md",
    	"report.repo": "Repository",
    	"report.branch": "Branch",
    	"report.objective": "Objective",
    	"report.authorization": "Authorization",
    	"report.chain": "Audit chain",
    	"report.findings": "Findings",
    	"report.assets": "Code assets",
    	"report.description": "Cause",
    	"report.none": "(none)",
    	"report.unlinked": "(unlinked)",
    	"report.undeclared": "(undeclared)",
    	"report.chainEmpty": "(scan only; not expanded)",
    	"report.uninitialized": "(not initialized: sast_start_scan has not been called.)",
    	"finding.affected": "Affected asset",
    	"finding.codePath": "Code evidence chain",
    	"finding.cwe": "CWE",
    	"finding.vulnClass": "Vulnerability class",
    	"finding.origin": "Origin",
    	"finding.incidental": "Findings outside the checklist",
    	"permalink.open": "View in repository",
    	"copy.path": "Copy path",
    	"copy.done": "Copied",
    	"detail.close": "Close details",
    	"detail.node": "Node details",
    	"detail.field.kind": "Kind",
    	"detail.field.detail": "Detail",
    	"detail.field.severity": "Severity",
    	"detail.field.assetType": "Asset type",
    	"detail.field.assetValue": "Asset value",
    	"detail.field.meta": "Metadata",
    	"kind.scan": "Scan",
    	"kind.intent": "Intent",
    	"kind.fact": "Fact",
    	"kind.finding": "Finding",
    	"edge.spawns": "spawns",
    	"edge.yields": "yields",
    	"edge.derived_from": "derived from",
    	"edge.proves": "proves",
    	"edge.flows_to": "flows to",
    	"edge.parent": "belongs to",
    	"severity.critical": "Critical",
    	"severity.high": "High",
    	"severity.medium": "Medium",
    	"severity.low": "Low",
    	"severity.info": "Info",
    	"factKind.source": "Source",
    	"factKind.sink": "Sink",
    	"factKind.sanitizer": "Sanitizer",
    	"factKind.route": "Route",
    	"factKind.config": "Config",
    	"factKind.dependency": "Dependency",
    	"factKind.secret": "Secret",
    	"factKind.pattern": "Pattern",
    	"factKind.info": "Info",
    	"intentCategory.recon": "Recon",
    	"intentCategory.attack-surface": "Attack surface",
    	"intentCategory.taint": "Taint",
    	"intentCategory.config": "Config",
    	"intentCategory.dependency": "Dependency",
    	"intentCategory.verify": "Verify",
    	"intentCategory.custom": "Custom",
    	"intentStatus.pending": "Pending",
    	"intentStatus.running": "Running",
    	"intentStatus.done": "Done",
    	"intentStatus.blocked": "Blocked",
    	"checkState.todo": "Todo",
    	"checkState.planned": "Planned",
    	"checkState.running": "Running",
    	"checkState.done": "Done",
    	"checkState.blocked": "Blocked",
    	"asset.type.repo": "Repo",
    	"asset.type.module": "Module",
    	"asset.type.file": "File",
    	"asset.type.entrypoint": "Entrypoint",
    	"asset.type.package": "Package",
    	"asset.type.datastore": "Datastore",
    	"view.tab.batch": "Batch Overview",
    	"view.tab.reviewInbox": "Review Inbox",
    	"view.sastBatch": "Batch Audit",
    	"batch.objective": "Batch objective: {objective}",
    	"batch.authorization": "Authorization: {authorization}",
    	"batch.status": "Status: {status}",
    	"batch.total": "{total} repositories",
    	"batch.pendingReview": "{count} pending review",
    	"batch.status.queued": "Queued",
    	"batch.status.running": "Running",
    	"batch.status.awaiting_review": "Awaiting review",
    	"batch.status.completed": "Completed",
    	"batch.status.completed_with_issues": "Completed (with issues)",
    	"batch.job.attempt": "Attempt {attempt}",
    	"batch.job.unaudited": "Unaudited",
    	"batch.job.status.queued": "Queued",
    	"batch.job.status.preparing": "Preparing",
    	"batch.job.status.running": "Running",
    	"batch.job.status.retry_wait": "Awaiting retry",
    	"batch.job.status.succeeded": "Succeeded",
    	"batch.job.status.degraded": "Degraded",
    	"batch.job.status.skipped": "Skipped",
    	"batch.job.status.failed": "Failed",
    	"batch.job.status.timed_out": "Timed out",
    	"batch.job.status.cancelled": "Cancelled",
    	"reviewInbox.empty": "No pending review items.",
    	"reviewInbox.hint": "These repositories need your decision; call sast_batch_resolve to accept the gap, confirm the skip, or retry.",
    	"reviewInbox.noDetail": "(no detail provided)",
    	"reviewInbox.actionsHint": "Available actions: accept gap / retry / confirm skip (call sast_batch_resolve in the conversation)"
    };
    //#endregion
    //#region src/client/index.ts
    /** The agent-preset id whose sessions carry the sast capability. */
    const SAST_PRESET = "sast";
    /** A copy of the shipped preset keeps this id prefix (the documented convention). */
    const SAST_PRESET_PREFIX = `${SAST_PRESET}-`;
    /** Client-visible marker: this session's own log proved the row is mounted. */
    const SAST_MOUNTED_KEY = "sastMounted";
    /** The agent-preset id one row carries, off whichever wire supplies it. */
    function presetOf(row) {
    	const projected = row?.projectionValues?.agentPreset;
    	if (typeof projected === "string") return projected;
    	return row?.agentPreset;
    }
    /** Whether one preset id names the sast composition or a copy of it. */
    function isSastPresetId(id) {
    	return id === SAST_PRESET || id !== void 0 && id.startsWith(SAST_PRESET_PREFIX);
    }
    /**
    * Whether one row's session holds the mount marker: its own log proved the
    * sast row is mounted, so the tab follows copied/renamed presets too. Read
    * strictly (`=== true`) — an absent key on 0.1.1-and-earlier hosts, a `false`
    * baseline for foreign sessions, and a malformed wire all mean "no evidence".
    */
    function mountedOf(row) {
    	const marker = row?.projectionValues?.[SAST_MOUNTED_KEY];
    	return typeof marker === "boolean" && marker;
    }
    /**
    * Whether a session carries the sast capability — the session itself or any
    * listed ancestor (subagents of a sast session inherit its preset; their own
    * rows may or may not carry the preset on the wire, and they prove their own
    * mount as soon as they call the delegated submission tool).
    */
    function isSastSession(snapshot, id) {
    	let cursor = id;
    	const seen = /* @__PURE__ */ new Set();
    	const byId = snapshot.byId;
    	while (cursor !== void 0 && !seen.has(cursor)) {
    		seen.add(cursor);
    		const row = byId[cursor];
    		if (isSastPresetId(presetOf(row)) || mountedOf(row)) return true;
    		cursor = row?.parentId;
    	}
    	return false;
    }
    /** Required services for the view registration and its copy. */
    const inject = [
    	"slots",
    	"locale",
    	"sessions"
    ];
    /**
    * Client plugin body: the 白盒审计 view tab over the sast projection,
    * mounted per-session (registered while the current session — or a listed
    * ancestor — carries the `sast` preset or proves the mount in its own log,
    * disposed as soon as it does neither).
    * @param ctx - client root context.
    */
    function apply(ctx) {
    	ctx.effect(() => ctx.locale.register(NS, {
    		zh,
    		en
    	}), "ui-sast: dictionaries");
    	const t = ctx.locale.bind(NS);
    	const sessions = ctx.sessions;
    	ctx.slots.inject("conversation.view", () => {
    		let disposeEntry;
    		let sessionId;
    		let sessionSast;
    		const sync = () => {
    			const snapshot = sessions.list.getSnapshot();
    			const current = snapshot.current;
    			const sast = current === void 0 ? void 0 : isSastSession(snapshot, current);
    			if (current === sessionId && sast === sessionSast) return;
    			disposeEntry?.();
    			disposeEntry = void 0;
    			sessionId = current;
    			sessionSast = sast;
    			if (current === void 0 || sast !== true) return;
    			disposeEntry = ctx.slots.register({
    				name: "conversation.view",
    				id: "sast",
    				order: 20,
    				locale: NS,
    				label: () => t("view.sast")
    			}, SastView);
    		};
    		sync();
    		const offList = sessions.list.subscribe(sync);
    		return () => {
    			offList();
    			disposeEntry?.();
    		};
    	});
    }
    //#endregion
    exports.apply = apply;
    exports.inject = inject;

    return module.exports;
  }
});
