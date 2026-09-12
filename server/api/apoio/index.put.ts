import type { Apoio } from '../../../shared/types/apoio'
import type { ApiApoio } from '../../utils/apoio'
import { paraApoio, paraPayloadApoio } from '../../utils/apoio'
import { chamarApi } from '../../utils/api'

/**
 * Salva o bloco de apoio.
 *
 * A API devolve `ativo: false` quando o bloco é ligado sem link e sem chave
 * Pix — o painel mostra o que ficou gravado, não o que foi enviado.
 */
export default defineEventHandler(async (event): Promise<Apoio> => {
  const corpo = await readBody<Partial<Apoio>>(event)

  const salvo = await chamarApi<ApiApoio>(event, '/settings/support', {
    method: 'PUT',
    body: paraPayloadApoio(corpo ?? {}),
    requerSessao: true,
  })

  return paraApoio(salvo)
})
