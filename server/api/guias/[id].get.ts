import type { Guia } from '#shared/types/content'

/**
 * Busca guia por ID.
 * 
 * NOTA: Implementação temporária em memória até que a API Python
 * tenha o endpoint /guides implementado.
 */
declare global {
  var guiasMemoria: Guia[]
}

export default defineEventHandler(async (event): Promise<Guia> => {
  const id = getRouterParam(event, 'id')

  const guia = globalThis.guiasMemoria.find(g => g.id === id)

  if (!guia) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Guia não encontrado',
    })
  }

  return guia
})
