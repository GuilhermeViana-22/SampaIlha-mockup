<script setup lang="ts">
import { PencilIcon, ShieldCheckIcon, Trash2Icon, UserPlusIcon, UsersIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import type { Usuario } from '#shared/types/content'

const emit = defineEmits<{ editar: [Usuario], adicionar: [] }>()

const auth = useAuthStore()
const redacao = useRedacaoStore()
const paraRemover = ref<Usuario | null>(null)

function iniciais(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
}

function entrouEm(data?: string): string {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function alternarPapel(pessoa: Usuario) {
  const papel = pessoa.papel === 'editor-chefe' ? 'editor' : 'editor-chefe'
  try {
    await redacao.atualizar(pessoa.id, { papel })
    toast.success(`${pessoa.nome} agora é ${papel === 'editor-chefe' ? 'editor-chefe' : 'editor'}.`)
  }
  catch (e: any) {
    toast.error(e.message)
  }
}

async function confirmarRemocao() {
  if (!paraRemover.value) return
  const nome = paraRemover.value.nome
  try {
    await redacao.remover(paraRemover.value.id)
    toast.success(`Acesso de ${nome} encerrado.`)
  }
  catch (e: any) {
    toast.error(e.message)
  }
  finally {
    paraRemover.value = null
  }
}
</script>

<template>
  <Card class="overflow-hidden py-0">
    <div class="overflow-x-auto">
      <Table class="min-w-[860px]">
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead>Pessoa</TableHead>
            <TableHead class="w-[140px]">Papel</TableHead>
            <TableHead class="w-[110px]">Situação</TableHead>
            <TableHead class="w-[120px]">Na equipe desde</TableHead>
            <TableHead class="w-[110px] text-right">Conteúdos</TableHead>
            <TableHead class="w-[120px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="pessoa in redacao.listaFiltrada" :key="pessoa.id">
            <TableCell>
              <div class="flex items-center gap-3">
                <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {{ iniciais(pessoa.nome) }}
                </span>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 font-medium">
                    {{ pessoa.nome }}
                    <span v-if="pessoa.id === auth.usuario?.id" class="text-xs font-normal text-muted-foreground">
                      (você)
                    </span>
                  </div>
                  <div class="truncate text-xs text-muted-foreground">{{ pessoa.email }}</div>
                  <div v-if="pessoa.bio" class="truncate text-xs text-muted-foreground/80">{{ pessoa.bio }}</div>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <Badge :variant="pessoa.papel === 'editor-chefe' ? 'default' : 'secondary'">
                {{ pessoa.papel === 'editor-chefe' ? 'Editor-chefe' : 'Editor' }}
              </Badge>
            </TableCell>

            <TableCell>
              <span
                class="inline-flex items-center gap-1.5 text-xs font-medium"
                :class="pessoa.ativo === false ? 'text-muted-foreground' : 'text-emerald-600 dark:text-emerald-400'"
              >
                <span class="size-1.5 rounded-full" :class="pessoa.ativo === false ? 'bg-muted-foreground' : 'bg-emerald-500'" />
                {{ pessoa.ativo === false ? 'Inativo' : 'Ativo' }}
              </span>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">{{ entrouEm(pessoa.criadoEm) }}</TableCell>
            <TableCell class="text-right text-sm tabular-nums text-muted-foreground">{{ pessoa.totalPosts ?? 0 }}</TableCell>

            <TableCell>
              <div class="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon-sm" title="Editar cadastro" @click="emit('editar', pessoa)">
                  <PencilIcon class="size-4" />
                </Button>

                <Button
                  v-if="pessoa.id !== auth.usuario?.id"
                  variant="ghost"
                  size="icon-sm"
                  :title="pessoa.papel === 'editor-chefe' ? 'Rebaixar para editor' : 'Promover a editor-chefe'"
                  @click="alternarPapel(pessoa)"
                >
                  <ShieldCheckIcon class="size-4" />
                </Button>

                <Button
                  v-if="pessoa.id !== auth.usuario?.id"
                  variant="ghost"
                  size="icon-sm"
                  title="Encerrar acesso"
                  @click="paraRemover = pessoa"
                >
                  <Trash2Icon class="size-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-if="!redacao.listaFiltrada.length" class="hover:bg-transparent">
            <TableCell colspan="6" class="py-14 text-center">
              <UsersIcon class="mx-auto size-8 text-muted-foreground/50" />
              <p class="mt-3 font-medium">
                {{ redacao.temFiltro ? 'Nenhuma pessoa com esses filtros' : 'A redação ainda é só você' }}
              </p>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ redacao.temFiltro
                  ? 'Ajuste a busca ou limpe os filtros.'
                  : 'Adicione quem vai ajudar a publicar no portal.' }}
              </p>
              <Button v-if="redacao.temFiltro" variant="outline" size="sm" class="mt-3" @click="redacao.limparFiltros()">
                Limpar filtros
              </Button>
              <Button v-else size="sm" class="mt-3" @click="emit('adicionar')">
                <UserPlusIcon class="size-4" /> Adicionar membro
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </Card>

  <AlertDialog :open="!!paraRemover" @update:open="v => { if (!v) paraRemover = null }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Encerrar o acesso de {{ paraRemover?.nome }}?</AlertDialogTitle>
        <AlertDialogDescription>
          A pessoa deixa de entrar no painel e as sessões abertas caem. O que ela publicou continua
          no ar, assinado com o nome gravado em cada matéria.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="paraRemover = null">Cancelar</AlertDialogCancel>
        <AlertDialogAction @click="confirmarRemocao()">Encerrar acesso</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
