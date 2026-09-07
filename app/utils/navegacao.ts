/** Estrutura de navegação do site público e do dashboard. */

export interface ItemMenu {
  rotulo: string
  para: string
  icone?: string
  filhos?: ItemMenu[]
}

/**
 * Destino de uma editoria — um lugar só, para o site inteiro.
 *
 * Clicar numa editoria filtra os conteúdos por ela, em qualquer menu: é o que
 * `/categoria/[slug]` faz. Antes o mesmo rótulo levava a dois lugares — o menu
 * principal mandava "Turismo" para `/turismo` e a barra mandava para
 * `/categoria/turismo` —, e as duas páginas nem mostravam a mesma quantidade de
 * matéria. Quem navegava não tinha como saber que eram a mesma editoria.
 */
export function rotaDaCategoria(slug: string): string {
  return `/categoria/${slug}`
}

/**
 * Item do menu principal.
 *
 * Vem em duas formas. A fixa (`rotulo` + `para`) é para o que não é editoria:
 * Início, Notícias, Dicas. A outra traz só `categoria`, o slug no banco — e aí
 * rótulo, ícone e destino são lidos da API pelo `useMenuPrincipal`.
 *
 * A diferença importa: com o slug, renomear "Meio Ambiente" no painel renomeia
 * o menu, e uma editoria tirada do ar some da navegação sozinha. Com o rótulo
 * escrito aqui, o menu ia envelhecendo em silêncio até discordar da barra de
 * categorias — que sempre leu do banco.
 */
export interface ItemPrincipal {
  /** Slug da editoria no banco. Quando presente, manda no rótulo e no destino. */
  categoria?: string
  /** Só para os itens fixos, que não são editoria. */
  rotulo?: string
  para?: string
  icone?: string
  /** Páginas curadas que vivem sob este item, no submenu. */
  filhos?: ItemMenu[]
}

export const MENU_PRINCIPAL: ItemPrincipal[] = [
  { rotulo: 'Início', para: '/', icone: 'fas fa-house' },
  { rotulo: 'Notícias', para: '/noticias', icone: 'fas fa-newspaper' },
  {
    categoria: 'turismo',
    filhos: [
      { rotulo: 'Todas as matérias', para: '/categoria/turismo', icone: 'fas fa-suitcase-rolling' },
      // A página curada do Parintins continua no ar e no menu: ela tem
      // cronograma e histórico que a listagem por editoria não mostra.
      { rotulo: 'Festival de Parintins', para: '/turismo', icone: 'fas fa-drum' },
    ],
  },
  // "Dicas" é tipo de conteúdo, não editoria — não existe no banco de
  // categorias, então continua fixa aqui.
  { rotulo: 'Dicas', para: '/dicas', icone: 'fas fa-lightbulb' },
  {
    categoria: 'cultura',
    filhos: [
      { rotulo: 'Todas as matérias', para: '/categoria/cultura', icone: 'fas fa-newspaper' },
      { rotulo: 'Cultura & Arte', para: '/cultura', icone: 'fas fa-palette' },
      { rotulo: 'Quem Somos', para: '/quem-somos', icone: 'fas fa-users' },
      { rotulo: 'O Projeto Sampa na Ilha', para: '/cultura/o-projeto', icone: 'fas fa-seedling' },
      { rotulo: 'Grupo de Dança', para: '/cultura/grupo-danca', icone: 'fas fa-music' },
      { rotulo: 'Workshops & Artesanato', para: '/cultura/workshops', icone: 'fas fa-hands-helping' },
      { rotulo: 'Eventos & Atrações', para: '/cultura/eventos', icone: 'fas fa-calendar-day' },
    ],
  },
  { categoria: 'vagas' },
]

/**
 * Menu lateral do painel. Lista simples, sem seções: a ação de criar conteúdo
 * fica na barra superior, para não competir com o item "Conteúdos".
 */
export interface ItemMenuAdmin extends ItemMenu {
  /** Some do menu de quem não é editor-chefe. */
  soChefe?: boolean
}

export const MENU_ADMIN: ItemMenuAdmin[] = [
  { rotulo: 'Dashboard', para: '/admin/dashboard', icone: 'LayoutDashboard' },
  { rotulo: 'Conteúdos', para: '/admin/posts', icone: 'FileText' },
  { rotulo: 'Mídia Kit', para: '/admin/midia-kit', icone: 'File' },
  { rotulo: 'Avisos', para: '/admin/avisos', icone: 'Megaphone', soChefe: true },
  // Cadastrar e tirar banner do ar é decisão comercial: a API só aceita de
  // quem administra o portal, e o menu segue a mesma régua.
  { rotulo: 'Publicidade', para: '/admin/publicidade', icone: 'Image', soChefe: true },
  { rotulo: 'Vagas', para: '/admin/vagas', icone: 'Briefcase' },
  { rotulo: 'Workshops', para: '/admin/workshops', icone: 'GraduationCap' },
  { rotulo: 'Eventos', para: '/admin/eventos', icone: 'CalendarDays' },
  { rotulo: 'Categorias', para: '/admin/categorias', icone: 'Tags', soChefe: true },
  { rotulo: 'Equipe', para: '/admin/equipe', icone: 'Users', soChefe: true },
  { rotulo: 'Newsletter', para: '/admin/newsletter', icone: 'Mail' },
  { rotulo: 'Meu perfil', para: '/admin/perfil', icone: 'UserCircle' },
  { rotulo: 'Configurações', para: '/admin/configuracoes', icone: 'Settings' },
]

export const RODAPE_EDITORIAS: ItemMenu[] = [
  { rotulo: 'Turismo', para: '/categoria/turismo' },
  { rotulo: 'Meio Ambiente', para: '/categoria/meio-ambiente' },
  { rotulo: 'Gastronomia', para: '/categoria/gastronomia' },
  { rotulo: 'Esportes', para: '/categoria/esportes' },
  { rotulo: 'Cultura', para: '/categoria/cultura' },
]

export const RODAPE_PORTAL: ItemMenu[] = [
  { rotulo: 'Quem Somos', para: '/quem-somos' },
  { rotulo: 'Informações & Serviço', para: '/informacoes' },
  { rotulo: 'Contato', para: '/informacoes' },
  { rotulo: 'Anuncie', para: '/informacoes' },
  { rotulo: 'Trabalhe Conosco', para: '/vagas' },
  { rotulo: 'Política de Privacidade', para: '/informacoes' },
  { rotulo: 'Área da redação', para: '/admin' },
]

/** Número oficial de atendimento, só com dígitos — é o formato do wa.me. */
const WHATSAPP_DIGITOS = '5511913060670'

export const CONTATO = {
  email: 'contato@portalsampanailha.com.br',
  telefone: '(11) 91306-0670',
  whatsapp: '(11) 91306-0670',
  /** Redirect oficial do WhatsApp: abre o app no celular e o Web no desktop. */
  whatsappUrl: `https://wa.me/${WHATSAPP_DIGITOS}`,
  instagram: '@portalsampanailha',
  instagramUrl: 'https://www.instagram.com/portalsampanailha/',
  facebookUrl: 'https://www.facebook.com/portalsampanailha',
  razaoSocial: 'Sampa na Ilha Produções e Comunicação LTDA',
  cnpj: '66.549.829/0001-56',
  tagline: 'Conectando São Paulo ao Brasil',
}

export const REDES_SOCIAIS = [
  { rotulo: 'Instagram', icone: 'fab fa-instagram', url: CONTATO.instagramUrl },
  { rotulo: 'Facebook', icone: 'fab fa-facebook-f', url: CONTATO.facebookUrl },
  { rotulo: 'WhatsApp', icone: 'fab fa-whatsapp', url: CONTATO.whatsappUrl },
]

/** Canais de atendimento — usados no rodapé, em /quem-somos e em /informacoes. */
export const CANAIS_ATENDIMENTO = [
  { rotulo: 'WhatsApp oficial', valor: CONTATO.whatsapp, icone: 'fab fa-whatsapp', url: CONTATO.whatsappUrl },
  { rotulo: 'E-mail', valor: CONTATO.email, icone: 'fas fa-envelope', url: `mailto:${CONTATO.email}` },
  { rotulo: 'Instagram', valor: CONTATO.instagram, icone: 'fab fa-instagram', url: CONTATO.instagramUrl },
  { rotulo: 'Facebook', valor: '/portalsampanailha', icone: 'fab fa-facebook-f', url: CONTATO.facebookUrl },
]
