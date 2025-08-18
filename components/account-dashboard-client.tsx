"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Upload,
  ExternalLink,
  Bell,
  LogOut,
  AlertTriangle,
  Users,
  DollarSign,
  Home,
  Shield,
  Sparkles,
  TrendingUp,
  ArrowLeft,
  Send,
  Menu,
} from "lucide-react"
import { loadApplicationProgress, signOut } from "@/lib/actions"
import { useSearchParams } from "next/navigation"

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

// Mock functions for status, progress, step title, and notification icon
const getApplicationStatus = () => {
  return "In Progress"
}

const getProgressPercentage = () => {
  return 75
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
  return `Step ${step}: Personal Information`
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
      try {
        // Load in-progress application
        const progressResult = await loadApplicationProgress()
        if (progressResult.data) {
          setApplicationProgress(progressResult.data)
        }

        // Load submitted applications
        const { getSubmittedApplications } = await import("@/lib/actions")
        const applicationsResult = await getSubmittedApplications()
        if (applicationsResult.data) {
          setSubmittedApplications(applicationsResult.data)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

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

  const status = getApplicationStatus()
  const progressPercentage = getProgressPercentage()

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
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full h-14 bg-white shadow-sm border rounded-xl px-4 text-base font-medium">
                  <div className="flex items-center gap-3">
                    <Menu className="w-5 h-5 text-gray-500" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="overview" className="h-12 px-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-base">Overview</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="applications" className="h-12 px-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5" />
                      <span className="text-base">Applications</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="notifications" className="h-12 px-4">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5" />
                      <span className="text-base">Notifications</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="report-changes" className="h-12 px-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="text-base">Report Changes</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="documents" className="h-12 px-4">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5" />
                      <span className="text-base">Documents</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="profile" className="h-12 px-4">
                    <div className="flex items-center gap-3">
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
                  {applicationProgress ? (
                    <>
                      <div>
                        <div className="flex justify-between text-base md:text-sm font-semibold mb-3 md:mb-2">
                          <span>Progress</span>
                          <span>{Math.round(progressPercentage)}% Complete</span>
                        </div>
                        <Progress value={progressPercentage} className="h-3 md:h-2 rounded-full" />
                      </div>
                      <div className="space-y-4 md:space-y-3 text-base md:text-sm text-gray-600">
                        <p className="flex items-center gap-3 md:gap-2">
                          <Clock className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0 text-primary" />
                          <span className="break-words leading-relaxed">
                            Current Step: {getStepTitle(applicationProgress.current_step)}
                          </span>
                        </p>
                        <p className="flex items-center gap-3 md:gap-2">
                          <Calendar className="w-5 h-5 md:w-4 md:h-4 flex-shrink-0 text-primary" />
                          <span>Last Updated: {new Date(applicationProgress.updated_at).toLocaleDateString()}</span>
                        </p>
                      </div>
                      <Button
                        asChild
                        className="w-full h-14 md:h-10 text-lg md:text-sm font-semibold rounded-2xl md:rounded-lg shadow-lg md:shadow-none"
                      >
                        <Link href="/application">Continue Application</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 text-base md:text-sm leading-relaxed">
                        You haven't started your benefits application yet.
                      </p>
                      <Button
                        asChild
                        className="w-full h-14 md:h-10 text-lg md:text-sm font-semibold rounded-2xl md:rounded-lg shadow-lg md:shadow-none"
                      >
                        <Link href="/application">Start Application</Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
                <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                  <CardTitle className="flex items-center gap-3 text-xl md:text-lg">
                    <Sparkles className="w-6 h-6 md:w-5 md:h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-3 pt-0 px-6 md:px-6">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-5 md:p-4 bg-white hover:bg-gray-50 rounded-2xl md:rounded-lg border-2 md:border shadow-sm md:shadow-none"
                    asChild
                  >
                    <Link href="/application" className="flex items-center gap-4 md:gap-3">
                      <FileText className="w-6 h-6 md:w-5 md:h-5 flex-shrink-0 text-primary" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-semibold text-base md:text-sm truncate">
                          {applicationProgress ? "Continue Application" : "Start New Application"}
                        </div>
                        <div className="text-sm md:text-xs text-gray-500 truncate mt-1">
                          {applicationProgress ? "Pick up where you left off" : "Begin your benefits journey"}
                        </div>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-5 md:p-4 bg-white hover:bg-gray-50 rounded-2xl md:rounded-lg border-2 md:border shadow-sm md:shadow-none"
                    asChild
                  >
                    <Link href="/about" className="flex items-center gap-4 md:gap-3">
                      <ExternalLink className="w-6 h-6 md:w-5 md:h-5 flex-shrink-0 text-primary" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-semibold text-base md:text-sm truncate">Learn About Benefits</div>
                        <div className="text-sm md:text-xs text-gray-500 truncate mt-1">
                          Understand your eligibility
                        </div>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    disabled
                    className="w-full justify-start h-auto p-5 md:p-4 bg-white rounded-2xl md:rounded-lg border-2 md:border shadow-sm md:shadow-none opacity-60"
                  >
                    <div className="flex items-center gap-4 md:gap-3 w-full">
                      <Upload className="w-6 h-6 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-semibold text-gray-500 text-base md:text-sm truncate">
                          Upload Documents
                        </div>
                        <div className="text-sm md:text-xs text-gray-500 truncate mt-1">Submit supporting files</div>
                      </div>
                      <Badge variant="secondary" className="ml-auto text-xs px-2 py-1 flex-shrink-0 rounded-full">
                        Coming Soon
                      </Badge>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="text-2xl md:text-xl font-bold">Your Applications</CardTitle>
                <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                  View and manage your benefits applications
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-6 md:px-6">
                {applicationProgress ? (
                  <div className="space-y-6 md:space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl md:rounded-xl p-6 md:p-4">
                      <h3 className="font-bold text-blue-900 mb-3 md:mb-2 text-lg md:text-base">In Progress</h3>
                      <div className="space-y-3 md:space-y-2 text-base md:text-sm text-blue-800">
                        <p>
                          <span className="font-semibold">Application Type:</span>{" "}
                          {applicationProgress.application_data?.benefitType || "Not specified"}
                        </p>
                        <p>
                          <span className="font-semibold">State:</span>{" "}
                          {applicationProgress.application_data?.state || "Not specified"}
                        </p>
                        <p>
                          <span className="font-semibold">Last Updated:</span>{" "}
                          {new Date(applicationProgress.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full h-14 md:h-10 text-lg md:text-sm font-semibold rounded-2xl md:rounded-lg shadow-lg md:shadow-none"
                    >
                      <Link href="/application">Continue Application</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 md:py-8">
                    <FileText className="w-16 h-16 md:w-12 md:h-12 text-gray-400 mx-auto mb-6 md:mb-4" />
                    <h3 className="font-bold text-gray-900 mb-3 md:mb-2 text-xl md:text-lg">No Applications Yet</h3>
                    <p className="text-gray-600 mb-8 md:mb-6 text-base md:text-sm px-4 leading-relaxed">
                      Start your first benefits application to see it here and track your progress.
                    </p>
                    <Button
                      asChild
                      className="h-14 md:h-10 px-8 text-lg md:text-sm font-semibold rounded-2xl md:rounded-lg shadow-lg md:shadow-none"
                    >
                      <Link href="/application">Start Application</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="text-2xl md:text-xl font-bold">Notifications</CardTitle>
                <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                  View all your account and application notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-6 md:px-6">
                <ScrollArea className="h-96 md:h-80">
                  <div className="space-y-4 md:space-y-3 pr-4">
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="border rounded-2xl md:rounded-xl p-5 md:p-4 bg-white hover:bg-gray-50 transition-colors shadow-sm md:shadow-none"
                      >
                        <div className="flex items-start gap-4 md:gap-3">
                          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-3 md:mb-2">
                              <h3 className="font-bold text-gray-900 text-base md:text-sm leading-tight">
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-3 h-3 md:w-2 md:h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                            <p className="text-gray-600 text-base md:text-sm leading-relaxed mb-3 md:mb-2">
                              {notification.description}
                            </p>
                            <p className="text-sm md:text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report-changes" className="space-y-6">
            {selectedChangeCategory ? (
              renderChangeForm()
            ) : (
              <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
                <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                  <CardTitle className="text-2xl md:text-xl font-bold">Report Life Changes</CardTitle>
                  <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                    Report changes in your circumstances to maintain your Medicaid eligibility and ensure correct
                    benefits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 md:space-y-4 pt-0 px-6 md:px-6">
                  <Alert className="rounded-2xl md:rounded-xl border-amber-200 bg-amber-50 p-4 md:p-3">
                    <AlertCircle className="h-5 w-5 md:h-4 md:w-4 text-amber-600" />
                    <AlertDescription className="text-base md:text-sm text-amber-800 leading-relaxed">
                      <strong>Important:</strong> You must report changes within 10 days to avoid potential issues with
                      your benefits.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-3">
                    <Button
                      onClick={() => setSelectedChangeCategory("income-assets")}
                      variant="outline"
                      className="h-auto p-6 md:p-8 justify-start bg-white hover:bg-gray-50 rounded-2xl md:rounded-xl border-2 md:border shadow-sm md:shadow-none"
                    >
                      <div className="flex items-center gap-4 md:gap-6 w-full">
                        <DollarSign className="w-7 h-7 md:w-8 md:h-8 text-primary flex-shrink-0" />
                        <div className="text-left flex-1">
                          <div className="font-bold text-base md:text-lg">Income & Asset Changes</div>
                          <div className="text-sm md:text-base text-gray-500 mt-1 md:mt-2 leading-relaxed">
                            Job changes, income, assets
                          </div>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => setSelectedChangeCategory("household")}
                      variant="outline"
                      className="h-auto p-6 md:p-8 justify-start bg-white hover:bg-gray-50 rounded-2xl md:rounded-xl border-2 md:border shadow-sm md:shadow-none"
                    >
                      <div className="flex items-center gap-4 md:gap-6 w-full">
                        <Users className="w-7 h-7 md:w-8 md:h-8 text-secondary flex-shrink-0" />
                        <div className="text-left flex-1">
                          <div className="font-bold text-base md:text-lg">Household Changes</div>
                          <div className="text-sm md:text-base text-gray-500 mt-1 md:mt-2 leading-relaxed">
                            Marriage, family members
                          </div>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => setSelectedChangeCategory("address")}
                      variant="outline"
                      className="h-auto p-6 md:p-8 justify-start bg-white hover:bg-gray-50 rounded-2xl md:rounded-xl border-2 md:border shadow-sm md:shadow-none"
                    >
                      <div className="flex items-center gap-4 md:gap-6 w-full">
                        <Home className="w-7 h-7 md:w-8 md:h-8 text-primary flex-shrink-0" />
                        <div className="text-left flex-1">
                          <div className="font-bold text-base md:text-lg">Address Changes</div>
                          <div className="text-sm md:text-base text-gray-500 mt-1 md:mt-2 leading-relaxed">
                            Moving, residency
                          </div>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => setSelectedChangeCategory("insurance")}
                      variant="outline"
                      className="h-auto p-6 md:p-8 justify-start bg-white hover:bg-gray-50 rounded-2xl md:rounded-xl border-2 md:border shadow-sm md:shadow-none"
                    >
                      <div className="flex items-center gap-4 md:gap-6 w-full">
                        <Shield className="w-7 h-7 md:w-8 md:h-8 text-secondary flex-shrink-0" />
                        <div className="text-left flex-1">
                          <div className="font-bold text-base md:text-lg">Insurance Changes</div>
                          <div className="text-sm md:text-base text-gray-500 mt-1 md:mt-2 leading-relaxed">
                            Health coverage updates
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="text-2xl md:text-xl font-bold">Documents</CardTitle>
                <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                  Upload and manage your application documents
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-6 md:px-6">
                <Alert className="rounded-2xl md:rounded-xl border-blue-200 bg-blue-50 p-4 md:p-3">
                  <AlertCircle className="h-5 w-5 md:h-4 md:w-4 text-blue-600" />
                  <AlertDescription className="text-base md:text-sm text-blue-800 leading-relaxed">
                    Document upload functionality is coming soon. You'll be able to upload supporting documents for your
                    benefits application here.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="rounded-2xl md:rounded-xl shadow-lg md:shadow-sm border-0 md:border">
              <CardHeader className="pb-6 md:pb-4 px-6 md:px-6">
                <CardTitle className="text-2xl md:text-xl font-bold">Profile Information</CardTitle>
                <CardDescription className="text-base md:text-sm text-gray-600 leading-relaxed">
                  View and manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-6 md:px-6">
                <div className="space-y-6 md:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
                    <div className="space-y-3 md:space-y-2">
                      <label className="text-base md:text-sm font-semibold text-gray-700">Email</label>
                      <div className="p-4 md:p-3 bg-gray-50 rounded-2xl md:rounded-xl text-base md:text-sm break-all">
                        {user.email}
                      </div>
                    </div>
                    <div className="space-y-3 md:space-y-2">
                      <label className="text-base md:text-sm font-semibold text-gray-700">Full Name</label>
                      <div className="p-4 md:p-3 bg-gray-50 rounded-2xl md:rounded-xl text-base md:text-sm">
                        {user.user_metadata?.full_name || "Not provided"}
                      </div>
                    </div>
                    <div className="space-y-3 md:space-y-2 md:col-span-2">
                      <label className="text-base md:text-sm font-semibold text-gray-700">Account Created</label>
                      <div className="p-4 md:p-3 bg-gray-50 rounded-2xl md:rounded-xl text-base md:text-sm">
                        {new Date(user.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <Alert className="rounded-2xl md:rounded-xl border-blue-200 bg-blue-50 p-4 md:p-3">
                    <AlertCircle className="h-5 w-5 md:h-4 md:w-4 text-blue-600" />
                    <AlertDescription className="text-base md:text-sm text-blue-800 leading-relaxed">
                      Profile editing functionality is coming soon. Contact support if you need to update your
                      information.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
