"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

interface Product {
  id: string
  name: string
  version: number
  status: string
}

interface ComponentRow {
  productId: string
  quantity: number
}

interface OperationRow {
  name: string
  durationMins: number
  workCenter: string
}

export default function NewBOMPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedProductId = searchParams.get("productId") ?? ""

  const [products, setProducts] = useState<Product[]>([])
  const [productId, setProductId] = useState(preselectedProductId)
  const [components, setComponents] = useState<ComponentRow[]>([
    { productId: "", quantity: 1 },
  ])
  const [operations, setOperations] = useState<OperationRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.filter((p: Product) => String(p.status) === "ACTIVE")))
      .catch(() => toast.error("Failed to load products"))
  }, [])

  function addComponent() {
    setComponents([...components, { productId: "", quantity: 1 }])
  }

  function removeComponent(index: number) {
    setComponents(components.filter((_, i) => i !== index))
  }

  function updateComponent(index: number, field: keyof ComponentRow, value: string | number) {
    const updated = [...components]
    updated[index] = { ...updated[index], [field]: value }
    setComponents(updated)
  }

  function addOperation() {
    setOperations([...operations, { name: "", durationMins: 30, workCenter: "" }])
  }

  function removeOperation(index: number) {
    setOperations(operations.filter((_, i) => i !== index))
  }

  function updateOperation(index: number, field: keyof OperationRow, value: string | number) {
    const updated = [...operations]
    updated[index] = { ...updated[index], [field]: value }
    setOperations(updated)
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
      if (!res.ok) {
        const err = await res.json()
        throw new Error(JSON.stringify(err.error))
      }
      const bom = await res.json()
      toast.success("BOM created successfully")
      router.push(`/bom/${bom.id}`)
    } catch (e) {
      toast.error("Failed to create BOM")
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/bom">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">New BOM</h1>
          <p className="text-zinc-500 text-sm">Add components and operations</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Selection */}
        <Card>
          <CardHeader><CardTitle>Product</CardTitle></CardHeader>
          <CardContent>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} (v{p.version})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Components */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Components</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addComponent}>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {components.map((comp, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Component Product</Label>
                  <Select
                    value={comp.productId}
                    onValueChange={(val) => updateComponent(index, "productId", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        .filter((p) => p.id !== productId)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={comp.quantity}
                    onChange={(e) =>
                      updateComponent(index, "quantity", parseFloat(e.target.value) || 1)
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeComponent(index)}
                  disabled={components.length === 1}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Operations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Operations (Optional)</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addOperation}>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {operations.length === 0 ? (
              <p className="text-sm text-zinc-400">No operations added.</p>
            ) : (
              operations.map((op, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Operation Name</Label>
                    <Input
                      placeholder="e.g. Welding"
                      value={op.name}
                      onChange={(e) => updateOperation(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Duration (min)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={op.durationMins}
                      onChange={(e) =>
                        updateOperation(index, "durationMins", parseInt(e.target.value) || 30)
                      }
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Work Center</Label>
                    <Input
                      placeholder="e.g. Assembly Line A"
                      value={op.workCenter}
                      onChange={(e) => updateOperation(index, "workCenter", e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOperation(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Creating..." : "Create BOM"}
          </Button>
          <Link href="/bom">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
