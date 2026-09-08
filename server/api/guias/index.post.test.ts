import { beforeEach, describe, expect, it, vi } from 'vitest'
import { criarEvento } from '../../../test/setup'
import { chamarApi } from '../../utils/api'
import handler from './index.post'

vi.mock('../../utils/api', () => ({
  chamarApi: vi.fn(),
  temSessao: vi.fn(() => true),
}))

const chamar = vi.mocked(chamarApi)

const criadoNaApi = {
  id: 'g-novo',
  type: 'dica',
  status: 'rascunho',
  title: 'Guia de Teste',
  slug: 'guia-de-teste',
  excerpt: 'Resumo',
  content: 'Conteúdo',
  category: { slug: 'turismo', name: 'Turismo' },
  region: null,
  author_name: 'Autor Teste',
  icon: 'fas fa-lightbulb',
  cover: 'bg-1',
  image_url: null,
  featured: false,
  tags: ['turismo'],
  reading_time: 5,
  views: 0,
  published_at: '2026-09-08T10:00:00',
  updated_at: '2026-09-08T10:00:00',
  path: '/dicas/guia-de-teste',
}

const formulario = {
  status: 'rascunho',
  titulo: 'Guia de Teste',
  slug: 'guia-de-teste',
  resumo: 'Resumo',
  conteudo: 'Conteúdo',
  categoria: 'turismo',
  autor: 'Autor Teste',
  icone: 'fas fa-lightbulb',
  capa: 'bg-1',
  imagemUrl: null,
  destaque: false,
  tags: ['turismo'],
  tempoLeitura: 5,
}

describe('POST /api/guias', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    chamar.mockResolvedValue(criadoNaApi)
  })

  it('grava a dica na API — o guia sobrevive ao restart do contêiner', async () => {
    await handler(criarEvento({ body: formulario }))

    expect(chamar).toHaveBeenCalledWith(expect.anything(), '/posts', expect.objectContaining({
      method: 'POST',
      requerSessao: true,
      body: expect.objectContaining({ type: 'dica', title: 'Guia de Teste', category: 'turismo' }),
    }))
  })

  it('exige sessão: criar guia é ação de painel', async () => {
    await handler(criarEvento({ body: formulario }))

    const [, , opcoes] = chamar.mock.calls[0] as any
    expect(opcoes.requerSessao).toBe(true)
  })

  it('responde 201 com o guia já traduzido', async () => {
    const evento = criarEvento({ body: formulario })

    const guia = await handler(evento)

    expect(evento.status).toBe(201)
    expect(guia).toMatchObject({
      id: 'g-novo',
      titulo: 'Guia de Teste',
      caminho: '/dicas/guia-de-teste',
      leituras: 0,
    })
  })

  it('devolve o id do servidor — é ele que a tela de edição usa', async () => {
    const guia = await handler(criarEvento({ body: formulario }))

    expect(guia.id).toBe('g-novo')
  })

  it('não inventa corpo quando o POST chega vazio', async () => {
    await handler(criarEvento({ body: undefined }))

    const [, , opcoes] = chamar.mock.calls[0] as any
    expect(opcoes.body).toEqual({ type: 'dica' })
  })
})
