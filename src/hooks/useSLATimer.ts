import { useEffect, useState } from "react"
import { differenceInMinutes } from "date-fns"

interface SLATimer {
  elapsed: number
  remaining: number
  percentUsed: number
  isWarning: boolean
  isBreached: boolean
  displayText: string
}

export function useSLATimer(
  enteredStageAt: string | Date,
  slaHours: number
): SLATimer {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const slaMins = slaHours * 60
  const elapsedMins = differenceInMinutes(now, new Date(enteredStageAt))
  const remainingMins = slaMins - elapsedMins
  const percentUsed = Math.min((elapsedMins / slaMins) * 100, 100)
  const isBreached = elapsedMins >= slaMins
  const isWarning = !isBreached && percentUsed >= 80

  let displayText = ""
  if (isBreached) {
    const over = Math.abs(remainingMins)
    displayText =
      over >= 60
        ? `OVERDUE ${Math.floor(over / 60)}h ${over % 60}m`
        : `OVERDUE ${over}m`
  } else {
    const rem = remainingMins
    displayText =
      rem >= 60
        ? `${Math.floor(rem / 60)}h ${rem % 60}m left`
        : `${rem}m left`
  }

  return {
    elapsed: elapsedMins,
    remaining: remainingMins,
    percentUsed,
    isWarning,
    isBreached,
    displayText,
  }
}
