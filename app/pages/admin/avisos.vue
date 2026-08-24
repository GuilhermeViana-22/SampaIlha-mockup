<script setup lang="ts">
import { LoaderCircleIcon, MegaphoneIcon, RadioIcon, SendIcon, Trash2Icon } from '@lucide/vue'
import type { Aviso, TipoAviso } from '#shared/types/content'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Avisos',
  descricao: 'A faixa do topo do portal — o que ela diz e por quanto tempo.',
  acao: null,
})
useSeoMeta({ title: 'Avisos — Painel Sampa na Ilha', robots: 'noindex, nofollow' })

const auth = useAuthStore()
const avisos = useAvisosStore()

if (!auth.ehChefe) {
  throw createError({ statusCode: 403, statusMessage: 'Só o editor-chefe publica avisos.', fatal: true })
}

await avisos.carregarHistorico(true)

const mensagem = ref('')
const tipo = ref<TipoAviso>('urgente')
const paraRemover = ref<Aviso | null>(null)
const removendo = ref(false)

const podePublicar = computed(() => mensagem.value.trim().length >= 3)

function dataCurta(iso: string): string {
  // A data vem como AAAA-MM-DD; montar por partes evita o fuso do navegador
  // puxar o dia para trás.
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano!, mes! - 1, dia!).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

/**
 * Publica o aviso na faixa do topo.
 *
 * O campo só é limpo depois de a API confirmar: esvaziar antes faria a redação
 * perder o texto digitado sempre que a gravação falhasse.
 */
async function publicar() {
  if (!podePublicar.value || avisos.salvando) return

  const texto = mensagem.value.trim()

  try {
    await avisos.criar({ mensagem: texto, tipo: tipo.value })
    mensagem.value = ''

    avisar.sucesso('Aviso publicado.', 'Ele aparece na faixa do topo e sai sozinho na virada do dia.')
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível publicar o aviso.', 'O texto continua no campo.')
  }
}

/**
 * Remove o aviso em definitivo.
 *
 * Guarda o alvo antes de fechar o diálogo: `paraRemover` é o que controla o
 * `:open`, então zerá-lo já apaga a referência. `removendo` barra o clique
 * repetido, que bateria em um id inexistente e acusaria erro à toa.
 */
async function confirmarRemocao() {
  const alvo = paraRemover.value
  if (!alvo || removendo.value) return

  const estavaNoAr = alvo.noAr
  removendo.value = true
  paraRemover.value = null

  try {
    await avisos.remover(alvo.id)

    avisar.sucesso(
      'Aviso removido.',
      estavaNoAr ? 'Ele já saiu da faixa do topo do portal.' : undefined,
    )
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível remover o aviso.')
  }
  finally {
    removendo.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <AdminDashboardCardEstatistica
        rotulo="No ar agora"
        :valor="avisos.noArAgora.length"
        descricao="Aparecendo na faixa do topo"
        :icone="RadioIcon"
        tom="destaque"
      />
      <AdminDashboardCardEstatistica
        rotulo="Já publicados"
        :valor="avisos.historico.length"
        descricao="Incluindo os de dias anteriores"
        :icone="MegaphoneIcon"
      />
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Novo aviso</CardTitle>
        <CardDescription>
          Aparece na faixa vermelha do topo do site <strong>somente hoje</strong>. Na virada do dia
          ele sai do ar sozinho — sem faixa quando não há aviso.
        </CardDescription>
      </CardHeader>

      <CardContent class="flex flex-col gap-4">
        <div class="grid gap-2">
          <Label>Tipo</Label>
          <div class="grid gap-2 sm:grid-cols-3">
            <button
              v-for="opcao in TIPOS_AVISO"
              :key="opcao.valor"
              type="button"
              class="rounded-lg border p-3 text-left transition"
              :class="tipo === opcao.valor
                ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                : 'border-input hover:bg-muted/60'"
              @click="tipo = opcao.valor"
            >
              <span class="flex items-center gap-2 text-sm font-semibold">
                <i :class="opcao.icone" /> {{ opcao.rotulo }}
              </span>
              <span class="mt-1 block text-xs text-muted-foreground">{{ opcao.descricao }}</span>
            </button>
          </div>
        </div>

        <div class="grid gap-2">
          <div class="flex items-center justify-between">
            <Label for="mensagem">Aviso</Label>
            <span class="text-xs text-muted-foreground">{{ mensagem.length }}/240</span>
          </div>
          <Input
            id="mensagem"
            v-model="mensagem"
            maxlength="240"
            placeholder="Ex.: Chuva forte alaga a Marginal Tietê nos dois sentidos"
            @keyup.enter="podePublicar && publicar()"
          />
        </div>

        <!-- Prévia com a mesma pintura da faixa do site. -->
        <div class="grid gap-2">
          <Label>Como fica no site</Label>
          <div class="breaking overflow-hidden rounded-md" :class="`breaking--${tipo}`">
            <div class="breaking__label">
              <i :class="tipoDeAviso(tipo).icone" /> {{ tipoDeAviso(tipo).rotulo }}
            </div>
            <div class="flex-1 truncate px-4 text-xs">
              {{ mensagem || 'O texto do aviso aparece aqui.' }}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button :disabled="avisos.salvando || !podePublicar" @click="publicar()">
          <LoaderCircleIcon v-if="avisos.salvando" class="size-4 animate-spin" />
          <SendIcon v-else class="size-4" />
          Publicar aviso
        </Button>
      </CardFooter>
    </Card>

    <Card class="overflow-hidden py-0">
      <div class="overflow-x-auto">
        <Table class="min-w-[760px]">
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead>Aviso</TableHead>
              <TableHead class="w-[170px]">Tipo</TableHead>
              <TableHead class="w-[140px]">Dia</TableHead>
              <TableHead class="w-[120px]">Situação</TableHead>
              <TableHead class="w-[70px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-for="aviso in avisos.historico" :key="aviso.id">
              <TableCell class="font-medium">{{ aviso.mensagem }}</TableCell>
              <TableCell>
                <span class="flex items-center gap-1.5 text-sm">
                  <i :class="tipoDeAviso(aviso.tipo).icone" class="text-muted-foreground" />
                  {{ tipoDeAviso(aviso.tipo).rotulo }}
                </span>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground">{{ dataCurta(aviso.exibirEm) }}</TableCell>
              <TableCell>
                <span
                  class="inline-flex items-center gap-1.5 text-xs font-medium"
                  :class="aviso.noAr ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'"
                >
                  <span class="size-1.5 rounded-full" :class="aviso.noAr ? 'bg-emerald-500' : 'bg-muted-foreground'" />
                  {{ aviso.noAr ? 'No ar' : 'Fora do ar' }}
                </span>
              </TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="icon-sm" title="Remover aviso" @click="paraRemover = aviso">
                  <Trash2Icon class="size-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>

            <TableRow v-if="!avisos.historico.length" class="hover:bg-transparent">
              <TableCell colspan="5" class="py-14 text-center">
                <MegaphoneIcon class="mx-auto size-8 text-muted-foreground/50" />
                <p class="mt-3 font-medium">Nenhum aviso publicado</p>
                <p class="mt-1 text-sm text-muted-foreground">
                  Sem aviso do dia, a faixa do topo não aparece no site.
                </p>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  </div>

  <AlertDialog :open="!!paraRemover" @update:open="v => { if (!v) paraRemover = null }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remover este aviso?</AlertDialogTitle>
        <AlertDialogDescription>
          “{{ paraRemover?.mensagem }}”
          <template v-if="paraRemover?.noAr"> — ele sai da faixa do topo imediatamente.</template>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="paraRemover = null">Cancelar</AlertDialogCancel>
        <!-- Botão comum: `AlertDialogAction` fecha o diálogo antes do handler rodar. -->
        <Button variant="destructive" :disabled="removendo" @click="confirmarRemocao()">Remover</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
