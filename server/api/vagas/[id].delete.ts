import { chamarApi } from '../../utils/api'

/** Tira a vaga do painel e do site; a foto sai do disco junto. */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  await chamarApi(event, `/jobs/${id}`, { method: 'DELETE', requerSessao: true })

  return { ok: true, id }
})
