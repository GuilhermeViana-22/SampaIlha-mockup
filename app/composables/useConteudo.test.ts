import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import type { Post } from '#shared/types/content'
import { fetchFalso, useFetchFalso } from '../../test/setup'
import { useListaPaginada } from './useConteudo'

/** Post mínimo: a paginação só olha para o `id`. */
function post(id: number): Post {
  return { id: String(id), titulo: `Matéria ${id}` } as unknown as Post
}

/**
 * Primeira página, como o SSR entrega. `total` é o número real do servidor —
 * é a diferença entre ele e o tamanho da lista que o "Ver mais" existe para
 * cobrir.
 */
function primeiraPagina(itens: Post[], total: number) {
  const data = ref({ itens, total })
  const status = ref('success')
  useFetchFalso.mockReturnValue({ data, status, refresh: vi.fn() })
  return { data, status }
}

describe('useListaPaginada', () => {
  beforeEach(() => {
    fetchFalso.mockReset()
    useFetchFalso.mockReset()
  })

  it('mostra a primeira página e sabe que ainda falta conteúdo', async () => {
    primeiraPagina([post(1), post(2)], 5)

    const lista = await useListaPaginada('noticias', { tipo: 'noticia' }, 2)

    expect(lista.itens.value).toHaveLength(2)
    expect(lista.total.value).toBe(5)
    expect(lista.temMais.value).toBe(true)
  })

  it('acrescenta a página seguinte ao fim, sem trocar o que já está na tela', async () => {
    primeiraPagina([post(1), post(2)], 4)
    fetchFalso.mockResolvedValue({ itens: [post(3), post(4)], total: 4 })

    const lista = await useListaPaginada('noticias', { tipo: 'noticia' }, 2)
    await lista.carregarMais()

    expect(lista.itens.value.map(p => p.id)).toEqual(['1', '2', '3', '4'])
    expect(fetchFalso).toHaveBeenCalledWith('/api/posts', {
      params: { tipo: 'noticia', limite: 2, pagina: 2 },
    })
  })

  it('para de oferecer "ver mais" quando a lista alcança o total', async () => {
    primeiraPagina([post(1), post(2)], 3)
    fetchFalso.mockResolvedValue({ itens: [post(3)], total: 3 })

    const lista = await useListaPaginada('noticias', {}, 2)
    await lista.carregarMais()

    expect(lista.temMais.value).toBe(false)

    await lista.carregarMais()
    expect(fetchFalso).toHaveBeenCalledTimes(1)
  })

  it('não repete a matéria que a redação publicou entre um clique e outro', async () => {
    // A publicação nova empurrou a lista: o item 2 desceu para a página 2.
    primeiraPagina([post(1), post(2)], 4)
    fetchFalso.mockResolvedValue({ itens: [post(2), post(3)], total: 4 })

    const lista = await useListaPaginada('noticias', {}, 2)
    await lista.carregarMais()

    expect(lista.itens.value.map(p => p.id)).toEqual(['1', '2', '3'])
  })

  it('reinicia a contagem quando o filtro muda', async () => {
    primeiraPagina([post(1), post(2)], 6)
    fetchFalso.mockResolvedValue({ itens: [post(3), post(4)], total: 6 })

    const editoria = ref('cultura')
    const lista = await useListaPaginada('noticias', () => ({ categoria: editoria.value }), 2)
    await lista.carregarMais()
    expect(lista.itens.value).toHaveLength(4)

    editoria.value = 'esportes'
    await nextTick()

    // Só a página do SSR sobra; a página 2 de "cultura" não fica pendurada.
    expect(lista.itens.value).toHaveLength(2)

    await lista.carregarMais()
    expect(fetchFalso).toHaveBeenLastCalledWith('/api/posts', {
      params: { categoria: 'esportes', limite: 2, pagina: 2 },
    })
  })

  it('guarda o erro da página seguinte sem derrubar o que já foi carregado', async () => {
    primeiraPagina([post(1)], 3)
    fetchFalso.mockRejectedValue({ data: { statusMessage: 'API fora do ar' } })

    const lista = await useListaPaginada('noticias', {}, 1)
    await lista.carregarMais()

    expect(lista.erroMais.value).toBe('API fora do ar')
    expect(lista.itens.value).toHaveLength(1)
    expect(lista.temMais.value).toBe(true)
  })
})
