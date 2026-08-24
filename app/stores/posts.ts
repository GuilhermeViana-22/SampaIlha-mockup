import { defineStore } from 'pinia'
import type { Post, PostInput, PostStatus, PostTipo, RespostaLista } from '#shared/types/content'

export interface FiltrosPainel {
  busca: string
  tipo: PostTipo | 'todos'
  categoria: string | 'todas'
  status: PostStatus | 'todos'
  ordenar: 'recentes' | 'antigos' | 'lidos' | 'titulo'
}

export const filtrosPadrao = (): FiltrosPainel => ({
  busca: '',
  tipo: 'todos',
  categoria: 'todas',
  status: 'todos',
  ordenar: 'recentes',
})

/**
 * Fonte única dos conteúdos do portal (notícias, dicas e informações).
 * Usada pelo site público (leitura) e pelo dashboard (CRUD completo).
 */
export const usePostsStore = defineStore('posts', () => {
  const itens = ref<Post[]>([])
  const total = ref(0)
  const carregando = ref(false)
  const salvando = ref(false)
  const erro = ref<string | null>(null)
  const filtros = ref<FiltrosPainel>(filtrosPadrao())

  /** Lista filtrada no cliente — reflete os filtros do painel instantaneamente. */
  const listaFiltrada = computed(() => {
    const f = filtros.value
    const termo = f.busca.trim().toLowerCase()
    return itens.value.filter((post) => {
      if (f.tipo !== 'todos' && post.tipo !== f.tipo) return false
      if (f.status !== 'todos' && post.status !== f.status) return false
      if (f.categoria !== 'todas' && post.categoria !== f.categoria) return false
      if (termo && !`${post.titulo} ${post.resumo} ${post.autor} ${post.tags.join(' ')}`.toLowerCase().includes(termo)) return false
      return true
    }).sort((a, b) => {
      switch (f.ordenar) {
        case 'antigos': return a.publicadoEm.localeCompare(b.publicadoEm)
        case 'lidos': return b.leituras - a.leituras
        case 'titulo': return a.titulo.localeCompare(b.titulo, 'pt-BR')
        default: return b.publicadoEm.localeCompare(a.publicadoEm)
      }
    })
  })

  const porId = computed(() => (id: string) => itens.value.find(p => p.id === id))

  const contagem = computed(() => ({
    total: total.value,
    baixados: itens.value.length,
    publicados: itens.value.filter(p => p.status === 'publicado').length,
    rascunhos: itens.value.filter(p => p.status === 'rascunho').length,
    emRevisao: itens.value.filter(p => p.status === 'em_revisao').length,
    agendados: itens.value.filter(p => p.status === 'agendado').length,
    noticias: itens.value.filter(p => p.tipo === 'noticia').length,
    dicas: itens.value.filter(p => p.tipo === 'dica').length,
    informacoes: itens.value.filter(p => p.tipo === 'informacao').length,
    leituras: itens.value.reduce((soma, p) => soma + p.leituras, 0),
  }))

  const autores = computed(() => [...new Set(itens.value.map(p => p.autor))].sort())

  const paginaAtual = ref(1)
  const porPagina = 60

  /** Ainda há conteúdo no servidor além do que já foi baixado. */
  const temMais = computed(() => itens.value.length < total.value)

  async function carregar(params: Record<string, string | number | boolean | undefined> = {}) {
    carregando.value = true
    erro.value = null
    try {
      const resposta = await $fetch<RespostaLista<Post>>('/api/posts', {
        params: { status: 'todos', limite: porPagina, pagina: 1, ...params },
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      itens.value = resposta.itens
      total.value = resposta.total
      paginaAtual.value = 1
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Falha ao carregar os conteúdos.'
    }
    finally {
      carregando.value = false
    }
  }

  /** Acrescenta a próxima página à lista já carregada. */
  async function carregarMais() {
    if (!temMais.value || carregando.value) return
    carregando.value = true
    try {
      const resposta = await $fetch<RespostaLista<Post>>('/api/posts', {
        params: { status: 'todos', limite: porPagina, pagina: paginaAtual.value + 1 },
      })
      const novos = resposta.itens.filter(post => !itens.value.some(atual => atual.id === post.id))
      itens.value = [...itens.value, ...novos]
      total.value = resposta.total
      paginaAtual.value += 1
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Falha ao carregar mais conteúdos.'
    }
    finally {
      carregando.value = false
    }
  }

  async function criar(dados: Partial<PostInput>): Promise<Post | null> {
    salvando.value = true
    erro.value = null
    try {
      const post = await $fetch<Post>('/api/posts', { method: 'POST', body: dados })
      itens.value = [post, ...itens.value]
      return post
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Não foi possível criar o conteúdo.'
      return null
    }
    finally {
      salvando.value = false
    }
  }

  async function atualizar(id: string, dados: Partial<PostInput>): Promise<Post | null> {
    salvando.value = true
    erro.value = null
    try {
      const post = await $fetch<Post>(`/api/posts/${id}`, { method: 'PUT', body: dados })
      itens.value = itens.value.map(p => (p.id === id ? post : p))
      return post
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Não foi possível salvar as alterações.'
      return null
    }
    finally {
      salvando.value = false
    }
  }

  async function remover(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/posts/${id}`, { method: 'DELETE' })
      itens.value = itens.value.filter(p => p.id !== id)
      return true
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Não foi possível excluir o conteúdo.'
      return false
    }
  }

  /**
   * Muda o status direto da tabela (PATCH dedicado na API).
   *
   * A API tem a palavra final: um editor pedindo `publicado` recebe de volta
   * `em_revisao`, e é esse valor que entra na lista.
   */
  async function mudarStatus(post: Post, novo: PostStatus): Promise<Post | null> {
    try {
      const atualizado = await $fetch<Post>(`/api/posts/${post.id}/status`, {
        method: 'PATCH',
        params: { status: novo },
      })
      itens.value = itens.value.map(p => (p.id === post.id ? atualizado : p))
      return atualizado
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Não foi possível alterar o status.'
      return null
    }
  }

  /** Publica/despublica com um clique — o que o botão da tabela faz. */
  function alternarStatus(post: Post): Promise<Post | null> {
    return mudarStatus(post, post.status === 'publicado' ? 'rascunho' : 'publicado')
  }

  /** Editor manda o texto para a validação do editor-chefe. */
  function enviarParaRevisao(post: Post): Promise<Post | null> {
    return mudarStatus(post, 'em_revisao')
  }

  /** Editor-chefe aprova o que estava na fila. */
  function aprovar(post: Post): Promise<Post | null> {
    return mudarStatus(post, 'publicado')
  }

  /** Editor-chefe devolve para quem escreveu ajustar. */
  function devolver(post: Post): Promise<Post | null> {
    return mudarStatus(post, 'rascunho')
  }

  async function alternarDestaque(post: Post): Promise<Post | null> {
    try {
      const atualizado = await $fetch<Post>(`/api/posts/${post.id}/destaque`, { method: 'PATCH' })
      itens.value = itens.value.map(p => (p.id === post.id ? atualizado : p))
      return atualizado
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Não foi possível alterar o destaque.'
      return null
    }
  }

  /**
   * Busca o conteúdo completo para edição.
   *
   * Sempre vai à API: o item que está na lista vem do endpoint de listagem, que
   * não carrega o corpo do texto nem a galeria de fotos — abrir o formulário a
   * partir dele apagaria a matéria ao salvar.
   */
  async function buscarPorId(id: string): Promise<Post | null> {
    try {
      const completo = await $fetch<Post>(`/api/posts/${id}`, {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      itens.value = itens.value.map(p => (p.id === id ? completo : p))
      return completo
    }
    catch {
      return itens.value.find(p => p.id === id) ?? null
    }
  }

  function limparFiltros() {
    filtros.value = filtrosPadrao()
  }

  return {
    itens, total, carregando, salvando, erro, filtros, temMais,
    listaFiltrada, porId, contagem, autores,
    carregar, carregarMais, criar, atualizar, remover,
    mudarStatus, alternarStatus, enviarParaRevisao, aprovar, devolver, alternarDestaque,
    buscarPorId, limparFiltros,
  }
})
