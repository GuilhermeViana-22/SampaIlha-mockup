import { $fetch } from 'ofetch'
import type { MidiaKit } from '../../../shared/types/content'
import type { ApiMidiaKit } from '../../utils/midiaKit'
import { paraMidiaKit } from '../../utils/midiaKit'
import { COOKIE_ACESSO, chamarApi } from '../../utils/api'

/**
 * Sobe uma peça para o mídia kit.
 *
 * O arquivo chega como multipart e é repassado para a API Python, que confere
 * o conteúdo real — um executável renomeado para `.pdf` é recusado lá, não
 * aqui. Só três campos vão junto: título, descrição e o arquivo.
 */
export default defineEventHandler(async (event): Promise<MidiaKit> => {
  const partes = await readMultipartFormData(event)

  const arquivo = partes?.find(parte => parte.name === 'file' && parte.filename)
  if (!arquivo) {
    throw createError({ statusCode: 422, statusMessage: 'Escolha o arquivo da peça.' })
  }

  const campo = (nome: string) => partes?.find(parte => parte.name === nome)?.data?.toString() ?? ''

  const titulo = campo('title').trim()
  if (!titulo) {
    throw createError({ statusCode: 422, statusMessage: 'Dê um título à peça.' })
  }

  const formulario = new FormData()
  formulario.append('file', new Blob([new Uint8Array(arquivo.data)], { type: arquivo.type }), arquivo.filename)
  formulario.append('title', titulo)
  formulario.append('description', campo('description').trim())

  // FormData precisa ir direto no $fetch para o boundary ser montado corretamente.
  const config = useRuntimeConfig()
  if (!getCookie(event, COOKIE_ACESSO)) {
    // Garante um token válido (renovando se preciso) antes do upload.
    await chamarApi(event, '/auth/me', { requerSessao: true })
  }

  try {
    const criada = await $fetch<ApiMidiaKit>(`${config.apiBase}/media-kit`, {
      method: 'POST',
      body: formulario,
      headers: { Authorization: `Bearer ${getCookie(event, COOKIE_ACESSO)}` },
    })

    setResponseStatus(event, 201)
    return paraMidiaKit(criada)
  }
  catch (erro: any) {
    throw createError({
      statusCode: erro?.response?.status ?? 500,
      statusMessage: erro?.data?.error?.message ?? 'Não foi possível enviar o arquivo.',
    })
  }
})
