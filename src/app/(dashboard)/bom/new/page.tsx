"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, ListTree, Cog, Package } from "lucide-react"

interface Product { id: string; name: string; version: number; status: string }
interface ComponentRow { productId: string; quantity: number }
interface OperationRow { name: string; durationMins: number; workCenter: string }

const font = "'DM Sans', sans-serif"

const inputStyle: React.CSSProperties = {
  width: "100%", height: 42,
  padding: "0 12px",
  background: "rgba(245,240,252,0.6)",
  border: "1px solid rgba(190,113,209,0.22)",
  borderRadius: 10, fontSize: 13, color: "#2d1a38",
  outline: "none", fontFamily: font,
  boxSizing: "border-box",
}

export default function NewBOMPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedProductId = searchParams.get("productId") ?? ""

  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState(preselectedProductId)
  const [components, setComponents] = useState<ComponentRow[]>([{ productId: "", quantity: 1 }])
  const [operations, setOperations] = useState<OperationRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.filter((p: Product) => String(p.status) === "ACTIVE")))
      .catch(() => toast.error("Failed to load products"))
  }, [])

  function addComponent() { setComponents([...components, { productId: "", quantity: 1 }]) }
  function removeComponent(i: number) { setComponents(components.filter((_, idx) => idx !== i)) }
  function updateComponent(i: number, field: keyof ComponentRow, val: string | number) {
    const u = [...components]; u[i] = { ...u[i], [field]: val }; setComponents(u)
  }
  function addOperation() { setOperations([...operations, { name: "", durationMins: 30, workCenter: "" }]) }
  function removeOperation(i: number) { setOperations(operations.filter((_, idx) => idx !== i)) }
  function updateOperation(i: number, field: keyof OperationRow, val: string | number) {
    const u = [...operations]; u[i] = { ...u[i], [field]: val }; setOperations(u)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!productId) return toast.error("Select a product")
    if (components.some((c) => !c.productId)) return toast.error("Fill all component products")
    setIsLoading(true)
    try {
      const res = await fetch("/api/bom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, components, operations }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(JSON.stringify(err.error)) }
      const bom = await res.json()
      toast.success("BOM created successfully")
      router.push(`/bom/${bom.id}`)
    } catch (e) {
      toast.error("Failed to create BOM"); console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const sectionCard: React.CSSProperties = {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(190,113,209,0.13)",
    borderRadius: 16, padding: "20px 22px",
    boxShadow: "0 2px 10px rgba(139,59,158,0.05)",
    marginBottom: 16,
  }

  return (
    <div style={{ fontFamily: font, maxWidth: 680 }}>

      {/* Back */}
      <Link href="/bom" style={{ textDecoration: "none" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20, color: "#8b3b9e", fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft style={{ width: 15, height: 15 }} />
          Back to BOMs
        </div>
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2d1a38", margin: 0 }}>New BOM</h1>
        <p style={{ fontSize: "0.85rem", color: "#9b6aab", margin: "4px 0 0" }}>
          Add components and operations
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Product */}
        <div style={sectionCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(139,59,158,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Package style={{ width: 14, height: 14, color: "#8b3b9e" }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#2d1a38", margin: 0 }}>Product</p>
          </div>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>
            ))}
          </select>
        </div>

        {/* Components */}
        <div style={sectionCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(33,150,243,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ListTree style={{ width: 14, height: 14, color: "#2196f3" }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#2d1a38", margin: 0 }}>Components</p>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(33,150,243,0.08)", color: "#2196f3" }}>
                {components.length}
              </span>
            </div>
            <button
              type="button"
              onClick={addComponent}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                background: "rgba(139,59,158,0.07)",
                border: "1px solid rgba(139,59,158,0.18)",
                color: "#8b3b9e", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: font,
              }}
            >
              <Plus style={{ width: 13, height: 13 }} /> Add
            </button>
          </div>

          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 36px", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#9b6aab", letterSpacing: "0.07em" }}>COMPONENT PRODUCT</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#9b6aab", letterSpacing: "0.07em" }}>QTY</span>
            <span />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {components.map((comp, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 100px 36px", gap: 8, alignItems: "center" }}>
                <select
                  value={comp.productId}
                  onChange={(e) => updateComponent(idx, "productId", e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Select product</option>
                  {products.filter(p => p.id !== productId).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="number" min="0.01" step="0.01"
                  value={comp.quantity}
                  onChange={(e) => updateComponent(idx, "quantity", parseFloat(e.target.value) || 1)}
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => removeComponent(idx)}
                  disabled={components.length === 1}
                  style={{
                    width: 36, height: 36, borderRadius: 9,
                    border: "1px solid rgba(198,40,40,0.15)",
                    background: "rgba(198,40,40,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: components.length === 1 ? "not-allowed" : "pointer",
                    opacity: components.length === 1 ? 0.4 : 1,
                  }}
                >
                  <Trash2 style={{ width: 14, height: 14, color: "#c62828" }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Operations */}
        <div style={sectionCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(76,175,80,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Cog style={{ width: 14, height: 14, color: "#4caf50" }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#2d1a38", margin: 0 }}>Operations</p>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(76,175,80,0.08)", color: "#4caf50" }}>
                Optional
              </span>
            </div>
            <button
              type="button"
              onClick={addOperation}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                background: "rgba(139,59,158,0.07)",
                border: "1px solid rgba(139,59,158,0.18)",
                color: "#8b3b9e", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: font,
              }}
            >
              <Plus style={{ width: 13, height: 13 }} /> Add
            </button>
          </div>

          {operations.length === 0 ? (
            <p style={{ fontSize: 13, color: "#c5a8d4", textAlign: "center", padding: "12px 0" }}>
              No operations added yet.
            </p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 1fr 36px", gap: 8, marginBottom: 8 }}>
                {["OPERATION NAME", "DURATION (MIN)", "WORK CENTER", ""].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "#9b6aab", letterSpacing: "0.07em" }}>{h}</span>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {operations.map((op, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 110px 1fr 36px", gap: 8, alignItems: "center" }}>
                    <input
                      placeholder="e.g. Welding"
                      value={op.name}
                      onChange={(e) => updateOperation(idx, "name", e.target.value)}
                      style={inputStyle}
                    />
                    <input
                      type="number" min="1"
                      value={op.durationMins}
                      onChange={(e) => updateOperation(idx, "durationMins", parseInt(e.target.value) || 30)}
                      style={inputStyle}
                    />
                    <input
                      placeholder="e.g. Assembly Line A"
                      value={op.workCenter}
                      onChange={(e) => updateOperation(idx, "workCenter", e.target.value)}
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => removeOperation(idx)}
                      style={{
                        width: 36, height: 36, borderRadius: 9,
                        border: "1px solid rgba(198,40,40,0.15)",
                        background: "rgba(198,40,40,0.05)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 style={{ width: 14, height: 14, color: "#c62828" }} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              flex: 1, height: 48, borderRadius: 12,
              background: isLoading ? "rgba(139,59,158,0.4)" : "linear-gradient(135deg,#8b3b9e,#be71d1)",
              color: "#fff", border: "none",
              fontSize: 14, fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: font,
              boxShadow: isLoading ? "none" : "0 4px 14px rgba(139,59,158,0.28)",
            }}
          >
            {isLoading ? "Creating…" : "Create BOM"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "0 24px", height: 48, borderRadius: 12,
              background: "transparent",
              border: "1px solid rgba(190,113,209,0.3)",
              color: "#7c5f8a", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: font,
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
