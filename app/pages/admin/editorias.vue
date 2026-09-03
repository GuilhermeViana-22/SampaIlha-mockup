<script setup lang="ts">
import { LoaderCircleIcon, PlusIcon, TagsIcon, Trash2Icon } from '@lucide/vue'
import type { BadgeCor, Categoria } from '#shared/types/content'
import { ICONES } from '#shared/utils/taxonomia'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Editorias',
  descricao: 'As seções em que o conteúdo do portal é organizado.',
  acao: null,
})
useSeoMeta({ title: 'Editorias — Painel Sampa na Ilha', robots: 'noindex, nofollow' })

const auth = useAuthStore()
const portal = usePortalStore()

if (!auth.ehChefe) {
  throw createError({ statusCode: 403, statusMessage: 'Só o editor-chefe mexe nas editorias.', fatal: true })
}

await portal.carregarTaxonomia()

const abrindo = ref(false)
const salvando = ref(false)
const nova = reactive({
  nome: '',
  icone: 'fas fa-newspaper',
  cor: 'blue' as BadgeCor,
  descricao: '',
  destaqueNoMenu: true,
})

const CORES: BadgeCor[] = ['blue', 'cyan', 'red', 'green', 'purple', 'gold', 'gray']

const podeCriar = computed(() => nova.nome.trim().length >= 2)

/** Prévia do slug: é o que vai virar /categoria/<slug> no site. */
const slugPrevisto = computed(() =>
  nova.nome.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, ''))

/**
 * Cria a editoria e recarrega a taxonomia.
 *
 * O formulário só é limpo depois de a API confirmar — um nome repetido faria a
 * redação redigitar tudo se a limpeza viesse antes. A recarga forçada é o que
 * traz o slug definitivo, que pode sair diferente da prévia quando já existe
 * outra editoria com nome parecido.
 */
async function criar() {
  if (!podeCriar.value || salvando.value) return

  const nome = nova.nome.trim()
  salvando.value = true

  try {
    await $fetch('/api/taxonomia/categorias', { method: 'POST', body: { ...nova } })
    await portal.carregarTaxonomia(true)

    Object.assign(nova, { nome: '', icone: 'fas fa-newspaper', cor: 'blue', descricao: '', destaqueNoMenu: true })
    abrindo.value = false

    avisar.sucesso(`Editoria “${nome}” criada.`, `Já aparece no site em /categoria/${slugPrevisto.value}.`)
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível criar a editoria.', 'O formulário continua preenchido.')
  }
  finally {
    salvando.value = false
  }
}

/**
 * Remove a editoria.
 *
 * A API recusa enquanto houver conteúdo classificado nela — e essa recusa vem
 * com o motivo escrito, que `avisar.erro` mostra no lugar do texto genérico.
 * Isso é um alerta, não uma falha do sistema: quem clicou precisa mover as
 * matérias antes.
 */
async function remover(categoria: Categoria) {
  const temConteudo = (categoria.totalPosts ?? 0) > 0

  try {
    await $fetch(`/api/taxonomia/categorias/${categoria.id}`, { method: 'DELETE' })
    await portal.carregarTaxonomia(true)

    avisar.sucesso(
      `Editoria “${categoria.nome}” removida.`,
      `A seção /categoria/${categoria.slug} deixou de existir no site.`,
    )
  }
  catch (e: unknown) {
    if (temConteudo) {
      avisar.alerta(
        mensagemDoErro(e, `“${categoria.nome}” ainda tem conteúdo.`),
        'Mova essas matérias para outra editoria e tente de novo.',
      )
    }
    else {
      avisar.erro(e, 'Não foi possível remover a editoria.')
    }
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-3 sm:grid-cols-3">
      <AdminDashboardCardEstatistica
        rotulo="Editorias"
        :valor="portal.categorias.length"
        descricao="Seções do portal"
        :icone="TagsIcon"
        tom="destaque"
      />
    </div>

    <Card>
      <CardHeader>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle class="text-base">Nova editoria</CardTitle>
            <CardDescription>
              Vira uma seção do site em <code>/categoria/&lt;slug&gt;</code> e uma opção no formulário de matéria.
            </CardDescription>
          </div>
          <Button size="sm" :variant="abrindo ? 'ghost' : 'default'" @click="abrindo = !abrindo">
            <PlusIcon class="size-4" /> {{ abrindo ? 'Cancelar' : 'Criar editoria' }}
          </Button>
        </div>
      </CardHeader>

      <CardContent v-if="abrindo" class="flex flex-col gap-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="grid gap-2">
            <Label for="c-nome">Nome</Label>
            <Input id="c-nome" v-model="nova.nome" placeholder="Ex.: Educação" />
            <p v-if="slugPrevisto" class="text-xs text-muted-foreground">
              Endereço: <code>/categoria/{{ slugPrevisto }}</code>
            </p>
          </div>
          <div class="grid gap-2">
            <Label for="c-desc">Descrição</Label>
            <Input id="c-desc" v-model="nova.descricao" placeholder="Uma linha sobre o que entra aqui." />
          </div>
        </div>

        <div class="grid gap-2">
          <Label>Ícone</Label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="icone in ICONES"
              :key="icone.valor"
              type="button"
              class="flex size-9 items-center justify-center rounded-md border text-sm transition"
              :class="nova.icone === icone.valor
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input hover:bg-muted'"
              :title="icone.rotulo"
              @click="nova.icone = icone.valor"
            >
              <i :class="icone.valor" />
            </button>
          </div>
        </div>

        <div class="grid gap-2">
          <Label>Cor do selo</Label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="cor in CORES"
              :key="cor"
              type="button"
              class="rounded-md border px-3 py-1.5 text-xs font-semibold capitalize transition"
              :class="nova.cor === cor ? 'border-primary ring-2 ring-primary/30' : 'border-input hover:bg-muted'"
              @click="nova.cor = cor"
            >
              {{ cor }}
            </button>
          </div>
        </div>

        <label class="flex items-center gap-2 text-sm">
          <Checkbox :model-value="nova.destaqueNoMenu" @update:model-value="nova.destaqueNoMenu = !!$event" />
          Mostrar na barra de categorias do topo do site
        </label>
      </CardContent>

      <CardFooter v-if="abrindo">
        <Button :disabled="salvando || !podeCriar" @click="criar()">
          <LoaderCircleIcon v-if="salvando" class="size-4 animate-spin" />
          <PlusIcon v-else class="size-4" />
          Criar editoria
        </Button>
      </CardFooter>
    </Card>

    <Card class="overflow-hidden py-0">
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Editoria</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>No topo</TableHead>
              <TableHead class="text-right">Conteúdos</TableHead>
              <TableHead class="w-20 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="categoria in portal.categorias" :key="categoria.slug">
              <TableCell>
                <div class="flex items-center gap-2 font-medium">
                  <i :class="categoria.icone" class="text-muted-foreground" />
                  {{ categoria.nome }}
                </div>
                <div v-if="categoria.descricao" class="text-xs text-muted-foreground">
                  {{ categoria.descricao }}
                </div>
              </TableCell>
              <TableCell class="text-xs text-muted-foreground">/categoria/{{ categoria.slug }}</TableCell>
              <TableCell>
                <Badge :variant="categoria.destaqueNoMenu ? 'secondary' : 'outline'">
                  {{ categoria.destaqueNoMenu ? 'Sim' : 'Não' }}
                </Badge>
              </TableCell>
              <TableCell class="text-right tabular-nums">{{ categoria.totalPosts ?? 0 }}</TableCell>
              <TableCell class="text-right">
                <AlertDialog>
                  <AlertDialogTrigger as-child>
                    <Button variant="ghost" size="sm" title="Remover editoria">
                      <Trash2Icon class="size-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover a editoria “{{ categoria.nome }}”?</AlertDialogTitle>
                      <AlertDialogDescription>
                        <template v-if="categoria.totalPosts">
                          Ela ainda tem {{ categoria.totalPosts }} conteúdo(s). Mova essas matérias para
                          outra editoria antes — a remoção será recusada enquanto houver conteúdo aqui.
                        </template>
                        <template v-else>
                          A seção <code>/categoria/{{ categoria.slug }}</code> deixa de existir no site.
                        </template>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction @click="remover(categoria)">Remover</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  </div>
</template>
