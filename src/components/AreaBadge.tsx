import { AreaRole, AREA_LABELS } from '@/types'
import { getAreaColorClass } from '@/lib/utils'

interface AreaBadgeProps {
  area: AreaRole
  className?: string
}

export default function AreaBadge({ area, className = '' }: AreaBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getAreaColorClass(area)} ${className}`}
    >
      {AREA_LABELS[area]}
    </span>
  )
}
