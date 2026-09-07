import { chamarApi } from '../../../utils/api'
import type { ResultadoDisparo } from '../../../../shared/types/content'

interface ApiResultado {
  enviados: number
  falhas: number
  descartados: number
  restantes: number
}

/**
 * Dispara uma passada na mão, sem esperar o agendador.
 *
 * É o botão "enviar agora" do painel. O caminho normal é o Scheduler do Dokploy
 * chamando `scripts/enviar_newsletter.py` de cinco em cinco minutos; isto aqui
 * serve para quem acabou de publicar e não quer esperar.
 */
export default defineEventHandler(async (event): Promise<ResultadoDisparo> => {
  const resultado = await chamarApi<ApiResultado>(event, '/newsletter/fila/disparar', {
    method: 'POST',
    requerSessao: true,
  })

  return {
    enviados: resultado.enviados,
    falhas: resultado.falhas,
    descartados: resultado.descartados,
    restantes: resultado.restantes,
  }
})
