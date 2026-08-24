import { chamarApi } from '../../utils/api'

/** Volta ao logo que veio no build do site. */
export default defineEventHandler(async (event): Promise<{ logoUrl: string | null }> => {
  await chamarApi(event, '/settings/branding/logo', { method: 'DELETE', requerSessao: true })
  return { logoUrl: null }
})
