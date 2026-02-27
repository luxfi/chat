'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type ModelInfo = {
  id: string
  owned_by?: string
}

type GroupedModels = {
  [group: string]: ModelInfo[]
}

function groupModels(models: ModelInfo[]): GroupedModels {
  const groups: GroupedModels = {}
  for (const model of models) {
    let group = 'Other'
    const id = model.id.toLowerCase()
    if (id.startsWith('zen')) {
      group = id.includes('code') ? 'Zen Code' : 'Zen Chat'
    } else if (model.owned_by) {
      group = model.owned_by
    }
    if (!groups[group]) groups[group] = []
    groups[group].push(model)
  }
  // Sort: Zen Chat first, Zen Code second, then alphabetical
  const sorted: GroupedModels = {}
  const keys = Object.keys(groups).sort((a, b) => {
    if (a === 'Zen Chat') return -1
    if (b === 'Zen Chat') return 1
    if (a === 'Zen Code') return -1
    if (b === 'Zen Code') return 1
    return a.localeCompare(b)
  })
  for (const key of keys) {
    sorted[key] = groups[key].sort((a, b) => a.id.localeCompare(b.id))
  }
  return sorted
}

export function ModelSelector({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (modelId: string) => void
  className?: string
}) {
  const [models, setModels] = useState<GroupedModels>({})
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/models')
      .then(r => r.json())
      .then((data: { data?: ModelInfo[] }) => {
        if (data?.data) {
          setModels(groupModels(data.data))
        }
      })
      .catch(() => {})
  }, [])

  const hasModels = Object.keys(models).length > 0

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-input bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
      >
        <span className="max-w-[120px] truncate">{value}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={cn('transition-transform', open && 'rotate-180')}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && hasModels && (
        <div className="absolute bottom-full mb-1 left-0 z-50 w-64 max-h-80 overflow-y-auto rounded-md border bg-background shadow-lg">
          {Object.entries(models).map(([group, items]) => (
            <div key={group}>
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                {group}
              </div>
              {items.map(model => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    onChange(model.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors',
                    model.id === value && 'bg-muted font-medium'
                  )}
                >
                  {model.id}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
