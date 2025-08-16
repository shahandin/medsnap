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
  Mail,
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="mb-12 relative">
          <div className="relative bg-white border border-gray-200 rounded-3xl p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-heading font-bold text-gray-900">Account Dashboard</h1>
                    <p className="text-xl text-gray-600">
                      Welcome back, {user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
                    </p>
                  </div>
                </div>
                <p className="text-lg text-gray-600">Manage your benefits applications and account information</p>
              </div>
              <form action={signOut}>
                <Button
                  variant="outline"
                  size="lg"
                  type="submit"
                  className="flex items-center gap-2 border-2 border-gray-300 hover:border-primary hover:bg-primary hover:text-white rounded-xl px-6 py-3 bg-white transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
            <TabsTrigger
              value="overview"
              className="rounded-xl font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="rounded-xl font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Applications
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-xl font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="report-changes"
              className="rounded-xl font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Report Changes
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="rounded-xl font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="rounded-xl font-medium hover:bg-primary/10 hover:text-primary transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <Card className="bg-white border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              <CardHeader className="bg-white border-b border-gray-200">
                <CardTitle className="flex items-center gap-3 text-2xl font-heading text-gray-900">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Your Benefits Journey
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Track your progress and manage your benefits applications with ease.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl font-heading text-gray-900">
                    <span className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-primary" />
                      Application Status
                    </span>
                    <Badge className={`${getStatusColor(status)} px-3 py-1 rounded-full font-medium`}>{status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {applicationProgress ? (
                    <>
                      <div>
                        <div className="flex justify-between text-base font-medium mb-3 text-gray-900">
                          <span>Progress</span>
                          <span className="text-primary">{Math.round(progressPercentage)}% Complete</span>
                        </div>
                        <Progress value={progressPercentage} className="h-3 bg-gray-100 rounded-full" />
                      </div>
                      <div className="space-y-2 text-gray-600">
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Current Step: {getStepTitle(applicationProgress.current_step)}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Last Updated: {new Date(applicationProgress.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white rounded-xl py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <Link href="/application">Continue Application</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 text-lg">You haven't started your benefits application yet.</p>
                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white rounded-xl py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <Link href="/application">Start Application</Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-heading">
                    <Sparkles className="w-6 h-6 text-secondary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4 border-2 border-border hover:border-primary/50 rounded-xl bg-transparent hover:bg-muted/50 transition-all duration-200"
                    asChild
                  >
                    <Link href="/application" className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold">
                          {applicationProgress ? "Continue Application" : "Start New Application"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {applicationProgress ? "Pick up where you left off" : "Begin your benefits journey"}
                        </div>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4 border-2 border-border hover:border-secondary/50 rounded-xl bg-transparent hover:bg-muted/50 transition-all duration-200"
                    asChild
                  >
                    <Link href="/about" className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-secondary" />
                      <div className="text-left">
                        <div className="font-semibold">Learn About Benefits</div>
                        <div className="text-sm text-muted-foreground">Understand your eligibility</div>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    disabled
                    className="w-full justify-start h-auto p-4 border-2 border-border rounded-xl bg-muted/20 opacity-60"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <div className="text-left flex-1">
                        <div className="font-semibold text-muted-foreground">Upload Documents</div>
                        <div className="text-sm text-muted-foreground">Submit supporting files</div>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        Coming Soon
                      </Badge>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-heading">
                  <Clock className="w-6 h-6 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applicationProgress ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Application Progress Saved</p>
                        <p className="text-sm text-muted-foreground">
                          Last saved: {new Date(applicationProgress.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground text-lg">No recent activity to display.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-muted/30 to-card/50 border-b border-border/50 rounded-t-2xl">
                <CardTitle className="text-2xl font-heading">Your Applications</CardTitle>
                <CardDescription className="text-lg">View and manage your benefits applications</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* In-Progress Application */}
                  {applicationProgress && (
                    <div>
                      <h3 className="text-xl font-heading font-semibold mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        In Progress
                      </h3>
                      <div className="bg-gradient-to-r from-card to-muted/20 border border-border/50 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold">Benefits Application</h4>
                          <Badge className={`${getStatusColor(status)} px-3 py-1 rounded-full`}>In Progress</Badge>
                        </div>
                        <div className="space-y-3 text-muted-foreground mb-6">
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Application Type:</span>
                            {applicationProgress.application_data?.benefitType || "Not specified"}
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="font-medium">State:</span>
                            {applicationProgress.application_data?.state || "Not specified"}
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="font-medium">Last Updated:</span>
                            {new Date(applicationProgress.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm font-medium mb-3">
                            <span>Progress</span>
                            <span className="text-primary">{Math.round(progressPercentage)}% Complete</span>
                          </div>
                          <Progress value={progressPercentage} className="h-3 bg-muted/50 rounded-full mb-4" />
                          <Button
                            asChild
                            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-xl px-6 py-2 font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <Link href="/application">Continue Application</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submitted Applications */}
                  {submittedApplications.length > 0 && (
                    <div>
                      <h3 className="text-xl font-heading font-semibold mb-6 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        Submitted Applications
                      </h3>
                      <div className="space-y-4">
                        {submittedApplications.map((app) => (
                          <div
                            key={app.id}
                            className="bg-gradient-to-r from-card to-muted/20 border border-border/50 rounded-2xl p-6 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold">Benefits Application</h4>
                              <Badge className="bg-primary text-white border-primary px-3 py-1 rounded-full">
                                Submitted
                              </Badge>
                            </div>
                            <div className="space-y-3 text-muted-foreground">
                              <p className="flex items-center gap-2">
                                <span className="font-medium">Benefits Applied For:</span>
                                {app.benefit_type === "both"
                                  ? "Medicaid & SNAP"
                                  : app.benefit_type === "medicaid"
                                    ? "Medicaid"
                                    : app.benefit_type === "snap"
                                      ? "SNAP"
                                      : app.benefit_type || "Not specified"}
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="font-medium">Reference Number:</span>
                                {app.reference_number}
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="font-medium">Submitted:</span>
                                {new Date(app.submitted_at).toLocaleDateString()}
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="font-medium">Status:</span>
                                {app.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Applications */}
                  {!applicationProgress && submittedApplications.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-2xl font-heading font-semibold text-foreground mb-3">No Applications Yet</h3>
                      <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                        Start your first benefits application to see it here and track your progress.
                      </p>
                      <Button
                        asChild
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Link href="/application">Start Application</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-muted/30 to-card/50 border-b border-border/50 rounded-t-2xl">
                <CardTitle className="flex items-center gap-3 text-2xl font-heading">
                  <Bell className="w-6 h-6 text-primary" />
                  All Notifications
                </CardTitle>
                <CardDescription className="text-lg">
                  View all your account and application notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                          !notification.read
                            ? "bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20"
                            : "bg-card/50 border-border/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-semibold text-foreground text-lg">{notification.title}</h3>
                              {!notification.read && (
                                <Badge className="bg-primary/20 text-primary border-primary/20 text-xs px-2 py-1 rounded-full">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3 leading-relaxed">{notification.description}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
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

          <TabsContent value="report-changes" className="space-y-8">
            {selectedChangeCategory ? (
              renderChangeForm()
            ) : (
              <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl shadow-lg">
                <CardHeader className="bg-gradient-to-r from-muted/30 to-card/50 border-b border-border/50 rounded-t-2xl">
                  <CardTitle className="flex items-center gap-3 text-2xl font-heading">
                    <AlertTriangle className="w-6 h-6 text-primary" />
                    Report Life Changes
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Report changes in your circumstances to maintain your Medicaid eligibility and ensure correct
                    benefits
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <Alert className="mb-8 border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <AlertDescription className="text-base">
                      <strong>Important:</strong> You must report changes within 10 days to avoid potential issues with
                      your benefits. Failure to report changes may result in overpayments that you'll need to repay.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Income and Asset Changes */}
                    <Card
                      className="bg-gradient-to-r from-card to-muted/20 border-border/50 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50"
                      onClick={() => setSelectedChangeCategory("income-assets")}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl font-heading">
                          <DollarSign className="w-6 h-6 text-primary" />
                          Income & Asset Changes
                        </CardTitle>
                        <CardDescription className="text-base">
                          Report changes in your household income, employment, or assets
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    {/* Household Changes */}
                    <Card
                      className="bg-gradient-to-r from-card to-muted/20 border-border/50 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:border-secondary/50"
                      onClick={() => setSelectedChangeCategory("household")}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl font-heading">
                          <Users className="w-6 h-6 text-secondary" />
                          Household Changes
                        </CardTitle>
                        <CardDescription className="text-base">
                          Report changes in your household composition
                        </CardDescription>
                      </CardHeader>
                    </Card>

                    {/* Address Changes */}
                    <Card
                      className="bg-gradient-to-r from-card to-muted/20 border-border/50 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50"
                      onClick={() => setSelectedChangeCategory("address")}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl font-heading">
                          <Home className="w-6 h-6 text-primary" />
                          Address & Residency Changes
                        </CardTitle>
                        <CardDescription className="text-base">Report changes in where you live</CardDescription>
                      </CardHeader>
                    </Card>

                    {/* Insurance Changes */}
                    <Card
                      className="bg-gradient-to-r from-card to-muted/20 border-border/50 rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 hover:border-secondary/50"
                      onClick={() => setSelectedChangeCategory("insurance")}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl font-heading">
                          <Shield className="w-6 h-6 text-secondary" />
                          Health Insurance Changes
                        </CardTitle>
                        <CardDescription className="text-base">
                          Report changes in your health insurance coverage
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Contact Information */}
                  <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-heading">Need Help?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl border border-border/50">
                        <h4 className="font-semibold text-lg mb-4">Reporting Methods</h4>
                        <ul className="text-muted-foreground space-y-2 leading-relaxed">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            Online: Use the forms above to report changes
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            Phone: Call your local Medicaid office
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            In Person: Visit your local Department of Human Services office
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            Mail: Send written notice to your caseworker
                          </li>
                        </ul>
                      </div>
                      <Alert className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        <AlertDescription className="text-base">
                          <strong>Remember:</strong> Changes must be reported within 10 days of when they happen, not
                          when you receive documentation.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-muted/30 to-card/50 border-b border-border/50 rounded-t-2xl">
                <CardTitle className="text-2xl font-heading">Documents</CardTitle>
                <CardDescription className="text-lg">Upload and manage your application documents</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <Alert className="border-secondary/20 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-secondary" />
                  <AlertDescription className="text-base">
                    Document upload functionality is coming soon. You'll be able to upload supporting documents for your
                    benefits application here.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl shadow-lg">
              <CardHeader className="bg-gradient-to-r from-muted/30 to-card/50 border-b border-border/50 rounded-t-2xl">
                <CardTitle className="text-2xl font-heading">Profile Information</CardTitle>
                <CardDescription className="text-lg">View and manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid gap-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-card to-muted/20 rounded-xl border border-border/50">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Email Address</p>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-card to-muted/20 rounded-xl border border-border/50">
                    <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                      <ExternalLink className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Full Name</p>
                      <p className="text-muted-foreground">{user.user_metadata?.full_name || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-card to-muted/20 rounded-xl border border-border/50">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Account Created</p>
                      <p className="text-muted-foreground">
                        {new Date(user.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <Alert className="border-secondary/20 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-secondary" />
                  <AlertDescription className="text-base">
                    Profile editing functionality is coming soon. Contact support if you need to update your
                    information.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
