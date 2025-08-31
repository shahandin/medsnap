import { createServerClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ApplicationSuccessPage() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] Success page: User authentication state:", user ? "authenticated" : "unauthenticated")

  const referenceNumber = `BEN-${Date.now().toString().slice(-8)}`
  const submissionDate = new Date().toLocaleDateString()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />

      <main className="flex-1 bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {!user && (
            <Alert className="mb-6 border-orange-300 bg-orange-50">
              <span className="text-orange-600">⚠️</span>
              <AlertDescription className="text-orange-800">
                Your application was submitted successfully, but you may need to sign in again to access your account
                dashboard.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center mb-8">
            <div className="text-8xl mb-6">✅</div>
            <h1 className="text-4xl font-bold text-green-800 mb-4">Application Submitted Successfully!</h1>
            <p className="text-xl text-gray-600">
              Your benefits application has been submitted and is now being processed.
            </p>
          </div>

          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <span className="text-xl">📄</span>
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700">Reference Number</p>
                  <p className="text-lg font-mono bg-white px-3 py-1 rounded border">{referenceNumber}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Submission Date</p>
                  <p className="text-lg">{submissionDate}</p>
                </div>
              </div>
              <Alert className="bg-green-100 border-green-300">
                <span className="text-green-600">⚠️</span>
                <AlertDescription className="text-green-800">
                  Please save your reference number for your records. You'll need it to check your application status.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                What Happens Next?
              </CardTitle>
              <CardDescription>Here's what you can expect during the application process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Confirmation Email (Within 24 hours)</h3>
                    <p className="text-gray-600 text-sm">
                      You'll receive a confirmation email with your reference number and next steps.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Application Review (7-30 days)</h3>
                    <p className="text-gray-600 text-sm">
                      Your state agency will review your application and may request additional documentation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Decision Notification</h3>
                    <p className="text-gray-600 text-sm">
                      You'll be notified of the decision by mail and email, along with information about your benefits.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <span className="text-xl">⚠️</span>
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📧</span>
                  <div>
                    <p className="font-medium">Check Your Email</p>
                    <p className="text-sm text-gray-600">
                      Make sure to check your email regularly, including spam folders, for updates about your
                      application.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📞</span>
                  <div>
                    <p className="font-medium">Keep Your Contact Information Updated</p>
                    <p className="text-sm text-gray-600">
                      Notify your state agency immediately if your address, phone number, or email changes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📄</span>
                  <div>
                    <p className="font-medium">Prepare Additional Documents</p>
                    <p className="text-sm text-gray-600">
                      You may be asked to provide additional documentation such as pay stubs, bank statements, or
                      medical records.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Things you can do while waiting for your application to be processed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 justify-start bg-transparent"
                  asChild={!!user}
                  disabled={!user}
                >
                  {user ? (
                    <Link href="/account">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📄</span>
                        <div className="text-left">
                          <p className="font-medium">View Application Status</p>
                          <p className="text-sm text-gray-600">Check your account dashboard</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📄</span>
                      <div className="text-left">
                        <p className="font-medium">View Application Status</p>
                        <p className="text-sm text-gray-600">Sign in to access dashboard</p>
                      </div>
                    </div>
                  )}
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start bg-transparent" disabled>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⬇️</span>
                    <div className="text-left">
                      <p className="font-medium">Download Application Copy</p>
                      <p className="text-sm text-gray-600">Coming soon</p>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start bg-transparent" disabled>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div className="text-left">
                      <p className="font-medium">Upload Documents</p>
                      <p className="text-sm text-gray-600">Coming soon</p>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 justify-start bg-transparent"
                  asChild={!!user}
                  disabled={!user}
                >
                  {user ? (
                    <Link href="/about">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🔗</span>
                        <div className="text-left">
                          <p className="font-medium">Learn About Benefits</p>
                          <p className="text-sm text-gray-600">Get more information</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🔗</span>
                      <div className="text-left">
                        <p className="font-medium">Learn About Benefits</p>
                        <p className="text-sm text-gray-600">Sign in to access more features</p>
                      </div>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📞</span>
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  If you have questions about your application or need assistance, here are your options:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">General Support</h4>
                    <p className="text-sm text-gray-600 mb-2">For questions about the application process</p>
                    <Button variant="outline" size="sm" disabled>
                      Contact Support
                    </Button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">State Agency</h4>
                    <p className="text-sm text-gray-600 mb-2">For specific questions about your benefits</p>
                    <Button variant="outline" size="sm" disabled>
                      Find State Contact
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            {user ? (
              <Button asChild size="lg">
                <Link href="/account">Go to Account Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/signin">Sign In to Access Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
