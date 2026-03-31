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
  Home, Search, MessageSquare, Bell, User, Settings, Info, Phone,
  LogOut, Moon, Sun, Menu, X, Shield, Calendar, Sparkles
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();
  const { t, lang, setLang, isRTL } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  const publicLinks = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/search", label: t("nav.search"), icon: Search },
    { href: "/about", label: t("nav.about"), icon: Info },
    { href: "/contact", label: t("nav.contact"), icon: Phone },
  ];

  const authLinks = [
    { href: "/profile", label: t("nav.profile"), icon: User },
    { href: "/appointments", label: t("nav.appointments"), icon: Calendar },
    { href: "/chats", label: t("nav.chats"), icon: MessageSquare },
    { href: "/alerts", label: t("nav.alerts"), icon: Bell },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-purple-vivid flex items-center justify-center text-primary-foreground font-serif font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
            S
          </div>
          <span className="font-serif text-xl font-bold tracking-tight hidden sm:block bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
            SaySerné
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {publicLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={location === link.href ? "default" : "ghost"}
                size="sm"
                className={`gap-2 rounded-full px-4 transition-all ${
                  location === link.href
                    ? "shadow-md"
                    : "hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1.5">
          {/* Language Switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="h-9 w-9 rounded-full hover:bg-primary/10"
            title={lang === "en" ? "العربية" : "English"}
          >
            <span className="text-xs font-bold">{lang === "en" ? "ع" : "EN"}</span>
          </Button>

          {switchable && (
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-full hover:bg-primary/10">
              {theme === "dark" ? <Sun className="h-4 w-4 text-gold" /> : <Moon className="h-4 w-4 text-primary" />}
            </Button>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 rounded-full hover:bg-primary/10">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/30">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt="" className="object-cover h-full w-full rounded-full" />
                    ) : (
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-purple-vivid text-primary-foreground font-bold">
                        {user?.firstName?.charAt(0) || user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
                    {user?.firstName || user?.name || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56 rounded-xl shadow-xl border-border/50">
                {authLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <DropdownMenuItem className="gap-2.5 cursor-pointer rounded-lg mx-1 my-0.5">
                      <link.icon className="h-4 w-4 text-primary" />
                      {link.label}
                    </DropdownMenuItem>
                  </Link>
                ))}
                {user?.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <Link href="/admin">
                      <DropdownMenuItem className="gap-2.5 cursor-pointer rounded-lg mx-1 my-0.5">
                        <Shield className="h-4 w-4 text-gold" />
                        {t("nav.admin")}
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2.5 cursor-pointer text-destructive rounded-lg mx-1 my-0.5">
                  <LogOut className="h-4 w-4" />
                  {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              className="gap-2 rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90 shadow-md"
              onClick={() => { window.location.href = getLoginUrl(); }}
            >
              <Sparkles className="h-4 w-4" />
              {t("nav.signIn")}
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-full"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl p-4 space-y-1 animate-slide-up">
          {publicLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <Button
                variant={location === link.href ? "default" : "ghost"}
                className="w-full justify-start gap-2.5 rounded-lg"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
          {isAuthenticated && authLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2.5 rounded-lg">
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
