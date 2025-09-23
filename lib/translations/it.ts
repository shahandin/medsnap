import type { TranslationData } from "./index"

export const it: TranslationData = {
  // Navigation
  nav: {
    home: "Home",
    apply: "Candidati",
    benefits: "Benefici",
    help: "Aiuto",
    language: "Lingua",
    login: "Accedi",
    logout: "Esci",
    profile: "Profilo",
    dashboard: "Dashboard",
  },

  // Common
  common: {
    next: "Avanti",
    previous: "Indietro",
    save: "Salva",
    cancel: "Annulla",
    submit: "Invia",
    edit: "Modifica",
    delete: "Elimina",
    confirm: "Conferma",
    close: "Chiudi",
    loading: "Caricamento...",
    error: "Errore",
    success: "Successo",
    warning: "Avviso",
    info: "Informazione",
    yes: "Sì",
    no: "No",
    optional: "Opzionale",
    required: "Obbligatorio",
    select: "Seleziona",
    upload: "Carica",
    download: "Scarica",
    print: "Stampa",
    search: "Cerca",
    filter: "Filtra",
    clear: "Cancella",
    apply: "Applica",
    reset: "Reimposta",
  },

  // Home Page
  home: {
    title: "Domanda per Benefici Medicaid e SNAP",
    subtitle: "Semplifica il tuo processo di candidatura con la nostra piattaforma online sicura",
    getStarted: "Inizia",
    learnMore: "Scopri di più",
    features: {
      title: "Perché scegliere la nostra piattaforma",
      easyApplication: {
        title: "Candidatura Facile",
        description: "Processo passo dopo passo che ti guida attraverso ogni sezione",
      },
      securePrivate: {
        title: "Sicuro e Privato",
        description: "Le tue informazioni personali sono protette con crittografia di livello militare",
      },
      fastProcessing: {
        title: "Elaborazione Veloce",
        description: "Ottieni risultati più velocemente con il nostro sistema ottimizzato",
      },
      aiEnabled: {
        title: "Abilitato dall'IA",
        description: "Ricevi assistenza personalizzata e orientamento",
      },
    },
    benefits: {
      title: "Benefici Disponibili",
      medicaid: {
        title: "Medicaid",
        description: "Assicurazione sanitaria per individui e famiglie a basso reddito",
      },
      snap: {
        title: "SNAP",
        description: "Programma di Assistenza Nutrizionale Supplementare",
      },
    },
  },

  // Application Form
  application: {
    title: "Domanda per Benefici",
    progress: "Progresso",
    step: "Passo",
    of: "di",
    personalInfo: "Informazioni Personali",
    household: "Nucleo Familiare",
    income: "Reddito",
    assets: "Patrimonio",
    expenses: "Spese",
    review: "Revisione",
    submit: "Invia",

    personalInformation: {
      title: "Informazioni Personali",
      firstName: "Nome",
      lastName: "Cognome",
      middleName: "Secondo nome",
      dateOfBirth: "Data di nascita",
      ssn: "Numero di Previdenza Sociale",
      phone: "Numero di telefono",
      email: "Indirizzo email",
      address: "Indirizzo",
      city: "Città",
      state: "Stato",
      zipCode: "Codice postale",
      county: "Contea",
    },

    household: {
      title: "Informazioni del Nucleo Familiare",
      size: "Dimensione del nucleo familiare",
      members: "Membri del nucleo familiare",
      addMember: "Aggiungi membro",
      relationship: "Relazione",
      age: "Età",
      income: "Reddito",
    },

    income: {
      title: "Informazioni sul Reddito",
      employment: "Impiego",
      wages: "Salari",
      selfEmployment: "Lavoro autonomo",
      unemployment: "Sussidio di disoccupazione",
      socialSecurity: "Previdenza Sociale",
      pension: "Pensione",
      other: "Altro",
    },

    assets: {
      title: "Patrimonio",
      checking: "Conto corrente",
      savings: "Conto di risparmio",
      cash: "Contanti",
      vehicles: "Veicoli",
      property: "Proprietà",
      investments: "Investimenti",
    },

    expenses: {
      title: "Spese",
      rent: "Affitto/Mutuo",
      utilities: "Utenze",
      childcare: "Assistenza all'infanzia",
      medical: "Spese mediche",
      other: "Altre spese",
    },
  },

  // Validation Messages
  validation: {
    required: "Questo campo è obbligatorio",
    email: "Inserisci un indirizzo email valido",
    phone: "Inserisci un numero di telefono valido",
    ssn: "Inserisci un numero di Previdenza Sociale valido",
    date: "Inserisci una data valida",
    number: "Inserisci un numero valido",
    minLength: "Lunghezza minima: {min} caratteri",
    maxLength: "Lunghezza massima: {max} caratteri",
  },

  // Help & Support
  help: {
    title: "Aiuto e Supporto",
    faq: "Domande Frequenti",
    contact: "Contattaci",
    documentation: "Documentazione",
    tutorials: "Tutorial",

    whatIsMedicaid: "Cos'è Medicaid?",
    medicaidAnswer:
      "Medicaid è un programma congiunto federale e statale che aiuta a coprire i costi medici per persone con reddito e risorse limitate.",

    whatIsSNAP: "Cos'è SNAP?",
    snapAnswer:
      "SNAP (Programma di Assistenza Nutrizionale Supplementare) aiuta le famiglie a basso reddito ad acquistare cibi nutrienti.",

    howToApply: "Come faccio domanda?",
    applyAnswer: "Completa la domanda online fornendo informazioni sul tuo nucleo familiare, reddito e spese.",

    whatDocuments: "Di quali documenti ho bisogno?",
    documentsAnswer: "Avrai bisogno di documenti che provino identità, reddito, patrimonio e spese.",

    howLong: "Quanto tempo richiede l'elaborazione?",
    processingAnswer: "L'elaborazione richiede solitamente 30 giorni per Medicaid e 30 giorni per SNAP.",
  },

  // Status Messages
  status: {
    submitted: "Domanda inviata",
    pending: "In attesa",
    approved: "Approvato",
    denied: "Rifiutato",
    incomplete: "Incompleto",
    underReview: "In revisione",
  },

  // Error Messages
  errors: {
    generic: "Si è verificato un errore. Riprova.",
    network: "Errore di rete. Controlla la tua connessione internet.",
    timeout: "La richiesta è scaduta. Riprova.",
    unauthorized: "Non hai il permesso di eseguire questa azione.",
    notFound: "La risorsa richiesta non è stata trovata.",
    validation: "Correggi gli errori nel modulo.",
    upload: "Errore nel caricamento del file. Riprova.",
  },
}
