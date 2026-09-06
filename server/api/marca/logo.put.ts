import { $fetch } from 'ofetch'
import { tokenDaSessao } from '../../utils/api'
import { urlAbsoluta } from '../../utils/adaptadores'

/**
 * Troca o logo do portal. O arquivo chega como multipart e vai para a API,
 * que valida o conteúdo real da imagem antes de gravar.
 */
export default defineEventHandler(async (event): Promise<{ logoUrl: string | null }> => {
  const partes = await readMultipartFormData(event)
  const arquivo = partes?.find(parte => parte.name === 'file' && parte.filename)

  if (!arquivo) {
    throw createError({ statusCode: 422, statusMessage: 'Envie um arquivo de imagem.' })
  }

  const formulario = new FormData()
  formulario.append('file', new Blob([new Uint8Array(arquivo.data)], { type: arquivo.type }), arquivo.filename)

  const config = useRuntimeConfig()
  const token = await tokenDaSessao(event)

  try {
    // FormData precisa ir direto no $fetch para o boundary ser montado certo.
    const marca = await $fetch<{ logo_url: string | null }>(`${config.apiBase}/settings/branding/logo`, {
      method: 'PUT',
      body: formulario,
      headers: { Authorization: `Bearer ${token}` },
    })

    return { logoUrl: urlAbsoluta(marca.logo_url) ?? null }
  }
  catch (erro: any) {
    throw createError({
      statusCode: erro?.response?.status ?? 500,
      statusMessage: erro?.data?.error?.message ?? 'Não foi possível enviar o logo.',
    })
  }
})
