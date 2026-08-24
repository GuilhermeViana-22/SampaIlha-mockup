import type { Usuario } from '../../../shared/types/content'
import type { ApiUsuario } from '../../utils/redacao'
import { paraUsuario } from '../../utils/redacao'
import { chamarApi } from '../../utils/api'

/** Nome e bio. Papel não passa por aqui: ninguém se promove. */
export default defineEventHandler(async (event): Promise<Usuario> => {
  const corpo = await readBody<{ nome?: string, bio?: string }>(event)

  const salvo = await chamarApi<ApiUsuario>(event, '/users/me', {
    method: 'PUT',
    body: { name: corpo?.nome, bio: corpo?.bio ?? null },
    requerSessao: true,
  })

  return paraUsuario(salvo)
})
