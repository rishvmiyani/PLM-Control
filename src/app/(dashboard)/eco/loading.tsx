export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-xl" style={{ background: "rgba(139,59,158,0.1)" }} />
      <div className="grid gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl" style={{ background: "rgba(139,59,158,0.07)" }} />
        ))}
      </div>
    </div>
  )
}
