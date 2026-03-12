import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { User, Briefcase, Plus, Trash2, Save, Loader2, Clock, Building2, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function Profile() {
  const { user, loading } = useAuth();
  const { t, lang } = useLanguage();
  const DAYS = lang === "ar" ? DAYS_AR : DAYS_EN;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <h1 className="font-serif text-3xl font-bold mb-6">{t("profile.title")}</h1>
        <Tabs defaultValue="personal">
          <TabsList>
            <TabsTrigger value="personal" className="gap-2"><User className="h-4 w-4" /> {t("profile.personalInfo")}</TabsTrigger>
            <TabsTrigger value="professions" className="gap-2"><Briefcase className="h-4 w-4" /> {t("profile.myServices")}</TabsTrigger>
            <TabsTrigger value="availability" className="gap-2"><Clock className="h-4 w-4" /> {t("profile.availability")}</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4"><PersonalInfoForm /></TabsContent>
          <TabsContent value="professions" className="mt-4"><ProfessionsManager days={DAYS} /></TabsContent>
          <TabsContent value="availability" className="mt-4"><AvailabilityManager days={DAYS} /></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

function PersonalInfoForm() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    sex: user?.sex || "",
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
    nationality: user?.nationality || "",
    country: user?.country || "",
    bio: user?.bio || "",
  });

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => { toast.success(t("profile.saved")); utils.auth.me.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { ...form };
    if (!data.sex) delete data.sex;
    if (!data.dateOfBirth) delete data.dateOfBirth;
    updateMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-card p-6 space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>{t("profile.firstName")}</Label>
          <Input value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} className="mt-1.5" />
        </div>
        <div>
          <Label>{t("profile.lastName")}</Label>
          <Input value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} className="mt-1.5" />
        </div>
        <div>
          <Label>{t("profile.phone")}</Label>
          <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1.5" />
        </div>
        <div>
          <Label>{t("profile.gender")}</Label>
          <Select value={form.sex || "unset"} onValueChange={(v) => setForm(f => ({ ...f, sex: v === "unset" ? "" : v }))}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("profile.select")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">{t("profile.preferNotToSay")}</SelectItem>
              <SelectItem value="male">{t("search.male")}</SelectItem>
              <SelectItem value="female">{t("search.female")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t("profile.dateOfBirth")}</Label>
          <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} className="mt-1.5" />
        </div>
        <div>
          <Label>{t("profile.nationality")}</Label>
          <Input value={form.nationality} onChange={(e) => setForm(f => ({ ...f, nationality: e.target.value }))} className="mt-1.5" />
        </div>
        <div>
          <Label>{t("profile.country")}</Label>
          <Input value={form.country} onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))} className="mt-1.5" placeholder={t("profile.countryPlaceholder")} />
        </div>
      </div>
      <div>
        <Label>{t("profile.bio")}</Label>
        <Textarea value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} className="mt-1.5" />
      </div>
      <Button type="submit" className="gap-2" disabled={updateMutation.isPending}>
        <Save className="h-4 w-4" /> {updateMutation.isPending ? t("profile.saving") : t("profile.saveChanges")}
      </Button>
    </form>
  );
}

function ProfessionsManager({ days }: { days: string[] }) {
  const { t, lang } = useLanguage();
  const { data: myProfs, isLoading } = trpc.profile.myProfessions.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: allServices } = trpc.categories.allServices.useQuery();
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProf, setNewProf] = useState({
    categoryId: 0, serviceId: 0, costPerHour: "", yearsOfExperience: 0,
    website: "", country: "", city: "",
    hasTeam: false, teamSize: 0,
    hasOffice: false, officeAddress: "", officeCity: "", officeCountry: "",
    geographicAreas: "",
  });

  const addMutation = trpc.profile.addProfession.useMutation({
    onSuccess: () => { toast.success(t("profile.serviceAdded")); utils.profile.myProfessions.invalidate(); setDialogOpen(false); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.profile.deleteProfession.useMutation({
    onSuccess: () => { toast.success(t("profile.serviceRemoved")); utils.profile.myProfessions.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const filteredServices = allServices?.filter(s => s.categoryId === newProf.categoryId) || [];

  const handleAdd = () => {
    if (!newProf.categoryId || !newProf.serviceId) { toast.error(t("profile.selectCatAndService")); return; }
    if (!newProf.country) { toast.error(t("profile.countryRequired")); return; }
    addMutation.mutate({
      categoryId: newProf.categoryId,
      serviceId: newProf.serviceId,
      costPerHour: newProf.costPerHour || undefined,
      yearsOfExperience: newProf.yearsOfExperience || undefined,
      website: newProf.website || undefined,
      country: newProf.country || undefined,
      city: newProf.city || undefined,
      hasTeam: newProf.hasTeam,
      teamSize: newProf.teamSize || undefined,
      hasOffice: newProf.hasOffice,
      officeAddress: newProf.officeAddress || undefined,
      officeCity: newProf.officeCity || undefined,
      officeCountry: newProf.officeCountry || undefined,
      geographicAreas: newProf.geographicAreas ? newProf.geographicAreas.split(",").map(s => s.trim()) : undefined,
    });
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{myProfs?.length || 0} {t("profile.servicesListed")}</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> {t("profile.addService")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-serif">{t("profile.addService")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("profile.category")}</Label>
                <Select value={newProf.categoryId ? newProf.categoryId.toString() : "0"} onValueChange={(v) => setNewProf(f => ({ ...f, categoryId: Number(v), serviceId: 0 }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("profile.selectCategory")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0" disabled>{t("profile.selectCategory")}</SelectItem>
                    {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{lang === "ar" && c.nameAr ? c.nameAr : c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("profile.service")}</Label>
                <Select value={newProf.serviceId ? newProf.serviceId.toString() : "0"} onValueChange={(v) => setNewProf(f => ({ ...f, serviceId: Number(v) }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("profile.selectService")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0" disabled>{t("profile.selectService")}</SelectItem>
                    {filteredServices.map(s => <SelectItem key={s.id} value={s.id.toString()}>{lang === "ar" && s.nameAr ? s.nameAr : s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Country & City - Required per profession */}
              <div className="border border-border p-4 space-y-3 bg-muted/30">
                <h4 className="font-semibold text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> {t("profile.workLocation")}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t("profile.country")} *</Label>
                    <Input value={newProf.country} onChange={(e) => setNewProf(f => ({ ...f, country: e.target.value }))} className="mt-1.5" placeholder={t("profile.countryPlaceholder")} />
                  </div>
                  <div>
                    <Label>{t("profile.city")}</Label>
                    <Input value={newProf.city} onChange={(e) => setNewProf(f => ({ ...f, city: e.target.value }))} className="mt-1.5" placeholder={t("profile.cityPlaceholder")} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("profile.costPerHour")}</Label>
                  <Input type="number" value={newProf.costPerHour} onChange={(e) => setNewProf(f => ({ ...f, costPerHour: e.target.value }))} className="mt-1.5" />
                </div>
                <div>
                  <Label>{t("profile.yearsOfExperience")}</Label>
                  <Input type="number" value={newProf.yearsOfExperience || ""} onChange={(e) => setNewProf(f => ({ ...f, yearsOfExperience: Number(e.target.value) }))} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>{t("profile.website")}</Label>
                <Input value={newProf.website} onChange={(e) => setNewProf(f => ({ ...f, website: e.target.value }))} className="mt-1.5" placeholder="https://..." />
              </div>

              {/* Team */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={newProf.hasTeam} onCheckedChange={(v) => setNewProf(f => ({ ...f, hasTeam: v }))} />
                  <Label>{t("profile.hasTeam")}</Label>
                </div>
                {newProf.hasTeam && (
                  <div className="flex items-center gap-2">
                    <Label>{t("profile.teamSize")}:</Label>
                    <Input type="number" className="w-20" value={newProf.teamSize || ""} onChange={(e) => setNewProf(f => ({ ...f, teamSize: Number(e.target.value) }))} />
                  </div>
                )}
              </div>

              {/* Office */}
              <div className="border border-border p-4 space-y-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Switch checked={newProf.hasOffice} onCheckedChange={(v) => setNewProf(f => ({ ...f, hasOffice: v }))} />
                  <Label className="font-semibold text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> {t("profile.hasOffice")}</Label>
                </div>
                {newProf.hasOffice && (
                  <div className="space-y-3">
                    <div>
                      <Label>{t("profile.officeAddress")}</Label>
                      <Input value={newProf.officeAddress} onChange={(e) => setNewProf(f => ({ ...f, officeAddress: e.target.value }))} className="mt-1.5" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>{t("profile.officeCity")}</Label>
                        <Input value={newProf.officeCity} onChange={(e) => setNewProf(f => ({ ...f, officeCity: e.target.value }))} className="mt-1.5" />
                      </div>
                      <div>
                        <Label>{t("profile.officeCountry")}</Label>
                        <Input value={newProf.officeCountry} onChange={(e) => setNewProf(f => ({ ...f, officeCountry: e.target.value }))} className="mt-1.5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label>{t("profile.geographicAreas")}</Label>
                <Input value={newProf.geographicAreas} onChange={(e) => setNewProf(f => ({ ...f, geographicAreas: e.target.value }))} className="mt-1.5" placeholder="New York, Los Angeles" />
              </div>

              <Button onClick={handleAdd} className="w-full" disabled={addMutation.isPending}>
                {addMutation.isPending ? t("profile.adding") : t("profile.addService")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {myProfs && myProfs.length > 0 ? (
        <div className="space-y-3">
          {myProfs.map((prof) => {
            const cat = categories?.find(c => c.id === prof.categoryId);
            const svc = allServices?.find(s => s.id === prof.serviceId);
            return (
              <div key={prof.id} className="border border-border bg-card p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{lang === "ar" && svc?.nameAr ? svc.nameAr : svc?.name || t("profile.service")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {lang === "ar" && cat?.nameAr ? cat.nameAr : cat?.name} &middot; ${prof.costPerHour}/hr &middot; {prof.yearsOfExperience}y exp
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {[prof.city, prof.country].filter(Boolean).join(", ") || t("profile.noLocation")}
                    {prof.hasOffice && (
                      <span className="ms-2 flex items-center gap-1"><Building2 className="h-3 w-3" /> {t("profProfile.office")}</span>
                    )}
                    {prof.hasTeam && prof.teamSize && (
                      <span className="ms-2">&middot; {t("common.team")}: {prof.teamSize}</span>
                    )}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => deleteMutation.mutate({ id: prof.id })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">{t("profile.noServicesYet")}</p>
        </div>
      )}
    </div>
  );
}

function AvailabilityManager({ days }: { days: string[] }) {
  const { t } = useLanguage();
  const { data: currentAvail, isLoading } = trpc.profile.getAvailability.useQuery();
  const utils = trpc.useUtils();
  const [slots, setSlots] = useState<{ dayOfWeek: number; startTime: string; endTime: string }[]>([]);

  useEffect(() => {
    if (currentAvail) setSlots(currentAvail.map(a => ({ dayOfWeek: a.dayOfWeek, startTime: a.startTime, endTime: a.endTime })));
  }, [currentAvail]);

  const saveMutation = trpc.profile.setAvailability.useMutation({
    onSuccess: () => { toast.success(t("profile.availabilitySaved")); utils.profile.getAvailability.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const addSlot = () => setSlots(s => [...s, { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }]);
  const removeSlot = (i: number) => setSlots(s => s.filter((_, idx) => idx !== i));
  const updateSlot = (i: number, key: string, value: any) => setSlots(s => s.map((slot, idx) => idx === i ? { ...slot, [key]: value } : slot));

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{t("profile.setAvailability")}</p>
        <Button variant="outline" size="sm" className="gap-1" onClick={addSlot}><Plus className="h-3 w-3" /> {t("profile.addSlot")}</Button>
      </div>

      {slots.length > 0 ? (
        <div className="space-y-3 mb-4">
          {slots.map((slot, i) => (
            <div key={i} className="flex items-center gap-3 border border-border bg-card p-3">
              <Select value={slot.dayOfWeek.toString()} onValueChange={(v) => updateSlot(i, "dayOfWeek", Number(v))}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {days.map((d, idx) => <SelectItem key={idx} value={idx.toString()}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="time" value={slot.startTime} onChange={(e) => updateSlot(i, "startTime", e.target.value)} className="w-32" />
              <span className="text-muted-foreground">{t("profile.to")}</span>
              <Input type="time" value={slot.endTime} onChange={(e) => updateSlot(i, "endTime", e.target.value)} className="w-32" />
              <Button variant="ghost" size="icon" onClick={() => removeSlot(i)} className="text-destructive shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-border mb-4">
          <p className="text-muted-foreground">{t("profile.noSlots")}</p>
        </div>
      )}

      <Button onClick={() => saveMutation.mutate({ slots })} className="gap-2" disabled={saveMutation.isPending}>
        <Save className="h-4 w-4" /> {saveMutation.isPending ? t("profile.saving") : t("profile.saveAvailability")}
      </Button>
    </div>
  );
}
