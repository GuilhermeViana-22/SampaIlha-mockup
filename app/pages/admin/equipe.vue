<script setup lang="ts">
import { PencilRulerIcon, ShieldCheckIcon, UserPlusIcon, UsersIcon } from '@lucide/vue'
import type { Usuario } from '#shared/types/content'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Equipe',
  descricao: 'Quem tem acesso ao painel e o que cada pessoa pode fazer.',
  acao: null,
})
useSeoMeta({ title: 'Equipe — Painel Sampa na Ilha', robots: 'noindex, nofollow' })

const auth = useAuthStore()
const redacao = useRedacaoStore()

// A API recusa a lista para quem não é chefe; a tela nem chega a pedir.
if (!auth.ehChefe) {
  throw createError({ statusCode: 403, statusMessage: 'Só o editor-chefe cuida dos acessos.', fatal: true })
}

await redacao.carregarEquipe(true)

const dialogoAberto = ref(false)
const emEdicao = ref<Usuario | null>(null)

function adicionar() {
  emEdicao.value = null
  dialogoAberto.value = true
}

function editar(pessoa: Usuario) {
  emEdicao.value = pessoa
  dialogoAberto.value = true
}

const cartoes = computed(() => [
  {
    rotulo: 'Pessoas com acesso',
    valor: redacao.contagem.total,
    descricao: 'Cadastros no painel',
    icone: UsersIcon,
    tom: 'destaque' as const,
  },
  {
    rotulo: 'Editores-chefes',
    valor: redacao.contagem.chefes,
    descricao: 'Publicam e validam',
    icone: ShieldCheckIcon,
  },
  {
    rotulo: 'Editores',
    valor: redacao.contagem.editores,
    descricao: 'Escrevem e enviam para revisão',
    icone: PencilRulerIcon,
  },
])
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <AdminDashboardCardEstatistica
        v-for="cartao in cartoes"
        :key="cartao.rotulo"
        :rotulo="cartao.rotulo"
        :valor="cartao.valor"
        :descricao="cartao.descricao"
        :icone="cartao.icone"
        :tom="cartao.tom"
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-muted-foreground">
        Exibindo <strong class="text-foreground">{{ redacao.listaFiltrada.length }}</strong>
        de {{ redacao.contagem.total }} pessoa(s).
        <span v-if="redacao.contagem.inativos" class="ml-1">
          {{ redacao.contagem.inativos }} com acesso encerrado.
        </span>
      </p>
      <Button size="sm" @click="adicionar()">
        <UserPlusIcon class="size-4" /> Adicionar membro
      </Button>
    </div>

    <AdminEquipeFiltros />
    <AdminEquipeTabela @editar="editar" @adicionar="adicionar" />

    <p class="text-xs text-muted-foreground">
      Quem entra como <strong>editor</strong> escreve e edita apenas as próprias matérias e envia
      para a sua validação — não publica sozinho nem mexe no material dos colegas.
    </p>

    <AdminEquipeDialogo v-model="dialogoAberto" :pessoa="emEdicao" @salvo="redacao.carregarEquipe(true)" />
  </div>
</template>
