import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Settings as SettingsIcon, Moon, Sun, Bell, Loader2 } from "lucide-react";

export default function Settings() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();

  if (loading) return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <h1 className="font-serif text-3xl font-bold mb-6 flex items-center gap-2">
          <SettingsIcon className="h-7 w-7 text-primary" /> Settings
        </h1>

        <div className="max-w-2xl space-y-6">
          {/* Appearance */}
          <div className="border border-border bg-card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                <div>
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch between day and night themes</p>
                </div>
              </div>
              {switchable && toggleTheme && (
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="border border-border bg-card p-6">
            <h2 className="font-serif text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              {[
                { label: "Appointment Reminders", desc: "Get notified before upcoming appointments" },
                { label: "New Messages", desc: "Notifications for new chat messages" },
                { label: "Alert Matches", desc: "When new professionals match your saved alerts" },
                { label: "Review Notifications", desc: "When someone reviews your service" },
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
            <h2 className="font-serif text-xl font-semibold mb-4">Account</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Name</span>
                <span>{user.name || "Not set"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Email</span>
                <span>{user.email || "Not set"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Role</span>
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
