import { $fetch } from 'ofetch'
import type { Workshop } from '../../../../shared/types/workshop'
import type { ApiWorkshop } from '../../../utils/workshops'
import { paraWorkshop } from '../../../utils/workshops'
import { COOKIE_ACESSO, chamarApi } from '../../../utils/api'

/**
 * Envia o cartaz da oficina.
 *
 * O arquivo chega como multipart e é repassado para a API Python, que valida o
 * conteúdo real da imagem — um `.exe` renomeado para `.jpg` é recusado lá.
 */
export default defineEventHandler(async (event): Promise<Workshop> => {
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
    const atualizada = await $fetch<ApiWorkshop>(`${config.apiBase}/workshops/${id}/imagem`, {
      method: 'PUT',
      body: formulario,
      headers: { Authorization: `Bearer ${getCookie(event, COOKIE_ACESSO)}` },
    })

    return paraWorkshop(atualizada)
  }
  catch (erro: any) {
    throw createError({
      statusCode: erro?.response?.status ?? 500,
      statusMessage: erro?.data?.error?.message ?? 'Não foi possível enviar o cartaz.',
    })
  }
})
