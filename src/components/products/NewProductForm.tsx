"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Box, IndianRupee, Hash,
  AlertTriangle, Info,
} from "lucide-react"

export default function NewProductForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [form, setForm]       = useState({
    name:      "",
    salePrice: "",
    costPrice: "",
  })

  const set = (key: string, value: string) =>
    setForm((p) => ({ ...p, [key]: value }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError("Product name is required.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:      form.name.trim(),
          salePrice: parseFloat(form.salePrice) || 0,
          costPrice: parseFloat(form.costPrice) || 0,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Failed to create product")
        return
      }
      const product = await res.json()
      router.push(`/products/${product.id}`)
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

  const focusIn = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border     = "1px solid rgba(139,59,158,0.55)"
    e.target.style.boxShadow  = "0 0 0 3px rgba(139,59,158,0.08)"
  }

  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.border     = "1px solid rgba(190,113,209,0.25)"
    e.target.style.boxShadow  = "none"
  }

  const margin = form.salePrice && form.costPrice
    ? (
        ((parseFloat(form.salePrice) - parseFloat(form.costPrice)) /
          parseFloat(form.salePrice)) *
        100
      ).toFixed(1)
    : null

  return (
    <form onSubmit={onSubmit} style={{ fontFamily: font }}>

      {/* Info Banner */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 8,
        background: "rgba(139,59,158,0.05)",
        border: "1px solid rgba(190,113,209,0.18)",
        borderRadius: 10, padding: "10px 14px",
        marginBottom: 22,
      }}>
        <Info style={{ width: 14, height: 14, color: "#8b3b9e", flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#4a2d5a", margin: 0 }}>
            Product Details
          </p>
          <p style={{ fontSize: 11, color: "#7c5f8a", margin: "2px 0 0" }}>
            Products cannot be edited after creation. Use ECOs to make changes.
          </p>
        </div>
      </div>

      {/* Error */}
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

        {/* Product Name */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>
            <Box style={{ width: 12, height: 12, color: "#8b3b9e" }} />
            Product Name
            <span style={{ color: "#e63b6f", marginLeft: 2 }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Steel Frame Assembly"
            style={inputStyle}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            onFocus={focusIn}
            onBlur={focusOut}
            autoFocus
          />
        </div>

        {/* Sale Price */}
        <div>
          <label style={labelStyle}>
            <IndianRupee style={{ width: 12, height: 12, color: "#8b3b9e" }} />
            Sale Price (₹)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            style={inputStyle}
            value={form.salePrice}
            onChange={(e) => set("salePrice", e.target.value)}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>

        {/* Cost Price */}
        <div>
          <label style={labelStyle}>
            <IndianRupee style={{ width: 12, height: 12, color: "#be71d1" }} />
            Cost Price (₹)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            style={inputStyle}
            value={form.costPrice}
            onChange={(e) => set("costPrice", e.target.value)}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>

        {/* Margin Preview */}
        {margin !== null && (
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: parseFloat(margin) >= 0
                ? "rgba(39,174,96,0.07)"
                : "rgba(230,59,111,0.07)",
              border: `1px solid ${parseFloat(margin) >= 0
                ? "rgba(39,174,96,0.20)"
                : "rgba(230,59,111,0.20)"}`,
              borderRadius: 10, padding: "10px 14px",
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: parseFloat(margin) >= 0 ? "#27ae60" : "#e63b6f",
              }} />
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: parseFloat(margin) >= 0 ? "#27ae60" : "#e63b6f",
              }}>
                Margin: {margin}%
              </span>
              <span style={{ fontSize: 11, color: "#9b6aab", marginLeft: 4 }}>
                (₹{(parseFloat(form.salePrice || "0") - parseFloat(form.costPrice || "0")).toLocaleString()} profit per unit)
              </span>
            </div>
          </div>
        )}

        {/* Version — read only */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>
            <Hash style={{ width: 12, height: 12, color: "#8b3b9e" }} />
            Version
          </label>
          <input
            type="text"
            value="1"
            disabled
            style={{
              ...inputStyle,
              background: "rgba(230,220,245,0.35)",
              color: "#a090b8",
              cursor: "not-allowed",
            }}
          />
          <p style={{ fontSize: 11, color: "#a090b8", margin: "5px 0 0 2px" }}>
            Auto-assigned. Increments via ECO.
          </p>
        </div>

      </div>

      {/* Divider */}
      <div style={{
        height: 1,
        background: "rgba(190,113,209,0.10)",
        margin: "22px 0 18px",
      }} />

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "11px 28px",
            borderRadius: 10, border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 13, fontWeight: 700,
            fontFamily: font, color: "#fff",
            background: loading
              ? "rgba(139,59,158,0.40)"
              : "linear-gradient(135deg,#8b3b9e,#be71d1)",
            boxShadow: loading
              ? "none"
              : "0 4px 14px rgba(139,59,158,0.28)",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Creating…" : "Create Product"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          style={{
            padding: "11px 22px",
            borderRadius: 10,
            background: "transparent",
            border: "1px solid rgba(190,113,209,0.30)",
            color: "#7c5f8a", cursor: "pointer",
            fontSize: 13, fontWeight: 600,
            fontFamily: font,
          }}
        >
          Cancel
        </button>
      </div>

    </form>
  )
}
