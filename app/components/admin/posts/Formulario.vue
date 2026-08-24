<script setup lang="ts">
import {
  ArrowLeftIcon, ExternalLinkIcon, ImagePlusIcon, LoaderCircleIcon, SaveIcon, Trash2Icon, XIcon,
} from '@lucide/vue'
import { toast } from 'vue-sonner'
import type { CapaGradiente, Post, PostImagem, PostInput } from '#shared/types/content'

/** Campos que o formulário edita — o resto (id, leituras, datas) é do servidor. */
type CamposFormulario = Omit<PostInput, 'imagens' | 'caminho' | 'categoriaNome' | 'categoriaIcone' | 'categoriaCor' | 'regiaoNome'>
import { CAPAS, STATUS_POST, TIPOS_CONTEUDO, gerarSlug } from '#shared/utils/taxonomia'

/** Formulário único de criação e edição de conteúdo. */
const props = defineProps<{ post?: Post | null }>()

const posts = usePostsStore()
const portal = usePortalStore()
const rota = useRoute()

const ICONES_SUGERIDOS = [
  'fas fa-newspaper', 'fas fa-umbrella-beach', 'fas fa-theater-masks', 'fas fa-music',
  'fas fa-drum', 'fas fa-leaf', 'fas fa-utensils', 'fas fa-futbol', 'fas fa-fish',
  'fas fa-ship', 'fas fa-tree', 'fas fa-sun', 'fas fa-lightbulb', 'fas fa-route',
  'fas fa-circle-info', 'fas fa-briefcase', 'fas fa-hands-helping', 'fas fa-palette',
]

function estadoInicial(): CamposFormulario {
  const tipoDaQuery = rota.query.tipo as PostInput['tipo'] | undefined
  return {
    tipo: props.post?.tipo ?? tipoDaQuery ?? 'noticia',
    status: props.post?.status ?? 'rascunho',
    titulo: props.post?.titulo ?? '',
    slug: props.post?.slug ?? '',
    resumo: props.post?.resumo ?? '',
    conteudo: props.post?.conteudo ?? '',
    categoria: props.post?.categoria ?? 'cotidiano',
    regiao: props.post?.regiao ?? null,
    autor: props.post?.autor ?? 'Redação Portal',
    icone: props.post?.icone ?? 'fas fa-newspaper',
    capa: props.post?.capa ?? 'bg-1',
    imagemUrl: props.post?.imagemUrl ?? null,
    destaque: props.post?.destaque ?? false,
    tags: [...(props.post?.tags ?? [])],
    tempoLeitura: props.post?.tempoLeitura ?? 3,
    publicadoEm: props.post?.publicadoEm ?? new Date().toISOString(),
  }
}

const form = reactive<CamposFormulario>(estadoInicial())
const novaTag = ref('')
const enviandoFoto = ref(false)
const campoArquivo = ref<HTMLInputElement | null>(null)
const fotos = ref<PostImagem[]>([...(props.post?.imagens ?? [])])
const slugManual = ref(!!props.post)
const dataPublicacao = ref(paraInputDataHora(form.publicadoEm))

// Slug acompanha o título enquanto não for editado à mão.
watch(() => form.titulo, (titulo) => {
  if (!slugManual.value) form.slug = gerarSlug(titulo)
})

watch(dataPublicacao, (valor) => {
  if (valor) form.publicadoEm = new Date(valor).toISOString()
})

// Sugere o ícone da editoria escolhida quando o ícone ainda é o padrão.
watch(() => form.categoria, (slug) => {
  const categoria = portal.categoria(slug)
  if (categoria && form.icone === 'fas fa-newspaper') form.icone = categoria.icone
})

const palavras = computed(() =>
  form.conteudo
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length)
const edicao = computed(() => !!props.post)
const regiaoSelecionada = computed({
  get: () => form.regiao ?? 'nacional',
  set: (valor: string) => { form.regiao = valor === 'nacional' ? null : valor },
})

function adicionarTag() {
  const tag = novaTag.value.trim()
  if (tag && !form.tags.includes(tag)) form.tags.push(tag)
  novaTag.value = ''
}

function removerTag(tag: string) {
  form.tags = form.tags.filter(t => t !== tag)
}

/**
 * Toda matéria deve subir com foto. O arquivo vai para a API (que valida o
 * conteúdo real da imagem) e a primeira foto enviada vira a capa.
 */
async function enviarFoto(evento: Event) {
  const arquivo = (evento.target as HTMLInputElement).files?.[0]
  if (!arquivo) return

  if (!edicao.value) {
    toast.error('Salve o conteúdo primeiro — a foto é anexada à matéria já criada.')
    return
  }

  enviandoFoto.value = true
  try {
    const corpo = new FormData()
    corpo.append('file', arquivo)
    corpo.append('set_as_cover', String(fotos.value.length === 0))

    const foto = await $fetch<PostImagem>(`/api/posts/${props.post!.id}/foto`, { method: 'POST', body: corpo })
    fotos.value.push(foto)
    if (foto.capa) form.imagemUrl = foto.url
    toast.success('Foto enviada.')
  }
  catch (e: any) {
    toast.error(e?.data?.statusMessage ?? 'Não foi possível enviar a foto.')
  }
  finally {
    enviandoFoto.value = false
    if (campoArquivo.value) campoArquivo.value.value = ''
  }
}

async function removerFoto(foto: PostImagem) {
  try {
    await $fetch(`/api/posts/${props.post!.id}/foto`, { method: 'DELETE', params: { imagemId: foto.id } })
    fotos.value = fotos.value.filter(item => item.id !== foto.id)
    if (form.imagemUrl === foto.url) form.imagemUrl = fotos.value[0]?.url ?? null
    toast.success('Foto removida.')
  }
  catch (e: any) {
    toast.error(e?.data?.statusMessage ?? 'Não foi possível remover a foto.')
  }
}

async function salvar(publicar = false) {
  if (!form.titulo.trim()) {
    toast.error('Dê um título ao conteúdo antes de salvar.')
    return
  }
  if (publicar) form.status = 'publicado'

  const dados: Partial<PostInput> = {
    ...toRaw(form),
    tempoLeitura: form.tempoLeitura || Math.max(1, Math.round(palavras.value / 200)),
  }

  const salvo = edicao.value
    ? await posts.atualizar(props.post!.id, dados)
    : await posts.criar(dados)

  if (!salvo) {
    toast.error(posts.erro ?? 'Não foi possível salvar.')
    return
  }

  toast.success(edicao.value ? 'Alterações salvas.' : 'Conteúdo criado.')
  if (!edicao.value) await navigateTo(`/admin/posts/${salvo.id}`)
}

// Espalha o objeto reativo (não `toRaw`), senão o computed não acompanha as edições.
const previa = computed<Post>(() => ({
  ...form,
  id: props.post?.id ?? 'previa',
  leituras: props.post?.leituras ?? 0,
  atualizadoEm: new Date().toISOString(),
  categoriaNome: portal.categoria(form.categoria)?.nome ?? form.categoria,
  categoriaIcone: portal.categoria(form.categoria)?.icone ?? 'fas fa-tag',
  categoriaCor: portal.categoria(form.categoria)?.cor ?? 'blue',
  regiaoNome: form.regiao ? (portal.regiao(form.regiao)?.nome ?? form.regiao) : null,
  imagens: fotos.value,
  caminho: caminhoDoPost({ tipo: form.tipo, slug: form.slug ?? '' }),
} as Post))
</script>

<template>
  <form class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]" @submit.prevent="salvar()">
    <!-- Coluna principal -->
    <div class="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Conteúdo</CardTitle>
          <CardDescription>Título, resumo e corpo do texto publicado no portal.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <Label for="titulo">Título</Label>
              <span class="text-xs" :class="form.titulo.length > 120 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'">
                {{ form.titulo.length }} caracteres
              </span>
            </div>
            <Textarea
              id="titulo"
              v-model="form.titulo"
              rows="2"
              class="font-serif text-lg leading-snug"
              placeholder="Ex.: Festival de Parintins bate recorde de público na edição de 2026"
              required
            />
          </div>

          <div class="grid gap-2">
            <Label for="slug">Endereço (slug)</Label>
            <div class="flex items-center gap-2">
              <span class="shrink-0 text-xs text-muted-foreground">/{{ form.tipo === 'noticia' ? 'noticias' : form.tipo === 'dica' ? 'dicas' : 'informacoes' }}/</span>
              <Input id="slug" v-model="form.slug" class="font-mono text-xs" @input="slugManual = true" />
            </div>
          </div>

          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <Label for="resumo">Resumo</Label>
              <span class="text-xs" :class="(form.resumo?.length ?? 0) > 300 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'">
                {{ form.resumo?.length ?? 0 }}/500
              </span>
            </div>
            <Textarea
              id="resumo"
              v-model="form.resumo"
              rows="4"
              maxlength="500"
              placeholder="Uma ou duas frases — é o que aparece nos cards, na busca e na prévia das redes sociais."
            />
          </div>

          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <Label for="conteudo">Texto</Label>
              <span class="text-xs text-muted-foreground">
                {{ palavras }} palavras · ~{{ Math.max(1, Math.round(palavras / 200)) }} min de leitura
              </span>
            </div>
            <AdminPostsEditor v-model="form.conteudo" :post-id="post?.id" />
            <p class="text-xs text-muted-foreground">
              Formate pela barra do editor. Para inserir fotos no meio do texto, use o botão de
              imagem — elas ficam guardadas junto da matéria.
              <template v-if="!post">
                O envio de imagens fica disponível depois de salvar o conteúdo pela primeira vez.
              </template>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">Classificação</CardTitle>
          <CardDescription>Onde este conteúdo aparece dentro do portal.</CardDescription>
        </CardHeader>
        <CardContent class="grid gap-4 sm:grid-cols-2">
          <div class="grid gap-2">
            <Label>Tipo</Label>
            <Select v-model="form.tipo">
              <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="tipo in TIPOS_CONTEUDO" :key="tipo.valor" :value="tipo.valor">
                  {{ tipo.rotulo }} — {{ tipo.descricao }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid gap-2">
            <Label>Editoria</Label>
            <Select v-model="form.categoria">
              <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="categoria in portal.categorias" :key="categoria.slug" :value="categoria.slug">
                  {{ categoria.nome }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid gap-2">
            <Label>Região</Label>
            <Select v-model="regiaoSelecionada">
              <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nacional">Sem região específica</SelectItem>
                <SelectItem v-for="regiao in portal.regioes" :key="regiao.slug" :value="regiao.slug">
                  {{ regiao.nome }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid gap-2">
            <Label for="autor">Autoria</Label>
            <Input id="autor" v-model="form.autor" placeholder="Redação Portal" />
          </div>

          <div class="grid gap-2 sm:col-span-2">
            <Label for="tags">Tags</Label>
            <div class="flex flex-wrap items-center gap-2 rounded-md border border-input p-2">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium"
              >
                {{ tag }}
                <button type="button" class="text-muted-foreground hover:text-destructive" @click="removerTag(tag)">
                  <XIcon class="size-3" />
                </button>
              </span>
              <input
                id="tags"
                v-model="novaTag"
                class="min-w-[140px] flex-1 bg-transparent px-1 text-sm outline-none"
                placeholder="Digite e pressione Enter"
                @keydown.enter.prevent="adicionarTag()"
                @keydown.,.prevent="adicionarTag()"
                @blur="adicionarTag()"
              >
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">Fotos da matéria</CardTitle>
          <CardDescription>
            Toda matéria vai ao ar com foto. A primeira enviada vira a capa; o gradiente abaixo
            é só o reserva enquanto não houver imagem.
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <div v-if="fotos.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <figure v-for="foto in fotos" :key="foto.id" class="group relative overflow-hidden rounded-lg border border-border">
              <img :src="foto.url" :alt="foto.legenda ?? form.titulo" class="aspect-video w-full object-cover">
              <figcaption
                v-if="foto.capa"
                class="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground"
              >
                Capa
              </figcaption>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                class="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                title="Remover foto"
                @click="removerFoto(foto)"
              >
                <Trash2Icon class="size-4" />
              </Button>
            </figure>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <input
              ref="campoArquivo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="hidden"
              @change="enviarFoto"
            >
            <Button type="button" variant="outline" :disabled="enviandoFoto" @click="campoArquivo?.click()">
              <LoaderCircleIcon v-if="enviandoFoto" class="size-4 animate-spin" />
              <ImagePlusIcon v-else class="size-4" />
              {{ enviandoFoto ? 'Enviando…' : 'Enviar foto' }}
            </Button>
            <p v-if="!edicao" class="text-xs text-muted-foreground">
              Disponível depois de criar o conteúdo.
            </p>
            <p v-else-if="!fotos.length" class="text-xs text-amber-600 dark:text-amber-400">
              Esta matéria ainda está sem foto.
            </p>
          </div>

          <Separator />

          <div class="grid grid-cols-5 gap-2 sm:grid-cols-10">
            <button
              v-for="capa in CAPAS"
              :key="capa.valor"
              type="button"
              :title="capa.rotulo"
              class="relative h-12 overflow-hidden rounded-lg ring-offset-2 ring-offset-background transition-all"
              :class="form.capa === capa.valor ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'"
              @click="form.capa = capa.valor as CapaGradiente"
            >
              <span class="img-bg" :class="capa.valor"><i :class="form.icone" /></span>
            </button>
          </div>

          <div class="grid gap-2 sm:grid-cols-2">
            <div class="grid gap-2">
              <Label for="icone">Ícone (Font Awesome)</Label>
              <Input id="icone" v-model="form.icone" list="icones-sugeridos" class="font-mono text-xs" />
              <datalist id="icones-sugeridos">
                <option v-for="icone in ICONES_SUGERIDOS" :key="icone" :value="icone" />
              </datalist>
            </div>
            <div class="grid gap-2">
              <Label for="imagem">URL da imagem (opcional)</Label>
              <Input
                id="imagem"
                :model-value="form.imagemUrl ?? ''"
                placeholder="https://…"
                @update:model-value="form.imagemUrl = String($event) || null"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Coluna lateral: publicação + prévia -->
    <div class="flex flex-col gap-6 xl:sticky xl:top-20 xl:self-start">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Publicação</CardTitle>
          <CardDescription>Status, data e destaque na home.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <div class="grid gap-2">
            <Label>Status</Label>
            <Select v-model="form.status">
              <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="status in STATUS_POST" :key="status.valor" :value="status.valor">
                  {{ status.rotulo }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid gap-2">
            <Label for="data">Data de publicação</Label>
            <Input id="data" v-model="dataPublicacao" type="datetime-local" />
          </div>

          <div class="grid gap-2">
            <Label for="tempo">Tempo de leitura (min)</Label>
            <Input id="tempo" v-model.number="form.tempoLeitura" type="number" min="1" max="60" />
          </div>

          <div class="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p class="text-sm font-medium">Destaque na home</p>
              <p class="text-xs text-muted-foreground">Aparece na vitrine principal.</p>
            </div>
            <Switch :model-value="form.destaque" @update:model-value="form.destaque = $event" />
          </div>

          <div class="flex flex-col gap-2 border-t border-border pt-4">
            <Button type="submit" :disabled="posts.salvando">
              <LoaderCircleIcon v-if="posts.salvando" class="size-4 animate-spin" />
              <SaveIcon v-else class="size-4" />
              {{ edicao ? 'Salvar alterações' : 'Criar conteúdo' }}
            </Button>

            <Button
              v-if="form.status !== 'publicado'"
              type="button"
              variant="secondary"
              :disabled="posts.salvando"
              @click="salvar(true)"
            >
              Salvar e publicar
            </Button>

            <div class="flex gap-2">
              <Button as-child type="button" variant="ghost" size="sm" class="flex-1">
                <NuxtLink to="/admin/posts"><ArrowLeftIcon class="size-4" /> Voltar</NuxtLink>
              </Button>
              <Button
                v-if="edicao && post"
                as-child
                type="button"
                variant="ghost"
                size="sm"
                class="flex-1"
              >
                <NuxtLink :to="caminhoDoPost(post)" target="_blank">
                  <ExternalLinkIcon class="size-4" /> Ver no site
                </NuxtLink>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="overflow-hidden">
        <CardHeader>
          <CardTitle class="text-base">Prévia do card</CardTitle>
          <CardDescription>Como este conteúdo aparece nas listagens.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="rounded-lg bg-[#f5f7fa] p-3 dark:bg-slate-900">
            <DicasCard v-if="form.tipo === 'dica'" :post="previa" />
            <NoticiasCard v-else :post="previa" />
          </div>
        </CardContent>
      </Card>
    </div>
  </form>
</template>
