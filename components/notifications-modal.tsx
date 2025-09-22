"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/translations"

interface NotificationsModalProps {
  onClose: () => void
}

export function NotificationsModal({ onClose }: NotificationsModalProps) {
  const { t } = useTranslation()

  const mockNotifications = [
    {
      id: 1,
      title: t("notifications.applicationSaved.title"),
      summary: t("notifications.applicationSaved.summary"),
      type: "info",
      timestamp: t("notifications.timeAgo.hoursAgo", { count: 2 }),
      read: false,
    },
    {
      id: 2,
      title: t("notifications.documentRequired.title"),
      summary: t("notifications.documentRequired.summary"),
      type: "warning",
      timestamp: t("notifications.timeAgo.daysAgo", { count: 1 }),
      read: false,
    },
    {
      id: 3,
      title: t("notifications.applicationSubmitted.title"),
      summary: t("notifications.applicationSubmitted.summary"),
      type: "success",
      timestamp: t("notifications.timeAgo.daysAgo", { count: 3 }),
      read: true,
    },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case "info":
      default:
        return <Bell className="w-4 h-4 text-blue-600" />
    }
  }

  const handleNotificationClick = (notificationId: number) => {
    // Navigate to notifications tab in account dashboard
    window.location.href = `/account?tab=notifications&notification=${notificationId}`
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Modal */}
      <Card className="absolute top-12 right-0 w-80 z-50 shadow-lg border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-4 h-4" />
            {t("notifications.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-64">
            <div className="space-y-1 p-4 pt-0">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{notification.title}</p>
                      {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{notification.summary}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
              <Link href="/account?tab=notifications">{t("notifications.viewAll")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
