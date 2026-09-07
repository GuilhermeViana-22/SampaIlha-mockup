<script setup lang="ts">
import { LoaderCircleIcon, PlusIcon, TagsIcon, Trash2Icon } from '@lucide/vue'
import type { BadgeCor, Categoria } from '#shared/types/content'
import { ICONES } from '#shared/utils/taxonomia'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Categorias',
  descricao: 'As seções em que o conteúdo do portal é organizado.',
  acao: null,
})
useSeoMeta({ title: 'Categorias — Painel Sampa na Ilha', robots: 'noindex, nofollow' })

const auth = useAuthStore()
const portal = usePortalStore()

if (!auth.ehChefe) {
  throw createError({ statusCode: 403, statusMessage: 'Só o editor-chefe mexe nas categorias.', fatal: true })
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
 * Cria a categoria e recarrega a taxonomia.
 *
 * O formulário só é limpo depois de a API confirmar — um nome repetido faria a
 * redação redigitar tudo se a limpeza viesse antes. A recarga forçada é o que
 * traz o slug definitivo, que pode sair diferente da prévia quando já existe
 * outra categoria com nome parecido.
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

    avisar.sucesso(`Categoria “${nome}” criada.`, `Já aparece no site em /categoria/${slugPrevisto.value}.`)
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível criar a categoria.', 'O formulário continua preenchido.')
  }
  finally {
    salvando.value = false
  }
}

/** Categorias com o interruptor em movimento — trava só a linha, não a tabela. */
const alternando = ref<string[]>([])

/**
 * Liga ou desliga o destaque de uma categoria na barra do topo.
 *
 * A troca é escrita na API e a taxonomia é recarregada: a mesma store alimenta
 * a barra do site e esta tabela, então o menu do portal muda junto, sem
 * recarregar a página.
 *
 * A última editoria em destaque não pode sair — a barra de categorias ficaria
 * só com "Todos", e o site perderia a navegação por editoria inteira.
 */
async function alternarDestaque(categoria: Categoria) {
  const id = categoria.id
  if (!id || alternando.value.includes(id)) return

  const passaASerDestaque = !categoria.destaqueNoMenu

  if (!passaASerDestaque && portal.categoriasDoMenu.length <= 1) {
    avisar.alerta(
      'Esta é a única categoria no topo.',
      'Coloque outra em destaque antes de tirar esta — senão a barra do site fica vazia.',
    )
    return
  }

  alternando.value.push(id)

  try {
    await $fetch(`/api/taxonomia/categorias/${id}`, {
      method: 'PUT',
      body: { destaqueNoMenu: passaASerDestaque },
    })
    await portal.carregarTaxonomia(true)

    avisar.sucesso(
      passaASerDestaque
        ? `“${categoria.nome}” agora aparece no topo do site.`
        : `“${categoria.nome}” saiu do topo do site.`,
      passaASerDestaque
        ? 'Ela entra na barra de categorias e no menu principal.'
        : `A seção /categoria/${categoria.slug} continua no ar, só não fica mais na barra.`,
    )
  }
  catch (e: unknown) {
    avisar.erro(e, `Não foi possível mudar o destaque de “${categoria.nome}”.`)
  }
  finally {
    alternando.value = alternando.value.filter(x => x !== id)
  }
}

/**
 * Remove a categoria.
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
      `Categoria “${categoria.nome}” removida.`,
      `A seção /categoria/${categoria.slug} deixou de existir no site.`,
    )
  }
  catch (e: unknown) {
    if (temConteudo) {
      avisar.alerta(
        mensagemDoErro(e, `“${categoria.nome}” ainda tem conteúdo.`),
        'Mova essas matérias para outra categoria e tente de novo.',
      )
    }
    else {
      avisar.erro(e, 'Não foi possível remover a categoria.')
    }
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-3 sm:grid-cols-3">
      <AdminDashboardCardEstatistica
        rotulo="Categorias"
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
            <CardTitle class="text-base">Nova categoria</CardTitle>
            <CardDescription>
              Vira uma seção do site em <code>/categoria/&lt;slug&gt;</code> e uma opção no formulário de matéria.
            </CardDescription>
          </div>
          <Button size="sm" :variant="abrindo ? 'ghost' : 'default'" @click="abrindo = !abrindo">
            <PlusIcon class="size-4" /> {{ abrindo ? 'Cancelar' : 'Criar categoria' }}
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
          Criar categoria
        </Button>
      </CardFooter>
    </Card>

    <Card class="overflow-hidden py-0">
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
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
                <div class="flex items-center gap-2">
                  <Switch
                    :model-value="categoria.destaqueNoMenu"
                    :disabled="alternando.includes(categoria.id ?? '')"
                    :aria-label="`Mostrar ${categoria.nome} no topo do site`"
                    @update:model-value="alternarDestaque(categoria)"
                  />
                  <span class="text-xs text-muted-foreground">
                    {{ categoria.destaqueNoMenu ? 'No topo' : 'Fora do topo' }}
                  </span>
                </div>
              </TableCell>
              <TableCell class="text-right tabular-nums">{{ categoria.totalPosts ?? 0 }}</TableCell>
              <TableCell class="text-right">
                <AlertDialog>
                  <AlertDialogTrigger as-child>
                    <Button variant="ghost" size="sm" title="Remover categoria">
                      <Trash2Icon class="size-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover a categoria “{{ categoria.nome }}”?</AlertDialogTitle>
                      <AlertDialogDescription>
                        <template v-if="categoria.totalPosts">
                          Ela ainda tem {{ categoria.totalPosts }} conteúdo(s). Mova essas matérias para
                          outra categoria antes — a remoção será recusada enquanto houver conteúdo aqui.
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
