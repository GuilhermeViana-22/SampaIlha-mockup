import { $fetch } from 'ofetch'
import type { Publicidade } from '../../../../shared/types/content'
import type { ApiPublicidade } from '../../../utils/publicidade'
import { paraPublicidade } from '../../../utils/publicidade'
import { COOKIE_ACESSO, chamarApi } from '../../../utils/api'

/**
 * Troca a arte do anúncio mantendo o cadastro.
 *
 * É o caso da campanha que muda de criativo no meio do contrato: datas, link e
 * ordem continuam valendo. A API só apaga o arquivo antigo depois de o novo
 * estar gravado — o anúncio nunca fica no ar sem imagem.
 */
export default defineEventHandler(async (event): Promise<Publicidade> => {
  const id = getRouterParam(event, 'id')!
  const partes = await readMultipartFormData(event)

  const arquivo = partes?.find(parte => parte.name === 'file' && parte.filename)
  if (!arquivo) {
    throw createError({ statusCode: 422, statusMessage: 'Envie um arquivo de imagem.' })
  }

  const formulario = new FormData()
  formulario.append('file', new Blob([new Uint8Array(arquivo.data)], { type: arquivo.type }), arquivo.filename)

  // FormData precisa ir direto no $fetch para o boundary ser montado corretamente.
  const config = useRuntimeConfig()
  if (!getCookie(event, COOKIE_ACESSO)) {
    // Garante um token válido (renovando se preciso) antes do upload.
    await chamarApi(event, '/auth/me', { requerSessao: true })
  }

  try {
    const atualizado = await $fetch<ApiPublicidade>(`${config.apiBase}/advertisements/${id}/imagem`, {
      method: 'PUT',
      body: formulario,
      headers: { Authorization: `Bearer ${getCookie(event, COOKIE_ACESSO)}` },
    })

    return paraPublicidade(atualizado)
  }
  catch (erro: any) {
    throw createError({
      statusCode: erro?.response?.status ?? 500,
      statusMessage: erro?.data?.error?.message ?? 'Não foi possível enviar a arte.',
    })
  }
})
