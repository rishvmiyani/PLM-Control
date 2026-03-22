import { auth }      from "@/lib/auth"
import { redirect }  from "next/navigation"
import { prisma }    from "@/lib/prisma"
import dynamic       from "next/dynamic"
import Link          from "next/link"
import { ArrowLeft } from "lucide-react"

const BOMTree = dynamic(
  () => import("@/components/bom/BOMTree"),
  {
    ssr:     false,
    loading: () => (
      <div style={{
        height: 460, borderRadius: 14,
        background: "rgba(245,238,250,0.5)",
        border: "1px solid rgba(190,113,209,0.14)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#9b6aab", fontSize: 13, fontFamily: "'DM Sans',sans-serif",
      }}>
        Loading BOM Tree…
      </div>
    ),
  }
)

const font = "'DM Sans', sans-serif"

export default async function BOMTreePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }  = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const bom = await prisma.bOM.findUnique({
    where:   { id },
    include: {
      product:    { select: { name: true, version: true } },
      components: {
        include: {
          product: { select: { name: true, costPrice: true } },
        },
      },
      operations: true,
    },
  })

  if (!bom) redirect("/bom")

  const totalCost = bom.components.reduce(
    (sum, c) => sum + c.quantity * c.product.costPrice, 0
  )

  return (
    <div style={{ fontFamily: font }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href={`/bom/${id}`} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, color: "#8b3b9e", fontWeight: 600,
          textDecoration: "none", marginBottom: 12,
        }}>
          <ArrowLeft style={{ width: 13, height: 13 }} /> Back to BOM
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{
              fontSize: "clamp(1.3rem,4vw,1.6rem)", fontWeight: 800,
              margin: 0,
              background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              BOM Structure Tree
            </h1>
            <p style={{ fontSize: 13, color: "#9b6aab", margin: "4px 0 0", fontWeight: 500 }}>
              {bom.product.name} · v{bom.version} ·{" "}
              {bom.components.length} component{bom.components.length !== 1 ? "s" : ""} ·{" "}
              {bom.operations.length} operation{bom.operations.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Cost summary */}
          <div style={{
            background: "rgba(139,59,158,0.06)",
            border: "1px solid rgba(139,59,158,0.15)",
            borderRadius: 10, padding: "8px 16px", textAlign: "right",
          }}>
            <div style={{ fontSize: 10, color: "#9b6aab", fontWeight: 700 }}>
              TOTAL COMPONENT COST
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#8b3b9e" }}>
              ₹{totalCost.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap",
      }}>
        {[
          { color: "#8b3b9e", label: "Product (root)" },
          { color: "rgba(139,59,158,0.25)", border: "#8b3b9e", label: "Component" },
          { color: "rgba(59,122,190,0.10)",  border: "#3b7abe", label: "Operation" },
        ].map(({ color, border, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 12, height: 12, borderRadius: 3,
              background: color,
              border: border ? `1.5px solid ${border}` : "none",
            }} />
            <span style={{ fontSize: 11, color: "#7c5f8a" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Tree */}
      <div style={{
        background:   "#fff",
        border:       "1px solid rgba(190,113,209,0.14)",
        borderRadius: 16,
        overflow:     "hidden",
        boxShadow:    "0 2px 12px rgba(139,59,158,0.07)",
      }}>
        <BOMTree
          bomId={id}
          bomVersion={bom.version}
          product={bom.product}
          components={bom.components}
          operations={bom.operations}
        />
      </div>

      {/* Component detail table */}
      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: "#2d1a38", marginBottom: 12 }}>
          Components Detail
        </h2>
        <div style={{
          background: "#fff",
          border: "1px solid rgba(190,113,209,0.14)",
          borderRadius: 14, overflow: "hidden",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 80px 140px 140px",
            padding: "8px 16px",
            background: "rgba(245,238,250,0.7)",
            borderBottom: "1px solid rgba(190,113,209,0.12)",
          }}>
            {["COMPONENT","QTY","UNIT COST","LINE COST"].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 800, color: "#9b6aab", letterSpacing: "0.06em" }}>
                {h}
              </span>
            ))}
          </div>
          {bom.components.map((c, i) => (
            <div key={c.id} style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 140px 140px",
              padding: "12px 16px",
              alignItems: "center",
              borderBottom: i < bom.components.length - 1
                ? "1px solid rgba(190,113,209,0.08)"
                : "none",
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#2d1a38" }}>
                {c.product.name}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                background: "rgba(139,59,158,0.08)",
                color: "#8b3b9e", padding: "2px 8px",
                borderRadius: 5, display: "inline-block",
              }}>
                ×{c.quantity}
              </span>
              <span style={{ fontSize: 12, color: "#6b4d7a" }}>
                ₹{c.product.costPrice.toLocaleString()}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38" }}>
                ₹{(c.quantity * c.product.costPrice).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
