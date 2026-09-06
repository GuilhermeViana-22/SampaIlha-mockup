import type { PedidoSenha } from '../../../shared/types/content'
import type { ApiPedidoSenha } from '../../utils/redacao'
import { paraPedidoSenha } from '../../utils/redacao'
import { chamarApi } from '../../utils/api'

/** Avisa o editor-chefe de que esta pessoa precisa de uma senha nova. */
export default defineEventHandler(async (event): Promise<PedidoSenha> => {
  const corpo = await readBody<{ recado?: string }>(event)

  const pedido = await chamarApi<ApiPedidoSenha>(event, '/users/me/senha/solicitacao', {
    method: 'POST',
    body: { note: corpo?.recado?.trim() || null },
    requerSessao: true,
  })

  setResponseStatus(event, 201)
  return paraPedidoSenha(pedido)
})
