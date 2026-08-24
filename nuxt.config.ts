import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', 'shadcn-nuxt'],

  css: [
    '~/assets/css/tailwind.css',
    '~/assets/css/portal/index.css',
    // Estilo do vue-sonner. Sem ele o aviso monta no DOM como um <li> comum,
    // sem posicionamento nem fundo, e cai no fim do documento — o código
    // dispara, o elemento existe e ninguém vê nada. O wrapper em
    // components/ui/sonner só define as variáveis de cor que este CSS consome.
    'vue-sonner/style.css',
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  nitro: {
    /**
     * TinyMCE roda self-hosted: os arquivos saem de node_modules direto para o
     * bundle, sem CDN nem chave de API. O Nitro copia isto para .output/public
     * no build, então o container não precisa de node_modules em runtime.
     */
    publicAssets: [
      {
        baseURL: 'tinymce',
        dir: fileURLToPath(new URL('./node_modules/tinymce', import.meta.url)),
        maxAge: 60 * 60 * 24 * 365,
      },
    ],
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
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/favicon.png' },
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
