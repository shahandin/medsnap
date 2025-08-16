"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { loadApplicationProgress } from "@/lib/actions"
import { NotificationsModal } from "./notifications-modal"

interface SiteHeaderProps {
  user?: {
    email?: string
  } | null
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const pathname = usePathname()
  const [userInitials, setUserInitials] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true) // Mock data - would come from API

  useEffect(() => {
    const getUserInitials = async () => {
      if (user) {
        try {
          // Try to get initials from saved application data
          const result = await loadApplicationProgress()
          if (result.data?.application_data?.personalInfo) {
            const { firstName, lastName } = result.data.application_data.personalInfo
            if (firstName && lastName) {
              setUserInitials(`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase())
              return
            }
          }

          // Fallback to email initials if no application data
          const emailParts = user.email?.split("@")[0] || ""
          if (emailParts.length >= 2) {
            setUserInitials(emailParts.substring(0, 2).toUpperCase())
          } else {
            setUserInitials(emailParts.charAt(0).toUpperCase() + "U")
          }
        } catch (error) {
          // Fallback to email initials on error
          const emailParts = user.email?.split("@")[0] || ""
          if (emailParts.length >= 2) {
            setUserInitials(emailParts.substring(0, 2).toUpperCase())
          } else {
            setUserInitials("U")
          }
        }
      }
    }

    getUserInitials()
  }, [user])

  const publicNavigation = [{ name: "About", href: "/about" }]

  const authenticatedNavigation = [
    { name: "Apply for Benefits", href: "/application" },
    { name: "Dashboard", href: "/account" },
    { name: "About", href: "/about" },
  ]

  const navigation = user ? authenticatedNavigation : publicNavigation

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-20 items-center justify-between px-6">
        <div className="flex items-center space-x-10">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-all duration-200 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
              <span className="text-primary-foreground font-bold text-lg">BA</span>
            </div>
            <span className="font-heading font-bold text-2xl text-foreground">Benefits Access</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-200 hover:text-primary relative py-2 px-1",
                  pathname === item.href ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.name}
                {pathname === item.href && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 hover:shadow-sm"
                >
                  <span className="text-lg">🔔</span>
                  {hasUnreadNotifications && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full shadow-sm animate-pulse"></div>
                  )}
                </button>
                {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
              </div>

              <Link href="/account">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 flex items-center justify-center cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg">
                  <span className="text-primary-foreground font-semibold text-sm">{userInitials}</span>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg px-4 py-2 font-medium transition-all duration-200"
              >
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-lg px-6 py-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
