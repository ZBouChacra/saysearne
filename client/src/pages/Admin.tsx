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
import { CountrySelect, CitySelect } from "@/components/CountrySelect";
import { MultiDatePicker } from "@/components/MultiDatePicker";
import {
  Shield, Users, BarChart3, Megaphone, Mail, Loader2,
  Lock, Unlock, Crown, Trash2, Plus, Calendar, MessageSquare,
  Eye, DollarSign, UserPlus, Grid3X3, Tag, Settings, ChevronLeft,
  Pencil, FileText, AlertTriangle, CheckCircle2, XCircle, Search,
  Download, TrendingUp, Star
} from "lucide-react";
import { useState, useMemo } from "react";
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
      <section className="bg-[#3D1A5D] py-8 border-b border-[#4A9B82]/30">
        <div className="container">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#4A9B82] to-[#2D6D5F] flex items-center justify-center shadow-lg"><Shield className="h-7 w-7 text-white" /></div>
            <div><h1 className="font-serif text-3xl md:text-4xl font-bold text-white">{t("admin.title")}</h1><p className="text-white/60 text-sm mt-0.5">Manage your platform</p></div>
          </div>
        </div>
      </section>
      <div className="container py-8 flex-1">
        <Tabs defaultValue="dashboard">
          <TabsList className="bg-muted/50 rounded-lg p-1 flex-wrap">
            <TabsTrigger value="dashboard" className="gap-2 rounded-lg"><BarChart3 className="h-4 w-4" /> {t("admin.dashboard")}</TabsTrigger>
            <TabsTrigger value="users" className="gap-2 rounded-lg"><Users className="h-4 w-4" /> {t("admin.users")}</TabsTrigger>
            <TabsTrigger value="categories" className="gap-2 rounded-lg"><Grid3X3 className="h-4 w-4" /> Categories</TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2 rounded-lg"><Star className="h-4 w-4" /> Reviews</TabsTrigger>
            <TabsTrigger value="payments" className="gap-2 rounded-lg"><DollarSign className="h-4 w-4" /> Payments</TabsTrigger>
            <TabsTrigger value="ads" className="gap-2 rounded-lg"><Megaphone className="h-4 w-4" /> {t("admin.ads")}</TabsTrigger>
            <TabsTrigger value="chats" className="gap-2 rounded-lg"><MessageSquare className="h-4 w-4" /> Chats</TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2 rounded-lg"><Mail className="h-4 w-4" /> {t("admin.contacts")}</TabsTrigger>
            <TabsTrigger value="config" className="gap-2 rounded-lg"><Settings className="h-4 w-4" /> Config</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6"><AdminDashboard /></TabsContent>
          <TabsContent value="users" className="mt-6"><UserManagement /></TabsContent>
          <TabsContent value="categories" className="mt-6"><CategoryServiceManagement /></TabsContent>
          <TabsContent value="reviews" className="mt-6"><ReviewModeration /></TabsContent>
          <TabsContent value="payments" className="mt-6"><PaymentTracking /></TabsContent>
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

// ─── Dashboard ──────────────────────────────────────────────────────
function AdminDashboard() {
  const { t } = useLanguage();
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();
  const [profitYear, setProfitYear] = useState(new Date().getFullYear());
  const [profitMonth, setProfitMonth] = useState<number | undefined>(undefined);
  const { data: profitData } = trpc.admin.payments.profitData.useQuery({ year: profitYear, month: profitMonth });
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const cards = [
    { label: t("admin.totalUsers"), value: stats?.totalUsers || 0, icon: Users, color: "bg-[#4A9B82]" },
    { label: t("admin.professionals"), value: stats?.totalProfessionals || 0, icon: Crown, color: "bg-[#3D1A5D]" },
    { label: t("admin.totalBookings"), value: stats?.totalBookings || 0, icon: Calendar, color: "bg-[#2D6D5F]" },
    { label: t("admin.totalReviews"), value: stats?.totalReviews || 0, icon: Star, color: "bg-[#D4A757]" },
    { label: "Premium Revenue", value: `$${Number(stats?.totalPremiumRevenue || 0).toFixed(0)}`, icon: TrendingUp, color: "bg-[#4A9B82]" },
    { label: "Ad Revenue", value: `$${Number(stats?.totalAdRevenue || 0).toFixed(0)}`, icon: Megaphone, color: "bg-[#3D1A5D]" },
    { label: "Pending Premium", value: `$${Number(stats?.pendingPremiumAmount || 0).toFixed(0)}`, icon: AlertTriangle, color: "bg-[#D4A757]" },
    { label: "Pending Ads", value: `$${Number(stats?.pendingAdAmount || 0).toFixed(0)}`, icon: AlertTriangle, color: "bg-[#D4A757]" },
  ];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => (
          <div key={i} className="bg-card border border-border/60 rounded-xl p-6 hover:border-[#4A9B82]/40 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3"><span className="text-sm text-muted-foreground font-medium">{card.label}</span><div className={`h-10 w-10 rounded-lg ${card.color} flex items-center justify-center shadow-md`}><card.icon className="h-5 w-5 text-white" /></div></div>
            <p className="text-3xl font-serif font-bold">{card.value}</p>
          </div>
        ))}
      </div>
      {/* Profit Chart */}
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-xl font-bold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-[#4A9B82]" /> Profit Overview</h3>
          <div className="flex gap-2">
            <Select value={String(profitYear)} onValueChange={(v) => setProfitYear(Number(v))}>
              <SelectTrigger className="w-28 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>{[2024,2025,2026,2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={profitMonth ? String(profitMonth) : "all"} onValueChange={(v) => setProfitMonth(v === "all" ? undefined : Number(v))}>
              <SelectTrigger className="w-36 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {profitData && (
          <div className="space-y-3">
            {profitData.type === 'monthly' ? (
              <div className="grid grid-cols-12 gap-1">
                {(profitData.data as any[]).map((d: any, i: number) => {
                  const maxVal = Math.max(...(profitData.data as any[]).map((x: any) => x.total), 1);
                  const height = Math.max((d.total / maxVal) * 150, 4);
                  return (<div key={i} className="flex flex-col items-center gap-1"><div className="w-full flex flex-col items-center justify-end" style={{ height: 160 }}><div className="w-full max-w-8 rounded-t-md bg-gradient-to-t from-[#4A9B82] to-[#7BB69D]" style={{ height }} title={`$${d.total.toFixed(2)}`} /></div><span className="text-xs text-muted-foreground">{"JFMAMJJASOND"[i]}</span><span className="text-xs font-medium">${d.total.toFixed(0)}</span></div>);
                })}
              </div>
            ) : (
              <div className="flex gap-0.5 items-end overflow-x-auto pb-2" style={{ height: 200 }}>
                {(profitData.data as any[]).map((d: any, i: number) => {
                  const maxVal = Math.max(...(profitData.data as any[]).map((x: any) => x.total), 1);
                  const height = Math.max((d.total / maxVal) * 160, 2);
                  return (<div key={i} className="flex flex-col items-center gap-1 min-w-4"><div className="w-3 rounded-t-sm bg-gradient-to-t from-[#4A9B82] to-[#7BB69D]" style={{ height }} title={`Day ${d.day}: $${d.total.toFixed(2)}`} />{i % 5 === 0 && <span className="text-xs text-muted-foreground">{d.day}</span>}</div>);
                })}
              </div>
            )}
            <div className="flex gap-6 text-sm text-muted-foreground pt-2 border-t border-border/30">
              <span>Total Premium: <strong className="text-[#4A9B82]">${(profitData.data as any[]).reduce((s: number, d: any) => s + d.premiumRevenue, 0).toFixed(2)}</strong></span>
              <span>Total Ads: <strong className="text-[#3D1A5D]">${(profitData.data as any[]).reduce((s: number, d: any) => s + d.adRevenue, 0).toFixed(2)}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── User Management ────────────────────────────────────────────────
function UserManagement() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", name: "", role: "user" as "user" | "admin", profileType: "customer" as "customer" | "professional" });
  const { data, isLoading } = trpc.admin.users.useQuery({ page, search: searchQuery || undefined, typeFilter: typeFilter !== "all" ? typeFilter : undefined, premiumOnly: premiumOnly || undefined });
  const utils = trpc.useUtils();
  const toggleLock = trpc.admin.toggleLock.useMutation({ onSuccess: () => { toast.success(t("admin.updated")); utils.admin.users.invalidate(); }, onError: (err: any) => toast.error(err.message) });
  const updateRole = trpc.admin.updateRole.useMutation({ onSuccess: () => { toast.success(t("admin.updated")); utils.admin.users.invalidate(); }, onError: (err: any) => toast.error(err.message) });
  const createUser = trpc.admin.createUser.useMutation({ onSuccess: () => { toast.success("User created"); utils.admin.users.invalidate(); setCreateDialogOpen(false); setCreateForm({ email: "", name: "", role: "user", profileType: "customer" }); }, onError: (err: any) => toast.error(err.message) });

  if (selectedUserId) return <UserDetail userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, email..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="pl-9 w-64 rounded-lg h-10" />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40 rounded-lg h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Switch checked={premiumOnly} onCheckedChange={(v) => { setPremiumOnly(v); setPage(1); }} />
            <span className="text-muted-foreground">Premium only</span>
          </label>
          <span className="text-sm text-muted-foreground">{data?.total || 0} users</span>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2 rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white px-5"><UserPlus className="h-4 w-4" /> Create User</Button></DialogTrigger>
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
              <Button onClick={() => createUser.mutate(createForm)} size="lg" className="w-full rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={createUser.isPending || !createForm.email || !createForm.name}>{createUser.isPending ? "Creating..." : "Create User"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border/40">
              <tr>
                <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("admin.user")}</th>
                <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("admin.emailCol")}</th>
                <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("admin.roleCol")}</th>
                <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("admin.statusCol")}</th>
                <th className="text-end p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">{t("admin.actionsCol")}</th>
              </tr>
            </thead>
            <tbody>
              {data?.results.map((u: any) => (
                <tr key={u.id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div>
                      <span className="font-semibold">{u.firstName ? `${u.firstName} ${u.lastName}` : u.name || "—"}</span>
                      {u.isPremium && <Badge className="text-xs bg-[#4A9B82] text-white rounded-lg ml-2">{t("common.premium")}</Badge>}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{u.email || "—"}</td>
                  <td className="p-4">
                    <Select value={u.role} onValueChange={(v: any) => updateRole.mutate({ userId: u.id, role: v })}>
                      <SelectTrigger className="h-8 w-24 rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
                    </Select>
                  </td>
                  <td className="p-4"><Badge variant="outline" className="capitalize rounded-lg">{u.profileType || 'customer'}</Badge></td>
                  <td className="p-4"><Badge variant={u.isLocked ? "destructive" : "outline"} className="rounded-lg">{u.isLocked ? t("admin.locked") : t("admin.active")}</Badge></td>
                  <td className="p-4">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(u.id)} title="View Details" className="rounded-lg hover:bg-[#4A9B82]/10"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleLock.mutate({ userId: u.id, isLocked: !u.isLocked })} className="rounded-lg hover:bg-[#4A9B82]/10">{u.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {data && data.total > 20 && (
        <div className="flex justify-center gap-2 mt-5">
          <Button variant="outline" size="sm" className="rounded-lg" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground px-4">Page {page} of {Math.ceil(data.total / 20)}</span>
          <Button variant="outline" size="sm" className="rounded-lg" disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

// ─── User Detail ────────────────────────────────────────────────────
function UserDetail({ userId, onBack }: { userId: number; onBack: () => void }) {
  const { data: user, isLoading } = trpc.admin.userDetail.useQuery({ userId });
  const { data: feeConfigs } = trpc.admin.feeConfig.list.useQuery({ feeType: "premium" });
  const { data: listingConfigs } = trpc.admin.listingOrderConfig.list.useQuery({ configType: "premium" });
  const { data: batchData } = trpc.admin.premiumBatches.byUser.useQuery({ userId, page: 1 });
  const utils = trpc.useUtils();

  const createBatch = trpc.admin.premiumBatches.create.useMutation({
    onSuccess: () => { toast.success("Premium batch created"); utils.admin.premiumBatches.byUser.invalidate(); utils.admin.userDetail.invalidate({ userId }); setBatchDialog(false); },
    onError: (err: any) => toast.error(err.message),
  });
  const updateBatch = trpc.admin.premiumBatches.update.useMutation({
    onSuccess: () => { toast.success("Batch updated"); utils.admin.premiumBatches.byUser.invalidate(); setEditBatchDialog(null); },
    onError: (err: any) => toast.error(err.message),
  });

  const [batchDialog, setBatchDialog] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [batchFee, setBatchFee] = useState("");
  const [batchNotes, setBatchNotes] = useState("");
  const [batchPage, setBatchPage] = useState(1);
  const [apptPage, setApptPage] = useState(1);
  const [editBatchDialog, setEditBatchDialog] = useState<any>(null);
  const [editDates, setEditDates] = useState<string[]>([]);
  const [editFee, setEditFee] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { data: paginatedBatches } = trpc.admin.premiumBatches.byUser.useQuery({ userId, page: batchPage });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <p>User not found</p>;

  const userCountry = user.country || undefined;
  const userCity = (user as any).city || undefined;
  const defaultFee = feeConfigs?.find((f: any) => f.country === userCountry && f.city === userCity)?.feePerDay
    || feeConfigs?.find((f: any) => f.country === userCountry && !f.city)?.feePerDay
    || feeConfigs?.find((f: any) => !f.country)?.feePerDay || "0";

  const numDays = selectedDates.length;
  const batchTotal = numDays * parseFloat(batchFee || defaultFee || "0");

  const handleCreateBatch = () => {
    if (selectedDates.length === 0) { toast.error("Please select at least one date"); return; }
    createBatch.mutate({
      userId, country: userCountry,
      selectedDates,
      feePerDay: batchFee || defaultFee,
      totalDays: numDays,
      totalAmount: batchTotal.toFixed(2),
      notes: batchNotes || undefined,
    });
  };

  const handleEditBatch = () => {
    if (!editBatchDialog) return;
    updateBatch.mutate({
      id: editBatchDialog.id,
      selectedDates: editDates,
      feePerDay: editFee,
      totalDays: editDates.length,
      totalAmount: (editDates.length * parseFloat(editFee || "0")).toFixed(2),
      notes: editNotes || undefined,
    });
  };

  const handleCancelBatch = (batchId: number) => {
    updateBatch.mutate({ id: batchId, status: 'cancelled' });
  };

  const appointments = user.appointments || [];
  const paginatedAppts = appointments.slice((apptPage - 1) * 10, apptPage * 10);
  const apptTotalPages = Math.ceil(appointments.length / 10);

  return (
    <div>
      <Button variant="ghost" className="gap-2 mb-5 rounded-lg hover:bg-[#4A9B82]/10" onClick={onBack}><ChevronLeft className="h-4 w-4 rtl-flip" /> Back to Users</Button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Info */}
        <div className="bg-card border border-border/60 rounded-xl p-6">
          <h3 className="font-serif text-xl font-bold mb-5 flex items-center gap-2"><Users className="h-5 w-5 text-[#4A9B82]" /> User Information</h3>
          <div className="space-y-3 text-sm">
            {[
              ["Name", user.firstName ? `${user.firstName} ${user.lastName}` : user.name || "—"],
              ["Email", user.email || "—"],
              ["Phone", user.phone || "—"],
              ["Gender", user.sex || "—"],
              ["DOB", user.dateOfBirth || "—"],
              ["Nationality", user.nationality || "—"],
              ["Country", user.country || "—"],
              ["City", (user as any).city || "—"],
              ["Joined", new Date(user.createdAt).toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-border/20 last:border-0">
                <span className="text-muted-foreground">{label}:</span><span className="font-medium">{String(value)}</span>
              </div>
            ))}
            <div className="flex justify-between py-1.5 border-b border-border/20"><span className="text-muted-foreground">Role:</span><Badge className="rounded-lg">{user.role}</Badge></div>
            <div className="flex justify-between py-1.5 border-b border-border/20"><span className="text-muted-foreground">Profile Type:</span><Badge variant="outline" className="rounded-lg capitalize">{user.profileType}</Badge></div>
            <div className="flex justify-between py-1.5 border-b border-border/20"><span className="text-muted-foreground">Status:</span><Badge variant={user.isLocked ? "destructive" : "outline"} className="rounded-lg">{user.isLocked ? "Locked" : "Active"}</Badge></div>
            <div className="flex justify-between py-1.5"><span className="text-muted-foreground">Premium:</span><span className={user.isPremium ? "text-[#4A9B82] font-bold" : ""}>{user.isPremium ? "Yes" : "No"}</span></div>
          </div>
          {/* Bio */}
          {user.bio && (
            <div className="mt-5 pt-5 border-t border-border/40">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-[#4A9B82]" /> Bio</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
            </div>
          )}
          {/* Portfolio */}
          {(user as any).portfolio && (
            <div className="mt-5 pt-5 border-t border-border/40">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-[#3D1A5D]" /> Portfolio</h4>
              <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: (user as any).portfolio }} />
            </div>
          )}
        </div>

        {/* Services */}
        <div className="bg-card border border-border/60 rounded-xl p-6">
          <h3 className="font-serif text-xl font-bold mb-5 flex items-center gap-2"><Tag className="h-5 w-5 text-[#4A9B82]" /> Services ({user.professions?.length || 0})</h3>
          {user.professions && user.professions.length > 0 ? (
            <div className="space-y-3">
              {user.professions.map((p: any) => (
                <div key={p.id} className="border border-border/40 rounded-lg p-4 text-sm hover:border-[#4A9B82]/30 transition-all">
                  <div className="font-semibold">{p.categoryName} — {p.serviceName}</div>
                  <div className="text-muted-foreground mt-1.5 space-y-0.5">
                    {p.country && <p>{p.country}{p.city ? `, ${p.city}` : ""} · ${p.costPerHour || 0}/hr · {p.yearsOfExperience || 0} yrs exp</p>}
                    {p.hasOffice && <p>Has Office</p>}
                    {p.hasTeam && <p>Team: {p.teamSize}</p>}
                    <p>Rating: {p.avgRating || 0} ({p.totalReviews || 0} reviews)</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground text-sm">No services configured</p>}
        </div>
      </div>

      {/* Premium Batches */}
      {user.profileType === 'professional' && (
        <div className="bg-card border border-border/60 rounded-xl p-6 mt-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-xl font-bold flex items-center gap-2"><Crown className="h-5 w-5 text-[#4A9B82]" /> Premium Batches</h3>
            <Dialog open={batchDialog} onOpenChange={(open) => { setBatchDialog(open); if (open) { setBatchFee(defaultFee); setSelectedDates([]); setBatchNotes(""); } }}>
              <DialogTrigger asChild><Button className="gap-2 rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white px-5"><Plus className="h-4 w-4" /> New Batch</Button></DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="font-serif text-xl">Create Premium Batch</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Country: <strong>{userCountry || "Global"}</strong> · Default fee: <strong>${defaultFee}/day</strong></p>
                  <MultiDatePicker selectedDates={selectedDates} onChange={setSelectedDates} minDate={new Date()} label="Select Premium Dates" />
                  <div><Label className="text-sm font-semibold">Fee per Day (USD)</Label><Input type="number" step="0.01" value={batchFee} onChange={(e) => setBatchFee(e.target.value)} className="mt-1 rounded-lg h-11" placeholder={defaultFee} /></div>
                  <div><Label className="text-sm font-semibold">Notes (optional)</Label><Textarea value={batchNotes} onChange={(e) => setBatchNotes(e.target.value)} className="mt-1 rounded-lg" rows={2} /></div>
                  {numDays > 0 && (
                    <div className="bg-[#4A9B82]/5 border border-[#4A9B82]/20 rounded-lg p-4 text-sm">
                      <p><strong>{numDays}</strong> days × <strong>${parseFloat(batchFee || defaultFee).toFixed(2)}</strong>/day = <strong className="text-[#4A9B82] text-lg">${batchTotal.toFixed(2)}</strong></p>
                    </div>
                  )}
                  <Button onClick={handleCreateBatch} size="lg" className="w-full rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={createBatch.isPending || selectedDates.length === 0}>{createBatch.isPending ? "Creating..." : "Create Batch (Pending)"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {paginatedBatches && paginatedBatches.results.length > 0 ? (
            <div className="space-y-3">
              {paginatedBatches.results.map((b: any) => {
                const dates = Array.isArray(b.selectedDates) ? b.selectedDates : (typeof b.selectedDates === 'string' ? JSON.parse(b.selectedDates) : []);
                return (
                  <div key={b.id} className="border border-border/40 rounded-lg p-4 text-sm hover:border-[#4A9B82]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Batch #{b.id}</p>
                        <p className="text-muted-foreground">{dates.length} days · {dates.slice(0, 3).join(", ")}{dates.length > 3 ? ` +${dates.length - 3} more` : ""}</p>
                        {b.notes && <p className="text-muted-foreground text-xs mt-1">{b.notes}</p>}
                      </div>
                      <div className="text-end flex items-center gap-3">
                        <div>
                          <p className="font-bold text-[#4A9B82]">${b.totalAmount}</p>
                          <Badge variant={b.status === 'paid' ? 'default' : b.status === 'cancelled' ? 'destructive' : 'outline'} className={`rounded-lg mt-1 ${b.status === 'paid' ? 'bg-[#4A9B82]' : b.status === 'active' ? 'bg-blue-500 text-white' : ''}`}>{b.status}</Badge>
                        </div>
                        {b.status === 'pending' && (
                          <div className="flex flex-col gap-1">
                            <Button variant="outline" size="sm" className="rounded-lg h-7 text-xs" onClick={() => { setEditBatchDialog(b); setEditDates(dates); setEditFee(b.feePerDay); setEditNotes(b.notes || ""); }}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                            <Button variant="destructive" size="sm" className="rounded-lg h-7 text-xs" onClick={() => handleCancelBatch(b.id)}><XCircle className="h-3 w-3 mr-1" /> Cancel</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {paginatedBatches.total > 10 && (
                <div className="flex justify-center gap-2 mt-3">
                  <Button variant="outline" size="sm" className="rounded-lg" disabled={batchPage <= 1} onClick={() => setBatchPage(p => p - 1)}>Prev</Button>
                  <span className="text-sm text-muted-foreground flex items-center">{batchPage}/{Math.ceil(paginatedBatches.total / 10)}</span>
                  <Button variant="outline" size="sm" className="rounded-lg" disabled={batchPage >= Math.ceil(paginatedBatches.total / 10)} onClick={() => setBatchPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </div>
          ) : <p className="text-muted-foreground text-sm">No premium batches</p>}
        </div>
      )}

      {/* Edit Batch Dialog */}
      <Dialog open={!!editBatchDialog} onOpenChange={(open) => { if (!open) setEditBatchDialog(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-serif text-xl">Edit Batch #{editBatchDialog?.id}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <MultiDatePicker selectedDates={editDates} onChange={setEditDates} minDate={new Date()} label="Edit Dates" />
            <div><Label className="text-sm font-semibold">Fee per Day (USD)</Label><Input type="number" step="0.01" value={editFee} onChange={(e) => setEditFee(e.target.value)} className="mt-1 rounded-lg h-11" /></div>
            <div><Label className="text-sm font-semibold">Notes</Label><Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="mt-1 rounded-lg" rows={2} /></div>
            {editDates.length > 0 && (
              <div className="bg-[#4A9B82]/5 border border-[#4A9B82]/20 rounded-lg p-4 text-sm">
                <p><strong>{editDates.length}</strong> days × <strong>${parseFloat(editFee || "0").toFixed(2)}</strong>/day = <strong className="text-[#4A9B82] text-lg">${(editDates.length * parseFloat(editFee || "0")).toFixed(2)}</strong></p>
              </div>
            )}
            <Button onClick={handleEditBatch} size="lg" className="w-full rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={updateBatch.isPending}>{updateBatch.isPending ? "Saving..." : "Save Changes"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointments */}
      {appointments.length > 0 && (
        <div className="bg-card border border-border/60 rounded-xl p-6 mt-6">
          <h3 className="font-serif text-xl font-bold mb-5 flex items-center gap-2"><Calendar className="h-5 w-5 text-[#4A9B82]" /> Appointments ({appointments.length})</h3>
          <div className="space-y-2">
            {paginatedAppts.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between text-sm border-b border-border/30 pb-2.5">
                <span>{new Date(a.appointmentDate).toLocaleDateString()} — {a.description || "No description"}</span>
                <Badge variant={a.status === 'completed' ? 'default' : a.status === 'cancelled' ? 'destructive' : 'outline'} className="rounded-lg">{a.status}</Badge>
              </div>
            ))}
          </div>
          {apptTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-3">
              <Button variant="outline" size="sm" className="rounded-lg" disabled={apptPage <= 1} onClick={() => setApptPage(p => p - 1)}>Prev</Button>
              <span className="text-sm text-muted-foreground flex items-center">{apptPage}/{apptTotalPages}</span>
              <Button variant="outline" size="sm" className="rounded-lg" disabled={apptPage >= apptTotalPages} onClick={() => setApptPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Category & Service Management ──────────────────────────────────
function CategoryServiceManagement() {
  const { data: cats, isLoading: catsLoading } = trpc.admin.categories.list.useQuery();
  const { data: svcs, isLoading: svcsLoading } = trpc.admin.services.list.useQuery();
  const utils = trpc.useUtils();
  const [catDialog, setCatDialog] = useState(false);
  const [svcDialog, setSvcDialog] = useState(false);
  const [editCatDialog, setEditCatDialog] = useState<any>(null);
  const [editSvcDialog, setEditSvcDialog] = useState<any>(null);
  const [catForm, setCatForm] = useState({ name: "", nameAr: "", description: "", descriptionAr: "", icon: "" });
  const [svcForm, setSvcForm] = useState({ categoryId: 0, name: "", nameAr: "", description: "", descriptionAr: "" });

  const createCat = trpc.admin.categories.create.useMutation({ onSuccess: () => { toast.success("Category created"); utils.admin.categories.list.invalidate(); setCatDialog(false); setCatForm({ name: "", nameAr: "", description: "", descriptionAr: "", icon: "" }); } });
  const updateCat = trpc.admin.categories.update.useMutation({ onSuccess: () => { toast.success("Updated"); utils.admin.categories.list.invalidate(); setEditCatDialog(null); } });
  const createSvc = trpc.admin.services.create.useMutation({ onSuccess: () => { toast.success("Service created"); utils.admin.services.list.invalidate(); setSvcDialog(false); setSvcForm({ categoryId: 0, name: "", nameAr: "", description: "", descriptionAr: "" }); } });
  const updateSvc = trpc.admin.services.update.useMutation({ onSuccess: () => { toast.success("Updated"); utils.admin.services.list.invalidate(); setEditSvcDialog(null); } });

  if (catsLoading || svcsLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-xl font-bold flex items-center gap-2"><Grid3X3 className="h-5 w-5 text-[#4A9B82]" /> Categories ({cats?.length || 0})</h3>
          <Dialog open={catDialog} onOpenChange={setCatDialog}>
            <DialogTrigger asChild><Button className="gap-2 rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white px-5"><Plus className="h-4 w-4" /> New Category</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif text-xl">Create Category</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label className="text-sm font-semibold">Name (EN)</Label><Input value={catForm.name} onChange={(e) => setCatForm(f => ({ ...f, name: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
                <div><Label className="text-sm font-semibold">Name (AR)</Label><Input value={catForm.nameAr} onChange={(e) => setCatForm(f => ({ ...f, nameAr: e.target.value }))} className="mt-1 rounded-lg h-11" dir="rtl" /></div>
                <div><Label className="text-sm font-semibold">Description (EN)</Label><Input value={catForm.description} onChange={(e) => setCatForm(f => ({ ...f, description: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
                <div><Label className="text-sm font-semibold">Description (AR)</Label><Input value={catForm.descriptionAr} onChange={(e) => setCatForm(f => ({ ...f, descriptionAr: e.target.value }))} className="mt-1 rounded-lg h-11" dir="rtl" /></div>
                <div><Label className="text-sm font-semibold">Icon (Image URL)</Label><Input value={catForm.icon} onChange={(e) => setCatForm(f => ({ ...f, icon: e.target.value }))} className="mt-1 rounded-lg h-11" placeholder="https://..." /></div>
                <Button onClick={() => createCat.mutate(catForm)} size="lg" className="w-full rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={createCat.isPending || !catForm.name}>{createCat.isPending ? "Creating..." : "Create"}</Button>
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
                  <td className="p-4">
                    {c.icon && (c.icon.startsWith("http") ? (
                      <a href={c.icon} download target="_blank" rel="noopener noreferrer" title="Click to download">
                        <img src={c.icon} alt={c.name} className="h-10 w-10 object-contain rounded-lg border border-border/40 cursor-pointer hover:opacity-80" />
                      </a>
                    ) : <span className="text-muted-foreground">{c.icon}</span>)}
                  </td>
                  <td className="p-4"><Badge variant={c.isBlocked ? "destructive" : "outline"} className="rounded-lg">{c.isBlocked ? "Blocked" : "Active"}</Badge></td>
                  <td className="p-4 text-end">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" className="rounded-lg hover:bg-[#4A9B82]/10" onClick={() => setEditCatDialog({ ...c })}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="rounded-lg hover:bg-[#4A9B82]/10" onClick={() => updateCat.mutate({ id: c.id, isBlocked: !c.isBlocked })}>{c.isBlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit Category Dialog */}
      <Dialog open={!!editCatDialog} onOpenChange={(open) => { if (!open) setEditCatDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif text-xl">Edit Category</DialogTitle></DialogHeader>
          {editCatDialog && (
            <div className="space-y-3">
              <div><Label className="text-sm font-semibold">Name (EN)</Label><Input value={editCatDialog.name} onChange={(e) => setEditCatDialog((f: any) => ({ ...f, name: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
              <div><Label className="text-sm font-semibold">Name (AR)</Label><Input value={editCatDialog.nameAr || ""} onChange={(e) => setEditCatDialog((f: any) => ({ ...f, nameAr: e.target.value }))} className="mt-1 rounded-lg h-11" dir="rtl" /></div>
              <div><Label className="text-sm font-semibold">Description (EN)</Label><Input value={editCatDialog.description || ""} onChange={(e) => setEditCatDialog((f: any) => ({ ...f, description: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
              <div><Label className="text-sm font-semibold">Description (AR)</Label><Input value={editCatDialog.descriptionAr || ""} onChange={(e) => setEditCatDialog((f: any) => ({ ...f, descriptionAr: e.target.value }))} className="mt-1 rounded-lg h-11" dir="rtl" /></div>
              <div><Label className="text-sm font-semibold">Icon (Image URL)</Label><Input value={editCatDialog.icon || ""} onChange={(e) => setEditCatDialog((f: any) => ({ ...f, icon: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
              <Button onClick={() => updateCat.mutate({ id: editCatDialog.id, name: editCatDialog.name, nameAr: editCatDialog.nameAr, description: editCatDialog.description, descriptionAr: editCatDialog.descriptionAr, icon: editCatDialog.icon })} size="lg" className="w-full rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={updateCat.isPending}>{updateCat.isPending ? "Saving..." : "Save"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-xl font-bold flex items-center gap-2"><Tag className="h-5 w-5 text-[#4A9B82]" /> Services ({svcs?.length || 0})</h3>
          <Dialog open={svcDialog} onOpenChange={setSvcDialog}>
            <DialogTrigger asChild><Button className="gap-2 rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white px-5"><Plus className="h-4 w-4" /> New Service</Button></DialogTrigger>
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
                <Button onClick={() => createSvc.mutate(svcForm)} size="lg" className="w-full rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={createSvc.isPending || !svcForm.name || !svcForm.categoryId}>{createSvc.isPending ? "Creating..." : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border/40"><tr><th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Service</th><th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Category</th><th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name (AR)</th><th className="text-end p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th></tr></thead>
            <tbody>
              {svcs?.map((s: any) => (
                <tr key={s.id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-semibold">{s.name}</td>
                  <td className="p-4 text-muted-foreground">{cats?.find((c: any) => c.id === s.categoryId)?.name || "—"}</td>
                  <td className="p-4" dir="rtl">{s.nameAr || "—"}</td>
                  <td className="p-4 text-end"><Button variant="ghost" size="sm" className="rounded-lg hover:bg-[#4A9B82]/10" onClick={() => setEditSvcDialog({ ...s })}><Pencil className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit Service Dialog */}
      <Dialog open={!!editSvcDialog} onOpenChange={(open) => { if (!open) setEditSvcDialog(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif text-xl">Edit Service</DialogTitle></DialogHeader>
          {editSvcDialog && (
            <div className="space-y-3">
              <div><Label className="text-sm font-semibold">Name (EN)</Label><Input value={editSvcDialog.name} onChange={(e) => setEditSvcDialog((f: any) => ({ ...f, name: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
              <div><Label className="text-sm font-semibold">Name (AR)</Label><Input value={editSvcDialog.nameAr || ""} onChange={(e) => setEditSvcDialog((f: any) => ({ ...f, nameAr: e.target.value }))} className="mt-1 rounded-lg h-11" dir="rtl" /></div>
              <div><Label className="text-sm font-semibold">Description (EN)</Label><Input value={editSvcDialog.description || ""} onChange={(e) => setEditSvcDialog((f: any) => ({ ...f, description: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
              <div><Label className="text-sm font-semibold">Description (AR)</Label><Input value={editSvcDialog.descriptionAr || ""} onChange={(e) => setEditSvcDialog((f: any) => ({ ...f, descriptionAr: e.target.value }))} className="mt-1 rounded-lg h-11" dir="rtl" /></div>
              <Button onClick={() => updateSvc.mutate({ id: editSvcDialog.id, name: editSvcDialog.name, nameAr: editSvcDialog.nameAr, description: editSvcDialog.description, descriptionAr: editSvcDialog.descriptionAr })} size="lg" className="w-full rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={updateSvc.isPending}>{updateSvc.isPending ? "Saving..." : "Save"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Review Moderation ──────────────────────────────────────────────
function ReviewModeration() {
  const { data: reviews, isLoading } = trpc.admin.reviews.list.useQuery();
  const utils = trpc.useUtils();
  const deleteMutation = trpc.admin.reviews.delete.useMutation({ onSuccess: () => { toast.success("Review deleted"); utils.admin.reviews.list.invalidate(); } });
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = useMemo(() => {
    if (!reviews) return [];
    if (!searchQuery) return reviews;
    const s = searchQuery.toLowerCase();
    return reviews.filter((r: any) => String(r.id).includes(s) || r.customerName?.toLowerCase().includes(s) || r.professionalName?.toLowerCase().includes(s));
  }, [reviews, searchQuery]);
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-xl font-bold flex items-center gap-2"><Star className="h-5 w-5 text-[#D4A757]" /> Reviews ({reviews?.length || 0})</h3>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search ID, customer, professional..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-72 rounded-lg h-10" /></div>
      </div>
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((r: any) => (
            <div key={r.id} className="bg-card border border-border/60 rounded-xl p-5 hover:border-[#D4A757]/30 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs text-muted-foreground">#{r.id}</span>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= r.rating ? "text-[#D4A757] fill-[#D4A757]" : "text-muted-foreground/30"}`} />)}</div>
                  </div>
                  <p className="text-sm font-semibold">{r.customerName || "Customer"} → {r.professionalName || "Professional"}</p>
                  {(r.professionalCountry || r.professionalCity) && <p className="text-xs text-muted-foreground">{r.professionalCountry}{r.professionalCity ? `, ${r.professionalCity}` : ""}</p>}
                  {r.comment && <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" className="text-destructive rounded-lg" onClick={() => deleteMutation.mutate({ id: r.id })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20"><Star className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground text-lg">No reviews</p></div>}
    </div>
  );
}

// ─── Payment Tracking ───────────────────────────────────────────────
function PaymentTracking() {
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);
  const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);
  const { data: payments, isLoading } = trpc.admin.payments.list.useQuery({ year: filterYear, month: filterMonth });
  const utils = trpc.useUtils();
  const updatePremiumStatus = trpc.admin.premiumBatches.updateStatus.useMutation({ onSuccess: () => { toast.success("Updated"); utils.admin.payments.list.invalidate(); } });
  const updateAdStatus = trpc.admin.adBatches.updateStatus.useMutation({ onSuccess: () => { toast.success("Updated"); utils.admin.payments.list.invalidate(); } });

  const totalPending = useMemo(() => payments?.filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + parseFloat(p.totalAmount), 0) || 0, [payments]);
  const totalPaid = useMemo(() => payments?.filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + parseFloat(p.totalAmount), 0) || 0, [payments]);

  const handleExportCSV = () => {
    if (!payments || payments.length === 0) return;
    const headers = ["ID","Type","Name","Country","Days","Amount","Status","Created"];
    const rows = payments.map((p: any) => [p.id, p.type, p.type === 'premium' ? (p.userName || '') : (p.adTitle || ''), p.country || '', p.totalDays, p.totalAmount, p.status, new Date(p.createdAt).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `payments_${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-serif text-xl font-bold flex items-center gap-2"><DollarSign className="h-5 w-5 text-[#4A9B82]" /> Payment Tracking</h3>
        <div className="flex gap-2 items-center">
          <Select value={filterYear ? String(filterYear) : "all"} onValueChange={(v) => setFilterYear(v === "all" ? undefined : Number(v))}>
            <SelectTrigger className="w-28 rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Years</SelectItem>{[2024,2025,2026,2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterMonth ? String(filterMonth) : "all"} onValueChange={(v) => setFilterMonth(v === "all" ? undefined : Number(v))}>
            <SelectTrigger className="w-32 rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Months</SelectItem>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2 rounded-lg" onClick={handleExportCSV}><Download className="h-4 w-4" /> Export CSV</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card border border-border/60 rounded-xl p-5"><span className="text-sm text-muted-foreground">Total Pending</span><p className="text-3xl font-serif font-bold text-[#D4A757] mt-1">${totalPending.toFixed(2)}</p></div>
        <div className="bg-card border border-border/60 rounded-xl p-5"><span className="text-sm text-muted-foreground">Total Paid</span><p className="text-3xl font-serif font-bold text-[#4A9B82] mt-1">${totalPaid.toFixed(2)}</p></div>
        <div className="bg-card border border-border/60 rounded-xl p-5"><span className="text-sm text-muted-foreground">Total Batches</span><p className="text-3xl font-serif font-bold mt-1">{payments?.length || 0}</p></div>
      </div>
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border/40">
              <tr>
                <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">ID</th>
                <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Country</th>
                <th className="text-start p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Days</th>
                <th className="text-end p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="text-center p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-end p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments?.map((p: any) => (
                <tr key={`${p.type}-${p.id}`} className={`border-t border-border/30 hover:bg-muted/20 transition-colors ${p.status === 'pending' ? 'bg-yellow-50/50 dark:bg-yellow-950/10' : ''}`}>
                  <td className="p-4 font-mono text-xs">#{p.id}</td>
                  <td className="p-4"><Badge variant="outline" className={`rounded-lg ${p.type === 'premium' ? 'border-[#4A9B82] text-[#4A9B82]' : 'border-[#3D1A5D] text-[#3D1A5D]'}`}>{p.type}</Badge></td>
                  <td className="p-4 font-semibold">{p.type === 'premium' ? (p.userName || '—') : (p.adTitle || '—')}</td>
                  <td className="p-4 text-muted-foreground">{p.country || 'Global'}</td>
                  <td className="p-4 text-muted-foreground">{p.totalDays}d</td>
                  <td className="p-4 text-end font-bold">${p.totalAmount}</td>
                  <td className="p-4 text-center"><Badge variant={p.status === 'paid' ? 'default' : p.status === 'cancelled' ? 'destructive' : 'outline'} className={`rounded-lg ${p.status === 'paid' ? 'bg-[#4A9B82]' : p.status === 'active' ? 'bg-blue-500 text-white' : ''}`}>{p.status}</Badge></td>
                  <td className="p-4 text-end">
                    {p.status === 'pending' && (
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" className="rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white h-8 px-3 text-xs" onClick={() => p.type === 'premium' ? updatePremiumStatus.mutate({ id: p.id, status: 'paid' }) : updateAdStatus.mutate({ id: p.id, status: 'paid' })}>Mark Paid</Button>
                        <Button size="sm" variant="destructive" className="rounded-lg h-8 px-3 text-xs" onClick={() => p.type === 'premium' ? updatePremiumStatus.mutate({ id: p.id, status: 'cancelled' }) : updateAdStatus.mutate({ id: p.id, status: 'cancelled' })}>Cancel</Button>
                      </div>
                    )}
                    {p.status === 'paid' && p.paidAt && <span className="text-xs text-muted-foreground">Paid {new Date(p.paidAt).toLocaleDateString()}</span>}
                  </td>
                </tr>
              ))}
              {(!payments || payments.length === 0) && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No payment records found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Ad Management ──────────────────────────────────────────────────
function AdManagement() {
  const { t } = useLanguage();
  const { data: ads, isLoading } = trpc.admin.ads.list.useQuery();
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [enabledOnly, setEnabledOnly] = useState(false);
  const [form, setForm] = useState({ title: "", imageUrl: "", linkUrl: "", position: "home_banner" as const, country: "", city: "" });

  const createMutation = trpc.admin.ads.create.useMutation({ onSuccess: () => { toast.success(t("admin.adCreated")); utils.admin.ads.list.invalidate(); setDialogOpen(false); setForm({ title: "", imageUrl: "", linkUrl: "", position: "home_banner", country: "", city: "" }); } });
  const toggleLock = trpc.admin.ads.toggleLock.useMutation({ onSuccess: () => { toast.success(t("admin.updated")); utils.admin.ads.list.invalidate(); } });

  const filtered = useMemo(() => {
    if (!ads) return [];
    let result = ads;
    if (searchQuery) result = result.filter((a: any) => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (enabledOnly) result = result.filter((a: any) => a.isActive && !a.isLocked);
    return result;
  }, [ads, searchQuery, enabledOnly]);

  if (selectedAdId) return <AdDetail adId={selectedAdId} onBack={() => setSelectedAdId(null)} />;
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-56 rounded-lg h-10" /></div>
          <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={enabledOnly} onCheckedChange={setEnabledOnly} /><span className="text-muted-foreground">Enabled only</span></label>
          <span className="text-sm text-muted-foreground">{filtered.length} ads</span>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2 rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white px-5"><Plus className="h-4 w-4" /> {t("admin.newAd")}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif text-xl">{t("admin.createAd")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold">{t("admin.adTitle")} *</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1.5 rounded-lg h-11" /></div>
              <div><Label className="text-sm font-semibold">{t("admin.adImageUrl")} *</Label><Input value={form.imageUrl} onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="mt-1.5 rounded-lg h-11" placeholder="https://..." /></div>
              <div><Label className="text-sm font-semibold">{t("admin.adLinkUrl")}</Label><Input value={form.linkUrl} onChange={(e) => setForm(f => ({ ...f, linkUrl: e.target.value }))} className="mt-1.5 rounded-lg h-11" /></div>
              <div><Label className="text-sm font-semibold">{t("admin.adPosition")} *</Label>
                <Select value={form.position} onValueChange={(v: any) => setForm(f => ({ ...f, position: v }))}>
                  <SelectTrigger className="mt-1.5 rounded-lg h-11"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="home_banner">{t("admin.homeBanner")}</SelectItem><SelectItem value="search_banner">{t("admin.searchBanner")}</SelectItem><SelectItem value="sidebar">{t("admin.sidebar")}</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-sm font-semibold">Country *</Label><CountrySelect value={form.country} onChange={(v) => setForm(f => ({ ...f, country: v, city: "" }))} className="mt-1" /></div>
                <div><Label className="text-sm font-semibold">City *</Label><CitySelect country={form.country} value={form.city} onChange={(v) => setForm(f => ({ ...f, city: v }))} className="mt-1" /></div>
              </div>
              <Button onClick={() => createMutation.mutate({ ...form, country: form.country || undefined, city: form.city || undefined })} size="lg" className="w-full rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={createMutation.isPending || !form.title || !form.imageUrl || !form.position || !form.country || !form.city}>{createMutation.isPending ? t("admin.creating") : t("admin.createAd")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((ad: any) => (
            <div key={ad.id} className="bg-card border border-border/60 rounded-xl p-5 hover:border-[#4A9B82]/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} className="h-14 w-24 object-cover rounded-lg border border-border/40" />}
                  <div>
                    <h3 className="font-semibold">{ad.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ad.position.replace("_", " ")}
                      {ad.country && ` · ${ad.country}`}{ad.city && `, ${ad.city}`}
                    </p>
                    <div className="flex gap-1.5 mt-1">
                      {ad.isActive && !ad.isLocked && <Badge className="text-xs bg-[#4A9B82] text-white rounded-lg">Enabled</Badge>}
                      {ad.isLocked && <Badge variant="destructive" className="text-xs rounded-lg">Locked</Badge>}
                      {!ad.isActive && !ad.isLocked && <Badge variant="outline" className="text-xs rounded-lg">Inactive</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Button variant="ghost" size="sm" className="rounded-lg hover:bg-[#4A9B82]/10" onClick={() => setSelectedAdId(ad.id)} title="View/Edit"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className={`rounded-lg ${ad.isLocked ? "text-destructive" : ""}`} onClick={() => toggleLock.mutate({ id: ad.id, isLocked: !ad.isLocked })} title={ad.isLocked ? "Unlock" : "Lock"}>{ad.isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20"><Megaphone className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground text-lg">{t("admin.noAds")}</p></div>}
    </div>
  );
}

// ─── Ad Detail (with edit + batches inside) ─────────────────────────
function AdDetail({ adId, onBack }: { adId: number; onBack: () => void }) {
  const { data: ads } = trpc.admin.ads.list.useQuery();
  const { data: feeConfigs } = trpc.admin.feeConfig.list.useQuery({ feeType: "advertisement" });
  const utils = trpc.useUtils();
  const ad = ads?.find((a: any) => a.id === adId);

  const [editForm, setEditForm] = useState<any>(null);
  const [batchDialog, setBatchDialog] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [batchFee, setBatchFee] = useState("");
  const [batchNotes, setBatchNotes] = useState("");
  const [batchPage, setBatchPage] = useState(1);
  const [editBatchDialog, setEditBatchDialog] = useState<any>(null);
  const [editDates, setEditDates] = useState<string[]>([]);
  const [editFeeVal, setEditFeeVal] = useState("");
  const [editNotesVal, setEditNotesVal] = useState("");

  const { data: paginatedBatches } = trpc.admin.adBatches.byAd.useQuery({ advertisementId: adId, page: batchPage });
  const updateAd = trpc.admin.ads.update.useMutation({ onSuccess: () => { toast.success("Updated"); utils.admin.ads.list.invalidate(); setEditForm(null); } });
  const createBatch = trpc.admin.adBatches.create.useMutation({ onSuccess: () => { toast.success("Batch created"); utils.admin.adBatches.byAd.invalidate(); setBatchDialog(false); }, onError: (err: any) => toast.error(err.message) });
  const updateBatch = trpc.admin.adBatches.update.useMutation({ onSuccess: () => { toast.success("Batch updated"); utils.admin.adBatches.byAd.invalidate(); setEditBatchDialog(null); }, onError: (err: any) => toast.error(err.message) });

  if (!ad) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const defaultFee = feeConfigs?.find((f: any) => f.country === ad.country && f.city === ad.city)?.feePerDay
    || feeConfigs?.find((f: any) => f.country === ad.country && !f.city)?.feePerDay
    || feeConfigs?.find((f: any) => !f.country)?.feePerDay || "0";
  const numDays = selectedDates.length;
  const batchTotal = numDays * parseFloat(batchFee || defaultFee || "0");

  return (
    <div>
      <Button variant="ghost" className="gap-2 mb-5 rounded-lg hover:bg-[#4A9B82]/10" onClick={onBack}><ChevronLeft className="h-4 w-4 rtl-flip" /> Back to Ads</Button>

      {/* Ad Info */}
      <div className="bg-card border border-border/60 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-xl font-bold flex items-center gap-2"><Megaphone className="h-5 w-5 text-[#4A9B82]" /> Advertisement Details</h3>
          <Button variant="outline" className="gap-2 rounded-lg" onClick={() => setEditForm({ ...ad })}><Pencil className="h-4 w-4" /> Edit</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} className="w-full h-48 object-cover rounded-lg border border-border/40" />}
          <div className="space-y-3 text-sm">
            {[["Title", ad.title], ["Position", ad.position.replace("_", " ")], ["Country", ad.country || "—"], ["City", ad.city || "—"], ["Link", ad.linkUrl || "—"]].map(([l, v]) => (
              <div key={l} className="flex justify-between py-1.5 border-b border-border/20"><span className="text-muted-foreground">{l}:</span><span className="font-medium">{v}</span></div>
            ))}
            <div className="flex justify-between py-1.5 border-b border-border/20"><span className="text-muted-foreground">Status:</span>
              <div className="flex gap-1.5">
                {ad.isActive && !ad.isLocked && <Badge className="bg-[#4A9B82] text-white rounded-lg">Enabled</Badge>}
                {ad.isLocked && <Badge variant="destructive" className="rounded-lg">Locked</Badge>}
                {!ad.isActive && !ad.isLocked && <Badge variant="outline" className="rounded-lg">Inactive</Badge>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Ad Dialog */}
      <Dialog open={!!editForm} onOpenChange={(open) => { if (!open) setEditForm(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif text-xl">Edit Advertisement</DialogTitle></DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div><Label className="text-sm font-semibold">Title *</Label><Input value={editForm.title} onChange={(e) => setEditForm((f: any) => ({ ...f, title: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
              <div><Label className="text-sm font-semibold">Image URL *</Label><Input value={editForm.imageUrl || ""} onChange={(e) => setEditForm((f: any) => ({ ...f, imageUrl: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
              <div><Label className="text-sm font-semibold">Link URL</Label><Input value={editForm.linkUrl || ""} onChange={(e) => setEditForm((f: any) => ({ ...f, linkUrl: e.target.value }))} className="mt-1 rounded-lg h-11" /></div>
              <div><Label className="text-sm font-semibold">Position *</Label>
                <Select value={editForm.position} onValueChange={(v: any) => setEditForm((f: any) => ({ ...f, position: v }))}>
                  <SelectTrigger className="mt-1 rounded-lg h-11"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="home_banner">Home Banner</SelectItem><SelectItem value="search_banner">Search Banner</SelectItem><SelectItem value="sidebar">Sidebar</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-sm font-semibold">Country *</Label><CountrySelect value={editForm.country || ""} onChange={(v) => setEditForm((f: any) => ({ ...f, country: v, city: "" }))} className="mt-1" /></div>
                <div><Label className="text-sm font-semibold">City *</Label><CitySelect country={editForm.country || ""} value={editForm.city || ""} onChange={(v) => setEditForm((f: any) => ({ ...f, city: v }))} className="mt-1" /></div>
              </div>
              <Button onClick={() => updateAd.mutate({ id: editForm.id, title: editForm.title, imageUrl: editForm.imageUrl, linkUrl: editForm.linkUrl, position: editForm.position, country: editForm.country || undefined, city: editForm.city || undefined })} size="lg" className="w-full rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={updateAd.isPending || !editForm.title || !editForm.imageUrl || !editForm.country || !editForm.city}>{updateAd.isPending ? "Saving..." : "Save Changes"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ad Batches */}
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-xl font-bold flex items-center gap-2"><Calendar className="h-5 w-5 text-[#4A9B82]" /> Ad Batches</h3>
          <Dialog open={batchDialog} onOpenChange={(open) => { setBatchDialog(open); if (open) { setBatchFee(defaultFee); setSelectedDates([]); setBatchNotes(""); } }}>
            <DialogTrigger asChild><Button className="gap-2 rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white px-5"><Plus className="h-4 w-4" /> New Batch</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-serif text-xl">Create Ad Batch</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Country: <strong>{ad.country || "Global"}</strong> · Default fee: <strong>${defaultFee}/day</strong></p>
                <MultiDatePicker selectedDates={selectedDates} onChange={setSelectedDates} minDate={new Date()} label="Select Ad Dates" />
                <div><Label className="text-sm font-semibold">Fee per Day (USD)</Label><Input type="number" step="0.01" value={batchFee} onChange={(e) => setBatchFee(e.target.value)} className="mt-1 rounded-lg h-11" placeholder={defaultFee} /></div>
                <div><Label className="text-sm font-semibold">Notes (optional)</Label><Textarea value={batchNotes} onChange={(e) => setBatchNotes(e.target.value)} className="mt-1 rounded-lg" rows={2} /></div>
                {numDays > 0 && (
                  <div className="bg-[#4A9B82]/5 border border-[#4A9B82]/20 rounded-lg p-4 text-sm">
                    <p><strong>{numDays}</strong> days × <strong>${parseFloat(batchFee || defaultFee).toFixed(2)}</strong>/day = <strong className="text-[#4A9B82] text-lg">${batchTotal.toFixed(2)}</strong></p>
                  </div>
                )}
                <Button onClick={() => {
                  if (selectedDates.length === 0) { toast.error("Please select at least one date"); return; }
                  createBatch.mutate({ advertisementId: adId, country: ad.country || undefined, selectedDates, feePerDay: batchFee || defaultFee, totalDays: numDays, totalAmount: batchTotal.toFixed(2), notes: batchNotes || undefined });
                }} size="lg" className="w-full rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={createBatch.isPending || selectedDates.length === 0}>{createBatch.isPending ? "Creating..." : "Create Batch (Pending)"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {paginatedBatches && paginatedBatches.results.length > 0 ? (
          <div className="space-y-3">
            {paginatedBatches.results.map((b: any) => {
              const dates = Array.isArray(b.selectedDates) ? b.selectedDates : (typeof b.selectedDates === 'string' ? JSON.parse(b.selectedDates) : []);
              return (
                <div key={b.id} className="border border-border/40 rounded-lg p-4 text-sm hover:border-[#4A9B82]/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Batch #{b.id}</p>
                      <p className="text-muted-foreground">{dates.length} days · {dates.slice(0, 3).join(", ")}{dates.length > 3 ? ` +${dates.length - 3} more` : ""}</p>
                      {b.notes && <p className="text-muted-foreground text-xs mt-1">{b.notes}</p>}
                    </div>
                    <div className="text-end flex items-center gap-3">
                      <div>
                        <p className="font-bold text-[#4A9B82]">${b.totalAmount}</p>
                        <Badge variant={b.status === 'paid' ? 'default' : b.status === 'cancelled' ? 'destructive' : 'outline'} className={`rounded-lg mt-1 ${b.status === 'paid' ? 'bg-[#4A9B82]' : b.status === 'active' ? 'bg-blue-500 text-white' : ''}`}>{b.status}</Badge>
                      </div>
                      {b.status === 'pending' && (
                        <div className="flex flex-col gap-1">
                          <Button variant="outline" size="sm" className="rounded-lg h-7 text-xs" onClick={() => { setEditBatchDialog(b); setEditDates(dates); setEditFeeVal(b.feePerDay); setEditNotesVal(b.notes || ""); }}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                          <Button variant="destructive" size="sm" className="rounded-lg h-7 text-xs" onClick={() => updateBatch.mutate({ id: b.id, status: 'cancelled' })}><XCircle className="h-3 w-3 mr-1" /> Cancel</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {paginatedBatches.total > 10 && (
              <div className="flex justify-center gap-2 mt-3">
                <Button variant="outline" size="sm" className="rounded-lg" disabled={batchPage <= 1} onClick={() => setBatchPage(p => p - 1)}>Prev</Button>
                <span className="text-sm text-muted-foreground flex items-center">{batchPage}/{Math.ceil(paginatedBatches.total / 10)}</span>
                <Button variant="outline" size="sm" className="rounded-lg" disabled={batchPage >= Math.ceil(paginatedBatches.total / 10)} onClick={() => setBatchPage(p => p + 1)}>Next</Button>
              </div>
            )}
          </div>
        ) : <p className="text-muted-foreground text-sm">No batches yet</p>}
      </div>

      {/* Edit Batch Dialog */}
      <Dialog open={!!editBatchDialog} onOpenChange={(open) => { if (!open) setEditBatchDialog(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-serif text-xl">Edit Batch #{editBatchDialog?.id}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <MultiDatePicker selectedDates={editDates} onChange={setEditDates} minDate={new Date()} label="Edit Dates" />
            <div><Label className="text-sm font-semibold">Fee per Day (USD)</Label><Input type="number" step="0.01" value={editFeeVal} onChange={(e) => setEditFeeVal(e.target.value)} className="mt-1 rounded-lg h-11" /></div>
            <div><Label className="text-sm font-semibold">Notes</Label><Textarea value={editNotesVal} onChange={(e) => setEditNotesVal(e.target.value)} className="mt-1 rounded-lg" rows={2} /></div>
            {editDates.length > 0 && (
              <div className="bg-[#4A9B82]/5 border border-[#4A9B82]/20 rounded-lg p-4 text-sm">
                <p><strong>{editDates.length}</strong> days × <strong>${parseFloat(editFeeVal || "0").toFixed(2)}</strong>/day = <strong className="text-[#4A9B82] text-lg">${(editDates.length * parseFloat(editFeeVal || "0")).toFixed(2)}</strong></p>
              </div>
            )}
            <Button onClick={() => { if (!editBatchDialog) return; updateBatch.mutate({ id: editBatchDialog.id, selectedDates: editDates, feePerDay: editFeeVal, totalDays: editDates.length, totalAmount: (editDates.length * parseFloat(editFeeVal || "0")).toFixed(2), notes: editNotesVal || undefined }); }} size="lg" className="w-full rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={updateBatch.isPending}>{updateBatch.isPending ? "Saving..." : "Save Changes"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Chat Monitoring ────────────────────────────────────────────────
function ChatMonitoring() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const { data: rooms, isLoading } = trpc.admin.chatRooms.useQuery({ search: searchQuery || undefined, dateFilter: dateFilter || undefined });
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (selectedRoom) return <ChatRoomView roomId={selectedRoom} onBack={() => setSelectedRoom(null)} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h3 className="font-serif text-xl font-bold flex items-center gap-2"><MessageSquare className="h-5 w-5 text-[#4A9B82]" /> Chat Rooms ({rooms?.length || 0})</h3>
        <div className="flex gap-2">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-48 rounded-lg h-10" /></div>
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-40 rounded-lg h-10" />
          {dateFilter && <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setDateFilter("")}><XCircle className="h-4 w-4" /></Button>}
        </div>
      </div>
      {rooms && rooms.length > 0 ? (
        <div className="space-y-3">
          {rooms.map((r: any) => (
            <div key={r.id} className="bg-card border border-border/60 rounded-xl p-5 flex items-center justify-between cursor-pointer hover:border-[#4A9B82]/30 transition-all hover:shadow-md" onClick={() => setSelectedRoom(r.id)}>
              <div>
                <span className="font-semibold">{r.user1?.name || "User"} ↔ {r.user2?.name || "User"}</span>
                {r.lastMessage && <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">{r.lastMessage.content || `[${r.lastMessage.messageType}]`}</p>}
              </div>
              <span className="text-xs text-muted-foreground">{r.lastMessageAt ? new Date(r.lastMessageAt).toLocaleDateString() : ""}</span>
            </div>
          ))}
        </div>
      ) : <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20"><MessageSquare className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground text-lg">No chat rooms found</p></div>}
    </div>
  );
}

function ChatRoomView({ roomId, onBack }: { roomId: number; onBack: () => void }) {
  const { data: messages, isLoading } = trpc.admin.chatMessages.useQuery({ roomId, limit: 100 });
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  return (
    <div>
      <Button variant="ghost" className="gap-2 mb-5 rounded-lg hover:bg-[#4A9B82]/10" onClick={onBack}><ChevronLeft className="h-4 w-4 rtl-flip" /> Back to Rooms</Button>
      <div className="bg-card border border-border/60 rounded-xl p-5 max-h-[600px] overflow-y-auto space-y-4">
        {messages && [...messages].reverse().map((m: any) => (
          <div key={m.id} className="text-sm border-b border-border/20 pb-3 last:border-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-semibold">{m.senderName || "User"}</span>
              <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span>
              {m.messageType !== 'text' && <Badge variant="outline" className="text-xs rounded-lg">{m.messageType}</Badge>}
            </div>
            {m.messageType === 'text' && <p className="text-muted-foreground">{m.content}</p>}
            {m.messageType === 'image' && m.mediaUrl && <img src={m.mediaUrl} alt="shared" className="max-h-40 object-contain rounded-lg border border-border/40" />}
            {m.messageType === 'video' && m.mediaUrl && <video src={m.mediaUrl} controls className="max-h-40 rounded-lg border border-border/40" />}
            {m.messageType === 'location' && <p className="text-muted-foreground">Location: {m.content}</p>}
          </div>
        ))}
        {(!messages || messages.length === 0) && <p className="text-muted-foreground text-center py-8">No messages in this room</p>}
      </div>
    </div>
  );
}

// ─── Contact Messages ───────────────────────────────────────────────
function ContactMessages() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: messages, isLoading } = trpc.admin.contacts.useQuery({ status: statusFilter });
  const utils = trpc.useUtils();
  const [replyDialog, setReplyDialog] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<"pending" | "in_progress" | "closed">("in_progress");
  const replyMutation = trpc.admin.contactReply.useMutation({ onSuccess: () => { toast.success("Reply sent"); utils.admin.contacts.invalidate(); setReplyDialog(null); setReplyText(""); }, onError: (err: any) => toast.error(err.message) });
  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-xl font-bold">{t("admin.contacts")}</h3>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 rounded-lg"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent>
        </Select>
      </div>
      {messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((msg: any) => (
            <div key={msg.id} className="bg-card border border-border/60 rounded-xl p-6 hover:border-[#4A9B82]/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div><h3 className="font-serif font-bold text-base">{msg.subject}</h3><p className="text-sm text-muted-foreground">{msg.email}{msg.userId ? ` (User #${msg.userId})` : ""}</p></div>
                <div className="flex items-center gap-2"><Badge variant={msg.status === 'closed' ? 'default' : msg.status === 'in_progress' ? 'outline' : 'destructive'} className="rounded-lg">{msg.status === 'in_progress' ? 'In Progress' : msg.status}</Badge><span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleDateString()}</span></div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{msg.description}</p>
              {msg.adminReply && (
                <div className="bg-[#4A9B82]/5 border border-[#4A9B82]/10 rounded-lg p-4 text-sm mb-4 border-s-4 border-s-[#4A9B82]">
                  <p className="font-semibold text-xs text-[#4A9B82] mb-1.5">Admin Reply ({msg.repliedAt ? new Date(msg.repliedAt).toLocaleDateString() : ""}):</p>
                  <p className="text-muted-foreground">{msg.adminReply}</p>
                </div>
              )}
              <Dialog open={replyDialog === msg.id} onOpenChange={(open) => { if (!open) setReplyDialog(null); else { setReplyDialog(msg.id); setReplyStatus(msg.status === 'pending' ? 'in_progress' : msg.status); } }}>
                <DialogTrigger asChild><Button variant="outline" size="sm" className="rounded-lg hover:bg-[#4A9B82]/5 hover:border-[#4A9B82]/40">Reply / Update Status</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle className="font-serif text-xl">Reply to: {msg.subject}</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label className="text-sm font-semibold">Status</Label>
                      <Select value={replyStatus} onValueChange={(v: any) => setReplyStatus(v)}>
                        <SelectTrigger className="mt-1 rounded-lg h-11"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-sm font-semibold">Reply Message (optional)</Label><Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="mt-1 rounded-lg" rows={4} /></div>
                    <Button onClick={() => replyMutation.mutate({ id: msg.id, status: replyStatus, adminReply: replyText || undefined })} size="lg" className="w-full rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={replyMutation.isPending}>{replyMutation.isPending ? "Sending..." : "Update"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      ) : <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20"><Mail className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" /><p className="text-muted-foreground text-lg">{t("admin.noContacts")}</p></div>}
    </div>
  );
}

// ─── Site Configuration ─────────────────────────────────────────────
function SiteConfiguration() {
  const { data: aboutEn, isLoading: loadingEn } = trpc.admin.siteConfig.get.useQuery({ key: "about_us_en" });
  const { data: aboutAr, isLoading: loadingAr } = trpc.admin.siteConfig.get.useQuery({ key: "about_us_ar" });
  const { data: feeConfigs, isLoading: loadingFees } = trpc.admin.feeConfig.list.useQuery();
  const { data: listingConfigs, isLoading: loadingListing } = trpc.admin.listingOrderConfig.list.useQuery();
  const [enContent, setEnContent] = useState("");
  const [arContent, setArContent] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [feeForm, setFeeForm] = useState({ feeType: "premium" as "premium" | "advertisement", country: "", city: "", feePerDay: "" });
  const [listingForm, setListingForm] = useState({ configType: "premium" as "premium" | "advertisement", country: "", city: "", maxCount: "" });
  const utils = trpc.useUtils();

  const saveMutation = trpc.admin.siteConfig.set.useMutation({ onSuccess: () => { toast.success("Configuration saved"); utils.admin.siteConfig.get.invalidate(); }, onError: (err: any) => toast.error(err.message) });
  const upsertFee = trpc.admin.feeConfig.upsert.useMutation({ onSuccess: () => { toast.success("Fee saved"); utils.admin.feeConfig.list.invalidate(); setFeeForm(f => ({ ...f, country: "", city: "", feePerDay: "" })); }, onError: (err: any) => toast.error(err.message) });
  const deleteFee = trpc.admin.feeConfig.delete.useMutation({ onSuccess: () => { toast.success("Fee deleted"); utils.admin.feeConfig.list.invalidate(); } });
  const upsertListing = trpc.admin.listingOrderConfig.upsert.useMutation({ onSuccess: () => { toast.success("Config saved"); utils.admin.listingOrderConfig.list.invalidate(); setListingForm(f => ({ ...f, country: "", city: "", maxCount: "" })); }, onError: (err: any) => toast.error(err.message) });
  const deleteListing = trpc.admin.listingOrderConfig.delete.useMutation({ onSuccess: () => { toast.success("Config deleted"); utils.admin.listingOrderConfig.list.invalidate(); } });

  if (!initialized && !loadingEn && !loadingAr) { setEnContent(aboutEn || ""); setArContent(aboutAr || ""); setInitialized(true); }
  if (loadingEn || loadingAr || loadingFees || loadingListing) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <h3 className="font-serif text-xl font-bold flex items-center gap-2"><Settings className="h-5 w-5 text-[#4A9B82]" /> Site Configuration</h3>

      {/* Fee Configuration */}
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <h4 className="font-serif font-bold mb-4 flex items-center gap-2"><DollarSign className="h-4 w-4 text-[#D4A757]" /> Fee Configuration (per day, USD)</h4>
        <p className="text-sm text-muted-foreground mb-4">Set default fees and country/city-specific overrides for premium and advertisement batches.</p>
        <div className="flex gap-3 mb-5 flex-wrap items-end">
          <div><Label className="text-xs font-semibold">Type</Label>
            <Select value={feeForm.feeType} onValueChange={(v: any) => setFeeForm(f => ({ ...f, feeType: v }))}>
              <SelectTrigger className="w-40 rounded-lg h-10 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="premium">Premium</SelectItem><SelectItem value="advertisement">Advertisement</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs font-semibold">Country</Label><CountrySelect value={feeForm.country} onChange={(v) => setFeeForm(f => ({ ...f, country: v, city: "" }))} className="w-44 mt-1" allowEmpty /></div>
          <div><Label className="text-xs font-semibold">City</Label><CitySelect country={feeForm.country} value={feeForm.city} onChange={(v) => setFeeForm(f => ({ ...f, city: v }))} className="w-40 mt-1" allowEmpty /></div>
          <div><Label className="text-xs font-semibold">Fee/Day ($)</Label><Input type="number" step="0.01" value={feeForm.feePerDay} onChange={(e) => setFeeForm(f => ({ ...f, feePerDay: e.target.value }))} className="w-28 rounded-lg h-10 mt-1" placeholder="10.00" /></div>
          <Button size="sm" className="rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white h-10 px-5" disabled={!feeForm.feePerDay || upsertFee.isPending} onClick={() => upsertFee.mutate({ feeType: feeForm.feeType, country: feeForm.country || null, city: feeForm.city || null, feePerDay: feeForm.feePerDay })}>{upsertFee.isPending ? "Saving..." : "Save"}</Button>
        </div>
        {feeConfigs && feeConfigs.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-muted/30"><tr><th className="text-start p-3 text-xs uppercase text-muted-foreground">Type</th><th className="text-start p-3 text-xs uppercase text-muted-foreground">Country</th><th className="text-start p-3 text-xs uppercase text-muted-foreground">City</th><th className="text-end p-3 text-xs uppercase text-muted-foreground">Fee/Day</th><th className="text-end p-3 text-xs uppercase text-muted-foreground">Actions</th></tr></thead>
            <tbody>
              {feeConfigs.map((f: any) => (
                <tr key={f.id} className="border-t border-border/30">
                  <td className="p-3"><Badge variant="outline" className="rounded-lg capitalize">{f.feeType}</Badge></td>
                  <td className="p-3">{f.country || <span className="text-muted-foreground italic">Default</span>}</td>
                  <td className="p-3">{f.city || <span className="text-muted-foreground italic">All</span>}</td>
                  <td className="p-3 text-end font-bold">${f.feePerDay}</td>
                  <td className="p-3 text-end"><Button variant="ghost" size="sm" className="text-destructive rounded-lg" onClick={() => deleteFee.mutate({ id: f.id })}><Trash2 className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Listing Order Configuration */}
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <h4 className="font-serif font-bold mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#4A9B82]" /> Listing Order Count</h4>
        <p className="text-sm text-muted-foreground mb-4">Set maximum number of premium/ad listings per country/city.</p>
        <div className="flex gap-3 mb-5 flex-wrap items-end">
          <div><Label className="text-xs font-semibold">Type</Label>
            <Select value={listingForm.configType} onValueChange={(v: any) => setListingForm(f => ({ ...f, configType: v }))}>
              <SelectTrigger className="w-40 rounded-lg h-10 mt-1"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="premium">Premium</SelectItem><SelectItem value="advertisement">Advertisement</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs font-semibold">Country</Label><CountrySelect value={listingForm.country} onChange={(v) => setListingForm(f => ({ ...f, country: v, city: "" }))} className="w-44 mt-1" allowEmpty /></div>
          <div><Label className="text-xs font-semibold">City</Label><CitySelect country={listingForm.country} value={listingForm.city} onChange={(v) => setListingForm(f => ({ ...f, city: v }))} className="w-40 mt-1" allowEmpty /></div>
          <div><Label className="text-xs font-semibold">Max Count</Label><Input type="number" value={listingForm.maxCount} onChange={(e) => setListingForm(f => ({ ...f, maxCount: e.target.value }))} className="w-28 rounded-lg h-10 mt-1" placeholder="5" /></div>
          <Button size="sm" className="rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white h-10 px-5" disabled={!listingForm.maxCount || upsertListing.isPending} onClick={() => upsertListing.mutate({ configType: listingForm.configType, country: listingForm.country || null, city: listingForm.city || null, maxCount: Number(listingForm.maxCount) })}>{upsertListing.isPending ? "Saving..." : "Save"}</Button>
        </div>
        {listingConfigs && listingConfigs.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-muted/30"><tr><th className="text-start p-3 text-xs uppercase text-muted-foreground">Type</th><th className="text-start p-3 text-xs uppercase text-muted-foreground">Country</th><th className="text-start p-3 text-xs uppercase text-muted-foreground">City</th><th className="text-end p-3 text-xs uppercase text-muted-foreground">Max Count</th><th className="text-end p-3 text-xs uppercase text-muted-foreground">Actions</th></tr></thead>
            <tbody>
              {listingConfigs.map((l: any) => (
                <tr key={l.id} className="border-t border-border/30">
                  <td className="p-3"><Badge variant="outline" className="rounded-lg capitalize">{l.configType}</Badge></td>
                  <td className="p-3">{l.country || <span className="text-muted-foreground italic">Default</span>}</td>
                  <td className="p-3">{l.city || <span className="text-muted-foreground italic">All</span>}</td>
                  <td className="p-3 text-end font-bold">{l.maxCount}</td>
                  <td className="p-3 text-end"><Button variant="ghost" size="sm" className="text-destructive rounded-lg" onClick={() => deleteListing.mutate({ id: l.id })}><Trash2 className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* About Us Content */}
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <h4 className="font-serif font-bold mb-4 flex items-center gap-2"><FileText className="h-4 w-4 text-[#4A9B82]" /> About Us Content</h4>
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-semibold">English Content</Label>
            <Textarea value={enContent} onChange={(e) => setEnContent(e.target.value)} className="mt-1.5 rounded-lg" rows={6} />
            <Button size="sm" className="mt-2 rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate({ key: "about_us_en", value: enContent })}>{saveMutation.isPending ? "Saving..." : "Save English"}</Button>
          </div>
          <div>
            <Label className="text-sm font-semibold">Arabic Content</Label>
            <Textarea value={arContent} onChange={(e) => setArContent(e.target.value)} className="mt-1.5 rounded-lg" rows={6} dir="rtl" />
            <Button size="sm" className="mt-2 rounded-lg bg-[#4A9B82] hover:bg-[#2D6D5F] text-white" disabled={saveMutation.isPending} onClick={() => saveMutation.mutate({ key: "about_us_ar", value: arContent })}>{saveMutation.isPending ? "Saving..." : "Save Arabic"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
