import type { Apoio } from '../../../shared/types/apoio'
import { APOIO_PADRAO } from '../../../shared/types/apoio'
import type { ApiApoio } from '../../utils/apoio'
import { paraApoio } from '../../utils/apoio'
import { chamarApi } from '../../utils/api'

/**
 * Bloco de apoio. Rota pública: ele é lido no SSR de toda página.
 *
 * Com a API fora do ar, devolve o padrão desligado em vez de estourar — um
 * card lateral não pode derrubar a página inteira.
 */
export default defineEventHandler(async (event): Promise<Apoio> => {
  try {
    return paraApoio(await chamarApi<ApiApoio>(event, '/settings/support'))
  }
  catch {
    return { ...APOIO_PADRAO }
  }
})
