import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function ECOConflictsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params

  const eco = await prisma.eCO.findUnique({
    where: { id },
    include: {
      product: { select: { name: true, version: true } },
      user: { select: { loginId: true } },
    },
  })

  if (!eco) redirect("/eco")

  const changes = eco.proposedChanges as Record<string, unknown>

  // Find all open ECOs on same product except this one
  const conflictingECOs = await prisma.eCO.findMany({
    where: {
      productId: eco.productId,
      id: { not: id },
      stage: { notIn: ["Done", "Rejected"] },
    },
    include: {
      product: { select: { name: true, version: true } },
      user: { select: { loginId: true } },
    },
  })

  const CONFLICT_FIELDS = ["salePrice", "costPrice", "name"]

  interface ConflictEntry {
    ecoId: string
    ecoTitle: string
    ecoStage: string
    ecoUser: string
    ecoCreatedAt: Date
    fields: Array<{
      field: string
      thisValue: unknown
      otherValue: unknown
    }>
  }

  const conflicts: ConflictEntry[] = []

  for (const other of conflictingECOs) {
    const otherChanges = other.proposedChanges as Record<string, unknown>
    const conflictFields: ConflictEntry["fields"] = []

    for (const field of CONFLICT_FIELDS) {
      if (
        changes[field] !== undefined &&
        otherChanges[field] !== undefined &&
        changes[field] !== otherChanges[field]
      ) {
        conflictFields.push({
          field,
          thisValue: changes[field],
          otherValue: otherChanges[field],
        })
      }
    }

    if (conflictFields.length > 0) {
      conflicts.push({
        ecoId: other.id,
        ecoTitle: other.title,
        ecoStage: other.stage,
        ecoUser: other.user.loginId,
        ecoCreatedAt: other.createdAt,
        fields: conflictFields,
      })
    }
  }

  const STAGE_COLORS: Record<string, string> = {
    "New": "bg-zinc-100 text-zinc-700",
    "Engineering Review": "bg-blue-100 text-blue-700",
    "Approval": "bg-yellow-100 text-yellow-700",
    "Done": "bg-green-100 text-green-700",
    "Rejected": "bg-red-100 text-red-700",
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/eco/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Conflict Analysis
          </h1>
          <p className="text-zinc-400 text-sm">
            {eco.title} · {eco.product.name} v{eco.product.version}
          </p>
        </div>
      </div>

      {/* No conflicts */}
      {conflicts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">✅</span>
          </div>
          <p className="font-semibold text-green-800">No Conflicts Detected</p>
          <p className="text-sm text-green-600 mt-1">
            This ECO has no field conflicts with other open ECOs on the same product.
          </p>
          <Link href={`/eco/${id}`} className="mt-4 inline-block">
            <Button variant="outline" size="sm">Back to ECO</Button>
          </Link>
        </div>
      )}

      {/* Conflict list */}
      {conflicts.length > 0 && (
        <>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700">
                {conflicts.length} Conflicting ECO(s) Found
              </p>
              <p className="text-sm text-red-600 mt-0.5">
                These ECOs propose different values for the same fields.
                Resolve before approving.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {conflicts.map((c) => (
              <div
                key={c.ecoId}
                className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
              >
                {/* Conflict ECO header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                  <div>
                    <Link
                      href={`/eco/${c.ecoId}`}
                      className="font-semibold text-zinc-800 hover:text-blue-600 transition-colors"
                    >
                      {c.ecoTitle}
                    </Link>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      by {c.ecoUser} ·{" "}
                      {format(new Date(c.ecoCreatedAt), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        STAGE_COLORS[c.ecoStage] ?? "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {c.ecoStage}
                    </span>
                    <Link href={`/eco/${c.ecoId}`}>
                      <Button variant="outline" size="sm">
                        View →
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Field conflicts */}
                <div className="divide-y divide-zinc-100">
                  {c.fields.map((f) => (
                    <div
                      key={f.field}
                      className="grid grid-cols-3 gap-4 px-5 py-3 text-sm"
                    >
                      <div>
                        <p className="text-xs text-zinc-400 mb-1">Field</p>
                        <p className="font-mono font-semibold text-zinc-700">
                          {f.field}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg px-3 py-2">
                        <p className="text-xs text-green-600 mb-1">
                          This ECO
                        </p>
                        <p className="font-semibold text-green-700">
                          {String(f.thisValue)}
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-lg px-3 py-2">
                        <p className="text-xs text-red-500 mb-1">
                          Conflicting ECO
                        </p>
                        <p className="font-semibold text-red-600">
                          {String(f.otherValue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
