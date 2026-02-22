import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  modules: ['nuxt-auth-utils'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    databaseUrl: '',
    cronSecret: '',
    session: {
      password: '',
    },
    oauth: {
      google: {
        clientId: '',
        clientSecret: '',
      },
    },
  },

  app: {
    head: {
      title: 'Vigil — Open Source Cron Monitoring',
      meta: [
        { name: 'description', content: 'Monitor your cron jobs with Statuspage.io and BetterUptime integration. Free, open source, and self-hostable.' },
        { name: 'theme-color', content: '#0a0a1a' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' },
      ],
    },
  },
})
