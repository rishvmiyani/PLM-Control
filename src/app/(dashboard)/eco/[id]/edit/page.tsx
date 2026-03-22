import { auth }     from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma }   from "@/lib/prisma"
import Link         from "next/link"
import { ArrowLeft } from "lucide-react"
import EditECOForm  from "@/components/eco/EditECOForm"

export const dynamic = "force-dynamic"

export default async function EditECOPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }  = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const eco = await prisma.eCO.findUnique({
    where:   { id },
    include: { product: true },
  })

  if (!eco) redirect("/eco")

  // Only allow editing if stage is "New"
  if (!["New", "Engineering Review"].includes(eco.stage)) {
    redirect(`/eco/${id}`)
  }

  const products = await prisma.product.findMany({
    where:   { status: "ACTIVE" },
    select:  { id: true, name: true, version: true },
    orderBy: { name: "asc" },
  })

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 680 }}>

      <Link href={`/eco/${id}`} style={{ textDecoration: "none" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          marginBottom: 20, color: "#8b3b9e", fontSize: 13, fontWeight: 600,
        }}>
          <ArrowLeft style={{ width: 15, height: 15 }} />
          Back to ECO
        </div>
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2d1a38", margin: 0 }}>
          Edit ECO
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#9b6aab", margin: "4px 0 0" }}>
          {eco.title}
        </p>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(190,113,209,0.14)",
        borderRadius: 18,
        padding: "28px 28px 24px",
        boxShadow: "0 4px 24px rgba(139,59,158,0.08)",
      }}>
        <EditECOForm eco={eco} products={products} />
      </div>
    </div>
  )
}
