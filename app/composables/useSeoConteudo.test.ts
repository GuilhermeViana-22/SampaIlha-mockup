import { describe, expect, it } from 'vitest'
import { IMAGEM_PADRAO, urlDaImagemSocial } from './useSeoConteudo'

/**
 * O robô do Facebook não executa JavaScript nem segue caminho relativo: ou a
 * URL da imagem sai completa no HTML, ou o card vai para o ar sem foto. É esse
 * contrato que se testa aqui.
 */
describe('urlDaImagemSocial', () => {
  const SITE = 'https://portalsampanailha.com.br'
  const API = 'https://api.portalsampanailha.com.br'

  it('mantém a foto que já vem absoluta da API', () => {
    const foto = `${API}/api/v1/uploads/posts/abc/foto.jpg`
    expect(urlDaImagemSocial(foto, SITE, API)).toBe(foto)
  })

  it('completa caminho relativo com o domínio da API, não com o do site', () => {
    expect(urlDaImagemSocial('/api/v1/uploads/posts/abc/foto.jpg', SITE, API))
      .toBe(`${API}/api/v1/uploads/posts/abc/foto.jpg`)
  })

  it('completa caminho sem barra inicial sem grudar os pedaços', () => {
    expect(urlDaImagemSocial('uploads/foto.jpg', SITE, API)).toBe(`${API}/uploads/foto.jpg`)
  })

  it('cai no card da marca quando a matéria não tem foto', () => {
    for (const vazio of [null, undefined, '', '   ']) {
      expect(urlDaImagemSocial(vazio, SITE, API)).toBe(`${SITE}${IMAGEM_PADRAO}`)
    }
  })
})
