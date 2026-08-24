<script setup lang="ts">
import { LoaderCircleIcon, ShieldCheckIcon, Trash2Icon, UserPlusIcon, UsersIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import type { PapelUsuario, Usuario } from '#shared/types/content'

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

await redacao.carregarEquipe()

const abrindo = ref(false)
const novo = reactive({ nome: '', email: '', senha: '', papel: 'editor' as PapelUsuario, bio: '' })

const podeCriar = computed(() =>
  novo.nome.trim().length >= 2 && /.+@.+\..+/.test(novo.email) && novo.senha.length >= 8)

const PAPEIS: Record<PapelUsuario, string> = {
  'editor-chefe': 'Publica, valida a equipe e cuida dos acessos',
  'editor': 'Escreve e envia para validação',
}

async function criar() {
  try {
    await redacao.criar({ ...novo })
    toast.success(`${novo.nome} já pode entrar no painel.`)
    Object.assign(novo, { nome: '', email: '', senha: '', papel: 'editor', bio: '' })
    abrindo.value = false
  }
  catch (e: any) {
    toast.error(e.message)
  }
}

async function alternarPapel(pessoa: Usuario) {
  const papel: PapelUsuario = pessoa.papel === 'editor-chefe' ? 'editor' : 'editor-chefe'
  try {
    await redacao.atualizar(pessoa.id, { papel })
    toast.success(`${pessoa.nome} agora é ${papel === 'editor-chefe' ? 'editor-chefe' : 'editor'}.`)
  }
  catch (e: any) {
    toast.error(e.message)
  }
}

async function remover(pessoa: Usuario) {
  try {
    await redacao.remover(pessoa.id)
    toast.success(`Acesso de ${pessoa.nome} encerrado.`)
  }
  catch (e: any) {
    toast.error(e.message)
  }
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-3 sm:grid-cols-3">
      <AdminDashboardCardEstatistica
        rotulo="Pessoas com acesso"
        :valor="redacao.equipe.length"
        descricao="Contas ativas no painel"
        :icone="UsersIcon"
        tom="destaque"
      />
      <AdminDashboardCardEstatistica
        rotulo="Editores-chefes"
        :valor="redacao.equipe.filter(p => p.papel === 'editor-chefe').length"
        descricao="Podem publicar e validar"
        :icone="ShieldCheckIcon"
      />
    </div>

    <Card>
      <CardHeader>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle class="text-base">Abrir acesso</CardTitle>
            <CardDescription>
              Quem entra como <strong>editor</strong> escreve e manda para a sua validação — não publica sozinho.
            </CardDescription>
          </div>
          <Button size="sm" :variant="abrindo ? 'ghost' : 'default'" @click="abrindo = !abrindo">
            <UserPlusIcon class="size-4" /> {{ abrindo ? 'Cancelar' : 'Nova pessoa' }}
          </Button>
        </div>
      </CardHeader>

      <CardContent v-if="abrindo" class="flex flex-col gap-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="grid gap-2">
            <Label for="n-nome">Nome</Label>
            <Input id="n-nome" v-model="novo.nome" placeholder="Como a pessoa assina" />
          </div>
          <div class="grid gap-2">
            <Label for="n-email">E-mail</Label>
            <Input id="n-email" v-model="novo.email" type="email" placeholder="nome@portalsampanailha.com.br" />
          </div>
          <div class="grid gap-2">
            <Label for="n-senha">Senha inicial</Label>
            <Input id="n-senha" v-model="novo.senha" type="password" autocomplete="new-password" />
            <p class="text-xs text-muted-foreground">
              Mínimo de 8 caracteres. A pessoa troca depois em “Meu perfil”.
            </p>
          </div>
          <div class="grid gap-2">
            <Label for="n-papel">Papel</Label>
            <select
              id="n-papel"
              v-model="novo.papel"
              class="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
            >
              <option value="editor">Editor</option>
              <option value="editor-chefe">Editor-chefe</option>
            </select>
            <p class="text-xs text-muted-foreground">{{ PAPEIS[novo.papel] }}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter v-if="abrindo">
        <Button :disabled="redacao.salvando || !podeCriar" @click="criar()">
          <LoaderCircleIcon v-if="redacao.salvando" class="size-4 animate-spin" />
          <UserPlusIcon v-else class="size-4" />
          Abrir acesso
        </Button>
      </CardFooter>
    </Card>

    <Card class="overflow-hidden py-0">
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pessoa</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead class="text-right">Conteúdos</TableHead>
              <TableHead class="w-32 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="pessoa in redacao.equipe" :key="pessoa.id">
              <TableCell>
                <div class="font-medium">{{ pessoa.nome }}</div>
                <div class="text-xs text-muted-foreground">{{ pessoa.email }}</div>
              </TableCell>
              <TableCell>
                <Badge :variant="pessoa.papel === 'editor-chefe' ? 'default' : 'secondary'">
                  {{ pessoa.papel === 'editor-chefe' ? 'Editor-chefe' : 'Editor' }}
                </Badge>
                <span v-if="pessoa.id === auth.usuario?.id" class="ml-2 text-xs text-muted-foreground">
                  (você)
                </span>
              </TableCell>
              <TableCell class="text-right tabular-nums">{{ pessoa.totalPosts ?? 0 }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-1">
                  <Button
                    v-if="pessoa.id !== auth.usuario?.id"
                    variant="ghost"
                    size="sm"
                    :title="pessoa.papel === 'editor-chefe' ? 'Tornar editor' : 'Tornar editor-chefe'"
                    @click="alternarPapel(pessoa)"
                  >
                    <ShieldCheckIcon class="size-4" />
                  </Button>
                  <AlertDialog v-if="pessoa.id !== auth.usuario?.id">
                    <AlertDialogTrigger as-child>
                      <Button variant="ghost" size="sm" title="Encerrar acesso">
                        <Trash2Icon class="size-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Encerrar o acesso de {{ pessoa.nome }}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          A pessoa deixa de entrar no painel. O que ela publicou continua no ar,
                          assinado com o nome gravado em cada matéria.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction @click="remover(pessoa)">Encerrar acesso</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  </div>
</template>
