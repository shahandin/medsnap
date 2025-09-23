import type { TranslationData } from "./index"

export const de: TranslationData = {
  // Navigation
  nav: {
    about: "Über uns",
    applyForBenefits: "Leistungen beantragen",
    dashboard: "Dashboard",
    signIn: "Anmelden",
    getStarted: "Loslegen",
    language: "Sprache",
  },

  // Homepage
  home: {
    trustedBy: "Vertraut von Tausenden landesweit",
    heroTitle: "Erhalten Sie Ihre Leistungen mit",
    heroTitleHighlight: "Vertrauen",
    heroDescription:
      "Vereinfachte Anträge für Medicaid- und SNAP-Leistungen. Erhalten Sie die Unterstützung, die Sie benötigen, mit unserer sicheren, benutzerfreundlichen Plattform, die für Ihren Erfolg entwickelt wurde.",
    applyForBenefits: "Leistungen beantragen",
    learnMore: "Mehr erfahren",
    whyChooseTitle: "Warum Benefit Bridge wählen?",
    whyChooseDescription:
      "Wir haben unsere Plattform so gestaltet, dass die Beantragung von Leistungen so einfach, sicher und stressfrei wie möglich ist.",

    // Feature cards
    features: {
      comprehensive: {
        title: "Umfassende Plattform",
        description:
          "Eine Plattform für alles: Anträge einreichen, Dokumentation hochladen, Lebensveränderungen melden, auf Benachrichtigungen antworten, Leistungen erneuern und mehr.",
      },
      easyApplication: {
        title: "Einfache Antragstellung",
        description: "Schritt-für-Schritt-Anleitung durch den gesamten Antragsprozess mit klaren, intuitiven Anweisungen.",
      },
      securePrivate: {
        title: "Sicher und privat",
        description:
          "Ihre persönlichen Informationen sind mit bankähnlicher Sicherheit, Verschlüsselung und Datenschutzkontrollen geschützt.",
      },
      aiEnabled: {
        title: "KI-unterstützt",
        description: "KI-unterstützter Assistent, der Sie durch Ihren Antrag führt und alle Ihre Fragen beantwortet.",
      },
    },

    // CTA section
    cta: {
      title: "Bereit anzufangen?",
      description:
        "Schließen Sie sich Tausenden von Menschen an, die erfolgreich Leistungen über unsere sichere, benutzerfreundliche Plattform beantragt haben. Ihre Reise zum Zugang zu Leistungen beginnt hier.",
      startApplication: "Ihren Antrag starten",
    },
  },

  // Authentication
  auth: {
    signIn: {
      title: "Willkommen zurück",
      subtitle: "Melden Sie sich in Ihrem Konto an",
      email: "E-Mail",
      password: "Passwort",
      emailPlaceholder: "sie@beispiel.com",
      showPassword: "Passwort anzeigen",
      hidePassword: "Passwort verbergen",
      signingIn: "Anmeldung...",
      signInButton: "Anmelden",
      noAccount: "Haben Sie kein Konto?",
      signUpLink: "Registrieren",
    },
    signUp: {
      title: "Erstellen Sie Ihr Konto",
      email: "E-Mail-Adresse",
      password: "Passwort",
      confirmPassword: "Passwort bestätigen",
      emailPlaceholder: "sie@beispiel.com",
      showPassword: "Passwort anzeigen",
      hidePassword: "Passwort verbergen",
      creatingAccount: "Konto wird erstellt...",
      createAccountButton: "Konto erstellen",
      hasAccount: "Haben Sie bereits ein Konto?",
      signInLink: "Anmelden",
      passwordRequirements: {
        minLength: "Mindestens 8 Zeichen lang",
        hasNumber: "Enthält mindestens eine Zahl",
        hasSpecialChar: 'Enthält mindestens ein Sonderzeichen (!@#$%^&*(),.?":{}|<>)',
        passwordsMatch: "Passwörter stimmen überein",
      },
      successMessage: "Konto erfolgreich erstellt! Bitte überprüfen Sie Ihre E-Mail, um Ihr Konto zu bestätigen.",
    },
  },

  // Prescreening
  prescreening: {
    title: "Leistungsberechtigung prüfen",
    subtitle:
      "Beantworten Sie ein paar schnelle Fragen, um zu sehen, ob Sie sich für Medicaid- und SNAP-Leistungen qualifizieren könnten. Dies hilft Ihnen zu entscheiden, welche Anträge Sie ausfüllen sollten.",
    processingMessage: "Ihre Antworten werden verarbeitet...",
    questionProgress: "Frage {{current}} von {{total}}",
    complete: "Abschließen",
    questions: {
      income: {
        text: "Ist das monatliche Einkommen Ihres Haushalts weniger als $2.500?",
        help: "Schließen Sie alle Einkommen aus Jobs, Leistungen und anderen Quellen für alle in Ihrem Haushalt ein.",
      },
      assets: {
        text: "Haben Sie weniger als $2.000 an Ersparnissen und Vermögenswerten?",
        help: "Schließen Sie Bankkonten, Investitionen und wertvolle Gegenstände ein (ausgenommen Ihr Zuhause und ein Auto).",
      },
      citizenship: {
        text: "Sind Sie US-Bürger oder qualifizierter Nicht-Bürger?",
        help: "Qualifizierte Nicht-Bürger umfassen Daueraufenthaltsberechtigte und bestimmte andere Einwanderungsstatus.",
      },
      ageDisability: {
        text: "Sind Sie 65 Jahre oder älter, schwanger oder haben eine Behinderung?",
        help: "Dies hilft bei der Bestimmung der Berechtigung für bestimmte Medicaid-Programme.",
      },
      householdSize: {
        text: "Haben Sie 4 oder weniger Personen in Ihrem Haushalt?",
        help: "Zählen Sie sich selbst, Ihren Ehepartner (falls verheiratet) und alle Angehörigen, die Sie in der Steuererklärung angeben.",
      },
      workRequirements: {
        text: "Arbeiten Sie mindestens 20 Stunden pro Woche oder qualifizieren Sie sich für eine Befreiung?",
        help: "Befreiungen umfassen unter 18 Jahre alt sein, über 50, schwanger, behindert oder die Betreuung kleiner Kinder.",
      },
    },
    results: {
      title: "Ihre Berechtigungsergebnisse",
      subtitle: "Basierend auf Ihren Antworten ist hier Ihre potenzielle Berechtigung für Leistungen",
      mayQualify: "Könnte sich qualifizieren",
      mayNotQualify: "Könnte sich nicht qualifizieren",
      medicaidEligible:
        "Sie könnten sich für Medicaid-Krankenversicherung qualifizieren. Füllen Sie den vollständigen Antrag aus, um Ihre Berechtigung zu überprüfen.",
      medicaidNotEligible:
        "Basierend auf Ihren Antworten qualifizieren Sie sich möglicherweise nicht für Medicaid. Die Berechtigungsregeln sind jedoch komplex - erwägen Sie trotzdem eine Bewerbung.",
      snapEligible:
        "Sie könnten sich für SNAP-Lebensmittelhilfe qualifizieren. Füllen Sie den vollständigen Antrag aus, um Ihre Berechtigung zu überprüfen.",
      snapNotEligible:
        "Basierend auf Ihren Antworten qualifizieren Sie sich möglicherweise nicht für SNAP. Die Berechtigungsregeln sind jedoch komplex - erwägen Sie trotzdem eine Bewerbung.",
      importantNote: "Wichtiger Hinweis",
      disclaimer:
        \"Dies ist nur eine vorläufige Bewertung. Die endgültige Berechtigung wird von Ihrer staatlichen Behörde nach Über
