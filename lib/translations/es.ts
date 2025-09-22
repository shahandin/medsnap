import type { TranslationData } from "./index"

export const es: TranslationData = {
  // Navigation
  nav: {
    about: "Acerca de",
    applyForBenefits: "Solicitar Beneficios",
    dashboard: "Panel de Control",
    signIn: "Iniciar Sesión",
    getStarted: "Comenzar",
    language: "Idioma",
  },

  // Homepage
  home: {
    trustedBy: "Confiado por miles en todo el país",
    heroTitle: "Accede a Tus Beneficios con",
    heroTitleHighlight: "Confianza",
    heroDescription:
      "Solicitudes simplificadas para beneficios de Medicaid y SNAP. Obtén el apoyo que necesitas con nuestra plataforma segura y fácil de usar diseñada para tu éxito.",
    applyForBenefits: "Solicitar Beneficios",
    learnMore: "Saber Más",
    whyChooseTitle: "¿Por Qué Elegir Benefit Bridge?",
    whyChooseDescription:
      "Hemos diseñado nuestra plataforma para hacer que solicitar beneficios sea lo más simple, seguro y libre de estrés posible.",

    // Feature cards
    features: {
      comprehensive: {
        title: "Plataforma Integral",
        description:
          "Una plataforma para todo: enviar solicitudes, subir documentación, reportar cambios de vida, responder a notificaciones, renovar beneficios y más.",
      },
      easyApplication: {
        title: "Solicitud Fácil",
        description:
          "Orientación paso a paso a través de todo el proceso de solicitud con instrucciones claras e intuitivas.",
      },
      securePrivate: {
        title: "Seguro y Privado",
        description:
          "Tu información personal está protegida con seguridad de nivel bancario, encriptación y controles de privacidad.",
      },
      aiEnabled: {
        title: "Habilitado con IA",
        description: "Asistente habilitado con IA que te guía a través de tu solicitud y responde todas tus preguntas.",
      },
    },

    // CTA section
    cta: {
      title: "¿Listo para Comenzar?",
      description:
        "Únete a miles de personas que han solicitado beneficios exitosamente a través de nuestra plataforma segura y fácil de usar. Tu viaje para acceder a beneficios comienza aquí.",
      startApplication: "Comenzar Tu Solicitud",
    },
  },

  // Authentication
  auth: {
    signIn: {
      title: "Bienvenido de vuelta",
      subtitle: "Inicia sesión en tu cuenta",
      email: "Correo Electrónico",
      password: "Contraseña",
      emailPlaceholder: "tu@ejemplo.com",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
      signingIn: "Iniciando sesión...",
      signInButton: "Iniciar Sesión",
      noAccount: "¿No tienes una cuenta?",
      signUpLink: "Regístrate",
    },
    signUp: {
      title: "Crea tu cuenta",
      email: "Dirección de Correo Electrónico",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      emailPlaceholder: "tu@ejemplo.com",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
      creatingAccount: "Creando cuenta...",
      createAccountButton: "Crear Cuenta",
      hasAccount: "¿Ya tienes una cuenta?",
      signInLink: "Iniciar sesión",
      passwordRequirements: {
        minLength: "Al menos 8 caracteres de longitud",
        hasNumber: "Contiene al menos un número",
        hasSpecialChar: 'Contiene al menos un carácter especial (!@#$%^&*(),.?":{}|<>)',
        passwordsMatch: "Las contraseñas coinciden",
      },
      successMessage: "¡Cuenta creada exitosamente! Por favor revisa tu correo electrónico para confirmar tu cuenta.",
    },
  },

  // Prescreening
  prescreening: {
    title: "Verificación de Elegibilidad para Beneficios",
    subtitle:
      "Responde algunas preguntas rápidas para ver si podrías calificar para beneficios de Medicaid y SNAP. Esto te ayudará a decidir qué solicitudes completar.",
    processingMessage: "Procesando tus respuestas...",
    questionProgress: "Pregunta {{current}} de {{total}}",
    complete: "Completo",
    questions: {
      income: {
        text: "¿Los ingresos mensuales de tu hogar son menos de $2,500?",
        help: "Incluye todos los ingresos de trabajos, beneficios y otras fuentes para todos en tu hogar.",
      },
      assets: {
        text: "¿Tienes menos de $2,000 en ahorros y activos?",
        help: "Incluye cuentas bancarias, inversiones y artículos valiosos (excluyendo tu hogar y un auto).",
      },
      citizenship: {
        text: "¿Eres ciudadano estadounidense o no ciudadano calificado?",
        help: "Los no ciudadanos calificados incluyen residentes permanentes y ciertos otros estatus migratorios.",
      },
      ageDisability: {
        text: "¿Tienes 65 años o más, estás embarazada o tienes una discapacidad?",
        help: "Esto ayuda a determinar la elegibilidad para ciertos programas de Medicaid.",
      },
      householdSize: {
        text: "¿Tienes 4 o menos personas en tu hogar?",
        help: "Cuenta a ti mismo, tu cónyuge (si estás casado) y cualquier dependiente que declares en impuestos.",
      },
      workRequirements: {
        text: "¿Trabajas al menos 20 horas por semana, o calificas para una exención?",
        help: "Las exenciones incluyen ser menor de 18, mayor de 50, embarazada, discapacitada o cuidar niños pequeños.",
      },
    },
    results: {
      title: "Tus Resultados de Elegibilidad",
      subtitle: "Basado en tus respuestas, aquí está tu elegibilidad potencial para beneficios",
      mayQualify: "Puede Calificar",
      mayNotQualify: "Puede No Calificar",
      medicaidEligible:
        "Puedes calificar para cobertura de salud Medicaid. Completa la solicitud completa para verificar tu elegibilidad.",
      medicaidNotEligible:
        "Basado en tus respuestas, puede que no califiques para Medicaid. Sin embargo, las reglas de elegibilidad son complejas - considera aplicar de todos modos.",
      snapEligible:
        "Puedes calificar para asistencia alimentaria SNAP. Completa la solicitud completa para verificar tu elegibilidad.",
      snapNotEligible:
        "Basado en tus respuestas, puede que no califiques para SNAP. Sin embargo, las reglas de elegibilidad son complejas - considera aplicar de todos modos.",
      importantNote: "Nota Importante",
      disclaimer:
        "Esta es solo una evaluación preliminar. La elegibilidad final es determinada por tu agencia estatal después de revisar tu solicitud completa y verificar tu información. Te animamos a aplicar incluso si la evaluación preliminar sugiere que puede que no califiques.",
      continueToApplications: "Continuar a las Solicitudes",
    },
  },

  // Application Choice
  applicationChoice: {
    title: "Tus Solicitudes",
    subtitle: "Elige cómo te gustaría proceder con tu solicitud de beneficios",
    startNew: {
      title: "Comenzar Nueva Solicitud",
      description: "Comienza una solicitud de beneficios nueva desde el principio",
      button: "Comenzar Nueva",
    },
    continueExisting: {
      title: "Continuar Existente",
      description: "Reanuda el trabajo en solicitudes que ya has comenzado",
      noApplications: "No hay solicitudes en progreso",
      noApplicationsButton: "No Hay Solicitudes para Continuar",
      lastSaved: "Guardado por última vez:",
      currentStep: "Paso actual:",
    },
    loading: "Cargando tus solicitudes...",
    medicaidApplication: "Solicitud de Medicaid",
    snapApplication: "Solicitud de SNAP",
    bothApplication: "Solicitud de Medicaid y SNAP",
    benefitsApplication: "Solicitud de Beneficios",
  },

  // Dashboard
  dashboard: {
    title: "Panel de Control de Cuenta",
    welcome: "Bienvenido de vuelta",
    tabs: {
      overview: "Resumen",
      applications: "Solicitudes",
      documents: "Documentos",
      notifications: "Notificaciones",
      profile: "Perfil",
      settings: "Configuración",
    },
    overview: {
      quickActions: "Acciones Rápidas",
      recentActivity: "Actividad Reciente",
      applicationStatus: "Estado de Solicitud",
      upcomingDeadlines: "Fechas Límite Próximas",
    },
    applications: {
      title: "Mis Solicitudes",
      status: {
        draft: "Borrador",
        submitted: "Enviada",
        underReview: "En Revisión",
        approved: "Aprobada",
        denied: "Denegada",
        needsInfo: "Necesita Información",
      },
      actions: {
        continue: "Continuar",
        view: "Ver",
        edit: "Editar",
        download: "Descargar",
      },
    },
    notifications: {
      title: "Notificaciones",
      markAllRead: "Marcar Todas como Leídas",
      noNotifications: "No hay notificaciones",
      types: {
        application: "Actualización de Solicitud",
        document: "Solicitud de Documento",
        deadline: "Recordatorio de Fecha Límite",
        system: "Notificación del Sistema",
      },
    },
    profile: {
      title: "Información del Perfil",
      personalInfo: "Información Personal",
      contactInfo: "Información de Contacto",
      emergencyContact: "Contacto de Emergencia",
      saveChanges: "Guardar Cambios",
      changesSaved: "Cambios guardados exitosamente",
    },
    settings: {
      title: "Configuración de Cuenta",
      language: "Preferencia de Idioma",
      notifications: "Preferencias de Notificación",
      privacy: "Configuración de Privacidad",
      security: "Configuración de Seguridad",
      signOut: "Cerrar Sesión",
    },
  },

  // Forms
  forms: {
    personalInfo: {
      title: "Información Personal",
      subtitle: "Por favor proporciona tu información personal básica",
      firstName: "Nombre",
      lastName: "Apellido",
      middleName: "Segundo Nombre",
      dateOfBirth: "Fecha de Nacimiento",
      ssn: "Número de Seguro Social",
      phone: "Número de Teléfono",
      email: "Dirección de Correo Electrónico",
      address: "Dirección",
      city: "Ciudad",
      state: "Estado",
      zipCode: "Código Postal",
      county: "Condado",
      required: "Requerido",
      optional: "Opcional",
    },
    household: {
      title: "Información del Hogar",
      subtitle: "Cuéntanos sobre las personas en tu hogar",
      householdSize: "Tamaño del Hogar",
      addMember: "Agregar Miembro del Hogar",
      removeMember: "Remover Miembro",
      relationship: "Relación",
      relationships: {
        spouse: "Cónyuge",
        child: "Hijo/a",
        parent: "Padre/Madre",
        sibling: "Hermano/a",
        other: "Otro",
      },
    },
    income: {
      title: "Información de Ingresos",
      subtitle: "Por favor proporciona información sobre todas las fuentes de ingresos",
      employmentStatus: "Estado de Empleo",
      employer: "Empleador",
      jobTitle: "Título del Trabajo",
      monthlyIncome: "Ingresos Mensuales",
      hourlyWage: "Salario por Hora",
      hoursPerWeek: "Horas por Semana",
      addIncomeSource: "Agregar Fuente de Ingresos",
      removeIncomeSource: "Remover Fuente de Ingresos",
      incomeTypes: {
        employment: "Empleo",
        selfEmployment: "Trabajo por Cuenta Propia",
        unemployment: "Beneficios de Desempleo",
        socialSecurity: "Seguro Social",
        disability: "Beneficios por Discapacidad",
        pension: "Pensión",
        other: "Otro",
      },
    },
    assets: {
      title: "Información de Activos",
      subtitle:
        "Por favor proporciona información sobre los activos que posees tú o los miembros de tu hogar. Esto incluye cuentas financieras, vehículos y pólizas de seguro de vida.",
      currentAssets: "Activos Actuales",
      addNewAsset: "Agregar Nuevo Activo",
      addFinancialAsset: "Agregar Activo Financiero",
      addVehicle: "Agregar Vehículo",
      addLifeInsurance: "Agregar Seguro de Vida",
      assetOwner: "Propietario del Activo",
      accountType: "Tipo de Cuenta",
      bankName: "Nombre del Banco/Institución",
      currentBalance: "Saldo Actual",
      vehicleType: "Tipo de Vehículo",
      make: "Marca",
      model: "Modelo",
      year: "Año",
      estimatedValue: "Valor Actual Estimado",
      policyType: "Tipo de Póliza",
      insuranceCompany: "Compañía de Seguros",
      faceValue: "Valor Nominal (Beneficio por Muerte)",
      cashValue: "Valor en Efectivo",
      noAssetsMessage:
        "No se han agregado activos aún. Haz clic en los botones de arriba para agregar tu primer activo.",
      noAssetsNote: "Si no tienes activos que reportar, puedes proceder a la siguiente sección.",
      financialAsset: "Activo Financiero",
      vehicle: "Vehículo",
      lifeInsurancePolicy: "Póliza de Seguro de Vida",
    },
    health: {
      title: "Información de Salud y Discapacidad",
      subtitle: "Por favor proporciona información sobre el seguro de salud y cualquier discapacidad",
      hasInsurance: "¿Tienes seguro de salud?",
      insuranceType: "Tipo de Seguro",
      hasDisability: "¿Tienes una discapacidad?",
      disabilityType: "Tipo de Discapacidad",
      needsAssistance: "¿Necesitas asistencia con actividades diarias?",
    },
    review: {
      title: "Revisar y Enviar",
      subtitle: "Por favor revisa tu solicitud antes de enviarla",
      sections: {
        personalInfo: "Información Personal",
        household: "Información del Hogar",
        income: "Información de Ingresos",
        assets: "Información de Activos",
        health: "Salud y Discapacidad",
      },
      edit: "Editar",
      submit: "Enviar Solicitud",
      submitting: "Enviando...",
      confirmation: "¡Solicitud enviada exitosamente!",
    },
  },

  // About Page
  about: {
    hero: {
      title: "Acerca de Acceso a Beneficios",
      subtitle:
        "Estamos dedicados a simplificar el proceso de solicitud de beneficios y ayudar a las personas a acceder al apoyo que necesitan con dignidad y facilidad.",
    },
    mission: {
      title: "Nuestra Misión",
      subtitle:
        "Crear una experiencia más accesible y fácil de usar para solicitar programas esenciales de beneficios gubernamentales.",
      bridgingGap: {
        title: "Cerrando la Brecha",
        description1:
          "Las solicitudes tradicionales de beneficios gubernamentales pueden ser complejas, consumir mucho tiempo y ser difíciles de navegar. Hemos rediseñado la experiencia desde cero, enfocándonos en la claridad, accesibilidad y empoderamiento del usuario.",
        description2:
          "Nuestra plataforma guía a los usuarios a través de cada paso del proceso de solicitud con instrucciones claras, recursos útiles y guardado automático del progreso, asegurando que nadie se quede atrás.",
      },
      peopleFirst: {
        title: "Enfoque Centrado en las Personas",
        description:
          "Cada decisión de diseño se toma pensando en las personas reales y sus necesidades, asegurando dignidad y respeto durante todo el proceso.",
      },
    },
    services: {
      title: "Lo Que Proporcionamos",
      subtitle:
        "Nuestra plataforma ofrece apoyo integral para acceder a programas esenciales de beneficios gubernamentales.",
      medicaid: {
        title: "Solicitudes de Medicaid",
        description:
          "Solicitudes simplificadas para cobertura de seguro de salud Medicaid, incluyendo evaluación de elegibilidad y orientación de documentos.",
      },
      snap: {
        title: "Beneficios SNAP",
        description:
          "Solicitudes fáciles de completar para beneficios SNAP (asistencia alimentaria) con gestión del hogar y apoyo de verificación de ingresos.",
      },
      secure: {
        title: "Procesamiento Seguro",
        description:
          "Seguridad de nivel bancario y encriptación protegen tu información personal durante todo el proceso de solicitud.",
      },
      tracking: {
        title: "Seguimiento del Progreso",
        description:
          "El guardado automático del progreso te permite completar solicitudes a tu propio ritmo sin perder información.",
      },
      support: {
        title: "Apoyo Experto",
        description:
          "Acceso a personal de apoyo conocedor y recursos integrales para ayudarte a través de cualquier desafío.",
      },
      management: {
        title: "Gestión de Solicitudes",
        description:
          "Rastrea el estado de tu solicitud, sube documentos adicionales y gestiona tus beneficios todo en un lugar.",
      },
    },
    howItWorks: {
      title: "Cómo Funciona",
      subtitle: "Nuestro proceso simplificado hace que solicitar beneficios sea simple y directo.",
      step1: {
        title: "Crear Cuenta",
        description:
          "Regístrate con tu dirección de correo electrónico y crea una cuenta segura para comenzar con tu solicitud.",
      },
      step2: {
        title: "Completar Solicitud",
        description:
          "Sigue nuestra guía paso a paso para completar tu solicitud. Tu progreso se guarda automáticamente.",
      },
      step3: {
        title: "Rastrear y Gestionar",
        description:
          "Monitorea el estado de tu solicitud y sube cualquier documento adicional a través del panel de tu cuenta.",
      },
    },
    cta: {
      title: "¿Listo para Comenzar?",
      subtitle:
        "Da el primer paso hacia acceder a los beneficios que necesitas. Nuestra plataforma está aquí para guiarte en cada paso del camino.",
      startApplication: "Comenzar Tu Solicitud",
      contactSupport: "Contactar Soporte",
    },
  },

  // Common
  common: {
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    save: "Guardar",
    continue: "Continuar",
    back: "Atrás",
    next: "Siguiente",
    submit: "Enviar",
    close: "Cerrar",
    edit: "Editar",
    delete: "Eliminar",
    remove: "Remover",
    add: "Agregar",
    yes: "Sí",
    no: "No",
    optional: "Opcional",
    required: "Requerido",
    selectOption: "Selecciona una opción",
    pleaseSelect: "Por favor selecciona",
    tryAgain: "Intentar de Nuevo",
    retry: "Reintentar",
    previous: "Anterior",
    complete: "Completar",
  },

  aiChat: {
    title: "Asistente de Beneficios",
    welcomeMessage:
      "¡Hola! Soy tu asistente de beneficios. Puedo ayudarte a navegar la solicitud, responder preguntas sobre documentos requeridos y guiarte a través del proceso. ¿En qué puedo ayudarte?",
    errorMessage: "Lo siento, no pude procesar esa solicitud. Por favor intenta de nuevo.",
    technicalError: "Estoy experimentando algunas dificultades técnicas. Por favor intenta de nuevo en un momento.",
    placeholder: "Pregúntame cualquier cosa sobre beneficios...",
    askAbout: "Preguntar sobre",
    helpWith: "Ayuda con",
  },

  benefits: {
    medicaid: "Medicaid",
    snap: "SNAP",
  },

  success: {
    title: "¡Solicitud Enviada Exitosamente!",
    subtitle: "Tu solicitud de beneficios ha sido enviada y ahora está siendo procesada.",
    signInWarning:
      "Tu solicitud fue enviada exitosamente, pero puede que necesites iniciar sesión de nuevo para acceder al panel de tu cuenta.",
    applicationDetails: "Detalles de la Solicitud",
    referenceNumber: "Número de Referencia",
    submissionDate: "Fecha de Envío",
    saveReferenceNote:
      "Por favor guarda tu número de referencia para tus registros. Lo necesitarás para verificar el estado de tu solicitud.",
    whatHappensNext: {
      title: "¿Qué Sigue?",
      subtitle: "Esto es lo que puedes esperar durante el proceso de solicitud",
      step1: {
        title: "Correo de Confirmación (Dentro de 24 horas)",
        description: "Recibirás un correo de confirmación con tu número de referencia y próximos pasos.",
      },
      step2: {
        title: "Revisión de Solicitud (7-30 días)",
        description: "Tu agencia estatal revisará tu solicitud y puede solicitar documentación adicional.",
      },
      step3: {
        title: "Notificación de Decisión",
        description: "Serás notificado de la decisión por correo y email, junto con información sobre tus beneficios.",
      },
    },
    importantInfo: {
      title: "Información Importante",
      checkEmail: {
        title: "Revisa Tu Correo",
        description:
          "Asegúrate de revisar tu correo regularmente, incluyendo carpetas de spam, para actualizaciones sobre tu solicitud.",
      },
      keepContactUpdated: {
        title: "Mantén Tu Información de Contacto Actualizada",
        description:
          "Notifica a tu agencia estatal inmediatamente si tu dirección, número de teléfono o correo cambia.",
      },
      prepareDocuments: {
        title: "Prepara Documentos Adicionales",
        description:
          "Puede que te pidan proporcionar documentación adicional como talones de pago, estados de cuenta bancarios o registros médicos.",
      },
    },
    quickActions: {
      title: "Acciones Rápidas",
      subtitle: "Cosas que puedes hacer mientras esperas que tu solicitud sea procesada",
      viewStatus: {
        title: "Ver Estado de Solicitud",
        description: "Revisa el panel de tu cuenta",
        signInRequired: "Inicia sesión para acceder al panel",
      },
      downloadCopy: {
        title: "Descargar Copia de Solicitud",
        comingSoon: "Próximamente",
      },
      uploadDocuments: {
        title: "Subir Documentos",
        comingSoon: "Próximamente",
      },
      learnBenefits: {
        title: "Aprender Sobre Beneficios",
        description: "Obtener más información",
        signInRequired: "Inicia sesión para acceder a más funciones",
      },
    },
    needHelp: {
      title: "¿Necesitas Ayuda?",
      subtitle: "Si tienes preguntas sobre tu solicitud o necesitas asistencia, aquí están tus opciones:",
      generalSupport: {
        title: "Soporte General",
        description: "Para preguntas sobre el proceso de solicitud",
        button: "Contactar Soporte",
      },
      stateAgency: {
        title: "Agencia Estatal",
        description: "Para preguntas específicas sobre tus beneficios",
        button: "Encontrar Contacto Estatal",
      },
    },
    goToDashboard: "Ir al Panel de Cuenta",
    signInToDashboard: "Iniciar Sesión para Acceder al Panel",
  },
}
