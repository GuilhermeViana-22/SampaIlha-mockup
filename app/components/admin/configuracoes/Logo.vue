<script setup lang="ts">
import { ImageIcon, LoaderCircleIcon, RotateCcwIcon, UploadIcon } from '@lucide/vue'

/**
 * Troca do logo do portal.
 *
 * O arquivo do build continua sendo o fallback: enquanto ninguém enviar um, é
 * ele que aparece no site — e "Voltar ao logo original" desfaz a troca a
 * qualquer momento, sem precisar reenviar nada.
 */
const marca = useMarcaStore()

await marca.carregar()

const entrada = ref<HTMLInputElement | null>(null)
const previa = ref<string | null>(null)
const arquivo = ref<File | null>(null)
const restaurando = ref(false)

/** O que a prévia mostra: o candidato escolhido ou o logo em uso. */
const exibindo = computed(() => previa.value ?? marca.logo)
const temPendente = computed(() => arquivo.value !== null)

function escolher(evento: Event) {
  const alvo = evento.target as HTMLInputElement
  const escolhido = alvo.files?.[0]
  if (!escolhido) return

  if (!escolhido.type.startsWith('image/')) {
    avisar.erro(null, 'Escolha um arquivo de imagem.', 'Aceitamos PNG, JPEG, WebP ou GIF.')
    return
  }

  arquivo.value = escolhido
  // A prévia sai do arquivo local: mostra o resultado antes de subir nada.
  if (previa.value) URL.revokeObjectURL(previa.value)
  previa.value = URL.createObjectURL(escolhido)
}

function descartar() {
  if (previa.value) URL.revokeObjectURL(previa.value)
  previa.value = null
  arquivo.value = null
  if (entrada.value) entrada.value.value = ''
}

onBeforeUnmount(() => {
  if (previa.value) URL.revokeObjectURL(previa.value)
})

async function enviar() {
  if (!arquivo.value) return
  try {
    await marca.enviar(arquivo.value)
    descartar()
    avisar.sucesso('Logo atualizado.', 'Ele já aparece no cabeçalho e no rodapé do portal.')
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível enviar o logo.', 'O logo atual continua no ar.')
  }
}

async function restaurar() {
  restaurando.value = true
  try {
    await marca.restaurarPadrao()
    descartar()
    avisar.sucesso('Logo original restaurado.')
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível restaurar o logo original.')
  }
  finally {
    restaurando.value = false
  }
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <ImageIcon class="size-4 text-primary" /> Logo do portal
        </CardTitle>
        <CardDescription>
          Aparece no cabeçalho e no rodapé do site, na marca do painel e na tela de acesso.
          Depois de salvar, a troca vale para quem já está lendo o portal.
        </CardDescription>
      </CardHeader>

      <CardContent class="flex flex-col gap-4">
        <div class="grid gap-2">
          <Label for="logo">Arquivo</Label>
          <input
            id="logo"
            ref="entrada"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            class="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:opacity-90"
            @change="escolher"
          >
          <p class="text-xs text-muted-foreground">
            PNG com fundo transparente é o que fica melhor — o rodapé é escuro e um fundo branco
            viraria um quadrado. Use uma imagem quadrada de pelo menos 240&nbsp;px.
          </p>
        </div>

        <div v-if="temPendente" class="flex flex-wrap gap-2">
          <Button :disabled="marca.salvando" @click="enviar()">
            <LoaderCircleIcon v-if="marca.salvando" class="size-4 animate-spin" />
            <UploadIcon v-else class="size-4" />
            Salvar novo logo
          </Button>
          <Button variant="ghost" :disabled="marca.salvando" @click="descartar()">
            Descartar
          </Button>
        </div>

        <Separator v-if="!marca.usandoPadrao" />

        <div v-if="!marca.usandoPadrao" class="flex flex-col gap-2">
          <p class="text-xs text-muted-foreground">
            O portal está usando um logo enviado por aqui.
          </p>
          <Button variant="outline" size="sm" class="self-start" :disabled="restaurando" @click="restaurar()">
            <RotateCcwIcon class="size-4" /> Voltar ao logo original
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          {{ temPendente ? 'Prévia do novo logo' : 'Logo em uso' }}
        </CardTitle>
        <CardDescription>
          {{ temPendente
            ? 'Ainda não foi salvo — é só a imagem escolhida no seu computador.'
            : marca.usandoPadrao
              ? 'É o logo que veio no build do site.'
              : 'Enviado pelo painel.' }}
        </CardDescription>
      </CardHeader>

      <CardContent class="flex flex-col gap-3">
        <!-- Os dois fundos, porque o logo vive sobre claro (topo) e escuro (rodapé). -->
        <div class="flex items-center gap-3 rounded-lg border bg-white p-4">
          <img :src="exibindo" alt="Prévia do logo" class="h-16 w-auto object-contain">
          <div class="leading-tight">
            <p class="font-serif text-lg font-bold text-[#0c560b]">Sampa na Ilha</p>
            <p class="text-[10px] uppercase tracking-widest text-gray-500">Sobre o cabeçalho</p>
          </div>
        </div>

        <div class="flex items-center gap-3 rounded-lg border p-4" style="background:#0d1b2a">
          <img :src="exibindo" alt="Prévia do logo no rodapé" class="h-16 w-auto object-contain">
          <div class="leading-tight">
            <p class="font-serif text-lg font-bold text-white">Sampa na Ilha</p>
            <p class="text-[10px] uppercase tracking-widest text-white/50">Sobre o rodapé</p>
          </div>
        </div>

        <div class="flex items-center gap-3 rounded-lg border bg-muted/40 p-4">
          <img :src="exibindo" alt="Prévia do logo no painel" class="size-8 object-contain">
          <p class="text-xs text-muted-foreground">No tamanho da marca do painel (32&nbsp;px)</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
