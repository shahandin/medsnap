import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />

      <main className="flex-1">
        <section className="relative bg-white py-12 md:py-24 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-border/50 rounded-full px-3 md:px-4 py-2 mb-6 md:mb-8 shadow-sm">
              <span className="text-primary">✨</span>
              <span className="text-xs md:text-sm font-medium text-muted-foreground">
                Trusted by thousands nationwide
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-7xl font-heading font-bold text-foreground mb-6 md:mb-8 leading-tight px-2">
              Access Your Benefits with{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Streamlined applications for Medicaid and SNAP benefits. Get the support you need with our secure,
              easy-to-use platform designed for your success.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-xl px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                asChild
              >
                <Link href="/apply" className="flex items-center justify-center gap-2">
                  Apply for Benefits
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-2 border-border hover:border-primary/50 rounded-xl px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-medium hover:bg-muted/50 transition-all duration-200 bg-transparent"
                asChild
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 lg:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4 md:mb-6 px-2">
                Why Choose Benefit Bridge?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
                We've designed our platform to make applying for benefits as simple, secure, and stress-free as
                possible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-4">
              <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl text-primary">✓</span>
                  </div>
                  <CardTitle className="text-xl font-heading font-semibold">Easy Application</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed">
                    Step-by-step guidance through the entire application process with clear, intuitive instructions.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl text-secondary">🛡️</span>
                  </div>
                  <CardTitle className="text-xl font-heading font-semibold">Secure & Private</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed">
                    Your personal information is protected with bank-level security, encryption, and privacy controls.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl text-primary">🕒</span>
                  </div>
                  <CardTitle className="text-xl font-heading font-semibold">Auto-Save Progress</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed">
                    Your progress is automatically saved so you can complete your application at your own pace.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl text-secondary">🏢</span>
                  </div>
                  <CardTitle className="text-xl font-heading font-semibold">Complete Platform</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed">
                    One platform for everything: submit applications, make updates, renew benefits, respond to
                    notifications, and upload documents.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="relative py-12 md:py-24 lg:py-32 bg-white overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4 md:mb-6 px-2">
              Ready to Get Started?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Join thousands of people who have successfully applied for benefits through our secure, user-friendly
              platform. Your journey to accessing benefits starts here.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              asChild
            >
              <Link href="/apply" className="flex items-center justify-center gap-2">
                Start Your Application
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
