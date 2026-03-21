export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-64 rounded-xl" style={{ background: "rgba(139,59,158,0.1)" }} />
      <div className="h-4 w-40 rounded-lg" style={{ background: "rgba(139,59,158,0.07)" }} />

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl"
            style={{ background: "rgba(139,59,158,0.07)" }}
          />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl overflow-hidden" style={{ background: "rgba(139,59,158,0.05)" }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 mx-4 my-2 rounded-lg"
            style={{ background: "rgba(139,59,158,0.07)" }}
          />
        ))}
      </div>
    </div>
  )
}
