import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Shield, Users, BarChart3, Megaphone, Mail, Loader2,
  Lock, Unlock, Crown, Star, Trash2, Plus, Calendar, MessageSquare,
  Eye, DollarSign, UserPlus, Grid3X3, Tag, Settings, ChevronLeft
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }
  if (user.role !== "admin") return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><p className="text-destructive font-semibold">{t("admin.accessDenied")}</p></div><Footer /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-10 border-b border-border/30">
        <div className="container">
          <div className="flex items-center gap-4 animate-slide-up">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-purple-vivid flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">{t("admin.title")}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Manage your platform</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 flex-1">
        <Tabs defaultValue="dashboard">
          <TabsList className="bg-muted/50 rounded-full p-1 flex-wrap">
            <TabsTrigger value="dashboard" className="gap-2 rounded-full"><BarChart3 className="h-4 w-4" /> {t("admin.dashboard")}</TabsTrigger>
            <TabsTrigger value="users" className="gap-2 rounded-full"><Users className="h-4 w-4" /> {t("admin.users")}</TabsTrigger>
            <TabsTrigger value="categories" className="gap-2 rounded-full"><Grid3X3 className="h-4 w-4" /> Categories</TabsTrigger>
            <TabsTrigger value="ads" className="gap-2 rounded-full"><Megaphone className="h-4 w-4" /> {t("admin.ads")}</TabsTrigger>
            <TabsTrigger value="chats" className="gap-2 rounded-full"><MessageSquare className="h-4 w-4" /> Chats</TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2 rounded-full"><Mail className="h-4 w-4" /> {t("admin.contacts")}</TabsTrigger>
            <TabsTrigger value="config" className="gap-2 rounded-full"><Settings className="h-4 w-4" /> Config</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6"><AdminDashboard /></TabsContent>
          <TabsContent value="users" className="mt-6"><UserManagement /></TabsContent>
          <TabsContent value="categories" className="mt-6"><CategoryServiceManagement /></TabsContent>
          <TabsContent value="ads" className="mt-6"><AdManagement /></TabsContent>
          <TabsContent value="chats" className="mt-6"><ChatMonitoring /></TabsContent>
          <TabsContent value="contacts" className="mt-6"><ContactMessages /></TabsContent>
          <TabsContent value="config" className="mt-6"><SiteConfiguration /></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

function AdminDashboard() {
  const { t } = useLanguage();
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const cards = [
    { label: t("admin.totalUsers"), value: stats?.totalUsers || 0, icon: Users, gradient: "from-blue-500 to-blue-600" },
    { label: t("admin.professionals"), value: stats?.totalProfessionals || 0, icon: Crown, gradient: "from-primary to-purple-vivid" },
    { label: t("admin.totalBookings"), value: stats?.totalBookings || 0, icon: Calendar, gradient: "from-green-500 to-green-600" },
    { label: t("admin.totalReviews"), value: stats?.totalReviews || 0, icon: Star, gradient: "from-amber-500 to-amber-600" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, i) => (
        <div key={i} className="bg-card border border-border/60 rounded-xl p-6 hover:border-primary/30 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-4xl font-serif font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function UserManagement() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", name: "", role: "user" as "user" | "admin", profileType: "customer" as "customer" | "professional" });
  const { data, isLoading } = trpc.admin.users.useQuery({ page, limit: 20 });
  const utils = trpc.useUtils();

  const toggleLock = trpc.admin.toggleLock.useMutation({ onSuccess: () => { toast.success(t("admin.updated")); utils.admin.users.invalidate(); }, onError: (err: any) => toast.error(err.message) });
  const togglePremium = trpc.admin.togglePremium.useMutation({ onSuccess: () => { toast.success(t("admin.updated")); utils.admin.users.invalidate(); }, onError: (err: any) => toast.error(err.message) });
  const toggleStarred = trpc.admin.toggleStarred.useMutation({ onSuccess: () => { toast.success(t("admin.updated")); utils.admin.users.invalidate(); }, onError: (err: any) => toast.error(err.message) });
  const updateRole = trpc.admin.updateRole.useMutation({ onSuccess: () => { toast.success(t("admin.updated")); utils.admin.users.invalidate(); }, onError: (err: any) => toast.error(err.message) });
  const updateFee = trpc.admin.updateFee.useMutation({ onSuccess: () => { toast.success(t("admin.updated")); utils.admin.users.invalidate(); }, onError: (err: any) => toast.error(err.message) });
  const createUser = trpc.admin.createUser.useMutation({ onSuccess: () => { toast.success("User created"); utils.admin.users.invalidate(); setCreateDialogOpen(false); setCreateForm({ email: "", name: "", role: "user", profileType: "customer" }); }, onError: (err: any) => toast.error(err.message) });

  if (selectedUserId) return <UserDetail userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground font-medium">{data?.total || 0} {t("admin.totalUsers").toLowerCase()}</p>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90 shadow-md shadow-primary/20 px-5">
              <UserPlus className="h-4 w-4" /> Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif text-xl">Create New User</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold">Name</Label><Input value={createForm.name} onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5 rounded-lg h-11" /></div>
              <div><Label className="text-sm font-semibold">Email</Label><Input type="email" value={createForm.email} onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))} className="mt-1.5 rounded-lg h-11" /></div>
              <div><Label className="text-sm font-semibold">Role</Label>
                <Select value={createForm.role} onValueChange={(v: any) => setCreateForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger className="mt-1.5 rounded-lg h-11"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-sm font-semibold">Profile Type</Label>
                <Select value={createForm.profileType} onValueChange={(v: any) => setCreateForm(f => ({ ...f, profileType: v }))}>
                  <SelectTrigger className="mt-1.5 rounded-lg h-11"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="customer">Customer</SelectItem><SelectItem value="professional">Professional</SelectItem></SelectContent>
                </Select>
              </div>
              <Button onClick={() => createUser.mutate(createForm)} size="lg" className="w-full rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90" disabled={createUser.isPending || !createForm.email || !createForm.name}>
                {createUser.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border/40">
            <tr>
              <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("admin.user")}</th>
              <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("admin.emailCol")}</th>
              <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("admin.roleCol")}</th>
              <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("admin.statusCol")}</th>
              <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Fee</th>
              <th className="text-end p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("admin.actionsCol")}</th>
            </tr>
          </thead>
          <tbody>
            {data?.results.map((u: any) => (
              <tr key={u.id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <div>
                    <span className="font-semibold">{u.firstName ? `${u.firstName} ${u.lastName}` : u.name || "—"}</span>
                    <div className="flex gap-1 mt-1">
                      {u.isPremium && <Badge className="text-xs bg-gradient-to-r from-primary to-purple-vivid text-white rounded-full">{t("common.premium")}</Badge>}
                      {u.isStarred && <Badge variant="outline" className="text-xs border-gold text-gold rounded-full">{t("common.starred")}</Badge>}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{u.email || "—"}</td>
                <td className="p-4">
                  <Select value={u.role} onValueChange={(v: any) => updateRole.mutate({ userId: u.id, role: v })}>
                    <SelectTrigger className="h-8 w-24 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                  </Select>
                </td>
                <td className="p-4"><Badge variant="outline" className="capitalize rounded-full">{u.profileType || 'customer'}</Badge></td>
                <td className="p-4">
                  <Badge variant={u.isLocked ? "destructive" : "outline"} className="rounded-full">
                    {u.isLocked ? t("admin.locked") : t("admin.active")}
                  </Badge>
                </td>
                <td className="p-4">
                  {u.profileType === 'professional' && (
                    <div className="flex items-center gap-1.5">
                      <Switch checked={u.feeEnabled} onCheckedChange={(v) => updateFee.mutate({ userId: u.id, fee: u.professionalFee || "0", enabled: v })} />
                      {u.feeEnabled && <span className="text-xs font-medium">${u.professionalFee || 0}</span>}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(u.id)} title="View Details" className="rounded-lg hover:bg-primary/10"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleLock.mutate({ userId: u.id, isLocked: !u.isLocked })} className="rounded-lg hover:bg-primary/10">
                      {u.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </Button>
                    {u.profileType === 'professional' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => togglePremium.mutate({ userId: u.id, isPremium: !u.isPremium })} className={`rounded-lg hover:bg-primary/10 ${u.isPremium ? "text-primary" : ""}`}><Crown className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleStarred.mutate({ userId: u.id, isStarred: !u.isStarred })} className={`rounded-lg hover:bg-primary/10 ${u.isStarred ? "text-gold" : ""}`}><Star className="h-4 w-4" /></Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && data.total > 20 && (
        <div className="flex justify-center gap-2 mt-5">
          <Button variant="outline" size="sm" className="rounded-full" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground px-4">Page {page}</span>
          <Button variant="outline" size="sm" className="rounded-full" disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

function UserDetail({ userId, onBack }: { userId: number; onBack: () => void }) {
  const { data: user, isLoading } = trpc.admin.userDetail.useQuery({ userId });
  const utils = trpc.useUtils();
  const updateFee = trpc.admin.updateFee.useMutation({ onSuccess: () => { toast.success("Fee updated"); utils.admin.userDetail.invalidate({ userId }); } });
  const [fee, setFee] = useState("");

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <p>User not found</p>;

  return (
    <div>
      <Button variant="ghost" className="gap-2 mb-5 rounded-full hover:bg-primary/10" onClick={onBack}><ChevronLeft className="h-4 w-4 rtl-flip" /> Back to Users</Button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/60 rounded-xl p-6">
          <h3 className="font-serif text-xl font-bold mb-5 flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> User Information</h3>
          <div className="space-y-3 text-sm">
            {[
              ["Name", user.firstName ? `${user.firstName} ${user.lastName}` : user.name || "—"],
              ["Email", user.email || "—"],
              ["Phone", user.phone || "—"],
              ["Gender", (user.sex || "—")],
              ["DOB", user.dateOfBirth || "—"],
              ["Nationality", user.nationality || "—"],
              ["Country", user.country || "—"],
              ["Joined", new Date(user.createdAt).toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-border/20 last:border-0">
                <span className="text-muted-foreground">{label}:</span><span className="font-medium">{value}</span>
              </div>
            ))}
            <div className="flex justify-between py-1.5 border-b border-border/20"><span className="text-muted-foreground">Role:</span><Badge className="rounded-full">{user.role}</Badge></div>
            <div className="flex justify-between py-1.5 border-b border-border/20"><span className="text-muted-foreground">Profile Type:</span><Badge variant="outline" className="rounded-full capitalize">{user.profileType}</Badge></div>
            <div className="flex justify-between py-1.5 border-b border-border/20"><span className="text-muted-foreground">Status:</span><Badge variant={user.isLocked ? "destructive" : "outline"} className="rounded-full">{user.isLocked ? "Locked" : "Active"}</Badge></div>
            <div className="flex justify-between py-1.5 border-b border-border/20"><span className="text-muted-foreground">Premium:</span><span className={user.isPremium ? "text-primary font-bold" : ""}>{user.isPremium ? "Yes" : "No"}</span></div>
            <div className="flex justify-between py-1.5"><span className="text-muted-foreground">Starred:</span><span className={user.isStarred ? "text-gold font-bold" : ""}>{user.isStarred ? "Yes" : "No"}</span></div>
          </div>
          {user.profileType === 'professional' && (
            <div className="mt-5 pt-5 border-t border-border/40">
              <h4 className="font-semibold mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4 text-gold" /> Professional Fee</h4>
              <div className="flex gap-2">
                <Input type="number" placeholder="Fee amount" value={fee || user.professionalFee || ""} onChange={(e) => setFee(e.target.value)} className="w-32 rounded-lg" />
                <Button size="sm" className="rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90" onClick={() => updateFee.mutate({ userId, fee: fee || user.professionalFee || "0", enabled: true })}>Set Fee</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Current: ${user.professionalFee || "0"} ({user.feeEnabled ? "Enabled" : "Disabled"})</p>
            </div>
          )}
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-6">
          <h3 className="font-serif text-xl font-bold mb-5 flex items-center gap-2"><Tag className="h-5 w-5 text-primary" /> Services ({user.professions?.length || 0})</h3>
          {user.professions && user.professions.length > 0 ? (
            <div className="space-y-3">
              {user.professions.map((p: any) => (
                <div key={p.id} className="border border-border/40 rounded-lg p-4 text-sm hover:border-primary/30 transition-all">
                  <div className="font-semibold">{p.categoryName} — {p.serviceName}</div>
                  <div className="text-muted-foreground mt-1.5 space-y-0.5">
                    {p.country && <p>{p.country}{p.city ? `, ${p.city}` : ""} · ${p.costPerHour || 0}/hr · {p.yearsOfExperience || 0} yrs exp</p>}
                    {p.hasOffice && <p>Has Office</p>}
                    {p.hasTeam && <p>Team: {p.teamSize}</p>}
                    <p>Rating: {p.avgRating || 0} ({p.totalReviews || 0} reviews)</p>
                  </div>
                  {p.availability && p.availability.length > 0 && (
                    <div className="text-muted-foreground mt-1.5 text-xs">
                      Availability: {p.availability.map((a: any) => `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][a.dayOfWeek]} ${a.startTime}-${a.endTime}`).join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground text-sm">No services configured</p>}
        </div>
      </div>

      {user.appointments && user.appointments.length > 0 && (
        <div className="bg-card border border-border/60 rounded-xl p-6 mt-6">
          <h3 className="font-serif text-xl font-bold mb-5 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Appointments ({user.appointments.length})</h3>
          <div className="space-y-2">
            {user.appointments.slice(0, 10).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between text-sm border-b border-border/30 pb-2.5">
                <span>{new Date(a.appointmentDate).toLocaleDateString()} — {a.description || "No description"}</span>
                <Badge variant={a.status === 'completed' ? 'default' : a.status === 'cancelled' ? 'destructive' : 'outline'} className="rounded-full">{a.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryServiceManagement() {
  const { data: cats, isLoading: catsLoading } = trpc.admin.categories.list.useQuery();
  const { data: svcs, isLoading: svcsLoading } = trpc.admin.services.list.useQuery();
  const utils = trpc.useUtils();
  const [catDialog, setCatDialog] = useState(false);
  const [svcDialog, setSvcDialog] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", nameAr: "", description: "", descriptionAr: "", icon: "" });
  const [svcForm, setSvcForm] = useState({ categoryId: 0, name: "", nameAr: "", description: "", descriptionAr: "" });

  const createCat = trpc.admin.categories.create.useMutation({ onSuccess: () => { toast.success("Category created"); utils.admin.categories.list.invalidate(); setCatDialog(false); setCatForm({ name: "", nameAr: "", description: "", descriptionAr: "", icon: "" }); } });
  const updateCat = trpc.admin.categories.update.useMutation({ onSuccess: () => { toast.success("Updated"); utils.admin.categories.list.invalidate(); } });
  const createSvc = trpc.admin.services.create.useMutation({ onSuccess: () => { toast.success("Service created"); utils.admin.services.list.invalidate(); setSvcDialog(false); setSvcForm({ categoryId: 0, name: "", nameAr: "", description: "", descriptionAr: "" }); } });
  const updateSvc = trpc.admin.services.update.useMutation({ onSuccess: () => { toast.success("Updated"); utils.admin.services.list.invalidate(); } });

  if (catsLoading || svcsLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-xl font-bold flex items-center gap-2"><Grid3X3 className="h-5 w-5 text-primary" /> Categories ({cats?.length || 0})</h3>
          <Dialog open={catDialog} onOpenChange={setCatDialog}>
            <DialogTrigger asChild><Button className="gap-2 rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90 shadow-md shadow-primary/20 px-5"><Plus className="h-4 w-4" /> New Category</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif text-xl">Create Category</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label className="text-sm font-semibold">Name (EN)</Label><Input value={catForm.name} onChange={(e) => setCatForm(f => ({ ...f, name: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
                <div><Label className="text-sm font-semibold">Name (AR)</Label><Input value={catForm.nameAr} onChange={(e) => setCatForm(f => ({ ...f, nameAr: e.target.value }))} className="mt-1 rounded-lg h-11" dir="rtl" /></div>
                <div><Label className="text-sm font-semibold">Description (EN)</Label><Input value={catForm.description} onChange={(e) => setCatForm(f => ({ ...f, description: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
                <div><Label className="text-sm font-semibold">Description (AR)</Label><Input value={catForm.descriptionAr} onChange={(e) => setCatForm(f => ({ ...f, descriptionAr: e.target.value }))} className="mt-1 rounded-lg h-11" dir="rtl" /></div>
                <div><Label className="text-sm font-semibold">Icon (Lucide name)</Label><Input value={catForm.icon} onChange={(e) => setCatForm(f => ({ ...f, icon: e.target.value }))} className="mt-1 rounded-lg h-11" placeholder="e.g. Scissors" /></div>
                <Button onClick={() => createCat.mutate(catForm)} size="lg" className="w-full rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90" disabled={createCat.isPending || !catForm.name}>{createCat.isPending ? "Creating..." : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border/40"><tr><th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name</th><th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name (AR)</th><th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Icon</th><th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th><th className="text-end p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th></tr></thead>
            <tbody>
              {cats?.map((c: any) => (
                <tr key={c.id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-semibold">{c.name}</td>
                  <td className="p-4" dir="rtl">{c.nameAr || "—"}</td>
                  <td className="p-4">{c.icon || "—"}</td>
                  <td className="p-4"><Badge variant={c.isBlocked ? "destructive" : "outline"} className="rounded-full">{c.isBlocked ? "Blocked" : "Active"}</Badge></td>
                  <td className="p-4 text-end">
                    <Button variant="ghost" size="sm" className="rounded-lg hover:bg-primary/10" onClick={() => updateCat.mutate({ id: c.id, isBlocked: !c.isBlocked })}>
                      {c.isBlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-xl font-bold flex items-center gap-2"><Tag className="h-5 w-5 text-primary" /> Services ({svcs?.length || 0})</h3>
          <Dialog open={svcDialog} onOpenChange={setSvcDialog}>
            <DialogTrigger asChild><Button className="gap-2 rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90 shadow-md shadow-primary/20 px-5"><Plus className="h-4 w-4" /> New Service</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif text-xl">Create Service</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label className="text-sm font-semibold">Category</Label>
                  <Select value={svcForm.categoryId ? String(svcForm.categoryId) : ""} onValueChange={(v) => setSvcForm(f => ({ ...f, categoryId: Number(v) }))}>
                    <SelectTrigger className="mt-1 rounded-lg h-11"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{cats?.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-sm font-semibold">Name (EN)</Label><Input value={svcForm.name} onChange={(e) => setSvcForm(f => ({ ...f, name: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
                <div><Label className="text-sm font-semibold">Name (AR)</Label><Input value={svcForm.nameAr} onChange={(e) => setSvcForm(f => ({ ...f, nameAr: e.target.value }))} className="mt-1 rounded-lg h-11" dir="rtl" /></div>
                <div><Label className="text-sm font-semibold">Description (EN)</Label><Input value={svcForm.description} onChange={(e) => setSvcForm(f => ({ ...f, description: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
                <div><Label className="text-sm font-semibold">Description (AR)</Label><Input value={svcForm.descriptionAr} onChange={(e) => setSvcForm(f => ({ ...f, descriptionAr: e.target.value }))} className="mt-1 rounded-lg h-11" dir="rtl" /></div>
                <Button onClick={() => createSvc.mutate(svcForm)} size="lg" className="w-full rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90" disabled={createSvc.isPending || !svcForm.name || !svcForm.categoryId}>{createSvc.isPending ? "Creating..." : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border/40"><tr><th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Service</th><th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name (AR)</th><th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Category</th><th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th><th className="text-end p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th></tr></thead>
            <tbody>
              {svcs?.map((s: any) => (
                <tr key={s.id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-semibold">{s.name}</td>
                  <td className="p-4" dir="rtl">{s.nameAr || "—"}</td>
                  <td className="p-4">{cats?.find((c: any) => c.id === s.categoryId)?.name || "—"}</td>
                  <td className="p-4"><Badge variant={s.isBlocked ? "destructive" : "outline"} className="rounded-full">{s.isBlocked ? "Blocked" : "Active"}</Badge></td>
                  <td className="p-4 text-end">
                    <Button variant="ghost" size="sm" className="rounded-lg hover:bg-primary/10" onClick={() => updateSvc.mutate({ id: s.id, isBlocked: !s.isBlocked })}>
                      {s.isBlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdManagement() {
  const { t } = useLanguage();
  const { data: ads, isLoading } = trpc.admin.ads.list.useQuery();
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", imageUrl: "", linkUrl: "", position: "home_banner" as const });
  const createMutation = trpc.admin.ads.create.useMutation({ onSuccess: () => { toast.success(t("admin.adCreated")); utils.admin.ads.list.invalidate(); setDialogOpen(false); setForm({ title: "", imageUrl: "", linkUrl: "", position: "home_banner" }); } });
  const deleteMutation = trpc.admin.ads.delete.useMutation({ onSuccess: () => { toast.success(t("admin.adDeleted")); utils.admin.ads.list.invalidate(); } });
  const toggleMutation = trpc.admin.ads.update.useMutation({ onSuccess: () => { toast.success(t("admin.updated")); utils.admin.ads.list.invalidate(); } });
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground font-medium">{ads?.length || 0} {t("admin.adsCount")}</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2 rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90 shadow-md shadow-primary/20 px-5"><Plus className="h-4 w-4" /> {t("admin.newAd")}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif text-xl">{t("admin.createAd")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold">{t("admin.adTitle")}</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1.5 rounded-lg h-11" /></div>
              <div><Label className="text-sm font-semibold">{t("admin.adImageUrl")}</Label><Input value={form.imageUrl} onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="mt-1.5 rounded-lg h-11" placeholder="https://..." /></div>
              <div><Label className="text-sm font-semibold">{t("admin.adLinkUrl")}</Label><Input value={form.linkUrl} onChange={(e) => setForm(f => ({ ...f, linkUrl: e.target.value }))} className="mt-1.5 rounded-lg h-11" /></div>
              <div><Label className="text-sm font-semibold">{t("admin.adPosition")}</Label>
                <Select value={form.position} onValueChange={(v: any) => setForm(f => ({ ...f, position: v }))}>
                  <SelectTrigger className="mt-1.5 rounded-lg h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home_banner">{t("admin.homeBanner")}</SelectItem>
                    <SelectItem value="search_banner">{t("admin.searchBanner")}</SelectItem>
                    <SelectItem value="sidebar">{t("admin.sidebar")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => createMutation.mutate(form)} size="lg" className="w-full rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90" disabled={createMutation.isPending}>{createMutation.isPending ? t("admin.creating") : t("admin.createAd")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {ads && ads.length > 0 ? (
        <div className="space-y-4">
          {ads.map((ad: any) => (
            <div key={ad.id} className="bg-card border border-border/60 rounded-xl p-5 flex items-center justify-between hover:border-primary/30 transition-all">
              <div className="flex items-center gap-4">
                {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} className="h-14 w-24 object-cover rounded-lg border border-border/40" />}
                <div><h3 className="font-semibold">{ad.title}</h3><p className="text-xs text-muted-foreground mt-0.5">{ad.position.replace("_", " ")} · {ad.isActive ? t("admin.active") : t("admin.inactive")}</p></div>
              </div>
              <div className="flex items-center gap-2.5">
                <Switch checked={ad.isActive} onCheckedChange={(v) => toggleMutation.mutate({ id: ad.id, isActive: v })} />
                <Button variant="ghost" size="sm" className="text-destructive rounded-lg" onClick={() => deleteMutation.mutate({ id: ad.id })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20"><Megaphone className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground text-lg">{t("admin.noAds")}</p></div>
      )}
    </div>
  );
}

function ChatMonitoring() {
  const { data: rooms, isLoading } = trpc.admin.chatRooms.useQuery();
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (selectedRoom) return <ChatRoomView roomId={selectedRoom} onBack={() => setSelectedRoom(null)} />;

  return (
    <div>
      <h3 className="font-serif text-xl font-bold mb-5 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Chat Rooms ({rooms?.length || 0})</h3>
      {rooms && rooms.length > 0 ? (
        <div className="space-y-3">
          {rooms.map((r: any) => (
            <div key={r.id} className="bg-card border border-border/60 rounded-xl p-5 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all hover:shadow-md" onClick={() => setSelectedRoom(r.id)}>
              <div>
                <span className="font-semibold">{r.user1?.name || "User"} ↔ {r.user2?.name || "User"}</span>
                {r.lastMessage && <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">{r.lastMessage.content || `[${r.lastMessage.messageType}]`}</p>}
              </div>
              <span className="text-xs text-muted-foreground">{r.lastMessageAt ? new Date(r.lastMessageAt).toLocaleDateString() : ""}</span>
            </div>
          ))}
        </div>
      ) : <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20"><MessageSquare className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground text-lg">No chat rooms yet</p></div>}
    </div>
  );
}

function ChatRoomView({ roomId, onBack }: { roomId: number; onBack: () => void }) {
  const { data: messages, isLoading } = trpc.admin.chatMessages.useQuery({ roomId, limit: 100 });
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <Button variant="ghost" className="gap-2 mb-5 rounded-full hover:bg-primary/10" onClick={onBack}><ChevronLeft className="h-4 w-4 rtl-flip" /> Back to Rooms</Button>
      <div className="bg-card border border-border/60 rounded-xl p-5 max-h-[600px] overflow-y-auto space-y-4">
        {messages && [...messages].reverse().map((m: any) => (
          <div key={m.id} className="text-sm border-b border-border/20 pb-3 last:border-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-semibold">{m.senderName || "User"}</span>
              <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span>
              {m.messageType !== 'text' && <Badge variant="outline" className="text-xs rounded-full">{m.messageType}</Badge>}
            </div>
            {m.messageType === 'text' && <p className="text-muted-foreground">{m.content}</p>}
            {m.messageType === 'image' && m.mediaUrl && <img src={m.mediaUrl} alt="shared" className="max-h-40 object-contain rounded-lg border border-border/40" />}
            {m.messageType === 'video' && m.mediaUrl && <video src={m.mediaUrl} controls className="max-h-40 rounded-lg border border-border/40" />}
            {m.messageType === 'location' && <p className="text-muted-foreground">📍 Location: {m.content}</p>}
          </div>
        ))}
        {(!messages || messages.length === 0) && <p className="text-muted-foreground text-center py-8">No messages in this room</p>}
      </div>
    </div>
  );
}

function ContactMessages() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: messages, isLoading } = trpc.admin.contacts.useQuery({ status: statusFilter });
  const utils = trpc.useUtils();
  const [replyDialog, setReplyDialog] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<"pending" | "in_progress" | "closed">("in_progress");

  const replyMutation = trpc.admin.contactReply.useMutation({
    onSuccess: () => { toast.success("Reply sent"); utils.admin.contacts.invalidate(); setReplyDialog(null); setReplyText(""); },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-xl font-bold">{t("admin.contacts")}</h3>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 rounded-lg"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((msg: any) => (
            <div key={msg.id} className="bg-card border border-border/60 rounded-xl p-6 hover:border-primary/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-serif font-bold text-base">{msg.subject}</h3>
                  <p className="text-sm text-muted-foreground">{msg.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={msg.status === 'closed' ? 'default' : msg.status === 'in_progress' ? 'outline' : 'destructive'} className="rounded-full">
                    {msg.status === 'in_progress' ? 'In Progress' : msg.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{msg.description}</p>
              {msg.adminReply && (
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-sm mb-4 border-s-4 border-s-primary">
                  <p className="font-semibold text-xs text-primary mb-1.5">Admin Reply ({msg.repliedAt ? new Date(msg.repliedAt).toLocaleDateString() : ""}):</p>
                  <p className="text-muted-foreground">{msg.adminReply}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Dialog open={replyDialog === msg.id} onOpenChange={(open) => { if (!open) setReplyDialog(null); else { setReplyDialog(msg.id); setReplyStatus(msg.status === 'pending' ? 'in_progress' : msg.status); } }}>
                  <DialogTrigger asChild><Button variant="outline" size="sm" className="rounded-full hover:bg-primary/5 hover:border-primary/40">Reply / Update Status</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle className="font-serif text-xl">Reply to: {msg.subject}</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div><Label className="text-sm font-semibold">Status</Label>
                        <Select value={replyStatus} onValueChange={(v: any) => setReplyStatus(v)}>
                          <SelectTrigger className="mt-1 rounded-lg h-11"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-sm font-semibold">Reply Message (optional)</Label><Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="mt-1 rounded-lg" rows={4} /></div>
                      <Button onClick={() => replyMutation.mutate({ id: msg.id, status: replyStatus, adminReply: replyText || undefined })} size="lg" className="w-full rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90" disabled={replyMutation.isPending}>
                        {replyMutation.isPending ? "Sending..." : "Update"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20"><Mail className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground text-lg">{t("admin.noContacts")}</p></div>
      )}
    </div>
  );
}

function SiteConfiguration() {
  const { data: aboutEn, isLoading: loadingEn } = trpc.admin.siteConfig.get.useQuery({ key: "about_us_en" });
  const { data: aboutAr, isLoading: loadingAr } = trpc.admin.siteConfig.get.useQuery({ key: "about_us_ar" });
  const [enContent, setEnContent] = useState("");
  const [arContent, setArContent] = useState("");
  const [initialized, setInitialized] = useState(false);
  const utils = trpc.useUtils();

  const saveMutation = trpc.admin.siteConfig.set.useMutation({
    onSuccess: () => { toast.success("Configuration saved"); utils.admin.siteConfig.get.invalidate(); },
    onError: (err: any) => toast.error(err.message),
  });

  if (!initialized && !loadingEn && !loadingAr) {
    setEnContent(aboutEn || "");
    setArContent(aboutAr || "");
    setInitialized(true);
  }

  if (loadingEn || loadingAr) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-xl font-bold flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /> Site Configuration</h3>
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <h4 className="font-serif font-bold mb-3">About Us Page (English) — JSON</h4>
        <Textarea value={enContent} onChange={(e) => setEnContent(e.target.value)} rows={8} className="font-mono text-xs rounded-lg" />
        <Button className="mt-3 rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90 px-6" onClick={() => saveMutation.mutate({ key: "about_us_en", value: enContent })} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving..." : "Save English"}
        </Button>
      </div>
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <h4 className="font-serif font-bold mb-3">About Us Page (Arabic) — JSON</h4>
        <Textarea value={arContent} onChange={(e) => setArContent(e.target.value)} rows={8} className="font-mono text-xs rounded-lg" dir="rtl" />
        <Button className="mt-3 rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90 px-6" onClick={() => saveMutation.mutate({ key: "about_us_ar", value: arContent })} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving..." : "Save Arabic"}
        </Button>
      </div>
    </div>
  );
}
