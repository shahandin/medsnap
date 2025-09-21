"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslation } from "@/contexts/translation-context"

interface AboutPageClientProps {
  user?: {
    id: string
    email?: string
  } | null
}

export function AboutPageClient({ user }: AboutPageClientProps) {
  const { t } = useTranslation()

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t("about.hero.title")}</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{t("about.hero.subtitle")}</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("about.mission.title")}</h2>
              <p className="text-lg text-gray-600">{t("about.mission.subtitle")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t("about.mission.bridgingGap.title")}</h3>
                <p className="text-gray-600 mb-6">{t("about.mission.bridgingGap.description1")}</p>
                <p className="text-gray-600">{t("about.mission.bridgingGap.description2")}</p>
              </div>
              <div className="bg-blue-50 p-8 rounded-lg">
                <div className="text-center">
                  <div className="text-6xl mb-4">❤️</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{t("about.mission.peopleFirst.title")}</h4>
                  <p className="text-gray-600">{t("about.mission.peopleFirst.description")}</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("about.services.title")}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("about.services.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <CardTitle>{t("about.services.medicaid.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t("about.services.medicaid.description")}</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <CardTitle>{t("about.services.snap.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t("about.services.snap.description")}</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🛡️</span>
                </div>
                <CardTitle>{t("about.services.secure.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t("about.services.secure.description")}</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⏰</span>
                </div>
                <CardTitle>{t("about.services.tracking.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t("about.services.tracking.description")}</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📞</span>
                </div>
                <CardTitle>{t("about.services.support.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t("about.services.support.description")}</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <CardTitle>{t("about.services.management.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t("about.services.management.description")}</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("about.howItWorks.title")}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("about.howItWorks.subtitle")}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("about.howItWorks.step1.title")}</h3>
                <p className="text-gray-600">{t("about.howItWorks.step1.description")}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("about.howItWorks.step2.title")}</h3>
                <p className="text-gray-600">{t("about.howItWorks.step2.description")}</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("about.howItWorks.step3.title")}</h3>
                <p className="text-gray-600">{t("about.howItWorks.step3.description")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("about.cta.title")}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">{t("about.cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href={user ? "/application" : "/auth/sign-up"}>{t("about.cta.startApplication")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              asChild
            >
              <Link href="/contact">{t("about.cta.contactSupport")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
