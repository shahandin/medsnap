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
            <TabsList className="w-full h-auto p-1 bg-white shadow-sm border rounded-lg overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max gap-1">
                <TabsTrigger
                  value="overview"
                  className="flex-shrink-0 min-w-[120px] px-4 py-3 text-sm font-medium whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="applications"
                  className="flex-shrink-0 min-w-[120px] px-4 py-3 text-sm font-medium whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Applications
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex-shrink-0 min-w-[120px] px-4 py-3 text-sm font-medium whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="report-changes"
                  className="flex-shrink-0 min-w-[120px] px-4 py-3 text-sm font-medium whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Report Changes
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="flex-shrink-0 min-w-[120px] px-4 py-3 text-sm font-medium whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex-shrink-0 min-w-[120px] px-4 py-3 text-sm font-medium whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Profile
                </TabsTrigger>
              </div>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Your Benefits Journey
                </CardTitle>
                <CardDescription>Track your progress and manage your benefits applications with ease.</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Application Status
                    </span>
                    <Badge className={getStatusColor(status)}>{status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {applicationProgress ? (
                    <>
                      <div>
                        <div className="flex justify-between text-sm font-medium mb-2">
                          <span>Progress</span>
                          <span>{Math.round(progressPercentage)}% Complete</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Current Step: {getStepTitle(applicationProgress.current_step)}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Last Updated: {new Date(applicationProgress.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button asChild className="w-full">
                        <Link href="/application">Continue Application</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600">You haven't started your benefits application yet.</p>
                      <Button asChild className="w-full">
                        <Link href="/application">Start Application</Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent" asChild>
                    <Link href="/application" className="flex items-center gap-3">
                      <FileText className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-semibold">
                          {applicationProgress ? "Continue Application" : "Start New Application"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {applicationProgress ? "Pick up where you left off" : "Begin your benefits journey"}
                        </div>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-auto p-4 bg-transparent" asChild>
                    <Link href="/about" className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-semibold">Learn About Benefits</div>
                        <div className="text-sm text-gray-500">Understand your eligibility</div>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" disabled className="w-full justify-start h-auto p-4 bg-transparent">
                    <div className="flex items-center gap-3 w-full">
                      <Upload className="w-5 h-5 text-gray-500" />
                      <div className="text-left flex-1">
                        <div className="font-semibold text-gray-500">Upload Documents</div>
                        <div className="text-sm text-gray-500">Submit supporting files</div>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        Coming Soon
                      </Badge>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Applications</CardTitle>
                <CardDescription>View and manage your benefits applications</CardDescription>
              </CardHeader>
              <CardContent>
                {applicationProgress ? (
                  <div>
                    <h3>In Progress</h3>
                    <p>Application Type: {applicationProgress.application_data?.benefitType || "Not specified"}</p>
                    <p>State: {applicationProgress.application_data?.state || "Not specified"}</p>
                    <p>Last Updated: {new Date(applicationProgress.updated_at).toLocaleDateString()}</p>
                    <Button asChild>
                      <Link href="/application">Continue Application</Link>
                    </Button>
                  </div>
                ) : (
                  <div>
                    <h3>No Applications Yet</h3>
                    <p>Start your first benefits application to see it here and track your progress.</p>
                    <Button asChild>
                      <Link href="/application">Start Application</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>View all your account and application notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  {mockNotifications.map((notification) => (
                    <div key={notification.id}>
                      <h3>{notification.title}</h3>
                      <p>{notification.description}</p>
                      <p>{new Date(notification.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report-changes" className="space-y-6">
            {selectedChangeCategory ? (
              renderChangeForm()
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Report Life Changes</CardTitle>
                  <CardDescription>
                    Report changes in your circumstances to maintain your Medicaid eligibility and ensure correct
                    benefits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> You must report changes within 10 days to avoid potential issues with
                      your benefits.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={() => setSelectedChangeCategory("income-assets")}>
                    Report Income & Asset Changes
                  </Button>
                  <Button onClick={() => setSelectedChangeCategory("household")}>Report Household Changes</Button>
                  <Button onClick={() => setSelectedChangeCategory("address")}>Report Address Changes</Button>
                  <Button onClick={() => setSelectedChangeCategory("insurance")}>Report Insurance Changes</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Upload and manage your application documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Document upload functionality is coming soon. You'll be able to upload supporting documents for your
                    benefits application here.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>View and manage your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Email: {user.email}</p>
                <p>Full Name: {user.user_metadata?.full_name || "Not provided"}</p>
                <p>Account Created: {new Date(user.created_at || Date.now()).toLocaleDateString()}</p>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
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
