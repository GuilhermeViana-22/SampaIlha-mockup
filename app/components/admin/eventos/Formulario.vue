<script setup lang="ts">
import {
  ArrowLeftIcon, CheckCircle2Icon, ExternalLinkIcon, ImagePlusIcon, LoaderCircleIcon, SaveIcon,
  TriangleAlertIcon, Trash2Icon,
} from '@lucide/vue'
import type { Evento, EventoInput } from '#shared/types/evento'
import {
  ORIENTACOES_CARTAZ, STATUS_EVENTO, TIPOS_EVENTO, VISIBILIDADE_EVENTO, proporcaoDoCartaz,
} from '#shared/types/evento'
import {
  avisoDeCalendario, dataCompleta, dataNoCalendario, limitesDoCalendario, limitesDoCalendarioComHora,
} from '#shared/utils/datas'

/**
 * Formulário único de criação e edição de evento.
 *
 * O cartaz só pode ser enviado depois do primeiro salvamento: a API anexa o
 * arquivo a um evento que já existe, então antes disso não há onde pendurar.
 * O mesmo acontece com as oficinas e com as fotos das matérias.
 */
const props = defineProps<{ evento?: Evento | null }>()

const eventos = useEventosStore()
const portal = usePortalStore()

await portal.carregarTaxonomia()

const edicao = computed(() => !!props.evento)
const enviandoCartaz = ref(false)
const campoArquivo = ref<HTMLInputElement | null>(null)

/**
 * O cartaz que está gravado no servidor. É o que sobrevive a um recarregamento
 * da página — e, por isso, a única prova de que o envio deu certo.
 */
const cartazSalvo = ref<string | null>(props.evento?.imagemUrl ?? null)

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
 * `<input type="datetime-local">` só aceita `AAAA-MM-DDTHH:mm`.
 *
 * A API devolve o segundo junto (`...T20:00:00`), e o campo simplesmente
 * ignora um valor que não esteja nesse formato — a hora do evento apareceria
 * em branco na edição.
 */
function paraCampoDataHora(iso: string | null): string {
  return iso ? iso.slice(0, 16) : ''
}

/** Slug que o `<Select>` usa para "nenhuma editoria" — o vazio não serve nele. */
const SEM_EDITORIA = 'sem-editoria'

/**
 * O que os campos do formulário guardam.
 *
 * Difere de `EventoInput` num ponto: aqui os opcionais são sempre `string`,
 * nunca `null`. Um `<Input>` não aceita `null` no `v-model`, e o formulário só
 * sabe produzir string vazia — a conversão de "" para `null` acontece no BFF,
 * em `paraPayloadEvento`, que é quem conhece o contrato da API.
 */
type CamposFormulario = {
  [K in keyof EventoInput]-?: NonNullable<EventoInput[K]>
}

function estadoInicial(): CamposFormulario {
  return {
    titulo: props.evento?.titulo ?? '',
    slug: props.evento?.slug ?? '',
    status: props.evento?.status ?? 'rascunho',
    tipo: props.evento?.tipo ?? 'outro',
    resumo: props.evento?.resumo ?? '',
    conteudo: props.evento?.conteudo ?? '',
    orientacaoCartaz: props.evento?.orientacaoCartaz ?? 'horizontal',
    inscricaoUrl: props.evento?.inscricaoUrl ?? '',
    editoria: props.evento?.editoria?.slug ?? '',
    comecaEm: paraCampoDataHora(props.evento?.comecaEm ?? null),
    terminaEm: paraCampoDataHora(props.evento?.terminaEm ?? null),
    local: props.evento?.local ?? '',
    publicarDe: props.evento?.publicarDe ?? '',
    publicarAte: props.evento?.publicarAte ?? '',
  }
}

const form = reactive<CamposFormulario>(estadoInicial())

/** O `<Select>` não trabalha com string vazia; a store, sim. Ver `SEM_EDITORIA`. */
const editoriaSelecionada = computed({
  get: () => form.editoria || SEM_EDITORIA,
  set: (valor: string) => { form.editoria = valor === SEM_EDITORIA ? '' : valor },
})

/** Slug acompanha o título enquanto não for editado à mão. */
const slugManual = ref(!!props.evento)
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

/**
 * Bordas do seletor de data, para o navegador já barrar o ano absurdo.
 *
 * Sozinhas não bastam — `min`/`max` podem ser contornados por colagem e são
 * ignorados por preenchimento automático —, então cada campo também passa por
 * `dataNoCalendario` abaixo. As duas travas juntas são o que impede um `0202`
 * de virar um evento que some da listagem sem explicação.
 */
const LIMITES_DIA = limitesDoCalendario()
const LIMITES_INSTANTE = limitesDoCalendarioComHora()

/** Cada campo de data, com o que reprova cada um. Ver `problemasDeData`. */
const dataDeInicioValida = computed(() =>
  !form.comecaEm || (dataCompleta(form.comecaEm, true) && dataNoCalendario(form.comecaEm)))

const dataDeFimValida = computed(() =>
  !form.terminaEm || (dataCompleta(form.terminaEm, true) && dataNoCalendario(form.terminaEm)))

const publicarDeValida = computed(() =>
  !form.publicarDe || (dataCompleta(form.publicarDe) && dataNoCalendario(form.publicarDe)))

const publicarAteValida = computed(() =>
  !form.publicarAte || (dataCompleta(form.publicarAte) && dataNoCalendario(form.publicarAte)))

/** Toda data preenchida está dentro da faixa e completa? */
const datasNoCalendario = computed(() =>
  dataDeInicioValida.value && dataDeFimValida.value && publicarDeValida.value && publicarAteValida.value)

/** Uma janela que termina antes de começar nunca exibiria nada. */
const janelaValida = computed(() =>
  !form.publicarDe || !form.publicarAte || form.publicarAte >= form.publicarDe)

/** Evento que termina antes de começar é erro de digitação, não agenda. */
const horarioValido = computed(() =>
  !form.terminaEm || !form.comecaEm || form.terminaEm >= form.comecaEm)

/**
 * O primeiro motivo que impede o salvamento, escrito para quem preencheu.
 *
 * Uma frase só, e não a lista inteira: o formulário já marca o campo culpado
 * em vermelho, e despejar quatro avisos ao mesmo tempo esconde qual deles é o
 * que está na frente.
 */
const problemaAoSalvar = computed<string | null>(() => {
  if (form.titulo.trim().length < 3) return 'O título precisa ter ao menos 3 caracteres.'
  if (!form.comecaEm) return 'Informe quando o evento começa — é a data que ordena a agenda.'
  if (!dataDeInicioValida.value) return `Data de início: ${avisoDeCalendario()}`
  if (!dataDeFimValida.value) return `Data de término: ${avisoDeCalendario()}`
  if (!horarioValido.value) return 'O fim do evento não pode ser anterior ao início.'
  if (!publicarDeValida.value) return `Início da janela de exibição: ${avisoDeCalendario()}`
  if (!publicarAteValida.value) return `Fim da janela de exibição: ${avisoDeCalendario()}`
  if (!janelaValida.value) return 'A data de fim da publicação não pode ser anterior à de início.'
  if (!linkValido.value) return 'O link de inscrição precisa começar com http:// ou https://.'
  return null
})

const podeSalvar = computed(() => problemaAoSalvar.value === null)

/** Envia o cartaz. A API troca o arquivo e devolve o evento já atualizado. */
async function enviarCartaz(mudanca: Event) {
  const arquivo = (mudanca.target as HTMLInputElement).files?.[0]
  if (!arquivo) return

  if (!edicao.value) {
    avisar.alerta(
      'Salve o evento primeiro.',
      'O cartaz é anexado a um evento que já existe — salve o rascunho e envie em seguida.',
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
    const salvo = await eventos.enviarCartaz(props.evento!.id, arquivo)

    if (salvo) {
      // Troca a prévia local pela URL do servidor. É essa substituição que
      // prova o salvamento: o que aparece agora veio do banco, não do disco de
      // quem está editando.
      cartazSalvo.value = salvo.imagemUrl
      descartarPrevia()
      avisar.sucesso('Cartaz salvo no servidor.', 'A imagem já é a que o site vai mostrar.')
    }
    else {
      // Desfaz a prévia: deixá-la na tela faria parecer que salvou.
      descartarPrevia()
      avisar.falha(eventos.erro ?? 'Não foi possível enviar o cartaz.', 'A imagem anterior continua valendo.')
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
  const salvo = await eventos.removerCartaz(props.evento!.id)

  if (salvo) {
    descartarPrevia()
    cartazSalvo.value = null
    avisar.sucesso('Cartaz removido.', 'O evento passa a usar a imagem padrão da seção.')
  }
  else {
    avisar.falha(eventos.erro ?? 'Não foi possível remover o cartaz.')
  }
}

/**
 * Grava o evento — cria na primeira vez, atualiza nas seguintes.
 *
 * Só há redirecionamento na criação: depois de existir um id, o evento ganha a
 * própria URL de edição, e é a partir dela que o envio do cartaz passa a
 * funcionar.
 */
async function salvar(publicar = false) {
  // A mesma conferência que desabilita o botão, repetida na hora do envio: o
  // "Salvar e publicar" e o `submit` pelo Enter não passam pelo botão
  // desabilitado, e sem esta linha um deles mandaria à API o que o formulário
  // já sabe que está errado.
  if (problemaAoSalvar.value) {
    avisar.alerta(problemaAoSalvar.value, 'Nada foi enviado — corrija o campo em destaque e tente de novo.')
    return
  }

  if (publicar) form.status = 'publicado'

  const criando = !edicao.value

  const salvo = criando
    ? await eventos.criar({ ...toRaw(form) })
    : await eventos.atualizar(props.evento!.id, { ...toRaw(form) })

  if (!salvo) {
    avisar.falha(
      eventos.erro ?? 'Não foi possível salvar.',
      'Nada foi gravado — o texto continua aqui na tela.',
    )
    return
  }

  // Mantém a tela em sincronia com o que o servidor de fato gravou: o slug
  // pode voltar com sufixo quando já existe outro evento de nome parecido.
  form.slug = salvo.slug
  form.status = salvo.status

  if (salvo.status === 'publicado') {
    avisar.sucesso(
      criando ? 'Evento criado e publicado.' : 'Alterações salvas e no ar.',
      'Já aparece em /cultura/eventos.',
    )
  }
  else {
    avisar.sucesso(
      criando ? 'Evento criado.' : 'Alterações salvas.',
      'Continua como rascunho, fora do site.',
    )
  }

  if (criando) await navigateTo(`/admin/eventos/${salvo.id}`)
}
</script>

<template>
  <form class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" @submit.prevent="salvar()">
    <!-- Coluna principal -->
    <div class="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Evento</CardTitle>
          <CardDescription>Título, resumo e o texto que aparece na página.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <div class="grid gap-2">
            <Label for="titulo">Título</Label>
            <Input id="titulo" v-model="form.titulo" placeholder="Ex.: Ensaio aberto do Grupo de Dança" required />
          </div>

          <div class="grid gap-2">
            <Label for="slug">Endereço (slug)</Label>
            <div class="flex items-center gap-2">
              <span class="shrink-0 text-xs text-muted-foreground">/cultura/eventos/</span>
              <Input
                id="slug"
                v-model="form.slug"
                class="font-mono text-xs"
                placeholder="sai-do-titulo-automaticamente"
                @input="slugManual = true"
              />
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
              placeholder="Uma frase sobre o evento — é a linha que aparece no bloco da agenda."
            />
          </div>

          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <Label>Texto</Label>
              <span class="text-xs text-muted-foreground">{{ palavras }} palavras</span>
            </div>
            <AdminPostsEditor v-model="form.conteudo" :post-id="null" />
            <p class="text-xs text-muted-foreground">
              O envio de imagens dentro do texto é exclusivo das matérias. Para o evento, use o
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
                <SelectItem v-for="status in STATUS_EVENTO" :key="status.valor" :value="status.valor">
                  {{ status.rotulo }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              {{ STATUS_EVENTO.find(s => s.valor === form.status)?.descricao }}
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
                <Input
                  id="publicarDe"
                  v-model="form.publicarDe"
                  type="date"
                  placeholder="dd/mm/aaaa"
                  :min="LIMITES_DIA.min"
                  :max="LIMITES_DIA.max"
                  :aria-invalid="!publicarDeValida"
                />
              </div>
              <div class="grid gap-1.5">
                <Label for="publicarAte" class="text-xs font-normal">Sai do site em</Label>
                <Input
                  id="publicarAte"
                  v-model="form.publicarAte"
                  type="date"
                  placeholder="dd/mm/aaaa"
                  :min="form.publicarDe || LIMITES_DIA.min"
                  :max="LIMITES_DIA.max"
                  :aria-invalid="!janelaValida || !publicarAteValida"
                />
              </div>
            </div>

            <p
              class="text-xs"
              :class="janelaValida && publicarDeValida && publicarAteValida
                ? 'text-muted-foreground'
                : 'text-destructive'"
            >
              <template v-if="!publicarDeValida || !publicarAteValida">
                {{ avisoDeCalendario() }}
              </template>
              <template v-else-if="!janelaValida">
                O fim não pode ser antes do início.
              </template>
              <template v-else-if="evento && evento.visibilidade !== 'no_ar' && form.status === 'publicado'">
                {{ VISIBILIDADE_EVENTO[evento.visibilidade].ajuda }}
              </template>
              <template v-else>
                Deixe em branco para o evento seguir só a decisão do status. Ele some do site
                sozinho depois da data de fim.
              </template>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">Agenda</CardTitle>
          <CardDescription>Quando acontece, onde e em que seção do portal entra.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <div class="grid gap-2">
            <Label for="tipo">Tipo</Label>
            <Select id="tipo" v-model="form.tipo">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="tipo in TIPOS_EVENTO" :key="tipo.valor" :value="tipo.valor">
                  {{ tipo.rotulo }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid gap-2">
            <Label for="editoria">Editoria</Label>
            <Select id="editoria" v-model="editoriaSelecionada">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem :value="SEM_EDITORIA">Sem editoria</SelectItem>
                <SelectItem v-for="categoria in portal.categorias" :key="categoria.slug" :value="categoria.slug">
                  {{ categoria.nome }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              Dá ao evento a cor e o ícone da seção na listagem. A agenda funciona sem ela.
            </p>
          </div>

          <div class="grid gap-2">
            <Label for="comecaEm">Começa em</Label>
            <Input
              id="comecaEm"
              v-model="form.comecaEm"
              type="datetime-local"
              placeholder="dd/mm/aaaa --:--"
              :min="LIMITES_INSTANTE.min"
              :max="LIMITES_INSTANTE.max"
              :aria-invalid="!dataDeInicioValida"
              required
            />
            <p class="text-xs" :class="dataDeInicioValida ? 'text-muted-foreground' : 'text-destructive'">
              <template v-if="dataDeInicioValida">
                É esta data que ordena a agenda e monta o bloco de dia e mês do card.
              </template>
              <template v-else>{{ avisoDeCalendario() }}</template>
            </p>
          </div>

          <div class="grid gap-2">
            <Label for="terminaEm">Termina em</Label>
            <Input
              id="terminaEm"
              v-model="form.terminaEm"
              type="datetime-local"
              placeholder="dd/mm/aaaa --:--"
              :min="form.comecaEm || LIMITES_INSTANTE.min"
              :max="LIMITES_INSTANTE.max"
              :aria-invalid="!horarioValido || !dataDeFimValida"
            />
            <p class="text-xs" :class="horarioValido && dataDeFimValida ? 'text-muted-foreground' : 'text-destructive'">
              <template v-if="!dataDeFimValida">{{ avisoDeCalendario() }}</template>
              <template v-else-if="!horarioValido">O fim não pode ser antes do início.</template>
              <template v-else>Opcional — deixe em branco se o encerramento não foi anunciado.</template>
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
                A inscrição e o ingresso ficam em outro site — o portal só leva até lá. Vazio esconde
                o botão.
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
          <CardDescription>A imagem que ilustra o evento na agenda e na página.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-3">
          <!--
            A orientação é escolha de quem cadastra, não dedução do arquivo: um
            cartaz quase quadrado não responde a pergunta sozinho, e é
            justamente nele que a decisão importa. A moldura abaixo muda de
            proporção na hora, então dá para conferir o corte antes de salvar.
          -->
          <div class="grid gap-2">
            <Label>Formato da imagem</Label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="orientacao in ORIENTACOES_CARTAZ"
                :key="orientacao.valor"
                type="button"
                class="flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs transition"
                :class="form.orientacaoCartaz === orientacao.valor
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/25'
                  : 'border-input hover:bg-muted'"
                :title="orientacao.ajuda"
                @click="form.orientacaoCartaz = orientacao.valor"
              >
                <span
                  class="rounded-sm border-2 border-current text-muted-foreground"
                  :class="orientacao.valor === 'vertical' ? 'h-7 w-5' : 'h-5 w-8'"
                />
                <span class="font-medium">{{ orientacao.rotulo }}</span>
              </button>
            </div>
            <p class="text-xs text-muted-foreground">
              {{ ORIENTACOES_CARTAZ.find(o => o.valor === form.orientacaoCartaz)?.ajuda }}
            </p>
          </div>

          <div v-if="cartaz" class="overflow-hidden rounded-lg border border-border">
            <div class="relative">
              <img
                :src="cartaz"
                alt="Cartaz do evento"
                class="w-full object-cover"
                :class="proporcaoDoCartaz(form.orientacaoCartaz)"
              >

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

          <p v-if="edicao" class="text-xs text-muted-foreground">
            O formato é salvo junto com o resto do evento — trocar a escolha acima só vale depois de
            clicar em salvar.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="flex flex-col gap-2 pt-6">
          <!--
            Diz por que o botão está apagado. Sem esta linha o formulário
            simplesmente não reage ao clique, e quem preencheu fica procurando
            o campo errado numa tela com quatro datas.
          -->
          <p
            v-if="problemaAoSalvar"
            class="flex items-start gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-xs text-destructive"
          >
            <TriangleAlertIcon class="mt-px size-3.5 shrink-0" />
            {{ problemaAoSalvar }}
          </p>

          <Button type="submit" :disabled="!podeSalvar || eventos.salvando">
            <LoaderCircleIcon v-if="eventos.salvando" class="size-4 animate-spin" />
            <SaveIcon v-else class="size-4" />
            {{ edicao ? 'Salvar alterações' : 'Criar evento' }}
          </Button>

          <Button
            v-if="form.status !== 'publicado'"
            type="button"
            variant="secondary"
            :disabled="!podeSalvar || eventos.salvando"
            @click="salvar(true)"
          >
            Salvar e publicar
          </Button>

          <div class="flex items-center justify-between pt-1">
            <Button as-child variant="ghost" size="sm">
              <NuxtLink to="/admin/eventos"><ArrowLeftIcon class="size-4" /> Voltar</NuxtLink>
            </Button>
            <Button v-if="edicao && evento" as-child variant="ghost" size="sm">
              <NuxtLink :to="evento.caminho" target="_blank">
                <ExternalLinkIcon class="size-4" /> Ver no site
              </NuxtLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </form>
</template>
