"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export const LANGUAGES = {
  en: {
    flag: "🇺🇸",
    name: "English",
    nativeName: "English",
  },
  es: {
    flag: "🇪🇸",
    name: "Spanish",
    nativeName: "Español",
  },
} as const

export type Language = keyof typeof LANGUAGES

// Translation data
export const translations = {
  en: {
    // Navigation
    nav: {
      home: "Home",
      application: "Application",
      account: "Account",
      signIn: "Sign In",
      signUp: "Sign Up",
      signOut: "Sign Out",
    },
    // Home page
    home: {
      title: "Access Your Benefits with Confidence",
      subtitle: "Streamlined applications for Medicaid and SNAP benefits",
      getStarted: "Get Started",
      learnMore: "Learn More",
      features: {
        simple: "Simple Process",
        simpleDesc: "Easy-to-follow application steps",
        secure: "Secure & Private",
        secureDesc: "Your information is protected",
        fast: "Fast Processing",
        fastDesc: "Quick application review",
      },
    },
    // Application
    application: {
      title: "Benefits Application",
      selectBenefits: "Select Benefits",
      personalInfo: "Personal Information",
      household: "Household Information",
      income: "Income & Employment",
      health: "Health & Disability",
      review: "Review & Submit",
      submit: "Submit Application",
      next: "Next",
      previous: "Previous",
      save: "Save Progress",
    },
    // Auth
    auth: {
      signIn: "Sign In",
      signUp: "Sign Up",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      forgotPassword: "Forgot Password?",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      callback: {
        completingSignIn: "Completing sign in...",
        redirecting: "Redirecting...",
      },
    },
    // Common
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
    },
  },
  es: {
    // Navigation
    nav: {
      home: "Inicio",
      application: "Aplicación",
      account: "Cuenta",
      signIn: "Iniciar Sesión",
      signUp: "Registrarse",
      signOut: "Cerrar Sesión",
    },
    // Home page
    home: {
      title: "Accede a Tus Beneficios con Confianza",
      subtitle: "Aplicaciones simplificadas para beneficios de Medicaid y SNAP",
      getStarted: "Comenzar",
      learnMore: "Saber Más",
      features: {
        simple: "Proceso Simple",
        simpleDesc: "Pasos de aplicación fáciles de seguir",
        secure: "Seguro y Privado",
        secureDesc: "Tu información está protegida",
        fast: "Procesamiento Rápido",
        fastDesc: "Revisión rápida de aplicación",
      },
    },
    // Application
    application: {
      title: "Aplicación de Beneficios",
      selectBenefits: "Seleccionar Beneficios",
      personalInfo: "Información Personal",
      household: "Información del Hogar",
      income: "Ingresos y Empleo",
      health: "Salud y Discapacidad",
      review: "Revisar y Enviar",
      submit: "Enviar Aplicación",
      next: "Siguiente",
      previous: "Anterior",
      save: "Guardar Progreso",
    },
    // Auth
    auth: {
      signIn: "Iniciar Sesión",
      signUp: "Registrarse",
      email: "Correo Electrónico",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      forgotPassword: "¿Olvidaste tu contraseña?",
      noAccount: "¿No tienes una cuenta?",
      hasAccount: "¿Ya tienes una cuenta?",
      callback: {
        completingSignIn: "Completando inicio de sesión...",
        redirecting: "Redirigiendo...",
      },
    },
    // Common
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      cancel: "Cancelar",
      save: "Guardar",
      edit: "Editar",
      delete: "Eliminar",
      confirm: "Confirmar",
      yes: "Sí",
      no: "No",
    },
  },
}

type TranslationKey = string

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Only access localStorage on client side
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "es")) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("language", language)
    }
  }, [language, isClient])

  const t = (key: TranslationKey): string => {
    const keys = key.split(".")
    let value: any = translations[language]

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        console.warn(`[v0] Translation not found for key: ${key} in language: ${language}`)
        return key
      }
    }

    return typeof value === "string" ? value : key
  }

  console.log("[v0] TranslationProvider rendering with language:", language)

  return <TranslationContext.Provider value={{ language, setLanguage, t }}>{children}</TranslationContext.Provider>
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
