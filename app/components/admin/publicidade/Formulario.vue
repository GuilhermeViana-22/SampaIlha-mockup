<script setup lang="ts">
import { ImagePlusIcon, LoaderCircleIcon, SaveIcon } from '@lucide/vue'
import type { Publicidade } from '#shared/types/content'
import { STATUS_PUBLICIDADE } from '#shared/types/content'

/**
 * Cadastro e edição de anúncio, no mesmo diálogo.
 *
 * A diferença entre os dois casos é só a arte: no cadastro ela é obrigatória
 * (o anúncio é o banner — não há card de publicidade sem imagem), e na edição
 * ela só é enviada se alguém escolher um arquivo novo, em um segundo pedido.
 * Assim, corrigir o texto de uma campanha não obriga a reenviar o criativo.
 */
const props = defineProps<{ anuncio: Publicidade | null }>()

const aberto = defineModel<boolean>({ required: true })
const emit = defineEmits<{ salvo: [anuncio: Publicidade, criado: boolean] }>()

const edicao = computed(() => !!props.anuncio)
const salvando = ref(false)
const campoArquivo = ref<HTMLInputElement | null>(null)

const form = reactive({
  titulo: '',
  descricao: '',
  linkUrl: '',
  status: 'rascunho' as Publicidade['status'],
  publicarDe: '',
  publicarAte: '',
  ordem: 0,
})

/** Arquivo escolhido agora; some assim que o servidor confirma o envio. */
const arquivo = ref<File | null>(null)
const previaLocal = ref<string | null>(null)

/** Libera o object URL — sem isso o blob fica preso na memória da aba. */
function descartarPrevia() {
  if (previaLocal.value) {
    URL.revokeObjectURL(previaLocal.value)
    previaLocal.value = null
  }
}

/** O que a moldura mostra: o arquivo escolhido agora, senão a arte gravada. */
const previa = computed(() => previaLocal.value ?? props.anuncio?.imagemUrl ?? null)

/** Recarrega o formulário toda vez que o diálogo abre. */
watch(aberto, (abriu) => {
  if (!abriu) {
    descartarPrevia()
    return
  }

  form.titulo = props.anuncio?.titulo ?? ''
  form.descricao = props.anuncio?.descricao ?? ''
  form.linkUrl = props.anuncio?.linkUrl ?? ''
  form.status = props.anuncio?.status ?? 'rascunho'
  form.publicarDe = props.anuncio?.publicarDe ?? ''
  form.publicarAte = props.anuncio?.publicarAte ?? ''
  form.ordem = props.anuncio?.ordem ?? 0

  arquivo.value = null
  descartarPrevia()
  if (campoArquivo.value) campoArquivo.value.value = ''
})

onBeforeUnmount(descartarPrevia)

function escolher(evento: Event) {
  const escolhido = (evento.target as HTMLInputElement).files?.[0]
  if (!escolhido) return

  // Mostra a arte no instante do clique, antes de qualquer viagem à API: é
  // como se confere que o criativo é o certo enquanto o envio acontece.
  descartarPrevia()
  arquivo.value = escolhido
  previaLocal.value = URL.createObjectURL(escolhido)
}

/**
 * O link vira o `href` do banner no portal, então precisa ser um endereço
 * externo de verdade. A API recusa o resto; avisar aqui evita a ida e volta.
 */
const linkValido = computed(() => {
  const url = form.linkUrl.trim()
  return !url || /^https?:\/\//i.test(url)
})

/** Uma janela que termina antes de começar nunca exibiria o banner. */
const janelaValida = computed(() =>
  !form.publicarDe || !form.publicarAte || form.publicarAte >= form.publicarDe)

const podeSalvar = computed(() =>
  form.titulo.trim().length >= 2
  && linkValido.value
  && janelaValida.value
  && (edicao.value || !!arquivo.value))

function campos(): Record<string, string> {
  return {
    title: form.titulo.trim(),
    description: form.descricao.trim(),
    link_url: form.linkUrl.trim(),
    status: form.status,
    published_from: form.publicarDe,
    published_until: form.publicarAte,
    sort_order: String(form.ordem),
  }
}

async function cadastrar(): Promise<Publicidade> {
  const dados = new FormData()
  dados.append('file', arquivo.value!)
  for (const [nome, valor] of Object.entries(campos())) dados.append(nome, valor)

  return await $fetch<Publicidade>('/api/publicidade', { method: 'POST', body: dados })
}

/**
 * Salva a edição: primeiro o cadastro, depois a arte, se houver arte nova.
 *
 * Nesta ordem porque o texto é o que costuma mudar; se o envio da imagem
 * falhar, o resto já está salvo e a mensagem diz exatamente o que faltou.
 */
async function editar(): Promise<Publicidade> {
  let salvo = await $fetch<Publicidade>(`/api/publicidade/${props.anuncio!.id}`, {
    method: 'PUT',
    body: {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      linkUrl: form.linkUrl.trim(),
      status: form.status,
      publicarDe: form.publicarDe,
      publicarAte: form.publicarAte,
      ordem: form.ordem,
    },
  })

  if (arquivo.value) {
    const dados = new FormData()
    dados.append('file', arquivo.value)
    salvo = await $fetch<Publicidade>(`/api/publicidade/${props.anuncio!.id}/imagem`, {
      method: 'PUT',
      body: dados,
    })
  }

  return salvo
}

async function salvar() {
  if (!podeSalvar.value || salvando.value) return

  salvando.value = true

  try {
    const criando = !edicao.value
    const salvo = criando ? await cadastrar() : await editar()

    emit('salvo', salvo, criando)
    aberto.value = false

    if (criando && salvo.status === 'rascunho') {
      avisar.sucesso('Anúncio cadastrado como rascunho.', 'Clique em “Pôr no ar” quando a campanha começar.')
    }
    else {
      avisar.sucesso(criando ? 'Anúncio cadastrado.' : 'Anúncio atualizado.')
    }
  }
  catch (erro: unknown) {
    avisar.erro(erro, 'Não foi possível salvar o anúncio.', 'O que você preencheu continua aí.')
  }
  finally {
    salvando.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="aberto">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ edicao ? 'Editar anúncio' : 'Novo anúncio' }}</DialogTitle>
        <DialogDescription>
          O banner aparece na coluna lateral do portal. Enquanto nenhum estiver no ar, o espaço
          simplesmente não é desenhado.
        </DialogDescription>
      </DialogHeader>

      <div class="grid max-h-[65vh] gap-4 overflow-y-auto py-2 sm:grid-cols-2">
        <div class="grid gap-2 sm:col-span-2">
          <Label>Arte do banner</Label>
          <input
            ref="campoArquivo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="hidden"
            @change="escolher"
          >
          <div
            class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors hover:border-primary/60 hover:bg-muted/40"
            @click="campoArquivo?.click()"
          >
            <img v-if="previa" :src="previa" alt="Prévia da arte" class="max-h-48 rounded-md">
            <template v-else>
              <ImagePlusIcon class="size-8 text-muted-foreground" />
              <p class="text-sm font-medium">Escolher a arte</p>
            </template>
            <p class="text-xs text-muted-foreground">
              JPG, PNG, WebP ou GIF. A coluna tem 300 px de largura — 300 × 250 é o formato usual.
              {{ edicao ? 'Escolher um arquivo troca a arte no ar.' : '' }}
            </p>
          </div>
        </div>

        <div class="grid gap-2 sm:col-span-2">
          <Label for="titulo-anuncio">Nome da campanha</Label>
          <Input
            id="titulo-anuncio"
            v-model="form.titulo"
            maxlength="180"
            placeholder="Ex.: Pousada Maré Alta — verão 2026"
          />
          <p class="text-xs text-muted-foreground">Aparece acima da arte, no portal e na listagem daqui.</p>
        </div>

        <div class="grid gap-2 sm:col-span-2">
          <Label for="descricao-anuncio">Linha de apoio</Label>
          <Textarea
            id="descricao-anuncio"
            v-model="form.descricao"
            rows="2"
            maxlength="300"
            placeholder="Ex.: Diárias com café da manhã, de frente para o mar."
          />
        </div>

        <div class="grid gap-2 sm:col-span-2">
          <Label for="link-anuncio">Link do anunciante</Label>
          <Input
            id="link-anuncio"
            v-model="form.linkUrl"
            maxlength="500"
            placeholder="https://…"
            :aria-invalid="!linkValido"
          />
          <p v-if="!linkValido" class="text-xs text-destructive">
            O link precisa começar com http:// ou https://.
          </p>
          <p v-else class="text-xs text-muted-foreground">
            Para onde o clique leva. Vazio deixa o banner sem link.
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="status-anuncio">Status</Label>
          <Select id="status-anuncio" v-model="form.status">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="status in STATUS_PUBLICIDADE" :key="status.valor" :value="status.valor">
                {{ status.rotulo }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-muted-foreground">
            {{ STATUS_PUBLICIDADE.find(status => status.valor === form.status)?.descricao }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="ordem-anuncio">Posição na coluna</Label>
          <Input id="ordem-anuncio" v-model.number="form.ordem" type="number" min="0" max="999" />
          <p class="text-xs text-muted-foreground">Menor aparece primeiro.</p>
        </div>

        <div class="grid gap-2">
          <Label for="de-anuncio">Veicular de</Label>
          <Input id="de-anuncio" v-model="form.publicarDe" type="date" />
        </div>

        <div class="grid gap-2">
          <Label for="ate-anuncio">até</Label>
          <Input id="ate-anuncio" v-model="form.publicarAte" type="date" :aria-invalid="!janelaValida" />
        </div>

        <p v-if="!janelaValida" class="text-xs text-destructive sm:col-span-2">
          A data de fim não pode ser anterior à de início.
        </p>
        <p v-else class="text-xs text-muted-foreground sm:col-span-2">
          Datas em branco: o banner entra assim que for publicado e fica sem prazo para sair.
          Com datas, ele entra e sai sozinho, no dia do contrato.
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="salvando" @click="aberto = false">Cancelar</Button>
        <Button :disabled="salvando || !podeSalvar" @click="salvar()">
          <LoaderCircleIcon v-if="salvando" class="size-4 animate-spin" />
          <SaveIcon v-else class="size-4" />
          {{ edicao ? 'Salvar' : 'Cadastrar anúncio' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
