"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Home, User, Calendar, LogOut, Star, LayoutGrid, MessageSquare } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  // Function to determine if a link is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Home className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">HomeServe</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors ${
              isActive("/") 
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Services
          </Link>
          <Link 
            href="/categories" 
            className={`text-sm font-medium transition-colors ${
              isActive("/categories") 
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            Categories
          </Link>
          {user && (
            <>
              <Link 
                href="/bookings" 
                className={`text-sm font-medium transition-colors ${
                  isActive("/bookings") 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                My Bookings
              </Link>
              {user.role === "customer" && (
                <>
                  <Link 
                    href="/ratings" 
                    className={`text-sm font-medium transition-colors ${
                      isActive("/ratings") 
                        ? "text-primary font-semibold" 
                        : "text-muted-foreground hover:text-primary"
                  }`}
                  >
                    Rate Services
                  </Link>
                  <Link 
                    href="/support" 
                    className={`text-sm font-medium transition-colors ${
                      isActive("/support") 
                        ? "text-primary font-semibold" 
                        : "text-muted-foreground hover:text-primary"
                  }`}
                  >
                    Support
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/categories" className="cursor-pointer">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Categories
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings" className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                {user.role === "customer" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/ratings" className="cursor-pointer">
                        <Star className="mr-2 h-4 w-4" />
                        Rate Services
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/support" className="cursor-pointer">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Support
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}