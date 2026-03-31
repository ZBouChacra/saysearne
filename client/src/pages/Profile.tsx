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
import { User, Briefcase, Plus, Trash2, Save, Loader2, Clock, Building2, MapPin, Sparkles } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

const COUNTRIES = ["Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bahrain","Bangladesh","Belgium","Brazil","Canada","Chile","China","Colombia","Czech Republic","Denmark","Egypt","Ethiopia","Finland","France","Germany","Ghana","Greece","Hungary","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kenya","Kuwait","Lebanon","Libya","Malaysia","Mexico","Morocco","Netherlands","New Zealand","Nigeria","Norway","Oman","Pakistan","Palestine","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Singapore","South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria","Taiwan","Thailand","Tunisia","Turkey","UAE","UK","Ukraine","USA","Vietnam","Yemen"];
const NATIONALITIES = ["Afghan","Albanian","Algerian","American","Argentinian","Australian","Austrian","Bahraini","Bangladeshi","Belgian","Brazilian","British","Canadian","Chilean","Chinese","Colombian","Czech","Danish","Dutch","Egyptian","Ethiopian","Filipino","Finnish","French","German","Ghanaian","Greek","Hungarian","Indian","Indonesian","Iranian","Iraqi","Irish","Israeli","Italian","Japanese","Jordanian","Kenyan","Kuwaiti","Lebanese","Libyan","Malaysian","Mexican","Moroccan","New Zealander","Nigerian","Norwegian","Omani","Pakistani","Palestinian","Peruvian","Polish","Portuguese","Qatari","Romanian","Russian","Saudi","Singaporean","South African","South Korean","Spanish","Sri Lankan","Sudanese","Swedish","Swiss","Syrian","Taiwanese","Thai","Tunisian","Turkish","Emirati","Ukrainian","Vietnamese","Yemeni"];
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "UAE": ["Abu Dhabi","Dubai","Sharjah","Ajman","Ras Al Khaimah","Fujairah","Umm Al Quwain"],
  "Saudi Arabia": ["Riyadh","Jeddah","Mecca","Medina","Dammam","Khobar","Dhahran","Tabuk"],
  "Lebanon": ["Beirut","Tripoli","Sidon","Byblos","Jounieh","Zahle","Baalbek"],
  "Egypt": ["Cairo","Alexandria","Giza","Luxor","Aswan","Hurghada","Sharm El Sheikh"],
  "Jordan": ["Amman","Zarqa","Irbid","Aqaba","Madaba","Jerash"],
  "Qatar": ["Doha","Al Wakrah","Al Khor","Lusail","Mesaieed"],
  "Kuwait": ["Kuwait City","Hawalli","Salmiya","Jahra","Farwaniya"],
  "Bahrain": ["Manama","Muharraq","Riffa","Isa Town","Hamad Town"],
  "Oman": ["Muscat","Salalah","Sohar","Nizwa","Sur"],
  "Iraq": ["Baghdad","Erbil","Basra","Sulaymaniyah","Mosul","Najaf","Karbala"],
  "USA": ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Francisco","Miami","Seattle","Boston"],
  "UK": ["London","Manchester","Birmingham","Leeds","Glasgow","Liverpool","Edinburgh","Bristol"],
  "France": ["Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Strasbourg"],
  "Germany": ["Berlin","Munich","Hamburg","Frankfurt","Cologne","Stuttgart","Dusseldorf"],
  "Canada": ["Toronto","Montreal","Vancouver","Calgary","Ottawa","Edmonton"],
  "Australia": ["Sydney","Melbourne","Brisbane","Perth","Adelaide","Canberra"],
  "India": ["Mumbai","Delhi","Bangalore","Chennai","Kolkata","Hyderabad","Pune"],
};

const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function Profile() {
  const { user, loading } = useAuth();
  const { t, lang } = useLanguage();
  const DAYS = lang === "ar" ? DAYS_AR : DAYS_EN;

  if (loading) return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  const isProfessional = (user as any).profileType === "professional";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-10 border-b border-border/30">
        <div className="container">
          <div className="flex items-center gap-4 animate-slide-up">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#4A9B82] to-[#2D6D5F] flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">{t("profile.title")}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{isProfessional ? t("profile.professional") : t("profile.customer")}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 flex-1">
        <Tabs defaultValue="personal">
          <TabsList className="mb-6">
            <TabsTrigger value="personal" className="gap-2"><User className="h-4 w-4" /> {t("profile.personalInfo")}</TabsTrigger>
            {isProfessional && <TabsTrigger value="professions" className="gap-2"><Briefcase className="h-4 w-4" /> {t("profile.myServices")}</TabsTrigger>}
            {isProfessional && <TabsTrigger value="availability" className="gap-2"><Clock className="h-4 w-4" /> {t("profile.availability")}</TabsTrigger>}
          </TabsList>
          <TabsContent value="personal"><PersonalInfoForm /></TabsContent>
          {isProfessional && <TabsContent value="professions"><ProfessionsManager days={DAYS} /></TabsContent>}
          {isProfessional && <TabsContent value="availability"><AvailabilityManager days={DAYS} /></TabsContent>}
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
    firstName: (user as any)?.firstName || "",
    lastName: (user as any)?.lastName || "",
    phone: (user as any)?.phone || "",
    sex: (user as any)?.sex || "",
    dateOfBirth: (user as any)?.dateOfBirth ? formatDOB((user as any).dateOfBirth) : "",
    nationality: (user as any)?.nationality || "",
    country: (user as any)?.country || "",
    bio: (user as any)?.bio || "",
    profileType: (user as any)?.profileType || "customer",
  });

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => { toast.success(t("profile.saved")); utils.auth.me.invalidate(); },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { ...form };
    if (data.sex === "unset" || !data.sex) { delete data.sex; }
    if (!data.dateOfBirth) delete data.dateOfBirth;
    updateMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border/60 rounded-2xl p-8 space-y-6 max-w-2xl shadow-sm">
      {/* Profile Type Toggle */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-[#4A9B82]/10 p-5">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <Label className="font-serif font-bold text-base">{t("profile.profileType")}</Label>
        </div>
        <Select value={form.profileType} onValueChange={(v) => setForm(f => ({ ...f, profileType: v as any }))}>
          <SelectTrigger className="rounded-lg h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="customer">{t("profile.customer")}</SelectItem>
            <SelectItem value="professional">{t("profile.professional")}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">{t("profile.profileTypeDesc")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label className="text-sm font-semibold">{t("profile.firstName")}</Label>
          <Input value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} className="mt-1.5 rounded-lg h-11" />
        </div>
        <div>
          <Label className="text-sm font-semibold">{t("profile.lastName")}</Label>
          <Input value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} className="mt-1.5 rounded-lg h-11" />
        </div>
        <div>
          <Label className="text-sm font-semibold">{t("profile.phone")}</Label>
          <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1.5 rounded-lg h-11" />
        </div>
        <div>
          <Label className="text-sm font-semibold">{t("profile.gender")}</Label>
          <Select value={form.sex || "unset"} onValueChange={(v) => setForm(f => ({ ...f, sex: v === "unset" ? "" : v }))}>
            <SelectTrigger className="mt-1.5 rounded-lg h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">{t("profile.preferNotToSay")}</SelectItem>
              <SelectItem value="male">{t("search.male")}</SelectItem>
              <SelectItem value="female">{t("search.female")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-semibold">{t("profile.dateOfBirth")} (dd/MM/yyyy)</Label>
          <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} className="mt-1.5 rounded-lg h-11" />
        </div>
        <div>
          <Label className="text-sm font-semibold">{t("profile.nationality")}</Label>
          <Select value={form.nationality || "unset"} onValueChange={(v) => setForm(f => ({ ...f, nationality: v === "unset" ? "" : v }))}>
            <SelectTrigger className="mt-1.5 rounded-lg h-11"><SelectValue placeholder={t("profile.select")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">—</SelectItem>
              {NATIONALITIES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-semibold">{t("profile.country")}</Label>
          <Select value={form.country || "unset"} onValueChange={(v) => setForm(f => ({ ...f, country: v === "unset" ? "" : v }))}>
            <SelectTrigger className="mt-1.5 rounded-lg h-11"><SelectValue placeholder={t("profile.select")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">—</SelectItem>
              {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-sm font-semibold">{t("profile.bio")}</Label>
        <Textarea value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} className="mt-1.5 rounded-lg" />
      </div>
      <Button type="submit" size="lg" className="gap-2.5 rounded-full bg-gradient-to-r from-[#4A9B82] to-[#2D6D5F] hover:opacity-90 shadow-lg shadow-primary/20 px-8 h-12" disabled={updateMutation.isPending}>
        <Save className="h-5 w-5" /> {updateMutation.isPending ? t("profile.saving") : t("profile.saveChanges")}
      </Button>
    </form>
  );
}

function ProfessionsManager({ days }: { days: string[] }) {
  const { t, lang } = useLanguage();
  const { data: myProfs, isLoading } = trpc.profile.myProfessions.useQuery();
  const { data: categories } = trpc.categories.active.useQuery();
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
    onError: (err: any) => toast.error(err.message),
  });
  const deleteMutation = trpc.profile.deleteProfession.useMutation({
    onSuccess: () => { toast.success(t("profile.serviceRemoved")); utils.profile.myProfessions.invalidate(); },
    onError: (err: any) => toast.error(err.message),
  });

  const filteredServices = useMemo(() => allServices?.filter((s: any) => s.categoryId === newProf.categoryId && !s.isBlocked) || [], [allServices, newProf.categoryId]);
  const cities = CITIES_BY_COUNTRY[newProf.country] || [];
  const officeCities = CITIES_BY_COUNTRY[newProf.officeCountry] || [];

  const handleAdd = () => {
    if (!newProf.categoryId || !newProf.serviceId) { toast.error(t("profile.selectCatAndService")); return; }
    if (!newProf.country) { toast.error(t("profile.countryRequired")); return; }
    addMutation.mutate({
      categoryId: newProf.categoryId, serviceId: newProf.serviceId,
      costPerHour: newProf.costPerHour || undefined, yearsOfExperience: newProf.yearsOfExperience || undefined,
      website: newProf.website || undefined, country: newProf.country || undefined, city: newProf.city || undefined,
      hasTeam: newProf.hasTeam, teamSize: newProf.teamSize || undefined,
      hasOffice: newProf.hasOffice, officeAddress: newProf.officeAddress || undefined,
      officeCity: newProf.officeCity || undefined, officeCountry: newProf.officeCountry || undefined,
      geographicAreas: newProf.geographicAreas ? newProf.geographicAreas.split(",").map(s => s.trim()) : undefined,
    });
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{myProfs?.length || 0} {t("profile.servicesListed")}</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full bg-gradient-to-r from-[#4A9B82] to-[#2D6D5F] hover:opacity-90 shadow-md shadow-primary/20">
              <Plus className="h-4 w-4" /> {t("profile.addService")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-serif text-xl">{t("profile.addService")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">{t("profile.category")}</Label>
                <Select value={newProf.categoryId ? newProf.categoryId.toString() : "0"} onValueChange={(v) => setNewProf(f => ({ ...f, categoryId: Number(v), serviceId: 0 }))}>
                  <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue placeholder={t("profile.selectCategory")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0" disabled>{t("profile.selectCategory")}</SelectItem>
                    {categories?.map((c: any) => <SelectItem key={c.id} value={c.id.toString()}>{lang === "ar" && c.nameAr ? c.nameAr : c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">{t("profile.service")}</Label>
                <Select value={newProf.serviceId ? newProf.serviceId.toString() : "0"} onValueChange={(v) => setNewProf(f => ({ ...f, serviceId: Number(v) }))}>
                  <SelectTrigger className="mt-1.5 rounded-lg"><SelectValue placeholder={t("profile.selectService")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0" disabled>{t("profile.selectService")}</SelectItem>
                    {filteredServices.map((s: any) => <SelectItem key={s.id} value={s.id.toString()}>{lang === "ar" && s.nameAr ? s.nameAr : s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Work Location */}
              <div className="rounded-xl border border-border/60 p-4 space-y-3 bg-muted/20">
                <h4 className="font-semibold text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {t("profile.workLocation")}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">{t("profile.country")} *</Label>
                    <Select value={newProf.country || "unset"} onValueChange={(v) => setNewProf(f => ({ ...f, country: v === "unset" ? "" : v, city: "" }))}>
                      <SelectTrigger className="mt-1 rounded-lg"><SelectValue placeholder={t("profile.select")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unset">—</SelectItem>
                        {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t("profile.city")}</Label>
                    {cities.length > 0 ? (
                      <Select value={newProf.city || "unset"} onValueChange={(v) => setNewProf(f => ({ ...f, city: v === "unset" ? "" : v }))}>
                        <SelectTrigger className="mt-1 rounded-lg"><SelectValue placeholder={t("profile.select")} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unset">—</SelectItem>
                          {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={newProf.city} onChange={(e) => setNewProf(f => ({ ...f, city: e.target.value }))} className="mt-1 rounded-lg" placeholder={t("profile.cityPlaceholder")} />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-sm font-semibold">{t("profile.costPerHour")}</Label><Input type="number" value={newProf.costPerHour} onChange={(e) => setNewProf(f => ({ ...f, costPerHour: e.target.value }))} className="mt-1.5 rounded-lg" /></div>
                <div><Label className="text-sm font-semibold">{t("profile.yearsOfExperience")}</Label><Input type="number" value={newProf.yearsOfExperience || ""} onChange={(e) => setNewProf(f => ({ ...f, yearsOfExperience: Number(e.target.value) }))} className="mt-1.5 rounded-lg" /></div>
              </div>
              <div><Label className="text-sm font-semibold">{t("profile.website")}</Label><Input value={newProf.website} onChange={(e) => setNewProf(f => ({ ...f, website: e.target.value }))} className="mt-1.5 rounded-lg" placeholder="https://..." /></div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Switch checked={newProf.hasTeam} onCheckedChange={(v) => setNewProf(f => ({ ...f, hasTeam: v }))} /><Label>{t("profile.hasTeam")}</Label></div>
                {newProf.hasTeam && <div className="flex items-center gap-2"><Label>{t("profile.teamSize")}:</Label><Input type="number" className="w-20 rounded-lg" value={newProf.teamSize || ""} onChange={(e) => setNewProf(f => ({ ...f, teamSize: Number(e.target.value) }))} /></div>}
              </div>

              <div className="rounded-xl border border-border/60 p-4 space-y-3 bg-muted/20">
                <div className="flex items-center gap-2"><Switch checked={newProf.hasOffice} onCheckedChange={(v) => setNewProf(f => ({ ...f, hasOffice: v }))} /><Label className="font-semibold text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-gold" /> {t("profile.hasOffice")}</Label></div>
                {newProf.hasOffice && (
                  <div className="space-y-3">
                    <div><Label className="text-xs">{t("profile.officeAddress")}</Label><Input value={newProf.officeAddress} onChange={(e) => setNewProf(f => ({ ...f, officeAddress: e.target.value }))} className="mt-1 rounded-lg" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t("profile.officeCountry")}</Label>
                        <Select value={newProf.officeCountry || "unset"} onValueChange={(v) => setNewProf(f => ({ ...f, officeCountry: v === "unset" ? "" : v, officeCity: "" }))}>
                          <SelectTrigger className="mt-1 rounded-lg"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="unset">—</SelectItem>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">{t("profile.officeCity")}</Label>
                        {officeCities.length > 0 ? (
                          <Select value={newProf.officeCity || "unset"} onValueChange={(v) => setNewProf(f => ({ ...f, officeCity: v === "unset" ? "" : v }))}>
                            <SelectTrigger className="mt-1 rounded-lg"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="unset">—</SelectItem>{officeCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        ) : (
                          <Input value={newProf.officeCity} onChange={(e) => setNewProf(f => ({ ...f, officeCity: e.target.value }))} className="mt-1 rounded-lg" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div><Label className="text-sm font-semibold">{t("profile.geographicAreas")}</Label><Input value={newProf.geographicAreas} onChange={(e) => setNewProf(f => ({ ...f, geographicAreas: e.target.value }))} className="mt-1.5 rounded-lg" placeholder="New York, Los Angeles" /></div>
              <Button onClick={handleAdd} size="lg" className="w-full rounded-full bg-gradient-to-r from-[#4A9B82] to-[#2D6D5F] hover:opacity-90" disabled={addMutation.isPending}>{addMutation.isPending ? t("profile.adding") : t("profile.addService")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {myProfs && myProfs.length > 0 ? (
        <div className="space-y-4">
          {myProfs.map((prof: any) => {
            const cat = categories?.find((c: any) => c.id === prof.categoryId);
            const svc = allServices?.find((s: any) => s.id === prof.serviceId);
            return (
              <div key={prof.id} className="bg-card border border-border/60 rounded-xl p-5 flex items-center justify-between hover:border-primary/30 transition-all hover:shadow-md group">
                <div>
                  <h3 className="font-serif font-bold text-base group-hover:text-primary transition-colors">{lang === "ar" && svc?.nameAr ? svc.nameAr : svc?.name || t("profile.service")}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{lang === "ar" && cat?.nameAr ? cat.nameAr : cat?.name} &middot; ${prof.costPerHour}/hr &middot; {prof.yearsOfExperience}y exp</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
                    <MapPin className="h-3 w-3 text-primary" /> {[prof.city, prof.country].filter(Boolean).join(", ") || t("profile.noLocation")}
                    {prof.hasOffice && <span className="ms-2 flex items-center gap-1 text-gold"><Building2 className="h-3 w-3" /> Office</span>}
                    {prof.hasTeam && prof.teamSize && <span className="ms-2">&middot; Team: {prof.teamSize}</span>}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive shrink-0 rounded-lg" onClick={() => deleteMutation.mutate({ id: prof.id })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20">
          <Briefcase className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-lg">{t("profile.noServicesYet")}</p>
        </div>
      )}
    </div>
  );
}

function AvailabilityManager({ days }: { days: string[] }) {
  const { t, lang } = useLanguage();
  const { data: myProfs } = trpc.profile.myProfessions.useQuery();
  const { data: allServices } = trpc.categories.allServices.useQuery();
  const { data: currentAvail, isLoading } = trpc.profile.getAvailability.useQuery();
  const utils = trpc.useUtils();
  const [selectedProfId, setSelectedProfId] = useState<number | null>(null);
  const [slots, setSlots] = useState<{ dayOfWeek: number; startTime: string; endTime: string }[]>([]);

  useEffect(() => {
    if (currentAvail && selectedProfId !== undefined) {
      const filtered = currentAvail.filter((a: any) => selectedProfId === null ? !a.professionId : a.professionId === selectedProfId);
      setSlots(filtered.map((a: any) => ({ dayOfWeek: a.dayOfWeek, startTime: a.startTime, endTime: a.endTime })));
    }
  }, [currentAvail, selectedProfId]);

  const saveMutation = trpc.profile.setAvailability.useMutation({
    onSuccess: () => { toast.success(t("profile.availabilitySaved")); utils.profile.getAvailability.invalidate(); },
    onError: (err: any) => toast.error(err.message),
  });

  const addSlot = () => setSlots(s => [...s, { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }]);
  const removeSlot = (i: number) => setSlots(s => s.filter((_, idx) => idx !== i));
  const updateSlot = (i: number, key: string, value: any) => setSlots(s => s.map((slot, idx) => idx === i ? { ...slot, [key]: value } : slot));

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-2xl">
      {/* Service selector */}
      {myProfs && myProfs.length > 0 && (
        <div className="mb-6 bg-card border border-border/60 rounded-xl p-5">
          <Label className="font-serif font-bold text-base">{t("profile.availabilityFor") || "Availability For"}</Label>
          <Select value={selectedProfId !== null ? String(selectedProfId) : "general"} onValueChange={(v) => setSelectedProfId(v === "general" ? null : Number(v))}>
            <SelectTrigger className="mt-2 rounded-lg h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">{t("profile.generalAvailability") || "General Availability"}</SelectItem>
              {myProfs.map((p: any) => {
                const svc = allServices?.find((s: any) => s.id === p.serviceId);
                return <SelectItem key={p.id} value={String(p.id)}>{lang === "ar" && svc?.nameAr ? svc.nameAr : svc?.name} — {p.country}{p.city ? `, ${p.city}` : ""}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">{t("profile.setAvailability")}</p>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-full border-2 hover:bg-primary/5 hover:border-primary/50" onClick={addSlot}><Plus className="h-3.5 w-3.5" /> {t("profile.addSlot")}</Button>
      </div>

      {slots.length > 0 ? (
        <div className="space-y-3 mb-6">
          {slots.map((slot, i) => (
            <div key={i} className="flex items-center gap-3 bg-card border border-border/60 rounded-xl p-4 hover:border-primary/20 transition-all">
              <Select value={slot.dayOfWeek.toString()} onValueChange={(v) => updateSlot(i, "dayOfWeek", Number(v))}>
                <SelectTrigger className="w-36 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>{days.map((d, idx) => <SelectItem key={idx} value={idx.toString()}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="time" value={slot.startTime} onChange={(e) => updateSlot(i, "startTime", e.target.value)} className="w-32 rounded-lg" />
              <span className="text-muted-foreground text-sm">{t("profile.to")}</span>
              <Input type="time" value={slot.endTime} onChange={(e) => updateSlot(i, "endTime", e.target.value)} className="w-32 rounded-lg" />
              <Button variant="ghost" size="icon" onClick={() => removeSlot(i)} className="text-destructive shrink-0 rounded-lg"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl mb-6 bg-muted/20">
          <Clock className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{t("profile.noSlots")}</p>
        </div>
      )}

      <Button onClick={() => saveMutation.mutate({ professionId: selectedProfId, slots })} size="lg" className="gap-2.5 rounded-full bg-gradient-to-r from-[#4A9B82] to-[#2D6D5F] hover:opacity-90 shadow-lg shadow-primary/20 px-8 h-12" disabled={saveMutation.isPending}>
        <Save className="h-5 w-5" /> {saveMutation.isPending ? t("profile.saving") : t("profile.saveAvailability")}
      </Button>
    </div>
  );
}

function formatDOB(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch { return ""; }
}
