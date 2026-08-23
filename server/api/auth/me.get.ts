import { chamarApi, temSessao } from '../../utils/api'

export default defineEventHandler(async (event) => {
  if (!temSessao(event)) return { usuario: null }

  try {
    const perfil = await chamarApi<{ id: string, name: string, email: string, role: string }>(event, '/auth/me', {
      requerSessao: true,
    })

    return {
      usuario: {
        id: perfil.id,
        nome: perfil.name,
        email: perfil.email,
        papel: perfil.role === 'admin' ? 'editor-chefe' : 'editor',
      },
    }
  }
  catch {
    return { usuario: null }
  }
})
