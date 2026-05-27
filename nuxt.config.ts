// https://nuxt.com/docs/api/configuration/nuxt-config
const sanitizedSupabaseUrl = process.env.SUPABASE_URL
  ?.replace(/\/rest\/v1\/?$/, '')
  .replace(/\/$/, '')

export default defineNuxtConfig({
  srcDir: './app',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/styles/global.css'],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
        }
      ]
    }
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  build: {
    transpile: ['vant']
  },

  imports: {
    dirs: ['app/stores', 'app/composables']
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@vant/nuxt', '@nuxtjs/i18n'],

  i18n: {
    langDir: '../locales/',
    strategy: 'prefix_except_default',
    locales: [
      { 
        code: 'tw', 
        language: 'zh-TW',
        name: '繁體中文', 
        files: [
          'tw/common.json'
        ]
      },
      { 
        code: 'en', 
        language: 'en-US',
        name: 'English', 
        files: [
          'en/common.json'
        ]
      }
    ],
    defaultLocale: 'tw',
  },
  supabase: {
    url: sanitizedSupabaseUrl,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: ['/auth/*']
    },
    types: '~/types/database.types.ts'
  },
})