<script setup lang="ts">
import { KeyRoundIcon, LoaderCircleIcon, SaveIcon, UserCircleIcon } from '@lucide/vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Meu perfil',
  descricao: 'Como o seu nome aparece nas matérias e como você entra no painel.',
  acao: null,
})
useSeoMeta({ title: 'Meu perfil — Painel Sampa na Ilha', robots: 'noindex, nofollow' })

const redacao = useRedacaoStore()
await redacao.carregarPerfil()

const perfil = computed(() => redacao.perfil)

const nome = ref(perfil.value?.nome ?? '')
const bio = ref(perfil.value?.bio ?? '')

const senhaAtual = ref('')
const novaSenha = ref('')
const confirmacao = ref('')

const senhasConferem = computed(() => !confirmacao.value || novaSenha.value === confirmacao.value)
const podeTrocarSenha = computed(() =>
  !!senhaAtual.value && novaSenha.value.length >= 8 && senhasConferem.value)

const PAPEL = {
  'editor-chefe': {
    titulo: 'Editor-chefe',
    texto: 'Publica, valida o que a equipe escreve, cuida das editorias e dos acessos.',
  },
  'editor': {
    titulo: 'Editor',
    texto: 'Escreve e edita as próprias matérias e envia para a validação do editor-chefe.',
  },
} as const

/** Grava nome e bio de quem está logado. */
async function salvar() {
  try {
    await redacao.salvarPerfil({ nome: nome.value, bio: bio.value })
    avisar.sucesso('Perfil atualizado.', 'O novo nome passa a assinar o que você publicar.')
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível salvar o perfil.')
  }
}

/**
 * Troca a senha do painel.
 *
 * Os campos só são limpos depois do sucesso: uma senha atual errada — o erro
 * mais comum aqui — não pode custar a redigitação dos três campos.
 */
async function trocarSenha() {
  try {
    await redacao.trocarSenha(senhaAtual.value, novaSenha.value)

    senhaAtual.value = ''
    novaSenha.value = ''
    confirmacao.value = ''

    avisar.sucesso('Senha trocada.', 'As outras sessões foram encerradas — entre de novo nos outros aparelhos.')
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível trocar a senha.', 'Confira a senha atual e tente de novo.')
  }
}
</script>

<template>
  <div class="flex max-w-3xl flex-col gap-5">
    <Card>
      <CardHeader>
        <div class="flex items-center gap-4">
          <span class="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted">
            <UserCircleIcon class="size-8 text-muted-foreground" />
          </span>
          <div class="min-w-0">
            <CardTitle class="font-serif text-xl">{{ perfil?.nome }}</CardTitle>
            <CardDescription>{{ perfil?.email }}</CardDescription>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <Badge :variant="perfil?.papel === 'editor-chefe' ? 'default' : 'secondary'">
                {{ PAPEL[perfil?.papel ?? 'editor'].titulo }}
              </Badge>
              <span class="text-xs text-muted-foreground">
                {{ perfil?.totalPosts ?? 0 }} conteúdo(s) assinado(s)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p class="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
          {{ PAPEL[perfil?.papel ?? 'editor'].texto }}
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Dados públicos</CardTitle>
        <CardDescription>O nome assina as matérias que você publicar daqui em diante.</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <div class="grid gap-2">
          <Label for="nome">Nome</Label>
          <Input id="nome" v-model="nome" placeholder="Como você assina" />
        </div>
        <div class="grid gap-2">
          <Label for="bio">Bio</Label>
          <Textarea id="bio" v-model="bio" rows="3" placeholder="Uma linha sobre o que você cobre." />
        </div>
      </CardContent>
      <CardFooter>
        <Button :disabled="redacao.salvando || !nome.trim()" @click="salvar()">
          <LoaderCircleIcon v-if="redacao.salvando" class="size-4 animate-spin" />
          <SaveIcon v-else class="size-4" />
          Salvar perfil
        </Button>
      </CardFooter>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Trocar senha</CardTitle>
        <CardDescription>Ao trocar, as sessões abertas em outros aparelhos caem.</CardDescription>
      </CardHeader>
      <CardContent v-if="perfil?.senhaDoAmbiente">
        <p class="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          A sua senha vem da variável <code>ADMIN_PASSWORD</code> e volta ao valor do ambiente a cada
          subida da API — trocá-la aqui não teria efeito. Altere-a no painel de deploy (Dokploy →
          serviço da API → Environment) e reinicie.
        </p>
      </CardContent>

      <CardContent v-else class="flex flex-col gap-4">
        <div class="grid gap-2">
          <Label for="atual">Senha atual</Label>
          <Input id="atual" v-model="senhaAtual" type="password" autocomplete="current-password" />
        </div>
        <div class="grid gap-2 sm:grid-cols-2">
          <div class="grid gap-2">
            <Label for="nova">Nova senha</Label>
            <Input id="nova" v-model="novaSenha" type="password" autocomplete="new-password" />
            <p class="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
          </div>
          <div class="grid gap-2">
            <Label for="confirma">Repita a nova senha</Label>
            <Input id="confirma" v-model="confirmacao" type="password" autocomplete="new-password" />
            <p v-if="!senhasConferem" class="text-xs text-destructive">As senhas não conferem.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter v-if="!perfil?.senhaDoAmbiente">
        <Button variant="outline" :disabled="redacao.salvando || !podeTrocarSenha" @click="trocarSenha()">
          <KeyRoundIcon class="size-4" /> Trocar senha
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
