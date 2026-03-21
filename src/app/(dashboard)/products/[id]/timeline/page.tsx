import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import VersionTimeline from "@/components/products/VersionTimeline"
import Link from "next/link"
import {
  ArrowLeft, Plus, IndianRupee,
  TrendingUp, Package, GitPullRequest,
  ChevronRight,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      boms: { orderBy: { version: "desc" } },
      ecos: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { loginId: true } } },
      },
    },
  })

  if (!product) notFound()

  const allVersions = await prisma.product.findMany({
    where: { name: product.name },
    orderBy: { version: "desc" },
    select: {
      id: true, version: true,
      status: true, createdAt: true, updatedAt: true,
    },
  })

  const canCreateECO = ["ADMIN", "ENGINEERING"].includes(session.user.role)
  const isActive     = product.status === "ACTIVE"
  const margin       = product.salePrice > 0
    ? (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(1)
    : "0.0"

  const font = "'DM Sans', sans-serif"

  const RISK_COLORS: Record<string, { bg: string; color: string }> = {
    LOW:      { bg: "rgba(39,174,96,0.10)",  color: "#27ae60" },
    MEDIUM:   { bg: "rgba(139,59,158,0.10)", color: "#8b3b9e" },
    HIGH:     { bg: "rgba(224,123,0,0.10)",  color: "#e07b00" },
    CRITICAL: { bg: "rgba(198,40,40,0.10)",  color: "#c62828" },
  }

  return (
    <div style={{ fontFamily: font, maxWidth: 860, padding: "0 4px" }}>

      {/* Back + Header */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 24, flexWrap: "wrap", gap: 14,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Link href="/products" style={{ textDecoration: "none" }}>
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
                {product.name}
              </h1>
              <span style={{
                padding: "2px 9px", borderRadius: 6,
                background: "rgba(139,59,158,0.08)",
                border: "1px solid rgba(190,113,209,0.22)",
                fontSize: 11, fontWeight: 700, color: "#8b3b9e",
              }}>
                v{product.version}
              </span>
              <span style={{
                padding: "2px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: isActive
                  ? "rgba(39,174,96,0.10)" : "rgba(160,144,184,0.12)",
                color: isActive ? "#27ae60" : "#8b7aaa",
              }}>
                {product.status}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#b0a0bc", margin: "4px 0 0" }}>
              ID: {product.id}
            </p>
          </div>
        </div>

        {canCreateECO && isActive && (
          <Link
            href={`/eco/new?productId=${product.id}&type=PRODUCT`}
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

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3,1fr)",
        gap: 14, marginBottom: 22,
      }}>
        {[
          {
            label: "Sale Price", value: `₹${product.salePrice.toLocaleString()}`,
            icon: <IndianRupee style={{ width: 18, height: 18, color: "#8b3b9e" }} />,
            iconBg: "rgba(139,59,158,0.09)", valueColor: "#2d1a38",
          },
          {
            label: "Cost Price", value: `₹${product.costPrice.toLocaleString()}`,
            icon: <IndianRupee style={{ width: 18, height: 18, color: "#be71d1" }} />,
            iconBg: "rgba(190,113,209,0.10)", valueColor: "#2d1a38",
          },
          {
            label: "Margin", value: `${margin}%`,
            icon: <TrendingUp style={{ width: 18, height: 18, color: "#27ae60" }} />,
            iconBg: "rgba(39,174,96,0.09)",
            valueColor: parseFloat(margin) >= 0 ? "#27ae60" : "#e63b6f",
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
              <p style={{ fontSize: 20, fontWeight: 800, color: valueColor, margin: "2px 0 0", lineHeight: 1 }}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* BOMs */}
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
            Bill of Materials
          </h2>
          {canCreateECO && isActive && (
            <Link href={`/bom/new?productId=${product.id}`} style={{ textDecoration: "none" }}>
              <button style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                background: "rgba(139,59,158,0.08)",
                border: "1px solid rgba(190,113,209,0.22)",
                color: "#8b3b9e", fontSize: 11, fontWeight: 700,
                fontFamily: font, cursor: "pointer",
              }}>
                <Plus style={{ width: 11, height: 11 }} /> New BOM
              </button>
            </Link>
          )}
        </div>

        {product.boms.length === 0 ? (
          <div style={{ padding: "28px 18px", textAlign: "center" }}>
            <Package style={{ width: 22, height: 22, color: "#c0a8d0", margin: "0 auto 8px" }} />
            <p style={{ fontSize: 12, color: "#b0a0bc", fontWeight: 600, margin: 0 }}>
              No BOMs created yet
            </p>
          </div>
        ) : (
          <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
            {product.boms.map((bom) => (
              <Link key={bom.id} href={`/bom/${bom.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 10,
                  border: "1px solid rgba(190,113,209,0.12)",
                  background: "rgba(245,240,252,0.4)",
                  cursor: "pointer",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38" }}>
                    BOM v{bom.version}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      padding: "2px 9px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: bom.status === "ACTIVE"
                        ? "rgba(39,174,96,0.10)" : "rgba(160,144,184,0.12)",
                      color: bom.status === "ACTIVE" ? "#27ae60" : "#8b7aaa",
                    }}>
                      {bom.status}
                    </span>
                    <ChevronRight style={{ width: 13, height: 13, color: "#c0a8d0" }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent ECOs */}
      {product.ecos.length > 0 && (
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
              Recent ECOs
            </h2>
            <Link href={`/eco?productId=${product.id}`} style={{
              fontSize: 12, color: "#8b3b9e", fontWeight: 600,
              textDecoration: "none",
              display: "flex", alignItems: "center", gap: 2,
            }}>
              View all <ChevronRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>
          <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
            {product.ecos.map((eco) => {
              const rStyle = RISK_COLORS[eco.riskLevel] ?? RISK_COLORS["MEDIUM"]
              return (
                <Link key={eco.id} href={`/eco/${eco.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 10,
                    border: "1px solid rgba(190,113,209,0.12)",
                    background: "rgba(245,240,252,0.4)",
                    cursor: "pointer",
                  }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#2d1a38", margin: 0 }}>
                        {eco.title}
                      </p>
                      <p style={{ fontSize: 10, color: "#b0a0bc", margin: "2px 0 0" }}>
                        by {eco.user.loginId} · {eco.stage}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        padding: "2px 9px", borderRadius: 6,
                        background: rStyle.bg, color: rStyle.color,
                        fontSize: 10, fontWeight: 700,
                      }}>
                        {eco.riskLevel}
                      </span>
                      <ChevronRight style={{ width: 13, height: 13, color: "#c0a8d0" }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Version Timeline */}
      <div style={{ marginBottom: 8 }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 12,
        }}>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: "#2d1a38", margin: 0 }}>
            Version History
          </h2>
        </div>
        <VersionTimeline
          items={allVersions.map((v) => ({
            ...v,
            status:    String(v.status),
            createdAt: v.createdAt.toISOString(),
            updatedAt: v.updatedAt.toISOString(),
          }))}
          currentVersion={product.version}
        />
      </div>

    </div>
  )
}
