import type { Vaga } from '../../../shared/types/vaga'
import type { ApiVaga } from '../../utils/vagas'
import { paraPayloadVaga, paraVaga } from '../../utils/vagas'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Vaga> => {
  const corpo = await readBody<Record<string, unknown>>(event)

  const criada = await chamarApi<ApiVaga>(event, '/jobs', {
    method: 'POST',
    body: paraPayloadVaga(corpo ?? {}),
    requerSessao: true,
  })

  setResponseStatus(event, 201)
  return paraVaga(criada)
})
