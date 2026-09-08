import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Guia } from '#shared/types/content'
import { fetchFalso } from '../../test/setup'
import { filtrosPadraoGuias, useGuiasStore } from './guias'

/**
 * A store é a fonte única dos guias no painel: a tabela, os filtros e o
 * formulário leem daqui. O que se testa é o contrato com `/api/guias` (qual
 * rota, com que corpo) e o estado que sobra depois de cada operação — não a
 * lógica reescrita dentro do teste.
 */

function guia(sobrescreve: Partial<Guia> = {}): Guia {
  return {
    id: 'g-1',
    status: 'publicado',
    titulo: 'Como chegar a Parintins',
    slug: 'como-chegar-a-parintins',
    resumo: 'Barco, avião e mala.',
    conteudo: 'Passo a passo',
    categoria: 'turismo',
    categoriaNome: 'Turismo',
    autor: 'Redação Portal',
    icone: 'fas fa-lightbulb',
    capa: 'bg-3',
    imagemUrl: null,
    destaque: false,
    tags: ['turismo'],
    leituras: 142,
    tempoLeitura: 7,
    publicadoEm: '2026-08-01T12:00:00',
    atualizadoEm: '2026-08-01T12:00:00',
    caminho: '/dicas/como-chegar-a-parintins',
    ...sobrescreve,
  }
}

describe('store de guias', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchFalso.mockReset()
  })

  describe('carregar', () => {
    it('baixa a listagem e guarda o total do servidor', async () => {
      fetchFalso.mockResolvedValue({ itens: [guia()], total: 42 })
      const guias = useGuiasStore()

      await guias.carregar()

      expect(fetchFalso).toHaveBeenCalledWith('/api/guias', expect.objectContaining({
        params: expect.objectContaining({ status: 'todos', pagina: 1 }),
      }))
      expect(guias.itens).toHaveLength(1)
      expect(guias.total).toBe(42)
      expect(guias.carregando).toBe(false)
    })

    it('guarda a mensagem da API quando a listagem falha', async () => {
      fetchFalso.mockRejectedValue({ data: { statusMessage: 'Sessão expirada.' } })
      const guias = useGuiasStore()

      await guias.carregar()

      expect(guias.erro).toBe('Sessão expirada.')
      expect(guias.carregando).toBe(false)
    })

    it('carregarMais acrescenta a próxima página sem duplicar o que já veio', async () => {
      const guias = useGuiasStore()
      fetchFalso.mockResolvedValue({ itens: [guia({ id: 'g-1' })], total: 2 })
      await guias.carregar()

      fetchFalso.mockResolvedValue({ itens: [guia({ id: 'g-1' }), guia({ id: 'g-2' })], total: 2 })
      await guias.carregarMais()

      expect(guias.itens.map(g => g.id)).toEqual(['g-1', 'g-2'])
      expect(guias.temMais).toBe(false)
    })
  })

  describe('criar', () => {
    it('manda o formulário para /api/guias e põe o guia no topo da lista', async () => {
      const guias = useGuiasStore()
      fetchFalso.mockResolvedValue({ itens: [guia({ id: 'g-1' })], total: 1 })
      await guias.carregar()

      fetchFalso.mockResolvedValue(guia({ id: 'g-2', titulo: 'Novo guia' }))
      const criado = await guias.criar({ titulo: 'Novo guia' } as any)

      expect(fetchFalso).toHaveBeenLastCalledWith('/api/guias', {
        method: 'POST',
        body: { titulo: 'Novo guia' },
      })
      expect(criado?.id).toBe('g-2')
      expect(guias.itens.map(g => g.id)).toEqual(['g-2', 'g-1'])
    })

    it('devolve null e explica a falha em vez de fingir que salvou', async () => {
      fetchFalso.mockRejectedValue({ data: { statusMessage: 'Slug já usado.' } })
      const guias = useGuiasStore()

      const criado = await guias.criar({ titulo: 'Novo guia' } as any)

      expect(criado).toBeNull()
      expect(guias.erro).toBe('Slug já usado.')
      expect(guias.itens).toHaveLength(0)
      expect(guias.salvando).toBe(false)
    })
  })

  describe('atualizar', () => {
    it('substitui o item pela versão que voltou do servidor', async () => {
      const guias = useGuiasStore()
      fetchFalso.mockResolvedValue({ itens: [guia()], total: 1 })
      await guias.carregar()

      fetchFalso.mockResolvedValue(guia({ titulo: 'Título corrigido' }))
      await guias.atualizar('g-1', { titulo: 'Título corrigido' } as any)

      expect(fetchFalso).toHaveBeenLastCalledWith('/api/guias/g-1', {
        method: 'PUT',
        body: { titulo: 'Título corrigido' },
      })
      expect(guias.itens[0]!.titulo).toBe('Título corrigido')
    })
  })

  describe('remover', () => {
    it('tira o guia da lista quando a API confirma', async () => {
      const guias = useGuiasStore()
      fetchFalso.mockResolvedValue({ itens: [guia({ id: 'g-1' }), guia({ id: 'g-2' })], total: 2 })
      await guias.carregar()

      fetchFalso.mockResolvedValue({ ok: true, id: 'g-1' })
      const excluiu = await guias.remover('g-1')

      expect(fetchFalso).toHaveBeenLastCalledWith('/api/guias/g-1', { method: 'DELETE' })
      expect(excluiu).toBe(true)
      expect(guias.itens.map(g => g.id)).toEqual(['g-2'])
    })

    it('mantém o guia na lista se a exclusão falhar', async () => {
      const guias = useGuiasStore()
      fetchFalso.mockResolvedValue({ itens: [guia()], total: 1 })
      await guias.carregar()

      fetchFalso.mockRejectedValue({ data: { statusMessage: 'Sem permissão.' } })
      const excluiu = await guias.remover('g-1')

      expect(excluiu).toBe(false)
      expect(guias.itens).toHaveLength(1)
      expect(guias.erro).toBe('Sem permissão.')
    })
  })

  describe('status e destaque', () => {
    it('publica pelo PATCH de status, sem reenviar o texto do guia', async () => {
      const guias = useGuiasStore()
      fetchFalso.mockResolvedValue({ itens: [guia({ status: 'rascunho' })], total: 1 })
      await guias.carregar()

      fetchFalso.mockResolvedValue(guia({ status: 'publicado' }))
      await guias.alternarStatus(guias.itens[0]!)

      expect(fetchFalso).toHaveBeenLastCalledWith('/api/guias/g-1/status', {
        method: 'PATCH',
        params: { status: 'publicado' },
      })
      expect(guias.itens[0]!.status).toBe('publicado')
    })

    it('aceita o status que a API impôs — editor não publica sozinho', async () => {
      const guias = useGuiasStore()
      fetchFalso.mockResolvedValue({ itens: [guia({ status: 'rascunho' })], total: 1 })
      await guias.carregar()

      fetchFalso.mockResolvedValue(guia({ status: 'em_revisao' }))
      const atualizado = await guias.alternarStatus(guias.itens[0]!)

      expect(atualizado?.status).toBe('em_revisao')
      expect(guias.itens[0]!.status).toBe('em_revisao')
    })

    it('despublica o que estava no ar', async () => {
      const guias = useGuiasStore()
      fetchFalso.mockResolvedValue({ itens: [guia({ status: 'publicado' })], total: 1 })
      await guias.carregar()

      fetchFalso.mockResolvedValue(guia({ status: 'rascunho' }))
      await guias.alternarStatus(guias.itens[0]!)

      expect(fetchFalso).toHaveBeenLastCalledWith('/api/guias/g-1/status', {
        method: 'PATCH',
        params: { status: 'rascunho' },
      })
    })

    it('alterna o destaque pelo PATCH dedicado', async () => {
      const guias = useGuiasStore()
      fetchFalso.mockResolvedValue({ itens: [guia()], total: 1 })
      await guias.carregar()

      fetchFalso.mockResolvedValue(guia({ destaque: true }))
      await guias.alternarDestaque(guias.itens[0]!)

      expect(fetchFalso).toHaveBeenLastCalledWith('/api/guias/g-1/destaque', { method: 'PATCH' })
      expect(guias.itens[0]!.destaque).toBe(true)
    })
  })

  describe('buscarPorId', () => {
    it('sempre busca a versão completa na API', async () => {
      const guias = useGuiasStore()
      fetchFalso.mockResolvedValue({ itens: [guia({ conteudo: '' })], total: 1 })
      await guias.carregar()

      fetchFalso.mockResolvedValue(guia({ conteudo: 'Corpo completo' }))
      const completo = await guias.buscarPorId('g-1')

      expect(completo?.conteudo).toBe('Corpo completo')
      expect(guias.itens[0]!.conteudo).toBe('Corpo completo')
    })

    it('cai para o item já baixado quando a API não responde', async () => {
      const guias = useGuiasStore()
      fetchFalso.mockResolvedValue({ itens: [guia()], total: 1 })
      await guias.carregar()

      fetchFalso.mockRejectedValue(new Error('offline'))

      expect((await guias.buscarPorId('g-1'))?.id).toBe('g-1')
      expect(await guias.buscarPorId('inexistente')).toBeNull()
    })
  })

  describe('filtros do painel', () => {
    beforeEach(async () => {
      fetchFalso.mockResolvedValue({
        itens: [
          guia({ id: 'g-1', titulo: 'Parintins', status: 'publicado', categoria: 'turismo', leituras: 10, publicadoEm: '2026-08-01T12:00:00' }),
          guia({ id: 'g-2', titulo: 'Anhembi', status: 'rascunho', categoria: 'cultura', leituras: 90, publicadoEm: '2026-08-05T12:00:00', tags: ['boi'] }),
          guia({ id: 'g-3', titulo: 'Bumbá', status: 'em_revisao', categoria: 'cultura', leituras: 50, publicadoEm: '2026-07-01T12:00:00' }),
        ],
        total: 3,
      })
      await useGuiasStore().carregar()
    })

    it('filtra por status, inclusive os que só a API produz', () => {
      const guias = useGuiasStore()

      guias.filtros.status = 'em_revisao'

      expect(guias.listaFiltrada.map(g => g.id)).toEqual(['g-3'])
    })

    it('filtra por categoria', () => {
      const guias = useGuiasStore()

      guias.filtros.categoria = 'cultura'

      expect(guias.listaFiltrada.map(g => g.id).sort()).toEqual(['g-2', 'g-3'])
    })

    it('busca por título, autor e tag', () => {
      const guias = useGuiasStore()

      guias.filtros.busca = 'parintins'
      expect(guias.listaFiltrada.map(g => g.id)).toEqual(['g-1'])

      guias.filtros.busca = 'boi'
      expect(guias.listaFiltrada.map(g => g.id)).toEqual(['g-2'])
    })

    it('ordena por data, leitura e título', () => {
      const guias = useGuiasStore()

      expect(guias.listaFiltrada.map(g => g.id)).toEqual(['g-2', 'g-1', 'g-3'])

      guias.filtros.ordenar = 'antigos'
      expect(guias.listaFiltrada.map(g => g.id)).toEqual(['g-3', 'g-1', 'g-2'])

      guias.filtros.ordenar = 'lidos'
      expect(guias.listaFiltrada.map(g => g.id)).toEqual(['g-2', 'g-3', 'g-1'])

      guias.filtros.ordenar = 'titulo'
      expect(guias.listaFiltrada.map(g => g.titulo)).toEqual(['Anhembi', 'Bumbá', 'Parintins'])
    })

    it('conta os guias por status para os cartões do topo', () => {
      const guias = useGuiasStore()

      expect(guias.contagem).toMatchObject({
        total: 3,
        publicados: 1,
        rascunhos: 1,
        emRevisao: 1,
        leituras: 150,
      })
    })

    it('limparFiltros devolve a listagem inteira', () => {
      const guias = useGuiasStore()
      guias.filtros.status = 'rascunho'
      guias.filtros.busca = 'parintins'

      guias.limparFiltros()

      expect(guias.filtros).toEqual(filtrosPadraoGuias())
      expect(guias.listaFiltrada).toHaveLength(3)
    })
  })
})
