<script setup lang="ts">
import {
  CalendarIcon, ExternalLinkIcon, EyeIcon, EyeOffIcon, GraduationCapIcon, ImageOffIcon,
  MoreHorizontalIcon, PencilIcon, PlusCircleIcon, Trash2Icon,
} from '@lucide/vue'
import type { Workshop } from '#shared/types/workshop'
import { VISIBILIDADE_WORKSHOP } from '#shared/types/workshop'

/**
 * Tabela de oficinas com as ações de CRUD.
 *
 * Segue o mesmo contrato das outras listagens do painel: toda ação é
 * assíncrona e termina em um aviso na tela. A store converte a falha em `null`
 * e guarda o texto em `workshops.erro`, por isso o padrão aqui é checar o
 * retorno em vez de envolver tudo em `try/catch`.
 */
const workshops = useWorkshopsStore()
const paraExcluir = ref<Workshop | null>(null)
const excluindo = ref(false)

/** Data legível; oficina sem dia marcado aparece como "a definir". */
function quando(iso: string | null): string {
  if (!iso) return 'A definir'
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano!, mes! - 1, dia!).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

/** Já passou? Serve para marcar a linha como histórico na listagem. */
function jaAconteceu(oficina: Workshop): boolean {
  if (!oficina.acontecemEm) return false
  return oficina.acontecemEm < new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

async function alternarStatus(oficina: Workshop) {
  const salva = await workshops.alternarStatus(oficina)

  if (!salva) {
    avisar.falha(workshops.erro ?? 'Não foi possível alterar o status.')
    return
  }

  if (salva.status === 'publicado') {
    avisar.sucesso('Oficina publicada.', `“${oficina.titulo}” já aparece em /cultura/workshops.`)
  }
  else {
    avisar.sucesso('Oficina recolhida.', 'Saiu do site, mas continua guardada no painel.')
  }
}

/**
 * Exclusão definitiva da oficina.
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
    const excluida = await workshops.remover(alvo.id)

    if (excluida) {
      avisar.sucesso(
        `“${alvo.titulo}” foi excluída em definitivo.`,
        'O texto e o cartaz saíram do servidor — não há como recuperar.',
      )
    }
    else {
      avisar.falha(workshops.erro ?? 'Não foi possível excluir.', 'A oficina continua no painel.')
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
      <Table class="min-w-[860px] table-fixed">
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead>Oficina</TableHead>
            <TableHead class="w-[150px]">Quando</TableHead>
            <TableHead class="w-[170px]">Local</TableHead>
            <TableHead class="w-[110px]">Status</TableHead>
            <TableHead class="w-[110px]">Inscrição</TableHead>
            <TableHead class="w-[120px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="oficina in workshops.listaFiltrada" :key="oficina.id">
            <TableCell class="whitespace-normal">
              <div class="flex items-start gap-3">
                <span class="mt-0.5 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  <img
                    v-if="oficina.imagemUrl"
                    :src="oficina.imagemUrl"
                    :alt="`Cartaz de ${oficina.titulo}`"
                    class="size-full object-cover"
                  >
                  <ImageOffIcon v-else class="size-4 text-muted-foreground/50" />
                </span>
                <div class="min-w-0">
                  <NuxtLink
                    :to="`/admin/workshops/${oficina.id}`"
                    class="line-clamp-2 text-sm font-medium hover:text-primary hover:underline"
                  >
                    {{ oficina.titulo }}
                  </NuxtLink>
                  <p v-if="oficina.resumo" class="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {{ oficina.resumo }}
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell class="text-sm" :class="jaAconteceu(oficina) ? 'text-muted-foreground/70' : 'text-muted-foreground'">
              <span class="flex items-center gap-1.5">
                <CalendarIcon class="size-3.5 shrink-0" />
                {{ quando(oficina.acontecemEm) }}
              </span>
              <span v-if="jaAconteceu(oficina)" class="text-xs italic">já realizada</span>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">{{ oficina.local || '—' }}</TableCell>

            <TableCell>
              <!--
                Mostra a situação real, e não só o `status`: uma oficina
                publicada cuja janela ainda não abriu está "Agendada", e a de
                janela vencida saiu do site sozinha ("Encerrada"). Escrever
                "Publicado" nas duas mentiria para quem olha a listagem.
              -->
              <Badge
                :variant="VISIBILIDADE_WORKSHOP[oficina.visibilidade].variante"
                :title="VISIBILIDADE_WORKSHOP[oficina.visibilidade].ajuda"
              >
                {{ VISIBILIDADE_WORKSHOP[oficina.visibilidade].rotulo }}
              </Badge>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">
              <a
                v-if="oficina.inscricaoUrl"
                :href="oficina.inscricaoUrl"
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
                  <NuxtLink :to="`/admin/workshops/${oficina.id}`"><PencilIcon class="size-4" /></NuxtLink>
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  :title="oficina.status === 'publicado' ? 'Recolher do site' : 'Publicar'"
                  @click="alternarStatus(oficina)"
                >
                  <EyeOffIcon v-if="oficina.status === 'publicado'" class="size-4" />
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
                      <NuxtLink :to="oficina.caminho" target="_blank">
                        <ExternalLinkIcon class="size-4" /> Ver no portal
                      </NuxtLink>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" @click="paraExcluir = oficina">
                      <Trash2Icon class="size-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-if="!workshops.listaFiltrada.length">
            <TableCell colspan="6" class="py-14 text-center">
              <div class="flex flex-col items-center gap-1">
                <GraduationCapIcon class="mb-1 size-7 text-muted-foreground/40" />
                <p class="text-sm font-medium">
                  {{ workshops.itens.length ? 'Nenhuma oficina corresponde aos filtros' : 'Ainda não há oficinas cadastradas' }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ workshops.itens.length
                    ? 'Ajuste os filtros acima para ver outras oficinas.'
                    : 'Cadastre a primeira para a seção de workshops sair do ar em construção.' }}
                </p>
                <Button v-if="!workshops.itens.length" as-child size="sm" class="mt-3">
                  <NuxtLink to="/admin/workshops/nova">
                    <PlusCircleIcon class="size-4" /> Criar a primeira oficina
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
              A oficina também sai do site na hora, e quem chegar pelo link antigo verá página não
              encontrada.
            </template>
            <br>
            <span class="mt-2 block">
              Se a ideia é apenas tirar do site, feche este aviso e use
              <strong class="text-foreground">Recolher do site</strong>: a oficina volta a rascunho e
              continua guardada.
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
