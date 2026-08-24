import { defineStore } from 'pinia'
import type { NovoUsuario, PapelUsuario, Usuario } from '#shared/types/content'

/**
 * Equipe da redação e perfil de quem está logado.
 *
 * A lista de pessoas só carrega para o editor-chefe — a API recusa para os
 * demais, e a tela nem oferece o caminho.
 */
export interface FiltrosEquipe {
  busca: string
  papel: PapelUsuario | 'todos'
  situacao: 'todas' | 'ativos' | 'inativos'
}

function filtrosPadrao(): FiltrosEquipe {
  return { busca: '', papel: 'todos', situacao: 'todas' }
}

export const useRedacaoStore = defineStore('redacao', () => {
  const equipe = ref<Usuario[]>([])
  const perfil = ref<Usuario | null>(null)
  const carregando = ref(false)
  const salvando = ref(false)
  const filtros = ref<FiltrosEquipe>(filtrosPadrao())

  /** Filtra no cliente: a equipe é curta e a lista responde na hora. */
  const listaFiltrada = computed(() => {
    const f = filtros.value
    const termo = f.busca.trim().toLowerCase()
    return equipe.value.filter((pessoa) => {
      if (f.papel !== 'todos' && pessoa.papel !== f.papel) return false
      if (f.situacao === 'ativos' && pessoa.ativo === false) return false
      if (f.situacao === 'inativos' && pessoa.ativo !== false) return false
      if (termo && !`${pessoa.nome} ${pessoa.email}`.toLowerCase().includes(termo)) return false
      return true
    })
  })

  const temFiltro = computed(() => {
    const f = filtros.value
    return !!f.busca || f.papel !== 'todos' || f.situacao !== 'todas'
  })

  function limparFiltros() {
    filtros.value = filtrosPadrao()
  }

  const contagem = computed(() => ({
    total: equipe.value.length,
    chefes: equipe.value.filter(p => p.papel === 'editor-chefe').length,
    editores: equipe.value.filter(p => p.papel === 'editor').length,
    inativos: equipe.value.filter(p => p.ativo === false).length,
  }))

  function mensagem(e: any, padrao: string): string {
    return e?.data?.data?.error?.message || e?.data?.statusMessage || e?.statusMessage || padrao
  }

  async function carregarEquipe(forcar = false) {
    if (equipe.value.length && !forcar) return
    carregando.value = true
    try {
      equipe.value = await $fetch<Usuario[]>('/api/usuarios', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
    }
    finally {
      carregando.value = false
    }
  }

  async function carregarPerfil(forcar = false) {
    if (perfil.value && !forcar) return perfil.value
    perfil.value = await $fetch<Usuario>('/api/perfil', {
      headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
    })
    return perfil.value
  }

  async function criar(dados: NovoUsuario) {
    salvando.value = true
    try {
      const criado = await $fetch<Usuario>('/api/usuarios', { method: 'POST', body: dados })
      equipe.value = [...equipe.value, criado]
      return criado
    }
    catch (e: any) {
      throw new Error(mensagem(e, 'Não foi possível abrir o acesso.'))
    }
    finally {
      salvando.value = false
    }
  }

  async function atualizar(id: string, dados: Partial<NovoUsuario> & { ativo?: boolean }) {
    salvando.value = true
    try {
      const salvo = await $fetch<Usuario>(`/api/usuarios/${id}`, { method: 'PUT', body: dados })
      equipe.value = equipe.value.map(u => (u.id === id ? salvo : u))
      return salvo
    }
    catch (e: any) {
      throw new Error(mensagem(e, 'Não foi possível salvar as alterações.'))
    }
    finally {
      salvando.value = false
    }
  }

  async function remover(id: string) {
    try {
      await $fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
      equipe.value = equipe.value.filter(u => u.id !== id)
    }
    catch (e: any) {
      throw new Error(mensagem(e, 'Não foi possível remover o acesso.'))
    }
  }

  async function salvarPerfil(dados: { nome?: string, bio?: string }) {
    salvando.value = true
    try {
      perfil.value = await $fetch<Usuario>('/api/perfil', { method: 'PUT', body: dados })
      // O nome aparece no topo do painel: mantém as duas telas em sincronia.
      const auth = useAuthStore()
      if (auth.usuario && dados.nome) auth.usuario.nome = dados.nome
      return perfil.value
    }
    catch (e: any) {
      throw new Error(mensagem(e, 'Não foi possível salvar o perfil.'))
    }
    finally {
      salvando.value = false
    }
  }

  async function trocarSenha(senhaAtual: string, novaSenha: string) {
    salvando.value = true
    try {
      await $fetch('/api/perfil/senha', { method: 'PUT', body: { senhaAtual, novaSenha } })
    }
    catch (e: any) {
      throw new Error(mensagem(e, 'Não foi possível trocar a senha.'))
    }
    finally {
      salvando.value = false
    }
  }

  return {
    equipe, perfil, carregando, salvando,
    filtros, listaFiltrada, temFiltro, contagem, limparFiltros,
    carregarEquipe, carregarPerfil, criar, atualizar, remover, salvarPerfil, trocarSenha,
  }
})
