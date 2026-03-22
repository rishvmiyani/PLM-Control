import { auth }    from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma }   from "@/lib/prisma"
import Link         from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Plus, Package } from "lucide-react"

export const dynamic = "force-dynamic"

const font = "'DM Sans', sans-serif"

export default async function BOMPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const boms = await prisma.bOM.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, version: true } },
      _count:  { select: { components: true, operations: true } },
    },
  })

  const canCreate = ["ADMIN", "ENGINEERING"].includes(session.user.role)

  return (
    <div style={{ fontFamily: font, maxWidth: 1000, padding: "0 4px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{
            fontSize: "clamp(1.4rem,4vw,1.8rem)", fontWeight: 800, margin: 0,
            background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Bills of Material
          </h1>
          <p style={{ color: "#9b6aab", fontSize: 13, margin: "5px 0 0", fontWeight: 500 }}>
            {boms.length} BOM{boms.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {canCreate && (
          <Link href="/bom/new" style={{ textDecoration: "none" }}>
            <button style={{
              display:      "flex", alignItems: "center", gap: 7,
              padding:      "9px 18px", borderRadius: 10,
              background:   "linear-gradient(135deg,#8b3b9e,#be71d1)",
              border:       "none", color: "#fff",
              fontSize:     13, fontWeight: 700,
              cursor:       "pointer",
              boxShadow:    "0 2px 10px rgba(139,59,158,0.25)",
              fontFamily:   font,
            }}>
              <Plus style={{ width: 14, height: 14 }} />
              New BOM
            </button>
          </Link>
        )}
      </div>

      {/* Empty state */}
      {boms.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          border: "2px dashed rgba(190,113,209,0.25)",
          borderRadius: 16, color: "#b0a0bc",
        }}>
          <Package style={{ width: 32, height: 32, margin: "0 auto 10px", opacity: 0.4 }} />
          <p style={{ fontSize: 14, margin: 0 }}>No BOMs created yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {boms.map((bom) => {
            const STATUS_STYLE = bom.status === "ACTIVE"
              ? { bg: "rgba(39,174,96,0.10)",  color: "#27ae60" }
              : { bg: "rgba(160,144,184,0.12)", color: "#8b7aaa" }

            return (
              <div key={bom.id} style={{
                background:   "#fff",
                border:       "1px solid rgba(190,113,209,0.16)",
                borderRadius: 14,
                padding:      "16px 20px",
                boxShadow:    "0 2px 10px rgba(139,59,158,0.06)",
                display:      "flex",
                alignItems:   "center",
                gap:          16,
              }}>
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: "rgba(139,59,158,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Package style={{ width: 18, height: 18, color: "#8b3b9e" }} />
                </div>

                {/* Main info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#2d1a38" }}>
                      {bom.product.name}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: "2px 8px", borderRadius: 6,
                      background: "rgba(139,59,158,0.08)", color: "#8b3b9e",
                    }}>
                      BOM v{bom.version}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: "2px 8px", borderRadius: 6,
                      background: STATUS_STYLE.bg, color: STATUS_STYLE.color,
                    }}>
                      {String(bom.status)}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 14 }}>
                    <span style={{ fontSize: 12, color: "#9b6aab" }}>
                      📦 {bom._count.components} components
                    </span>
                    <span style={{ fontSize: 12, color: "#9b6aab" }}>
                      ⚙️ {bom._count.operations} operations
                    </span>
                    <span style={{ fontSize: 12, color: "#b0a0bc" }}>
                      {formatDistanceToNow(new Date(bom.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* View button */}
                <Link href={`/bom/${bom.id}`} style={{ textDecoration: "none" }}>
                  <button style={{
                    padding:    "7px 16px", borderRadius: 8,
                    background: "rgba(139,59,158,0.08)",
                    border:     "1px solid rgba(190,113,209,0.20)",
                    color:      "#8b3b9e", fontSize: 12, fontWeight: 700,
                    cursor:     "pointer", fontFamily: font,
                  }}>
                    View Tree
                  </button>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
