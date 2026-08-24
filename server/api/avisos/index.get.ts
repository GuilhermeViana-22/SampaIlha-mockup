import type { Aviso } from '../../../shared/types/content'
import type { ApiAviso } from '../../utils/avisos'
import { paraAviso } from '../../utils/avisos'
import { chamarApi } from '../../utils/api'

/**
 * Avisos da faixa do topo.
 *
 * Sem parâmetro, devolve só o que está no ar hoje — é o que o site público
 * consome. `?historico=1` traz o acervo para o painel e exige sessão.
 */
export default defineEventHandler(async (event): Promise<Aviso[]> => {
  const { historico } = getQuery(event)

  if (historico) {
    const lista = await chamarApi<ApiAviso[]>(event, '/notices/historico', { requerSessao: true })
    return lista.map(paraAviso)
  }

  try {
    return (await chamarApi<ApiAviso[]>(event, '/notices')).map(paraAviso)
  }
  catch {
    // A faixa é enfeite: falha aqui não pode derrubar o topo do site.
    return []
  }
})
