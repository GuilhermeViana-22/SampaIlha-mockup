<script setup lang="ts">
import {
  ArrowLeftIcon, CheckCircle2Icon, ExternalLinkIcon, ImagePlusIcon, LoaderCircleIcon, SaveIcon,
  TriangleAlertIcon, Trash2Icon,
} from '@lucide/vue'
import type { Workshop, WorkshopInput } from '#shared/types/workshop'
import { STATUS_WORKSHOP, VISIBILIDADE_WORKSHOP } from '#shared/types/workshop'

/**
 * Formulário único de criação e edição de oficina.
 *
 * O cartaz só pode ser enviado depois do primeiro salvamento: a API anexa o
 * arquivo a uma oficina que já existe, então antes disso não há onde pendurar.
 * O mesmo acontece com as fotos das matérias.
 */
const props = defineProps<{ oficina?: Workshop | null }>()

const workshops = useWorkshopsStore()

const edicao = computed(() => !!props.oficina)
const enviandoCartaz = ref(false)
const campoArquivo = ref<HTMLInputElement | null>(null)

/**
 * O cartaz que está gravado no servidor. É o que sobrevive a um recarregamento
 * da página — e, por isso, a única prova de que o envio deu certo.
 */
const cartazSalvo = ref<string | null>(props.oficina?.imagemUrl ?? null)

/**
 * Espelho local do arquivo recém-escolhido, montado com `URL.createObjectURL`.
 *
 * Serve para a imagem aparecer no instante do clique, sem esperar a viagem até
 * a API. Some assim que o servidor responde: a partir daí quem manda é
 * `cartazSalvo`, que veio do banco.
 */
const cartazLocal = ref<string | null>(null)

/** O que a moldura mostra: o arquivo escolhido agora, senão o que está salvo. */
const cartaz = computed(() => cartazLocal.value ?? cartazSalvo.value)

/** Libera o object URL — sem isso o blob fica preso na memória da aba. */
function descartarPrevia() {
  if (cartazLocal.value) {
    URL.revokeObjectURL(cartazLocal.value)
    cartazLocal.value = null
  }
}

onBeforeUnmount(descartarPrevia)

/**
 * O que os campos do formulário guardam.
 *
 * Difere de `WorkshopInput` num ponto: aqui os opcionais são sempre `string`,
 * nunca `null`. Um `<Input>` não aceita `null` no `v-model`, e o formulário só
 * sabe produzir string vazia — a conversão de "" para `null` acontece no BFF,
 * em `paraPayloadWorkshop`, que é quem conhece o contrato da API.
 */
type CamposFormulario = {
  [K in keyof WorkshopInput]-?: NonNullable<WorkshopInput[K]>
}

function estadoInicial(): CamposFormulario {
  return {
    titulo: props.oficina?.titulo ?? '',
    slug: props.oficina?.slug ?? '',
    status: props.oficina?.status ?? 'rascunho',
    resumo: props.oficina?.resumo ?? '',
    conteudo: props.oficina?.conteudo ?? '',
    inscricaoUrl: props.oficina?.inscricaoUrl ?? '',
    acontecemEm: props.oficina?.acontecemEm ?? '',
    local: props.oficina?.local ?? '',
    publicarDe: props.oficina?.publicarDe ?? '',
    publicarAte: props.oficina?.publicarAte ?? '',
  }
}

const form = reactive<CamposFormulario>(estadoInicial())

/** Slug acompanha o título enquanto não for editado à mão. */
const slugManual = ref(!!props.oficina)
watch(() => form.titulo, (titulo) => {
  if (!slugManual.value) form.slug = gerarSlug(titulo)
})

const palavras = computed(() =>
  form.conteudo
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length)

/**
 * O link de inscrição vira o `href` do botão na página pública, então precisa
 * ser um endereço externo de verdade. A API recusa o resto; avisar aqui evita
 * a ida e volta.
 */
const linkValido = computed(() => {
  const url = form.inscricaoUrl.trim()
  return !url || /^https?:\/\//i.test(url)
})

/** Uma janela que termina antes de começar nunca exibiria nada. */
const janelaValida = computed(() =>
  !form.publicarDe || !form.publicarAte || form.publicarAte >= form.publicarDe)

const podeSalvar = computed(() =>
  form.titulo.trim().length >= 3 && linkValido.value && janelaValida.value)

/** Envia o cartaz. A API troca o arquivo e devolve a oficina já atualizada. */
async function enviarCartaz(evento: Event) {
  const arquivo = (evento.target as HTMLInputElement).files?.[0]
  if (!arquivo) return

  if (!edicao.value) {
    avisar.alerta(
      'Salve a oficina primeiro.',
      'O cartaz é anexado a uma oficina que já existe — salve o rascunho e envie em seguida.',
    )
    if (campoArquivo.value) campoArquivo.value.value = ''
    return
  }

  // Mostra o arquivo escolhido na hora, antes mesmo de subir: assim dá para
  // conferir que é a imagem certa enquanto o envio acontece.
  descartarPrevia()
  cartazLocal.value = URL.createObjectURL(arquivo)

  enviandoCartaz.value = true
  try {
    const salva = await workshops.enviarCartaz(props.oficina!.id, arquivo)

    if (salva) {
      // Troca a prévia local pela URL do servidor. É essa substituição que
      // prova o salvamento: o que aparece agora veio do banco, não do disco de
      // quem está editando.
      cartazSalvo.value = salva.imagemUrl
      descartarPrevia()
      avisar.sucesso('Cartaz salvo no servidor.', 'A imagem já é a que o site vai mostrar.')
    }
    else {
      // Desfaz a prévia: deixá-la na tela faria parecer que salvou.
      descartarPrevia()
      avisar.falha(workshops.erro ?? 'Não foi possível enviar o cartaz.', 'A imagem anterior continua valendo.')
    }
  }
  finally {
    enviandoCartaz.value = false
    // Limpa mesmo em caso de erro: sem isso, escolher o mesmo arquivo de novo
    // não dispararia `change` e pareceria que o botão travou.
    if (campoArquivo.value) campoArquivo.value.value = ''
  }
}

async function removerCartaz() {
  const salva = await workshops.removerCartaz(props.oficina!.id)

  if (salva) {
    descartarPrevia()
    cartazSalvo.value = null
    avisar.sucesso('Cartaz removido.', 'A oficina passa a usar a imagem padrão da seção.')
  }
  else {
    avisar.falha(workshops.erro ?? 'Não foi possível remover o cartaz.')
  }
}

/**
 * Grava a oficina — cria na primeira vez, atualiza nas seguintes.
 *
 * Só há redirecionamento na criação: depois de existir um id, a oficina ganha
 * a própria URL de edição, e é a partir dela que o envio do cartaz passa a
 * funcionar.
 */
async function salvar(publicar = false) {
  if (!form.titulo.trim()) {
    avisar.alerta('Dê um título à oficina antes de salvar.')
    return
  }
  if (!linkValido.value) {
    avisar.alerta('O link de inscrição precisa começar com http:// ou https://.')
    return
  }
  if (!janelaValida.value) {
    avisar.alerta('A data de fim da publicação não pode ser anterior à de início.')
    return
  }

  if (publicar) form.status = 'publicado'

  const criando = !edicao.value

  const salva = criando
    ? await workshops.criar({ ...toRaw(form) })
    : await workshops.atualizar(props.oficina!.id, { ...toRaw(form) })

  if (!salva) {
    avisar.falha(
      workshops.erro ?? 'Não foi possível salvar.',
      'Nada foi gravado — o texto continua aqui na tela.',
    )
    return
  }

  // Mantém a tela em sincronia com o que o servidor de fato gravou: o slug
  // pode voltar com sufixo quando já existe outra oficina de nome parecido.
  form.slug = salva.slug
  form.status = salva.status

  if (salva.status === 'publicado') {
    avisar.sucesso(
      criando ? 'Oficina criada e publicada.' : 'Alterações salvas e no ar.',
      'Já aparece em /cultura/workshops.',
    )
  }
  else {
    avisar.sucesso(
      criando ? 'Oficina criada.' : 'Alterações salvas.',
      'Continua como rascunho, fora do site.',
    )
  }

  if (criando) await navigateTo(`/admin/workshops/${salva.id}`)
}
</script>

<template>
  <form class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" @submit.prevent="salvar()">
    <!-- Coluna principal -->
    <div class="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Oficina</CardTitle>
          <CardDescription>Título, resumo e o texto que aparece na página.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <div class="grid gap-2">
            <Label for="titulo">Título</Label>
            <Input id="titulo" v-model="form.titulo" placeholder="Ex.: Oficina de confecção de adereços" required />
          </div>

          <div class="grid gap-2">
            <Label for="slug">Endereço (slug)</Label>
            <div class="flex items-center gap-2">
              <span class="shrink-0 text-xs text-muted-foreground">/cultura/workshops/</span>
              <Input id="slug" v-model="form.slug" class="font-mono text-xs" @input="slugManual = true" />
            </div>
          </div>

          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <Label for="resumo">Resumo</Label>
              <span class="text-xs text-muted-foreground">{{ form.resumo.length }}/500</span>
            </div>
            <Textarea
              id="resumo"
              v-model="form.resumo"
              rows="2"
              maxlength="500"
              placeholder="Uma frase sobre a oficina — aparece no card da listagem."
            />
          </div>

          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <Label>Texto</Label>
              <span class="text-xs text-muted-foreground">{{ palavras }} palavras</span>
            </div>
            <AdminPostsEditor v-model="form.conteudo" :post-id="null" />
            <p class="text-xs text-muted-foreground">
              O envio de imagens dentro do texto é exclusivo das matérias. Para a oficina, use o
              cartaz ao lado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Coluna lateral -->
    <div class="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Publicação</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <div class="grid gap-2">
            <Label for="status">Status</Label>
            <Select id="status" v-model="form.status">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="status in STATUS_WORKSHOP" :key="status.valor" :value="status.valor">
                  {{ status.rotulo }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              {{ STATUS_WORKSHOP.find(s => s.valor === form.status)?.descricao }}
            </p>
          </div>

          <!--
            A janela é independente do status: publicar diz "pode ir ao ar",
            estas datas dizem quando. Sem elas, vale a decisão do status e
            pronto — é o comportamento de quem não preenche nada.
          -->
          <div class="grid gap-2 rounded-lg border border-border p-3">
            <Label class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Janela de exibição no site
            </Label>

            <div class="grid gap-2 sm:grid-cols-2">
              <div class="grid gap-1.5">
                <Label for="publicarDe" class="text-xs font-normal">Aparece a partir de</Label>
                <Input id="publicarDe" v-model="form.publicarDe" type="date" />
              </div>
              <div class="grid gap-1.5">
                <Label for="publicarAte" class="text-xs font-normal">Sai do site em</Label>
                <Input
                  id="publicarAte"
                  v-model="form.publicarAte"
                  type="date"
                  :min="form.publicarDe || undefined"
                  :aria-invalid="!janelaValida"
                />
              </div>
            </div>

            <p class="text-xs" :class="janelaValida ? 'text-muted-foreground' : 'text-destructive'">
              <template v-if="!janelaValida">
                O fim não pode ser antes do início.
              </template>
              <template v-else-if="oficina && oficina.visibilidade !== 'no_ar' && form.status === 'publicado'">
                {{ VISIBILIDADE_WORKSHOP[oficina.visibilidade].ajuda }}
              </template>
              <template v-else>
                Deixe em branco para a oficina seguir só a decisão do status. Ela some do site
                sozinha depois da data de fim.
              </template>
            </p>
          </div>

          <div class="grid gap-2">
            <Label for="acontecemEm">Data da oficina</Label>
            <Input id="acontecemEm" v-model="form.acontecemEm" type="date" />
            <p class="text-xs text-muted-foreground">
              Sem data, a oficina aparece como “a definir” e conta entre as próximas.
            </p>
          </div>

          <div class="grid gap-2">
            <Label for="local">Local</Label>
            <Input id="local" v-model="form.local" placeholder="Ex.: Casa de Cultura, São Paulo" />
          </div>

          <div class="grid gap-2">
            <Label for="inscricaoUrl">Link de inscrição</Label>
            <Input
              id="inscricaoUrl"
              v-model="form.inscricaoUrl"
              placeholder="https://…"
              :aria-invalid="!linkValido"
            />
            <p class="text-xs" :class="linkValido ? 'text-muted-foreground' : 'text-destructive'">
              <template v-if="linkValido">
                A inscrição acontece em outro site — o portal só leva até lá. Vazio esconde o botão.
              </template>
              <template v-else>
                Precisa começar com http:// ou https://.
              </template>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">Cartaz</CardTitle>
          <CardDescription>A imagem que ilustra a oficina na listagem e na página.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-3">
          <div v-if="cartaz" class="overflow-hidden rounded-lg border border-border">
            <div class="relative">
              <img :src="cartaz" alt="Cartaz da oficina" class="aspect-video w-full object-cover">

              <!-- Véu enquanto sobe: a imagem já aparece, mas ainda não é a gravada. -->
              <div
                v-if="enviandoCartaz"
                class="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 text-sm font-medium"
              >
                <LoaderCircleIcon class="size-4 animate-spin" /> Enviando…
              </div>
            </div>

            <!--
              Diz de onde vem o que está na moldura. Sem esta linha, prévia
              local e imagem gravada ficam idênticas na tela — e é justamente a
              diferença entre as duas que responde "salvou mesmo?".
            -->
            <p
              class="flex items-center gap-1.5 border-t border-border px-3 py-2 text-xs"
              :class="cartazSalvo && !cartazLocal ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'"
            >
              <template v-if="enviandoCartaz">
                <LoaderCircleIcon class="size-3.5 animate-spin" /> Enviando para o servidor…
              </template>
              <template v-else-if="cartazSalvo && !cartazLocal">
                <CheckCircle2Icon class="size-3.5 text-emerald-600 dark:text-emerald-400" />
                Salvo no servidor — é o que o site mostra.
              </template>
              <template v-else>
                <TriangleAlertIcon class="size-3.5" /> Prévia local, ainda não enviada.
              </template>
            </p>
          </div>
          <p v-else class="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            {{ edicao ? 'Sem cartaz — a seção usa a imagem padrão.' : 'Disponível depois de salvar.' }}
          </p>

          <input
            ref="campoArquivo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            class="hidden"
            @change="enviarCartaz"
          >

          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="enviandoCartaz"
              @click="campoArquivo?.click()"
            >
              <LoaderCircleIcon v-if="enviandoCartaz" class="size-4 animate-spin" />
              <ImagePlusIcon v-else class="size-4" />
              {{ cartaz ? 'Trocar cartaz' : 'Enviar cartaz' }}
            </Button>

            <Button
              v-if="cartaz && edicao"
              type="button"
              variant="ghost"
              size="sm"
              class="text-destructive hover:text-destructive"
              @click="removerCartaz()"
            >
              <Trash2Icon class="size-4" /> Remover
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="flex flex-col gap-2 pt-6">
          <Button type="submit" :disabled="!podeSalvar || workshops.salvando">
            <LoaderCircleIcon v-if="workshops.salvando" class="size-4 animate-spin" />
            <SaveIcon v-else class="size-4" />
            {{ edicao ? 'Salvar alterações' : 'Criar oficina' }}
          </Button>

          <Button
            v-if="form.status !== 'publicado'"
            type="button"
            variant="secondary"
            :disabled="!podeSalvar || workshops.salvando"
            @click="salvar(true)"
          >
            Salvar e publicar
          </Button>

          <div class="flex items-center justify-between pt-1">
            <Button as-child variant="ghost" size="sm">
              <NuxtLink to="/admin/workshops"><ArrowLeftIcon class="size-4" /> Voltar</NuxtLink>
            </Button>
            <Button v-if="edicao && oficina" as-child variant="ghost" size="sm">
              <NuxtLink :to="oficina.caminho" target="_blank">
                <ExternalLinkIcon class="size-4" /> Ver no site
              </NuxtLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </form>
</template>
