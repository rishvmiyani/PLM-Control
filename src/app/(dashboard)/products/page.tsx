import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, Eye, Package } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
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
            Products
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#9b6aab", margin: "4px 0 0" }}>
            {products.filter(p => p.status === "ACTIVE").length} active ·{" "}
            {products.filter(p => p.status === "ARCHIVED").length} archived
          </p>
        </div>
        <Link href="/products/new">
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
            New Product
          </button>
        </Link>
      </div>

      {/* Table */}
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
              {["PRODUCT","VERSION","SALE PRICE","COST PRICE","MARGIN","STATUS",""].map((h) => (
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
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{
                  textAlign: "center", padding: 48,
                  color: "#9b6aab", fontSize: 13,
                }}>
                  No products found.{" "}
                  <Link href="/products/new" style={{ color: "#8b3b9e", fontWeight: 600 }}>
                    Create one →
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const margin = product.salePrice > 0
                  ? (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(1)
                  : "0.0"
                const isActive = product.status === "ACTIVE"

                return (
                  <tr key={product.id} style={{ borderBottom: "1px solid rgba(190,113,209,0.06)" }}>

                    {/* Product name */}
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: "rgba(139,59,158,0.08)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <Package style={{ width: 15, height: 15, color: "#8b3b9e" }} />
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#2d1a38", margin: 0 }}>
                          {product.name}
                        </p>
                      </div>
                    </td>

                    {/* Version */}
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        fontSize: 12, fontWeight: 600, color: "#8b3b9e",
                        background: "rgba(139,59,158,0.08)",
                        padding: "3px 12px", borderRadius: 999,
                      }}>
                        v{product.version}
                      </span>
                    </td>

                    {/* Sale price */}
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#2d1a38" }}>
                        ₹{product.salePrice.toLocaleString()}
                      </span>
                    </td>

                    {/* Cost price */}
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: 13, color: "#7c5f8a" }}>
                        ₹{product.costPrice.toLocaleString()}
                      </span>
                    </td>

                    {/* Margin */}
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: parseFloat(margin) >= 30 ? "#2e7d32" : parseFloat(margin) >= 15 ? "#e07b00" : "#c62828",
                      }}>
                        {margin}%
                      </span>
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
                        {product.status}
                      </span>
                    </td>

                    {/* View */}
                    <td style={{ padding: "14px 20px" }}>
                      <Link href={`/products/${product.id}`}>
                        <button style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "6px 14px", borderRadius: 8,
                          background: "rgba(139,59,158,0.08)",
                          border: "1px solid rgba(139,59,158,0.15)",
                          color: "#8b3b9e", fontSize: 12, fontWeight: 600,
                          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        }}>
                          <Eye style={{ width: 13, height: 13 }} />
                          View
                        </button>
                      </Link>
                    </td>

                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
