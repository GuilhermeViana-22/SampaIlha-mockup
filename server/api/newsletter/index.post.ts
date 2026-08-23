import { chamarApi } from '../../utils/api'

interface ApiInscricao {
  message: string
  subscriber: { id: string, name: string, email: string, created_at: string }
}

export default defineEventHandler(async (event) => {
  const { nome, email } = await readBody<{ nome?: string, email?: string }>(event)

  const resposta = await chamarApi<ApiInscricao>(event, '/newsletter', {
    method: 'POST',
    body: { name: nome, email, source: 'portal' },
  })

  setResponseStatus(event, 201)
  return {
    ok: true,
    mensagem: resposta.message,
    inscricao: {
      id: resposta.subscriber.id,
      nome: resposta.subscriber.name,
      email: resposta.subscriber.email,
      criadoEm: resposta.subscriber.created_at,
    },
  }
})
