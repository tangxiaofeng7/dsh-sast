/**
 * AssetsView: the 代码资产 sub-tab of the 白盒审计 view, with a 列表/图 mode
 * toggle. List mode groups assets by type (repo → module → file →
 * entrypoint → package → datastore) and shows each parent link inline;
 * graph mode renders the parent-child asset tree with @xyflow/react
 * (positions from the pure `layoutAssets` helper).
 */

import { useMemo, useState } from 'react'
import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  getBezierPath,
  Handle,
  Position,
  ReactFlow,
  type EdgeProps,
  type Edge as FlowEdge,
  type Node as FlowNode,
  type NodeProps,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { SastAssetType, SastProjection } from '@tangxiaofeng7/dsh-sast-host/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { ASSET_NODE_SIZE, layoutAssets, type AssetGraphNode } from './graph.ts'
import { GraphDetailDrawer } from './GraphDetailDrawer.tsx'
import type { SastKey } from './locales.ts'
import css from './AssetsView.module.css'

/** Asset type label keys, in display order. */
const ASSET_TYPES = ['repo', 'module', 'file', 'entrypoint', 'package', 'datastore'] as const satisfies readonly SastAssetType[]

/** Asset type badge label keys. */
const TYPE_LABELS: Record<SastAssetType, SastKey> = {
  repo: 'asset.type.repo',
  module: 'asset.type.module',
  file: 'asset.type.file',
  entrypoint: 'asset.type.entrypoint',
  package: 'asset.type.package',
  datastore: 'asset.type.datastore',
}

/** The two view modes of the assets tab. */
type AssetMode = 'list' | 'graph'

/** One asset row in list mode (with the parent value resolved). */
interface AssetRow {
  readonly id: string
  readonly type: SastAssetType
  readonly value: string
  readonly meta: string
  readonly parentValue: string
}

/** Resolve the parent value of every asset from the parent edges. */
function rowsOf(projection: SastProjection): AssetRow[] {
  return projection.assets.map((asset) => {
    const parentEdge = projection.edges.find(edge => edge.kind === 'parent' && edge.targetId === asset.id)
    const parent = parentEdge === undefined
      ? undefined
      : projection.assets.find(candidate => candidate.id === parentEdge.sourceId)
    return {
      id: asset.id,
      type: asset.type,
      value: asset.value,
      meta: asset.meta,
      parentValue: parent?.value ?? '',
    }
  })
}

/** Group asset rows by type in display order. */
function groupByType(rows: readonly AssetRow[]): Array<{ type: SastAssetType; rows: AssetRow[] }> {
  return ASSET_TYPES
    .map(type => ({ type, rows: rows.filter(row => row.type === type) }))
    .filter(group => group.rows.length > 0)
}

/** List mode: sections per asset type with inline parent links. */
function AssetList({ sast, t }: AssetsViewProps) {
  const groups = groupByType(rowsOf(sast))
  return (
    <div className={css.list} data-testid="sast-assets-list">
      {groups.map(group => (
        <section key={group.type} className={css.group} data-testid="sast-asset-group">
          <h4 className={css.groupTitle}>{t(TYPE_LABELS[group.type])}</h4>
          <ul className={css.rows}>
            {group.rows.map(row => (
              <li key={row.id} className={css.row} data-testid="sast-asset-row">
                <span className={css.rowValue}>{row.value}</span>
                {row.meta !== '' && <span className={css.rowMeta}>（{row.meta}）</span>}
                {row.parentValue !== '' && <span className={css.rowParent}>← {row.parentValue}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/** The React Flow node payload of one placed asset (type alias: the node data must satisfy Record<string, unknown>). */
type FlowNodeData = { readonly asset: AssetGraphNode }

/** One custom flow node: an asset-type badge over the value, with source/target handles. */
function AssetFlowNode({ data, t }: NodeProps & { t: PropsLocale<'sast'>['t'] }) {
  const asset = (data as FlowNodeData).asset
  return (
    <div className={css.node} data-type={asset.type} data-testid="explore-node-asset">
      <Handle type="target" position={Position.Left} className={css.handle} />
      <span className={css.nodeBadge}>{t(TYPE_LABELS[asset.type])}</span>
      <span className={css.nodeValue} title={asset.value}>{asset.value}</span>
      {asset.meta !== '' && <span className={css.nodeMeta} title={asset.meta}>{asset.meta}</span>}
      <Handle type="source" position={Position.Right} className={css.handle} />
    </div>
  )
}

/** One custom edge: a bezier curve with a visible 隶属 pill at its midpoint. */
export function AssetEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label }: EdgeProps) {
  const [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetPosition, targetX, targetY })
  return (
    <>
      <BaseEdge id={id} path={path} />
      {label !== undefined && (
        <EdgeLabelRenderer>
          <div className={css.edgeLabel} style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}>
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

/** Graph mode: the parent-child asset tree. */
function AssetGraph({ sast, t }: AssetsViewProps) {
  const { nodes, edges } = useMemo(() => layoutAssets(sast), [sast])
  const [selectedAsset, setSelectedAsset] = useState<AssetGraphNode | null>(null)
  const flowNodes = useMemo<FlowNode<FlowNodeData, 'sast'>[]>(() =>
    nodes.map(node => ({
      id: node.id,
      type: 'sast',
      position: { x: node.x, y: node.y },
      data: { asset: node },
      style: ASSET_NODE_SIZE,
    })), [nodes])
  const flowEdges = useMemo<FlowEdge[]>(() =>
    edges.map(edge => ({
      id: edge.id,
      type: 'sast',
      source: edge.sourceId,
      target: edge.targetId,
      label: t('edge.parent'),
    })), [edges, t])
  const nodeTypes = useMemo<NodeTypes>(() => ({
    sast: (props: NodeProps) => <AssetFlowNode {...props} t={t} />,
  }), [t])
  return (
    <div className={css.graph} data-testid="sast-assets-graph">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={{ sast: AssetEdge }}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, flowNode) => { setSelectedAsset((flowNode.data as FlowNodeData).asset) }}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
      {selectedAsset !== null && (
        <GraphDetailDrawer
          title={selectedAsset.value}
          fields={[
            { label: t('detail.field.assetType'), value: t(TYPE_LABELS[selectedAsset.type]) },
            { label: t('detail.field.assetValue'), value: selectedAsset.value },
            { label: t('detail.field.meta'), value: selectedAsset.meta },
          ]}
          onClose={() => { setSelectedAsset(null) }}
          t={t}
        />
      )}
    </div>
  )
}

/** Full props of the assets sub-tab. */
export interface AssetsViewProps {
  readonly sast: SastProjection
  readonly t: PropsLocale<'sast'>['t']
}

export function AssetsView({ sast, t }: AssetsViewProps) {
  const [mode, setMode] = useState<AssetMode>('list')
  if (sast.assets.length === 0) {
    return <p className={css.empty} data-testid="sast-assets-empty">{t('assets.empty')}</p>
  }
  return (
    <div className={css.root} data-testid="sast-assets">
      <div className={css.modeBar}>
        {(['list', 'graph'] as const).map(modeKey => (
          <button
            key={modeKey}
            type="button"
            className={css.modeButton}
            aria-pressed={mode === modeKey}
            data-testid={`sast-assets-mode-${modeKey}`}
            onClick={() => { setMode(modeKey) }}
          >
            {t(modeKey === 'list' ? 'assets.mode.list' : 'assets.mode.graph')}
          </button>
        ))}
      </div>
      {mode === 'list' ? <AssetList sast={sast} t={t} /> : <AssetGraph sast={sast} t={t} />}
    </div>
  )
}
