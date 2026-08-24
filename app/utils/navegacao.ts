/** Estrutura de navegação do site público e do dashboard. */

export interface ItemMenu {
  rotulo: string
  para: string
  icone?: string
  filhos?: ItemMenu[]
}

export const MENU_PRINCIPAL: ItemMenu[] = [
  { rotulo: 'Início', para: '/', icone: 'fas fa-house' },
  { rotulo: 'Notícias', para: '/noticias', icone: 'fas fa-newspaper' },
  { rotulo: 'Turismo', para: '/turismo', icone: 'fas fa-suitcase-rolling' },
  { rotulo: 'Dicas', para: '/dicas', icone: 'fas fa-lightbulb' },
  {
    rotulo: 'Cultura',
    para: '/cultura',
    icone: 'fas fa-theater-masks',
    filhos: [
      { rotulo: 'Cultura & Arte', para: '/cultura', icone: 'fas fa-newspaper' },
      { rotulo: 'Quem Somos', para: '/quem-somos', icone: 'fas fa-users' },
      { rotulo: 'O Projeto Sampa na Ilha', para: '/cultura/o-projeto', icone: 'fas fa-seedling' },
      { rotulo: 'Grupo de Dança', para: '/cultura/grupo-danca', icone: 'fas fa-music' },
      { rotulo: 'Workshops & Artesanato', para: '/cultura/workshops', icone: 'fas fa-hands-helping' },
      { rotulo: 'Eventos & Atrações', para: '/cultura/eventos', icone: 'fas fa-calendar-day' },
    ],
  },
  { rotulo: 'Vagas', para: '/vagas', icone: 'fas fa-briefcase' },
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
  { rotulo: 'Editorias', para: '/admin/editorias', icone: 'Tags', soChefe: true },
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
  instagramUrl: 'https://www.instagram.com/sampanailha.tur/',
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
