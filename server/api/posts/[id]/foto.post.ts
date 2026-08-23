import { $fetch } from 'ofetch'
import type { PostImagem } from '../../../../shared/types/content'
import { urlAbsoluta } from '../../../utils/adaptadores'
import { COOKIE_ACESSO, chamarApi } from '../../../utils/api'

interface ApiImagem {
  id: string
  url: string
  caption: string | null
  credit: string | null
  sort_order: number
  is_featured: boolean
}

/**
 * Upload da foto da matéria. O arquivo chega como multipart e é repassado
 * para a API Python, que valida o conteúdo real da imagem.
 */
export default defineEventHandler(async (event): Promise<PostImagem> => {
  const id = getRouterParam(event, 'id')!
  const partes = await readMultipartFormData(event)

  const arquivo = partes?.find(parte => parte.name === 'file' && parte.filename)
  if (!arquivo) {
    throw createError({ statusCode: 422, statusMessage: 'Envie um arquivo de imagem.' })
  }

  const campo = (nome: string) => partes?.find(parte => parte.name === nome)?.data?.toString()

  const formulario = new FormData()
  formulario.append('file', new Blob([new Uint8Array(arquivo.data)], { type: arquivo.type }), arquivo.filename)
  if (campo('caption')) formulario.append('caption', campo('caption')!)
  if (campo('credit')) formulario.append('credit', campo('credit')!)
  formulario.append('set_as_cover', campo('set_as_cover') ?? 'true')

  // FormData precisa ir direto no $fetch para o boundary ser montado corretamente.
  const config = useRuntimeConfig()
  const token = getCookie(event, COOKIE_ACESSO)
  if (!token) {
    // Garante um token válido (renovando se preciso) antes do upload.
    await chamarApi(event, '/auth/me', { requerSessao: true })
  }

  try {
    const imagem = await $fetch<ApiImagem>(`${config.apiBase}/posts/${id}/images`, {
      method: 'POST',
      body: formulario,
      headers: { Authorization: `Bearer ${getCookie(event, COOKIE_ACESSO)}` },
    })

    setResponseStatus(event, 201)
    return {
      id: imagem.id,
      url: urlAbsoluta(imagem.url) ?? '',
      legenda: imagem.caption,
      credito: imagem.credit,
      ordem: imagem.sort_order,
      capa: imagem.is_featured,
    }
  }
  catch (erro: any) {
    throw createError({
      statusCode: erro?.response?.status ?? 500,
      statusMessage: erro?.data?.error?.message ?? 'Não foi possível enviar a imagem.',
    })
  }
})
