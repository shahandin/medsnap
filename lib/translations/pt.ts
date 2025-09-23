import type { TranslationData } from "./index"

export const pt: TranslationData = {
  // Navigation
  nav: {
    home: "Início",
    apply: "Candidatar-se",
    benefits: "Benefícios",
    help: "Ajuda",
    language: "Idioma",
    login: "Entrar",
    logout: "Sair",
    profile: "Perfil",
    dashboard: "Painel",
  },

  // Common
  common: {
    next: "Próximo",
    previous: "Anterior",
    save: "Salvar",
    cancel: "Cancelar",
    submit: "Enviar",
    edit: "Editar",
    delete: "Excluir",
    confirm: "Confirmar",
    close: "Fechar",
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    warning: "Aviso",
    info: "Informação",
    yes: "Sim",
    no: "Não",
    optional: "Opcional",
    required: "Obrigatório",
    select: "Selecionar",
    upload: "Carregar",
    download: "Baixar",
    print: "Imprimir",
    search: "Pesquisar",
    filter: "Filtrar",
    clear: "Limpar",
    apply: "Aplicar",
    reset: "Redefinir",
  },

  // Home Page
  home: {
    title: "Candidatura aos Benefícios Medicaid e SNAP",
    subtitle: "Simplifique seu processo de candidatura com nossa plataforma online segura",
    getStarted: "Começar",
    learnMore: "Saiba mais",
    features: {
      title: "Por que escolher nossa plataforma",
      easyApplication: {
        title: "Candidatura Fácil",
        description: "Processo passo a passo que o guia através de cada seção",
      },
      securePrivate: {
        title: "Seguro e Privado",
        description: "Suas informações pessoais são protegidas com criptografia de nível militar",
      },
      fastProcessing: {
        title: "Processamento Rápido",
        description: "Obtenha resultados mais rapidamente com nosso sistema otimizado",
      },
      aiEnabled: {
        title: "Habilitado por IA",
        description: "Receba assistência personalizada e orientação",
      },
    },
    benefits: {
      title: "Benefícios Disponíveis",
      medicaid: {
        title: "Medicaid",
        description: "Seguro de saúde para indivíduos e famílias de baixa renda",
      },
      snap: {
        title: "SNAP",
        description: "Programa de Assistência Nutricional Suplementar",
      },
    },
  },

  // Application Form
  application: {
    title: "Candidatura aos Benefícios",
    progress: "Progresso",
    step: "Passo",
    of: "de",
    personalInfo: "Informações Pessoais",
    household: "Domicílio",
    income: "Renda",
    assets: "Ativos",
    expenses: "Despesas",
    review: "Revisão",
    submit: "Enviar",

    personalInformation: {
      title: "Informações Pessoais",
      firstName: "Nome",
      lastName: "Sobrenome",
      middleName: "Nome do meio",
      dateOfBirth: "Data de nascimento",
      ssn: "Número do Seguro Social",
      phone: "Número de telefone",
      email: "Endereço de e-mail",
      address: "Endereço",
      city: "Cidade",
      state: "Estado",
      zipCode: "CEP",
      county: "Condado",
    },

    household: {
      title: "Informações do Domicílio",
      size: "Tamanho do domicílio",
      members: "Membros do domicílio",
      addMember: "Adicionar membro",
      relationship: "Relacionamento",
      age: "Idade",
      income: "Renda",
    },

    income: {
      title: "Informações de Renda",
      employment: "Emprego",
      wages: "Salários",
      selfEmployment: "Trabalho autônomo",
      unemployment: "Seguro-desemprego",
      socialSecurity: "Seguridade Social",
      pension: "Pensão",
      other: "Outro",
    },

    assets: {
      title: "Ativos",
      checking: "Conta corrente",
      savings: "Conta poupança",
      cash: "Dinheiro",
      vehicles: "Veículos",
      property: "Propriedade",
      investments: "Investimentos",
    },

    expenses: {
      title: "Despesas",
      rent: "Aluguel/Hipoteca",
      utilities: "Serviços públicos",
      childcare: "Cuidados infantis",
      medical: "Despesas médicas",
      other: "Outras despesas",
    },
  },

  // Validation Messages
  validation: {
    required: "Este campo é obrigatório",
    email: "Por favor, insira um endereço de e-mail válido",
    phone: "Por favor, insira um número de telefone válido",
    ssn: "Por favor, insira um número de Seguro Social válido",
    date: "Por favor, insira uma data válida",
    number: "Por favor, insira um número válido",
    minLength: "Comprimento mínimo: {min} caracteres",
    maxLength: "Comprimento máximo: {max} caracteres",
  },

  // Help & Support
  help: {
    title: "Ajuda e Suporte",
    faq: "Perguntas Frequentes",
    contact: "Entre em contato",
    documentation: "Documentação",
    tutorials: "Tutoriais",

    whatIsMedicaid: "O que é Medicaid?",
    medicaidAnswer:
      "Medicaid é um programa conjunto federal e estadual que ajuda a cobrir custos médicos para pessoas com renda e recursos limitados.",

    whatIsSNAP: "O que é SNAP?",
    snapAnswer:
      "SNAP (Programa de Assistência Nutricional Suplementar) ajuda famílias de baixa renda a comprar alimentos nutritivos.",

    howToApply: "Como me candidatar?",
    applyAnswer: "Complete a candidatura online fornecendo informações sobre seu domicílio, renda e despesas.",

    whatDocuments: "Que documentos preciso?",
    documentsAnswer: "Você precisará de documentos que comprovem identidade, renda, ativos e despesas.",

    howLong: "Quanto tempo leva o processamento?",
    processingAnswer: "O processamento geralmente leva 30 dias para Medicaid e 30 dias para SNAP.",
  },

  // Status Messages
  status: {
    submitted: "Candidatura enviada",
    pending: "Pendente",
    approved: "Aprovado",
    denied: "Negado",
    incomplete: "Incompleto",
    underReview: "Em análise",
  },

  // Error Messages
  errors: {
    generic: "Ocorreu um erro. Por favor, tente novamente.",
    network: "Erro de rede. Verifique sua conexão com a internet.",
    timeout: "A solicitação expirou. Por favor, tente novamente.",
    unauthorized: "Você não tem permissão para realizar esta ação.",
    notFound: "O recurso solicitado não foi encontrado.",
    validation: "Por favor, corrija os erros no formulário.",
    upload: "Erro ao carregar arquivo. Por favor, tente novamente.",
  },
}
