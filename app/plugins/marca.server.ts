/**
 * Carrega o logo do portal uma vez por requisição SSR, como o tema.
 *
 * O estado viaja no payload do Nuxt: o cliente hidrata sem segunda chamada e
 * sem trocar o logo do build pelo enviado depois da primeira pintura.
 */
export default defineNuxtPlugin(async () => {
  await useMarcaStore().carregar()
})
