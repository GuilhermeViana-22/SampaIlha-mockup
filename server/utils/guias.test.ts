import { describe, expect, it } from 'vitest'
import type { ApiPost } from './adaptadores'
import { paraGuia, paraPayloadGuia, paramsListagemGuias } from './guias'

/**
 * O guia é um post de `type=dica`. Estes testes travam a tradução entre o
 * contrato da API (inglês, snake_case) e o vocabulário do painel — é onde um
 * campo renomeado na API deixaria de chegar à tela sem ninguém perceber.
 */

function apiGuia(sobrescreve: Partial<ApiPost> = {}): ApiPost {
  return {
    id: 'g-1',
    type: 'dica',
    status: 'publicado',
    title: 'Como chegar a Parintins',
    slug: 'como-chegar-a-parintins',
    excerpt: 'Barco, avião e o que levar na mala.',
    content: '<p>Passo a passo</p>',
    category: { slug: 'turismo', name: 'Turismo', icon: 'fas fa-map', color: 'cyan' },
    region: null,
    author_name: 'Redação Portal',
    icon: 'fas fa-lightbulb',
    cover: 'bg-3',
    image_url: '/api/v1/uploads/guias/parintins.jpg',
    featured: true,
    tags: ['turismo', 'parintins'],
    reading_time: 7,
    views: 142,
    published_at: '2026-08-01T12:00:00',
    updated_at: '2026-08-02T09:30:00',
    path: '/dicas/como-chegar-a-parintins',
    ...sobrescreve,
  }
}

describe('paraGuia', () => {
  it('traduz o post da API para o modelo do painel', () => {
    const guia = paraGuia(apiGuia())

    expect(guia).toMatchObject({
      id: 'g-1',
      status: 'publicado',
      titulo: 'Como chegar a Parintins',
      slug: 'como-chegar-a-parintins',
      resumo: 'Barco, avião e o que levar na mala.',
      conteudo: '<p>Passo a passo</p>',
      categoria: 'turismo',
      categoriaNome: 'Turismo',
      autor: 'Redação Portal',
      icone: 'fas fa-lightbulb',
      capa: 'bg-3',
      destaque: true,
      tags: ['turismo', 'parintins'],
      leituras: 142,
      tempoLeitura: 7,
      publicadoEm: '2026-08-01T12:00:00',
      atualizadoEm: '2026-08-02T09:30:00',
    })
  })

  it('devolve a imagem como URL absoluta, pronta para o <img>', () => {
    expect(paraGuia(apiGuia()).imagemUrl).toBe('http://api.teste/api/v1/uploads/guias/parintins.jpg')
  })

  it('usa o caminho público que a API calculou — a dica vive em /dicas', () => {
    expect(paraGuia(apiGuia()).caminho).toBe('/dicas/como-chegar-a-parintins')
  })

  it('aceita guia sem resumo, sem corpo e sem imagem', () => {
    const guia = paraGuia(apiGuia({ excerpt: null, content: undefined, image_url: null }))

    expect(guia.resumo).toBe('')
    expect(guia.conteudo).toBe('')
    expect(guia.imagemUrl).toBeNull()
  })

  it('preserva os status que só a API produz', () => {
    expect(paraGuia(apiGuia({ status: 'rascunho' })).status).toBe('rascunho')
    expect(paraGuia(apiGuia({ status: 'agendado' as ApiPost['status'] })).status).toBe('agendado')
  })
})

describe('paraPayloadGuia', () => {
  it('marca o conteúdo como dica — o painel de guias não edita notícia', () => {
    expect(paraPayloadGuia({ titulo: 'Guia' }).type).toBe('dica')
  })

  it('traduz os campos do formulário para o contrato da API', () => {
    const payload = paraPayloadGuia({
      status: 'publicado',
      titulo: 'Guia',
      slug: 'guia',
      resumo: 'Resumo',
      conteudo: 'Corpo',
      categoria: 'turismo',
      autor: 'Redação',
      icone: 'fas fa-lightbulb',
      capa: 'bg-1',
      destaque: false,
      tags: ['a'],
      tempoLeitura: 4,
      publicadoEm: '2026-08-01T12:00:00.000Z',
    })

    expect(payload).toEqual({
      type: 'dica',
      status: 'publicado',
      title: 'Guia',
      slug: 'guia',
      excerpt: 'Resumo',
      content: 'Corpo',
      category: 'turismo',
      author_name: 'Redação',
      icon: 'fas fa-lightbulb',
      cover: 'bg-1',
      featured: false,
      tags: ['a'],
      reading_time: 4,
      published_at: '2026-08-01T12:00:00.000Z',
    })
  })

  it('descarta o que é do servidor, mesmo quando a tela reenvia o guia inteiro', () => {
    // A tabela manda o objeto inteiro ao alternar destaque/status.
    const payload = paraPayloadGuia({
      id: 'g-1',
      titulo: 'Guia',
      categoriaNome: 'Turismo',
      leituras: 999,
      caminho: '/dicas/guia',
      atualizadoEm: '2026-08-02T09:30:00',
    })

    expect(payload).toEqual({ type: 'dica', title: 'Guia' })
  })

  it('devolve a imagem ao caminho relativo antes de gravar', () => {
    const payload = paraPayloadGuia({ imagemUrl: 'http://api.teste/api/v1/uploads/g.jpg' })

    // Guardar o host do ambiente quebraria a foto quando o portal mudasse de domínio.
    expect(payload.image_url).toBe('/api/v1/uploads/g.jpg')
  })
})

describe('paramsListagemGuias', () => {
  it('pede sempre e só dicas', () => {
    expect(paramsListagemGuias({}, false).type).toBe('dica')
  })

  it('ignora o filtro de status de quem não está autenticado', () => {
    // Sem token a API devolve apenas o publicado; pedir rascunho seria um 403.
    expect(paramsListagemGuias({ status: 'rascunho' }, false).status).toBeUndefined()
    expect(paramsListagemGuias({ status: 'rascunho' }, true).status).toBe('rascunho')
  })

  it('trata "todos" e "todas" como ausência de filtro', () => {
    const params = paramsListagemGuias({ status: 'todos', categoria: 'todas' }, true)

    expect(params.status).toBeUndefined()
    expect(params.category).toBeUndefined()
  })

  it('repassa paginação, busca e ordenação com os padrões da API', () => {
    expect(paramsListagemGuias({}, true)).toMatchObject({ page: 1, limit: 20, order: 'recentes' })

    expect(paramsListagemGuias({ pagina: 3, limite: 60, busca: 'parintins', ordenar: 'lidos' }, true))
      .toMatchObject({ page: 3, limit: 60, search: 'parintins', order: 'lidos' })
  })

  it('converte o destaque para booleano — a query string chega como texto', () => {
    expect(paramsListagemGuias({ destaque: 'true' }, true).featured).toBe(true)
    expect(paramsListagemGuias({ destaque: 'false' }, true).featured).toBe(false)
    expect(paramsListagemGuias({}, true).featured).toBeUndefined()
  })
})
