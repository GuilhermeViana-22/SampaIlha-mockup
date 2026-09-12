/**
 * Termos de Uso e Política de Privacidade do portal.
 *
 * O texto vive aqui, e não numa página do painel, porque é documento jurídico:
 * muda com revisão de quem responde pelo portal, versionado no repositório,
 * com data de vigência à vista. Editoria não republica isso por engano.
 *
 * Os dois abrem em modal a partir do rodapé (`LegalModal`), sem tirar o leitor
 * da matéria que estava lendo.
 */

import { CONTATO } from '~/utils/navegacao'

export type ChaveDocumentoLegal = 'termos' | 'privacidade'

export interface SecaoLegal {
  titulo: string
  /** Texto corrido da seção. */
  paragrafos?: string[]
  /** Itens em marcador, quando a seção enumera (dados, direitos, usos). */
  lista?: string[]
  /** Fecho depois da lista — `paragrafos` sempre vem antes dela. */
  nota?: string
}

export interface DocumentoLegal {
  chave: ChaveDocumentoLegal
  titulo: string
  /** Linha de apoio no cabeçalho do modal. */
  resumo: string
  icone: string
  /** Data de vigência desta versão, já no formato em que é exibida. */
  atualizadoEm: string
  secoes: SecaoLegal[]
}

/** Vale para os dois documentos: uma revisão muda a data das duas versões. */
const VIGENCIA = '11 de setembro de 2026'

const SITE = 'portalsampanailha.com.br'

export const TERMOS_DE_USO: DocumentoLegal = {
  chave: 'termos',
  titulo: 'Termos de Uso',
  resumo: `Regras de uso do Portal Sampa na Ilha (${SITE}).`,
  icone: 'fas fa-file-contract',
  atualizadoEm: VIGENCIA,
  secoes: [
    {
      titulo: '1. Quem somos e o que você aceita ao navegar',
      paragrafos: [
        `O Portal Sampa na Ilha é mantido por ${CONTATO.razaoSocial}, inscrita no CNPJ sob o nº ${CONTATO.cnpj}, responsável pelo conteúdo publicado em ${SITE}.`,
        'Ao acessar o portal, usar suas áreas abertas ou assinar a newsletter, você concorda com estes Termos de Uso e com a Política de Privacidade. Se não concordar com algum ponto, pedimos que não utilize o site.',
      ],
    },
    {
      titulo: '2. O que o portal oferece',
      paragrafos: [
        'O Sampa na Ilha publica notícias, reportagens, guias de serviço, agenda cultural, vagas de trabalho, eventos e conteúdo sobre o ecossistema cultural amazônico em São Paulo. O acesso ao conteúdo é gratuito e não exige cadastro.',
        'O portal pode alterar, suspender ou encerrar seções e funcionalidades a qualquer momento, sem aviso prévio, inclusive para manutenção, correção ou reformulação editorial.',
      ],
    },
    {
      titulo: '3. Como você pode usar o conteúdo',
      paragrafos: [
        'O conteúdo é oferecido para leitura, informação e uso pessoal. Ao navegar, você se compromete a não:',
      ],
      lista: [
        'reproduzir matérias na íntegra em outro site, blog ou rede social sem autorização por escrito da redação;',
        'usar sistemas automatizados de coleta em massa (robôs, raspagem, mineração) que prejudiquem o funcionamento do site;',
        'tentar acessar áreas restritas, contas de terceiros ou a infraestrutura do portal sem autorização;',
        'alterar, descontextualizar ou atribuir ao portal conteúdo que ele não publicou;',
        'utilizar a marca, o nome ou o logotipo do Sampa na Ilha de forma que sugira parceria, patrocínio ou endosso inexistente.',
      ],
    },
    {
      titulo: '4. Direitos autorais',
      paragrafos: [
        'Textos, fotografias, artes, vídeos, áudios, marca e identidade visual do portal são protegidos pela Lei nº 9.610/1998 e pertencem ao Sampa na Ilha ou aos seus respectivos autores e licenciantes.',
        'É permitida a citação de trechos para fins de informação, crítica, estudo ou debate, desde que com indicação clara da fonte "Portal Sampa na Ilha" e link para a matéria original. Republicação integral, uso comercial e adaptação dependem de autorização prévia por escrito.',
        `Se você identificar conteúdo seu publicado sem o devido crédito ou autorização, escreva para ${CONTATO.email}: a redação apura e corrige ou remove o material.`,
      ],
    },
    {
      titulo: '5. Conteúdo de terceiros e links externos',
      paragrafos: [
        'O portal exibe informações originadas de terceiros — como previsão do tempo, agenda de eventos, programação cultural e materiais enviados por instituições e anunciantes — e links para sites externos.',
        'Esses conteúdos são publicados de boa-fé, mas o Sampa na Ilha não controla e não responde pela exatidão, disponibilidade, políticas de privacidade ou práticas comerciais de sites e serviços de terceiros. Datas, horários, preços e condições de eventos devem ser confirmados junto ao organizador.',
      ],
    },
    {
      titulo: '6. Vagas e oportunidades',
      paragrafos: [
        'A seção de vagas divulga oportunidades informadas por empresas, coletivos e instituições. O portal apenas publica o anúncio: não participa do processo seletivo, não intermedeia a contratação e não recebe currículos — as candidaturas seguem direto para o canal indicado pelo anunciante.',
        'O Sampa na Ilha nunca cobra qualquer valor de candidatos. Se alguma vaga divulgada aqui pedir pagamento, depósito ou dados bancários, não atenda e nos avise imediatamente.',
      ],
    },
    {
      titulo: '7. Publicidade e conteúdo patrocinado',
      paragrafos: [
        'O portal se sustenta também com publicidade. Anúncios, banners e conteúdos patrocinados são identificados como tal e não interferem na apuração nem na linha editorial das matérias.',
        'A relação comercial ou contratual decorrente de um anúncio é estabelecida entre você e o anunciante; o portal não é parte nessa relação.',
      ],
    },
    {
      titulo: '8. Newsletter',
      paragrafos: [
        'A assinatura da newsletter é voluntária e pede apenas nome e e-mail. O endereço é usado para enviar as novidades do portal e nada mais — não é vendido nem cedido para terceiros.',
        'Você pode cancelar quando quiser, pelo link de descadastro presente em cada envio ou pedindo pelo e-mail de contato. O tratamento desses dados está descrito na Política de Privacidade.',
      ],
    },
    {
      titulo: '9. Correções, direito de resposta e remoção',
      paragrafos: [
        'A redação corrige erros assim que os identifica ou é comunicada deles, com registro da alteração quando houver mudança relevante de sentido.',
        `Pedidos de correção, direito de resposta ou remoção de conteúdo devem ser enviados para ${CONTATO.email} ou pelo WhatsApp ${CONTATO.whatsapp}, com a indicação do link, do trecho questionado e do motivo. Respondemos a cada pedido; a decisão editorial cabe ao portal, respeitadas as vias legais.`,
      ],
    },
    {
      titulo: '10. Área restrita da redação',
      paragrafos: [
        'O painel administrativo é de uso exclusivo da equipe autorizada. Quem recebe acesso é responsável por manter a senha em sigilo, não compartilhá-la e comunicar imediatamente qualquer suspeita de uso indevido. Acessos podem ser suspensos a qualquer tempo.',
      ],
    },
    {
      titulo: '11. Disponibilidade e limitação de responsabilidade',
      paragrafos: [
        'O portal é oferecido no estado em que se encontra. Apesar do cuidado com apuração e manutenção, não garantimos funcionamento ininterrupto ou livre de falhas, nem ausência de erros pontuais no conteúdo.',
        'Na medida permitida pela legislação brasileira, o Sampa na Ilha não responde por danos decorrentes de indisponibilidade do site, de decisões tomadas com base no conteúdo publicado ou do uso de sites de terceiros acessados a partir daqui. Nada nestes Termos afasta os direitos assegurados ao consumidor pelo Código de Defesa do Consumidor.',
      ],
    },
    {
      titulo: '12. Alterações destes Termos',
      paragrafos: [
        'Estes Termos podem ser atualizados para refletir mudanças no portal ou na legislação. A versão vigente é sempre a publicada nesta página, com a data de atualização no topo. O uso do site após a mudança significa concordância com o texto novo.',
      ],
    },
    {
      titulo: '13. Lei aplicável e foro',
      paragrafos: [
        'Estes Termos são regidos pelas leis brasileiras, em especial o Marco Civil da Internet (Lei nº 12.965/2014), a Lei de Direitos Autorais (Lei nº 9.610/1998), o Código de Defesa do Consumidor (Lei nº 8.078/1990) e a LGPD (Lei nº 13.709/2018).',
        'Fica eleito o foro da Comarca de São Paulo/SP para dirimir controvérsias, ressalvado ao consumidor o direito de acionar o foro de seu domicílio.',
      ],
    },
  ],
}

export const POLITICA_DE_PRIVACIDADE: DocumentoLegal = {
  chave: 'privacidade',
  titulo: 'Política de Privacidade',
  resumo: 'Quais dados o portal trata, para quê, e como você exerce seus direitos.',
  icone: 'fas fa-shield-halved',
  atualizadoEm: VIGENCIA,
  secoes: [
    {
      titulo: '1. Quem trata seus dados',
      paragrafos: [
        `O controlador dos dados pessoais tratados em ${SITE} é ${CONTATO.razaoSocial}, CNPJ nº ${CONTATO.cnpj}.`,
        `Encarregado pelo tratamento de dados (DPO) e canal de privacidade: ${CONTATO.email}.`,
        'Esta Política explica, em linguagem direta, o que coletamos, por que coletamos e o que você pode exigir de nós, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).',
      ],
    },
    {
      titulo: '2. O portal pede pouco',
      paragrafos: [
        'Ler o Sampa na Ilha não exige cadastro, login nem qualquer dado pessoal. Só tratamos dados quando você decide nos procurar ou assinar a newsletter — e o mínimo necessário para funcionar.',
      ],
    },
    {
      titulo: '3. Dados que você nos fornece',
      lista: [
        'Newsletter: nome e e-mail, informados por você no formulário de assinatura.',
        `Contato com a redação: os dados que você escrever ao falar conosco por e-mail (${CONTATO.email}), WhatsApp (${CONTATO.whatsapp}) ou redes sociais — nome, telefone, endereço de e-mail e o conteúdo da mensagem.`,
        'Equipe do portal: quem tem acesso ao painel tem nome, e-mail, função e credenciais cadastrados, para autenticação e assinatura das matérias.',
        'Candidaturas a vagas: não passam pelo portal. O contato segue direto para o canal do anunciante, e o Sampa na Ilha não recebe nem armazena currículos.',
      ],
    },
    {
      titulo: '4. Dados coletados automaticamente',
      lista: [
        'Registros de acesso: endereço IP, data e hora, páginas visitadas, tipo de navegador e sistema. O Marco Civil da Internet (art. 15) obriga a guarda desses registros por seis meses.',
        'Métricas de audiência: contagem de leituras por matéria, em números agregados, sem identificar quem leu.',
        'Armazenamento no seu navegador: o portal grava no localStorage quais matérias você já leu, apenas para não contar a mesma leitura duas vezes. Essa informação fica no seu aparelho e não é enviada associada à sua identidade.',
        'Cookies: usamos apenas os essenciais. O principal é o cookie de sessão da área restrita da redação, gravado no login. O portal não usa cookies de publicidade comportamental nem rastreamento entre sites.',
      ],
    },
    {
      titulo: '5. Para que usamos esses dados',
      lista: [
        'enviar a newsletter a quem pediu para recebê-la;',
        'responder mensagens, pedidos de pauta, correções e direito de resposta;',
        'medir audiência e entender quais conteúdos interessam, para decidir a pauta;',
        'manter o site no ar com segurança, prevenir fraudes, abusos e acessos indevidos;',
        'cumprir obrigações legais e atender determinações de autoridades competentes.',
      ],
      nota: 'Não fazemos perfilamento para publicidade, não tomamos decisões automatizadas sobre você e não vendemos dados pessoais. Nunca.',
    },
    {
      titulo: '6. Com que base legal',
      lista: [
        'Consentimento (art. 7º, I): assinatura da newsletter — revogável a qualquer momento.',
        'Legítimo interesse (art. 7º, IX): métricas de audiência, segurança do site e resposta a contatos espontâneos.',
        'Cumprimento de obrigação legal (art. 7º, II): guarda dos registros de acesso exigida pelo Marco Civil.',
        'Execução de contrato (art. 7º, V): dados da equipe com acesso ao painel.',
      ],
    },
    {
      titulo: '7. Com quem compartilhamos',
      paragrafos: [
        'Seus dados não são vendidos, alugados nem cedidos para fins comerciais. Há compartilhamento apenas com quem é indispensável para o portal funcionar, sempre limitado ao necessário:',
      ],
      lista: [
        'provedor de hospedagem e de infraestrutura, que armazena o site e sua base de dados;',
        'provedor de e-mail, responsável pelo envio da newsletter e pelas mensagens da redação;',
        'serviços externos acionados pelo seu navegador ao abrir o site, como a rede de distribuição de ícones e o serviço de previsão do tempo, que recebem seu endereço IP por natureza da conexão;',
        'autoridades públicas e judiciais, quando houver requisição legal ou ordem judicial.',
      ],
    },
    {
      titulo: '8. Por quanto tempo guardamos',
      lista: [
        'Newsletter: enquanto você quiser receber. Cancelou, o endereço sai da lista de envio; guardamos o registro do descadastro apenas para provar que a solicitação foi atendida.',
        'Mensagens à redação: pelo tempo necessário para responder e resolver o assunto, e depois pelo prazo em que possam ser exigidas como prova.',
        'Registros de acesso: seis meses, conforme o Marco Civil da Internet.',
        'Dados da equipe: enquanto durar o vínculo, e depois pelos prazos legais aplicáveis.',
      ],
    },
    {
      titulo: '9. Seus direitos',
      paragrafos: [
        'A LGPD (art. 18) garante que você peça, a qualquer momento:',
      ],
      lista: [
        'confirmação de que tratamos dados seus e acesso a esses dados;',
        'correção de dados incompletos, inexatos ou desatualizados;',
        'anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei;',
        'portabilidade dos dados a outro fornecedor;',
        'eliminação dos dados tratados com base no seu consentimento;',
        'informação sobre com quem compartilhamos seus dados;',
        'revogação do consentimento, com a informação sobre o que isso implica;',
        'oposição a tratamento feito com base em legítimo interesse.',
      ],
    },
    {
      titulo: '10. Como exercer seus direitos',
      paragrafos: [
        `Escreva para ${CONTATO.email} com o assunto "LGPD" descrevendo o pedido. Podemos pedir uma confirmação de identidade antes de atender, para não entregar dados de alguém a outra pessoa.`,
        'Respondemos em até 15 dias. Para cancelar a newsletter não é preciso escrever: basta clicar no link de descadastro no rodapé de qualquer edição.',
        'Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).',
      ],
    },
    {
      titulo: '11. Segurança',
      paragrafos: [
        'O site trafega por conexão criptografada (HTTPS), o acesso ao painel é protegido por senha individual e as senhas são armazenadas cifradas. O acesso aos dados é restrito a quem precisa deles para trabalhar.',
        'Nenhum sistema é infalível. Em caso de incidente de segurança com risco relevante, comunicaremos as pessoas afetadas e a ANPD, na forma da lei.',
      ],
    },
    {
      titulo: '12. Crianças e adolescentes',
      paragrafos: [
        'O portal é de conteúdo jornalístico, dirigido ao público em geral, e não coleta intencionalmente dados de menores de 16 anos. A assinatura da newsletter por menor de idade depende do consentimento de um dos pais ou do responsável legal. Identificado um cadastro nessa situação, os dados são eliminados.',
      ],
    },
    {
      titulo: '13. Transferência internacional',
      paragrafos: [
        'Alguns fornecedores de infraestrutura e de e-mail podem processar dados em servidores fora do Brasil. Nesses casos, exigimos que o tratamento observe padrões de proteção compatíveis com a LGPD.',
      ],
    },
    {
      titulo: '14. Alterações desta Política',
      paragrafos: [
        'Esta Política pode ser atualizada quando o portal mudar a forma de tratar dados ou quando a legislação exigir. A versão vigente é a publicada aqui, com a data de atualização no topo. Mudanças relevantes são avisadas no próprio site e, quando couber, por e-mail a quem assina a newsletter.',
      ],
    },
  ],
}

export const DOCUMENTOS_LEGAIS: Record<ChaveDocumentoLegal, DocumentoLegal> = {
  termos: TERMOS_DE_USO,
  privacidade: POLITICA_DE_PRIVACIDADE,
}
