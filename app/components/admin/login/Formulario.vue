<script setup lang="ts">
import { AtSignIcon, EyeIcon, EyeOffIcon, LoaderCircleIcon, LockIcon, ShieldCheckIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

/** Tela de acesso ao painel da redação. */
const auth = useAuthStore()
const rota = useRoute()

const email = ref('')
const senha = ref('')
const lembrar = ref(false)
const mostrarSenha = ref(false)

async function entrar() {
  const ok = await auth.entrar(email.value, senha.value, lembrar.value)
  if (!ok) {
    toast.error(auth.erro ?? 'Não foi possível entrar.')
    return
  }
  toast.success(`Bem-vindo(a), ${auth.usuario?.nome}!`)
  await navigateTo((rota.query.redirecionar as string) || '/admin/dashboard')
}
</script>

<template>
  <Card class="border-none shadow-2xl">
    <CardHeader class="items-center gap-2 text-center">
      <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a4fa8] to-[#00b4d8] text-xl text-white">
        <i class="fas fa-water" />
      </div>
      <CardTitle class="font-serif text-2xl">Painel da Redação</CardTitle>
      <CardDescription>
        Portal Sampa na Ilha — acesso restrito à equipe editorial.
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form class="flex flex-col gap-4" @submit.prevent="entrar">
        <div class="grid gap-2">
          <Label for="email">E-mail</Label>
          <div class="relative">
            <AtSignIcon class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              v-model="email"
              type="email"
              class="pl-9"
              placeholder="voce@portalsampanailha.com.br"
              autocomplete="username"
              required
            />
          </div>
        </div>

        <div class="grid gap-2">
          <Label for="senha">Senha</Label>
          <div class="relative">
            <LockIcon class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="senha"
              v-model="senha"
              :type="mostrarSenha ? 'text' : 'password'"
              class="px-9"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
              @click="mostrarSenha = !mostrarSenha"
            >
              <EyeOffIcon v-if="mostrarSenha" class="size-4" />
              <EyeIcon v-else class="size-4" />
            </button>
          </div>
        </div>

        <label class="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox id="lembrar" :model-value="lembrar" @update:model-value="lembrar = !!$event" />
          Manter conectado por 7 dias
        </label>

        <p v-if="auth.erro" class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {{ auth.erro }}
        </p>

        <Button type="submit" class="w-full" :disabled="auth.carregando">
          <LoaderCircleIcon v-if="auth.carregando" class="size-4 animate-spin" />
          <ShieldCheckIcon v-else class="size-4" />
          {{ auth.carregando ? 'Entrando…' : 'Entrar no painel' }}
        </Button>
      </form>
    </CardContent>

    <CardFooter class="flex-col gap-3 border-t pt-4 text-center">
      <p class="text-xs text-muted-foreground">
        Credenciais do ambiente de demonstração (definidas na API, em
        <code class="font-mono text-foreground">ADMIN_EMAIL</code> /
        <code class="font-mono text-foreground">ADMIN_PASSWORD</code>):<br>
        <code class="font-mono text-foreground">admin@portalsampanailha.com.br</code> ·
        <code class="font-mono text-foreground">Sampa2026!</code>
      </p>
      <NuxtLink to="/" class="text-xs font-medium text-primary hover:underline">
        ← Voltar para o portal
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
