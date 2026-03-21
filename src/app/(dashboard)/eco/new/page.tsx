"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  version: number
  salePrice: number
  costPrice: number
}

interface BOM {
  id: string
  version: number
  productId: string
}

interface ComponentRow {
  productId: string
  quantity: number
  action: "ADD" | "MODIFY" | "REMOVE" | "UNCHANGED"
}

interface FormData {
  title: string
  type: "PRODUCT" | "BOM" | "ROLLBACK"
  productId: string
  bomId?: string
  effectiveDate: string
  versionUpdate: boolean
  // PRODUCT changes
  newName?: string
  newSalePrice?: string
  newCostPrice?: string
}

export default function NewECOPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [boms, setBOMs] = useState<BOM[]>([])
  const [components, setComponents] = useState<ComponentRow[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      type: "PRODUCT",
      versionUpdate: false,
    },
  })

  const watchType = watch("type")
  const watchProductId = watch("productId")

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setProducts)
  }, [])

  useEffect(() => {
    if (!watchProductId) return
    const p = products.find((p) => p.id === watchProductId)
    setSelectedProduct(p ?? null)
    // Fetch BOMs for product
    fetch(`/api/bom?productId=${watchProductId}`)
      .then((r) => r.json())
      .then(setBOMs)
  }, [watchProductId, products])

  function addComponent() {
    setComponents((prev) => [
      ...prev,
      { productId: "", quantity: 1, action: "ADD" },
    ])
  }

  function removeComponent(i: number) {
    setComponents((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateComponent(i: number, field: keyof ComponentRow, value: string | number) {
    setComponents((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c))
    )
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError("")

    let proposedChanges: Record<string, unknown> = {}

    if (data.type === "PRODUCT" || data.type === "ROLLBACK") {
      if (data.newName) proposedChanges.name = data.newName
      if (data.newSalePrice) proposedChanges.salePrice = Number(data.newSalePrice)
      if (data.newCostPrice) proposedChanges.costPrice = Number(data.newCostPrice)
    }

    if (data.type === "BOM") {
      proposedChanges.components = components
    }

    const res = await fetch("/api/eco", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        type: data.type,
        productId: data.productId,
        bomId: data.bomId || null,
        effectiveDate: data.effectiveDate,
        versionUpdate: data.versionUpdate,
        proposedChanges,
      }),
    })

    const result = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(result.error ?? "Failed to create ECO")
      return
    }

    router.push(`/eco/${result.id}`)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/eco">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">New ECO</h1>
          <p className="text-zinc-500 text-sm">Create an Engineering Change Order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input
            placeholder="e.g. Reduce Screw Count in Wooden Table BOM"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <Label>ECO Type *</Label>
          <Select
            defaultValue="PRODUCT"
            onValueChange={(v) => setValue("type", v as FormData["type"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRODUCT">Product Change</SelectItem>
              <SelectItem value="BOM">BOM Change</SelectItem>
              <SelectItem value="ROLLBACK">Rollback</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product */}
        <div className="space-y-1.5">
          <Label>Product *</Label>
          <Select onValueChange={(v) => setValue("productId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select active product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} v{p.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.productId && (
            <p className="text-xs text-red-500">Product is required</p>
          )}
        </div>

        {/* BOM (only for BOM type) */}
        {watchType === "BOM" && (
          <div className="space-y-1.5">
            <Label>BOM</Label>
            <Select onValueChange={(v) => setValue("bomId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select BOM" />
              </SelectTrigger>
              <SelectContent>
                {boms.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    BOM v{b.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Effective Date */}
        <div className="space-y-1.5">
          <Label>Effective Date *</Label>
          <Input
            type="date"
            {...register("effectiveDate", { required: "Effective date is required" })}
          />
          {errors.effectiveDate && (
            <p className="text-xs text-red-500">{errors.effectiveDate.message}</p>
          )}
        </div>

        {/* Version Update */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="versionUpdate"
            onCheckedChange={(v) => setValue("versionUpdate", v === true)}
          />
          <Label htmlFor="versionUpdate" className="cursor-pointer">
            Create new version on apply
          </Label>
        </div>

        {/* ── PRODUCT proposed changes ── */}
        {(watchType === "PRODUCT" || watchType === "ROLLBACK") && selectedProduct && (
          <div className="border border-zinc-200 rounded-xl p-4 space-y-4 bg-zinc-50">
            <p className="text-sm font-semibold text-zinc-700">
              Proposed Changes
              <span className="ml-2 text-xs text-zinc-400 font-normal">
                Current: ₹{selectedProduct.salePrice} sale / ₹{selectedProduct.costPrice} cost
              </span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">New Name</Label>
                <Input
                  placeholder={selectedProduct.name}
                  {...register("newName")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">New Sale Price</Label>
                <Input
                  type="number"
                  placeholder={String(selectedProduct.salePrice)}
                  {...register("newSalePrice")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">New Cost Price</Label>
                <Input
                  type="number"
                  placeholder={String(selectedProduct.costPrice)}
                  {...register("newCostPrice")}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── BOM proposed changes ── */}
        {watchType === "BOM" && (
          <div className="border border-zinc-200 rounded-xl p-4 space-y-4 bg-zinc-50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-700">Components</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addComponent}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Component
              </Button>
            </div>

            {components.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-4">
                No components added yet
              </p>
            ) : (
              <div className="space-y-2">
                {components.map((comp, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Select
                      onValueChange={(v) => updateComponent(i, "productId", v)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select component" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      value={comp.quantity}
                      onChange={(e) =>
                        updateComponent(i, "quantity", Number(e.target.value))
                      }
                      className="w-20"
                      placeholder="Qty"
                    />
                    <Select
                      defaultValue="ADD"
                      onValueChange={(v) => updateComponent(i, "action", v)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADD">ADD</SelectItem>
                        <SelectItem value="MODIFY">MODIFY</SelectItem>
                        <SelectItem value="REMOVE">REMOVE</SelectItem>
                        <SelectItem value="UNCHANGED">UNCHANGED</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeComponent(i)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Creating..." : "Create ECO"}
          </Button>
          <Link href="/eco">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
