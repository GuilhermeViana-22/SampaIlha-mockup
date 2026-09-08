import { beforeEach, describe, expect, it, vi } from 'vitest'
import { criarEvento } from '../../../test/setup'
import { chamarApi } from '../../utils/api'
import obter from './[id].get'
import atualizar from './[id].put'
import excluir from './[id].delete'
import mudarStatus from './[id]/status.patch'
import alternarDestaque from './[id]/destaque.patch'

// Um mock só cobre as cinco rotas: o vitest identifica o módulo pelo arquivo
// resolvido, e `[id]/status.patch.ts` importa esse mesmo `server/utils/api.ts`
// por um caminho relativo mais fundo.
vi.mock('../../utils/api', () => ({
  chamarApi: vi.fn(),
  temSessao: vi.fn(() => true),
}))

const chamar = vi.mocked(chamarApi)

const guiaDaApi = {
  id: 'g-1',
  type: 'dica',
  status: 'publicado',
  title: 'Como chegar a Parintins',
  slug: 'como-chegar-a-parintins',
  excerpt: 'Barco, avião e mala.',
  content: 'Passo a passo',
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

const evento = (parcial = {}) => criarEvento({ params: { id: 'g-1' }, ...parcial })

describe('CRUD de um guia', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    chamar.mockResolvedValue(guiaDaApi)
  })

  describe('GET /api/guias/:id', () => {
    it('traz o guia completo, com o corpo do texto que a listagem não manda', async () => {
      const guia = await obter(evento())

      expect(chamar).toHaveBeenCalledWith(expect.anything(), '/posts/g-1', expect.anything())
      expect(guia.conteudo).toBe('Passo a passo')
    })
  })

  describe('PUT /api/guias/:id', () => {
    it('salva na API e mantém o conteúdo como dica', async () => {
      await atualizar(evento({ body: { titulo: 'Novo título', conteudo: 'Corpo' } }))

      expect(chamar).toHaveBeenCalledWith(expect.anything(), '/posts/g-1', expect.objectContaining({
        method: 'PUT',
        requerSessao: true,
        body: { type: 'dica', title: 'Novo título', content: 'Corpo' },
      }))
    })

    it('devolve o guia como o servidor o gravou', async () => {
      const guia = await atualizar(evento({ body: { titulo: 'Novo título' } }))

      // O painel exibe a resposta da API, não o que digitou: quem manda no
      // status e no slug final é o servidor.
      expect(guia).toMatchObject({ id: 'g-1', titulo: 'Como chegar a Parintins', status: 'publicado' })
    })
  })

  describe('DELETE /api/guias/:id', () => {
    it('apaga o post na API e confirma o id excluído', async () => {
      chamar.mockResolvedValue(undefined as any)

      const resposta = await excluir(evento())

      expect(chamar).toHaveBeenCalledWith(expect.anything(), '/posts/g-1', expect.objectContaining({
        method: 'DELETE',
        requerSessao: true,
      }))
      expect(resposta).toEqual({ ok: true, id: 'g-1' })
    })
  })

  describe('PATCH /api/guias/:id/status', () => {
    it('usa o endpoint de status — publicar não reenvia o texto', async () => {
      await mudarStatus(evento({ query: { status: 'publicado' } }))

      expect(chamar).toHaveBeenCalledWith(expect.anything(), '/posts/g-1/status', expect.objectContaining({
        method: 'PATCH',
        params: { status: 'publicado' },
        requerSessao: true,
      }))
    })

    it('entrega o status que a API decidiu, não o que foi pedido', async () => {
      chamar.mockResolvedValue({ ...guiaDaApi, status: 'em_revisao' })

      const guia = await mudarStatus(evento({ query: { status: 'publicado' } }))

      expect(guia.status).toBe('em_revisao')
    })
  })

  describe('PATCH /api/guias/:id/destaque', () => {
    it('alterna o destaque pelo endpoint dedicado', async () => {
      chamar.mockResolvedValue({ ...guiaDaApi, featured: true })

      const guia = await alternarDestaque(evento())

      expect(chamar).toHaveBeenCalledWith(expect.anything(), '/posts/g-1/featured', expect.objectContaining({
        method: 'PATCH',
        requerSessao: true,
      }))
      expect(guia.destaque).toBe(true)
    })
  })
})
