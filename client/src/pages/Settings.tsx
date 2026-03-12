import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Settings as SettingsIcon, Moon, Sun, Bell, Loader2, Globe } from "lucide-react";

export default function Settings() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();
  const { t, lang, setLang } = useLanguage();

  if (loading) return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <h1 className="font-serif text-3xl font-bold mb-6 flex items-center gap-2">
          <SettingsIcon className="h-7 w-7 text-primary" /> {t("settings.title")}
        </h1>

        <div className="max-w-2xl space-y-6">
          {/* Appearance */}
          <div className="border border-border bg-card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">{t("settings.theme")}</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                <div>
                  <Label className="text-base">{theme === "dark" ? t("settings.darkMode") : t("settings.lightMode")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.themeDesc")}</p>
                </div>
              </div>
              {switchable && toggleTheme && (
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              )}
            </div>
          </div>

          {/* Language */}
          <div className="border border-border bg-card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">{t("settings.language")}</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <Label className="text-base">{t("settings.language")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.languageDesc")}</p>
                </div>
              </div>
              <Select value={lang} onValueChange={(v) => setLang(v as "en" | "ar")}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notifications */}
          <div className="border border-border bg-card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">{t("settings.notifications")}</h2>
            <div className="space-y-4">
              {[
                { label: t("settings.appointmentReminders"), desc: t("settings.appointmentRemindersDesc") },
                { label: t("settings.newMessages"), desc: t("settings.newMessagesDesc") },
                { label: t("settings.alertMatches"), desc: t("settings.alertMatchesDesc") },
                { label: t("settings.reviewNotifs"), desc: t("settings.reviewNotifsDesc") },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <Label className="text-base">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>

          {/* Account */}
          <div className="border border-border bg-card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">{t("settings.account")}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">{t("settings.name")}</span>
                <span>{user.name || t("settings.notSet")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">{t("settings.email")}</span>
                <span>{user.email || t("settings.notSet")}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">{t("settings.role")}</span>
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
