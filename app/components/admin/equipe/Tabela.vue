<script setup lang="ts">
import { PencilIcon, ShieldCheckIcon, Trash2Icon, UserPlusIcon, UsersIcon } from '@lucide/vue'
import type { Usuario } from '#shared/types/content'

const emit = defineEmits<{ editar: [Usuario], adicionar: [] }>()

const auth = useAuthStore()
const redacao = useRedacaoStore()
const paraRemover = ref<Usuario | null>(null)
const encerrando = ref(false)

function iniciais(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('')
}

function entrouEm(data?: string): string {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Promove a editor-chefe ou rebaixa a editor.
 *
 * Vale um aviso mais falante que "salvo": mudar de papel muda o que a pessoa
 * consegue fazer no painel, e quem clicou precisa ver isso escrito.
 */
async function alternarPapel(pessoa: Usuario) {
  const virandoChefe = pessoa.papel !== 'editor-chefe'
  const papel = virandoChefe ? 'editor-chefe' : 'editor'

  try {
    await redacao.atualizar(pessoa.id, { papel })

    avisar.sucesso(
      `${pessoa.nome} agora é ${papel}.`,
      virandoChefe
        ? 'Passa a publicar, validar a fila e mexer em editorias e acessos.'
        : 'Deixa de publicar e de mexer nos acessos; segue escrevendo normalmente.',
    )
  }
  catch (e: unknown) {
    avisar.erro(e, `Não foi possível mudar o papel de ${pessoa.nome}.`)
  }
}

/**
 * Encerra o acesso da pessoa ao painel.
 *
 * O alvo é copiado antes de o diálogo fechar: `paraRemover` alimenta o `:open`,
 * e zerá-lo é o que fecha o modal. `encerrando` evita o clique repetido, que
 * bateria de novo em um id já removido e mostraria erro para uma ação que deu
 * certo.
 */
async function confirmarRemocao() {
  const alvo = paraRemover.value
  if (!alvo || encerrando.value) return

  encerrando.value = true
  paraRemover.value = null

  try {
    await redacao.remover(alvo.id)
    avisar.sucesso(
      `Acesso de ${alvo.nome} encerrado.`,
      'As sessões abertas caem; o que a pessoa publicou continua no ar.',
    )
  }
  catch (e: unknown) {
    avisar.erro(e, `Não foi possível encerrar o acesso de ${alvo.nome}.`)
  }
  finally {
    encerrando.value = false
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
        <!-- Botão comum: `AlertDialogAction` fecha o diálogo antes do handler rodar. -->
        <Button variant="destructive" :disabled="encerrando" @click="confirmarRemocao()">Encerrar acesso</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
