"use client"

import { useState }    from "react"
import { useRouter }   from "next/navigation"
import { FileText, Package, Calendar, Tag, AlignLeft, AlertTriangle, Info } from "lucide-react"

const ECO_TYPES = [
  { label: "Product Change", value: "PRODUCT" },
  { label: "BOM Change",     value: "BOM"     },
  { label: "Rollback",       value: "ROLLBACK" },
]

const RISK_LEVELS = [
  { label: "LOW",      value: "LOW"      },
  { label: "MEDIUM",   value: "MEDIUM"   },
  { label: "HIGH",     value: "HIGH"     },
  { label: "CRITICAL", value: "CRITICAL" },
]

const RISK_COLORS: Record<string, string> = {
  LOW: "#27ae60", MEDIUM: "#8b3b9e", HIGH: "#e07b00", CRITICAL: "#c62828",
}

interface Product { id: string; name: string; version: number }
interface ECO {
  id: string; title: string; type: string; productId: string
  effectiveDate: string | Date; riskLevel: string; versionUpdate: boolean
  proposedChanges: Record<string, any>
}

export default function EditECOForm({
  eco, products,
}: {
  eco: ECO; products: Product[]
}) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [form, setForm]       = useState({
    title:           eco.title,
    type:            eco.type,
    productId:       eco.productId,
    effectiveDate: eco.effectiveDate
  ? new Date(eco.effectiveDate).toISOString().split("T")[0]
  : "",

    riskLevel:       eco.riskLevel,
    description:     (eco.proposedChanges?.description as string) ?? "",
    createNewVersion: eco.versionUpdate,
  })

  const set = (key: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [key]: value }))

  const font = "'DM Sans', sans-serif"

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 46, padding: "0 14px",
    background: "rgba(245,240,252,0.6)",
    border: "1px solid rgba(190,113,209,0.25)",
    borderRadius: 10, fontSize: 13, color: "#2d1a38",
    outline: "none", fontFamily: font, boxSizing: "border-box",
    transition: "border 0.2s, box-shadow 0.2s",
  }

  const labelStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 11, fontWeight: 700, color: "#4a2d5a",
    marginBottom: 7, letterSpacing: "0.05em", textTransform: "uppercase",
  }

  const focusIn  = (e: React.FocusEvent<any>) => {
    e.target.style.border     = "1px solid rgba(139,59,158,0.55)"
    e.target.style.boxShadow  = "0 0 0 3px rgba(139,59,158,0.08)"
  }
  const focusOut = (e: React.FocusEvent<any>) => {
    e.target.style.border     = "1px solid rgba(190,113,209,0.25)"
    e.target.style.boxShadow  = "none"
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.productId || !form.effectiveDate) {
      setError("Please fill all required fields.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/eco/${eco.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:           form.title,
          type:            form.type,
          productId:       form.productId,
          effectiveDate:   form.effectiveDate,
          riskLevel:       form.riskLevel,
          versionUpdate:   form.createNewVersion,
          proposedChanges: { description: form.description || "" },
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Failed to update ECO")
        return
      }
      router.push(`/eco/${eco.id}`)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>

      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(230,59,111,0.07)", border: "1px solid rgba(230,59,111,0.2)",
          borderRadius: 10, padding: "10px 14px",
          color: "#e63b6f", fontSize: 13, fontWeight: 500, marginBottom: 20,
        }}>
          <AlertTriangle style={{ width: 14, height: 14 }} /> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px" }}>

        {/* Title */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>
            <FileText style={{ width: 12, height: 12, color: "#8b3b9e" }} />
            Title <span style={{ color: "#e63b6f", marginLeft: 2 }}>*</span>
          </label>
          <input
            type="text" style={inputStyle} value={form.title}
            onChange={(e) => set("title", e.target.value)}
            onFocus={focusIn} onBlur={focusOut}
          />
        </div>

        {/* ECO Type */}
        <div>
          <label style={labelStyle}>
            <Tag style={{ width: 12, height: 12, color: "#8b3b9e" }} />
            ECO Type
          </label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }} value={form.type}
            onChange={(e) => set("type", e.target.value)}
            onFocus={focusIn} onBlur={focusOut}
          >
            {ECO_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div>
          <label style={labelStyle}>
            <Package style={{ width: 12, height: 12, color: "#8b3b9e" }} />
            Product <span style={{ color: "#e63b6f", marginLeft: 2 }}>*</span>
          </label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }} value={form.productId}
            onChange={(e) => set("productId", e.target.value)}
            onFocus={focusIn} onBlur={focusOut}
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>
            ))}
          </select>
        </div>

        {/* Effective Date */}
        <div>
          <label style={labelStyle}>
            <Calendar style={{ width: 12, height: 12, color: "#8b3b9e" }} />
            Effective Date <span style={{ color: "#e63b6f", marginLeft: 2 }}>*</span>
          </label>
          <input
            type="date" style={inputStyle} value={form.effectiveDate}
            onChange={(e) => set("effectiveDate", e.target.value)}
            onFocus={focusIn} onBlur={focusOut}
          />
        </div>

        {/* Risk Level */}
        <div>
          <label style={labelStyle}>
            <AlertTriangle style={{ width: 12, height: 12, color: "#8b3b9e" }} />
            Risk Level
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {RISK_LEVELS.map((r) => (
              <button
                key={r.value} type="button"
                onClick={() => set("riskLevel", r.value)}
                style={{
                  flex: 1, height: 38, borderRadius: 8, cursor: "pointer",
                  fontFamily: font, fontSize: 10, fontWeight: 800,
                  letterSpacing: "0.04em", transition: "all 0.15s",
                  border: form.riskLevel === r.value
                    ? `2px solid ${RISK_COLORS[r.value]}`
                    : "1px solid rgba(190,113,209,0.2)",
                  background: form.riskLevel === r.value
                    ? `${RISK_COLORS[r.value]}18` : "rgba(245,240,252,0.5)",
                  color: form.riskLevel === r.value ? RISK_COLORS[r.value] : "#b0a0bc",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>
            <AlignLeft style={{ width: 12, height: 12, color: "#8b3b9e" }} />
            Description
          </label>
          <textarea
            rows={4} value={form.description}
            onChange={(e) => set("description", e.target.value)}
            onFocus={focusIn} onBlur={focusOut}
            style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "vertical", lineHeight: 1.6 }}
          />
        </div>

        {/* Version checkbox */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
            <div
              onClick={() => set("createNewVersion", !form.createNewVersion)}
              style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                border: form.createNewVersion
                  ? "none" : "1.5px solid rgba(190,113,209,0.35)",
                background: form.createNewVersion
                  ? "linear-gradient(135deg,#8b3b9e,#be71d1)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {form.createNewVersion && (
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <polyline points="1.5,5 4,7.5 8.5,2.5"
                    fill="none" stroke="white" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13, color: "#4a2d5a", fontWeight: 500 }}>
              Version Update
              <span style={{ fontSize: 11, color: "#aaa", marginLeft: 8 }}>
                (Creates a new product version on approval)
              </span>
            </span>
          </label>
        </div>

      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
        <button
          type="submit" disabled={loading}
          style={{
            flex: 1, height: 46, borderRadius: 12,
            background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
            border: "none", color: "#fff",
            fontSize: 14, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: font, opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>

        <button
          type="button" onClick={() => router.push(`/eco/${eco.id}`)}
          style={{
            height: 46, padding: "0 24px", borderRadius: 12,
            background: "transparent",
            border: "1px solid rgba(190,113,209,0.3)",
            color: "#9b6aab", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: font,
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
