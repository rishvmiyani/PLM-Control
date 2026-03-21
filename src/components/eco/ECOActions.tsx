"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CheckCircle, PlayCircle, RotateCcw, ShieldCheck } from "lucide-react"

interface Props {
  ecoId: string
  stage: string
  role: string
  userId: string
  ecoUserId: string
}

const STAGE_FLOW = ["New", "Engineering Review", "Approval", "Done"]

export function ECOActions({ ecoId, stage, role }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const currentIndex = STAGE_FLOW.indexOf(stage)
  const isDone = stage === "Done"
  const canApprove = ["ADMIN", "APPROVER"].includes(role) && !isDone
  const canApply = ["ADMIN", "APPROVER"].includes(role) && stage === "Approval"
  const canRollback = role === "ADMIN" && isDone
  const canValidate = ["ADMIN", "ENGINEERING"].includes(role) && !isDone

  async function callAction(action: string) {
    setLoading(action)
    try {
      const res = await fetch(`/api/eco/${ecoId}/${action}`, {
        method: "POST",
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed")
      }
      toast.success(`${action} successful`)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed")
    } finally {
      setLoading(null)
    }
  }

  if (isDone && !canRollback) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {canValidate && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => callAction("validate")}
          disabled={loading !== null}
        >
          <ShieldCheck className="w-4 h-4 mr-1" />
          {loading === "validate" ? "Validating..." : "Validate"}
        </Button>
      )}

      {canApprove && currentIndex < STAGE_FLOW.length - 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => callAction("approve")}
          disabled={loading !== null}
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          {loading === "approve"
            ? "Moving..."
            : `Move to ${STAGE_FLOW[currentIndex + 1]}`}
        </Button>
      )}

      {canApply && (
        <Button
          size="sm"
          onClick={() => callAction("apply")}
          disabled={loading !== null}
        >
          <PlayCircle className="w-4 h-4 mr-1" />
          {loading === "apply" ? "Applying..." : "Apply ECO"}
        </Button>
      )}

      {canRollback && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => callAction("rollback")}
          disabled={loading !== null}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          {loading === "rollback" ? "Rolling back..." : "Rollback"}
        </Button>
      )}
    </div>
  )
}
