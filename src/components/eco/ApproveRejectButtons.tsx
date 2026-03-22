"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"

export default function ApproveRejectButtons({ ecoId }: { ecoId: string }) {
  const router  = useRouter()
  const [loading, setLoading]           = useState<"approve" | "reject" | null>(null)
  const [showRejectInput, setShowReject] = useState(false)
  const [reason, setReason]             = useState("")
  const [error, setError]               = useState("")

  const font = "'DM Sans', sans-serif"

  async function handleApprove() {
    setLoading("approve"); setError("")
    try {
      const res  = await fetch(`/api/eco/${ecoId}/approve`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to approve")
      router.refresh()
    } catch (e: any) {
      setError(e.message)
      setLoading(null)
    }
  }

  async function handleReject() {
    if (!reason.trim()) return
    setLoading("reject"); setError("")
    try {
      const res  = await fetch(`/api/eco/${ecoId}/reject`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to reject")
      router.refresh()
    } catch (e: any) {
      setError(e.message)
      setLoading(null)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>

      {/* Error */}
      {error && (
        <span style={{ fontSize: 10, color: "#c62828", fontFamily: font, maxWidth: 200, textAlign: "right" }}>
          {error}
        </span>
      )}

      {/* Approve + Reject buttons */}
      {!showRejectInput && (
        <div style={{ display: "flex", gap: 6 }}>

          {/* Approve */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleApprove() }}
            disabled={loading === "approve"}
            title="Approve ECO"
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "6px 12px", borderRadius: 8,
              background: "linear-gradient(135deg,#16a34a,#22c55e)",
              border: "none", color: "#fff",
              fontSize: 11, fontWeight: 700,
              cursor: loading === "approve" ? "not-allowed" : "pointer",
              fontFamily: font, opacity: loading === "approve" ? 0.6 : 1,
              boxShadow: "0 2px 8px rgba(34,197,94,0.25)",
              whiteSpace: "nowrap",
            }}
          >
            <Check style={{ width: 12, height: 12 }} />
            {loading === "approve" ? "…" : "Approve"}
          </button>

          {/* Reject */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReject(true) }}
            disabled={loading === "reject"}
            title="Reject ECO"
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "6px 12px", borderRadius: 8,
              background: "rgba(198,40,40,0.08)",
              border: "1px solid rgba(198,40,40,0.25)",
              color: "#c62828",
              fontSize: 11, fontWeight: 700,
              cursor: "pointer", fontFamily: font,
              whiteSpace: "nowrap",
            }}
          >
            <X style={{ width: 12, height: 12 }} />
            Reject
          </button>

        </div>
      )}

      {/* Reject reason input */}
      {showRejectInput && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, width: 220 }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
          <input
            autoFocus
            placeholder="Reason for rejection..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              height: 32, padding: "0 10px",
              border: "1px solid rgba(198,40,40,0.35)",
              borderRadius: 7, fontSize: 12,
              fontFamily: font, outline: "none",
              background: "rgba(255,255,255,0.9)",
              color: "#2d1a38",
            }}
          />
          <div style={{ display: "flex", gap: 5 }}>
            <button
              onClick={handleReject}
              disabled={!reason.trim() || loading === "reject"}
              style={{
                flex: 1, height: 28, borderRadius: 7,
                background: "#c62828", border: "none",
                color: "#fff", fontSize: 11, fontWeight: 700,
                cursor: !reason.trim() ? "not-allowed" : "pointer",
                fontFamily: font,
                opacity: !reason.trim() || loading === "reject" ? 0.5 : 1,
              }}
            >
              {loading === "reject" ? "…" : "Confirm"}
            </button>
            <button
              onClick={() => { setShowReject(false); setReason("") }}
              style={{
                flex: 1, height: 28, borderRadius: 7,
                background: "transparent",
                border: "1px solid rgba(190,113,209,0.3)",
                color: "#9b6aab", fontSize: 11, fontWeight: 600,
                cursor: "pointer", fontFamily: font,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
