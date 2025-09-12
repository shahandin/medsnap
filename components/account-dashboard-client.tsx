"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  TrendingUp,
  ArrowLeft,
  Send,
  Menu,
} from "lucide-react"
import { signOut } from "@/lib/actions"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

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
  const [applicationProgress, setApplicationProgress] = useState<any>(null)
  const [submittedApplications, setSubmittedApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "overview"
  const [activeTab, setActiveTab] = useState(defaultTab)

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

  const documentTypes = [
    {
      value: "proof-of-income",
      label: "Proof of Income",
      description: "Pay stubs, employment letters, benefit statements",
    },
    { value: "proof-of-identity", label: "Proof of Identity", description: "Driver's license, state ID, passport" },
    {
      value: "proof-of-residency",
      label: "Proof of Residency",
      description: "Utility bills, lease agreement, mortgage statement",
    },
    {
      value: "social-security-card",
      label: "Social Security Card",
      description: "Social Security card or verification letter",
    },
    { value: "birth-certificate", label: "Birth Certificate", description: "Official birth certificate" },
    {
      value: "medical-records",
      label: "Medical Records",
      description: "Medical documentation, disability verification",
    },
    { value: "bank-statements", label: "Bank Statements", description: "Recent bank account statements" },
    { value: "tax-documents", label: "Tax Documents", description: "Tax returns, W-2 forms, 1099 forms" },
    { value: "other", label: "Other", description: "Any other supporting documentation" },
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
          <p className="text-xl text-muted-foreground">Loading your dashboard...</p>
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back, {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
                </p>
              </div>
              <form action={signOut}>
                <Button variant="outline" size="sm" type="submit" className="flex items-center gap-2 bg-transparent">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-0 z-10 bg-gray-50 pb-2 -mx-4 px-4">
            {/* Desktop Tab Navigation */}
            <div className="hidden md:block">
              <TabsList className="w-full h-auto p-1 bg-white shadow-sm border rounded-lg grid grid-cols-6">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
                >
                  <TrendingUp className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
                >
                  <FileText className="w-4 h-4" />
                  Applications
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
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
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
                >
                  <Users className="w-4 h-4" />
                  Profile
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile Tab Navigation - Dropdown Style */}
            <div className="md:hidden">
              <Select
                value={activeTab}
                onValueChange={(value) => {
                  console.log("[v0] Mobile dropdown selection:", value)
                  setActiveTab(value)
                }}
              >
                <SelectTrigger className="w-full h-14 bg-white shadow-sm border rounded-xl px-4 text-base font-medium">
                  <div className="flex items-center gap-3">
                    <Menu className="w-5 h-5 text-gray-500" />
                    <span>
                      {activeTab === "overview" && "Overview"}
                      {activeTab === "applications" && "Applications"}
                      {activeTab === "notifications" && "Notifications"}
                      {activeTab === "report-changes" && "Report Changes"}
                      {activeTab === "documents" && "Documents"}
                      {activeTab === "profile" && "Profile"}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="w-full z-50">
                  <SelectItem value="overview" className="h-14 px-4 cursor-pointer touch-manipulation">
                    <div className="flex items-center gap-3 w-full py-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-base">Overview</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="applications" className="h-14 px-4 cursor-pointer touch-manipulation">
                    <div className="flex items-center gap-3 w-full py-2">
                      <FileText className="w-5 h-5" />
                      <span className="text-base">Applications</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="notifications" className="h-14 px-4 cursor-pointer touch-manipulation">
                    <div className="flex items-center gap-3 w-full py-2">
                      <Bell className="w-5 h-5" />
                      <span className="text-base">Notifications</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="report-changes" className="h-14 px-4 cursor-pointer touch-manipulation">
                    <div className="flex items-center gap-3 w-full py-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-base">Report Changes</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="documents" className="h-14 px-4 cursor-pointer touch-manipulation">
                    <div className="flex items-center gap-3 w-full py-2">
                      <Upload className="w-5 h-5" />
                      <span className="text-base">Documents</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="profile" className="h-14 px-4 cursor-pointer touch-manipulation">
                    <div className="flex items-center gap-3 w-full py-2">
                      <Users className="w-5 h-5" />
                      <span className="text-base">Profile</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="flex items-center gap-3 text-2xl md:text-xl font-bold">
                  <TrendingUp className="w-7 h-7 md:w-6 md:h-6 text-primary" />
                  Your Benefits Journey
                </CardTitle>
                <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                  Track your progress and manage your benefits applications with ease.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-4">
              <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
                <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                  <CardTitle className="flex items-center justify-between text-xl md:text-lg">
                    <span className="flex items-center gap-3">
                      <FileText className="w-6 h-6 md:w-5 md:h-5 text-primary" />
                      Application Status
                    </span>
                    <Badge
                      className={`${getStatusColor(status)} text-sm md:text-xs px-3 py-1.5 md:px-2 md:py-1 rounded-full`}
                    >
                      {status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 md:space-y-4 pt-0 px-6 md:px-6">
                  {submittedApplications && submittedApplications.length > 0 ? (
                    <>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-green-800">Submitted Applications</h4>
                        {submittedApplications.map((app, index) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="font-semibold">Type:</span>{" "}
                                {app.benefit_type || "Benefits Application"}
                              </p>
                              <p>
                                <span className="font-semibold">Submitted:</span>{" "}
                                {new Date(app.submitted_at).toLocaleDateString()}
                              </p>
                              <p>
                                <span className="font-semibold">Reference:</span>{" "}
                                {app.reference_number || `REF-${app.id?.slice(-8)}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {applicationProgress && Array.isArray(applicationProgress) && applicationProgress.length > 0 && (
                        <>
                          <div className="border-t pt-4">
                            <h4 className="font-semibold text-yellow-800 mb-3">In Progress Applications</h4>
                            {applicationProgress.map((app, index) => {
                              const appProgressPercentage = Math.round(((app.current_step || 1) / 9) * 100)
                              return (
                                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                                  <div className="space-y-3">
                                    <div className="flex justify-between text-sm font-semibold">
                                      <span>Progress</span>
                                      <span>{appProgressPercentage}% Complete</span>
                                    </div>
                                    <Progress value={appProgressPercentage} className="h-2 rounded-full" />
                                    <div className="space-y-2 text-sm text-gray-600">
                                      <p className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 flex-shrink-0 text-primary" />
                                        <span>Current Step: {getStepTitle(app.current_step)}</span>
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 flex-shrink-0 text-primary" />
                                        <span>Last Updated: {new Date(app.updated_at).toLocaleDateString()}</span>
                                      </p>
                                      {app.application_data?.benefitType && (
                                        <p className="flex items-center gap-2">
                                          <FileText className="w-4 h-4 flex-shrink-0 text-primary" />
                                          <span>Type: {app.application_data.benefitType}</span>
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <Button
                            asChild
                            className="w-full h-14 md:h-10 text-lg md:text-sm font-semibold rounded-2xl md:rounded-lg shadow-lg md:shadow-none"
                          >
                            <Link href="/application-choice">Continue Application</Link>
                          </Button>
                        </>
                      )}
                    </>
                  ) : applicationProgress &&
                    (Array.isArray(applicationProgress) ? applicationProgress.length > 0 : applicationProgress) ? (
                    <>
                      {Array.isArray(applicationProgress) ? (
                        applicationProgress.map((app, index) => {
                          const appProgressPercentage = Math.round(((app.current_step || 1) / 9) * 100)
                          return (
                            <div key={index} className="space-y-4">
                              <div>
                                <div className="flex justify-between text-base md:text-sm font-semibold mb-3 md:mb-2">
                                  <span>Progress</span>
                                  <span>{appProgressPercentage}% Complete</span>
                                </div>
                                <Progress value={appProgressPercentage} className="h-3 md:h-2 rounded-full" />
                              </div>
                              <div className="space-y-4 md:space-y-3 text-base md:text-sm text-gray-600">
                                <p className="flex items-center gap-2">
                                  <Clock className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0 text-primary" />
                                  <span>Current Step: {getStepTitle(app.current_step)}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <Calendar className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0 text-primary" />
                                  <span>Last Updated: {new Date(app.updated_at).toLocaleDateString()}</span>
                                </p>
                                {app.application_data?.benefitType && (
                                  <p className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0 text-primary" />
                                    <span>Type: {app.application_data.benefitType}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-base md:text-sm font-semibold mb-3 md:mb-2">
                              <span>Progress</span>
                              <span>{progressPercentage}% Complete</span>
                            </div>
                            <Progress value={progressPercentage} className="h-3 md:h-2 rounded-full" />
                          </div>
                          <div className="space-y-4 md:space-y-3 text-base md:text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <Clock className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0 text-primary" />
                              <span>Current Step: {getStepTitle(applicationProgress.current_step)}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0 text-primary" />
                              <span>Last Updated: {new Date(applicationProgress.updated_at).toLocaleDateString()}</span>
                            </p>
                            {applicationProgress.application_data?.benefitType && (
                              <p className="flex items-center gap-2">
                                <FileText className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0 text-primary" />
                                <span>Type: {applicationProgress.application_data.benefitType}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      <Button
                        asChild
                        className="w-full h-14 md:h-10 text-lg md:text-sm font-semibold rounded-2xl md:rounded-lg shadow-lg md:shadow-none"
                      >
                        <Link href="/application-choice">Continue Application</Link>
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 md:py-6">
                      <FileText className="w-16 h-16 md:w-12 md:h-12 text-gray-300 mx-auto mb-4 md:mb-3" />
                      <h3 className="text-xl md:text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                      <p className="text-base md:text-sm text-gray-600 mb-6 md:mb-4">
                        Start your benefits application to see your progress here.
                      </p>
                      <Button
                        asChild
                        className="w-full h-14 md:h-10 text-lg md:text-sm font-semibold rounded-2xl md:rounded-lg shadow-lg md:shadow-none"
                      >
                        <Link href="/application-choice">Start Application</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
                <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                  <CardTitle className="flex items-center gap-3 text-xl md:text-lg">
                    <CheckCircle className="w-6 h-6 md:w-5 md:h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-3 pt-0 px-6 md:px-6">
                  <Button
                    asChild
                    className="w-full h-14 md:h-10 text-lg md:text-sm font-semibold rounded-2xl md:rounded-lg shadow-lg md:shadow-none"
                  >
                    <Link href="/application-choice">
                      {applicationProgress && Array.isArray(applicationProgress) && applicationProgress.length > 0
                        ? "Continue Application"
                        : "Start New Application"}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-14 md:h-10 text-lg md:text-sm font-semibold rounded-2xl md:rounded-lg shadow-lg md:shadow-none bg-transparent"
                    onClick={() => setActiveTab("documents")}
                  >
                    <span>Upload Documents</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="flex items-center gap-3 text-2xl md:text-xl font-bold">
                  <FileText className="w-7 h-7 md:w-6 md:h-6 text-primary" />
                  Your Applications
                </CardTitle>
                <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                  View and manage all your benefit applications in one place.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-6">
              {submittedApplications && submittedApplications.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Submitted Applications</h3>
                  {submittedApplications.map((app, index) => (
                    <Card key={index} className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{app.benefit_type || "Benefits Application"}</h4>
                          <Badge className="bg-green-100 text-green-800">Submitted</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Submitted: {new Date(app.submitted_at).toLocaleDateString()}</p>
                          <p>Reference: {app.reference_number || `REF-${app.id?.slice(-8)}`}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {applicationProgress && Array.isArray(applicationProgress) && applicationProgress.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">In Progress Applications</h3>
                  {applicationProgress.map((app, index) => {
                    const appProgressPercentage = Math.round(((app.current_step || 1) / 9) * 100)
                    return (
                      <Card key={index} className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">
                              {app.application_data?.benefitType || "Benefits Application"}
                            </h4>
                            <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{appProgressPercentage}% Complete</span>
                            </div>
                            <Progress value={appProgressPercentage} className="h-2" />
                            <div className="text-sm text-gray-600">
                              <p>Current Step: {getStepTitle(app.current_step)}</p>
                              <p>Last Updated: {new Date(app.updated_at).toLocaleDateString()}</p>
                            </div>
                            <Button asChild size="sm" className="w-full">
                              <Link href="/application">Continue Application</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {(!applicationProgress || (Array.isArray(applicationProgress) && applicationProgress.length === 0)) &&
                (!submittedApplications || submittedApplications.length === 0) && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                      <p className="text-gray-600 mb-6">Start your first benefits application to get started.</p>
                      <Button asChild>
                        <Link href="/application-choice">Start New Application</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="flex items-center gap-3 text-2xl md:text-xl font-bold">
                  <Bell className="w-7 h-7 md:w-6 md:h-6 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                  Stay updated with important information about your applications and benefits.
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
                      Report Changes
                    </CardTitle>
                    <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                      It's important to report changes that might affect your benefits within 10 days.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
                  <Card
                    className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border cursor-pointer hover:shadow-xl md:hover:shadow-md transition-shadow"
                    onClick={() => setSelectedChangeCategory("income-assets")}
                  >
                    <CardContent className="p-6 md:p-4">
                      <div className="flex items-center gap-4 mb-4 md:mb-3">
                        <DollarSign className="w-8 h-8 md:w-6 md:h-6 text-primary" />
                        <h3 className="text-xl md:text-lg font-semibold">Income & Assets</h3>
                      </div>
                      <p className="text-base md:text-sm text-gray-600">
                        Report changes in employment, income, or assets like bank accounts and property.
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border cursor-pointer hover:shadow-xl md:hover:shadow-md transition-shadow"
                    onClick={() => setSelectedChangeCategory("household")}
                  >
                    <CardContent className="p-6 md:p-4">
                      <div className="flex items-center gap-4 mb-4 md:mb-3">
                        <Users className="w-8 h-8 md:w-6 md:h-6 text-secondary" />
                        <h3 className="text-xl md:text-lg font-semibold">Household Changes</h3>
                      </div>
                      <p className="text-base md:text-sm text-gray-600">
                        Report changes in household members, marriage, divorce, or family composition.
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border cursor-pointer hover:shadow-xl md:hover:shadow-md transition-shadow"
                    onClick={() => setSelectedChangeCategory("address")}
                  >
                    <CardContent className="p-6 md:p-4">
                      <div className="flex items-center gap-4 mb-4 md:mb-3">
                        <Home className="w-8 h-8 md:w-6 md:h-6 text-primary" />
                        <h3 className="text-xl md:text-lg font-semibold">Address & Residency</h3>
                      </div>
                      <p className="text-base md:text-sm text-gray-600">
                        Report address changes or moves to a different state or county.
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border cursor-pointer hover:shadow-xl md:hover:shadow-md transition-shadow"
                    onClick={() => setSelectedChangeCategory("insurance")}
                  >
                    <CardContent className="p-6 md:p-4">
                      <div className="flex items-center gap-4 mb-4 md:mb-3">
                        <Shield className="w-8 h-8 md:w-6 md:h-6 text-secondary" />
                        <h3 className="text-xl md:text-lg font-semibold">Health Insurance</h3>
                      </div>
                      <p className="text-base md:text-sm text-gray-600">
                        Report changes in health insurance coverage, Medicare eligibility, or job-based insurance.
                      </p>
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
                  Document Upload
                </CardTitle>
                <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                  Upload required documents to support your benefits application.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="text-xl md:text-lg">Upload New Document</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-6 md:px-6">
                {uploadSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Document Uploaded Successfully</h3>
                    <p className="text-gray-600">Your document has been received and will be processed shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleDocumentUpload} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="documentType" className="text-sm font-medium text-gray-700">
                        Document Type
                      </Label>
                      <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType} required>
                        <SelectTrigger className="w-full border-gray-300 rounded-xl">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((docType) => (
                            <SelectItem key={docType.value} value={docType.value}>
                              <div className="py-1">
                                <div className="font-medium">{docType.label}</div>
                                <div className="text-sm text-muted-foreground">{docType.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="file" className="text-sm font-medium text-gray-700">
                        Choose File
                      </Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                        className="border-gray-300 rounded-xl"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        required
                      />
                      <p className="text-sm text-gray-500">Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)</p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isUploading || !selectedDocumentType || !uploadedFile}
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="text-xl md:text-lg">Document History</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-6 md:px-6">
                {loadingDocuments ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading documents...</p>
                  </div>
                ) : documentHistory.length > 0 ? (
                  <div className="space-y-4">
                    {documentHistory.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">{doc.file_name}</p>
                            <p className="text-sm text-gray-600">
                              {documentTypes.find((type) => type.value === doc.document_type)?.label ||
                                doc.document_type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                          <Badge variant="outline" className="text-xs">
                            Uploaded
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Documents Yet</h3>
                    <p className="text-gray-600">Upload your first document to get started.</p>
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
                  Profile Information
                </CardTitle>
                <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                  Manage your account information and preferences.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="text-xl md:text-lg">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-0 px-6 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                    <Input
                      value={user.user_metadata?.full_name || ""}
                      className="border-gray-300 rounded-xl"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                    <Input value={user.email || ""} className="border-gray-300 rounded-xl" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Account Created</Label>
                    <Input
                      value={user.created_at ? new Date(user.created_at).toLocaleDateString() : ""}
                      className="border-gray-300 rounded-xl"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">User ID</Label>
                    <Input value={user.id} className="border-gray-300 rounded-xl" readOnly />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    To update your profile information, please contact support or update your information through your
                    benefits application.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
