import { chamarApi } from '../../utils/api'

/**
 * Exclusão definitiva: apaga o cadastro e a arte no disco.
 *
 * Para apenas tirar o banner da coluna existe o status `rascunho`, que
 * preserva a arte e as datas para a próxima campanha do mesmo anunciante.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  await chamarApi(event, `/advertisements/${id}`, { method: 'DELETE', requerSessao: true })

  return { ok: true, id }
})
