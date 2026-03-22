"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format }   from "date-fns"

// ── Helper ─────────────────────────────────────────────
function displayId(id: string) {
  return `ECO-${id.slice(-6).toUpperCase()}`
}

// ── Types ──────────────────────────────────────────────
interface Component { id: string; productName: string; quantity: number }
interface Operation { id: string; name: string; durationMins: number; workCenter: string }

interface ECOData {
  id:              string
  title:           string
  type:            string
  stage:           string
  riskLevel:       string
  riskScore:       number
  conflictStatus:  string
  versionUpdate:   boolean
  effectiveDate:   string
  createdAt:       string
  proposedChanges: Record<string, any>
  product:         { id: string; name: string; version: number; salePrice: number; costPrice: number }
  bom:             { id: string; version: number; components: Component[]; operations: Operation[] } | null
  user:            { loginId: string }
  userRole:        string
  userLoginId:     string
}

// ── Styles ─────────────────────────────────────────────
const font = "'DM Sans', sans-serif"

const RISK_COLOR: Record<string, { bg: string; color: string }> = {
  LOW:      { bg: "rgba(34,197,94,0.10)",  color: "#15803d" },
  MEDIUM:   { bg: "rgba(224,123,0,0.10)",  color: "#e07b00" },
  HIGH:     { bg: "rgba(239,68,68,0.10)",  color: "#b91c1c" },
  CRITICAL: { bg: "rgba(239,68,68,0.12)",  color: "#b91c1c" },
}

const STAGE_COLOR: Record<string, { bg: string; color: string }> = {
  "New":                { bg: "rgba(139,59,158,0.08)", color: "#8b3b9e" },
  "Engineering Review": { bg: "rgba(59,122,190,0.10)", color: "#3b7abe" },
  "Approval":           { bg: "rgba(224,123,0,0.10)",  color: "#e07b00" },
  "Done":               { bg: "rgba(39,174,96,0.10)",  color: "#27ae60" },
}

// ── Component ──────────────────────────────────────────
export default function ECOApprovePage({ eco }: { eco: ECOData }) {
  const router = useRouter()
  const [showChanges, setShowChanges] = useState(false)
  const [loading, setLoading]         = useState<"approve" | "reject" | null>(null)
  const [toast, setToast]             = useState<{ msg: string; icon: string } | null>(null)

  const isApprover    = ["APPROVER", "ADMIN"].includes(eco.userRole)
  const isConflict    = eco.conflictStatus === "CONFLICT"
  const isAlreadyDone = eco.stage === "Done"
  const canApprove    = isApprover && !isConflict && !isAlreadyDone
  const riskS         = RISK_COLOR[eco.riskLevel]  ?? RISK_COLOR.LOW
  const stageS        = STAGE_COLOR[eco.stage]     ?? STAGE_COLOR["New"]
  const proposed      = eco.proposedChanges as any

  const showToast = (msg: string, icon = "✅") => {
    setToast({ msg, icon })
    setTimeout(() => setToast(null), 3500)
  }

  const handleApprove = async () => {
    if (!canApprove) return
    setLoading("approve")
    try {
      const res  = await fetch(`/api/eco/${eco.id}/approve`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed")
      showToast("ECO approved successfully! Stage advanced.")
      setTimeout(() => router.refresh(), 1000)
    } catch (e: any) {
      showToast(e.message, "❌")
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    if (!isApprover) return
    setLoading("reject")
    try {
      const res  = await fetch(`/api/eco/${eco.id}/approve`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "reject" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed")
      showToast("ECO sent back for revision.", "↩️")
      setTimeout(() => router.refresh(), 1000)
    } catch (e: any) {
      showToast(e.message, "❌")
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <style>{globalStyles}</style>

      <div className="eco-root" style={{ fontFamily: font }}>
        <main className="page-wrap">

          {/* Notice banner */}
          {isConflict ? (
            <div className="notice-banner" style={{
              background:  "rgba(239,68,68,0.08)",
              borderColor: "rgba(239,68,68,0.25)",
              color:       "#b91c1c",
            }}>
              ⚠️ This ECO has <strong>&nbsp;unresolved conflicts&nbsp;</strong>.
              Approve is disabled until resolved.&nbsp;
              <a href={`/eco/${eco.id}/conflicts`} style={{ color: "#b91c1c", fontWeight: 700 }}>
                Resolve →
              </a>
            </div>
          ) : (
            <div className="notice-banner">
              ℹ️ Review all proposed changes carefully before approving.
              Approval will advance the ECO to the next stage.
            </div>
          )}

          {/* Main card */}
          <div className="glass-card">

            {/* Header */}
            <div className="section-header">
              <div>
                <div className="section-title">Engineering Change Order</div>
                {/* ── FIXED: use displayId instead of eco.ecoNumber ── */}
                <div className="section-sub">ECO #{displayId(eco.id)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{
                  padding: "5px 14px", borderRadius: 99,
                  fontSize: 12, fontWeight: 700,
                  background: stageS.bg, color: stageS.color,
                  border: `1.5px solid ${stageS.color}33`,
                }}>
                  {eco.stage}
                </span>
                <span style={{
                  padding: "5px 14px", borderRadius: 99,
                  fontSize: 12, fontWeight: 700,
                  background: riskS.bg, color: riskS.color,
                  border: `1.5px solid ${riskS.color}44`,
                }}>
                  ● {eco.riskLevel} · {eco.riskScore}pts
                </span>
              </div>
            </div>

            {/* Form — read only */}
            <div className="form-body">

              <div className="form-field full-width">
                <label className="field-label">Title</label>
                <input className="field-input" value={eco.title} readOnly onChange={() => {}} />
              </div>

              <div className="form-field">
                <label className="field-label">ECO Type</label>
                <input className="field-input" value={eco.type} readOnly onChange={() => {}} />
              </div>

              <div className="form-field">
                <label className="field-label">Product</label>
                <input
                  className="field-input"
                  value={`${eco.product.name} v${eco.product.version}`}
                  readOnly
                  onChange={() => {}}
                />
              </div>

              {eco.bom && (
                <div className="form-field">
                  <label className="field-label">Bill of Materials</label>
                  <input
                    className="field-input"
                    value={`${eco.product.name} BOM v${eco.bom.version}`}
                    readOnly
                    onChange={() => {}}
                  />
                </div>
              )}

              <div className="form-field">
                <label className="field-label">Submitted By</label>
                <input className="field-input" value={eco.user.loginId} readOnly onChange={() => {}} />
              </div>

              <div className="form-field">
                <label className="field-label">Effective Date</label>
                <input
                  className="field-input"
                  value={format(new Date(eco.effectiveDate), "dd MMM yyyy")}
                  readOnly
                  onChange={() => {}}
                />
              </div>

              <div className="form-field full-width">
                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="versionUpdate"
                    checked={eco.versionUpdate}
                    onChange={() => {}}
                  />
                  <label htmlFor="versionUpdate" style={{ cursor: "default" }}>
                    Version Update
                    <span style={{ fontSize: 11, color: "#aaa", marginLeft: 8 }}>
                      (If unchecked, changes apply to same version)
                    </span>
                  </label>
                </div>
              </div>

            </div>

            <div className="divider" />

            {/* Action bar */}
            <div className="action-bar">
              <div className="action-bar-left">

                <button
                  className="btn btn-success"
                  onClick={handleApprove}
                  disabled={!canApprove || loading === "approve"}
                  style={{
                    opacity: !canApprove || loading === "approve" ? 0.5 : 1,
                    cursor:  !canApprove ? "not-allowed" : "pointer",
                  }}
                  title={isConflict ? "Resolve conflicts first" : ""}
                >
                  {loading === "approve" ? "⏳ Approving…" : "✓ Approve"}
                </button>

                {isApprover && !isAlreadyDone && (
                  <button
                    className="btn btn-outline"
                    onClick={handleReject}
                    disabled={loading === "reject"}
                    style={{ color: "#b91c1c", borderColor: "rgba(239,68,68,0.35)" }}
                  >
                    {loading === "reject" ? "⏳ Sending…" : "↩ Send Back"}
                  </button>
                )}

                <button
                  className="btn btn-outline"
                  onClick={() => setShowChanges((v) => !v)}
                >
                  {showChanges ? "▲ Hide Changes" : "▼ View Changes"}
                </button>

              </div>

              <div className="action-bar-right">
                <a href={`/eco/${eco.id}`} className="btn btn-ghost">
                  ← Back to ECO Detail
                </a>
                {eco.bom && (
                  <a href={`/bom/${eco.bom.id}`} className="btn btn-outline">
                    ↗ Open BOM
                  </a>
                )}
                <a href={`/products/${eco.product.id}`} className="btn btn-outline">
                  ↗ Open Product
                </a>
              </div>
            </div>
          </div>

          {/* Changes Panel */}
          {showChanges && (
            <div className="changes-section">
              <div className="glass-card">
                <div className="section-header">
                  <div>
                    <div className="section-title">ECO Changes Overview</div>
                    <div className="section-sub">
                      <span style={{ color: "#16a34a", fontWeight: 600 }}>Green</span> = new value &nbsp;·&nbsp;
                      <span style={{ color: "#dc2626", fontWeight: 600 }}>Red</span> = removed &nbsp;·&nbsp;
                      <span style={{ color: "#333",    fontWeight: 600 }}>Black</span> = unchanged
                    </div>
                  </div>
                </div>

                <div className="changes-grid">

                  {/* BOM Changes */}
                  {eco.type === "BOM" && eco.bom && (
                    <div className="change-panel">
                      <div className="change-panel-header">
                        {eco.product.name} BOM — ECO Changes
                      </div>
                      <table className="change-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Proposed</th>
                            <th>Current</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="group-row"><td colSpan={3}>▸ Components</td></tr>
                          {(proposed?.components ?? eco.bom.components).map((c: any, i: number) => {
                            const action = c.action ?? "UNCHANGED"
                            const color  = action === "ADD" ? "green" : action === "REMOVE" ? "red" : "black"
                            return (
                              <tr key={i}>
                                <td className={`c-${color}`}>
                                  {c.productName ?? c.name}
                                  {action !== "UNCHANGED" && (
                                    <span style={{
                                      marginLeft: 6, fontSize: 9, fontWeight: 800,
                                      background: action === "ADD" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.10)",
                                      color:      action === "ADD" ? "#16a34a" : "#dc2626",
                                      padding: "1px 5px", borderRadius: 4,
                                    }}>
                                      {action}
                                    </span>
                                  )}
                                </td>
                                <td className={`c-${color}`}>{c.quantity} Units</td>
                                <td className="c-black">
                                  {eco.bom?.components.find(
                                    (bc) => bc.productName === (c.productName ?? c.name)
                                  )?.quantity ?? "—"} Units
                                </td>
                              </tr>
                            )
                          })}

                          <tr className="group-row"><td colSpan={3}>▸ Operations</td></tr>
                          {(proposed?.operations ?? eco.bom.operations).map((o: any, i: number) => {
                            const action = o.action ?? "UNCHANGED"
                            const color  = action === "ADD" ? "green" : action === "REMOVE" ? "red" : "black"
                            return (
                              <tr key={i}>
                                <td className={`c-${color}`}>{o.name}</td>
                                <td className={`c-${color}`}>{o.durationMins} mins</td>
                                <td className="c-black">
                                  {eco.bom?.operations.find(
                                    (bo) => bo.name === o.name
                                  )?.durationMins ?? "—"} mins
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Product Changes */}
                  {eco.type === "PRODUCT" && (
                    <div className="change-panel">
                      <div className="change-panel-header">
                        {eco.product.name} — ECO Changes
                      </div>
                      <table className="change-table">
                        <thead>
                          <tr>
                            <th>Field</th>
                            <th>Proposed</th>
                            <th>Current</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proposed?.salePrice && (
                            <tr>
                              <td className="c-black" style={{ fontWeight: 500 }}>Sale Price</td>
                              <td className="c-green">₹{proposed.salePrice.new}</td>
                              <td className="c-black">₹{proposed.salePrice.old ?? eco.product.salePrice}</td>
                            </tr>
                          )}
                          {proposed?.costPrice && (
                            <tr>
                              <td className="c-black" style={{ fontWeight: 500 }}>Cost Price</td>
                              <td className="c-green">₹{proposed.costPrice.new}</td>
                              <td className="c-black">₹{proposed.costPrice.old ?? eco.product.costPrice}</td>
                            </tr>
                          )}
                          {proposed?.name && (
                            <tr>
                              <td className="c-black" style={{ fontWeight: 500 }}>Product Name</td>
                              <td className="c-green">{proposed.name.new}</td>
                              <td className="c-black">{proposed.name.old ?? eco.product.name}</td>
                            </tr>
                          )}
                          {!proposed?.salePrice && !proposed?.costPrice && !proposed?.name && (
                            <tr>
                              <td colSpan={3} style={{
                                color: "#b0a0bc", fontSize: 12,
                                textAlign: "center", padding: 16,
                              }}>
                                No product field changes recorded
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

        </main>

        {/* Toast */}
        {toast && (
          <div className="toast">
            <span className="toast-icon">{toast.icon}</span>
            <span>{toast.msg}</span>
          </div>
        )}
      </div>
    </>
  )
}

// ── Global styles ───────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --primary: #8b3b9e; --primary-mid: #be71d1; --primary-light: #e6c6ed;
    --primary-ultra-light: #f8f0fb; --white: #ffffff;
    --text-dark: #1a1a2e; --text-mid: #4a4a6a; --text-muted: #8888aa;
    --success: #22c55e; --danger: #ef4444;
    --border: rgba(139,59,158,0.15);
    --glass-bg: rgba(255,255,255,0.65); --glass-border: rgba(190,113,209,0.25);
    --shadow: 0 8px 32px rgba(139,59,158,0.10);
  }
  body { font-family: 'DM Sans', sans-serif; }
  .eco-root { min-height: 100vh; background: linear-gradient(135deg, #f8f0fb 0%, #ede0f5 40%, #fdf6ff 100%); padding: 0; position: relative; overflow-x: hidden; }
  .eco-root::before, .eco-root::after { content: ''; position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
  .eco-root::before { width: 500px; height: 500px; background: radial-gradient(circle, rgba(190,113,209,0.18) 0%, transparent 70%); top: -100px; left: -100px; }
  .eco-root::after  { width: 400px; height: 400px; background: radial-gradient(circle, rgba(139,59,158,0.12) 0%, transparent 70%); bottom: -80px; right: -80px; }
  .page-wrap { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 32px 24px 60px; }
  .glass-card { backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%); background: var(--glass-bg); border: 1.5px solid var(--glass-border); border-radius: 22px; box-shadow: var(--shadow); overflow: hidden; }
  .section-header { padding: 20px 28px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .section-title { font-size: 17px; font-weight: 700; color: var(--primary); letter-spacing: -0.3px; }
  .section-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; font-style: italic; }
  .form-body { padding: 24px 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px 32px; }
  @media (max-width: 640px) { .form-body { grid-template-columns: 1fr; } }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-field.full-width { grid-column: 1 / -1; }
  .field-label { font-size: 12px; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.7px; }
  .field-input { height: 42px; padding: 0 14px; border: 1.5px solid var(--border); border-radius: 11px; background: var(--primary-ultra-light); color: var(--text-muted); font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; cursor: not-allowed; width: 100%; }
  .checkbox-row { display: flex; align-items: center; gap: 9px; height: 42px; }
  .checkbox-row input[type=checkbox] { width: 17px; height: 17px; accent-color: var(--primary); border-radius: 4px; }
  .checkbox-row label { font-size: 13.5px; color: var(--text-mid); font-weight: 500; }
  .action-bar { padding: 18px 28px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: space-between; background: rgba(248,240,251,0.60); }
  .action-bar-left { display: flex; gap: 10px; flex-wrap: wrap; }
  .action-bar-right { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 20px; border-radius: 11px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600; transition: all 0.2s; white-space: nowrap; text-decoration: none; }
  .btn-outline { background: rgba(255,255,255,0.75); color: var(--primary); border: 1.5px solid var(--glass-border); }
  .btn-outline:hover { background: var(--primary-ultra-light); }
  .btn-ghost { background: transparent; color: var(--text-muted); border: 1.5px solid transparent; }
  .btn-ghost:hover { background: rgba(139,59,158,0.07); color: var(--primary); }
  .btn-success { background: linear-gradient(135deg, #16a34a, #22c55e); color: white; box-shadow: 0 4px 14px rgba(34,197,94,0.25); }
  .btn-success:hover:not(:disabled) { transform: translateY(-1px); }
  .notice-banner { margin: 0 0 20px; padding: 11px 18px; border-radius: 12px; background: rgba(190,113,209,0.10); border: 1px solid rgba(190,113,209,0.25); font-size: 12.5px; color: var(--primary); display: flex; align-items: center; gap: 8px; }
  .changes-section { margin-top: 28px; }
  .changes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 24px; }
  @media (max-width: 700px) { .changes-grid { grid-template-columns: 1fr; } }
  .change-panel { background: rgba(255,255,255,0.55); border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
  .change-panel-header { background: linear-gradient(90deg, rgba(139,59,158,0.08), rgba(190,113,209,0.06)); padding: 12px 18px; font-size: 13px; font-weight: 700; color: var(--primary); border-bottom: 1px solid var(--border); text-align: center; }
  .change-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .change-table th { padding: 8px 14px; text-align: left; font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; background: rgba(248,240,251,0.5); border-bottom: 1px solid var(--border); }
  .change-table td { padding: 9px 14px; border-bottom: 1px solid rgba(139,59,158,0.06); vertical-align: middle; }
  .change-table tr:last-child td { border-bottom: none; }
  .change-table tr.group-row td { font-weight: 700; font-size: 12.5px; color: var(--text-mid); background: rgba(230,198,237,0.12); padding-top: 12px; }
  .c-green { color: #16a34a; font-weight: 600; }
  .c-red   { color: #dc2626; font-weight: 600; }
  .c-black { color: var(--text-dark); }
  .divider { height: 1px; background: var(--border); margin: 0 28px; }
  .toast { position: fixed; bottom: 28px; right: 28px; z-index: 999; background: white; border: 1.5px solid var(--glass-border); border-radius: 14px; padding: 14px 20px; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 40px rgba(139,59,158,0.18); font-size: 13.5px; font-weight: 500; color: var(--text-dark); animation: slideUp 0.3s ease; max-width: 320px; }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .toast-icon { font-size: 18px; }
`
