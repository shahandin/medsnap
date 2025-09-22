"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useTranslation } from "@/contexts/translation-context"

export default function ApplicationSuccessPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [])

  const referenceNumber = `BEN-${Date.now().toString().slice(-8)}`
  const submissionDate = new Date().toLocaleDateString()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} />

      <main className="flex-1 bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {!user && (
            <Alert className="mb-6 border-orange-300 bg-orange-50">
              <span className="text-orange-600">⚠️</span>
              <AlertDescription className="text-orange-800">{t("success.signInWarning")}</AlertDescription>
            </Alert>
          )}

          <div className="text-center mb-8">
            <div className="text-8xl mb-6">✅</div>
            <h1 className="text-4xl font-bold text-green-800 mb-4">{t("success.title")}</h1>
            <p className="text-xl text-gray-600">{t("success.subtitle")}</p>
          </div>

          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <span className="text-xl">📄</span>
                {t("success.applicationDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700">{t("success.referenceNumber")}</p>
                  <p className="text-lg font-mono bg-white px-3 py-1 rounded border">{referenceNumber}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">{t("success.submissionDate")}</p>
                  <p className="text-lg">{submissionDate}</p>
                </div>
              </div>
              <Alert className="bg-green-100 border-green-300">
                <span className="text-green-600">⚠️</span>
                <AlertDescription className="text-green-800">{t("success.saveReferenceNote")}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                {t("success.whatHappensNext.title")}
              </CardTitle>
              <CardDescription>{t("success.whatHappensNext.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("success.whatHappensNext.step1.title")}</h3>
                    <p className="text-gray-600 text-sm">{t("success.whatHappensNext.step1.description")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("success.whatHappensNext.step2.title")}</h3>
                    <p className="text-gray-600 text-sm">{t("success.whatHappensNext.step2.description")}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{t("success.whatHappensNext.step3.title")}</h3>
                    <p className="text-gray-600 text-sm">{t("success.whatHappensNext.step3.description")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <span className="text-xl">⚠️</span>
                {t("success.importantInfo.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📧</span>
                  <div>
                    <p className="font-medium">{t("success.importantInfo.checkEmail.title")}</p>
                    <p className="text-sm text-gray-600">{t("success.importantInfo.checkEmail.description")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📞</span>
                  <div>
                    <p className="font-medium">{t("success.importantInfo.keepContactUpdated.title")}</p>
                    <p className="text-sm text-gray-600">{t("success.importantInfo.keepContactUpdated.description")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">📄</span>
                  <div>
                    <p className="font-medium">{t("success.importantInfo.prepareDocuments.title")}</p>
                    <p className="text-sm text-gray-600">{t("success.importantInfo.prepareDocuments.description")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t("success.quickActions.title")}</CardTitle>
              <CardDescription>{t("success.quickActions.subtitle")}</CardDescription>
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
                          <p className="font-medium">{t("success.quickActions.viewStatus.title")}</p>
                          <p className="text-sm text-gray-600">{t("success.quickActions.viewStatus.description")}</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📄</span>
                      <div className="text-left">
                        <p className="font-medium">{t("success.quickActions.viewStatus.title")}</p>
                        <p className="text-sm text-gray-600">{t("success.quickActions.viewStatus.signInRequired")}</p>
                      </div>
                    </div>
                  )}
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start bg-transparent" disabled>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⬇️</span>
                    <div className="text-left">
                      <p className="font-medium">{t("success.quickActions.downloadCopy.title")}</p>
                      <p className="text-sm text-gray-600">{t("success.quickActions.downloadCopy.comingSoon")}</p>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start bg-transparent" disabled>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div className="text-left">
                      <p className="font-medium">{t("success.quickActions.uploadDocuments.title")}</p>
                      <p className="text-sm text-gray-600">{t("success.quickActions.uploadDocuments.comingSoon")}</p>
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
                          <p className="font-medium">{t("success.quickActions.learnBenefits.title")}</p>
                          <p className="text-sm text-gray-600">{t("success.quickActions.learnBenefits.description")}</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🔗</span>
                      <div className="text-left">
                        <p className="font-medium">{t("success.quickActions.learnBenefits.title")}</p>
                        <p className="text-sm text-gray-600">
                          {t("success.quickActions.learnBenefits.signInRequired")}
                        </p>
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
                {t("success.needHelp.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">{t("success.needHelp.subtitle")}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">{t("success.needHelp.generalSupport.title")}</h4>
                    <p className="text-sm text-gray-600 mb-2">{t("success.needHelp.generalSupport.description")}</p>
                    <Button variant="outline" size="sm" disabled>
                      {t("success.needHelp.generalSupport.button")}
                    </Button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">{t("success.needHelp.stateAgency.title")}</h4>
                    <p className="text-sm text-gray-600 mb-2">{t("success.needHelp.stateAgency.description")}</p>
                    <Button variant="outline" size="sm" disabled>
                      {t("success.needHelp.stateAgency.button")}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            {user ? (
              <Button asChild size="lg">
                <Link href="/account">{t("success.goToDashboard")}</Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link href="/signin">{t("success.signInToDashboard")}</Link>
              </Button>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
