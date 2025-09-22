"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Clock,
  CheckCircle,
  Calendar,
  Upload,
  Bell,
  LogOut,
  AlertTriangle,
  Users,
  DollarSign,
  Home,
  Shield,
  ArrowLeft,
  Send,
} from "lucide-react"
import { signOut } from "@/lib/actions"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useTranslation } from "@/contexts/translation-context"

interface AccountDashboardClientProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      full_name?: string
    }
    created_at?: string
  }
}

// Mock notifications data - would come from API in real implementation
const mockNotifications = [
  {
    id: 1,
    title: "Application Progress Saved",
    description:
      "Your benefits application has been automatically saved at step 4 of 9. You can continue where you left off at any time.",
    type: "info",
    timestamp: "2024-08-13T14:30:00Z",
    read: false,
  },
  {
    id: 2,
    title: "Document Required",
    description:
      "To complete your SNAP benefits application, please upload proof of income from the last 30 days. Acceptable documents include pay stubs, bank statements, or unemployment benefits statements.",
    type: "warning",
    timestamp: "2024-08-12T09:15:00Z",
    read: false,
  },
  {
    id: 3,
    title: "Application Submitted Successfully",
    description:
      "Your SNAP benefits application has been successfully submitted to the Illinois Department of Human Services. You should receive a confirmation letter within 5-7 business days. Your reference number is: IL-SNAP-2024-001234.",
    type: "success",
    timestamp: "2024-08-10T16:45:00Z",
    read: true,
  },
  {
    id: 4,
    title: "Eligibility Pre-Check Complete",
    description:
      "Based on the information provided, you appear to be eligible for SNAP benefits. Continue with your full application to receive an official determination.",
    type: "success",
    timestamp: "2024-08-09T11:20:00Z",
    read: true,
  },
]

const documentTypes = [
  {
    value: "proof-of-income",
    label: "Proof of Income",
    description: "Pay stubs, bank statements, or unemployment benefits statements.",
  },
  {
    value: "proof-of-address",
    label: "Proof of Address",
    description: "Utility bills, lease agreements, or official mail.",
  },
  {
    value: "identification",
    label: "Identification",
    description: "Driver's license, passport, or state ID.",
  },
  {
    value: "medical-records",
    label: "Medical Records",
    description: "Documents related to medical conditions or treatments.",
  },
  {
    value: "other",
    label: "Other",
    description: "Any other relevant documents.",
  },
]

const getApplicationStatus = (applicationProgress: any, submittedApplications: any[]) => {
  if (submittedApplications && submittedApplications.length > 0) {
    return "Submitted"
  }
  if (
    applicationProgress &&
    (Array.isArray(applicationProgress) ? applicationProgress.length > 0 : applicationProgress)
  ) {
    return "In Progress"
  }
  return "Not Started"
}

const getProgressPercentage = (applicationProgress: any) => {
  if (!applicationProgress) return 0

  const app = Array.isArray(applicationProgress) ? applicationProgress[0] : applicationProgress
  if (!app) return 0

  // Calculate progress based on current step and total steps (9 total steps)
  const totalSteps = 9
  const currentStep = app.current_step || 1
  return Math.round((currentStep / totalSteps) * 100)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Progress":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "Submitted":
      return "bg-green-100 text-green-800 border-green-300"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

const getStepTitle = (step: number) => {
  const stepTitles = {
    1: "Personal Information",
    2: "Household Information",
    3: "Income Details",
    4: "Assets Information",
    5: "Expenses",
    6: "Health Insurance",
    7: "Additional Information",
    8: "Review Application",
    9: "Submit Application",
  }
  return `Step ${step}: ${stepTitles[step as keyof typeof stepTitles] || "Application Step"}`
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "info":
      return <Bell className="w-5 h-5 text-blue-500" />
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    case "success":
      return <CheckCircle className="w-5 h-5 text-green-500" />
    default:
      return <Bell className="w-5 h-5 text-gray-500" />
  }
}

export default function AccountDashboardClient({ user }: AccountDashboardClientProps) {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const [applicationProgress, setApplicationProgress] = useState<any>(null)
  const [submittedApplications, setSubmittedApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "applications")
  const [activeChangeForm, setActiveChangeForm] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [selectedChangeCategory, setSelectedChangeCategory] = useState<string | null>(null)
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [documentHistory, setDocumentHistory] = useState<any[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [loading, setLoading] = useState(false)
  const [communicationPreference, setCommunicationPreference] = useState("email")
  const [mailingAddress, setMailingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  })
  const [languagePreference, setLanguagePreference] = useState("english")

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

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    const categoryParam = searchParams.get("category")
    const subtypeParam = searchParams.get("subtype")
    const prefillParam = searchParams.get("prefill")

    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }

    // Handle direct navigation to specific change categories
    if (tabParam === "report-changes" && categoryParam) {
      setSelectedChangeCategory(categoryParam)

      // Pre-fill form data if provided
      if (prefillParam) {
        try {
          const prefillData = JSON.parse(prefillParam)
          setFormData(prefillData)
        } catch (error) {
          console.error("Error parsing prefill data:", error)
        }
      }
    }
  }, [searchParams, activeTab])

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        console.log("[v0] No authenticated user, skipping data load")
        setIsLoading(false)
        return
      }

      try {
        console.log("[v0] Loading data for authenticated user:", user.email)
        const { loadAllUserApplications } = await import("@/lib/actions")
        const progressResult = await loadAllUserApplications()
        if (progressResult.data && progressResult.data.length > 0) {
          setApplicationProgress(progressResult.data)
        }

        // Load submitted applications
        const { getSubmittedApplications } = await import("@/lib/actions")
        const applicationsResult = await getSubmittedApplications()
        if (applicationsResult.data) {
          setSubmittedApplications(applicationsResult.data)
        }
      } catch (error) {
        console.error("[v0] Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  const loadDocumentHistory = async () => {
    if (!user) {
      console.log("[v0] No authenticated user, skipping document load")
      return
    }

    setLoadingDocuments(true)
    try {
      console.log("[v0] Loading documents for user:", user.email)
      const supabase = createClient()
      const { data, error } = await supabase.from("documents").select("*").order("uploaded_at", { ascending: false })

      if (error) throw error
      setDocumentHistory(data || [])
    } catch (error) {
      console.error("Error loading documents:", error)
    } finally {
      setLoadingDocuments(false)
    }
  }

  useEffect(() => {
    if (activeTab === "documents") {
      loadDocumentHistory()
    }
  }, [activeTab])

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Starting document upload process")
    console.log("[v0] Selected document type:", selectedDocumentType)
    console.log("[v0] Uploaded file:", uploadedFile)
    console.log("[v0] User:", user)

    if (!selectedDocumentType || !uploadedFile) {
      console.log("[v0] Missing required fields - document type or file")
      return
    }

    setIsUploading(true)
    try {
      console.log("[v0] Creating Supabase client")
      const supabase = createClient()

      console.log("[v0] Attempting to insert document record")
      const insertData = {
        user_id: user.id,
        document_type: selectedDocumentType,
        file_name: uploadedFile.name,
        file_size: uploadedFile.size,
        file_url: null, // No actual file storage for demo
      }
      console.log("[v0] Insert data:", insertData)

      const { data, error } = await supabase.from("documents").insert(insertData)

      console.log("[v0] Insert result - data:", data)
      console.log("[v0] Insert result - error:", error)

      if (error) {
        console.log("[v0] Database error details:", error)
        throw error
      }

      console.log("[v0] Document upload successful")
      setUploadSuccess(true)
      setSelectedDocumentType("")
      setUploadedFile(null)

      // Reload document history
      console.log("[v0] Reloading document history")
      await loadDocumentHistory()

      // Reset success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("[v0] Error uploading document:", error)
      alert("Failed to upload document. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setSubmitSuccess(true)
    setFormData({})

    // Reset success message after 3 seconds
    setTimeout(() => {
      setSubmitSuccess(false)
      setActiveChangeForm(null)
    }, 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const renderChangeForm = () => {
    if (!selectedChangeCategory) return null

    const categoryConfig = {
      "income-assets": {
        title: "Income & Asset Changes",
        icon: <DollarSign className="w-6 h-6 text-primary" />,
        changeTypes: [
          {
            value: "job-change",
            label: "Job Change or New Employment",
            description: "Started a new job, lost a job, or changed work hours",
          },
          {
            value: "income-change",
            label: "Income Increase or Decrease",
            description: "Significant changes in wages, benefits, or other income",
          },
          {
            value: "asset-change",
            label: "Asset Changes",
            description: "Changes in bank accounts, property, or other assets",
          },
        ],
      },
      household: {
        title: "Household Changes",
        icon: <Users className="w-6 h-6 text-secondary" />,
        changeTypes: [
          { value: "marriage", label: "Marriage or Divorce", description: "Changes in marital status" },
          {
            value: "add-member",
            label: "Add new household member",
            description: "Addition of children or other family members to your household",
          },
          { value: "death", label: "Death in Family", description: "Loss of a household member" },
          { value: "moved", label: "Someone Moved In or Out", description: "Changes in who lives in your household" },
        ],
      },
      address: {
        title: "Address & Residency Changes",
        icon: <Home className="w-6 h-6 text-primary" />,
        changeTypes: [
          {
            value: "address-change",
            label: "Address Change",
            description: "Moved to a new address within the same state",
          },
          { value: "out-of-state", label: "Out-of-State Move", description: "Relocated to a different state" },
        ],
      },
      insurance: {
        title: "Health Insurance Changes",
        icon: <Shield className="w-6 h-6 text-secondary" />,
        changeTypes: [
          {
            value: "job-insurance",
            label: "New Job-Based Insurance",
            description: "Gained health insurance through employment",
          },
          { value: "medicare", label: "Medicare Eligibility", description: "Became eligible for Medicare benefits" },
          {
            value: "lost-insurance",
            label: "Lost Insurance Coverage",
            description: "No longer have other health insurance",
          },
        ],
      },
    }

    const config = categoryConfig[selectedChangeCategory as keyof typeof categoryConfig]
    if (!config) return null

    return (
      <Card className="bg-white border-gray-200 rounded-2xl shadow-lg">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedChangeCategory(null)}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              {config.icon}
              <CardTitle className="text-xl font-heading">{config.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {submitSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Change Reported Successfully</h3>
              <p className="text-gray-600">
                Your change has been submitted and will be processed within 2-3 business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="changeType" className="text-sm font-medium text-gray-700">
                  What type of change are you reporting?
                </Label>
                <Select
                  value={formData.changeType || ""}
                  onValueChange={(value) => handleInputChange("changeType", value)}
                >
                  <SelectTrigger className="w-full border-gray-300 rounded-xl">
                    <SelectValue placeholder="Select the type of change" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.changeTypes.map((changeType) => (
                      <SelectItem key={changeType.value} value={changeType.value}>
                        <div className="py-1">
                          <div className="font-medium">{changeType.label}</div>
                          <div className="text-sm text-muted-foreground">{changeType.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedChangeCategory === "household" && formData.changeType === "add-member" && (
                <div className="space-y-2">
                  <Label htmlFor="relationship" className="text-sm font-medium text-gray-700">
                    Relationship to you
                  </Label>
                  <Select
                    value={formData.relationship || ""}
                    onValueChange={(value) => handleInputChange("relationship", value)}
                  >
                    <SelectTrigger className="w-full border-gray-300 rounded-xl">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Child">Child</SelectItem>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="changeDate" className="text-sm font-medium text-gray-700">
                  When did this change occur?
                </Label>
                <Input
                  id="changeDate"
                  type="date"
                  value={formData.changeDate || ""}
                  onChange={(e) => handleInputChange("changeDate", e.target.value)}
                  className="border-gray-300 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details" className="text-sm font-medium text-gray-700">
                  Please provide additional details about this change
                </Label>
                <Textarea
                  id="details"
                  placeholder="Describe the change and any relevant information..."
                  value={formData.details || ""}
                  onChange={(e) => handleInputChange("details", e.target.value)}
                  className="border-gray-300 rounded-xl"
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedChangeCategory(null)}
                  className="flex-1 border-gray-300 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Change
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-card/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  const status = getApplicationStatus(applicationProgress, submittedApplications)
  const progressPercentage = getProgressPercentage(applicationProgress)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("dashboard.title")}</h1>
                <p className="text-gray-600">
                  {t("dashboard.welcome")}, {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
                </p>
              </div>
              <form action={signOut}>
                <Button variant="outline" size="sm" type="submit" className="flex items-center gap-2 bg-transparent">
                  <LogOut className="w-4 h-4" />
                  {t("dashboard.settings.signOut")}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-0 z-10 bg-gray-50 pb-2 -mx-4 px-4">
            {/* Desktop Tab Navigation */}
            <div className="hidden md:block">
              <TabsList className="w-full h-auto p-1 bg-white shadow-sm border rounded-lg grid grid-cols-5">
                <TabsTrigger
                  value="applications"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
                >
                  <FileText className="w-4 h-4" />
                  {t("dashboard.tabs.applications")}
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
                >
                  <Bell className="w-4 h-4" />
                  {t("dashboard.tabs.notifications")}
                </TabsTrigger>
                <TabsTrigger
                  value="report-changes"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Report Changes
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
                >
                  <Upload className="w-4 h-4" />
                  {t("dashboard.tabs.documents")}
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
                >
                  <Users className="w-4 h-4" />
                  {t("dashboard.tabs.profile")}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile Tab Navigation - Dropdown Style */}
            <div className="md:hidden">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full bg-white border shadow-sm rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applications">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {t("dashboard.tabs.applications")}
                    </div>
                  </SelectItem>
                  <SelectItem value="notifications">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      {t("dashboard.tabs.notifications")}
                    </div>
                  </SelectItem>
                  <SelectItem value="report-changes">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Report Changes
                    </div>
                  </SelectItem>
                  <SelectItem value="documents">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {t("dashboard.tabs.documents")}
                    </div>
                  </SelectItem>
                  <SelectItem value="profile">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t("dashboard.tabs.profile")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="applications" className="space-y-6">
            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="flex items-center gap-3 text-2xl md:text-xl font-bold">
                  <FileText className="w-7 h-7 md:w-6 md:h-6 text-primary" />
                  {t("dashboard.applications.title")}
                </CardTitle>
                <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                  {t("dashboard.applications.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-0 px-6 md:px-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">{t("common.loading")}</p>
                  </div>
                ) : (
                  <>
                    {submittedApplications && submittedApplications.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {t("dashboard.applications.submittedApplications")}
                          </h3>
                        </div>
                        <div className="grid gap-4">
                          {submittedApplications.map((app, index) => (
                            <Card
                              key={`submitted-${index}`}
                              className="border border-green-200 bg-gradient-to-r from-green-50 to-white"
                            >
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                      {app.benefit_type
                                        ? app.benefit_type.charAt(0).toUpperCase() + app.benefit_type.slice(1)
                                        : "Benefits"}{" "}
                                      Application
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                      <span className="flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        {t("dashboard.applications.status.submitted")}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(app.submitted_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <Badge className="bg-green-100 text-green-800 border-green-300">
                                    {t("dashboard.applications.complete")}
                                  </Badge>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Status: {app.status || t("dashboard.applications.status.submitted")}
                                    </span>
                                    <span className="font-medium text-green-700">Application ID: {app.id}</span>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Submitted on:{" "}
                                    {new Date(app.submitted_at).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {applicationProgress && Array.isArray(applicationProgress) && applicationProgress.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {t("dashboard.applications.inProgressApplications")}
                          </h3>
                        </div>
                        <div className="grid gap-4">
                          {applicationProgress.map((app, index) => {
                            const appProgressPercentage = Math.round(((app.current_step || 1) / 9) * 100)
                            return (
                              <Card
                                key={index}
                                className="border border-gray-200 hover:border-primary/30 transition-colors duration-200 bg-gradient-to-r from-white to-gray-50/30"
                              >
                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                        {app.benefit_type
                                          ? app.benefit_type.charAt(0).toUpperCase() + app.benefit_type.slice(1)
                                          : "Benefits"}{" "}
                                        Application
                                      </h4>
                                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          Step {app.current_step || 1} of 9
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          {new Date(app.updated_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-primary mb-1">
                                        {appProgressPercentage}%
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {t("dashboard.applications.complete")}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="font-medium">{getStepTitle(app.current_step)}</span>
                                      </div>
                                      <Progress value={appProgressPercentage} className="h-2" />
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                      <div className="text-sm text-gray-600">
                                        {t("dashboard.applications.lastUpdated")}{" "}
                                        {new Date(app.updated_at).toLocaleDateString()}
                                      </div>
                                      <Button asChild size="sm" className="px-6">
                                        <Link href="/application">{t("dashboard.applications.continue")}</Link>
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {(!applicationProgress ||
                      !Array.isArray(applicationProgress) ||
                      applicationProgress.length === 0) &&
                      (!submittedApplications || submittedApplications.length === 0) && (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {t("dashboard.applications.noApplicationsTitle")}
                          </h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            {t("dashboard.applications.noApplicationsDescription")}
                          </p>
                          <Button asChild className="px-8">
                            <Link href="/application-choice">{t("dashboard.applications.startNewApplication")}</Link>
                          </Button>
                        </div>
                      )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="flex items-center gap-3 text-2xl md:text-xl font-bold">
                  <Bell className="w-7 h-7 md:w-6 md:h-6 text-primary" />
                  {t("dashboard.notifications.title")}
                </CardTitle>
                <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                  {t("dashboard.notifications.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {mockNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border ${
                    !notification.read ? "bg-blue-50 border-blue-200" : "bg-white"
                  }`}
                >
                  <CardContent className="p-6 md:p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-lg md:text-base font-semibold text-gray-900 mb-2 md:mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-base md:text-sm text-gray-600 leading-relaxed">
                              {notification.description}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                        <p className="text-sm md:text-xs text-gray-500 mt-3 md:mt-2">
                          {new Date(notification.timestamp).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="report-changes" className="space-y-6">
            {selectedChangeCategory ? (
              renderChangeForm()
            ) : (
              <>
                <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
                  <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                    <CardTitle className="flex items-center gap-3 text-2xl md:text-xl font-bold">
                      <AlertTriangle className="w-7 h-7 md:w-6 md:h-6 text-primary" />
                      {t("dashboard.reportChanges.title")}
                    </CardTitle>
                    <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                      {t("dashboard.reportChanges.description")}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/30 rounded-2xl md:rounded-xl"
                    onClick={() => setSelectedChangeCategory("income-assets")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {t("dashboard.reportChanges.categories.incomeAssets.title")}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {t("dashboard.reportChanges.categories.incomeAssets.description")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/30 rounded-2xl md:rounded-xl"
                    onClick={() => setSelectedChangeCategory("household")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Users className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {t("dashboard.reportChanges.categories.household.title")}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {t("dashboard.reportChanges.categories.household.description")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/30 rounded-2xl md:rounded-xl"
                    onClick={() => setSelectedChangeCategory("address")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Home className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {t("dashboard.reportChanges.categories.address.title")}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {t("dashboard.reportChanges.categories.address.description")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/30 rounded-2xl md:rounded-xl"
                    onClick={() => setSelectedChangeCategory("insurance")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Shield className="w-6 h-6 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {t("dashboard.reportChanges.categories.insurance.title")}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {t("dashboard.reportChanges.categories.insurance.description")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="flex items-center gap-3 text-2xl md:text-xl font-bold">
                  <Upload className="w-7 h-7 md:w-6 md:h-6 text-primary" />
                  {t("dashboard.documents.title")}
                </CardTitle>
                <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                  {t("dashboard.documents.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">{t("dashboard.documents.uploadNewDocument")}</CardTitle>
              </CardHeader>
              <CardContent>
                {uploadSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-green-800 font-medium">{t("dashboard.documents.uploadSuccess")}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleDocumentUpload} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="documentType" className="text-sm font-medium text-gray-700">
                      {t("dashboard.documents.documentType")}
                    </Label>
                    <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                      <SelectTrigger className="w-full border-gray-300 rounded-xl">
                        <SelectValue placeholder={t("dashboard.documents.selectDocumentType")} />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="py-1">
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file" className="text-sm font-medium text-gray-700">
                      {t("dashboard.documents.chooseFile")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                        className="border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
                      />
                    </div>
                    <p className="text-xs text-gray-500">{t("dashboard.documents.acceptedFormats")}</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={!selectedDocumentType || !uploadedFile || isUploading}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-3"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        {t("dashboard.documents.uploading")}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {t("dashboard.documents.uploadDocument")}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">{t("dashboard.documents.documentHistory")}</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDocuments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">{t("common.loading")}</p>
                  </div>
                ) : documentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">{t("dashboard.documents.noDocuments")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documentHistory.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.file_name}</p>
                            <p className="text-sm text-gray-600">
                              {doc.document_type} • {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">{(doc.file_size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="flex items-center gap-3 text-2xl md:text-xl font-bold">
                  <Users className="w-7 h-7 md:w-6 md:h-6 text-primary" />
                  {t("dashboard.profile.title")}
                </CardTitle>
                <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                  {t("dashboard.profile.description")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">{t("dashboard.profile.accountDetails")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t("dashboard.profile.emailAddress")}</Label>
                    <Input
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="border-gray-300 rounded-xl bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">{t("dashboard.profile.accountCreated")}</Label>
                    <Input
                      type="text"
                      value={user.created_at ? new Date(user.created_at).toLocaleDateString() : ""}
                      disabled
                      className="border-gray-300 rounded-xl bg-gray-50"
                    />
                  </div>
                </div>

                <Button variant="outline" className="border-gray-300 rounded-xl bg-transparent">
                  {t("dashboard.profile.resetPassword")}
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">
                  {t("dashboard.profile.communicationPreferences")}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {t("dashboard.profile.communicationDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {t("dashboard.profile.preferredContactMethod")}
                  </Label>
                  <Select value={communicationPreference} onValueChange={setCommunicationPreference}>
                    <SelectTrigger className="w-full border-gray-300 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="mail">Mail</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold">{t("dashboard.profile.languagePreferences")}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {t("dashboard.profile.languageDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {t("dashboard.profile.preferredLanguage")}
                  </Label>
                  <Select value={languagePreference} onValueChange={setLanguagePreference}>
                    <SelectTrigger className="w-full border-gray-300 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
