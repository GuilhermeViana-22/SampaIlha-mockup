<script setup lang="ts">
import {
  BriefcaseIcon, BuildingIcon, CalendarIcon, ExternalLinkIcon, ImageOffIcon, MailIcon,
  MoreHorizontalIcon, PencilIcon, PlusCircleIcon, RotateCcwIcon, SquareCheckIcon, Trash2Icon,
} from '@lucide/vue'
import type { Vaga } from '#shared/types/vaga'
import { ROTULO_STATUS_VAGA } from '#shared/types/vaga'

/**
 * Tabela de vagas com as ações de CRUD.
 *
 * Segue o mesmo contrato das outras listagens do painel: toda ação é
 * assíncrona e termina em um aviso na tela. A store converte a falha em `null`
 * e guarda o texto em `vagas.erro`, por isso o padrão aqui é checar o retorno
 * em vez de envolver tudo em `try/catch`.
 */
const vagas = useVagasStore()
const paraExcluir = ref<Vaga | null>(null)
const excluindo = ref(false)

async function alternarStatus(vaga: Vaga) {
  const salva = await vagas.alternarStatus(vaga)

  if (!salva) {
    avisar.falha(vagas.erro ?? 'Não foi possível alterar o status.')
    return
  }

  if (salva.status === 'aberta') {
    avisar.sucesso('Vaga aberta.', `“${vaga.titulo}” já aparece em /vagas.`)
  }
  else {
    avisar.sucesso('Vaga encerrada.', 'Saiu do site, mas continua guardada no painel.')
  }
}

/**
 * Exclusão da vaga.
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
    const excluida = await vagas.remover(alvo.id)

    if (excluida) {
      avisar.sucesso(
        `“${alvo.titulo}” saiu do painel.`,
        'A foto foi apagada do servidor — não há como recuperar pelo painel.',
      )
    }
    else {
      avisar.falha(vagas.erro ?? 'Não foi possível excluir.', 'A vaga continua no painel.')
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
      <Table class="min-w-[900px] table-fixed">
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead>Vaga</TableHead>
            <TableHead class="w-[170px]">Empresa e local</TableHead>
            <TableHead class="w-[140px]">Publicada em</TableHead>
            <TableHead class="w-[110px]">Status</TableHead>
            <TableHead class="w-[110px]">Candidatura</TableHead>
            <TableHead class="w-[120px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="vaga in vagas.listaFiltrada" :key="vaga.id">
            <TableCell class="whitespace-normal">
              <div class="flex items-start gap-3">
                <span class="mt-0.5 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  <img
                    v-if="vaga.imagemUrl"
                    :src="vaga.imagemUrl"
                    :alt="`Foto de ${vaga.titulo}`"
                    class="size-full object-cover"
                  >
                  <ImageOffIcon v-else class="size-4 text-muted-foreground/50" />
                </span>
                <div class="min-w-0">
                  <NuxtLink
                    :to="`/admin/vagas/${vaga.id}`"
                    class="line-clamp-2 text-sm font-medium hover:text-primary hover:underline"
                  >
                    {{ vaga.titulo }}
                  </NuxtLink>
                  <p class="mt-0.5 text-xs text-muted-foreground">
                    {{ vaga.regime }} · {{ vaga.modelo }}
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell class="whitespace-normal text-sm text-muted-foreground">
              <span class="flex items-center gap-1.5">
                <BuildingIcon class="size-3.5 shrink-0" />
                <span class="line-clamp-1">{{ vaga.empresa }}</span>
              </span>
              <span class="line-clamp-1 text-xs">{{ vaga.local }}</span>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">
              <span class="flex items-center gap-1.5">
                <CalendarIcon class="size-3.5 shrink-0" />
                {{ formatarDataCurta(vaga.publicadoEm) }}
              </span>
            </TableCell>

            <TableCell>
              <Badge
                :variant="ROTULO_STATUS_VAGA[vaga.status].variante"
                :title="ROTULO_STATUS_VAGA[vaga.status].descricao"
              >
                {{ ROTULO_STATUS_VAGA[vaga.status].rotulo }}
              </Badge>
            </TableCell>

            <TableCell class="text-sm text-muted-foreground">
              <a
                v-if="vaga.linkDaVaga"
                :href="vaga.linkDaVaga"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-1 hover:text-primary hover:underline"
              >
                <ExternalLinkIcon class="size-3.5" /> Link
              </a>
              <span v-else-if="vaga.emailCandidatura" class="flex items-center gap-1" :title="vaga.emailCandidatura">
                <MailIcon class="size-3.5" /> E-mail
              </span>
              <span v-else class="text-muted-foreground/60">Sem contato</span>
            </TableCell>

            <TableCell>
              <div class="flex items-center justify-end gap-1">
                <Button as-child variant="ghost" size="icon-sm" title="Editar">
                  <NuxtLink :to="`/admin/vagas/${vaga.id}`"><PencilIcon class="size-4" /></NuxtLink>
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  :title="vaga.status === 'aberta' ? 'Encerrar a vaga' : 'Abrir a vaga'"
                  @click="alternarStatus(vaga)"
                >
                  <SquareCheckIcon v-if="vaga.status === 'aberta'" class="size-4" />
                  <RotateCcwIcon v-else class="size-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon-sm" title="Mais ações">
                      <MoreHorizontalIcon class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-52">
                    <DropdownMenuItem as-child>
                      <NuxtLink to="/vagas" target="_blank">
                        <ExternalLinkIcon class="size-4" /> Ver no portal
                      </NuxtLink>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" @click="paraExcluir = vaga">
                      <Trash2Icon class="size-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-if="!vagas.listaFiltrada.length">
            <TableCell colspan="6" class="py-14 text-center">
              <div class="flex flex-col items-center gap-1">
                <BriefcaseIcon class="mb-1 size-7 text-muted-foreground/40" />
                <p class="text-sm font-medium">
                  {{ vagas.itens.length ? 'Nenhuma vaga corresponde aos filtros' : 'Ainda não há vagas cadastradas' }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ vagas.itens.length
                    ? 'Ajuste os filtros acima para ver outras vagas.'
                    : 'Cadastre a primeira para o mural de /vagas sair do ar de exemplo.' }}
                </p>
                <Button v-if="!vagas.itens.length" as-child size="sm" class="mt-3">
                  <NuxtLink to="/admin/vagas/nova">
                    <PlusCircleIcon class="size-4" /> Cadastrar a primeira vaga
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
          <AlertDialogTitle>Excluir “{{ paraExcluir?.titulo }}”?</AlertDialogTitle>
          <AlertDialogDescription>
            A vaga sai do painel e do site, e a foto é
            <strong class="text-foreground">apagada do servidor</strong> — não há como recuperar
            pelo painel.
            <br>
            <span class="mt-2 block">
              Se a ideia é apenas tirar do site porque a oportunidade foi preenchida, feche este
              aviso e use <strong class="text-foreground">Encerrar a vaga</strong>: ela some de
              /vagas e continua guardada aqui.
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
            Excluir a vaga
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Card>
</template>
