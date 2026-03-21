import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  ArrowLeft, Plus, Package,
  Wrench, ChevronRight, IndianRupee, Layers,
} from "lucide-react"
import BOMVersionList from "@/components/bom/BOMVersionList"

export const dynamic = "force-dynamic"

export default async function BOMDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params

  const bom = await prisma.bOM.findUnique({
    where: { id },
    include: {
      product: {
        select: { id: true, name: true, version: true },
      },
      components: {
        include: {
          product: {
            select: { name: true, version: true, costPrice: true },
          },
        },
        orderBy: { quantity: "asc" },
      },
    },
  })

  if (!bom) notFound()

  const allVersions = await prisma.bOM.findMany({
    where: { productId: bom.productId },
    orderBy: { version: "desc" },
    select: {
      id: true, version: true,
      status: true, createdAt: true,
    },
  })

  const canCreateECO = ["ADMIN", "ENGINEERING"].includes(session.user.role)
  const isActive     = bom.status === "ACTIVE"

  const totalCost = bom.components.reduce(
    (sum, c) => sum + (c.product?.costPrice ?? 0) * c.quantity, 0
  )

  const font = "'DM Sans', sans-serif"

  return (
    <div style={{ fontFamily: font, maxWidth: 860, padding: "0 4px" }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 24, flexWrap: "wrap", gap: 14,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Link href={`/products/${bom.product.id}`} style={{ textDecoration: "none" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: "rgba(139,59,158,0.08)",
              border: "1px solid rgba(190,113,209,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
              <ArrowLeft style={{ width: 15, height: 15, color: "#8b3b9e" }} />
            </div>
          </Link>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#2d1a38", margin: 0 }}>
                {bom.product.name}
              </h1>
              <span style={{
                padding: "2px 9px", borderRadius: 6,
                background: "rgba(139,59,158,0.08)",
                border: "1px solid rgba(190,113,209,0.22)",
                fontSize: 11, fontWeight: 700, color: "#8b3b9e",
              }}>
                BOM v{bom.version}
              </span>
              <span style={{
                padding: "2px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: isActive
                  ? "rgba(39,174,96,0.10)" : "rgba(160,144,184,0.12)",
                color: isActive ? "#27ae60" : "#8b7aaa",
              }}>
                {bom.status}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#b0a0bc", margin: "4px 0 0" }}>
              Product v{bom.product.version} · BOM ID: {bom.id}
            </p>
          </div>
        </div>

        {canCreateECO && isActive && (
          <Link
            href={`/eco/new?bomId=${bom.id}&productId=${bom.product.id}&type=BOM`}
            style={{ textDecoration: "none" }}
          >
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "10px 18px", borderRadius: 11, border: "none",
              background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              fontFamily: font, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(139,59,158,0.26)",
            }}>
              <Plus style={{ width: 14, height: 14 }} />
              Create ECO
            </button>
          </Link>
        )}
      </div>

      {/* ── Stats ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3,1fr)",
        gap: 14, marginBottom: 22,
      }}>
        {[
          {
            label: "Components",
            value: bom.components.length,
            icon: <Layers style={{ width: 18, height: 18, color: "#8b3b9e" }} />,
            iconBg: "rgba(139,59,158,0.09)", valueColor: "#2d1a38",
          },
          {
            label: "BOM Version",
            value: `v${bom.version}`,
            icon: <Wrench style={{ width: 18, height: 18, color: "#be71d1" }} />,
            iconBg: "rgba(190,113,209,0.10)", valueColor: "#2d1a38",
          },
          {
            label: "Total Cost",
            value: `₹${totalCost.toLocaleString()}`,
            icon: <IndianRupee style={{ width: 18, height: 18, color: "#27ae60" }} />,
            iconBg: "rgba(39,174,96,0.09)", valueColor: "#27ae60",
          },
        ].map(({ label, value, icon, iconBg, valueColor }) => (
          <div key={label} style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(190,113,209,0.14)",
            borderRadius: 14, padding: "18px 16px",
            boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {icon}
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#9b6aab", margin: 0, fontWeight: 600 }}>
                {label}
              </p>
              <p style={{
                fontSize: 20, fontWeight: 800,
                color: valueColor, margin: "2px 0 0", lineHeight: 1,
              }}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Components ── */}
      <div style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(190,113,209,0.14)",
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
        overflow: "hidden", marginBottom: 22,
      }}>
        <div style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(190,113,209,0.10)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: 0 }}>
            Components ({bom.components.length})
          </h2>
          <span style={{ fontSize: 11, color: "#9b6aab", fontWeight: 600 }}>
            Total: ₹{totalCost.toLocaleString()}
          </span>
        </div>

        {bom.components.length === 0 ? (
          <div style={{ padding: "28px 18px", textAlign: "center" }}>
            <Package style={{ width: 22, height: 22, color: "#c0a8d0", margin: "0 auto 8px" }} />
            <p style={{ fontSize: 12, color: "#b0a0bc", fontWeight: 600, margin: 0 }}>
              No components added yet
            </p>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 130px 110px",
              padding: "7px 18px",
              background: "rgba(245,240,252,0.5)",
              borderBottom: "1px solid rgba(190,113,209,0.08)",
            }}>
              {["COMPONENT", "VERSION", "QTY × PRICE", "SUBTOTAL"].map((col) => (
                <span key={col} style={{
                  fontSize: 10, fontWeight: 800,
                  color: "#9b6aab", letterSpacing: "0.06em",
                }}>
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div style={{ padding: "6px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
              {bom.components.map((comp, i) => {
                const costPrice = comp.product?.costPrice ?? 0
                const subtotal  = costPrice * comp.quantity
                return (
                  <div key={comp.id} style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 130px 110px",
                    padding: "10px 10px", borderRadius: 10,
                    background: i % 2 === 0
                      ? "rgba(245,240,252,0.3)" : "transparent",
                    alignItems: "center",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        background: "rgba(139,59,158,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Package style={{ width: 12, height: 12, color: "#8b3b9e" }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38" }}>
                        {comp.product?.name ?? "—"}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: "#8b3b9e", fontWeight: 600 }}>
                      v{comp.product?.version ?? "—"}
                    </span>
                    <span style={{ fontSize: 11, color: "#4a2d5a", fontWeight: 600 }}>
                      ×{comp.quantity} · ₹{costPrice.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#2d1a38" }}>
                      ₹{subtotal.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div style={{
              padding: "12px 20px",
              borderTop: "1px solid rgba(190,113,209,0.10)",
              display: "flex", justifyContent: "flex-end",
              background: "rgba(245,240,252,0.3)",
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38" }}>
                Total Cost:&nbsp;
                <span style={{ color: "#27ae60" }}>₹{totalCost.toLocaleString()}</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Version History ── */}
      <div style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(190,113,209,0.14)",
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
        overflow: "hidden", marginBottom: 8,
      }}>
        <div style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(190,113,209,0.10)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: 0 }}>
            Version History
          </h2>
          <Link href={`/bom/${bom.id}/timeline`} style={{
            fontSize: 12, color: "#8b3b9e", fontWeight: 600,
            textDecoration: "none",
            display: "flex", alignItems: "center", gap: 2,
          }}>
            View Timeline <ChevronRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          <BOMVersionList
            versions={allVersions.map((v) => ({
              ...v,
              status:    String(v.status),
              createdAt: v.createdAt.toISOString(),
              isCurrent: v.id === bom.id,
            }))}
          />
        </div>
      </div>

    </div>
  )
}
