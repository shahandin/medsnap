import { createServerClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AboutPage() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About Benefits Access</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We're dedicated to simplifying the benefits application process and helping people access the support they
              need with dignity and ease.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-lg text-gray-600">
                  To create a more accessible, user-friendly experience for applying to essential government benefit
                  programs.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Bridging the Gap</h3>
                  <p className="text-gray-600 mb-6">
                    Traditional government benefit applications can be complex, time-consuming, and difficult to
                    navigate. We've redesigned the experience from the ground up, focusing on clarity, accessibility,
                    and user empowerment.
                  </p>
                  <p className="text-gray-600">
                    Our platform guides users through each step of the application process with clear instructions,
                    helpful resources, and automatic progress saving, ensuring no one gets left behind.
                  </p>
                </div>
                <div className="bg-blue-50 p-8 rounded-lg">
                  <div className="text-center">
                    <div className="text-6xl mb-4">❤️</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">People-First Approach</h4>
                    <p className="text-gray-600">
                      Every design decision is made with real people and their needs in mind, ensuring dignity and
                      respect throughout the process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Provide</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our platform offers comprehensive support for accessing essential government benefit programs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📄</span>
                  </div>
                  <CardTitle>Medicaid Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Streamlined applications for Medicaid health insurance coverage, including eligibility screening and
                    document guidance.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <CardTitle>SNAP Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Easy-to-complete applications for SNAP (food assistance) benefits with household management and
                    income verification support.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <CardTitle>Secure Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Bank-level security and encryption protect your personal information throughout the application
                    process.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <CardTitle>Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Automatic progress saving allows you to complete applications at your own pace without losing
                    information.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📞</span>
                  </div>
                  <CardTitle>Expert Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Access to knowledgeable support staff and comprehensive resources to help you through any
                    challenges.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <CardTitle>Application Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track your application status, upload additional documents, and manage your benefits all in one
                    place.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our streamlined process makes applying for benefits simple and straightforward.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Create Account</h3>
                  <p className="text-gray-600">
                    Sign up with your email address and create a secure account to get started with your application.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Application</h3>
                  <p className="text-gray-600">
                    Follow our step-by-step guide to complete your application. Your progress is saved automatically.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Track & Manage</h3>
                  <p className="text-gray-600">
                    Monitor your application status and upload any additional documents through your account dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Take the first step towards accessing the benefits you need. Our platform is here to guide you every step
              of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href={user ? "/application" : "/auth/sign-up"}>Start Your Application</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                asChild
              >
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
