import type { Tema } from '../../../shared/types/tema'
import { normalizarTema } from '../../../shared/types/tema'
import { chamarApi } from '../../utils/api'
import { daApi, paraApi } from '../../utils/tema'

/** Grava o tema. Só administrador — a API valida o papel do token. */
export default defineEventHandler(async (event): Promise<Tema> => {
  const corpo = await readBody<Partial<Tema>>(event)

  return daApi(await chamarApi(event, '/settings/theme', {
    method: 'PUT',
    body: paraApi(normalizarTema(corpo)),
    requerSessao: true,
  }))
})
