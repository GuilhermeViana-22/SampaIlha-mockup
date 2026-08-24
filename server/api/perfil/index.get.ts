import type { Usuario } from '../../../shared/types/content'
import type { ApiUsuario } from '../../utils/redacao'
import { paraUsuario } from '../../utils/redacao'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Usuario> => {
  const perfil = await chamarApi<ApiUsuario>(event, '/users/me', { requerSessao: true })
  return paraUsuario(perfil)
})
