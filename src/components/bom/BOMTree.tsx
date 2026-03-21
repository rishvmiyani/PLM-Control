"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Component {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    version: number
    salePrice: number
    costPrice: number
  }
}

interface Operation {
  id: string
  name: string
  durationMins: number
  workCenter: string
}

interface Props {
  components: Component[]
  operations: Operation[]
}

export function BOMTree({ components, operations }: Props) {
  const totalCost = components.reduce(
    (sum, c) => sum + c.product.costPrice * c.quantity,
    0
  )

  return (
    <div className="space-y-6">
      {/* Components */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-zinc-800">
            Components ({components.length})
          </h3>
          <span className="text-sm text-zinc-500">
            Total Cost: ₹{totalCost.toLocaleString()}
          </span>
        </div>

        {components.length === 0 ? (
          <p className="text-sm text-zinc-400">No components added.</p>
        ) : (
          <div className="space-y-2">
            {components.map((c, index) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 w-5">{index + 1}.</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {c.product.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      v{c.product.version} · ₹{c.product.costPrice.toLocaleString()} each
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    × {c.quantity}
                  </p>
                  <p className="text-xs text-zinc-400">
                    ₹{(c.product.costPrice * c.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Operations */}
      <div>
        <h3 className="font-semibold text-zinc-800 mb-3">
          Operations ({operations.length})
        </h3>

        {operations.length === 0 ? (
          <p className="text-sm text-zinc-400">No operations added.</p>
        ) : (
          <div className="space-y-2">
            {operations.map((o, index) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-zinc-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 w-5">{index + 1}.</span>
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{o.name}</p>
                    <p className="text-xs text-zinc-400">
                      Work Center: {o.workCenter}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {o.durationMins} min
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
