/**
 * Consentimento de cookies (LGPD, art. 8º).
 *
 * O portal só grava por conta própria o que é estritamente necessário — sessão
 * do painel, tema, controle de leituras. Medição de audiência e qualquer pixel
 * de campanha dependem de um "sim" explícito, e a lei exige que recusar custe
 * o mesmo clique que aceitar: por isso o aviso tem os dois botões lado a lado,
 * e não só um "OK" que fecha a barra.
 *
 * A escolha mora no `localStorage` do visitante, e não num cookie: nada aqui
 * precisa viajar para o servidor, e assim o SSR não muda de acordo com quem
 * pede a página — o aviso é montado depois da hidratação, com `pronto`.
 */

/** Categorias opcionais. As necessárias não entram: não há o que consentir. */
export type CategoriaCookie = 'analise' | 'marketing'

export interface PreferenciasCookies {
  /** Versão do texto/categorias que a pessoa viu quando decidiu. */
  versao: number
  /** Quando decidiu, em ISO — é a prova de consentimento que a LGPD pede. */
  em: string
  analise: boolean
  marketing: boolean
}

const CHAVE = 'sampa:consentimento-cookies'

/**
 * Suba este número ao incluir uma categoria nova ou mudar o que as existentes
 * cobrem: a escolha guardada deixa de valer e o aviso reaparece, em vez de
 * herdar um "sim" dado para outra coisa.
 */
const VERSAO = 1

function ler(): PreferenciasCookies | null {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return null

    const dados = JSON.parse(bruto) as Partial<PreferenciasCookies>
    if (dados?.versao !== VERSAO) return null

    return {
      versao: VERSAO,
      em: dados.em ?? new Date().toISOString(),
      analise: dados.analise === true,
      marketing: dados.marketing === true,
    }
  }
  catch {
    // Navegação privada, storage cheio ou JSON corrompido: trata como quem
    // ainda não decidiu. Perguntar de novo é o lado seguro do erro.
    return null
  }
}

function gravar(preferencias: PreferenciasCookies): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(preferencias))
  }
  catch {
    // Sem storage a escolha vale só nesta navegação — o estado em memória já
    // tira o aviso da frente de quem acabou de responder.
  }
}

export function useConsentimentoCookies() {
  const preferencias = useState<PreferenciasCookies | null>('cookies:preferencias', () => null)
  /** Só depois de olhar o `localStorage` sabemos se há algo a perguntar. */
  const pronto = useState('cookies:pronto', () => false)
  const painelAberto = useState('cookies:painel', () => false)

  /**
   * Estado dos interruptores do painel "Personalizar".
   *
   * Começa tudo desligado: consentimento tem de ser um ato de quem visita, e
   * caixa marcada de fábrica é justamente o que a LGPD não aceita como "sim".
   * Quem já decidiu e volta pelo rodapé reencontra a própria escolha, não este
   * padrão — é o que `reabrir` copia antes de limpar o registro.
   */
  const rascunho = useState<Record<CategoriaCookie, boolean>>('cookies:rascunho', () => ({ analise: false, marketing: false }))

  onMounted(() => {
    if (pronto.value) return
    preferencias.value = ler()
    if (preferencias.value) rascunho.value = { analise: preferencias.value.analise, marketing: preferencias.value.marketing }
    pronto.value = true
  })

  const decidido = computed(() => preferencias.value !== null)
  const avisoVisivel = computed(() => pronto.value && !decidido.value)

  function decidir(escolha: Record<CategoriaCookie, boolean>): void {
    const registro: PreferenciasCookies = {
      versao: VERSAO,
      em: new Date().toISOString(),
      ...escolha,
    }
    preferencias.value = registro
    painelAberto.value = false
    gravar(registro)
  }

  function aceitarTodos() {
    decidir({ analise: true, marketing: true })
  }

  function rejeitarOpcionais() {
    decidir({ analise: false, marketing: false })
  }

  /**
   * Volta a perguntar. É o que o link "Preferências de cookies" do rodapé faz:
   * a LGPD dá o direito de rever o consentimento a qualquer momento, e sem esse
   * caminho quem aceitou por engano ficaria sem saída.
   */
  function reabrir() {
    if (preferencias.value) rascunho.value = { analise: preferencias.value.analise, marketing: preferencias.value.marketing }
    preferencias.value = null
    painelAberto.value = true
    try {
      localStorage.removeItem(CHAVE)
    }
    catch {
      // Idem: o estado em memória já traz o aviso de volta.
    }
  }

  /** Porta de entrada para quem for carregar script de terceiro no futuro. */
  function permite(categoria: CategoriaCookie): boolean {
    return preferencias.value?.[categoria] === true
  }

  return { preferencias, pronto, decidido, avisoVisivel, painelAberto, rascunho, aceitarTodos, rejeitarOpcionais, decidir, reabrir, permite }
}
