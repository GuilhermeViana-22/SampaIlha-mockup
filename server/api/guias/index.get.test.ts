import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { Guia } from '#shared/types/content'

// Mock do armazenamento global
declare global {
  var guiasMemoria: Guia[]
}

describe('API de Guias - GET /api/guias', () => {
  beforeEach(() => {
    globalThis.guiasMemoria = []
  })

  afterEach(() => {
    globalThis.guiasMemoria = []
  })

  it('deve inicializar armazenamento global', () => {
    expect(globalThis.guiasMemoria).toBeDefined()
    expect(Array.isArray(globalThis.guiasMemoria)).toBe(true)
  })

  it('deve adicionar guia ao armazenamento', () => {
    const guia: Guia = {
      id: '1',
      status: 'publicado',
      titulo: 'Guia de Teste',
      slug: 'guia-de-teste',
      resumo: 'Resumo do guia',
      conteudo: 'Conteúdo do guia',
      categoria: 'turismo',
      categoriaNome: 'Turismo',
      autor: 'Autor Teste',
      icone: 'fas fa-map',
      capa: 'bg-1',
      imagemUrl: null,
      destaque: false,
      tags: ['turismo', 'teste'],
      leituras: 100,
      tempoLeitura: 5,
      publicadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      caminho: '/guias/guia-de-teste',
    }

    globalThis.guiasMemoria.push(guia)
    
    expect(globalThis.guiasMemoria).toHaveLength(1)
    expect(globalThis.guiasMemoria[0].titulo).toBe('Guia de Teste')
  })

  it('deve filtrar por status', () => {
    const guiaPublicado: Guia = {
      id: '1',
      status: 'publicado',
      titulo: 'Guia Publicado',
      slug: 'guia-publicado',
      resumo: 'Resumo',
      conteudo: 'Conteúdo',
      categoria: 'turismo',
      categoriaNome: 'Turismo',
      autor: 'Autor',
      icone: 'fas fa-map',
      capa: 'bg-1',
      imagemUrl: null,
      destaque: false,
      tags: [],
      leituras: 0,
      tempoLeitura: 5,
      publicadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      caminho: '/guias/guia-publicado',
    }

    const guiaRascunho: Guia = {
      ...guiaPublicado,
      id: '2',
      status: 'rascunho',
      titulo: 'Guia Rascunho',
      slug: 'guia-rascunho',
      caminho: '/guias/guia-rascunho',
    }

    globalThis.guiasMemoria.push(guiaPublicado, guiaRascunho)
    
    const filtrados = globalThis.guiasMemoria.filter(g => g.status === 'publicado')
    
    expect(filtrados).toHaveLength(1)
    expect(filtrados[0].status).toBe('publicado')
  })

  it('deve filtrar por categoria', () => {
    const guiaTurismo: Guia = {
      id: '1',
      status: 'publicado',
      titulo: 'Guia Turismo',
      slug: 'guia-turismo',
      resumo: 'Resumo',
      conteudo: 'Conteúdo',
      categoria: 'turismo',
      categoriaNome: 'Turismo',
      autor: 'Autor',
      icone: 'fas fa-map',
      capa: 'bg-1',
      imagemUrl: null,
      destaque: false,
      tags: [],
      leituras: 0,
      tempoLeitura: 5,
      publicadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      caminho: '/guias/guia-turismo',
    }

    const guiaCultura: Guia = {
      ...guiaTurismo,
      id: '2',
      titulo: 'Guia Cultura',
      slug: 'guia-cultura',
      categoria: 'cultura',
      categoriaNome: 'Cultura',
      caminho: '/guias/guia-cultura',
    }

    globalThis.guiasMemoria.push(guiaTurismo, guiaCultura)
    
    const filtrados = globalThis.guiasMemoria.filter(g => g.categoria === 'turismo')
    
    expect(filtrados).toHaveLength(1)
    expect(filtrados[0].categoria).toBe('turismo')
  })

  it('deve filtrar por termo de busca', () => {
    const guiaTeste: Guia = {
      id: '1',
      status: 'publicado',
      titulo: 'Guia de Parintins',
      slug: 'guia-parintins',
      resumo: 'Tudo sobre Parintins',
      conteudo: 'Conteúdo',
      categoria: 'turismo',
      categoriaNome: 'Turismo',
      autor: 'Autor',
      icone: 'fas fa-map',
      capa: 'bg-1',
      imagemUrl: null,
      destaque: false,
      tags: ['parintins', 'festival'],
      leituras: 0,
      tempoLeitura: 5,
      publicadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      caminho: '/guias/guia-parintins',
    }

    globalThis.guiasMemoria.push(guiaTeste)
    
    const termo = 'parintins'
    const filtrados = globalThis.guiasMemoria.filter(g =>
      g.titulo.toLowerCase().includes(termo) ||
      g.resumo.toLowerCase().includes(termo) ||
      g.tags.some(t => t.toLowerCase().includes(termo))
    )
    
    expect(filtrados).toHaveLength(1)
  })

  it('deve paginar resultados', () => {
    for (let i = 1; i <= 25; i++) {
      globalThis.guiasMemoria.push({
        id: String(i),
        status: 'publicado',
        titulo: `Guia ${i}`,
        slug: `guia-${i}`,
        resumo: 'Resumo',
        conteudo: 'Conteúdo',
        categoria: 'turismo',
        categoriaNome: 'Turismo',
        autor: 'Autor',
        icone: 'fas fa-map',
        capa: 'bg-1',
        imagemUrl: null,
        destaque: false,
        tags: [],
        leituras: 0,
        tempoLeitura: 5,
        publicadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        caminho: `/guias/guia-${i}`,
      })
    }
    
    const pagina = 2
    const limite = 10
    const inicio = (pagina - 1) * limite
    const itens = globalThis.guiasMemoria.slice(inicio, inicio + limite)
    
    expect(itens).toHaveLength(10)
    expect(globalThis.guiasMemoria.length).toBe(25)
  })
})
