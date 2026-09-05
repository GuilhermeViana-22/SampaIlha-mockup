import type { Publicidade } from '../../../shared/types/content'
import type { ApiPublicidade } from '../../utils/publicidade'
import { paraPublicidade } from '../../utils/publicidade'
import { chamarApi, temSessao } from '../../utils/api'

/**
 * Anúncios da coluna lateral, na ordem de exibição.
 *
 * Sem `painel=true` a chamada vai à API **sem token**, mesmo que exista sessão:
 * é o que garante que o portal receba só o que está no ar hoje. Se mandasse o
 * token de quem está logado, a redação veria os próprios rascunhos publicados
 * na coluna e acharia que o leitor também vê.
 *
 * A lista vazia é resposta legítima e esperada: é ela que faz o card de
 * publicidade não aparecer no site.
 */
export default defineEventHandler(async (event): Promise<Publicidade[]> => {
  const painel = getQuery(event).painel === 'true'

  const itens = await chamarApi<ApiPublicidade[]>(event, '/advertisements', {
    auth: painel && temSessao(event),
  })

  return itens.map(paraPublicidade)
})
