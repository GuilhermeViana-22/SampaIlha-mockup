/**
 * Carrega editorias e regiões uma vez por requisição SSR. O estado da store
 * viaja no payload do Nuxt, então o cliente já hidrata com a taxonomia pronta.
 */
export default defineNuxtPlugin(async () => {
  await usePortalStore().carregarTaxonomia()
})
