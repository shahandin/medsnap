"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useImperativeHandle, forwardRef } from "react"
import { useTranslation } from "@/contexts/translation-context"

interface PersonalInfo {
  applyingFor: string
  firstName: string
  lastName: string
  dateOfBirth: string
  languagePreference: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  phone: string
  email: string
  citizenshipStatus: string
  socialSecurityNumber: string
}

interface PersonalInformationFormProps {
  personalInfo: PersonalInfo
  onUpdate: (personalInfo: PersonalInfo) => void
  onAddressValidation?: (isValidating: boolean, suggestion: any | null) => void
}

const LANGUAGE_OPTIONS = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish (Español)" },
  { value: "chinese_mandarin", label: "Chinese - Mandarin (中文)" },
  { value: "chinese_cantonese", label: "Chinese - Cantonese (粵語)" },
  { value: "vietnamese", label: "Vietnamese (Tiếng Việt)" },
  { value: "korean", label: "Korean (한국어)" },
  { value: "russian", label: "Russian (Русский)" },
  { value: "arabic", label: "Arabic (العربية)" },
  { value: "french", label: "French (Français)" },
  { value: "portuguese", label: "Portuguese (Português)" },
  { value: "tagalog", label: "Tagalog" },
  { value: "hindi", label: "Hindi (हिन्दी)" },
  { value: "urdu", label: "Urdu (اردو)" },
  { value: "bengali", label: "Bengali (বাংলা)" },
  { value: "punjabi", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { value: "gujarati", label: "Gujarati (ગુજરાતી)" },
  { value: "tamil", label: "Tamil (தமிழ்)" },
  { value: "telugu", label: "Telugu (తెలుగు)" },
  { value: "marathi", label: "Marathi (मराठी)" },
  { value: "japanese", label: "Japanese (日本語)" },
  { value: "thai", label: "Thai (ไทย)" },
  { value: "laotian", label: "Laotian (ລາວ)" },
  { value: "cambodian", label: "Cambodian (ខ្មែរ)" },
  { value: "burmese", label: "Burmese (မြန်မာ)" },
  { value: "nepali", label: "Nepali (नेपाली)" },
  { value: "somali", label: "Somali" },
  { value: "amharic", label: "Amharic (አማርኛ)" },
  { value: "tigrinya", label: "Tigrinya (ትግርኛ)" },
  { value: "oromo", label: "Oromo (Afaan Oromoo)" },
  { value: "swahili", label: "Swahili (Kiswahili)" },
  { value: "haitian_creole", label: "Haitian Creole (Kreyòl Ayisyen)" },
  { value: "italian", label: "Italian (Italiano)" },
  { value: "german", label: "German (Deutsch)" },
  { value: "polish", label: "Polish (Polski)" },
  { value: "ukrainian", label: "Ukrainian (Українська)" },
  { value: "romanian", label: "Romanian (Română)" },
  { value: "greek", label: "Greek (Ελληνικά)" },
  { value: "serbian", label: "Serbian (Српски)" },
  { value: "croatian", label: "Croatian (Hrvatski)" },
  { value: "bosnian", label: "Bosnian (Bosanski)" },
  { value: "albanian", label: "Albanian (Shqip)" },
  { value: "armenian", label: "Armenian (Հայերեն)" },
  { value: "persian", label: "Persian/Farsi (فارسی)" },
  { value: "pashto", label: "Pashto (پښتو)" },
  { value: "dari", label: "Dari (دری)" },
  { value: "turkish", label: "Turkish (Türkçe)" },
  { value: "kurdish", label: "Kurdish (Kurdî)" },
  { value: "hebrew", label: "Hebrew (עברית)" },
  { value: "dutch", label: "Dutch (Nederlands)" },
  { value: "swedish", label: "Swedish (Svenska)" },
  { value: "norwegian", label: "Norwegian (Norsk)" },
  { value: "danish", label: "Danish (Dansk)" },
  { value: "finnish", label: "Finnish (Suomi)" },
  { value: "hungarian", label: "Hungarian (Magyar)" },
  { value: "czech", label: "Czech (Čeština)" },
  { value: "slovak", label: "Slovak (Slovenčina)" },
  { value: "slovenian", label: "Slovenian (Slovenščina)" },
  { value: "lithuanian", label: "Lithuanian (Lietuvių)" },
  { value: "latvian", label: "Latvian (Latviešu)" },
  { value: "estonian", label: "Estonian (Eesti)" },
  { value: "maltese", label: "Maltese (Malti)" },
  { value: "irish", label: "Irish (Gaeilge)" },
  { value: "welsh", label: "Welsh (Cymraeg)" },
  { value: "scottish_gaelic", label: "Scottish Gaelic (Gàidhlig)" },
]

const CITIZENSHIP_OPTIONS = [
  { value: "us_citizen", label: "U.S. Citizen" },
  { value: "permanent_resident", label: "Permanent Resident" },
  { value: "refugee", label: "Refugee" },
  { value: "asylee", label: "Asylee" },
  { value: "other_qualified", label: "Other Qualified Alien" },
]

export const PersonalInformationForm = forwardRef<
  { validateAddress: () => Promise<{ isValid: boolean; suggestion: any | null }> },
  PersonalInformationFormProps
>(({ personalInfo, onUpdate, onAddressValidation }, ref) => {
  const updateField = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      const updatedData = {
        ...personalInfo,
        [parent]: {
          ...personalInfo[parent as keyof PersonalInfo],
          [child]: value,
        },
      }
      onUpdate(updatedData)
    } else {
      const updatedData = {
        ...personalInfo,
        [field]: value,
      }
      onUpdate(updatedData)
    }
  }

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length >= 9) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`
    } else if (digits.length >= 5) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
    } else if (digits.length >= 3) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`
    }
    return digits
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length >= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    } else if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    }
    return digits
  }

  const validateAddress = async () => {
    return { isValid: true, suggestion: null }
  }

  useImperativeHandle(
    ref,
    () => ({
      validateAddress,
    }),
    [],
  )

  const { t } = useTranslation()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <div className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-3 sm:mb-4 text-2xl sm:text-3xl flex items-center justify-center">
          👤
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">{t("forms.personalInfo.title")}</h3>
        <p className="text-sm sm:text-base text-gray-600">
          {t("forms.personalInfo.subtitle")}. All fields are required.
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Application Context */}
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="text-lg">👤</span>
              Application Context
            </CardTitle>
            <CardDescription className="text-sm">Help us understand who this application is for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-3">
              <Label className="text-sm sm:text-base font-medium">
                Are you applying on behalf of yourself or someone else? *
              </Label>
              <RadioGroup
                value={personalInfo.applyingFor}
                onValueChange={(value) => updateField("applyingFor", value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation min-h-[56px] sm:min-h-[auto]">
                  <RadioGroupItem value="myself" id="myself" className="w-6 h-6 sm:w-5 sm:h-5" />
                  <Label
                    htmlFor="myself"
                    className="font-normal cursor-pointer text-base sm:text-sm flex-1 leading-relaxed"
                  >
                    I am applying for myself
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation min-h-[56px] sm:min-h-[auto]">
                  <RadioGroupItem value="someone_else" id="someone_else" className="w-6 h-6 sm:w-5 sm:h-5" />
                  <Label
                    htmlFor="someone_else"
                    className="font-normal cursor-pointer text-base sm:text-sm flex-1 leading-relaxed"
                  >
                    I am applying on behalf of someone else
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-sm sm:text-xs text-gray-600 leading-relaxed">
                If you're applying for someone else, you'll need to provide their information in the following steps.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="text-lg">👤</span>
              Basic Information
            </CardTitle>
            <CardDescription className="text-sm">
              Your legal name, date of birth, and language preference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
              <div className="space-y-3 sm:space-y-2">
                <Label htmlFor="firstName" className="text-base sm:text-sm font-medium">
                  {t("forms.personalInfo.firstName")} *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={personalInfo.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  required
                  className="h-14 sm:h-10 text-lg sm:text-base touch-manipulation px-4 sm:px-3"
                />
              </div>
              <div className="space-y-3 sm:space-y-2">
                <Label htmlFor="lastName" className="text-base sm:text-sm font-medium">
                  {t("forms.personalInfo.lastName")} *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={personalInfo.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  required
                  className="h-14 sm:h-10 text-lg sm:text-base touch-manipulation px-4 sm:px-3"
                />
              </div>
            </div>
            <div className="space-y-3 sm:space-y-2">
              <Label htmlFor="dateOfBirth" className="text-base sm:text-sm font-medium">
                {t("forms.personalInfo.dateOfBirth")} *
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={personalInfo.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
                required
                className="h-14 sm:h-10 text-lg sm:text-base touch-manipulation px-4 sm:px-3"
              />
            </div>
            <div className="space-y-3 sm:space-y-2">
              <Label htmlFor="languagePreference" className="text-base sm:text-sm font-medium">
                Preferred Language *
              </Label>
              <Select
                value={personalInfo.languagePreference}
                onValueChange={(value) => updateField("languagePreference", value)}
              >
                <SelectTrigger className="h-14 sm:h-10 text-lg sm:text-base touch-manipulation px-4 sm:px-3">
                  <SelectValue placeholder="Select your preferred language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((language) => (
                    <SelectItem
                      key={language.value}
                      value={language.value}
                      className="py-4 sm:py-3 touch-manipulation text-base sm:text-sm min-h-[52px] sm:min-h-[auto]"
                    >
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm sm:text-xs text-gray-500 leading-relaxed">
                This helps us provide documents and assistance in your preferred language.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="text-lg">📍</span>
              Address Information
            </CardTitle>
            <CardDescription className="text-sm">Your current residential address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-4">
            <div className="space-y-3 sm:space-y-2">
              <Label htmlFor="street" className="text-base sm:text-sm font-medium">
                {t("forms.personalInfo.address")} *
              </Label>
              <Input
                id="street"
                type="text"
                value={personalInfo.address.street}
                onChange={(e) => updateField("address.street", e.target.value)}
                placeholder="Enter your street address"
                required
                className="h-14 sm:h-10 text-lg sm:text-base touch-manipulation px-4 sm:px-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-4">
              <div className="space-y-3 sm:space-y-2">
                <Label htmlFor="city" className="text-base sm:text-sm font-medium">
                  {t("forms.personalInfo.city")} *
                </Label>
                <Input
                  id="city"
                  type="text"
                  value={personalInfo.address.city}
                  onChange={(e) => updateField("address.city", e.target.value)}
                  placeholder="Enter your city"
                  required
                  className="h-14 sm:h-10 text-lg sm:text-base touch-manipulation px-4 sm:px-3"
                />
              </div>
              <div className="space-y-3 sm:space-y-2">
                <Label htmlFor="addressState" className="text-base sm:text-sm font-medium">
                  {t("forms.personalInfo.state")} *
                </Label>
                <Input
                  id="addressState"
                  type="text"
                  value={personalInfo.address.state}
                  onChange={(e) => updateField("address.state", e.target.value)}
                  placeholder="State"
                  disabled
                  className="bg-gray-50 h-14 sm:h-10 text-lg sm:text-base px-4 sm:px-3"
                />
              </div>
              <div className="space-y-3 sm:space-y-2">
                <Label htmlFor="zipCode" className="text-base sm:text-sm font-medium">
                  {t("forms.personalInfo.zipCode")} *
                </Label>
                <Input
                  id="zipCode"
                  type="text"
                  value={personalInfo.address.zipCode}
                  onChange={(e) => updateField("address.zipCode", e.target.value)}
                  placeholder="12345"
                  maxLength={10}
                  required
                  className="h-14 sm:h-10 text-lg sm:text-base touch-manipulation px-4 sm:px-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="text-lg">📞</span>
              Contact Information
            </CardTitle>
            <CardDescription className="text-sm">How we can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
              <div className="space-y-3 sm:space-y-2">
                <Label htmlFor="phone" className="text-base sm:text-sm font-medium">
                  {t("forms.personalInfo.phone")} *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => updateField("phone", formatPhone(e.target.value))}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                  required
                  className="h-14 sm:h-10 text-lg sm:text-base touch-manipulation px-4 sm:px-3"
                />
              </div>
              <div className="space-y-3 sm:space-y-2">
                <Label htmlFor="email" className="text-base sm:text-sm font-medium">
                  {t("forms.personalInfo.email")} *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="h-14 sm:h-10 text-lg sm:text-base touch-manipulation px-4 sm:px-3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Information */}
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="text-lg">🛡️</span>
              Legal Information
            </CardTitle>
            <CardDescription className="text-sm">Citizenship status and identification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-4">
            <div className="space-y-3 sm:space-y-2">
              <Label htmlFor="citizenshipStatus" className="text-base sm:text-sm font-medium">
                U.S. Citizenship Status *
              </Label>
              <Select
                value={personalInfo.citizenshipStatus}
                onValueChange={(value) => updateField("citizenshipStatus", value)}
              >
                <SelectTrigger className="h-14 sm:h-10 text-lg sm:text-base touch-manipulation px-4 sm:px-3">
                  <SelectValue placeholder="Select your citizenship status" />
                </SelectTrigger>
                <SelectContent>
                  {CITIZENSHIP_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="py-4 sm:py-3 touch-manipulation text-base sm:text-sm min-h-[52px] sm:min-h-[auto]"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 sm:space-y-2">
              <Label htmlFor="ssn" className="text-base sm:text-sm font-medium">
                {t("forms.personalInfo.ssn")} *
              </Label>
              <div className="flex items-center gap-4 sm:gap-3">
                <span className="text-gray-400 text-xl sm:text-lg">💳</span>
                <Input
                  id="ssn"
                  type="text"
                  value={personalInfo.socialSecurityNumber}
                  onChange={(e) => updateField("socialSecurityNumber", formatSSN(e.target.value))}
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                  required
                  className="h-14 sm:h-10 text-lg sm:text-base touch-manipulation flex-1 px-4 sm:px-3"
                />
              </div>
              <p className="text-sm sm:text-xs text-gray-500 leading-relaxed">
                Your SSN is required for benefit eligibility verification and will be kept secure.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

PersonalInformationForm.displayName = "PersonalInformationForm"
