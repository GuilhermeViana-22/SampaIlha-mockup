import type { Publicidade, PublicidadeInput } from '../../../shared/types/content'
import type { ApiPublicidade } from '../../utils/publicidade'
import { paraPayloadPublicidade, paraPublicidade } from '../../utils/publicidade'
import { chamarApi } from '../../utils/api'

/**
 * Edita o cadastro do anúncio: texto, link, status e janela contratada.
 *
 * A arte tem rota própria (`PUT /api/publicidade/:id/imagem`) porque trocar o
 * criativo e corrigir o texto são coisas que acontecem em momentos diferentes.
 */
export default defineEventHandler(async (event): Promise<Publicidade> => {
  const id = getRouterParam(event, 'id')!
  const corpo = await readBody<Partial<PublicidadeInput>>(event)

  const atualizado = await chamarApi<ApiPublicidade>(event, `/advertisements/${id}`, {
    method: 'PUT',
    requerSessao: true,
    body: paraPayloadPublicidade(corpo ?? {}),
  })

  return paraPublicidade(atualizado)
})
