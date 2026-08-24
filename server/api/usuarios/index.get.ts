import type { Usuario } from '../../../shared/types/content'
import type { ApiUsuario } from '../../utils/redacao'
import { paraUsuario } from '../../utils/redacao'
import { chamarApi } from '../../utils/api'

/** Quem tem acesso ao painel. A API recusa para quem não é editor-chefe. */
export default defineEventHandler(async (event): Promise<Usuario[]> => {
  const lista = await chamarApi<ApiUsuario[]>(event, '/users', { requerSessao: true })
  return lista.map(paraUsuario)
})
