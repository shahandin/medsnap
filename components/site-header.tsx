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
    id?: string
  } | null
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const pathname = usePathname()
  const [userInitials, setUserInitials] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true) // Mock data - would come from API
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    const getUserInitials = async () => {
      if (user) {
        try {
          // First try to get initials from current user email
          if (user.email) {
            const emailParts = user.email.split("@")[0] || ""
            if (emailParts.length >= 2) {
              const initials = emailParts.substring(0, 2).toUpperCase()
              setUserInitials(initials)
              return
            }
          }

          // Only try application data as fallback if email doesn't work
          const result = await loadApplicationProgress()
          if (result.data?.application_data?.personalInfo) {
            const { firstName, lastName } = result.data.application_data.personalInfo
            if (firstName && lastName) {
              const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
              setUserInitials(initials)
              return
            }
          }

          // Final fallback
          const emailParts = user.email?.split("@")[0] || ""
          if (emailParts.length >= 1) {
            const initials = emailParts.charAt(0).toUpperCase() + "U"
            setUserInitials(initials)
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
    { name: "Apply for Benefits", href: "/application-choice" },
    { name: "Dashboard", href: "/account" },
    { name: "About", href: "/about" },
  ]

  const navigation = user ? authenticatedNavigation : publicNavigation

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-4 sm:space-x-10">
          <Link
            href="/"
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-90 transition-all duration-200 group"
          >
            <div className="flex items-center">
              <span className="font-heading font-bold text-xl sm:text-2xl text-foreground group-hover:text-primary transition-colors duration-200">
                Benefit<span className="text-primary">Bridge</span>
              </span>
            </div>
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

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200"
            aria-label="Toggle mobile menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div
                className={`w-full h-0.5 bg-current transition-all duration-200 ${showMobileMenu ? "rotate-45 translate-y-1.5" : ""}`}
              />
              <div
                className={`w-full h-0.5 bg-current transition-all duration-200 ${showMobileMenu ? "opacity-0" : ""}`}
              />
              <div
                className={`w-full h-0.5 bg-current transition-all duration-200 ${showMobileMenu ? "-rotate-45 -translate-y-1.5" : ""}`}
              />
            </div>
          </button>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 sm:p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200 hover:shadow-sm"
                >
                  <span className="text-base sm:text-lg">🔔</span>
                  {hasUnreadNotifications && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full shadow-sm animate-pulse"></div>
                  )}
                </button>
                {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
              </div>

              <Link href="/account">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 flex items-center justify-center cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg">
                  <span className="text-primary-foreground font-semibold text-xs sm:text-sm">{userInitials}</span>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg px-3 sm:px-4 py-2 font-medium transition-all duration-200 text-sm"
              >
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground rounded-lg px-4 sm:px-6 py-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm"
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {showMobileMenu && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm">
          <nav className="container px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                className={cn(
                  "block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200",
                  pathname === item.href
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
