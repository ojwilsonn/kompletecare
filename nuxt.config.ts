// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ["bootstrap/dist/css/bootstrap.min.css", "bootstrap-icons/font/bootstrap-icons.css"],
  plugins: ["~/plugins/bootstrap.client.ts"],
  modules: ["@nuxtjs/apollo"],


  apollo: {
    clients: {
      default: {
        httpEndpoint: "https://testdrive.kompletecare.com/graphql",
        authType: 'Bearer',
        authHeader: 'Authorization',
        httpLinkOptions: {
        headers: {
          Authorization: 'Bearer 6227|Io0r1S7RYWHL1D6rQAjpTgrdQFni6Ttl0dfO9YNo'
        }
      }
      },
    },
  },
 

  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
});
