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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Shield, Users, BarChart3, Megaphone, Mail, Loader2,
  Lock, Unlock, Crown, Star, Trash2, Plus, Calendar, MessageSquare
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Admin() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }
  if (user.role !== "admin") return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><p className="text-destructive font-semibold">Access Denied: Admin privileges required</p></div><Footer /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <h1 className="font-serif text-3xl font-bold mb-6 flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" /> Back Office
        </h1>

        <Tabs defaultValue="dashboard">
          <TabsList className="flex-wrap">
            <TabsTrigger value="dashboard" className="gap-2"><BarChart3 className="h-4 w-4" /> Dashboard</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Users</TabsTrigger>
            <TabsTrigger value="ads" className="gap-2"><Megaphone className="h-4 w-4" /> Advertisements</TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2"><Mail className="h-4 w-4" /> Contact Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-4"><AdminDashboard /></TabsContent>
          <TabsContent value="users" className="mt-4"><UserManagement /></TabsContent>
          <TabsContent value="ads" className="mt-4"><AdManagement /></TabsContent>
          <TabsContent value="contacts" className="mt-4"><ContactMessages /></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const cards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500" },
    { label: "Professionals", value: stats?.totalProfessionals || 0, icon: Crown, color: "text-purple-500" },
    { label: "Total Bookings", value: stats?.totalBookings || 0, icon: Calendar, color: "text-green-500" },
    { label: "Total Reviews", value: stats?.totalReviews || 0, icon: Star, color: "text-yellow-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{card.label}</span>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <p className="text-3xl font-serif font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function UserManagement() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = trpc.admin.users.useQuery({ page, limit: 20 });
  const utils = trpc.useUtils();

  const toggleLock = trpc.admin.toggleLock.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.admin.users.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const togglePremium = trpc.admin.togglePremium.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.admin.users.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const toggleStarred = trpc.admin.toggleStarred.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.admin.users.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">{data?.total || 0} total users</p>
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.results.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3">
                  <div>
                    <span className="font-medium">{u.firstName ? `${u.firstName} ${u.lastName}` : u.name || "—"}</span>
                    <div className="flex gap-1 mt-1">
                      {u.isPremium && <Badge variant="default" className="text-xs">Premium</Badge>}
                      {u.isStarred && <Badge variant="outline" className="text-xs">Starred</Badge>}
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{u.email || "—"}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">
                  <Badge variant={u.isLocked ? "destructive" : "outline"}>
                    {u.isLocked ? "Locked" : "Active"}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => toggleLock.mutate({ userId: u.id, isLocked: !u.isLocked })}
                      title={u.isLocked ? "Unlock" : "Lock"}
                    >
                      {u.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => togglePremium.mutate({ userId: u.id, isPremium: !u.isPremium })}
                      title={u.isPremium ? "Remove Premium" : "Make Premium"}
                      className={u.isPremium ? "text-primary" : ""}
                    >
                      <Crown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => toggleStarred.mutate({ userId: u.id, isStarred: !u.isStarred })}
                      title={u.isStarred ? "Remove Star" : "Add Star"}
                      className={u.isStarred ? "text-primary" : ""}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground px-3">Page {page}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

function AdManagement() {
  const { data: ads, isLoading } = trpc.admin.ads.list.useQuery();
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", imageUrl: "", linkUrl: "", position: "home_banner" as const });

  const createMutation = trpc.admin.ads.create.useMutation({
    onSuccess: () => { toast.success("Ad created!"); utils.admin.ads.list.invalidate(); setDialogOpen(false); setForm({ title: "", imageUrl: "", linkUrl: "", position: "home_banner" }); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.ads.delete.useMutation({
    onSuccess: () => { toast.success("Ad deleted"); utils.admin.ads.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  const toggleMutation = trpc.admin.ads.update.useMutation({
    onSuccess: () => { toast.success("Updated"); utils.admin.ads.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{ads?.length || 0} advertisement(s)</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Ad</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif">Create Advertisement</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1.5" />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={form.imageUrl} onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="mt-1.5" placeholder="https://..." />
              </div>
              <div>
                <Label>Link URL (optional)</Label>
                <Input value={form.linkUrl} onChange={(e) => setForm(f => ({ ...f, linkUrl: e.target.value }))} className="mt-1.5" />
              </div>
              <div>
                <Label>Position</Label>
                <Select value={form.position} onValueChange={(v: any) => setForm(f => ({ ...f, position: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home_banner">Home Banner</SelectItem>
                    <SelectItem value="search_banner">Search Banner</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => createMutation.mutate(form)} className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Ad"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {ads && ads.length > 0 ? (
        <div className="space-y-3">
          {ads.map((ad) => (
            <div key={ad.id} className="border border-border bg-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} className="h-12 w-20 object-cover border border-border" />}
                <div>
                  <h3 className="font-semibold">{ad.title}</h3>
                  <p className="text-xs text-muted-foreground">{ad.position.replace("_", " ")} &middot; {ad.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={ad.isActive} onCheckedChange={(v) => toggleMutation.mutate({ id: ad.id, isActive: v })} />
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate({ id: ad.id })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border">
          <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No advertisements yet</p>
        </div>
      )}
    </div>
  );
}

function ContactMessages() {
  const { data: messages, isLoading } = trpc.admin.contacts.useQuery();

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border">
        <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No contact messages yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div key={msg.id} className="border border-border bg-card p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold">{msg.subject}</h3>
              <p className="text-sm text-muted-foreground">{msg.email}</p>
            </div>
            <span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-muted-foreground">{msg.description}</p>
        </div>
      ))}
    </div>
  );
}
