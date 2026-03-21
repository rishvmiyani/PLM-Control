import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProductVersionsClient from "@/components/reports/ProductVersionsClient"

export const dynamic = "force-dynamic"

export default async function ProductVersionsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { ecos: true, boms: true } },
    },
  })

  // Group by name to get version history
  const nameGroups = products.reduce((acc, p) => {
    if (!acc[p.name]) acc[p.name] = []
    acc[p.name].push(p)
    return acc
  }, {} as Record<string, typeof products>)

  const grouped = Object.entries(nameGroups).map(([name, versions]) => ({
    name,
    totalVersions: versions.length,
    latestVersion: Math.max(...versions.map(v => v.version)),
    activeCount:   versions.filter(v => v.status === "ACTIVE").length,
    ecoCount:      versions.reduce((s, v) => s + v._count.ecos, 0),
    bomCount:      versions.reduce((s, v) => s + v._count.boms, 0),
  }))

  const rows = products.map((p) => ({
    id:        p.id,
    name:      p.name,
    version:   p.version,
    status:    String(p.status),
    salePrice: p.salePrice,
    costPrice: p.costPrice,
    ecoCount:  p._count.ecos,
    bomCount:  p._count.boms,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  // Chart data — version count per product name
  const versionChart = grouped
    .sort((a, b) => b.totalVersions - a.totalVersions)
    .slice(0, 12)
    .map(g => ({ name: g.name.length > 14 ? g.name.slice(0, 14) + "…" : g.name, versions: g.totalVersions, ecos: g.ecoCount }))

  return (
    <ProductVersionsClient
      rows={rows}
      grouped={grouped}
      versionChart={versionChart}
    />
  )
}
