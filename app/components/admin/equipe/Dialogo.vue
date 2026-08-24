<script setup lang="ts">
import { KeyRoundIcon, LoaderCircleIcon, SaveIcon, ShuffleIcon, UserPlusIcon } from '@lucide/vue'
import type { PapelUsuario, Usuario } from '#shared/types/content'

/**
 * Cadastro de quem entra na redação — o mesmo diálogo serve para abrir um
 * acesso novo e para editar um existente. Em edição a senha fica opcional:
 * em branco significa "não mexe".
 */
const props = defineProps<{ pessoa?: Usuario | null }>()
const aberto = defineModel<boolean>({ required: true })
const emit = defineEmits<{ salvo: [] }>()

const redacao = useRedacaoStore()
const editando = computed(() => !!props.pessoa)

const form = reactive({
  nome: '',
  email: '',
  senha: '',
  papel: 'editor' as PapelUsuario,
  bio: '',
  ativo: true,
})

/** Recarrega o formulário toda vez que o diálogo abre. */
watch(aberto, (abriu) => {
  if (!abriu) return
  Object.assign(form, {
    nome: props.pessoa?.nome ?? '',
    email: props.pessoa?.email ?? '',
    senha: '',
    papel: props.pessoa?.papel ?? 'editor',
    bio: props.pessoa?.bio ?? '',
    ativo: props.pessoa?.ativo ?? true,
  })
})

const emailValido = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
const senhaValida = computed(() =>
  editando.value ? !form.senha || form.senha.length >= 8 : form.senha.length >= 8)
const podeSalvar = computed(() =>
  form.nome.trim().length >= 2 && emailValido.value && senhaValida.value)

const PAPEIS: { valor: PapelUsuario, rotulo: string, texto: string }[] = [
  {
    valor: 'editor',
    rotulo: 'Editor',
    texto: 'Escreve e edita as próprias matérias e envia para a sua validação. Não publica sozinho.',
  },
  {
    valor: 'editor-chefe',
    rotulo: 'Editor-chefe',
    texto: 'Publica, valida o que a equipe escreve e cuida das editorias e dos acessos.',
  },
]

/** Senha inicial legível, para passar à pessoa por outro canal. */
function sortearSenha() {
  const alfabeto = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const sorteio = crypto.getRandomValues(new Uint32Array(14))
  form.senha = [...sorteio].map(n => alfabeto[n % alfabeto.length]).join('')
  navigator.clipboard?.writeText(form.senha).then(
    () => avisar.info('Senha sorteada e copiada.', 'Passe para a pessoa por um canal seguro.'),
    () => avisar.alerta('Senha sorteada, mas não foi copiada.', 'Copie do campo à mão antes de salvar.'),
  )
}

/**
 * Grava o membro da redação — cadastra um novo ou atualiza o existente.
 *
 * O diálogo só fecha quando a gravação passa: fechando antes, um e-mail
 * duplicado ou uma senha curta levariam embora tudo o que foi digitado. Em caso
 * de erro o formulário fica aberto com os dados no lugar, à espera do ajuste.
 *
 * A senha é opcional na edição: campo vazio quer dizer "não mexe na senha
 * atual", e por isso ela só entra no corpo do pedido quando foi preenchida.
 */
async function salvar() {
  if (redacao.salvando) return

  try {
    if (editando.value && props.pessoa) {
      await redacao.atualizar(props.pessoa.id, {
        nome: form.nome,
        email: form.email,
        papel: form.papel,
        bio: form.bio,
        ativo: form.ativo,
        ...(form.senha ? { senha: form.senha } : {}),
      })

      avisar.sucesso(
        `Cadastro de ${form.nome} atualizado.`,
        form.senha ? 'A senha também foi trocada.' : undefined,
      )
    }
    else {
      await redacao.criar({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        papel: form.papel,
        bio: form.bio,
      })

      avisar.sucesso(`${form.nome} já pode entrar no painel.`, `Acesso por ${form.email}.`)
    }

    aberto.value = false
    emit('salvo')
  }
  catch (e: unknown) {
    avisar.erro(
      e,
      editando.value ? 'Não foi possível salvar o cadastro.' : 'Não foi possível abrir o acesso.',
      'O formulário continua aberto com o que você preencheu.',
    )
  }
}
</script>

<template>
  <Dialog v-model:open="aberto">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ editando ? `Editar ${pessoa?.nome}` : 'Adicionar membro' }}</DialogTitle>
        <DialogDescription>
          {{ editando
            ? 'Altere os dados de acesso desta pessoa.'
            : 'Abra o acesso ao painel para mais alguém da redação.' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4 py-2">
        <div class="grid gap-2">
          <Label for="f-nome">Nome</Label>
          <Input id="f-nome" v-model="form.nome" placeholder="Como a pessoa assina as matérias" />
        </div>

        <div class="grid gap-2">
          <Label for="f-email">E-mail</Label>
          <Input id="f-email" v-model="form.email" type="email" placeholder="nome@portalsampanailha.com.br" />
          <p v-if="form.email && !emailValido" class="text-xs text-destructive">E-mail inválido.</p>
        </div>

        <div class="grid gap-2">
          <div class="flex items-center justify-between">
            <Label for="f-senha">{{ editando ? 'Nova senha (opcional)' : 'Senha inicial' }}</Label>
            <Button variant="ghost" size="sm" class="h-7 text-xs" @click="sortearSenha()">
              <ShuffleIcon class="size-3.5" /> Sortear
            </Button>
          </div>
          <Input
            id="f-senha"
            v-model="form.senha"
            type="text"
            autocomplete="new-password"
            :placeholder="editando ? 'Deixe em branco para manter a atual' : 'Mínimo de 8 caracteres'"
          />
          <p v-if="form.senha && !senhaValida" class="text-xs text-destructive">
            A senha precisa de pelo menos 8 caracteres.
          </p>
          <p v-else-if="!editando" class="text-xs text-muted-foreground">
            Passe esta senha à pessoa por um canal seguro. Ela pode trocá-la depois em “Meu perfil”.
          </p>
        </div>

        <div class="grid gap-2">
          <Label>Papel</Label>
          <button
            v-for="opcao in PAPEIS"
            :key="opcao.valor"
            type="button"
            class="rounded-lg border p-3 text-left transition"
            :class="form.papel === opcao.valor
              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
              : 'border-input hover:bg-muted/60'"
            @click="form.papel = opcao.valor"
          >
            <span class="flex items-center gap-2 text-sm font-semibold">
              <KeyRoundIcon v-if="opcao.valor === 'editor-chefe'" class="size-4" />
              <UserPlusIcon v-else class="size-4" />
              {{ opcao.rotulo }}
            </span>
            <span class="mt-1 block text-xs text-muted-foreground">{{ opcao.texto }}</span>
          </button>
        </div>

        <div class="grid gap-2">
          <Label for="f-bio">Bio (opcional)</Label>
          <Textarea id="f-bio" v-model="form.bio" rows="2" placeholder="Uma linha sobre o que a pessoa cobre." />
        </div>

        <label v-if="editando" class="flex items-center gap-2 text-sm">
          <Checkbox :model-value="form.ativo" @update:model-value="form.ativo = !!$event" />
          Acesso ativo
        </label>
      </div>

      <DialogFooter>
        <Button variant="ghost" @click="aberto = false">Cancelar</Button>
        <Button :disabled="redacao.salvando || !podeSalvar" @click="salvar()">
          <LoaderCircleIcon v-if="redacao.salvando" class="size-4 animate-spin" />
          <SaveIcon v-else-if="editando" class="size-4" />
          <UserPlusIcon v-else class="size-4" />
          {{ editando ? 'Salvar alterações' : 'Adicionar membro' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
