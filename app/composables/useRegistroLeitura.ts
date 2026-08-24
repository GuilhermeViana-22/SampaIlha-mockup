/**
 * Registra a leitura de uma matéria — de verdade.
 *
 * O contador antigo subia no servidor a cada render, então recarregar a página
 * ou um robô passar já valia como leitura. Aqui quem dispara é o navegador de
 * quem está lendo, e só depois de um sinal de que a pessoa realmente leu:
 * tempo com a aba à vista ou rolagem para dentro do texto.
 *
 * A janela também é conferida no servidor; o `localStorage` só evita a ida
 * desnecessária quando o mesmo navegador reabre a matéria.
 */

/** Tempo com a página à vista que já caracteriza leitura. */
const SEGUNDOS_DE_LEITURA = 15

/** Fração do texto rolada que dispensa esperar o tempo. */
const ROLAGEM_MINIMA = 0.25

/** Mesma janela do servidor: uma leitura por matéria por navegador. */
const JANELA_MS = 12 * 60 * 60 * 1000

const CHAVE = 'sampa:leituras'

function lidasRecentemente(): Record<string, number> {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return {}
    const dados = JSON.parse(bruto) as Record<string, number>
    const agora = Date.now()
    // Aproveita a leitura para descartar o que já saiu da janela.
    return Object.fromEntries(Object.entries(dados).filter(([, quando]) => agora - quando < JANELA_MS))
  }
  catch {
    return {}
  }
}

function marcarComoLida(postId: string): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ ...lidasRecentemente(), [postId]: Date.now() }))
  }
  catch {
    // Navegação privada ou storage cheio: sem problema, o servidor confere.
  }
}

export function useRegistroLeitura(postId: MaybeRefOrGetter<string>) {
  const registrada = ref(false)

  onMounted(() => {
    const id = toValue(postId)
    if (!id || lidasRecentemente()[id]) {
      registrada.value = true
      return
    }

    let visivelDesde = document.visibilityState === 'visible' ? Date.now() : 0
    let acumulado = 0
    let cronometro: ReturnType<typeof setInterval> | undefined

    async function registrar() {
      if (registrada.value) return
      registrada.value = true
      desligar()

      try {
        await $fetch(`/api/posts/${id}/leitura`, { method: 'POST' })
        marcarComoLida(id)
      }
      catch {
        // Contagem de audiência não atrapalha quem está lendo.
      }
    }

    function tempoVisivel(): number {
      return acumulado + (visivelDesde ? Date.now() - visivelDesde : 0)
    }

    function aoRolar() {
      const alcance = document.documentElement.scrollHeight - window.innerHeight
      if (alcance <= 0) return
      if (window.scrollY / alcance >= ROLAGEM_MINIMA) registrar()
    }

    /** O relógio só corre com a aba à vista: aba de fundo não é leitura. */
    function aoTrocarVisibilidade() {
      if (document.visibilityState === 'visible') {
        visivelDesde = Date.now()
      }
      else {
        acumulado = tempoVisivel()
        visivelDesde = 0
      }
    }

    function desligar() {
      if (cronometro) clearInterval(cronometro)
      window.removeEventListener('scroll', aoRolar)
      document.removeEventListener('visibilitychange', aoTrocarVisibilidade)
    }

    cronometro = setInterval(() => {
      if (tempoVisivel() >= SEGUNDOS_DE_LEITURA * 1000) registrar()
    }, 1000)

    window.addEventListener('scroll', aoRolar, { passive: true })
    document.addEventListener('visibilitychange', aoTrocarVisibilidade)

    onScopeDispose(desligar)
  })

  return { registrada }
}
