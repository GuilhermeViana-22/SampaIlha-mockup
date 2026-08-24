<script setup lang="ts">
import { DownloadIcon, MailIcon, Trash2Icon } from '@lucide/vue'

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
    <div class="grid gap-3 sm:grid-cols-3">
      <AdminDashboardCardEstatistica
        rotulo="Inscritos"
        :valor="newsletter.inscricoes.length"
        descricao="Total na base do portal"
        :icone="MailIcon"
        tom="destaque"
      />
    </div>

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
              <TableHead class="w-[80px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="inscricao in filtrados" :key="inscricao.id">
              <TableCell class="font-medium">{{ inscricao.nome }}</TableCell>
              <TableCell class="text-muted-foreground">{{ inscricao.email }}</TableCell>
              <TableCell class="text-sm text-muted-foreground">{{ formatarDataHora(inscricao.criadoEm) }}</TableCell>
              <TableCell class="text-right">
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
  </div>
</template>
