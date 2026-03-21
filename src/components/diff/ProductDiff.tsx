import { ArrowRight } from "lucide-react"
import { format } from "date-fns"

interface Field {
  key: string
  oldValue: string | number | null
  newValue: string | number | null
}

interface Props {
  fields: Field[]
  effectiveDate: string
}

export default function ProductDiff({ fields, effectiveDate }: Props) {
  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white">
      <div className="grid grid-cols-2 divide-x divide-zinc-200">
        {/* Before */}
        <div className="p-5 bg-red-50">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-4">
            Before (Current)
          </p>
          <div className="space-y-3">
            {fields.map((f) => (
              <div key={f.key} className="flex justify-between items-center text-sm">
                <span className="font-mono text-zinc-400 text-xs">{f.key}</span>
                <span className="text-red-600 font-semibold">
                  {f.oldValue !== null && f.oldValue !== undefined
                    ? String(f.oldValue)
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* After */}
        <div className="p-5 bg-green-50">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-4">
            After (Proposed)
          </p>
          <div className="space-y-3">
            {fields.map((f) => {
              const oldNum =
                typeof f.oldValue === "number" ? f.oldValue : null
              const newNum =
                typeof f.newValue === "number" ? f.newValue : null
              let pct = ""
              if (oldNum !== null && newNum !== null && oldNum !== 0) {
                const d = (((newNum - oldNum) / oldNum) * 100).toFixed(1)
                pct = `${Number(d) > 0 ? "+" : ""}${d}%`
              }
              const changed =
                f.oldValue !== f.newValue && f.newValue !== null

              return (
                <div
                  key={f.key}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-mono text-zinc-400 text-xs">
                    {f.key}
                  </span>
                  <span
                    className={`font-semibold ${
                      changed ? "text-green-700" : "text-zinc-400"
                    }`}
                  >
                    {f.newValue !== null && f.newValue !== undefined
                      ? String(f.newValue)
                      : "—"}
                    {pct && (
                      <span className="text-xs text-zinc-400 ml-1.5">
                        ({pct})
                      </span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 border-t border-zinc-200 py-2.5 bg-zinc-50 text-xs text-zinc-400">
        <ArrowRight className="w-3.5 h-3.5" />
        Effective {format(new Date(effectiveDate), "dd MMM yyyy")}
      </div>
    </div>
  )
}
