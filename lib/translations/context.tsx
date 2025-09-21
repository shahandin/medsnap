"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "es"

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

// Translation data - this will be expanded as we add more content
const translations = {
  en: {
    // Navigation
    "nav.about": "About",
    "nav.apply": "Apply for Benefits",
    "nav.dashboard": "Dashboard",
    "nav.signin": "Sign In",
    "nav.getStarted": "Get Started",

    // Homepage
    "home.badge": "Trusted by thousands nationwide",
    "home.title": "Access Your Benefits with",
    "home.titleHighlight": "Confidence",
    "home.subtitle":
      "Streamlined applications for Medicaid and SNAP benefits. Get the support you need with our secure, easy-to-use platform designed for your success.",
    "home.applyButton": "Apply for Benefits",
    "home.learnMore": "Learn More",

    // Features section
    "features.title": "Why Choose Benefit Bridge?",
    "features.subtitle":
      "We've designed our platform to make applying for benefits as simple, secure, and stress-free as possible.",
    "features.comprehensive.title": "Comprehensive Platform",
    "features.comprehensive.description":
      "One platform for everything: submit applications, upload documentation, report life changes, respond to notifications, renew benefits, and more.",
    "features.easy.title": "Easy Application",
    "features.easy.description":
      "Step-by-step guidance through the entire application process with clear, intuitive instructions.",
    "features.secure.title": "Secure & Private",
    "features.secure.description":
      "Your personal information is protected with bank-level security, encryption, and privacy controls.",
    "features.ai.title": "AI Enabled",
    "features.ai.description":
      "AI enabled assistant that guides you through your application and answers all of your questions.",

    // CTA section
    "cta.title": "Ready to Get Started?",
    "cta.subtitle":
      "Join thousands of people who have successfully applied for benefits through our secure, user-friendly platform. Your journey to accessing benefits starts here.",
    "cta.button": "Start Your Application",

    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
  },
  es: {
    // Navigation
    "nav.about": "Acerca de",
    "nav.apply": "Solicitar Beneficios",
    "nav.dashboard": "Panel de Control",
    "nav.signin": "Iniciar Sesión",
    "nav.getStarted": "Comenzar",

    // Homepage
    "home.badge": "Confiado por miles en todo el país",
    "home.title": "Accede a Tus Beneficios con",
    "home.titleHighlight": "Confianza",
    "home.subtitle":
      "Solicitudes simplificadas para beneficios de Medicaid y SNAP. Obtén el apoyo que necesitas con nuestra plataforma segura y fácil de usar diseñada para tu éxito.",
    "home.applyButton": "Solicitar Beneficios",
    "home.learnMore": "Saber Más",

    // Features section
    "features.title": "¿Por Qué Elegir Benefit Bridge?",
    "features.subtitle":
      "Hemos diseñado nuestra plataforma para hacer que solicitar beneficios sea lo más simple, seguro y sin estrés posible.",
    "features.comprehensive.title": "Plataforma Integral",
    "features.comprehensive.description":
      "Una plataforma para todo: enviar solicitudes, subir documentación, reportar cambios de vida, responder a notificaciones, renovar beneficios y más.",
    "features.easy.title": "Solicitud Fácil",
    "features.easy.description":
      "Orientación paso a paso a través de todo el proceso de solicitud con instrucciones claras e intuitivas.",
    "features.secure.title": "Seguro y Privado",
    "features.secure.description":
      "Tu información personal está protegida con seguridad de nivel bancario, encriptación y controles de privacidad.",
    "features.ai.title": "Habilitado con IA",
    "features.ai.description":
      "Asistente habilitado con IA que te guía a través de tu solicitud y responde todas tus preguntas.",

    // CTA section
    "cta.title": "¿Listo para Comenzar?",
    "cta.subtitle":
      "Únete a miles de personas que han solicitado beneficios exitosamente a través de nuestra plataforma segura y fácil de usar. Tu viaje para acceder a beneficios comienza aquí.",
    "cta.button": "Comenzar Tu Solicitud",

    // Common
    "common.loading": "Cargando...",
    "common.error": "Ocurrió un error",
    "common.success": "Éxito",
  },
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "es")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference when it changes
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("preferred-language", lang)
  }

  // Translation function with parameter substitution
  const t = (key: string, params?: Record<string, string>): string => {
    const translation = translations[language][key as keyof (typeof translations)[typeof language]] || key

    if (params) {
      return Object.entries(params).reduce((text, [param, value]) => {
        return text.replace(new RegExp(`{{${param}}}`, "g"), value)
      }, translation)
    }

    return translation
  }

  return (
    <TranslationContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
