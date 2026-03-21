"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileText, Package, Calendar,
  Tag, AlignLeft, AlertTriangle,
} from "lucide-react"

const ECO_TYPES = [
  "Product Change",
  "BOM Change",
  "Process Change",
  "Design Change",
  "Cost Reduction",
  "Quality Improvement",
]

const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

const RISK_COLORS: Record<string, string> = {
  LOW: "#27ae60",
  MEDIUM: "#8b3b9e",
  HIGH: "#e07b00",
  CRITICAL: "#c62828",
}

interface Product {
  id: string
  name: string
  version: number
}

export default function NewECOForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    type: "Product Change",
    productId: "",
    effectiveDate: "",
    riskLevel: "MEDIUM",
    description: "",
    createNewVersion: false,
  })

  const set = (key: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [key]: value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.productId || !form.effectiveDate) {
      setError("Please fill all required fields.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/eco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Failed to create ECO")
        return
      }
      const eco = await res.json()
      router.push(`/eco/${eco.id}`)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const font = "'DM Sans', sans-serif"

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 46,
    padding: "0 14px",
    background: "rgba(245,240,252,0.6)",
    border: "1px solid rgba(190,113,209,0.25)",
    borderRadius: 10,
    fontSize: 13,
    color: "#2d1a38",
    outline: "none",
    fontFamily: font,
    boxSizing: "border-box",
    transition: "border 0.2s, box-shadow 0.2s",
  }

  const labelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    color: "#4a2d5a",
    marginBottom: 7,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  }

  const focusIn = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    e.target.style.border = "1px solid rgba(139,59,158,0.55)"
    e.target.style.boxShadow = "0 0 0 3px rgba(139,59,158,0.08)"
  }

  const focusOut = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    e.target.style.border = "1px solid rgba(190,113,209,0.25)"
    e.target.style.boxShadow = "none"
  }

  return (
    <form onSubmit={onSubmit}>

      {/* Error Banner */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(230,59,111,0.07)",
          border: "1px solid rgba(230,59,111,0.2)",
          borderRadius: 10, padding: "10px 14px",
          color: "#e63b6f", fontSize: 13, fontWeight: 500,
          marginBottom: 20,
        }}>
          <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px" }}>

        {/* Title */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>
            <FileText style={{ width: 12, height: 12, color: "#8b3b9e" }} />
            Title
            <span style={{ color: "#e63b6f", marginLeft: 2 }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Reduce Screw Count in BOM"
            style={inputStyle}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>

        {/* ECO Type */}
        <div>
          <label style={labelStyle}>
            <Tag style={{ width: 12, height: 12, color: "#8b3b9e" }} />
            ECO Type
            <span style={{ color: "#e63b6f", marginLeft: 2 }}>*</span>
          </label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            onFocus={focusIn}
            onBlur={focusOut}
          >
            {ECO_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div>
          <label style={labelStyle}>
            <Package style={{ width: 12, height: 12, color: "#8b3b9e" }} />
            Product
            <span style={{ color: "#e63b6f", marginLeft: 2 }}>*</span>
          </label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={form.productId}
            onChange={(e) => set("productId", e.target.value)}
            onFocus={focusIn}
            onBlur={focusOut}
          >
            <option value="">Select active product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (v{p.version})
              </option>
            ))}
          </select>
        </div>

        {/* Effective Date */}
        <div>
          <label style={labelStyle}>
            <Calendar style={{ width: 12, height: 12, color: "#8b3b9e" }} />
            Effective Date
            <span style={{ color: "#e63b6f", marginLeft: 2 }}>*</span>
          </label>
          <input
            type="date"
            style={inputStyle}
            value={form.effectiveDate}
            onChange={(e) => set("effectiveDate", e.target.value)}
            onFocus={focusIn}
            onBlur={focusOut}
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
                key={r}
                type="button"
                onClick={() => set("riskLevel", r)}
                style={{
                  flex: 1, height: 38, borderRadius: 8,
                  cursor: "pointer", fontFamily: font,
                  fontSize: 10, fontWeight: 800,
                  letterSpacing: "0.04em",
                  transition: "all 0.15s",
                  border: form.riskLevel === r
                    ? `2px solid ${RISK_COLORS[r]}`
                    : "1px solid rgba(190,113,209,0.2)",
                  background: form.riskLevel === r
                    ? `${RISK_COLORS[r]}18`
                    : "rgba(245,240,252,0.5)",
                  color: form.riskLevel === r
                    ? RISK_COLORS[r]
                    : "#b0a0bc",
                }}
              >
                {r}
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
            placeholder="Describe the reason and impact of this change..."
            rows={4}
            style={{
              ...inputStyle,
              height: "auto",
              padding: "12px 14px",
              resize: "vertical",
              lineHeight: 1.6,
            }}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>

        {/* Create new version checkbox */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{
            display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer", userSelect: "none",
          }}>
            <div
              onClick={() => set("createNewVersion", !form.createNewVersion)}
              style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: form.createNewVersion
                  ? "2px solid #8b3b9e"
                  : "2px solid rgba(190,113,209,0.4)",
                background: form.createNewVersion
                  ? "linear-gradient(135deg,#8b3b9e,#be71d1)"
                  : "transparent",
              }}
            >
              {form.createNewVersion && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5l2.5 2.5L8 3"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13, color: "#4a2d5a", fontWeight: 500 }}>
              Create new version on apply
            </span>
          </label>
        </div>

      </div>

      {/* Divider */}
      <div style={{
        height: 1,
        background: "rgba(190,113,209,0.1)",
        margin: "22px 0 18px",
      }} />

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "11px 28px",
            borderRadius: 10,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: font,
            color: "#fff",
            background: loading
              ? "rgba(139,59,158,0.4)"
              : "linear-gradient(135deg,#8b3b9e,#be71d1)",
            boxShadow: loading
              ? "none"
              : "0 4px 14px rgba(139,59,158,0.28)",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Creating…" : "Create ECO"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          style={{
            padding: "11px 22px",
            borderRadius: 10,
            background: "transparent",
            border: "1px solid rgba(190,113,209,0.3)",
            color: "#7c5f8a",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: font,
          }}
        >
          Cancel
        </button>
      </div>

    </form>
  )
}
