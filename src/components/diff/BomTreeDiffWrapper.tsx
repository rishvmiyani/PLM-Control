"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const BomTreeDiff = dynamic(
  () => import("@/components/diff/BomTreeDiff"),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-[520px] rounded-xl" />,
  }
)

interface BOMComponent {
  id: string
  productId: string
  quantity: number
  action?: "ADD" | "REMOVE" | "MODIFY" | "UNCHANGED"
  product: { name: string; costPrice: number }
}

interface BOMOperation {
  id: string
  name: string
  durationMins: number
  workCenter: string
  action?: "ADD" | "REMOVE" | "MODIFY" | "UNCHANGED"
}

interface Props {
  productName: string
  productVersion: number
  components: BOMComponent[]
  operations: BOMOperation[]
}

export default function BomTreeDiffWrapper(props: Props) {
  return <BomTreeDiff {...props} />
}
