import type { MidiaKit } from '../../../shared/types/content'
import type { ApiMidiaKit } from '../../utils/midiaKit'
import { paraMidiaKit } from '../../utils/midiaKit'
import { chamarApi } from '../../utils/api'

/**
 * Acervo do mídia kit, do mais recente para o mais antigo.
 *
 * `requerSessao` não é zelo a mais: a API recusa esta listagem sem token, e é
 * assim que o acervo continua invisível para o site — não existe versão pública
 * desta rota em lugar nenhum.
 */
export default defineEventHandler(async (event): Promise<MidiaKit[]> => {
  const itens = await chamarApi<ApiMidiaKit[]>(event, '/media-kit', { requerSessao: true })

  return itens.map(paraMidiaKit)
})
