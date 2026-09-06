import type { PedidoSenha } from '../../../shared/types/content'
import type { ApiPedidoSenha } from '../../utils/redacao'
import { paraPedidoSenha } from '../../utils/redacao'
import { chamarApi } from '../../utils/api'

/** A fila de quem espera senha nova — só o editor-chefe enxerga. */
export default defineEventHandler(async (event): Promise<PedidoSenha[]> => {
  const pedidos = await chamarApi<ApiPedidoSenha[]>(event, '/users/password-requests', {
    requerSessao: true,
  })
  return pedidos.map(paraPedidoSenha)
})
