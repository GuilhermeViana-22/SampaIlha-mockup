import { beforeEach, describe, expect, it, vi } from 'vitest'
import { criarEvento } from '../../../test/setup'
import { chamarApi, temSessao } from '../../utils/api'
import handler from './index.get'

vi.mock('../../utils/api', () => ({
  chamarApi: vi.fn(),
  temSessao: vi.fn(() => false),
}))

const chamar = vi.mocked(chamarApi)
const sessao = vi.mocked(temSessao)

function respostaDaApi(items: any[] = [], total = items.length) {
  return { items, pagination: { total } }
}

const dicaDaApi = {
  id: 'g-1',
  type: 'dica',
  status: 'publicado',
  title: 'Como chegar a Parintins',
  slug: 'como-chegar-a-parintins',
  excerpt: 'Barco, avião e mala.',
  category: { slug: 'turismo', name: 'Turismo' },
  region: null,
  author_name: 'Redação Portal',
  icon: 'fas fa-lightbulb',
  cover: 'bg-3',
  image_url: null,
  featured: false,
  tags: [],
  reading_time: 7,
  views: 142,
  published_at: '2026-08-01T12:00:00',
  updated_at: '2026-08-01T12:00:00',
  path: '/dicas/como-chegar-a-parintins',
}

describe('GET /api/guias', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessao.mockReturnValue(false)
  })

  it('busca as dicas na API do portal, e não numa lista em memória', async () => {
    chamar.mockResolvedValue(respostaDaApi([dicaDaApi]))

    const resposta = await handler(criarEvento())

    expect(chamar).toHaveBeenCalledWith(expect.anything(), '/posts', expect.objectContaining({
      params: expect.objectContaining({ type: 'dica' }),
    }))
    expect(resposta.total).toBe(1)
    expect(resposta.itens[0]).toMatchObject({ id: 'g-1', titulo: 'Como chegar a Parintins' })
  })

  it('devolve o envelope { itens, total } que a store espera', async () => {
    chamar.mockResolvedValue(respostaDaApi([dicaDaApi], 37))

    const resposta = await handler(criarEvento())

    expect(Object.keys(resposta).sort()).toEqual(['itens', 'total'])
    // O total é o do servidor, não o tamanho da página baixada.
    expect(resposta.total).toBe(37)
  })

  it('repassa os filtros do painel para a API', async () => {
    sessao.mockReturnValue(true)
    chamar.mockResolvedValue(respostaDaApi())

    await handler(criarEvento({
      query: { pagina: 2, limite: 60, status: 'rascunho', categoria: 'turismo', busca: 'ilha', ordenar: 'lidos' },
    }))

    expect(chamar).toHaveBeenCalledWith(expect.anything(), '/posts', expect.objectContaining({
      auth: true,
      params: expect.objectContaining({
        page: 2,
        limit: 60,
        type: 'dica',
        status: 'rascunho',
        category: 'turismo',
        search: 'ilha',
        order: 'lidos',
      }),
    }))
  })

  it('não manda token — nem pede rascunho — para o visitante do site', async () => {
    chamar.mockResolvedValue(respostaDaApi())

    await handler(criarEvento({ query: { status: 'rascunho' } }))

    const [, , opcoes] = chamar.mock.calls[0] as any
    expect(opcoes.auth).toBe(false)
    expect(opcoes.params.status).toBeUndefined()
  })

  it('propaga a falha da API em vez de devolver lista vazia', async () => {
    chamar.mockRejectedValue(new Error('API fora do ar'))

    await expect(handler(criarEvento())).rejects.toThrow('API fora do ar')
  })
})
