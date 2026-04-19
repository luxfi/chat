import { Button } from '@/components/ui/button'

interface UpgradePromptProps {
  remaining: number
  limit: number
  onDismiss?: () => void
}

export function UpgradePrompt({ remaining, limit, onDismiss }: UpgradePromptProps) {
  return (
    <div className="w-full max-w-md rounded-lg border border-[var(--border-soft)] bg-[var(--bg)] p-6 text-center">
      <h2 className="text-lg font-medium">Daily limit reached</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        You have used {limit - remaining} of {limit} free queries today.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <Button variant="secondary" onClick={onDismiss}>
          Dismiss
        </Button>
        <a href="https://lux.cloud/pricing" target="_blank" rel="noreferrer">
          <Button>Upgrade</Button>
        </a>
      </div>
    </div>
  )
}
