<script setup lang="ts">
import { ClockIcon, KeyRoundIcon, LoaderCircleIcon, SaveIcon, SendIcon, UserCircleIcon } from '@lucide/vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Meu perfil',
  descricao: 'Como o seu nome aparece nas matérias e como você entra no painel.',
  acao: null,
})
useSeoMeta({ title: 'Meu perfil — Painel Sampa na Ilha', robots: 'noindex, nofollow' })

const auth = useAuthStore()
const redacao = useRedacaoStore()
await redacao.carregarPerfil()

/**
 * Só o editor-chefe define a própria senha. Quem edita pede uma nova e o chefe
 * atende — a API recusa a troca direta, então a tela nem oferece o formulário.
 */
const trocaPropria = computed(() => auth.ehChefe)

if (!trocaPropria.value) await redacao.carregarMeuPedidoSenha()

const perfil = computed(() => redacao.perfil)
const pedido = computed(() => redacao.meuPedidoSenha)
const recado = ref('')

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
    texto: 'Publica, valida o que a equipe escreve, cuida das categorias e dos acessos.',
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

/** Pede uma senha nova ao editor-chefe. O recado é opcional. */
async function pedirSenha() {
  try {
    await redacao.solicitarSenha(recado.value)
    recado.value = ''
    avisar.sucesso(
      'Pedido enviado.',
      'O editor-chefe vê o pedido no painel e passa a senha nova para você.',
    )
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível enviar o pedido.')
  }
}

async function desistir() {
  try {
    await redacao.cancelarPedidoSenha()
    avisar.info('Pedido cancelado.')
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível cancelar o pedido.')
  }
}

function pedidoFeitoEm(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
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
        <CardTitle class="text-base">{{ trocaPropria ? 'Trocar senha' : 'Precisa de uma senha nova?' }}</CardTitle>
        <CardDescription>
          {{ trocaPropria
            ? 'Ao trocar, as sessões abertas em outros aparelhos caem.'
            : 'Quem define a sua senha é o editor-chefe. Peça aqui e ele resolve pelo painel.' }}
        </CardDescription>
      </CardHeader>

      <!-- Editor-chefe: troca direto, com a senha atual como confirmação. -->
      <template v-if="trocaPropria">
        <CardContent class="flex flex-col gap-4">
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
        <CardFooter>
          <Button variant="outline" :disabled="redacao.salvando || !podeTrocarSenha" @click="trocarSenha()">
            <KeyRoundIcon class="size-4" /> Trocar senha
          </Button>
        </CardFooter>
      </template>

      <!-- Editor: com pedido em aberto, resta esperar (ou desistir). -->
      <template v-else-if="pedido">
        <CardContent>
          <div class="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <ClockIcon class="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div class="min-w-0">
              <p class="font-medium">Pedido enviado em {{ pedidoFeitoEm(pedido.criadoEm) }}.</p>
              <p class="mt-1 text-muted-foreground">
                O editor-chefe já vê o pedido no painel. Assim que ele definir a senha, as suas
                sessões caem e você entra com a senha nova.
              </p>
              <p v-if="pedido.recado" class="mt-2 text-xs text-muted-foreground">
                Seu recado: “{{ pedido.recado }}”
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" :disabled="redacao.salvando" @click="desistir()">
            Cancelar o pedido
          </Button>
        </CardFooter>
      </template>

      <!-- Editor, sem pedido: o formulário do pedido. -->
      <template v-else>
        <CardContent class="grid gap-2">
          <Label for="recado">Recado (opcional)</Label>
          <Textarea
            id="recado"
            v-model="recado"
            rows="2"
            maxlength="300"
            placeholder="Ex.: perdi o acesso ao trocar de celular."
          />
          <p class="text-xs text-muted-foreground">
            Ajuda o editor-chefe a saber por qual canal falar com você.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" :disabled="redacao.salvando" @click="pedirSenha()">
            <LoaderCircleIcon v-if="redacao.salvando" class="size-4 animate-spin" />
            <SendIcon v-else class="size-4" />
            Solicitar troca de senha
          </Button>
        </CardFooter>
      </template>
    </Card>
  </div>
</template>
