import { chamarApi, gravarAcesso, gravarRefresh } from '../../utils/api'

interface RespostaLogin {
  access_token: string
  refresh_token: string
  expires_in: number
}

interface RespostaMe {
  id: string
  name: string
  email: string
  role: string
}

/** Login do painel: autentica na API Python e guarda os tokens em cookie httpOnly. */
export default defineEventHandler(async (event) => {
  const { email, senha, lembrar } = await readBody<{ email?: string, senha?: string, lembrar?: boolean }>(event)

  if (!email || !senha) {
    throw createError({ statusCode: 422, statusMessage: 'Informe e-mail e senha.' })
  }

  const tokens = await chamarApi<RespostaLogin>(event, '/auth/login', {
    method: 'POST',
    body: { email, password: senha },
  })

  gravarAcesso(event, tokens.access_token, tokens.expires_in)
  gravarRefresh(event, tokens.refresh_token, lembrar ? 7 : 1)

  // Token passado direto: o cookie só existirá na próxima requisição.
  const perfil = await chamarApi<RespostaMe>(event, '/auth/me', { token: tokens.access_token })

  return {
    usuario: {
      id: perfil.id,
      nome: perfil.name,
      email: perfil.email,
      papel: perfil.role === 'admin' ? 'editor-chefe' : 'editor',
    },
  }
})
