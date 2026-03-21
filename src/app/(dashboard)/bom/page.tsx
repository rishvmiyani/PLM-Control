import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, Eye, ListTree } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BOMListPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const boms = await prisma.bOM.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, version: true } },
      components: { select: { id: true } },
      operations: { select: { id: true } },
    },
  }).catch(() => [])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2d1a38", margin: 0 }}>
            Bills of Material
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#9b6aab", margin: "4px 0 0" }}>
            {boms.length} BOMs total
          </p>
        </div>
        <Link href="/bom/new">
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: 10,
            background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
            color: "#fff", border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 14px rgba(139,59,158,0.28)",
          }}>
            <Plus style={{ width: 15, height: 15 }} />
            New BOM
          </button>
        </Link>
      </div>

      {/* Table card */}
      <div style={{
        background: "rgba(255,255,255,0.90)",
        border: "1px solid rgba(190,113,209,0.12)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#faf6fd" }}>
              {["PRODUCT", "BOM VERSION", "COMPONENTS", "OPERATIONS", "STATUS", "CREATED", ""].map((h) => (
                <th key={h} style={{
                  padding: "12px 20px", textAlign: "left",
                  fontSize: 11, fontWeight: 700,
                  color: "#9b6aab", letterSpacing: "0.07em",
                  borderBottom: "1px solid rgba(190,113,209,0.1)",
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {boms.length === 0 ? (
              <tr>
                <td colSpan={7} style={{
                  textAlign: "center", padding: 48,
                  color: "#9b6aab", fontSize: 13,
                }}>
                  No BOMs found.{" "}
                  <Link href="/bom/new" style={{ color: "#8b3b9e", fontWeight: 600 }}>
                    Create one →
                  </Link>
                </td>
              </tr>
            ) : (
              boms.map((bom) => (
                <BOMRow key={bom.id} bom={bom} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Inline server-safe row (no hover — add client component if needed) ──
function BOMRow({ bom }: {
  bom: {
    id: string
    version: number
    status: string
    createdAt: Date
    product: { name: string; version: number }
    components: { id: string }[]
    operations: { id: string }[]
  }
}) {
  const isActive = bom.status === "ACTIVE"

  return (
    <tr style={{ borderBottom: "1px solid rgba(190,113,209,0.06)" }}>

      {/* Product */}
      <td style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(139,59,158,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <ListTree style={{ width: 15, height: 15, color: "#8b3b9e" }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#2d1a38", margin: 0 }}>
              {bom.product.name}
            </p>
            <p style={{ fontSize: 11, color: "#9b6aab", margin: "2px 0 0" }}>
              Product v{bom.product.version}
            </p>
          </div>
        </div>
      </td>

      {/* BOM Version */}
      <td style={{ padding: "14px 20px" }}>
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: "#8b3b9e",
          background: "rgba(139,59,158,0.08)",
          padding: "3px 12px", borderRadius: 999,
        }}>
          v{bom.version}
        </span>
      </td>

      {/* Components count */}
      <td style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: "rgba(33,150,243,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2196f3" }}>
              {bom.components.length}
            </span>
          </div>
          <span style={{ fontSize: 12, color: "#7c5f8a" }}>components</span>
        </div>
      </td>

      {/* Operations count */}
      <td style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: "rgba(76,175,80,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4caf50" }}>
              {bom.operations.length}
            </span>
          </div>
          <span style={{ fontSize: 12, color: "#7c5f8a" }}>operations</span>
        </div>
      </td>

      {/* Status */}
      <td style={{ padding: "14px 20px" }}>
        <span style={{
          fontSize: 12, fontWeight: 600,
          background: isActive ? "#e8f5e9" : "#f3f3f3",
          color: isActive ? "#2e7d32" : "#555",
          border: `1px solid ${isActive ? "rgba(46,125,50,0.2)" : "rgba(0,0,0,0.1)"}`,
          padding: "4px 12px", borderRadius: 999,
        }}>
          {bom.status}
        </span>
      </td>

      {/* Created */}
      <td style={{ padding: "14px 20px" }}>
        <span style={{ fontSize: 12, color: "#9b6aab", whiteSpace: "nowrap" }}>
          {new Date(bom.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
          })}
        </span>
      </td>

      {/* View button */}
      <td style={{ padding: "14px 20px" }}>
        <Link href={`/bom/${bom.id}`}>
          <button style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 14px", borderRadius: 8,
            background: "rgba(139,59,158,0.08)",
            border: "1px solid rgba(139,59,158,0.15)",
            color: "#8b3b9e", fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
          }}>
            <Eye style={{ width: 13, height: 13 }} />
            View
          </button>
        </Link>
      </td>

    </tr>
  )
}
