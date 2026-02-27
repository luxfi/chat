import { Section } from '@/components/section/section'

export function UpgradePrompt({ remaining, limit }: { remaining: number; limit: number }) {
  return (
    <Section title="Usage Limit Reached">
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="text-4xl">🔒</div>
        <h3 className="text-lg font-semibold">
          You&apos;ve used all {limit} free queries for today
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Upgrade to a paid plan for unlimited queries, faster models, and priority access.
        </p>
        <a
          href="https://hanzo.ai/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Upgrade Plan
        </a>
        <p className="text-xs text-muted-foreground">
          Free tier resets daily at midnight UTC
        </p>
      </div>
    </Section>
  )
}
