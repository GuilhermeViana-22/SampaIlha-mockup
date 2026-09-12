import type { ChaveDocumentoLegal } from '~/utils/legal'
import { DOCUMENTOS_LEGAIS } from '~/utils/legal'

/**
 * Abre os Termos de Uso e a Política de Privacidade em modal.
 *
 * O estado é compartilhado (`useState`) porque quem abre e quem exibe são
 * componentes distantes: o gatilho está no rodapé e no aviso de cookies, e o
 * modal é montado uma única vez no layout. Assim o texto aparece sobre a
 * matéria que a pessoa estava lendo, em vez de tirá-la da página — que é o
 * problema de mandar quem só quer conferir uma cláusula para outra rota.
 */
export function useDocumentosLegais() {
  const aberto = useState<ChaveDocumentoLegal | null>('legal:aberto', () => null)

  const documento = computed(() => (aberto.value ? DOCUMENTOS_LEGAIS[aberto.value] : null))

  function abrir(chave: ChaveDocumentoLegal): void {
    aberto.value = chave
  }

  function fechar(): void {
    aberto.value = null
  }

  return { aberto, documento, abrir, fechar }
}
