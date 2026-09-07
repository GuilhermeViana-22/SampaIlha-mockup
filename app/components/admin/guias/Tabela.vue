<script setup lang="ts">
import {
  CheckCircle2Icon, ExternalLinkIcon, EyeIcon, EyeOffIcon, FileTextIcon, MoreHorizontalIcon,
  PencilIcon, PlusCircleIcon, StarIcon, Trash2Icon,
} from '@lucide/vue'
import type { Guia } from '#shared/types/content'

/**
 * Tabela de guias com as ações de CRUD.
 */
const guias = useGuiasStore()
const auth = useAuthStore()
const paraExcluir = ref<Guia | null>(null)
const excluindo = ref(false)

/**
 * Publica ou despublica com um clique.
 */
async function alternarStatus(guia: Guia) {
  const atualizado = await guias.alternarStatus(guia)

  if (!atualizado) {
    avisar.falha(guias.erro ?? 'Não foi possível alterar o status.')
    return
  }

  if (atualizado.status === 'publicado') {
    avisar.sucesso('Guia publicado.', `"${guia.titulo}" já está no ar.`)
  }
  else {
    avisar.sucesso('Guia voltou para rascunho.', 'Saiu do ar, mas continua guardado no painel.')
  }
}

/** Liga/desliga o destaque na vitrine da home. Só o editor-chefe. */
async function alternarDestaque(guia: Guia) {
  const atualizado = await guias.alternarDestaque(guia)

  if (!atualizado) {
    avisar.falha(guias.erro ?? 'Não foi possível alterar o destaque.')
    return
  }

  if (atualizado.destaque) avisar.sucesso('Marcado como destaque da home.')
  else avisar.sucesso('Removido dos destaques.')
}

/**
 * Exclusão definitiva do guia.
 */
async function confirmarExclusao() {
  const alvo = paraExcluir.value
  if (!alvo || excluindo.value) return

  excluindo.value = true
  paraExcluir.value = null

  try {
    const excluido = await guias.remover(alvo.id)

    if (excluido) {
      avisar.sucesso(
        `"${alvo.titulo}" foi excluído em definitivo.`,
        'O texto e as leituras saíram do servidor — não há como recuperar.',
      )
    }
    else {
      avisar.falha(guias.erro ?? 'Não foi possível excluir.', 'O guia continua no painel.')
    }
  }
  finally {
    excluindo.value = false
  }
}
</script>

<template>
  <Card class="overflow-hidden py-0">
    <div class="overflow-x-auto">
      <Table class="min-w-[980px] table-fixed">
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead>Guia</TableHead>
            <TableHead class="w-[130px]">Categoria</TableHead>
            <TableHead class="w-[110px]">Status</TableHead>
            <TableHead class="w-[120px]">Publicado</TableHead>
            <TableHead class="w-[90px] text-right">Leituras</TableHead>
            <TableHead class="w-[130px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="guia in guias.listaFiltrada" :key="guia.id">
            <TableCell class="whitespace-normal">
              <div class="flex items-start gap-3">
                <span
                  class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
                  :class="`img-bg ${guia.capa}`"
                  style="position:relative"
                >
                  <i :class="guia.icone" class="text-xs opacity-90" />
                </span>
                <div class="min-w-0">
                  <NuxtLink
                    :to="`/admin/guias/${guia.id}`"
                    class="line-clamp-2 text-sm font-medium hover:text-primary hover:underline"
                  >
                    {{ guia.titulo }}
                  </NuxtLink>
                  <p class="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{{ guia.autor }}</span>
                    <StarIcon v-if="guia.destaque" class="size-3 fill-amber-400 text-amber-400" />
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">{{ guia.categoriaNome }}</TableCell>
            <TableCell><AdminGuiasEtiquetaStatus :status="guia.status" /></TableCell>
            <TableCell class="text-sm text-muted-foreground">{{ formatarDataCurta(guia.publicadoEm) }}</TableCell>
            <TableCell class="text-right text-sm tabular-nums text-muted-foreground">
              {{ formatarNumero(guia.leituras) }}
            </TableCell>

            <TableCell>
              <div class="flex items-center justify-end gap-1">
                <Button as-child variant="ghost" size="icon-sm" title="Editar">
                  <NuxtLink :to="`/admin/guias/${guia.id}`"><PencilIcon class="size-4" /></NuxtLink>
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  :title="guia.status === 'publicado' ? 'Despublicar' : 'Publicar'"
                  @click="alternarStatus(guia)"
                >
                  <EyeOffIcon v-if="guia.status === 'publicado'" class="size-4" />
                  <EyeIcon v-else class="size-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon-sm" title="Mais ações">
                      <MoreHorizontalIcon class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-52">
                    <DropdownMenuItem v-if="auth.ehChefe" @click="alternarDestaque(guia)">
                      <StarIcon class="size-4" />
                      {{ guia.destaque ? 'Remover destaque' : 'Destacar na home' }}
                    </DropdownMenuItem>
                    <DropdownMenuItem as-child>
                      <NuxtLink :to="guia.caminho" target="_blank">
                        <ExternalLinkIcon class="size-4" /> Ver no portal
                      </NuxtLink>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" @click="paraExcluir = guia">
                      <Trash2Icon class="size-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-if="!guias.listaFiltrada.length">
            <TableCell colspan="6" class="py-14 text-center">
              <div class="flex flex-col items-center gap-1">
                <FileTextIcon class="mb-1 size-7 text-muted-foreground/40" />
                <p class="text-sm font-medium">
                  {{ guias.itens.length ? 'Nenhum guia corresponde aos filtros' : 'Ainda não foram cadastrados guias' }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ guias.itens.length
                    ? 'Ajuste os filtros acima para ver outros guias.'
                    : 'Publique o primeiro guia para o portal.' }}
                </p>
                <Button v-if="!guias.itens.length" as-child size="sm" class="mt-3">
                  <NuxtLink to="/admin/guias/novo">
                    <PlusCircleIcon class="size-4" /> Criar o primeiro guia
                  </NuxtLink>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <AlertDialog :open="!!paraExcluir" @update:open="valor => !valor && (paraExcluir = null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir "{{ paraExcluir?.titulo }}" para sempre?</AlertDialogTitle>
          <AlertDialogDescription>
            A exclusão é <strong class="text-foreground">permanente</strong>: o texto e as
            leituras registradas são apagados do servidor e não há como recuperar depois — não existe
            lixeira.
            <template v-if="paraExcluir?.status === 'publicado'">
              O guia também sai do ar na hora, e quem chegar pelo link antigo verá página não
              encontrada.
            </template>
            <br>
            <span class="mt-2 block">
              Se a ideia é apenas tirar do portal, feche este aviso e use
              <strong class="text-foreground">Despublicar</strong>: o guia volta a rascunho e
              continua guardado.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="paraExcluir = null">Cancelar</AlertDialogCancel>
          <Button variant="destructive" :disabled="excluindo" @click="confirmarExclusao()">
            Excluir para sempre
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Card>
</template>
