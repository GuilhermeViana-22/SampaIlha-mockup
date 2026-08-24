import type { Tema } from '../../../shared/types/tema'
import { TEMA_PADRAO, normalizarTema } from '../../../shared/types/tema'
import { chamarApi } from '../../utils/api'
import { daApi } from '../../utils/tema'

/**
 * Tema do site. Rota pública: é lida no SSR de toda página.
 *
 * Se a API estiver fora do ar, o portal continua respondendo com a paleta
 * padrão — cor errada é um problema menor que página quebrada.
 */
export default defineEventHandler(async (event): Promise<Tema> => {
  try {
    return daApi(await chamarApi(event, '/settings/theme'))
  }
  catch {
    return normalizarTema(TEMA_PADRAO)
  }
})
