/**
 * ExploreView: the 审计链路 sub-tab of the 白盒审计 view. Renders the audit
 * chain (scan → intent → fact → derived intent → finding) as an interactive
 * graph with @xyflow/react; positions come from the pure `layoutExploration`
 * helper, nodes carry kind badges and connection handles, chain edges render
 * a visible relationship pill (意图链 / 产出 / 推导自 / 证实), and `flows_to`
 * taint-propagation edges (ADR-05) render with a distinct dashed style and
 * color.
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
import type { SastEdgeKind, SastProjection, SastSeverity } from '@tangxiaofeng7/dsh-sast-host/client'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { EXPLORE_NODE_SIZE, layoutExploration, type ExploreGraphNode } from './graph.ts'
import { GraphDetailDrawer } from './GraphDetailDrawer.tsx'
import type { SastKey } from './locales.ts'
import css from './ExploreView.module.css'

/** Kind badge label keys per node kind. */
const KIND_LABELS: Record<ExploreGraphNode['kind'], SastKey> = {
  scan: 'kind.scan',
  intent: 'kind.intent',
  fact: 'kind.fact',
  finding: 'kind.finding',
}

/** Relationship label keys per chain edge kind (parent/flows_to edges never reach the chain-edge renderer). */
const EDGE_LABELS: Record<SastEdgeKind, SastKey> = {
  spawns: 'edge.spawns',
  yields: 'edge.yields',
  derived_from: 'edge.derived_from',
  proves: 'edge.proves',
  flows_to: 'edge.flows_to',
  parent: 'edge.parent',
}

/** Severity badge label keys. */
const SEVERITY_LABELS: Record<SastSeverity, SastKey> = {
  critical: 'severity.critical',
  high: 'severity.high',
  medium: 'severity.medium',
  low: 'severity.low',
  info: 'severity.info',
}

/** The React Flow node payload of one placed chain node (type alias: the node data must satisfy Record<string, unknown>). */
type FlowNodeData = { readonly node: ExploreGraphNode }

/** One custom flow node: a kind badge over the title and detail line, with source/target handles. */
function ChainNode({ data, t }: NodeProps & { t: PropsLocale<'sast'>['t'] }) {
  const node = (data as FlowNodeData).node
  return (
    <div className={css.node} data-kind={node.kind} data-severity={node.severity} data-testid={`explore-node-${node.kind}`}>
      <Handle type="target" position={Position.Left} className={css.handle} />
      <span className={css.badge}>{t(KIND_LABELS[node.kind])}</span>
      <span className={css.title} title={node.title}>{node.title}</span>
      {node.detail !== '' && <span className={css.detail} title={node.detail}>{node.detail}</span>}
      {node.severity !== undefined && (
        <span className={css.severity} data-severity={node.severity}>{t(SEVERITY_LABELS[node.severity])}</span>
      )}
      <Handle type="source" position={Position.Right} className={css.handle} />
    </div>
  )
}

/** One custom edge: a bezier curve with a visible relationship pill at its midpoint. */
export function ChainEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label }: EdgeProps) {
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

/** One taint-propagation edge (ADR-05): a dashed bezier curve in a distinct color, with the 污点传播 pill. */
export function FlowEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, label }: EdgeProps) {
  const [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetPosition, targetX, targetY })
  return (
    <>
      <BaseEdge id={id} path={path} className={css.flowEdgePath} />
      {label !== undefined && (
        <EdgeLabelRenderer>
          <div className={css.flowEdgeLabel} style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}>
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

/** Full props of the explore sub-tab. */
export interface ExploreViewProps {
  readonly sast: SastProjection
  readonly t: PropsLocale<'sast'>['t']
}

export function ExploreView({ sast, t }: ExploreViewProps) {
  const { nodes, edges, flowEdges } = useMemo(() => layoutExploration(sast), [sast])
  const [selectedNode, setSelectedNode] = useState<ExploreGraphNode | null>(null)
  const positionById = useMemo(() => new Map(nodes.map(node => [node.id, node])), [nodes])
  const flowNodes = useMemo<FlowNode<FlowNodeData, 'sast'>[]>(() =>
    nodes.map(node => ({
      id: node.id,
      type: 'sast',
      position: { x: node.x, y: node.y },
      data: { node },
      style: EXPLORE_NODE_SIZE,
    })), [nodes])
  const flowEdgesFlow = useMemo<FlowEdge[]>(() => [
    ...edges.map(edge => ({
      id: edge.id,
      type: 'chain',
      source: edge.sourceId,
      target: edge.targetId,
      label: t(EDGE_LABELS[edge.kind]),
    })),
    ...flowEdges
      .filter(edge => positionById.has(edge.sourceId) && positionById.has(edge.targetId))
      .map(edge => ({
        id: edge.id,
        type: 'flow',
        source: edge.sourceId,
        target: edge.targetId,
        label: t(EDGE_LABELS[edge.kind]),
      })),
  ], [edges, flowEdges, positionById, t])
  // The locale seat rides into the custom nodes through a render-scoped type
  // map (React Flow re-renders nodes when the map identity changes).
  const nodeTypes = useMemo<NodeTypes>(() => ({
    sast: (props: NodeProps) => <ChainNode {...props} t={t} />,
  }), [t])
  return (
    <div className={css.graph} data-testid="sast-explore">
      {nodes.length <= 1 ? (
        <p className={css.empty} data-testid="sast-explore-empty">{t('explore.empty')}</p>
      ) : (
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdgesFlow}
          nodeTypes={nodeTypes}
          edgeTypes={{ chain: ChainEdge, flow: FlowEdge }}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, flowNode) => { setSelectedNode((flowNode.data as FlowNodeData).node) }}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      )}
      {selectedNode !== null && (
        <GraphDetailDrawer
          title={selectedNode.title}
          fields={[
            { label: t('detail.field.kind'), value: t(KIND_LABELS[selectedNode.kind]) },
            { label: t('detail.field.detail'), value: selectedNode.detail },
            ...(selectedNode.severity === undefined ? [] : [{ label: t('detail.field.severity'), value: t(SEVERITY_LABELS[selectedNode.severity]) }]),
          ]}
          onClose={() => { setSelectedNode(null) }}
          t={t}
        />
      )}
    </div>
  )
}
