import type { Usuario } from '../../../shared/types/content'
import type { ApiUsuario } from '../../utils/redacao'
import { paraPapelApi, paraUsuario } from '../../utils/redacao'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Usuario> => {
  const id = getRouterParam(event, 'id')
  const corpo = await readBody<Record<string, any>>(event)

  // Só sobe o que veio: um PUT parcial não deve apagar o resto do cadastro.
  const body: Record<string, unknown> = {}
  if (corpo?.nome !== undefined) body.name = corpo.nome
  if (corpo?.email !== undefined) body.email = corpo.email
  if (corpo?.papel !== undefined) body.role = paraPapelApi(corpo.papel)
  if (corpo?.bio !== undefined) body.bio = corpo.bio || null
  if (corpo?.ativo !== undefined) body.is_active = corpo.ativo
  if (corpo?.senha) body.password = corpo.senha

  const salvo = await chamarApi<ApiUsuario>(event, `/users/${id}`, {
    method: 'PUT',
    body,
    requerSessao: true,
  })

  return paraUsuario(salvo)
})
