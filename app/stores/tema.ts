import { defineStore } from 'pinia'
import type { Tema } from '#shared/types/tema'
import { TEMA_PADRAO, cssDoTema, normalizarTema } from '#shared/types/tema'

/**
 * Paleta do site público. Carregada no SSR (plugin `tema.server`) e injetada
 * como <style> no <head>, então a página já nasce com as cores certas.
 *
 * O painel altera `rascunho` para pré-visualizar ao vivo sem gravar nada.
 */
export const useTemaStore = defineStore('tema', () => {
  const tema = ref<Tema>({ ...TEMA_PADRAO })
  const rascunho = ref<Tema | null>(null)
  const carregado = ref(false)
  const salvando = ref(false)

  /** O que vale para pintar a tela: o rascunho do painel, ou o tema salvo. */
  const efetivo = computed<Tema>(() => rascunho.value ?? tema.value)
  const css = computed(() => cssDoTema(efetivo.value))
  const alterado = computed(() => !!rascunho.value && JSON.stringify(rascunho.value) !== JSON.stringify(tema.value))

  async function carregar(forcar = false) {
    if (carregado.value && !forcar) return

    try {
      tema.value = normalizarTema(await $fetch<Tema>('/api/tema', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      }))
      carregado.value = true
    }
    catch {
      tema.value = { ...TEMA_PADRAO }
    }
  }

  /** Abre (ou reabre) o rascunho a partir do tema salvo. */
  function editar() {
    rascunho.value = { ...tema.value }
  }

  function descartar() {
    rascunho.value = { ...tema.value }
  }

  async function salvar() {
    if (!rascunho.value) return

    salvando.value = true
    try {
      tema.value = normalizarTema(await $fetch<Tema>('/api/tema', { method: 'PUT', body: rascunho.value }))
      rascunho.value = { ...tema.value }
      carregado.value = true
    }
    finally {
      salvando.value = false
    }
  }

  async function restaurarPadrao() {
    salvando.value = true
    try {
      tema.value = normalizarTema(await $fetch<Tema>('/api/tema/restaurar', { method: 'POST' }))
      rascunho.value = { ...tema.value }
    }
    finally {
      salvando.value = false
    }
  }

  return { tema, rascunho, efetivo, css, alterado, carregado, salvando, carregar, editar, descartar, salvar, restaurarPadrao }
})
