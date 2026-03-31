import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search, MessageSquare, Bell, User, Settings, Info, Phone,
  LogOut, Moon, Sun, Menu, X, Shield, Calendar, ChevronDown
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663028917317/fSXYjnqatsqbzh69FLd2k9/pasted_file_6EBrEK_SaySerné_a891392f.png";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();
  const { t, lang, setLang, isRTL } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { data: unread } = trpc.chat.unreadCount.useQuery(undefined, { enabled: isAuthenticated });

  const navLinks = [
    { href: "/search", label: t("nav.search"), icon: Search },
    { href: "/about", label: t("nav.about"), icon: Info },
    { href: "/contact", label: t("nav.contact"), icon: Phone },
  ];

  const authLinks = [
    { href: "/appointments", label: t("nav.appointments"), icon: Calendar },
    { href: "/chats", label: t("nav.chats"), icon: MessageSquare, badge: unread },
    { href: "/alerts", label: t("nav.alerts"), icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/60">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src={LOGO_URL} alt="SaySerné" className="h-10 w-10 rounded-lg object-cover" />
            <span className="font-serif text-xl font-bold text-foreground hidden sm:block">
              Say<span className="text-primary">Serné</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <button className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}>
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </button>
              </Link>
            ))}
            {isAuthenticated && authLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <button className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}>
                  <link.icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{link.label}</span>
                  {link.badge && Number(link.badge) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                      {Number(link.badge) > 9 ? '9+' : link.badge}
                    </span>
                  )}
                </button>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            {/* Language toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="h-8 w-8 rounded-lg hover:bg-muted/50"
              title={lang === "en" ? "العربية" : "English"}
            >
              <span className="text-xs font-bold">{lang === "en" ? "ع" : "EN"}</span>
            </Button>

            {/* Theme toggle */}
            {switchable && (
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 rounded-lg hover:bg-muted/50">
                {theme === "dark" ? <Sun className="h-4 w-4 text-accent" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt="" className="object-cover h-full w-full rounded-full" />
                      ) : (
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground font-bold">
                          {user?.firstName?.charAt(0) || user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">{user?.firstName || user?.name || "User"}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56 rounded-xl shadow-xl border-border/50">
                  <div className="px-3 py-2.5 border-b border-border/50">
                    <p className="font-medium text-sm truncate">{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <Link href="/profile">
                    <DropdownMenuItem className="gap-2.5 cursor-pointer rounded-lg mx-1 my-0.5">
                      <User className="h-4 w-4 text-muted-foreground" /> {t("nav.profile")}
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="gap-2.5 cursor-pointer rounded-lg mx-1 my-0.5">
                      <Settings className="h-4 w-4 text-muted-foreground" /> {t("nav.settings")}
                    </DropdownMenuItem>
                  </Link>
                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <Link href="/admin">
                        <DropdownMenuItem className="gap-2.5 cursor-pointer rounded-lg mx-1 my-0.5">
                          <Shield className="h-4 w-4 text-accent" /> {t("nav.admin")}
                        </DropdownMenuItem>
                      </Link>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="gap-2.5 cursor-pointer text-destructive rounded-lg mx-1 my-0.5">
                    <LogOut className="h-4 w-4" /> {t("nav.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4"
                onClick={() => { window.location.href = getLoginUrl(); }}
              >
                {t("nav.signIn")}
              </Button>
            )}

            {/* Mobile toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background animate-slide-up">
          <div className="container py-3 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <button className={`w-full text-start px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 transition-colors ${
                  location === link.href ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/50'
                }`}>
                  <link.icon className="h-4 w-4" /> {link.label}
                </button>
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <div className="border-t border-border/30 my-2" />
                {authLinks.map(link => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                    <button className={`w-full text-start px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 transition-colors ${
                      location === link.href ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/50'
                    }`}>
                      <link.icon className="h-4 w-4" /> {link.label}
                      {link.badge && Number(link.badge) > 0 && (
                        <span className="h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                          {link.badge}
                        </span>
                      )}
                    </button>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
