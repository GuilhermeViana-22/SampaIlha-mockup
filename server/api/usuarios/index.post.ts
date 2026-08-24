import type { Usuario } from '../../../shared/types/content'
import type { ApiUsuario } from '../../utils/redacao'
import { paraPapelApi, paraUsuario } from '../../utils/redacao'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Usuario> => {
  const corpo = await readBody<Record<string, any>>(event)

  const criado = await chamarApi<ApiUsuario>(event, '/users', {
    method: 'POST',
    body: {
      name: corpo?.nome,
      email: corpo?.email,
      password: corpo?.senha,
      role: paraPapelApi(corpo?.papel) ?? 'editor',
      bio: corpo?.bio || null,
    },
    requerSessao: true,
  })

  setResponseStatus(event, 201)
  return paraUsuario(criado)
})
