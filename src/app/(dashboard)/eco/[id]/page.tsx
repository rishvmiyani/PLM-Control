"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft, ArrowRight, AlertTriangle,
  CheckCircle, Bot, ClipboardList,
  GitCompare, ShieldAlert, Waves,
} from "lucide-react"

interface ECODetail {
  id: string
  title: string
  type: string
  stage: string
  riskScore: number
  riskLevel: string
  conflictStatus: string
  effectiveDate: string
  createdAt: string
  versionUpdate: boolean
  proposedChanges: Record<string, unknown>
  product: { name: string; version: number; salePrice: number; costPrice: number }
  user: { loginId: string; role: string }
  auditLogs: Array<{
    id: string
    action: string
    oldValue: string | null
    newValue: string | null
    timestamp: string
    user: { loginId: string }
  }>
  aiRisk: { score: number; level: string; reasons: string[] }
  aiConflict: {
    hasConflict: boolean
    conflictingEcoIds: string[]
    conflictingFields: Array<{ field: string; thisValue: unknown; otherValue: unknown; otherEcoId: string }>
  }
  ripple: {
    affectedBOMIds: string[]
    affectedBOMs: Array<{ id: string; version: number; productName: string; componentProductName: string; quantity: number }>
  }
  currentProductSnapshot: Record<string, unknown>
}

const STAGE_COLORS: Record<string, string> = {
  "New": "bg-zinc-100 text-zinc-700",
  "Engineering Review": "bg-blue-100 text-blue-700",
  "Approval": "bg-yellow-100 text-yellow-700",
  "Done": "bg-green-100 text-green-700",
  "Rejected": "bg-red-100 text-red-700",
}

const RISK_COLORS: Record<string, string> = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
}

const RISK_TEXT: Record<string, string> = {
  LOW: "text-green-600",
  MEDIUM: "text-yellow-600",
  HIGH: "text-orange-600",
  CRITICAL: "text-red-600",
}

const STAGE_ORDER = ["New", "Engineering Review", "Approval", "Done"]

export default function ECODetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()

  const [eco, setEco] = useState<ECODetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rippleAck, setRippleAck] = useState(false)
  const [actionError, setActionError] = useState("")

  async function fetchEco() {
    setLoading(true)
    const res = await fetch(`/api/eco/${id}`)
    if (res.ok) setEco(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchEco() }, [id])

  async function handleApprove() {
    setActionLoading(true)
    setActionError("")
    const res = await fetch(`/api/eco/${id}/approve`, { method: "POST" })
    const data = await res.json()
    if (!res.ok) setActionError(data.error ?? "Approve failed")
    else await fetchEco()
    setActionLoading(false)
  }

  async function handleValidate() {
    setActionLoading(true)
    setActionError("")
    const res = await fetch(`/api/eco/${id}/validate`, { method: "POST" })
    const data = await res.json()
    if (!res.ok) setActionError(data.error ?? "Validate failed")
    else await fetchEco()
    setActionLoading(false)
  }

  async function handleReject() {
    if (!rejectReason.trim()) return
    setActionLoading(true)
    setActionError("")
    const res = await fetch(`/api/eco/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason }),
    })
    const data = await res.json()
    if (!res.ok) setActionError(data.error ?? "Reject failed")
    else {
      setShowRejectInput(false)
      setRejectReason("")
      await fetchEco()
    }
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!eco) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-zinc-500">ECO not found</p>
        <Link href="/eco"><Button variant="outline">Back to ECOs</Button></Link>
      </div>
    )
  }

  const role = session?.user?.role ?? ""
  const isTerminal = eco.stage === "Done" || eco.stage === "Rejected"
  const hasConflict = eco.aiConflict.hasConflict

  const canApprove = !isTerminal && !hasConflict &&
    ["ADMIN", "APPROVER"].includes(role) &&
    ["Engineering Review", "Approval"].includes(eco.stage)

  const canValidate = !isTerminal && !hasConflict &&
    ["ADMIN", "ENGINEERING"].includes(role) &&
    eco.stage === "Engineering Review"

  const canReject = !isTerminal && ["ADMIN", "APPROVER"].includes(role)

  const stageIndex = STAGE_ORDER.indexOf(eco.stage)

  return (
    <div className="space-y-5 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/eco">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">{eco.title}</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {eco.product.name} v{eco.product.version} · {eco.type} ·
              by {eco.user.loginId} · {format(new Date(eco.createdAt), "dd MMM yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${STAGE_COLORS[eco.stage] ?? "bg-zinc-100"}`}>
            {eco.stage}
          </span>
          <Badge variant={["CRITICAL", "HIGH"].includes(eco.aiRisk.level) ? "destructive" : "secondary"}>
            {eco.aiRisk.level} · {eco.aiRisk.score}/100
          </Badge>
          {eco.versionUpdate && (
            <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">
              Version Bump
            </Badge>
          )}
        </div>
      </div>

      {/* Stage Stepper */}
      <div className="flex items-center gap-0 bg-white border border-zinc-200 rounded-xl p-4">
        {STAGE_ORDER.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < stageIndex
                  ? "bg-green-500 border-green-500 text-white"
                  : i === stageIndex
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-white border-zinc-300 text-zinc-400"
              }`}>
                {i < stageIndex ? "✓" : i + 1}
              </div>
              <p className={`text-xs mt-1.5 font-medium text-center ${
                i === stageIndex ? "text-blue-600" : i < stageIndex ? "text-green-600" : "text-zinc-400"
              }`}>
                {s}
              </p>
            </div>
            {i < STAGE_ORDER.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < stageIndex ? "bg-green-400" : "bg-zinc-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Conflict Banner */}
      {hasConflict && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Conflict Detected — Approval Blocked</p>
            <p className="text-sm text-red-600 mt-0.5">
              Fields{" "}
              <span className="font-mono font-medium">
                {[...new Set(eco.aiConflict.conflictingFields.map((f) => f.field))].join(", ")}
              </span>{" "}
              conflict with {eco.aiConflict.conflictingEcoIds.length} other open ECO(s).
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {eco.aiConflict.conflictingEcoIds.map((eid) => (
                <Link key={eid} href={`/eco/${eid}`}>
                  <Badge variant="destructive" className="cursor-pointer text-xs">
                    View Conflicting ECO →
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ripple Warning */}
      {eco.ripple.affectedBOMIds.length > 0 && (
        <div className={`flex items-start gap-3 border rounded-xl p-4 ${rippleAck ? "bg-zinc-50 border-zinc-200" : "bg-orange-50 border-orange-200"}`}>
          <Waves className={`w-5 h-5 shrink-0 mt-0.5 ${rippleAck ? "text-zinc-400" : "text-orange-500"}`} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${rippleAck ? "text-zinc-500" : "text-orange-700"}`}>
              Ripple Impact — {eco.ripple.affectedBOMIds.length} BOM(s) affected
            </p>
            <ul className="mt-1 space-y-0.5">
              {eco.ripple.affectedBOMs.slice(0, 4).map((b, i) => (
                <li key={i} className="text-xs text-zinc-500">
                  · {b.productName} BOM v{b.version} — uses{" "}
                  <span className="font-medium">{b.componentProductName}</span> × {b.quantity}
                </li>
              ))}
            </ul>
            {!rippleAck && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                onClick={() => setRippleAck(true)}
              >
                I acknowledge ripple impact
              </Button>
            )}
            {rippleAck && <p className="text-xs text-zinc-400 mt-1">✓ Acknowledged</p>}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="diff">
        <TabsList>
          <TabsTrigger value="diff" className="gap-1.5">
            <GitCompare className="w-4 h-4" /> Diff
          </TabsTrigger>
          <TabsTrigger value="risk" className="gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Risk
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Bot className="w-4 h-4" /> AI Summary
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5">
            <ClipboardList className="w-4 h-4" /> Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Diff Tab */}
        <TabsContent value="diff" className="mt-4">
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-zinc-200">
              <div className="p-5 bg-red-50">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-4">
                  Before (Current)
                </p>
                <div className="space-y-3">
                  {Object.keys(eco.proposedChanges).map((key) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="font-mono text-zinc-400 text-xs">{key}</span>
                      <span className="text-red-600 font-semibold">
                        {eco.currentProductSnapshot[key] !== undefined
                          ? String(eco.currentProductSnapshot[key])
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 bg-green-50">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-4">
                  After (Proposed)
                </p>
                <div className="space-y-3">
                  {Object.entries(eco.proposedChanges).map(([key, val]) => {
                    const oldVal = eco.currentProductSnapshot[key]
                    let pct = ""
                    if (typeof oldVal === "number" && typeof val === "number" && oldVal !== 0) {
                      const d = (((val - oldVal) / oldVal) * 100).toFixed(1)
                      pct = `${Number(d) > 0 ? "+" : ""}${d}%`
                    }
                    return (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="font-mono text-zinc-400 text-xs">{key}</span>
                        <span className="text-green-700 font-semibold">
                          {String(val)}
                          {pct && <span className="text-xs text-zinc-400 ml-1">({pct})</span>}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 border-t border-zinc-200 py-2.5 bg-zinc-50 text-xs text-zinc-400">
              <ArrowRight className="w-3.5 h-3.5" />
              Effective {format(new Date(eco.effectiveDate), "dd MMM yyyy")}
            </div>
          </div>
        </TabsContent>

        {/* Risk Tab */}
        <TabsContent value="risk" className="mt-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-800 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-zinc-400" />
                Risk Assessment
              </h3>
              <span className={`text-lg font-bold ${RISK_TEXT[eco.aiRisk.level] ?? "text-zinc-600"}`}>
                {eco.aiRisk.level} — {eco.aiRisk.score}/100
              </span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${RISK_COLORS[eco.aiRisk.level] ?? "bg-zinc-400"}`}
                style={{ width: `${eco.aiRisk.score}%` }}
              />
            </div>
            <ul className="space-y-2">
              {eco.aiRisk.reasons.length === 0 ? (
                <li className="text-sm text-green-600">✓ No significant risk factors</li>
              ) : (
                eco.aiRisk.reasons.map((r, i) => (
                  <li key={i} className="text-sm text-zinc-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                    {r}
                  </li>
                ))
              )}
            </ul>
          </div>
        </TabsContent>

        {/* AI Summary Tab */}
        <TabsContent value="ai" className="mt-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-blue-500" />
              AI-Generated Summary
            </h3>
            <pre className="whitespace-pre-wrap text-sm text-zinc-600 font-sans leading-relaxed">
              {(eco as unknown as Record<string, unknown>).aiSummary as string ?? "Summary not available"}
            </pre>
          </div>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="mt-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 flex items-center gap-2 mb-5">
              <ClipboardList className="w-5 h-5 text-zinc-400" />
              Audit Trail
            </h3>
            <div className="space-y-4">
              {eco.auditLogs.map((log, i) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                    {i < eco.auditLogs.length - 1 && (
                      <div className="w-px h-8 bg-zinc-200 mt-1" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-700">{log.action}</p>
                    {(log.oldValue || log.newValue) && (
                      <p className="text-xs text-zinc-400">
                        {log.oldValue} → {log.newValue}
                      </p>
                    )}
                    <p className="text-xs text-zinc-400">
                      by {log.user.loginId} ·{" "}
                      {format(new Date(log.timestamp), "dd MMM yyyy, HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions Panel */}
      {!isTerminal && (
        <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-zinc-700">Actions</p>

          {actionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
              {actionError}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {/* Validate button — Engineering Review stage */}
            {canValidate && (
              <Button
                onClick={handleValidate}
                disabled={actionLoading}
                variant="outline"
                className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <CheckCircle className="w-4 h-4" />
                Validate & Send to Approval
              </Button>
            )}

            {/* Approve button */}
            {canApprove && (
              <Button
                onClick={handleApprove}
                disabled={actionLoading || (eco.ripple.affectedBOMIds.length > 0 && !rippleAck)}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {eco.stage === "Approval" ? "Approve & Apply" : "Approve"}
              </Button>
            )}

            {/* Reject button */}
            {canReject && !showRejectInput && (
              <Button
                variant="destructive"
                onClick={() => setShowRejectInput(true)}
                disabled={actionLoading}
                className="gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Reject ECO
              </Button>
            )}
          </div>

          {/* Reject input */}
          {showRejectInput && (
            <div className="space-y-2 pt-1">
              <input
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || actionLoading}
                >
                  Confirm Reject
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowRejectInput(false); setRejectReason("") }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Ripple ack warning */}
          {eco.ripple.affectedBOMIds.length > 0 && !rippleAck && canApprove && (
            <p className="text-xs text-orange-600">
              ⚠ Acknowledge the ripple impact above before approving
            </p>
          )}
        </div>
      )}

      {/* Terminal state badge */}
      {isTerminal && (
        <div className={`rounded-xl p-4 text-center font-semibold text-sm ${
          eco.stage === "Done"
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {eco.stage === "Done" ? "✓ ECO Applied Successfully" : "✗ ECO Rejected"}
        </div>
      )}
    </div>
  )
}
