<script setup lang="ts">
import {
  CalendarDaysIcon, ExternalLinkIcon, EyeIcon, EyeOffIcon, ImageOffIcon,
  MoreHorizontalIcon, PencilIcon, PlusCircleIcon, Trash2Icon,
} from '@lucide/vue'
import type { Evento } from '#shared/types/evento'
import { TIPOS_EVENTO, VISIBILIDADE_EVENTO } from '#shared/types/evento'

/**
 * Tabela de eventos com as ações de CRUD.
 *
 * Segue o mesmo contrato das outras listagens do painel: toda ação é
 * assíncrona e termina em um aviso na tela. A store converte a falha em `null`
 * e guarda o texto em `eventos.erro`, por isso o padrão aqui é checar o
 * retorno em vez de envolver tudo em `try/catch`.
 */
const eventos = useEventosStore()
const paraExcluir = ref<Evento | null>(null)
const excluindo = ref(false)

/** Data e hora legíveis — o evento sempre tem início marcado. */
function quando(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

/** Já passou? Serve para marcar a linha como histórico na listagem. */
function jaAconteceu(evento: Evento): boolean {
  return new Date(evento.comecaEm).getTime() < Date.now()
}

function rotuloDoTipo(evento: Evento): string {
  return TIPOS_EVENTO.find(t => t.valor === evento.tipo)?.rotulo ?? evento.tipo
}

async function alternarStatus(evento: Evento) {
  const salvo = await eventos.alternarStatus(evento)

  if (!salvo) {
    avisar.falha(eventos.erro ?? 'Não foi possível alterar o status.')
    return
  }

  if (salvo.status === 'publicado') {
    avisar.sucesso('Evento publicado.', `“${evento.titulo}” já aparece em /cultura/eventos.`)
  }
  else {
    avisar.sucesso('Evento recolhido.', 'Saiu do site, mas continua guardado no painel.')
  }
}

/**
 * Exclusão definitiva do evento.
 *
 * Fecha o diálogo antes de chamar a API e copia o alvo para uma variável
 * local: `paraExcluir` é a fonte do `:open`, então zerá-lo apaga a referência.
 * `excluindo` barra o clique repetido, que bateria em um id já removido e
 * acusaria erro numa exclusão que deu certo.
 */
async function confirmarExclusao() {
  const alvo = paraExcluir.value
  if (!alvo || excluindo.value) return

  excluindo.value = true
  paraExcluir.value = null

  try {
    const excluido = await eventos.remover(alvo.id)

    if (excluido) {
      avisar.sucesso(
        `“${alvo.titulo}” foi excluído em definitivo.`,
        'O texto e o cartaz saíram do servidor — não há como recuperar.',
      )
    }
    else {
      avisar.falha(eventos.erro ?? 'Não foi possível excluir.', 'O evento continua no painel.')
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
      <Table class="min-w-[960px] table-fixed">
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead>Evento</TableHead>
            <TableHead class="w-[180px]">Quando</TableHead>
            <TableHead class="w-[160px]">Local</TableHead>
            <TableHead class="w-[140px]">Editoria</TableHead>
            <TableHead class="w-[110px]">Status</TableHead>
            <TableHead class="w-[110px]">Inscrição</TableHead>
            <TableHead class="w-[120px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="evento in eventos.listaFiltrada" :key="evento.id">
            <TableCell class="whitespace-normal">
              <div class="flex items-start gap-3">
                <!--
                  A miniatura respeita a orientação escolhida no cadastro: um
                  cartaz em pé espremido num quadrado apareceria cortado no
                  meio, e é justamente a arte vertical que o painel precisa
                  deixar reconhecível na listagem.
                -->
                <span
                  class="mt-0.5 flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted"
                  :class="evento.orientacaoCartaz === 'vertical' ? 'h-12 w-9' : 'h-10 w-14'"
                >
                  <img
                    v-if="evento.imagemUrl"
                    :src="evento.imagemUrl"
                    :alt="`Cartaz de ${evento.titulo}`"
                    class="size-full object-cover"
                  >
                  <ImageOffIcon v-else class="size-4 text-muted-foreground/50" />
                </span>
                <div class="min-w-0">
                  <NuxtLink
                    :to="`/admin/eventos/${evento.id}`"
                    class="line-clamp-2 text-sm font-medium hover:text-primary hover:underline"
                  >
                    {{ evento.titulo }}
                  </NuxtLink>
                  <p class="mt-0.5 text-xs text-muted-foreground">
                    {{ rotuloDoTipo(evento) }}<template v-if="evento.resumo"> — {{ evento.resumo }}</template>
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell class="text-sm" :class="jaAconteceu(evento) ? 'text-muted-foreground/70' : 'text-muted-foreground'">
              <span class="flex items-center gap-1.5">
                <CalendarDaysIcon class="size-3.5 shrink-0" />
                {{ quando(evento.comecaEm) }}
              </span>
              <span v-if="jaAconteceu(evento)" class="text-xs italic">já aconteceu</span>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">{{ evento.local || '—' }}</TableCell>

            <TableCell>
              <Badge v-if="evento.editoria" variant="outline" class="gap-1">
                <i :class="evento.editoria.icone" class="text-[10px]" />
                {{ evento.editoria.nome }}
              </Badge>
              <span v-else class="text-sm text-muted-foreground/60">Sem editoria</span>
            </TableCell>

            <TableCell>
              <!--
                Mostra a situação real, e não só o `status`: um evento publicado
                cuja janela ainda não abriu está "Agendado", e o de janela
                vencida saiu do site sozinho ("Encerrado"). Escrever "Publicado"
                nos dois mentiria para quem olha a listagem.
              -->
              <Badge
                :variant="VISIBILIDADE_EVENTO[evento.visibilidade].variante"
                :title="VISIBILIDADE_EVENTO[evento.visibilidade].ajuda"
              >
                {{ VISIBILIDADE_EVENTO[evento.visibilidade].rotulo }}
              </Badge>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">
              <a
                v-if="evento.inscricaoUrl"
                :href="evento.inscricaoUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-1 hover:text-primary hover:underline"
              >
                <ExternalLinkIcon class="size-3.5" /> Link
              </a>
              <span v-else class="text-muted-foreground/60">Sem link</span>
            </TableCell>

            <TableCell>
              <div class="flex items-center justify-end gap-1">
                <Button as-child variant="ghost" size="icon-sm" title="Editar">
                  <NuxtLink :to="`/admin/eventos/${evento.id}`"><PencilIcon class="size-4" /></NuxtLink>
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  :title="evento.status === 'publicado' ? 'Recolher do site' : 'Publicar'"
                  @click="alternarStatus(evento)"
                >
                  <EyeOffIcon v-if="evento.status === 'publicado'" class="size-4" />
                  <EyeIcon v-else class="size-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon-sm" title="Mais ações">
                      <MoreHorizontalIcon class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-52">
                    <DropdownMenuItem as-child>
                      <NuxtLink :to="evento.caminho" target="_blank">
                        <ExternalLinkIcon class="size-4" /> Ver no portal
                      </NuxtLink>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" @click="paraExcluir = evento">
                      <Trash2Icon class="size-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-if="!eventos.listaFiltrada.length">
            <TableCell colspan="7" class="py-14 text-center">
              <div class="flex flex-col items-center gap-1">
                <CalendarDaysIcon class="mb-1 size-7 text-muted-foreground/40" />
                <p class="text-sm font-medium">
                  {{ eventos.itens.length ? 'Nenhum evento corresponde aos filtros' : 'Ainda não há eventos cadastrados' }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ eventos.itens.length
                    ? 'Ajuste os filtros acima para ver outros eventos.'
                    : 'Cadastre o primeiro para a agenda de /cultura/eventos sair do ar em construção.' }}
                </p>
                <Button v-if="!eventos.itens.length" as-child size="sm" class="mt-3">
                  <NuxtLink to="/admin/eventos/novo">
                    <PlusCircleIcon class="size-4" /> Criar o primeiro evento
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
            A exclusão é <strong class="text-foreground">permanente</strong>: o texto e o cartaz são
            apagados do servidor e não há como recuperar depois — não existe lixeira.
            <template v-if="paraExcluir?.status === 'publicado'">
              O evento também sai da agenda na hora, e quem chegar pelo link antigo verá página não
              encontrada.
            </template>
            <br>
            <span class="mt-2 block">
              Se a ideia é apenas tirar do site, feche este aviso e use
              <strong class="text-foreground">Recolher do site</strong>: o evento volta a rascunho e
              continua guardado.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="paraExcluir = null">Cancelar</AlertDialogCancel>
          <!--
            Botão comum, não `AlertDialogAction`: o primitivo fecha o diálogo no
            próprio clique, e esse fechamento roda antes do nosso handler — que
            então encontraria `paraExcluir` já nulo e sairia sem excluir nada.
          -->
          <Button variant="destructive" :disabled="excluindo" @click="confirmarExclusao()">
            Excluir para sempre
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Card>
</template>
