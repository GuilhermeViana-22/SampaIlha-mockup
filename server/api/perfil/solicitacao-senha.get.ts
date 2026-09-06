import type { PedidoSenha } from '../../../shared/types/content'
import type { ApiPedidoSenha } from '../../utils/redacao'
import { paraPedidoSenha } from '../../utils/redacao'
import { chamarApi } from '../../utils/api'

/** O pedido de senha em aberto de quem está logado, ou nada. */
export default defineEventHandler(async (event): Promise<PedidoSenha | null> => {
  const pedido = await chamarApi<ApiPedidoSenha | null>(event, '/users/me/senha/solicitacao', {
    requerSessao: true,
  })
  return pedido ? paraPedidoSenha(pedido) : null
})
