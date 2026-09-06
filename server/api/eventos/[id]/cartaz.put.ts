import { $fetch } from 'ofetch'
import type { Evento } from '../../../../shared/types/evento'
import type { ApiEvento } from '../../../utils/eventos'
import { paraEvento } from '../../../utils/eventos'
import { tokenDaSessao } from '../../../utils/api'

/**
 * Envia o cartaz do evento.
 *
 * O arquivo chega como multipart e é repassado para a API Python, que valida o
 * conteúdo real da imagem — um `.exe` renomeado para `.jpg` é recusado lá.
 *
 * A orientação (retrato ou paisagem) não vem junto: ela é campo do formulário,
 * salvo com o resto do evento. Deduzi-la das dimensões do arquivo erraria
 * justamente no cartaz quase quadrado, que é onde a escolha importa.
 */
export default defineEventHandler(async (event): Promise<Evento> => {
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
    const atualizado = await $fetch<ApiEvento>(`${config.apiBase}/events/${id}/imagem`, {
      method: 'PUT',
      body: formulario,
      headers: { Authorization: `Bearer ${token}` },
    })

    return paraEvento(atualizado)
  }
  catch (erro: any) {
    throw createError({
      statusCode: erro?.response?.status ?? 500,
      statusMessage: erro?.data?.error?.message ?? 'Não foi possível enviar o cartaz.',
    })
  }
})
