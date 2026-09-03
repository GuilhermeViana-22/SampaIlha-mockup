<script setup lang="ts">
import {
  ArrowLeftIcon, ExternalLinkIcon, LoaderCircleIcon, SaveIcon, XIcon,
} from '@lucide/vue'
import type { CapaGradiente, Post, PostImagem, PostInput } from '#shared/types/content'

/** Campos que o formulário edita — o resto (id, leituras, datas) é do servidor. */
type CamposFormulario = Omit<PostInput, 'imagens' | 'caminho' | 'categoriaNome' | 'categoriaIcone' | 'categoriaCor' | 'regiaoNome'>
import { CAPAS, ICONES, STATUS_POST, TIPOS_CONTEUDO, gerarSlug, rotuloDoIcone } from '#shared/utils/taxonomia'

/** Formulário único de criação e edição de conteúdo. */
const props = defineProps<{ post?: Post | null }>()

const posts = usePostsStore()
const portal = usePortalStore()
const rota = useRoute()

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
const fotos = ref<PostImagem[]>([...(props.post?.imagens ?? [])])
/** O bloco de fotos guarda a fila do que foi escolhido antes de a matéria existir. */
const blocoFotos = ref<{ enviarPendentes: (postId: string) => Promise<void> } | null>(null)
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
 * Grava o conteúdo — cria na primeira vez, atualiza nas seguintes.
 *
 * `publicar` é o botão "Salvar e publicar". Vale lembrar que pedir publicação
 * não garante publicação: vindo de um editor, a API devolve o texto como
 * `em_revisao`. Por isso o aviso do fim olha o status que voltou do servidor, e
 * não o que foi enviado — é a diferença entre avisar a verdade e mentir para
 * quem acabou de clicar.
 *
 * Só há redirecionamento na criação: depois de existir um id, a matéria ganha a
 * própria URL de edição — e é neste ponto que as fotos escolhidas antes de ela
 * existir finalmente têm onde ser anexadas.
 */
async function salvar(publicar = false) {
  if (!form.titulo.trim()) {
    avisar.alerta('Dê um título ao conteúdo antes de salvar.')
    return
  }

  if (publicar) form.status = 'publicado'

  const dados: Partial<PostInput> = {
    ...toRaw(form),
    tempoLeitura: form.tempoLeitura || Math.max(1, Math.round(palavras.value / 200)),
  }

  const criando = !edicao.value

  const salvo = criando
    ? await posts.criar(dados)
    : await posts.atualizar(props.post!.id, dados)

  if (!salvo) {
    avisar.falha(posts.erro ?? 'Não foi possível salvar.', 'Nada foi gravado — o texto continua aqui na tela.')
    return
  }

  // Mantém a tela em sincronia com o que o servidor de fato gravou (status,
  // slug e tempo de leitura podem voltar diferentes do que foi enviado).
  form.status = salvo.status
  form.slug = salvo.slug

  if (publicar && salvo.status === 'em_revisao') {
    avisar.alerta(
      'Salvo e enviado para revisão.',
      'Publicar é decisão do editor-chefe — o texto entrou na fila de validação.',
    )
  }
  else if (salvo.status === 'publicado') {
    avisar.sucesso(criando ? 'Conteúdo criado e publicado.' : 'Alterações salvas e no ar.')
  }
  else {
    avisar.sucesso(criando ? 'Conteúdo criado.' : 'Alterações salvas.', 'Continua como rascunho, fora do ar.')
  }

  // As fotos escolhidas antes de existir a matéria só têm onde ser anexadas
  // agora — e sobem antes da navegação para já aparecerem na tela de edição.
  if (criando) {
    await blocoFotos.value?.enviarPendentes(salvo.id)
    await navigateTo(`/admin/posts/${salvo.id}`)
  }
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
      <!-- Fotos primeiro: a capa é decisão de pauta, não acabamento do fim. -->
      <AdminPostsFotos
        ref="blocoFotos"
        v-model:fotos="fotos"
        v-model:capa-url="form.imagemUrl"
        :post-id="post?.id"
        :titulo="form.titulo"
      />

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
          <CardTitle class="text-base">Capa reserva</CardTitle>
          <CardDescription>
            O gradiente e o ícone que seguram o card enquanto a matéria não tiver foto.
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
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

          <div class="grid gap-2">
            <div class="flex items-baseline justify-between">
              <Label>Ícone</Label>
              <span class="text-xs text-muted-foreground">{{ rotuloDoIcone(form.icone) }}</span>
            </div>
            <div class="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto rounded-lg border border-border p-2 sm:grid-cols-6 lg:grid-cols-8">
              <button
                v-for="icone in ICONES"
                :key="icone.valor"
                type="button"
                class="flex flex-col items-center gap-1 rounded-md border px-1 py-2 text-center transition"
                :class="form.icone === icone.valor
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-transparent hover:border-input hover:bg-muted'"
                @click="form.icone = icone.valor"
              >
                <i :class="icone.valor" class="text-base" />
                <span class="w-full truncate text-[10px] leading-4 text-muted-foreground">{{ icone.rotulo }}</span>
              </button>
            </div>
          </div>

          <div class="grid gap-2">
            <Label for="imagem">URL da capa</Label>
            <Input
              id="imagem"
              :model-value="form.imagemUrl ?? ''"
              placeholder="https://…"
              @update:model-value="form.imagemUrl = String($event) || null"
            />
            <p class="text-xs text-muted-foreground">
              Preenchida sozinha pela foto escolhida como capa. Só edite para apontar
              uma imagem hospedada fora do portal.
            </p>
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
