import { chamarApi } from '../../../utils/api'

/**
 * Repassa o evento de leitura do navegador para a API.
 *
 * Encaminha o IP original: é dele, junto do user agent, que a API monta o
 * identificador anônimo do visitante para não contar a mesma pessoa duas vezes.
 */
export default defineEventHandler(async (event): Promise<{ registrada: boolean }> => {
  const id = getRouterParam(event, 'id')

  const encaminhado = getRequestHeader(event, 'x-forwarded-for')
    ?? getRequestIP(event, { xForwardedFor: true })
    ?? ''

  try {
    const resposta = await chamarApi<{ registered: boolean }>(event, `/posts/${id}/leitura`, {
      method: 'POST',
      headers: {
        ...(encaminhado ? { 'x-forwarded-for': encaminhado } : {}),
        'user-agent': getRequestHeader(event, 'user-agent') ?? '',
      },
    })
    return { registrada: resposta.registered }
  }
  catch {
    // Contagem de audiência nunca deve estourar na cara de quem está lendo.
    return { registrada: false }
  }
})
