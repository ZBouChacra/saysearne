import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Settings as SettingsIcon, Moon, Sun, Bell, Loader2, Globe, User, Shield } from "lucide-react";

export default function Settings() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();
  const { t, lang, setLang } = useLanguage();

  if (loading) return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-10 border-b border-border/30">
        <div className="container">
          <div className="flex items-center gap-4 animate-slide-up">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-purple-vivid flex items-center justify-center shadow-lg shadow-primary/20">
              <SettingsIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">{t("settings.title")}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{t("settings.themeDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 flex-1">
        <div className="max-w-2xl space-y-6">
          {/* Appearance */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              </div>
              <h2 className="font-serif text-xl font-bold">{t("settings.theme")}</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">{theme === "dark" ? t("settings.darkMode") : t("settings.lightMode")}</Label>
                <p className="text-sm text-muted-foreground">{t("settings.themeDesc")}</p>
              </div>
              {switchable && toggleTheme && (
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              )}
            </div>
          </div>

          {/* Language */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-gold" />
              </div>
              <h2 className="font-serif text-xl font-bold">{t("settings.language")}</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">{t("settings.language")}</Label>
                <p className="text-sm text-muted-foreground">{t("settings.languageDesc")}</p>
              </div>
              <Select value={lang} onValueChange={(v) => setLang(v as "en" | "ar")}>
                <SelectTrigger className="w-40 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-serif text-xl font-bold">{t("settings.notifications")}</h2>
            </div>
            <div className="space-y-1">
              {[
                { label: t("settings.appointmentReminders"), desc: t("settings.appointmentRemindersDesc") },
                { label: t("settings.newMessages"), desc: t("settings.newMessagesDesc") },
                { label: t("settings.alertMatches"), desc: t("settings.alertMatchesDesc") },
                { label: t("settings.reviewNotifs"), desc: t("settings.reviewNotifsDesc") },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                  <div>
                    <Label className="text-sm font-semibold">{item.label}</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>

          {/* Account */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-serif text-xl font-bold">{t("settings.account")}</h2>
            </div>
            <div className="space-y-1">
              {[
                { label: t("settings.name"), value: user.name || t("settings.notSet") },
                { label: t("settings.email"), value: user.email || t("settings.notSet") },
                { label: t("settings.role"), value: user.role, capitalize: true },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-3 border-b border-border/40 last:border-0 text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-medium ${item.capitalize ? "capitalize" : ""}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
