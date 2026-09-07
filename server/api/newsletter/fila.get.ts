import { chamarApi } from '../../utils/api'
import type { FilaNewsletter } from '../../../shared/types/content'

interface ApiFila {
  habilitada: boolean
  pendentes: number
  enviados: number
  falhas: number
  campanhas_enviadas: number
  ultima_campanha: { assunto: string, destinatarios: number, em: string | null } | null
}

/** Estado do disparo, para o painel. */
export default defineEventHandler(async (event): Promise<FilaNewsletter> => {
  const fila = await chamarApi<ApiFila>(event, '/newsletter/fila', { requerSessao: true })

  return {
    habilitada: fila.habilitada,
    pendentes: fila.pendentes,
    enviados: fila.enviados,
    falhas: fila.falhas,
    campanhasEnviadas: fila.campanhas_enviadas,
    ultimaCampanha: fila.ultima_campanha
      ? {
          assunto: fila.ultima_campanha.assunto,
          destinatarios: fila.ultima_campanha.destinatarios,
          em: fila.ultima_campanha.em,
        }
      : null,
  }
})
