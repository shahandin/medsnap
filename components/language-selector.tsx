"use client"

import { useTranslation } from "@/lib/translations/context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const languages = [
  { code: "en" as const, name: "English", flag: "🇺🇸" },
  { code: "es" as const, name: "Español", flag: "🇪🇸" },
]

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation()

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0]

  return (
    <DropdownMenu onOpenChange={(open) => console.log("[v0] Dropdown open state:", open)}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg px-3 py-2 font-medium transition-all duration-200 text-sm"
          onClick={() => console.log("[v0] Language button clicked")}
        >
          <span className="mr-2">{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 z-[9999] bg-white border border-gray-200 shadow-lg"
        style={{ backgroundColor: "white", border: "2px solid red" }}
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              console.log("[v0] Language selected:", lang.code)
              setLanguage(lang.code)
            }}
            className={`cursor-pointer ${language === lang.code ? "bg-primary/10 text-primary" : ""}`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
