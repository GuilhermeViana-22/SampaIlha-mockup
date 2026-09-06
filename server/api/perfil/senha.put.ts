import { chamarApi, gravarAcesso, gravarRefresh } from '../../utils/api'

interface RespostaTroca {
  access_token: string
  refresh_token: string
  expires_in: number
}

/**
 * Troca a senha de quem está logado.
 *
 * A API derruba todas as sessões da pessoa e devolve um par de tokens novo,
 * para o aparelho que trocou. Regravar os cookies aqui é o que faz este
 * navegador seguir dentro enquanto os outros caem — sem isso, quem trocou seria
 * deslogado junto e teria de entrar de novo com a senha recém-criada.
 */
export default defineEventHandler(async (event) => {
  const corpo = await readBody<{ senhaAtual: string, novaSenha: string }>(event)

  const tokens = await chamarApi<RespostaTroca>(event, '/users/me/senha', {
    method: 'PUT',
    body: { current_password: corpo?.senhaAtual, new_password: corpo?.novaSenha },
    requerSessao: true,
  })

  gravarAcesso(event, tokens.access_token, tokens.expires_in)
  // A escolha de "manter conectado" do login não fica gravada em lugar nenhum;
  // aqui vale o teto do refresh na API, que é o padrão de `gravarRefresh`.
  gravarRefresh(event, tokens.refresh_token)

  setResponseStatus(event, 204)
  return null
})
