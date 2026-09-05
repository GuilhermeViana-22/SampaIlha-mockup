import { $fetch } from 'ofetch'
import type { Publicidade } from '../../../shared/types/content'
import type { ApiPublicidade } from '../../utils/publicidade'
import { paraPublicidade } from '../../utils/publicidade'
import { COOKIE_ACESSO, chamarApi } from '../../utils/api'

/**
 * Cadastra um anúncio, com a arte no mesmo pedido.
 *
 * O banner é obrigatório porque o anúncio é o banner — não há card de
 * publicidade sem imagem para mostrar. O arquivo chega como multipart e é
 * repassado para a API Python, que valida o conteúdo real da imagem: um `.exe`
 * renomeado para `.jpg` é recusado lá, não aqui.
 */
export default defineEventHandler(async (event): Promise<Publicidade> => {
  const partes = await readMultipartFormData(event)

  const arquivo = partes?.find(parte => parte.name === 'file' && parte.filename)
  if (!arquivo) {
    throw createError({ statusCode: 422, statusMessage: 'Escolha a arte do anúncio.' })
  }

  const campo = (nome: string) => partes?.find(parte => parte.name === nome)?.data?.toString().trim() ?? ''

  const titulo = campo('title')
  if (!titulo) {
    throw createError({ statusCode: 422, statusMessage: 'Dê um nome ao anúncio.' })
  }

  const formulario = new FormData()
  formulario.append('file', new Blob([new Uint8Array(arquivo.data)], { type: arquivo.type }), arquivo.filename)
  formulario.append('title', titulo)
  formulario.append('description', campo('description'))
  formulario.append('status', campo('status') || 'rascunho')
  formulario.append('sort_order', campo('sort_order') || '0')

  // Data e link vazios não vão: o FastAPI trata campo ausente como "sem
  // valor", enquanto string vazia viraria erro de formato de data.
  for (const [nome, valor] of [
    ['link_url', campo('link_url')],
    ['published_from', campo('published_from')],
    ['published_until', campo('published_until')],
  ] as const) {
    if (valor) formulario.append(nome, valor)
  }

  // FormData precisa ir direto no $fetch para o boundary ser montado corretamente.
  const config = useRuntimeConfig()
  if (!getCookie(event, COOKIE_ACESSO)) {
    // Garante um token válido (renovando se preciso) antes do upload.
    await chamarApi(event, '/auth/me', { requerSessao: true })
  }

  try {
    const criado = await $fetch<ApiPublicidade>(`${config.apiBase}/advertisements`, {
      method: 'POST',
      body: formulario,
      headers: { Authorization: `Bearer ${getCookie(event, COOKIE_ACESSO)}` },
    })

    setResponseStatus(event, 201)
    return paraPublicidade(criado)
  }
  catch (erro: any) {
    throw createError({
      statusCode: erro?.response?.status ?? 500,
      statusMessage: erro?.data?.error?.message ?? 'Não foi possível cadastrar o anúncio.',
    })
  }
})
