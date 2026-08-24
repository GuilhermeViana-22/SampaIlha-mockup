/**
 * Carrega a paleta do portal uma vez por requisição SSR. O estado viaja no
 * payload do Nuxt, então o cliente hidrata sem uma segunda chamada — e sem
 * piscar a cor padrão antes da cor configurada.
 */
export default defineNuxtPlugin(async () => {
  await useTemaStore().carregar()
})
