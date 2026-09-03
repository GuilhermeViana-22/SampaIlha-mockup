<script setup lang="ts">
import { LoaderCircleIcon, UploadCloudIcon, XIcon } from '@lucide/vue'
import type { MidiaKit } from '#shared/types/content'

/**
 * Envio de uma peça nova para o mídia kit.
 *
 * São três campos, e nenhum a mais: título, descrição e arquivo. O tipo da peça
 * não é perguntado porque a API o deduz do conteúdo do arquivo — pedi-lo aqui
 * seria pedir para repetir o que o próprio arquivo já diz, com a chance de
 * errar.
 */
const emit = defineEmits<{ enviada: [peca: MidiaKit] }>()

/** O que a API aceita. A conferência de verdade é lá, pelo conteúdo. */
const EXTENSOES = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp', '.gif']
/** Precisa acompanhar `MEDIA_KIT_MAX_SIZE_MB` no `.env` da API. */
const LIMITE_MB = 25

const campoArquivo = ref<HTMLInputElement | null>(null)
const arrastando = ref(false)
const enviando = ref(false)

const formulario = reactive({
  titulo: '',
  descricao: '',
  arquivo: null as File | null,
})

const podeEnviar = computed(() => !!formulario.arquivo && formulario.titulo.trim().length >= 2)

/**
 * Recebe o arquivo escolhido ou arrastado.
 *
 * A recusa acontece aqui só para dar resposta imediata: mandar 30 MB para a API
 * e esperar o 422 é gastar o tempo de quem está subindo. Quem decide de fato é
 * a API, que olha o conteúdo — a extensão só diz o que o nome promete.
 */
function receber(arquivo: File | undefined) {
  if (!arquivo) return

  const extensao = arquivo.name.slice(arquivo.name.lastIndexOf('.')).toLowerCase()
  if (!EXTENSOES.includes(extensao)) {
    avisar.alerta('Formato não aceito.', `Envie ${EXTENSOES.join(', ')}.`)
    return
  }

  if (arquivo.size > LIMITE_MB * 1024 * 1024) {
    avisar.alerta('Arquivo grande demais.', `O limite do mídia kit é ${LIMITE_MB} MB.`)
    return
  }

  formulario.arquivo = arquivo
}

function aoSoltar(evento: DragEvent) {
  evento.preventDefault()
  arrastando.value = false
  receber(evento.dataTransfer?.files?.[0])
}

function limpar() {
  formulario.titulo = ''
  formulario.descricao = ''
  formulario.arquivo = null
  if (campoArquivo.value) campoArquivo.value.value = ''
}

/**
 * Sobe a peça.
 *
 * O formulário só é limpo depois de a API confirmar: esvaziar antes faria quem
 * cadastrou perder o texto digitado sempre que o envio falhasse.
 */
async function enviar() {
  if (!podeEnviar.value || enviando.value) return

  const dados = new FormData()
  dados.append('file', formulario.arquivo!)
  dados.append('title', formulario.titulo.trim())
  dados.append('description', formulario.descricao.trim())

  enviando.value = true

  try {
    const peca = await $fetch<MidiaKit>('/api/midia-kit', { method: 'POST', body: dados })

    emit('enviada', peca)
    limpar()
    avisar.sucesso('Peça adicionada ao mídia kit.', 'Já dá para copiar o link e mandar.')
  }
  catch (erro: unknown) {
    avisar.erro(erro, 'Não foi possível enviar o arquivo.', 'O que você digitou continua aí.')
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <Card class="lg:sticky lg:top-24 h-fit">
    <CardHeader>
      <CardTitle class="text-base">Nova peça</CardTitle>
      <CardDescription>
        Logo, PDF de apresentação, contrato modelo — o que o comercial precisa ter à mão.
      </CardDescription>
    </CardHeader>

    <CardContent class="flex flex-col gap-4">
      <div class="grid gap-2">
        <Label for="titulo-peca">Título</Label>
        <Input
          id="titulo-peca"
          v-model="formulario.titulo"
          maxlength="180"
          placeholder="Ex.: Logo horizontal — fundo claro"
        />
      </div>

      <div class="grid gap-2">
        <Label for="descricao-peca">Dimensões e uso</Label>
        <Textarea
          id="descricao-peca"
          v-model="formulario.descricao"
          rows="4"
          placeholder="Ex.: 2400 × 800 px, PNG com fundo transparente. Não usar sobre fundo escuro."
        />
        <p class="text-xs text-muted-foreground">
          É o que o patrocinador lê antes de usar o arquivo — tamanho, formato e o que não fazer.
        </p>
      </div>

      <div class="grid gap-2">
        <Label>Arquivo</Label>
        <input
          ref="campoArquivo"
          type="file"
          :accept="EXTENSOES.join(',')"
          class="hidden"
          @change="receber((($event.target as HTMLInputElement).files ?? [])[0])"
        >
        <div
          class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors"
          :class="arrastando ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/60 hover:bg-muted/40'"
          @click="campoArquivo?.click()"
          @dragover.prevent="arrastando = true"
          @dragleave="arrastando = false"
          @drop="aoSoltar"
        >
          <UploadCloudIcon class="size-8 text-muted-foreground" />
          <p class="text-sm font-medium">Arraste aqui ou clique para escolher</p>
          <p class="text-xs text-muted-foreground">
            PDF, DOC, DOCX, JPG, PNG, WebP ou GIF — até {{ LIMITE_MB }} MB
          </p>
          <p v-if="formulario.arquivo" class="mt-2 line-clamp-1 text-sm font-medium text-primary">
            {{ formulario.arquivo.name }}
          </p>
        </div>
      </div>
    </CardContent>

    <CardFooter class="gap-2">
      <Button :disabled="enviando || !podeEnviar" @click="enviar()">
        <LoaderCircleIcon v-if="enviando" class="size-4 animate-spin" />
        <UploadCloudIcon v-else class="size-4" />
        {{ enviando ? 'Enviando…' : 'Adicionar peça' }}
      </Button>
      <Button variant="outline" :disabled="enviando" @click="limpar()">
        <XIcon class="size-4" /> Limpar
      </Button>
    </CardFooter>
  </Card>
</template>
