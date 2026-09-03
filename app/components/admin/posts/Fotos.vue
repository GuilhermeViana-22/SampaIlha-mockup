<script setup lang="ts">
import {
  ImageOffIcon, ImagePlusIcon, LoaderCircleIcon, StarIcon, Trash2Icon,
  TriangleAlertIcon, UploadCloudIcon,
} from '@lucide/vue'
import type { PostImagem } from '#shared/types/content'

/**
 * Fotos da matéria: envio, prévia no corte real e escolha da capa.
 *
 * A prévia é a razão de este bloco viver separado do resto do formulário. O
 * portal recorta toda capa em 16:9 (`.news-card__thumb`, `.post-cover`), então
 * mostrar a imagem inteira em um quadro qualquer esconderia justamente o que
 * some no site. Aqui cada foto aparece já no corte que o leitor vai ver, e
 * "Ver imagem inteira" revela o que ficou de fora com a área aproveitada
 * marcada — é a diferença entre descobrir o corte agora ou depois de publicar.
 *
 * Antes de a matéria existir não há onde pendurar a foto: a API anexa imagem a
 * um post com id. Em vez de bloquear o campo, as escolhas ficam na fila e
 * sobem sozinhas assim que o rascunho é criado (`enviarPendentes`, chamada
 * pelo formulário logo depois do POST).
 */
const props = defineProps<{
  /** Ausente enquanto a matéria não foi criada — nesse caso as fotos ficam na fila. */
  postId?: string | null
  titulo?: string
}>()

/** Galeria já gravada na API. */
const fotos = defineModel<PostImagem[]>('fotos', { required: true })
/** Capa da matéria (o `imagemUrl` do post). */
const capaUrl = defineModel<string | null>('capaUrl', { required: true })

/** O que o portal espera — as mesmas medidas das capas geradas pela API. */
const IDEAL = { largura: 1600, altura: 900 }
const MINIMA = { largura: 1200, altura: 675 }
const PROPORCAO = 16 / 9
const PESO_MAXIMO_MB = 5
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

interface Medida { largura: number, altura: number }

/** Foto escolhida antes de a matéria existir: espera aqui até haver um id. */
interface Pendente {
  chave: string
  arquivo: File
  previa: string
  medida: Medida | null
  legenda: string
  credito: string
}

const campoArquivo = ref<HTMLInputElement | null>(null)
const pendentes = ref<Pendente[]>([])
const enviando = ref(false)
const arrastando = ref(false)
const verInteira = ref(false)
/** Foto aberta no quadro grande; a capa é a escolha padrão. */
const emDestaque = ref<string | null>(null)

/** Medidas reais das fotos já enviadas, lidas do `<img>` quando ele carrega. */
const medidas = reactive<Record<string, Medida>>({})

onBeforeUnmount(() => {
  pendentes.value.forEach(item => URL.revokeObjectURL(item.previa))
})

/**
 * O que acontece com a imagem no corte 16:9 do portal.
 *
 * `cortado` é a fração que some — nas laterais quando a foto é mais larga que
 * 16:9, no topo e na base quando é mais alta. É esse número que vira o aviso
 * embaixo da miniatura.
 */
function analisar(medida: Medida | null) {
  if (!medida?.largura || !medida.altura) return null

  const proporcao = medida.largura / medida.altura
  const larga = proporcao > PROPORCAO
  const cortado = larga ? 1 - PROPORCAO / proporcao : 1 - proporcao / PROPORCAO

  return {
    cortado,
    percentual: Math.round(cortado * 100),
    eixo: larga ? 'das laterais' : 'do topo e da base',
    pequena: medida.largura < MINIMA.largura || medida.altura < MINIMA.altura,
    /** Diferença de até 2% não vale aviso: ninguém vê e todo mundo cansa de alerta. */
    exata: cortado < 0.02,
  }
}

/** "1600 × 900 (16:9)" — a razão simplificada ajuda a reconhecer a foto do celular. */
function rotuloMedida(medida: Medida | null) {
  if (!medida) return ''
  const mdc = (a: number, b: number): number => (b ? mdc(b, a % b) : a)
  const divisor = mdc(medida.largura, medida.altura) || 1
  const w = medida.largura / divisor
  const h = medida.altura / divisor
  return `${medida.largura} × ${medida.altura}${w <= 32 && h <= 32 ? ` (${w}:${h})` : ''}`
}

/**
 * Retângulo do que sobrevive ao corte, em % do quadro 16:9 da miniatura.
 *
 * Dentro de um quadro 16:9 com a imagem em `object-contain`, a área que o
 * `object-cover` do portal aproveita é sempre um retângulo centralizado com a
 * mesma fração na largura e na altura — a razão entre a proporção da foto e a
 * do quadro, invertida quando a foto é mais alta que larga.
 */
function areaSegura(medida: Medida) {
  const proporcao = medida.largura / medida.altura
  const fracao = proporcao > PROPORCAO ? PROPORCAO / proporcao : proporcao / PROPORCAO
  const sobra = ((1 - fracao) / 2) * 100
  return {
    width: `${fracao * 100}%`,
    height: `${fracao * 100}%`,
    left: `${sobra}%`,
    top: `${sobra}%`,
  }
}

/** Fotos enviadas e fila lado a lado, no mesmo formato para a galeria. */
const galeria = computed(() => [
  ...fotos.value.map(foto => ({
    chave: foto.id,
    url: foto.url,
    legenda: foto.legenda ?? '',
    credito: foto.credito ?? '',
    capa: foto.capa,
    medida: medidas[foto.id] ?? null,
    analise: analisar(medidas[foto.id] ?? null),
    foto,
    pendente: null as Pendente | null,
  })),
  ...pendentes.value.map(item => ({
    chave: item.chave,
    url: item.previa,
    legenda: item.legenda,
    credito: item.credito,
    capa: false,
    medida: item.medida,
    analise: analisar(item.medida),
    foto: null as PostImagem | null,
    pendente: item,
  })),
])

type ItemGaleria = (typeof galeria)['value'][number]

/**
 * A foto do quadro grande: a escolhida a dedo, a capa, ou a primeira que houver.
 *
 * O fallback importa mais do que parece — a selecionada some quando é removida
 * ou quando a fila termina de subir e as chaves temporárias dão lugar aos ids
 * da API.
 */
const destaque = computed<ItemGaleria | null>(() =>
  galeria.value.find(item => item.chave === emDestaque.value)
  ?? galeria.value.find(item => item.capa)
  ?? galeria.value[0]
  ?? null)

/**
 * Descobre as medidas das fotos já enviadas.
 *
 * Carregar a imagem de novo em vez de ouvir o `load` do `<img>` da tela: a
 * página vem renderizada do servidor, e quando a hidratação acontece a foto
 * muitas vezes já terminou de carregar — o evento passou antes de existir
 * quem o escutasse, e o aviso de corte nunca apareceria. Aqui o navegador
 * responde do cache.
 */
function medirEnviadas() {
  for (const foto of fotos.value) {
    if (medidas[foto.id] || !foto.url) continue
    const img = new Image()
    img.onload = () => {
      medidas[foto.id] = { largura: img.naturalWidth, altura: img.naturalHeight }
    }
    img.src = foto.url
  }
}

onMounted(medirEnviadas)
watch(fotos, medirEnviadas)

/** Lê largura e altura do arquivo local, antes de qualquer upload. */
function medirArquivo(arquivo: File): Promise<Medida | null> {
  return new Promise((resolver) => {
    const url = URL.createObjectURL(arquivo)
    const img = new Image()
    img.onload = () => {
      resolver({ largura: img.naturalWidth, altura: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolver(null)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

/**
 * Recusa aqui o que a API recusaria depois.
 *
 * É cortesia, não segurança: a validação que vale é a do servidor, que abre a
 * imagem e confere o formato real. Checar antes evita a viagem inútil e diz o
 * nome do arquivo problemático — coisa que a mensagem da API não faz quando
 * são cinco de uma vez.
 */
function aceitavel(arquivo: File) {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    avisar.alerta(`"${arquivo.name}" não é uma imagem aceita.`, 'Use JPEG, PNG, WebP ou GIF.')
    return false
  }
  if (arquivo.size > PESO_MAXIMO_MB * 1024 * 1024) {
    avisar.alerta(
      `"${arquivo.name}" passa de ${PESO_MAXIMO_MB} MB.`,
      'Reduza a imagem antes de enviar — foto pesada atrasa o carregamento do portal.',
    )
    return false
  }
  return true
}

/** Envia um arquivo e devolve a foto criada. A primeira da matéria vira capa. */
async function subir(postId: string, arquivo: File, legenda = '', credito = '') {
  const corpo = new FormData()
  corpo.append('file', arquivo)
  corpo.append('set_as_cover', String(fotos.value.length === 0))
  if (legenda.trim()) corpo.append('caption', legenda.trim())
  if (credito.trim()) corpo.append('credit', credito.trim())

  const foto = await $fetch<PostImagem>(`/api/posts/${postId}/foto`, { method: 'POST', body: corpo })

  fotos.value = [...fotos.value, foto]
  emDestaque.value = foto.id
  if (foto.capa) capaUrl.value = foto.url
  return foto
}

/**
 * Ponto de entrada do arraste e do seletor de arquivos.
 *
 * Com a matéria já criada, sobe na hora, uma foto de cada vez: a resposta de
 * cada upload diz se aquela imagem virou capa, e mandar tudo em paralelo faria
 * duas disputarem o posto.
 */
async function receber(lista: FileList | File[] | null) {
  const escolhidos = [...(lista ?? [])].filter(aceitavel)
  if (!escolhidos.length) return

  const medidos = await Promise.all(escolhidos.map(async arquivo => ({
    arquivo,
    medida: await medirArquivo(arquivo),
  })))

  // Sem id não há a quem anexar: a foto espera o rascunho existir.
  if (!props.postId) {
    const primeira = pendentes.value.length === 0
    pendentes.value = [
      ...pendentes.value,
      ...medidos.map(({ arquivo, medida }) => ({
        chave: `${arquivo.name}-${arquivo.size}-${Math.random().toString(36).slice(2, 8)}`,
        arquivo,
        previa: URL.createObjectURL(arquivo),
        medida,
        legenda: '',
        credito: '',
      })),
    ]
    if (primeira) emDestaque.value = pendentes.value[0]?.chave ?? null
    avisar.info(
      escolhidos.length === 1 ? 'Foto na fila.' : `${escolhidos.length} fotos na fila.`,
      'Sobem sozinhas assim que você criar o conteúdo.',
    )
    return
  }

  enviando.value = true
  let enviadas = 0
  try {
    const primeira = fotos.value.length === 0
    for (const { arquivo } of medidos) {
      await subir(props.postId, arquivo)
      enviadas++
    }
    avisar.sucesso(
      enviadas === 1 ? 'Foto enviada.' : `${enviadas} fotos enviadas.`,
      primeira ? 'A primeira entrou como capa da matéria.' : undefined,
    )
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível enviar a foto.', enviadas ? `${enviadas} já tinham subido.` : undefined)
  }
  finally {
    enviando.value = false
  }
}

/**
 * Sobe a fila acumulada antes de a matéria existir.
 *
 * O formulário chama isto logo depois de criar o rascunho e antes de navegar
 * para a tela de edição — o que já estava escolhido aparece lá dentro como
 * foto da matéria, sem ninguém precisar reenviar nada.
 */
async function enviarPendentes(postId: string) {
  if (!pendentes.value.length) return

  enviando.value = true
  let enviadas = 0
  try {
    for (const item of [...pendentes.value]) {
      await subir(postId, item.arquivo, item.legenda, item.credito)
      URL.revokeObjectURL(item.previa)
      pendentes.value = pendentes.value.filter(p => p.chave !== item.chave)
      enviadas++
    }
    avisar.sucesso(enviadas === 1 ? 'Foto enviada.' : `${enviadas} fotos enviadas.`)
  }
  catch (e: unknown) {
    avisar.erro(e, 'O conteúdo foi criado, mas a foto não subiu.', 'Tente enviar de novo por esta tela.')
  }
  finally {
    enviando.value = false
  }
}

function descartarPendente(item: Pendente) {
  URL.revokeObjectURL(item.previa)
  pendentes.value = pendentes.value.filter(p => p.chave !== item.chave)
}

function aoSoltar(evento: DragEvent) {
  arrastando.value = false
  receber(evento.dataTransfer?.files ?? null)
}

function aoEscolher(evento: Event) {
  const campo = evento.target as HTMLInputElement
  receber(campo.files)
  // Sem limpar, escolher o mesmo arquivo de novo não dispara `change` e o
  // botão parece travado.
  campo.value = ''
}

/** Marca a foto como capa na API — a anterior é rebaixada lá. */
async function aplicarCapa(foto: PostImagem) {
  const atualizada = await $fetch<PostImagem>(`/api/posts/${props.postId}/foto`, {
    method: 'PATCH',
    params: { imagemId: foto.id },
    body: { capa: true },
  })
  fotos.value = fotos.value.map(item => ({ ...item, capa: item.id === atualizada.id }))
  capaUrl.value = atualizada.url
}

/** Troca a capa sem apagar nada — é o botão da estrela na miniatura. */
async function definirCapa(foto: PostImagem) {
  if (foto.capa || !props.postId) return
  try {
    await aplicarCapa(foto)
    avisar.sucesso('Capa trocada.', 'É esta foto que aparece nos cards e no topo da matéria.')
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível trocar a capa.')
  }
}

/** Escreve no rascunho local ou grava na API, conforme a foto já exista lá. */
function editarTexto(item: ItemGaleria, campo: 'legenda' | 'credito', valor: string) {
  if (item.pendente) item.pendente[campo] = valor
}

/** Grava legenda e crédito ao sair do campo, e só quando algo mudou. */
async function confirmarTexto(item: ItemGaleria, campo: 'legenda' | 'credito', valor: string) {
  const foto = item.foto
  const limpo = valor.trim() || null
  if (!foto || !props.postId || limpo === foto[campo]) return

  try {
    const atualizada = await $fetch<PostImagem>(`/api/posts/${props.postId}/foto`, {
      method: 'PATCH',
      params: { imagemId: foto.id },
      body: { [campo]: limpo },
    })
    fotos.value = fotos.value.map(outra => (outra.id === atualizada.id ? atualizada : outra))
  }
  catch (e: unknown) {
    avisar.erro(e, `Não foi possível salvar ${campo === 'legenda' ? 'a legenda' : 'o crédito'}.`)
  }
}

/**
 * Remove a foto — arquivo incluído, do lado da API.
 *
 * Saindo a capa, a próxima da galeria assume no mesmo instante: a matéria não
 * pode ficar sem imagem no card por causa de uma remoção.
 */
async function remover(item: ItemGaleria) {
  if (item.pendente) {
    descartarPendente(item.pendente)
    return
  }

  const foto = item.foto!
  try {
    await $fetch(`/api/posts/${props.postId}/foto`, { method: 'DELETE', params: { imagemId: foto.id } })
    fotos.value = fotos.value.filter(outra => outra.id !== foto.id)
    delete medidas[foto.id]

    if (!foto.capa) {
      avisar.sucesso('Foto removida.')
      return
    }

    const proxima = fotos.value[0]
    if (!proxima) {
      capaUrl.value = null
      avisar.alerta('Foto removida — a matéria ficou sem capa.', 'Envie outra imagem antes de publicar.')
      return
    }

    await aplicarCapa(proxima)
    avisar.sucesso('Foto removida.', 'A próxima da galeria virou capa.')
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível remover a foto.')
  }
}

defineExpose({ enviarPendentes })
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base">Fotos da matéria</CardTitle>
      <CardDescription>
        Toda matéria vai ao ar com foto. A primeira enviada vira a capa; o gradiente do bloco
        "Capa reserva" só entra enquanto não houver imagem.
      </CardDescription>
    </CardHeader>

    <CardContent class="flex flex-col gap-4">
      <!-- O campo fica fora da área clicável de propósito: dentro dela, o
           clique que ele mesmo dispara voltaria para o `@click` do contêiner e
           se chamaria sem fim. -->
      <input
        ref="campoArquivo"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        class="hidden"
        @change="aoEscolher"
      >

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div class="flex flex-col gap-3">
          <!-- Quadro grande: é a foto no tamanho e no corte em que o portal publica -->
          <div
            class="relative aspect-video w-full overflow-hidden rounded-xl transition-colors"
            :class="destaque
              ? 'border border-border bg-neutral-900'
              : `flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed p-6 text-center ${arrastando ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/60 hover:bg-muted/40'}`"
            @click="destaque || campoArquivo?.click()"
            @dragover.prevent="arrastando = true"
            @dragenter.prevent="arrastando = true"
            @dragleave.prevent="arrastando = false"
            @drop.prevent="aoSoltar"
          >
            <template v-if="destaque">
              <img
                :src="destaque.url"
                :alt="destaque.legenda || titulo || 'Foto da matéria'"
                class="size-full"
                :class="verInteira ? 'object-contain' : 'object-cover'"
              >

              <!-- Fora do tracejado é o que o corte 16:9 descarta. -->
              <div
                v-if="verInteira && destaque.medida"
                class="pointer-events-none absolute border-2 border-dashed border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                :style="areaSegura(destaque.medida)"
              />

              <span
                v-if="destaque.capa"
                class="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
              >
                <StarIcon class="size-3.5" /> Capa da matéria
              </span>
              <span
                v-else-if="destaque.pendente"
                class="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white"
              >
                Na fila — sobe ao criar o conteúdo
              </span>

              <div class="absolute right-3 top-3 flex gap-2">
                <Button
                  v-if="destaque.foto && !destaque.capa"
                  type="button"
                  variant="secondary"
                  size="sm"
                  @click="destaque.foto && definirCapa(destaque.foto)"
                >
                  <StarIcon class="size-4" /> Usar como capa
                </Button>
                <Button type="button" variant="destructive" size="sm" @click="remover(destaque)">
                  <Trash2Icon class="size-4" />
                  {{ destaque.pendente ? 'Tirar da fila' : 'Remover' }}
                </Button>
              </div>

              <span
                v-if="destaque.medida"
                class="absolute bottom-3 left-3 rounded bg-black/65 px-2 py-1 font-mono text-[11px] text-white"
              >
                {{ rotuloMedida(destaque.medida) }}
              </span>

              <span
                v-if="enviando"
                class="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 text-sm font-medium text-white"
              >
                <LoaderCircleIcon class="size-5 animate-spin" /> Enviando…
              </span>
            </template>

            <template v-else>
              <LoaderCircleIcon v-if="enviando" class="size-10 animate-spin text-primary" />
              <UploadCloudIcon v-else class="size-10 text-muted-foreground" />
              <p class="text-base font-medium">
                {{ enviando ? 'Enviando…' : 'Arraste a foto aqui ou clique para escolher' }}
              </p>
              <p class="max-w-sm text-xs text-muted-foreground">
                Pode mandar várias de uma vez — JPEG, PNG, WebP ou GIF, até {{ PESO_MAXIMO_MB }} MB cada.
                A primeira vira a capa.
              </p>
              <Button type="button" size="sm" class="mt-1" :disabled="enviando" @click.stop="campoArquivo?.click()">
                <ImagePlusIcon class="size-4" /> Escolher fotos
              </Button>
              <p v-if="!postId" class="text-xs text-muted-foreground">
                A matéria ainda não existe: o que você escolher agora sobe sozinho ao criar o conteúdo.
              </p>
            </template>
          </div>

          <!-- Avisos e textos da foto em destaque -->
          <div v-if="destaque" class="flex flex-col gap-2">
            <div v-if="destaque.analise" class="flex flex-col gap-1 text-xs leading-snug">
              <!-- Corte e resolução são problemas independentes: a foto de
                   celular costuma ter os dois, e esconder um atrás do outro
                   faria a redação corrigir metade. -->
              <p
                class="flex items-start gap-1.5"
                :class="destaque.analise.exata ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'"
              >
                <TriangleAlertIcon v-if="!destaque.analise.exata" class="mt-px size-3.5 shrink-0" />
                <span v-if="destaque.analise.exata">
                  Está em 16:9: entra inteira, sem corte.
                </span>
                <span v-else>
                  O portal corta {{ destaque.analise.percentual }}% {{ destaque.analise.eixo }}
                  para chegar em 16:9 — confira no botão "ver imagem inteira".
                </span>
              </p>
              <p v-if="destaque.analise.pequena" class="flex items-start gap-1.5 text-amber-600 dark:text-amber-400">
                <TriangleAlertIcon class="mt-px size-3.5 shrink-0" />
                <span>Menor que {{ MINIMA.largura }} × {{ MINIMA.altura }} px — pode sair borrada na capa.</span>
              </p>
            </div>

            <div class="grid gap-2 sm:grid-cols-2">
              <Input
                :model-value="destaque.legenda"
                placeholder="Legenda (aparece sob a foto)"
                class="h-9 text-sm"
                @update:model-value="editarTexto(destaque, 'legenda', String($event))"
                @change="confirmarTexto(destaque, 'legenda', ($event.target as HTMLInputElement).value)"
              />
              <Input
                :model-value="destaque.credito"
                placeholder="Crédito — Foto: Maria Silva"
                class="h-9 text-sm"
                @update:model-value="editarTexto(destaque, 'credito', String($event))"
                @change="confirmarTexto(destaque, 'credito', ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </div>

        <!-- O tamanho certo, ao lado de onde a foto é escolhida -->
        <aside class="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4">
          <div class="flex justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-background p-2">
            <div class="flex aspect-video w-full flex-col items-center justify-center rounded-md bg-linear-to-br from-primary/25 to-primary/5 text-center">
              <span class="font-mono text-xs font-semibold">{{ IDEAL.largura }} × {{ IDEAL.altura }}</span>
              <span class="text-[10px] uppercase tracking-wide text-muted-foreground">16:9 — o corte do portal</span>
            </div>
          </div>

          <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-xs">
            <dt class="text-muted-foreground">Ideal</dt>
            <dd class="font-medium">{{ IDEAL.largura }} × {{ IDEAL.altura }} px</dd>
            <dt class="text-muted-foreground">Mínimo</dt>
            <dd class="font-medium">{{ MINIMA.largura }} × {{ MINIMA.altura }} px</dd>
            <dt class="text-muted-foreground">Proporção</dt>
            <dd class="font-medium">16:9 (paisagem)</dd>
            <dt class="text-muted-foreground">Peso</dt>
            <dd class="font-medium">até {{ PESO_MAXIMO_MB }} MB</dd>
            <dt class="text-muted-foreground">Formatos</dt>
            <dd class="font-medium">JPEG, PNG, WebP, GIF</dd>
          </dl>

          <p class="text-xs leading-relaxed text-muted-foreground">
            Fora de 16:9 a foto não é recusada — ela é <strong>cortada pelo centro</strong> nos cards
            e no topo da matéria. Deixe o assunto no meio do quadro e não cole texto nas bordas.
          </p>
        </aside>
      </div>

      <!-- Tira de miniaturas: clicar abre a foto no quadro grande -->
      <div v-if="galeria.length" class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="text-sm font-medium">
            {{ fotos.length }} {{ fotos.length === 1 ? 'foto enviada' : 'fotos enviadas' }}
            <span v-if="pendentes.length" class="text-muted-foreground">· {{ pendentes.length }} na fila</span>
          </p>
          <label class="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <Switch :model-value="verInteira" @update:model-value="verInteira = $event" />
            Ver imagem inteira, com a área aproveitada marcada
          </label>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in galeria"
            :key="item.chave"
            type="button"
            class="group relative aspect-video w-28 overflow-hidden rounded-lg border-2 bg-neutral-900 transition"
            :class="item.chave === destaque?.chave
              ? 'border-primary'
              : item.pendente ? 'border-dashed border-amber-400/70 hover:border-amber-400' : 'border-transparent hover:border-input'"
            :title="item.capa ? 'Capa da matéria' : item.pendente ? 'Na fila' : 'Abrir no quadro grande'"
            @click="emDestaque = item.chave"
          >
            <img :src="item.url" alt="" class="size-full object-cover">
            <StarIcon
              v-if="item.capa"
              class="absolute left-1 top-1 size-4 rounded-full bg-primary p-0.5 text-primary-foreground"
            />
          </button>

          <button
            type="button"
            class="flex aspect-video w-28 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input text-xs text-muted-foreground transition hover:border-primary/60 hover:bg-muted/40"
            :disabled="enviando"
            @click="campoArquivo?.click()"
          >
            <ImagePlusIcon class="size-5" />
            Mais fotos
          </button>
        </div>
      </div>

      <div
        v-else
        class="flex items-center gap-2 rounded-lg border border-amber-300/70 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
      >
        <ImageOffIcon class="size-4 shrink-0" />
        Esta matéria ainda está sem foto — o card iria ao ar com o gradiente reserva.
      </div>
    </CardContent>
  </Card>
</template>
