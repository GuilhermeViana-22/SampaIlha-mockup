import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const corpo = await readBody<{ senhaAtual: string, novaSenha: string }>(event)

  await chamarApi(event, '/users/me/senha', {
    method: 'PUT',
    body: { current_password: corpo?.senhaAtual, new_password: corpo?.novaSenha },
    requerSessao: true,
  })

  setResponseStatus(event, 204)
  return null
})
