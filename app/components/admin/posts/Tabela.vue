<script setup lang="ts">
import {
  CheckCircle2Icon, ExternalLinkIcon, EyeIcon, EyeOffIcon, FileTextIcon, MoreHorizontalIcon,
  PencilIcon, PlusCircleIcon, SendIcon, StarIcon, Trash2Icon, UndoIcon,
} from '@lucide/vue'
import type { Post } from '#shared/types/content'

/**
 * Tabela de conteúdos com as ações de CRUD.
 *
 * Toda ação aqui é assíncrona e termina em um aviso na tela: sucesso quando
 * aconteceu o que foi pedido, alerta quando a API aceitou o pedido mas fez
 * outra coisa (o editor pedindo publicação e recebendo revisão) e erro quando
 * nada mudou. As chamadas passam pela store, que já converte a falha em `null`
 * e guarda o texto em `posts.erro` — por isso o padrão abaixo é checar o
 * retorno, e não um `try/catch`.
 */
const posts = usePostsStore()
const auth = useAuthStore()
const paraExcluir = ref<Post | null>(null)
const excluindo = ref(false)

/**
 * Publica ou despublica com um clique.
 *
 * A API tem a palavra final: um editor pedindo publicação recebe de volta
 * `em_revisao`. Nesse caso o aviso precisa ser de alerta — dizer "publicado"
 * seria mentira, e dizer "erro" esconderia que o pedido foi aceito.
 */
async function alternarStatus(post: Post) {
  const atualizado = await posts.alternarStatus(post)

  if (!atualizado) {
    avisar.falha(posts.erro ?? 'Não foi possível alterar o status.')
    return
  }

  if (atualizado.status === 'publicado') {
    avisar.sucesso('Conteúdo publicado.', `“${post.titulo}” já está no ar.`)
  }
  else if (atualizado.status === 'em_revisao') {
    avisar.alerta(
      'Enviado para revisão, não publicado.',
      'Publicar é decisão do editor-chefe — o texto entrou na fila de validação.',
    )
  }
  else {
    avisar.sucesso('Conteúdo voltou para rascunho.', 'Saiu do ar, mas continua guardado no painel.')
  }
}

/** Editor manda o próprio texto para a validação do editor-chefe. */
async function enviarParaRevisao(post: Post) {
  const atualizado = await posts.enviarParaRevisao(post)

  if (atualizado) {
    avisar.sucesso('Enviado para a validação do editor-chefe.', `“${post.titulo}” está na fila.`)
  }
  else {
    avisar.falha(posts.erro ?? 'Não foi possível enviar para revisão.')
  }
}

/** Editor-chefe aprova o que estava na fila e o conteúdo vai ao ar. */
async function aprovar(post: Post) {
  const atualizado = await posts.aprovar(post)

  if (atualizado) avisar.sucesso(`“${post.titulo}” foi aprovado e está no ar.`)
  else avisar.falha(posts.erro ?? 'Não foi possível aprovar.')
}

/** Editor-chefe devolve para quem escreveu ajustar. */
async function devolver(post: Post) {
  const atualizado = await posts.devolver(post)

  if (atualizado) {
    avisar.sucesso('Devolvido para ajustes.', `“${post.titulo}” voltou como rascunho para quem escreveu.`)
  }
  else {
    avisar.falha(posts.erro ?? 'Não foi possível devolver.')
  }
}

/** Liga/desliga o destaque na vitrine da home. Só o editor-chefe. */
async function alternarDestaque(post: Post) {
  const atualizado = await posts.alternarDestaque(post)

  if (!atualizado) {
    avisar.falha(posts.erro ?? 'Não foi possível alterar o destaque.')
    return
  }

  if (atualizado.destaque) avisar.sucesso('Marcado como destaque da home.')
  else avisar.sucesso('Removido dos destaques.')
}

/**
 * Exclusão definitiva do conteúdo.
 *
 * Fecha o diálogo antes de chamar a API: `paraExcluir` é a fonte do `:open`, e
 * quem confirma não deve ficar olhando o modal parado enquanto a requisição
 * corre. O alvo é copiado para uma variável local justamente por isso — depois
 * de `paraExcluir = null` não há mais de onde ler o id nem o título.
 *
 * `excluindo` bloqueia o clique repetido: o segundo DELETE do mesmo id voltaria
 * 404 e mostraria um erro para uma exclusão que, na verdade, deu certo.
 */
async function confirmarExclusao() {
  const alvo = paraExcluir.value
  if (!alvo || excluindo.value) return

  excluindo.value = true
  paraExcluir.value = null

  try {
    const excluido = await posts.remover(alvo.id)

    if (excluido) {
      avisar.sucesso(
        `“${alvo.titulo}” foi excluído em definitivo.`,
        'O texto, as fotos e as leituras saíram do servidor — não há como recuperar.',
      )
    }
    else {
      avisar.falha(posts.erro ?? 'Não foi possível excluir.', 'O conteúdo continua no painel.')
    }
  }
  finally {
    excluindo.value = false
  }
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
          <AlertDialogTitle>Excluir “{{ paraExcluir?.titulo }}” para sempre?</AlertDialogTitle>
          <AlertDialogDescription>
            A exclusão é <strong class="text-foreground">permanente</strong>: o texto, as fotos e as
            leituras registradas são apagados do servidor e não há como recuperar depois — não existe
            lixeira.
            <template v-if="paraExcluir?.status === 'publicado'">
              A matéria também sai do ar na hora, e quem chegar pelo link antigo verá página não
              encontrada.
            </template>
            <br>
            <span class="mt-2 block">
              Se a ideia é apenas tirar do portal, feche este aviso e use
              <strong class="text-foreground">Despublicar</strong>: o conteúdo volta a rascunho e
              continua guardado.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="paraExcluir = null">Cancelar</AlertDialogCancel>
          <!--
            Botão comum, não `AlertDialogAction`: o primitivo fecha o diálogo no
            próprio clique, e esse fechamento roda antes do nosso handler — que
            então encontrava `paraExcluir` já nulo e saía sem excluir nada.
            Aqui quem fecha é `confirmarExclusao`, depois de ler o alvo.
          -->
          <Button variant="destructive" :disabled="excluindo" @click="confirmarExclusao()">
            Excluir para sempre
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Card>
</template>
