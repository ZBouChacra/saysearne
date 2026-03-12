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

  if (loading) return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>;
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
      <div className="container py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-3xl font-bold flex items-center gap-2">
            <Bell className="h-7 w-7 text-primary" /> {t("alerts.title")}
          </h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> {t("alerts.create")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif">{t("alerts.createAlert")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t("alerts.name")}</Label>
                  <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5" placeholder={t("alerts.namePlaceholder")} />
                </div>
                <div>
                  <Label>{t("search.category")}</Label>
                  <Select value={form.categoryId || "any"} onValueChange={(v) => setForm(f => ({ ...f, categoryId: v === "any" ? "" : v }))}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("search.any")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t("search.allCategories")}</SelectItem>
                      {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{lang === "ar" && c.nameAr ? c.nameAr : c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("search.minStars")}</Label>
                  <Select value={form.minStars || "any"} onValueChange={(v) => setForm(f => ({ ...f, minStars: v === "any" ? "" : v }))}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("search.any")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t("search.any")}</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("alerts.frequency")}</Label>
                  <Select value={form.frequency} onValueChange={(v: any) => setForm(f => ({ ...f, frequency: v }))}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t("alerts.daily")}</SelectItem>
                      <SelectItem value="weekly">{t("alerts.weekly")}</SelectItem>
                      <SelectItem value="monthly">{t("alerts.monthly")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t("alerts.creating") : t("alerts.create")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const criteria = alert.searchCriteria as any;
              const cat = categories?.find(c => c.id === criteria?.categoryId);
              return (
                <div key={alert.id} className="border border-border bg-card p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{alert.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {cat ? (lang === "ar" && cat.nameAr ? cat.nameAr : cat.name) : t("search.allCategories")}
                      {criteria?.minStars ? ` · ${criteria.minStars}+ ${t("search.rating")}` : ""}
                      {` · ${t(`alerts.${alert.frequency}`)}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/search?categoryId=${criteria?.categoryId || ""}&minStars=${criteria?.minStars || ""}`}>
                      <Button variant="outline" size="sm" className="gap-1"><Play className="h-3 w-3" /> {t("alerts.run")}</Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate({ id: alert.id })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t("alerts.noAlerts")}</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
