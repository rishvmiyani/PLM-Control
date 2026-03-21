"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div
      className="glass-card p-8 text-center max-w-lg mx-auto mt-12"
    >
      <p
        className="text-lg font-bold mb-2"
        style={{ color: "var(--deep)" }}
      >
        Dashboard failed to load
      </p>
      <pre
        className="text-xs text-left rounded-xl p-4 mb-4 overflow-auto"
        style={{
          background: "rgba(230,59,111,0.08)",
          color: "#e63b6f",
          maxHeight: 200,
        }}
      >
        {error.message}
      </pre>
      <button
        onClick={reset}
        className="btn-primary px-6 py-2 text-sm"
      >
        Try Again
      </button>
    </div>
  )
}
