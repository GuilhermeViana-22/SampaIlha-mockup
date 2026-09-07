import type { Guia, GuiaInput } from '#shared/types/content'

/**
 * Atualização de guia por ID.
 * 
 * NOTA: Implementação temporária em memória até que a API Python
 * tenha o endpoint /guides implementado.
 */
declare global {
  var guiasMemoria: Guia[]
}

export default defineEventHandler(async (event): Promise<Guia> => {
  const id = getRouterParam(event, 'id')
  const corpo = await readBody<GuiaInput>(event)

  const indice = globalThis.guiasMemoria.findIndex(g => g.id === id)

  if (indice === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Guia não encontrado',
    })
  }

  const existente = globalThis.guiasMemoria[indice]!
  const atualizado: Guia = {
    ...existente,
    ...corpo,
    id: existente.id,
    atualizadoEm: new Date().toISOString(),
    caminho: `/guias/${corpo.slug || existente.slug}`,
  }

  globalThis.guiasMemoria[indice] = atualizado

  return atualizado
})
