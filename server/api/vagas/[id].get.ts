import type { Vaga } from '../../../shared/types/vaga'
import type { ApiVaga } from '../../utils/vagas'
import { paraVaga } from '../../utils/vagas'
import { chamarApi } from '../../utils/api'

/** A vaga como o painel a edita — inclusive rascunho e encerrada. */
export default defineEventHandler(async (event): Promise<Vaga> => {
  const id = getRouterParam(event, 'id')!

  const vaga = await chamarApi<ApiVaga>(event, `/jobs/${id}`, { requerSessao: true })

  return paraVaga(vaga)
})
