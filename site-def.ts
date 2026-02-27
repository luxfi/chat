import { footer, mainNav, type SiteDef  } from '@/components/site-def'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lux.chat'

export default {
  currentAs: siteUrl,
  nav: {
    common: mainNav,
  },
  footer: footer.standard,
} satisfies SiteDef
