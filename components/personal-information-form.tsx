"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { User, MapPin, Phone, Shield, CreditCard, Check, ChevronDown, Search } from "lucide-react"
import { useState, useImperativeHandle, forwardRef } from "react"

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

  const [languageOpen, setLanguageOpen] = useState(false)
  const [languageSearch, setLanguageSearch] = useState("")

  const filteredLanguages = LANGUAGE_OPTIONS.filter((language) =>
    language.label.toLowerCase().includes(languageSearch.toLowerCase()),
  )

  const selectedLanguage = LANGUAGE_OPTIONS.find((lang) => lang.value === personalInfo.languagePreference)

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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
        <p className="text-gray-600">Please provide your basic personal information. All fields are required.</p>
      </div>

      <div className="space-y-6">
        {/* Application Context */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Application Context
            </CardTitle>
            <CardDescription>Help us understand who this application is for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">Are you applying on behalf of yourself or someone else? *</Label>
              <RadioGroup
                value={personalInfo.applyingFor}
                onValueChange={(value) => updateField("applyingFor", value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="myself" id="myself" />
                  <Label htmlFor="myself" className="font-normal cursor-pointer">
                    I am applying for myself
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="someone_else" id="someone_else" />
                  <Label htmlFor="someone_else" className="font-normal cursor-pointer">
                    I am applying on behalf of someone else
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-gray-600">
                If you're applying for someone else, you'll need to provide their information in the following steps.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Your legal name, date of birth, and language preference</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={personalInfo.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={personalInfo.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={personalInfo.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="languagePreference">Preferred Language *</Label>
              <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={languageOpen}
                    className="w-full justify-between bg-transparent"
                  >
                    {selectedLanguage ? selectedLanguage.label : "Select your preferred language"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                  <div className="p-2">
                    <div className="flex items-center border rounded-md px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        placeholder="Search languages..."
                        value={languageSearch}
                        onChange={(e) => setLanguageSearch(e.target.value)}
                        className="border-0 p-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-auto">
                    {filteredLanguages.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">No languages found.</div>
                    ) : (
                      filteredLanguages.map((language) => (
                        <div
                          key={language.value}
                          className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                          onClick={() => {
                            updateField("languagePreference", language.value)
                            setLanguageOpen(false)
                            setLanguageSearch("")
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              personalInfo.languagePreference === language.value ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {language.label}
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-500">
                This helps us provide documents and assistance in your preferred language.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5" />
              Address Information
            </CardTitle>
            <CardDescription>Your current residential address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                type="text"
                value={personalInfo.address.street}
                onChange={(e) => updateField("address.street", e.target.value)}
                placeholder="Enter your street address"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  type="text"
                  value={personalInfo.address.city}
                  onChange={(e) => updateField("address.city", e.target.value)}
                  placeholder="Enter your city"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressState">State *</Label>
                <Input
                  id="addressState"
                  type="text"
                  value={personalInfo.address.state}
                  onChange={(e) => updateField("address.state", e.target.value)}
                  placeholder="State"
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  type="text"
                  value={personalInfo.address.zipCode}
                  onChange={(e) => updateField("address.zipCode", e.target.value)}
                  placeholder="12345"
                  maxLength={10}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
            <CardDescription>How we can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => updateField("phone", formatPhone(e.target.value))}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5" />
              Legal Information
            </CardTitle>
            <CardDescription>Citizenship status and identification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="citizenshipStatus">U.S. Citizenship Status *</Label>
              <Select
                value={personalInfo.citizenshipStatus}
                onValueChange={(value) => updateField("citizenshipStatus", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your citizenship status" />
                </SelectTrigger>
                <SelectContent>
                  {CITIZENSHIP_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ssn">Social Security Number *</Label>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <Input
                  id="ssn"
                  type="text"
                  value={personalInfo.socialSecurityNumber}
                  onChange={(e) => updateField("socialSecurityNumber", formatSSN(e.target.value))}
                  placeholder="XXX-XX-XXXX"
                  maxLength={11}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
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
