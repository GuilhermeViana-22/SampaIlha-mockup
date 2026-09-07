import type { Guia, GuiaInput } from '#shared/types/content'

/**
 * Criação de guias.
 * 
 * NOTA: Implementação temporária em memória até que a API Python
 * tenha o endpoint /guides implementado.
 */
declare global {
  var guiasMemoria: Guia[]
}

export default defineEventHandler(async (event): Promise<Guia> => {
  const corpo = await readBody<GuiaInput>(event)

  const novoGuia: Guia = {
    id: crypto.randomUUID(),
    ...corpo,
    categoriaNome: 'Categoria', // Será calculado pela API real
    leituras: 0,
    tempoLeitura: corpo.tempoLeitura || 3,
    publicadoEm: corpo.publicadoEm || new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    caminho: `/guias/${corpo.slug}`,
  }

  globalThis.guiasMemoria.push(novoGuia)

  setResponseStatus(event, 201)
  return novoGuia
})
