<script setup lang="ts">
import {
  ArrowLeftIcon, ExternalLinkIcon, LoaderCircleIcon, SaveIcon, XIcon,
} from '@lucide/vue'
import type { CapaGradiente, Guia, GuiaInput } from '#shared/types/content'

/** Campos que o formulário edita — o resto (id, leituras, datas) é do servidor. */
type CamposFormulario = Omit<GuiaInput, 'caminho' | 'categoriaNome'>
import { CAPAS, ICONES, gerarSlug, rotuloDoIcone } from '#shared/utils/taxonomia'

/** Formulário único de criação e edição de guias. */
const props = defineProps<{ guia?: Guia | null }>()

const guias = useGuiasStore()
const portal = usePortalStore()
const rota = useRoute()

function estadoInicial(): CamposFormulario {
  return {
    status: props.guia?.status ?? 'rascunho',
    titulo: props.guia?.titulo ?? '',
    slug: props.guia?.slug ?? '',
    resumo: props.guia?.resumo ?? '',
    conteudo: props.guia?.conteudo ?? '',
    categoria: props.guia?.categoria ?? 'cotidiano',
    autor: props.guia?.autor ?? 'Redação Portal',
    icone: props.guia?.icone ?? 'fas fa-lightbulb',
    capa: props.guia?.capa ?? 'bg-1',
    imagemUrl: props.guia?.imagemUrl ?? null,
    destaque: props.guia?.destaque ?? false,
    tags: [...(props.guia?.tags ?? [])],
    tempoLeitura: props.guia?.tempoLeitura ?? 3,
    publicadoEm: props.guia?.publicadoEm ?? new Date().toISOString(),
  }
}

const form = reactive<CamposFormulario>(estadoInicial())
const novaTag = ref('')
const slugManual = ref(!!props.guia)
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
  if (categoria && form.icone === 'fas fa-lightbulb') form.icone = categoria.icone
})

const palavras = computed(() =>
  form.conteudo
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length)
const edicao = computed(() => !!props.guia)

function adicionarTag() {
  const tag = novaTag.value.trim()
  if (tag && !form.tags.includes(tag)) form.tags.push(tag)
  novaTag.value = ''
}

function removerTag(tag: string) {
  form.tags = form.tags.filter(t => t !== tag)
}

/**
 * Grava o guia — cria na primeira vez, atualiza nas seguintes.
 */
async function salvar(publicar = false) {
  if (!form.titulo.trim()) {
    avisar.alerta('Dê um título ao guia antes de salvar.')
    return
  }

  if (!form.conteudo.trim()) {
    avisar.alerta('Escreva o conteúdo do guia antes de salvar.')
    return
  }

  if (publicar) form.status = 'publicado'

  const dados: GuiaInput = {
    ...form,
    tempoLeitura: Math.ceil(palavras.value / 200),
  }

  guias.salvando = true
  const salvo = props.guia
    ? await guias.atualizar(props.guia.id, dados)
    : await guias.criar(dados)

  guias.salvando = false

  if (!salvo) {
    avisar.falha(guias.erro ?? 'Não foi possível salvar o guia.')
    return
  }

  if (publicar && salvo.status === 'publicado') {
    avisar.sucesso('Guia publicado!', `"${salvo.titulo}" já está no ar.`)
  }
  else if (publicar && salvo.status === 'rascunho') {
    avisar.alerta('Guia salvo como rascunho.', 'A publicação requer aprovação do editor-chefe.')
  }
  else {
    avisar.sucesso('Guia salvo.', 'As alterações foram guardadas no painel.')
  }

  // Redireciona para a página de edição na criação
  if (!edicao.value) {
    await navigateTo(`/admin/guias/${salvo.id}`)
  }
}

function cancelar() {
  if (edicao.value) {
    navigateTo('/admin/guias')
  }
  else {
    navigateTo('/admin/guias')
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Cabeçalho com ações -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" @click="cancelar()">
          <ArrowLeftIcon class="size-4" />
        </Button>
        <div>
          <h1 class="text-xl font-semibold">
            {{ edicao ? 'Editar guia' : 'Novo guia' }}
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ edicao ? 'Ajuste o conteúdo deste guia.' : 'Crie um novo guia para o portal.' }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" :disabled="guias.salvando" @click="salvar(false)">
          <LoaderCircleIcon v-if="guias.salvando" class="size-4 animate-spin" />
          <SaveIcon v-else class="size-4" />
          Salvar rascunho
        </Button>
        <Button :disabled="guias.salvando" @click="salvar(true)">
          <LoaderCircleIcon v-if="guias.salvando" class="size-4 animate-spin" />
          <SaveIcon v-else class="size-4" />
          Salvar e publicar
        </Button>
      </div>
    </div>

    <!-- Formulário principal -->
    <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div class="flex flex-col gap-6">
        <!-- Título e slug -->
        <Card>
          <CardContent class="space-y-4 p-6">
            <div>
              <Label for="titulo">Título *</Label>
              <Input
                id="titulo"
                v-model="form.titulo"
                placeholder="Título do guia"
                class="mt-2"
              />
            </div>
            <div>
              <Label for="slug">Slug (URL)</Label>
              <div class="mt-2 flex gap-2">
                <span class="flex items-center text-sm text-muted-foreground">/guias/</span>
                <Input
                  id="slug"
                  v-model="form.slug"
                  placeholder="slug-do-guia"
                  @focus="slugManual = true"
                />
              </div>
              <p class="mt-1 text-xs text-muted-foreground">
                Deixe em branco para gerar automaticamente a partir do título.
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Resumo e conteúdo -->
        <Card>
          <CardContent class="space-y-4 p-6">
            <div>
              <Label for="resumo">Resumo *</Label>
              <Textarea
                id="resumo"
                v-model="form.resumo"
                placeholder="Breve descrição do guia (aparece nos cards e nas redes sociais)"
                class="mt-2 min-h-[80px]"
                maxlength="160"
              />
              <p class="mt-1 text-xs text-muted-foreground">
                {{ form.resumo.length }}/160 caracteres
              </p>
            </div>
            <div>
              <Label for="conteudo">Conteúdo *</Label>
              <Textarea
                id="conteudo"
                v-model="form.conteudo"
                placeholder="Escreva o conteúdo do guia aqui..."
                class="mt-2 min-h-[400px]"
              />
              <p class="mt-1 text-xs text-muted-foreground">
                {{ palavras }} palavras · ~{{ Math.ceil(palavras / 200) }} min de leitura
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Tags -->
        <Card>
          <CardContent class="space-y-4 p-6">
            <div>
              <Label for="nova-tag">Tags</Label>
              <div class="mt-2 flex gap-2">
                <Input
                  id="nova-tag"
                  v-model="novaTag"
                  placeholder="Adicionar tag..."
                  @keydown.enter.prevent="adicionarTag()"
                />
                <Button type="button" variant="outline" @click="adicionarTag()">
                  Adicionar
                </Button>
              </div>
            </div>
            <div v-if="form.tags.length" class="flex flex-wrap gap-2">
              <Badge
                v-for="tag in form.tags"
                :key="tag"
                variant="secondary"
                class="flex items-center gap-1"
              >
                {{ tag }}
                <button type="button" @click="removerTag(tag)">
                  <XIcon class="size-3" />
                </button>
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Coluna lateral -->
      <div class="flex flex-col gap-6">
        <!-- Status e publicação -->
        <Card>
          <CardContent class="space-y-4 p-6">
            <div>
              <Label for="status">Status</Label>
              <Select v-model="form.status">
                <SelectTrigger id="status" class="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label for="publicado-em">Data de publicação</Label>
              <Input
                id="publicado-em"
                v-model="dataPublicacao"
                type="datetime-local"
                class="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Categoria -->
        <Card>
          <CardContent class="space-y-4 p-6">
            <div>
              <Label for="categoria">Categoria *</Label>
              <Select v-model="form.categoria">
                <SelectTrigger id="categoria" class="mt-2">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="categoria in portal.categorias"
                    :key="categoria.slug"
                    :value="categoria.slug"
                  >
                    {{ categoria.nome }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <!-- Autor -->
        <Card>
          <CardContent class="space-y-4 p-6">
            <div>
              <Label for="autor">Autor</Label>
              <Input
                id="autor"
                v-model="form.autor"
                placeholder="Nome do autor"
                class="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Capa -->
        <Card>
          <CardContent class="space-y-4 p-6">
            <div>
              <Label for="capa">Gradiente da capa</Label>
              <Select v-model="form.capa">
                <SelectTrigger id="capa" class="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="capa in CAPAS" :key="capa.valor" :value="capa.valor">
                    <span class="flex items-center gap-2">
                      <span class="size-4 rounded" :class="capa.valor" />
                      {{ capa.rotulo }}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label for="icone">Ícone</Label>
              <Select v-model="form.icone">
                <SelectTrigger id="icone" class="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="icone in ICONES" :key="icone.valor" :value="icone.valor">
                    <span class="flex items-center gap-2">
                      <i :class="icone.valor" />
                      {{ icone.rotulo }}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <!-- Destaque -->
        <Card>
          <CardContent class="space-y-4 p-6">
            <div class="flex items-center justify-between">
              <Label for="destaque">Destacar na home</Label>
              <Switch id="destaque" v-model:checked="form.destaque" />
            </div>
            <p class="text-xs text-muted-foreground">
              Guias destacados aparecem em destaque na página inicial.
            </p>
          </CardContent>
        </Card>

        <!-- URL da imagem (opcional) -->
        <Card>
          <CardContent class="space-y-4 p-6">
            <div>
              <Label for="imagem-url">URL da imagem (opcional)</Label>
              <Input
                id="imagem-url"
                :model-value="form.imagemUrl ?? ''"
                @update:model-value="form.imagemUrl = ($event as string) || null"
                placeholder="https://..."
                class="mt-2"
              />
              <p class="mt-1 text-xs text-muted-foreground">
                Se não informado, usa o gradiente e ícone selecionados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
