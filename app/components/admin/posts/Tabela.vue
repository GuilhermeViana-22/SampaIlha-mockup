<script setup lang="ts">
import {
  CheckCircle2Icon, ExternalLinkIcon, EyeIcon, EyeOffIcon, FileTextIcon, MoreHorizontalIcon,
  PencilIcon, PlusCircleIcon, SendIcon, StarIcon, Trash2Icon, UndoIcon,
} from '@lucide/vue'
import { toast } from 'vue-sonner'
import type { Post } from '#shared/types/content'

/** Tabela de conteúdos com as ações de CRUD. */
const posts = usePostsStore()
const auth = useAuthStore()
const paraExcluir = ref<Post | null>(null)

async function alternarStatus(post: Post) {
  const atualizado = await posts.alternarStatus(post)
  if (atualizado) {
    toast.success(atualizado.status === 'publicado' ? 'Conteúdo publicado.' : 'Conteúdo voltou para rascunho.')
  }
  else { toast.error(posts.erro ?? 'Não foi possível alterar o status.') }
}

async function enviarParaRevisao(post: Post) {
  const atualizado = await posts.enviarParaRevisao(post)
  if (atualizado) toast.success('Enviado para a validação do editor-chefe.')
  else toast.error(posts.erro ?? 'Não foi possível enviar para revisão.')
}

async function aprovar(post: Post) {
  const atualizado = await posts.aprovar(post)
  if (atualizado) toast.success(`“${post.titulo}” foi aprovado e está no ar.`)
  else toast.error(posts.erro ?? 'Não foi possível aprovar.')
}

async function devolver(post: Post) {
  const atualizado = await posts.devolver(post)
  if (atualizado) toast.success('Devolvido como rascunho para quem escreveu ajustar.')
  else toast.error(posts.erro ?? 'Não foi possível devolver.')
}

async function alternarDestaque(post: Post) {
  const atualizado = await posts.alternarDestaque(post)
  if (atualizado) {
    toast.success(atualizado.destaque ? 'Marcado como destaque da home.' : 'Removido dos destaques.')
  }
}

async function confirmarExclusao() {
  if (!paraExcluir.value) return
  const titulo = paraExcluir.value.titulo
  const ok = await posts.remover(paraExcluir.value.id)
  paraExcluir.value = null
  if (ok) toast.success(`“${titulo}” foi excluído.`)
  else toast.error(posts.erro ?? 'Não foi possível excluir.')
}

const rotuloTipoCurto: Record<string, string> = { noticia: 'Notícia', dica: 'Dica', informacao: 'Informação' }
</script>

<template>
  <Card class="overflow-hidden py-0">
    <div class="overflow-x-auto">
      <Table class="min-w-[980px] table-fixed">
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead>Conteúdo</TableHead>
            <TableHead class="w-[110px]">Tipo</TableHead>
            <TableHead class="w-[130px]">Editoria</TableHead>
            <TableHead class="w-[110px]">Status</TableHead>
            <TableHead class="w-[120px]">Publicado</TableHead>
            <TableHead class="w-[90px] text-right">Leituras</TableHead>
            <TableHead class="w-[130px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="post in posts.listaFiltrada" :key="post.id">
            <TableCell class="whitespace-normal">
              <div class="flex items-start gap-3">
                <span
                  class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
                  :class="`img-bg ${post.capa}`"
                  style="position:relative"
                >
                  <i :class="post.icone" class="text-xs opacity-90" />
                </span>
                <div class="min-w-0">
                  <NuxtLink
                    :to="`/admin/posts/${post.id}`"
                    class="line-clamp-2 text-sm font-medium hover:text-primary hover:underline"
                  >
                    {{ post.titulo }}
                  </NuxtLink>
                  <p class="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{{ post.autor }}</span>
                    <StarIcon v-if="post.destaque" class="size-3 fill-amber-400 text-amber-400" />
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">{{ rotuloTipoCurto[post.tipo] }}</TableCell>
            <TableCell class="text-sm text-muted-foreground">{{ post.categoriaNome }}</TableCell>
            <TableCell><AdminPostsEtiquetaStatus :status="post.status" /></TableCell>
            <TableCell class="text-sm text-muted-foreground">{{ formatarDataCurta(post.publicadoEm) }}</TableCell>
            <TableCell class="text-right text-sm tabular-nums text-muted-foreground">
              {{ formatarNumero(post.leituras) }}
            </TableCell>

            <TableCell>
              <div class="flex items-center justify-end gap-1">
                <Button as-child variant="ghost" size="icon-sm" title="Editar">
                  <NuxtLink :to="`/admin/posts/${post.id}`"><PencilIcon class="size-4" /></NuxtLink>
                </Button>

                <!-- Editor não publica: o botão dele manda o texto para a fila. -->
                <Button
                  v-if="!auth.ehChefe"
                  variant="ghost"
                  size="icon-sm"
                  :disabled="post.status === 'em_revisao'"
                  :title="post.status === 'em_revisao' ? 'Aguardando validação do editor-chefe' : 'Enviar para revisão'"
                  @click="enviarParaRevisao(post)"
                >
                  <SendIcon class="size-4" />
                </Button>

                <template v-else-if="post.status === 'em_revisao'">
                  <Button variant="ghost" size="icon-sm" title="Aprovar e publicar" @click="aprovar(post)">
                    <CheckCircle2Icon class="size-4 text-emerald-600" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" title="Devolver para ajustes" @click="devolver(post)">
                    <UndoIcon class="size-4" />
                  </Button>
                </template>

                <Button
                  v-else
                  variant="ghost"
                  size="icon-sm"
                  :title="post.status === 'publicado' ? 'Despublicar' : 'Publicar'"
                  @click="alternarStatus(post)"
                >
                  <EyeOffIcon v-if="post.status === 'publicado'" class="size-4" />
                  <EyeIcon v-else class="size-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon-sm" title="Mais ações">
                      <MoreHorizontalIcon class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-52">
                    <DropdownMenuItem v-if="auth.ehChefe" @click="alternarDestaque(post)">
                      <StarIcon class="size-4" />
                      {{ post.destaque ? 'Remover destaque' : 'Destacar na home' }}
                    </DropdownMenuItem>
                    <DropdownMenuItem as-child>
                      <NuxtLink :to="caminhoDoPost(post)" target="_blank">
                        <ExternalLinkIcon class="size-4" /> Ver no portal
                      </NuxtLink>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" @click="paraExcluir = post">
                      <Trash2Icon class="size-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-if="!posts.listaFiltrada.length">
            <TableCell colspan="7" class="py-14 text-center">
              <div class="flex flex-col items-center gap-1">
                <FileTextIcon class="mb-1 size-7 text-muted-foreground/40" />
                <p class="text-sm font-medium">
                  {{ posts.itens.length ? 'Nenhum conteúdo corresponde aos filtros' : 'Ainda não foram cadastrados conteúdos' }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ posts.itens.length
                    ? 'Ajuste os filtros acima para ver outros conteúdos.'
                    : 'Publique a primeira notícia, dica ou informação para o portal sair do zero.' }}
                </p>
                <Button v-if="!posts.itens.length" as-child size="sm" class="mt-3">
                  <NuxtLink to="/admin/posts/novo">
                    <PlusCircleIcon class="size-4" /> Criar o primeiro conteúdo
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
          <AlertDialogTitle>Excluir este conteúdo?</AlertDialogTitle>
          <AlertDialogDescription>
            “{{ paraExcluir?.titulo }}” será removido do portal. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="paraExcluir = null">Cancelar</AlertDialogCancel>
          <AlertDialogAction class="bg-destructive text-white hover:bg-destructive/90" @click="confirmarExclusao()">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Card>
</template>
