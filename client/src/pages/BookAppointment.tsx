import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, Loader2, ChevronLeft, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function BookAppointment() {
  const { id } = useParams<{ id: string }>();
  const professionalId = Number(id);
  const { user, loading } = useAuth();
  const { t, lang } = useLanguage();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60); // minutes
  const [description, setDescription] = useState("");
  const [professionId, setProfessionId] = useState<number | undefined>();
  const [booked, setBooked] = useState(false);

  const { data: profile, isLoading: loadingProfile } = trpc.professionals.profile.useQuery({ userId: professionalId });

  // Fetch existing appointments for this professional on the selected date
  const { data: existingAppointments } = trpc.appointments.checkOverlap.useQuery(
    { professionalId, date },
    { enabled: !!date }
  );

  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => { setBooked(true); toast.success(t("book.requested")); },
    onError: (err: any) => toast.error(err.message),
  });

  // Check for overlap with existing appointments
  const overlapWarning = useMemo(() => {
    if (!date || !time || !existingAppointments || existingAppointments.length === 0) return null;
    const requestedStart = new Date(`${date}T${time}`);
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);
    const overlapping = existingAppointments.filter((apt: any) => {
      const aptStart = new Date(apt.appointmentDate);
      const aptEnd = new Date(aptStart.getTime() + (apt.duration || 60) * 60000);
      return requestedStart < aptEnd && requestedEnd > aptStart;
    });
    return overlapping.length > 0 ? overlapping : null;
  }, [date, time, duration, existingAppointments]);

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!user) { window.location.href = getLoginUrl(); return null; }

  if (booked) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-2">{t("book.requestedTitle")}</h2>
            <p className="text-muted-foreground mb-6">{t("book.requestedDesc")}</p>
            <div className="flex gap-3 justify-center">
              <Link href="/appointments"><Button>{t("book.viewAppointments")}</Button></Link>
              <Link href={`/professional/${professionalId}`}><Button variant="outline">{t("book.backToProfile")}</Button></Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}` : profile?.name || "Professional";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionId) { toast.error(t("book.selectServiceRequired")); return; }
    if (!date || !time) { toast.error(t("book.selectDateTime")); return; }
    createMutation.mutate({
      professionalId,
      professionId,
      appointmentDate: new Date(`${date}T${time}`).toISOString(),
      duration,
      description: description || undefined,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <Link href={`/professional/${professionalId}`}>
          <Button variant="ghost" size="sm" className="gap-1 mb-4"><ChevronLeft className="h-4 w-4" /> {t("book.back")}</Button>
        </Link>

        <div className="max-w-lg mx-auto">
          <h1 className="font-serif text-2xl font-bold mb-2">{t("book.title")}</h1>
          <p className="text-muted-foreground mb-6">{t("book.with")} {displayName}</p>

          <form onSubmit={handleSubmit} className="border border-border bg-card p-6 space-y-4">
            {/* Service Selection - Required */}
            <div>
              <Label>{t("book.service")} *</Label>
              {profile?.professions && profile.professions.length > 0 ? (
                <Select value={professionId?.toString() || "none"} onValueChange={(v) => setProfessionId(v === "none" ? undefined : Number(v))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("book.selectService")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" disabled>{t("book.selectService")}</SelectItem>
                    {profile.professions.map((p: any) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {lang === "ar" && p.serviceNameAr ? p.serviceNameAr : p.serviceName} — ${p.costPerHour}/hr {p.country ? `(${p.city ? `${p.city}, ` : ""}${p.country})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{t("book.noServicesAvailable")}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("book.date")} *</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="mt-1.5" required />
              </div>
              <div>
                <Label>{t("book.time")} *</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1.5" required />
              </div>
            </div>

            <div>
              <Label>{t("book.duration")}</Label>
              <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 {t("book.minutes")}</SelectItem>
                  <SelectItem value="60">1 {t("book.hour")}</SelectItem>
                  <SelectItem value="90">1.5 {t("book.hours")}</SelectItem>
                  <SelectItem value="120">2 {t("book.hours")}</SelectItem>
                  <SelectItem value="180">3 {t("book.hours")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Existing appointments on selected date */}
            {existingAppointments && existingAppointments.length > 0 && (
              <div className="border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-600">
                  <Clock className="h-4 w-4" /> {t("book.existingAppointments")}
                </h4>
                <div className="space-y-1">
                  {existingAppointments.map((apt: any, i: number) => {
                    const aptTime = new Date(apt.appointmentDate);
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{aptTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        <span>—</span>
                        <span>{new Date(aptTime.getTime() + (apt.duration || 60) * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        <Badge variant="outline" className="text-[10px]">{apt.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Overlap Warning */}
            {overlapWarning && (
              <div className="border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">{t("book.overlapWarning")}</p>
                  <p className="text-xs text-muted-foreground">{t("book.overlapDesc")}</p>
                </div>
              </div>
            )}

            <div>
              <Label>{t("book.description")}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1.5" placeholder={t("book.descriptionPlaceholder")} />
            </div>

            <Button type="submit" className="w-full gap-2" disabled={createMutation.isPending || !professionId}>
              <Calendar className="h-4 w-4" /> {createMutation.isPending ? t("book.requesting") : t("book.requestAppointment")}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
