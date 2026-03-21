export default function DiffLegend() {
  const items = [
    { label: "ADD", bg: "bg-green-100", border: "border-green-400", text: "text-green-700" },
    { label: "REMOVE", bg: "bg-red-100", border: "border-red-400", text: "text-red-700" },
    { label: "MODIFY", bg: "bg-orange-100", border: "border-orange-400", text: "text-orange-700" },
    { label: "UNCHANGED", bg: "bg-zinc-100", border: "border-zinc-300", text: "text-zinc-500" },
  ]

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className={`w-3 h-3 rounded-sm border ${item.bg} ${item.border}`}
          />
          <span className={`text-xs font-medium ${item.text}`}>
            {item.label}
          </span>
        </div>
      ))}
      <span className="text-xs text-zinc-400 ml-auto">
        Solid edge = Component · Dashed edge = Operation
      </span>
    </div>
  )
}
