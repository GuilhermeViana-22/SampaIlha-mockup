import { chamarApi } from '../../utils/api'
import { urlAbsoluta } from '../../utils/adaptadores'

/**
 * Logo do portal. Rota pública: o cabeçalho é montado no SSR de toda página.
 *
 * `null` significa usar o logo que veio no build — é o fallback quando ninguém
 * enviou um ainda e também quando a API está fora do ar.
 */
export default defineEventHandler(async (event): Promise<{ logoUrl: string | null }> => {
  try {
    const marca = await chamarApi<{ logo_url: string | null }>(event, '/settings/branding')
    return { logoUrl: urlAbsoluta(marca.logo_url) ?? null }
  }
  catch {
    return { logoUrl: null }
  }
})
