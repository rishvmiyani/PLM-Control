"use client"

import { useCallback } from "react"
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  type Node, type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

interface Component {
  id:       string
  quantity: number
  product:  { name: string; costPrice: number }
}

interface Operation {
  id:           string
  name:         string
  durationMins: number
  workCenter:   string
}

interface Props {
  bomId:      string
  bomVersion: number
  product:    { name: string; version: number }
  components: Component[]
  operations: Operation[]
}

const font = "'DM Sans', sans-serif"

function ProductNode({ data }: { data: { label: string; version: number } }) {
  return (
    <div style={{
      background:   "linear-gradient(135deg,#8b3b9e,#be71d1)",
      borderRadius: 14,
      padding:      "12px 20px",
      color:        "#fff",
      fontFamily:   font,
      fontWeight:   800,
      fontSize:     13,
      minWidth:     160,
      textAlign:    "center",
      boxShadow:    "0 4px 16px rgba(139,59,158,0.30)",
    }}>
      <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 4, fontWeight: 500 }}>
        PRODUCT
      </div>
      {data.label}
      <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>
        v{data.version}
      </div>
    </div>
  )
}

function ComponentNode({ data }: { data: { name: string; qty: number; cost: number } }) {
  return (
    <div style={{
      background:   "#fff",
      border:       "1.5px solid rgba(139,59,158,0.25)",
      borderRadius: 10,
      padding:      "10px 14px",
      fontFamily:   font,
      minWidth:     140,
      boxShadow:    "0 2px 8px rgba(139,59,158,0.08)",
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "#9b6aab", marginBottom: 3 }}>
        COMPONENT
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38" }}>{data.name}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <span style={{
          fontSize: 10, background: "rgba(139,59,158,0.08)",
          color: "#8b3b9e", padding: "1px 7px", borderRadius: 5, fontWeight: 700,
        }}>
          ×{data.qty}
        </span>
        <span style={{ fontSize: 10, color: "#b0a0bc" }}>
          ₹{data.cost.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

function OperationNode({ data }: { data: { name: string; duration: number; workCenter: string } }) {
  return (
    <div style={{
      background:   "#fff",
      border:       "1.5px solid rgba(59,122,190,0.22)",
      borderRadius: 10,
      padding:      "10px 14px",
      fontFamily:   font,
      minWidth:     140,
      boxShadow:    "0 2px 8px rgba(59,122,190,0.07)",
    }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: "#3b7abe", marginBottom: 3 }}>
        OPERATION
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38" }}>{data.name}</div>
      <div style={{ marginTop: 4 }}>
        <span style={{
          fontSize: 10, background: "rgba(59,122,190,0.08)",
          color: "#3b7abe", padding: "1px 7px", borderRadius: 5, fontWeight: 700,
        }}>
          {data.duration}m
        </span>
        <span style={{ fontSize: 10, color: "#b0a0bc", marginLeft: 6 }}>
          {data.workCenter}
        </span>
      </div>
    </div>
  )
}

const nodeTypes = {
  product:   ProductNode,
  component: ComponentNode,
  operation: OperationNode,
}

export default function BOMTree({
  product, components, operations,
}: Props) {

  // Build nodes
  const initNodes: Node[] = [
    {
      id:       "root",
      type:     "product",
      position: { x: 0, y: 0 },
      data:     { label: product.name, version: product.version },
    },
    // Component nodes — row below root, left side
    ...components.map((c, i) => ({
      id:       `comp-${c.id}`,
      type:     "component" as const,
      position: { x: (i - (components.length - 1) / 2) * 200, y: 160 },
      data:     { name: c.product.name, qty: c.quantity, cost: c.product.costPrice },
    })),
    // Operation nodes — row below root, right offset
    ...operations.map((o, i) => ({
      id:       `op-${o.id}`,
      type:     "operation" as const,
      position: {
        x: components.length * 100 + 60 + i * 200,
        y: 160,
      },
      data: { name: o.name, duration: o.durationMins, workCenter: o.workCenter },
    })),
  ]

  // Build edges
  const initEdges: Edge[] = [
    ...components.map((c) => ({
      id:            `e-root-comp-${c.id}`,
      source:        "root",
      target:        `comp-${c.id}`,
      animated:      true,
      style:         { stroke: "rgba(139,59,158,0.4)", strokeWidth: 1.5 },
    })),
    ...operations.map((o) => ({
      id:            `e-root-op-${o.id}`,
      source:        "root",
      target:        `op-${o.id}`,
      animated:      true,
      style:         { stroke: "rgba(59,122,190,0.4)", strokeWidth: 1.5 },
    })),
  ]

  const [nodes, , onNodesChange] = useNodesState(initNodes)
  const [edges, , onEdgesChange] = useEdgesState(initEdges)

  return (
    <div style={{ width: "100%", height: 460, borderRadius: 14, overflow: "hidden" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(190,113,209,0.08)" gap={20} />
        <Controls />
        <MiniMap
          nodeStrokeColor="#8b3b9e"
          nodeColor="rgba(139,59,158,0.12)"
          maskColor="rgba(245,238,250,0.7)"
        />
      </ReactFlow>
    </div>
  )
}
