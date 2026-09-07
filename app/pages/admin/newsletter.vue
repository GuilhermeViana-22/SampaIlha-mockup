<script setup lang="ts">
import {
  DownloadIcon, EyeIcon, LoaderCircleIcon, MailIcon, SendIcon, SparklesIcon, Trash2Icon, TriangleAlertIcon,
} from '@lucide/vue'
import type { FilaNewsletter, InscricaoNewsletter } from '#shared/types/content'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Newsletter',
  descricao: 'Quem assinou os boletins do portal.',
  acao: null,
})
useSeoMeta({ title: 'Newsletter — Painel Sampa na Ilha', robots: 'noindex, nofollow' })


const newsletter = useNewsletterStore()
const busca = ref('')
/** Id da linha em remoção — trava só o botão dela, não a tabela inteira. */
const removendo = ref<string | null>(null)

await newsletter.carregar()

/**
 * Quem entrou desde a última passada por aqui.
 *
 * O conjunto é tirado uma vez, na abertura, e a base é dada por vista logo em
 * seguida: o badge do menu zera no mesmo instante em que a lista aparece, e
 * mesmo assim quem é novidade continua marcado na tela enquanto ela estiver
 * aberta — apagar o aviso não pode apagar também a informação de quem chegou.
 */
const destacados = ref(new Set<string>())

onMounted(() => {
  newsletter.lerMarca()
  for (const i of newsletter.novos) destacados.value.add(i.id)
  newsletter.marcarVistos()
})

// Chegou gente com a tela aberta (o menu recarrega a base de tempos em tempos):
// já está à vista, então entra no destaque e não volta a acender o badge.
watch(() => newsletter.inscricoes, () => {
  if (!destacados.value.size && !newsletter.totalNovos) return
  for (const i of newsletter.novos) destacados.value.add(i.id)
  newsletter.marcarVistos()
})

/** Inscrito aberto no diálogo de visualização. */
const emDetalhe = ref<InscricaoNewsletter | null>(null)
const detalheAberto = ref(false)

function visualizar(inscricao: InscricaoNewsletter) {
  emDetalhe.value = inscricao
  detalheAberto.value = true
}

function removerDoDetalhe(inscricao: InscricaoNewsletter) {
  detalheAberto.value = false
  remover(inscricao.id, inscricao.email)
}

const filtrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return newsletter.inscricoes
  return newsletter.inscricoes.filter(i =>
    `${i.nome} ${i.email}`.toLowerCase().includes(termo))
})

/**
 * Tira um inscrito da base da newsletter.
 *
 * A store repassa a falha em vez de engolir, então o `try/catch` aqui é o que
 * impede o pior caso anterior: a linha continuar na tela e mesmo assim aparecer
 * um aviso de sucesso.
 */
async function remover(id: string, email: string) {
  if (removendo.value) return

  removendo.value = id
  try {
    await newsletter.remover(id)
    avisar.sucesso(`${email} saiu da lista.`, 'Deixa de receber os boletins do portal.')
  }
  catch (e: unknown) {
    avisar.erro(e, `Não foi possível remover ${email}.`)
  }
  finally {
    removendo.value = null
  }
}

/**
 * Estado da fila de disparo.
 *
 * O envio é feito pelo agendador do Dokploy, de cinco em cinco minutos, e não
 * por esta tela — quem publica uma matéria não fica esperando os e-mails
 * saírem. Aqui só se vê o que está acontecendo, e se force uma passada quando
 * não se quer esperar.
 */
// Sem `default`: até a primeira resposta chegar, `fila` é null — e os cartões
// já sabem lidar com isso (`fila?.pendentes ?? 0`).
const { data: fila, refresh: recarregarFila } = await useFetch<FilaNewsletter>('/api/newsletter/fila', {
  key: 'newsletter-fila',
})

const disparando = ref(false)

async function dispararAgora() {
  if (disparando.value) return
  disparando.value = true

  try {
    const r = await $fetch<{ enviados: number, falhas: number, restantes: number }>(
      '/api/newsletter/fila/disparar',
      { method: 'POST' },
    )
    await recarregarFila()

    if (r.enviados === 0 && r.restantes === 0) {
      avisar.sucesso('Nada na fila.', 'Todo mundo já recebeu o que havia para receber.')
    }
    else {
      avisar.sucesso(
        `${r.enviados} e-mail(s) enviado(s).`,
        r.restantes ? `Ainda faltam ${r.restantes} — o agendador continua daqui.` : 'A fila ficou vazia.',
      )
    }
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível disparar a newsletter agora.')
  }
  finally {
    disparando.value = false
  }
}

/** Exporta a base em CSV para uso na ferramenta de disparo. */
function exportarCsv() {
  const linhas = [
    'nome,email,inscrito_em',
    ...newsletter.inscricoes.map(i => `"${i.nome}","${i.email}","${i.criadoEm}"`),
  ].join('\n')

  const url = URL.createObjectURL(new Blob([linhas], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'newsletter-sampa-na-ilha.csv'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Sem SMTP na API a fila só acumula. Dizer isso aqui evita a pergunta
         "cadastrei a matéria e ninguém recebeu". -->
    <Card v-if="fila && !fila.habilitada" class="border-amber-300 bg-amber-50 py-3 dark:bg-amber-950/30">
      <CardContent class="flex items-start gap-3 px-4">
        <TriangleAlertIcon class="mt-0.5 size-4 shrink-0 text-amber-600" />
        <div class="text-sm">
          <p class="font-medium">O envio está desligado.</p>
          <p class="text-muted-foreground">
            A API está sem servidor de e-mail configurado, então a fila acumula e nada sai.
            Defina <code>SMTP_HOST</code> no ambiente da API para ligar o disparo.
          </p>
        </div>
      </CardContent>
    </Card>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <AdminDashboardCardEstatistica
        rotulo="Inscritos"
        :valor="newsletter.inscricoes.length"
        descricao="Total na base do portal"
        :icone="MailIcon"
        tom="destaque"
      />
      <AdminDashboardCardEstatistica
        rotulo="Novos"
        :valor="destacados.size"
        descricao="Cadastros desde a sua última visita"
        :icone="SparklesIcon"
        tom="verde"
      />
      <AdminDashboardCardEstatistica
        rotulo="Na fila"
        :valor="fila?.pendentes ?? 0"
        descricao="E-mails aguardando o próximo disparo"
        :icone="SendIcon"
      />
      <AdminDashboardCardEstatistica
        rotulo="Enviados"
        :valor="fila?.enviados ?? 0"
        :descricao="`${fila?.campanhasEnviadas ?? 0} matéria(s) já viraram newsletter`"
        :icone="MailIcon"
      />
      <AdminDashboardCardEstatistica
        rotulo="Falhas"
        :valor="fila?.falhas ?? 0"
        descricao="Endereços que recusaram após as tentativas"
        :icone="TriangleAlertIcon"
      />
    </div>

    <Card v-if="fila?.ultimaCampanha" class="py-4">
      <CardContent class="flex flex-wrap items-center justify-between gap-3 px-4">
        <div class="min-w-0">
          <p class="text-xs text-muted-foreground">Última newsletter montada</p>
          <p class="truncate text-sm font-medium">{{ fila.ultimaCampanha.assunto }}</p>
          <p class="text-xs text-muted-foreground">
            {{ fila.ultimaCampanha.destinatarios }} destinatário(s)
            <template v-if="fila.ultimaCampanha.em"> · {{ formatarDataHora(fila.ultimaCampanha.em) }}</template>
          </p>
        </div>
        <Button variant="outline" size="sm" :disabled="disparando" @click="dispararAgora()">
          <LoaderCircleIcon v-if="disparando" class="size-4 animate-spin" />
          <SendIcon v-else class="size-4" />
          Disparar agora
        </Button>
      </CardContent>
    </Card>

    <Card class="py-4">
      <CardContent class="flex flex-wrap items-center gap-3 px-4">
        <Input v-model="busca" class="min-w-[220px] flex-1" placeholder="Buscar por nome ou e-mail…" />
        <Button variant="outline" size="sm" @click="exportarCsv()">
          <DownloadIcon class="size-4" /> Exportar CSV
        </Button>
      </CardContent>
    </Card>

    <Card class="overflow-hidden py-0">
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead class="w-[200px]">Inscrição</TableHead>
              <TableHead class="w-[120px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="inscricao in filtrados"
              :key="inscricao.id"
              :class="destacados.has(inscricao.id) ? 'bg-emerald-500/5' : ''"
            >
              <TableCell class="font-medium">
                <div class="flex items-center gap-2">
                  <!-- Barrinha verde: diz de relance onde a lista era nova, sem
                       depender de ler a data em cada linha. -->
                  <span
                    v-if="destacados.has(inscricao.id)"
                    class="h-4 w-1 shrink-0 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                  {{ inscricao.nome }}
                  <Badge
                    v-if="destacados.has(inscricao.id)"
                    class="gap-1 bg-emerald-500 text-[10px] text-white"
                  >
                    <SparklesIcon class="size-3" /> Novo
                  </Badge>
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground">{{ inscricao.email }}</TableCell>
              <TableCell class="text-sm text-muted-foreground">{{ formatarDataHora(inscricao.criadoEm) }}</TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="icon-sm" title="Visualizar" @click="visualizar(inscricao)">
                  <EyeIcon class="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Remover"
                  :disabled="removendo === inscricao.id"
                  @click="remover(inscricao.id, inscricao.email)"
                >
                  <Trash2Icon class="size-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="!filtrados.length">
              <TableCell colspan="4" class="py-12 text-center text-sm text-muted-foreground">
                Ainda não foram cadastrados inscritos na newsletter.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>

    <AdminNewsletterDetalhe
      v-model="detalheAberto"
      :inscricao="emDetalhe"
      :novo="!!emDetalhe && destacados.has(emDetalhe.id)"
      @remover="removerDoDetalhe"
    />
  </div>
</template>
