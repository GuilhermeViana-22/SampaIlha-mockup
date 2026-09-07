<script setup lang="ts">
import {
  ArrowLeftIcon, CheckCircle2Icon, ExternalLinkIcon, ImagePlusIcon, LoaderCircleIcon, SaveIcon,
  TriangleAlertIcon, Trash2Icon,
} from '@lucide/vue'
import type { Vaga, VagaInput } from '#shared/types/vaga'
import { MODELOS_VAGA, REGIMES_VAGA, STATUS_VAGA } from '#shared/types/vaga'

/**
 * Formulário único de criação e edição de vaga.
 *
 * A foto só pode ser enviada depois do primeiro salvamento: a API anexa o
 * arquivo a uma vaga que já existe, então antes disso não há onde pendurar.
 * O mesmo acontece com o cartaz das oficinas.
 */
const props = defineProps<{ vaga?: Vaga | null }>()

const vagas = useVagasStore()

const edicao = computed(() => !!props.vaga)
const enviandoFoto = ref(false)
const campoArquivo = ref<HTMLInputElement | null>(null)

/**
 * A foto que está gravada no servidor. É o que sobrevive a um recarregamento
 * da página — e, por isso, a única prova de que o envio deu certo.
 */
const fotoSalva = ref<string | null>(props.vaga?.imagemUrl ?? null)

/**
 * Espelho local do arquivo recém-escolhido, montado com `URL.createObjectURL`.
 *
 * Serve para a imagem aparecer no instante do clique, sem esperar a viagem até
 * a API. Some assim que o servidor responde: a partir daí quem manda é
 * `fotoSalva`, que veio do banco.
 */
const fotoLocal = ref<string | null>(null)

/** O que a moldura mostra: o arquivo escolhido agora, senão o que está salvo. */
const foto = computed(() => fotoLocal.value ?? fotoSalva.value)

/** Libera o object URL — sem isso o blob fica preso na memória da aba. */
function descartarPrevia() {
  if (fotoLocal.value) {
    URL.revokeObjectURL(fotoLocal.value)
    fotoLocal.value = null
  }
}

onBeforeUnmount(descartarPrevia)

/**
 * O que os campos do formulário guardam.
 *
 * Difere de `VagaInput` num ponto: aqui os opcionais são sempre `string`,
 * nunca `null`. Um `<Input>` não aceita `null` no `v-model`, e o formulário só
 * sabe produzir string vazia — a conversão de "" para `null` acontece no BFF,
 * em `paraPayloadVaga`, que é quem conhece o contrato da API.
 */
type CamposFormulario = {
  [K in keyof VagaInput]-?: NonNullable<VagaInput[K]>
}

/**
 * `published_at` é datetime na API, mas o painel edita só o dia: a hora exata
 * em que a vaga entrou no ar não muda nada para quem lê o card, e um
 * `<input type="date">` é bem menos trabalho de preencher do que um
 * `datetime-local` para cada vaga do dia.
 */
function paraCampoData(iso: string | undefined): string {
  if (!iso) return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

function estadoInicial(): CamposFormulario {
  return {
    titulo: props.vaga?.titulo ?? '',
    empresa: props.vaga?.empresa ?? 'Empresa parceira',
    local: props.vaga?.local ?? 'São Paulo, SP',
    regime: props.vaga?.regime ?? 'CLT',
    modelo: props.vaga?.modelo ?? 'Presencial',
    descricao: props.vaga?.descricao ?? '',
    linkDaVaga: props.vaga?.linkDaVaga ?? '',
    emailCandidatura: props.vaga?.emailCandidatura ?? '',
    status: props.vaga?.status ?? 'aberta',
    ordem: props.vaga?.ordem ?? 0,
    publicadoEm: paraCampoData(props.vaga?.publicadoEm),
  }
}

const form = reactive<CamposFormulario>(estadoInicial())

/**
 * O link da vaga vira o `href` do botão no card público, então precisa ser um
 * endereço externo de verdade. A API recusa o resto; avisar aqui evita a ida e
 * volta.
 */
const linkValido = computed(() => {
  const url = form.linkDaVaga.trim()
  return !url || /^https?:\/\//i.test(url)
})

const emailValido = computed(() => {
  const email = form.emailCandidatura.trim()
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
})

/**
 * Uma vaga sem link e sem e-mail não diz a ninguém como se candidatar. Não é
 * erro — há vaga que se resolve no telefone escrito na descrição —, mas é o
 * tipo de esquecimento que só aparece depois de publicado.
 */
const semCaminhoDeCandidatura = computed(() =>
  !form.linkDaVaga.trim() && !form.emailCandidatura.trim())

const podeSalvar = computed(() =>
  form.titulo.trim().length >= 3 && linkValido.value && emailValido.value)

/** Envia a foto. A API troca o arquivo e devolve a vaga já atualizada. */
async function enviarFoto(evento: Event) {
  const arquivo = (evento.target as HTMLInputElement).files?.[0]
  if (!arquivo) return

  if (!edicao.value) {
    avisar.alerta(
      'Salve a vaga primeiro.',
      'A foto é anexada a uma vaga que já existe — salve o rascunho e envie em seguida.',
    )
    if (campoArquivo.value) campoArquivo.value.value = ''
    return
  }

  // Mostra o arquivo escolhido na hora, antes mesmo de subir: assim dá para
  // conferir que é a imagem certa enquanto o envio acontece.
  descartarPrevia()
  fotoLocal.value = URL.createObjectURL(arquivo)

  enviandoFoto.value = true
  try {
    const salva = await vagas.enviarFoto(props.vaga!.id, arquivo)

    if (salva) {
      // Troca a prévia local pela URL do servidor. É essa substituição que
      // prova o salvamento: o que aparece agora veio do banco, não do disco de
      // quem está editando.
      fotoSalva.value = salva.imagemUrl
      descartarPrevia()
      avisar.sucesso('Foto salva no servidor.', 'A imagem já é a que o site vai mostrar.')
    }
    else {
      // Desfaz a prévia: deixá-la na tela faria parecer que salvou.
      descartarPrevia()
      avisar.falha(vagas.erro ?? 'Não foi possível enviar a foto.', 'A imagem anterior continua valendo.')
    }
  }
  finally {
    enviandoFoto.value = false
    // Limpa mesmo em caso de erro: sem isso, escolher o mesmo arquivo de novo
    // não dispararia `change` e pareceria que o botão travou.
    if (campoArquivo.value) campoArquivo.value.value = ''
  }
}

async function removerFoto() {
  const salva = await vagas.removerFoto(props.vaga!.id)

  if (salva) {
    descartarPrevia()
    fotoSalva.value = null
    avisar.sucesso('Foto removida.', 'A vaga passa a aparecer só com texto.')
  }
  else {
    avisar.falha(vagas.erro ?? 'Não foi possível remover a foto.')
  }
}

/**
 * Grava a vaga — cria na primeira vez, atualiza nas seguintes.
 *
 * Só há redirecionamento na criação: depois de existir um id, a vaga ganha a
 * própria URL de edição, e é a partir dela que o envio da foto passa a
 * funcionar.
 */
async function salvar(abrir = false) {
  if (!form.titulo.trim()) {
    avisar.alerta('Dê um título à vaga antes de salvar.')
    return
  }
  if (!linkValido.value) {
    avisar.alerta('O link da vaga precisa começar com http:// ou https://.')
    return
  }
  if (!emailValido.value) {
    avisar.alerta('O e-mail de candidatura não parece válido.')
    return
  }

  if (abrir) form.status = 'aberta'

  const criando = !edicao.value

  const salva = criando
    ? await vagas.criar({ ...toRaw(form) })
    : await vagas.atualizar(props.vaga!.id, { ...toRaw(form) })

  if (!salva) {
    avisar.falha(
      vagas.erro ?? 'Não foi possível salvar.',
      'Nada foi gravado — o que você escreveu continua aqui na tela.',
    )
    return
  }

  // Mantém a tela em sincronia com o que o servidor de fato gravou.
  form.status = salva.status

  if (salva.status === 'aberta') {
    avisar.sucesso(
      criando ? 'Vaga criada e publicada.' : 'Alterações salvas e no ar.',
      'Já aparece em /vagas.',
    )
  }
  else {
    avisar.sucesso(
      criando ? 'Vaga criada.' : 'Alterações salvas.',
      salva.status === 'rascunho' ? 'Continua como rascunho, fora do site.' : 'A vaga está encerrada e fora do site.',
    )
  }

  if (criando) await navigateTo(`/admin/vagas/${salva.id}`)
}
</script>

<template>
  <form class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" @submit.prevent="salvar()">
    <!-- Coluna principal -->
    <div class="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">A vaga</CardTitle>
          <CardDescription>O que o candidato lê no card de /vagas.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <div class="grid gap-2">
            <Label for="titulo">Título</Label>
            <Input id="titulo" v-model="form.titulo" placeholder="Ex.: Auxiliar de cozinha" required />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="grid gap-2">
              <Label for="empresa">Empresa</Label>
              <Input id="empresa" v-model="form.empresa" placeholder="Quem está contratando" />
            </div>
            <div class="grid gap-2">
              <Label for="local">Local</Label>
              <Input id="local" v-model="form.local" placeholder="Ex.: São Paulo, SP" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="grid gap-2">
              <Label for="regime">Regime</Label>
              <Select id="regime" v-model="form.regime">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="regime in REGIMES_VAGA" :key="regime" :value="regime">
                    {{ regime }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-2">
              <Label for="modelo">Modelo de trabalho</Label>
              <Select id="modelo" v-model="form.modelo">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="modelo in MODELOS_VAGA" :key="modelo" :value="modelo">
                    {{ modelo }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <Label for="descricao">Descrição</Label>
              <span class="text-xs text-muted-foreground">{{ form.descricao.length }} caracteres</span>
            </div>
            <Textarea
              id="descricao"
              v-model="form.descricao"
              rows="7"
              placeholder="Atividades, requisitos, salário, benefícios — o que a vaga informou."
            />
            <p class="text-xs text-muted-foreground">
              Texto simples, do jeito que a oportunidade chegou à redação. É o que aparece no card.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">Como se candidatar</CardTitle>
          <CardDescription>
            O portal não recebe currículo: o candidato sai daqui para quem contrata.
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <div class="grid gap-2">
            <Label for="linkDaVaga">Link da vaga</Label>
            <Input
              id="linkDaVaga"
              v-model="form.linkDaVaga"
              placeholder="https://…"
              :aria-invalid="!linkValido"
            />
            <p class="text-xs" :class="linkValido ? 'text-muted-foreground' : 'text-destructive'">
              <template v-if="linkValido">
                A página da empresa, o formulário ou o anúncio original. É para onde vai o botão do card.
              </template>
              <template v-else>
                Precisa começar com http:// ou https://.
              </template>
            </p>
          </div>

          <div class="grid gap-2">
            <Label for="emailCandidatura">E-mail de candidatura</Label>
            <Input
              id="emailCandidatura"
              v-model="form.emailCandidatura"
              type="email"
              placeholder="rh@empresa.com.br"
              :aria-invalid="!emailValido"
            />
            <p class="text-xs" :class="emailValido ? 'text-muted-foreground' : 'text-destructive'">
              <template v-if="emailValido">
                Usado quando não há link — o botão vira um e-mail já com o assunto preenchido.
              </template>
              <template v-else>
                Confira o endereço: falta o @ ou o domínio.
              </template>
            </p>
          </div>

          <p
            v-if="semCaminhoDeCandidatura"
            class="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400"
          >
            <TriangleAlertIcon class="mt-0.5 size-3.5 shrink-0" />
            <span>
              Sem link e sem e-mail, o card fica só com o texto — quem se interessar precisa achar
              o contato na descrição. Dá para salvar assim, mas confira se é isso mesmo.
            </span>
          </p>
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
                <SelectItem v-for="status in STATUS_VAGA" :key="status.valor" :value="status.valor">
                  {{ status.rotulo }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              {{ STATUS_VAGA.find(s => s.valor === form.status)?.descricao }}
            </p>
          </div>

          <div class="grid gap-2">
            <Label for="publicadoEm">Data de publicação</Label>
            <Input id="publicadoEm" v-model="form.publicadoEm" type="date" />
            <p class="text-xs text-muted-foreground">
              É a data que o card mostra. Vem preenchida com hoje — mude se a vaga chegou antes.
            </p>
          </div>

          <div class="grid gap-2">
            <Label for="ordem">Ordem na listagem</Label>
            <Input id="ordem" v-model.number="form.ordem" type="number" />
            <p class="text-xs text-muted-foreground">
              Menor aparece antes. Empatadas, vale a data de publicação, da mais recente para a mais antiga.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">Foto</CardTitle>
          <CardDescription>A imagem que ilustra a vaga no card do site.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-3">
          <div v-if="foto" class="overflow-hidden rounded-lg border border-border">
            <div class="relative">
              <img :src="foto" alt="Foto da vaga" class="aspect-video w-full object-cover">

              <!-- Véu enquanto sobe: a imagem já aparece, mas ainda não é a gravada. -->
              <div
                v-if="enviandoFoto"
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
              :class="fotoSalva && !fotoLocal ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400'"
            >
              <template v-if="enviandoFoto">
                <LoaderCircleIcon class="size-3.5 animate-spin" /> Enviando para o servidor…
              </template>
              <template v-else-if="fotoSalva && !fotoLocal">
                <CheckCircle2Icon class="size-3.5 text-emerald-600 dark:text-emerald-400" />
                Salva no servidor — é o que o site mostra.
              </template>
              <template v-else>
                <TriangleAlertIcon class="size-3.5" /> Prévia local, ainda não enviada.
              </template>
            </p>
          </div>
          <p v-else class="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            {{ edicao ? 'Sem foto — o card aparece só com texto.' : 'Disponível depois de salvar.' }}
          </p>

          <input
            ref="campoArquivo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            class="hidden"
            @change="enviarFoto"
          >

          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="enviandoFoto"
              @click="campoArquivo?.click()"
            >
              <LoaderCircleIcon v-if="enviandoFoto" class="size-4 animate-spin" />
              <ImagePlusIcon v-else class="size-4" />
              {{ foto ? 'Trocar foto' : 'Enviar foto' }}
            </Button>

            <Button
              v-if="foto && edicao"
              type="button"
              variant="ghost"
              size="sm"
              class="text-destructive hover:text-destructive"
              @click="removerFoto()"
            >
              <Trash2Icon class="size-4" /> Remover
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="flex flex-col gap-2 pt-6">
          <Button type="submit" :disabled="!podeSalvar || vagas.salvando">
            <LoaderCircleIcon v-if="vagas.salvando" class="size-4 animate-spin" />
            <SaveIcon v-else class="size-4" />
            {{ edicao ? 'Salvar alterações' : 'Criar vaga' }}
          </Button>

          <Button
            v-if="form.status !== 'aberta'"
            type="button"
            variant="secondary"
            :disabled="!podeSalvar || vagas.salvando"
            @click="salvar(true)"
          >
            Salvar e publicar
          </Button>

          <div class="flex items-center justify-between pt-1">
            <Button as-child variant="ghost" size="sm">
              <NuxtLink to="/admin/vagas"><ArrowLeftIcon class="size-4" /> Voltar</NuxtLink>
            </Button>
            <Button as-child variant="ghost" size="sm">
              <NuxtLink to="/vagas" target="_blank">
                <ExternalLinkIcon class="size-4" /> Ver no site
              </NuxtLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </form>
</template>
