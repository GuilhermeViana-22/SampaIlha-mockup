<script setup lang="ts">
import { ImagePlusIcon, LoaderCircleIcon, SaveIcon } from '@lucide/vue'
import type { Episodio } from '#shared/types/podcast'
import { PLATAFORMAS_EPISODIO, STATUS_EPISODIO } from '#shared/types/podcast'

/**
 * Cadastro e edição de episódio, no mesmo diálogo.
 *
 * O campo que importa é o link: o episódio mora no Spotify, no YouTube ou no
 * Deezer, e é do endereço que sai o player da página. Por isso a plataforma
 * não é uma escolha do formulário — ela é reconhecida do próprio link, e o
 * aviso embaixo do campo diz na hora se o player vai funcionar.
 *
 * A capa é opcional e vai em um segundo pedido, como na publicidade: corrigir
 * o texto de um episódio não deve obrigar a reenviar a arte.
 */
const props = defineProps<{ episodio: Episodio | null }>()

const aberto = defineModel<boolean>({ required: true })
const emit = defineEmits<{ salvo: [episodio: Episodio, criado: boolean] }>()

const podcast = usePodcastStore()

const edicao = computed(() => !!props.episodio)
const salvando = ref(false)
const campoArquivo = ref<HTMLInputElement | null>(null)

const form = reactive({
  titulo: '',
  descricao: '',
  midiaUrl: '',
  // Vazio é `''` e não `null`: o `<input type="number">` não aceita nulo, e
  // trocar os dois aqui obrigaria a converter em todo lugar que lê o campo.
  numero: '' as number | '',
  duracao: '',
  status: 'rascunho' as Episodio['status'],
  publicadoEm: '',
})

const arquivo = ref<File | null>(null)
const previaLocal = ref<string | null>(null)

/** Libera o object URL — sem isso o blob fica preso na memória da aba. */
function descartarPrevia() {
  if (previaLocal.value) {
    URL.revokeObjectURL(previaLocal.value)
    previaLocal.value = null
  }
}

const previa = computed(() => previaLocal.value ?? props.episodio?.capaUrl ?? null)

/** `datetime-local` quer `AAAA-MM-DDTHH:mm`; a API devolve ISO com segundos. */
function paraCampoData(iso: string | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 16)
}

watch(aberto, (abriu) => {
  if (!abriu) {
    descartarPrevia()
    return
  }

  form.titulo = props.episodio?.titulo ?? ''
  form.descricao = props.episodio?.descricao ?? ''
  form.midiaUrl = props.episodio?.midiaUrl ?? ''
  form.numero = props.episodio?.numero ?? ''
  form.duracao = props.episodio?.duracao ?? ''
  form.status = props.episodio?.status ?? 'rascunho'
  form.publicadoEm = paraCampoData(props.episodio?.publicadoEm)

  arquivo.value = null
  descartarPrevia()
  if (campoArquivo.value) campoArquivo.value.value = ''
})

onBeforeUnmount(descartarPrevia)

function escolher(evento: Event) {
  const escolhido = (evento.target as HTMLInputElement).files?.[0]
  if (!escolhido) return

  descartarPrevia()
  arquivo.value = escolhido
  previaLocal.value = URL.createObjectURL(escolhido)
}

const linkValido = computed(() => {
  const url = form.midiaUrl.trim()
  return !!url && /^https?:\/\//i.test(url)
})

/**
 * O mesmo reconhecimento que a API faz, repetido aqui só para o aviso.
 *
 * Não é duplicação de regra: quem decide é o servidor, e o que está gravado
 * vem de lá. Isto existe para a redação saber, antes de salvar, se colou o
 * link do episódio ou o da página do programa — o erro que mais acontece.
 */
const plataformaPrevista = computed(() => {
  const url = form.midiaUrl.trim().toLowerCase()
  if (!linkValido.value) return null
  if (url.includes('spotify.com')) return 'spotify' as const
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube' as const
  if (url.includes('deezer.com')) return 'deezer' as const
  return 'outro' as const
})

const podeSalvar = computed(() => form.titulo.trim().length >= 3 && linkValido.value)

function corpo() {
  return {
    titulo: form.titulo.trim(),
    descricao: form.descricao.trim(),
    midiaUrl: form.midiaUrl.trim(),
    numero: form.numero === '' ? null : form.numero,
    duracao: form.duracao.trim(),
    status: form.status,
    // Sem data informada, a API usa o instante do cadastro — é o caso de quem
    // cadastra o episódio que acabou de subir na plataforma.
    publicadoEm: form.publicadoEm || undefined,
  }
}

async function salvar() {
  if (!podeSalvar.value || salvando.value) return

  salvando.value = true

  try {
    const criando = !edicao.value
    let salvo = criando
      ? await podcast.criar(corpo())
      : await podcast.atualizar(props.episodio!.id, corpo())

    if (!salvo) {
      avisar.erro(podcast.erro, 'Não foi possível salvar o episódio.', 'O que você preencheu continua aí.')
      return
    }

    if (arquivo.value) {
      salvo = await podcast.enviarCapa(salvo.id, arquivo.value) ?? salvo
    }

    emit('salvo', salvo, criando)
    aberto.value = false

    if (salvo.embedUrl === null) {
      avisar.sucesso(
        criando ? 'Episódio cadastrado.' : 'Episódio atualizado.',
        'O link não é de uma plataforma que sabemos embutir: o card vai mostrar um botão para ouvir fora do site.',
      )
    }
    else if (criando && salvo.status === 'rascunho') {
      avisar.sucesso('Episódio cadastrado como rascunho.', 'Clique em “Publicar” quando quiser no feed.')
    }
    else {
      avisar.sucesso(criando ? 'Episódio cadastrado.' : 'Episódio atualizado.')
    }
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
        <DialogTitle>{{ edicao ? 'Editar episódio' : 'Novo episódio' }}</DialogTitle>
        <DialogDescription>
          O áudio continua no Spotify, no YouTube ou no Deezer — aqui entra a chamada, e o player
          aparece embutido no feed de /podcast.
        </DialogDescription>
      </DialogHeader>

      <div class="grid max-h-[65vh] gap-4 overflow-y-auto py-2 sm:grid-cols-2">
        <div class="grid gap-2 sm:col-span-2">
          <Label for="link-episodio">Link do episódio</Label>
          <Input
            id="link-episodio"
            v-model="form.midiaUrl"
            maxlength="500"
            placeholder="https://open.spotify.com/episode/…"
            :aria-invalid="!!form.midiaUrl && !linkValido"
          />
          <p v-if="form.midiaUrl && !linkValido" class="text-xs text-destructive">
            O link precisa começar com http:// ou https://.
          </p>
          <p v-else-if="plataformaPrevista === 'outro'" class="text-xs text-amber-600">
            Não reconhecemos esta plataforma: o card vai mostrar um botão para ouvir fora do site,
            em vez do player embutido. Confira se copiou o link do episódio.
          </p>
          <p v-else-if="plataformaPrevista" class="text-xs text-muted-foreground">
            <i :class="PLATAFORMAS_EPISODIO[plataformaPrevista].icone" />
            {{ PLATAFORMAS_EPISODIO[plataformaPrevista].rotulo }} — o player entra embutido no feed.
          </p>
          <p v-else class="text-xs text-muted-foreground">
            Cole o endereço do botão “compartilhar” do Spotify, YouTube ou Deezer.
          </p>
        </div>

        <div class="grid gap-2 sm:col-span-2">
          <Label for="titulo-episodio">Título</Label>
          <Input
            id="titulo-episodio"
            v-model="form.titulo"
            maxlength="180"
            placeholder="Ex.: EP 01 — Parintins chega a São Paulo"
          />
        </div>

        <div class="grid gap-2 sm:col-span-2">
          <Label for="descricao-episodio">Texto do post</Label>
          <Textarea
            id="descricao-episodio"
            v-model="form.descricao"
            rows="4"
            placeholder="O que o ouvinte vai encontrar neste episódio."
          />
          <p class="text-xs text-muted-foreground">
            É o texto do card no feed, acima do player. Quebras de linha são mantidas.
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="numero-episodio">Número do episódio</Label>
          <Input id="numero-episodio" v-model.number="form.numero" type="number" min="0" max="9999" />
          <p class="text-xs text-muted-foreground">Vira o selo “EP 12”. Em branco, o selo não aparece.</p>
        </div>

        <div class="grid gap-2">
          <Label for="duracao-episodio">Duração</Label>
          <Input id="duracao-episodio" v-model="form.duracao" maxlength="20" placeholder="Ex.: 48 min" />
        </div>

        <div class="grid gap-2">
          <Label for="status-episodio">Status</Label>
          <Select id="status-episodio" v-model="form.status">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="status in STATUS_EPISODIO" :key="status.valor" :value="status.valor">
                {{ status.rotulo }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-muted-foreground">
            {{ STATUS_EPISODIO.find(status => status.valor === form.status)?.descricao }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="data-episodio">Data do episódio</Label>
          <Input id="data-episodio" v-model="form.publicadoEm" type="datetime-local" />
          <p class="text-xs text-muted-foreground">
            É o que ordena o feed. Em branco, vale agora.
          </p>
        </div>

        <div class="grid gap-2 sm:col-span-2">
          <Label>Capa (opcional)</Label>
          <input
            ref="campoArquivo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="escolher"
          >
          <div
            class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors hover:border-primary/60 hover:bg-muted/40"
            @click="campoArquivo?.click()"
          >
            <img v-if="previa" :src="previa" alt="Prévia da capa" class="max-h-40 rounded-md">
            <template v-else>
              <ImagePlusIcon class="size-8 text-muted-foreground" />
              <p class="text-sm font-medium">Escolher a capa</p>
            </template>
            <p class="text-xs text-muted-foreground">
              Quadrada, como nas plataformas. Só aparece no card quando o link não tem player
              embutido — o do Spotify e o do YouTube já trazem a arte dentro.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="salvando" @click="aberto = false">Cancelar</Button>
        <Button :disabled="salvando || !podeSalvar" @click="salvar()">
          <LoaderCircleIcon v-if="salvando" class="size-4 animate-spin" />
          <SaveIcon v-else class="size-4" />
          {{ edicao ? 'Salvar' : 'Cadastrar episódio' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
