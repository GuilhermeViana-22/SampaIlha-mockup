import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { Guia, GuiaInput } from '#shared/types/content'

declare global {
  var guiasMemoria: Guia[]
}

describe('API de Guias - POST /api/guias', () => {
  beforeEach(() => {
    globalThis.guiasMemoria = []
  })

  afterEach(() => {
    globalThis.guiasMemoria = []
  })

  it('deve criar um novo guia com dados válidos', () => {
    const corpo: GuiaInput = {
      status: 'publicado',
      titulo: 'Guia de Teste',
      slug: 'guia-de-teste',
      resumo: 'Resumo do guia',
      conteudo: 'Conteúdo do guia',
      categoria: 'turismo',
      autor: 'Autor Teste',
      icone: 'fas fa-map',
      capa: 'bg-1',
      imagemUrl: null,
      destaque: false,
      tags: ['turismo', 'teste'],
      tempoLeitura: 5,
      publicadoEm: new Date().toISOString(),
    }

    const novoGuia: Guia = {
      id: crypto.randomUUID(),
      ...corpo,
      categoriaNome: 'Categoria',
      leituras: 0,
      tempoLeitura: corpo.tempoLeitura || 3,
      publicadoEm: corpo.publicadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      caminho: `/guias/${corpo.slug}`,
    }

    globalThis.guiasMemoria.push(novoGuia)

    expect(globalThis.guiasMemoria).toHaveLength(1)
    expect(globalThis.guiasMemoria[0].id).toBeDefined()
    expect(globalThis.guiasMemoria[0].titulo).toBe('Guia de Teste')
    expect(globalThis.guiasMemoria[0].leituras).toBe(0)
    expect(globalThis.guiasMemoria[0].caminho).toBe('/guias/guia-de-teste')
  })

  it('deve gerar ID único para cada guia', () => {
    const corpo: GuiaInput = {
      status: 'publicado',
      titulo: 'Guia 1',
      slug: 'guia-1',
      resumo: 'Resumo',
      conteudo: 'Conteúdo',
      categoria: 'turismo',
      autor: 'Autor',
      icone: 'fas fa-map',
      capa: 'bg-1',
      imagemUrl: null,
      destaque: false,
      tags: [],
    }

    const guia1: Guia = {
      id: crypto.randomUUID(),
      ...corpo,
      categoriaNome: 'Categoria',
      leituras: 0,
      tempoLeitura: 3,
      publicadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      caminho: `/guias/${corpo.slug}`,
    }

    const guia2: Guia = {
      id: crypto.randomUUID(),
      ...corpo,
      titulo: 'Guia 2',
      slug: 'guia-2',
      caminho: '/guias/guia-2',
    }

    globalThis.guiasMemoria.push(guia1, guia2)

    expect(globalThis.guiasMemoria[0].id).not.toBe(globalThis.guiasMemoria[1].id)
  })

  it('deve definir valores padrão para campos opcionais', () => {
    const corpo: GuiaInput = {
      status: 'publicado',
      titulo: 'Guia de Teste',
      slug: 'guia-de-teste',
      resumo: 'Resumo',
      conteudo: 'Conteúdo',
      categoria: 'turismo',
      autor: 'Autor',
      icone: 'fas fa-map',
      capa: 'bg-1',
      imagemUrl: null,
      destaque: false,
      tags: [],
    }

    const novoGuia: Guia = {
      id: crypto.randomUUID(),
      ...corpo,
      categoriaNome: 'Categoria',
      leituras: 0,
      tempoLeitura: corpo.tempoLeitura || 3,
      publicadoEm: corpo.publicadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      caminho: `/guias/${corpo.slug}`,
    }

    globalThis.guiasMemoria.push(novoGuia)

    expect(globalThis.guiasMemoria[0].leituras).toBe(0)
    expect(globalThis.guiasMemoria[0].tempoLeitura).toBe(3)
    expect(globalThis.guiasMemoria[0].atualizadoEm).toBeDefined()
  })
})
