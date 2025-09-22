"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/contexts/translation-context"

export function StartApplicationButton() {
  const { t } = useTranslation()

  const handleStartApplication = async () => {
    try {
      const response = await fetch("/api/prescreening")
      const result = await response.json()

      if (result.completed) {
        window.location.href = "/application-choice"
      } else {
        window.location.href = "/prescreening"
      }
    } catch (error) {
      console.error("Error checking prescreening status:", error)
      window.location.href = "/prescreening"
    }
  }

  return (
    <Button
      size="lg"
      className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-xl px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group mx-4"
      onClick={handleStartApplication}
    >
      <span className="flex items-center justify-center gap-3">
        {t("buttons.startApplication")}
        <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
      </span>
    </Button>
  )
}
