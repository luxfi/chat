import { footer, mainNav, type SiteDef  } from '@/components/site-def'

export default {
  currentAs: 'https://lux.chat',
  nav: {
    common: mainNav,
  },
  footer: footer.standard, 
} satisfies SiteDef
