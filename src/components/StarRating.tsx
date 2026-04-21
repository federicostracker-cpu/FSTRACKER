'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const sizePx = { sm: 16, md: 22, lg: 28 }[size]

  return (
    <div className="flex items-center gap-1" role="group" aria-label={`Puntuación: ${value} de 5`}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-transform ${readonly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'}`}
          aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
        >
          <Star
            size={sizePx}
            className={
              star <= value
                ? 'text-orange-400 fill-orange-400'
                : 'text-slate-600 fill-transparent'
            }
          />
        </button>
      ))}
      <span className="ml-1.5 text-sm text-slate-400 font-medium tabular-nums">
        {value}/5
      </span>
    </div>
  )
}
