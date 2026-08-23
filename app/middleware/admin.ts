/**
 * Protege as rotas do dashboard. Aplicado nas páginas de /admin
 * (exceto a tela de login) via definePageMeta({ middleware: 'admin' }).
 */
export default defineNuxtRouteMiddleware(async (para) => {
  const auth = useAuthStore()
  await auth.verificarSessao()

  if (!auth.autenticado) {
    return navigateTo({ path: '/admin', query: { redirecionar: para.fullPath } })
  }
})
