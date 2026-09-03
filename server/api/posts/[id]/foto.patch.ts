import type { PostImagem } from '../../../../shared/types/content'
import { urlAbsoluta } from '../../../utils/adaptadores'
import { chamarApi } from '../../../utils/api'

interface ApiImagem {
  id: string
  url: string
  caption: string | null
  credit: string | null
  sort_order: number
  is_featured: boolean
}

/**
 * Ajusta uma foto já enviada: legenda, crédito, ordem e escolha da capa.
 *
 * Só viajam os campos que o formulário mandou — a API mantém o resto como
 * está, então marcar a capa não apaga a legenda escrita antes.
 */
export default defineEventHandler(async (event): Promise<PostImagem> => {
  const id = getRouterParam(event, 'id')!
  const { imagemId } = getQuery(event)

  if (!imagemId) {
    throw createError({ statusCode: 422, statusMessage: 'Informe a imagem a ajustar.' })
  }

  const corpo = await readBody<{
    legenda?: string | null
    credito?: string | null
    ordem?: number
    capa?: boolean
  }>(event) ?? {}

  const payload: Record<string, unknown> = {}
  if ('legenda' in corpo) payload.caption = corpo.legenda || null
  if ('credito' in corpo) payload.credit = corpo.credito || null
  if ('ordem' in corpo) payload.sort_order = corpo.ordem
  if ('capa' in corpo) payload.set_as_cover = corpo.capa

  const imagem = await chamarApi<ApiImagem>(event, `/posts/${id}/images/${imagemId}`, {
    method: 'PATCH',
    body: payload,
    requerSessao: true,
  })

  return {
    id: imagem.id,
    url: urlAbsoluta(imagem.url) ?? '',
    legenda: imagem.caption,
    credito: imagem.credit,
    ordem: imagem.sort_order,
    capa: imagem.is_featured,
  }
})
