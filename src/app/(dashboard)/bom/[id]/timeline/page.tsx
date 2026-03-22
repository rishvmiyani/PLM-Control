import { auth }        from "@/lib/auth"
import { redirect }    from "next/navigation"
import { prisma }      from "@/lib/prisma"
import VersionTimeline from "@/components/bom/VersionTimeline"
import Link            from "next/link"
import { ArrowLeft }   from "lucide-react"

const font = "'DM Sans', sans-serif"

export default async function BOMTimelinePage({
  params,
}: {
  params: Promise<{ id: string }>   // ← Promise type in Next.js 15
}) {
  const { id } = await params        // ← await it first

  const session = await auth()
  if (!session?.user) redirect("/login")

  const bom = await prisma.bOM.findUnique({
    where:   { id },
    include: { product: { select: { name: true, version: true } } },
  })
  if (!bom) redirect("/bom")

  const allVersions = await prisma.bOM.findMany({
    where:   { productId: bom.productId },
    orderBy: { version: "desc" },
    select:  {
      id:        true,
      version:   true,
      status:    true,
      createdAt: true,
    },
  })

  const items = allVersions.map((v) => ({
    id:        v.id,
    version:   v.version,
    status:    String(v.status),
    createdAt: v.createdAt.toISOString(),
    isCurrent: v.id === id,
  }))

  return (
    <div style={{ fontFamily: font, maxWidth: 600 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href={`/bom/${id}`} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, color: "#8b3b9e", fontWeight: 600,
          textDecoration: "none", marginBottom: 12,
        }}>
          <ArrowLeft style={{ width: 13, height: 13 }} /> Back to BOM
        </Link>

        <h1 style={{
          fontSize: "clamp(1.3rem,4vw,1.6rem)", fontWeight: 800, margin: 0,
          background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Version History
        </h1>
        <p style={{ fontSize: 13, color: "#9b6aab", margin: "4px 0 0", fontWeight: 500 }}>
          {bom.product.name} · {allVersions.length} version{allVersions.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div style={{
        background: "#fff",
        border: "1px solid rgba(190,113,209,0.14)",
        borderRadius: 16,
        padding: "24px 24px 24px 52px",
        boxShadow: "0 2px 12px rgba(139,59,158,0.07)",
      }}>
        <VersionTimeline items={items} />
      </div>
    </div>
  )
}
