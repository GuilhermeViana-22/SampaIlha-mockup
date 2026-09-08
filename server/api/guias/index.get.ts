import type { Guia, RespostaLista } from '../../../shared/types/content'
import type { ApiPost } from '../../utils/adaptadores'
import { paraLista } from '../../utils/adaptadores'
import { paraGuia, paramsListagemGuias } from '../../utils/guias'
import { chamarApi, temSessao } from '../../utils/api'

/**
 * Listagem de guias — os posts de `type=dica` da API.
 *
 * Anônimo, a API já devolve só o que está publicado; autenticado, o token
 * libera rascunhos e agendados e o filtro de status passa a valer.
 */
export default defineEventHandler(async (event): Promise<RespostaLista<Guia>> => {
  const autenticado = temSessao(event)

  const resposta = await chamarApi<{ items: ApiPost[], pagination: { total: number } }>(event, '/posts', {
    auth: autenticado,
    params: paramsListagemGuias(getQuery(event), autenticado),
  })

  return paraLista(resposta, paraGuia)
})
