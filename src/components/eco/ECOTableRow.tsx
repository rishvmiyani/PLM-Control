"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { useState } from "react"

interface Props {
  id: string
  ecoCode: string
  title: string
  productName: string
  productVersion: number
  type: string
  stage: string
  riskLevel: string
  createdAt: Date
  ownerLoginId: string
  hasConflict: boolean
  badge: { bg: string; color: string; border: string }
  riskColor: string
}

export default function ECOTableRow({
  id, ecoCode, title, productName, productVersion,
  type, stage, riskLevel, createdAt, ownerLoginId,
  hasConflict, badge, riskColor,
}: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <tr
      style={{
        borderBottom: "1px solid rgba(190,113,209,0.06)",
        background: hovered ? "#faf6fd" : "transparent",
        transition: "background 0.15s",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ECO ID */}
      <td style={{ padding: "14px 20px" }}>
        <Link href={`/eco/${id}`} style={{
          fontSize: 13, fontWeight: 600,
          color: "#8b3b9e", textDecoration: "none",
        }}>
          {ecoCode}
        </Link>
      </td>

      {/* Title */}
      <td style={{ padding: "14px 20px", maxWidth: 240 }}>
        <Link href={`/eco/${id}`} style={{ textDecoration: "none" }}>
          <p style={{
            fontSize: 13, fontWeight: 500, color: "#2d1a38",
            margin: 0, overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {title}
          </p>
        </Link>
        {hasConflict && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
            <AlertTriangle style={{ width: 11, height: 11, color: "#e63b6f" }} />
            <span style={{ fontSize: 11, color: "#e63b6f", fontWeight: 500 }}>Conflict</span>
          </div>
        )}
      </td>

      {/* Product */}
      <td style={{ padding: "14px 20px" }}>
        <span style={{ fontSize: 13, color: "#7c5f8a" }}>
          {productName} v{productVersion}
        </span>
      </td>

      {/* Type */}
      <td style={{ padding: "14px 20px" }}>
        <span style={{
          fontSize: 11, fontWeight: 600, color: "#8b3b9e",
          background: "rgba(139,59,158,0.08)",
          padding: "3px 10px", borderRadius: 999,
        }}>
          {type}
        </span>
      </td>

      {/* Stage */}
      <td style={{ padding: "14px 20px" }}>
        <span style={{
          fontSize: 12, fontWeight: 600,
          background: badge.bg, color: badge.color,
          border: `1px solid ${badge.border}`,
          padding: "4px 12px", borderRadius: 999,
          whiteSpace: "nowrap",
        }}>
          {stage}
        </span>
      </td>

      {/* Risk */}
      <td style={{ padding: "14px 20px" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: riskColor }}>
          {riskLevel.charAt(0) + riskLevel.slice(1).toLowerCase()}
        </span>
      </td>

      {/* Date */}
      <td style={{ padding: "14px 20px" }}>
        <span style={{ fontSize: 12, color: "#9b6aab", whiteSpace: "nowrap" }}>
          {new Date(createdAt).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
          })}
        </span>
      </td>

      {/* Owner */}
      <td style={{ padding: "14px 20px" }}>
        <div title={ownerLoginId} style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 11, fontWeight: 700,
        }}>
          {ownerLoginId.slice(0, 2).toUpperCase()}
        </div>
      </td>
    </tr>
  )
}
