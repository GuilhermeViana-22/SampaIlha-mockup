# Portal Sampa na Ilha

Portal de notícias com raiz cultural amazônica, cobertura nacional e um ecossistema
cultural próprio (Festival de Parintins, Grupo de Dança, Workshops, Eventos) —
**portalsampanailha.com.br**.

O mockup HTML estático original foi convertido para uma aplicação **Nuxt 4 + Vue 3 +
Pinia**, com um painel administrativo em `/admin` construído com **shadcn/ui (shadcn-vue)**
e **Tailwind CSS v4**.

Os dados vêm da **API Python** em `../api_python_sampa` (FastAPI + MySQL). As rotas em
`server/api/` são um proxy fino: traduzem os campos, guardam o token da redação em
cookie `httpOnly` e nunca expõem credencial ao navegador.

## Como rodar

O portal precisa da API no ar:

```bash
cd ../api_python_sampa && docker compose up -d   # API em :9040, MySQL em :3312
cd ../SampaIlha-mockup
npm install
npm run dev                                       # portal em :3000
```

Endereço da API (opcional, veja `.env.example`):

```bash
NUXT_API_BASE=http://localhost:9040/api/v1        # usado pelo servidor Nuxt
NUXT_PUBLIC_API_ORIGIN=http://localhost:9040      # usado para montar a URL das fotos
```

Outros comandos:

```bash
npm run build        # build de produção (.output/)
npm run preview      # serve o build
npm run typecheck    # vue-tsc
```

Requisitos: **Node 20.19+ ou 22.12+** (o projeto está fixado em Nuxt 4.4, a última
linha compatível com Node 20; a partir do Nuxt 4.5 é exigido Node 22+).

## Painel da redação

| | |
|---|---|
| URL | `/admin` |
| E-mail | `admin@portalsampanailha.com.br` |
| Senha | `Sampa2026!` |

As credenciais são da API (`ADMIN_EMAIL` / `ADMIN_PASSWORD` no `.env` de
`api_python_sampa`). O login troca e-mail e senha por um par de tokens JWT que fica
em cookies `httpOnly` (`sampa_acesso` / `sampa_refresh`) — o JavaScript da página
nunca vê o token. A renovação pelo refresh token é automática, dentro do servidor
Nuxt (`server/utils/api.ts`), e as páginas do painel são protegidas pelo middleware
`app/middleware/admin.ts`.

## Estrutura

Tudo é segregado por área de interesse — cada pasta responde por uma parte do portal.

```
app/
├── assets/css/
│   ├── tailwind.css            # tema shadcn/ui (usado só no painel) + ordem das camadas
│   └── portal/                 # CSS artesanal do site público, dividido por área
│       ├── base.css              # reset, variáveis, tipografia
│       ├── breaking.css          # barra "Urgente" / ticker
│       ├── header.css            # cabeçalho, navegação, menu mobile, busca
│       ├── layout.css            # container, grid principal, vitrine (hero)
│       ├── cards.css             # cards de notícia (grade e lista)
│       ├── dicas.css             # cards de dicas e blocos de informação
│       ├── sidebar.css           # widgets da coluna lateral
│       ├── noticia.css           # página de matéria
│       ├── footer.css            # rodapé
│       ├── pages.css             # páginas internas, vagas, podcast, cronograma
│       └── responsive.css        # breakpoints (sempre por último)
│
├── components/
│   ├── header/                 # BreakingNews, Principal, Navegacao, MenuMobile, Busca, BarraCategorias
│   ├── footer/                 # Principal
│   ├── noticias/               # Card, CardLista, Hero, Grade, Lista, Artigo, Compartilhar, Relacionadas
│   ├── dicas/                  # Card, Grade, Widget
│   ├── informacoes/            # Card, Grade
│   ├── sidebar/                # Principal + WidgetTempo, WidgetMaisLidos, WidgetNewsletter, WidgetTags, WidgetAnuncio
│   ├── cultura/                # Eixos, Subpaginas, Agenda, Frente
│   ├── turismo/ vagas/ podcast/# blocos específicos dessas páginas
│   ├── comum/                  # Badge, Capa, CabecalhoSecao, HeroPagina, Aviso, EstadoVazio
│   ├── admin/                  # layout/, login/, dashboard/, posts/, newsletter/
│   └── ui/                     # componentes shadcn-vue (gerados pela CLI)
│
├── composables/                # useConteudo, useCompartilhar, useTemaAdmin
├── layouts/                    # default (portal), admin (painel), auth (login)
├── middleware/admin.ts         # proteção das rotas do painel
├── pages/                      # rotas do site e do painel
├── stores/                     # Pinia: auth, posts, portal, newsletter
└── utils/                      # formato (datas/números), navegacao (menus), vagas
│
server/                         # proxy para a API Python — nada de regra de negócio
├── api/
│   ├── auth/                   # login (grava cookies), logout, me
│   ├── posts/                  # CRUD, slug, status, destaque e foto (multipart)
│   ├── newsletter/             # inscrição pública + listagem/remoção no painel
│   ├── taxonomia.get.ts        # editorias e regiões
│   ├── tags.get.ts             # assuntos em alta
│   ├── vagas/ · eventos/       # vagas e agenda cultural
│   ├── estatisticas.get.ts     # números do dashboard
│   └── restaurar-seed.post.ts  # restaura o conteúdo de demonstração
└── utils/
    ├── api.ts                  # cliente da API: bearer, refresh automático, cookies
    └── adaptadores.ts          # tradução de campos (title↔titulo, views↔leituras…)
│
shared/
├── types/content.ts            # Post, Categoria, Regiao, Vaga, EventoAgenda…
└── utils/taxonomia.ts          # tipos, status, capas e gerarSlug (editorias vêm da API)
│
legacy/                         # o mockup HTML original, preservado para consulta
```

### Rotas

**Site público**

| Rota | Página |
|---|---|
| `/` | Home (vitrine, últimas, dicas, giro de notícias) |
| `/noticias` · `/noticias/[slug]` | Listagem e matéria |
| `/dicas` · `/dicas/[slug]` | Dicas & Guias |
| `/informacoes` · `/informacoes/[slug]` | Informações e serviço |
| `/categoria/[slug]` | Editoria (cultura, turismo, economia…) |
| `/regioes/[slug]` | Norte, Nordeste, Centro-Oeste, Sudeste, Sul |
| `/cultura`, `/cultura/o-projeto`, `/cultura/grupo-danca`, `/cultura/workshops`, `/cultura/eventos` | Ecossistema cultural |
| `/turismo`, `/vagas`, `/busca` | Festival de Parintins, vagas, busca |
| `/podcast` | Rascunho, fora do menu até o lançamento |

**Painel**

| Rota | Tela |
|---|---|
| `/admin` | Login |
| `/admin/dashboard` | Visão geral: números, editorias, tipos, atividade |
| `/admin/posts` | Listagem com filtros e ações (publicar, destacar, excluir) |
| `/admin/posts/novo` · `/admin/posts/[id]` | Formulário de criação/edição com prévia |
| `/admin/newsletter` | Inscritos + exportação CSV |
| `/admin/configuracoes` | Taxonomia, sessão e restauração do conteúdo original |

## Conteúdo

Todo conteúdo é um **Post** com um `tipo`: `noticia`, `dica` ou `informacao` — e isso
define em qual seção do site ele aparece.

**Toda matéria chega ao front com foto, editoria, título e data.** A API resolve a
editoria (nome, ícone e cor) dentro da própria matéria, devolve o `caminho` da página
pronto e entrega a foto em URL absoluta — os componentes não fazem consulta nenhuma
para renderizar um card.

Os dados ficam no MySQL da API. Rascunhos e agendados só aparecem para quem está
autenticado — o site público devolve 404.

## Tecnologias

- Nuxt 4 (SSR) + Vue 3 + TypeScript
- API Python (FastAPI + MySQL) em `../api_python_sampa`
- Pinia (`auth`, `posts`, `portal`, `newsletter`)
- Tailwind CSS v4 + shadcn/ui (shadcn-vue) + Reka UI + Lucide — apenas no painel
- CSS artesanal do portal isolado na cascade layer `portal`, entre `base` e `utilities`
- Nitro server routes como proxy/BFF da API, com cookie `httpOnly` e refresh automático
- Font Awesome 6 e Google Fonts (Playfair Display + Inter)

## Conteúdo pendente (placeholders)

- `/turismo` — migrar o conteúdo da aba "Festival de Parintins" do site atual
- `/cultura` — migrar o conteúdo da aba "Cultura & Arte"
- `/cultura/grupo-danca`, `/cultura/workshops`, `/cultura/eventos` — formulários de
  inscrição, termos de participação e fotos
- `/podcast` — embeds reais (Spotify/Deezer/YouTube) e transmissão ao vivo
- Logo do portal (hoje é um ícone gerado em CSS)

## Próximos passos

- [ ] Cadastro de usuários da redação com papéis (a API já tem o campo `role`)
- [ ] Paginação nas listagens públicas (o painel já pagina de 60 em 60)
- [ ] SEO: sitemap, Open Graph usando a foto da matéria, dados estruturados
- [ ] Substituir as capas de demonstração pelo material fotográfico real
- [ ] Ativar `/podcast` no menu principal no lançamento oficial

## Desenvolvido por

**Guilherme Augusto dos Santos Viana**
CNPJ: 61.676.448/0001-14
