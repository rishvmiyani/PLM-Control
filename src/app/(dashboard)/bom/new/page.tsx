"use client"

import { useEffect, useState } from "react"
import { useRouter }           from "next/navigation"
import Link                    from "next/link"
import { ArrowLeft, Plus, Trash2, Package, Wrench } from "lucide-react"

interface Product { id: string; name: string; version: number }

interface ComponentRow { productId: string; quantity: number }
interface OperationRow { name: string; durationMins: number; workCenter: string }

export default function NewBOMPage() {
  const router = useRouter()

  const [products, setProducts]     = useState<Product[]>([])
  const [productId, setProductId]   = useState("")
  const [components, setComponents] = useState<ComponentRow[]>([
    { productId: "", quantity: 1 }
  ])
  const [operations, setOperations] = useState<OperationRow[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState("")

  const font = "'DM Sans', sans-serif"

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
  }, [])

  // ── Components ──────────────────────────────
  function addComponent() {
    setComponents((p) => [...p, { productId: "", quantity: 1 }])
  }

  function removeComponent(i: number) {
    setComponents((p) => p.filter((_, idx) => idx !== i))
  }

  function updateComponent(i: number, key: keyof ComponentRow, val: string | number) {
    setComponents((p) => p.map((c, idx) => idx === i ? { ...c, [key]: val } : c))
  }

  // ── Operations ──────────────────────────────
  function addOperation() {
    setOperations((p) => [...p, { name: "", durationMins: 0, workCenter: "" }])
  }

  function removeOperation(i: number) {
    setOperations((p) => p.filter((_, idx) => idx !== i))
  }

  function updateOperation(i: number, key: keyof OperationRow, val: string | number) {
    setOperations((p) => p.map((o, idx) => idx === i ? { ...o, [key]: val } : o))
  }

  // ── Available components per row ─────────────
  // Exclude the selected parent product AND products already selected in other rows
  function availableProducts(rowIndex: number) {
    const usedIds = components
      .map((c, i) => (i !== rowIndex ? c.productId : null))
      .filter(Boolean)
    return products.filter(
      (p) => p.id !== productId && !usedIds.includes(p.id)
    )
  }

  // ── Submit ───────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!productId) { setError("Select a parent product"); return }

    const validComponents = components.filter((c) => c.productId && c.quantity > 0)
    if (validComponents.length === 0) {
      setError("Add at least one component with a valid quantity")
      return
    }

    // Check for duplicate component products
    const ids = validComponents.map((c) => c.productId)
    if (new Set(ids).size !== ids.length) {
      setError("Duplicate components found. Each component must be a different product.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/bom", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          productId,
          components: validComponents,
          operations: operations.filter((o) => o.name && o.workCenter),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Failed to create BOM")
        return
      }

      const bom = await res.json()
      router.push(`/bom/${bom.id}`)

    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ── Styles ───────────────────────────────────
  const inputStyle: React.CSSProperties = {
    height: 40, padding: "0 12px",
    background: "rgba(245,240,252,0.6)",
    border: "1px solid rgba(190,113,209,0.25)",
    borderRadius: 9, fontSize: 13, color: "#2d1a38",
    outline: "none", fontFamily: font,
    width: "100%", boxSizing: "border-box",
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "#4a2d5a",
    marginBottom: 6, display: "block",
    textTransform: "uppercase", letterSpacing: "0.05em",
  }

  const sectionCard: React.CSSProperties = {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(190,113,209,0.14)",
    borderRadius: 16, padding: "20px 22px",
    boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
    marginBottom: 16,
  }

  return (
    <div style={{ fontFamily: font, maxWidth: 760 }}>

      {/* Back */}
      <Link href="/bom" style={{ textDecoration: "none" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          marginBottom: 20, color: "#8b3b9e", fontSize: 13, fontWeight: 600,
        }}>
          <ArrowLeft style={{ width: 15, height: 15 }} />
          Back to BOMs
        </div>
      </Link>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2d1a38", margin: 0 }}>
          New Bill of Materials
        </h1>
        <p style={{ fontSize: 13, color: "#9b6aab", margin: "4px 0 0" }}>
          Create a BOM by selecting a parent product and its components
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(230,59,111,0.07)",
            border: "1px solid rgba(230,59,111,0.2)",
            borderRadius: 10, padding: "10px 14px",
            color: "#e63b6f", fontSize: 13, fontWeight: 500,
            marginBottom: 16,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Parent Product */}
        <div style={sectionCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
            <Package style={{ width: 16, height: 16, color: "#8b3b9e" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#2d1a38" }}>
              Parent Product
            </span>
          </div>

          <label style={labelStyle}>
            Select Product <span style={{ color: "#e63b6f" }}>*</span>
          </label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value)
              // Reset components when parent changes
              setComponents([{ productId: "", quantity: 1 }])
            }}
          >
            <option value="">— Select parent product —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (v{p.version})
              </option>
            ))}
          </select>
        </div>

        {/* Components */}
        <div style={sectionCard}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Package style={{ width: 16, height: 16, color: "#8b3b9e" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#2d1a38" }}>
                Components
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px",
                borderRadius: 20, background: "rgba(139,59,158,0.08)", color: "#8b3b9e",
              }}>
                {components.filter((c) => c.productId).length}
              </span>
            </div>
            <button
              type="button" onClick={addComponent}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                background: "rgba(139,59,158,0.08)",
                border: "1px solid rgba(190,113,209,0.25)",
                color: "#8b3b9e", fontSize: 12, fontWeight: 700,
                cursor: "pointer", fontFamily: font,
              }}
            >
              <Plus style={{ width: 12, height: 12 }} /> Add Component
            </button>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 130px 36px",
            gap: 8, marginBottom: 6, padding: "0 4px",
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#9b6aab", letterSpacing: "0.06em" }}>
              COMPONENT PRODUCT
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#9b6aab", letterSpacing: "0.06em" }}>
              QUANTITY
            </span>
            <span />
          </div>

          {/* Component rows */}
          {components.map((comp, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 130px 36px",
              gap: 8, marginBottom: 8, alignItems: "center",
            }}>
              {/* Product select — excludes parent + already selected */}
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={comp.productId}
                onChange={(e) => updateComponent(i, "productId", e.target.value)}
              >
                <option value="">— Select component —</option>
                {availableProducts(i).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (v{p.version})
                  </option>
                ))}
              </select>

              {/* Quantity */}
              <input
                type="number" min={0.01} step={0.01}
                style={inputStyle}
                value={comp.quantity}
                onChange={(e) => updateComponent(i, "quantity", parseFloat(e.target.value) || 0)}
              />

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeComponent(i)}
                disabled={components.length === 1}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: "1px solid rgba(198,40,40,0.2)",
                  background: "rgba(198,40,40,0.05)",
                  color: "#c62828", cursor: components.length === 1 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: components.length === 1 ? 0.3 : 1,
                  flexShrink: 0,
                }}
              >
                <Trash2 style={{ width: 13, height: 13 }} />
              </button>
            </div>
          ))}
        </div>

        {/* Operations */}
        <div style={sectionCard}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Wrench style={{ width: 16, height: 16, color: "#8b3b9e" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#2d1a38" }}>
                Operations
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px",
                borderRadius: 20, background: "rgba(139,59,158,0.08)", color: "#8b3b9e",
              }}>
                {operations.length}
              </span>
              <span style={{ fontSize: 11, color: "#b0a0bc" }}>(optional)</span>
            </div>
            <button
              type="button" onClick={addOperation}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                background: "rgba(139,59,158,0.08)",
                border: "1px solid rgba(190,113,209,0.25)",
                color: "#8b3b9e", fontSize: 12, fontWeight: 700,
                cursor: "pointer", fontFamily: font,
              }}
            >
              <Plus style={{ width: 12, height: 12 }} /> Add Operation
            </button>
          </div>

          {operations.length === 0 && (
            <p style={{ fontSize: 13, color: "#c0b0cc", textAlign: "center", padding: "16px 0" }}>
              No operations added yet. Click "Add Operation" to add one.
            </p>
          )}

          {operations.length > 0 && (
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 120px 1fr 36px",
              gap: 8, marginBottom: 6, padding: "0 4px",
            }}>
              {["OPERATION NAME","DURATION (MINS)","WORK CENTER",""].map((h) => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "#9b6aab", letterSpacing: "0.06em" }}>
                  {h}
                </span>
              ))}
            </div>
          )}

          {operations.map((op, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 120px 1fr 36px",
              gap: 8, marginBottom: 8, alignItems: "center",
            }}>
              <input
                type="text" placeholder="e.g. Assembly"
                style={inputStyle} value={op.name}
                onChange={(e) => updateOperation(i, "name", e.target.value)}
              />
              <input
                type="number" min={1} placeholder="30"
                style={inputStyle} value={op.durationMins || ""}
                onChange={(e) => updateOperation(i, "durationMins", parseInt(e.target.value) || 0)}
              />
              <input
                type="text" placeholder="e.g. Line A"
                style={inputStyle} value={op.workCenter}
                onChange={(e) => updateOperation(i, "workCenter", e.target.value)}
              />
              <button
                type="button" onClick={() => removeOperation(i)}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: "1px solid rgba(198,40,40,0.2)",
                  background: "rgba(198,40,40,0.05)",
                  color: "#c62828", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Trash2 style={{ width: 13, height: 13 }} />
              </button>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit" disabled={loading}
            style={{
              flex: 1, height: 48, borderRadius: 12,
              background: "linear-gradient(135deg,#8b3b9e,#be71d1)",
              border: "none", color: "#fff",
              fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: font, opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 14px rgba(139,59,158,0.25)",
            }}
          >
            {loading ? "Creating BOM…" : "Create BOM"}
          </button>

          <Link href="/bom" style={{ textDecoration: "none" }}>
            <button type="button" style={{
              height: 48, padding: "0 24px", borderRadius: 12,
              background: "transparent",
              border: "1px solid rgba(190,113,209,0.3)",
              color: "#9b6aab", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: font,
            }}>
              Cancel
            </button>
          </Link>
        </div>

      </form>
    </div>
  )
}
