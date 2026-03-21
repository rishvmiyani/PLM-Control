import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import NewProductForm from "@/components/products/NewProductForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const font = "'DM Sans', sans-serif"

  return (
    <div style={{ fontFamily: font, maxWidth: 680, padding: "0 4px" }}>

      {/* Back */}
      <Link href="/products" style={{ textDecoration: "none" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          marginBottom: 20, color: "#8b3b9e", fontSize: 13, fontWeight: 600,
          cursor: "pointer",
        }}>
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back to Products
        </div>
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: "1.5rem", fontWeight: 800,
          margin: 0, lineHeight: 1.2,
          background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          New Product
        </h1>
        <p style={{ fontSize: 13, color: "#9b6aab", margin: "5px 0 0", fontWeight: 500 }}>
          Version 1 is auto-assigned
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(190,113,209,0.14)",
        borderRadius: 18,
        padding: "28px 24px 24px",
        boxShadow: "0 4px 24px rgba(139,59,158,0.08)",
      }}>
        <NewProductForm />
      </div>

    </div>
  )
}
