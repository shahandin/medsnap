import Link from "next/link"
import { Shield } from "lucide-react"
import { useTranslation } from "@/contexts/translation-context"

export function SiteFooter() {
  const { t } = useTranslation()

  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">BB</span>
              </div>
              <span className="font-bold">{t("footer.brandName")}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">{t("footer.services")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/prescreening" className="text-muted-foreground hover:text-primary">
                  {t("footer.applyForBenefits")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  {t("footer.learnMore")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">{t("footer.support")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary">
                  {t("footer.helpCenter")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  {t("footer.contactUs")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">{t("footer.legal")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  {t("footer.termsOfService")}
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-muted-foreground hover:text-primary">
                  {t("footer.accessibility")}
                </Link>
              </li>
              <li>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span className="text-xs font-medium">{t("footer.hipaaCompliant")}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">{t("footer.hipaaCompliantPlatform")}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t("footer.copyright")}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
