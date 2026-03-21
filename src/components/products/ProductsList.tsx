"use client"

import Link from "next/link"
import { Package, IndianRupee, ArrowRight } from "lucide-react"

interface ProductRow {
  id:        string
  name:      string
  version:   number
  status:    string
  salePrice: number
  costPrice: number
  bomCount:  number
  ecoCount:  number
}

export default function ProductsList({ products }: { products: ProductRow[] }) {
  const font = "'DM Sans', sans-serif"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, fontFamily: font }}>
      {products.map((product) => {
        const isActive = product.status === "ACTIVE"
        const margin   = product.salePrice > 0
          ? (((product.salePrice - product.costPrice) / product.salePrice) * 100).toFixed(1)
          : "0.0"

        return (
          <div
            key={product.id}
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(190,113,209,0.14)",
              borderRadius: 16, padding: "18px 20px",
              boxShadow: "0 2px 12px rgba(139,59,158,0.06)",
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              gap: 16, flexWrap: "wrap",
              transition: "box-shadow 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "0 6px 22px rgba(139,59,158,0.12)")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "0 2px 12px rgba(139,59,158,0.06)")}
          >
            {/* Left */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                background: isActive
                  ? "rgba(139,59,158,0.09)"
                  : "rgba(160,144,184,0.10)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Package style={{
                  width: 18, height: 18,
                  color: isActive ? "#8b3b9e" : "#a090b8",
                }} />
              </div>

              <div style={{ minWidth: 0 }}>
                {/* Name + badges */}
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: 8, flexWrap: "wrap",
                }}>
                  <p style={{
                    fontSize: 14, fontWeight: 800, color: "#2d1a38",
                    margin: 0, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {product.name}
                  </p>
                  <span style={{
                    padding: "1px 8px", borderRadius: 5,
                    background: "rgba(139,59,158,0.08)",
                    border: "1px solid rgba(190,113,209,0.20)",
                    fontSize: 10, fontWeight: 700, color: "#8b3b9e",
                  }}>
                    v{product.version}
                  </span>
                  <span style={{
                    padding: "1px 8px", borderRadius: 5,
                    fontSize: 10, fontWeight: 700,
                    background: isActive
                      ? "rgba(39,174,96,0.09)"
                      : "rgba(160,144,184,0.12)",
                    color: isActive ? "#27ae60" : "#8b7aaa",
                  }}>
                    {product.status}
                  </span>
                </div>

                {/* Meta row */}
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: 14, marginTop: 5, flexWrap: "wrap",
                }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 3,
                    fontSize: 11, color: "#9b6aab", fontWeight: 600,
                  }}>
                    <IndianRupee style={{ width: 10, height: 10 }} />
                    {product.salePrice.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 11, color: "#b0a0bc" }}>
                    Margin:{" "}
                    <strong style={{
                      color: parseFloat(margin) >= 0 ? "#27ae60" : "#e63b6f",
                    }}>
                      {margin}%
                    </strong>
                  </span>
                  <span style={{ fontSize: 11, color: "#b0a0bc" }}>
                    {product.bomCount} BOM{product.bomCount !== 1 ? "s" : ""}
                  </span>
                  <span style={{ fontSize: 11, color: "#b0a0bc" }}>
                    {product.ecoCount} ECO{product.ecoCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* View Button */}
            <Link href={`/products/${product.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
              <button
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 9,
                  background: "rgba(139,59,158,0.08)",
                  border: "1px solid rgba(190,113,209,0.22)",
                  color: "#8b3b9e", fontSize: 12, fontWeight: 700,
                  fontFamily: font, cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background   = "linear-gradient(135deg,#8b3b9e,#be71d1)"
                  e.currentTarget.style.color        = "#fff"
                  e.currentTarget.style.borderColor  = "transparent"
                  e.currentTarget.style.boxShadow    = "0 4px 12px rgba(139,59,158,0.28)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background   = "rgba(139,59,158,0.08)"
                  e.currentTarget.style.color        = "#8b3b9e"
                  e.currentTarget.style.borderColor  = "rgba(190,113,209,0.22)"
                  e.currentTarget.style.boxShadow    = "none"
                }}
              >
                View
                <ArrowRight style={{ width: 12, height: 12 }} />
              </button>
            </Link>

          </div>
        )
      })}
    </div>
  )
}
