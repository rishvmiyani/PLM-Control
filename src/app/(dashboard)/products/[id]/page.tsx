import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, Package } from "lucide-react"
import ProductsList from "@/components/products/ProductsList"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { boms: true, ecos: true } },
    },
  })

  const canCreate = ["ADMIN", "ENGINEERING"].includes(session.user.role)
  const font      = "'DM Sans', sans-serif"

  const serialized = products.map((p) => ({
    id:        p.id,
    name:      p.name,
    version:   p.version,
    status:    p.status,
    salePrice: p.salePrice,
    costPrice: p.costPrice,
    bomCount:  p._count.boms,
    ecoCount:  p._count.ecos,
  }))

  return (
    <div style={{ fontFamily: font, maxWidth: 900, padding: "0 4px" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24, flexWrap: "wrap", gap: 14,
      }}>
        <div>
          <h1 style={{
            fontSize: "clamp(1.4rem,4vw,1.8rem)",
            fontWeight: 800, margin: 0,
            background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Products
          </h1>
          <p style={{ fontSize: 13, color: "#9b6aab", margin: "4px 0 0", fontWeight: 500 }}>
            {products.length} product{products.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {canCreate && (
          <Link href="/products/new" style={{ textDecoration: "none" }}>
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "10px 20px", borderRadius: 11, border: "none",
              background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
              color: "#fff", fontSize: 13, fontWeight: 700,
              fontFamily: font, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(139,59,158,0.28)",
            }}>
              <Plus style={{ width: 14, height: 14 }} />
              New Product
            </button>
          </Link>
        )}
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(190,113,209,0.14)",
          borderRadius: 18, padding: "60px 24px",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(139,59,158,0.07)",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "rgba(139,59,158,0.08)",
            display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px",
          }}>
            <Package style={{ width: 26, height: 26, color: "#be71d1" }} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#4a2d5a", margin: "0 0 6px" }}>
            No products yet
          </p>
          <p style={{ fontSize: 13, color: "#b0a0bc", margin: "0 0 20px" }}>
            Create your first product to get started
          </p>
          {canCreate && (
            <Link href="/products/new" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "10px 24px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
                color: "#fff", fontSize: 13, fontWeight: 700,
                fontFamily: font, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(139,59,158,0.25)",
              }}>
                Create Product
              </button>
            </Link>
          )}
        </div>
      ) : (
        <ProductsList products={serialized} />
      )}

    </div>
  )
}
