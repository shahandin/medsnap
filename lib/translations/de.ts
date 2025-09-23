import type { TranslationData } from "./index"

export const de: TranslationData = {
  // Navigation
  nav: {
    home: "Startseite",
    apply: "Beantragen",
    benefits: "Leistungen",
    help: "Hilfe",
    language: "Sprache",
    login: "Anmelden",
    logout: "Abmelden",
    profile: "Profil",
    dashboard: "Dashboard",
  },

  // Common
  common: {
    next: "Weiter",
    previous: "Zurück",
    save: "Speichern",
    cancel: "Abbrechen",
    submit: "Senden",
    edit: "Bearbeiten",
    delete: "Löschen",
    confirm: "Bestätigen",
    close: "Schließen",
    loading: "Laden...",
    error: "Fehler",
    success: "Erfolgreich",
    warning: "Warnung",
    info: "Information",
    yes: "Ja",
    no: "Nein",
    optional: "Optional",
    required: "Erforderlich",
    select: "Auswählen",
    upload: "Hochladen",
    download: "Herunterladen",
    print: "Drucken",
    search: "Suchen",
    filter: "Filtern",
    clear: "Löschen",
    apply: "Anwenden",
    reset: "Zurücksetzen",
  },

  // Home Page
  home: {
    title: "Medicaid und SNAP Leistungsantrag",
    subtitle: "Vereinfachen Sie Ihren Antragsprozess mit unserer sicheren Online-Plattform",
    getStarted: "Loslegen",
    learnMore: "Mehr erfahren",
    features: {
      title: "Warum unsere Plattform wählen",
      easyApplication: {
        title: "Einfache Antragstellung",
        description: "Schritt-für-Schritt-Prozess, der Sie durch jeden Abschnitt führt",
      },
      securePrivate: {
        title: "Sicher und Privat",
        description: "Ihre persönlichen Daten sind mit militärischer Verschlüsselung geschützt",
      },
      fastProcessing: {
        title: "Schnelle Bearbeitung",
        description: "Erhalten Sie Ergebnisse schneller mit unserem optimierten System",
      },
      aiEnabled: {
        title: "KI-unterstützt",
        description: "Erhalten Sie personalisierte Unterstützung und Anleitung",
      },
    },
    benefits: {
      title: "Verfügbare Leistungen",
      medicaid: {
        title: "Medicaid",
        description: "Krankenversicherung für Personen und Familien mit niedrigem Einkommen",
      },
      snap: {
        title: "SNAP",
        description: "Ergänzendes Ernährungshilfeprogramm",
      },
    },
  },

  // Application Form
  application: {
    title: "Leistungsantrag",
    progress: "Fortschritt",
    step: "Schritt",
    of: "von",
    personalInfo: "Persönliche Informationen",
    household: "Haushalt",
    income: "Einkommen",
    assets: "Vermögen",
    expenses: "Ausgaben",
    review: "Überprüfung",
    submit: "Senden",

    personalInformation: {
      title: "Persönliche Informationen",
      firstName: "Vorname",
      lastName: "Nachname",
      middleName: "Zweiter Vorname",
      dateOfBirth: "Geburtsdatum",
      ssn: "Sozialversicherungsnummer",
      phone: "Telefonnummer",
      email: "E-Mail-Adresse",
      address: "Adresse",
      city: "Stadt",
      state: "Bundesstaat",
      zipCode: "Postleitzahl",
      county: "Landkreis",
    },

    household: {
      title: "Haushaltsinformationen",
      size: "Haushaltsgröße",
      members: "Haushaltsmitglieder",
      addMember: "Mitglied hinzufügen",
      relationship: "Beziehung",
      age: "Alter",
      income: "Einkommen",
    },

    income: {
      title: "Einkommensinformationen",
      employment: "Beschäftigung",
      wages: "Löhne",
      selfEmployment: "Selbstständigkeit",
      unemployment: "Arbeitslosengeld",
      socialSecurity: "Sozialversicherung",
      pension: "Rente",
      other: "Andere",
    },

    assets: {
      title: "Vermögen",
      checking: "Girokonto",
      savings: "Sparkonto",
      cash: "Bargeld",
      vehicles: "Fahrzeuge",
      property: "Eigentum",
      investments: "Investitionen",
    },

    expenses: {
      title: "Ausgaben",
      rent: "Miete/Hypothek",
      utilities: "Nebenkosten",
      childcare: "Kinderbetreuung",
      medical: "Medizinische Ausgaben",
      other: "Andere Ausgaben",
    },
  },

  // Validation Messages
  validation: {
    required: "Dieses Feld ist erforderlich",
    email: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    phone: "Bitte geben Sie eine gültige Telefonnummer ein",
    ssn: "Bitte geben Sie eine gültige Sozialversicherungsnummer ein",
    date: "Bitte geben Sie ein gültiges Datum ein",
    number: "Bitte geben Sie eine gültige Zahl ein",
    minLength: "Mindestlänge: {min} Zeichen",
    maxLength: "Maximale Länge: {max} Zeichen",
  },

  // Help & Support
  help: {
    title: "Hilfe und Support",
    faq: "Häufig gestellte Fragen",
    contact: "Kontakt",
    documentation: "Dokumentation",
    tutorials: "Anleitungen",

    whatIsMedicaid: "Was ist Medicaid?",
    medicaidAnswer:
      "Medicaid ist ein gemeinsames Bundes- und Landesprogramm, das bei der Deckung medizinischer Kosten für Menschen mit begrenztem Einkommen und Ressourcen hilft.",

    whatIsSNAP: "Was ist SNAP?",
    snapAnswer:
      "SNAP (Ergänzendes Ernährungshilfeprogramm) hilft Familien mit niedrigem Einkommen beim Kauf nahrhafter Lebensmittel.",

    howToApply: "Wie beantrage ich?",
    applyAnswer:
      "Füllen Sie den Online-Antrag aus und geben Sie Informationen über Ihren Haushalt, Ihr Einkommen und Ihre Ausgaben an.",

    whatDocuments: "Welche Dokumente benötige ich?",
    documentsAnswer: "Sie benötigen Dokumente, die Identität, Einkommen, Vermögen und Ausgaben belegen.",

    howLong: "Wie lange dauert die Bearbeitung?",
    processingAnswer: "Die Bearbeitung dauert normalerweise 30 Tage für Medicaid und 30 Tage für SNAP.",
  },

  // Status Messages
  status: {
    submitted: "Antrag eingereicht",
    pending: "Ausstehend",
    approved: "Genehmigt",
    denied: "Abgelehnt",
    incomplete: "Unvollständig",
    underReview: "In Bearbeitung",
  },

  // Error Messages
  errors: {
    generic: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    network: "Netzwerkfehler. Überprüfen Sie Ihre Internetverbindung.",
    timeout: "Die Anfrage ist abgelaufen. Bitte versuchen Sie es erneut.",
    unauthorized: "Sie haben keine Berechtigung für diese Aktion.",
    notFound: "Die angeforderte Ressource wurde nicht gefunden.",
    validation: "Bitte korrigieren Sie die Fehler im Formular.",
    upload: "Fehler beim Hochladen der Datei. Bitte versuchen Sie es erneut.",
  },
}
