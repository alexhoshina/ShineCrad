// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxt/image", "@nuxtjs/i18n"],
  css: ["~/assets/css/main.css"],

  components: [
    { path: "~/components/app", pathPrefix: false },
    { path: "~/components/settings", pathPrefix: false },
    { path: "~/components/editor", pathPrefix: false },
  ],

  colorMode: {
    classSuffix: "",
  },

  typescript: {
    tsConfig: {
      include: ["../app.config.ts"],
    },
  },

  i18n: {
    locales: [
      {
        code: "zh-CN",
        name: "简体中文",
        file: "zh.json",
      },
      {
        code: "en",
        name: "English",
        file: "en.json",
      },
    ],
    defaultLocale: "zh-CN",
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
      redirectOn: "root",
    },
  },
  fonts: {
    families: [
      {
        name: "FOTMatisseProEB",
        src: "https://s3.hi168.com/hi168-26327-7861xjfr/shine/FOT-Matisse-Pro-EB.otf",
        weights: [800],
        styles: ["normal"],
      },
      {
        name: "LXGWWenKaiMono-Medium",
        src: "https://s3.hi168.com/hi168-26327-7861xjfr/shine/LXGWWenKaiMono-Medium.ttf",
      },
    ],
  },
  vite: {
    viteNode: {
      requestTimeout: 300_000,
    },
  },
});
