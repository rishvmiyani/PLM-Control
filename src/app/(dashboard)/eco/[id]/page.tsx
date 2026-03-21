"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { format } from "date-fns"
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

const STAGE_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  "New":                { bg: "#f3f3f3",    color: "#555",    border: "rgba(0,0,0,0.1)" },
  "Engineering Review": { bg: "#e3f2fd",    color: "#1565c0", border: "rgba(21,101,192,0.2)" },
  "Approval":           { bg: "#fff3e0",    color: "#e07b00", border: "rgba(224,123,0,0.2)" },
  "Done":               { bg: "#e8f5e9",    color: "#2e7d32", border: "rgba(46,125,50,0.2)" },
  "Rejected":           { bg: "#fce4ec",    color: "#c62828", border: "rgba(198,40,40,0.2)" },
}

const RISK_COLOR: Record<string, string> = {
  LOW: "#27ae60", MEDIUM: "#8b3b9e", HIGH: "#e07b00", CRITICAL: "#c62828",
}

const RISK_BAR: Record<string, string> = {
  LOW: "#27ae60", MEDIUM: "#8b3b9e", HIGH: "#e07b00", CRITICAL: "#c62828",
}

const STAGE_ORDER = ["New", "Engineering Review", "Approval", "Done"]

const S: Record<string, React.CSSProperties> = {
  card: {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(190,113,209,0.13)",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
  },
}

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
  const [activeTab, setActiveTab] = useState("diff")

  async function fetchEco() {
    setLoading(true)
    const res = await fetch(`/api/eco/${id}`)
    if (res.ok) setEco(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchEco() }, [id])

  async function handleApprove() {
    setActionLoading(true); setActionError("")
    const res = await fetch(`/api/eco/${id}/approve`, { method: "POST" })
    const data = await res.json()
    if (!res.ok) setActionError(data.error ?? "Approve failed")
    else await fetchEco()
    setActionLoading(false)
  }

  async function handleValidate() {
    setActionLoading(true); setActionError("")
    const res = await fetch(`/api/eco/${id}/validate`, { method: "POST" })
    const data = await res.json()
    if (!res.ok) setActionError(data.error ?? "Validate failed")
    else await fetchEco()
    setActionLoading(false)
  }

  async function handleReject() {
    if (!rejectReason.trim()) return
    setActionLoading(true); setActionError("")
    const res = await fetch(`/api/eco/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason }),
    })
    const data = await res.json()
    if (!res.ok) setActionError(data.error ?? "Reject failed")
    else { setShowRejectInput(false); setRejectReason(""); await fetchEco() }
    setActionLoading(false)
  }

  const font = "'DM Sans', sans-serif"

  if (loading) {
    return (
      <div style={{ fontFamily: font, maxWidth: 860 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{
            height: i === 1 ? 40 : i === 2 ? 24 : 180,
            borderRadius: 12, marginBottom: 16,
            background: "linear-gradient(90deg,#f0eaf5 0%,#e8dff0 50%,#f0eaf5 100%)",
            animation: "shimmer 1.5s infinite",
          }} />
        ))}
      </div>
    )
  }

  if (!eco) {
    return (
      <div style={{ fontFamily: font, textAlign: "center", padding: 60 }}>
        <p style={{ color: "#9b6aab", marginBottom: 16 }}>ECO not found</p>
        <Link href="/eco">
          <button style={{
            padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(139,59,158,0.3)",
            background: "transparent", color: "#8b3b9e", cursor: "pointer",
            fontFamily: font, fontSize: 13, fontWeight: 600,
          }}>Back to ECOs</button>
        </Link>
      </div>
    )
  }

  const role = session?.user?.role ?? ""
  const isTerminal = eco.stage === "Done" || eco.stage === "Rejected"
  const hasConflict = eco.aiConflict.hasConflict
  const canApprove = !isTerminal && !hasConflict && ["ADMIN","APPROVER"].includes(role) && ["Engineering Review","Approval"].includes(eco.stage)
  const canValidate = !isTerminal && !hasConflict && ["ADMIN","ENGINEERING"].includes(role) && eco.stage === "Engineering Review"
  const canReject = !isTerminal && ["ADMIN","APPROVER"].includes(role)
  const stageIndex = STAGE_ORDER.indexOf(eco.stage)
  const stageBadge = STAGE_BADGE[eco.stage] ?? STAGE_BADGE["New"]

  const TABS = [
    { key: "diff",  label: "Diff",       icon: <GitCompare style={{ width: 14, height: 14 }} /> },
    { key: "risk",  label: "Risk",       icon: <ShieldAlert style={{ width: 14, height: 14 }} /> },
    { key: "ai",    label: "AI Summary", icon: <Bot style={{ width: 14, height: 14 }} /> },
    { key: "audit", label: "Audit Log",  icon: <ClipboardList style={{ width: 14, height: 14 }} /> },
  ]

  return (
    <div style={{ fontFamily: font, maxWidth: 860 }}>

      {/* ── Back + Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Link href="/eco">
            <button style={{
              width: 34, height: 34, borderRadius: 10,
              border: "1px solid rgba(190,113,209,0.25)",
              background: "rgba(255,255,255,0.8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, marginTop: 2,
            }}>
              <ArrowLeft style={{ width: 15, height: 15, color: "#8b3b9e" }} />
            </button>
          </Link>
          <div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#2d1a38", margin: 0 }}>
              {eco.title}
            </h1>
            <p style={{ fontSize: 12, color: "#9b6aab", margin: "5px 0 0" }}>
              {eco.product.name} v{eco.product.version} · {eco.type} · by {eco.user.loginId} · {format(new Date(eco.createdAt), "dd MMM yyyy")}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 999,
            background: stageBadge.bg, color: stageBadge.color,
            border: `1px solid ${stageBadge.border}`,
          }}>
            {eco.stage}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999,
            background: `${RISK_COLOR[eco.aiRisk.level]}15`,
            color: RISK_COLOR[eco.aiRisk.level],
            border: `1px solid ${RISK_COLOR[eco.aiRisk.level]}30`,
          }}>
            {eco.aiRisk.level} · {eco.aiRisk.score}/100
          </span>
          {eco.versionUpdate && (
            <span style={{
              fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999,
              background: "rgba(33,150,243,0.08)", color: "#1565c0",
              border: "1px solid rgba(33,150,243,0.2)",
            }}>
              Version Bump
            </span>
          )}
        </div>
      </div>

      {/* ── Stage Stepper ── */}
      <div style={{ ...S.card, padding: "18px 24px", marginBottom: 16, display: "flex", alignItems: "center" }}>
        {STAGE_ORDER.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
                background: i < stageIndex ? "#27ae60" : i === stageIndex ? "linear-gradient(135deg,#8b3b9e,#be71d1)" : "#f0eaf5",
                color: i <= stageIndex ? "#fff" : "#c5a8d4",
                border: i > stageIndex ? "2px solid rgba(190,113,209,0.2)" : "none",
              }}>
                {i < stageIndex ? "✓" : i + 1}
              </div>
              <p style={{
                fontSize: 11, marginTop: 6, fontWeight: 600, textAlign: "center",
                color: i === stageIndex ? "#8b3b9e" : i < stageIndex ? "#27ae60" : "#c5a8d4",
              }}>
                {s}
              </p>
            </div>
            {i < STAGE_ORDER.length - 1 && (
              <div style={{
                height: 2, flex: 1, marginBottom: 18, borderRadius: 2,
                background: i < stageIndex ? "#27ae60" : "rgba(190,113,209,0.15)",
              }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Conflict Banner ── */}
      {hasConflict && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 12,
          background: "rgba(198,40,40,0.05)", border: "1px solid rgba(198,40,40,0.2)",
          borderRadius: 14, padding: "14px 18px", marginBottom: 14,
        }}>
          <AlertTriangle style={{ width: 18, height: 18, color: "#c62828", flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#c62828", margin: 0 }}>
              Conflict Detected — Approval Blocked
            </p>
            <p style={{ fontSize: 12, color: "#b71c1c", margin: "4px 0 8px" }}>
              Fields <code style={{ fontWeight: 700 }}>
                {[...new Set(eco.aiConflict.conflictingFields.map(f => f.field))].join(", ")}
              </code>{" "}
              conflict with {eco.aiConflict.conflictingEcoIds.length} other open ECO(s).
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {eco.aiConflict.conflictingEcoIds.map((eid) => (
                <Link key={eid} href={`/eco/${eid}`}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999,
                    background: "rgba(198,40,40,0.1)", color: "#c62828",
                    border: "1px solid rgba(198,40,40,0.2)", cursor: "pointer",
                    textDecoration: "none",
                  }}>
                    View Conflicting ECO →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Ripple Warning ── */}
      {eco.ripple.affectedBOMIds.length > 0 && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 12,
          background: rippleAck ? "rgba(0,0,0,0.02)" : "rgba(224,123,0,0.05)",
          border: `1px solid ${rippleAck ? "rgba(0,0,0,0.08)" : "rgba(224,123,0,0.2)"}`,
          borderRadius: 14, padding: "14px 18px", marginBottom: 14,
        }}>
          <Waves style={{ width: 18, height: 18, color: rippleAck ? "#c5a8d4" : "#e07b00", flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: rippleAck ? "#9b6aab" : "#e07b00", margin: 0 }}>
              Ripple Impact — {eco.ripple.affectedBOMIds.length} BOM(s) affected
            </p>
            <ul style={{ margin: "6px 0 10px", paddingLeft: 0, listStyle: "none" }}>
              {eco.ripple.affectedBOMs.slice(0, 4).map((b, i) => (
                <li key={i} style={{ fontSize: 12, color: "#9b6aab", marginBottom: 2 }}>
                  · {b.productName} BOM v{b.version} — uses <strong>{b.componentProductName}</strong> × {b.quantity}
                </li>
              ))}
            </ul>
            {!rippleAck ? (
              <button
                onClick={() => setRippleAck(true)}
                style={{
                  padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                  border: "1px solid rgba(224,123,0,0.3)", background: "rgba(224,123,0,0.06)",
                  color: "#e07b00", fontSize: 12, fontWeight: 600, fontFamily: font,
                }}
              >
                I acknowledge ripple impact
              </button>
            ) : (
              <p style={{ fontSize: 12, color: "#c5a8d4", margin: 0 }}>✓ Acknowledged</p>
            )}
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ ...S.card, marginBottom: 14, overflow: "hidden" }}>
        {/* Tab bar */}
        <div style={{
          display: "flex", borderBottom: "1px solid rgba(190,113,209,0.1)",
          padding: "0 8px",
        }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "12px 16px", border: "none", background: "transparent",
                cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: font,
                color: activeTab === t.key ? "#8b3b9e" : "#9b6aab",
                borderBottom: activeTab === t.key ? "2px solid #8b3b9e" : "2px solid transparent",
                marginBottom: -1, transition: "color 0.15s",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Diff tab */}
        {activeTab === "diff" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid rgba(190,113,209,0.1)" }}>
              <div style={{ padding: "20px 24px", background: "rgba(198,40,40,0.03)", borderRight: "1px solid rgba(190,113,209,0.1)" }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: "#c62828", letterSpacing: "0.1em", marginBottom: 16 }}>
                  BEFORE (CURRENT)
                </p>
                {Object.keys(eco.proposedChanges).map((key) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: "#9b6aab", fontFamily: "monospace" }}>{key}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#c62828" }}>
                      {eco.currentProductSnapshot[key] !== undefined ? String(eco.currentProductSnapshot[key]) : "—"}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "20px 24px", background: "rgba(46,125,50,0.03)" }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: "#2e7d32", letterSpacing: "0.1em", marginBottom: 16 }}>
                  AFTER (PROPOSED)
                </p>
                {Object.entries(eco.proposedChanges).map(([key, val]) => {
                  const oldVal = eco.currentProductSnapshot[key]
                  let pct = ""
                  if (typeof oldVal === "number" && typeof val === "number" && oldVal !== 0) {
                    const d = (((val - oldVal) / oldVal) * 100).toFixed(1)
                    pct = `${Number(d) > 0 ? "+" : ""}${d}%`
                  }
                  return (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, color: "#9b6aab", fontFamily: "monospace" }}>{key}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#2e7d32" }}>
                        {String(val)} {pct && <span style={{ fontSize: 11, color: "#9b6aab" }}>({pct})</span>}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px", background: "#faf6fd",
              fontSize: 12, color: "#9b6aab",
            }}>
              <ArrowRight style={{ width: 13, height: 13 }} />
              Effective {format(new Date(eco.effectiveDate), "dd MMM yyyy")}
            </div>
          </div>
        )}

        {/* Risk tab */}
        {activeTab === "risk" && (
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldAlert style={{ width: 18, height: 18, color: "#9b6aab" }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#2d1a38" }}>Risk Assessment</span>
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: RISK_COLOR[eco.aiRisk.level] }}>
                {eco.aiRisk.level} — {eco.aiRisk.score}/100
              </span>
            </div>
            <div style={{
              height: 10, background: "rgba(190,113,209,0.12)",
              borderRadius: 999, overflow: "hidden", marginBottom: 20,
            }}>
              <div style={{
                height: "100%", borderRadius: 999,
                width: `${eco.aiRisk.score}%`,
                background: RISK_BAR[eco.aiRisk.level],
                transition: "width 0.5s",
              }} />
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {eco.aiRisk.reasons.length === 0 ? (
                <li style={{ fontSize: 13, color: "#27ae60" }}>✓ No significant risk factors</li>
              ) : (
                eco.aiRisk.reasons.map((r, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c5a8d4", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#7c5f8a" }}>{r}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        {/* AI Summary tab */}
        {activeTab === "ai" && (
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Bot style={{ width: 18, height: 18, color: "#8b3b9e" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#2d1a38" }}>AI-Generated Summary</span>
            </div>
            <p style={{
              fontSize: 13, color: "#7c5f8a", lineHeight: 1.75,
              background: "rgba(139,59,158,0.04)",
              border: "1px solid rgba(190,113,209,0.12)",
              borderRadius: 12, padding: "16px 18px", whiteSpace: "pre-wrap",
            }}>
              {(eco as unknown as Record<string, unknown>).aiSummary as string ?? "Summary not available"}
            </p>
          </div>
        )}

        {/* Audit tab */}
        {activeTab === "audit" && (
          <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <ClipboardList style={{ width: 18, height: 18, color: "#9b6aab" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#2d1a38" }}>Audit Trail</span>
            </div>
            {eco.auditLogs.map((log, i) => (
              <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
                    marginTop: 3, flexShrink: 0,
                  }} />
                  {i < eco.auditLogs.length - 1 && (
                    <div style={{ width: 1, flex: 1, minHeight: 24, background: "rgba(190,113,209,0.2)", marginTop: 4 }} />
                  )}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#2d1a38", margin: 0 }}>{log.action}</p>
                  {(log.oldValue || log.newValue) && (
                    <p style={{ fontSize: 12, color: "#9b6aab", margin: "2px 0" }}>
                      {log.oldValue} → {log.newValue}
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: "#c5a8d4", margin: 0 }}>
                    by {log.user.loginId} · {format(new Date(log.timestamp), "dd MMM yyyy, HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Actions Panel ── */}
      {!isTerminal && (
        <div style={{ ...S.card, padding: "20px 24px" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#2d1a38", margin: "0 0 14px" }}>Actions</p>

          {actionError && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(230,59,111,0.07)", border: "1px solid rgba(230,59,111,0.2)",
              borderRadius: 10, padding: "10px 14px",
              color: "#e63b6f", fontSize: 13, fontWeight: 500, marginBottom: 14,
            }}>
              <AlertTriangle style={{ width: 15, height: 15 }} />
              {actionError}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {canValidate && (
              <button
                onClick={handleValidate}
                disabled={actionLoading}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 20px", borderRadius: 10,
                  background: "rgba(33,150,243,0.08)",
                  border: "1px solid rgba(33,150,243,0.25)",
                  color: "#1565c0", fontSize: 13, fontWeight: 600,
                  cursor: actionLoading ? "not-allowed" : "pointer",
                  fontFamily: font, opacity: actionLoading ? 0.6 : 1,
                }}
              >
                <CheckCircle style={{ width: 15, height: 15 }} />
                Validate & Send to Approval
              </button>
            )}

            {canApprove && (
              <button
                onClick={handleApprove}
                disabled={actionLoading || (eco.ripple.affectedBOMIds.length > 0 && !rippleAck)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 20px", borderRadius: 10,
                  background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
                  border: "none", color: "#fff",
                  fontSize: 13, fontWeight: 600,
                  cursor: (actionLoading || (eco.ripple.affectedBOMIds.length > 0 && !rippleAck)) ? "not-allowed" : "pointer",
                  fontFamily: font,
                  opacity: (actionLoading || (eco.ripple.affectedBOMIds.length > 0 && !rippleAck)) ? 0.5 : 1,
                  boxShadow: "0 4px 14px rgba(139,59,158,0.28)",
                }}
              >
                <CheckCircle style={{ width: 15, height: 15 }} />
                {eco.stage === "Approval" ? "Approve & Apply" : "Approve"}
              </button>
            )}

            {canReject && !showRejectInput && (
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={actionLoading}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 20px", borderRadius: 10,
                  background: "rgba(198,40,40,0.07)",
                  border: "1px solid rgba(198,40,40,0.22)",
                  color: "#c62828", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: font,
                }}
              >
                <AlertTriangle style={{ width: 15, height: 15 }} />
                Reject ECO
              </button>
            )}
          </div>

          {/* Reject input */}
          {showRejectInput && (
            <div style={{ marginTop: 14 }}>
              <input
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: "100%", height: 42, padding: "0 14px",
                  background: "rgba(245,240,252,0.6)",
                  border: "1px solid rgba(198,40,40,0.3)",
                  borderRadius: 10, fontSize: 13, color: "#2d1a38",
                  outline: "none", fontFamily: font, boxSizing: "border-box",
                  marginBottom: 10,
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || actionLoading}
                  style={{
                    padding: "8px 18px", borderRadius: 9,
                    background: "#c62828", color: "#fff",
                    border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, fontFamily: font,
                    opacity: (!rejectReason.trim() || actionLoading) ? 0.5 : 1,
                  }}
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => { setShowRejectInput(false); setRejectReason("") }}
                  style={{
                    padding: "8px 18px", borderRadius: 9,
                    background: "transparent", color: "#9b6aab",
                    border: "1px solid rgba(190,113,209,0.3)",
                    cursor: "pointer", fontSize: 13, fontFamily: font,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {eco.ripple.affectedBOMIds.length > 0 && !rippleAck && canApprove && (
            <p style={{ fontSize: 12, color: "#e07b00", marginTop: 10 }}>
              ⚠ Acknowledge the ripple impact above before approving
            </p>
          )}
        </div>
      )}

      {/* ── Terminal State ── */}
      {isTerminal && (
        <div style={{
          borderRadius: 14, padding: "16px 24px", textAlign: "center",
          fontWeight: 700, fontSize: 14,
          background: eco.stage === "Done" ? "rgba(46,125,50,0.06)" : "rgba(198,40,40,0.06)",
          border: `1px solid ${eco.stage === "Done" ? "rgba(46,125,50,0.2)" : "rgba(198,40,40,0.2)"}`,
          color: eco.stage === "Done" ? "#2e7d32" : "#c62828",
        }}>
          {eco.stage === "Done" ? "✓ ECO Applied Successfully" : "✗ ECO Rejected"}
        </div>
      )}
    </div>
  )
}
