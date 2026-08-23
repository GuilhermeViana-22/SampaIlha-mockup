import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', 'shadcn-nuxt'],

  css: [
    '~/assets/css/tailwind.css',
    '~/assets/css/portal/index.css',
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },

  components: [
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components', pathPrefix: true },
  ],

  runtimeConfig: {
    // Back-end do portal (api_python_sampa). As rotas em server/api/ apenas
    // repassam para cá, guardando o token em cookie httpOnly.
    apiBase: process.env.NUXT_API_BASE || 'http://localhost:9041/api/v1',
    public: {
      siteName: 'Portal Sampa na Ilha',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      // Origem pública da API, usada para montar a URL absoluta das fotos.
      apiOrigin: process.env.NUXT_PUBLIC_API_ORIGIN || 'http://localhost:9041',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@300;400;500;600;700&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
        },
      ],
    },
  },
})
