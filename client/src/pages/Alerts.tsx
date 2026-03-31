import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bell, Plus, Trash2, Play, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Alerts() {
  const { user, loading } = useAuth();
  const { t, lang } = useLanguage();
  const { data: alerts, isLoading } = trpc.alerts.list.useQuery(undefined, { enabled: !!user });
  const { data: categories } = trpc.categories.list.useQuery();
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", categoryId: "", minStars: "", frequency: "daily" as const });

  const createMutation = trpc.alerts.create.useMutation({
    onSuccess: () => { toast.success(t("alerts.created")); utils.alerts.list.invalidate(); setDialogOpen(false); setForm({ name: "", categoryId: "", minStars: "", frequency: "daily" }); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.alerts.delete.useMutation({
    onSuccess: () => { toast.success(t("alerts.deleted")); utils.alerts.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  if (loading) return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  const handleCreate = () => {
    if (!form.name) { toast.error(t("alerts.enterName")); return; }
    const criteria: any = {};
    if (form.categoryId) criteria.categoryId = Number(form.categoryId);
    if (form.minStars) criteria.minStars = Number(form.minStars);
    createMutation.mutate({ name: form.name, searchCriteria: criteria, frequency: form.frequency });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-10 border-b border-border/30">
        <div className="container">
          <div className="flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-purple-vivid flex items-center justify-center shadow-lg shadow-primary/20">
                <Bell className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold">{t("alerts.title")}</h1>
                <p className="text-muted-foreground text-sm mt-0.5">{alerts?.length || 0} {t("alerts.title").toLowerCase()}</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90 shadow-md shadow-primary/20 px-6 h-11">
                  <Plus className="h-4 w-4" /> {t("alerts.create")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-serif text-xl">{t("alerts.createAlert")}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">{t("alerts.name")}</Label>
                    <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5 rounded-lg h-11" placeholder={t("alerts.namePlaceholder")} />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("search.category")}</Label>
                    <Select value={form.categoryId || "any"} onValueChange={(v) => setForm(f => ({ ...f, categoryId: v === "any" ? "" : v }))}>
                      <SelectTrigger className="mt-1.5 rounded-lg h-11"><SelectValue placeholder={t("search.any")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{t("search.allCategories")}</SelectItem>
                        {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{lang === "ar" && c.nameAr ? c.nameAr : c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("search.minStars")}</Label>
                    <Select value={form.minStars || "any"} onValueChange={(v) => setForm(f => ({ ...f, minStars: v === "any" ? "" : v }))}>
                      <SelectTrigger className="mt-1.5 rounded-lg h-11"><SelectValue placeholder={t("search.any")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{t("search.any")}</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("alerts.frequency")}</Label>
                    <Select value={form.frequency} onValueChange={(v: any) => setForm(f => ({ ...f, frequency: v }))}>
                      <SelectTrigger className="mt-1.5 rounded-lg h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t("alerts.daily")}</SelectItem>
                        <SelectItem value="weekly">{t("alerts.weekly")}</SelectItem>
                        <SelectItem value="monthly">{t("alerts.monthly")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreate} size="lg" className="w-full rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90" disabled={createMutation.isPending}>
                    {createMutation.isPending ? t("alerts.creating") : t("alerts.create")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <div className="container py-8 flex-1">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const criteria = alert.searchCriteria as any;
              const cat = categories?.find(c => c.id === criteria?.categoryId);
              return (
                <div key={alert.id} className="bg-card border border-border/60 rounded-xl p-5 flex items-center justify-between hover:border-primary/30 transition-all hover:shadow-md group">
                  <div>
                    <h3 className="font-serif font-bold text-base group-hover:text-primary transition-colors">{alert.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {cat ? (lang === "ar" && cat.nameAr ? cat.nameAr : cat.name) : t("search.allCategories")}
                      {criteria?.minStars ? ` · ${criteria.minStars}+ ${t("search.rating")}` : ""}
                      {` · ${t(`alerts.${alert.frequency}`)}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/search?categoryId=${criteria?.categoryId || ""}&minStars=${criteria?.minStars || ""}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 rounded-full hover:bg-primary/5 hover:border-primary/40"><Play className="h-3.5 w-3.5" /> {t("alerts.run")}</Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-destructive rounded-lg" onClick={() => deleteMutation.mutate({ id: alert.id })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-muted/20">
            <Bell className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-lg">{t("alerts.noAlerts")}</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
