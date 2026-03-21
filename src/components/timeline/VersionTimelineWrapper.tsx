"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

const VersionTimeline = dynamic(
  () => import("@/components/timeline/VersionTimeline"),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-40 rounded-xl" />,
  }
)

interface Version {
  id: string
  version: number
  status: string
  createdAt: string
  salePrice?: number
  costPrice?: number
}

interface Props {
  versions: Version[]
  isAdmin?: boolean
  onRollback?: (targetId: string) => void
  activeId?: string
}

export default function VersionTimelineWrapper(props: Props) {
  return <VersionTimeline {...props} />
}
