import type { Previsao } from '#shared/types/content'

/**
 * A previsão do tempo que o portal mostra, já da região de quem está lendo.
 *
 * O primeiro carregamento não pede nada a ninguém: o servidor deduz a cidade
 * pelo IP e a previsão vem pronta no HTML. Quem quiser o clima do próprio
 * bairro clica em "usar minha localização" — aí sim o navegador pede permissão,
 * e as coordenadas ficam guardadas para as próximas visitas não perguntarem de
 * novo.
 */

const CHAVE = 'sampa:coordenadas'

/** Três casas ≈ 100 m: o bastante para o clima, sem guardar o endereço. */
function arredondar(valor: number): number {
  return Math.round(valor * 1000) / 1000
}

interface Coordenadas { lat: number, lon: number }

function lerGuardadas(): Coordenadas | null {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return null
    const dados = JSON.parse(bruto) as Coordenadas
    if (typeof dados?.lat !== 'number' || typeof dados?.lon !== 'number') return null
    return dados
  }
  catch {
    return null
  }
}

function guardar(coordenadas: Coordenadas): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(coordenadas))
  }
  catch {
    // Navegação privada: vale para esta sessão e pronto.
  }
}

export function useTempo() {
  // `useState` para o SSR e o cliente compartilharem a mesma posição, e para o
  // widget do rodapé não refazer a busca que o da barra lateral já fez.
  const coordenadas = useState<Coordenadas | null>('tempo-coordenadas', () => null)
  const pedindo = ref(false)
  const erro = ref<string | null>(null)

  const requisicao = useFetch<Previsao | null>('/api/tempo', {
    key: 'previsao-tempo',
    // Reativo de propósito: assim que as coordenadas chegam, o Nuxt refaz a
    // chamada sozinho e o widget troca de cidade sem recarregar a página.
    query: computed(() => (coordenadas.value ? { lat: coordenadas.value.lat, lon: coordenadas.value.lon } : {})),
    /**
     * A previsão não entra no HTML do servidor, e é aqui que isso se decide.
     *
     * Enquanto entrava, cada página renderizada esperava por dois serviços de
     * fora (o de localização e o Open-Meteo) antes de mandar um byte para o
     * navegador. Com a internet da VPS ruim, a home levava 20 s — medido, com
     * os dois serviços inalcançáveis. O widget de canto passou a poder derrubar
     * o portal inteiro.
     *
     * Buscando só no cliente, a página sai na hora e o widget se preenche
     * depois. A localização por IP continua funcionando: quem lê o cabeçalho
     * de quem chamou é o servidor, na rota `/api/tempo`.
     */
    server: false,
    lazy: true,
  })

  function posicaoAtual(): Promise<GeolocationPosition> {
    return new Promise((resolver, rejeitar) => {
      navigator.geolocation.getCurrentPosition(resolver, rejeitar, {
        // Clima não precisa de GPS ligado: a posição da rede/wi-fi basta e sai
        // na hora, sem acender o ícone de localização por dez segundos.
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 30 * 60 * 1000,
      })
    })
  }

  async function localizar(silencioso = false): Promise<void> {
    if (!import.meta.client || !navigator.geolocation) return
    pedindo.value = true
    erro.value = null
    try {
      const posicao = await posicaoAtual()
      const nova = {
        lat: arredondar(posicao.coords.latitude),
        lon: arredondar(posicao.coords.longitude),
      }
      coordenadas.value = nova
      guardar(nova)
    }
    catch {
      // Permissão negada ou sinal ruim: fica a previsão que veio pelo IP.
      if (!silencioso) erro.value = 'Não foi possível pegar sua localização.'
    }
    finally {
      pedindo.value = false
    }
  }

  onMounted(async () => {
    const guardadas = lerGuardadas()
    if (guardadas) {
      coordenadas.value = guardadas
      return
    }
    // Permissão já concedida antes: dá para atualizar a posição sem abrir
    // nenhum aviso na cara de quem só queria ler as notícias.
    try {
      const estado = await navigator.permissions?.query({ name: 'geolocation' })
      if (estado?.state === 'granted') await localizar(true)
    }
    catch {
      // Navegador sem a API de permissões: segue com a previsão do IP.
    }
  })

  return { previsao: requisicao.data, pedindo, erro, localizar }
}
