import type { Vaga } from '../../../shared/types/vaga'
import type { ApiVaga } from '../../utils/vagas'
import { paraPayloadVaga, paraVaga } from '../../utils/vagas'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Vaga> => {
  const id = getRouterParam(event, 'id')!
  const corpo = await readBody<Record<string, unknown>>(event)

  const atualizada = await chamarApi<ApiVaga>(event, `/jobs/${id}`, {
    method: 'PUT',
    body: paraPayloadVaga(corpo ?? {}),
    requerSessao: true,
  })

  return paraVaga(atualizada)
})
