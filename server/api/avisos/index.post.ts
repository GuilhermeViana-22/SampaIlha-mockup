import type { Aviso } from '../../../shared/types/content'
import type { ApiAviso } from '../../utils/avisos'
import { paraAviso } from '../../utils/avisos'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Aviso> => {
  const corpo = await readBody<{ mensagem?: string, tipo?: string, exibirEm?: string }>(event)

  const criado = await chamarApi<ApiAviso>(event, '/notices', {
    method: 'POST',
    body: {
      message: corpo?.mensagem,
      kind: corpo?.tipo ?? 'informacao',
      ...(corpo?.exibirEm ? { show_on: corpo.exibirEm } : {}),
    },
    requerSessao: true,
  })

  setResponseStatus(event, 201)
  return paraAviso(criado)
})
