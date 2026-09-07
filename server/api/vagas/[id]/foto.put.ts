import { $fetch } from 'ofetch'
import type { Vaga } from '../../../../shared/types/vaga'
import type { ApiVaga } from '../../../utils/vagas'
import { paraVaga } from '../../../utils/vagas'
import { tokenDaSessao } from '../../../utils/api'

/**
 * Envia a foto da vaga.
 *
 * O arquivo chega como multipart e é repassado para a API Python, que valida o
 * conteúdo real da imagem — um `.exe` renomeado para `.jpg` é recusado lá.
 */
export default defineEventHandler(async (event): Promise<Vaga> => {
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
  const token = await tokenDaSessao(event)

  try {
    const atualizada = await $fetch<ApiVaga>(`${config.apiBase}/jobs/${id}/imagem`, {
      method: 'PUT',
      body: formulario,
      headers: { Authorization: `Bearer ${token}` },
    })

    return paraVaga(atualizada)
  }
  catch (erro: any) {
    throw createError({
      statusCode: erro?.response?.status ?? 500,
      statusMessage: erro?.data?.error?.message ?? 'Não foi possível enviar a foto.',
    })
  }
})
