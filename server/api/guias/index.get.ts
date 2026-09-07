import type { Guia, RespostaLista } from '#shared/types/content'
import { temSessao } from '#server/utils/api'

/**
 * Listagem de guias. 
 * 
 * NOTA: Implementação temporária em memória até que a API Python
 * tenha o endpoint /guides implementado.
 */
// Armazenamento em memória temporário (compartilhado entre rotas)
declare global {
  var guiasMemoria: Guia[]
}
if (!globalThis.guiasMemoria) {
  globalThis.guiasMemoria = []
}

export default defineEventHandler(async (event): Promise<RespostaLista<Guia>> => {
  const query = getQuery(event)
  const autenticado = temSessao(event)

  // Filtragem em memória
  let filtrados = [...globalThis.guiasMemoria]

  if (!autenticado) {
    filtrados = filtrados.filter(g => g.status === 'publicado')
  }

  if (query.status && query.status !== 'todos') {
    filtrados = filtrados.filter(g => g.status === query.status)
  }

  if (query.categoria) {
    filtrados = filtrados.filter(g => g.categoria === query.categoria)
  }

  if (query.busca) {
    const termo = String(query.busca).toLowerCase()
    filtrados = filtrados.filter(g =>
      g.titulo.toLowerCase().includes(termo) ||
      g.resumo.toLowerCase().includes(termo) ||
      g.tags.some(t => t.toLowerCase().includes(termo))
    )
  }

  // Ordenação
  if (query.ordenar === 'antigos') {
    filtrados.sort((a, b) => a.publicadoEm.localeCompare(b.publicadoEm))
  } else if (query.ordenar === 'lidos') {
    filtrados.sort((a, b) => b.leituras - a.leituras)
  } else if (query.ordenar === 'titulo') {
    filtrados.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
  } else {
    filtrados.sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm))
  }

  // Paginação
  const pagina = Number(query.pagina) || 1
  const limite = Number(query.limite) || 20
  const inicio = (pagina - 1) * limite
  const itens = filtrados.slice(inicio, inicio + limite)

  return {
    itens,
    total: filtrados.length,
  }
})
