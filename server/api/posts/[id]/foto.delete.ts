import { chamarApi } from '../../../utils/api'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const { imagemId } = getQuery(event)

  if (!imagemId) {
    throw createError({ statusCode: 422, statusMessage: 'Informe a imagem a remover.' })
  }

  await chamarApi(event, `/posts/${id}/images/${imagemId}`, { method: 'DELETE', requerSessao: true })
  return { ok: true }
})
