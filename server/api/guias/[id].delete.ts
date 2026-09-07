/**
 * Exclusão de guia por ID.
 * 
 * NOTA: Implementação temporária em memória até que a API Python
 * tenha o endpoint /guides implementado.
 */
declare global {
  var guiasMemoria: import('#shared/types/content').Guia[]
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const indice = globalThis.guiasMemoria.findIndex(g => g.id === id)

  if (indice === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Guia não encontrado',
    })
  }

  globalThis.guiasMemoria.splice(indice, 1)

  return { ok: true, id }
})
