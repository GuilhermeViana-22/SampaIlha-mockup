import { $fetch } from 'ofetch'
import type { Episodio } from '../../../../shared/types/podcast'
import type { ApiEpisodio } from '../../../utils/podcast'
import { paraEpisodio } from '../../../utils/podcast'
import { tokenDaSessao } from '../../../utils/api'

/**
 * Troca a capa do episódio mantendo o cadastro.
 *
 * A API só apaga o arquivo antigo depois de o novo estar gravado — o card
 * nunca fica apontando para uma capa que não existe mais.
 */
export default defineEventHandler(async (event): Promise<Episodio> => {
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
    const atualizado = await $fetch<ApiEpisodio>(`${config.apiBase}/podcast/${id}/capa`, {
      method: 'PUT',
      body: formulario,
      headers: { Authorization: `Bearer ${token}` },
    })

    return paraEpisodio(atualizado)
  }
  catch (erro: any) {
    throw createError({
      statusCode: erro?.response?.status ?? 500,
      statusMessage: erro?.data?.error?.message ?? 'Não foi possível enviar a capa.',
    })
  }
})
