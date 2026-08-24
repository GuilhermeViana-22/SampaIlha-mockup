import type { Aviso, TipoAviso } from '../../shared/types/content'

export interface ApiAviso {
  id: string
  message: string
  kind: TipoAviso
  show_on: string
  is_today: boolean
  created_at: string
}

export function paraAviso(api: ApiAviso): Aviso {
  return {
    id: api.id,
    mensagem: api.message,
    tipo: api.kind,
    exibirEm: api.show_on,
    noAr: api.is_today,
    criadoEm: api.created_at,
  }
}
