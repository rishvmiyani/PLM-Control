"use client"

import { useCallback } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

interface BOMComponent {
  id: string
  productId: string
  quantity: number
  action?: "ADD" | "REMOVE" | "MODIFY" | "UNCHANGED"
  product: { name: string; costPrice: number }
}

interface BOMOperation {
  id: string
  name: string
  durationMins: number
  workCenter: string
  action?: "ADD" | "REMOVE" | "MODIFY" | "UNCHANGED"
}

interface Props {
  productName: string
  productVersion: number
  components: BOMComponent[]
  operations: BOMOperation[]
}

const ACTION_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  ADD: { bg: "#f0fdf4", border: "#22c55e", text: "#15803d" },
  REMOVE: { bg: "#fef2f2", border: "#ef4444", text: "#b91c1c" },
  MODIFY: { bg: "#fff7ed", border: "#f97316", text: "#c2410c" },
  UNCHANGED: { bg: "#f9fafb", border: "#e4e4e7", text: "#52525b" },
}

function buildNodes(
  productName: string,
  productVersion: number,
  components: BOMComponent[],
  operations: BOMOperation[]
): Node[] {
  const nodes: Node[] = []

  // Root node
  nodes.push({
    id: "root",
    type: "default",
    position: { x: 300, y: 0 },
    data: {
      label: (
        <div className="text-center">
          <p className="font-bold text-sm text-zinc-800">{productName}</p>
          <p className="text-xs text-zinc-400">v{productVersion}</p>
        </div>
      ),
    },
    style: {
      background: "#18181b",
      color: "#fff",
      border: "2px solid #18181b",
      borderRadius: "12px",
      padding: "10px 16px",
      minWidth: "140px",
    },
  })

  // Component nodes
  components.forEach((comp, i) => {
    const action = comp.action ?? "UNCHANGED"
    const style = ACTION_STYLES[action]
    const x = i * 160
    const y = 140

    nodes.push({
      id: `comp-${comp.id}`,
      type: "default",
      position: { x, y },
      data: {
        label: (
          <div className="text-center">
            <p className="font-semibold text-xs" style={{ color: style.text }}>
              {comp.product.name}
            </p>
            <p className="text-xs text-zinc-400">× {comp.quantity}</p>
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded mt-1 inline-block"
              style={{ background: style.bg, color: style.text }}
            >
              {action}
            </span>
          </div>
        ),
      },
      style: {
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: "10px",
        padding: "8px 12px",
        minWidth: "120px",
      },
    })
  })

  // Operation nodes
  operations.forEach((op, i) => {
    const action = op.action ?? "UNCHANGED"
    const style = ACTION_STYLES[action]
    const x = i * 160
    const y = 320

    nodes.push({
      id: `op-${op.id}`,
      type: "default",
      position: { x, y },
      data: {
        label: (
          <div className="text-center">
            <p className="font-semibold text-xs" style={{ color: style.text }}>
              {op.name}
            </p>
            <p className="text-xs text-zinc-400">
              {op.durationMins}m · {op.workCenter}
            </p>
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded mt-1 inline-block"
              style={{ background: style.bg, color: style.text }}
            >
              {action}
            </span>
          </div>
        ),
      },
      style: {
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: "10px",
        padding: "8px 12px",
        minWidth: "120px",
      },
    })
  })

  return nodes
}

function buildEdges(
  components: BOMComponent[],
  operations: BOMOperation[]
): Edge[] {
  const edges: Edge[] = []

  components.forEach((comp) => {
    const action = comp.action ?? "UNCHANGED"
    const color =
      action === "ADD" ? "#22c55e" :
      action === "REMOVE" ? "#ef4444" :
      action === "MODIFY" ? "#f97316" : "#a1a1aa"

    edges.push({
      id: `e-root-comp-${comp.id}`,
      source: "root",
      target: `comp-${comp.id}`,
      animated: action !== "UNCHANGED",
      style: { stroke: color, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color },
    })
  })

  operations.forEach((op) => {
    const action = op.action ?? "UNCHANGED"
    const color =
      action === "ADD" ? "#22c55e" :
      action === "REMOVE" ? "#ef4444" :
      action === "MODIFY" ? "#f97316" : "#a1a1aa"

    edges.push({
      id: `e-root-op-${op.id}`,
      source: "root",
      target: `op-${op.id}`,
      animated: action !== "UNCHANGED",
      style: { stroke: color, strokeWidth: 2, strokeDasharray: "5,5" },
      markerEnd: { type: MarkerType.ArrowClosed, color },
    })
  })

  return edges
}

export default function BomTreeDiff({
  productName,
  productVersion,
  components,
  operations,
}: Props) {
  const initialNodes = buildNodes(productName, productVersion, components, operations)
  const initialEdges = buildEdges(components, operations)

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="w-full h-[520px] border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-right"
      >
        <Background color="#e4e4e7" gap={16} />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            const bg = (node.style?.background as string) ?? "#f4f4f5"
            return bg
          }}
        />
      </ReactFlow>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 bg-white border-t border-zinc-100 flex-wrap">
        {Object.entries(ACTION_STYLES).map(([action, s]) => (
          <div key={action} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm border"
              style={{ background: s.bg, borderColor: s.border }}
            />
            <span className="text-xs text-zinc-500">{action}</span>
          </div>
        ))}
        <span className="text-xs text-zinc-400 ml-auto">
          Solid = Components · Dashed = Operations
        </span>
      </div>
    </div>
  )
}
