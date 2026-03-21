"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  salePrice: z.coerce.number().positive("Must be positive"),
  costPrice: z.coerce.number().positive("Must be positive"),
})

type FormValues = z.infer<typeof schema>

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormValues) {
    setIsLoading(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed")
      const product = await res.json()
      toast.success("Product created successfully")
      router.push(`/products/${product.id}`)
    } catch {
      toast.error("Failed to create product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">New Product</h1>
          <p className="text-zinc-500 text-sm">Version 1 is auto-assigned</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Products cannot be edited after creation. Use ECOs to make changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" placeholder="e.g. Steel Frame Assembly" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="salePrice">Sale Price (₹)</Label>
                <Input id="salePrice" type="number" step="0.01" placeholder="0.00" {...register("salePrice")} />
                {errors.salePrice && <p className="text-sm text-red-500">{errors.salePrice.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="costPrice">Cost Price (₹)</Label>
                <Input id="costPrice" type="number" step="0.01" placeholder="0.00" {...register("costPrice")} />
                {errors.costPrice && <p className="text-sm text-red-500">{errors.costPrice.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Version</Label>
              <Input value="1" disabled className="bg-zinc-50 text-zinc-400" />
              <p className="text-xs text-zinc-400">Auto-assigned. Increments via ECO.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Creating..." : "Create Product"}
              </Button>
              <Link href="/products">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
