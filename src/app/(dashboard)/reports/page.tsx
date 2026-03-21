import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Package, ListTree, GitPullRequest,
  Archive, BarChart3,
} from "lucide-react"

const reports = [
  {
    title: "Product History",
    description: "All product versions with price and status changes",
    href: "/reports/product-history",
    icon: Package,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    title: "BOM History",
    description: "BOM version history per product",
    href: "/reports/bom-history",
    icon: ListTree,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    title: "ECO Matrix",
    description: "All ECOs with risk, stage and conflict status",
    href: "/reports/matrix",
    icon: GitPullRequest,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    title: "Archived Items",
    description: "Archived products and BOMs",
    href: "/reports/archived",
    icon: Archive,
    color: "text-zinc-500",
    bg: "bg-zinc-50",
  },
]

export default async function ReportsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Reports</h1>
        <p className="text-zinc-500 text-sm mt-1">
          View historical data and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Link key={report.href} href={report.href}>
              <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div
                  className={`w-10 h-10 rounded-lg ${report.bg} flex items-center justify-center mb-3`}
                >
                  <Icon className={`w-5 h-5 ${report.color}`} />
                </div>
                <h3 className="font-semibold text-zinc-800">{report.title}</h3>
                <p className="text-sm text-zinc-400 mt-1">{report.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
