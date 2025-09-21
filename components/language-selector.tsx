"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/contexts/translation-context"
import { LANGUAGES, type Language } from "@/lib/translations"
import { ChevronDown, Globe } from "lucide-react"

export function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation()

  useEffect(() => {
    console.log("[v0] LanguageSelector mounted")
    console.log("[v0] Current language:", language)
    console.log("[v0] Available languages:", LANGUAGES)
    console.log("[v0] setLanguage function:", typeof setLanguage)
  }, [])

  useEffect(() => {
    console.log("[v0] Language changed to:", language)
  }, [language])

  const currentLanguage = LANGUAGES[language]

  const handleLanguageChange = (code: Language) => {
    console.log("[v0] Language dropdown item clicked:", code)
    console.log("[v0] Current language before change:", language)
    console.log("[v0] About to call setLanguage with:", code)

    try {
      setLanguage(code)
      console.log("[v0] setLanguage called successfully")
    } catch (error) {
      console.error("[v0] Error calling setLanguage:", error)
    }
  }

  const handleTriggerClick = () => {
    console.log("[v0] Language selector trigger clicked")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg px-3 py-2 font-medium transition-all duration-200 text-sm"
          onClick={handleTriggerClick}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(LANGUAGES).map(([code, lang]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code as Language)}
            className={`flex items-center gap-3 cursor-pointer ${
              language === code ? "bg-primary/10 text-primary" : ""
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">{lang.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
