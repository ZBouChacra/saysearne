import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, Loader2, Check, X, Star, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  approved: "bg-green-500/10 text-green-600 border-green-500/30",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
  completed: "bg-blue-500/10 text-blue-600 border-blue-500/30",
};

export default function Appointments() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { data: appointments, isLoading } = trpc.appointments.list.useQuery(undefined, { enabled: !!user });
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.appointments.updateStatus.useMutation({
    onSuccess: () => { toast.success(t("appointments.statusUpdated")); utils.appointments.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  if (loading) return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  const asClient = appointments?.filter(a => a.clientId === user.id) || [];
  const asProfessional = appointments?.filter(a => a.professionalId === user.id) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero py-10 border-b border-border/30">
        <div className="container">
          <div className="flex items-center gap-4 animate-slide-up">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#4A9B82] to-[#2D6D5F] flex items-center justify-center shadow-lg shadow-primary/20">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">{t("appointments.title")}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{asClient.length + asProfessional.length} total</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 flex-1">
        <Tabs defaultValue="client">
          <TabsList className="mb-6">
            <TabsTrigger value="client">{t("appointments.asClient")} ({asClient.length})</TabsTrigger>
            <TabsTrigger value="professional">{t("appointments.asProfessional")} ({asProfessional.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="client">
            <AppointmentList appointments={asClient} isLoading={isLoading} role="client" userId={user.id} onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })} isPending={updateStatusMutation.isPending} />
          </TabsContent>

          <TabsContent value="professional">
            <AppointmentList appointments={asProfessional} isLoading={isLoading} role="professional" userId={user.id} onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })} isPending={updateStatusMutation.isPending} />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

function AppointmentList({ appointments, isLoading, role, userId, onUpdateStatus, isPending }: {
  appointments: any[];
  isLoading: boolean;
  role: "client" | "professional";
  userId: number;
  onUpdateStatus: (id: number, status: "approved" | "cancelled" | "completed") => void;
  isPending: boolean;
}) {
  const { t } = useLanguage();

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (appointments.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-muted/20">
        <Calendar className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground text-lg">{t("appointments.noAppointments")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appt) => (
        <div key={appt.id} className="bg-card border border-border/60 rounded-xl p-5 hover:border-primary/30 transition-all hover:shadow-md">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <h3 className="font-serif font-bold text-base">
                  {role === "client" ? appt.professionalName : appt.clientName}
                </h3>
                <Badge variant="outline" className={`${STATUS_COLORS[appt.status]} rounded-full px-3`}>
                  {t(`appointments.${appt.status}`)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {new Date(appt.appointmentDate).toLocaleString()}
              </div>
              {appt.description && (
                <p className="text-sm text-muted-foreground mt-2 bg-muted/30 rounded-lg p-3">{appt.description}</p>
              )}
            </div>

            <div className="flex gap-2">
              {role === "professional" && appt.status === "pending" && (
                <>
                  <Button size="sm" className="gap-1.5 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white" onClick={() => onUpdateStatus(appt.id, "approved")} disabled={isPending}>
                    <Check className="h-3.5 w-3.5" /> {t("appointments.approve")}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-full text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => onUpdateStatus(appt.id, "cancelled")} disabled={isPending}>
                    <X className="h-3.5 w-3.5" /> {t("appointments.decline")}
                  </Button>
                </>
              )}
              {role === "professional" && appt.status === "approved" && (
                <Button size="sm" className="gap-1.5 rounded-full bg-gradient-to-r from-[#4A9B82] to-[#2D6D5F] hover:opacity-90" onClick={() => onUpdateStatus(appt.id, "completed")} disabled={isPending}>
                  <CheckCircle className="h-3.5 w-3.5" /> {t("appointments.complete")}
                </Button>
              )}
              {role === "client" && appt.status === "pending" && (
                <Button size="sm" variant="outline" className="gap-1.5 rounded-full text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => onUpdateStatus(appt.id, "cancelled")} disabled={isPending}>
                  <X className="h-3.5 w-3.5" /> {t("appointments.cancel")}
                </Button>
              )}
              {role === "client" && appt.status === "completed" && !appt.hasReviewed && (
                <ReviewDialog appointmentId={appt.id} professionalId={appt.professionalId} />
              )}
              {role === "client" && appt.status === "completed" && appt.hasReviewed && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 gap-1.5 rounded-full px-3"><CheckCircle className="h-3.5 w-3.5" /> {t("appointments.reviewed")}</Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewDialog({ appointmentId, professionalId }: { appointmentId: number; professionalId: number }) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => { toast.success(t("appointments.reviewSubmitted")); setOpen(false); utils.appointments.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 rounded-full border-gold/40 text-gold hover:bg-gold/10"><Star className="h-3.5 w-3.5" /> {t("appointments.review")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-serif text-xl">{t("appointments.leaveReview")}</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div>
            <Label className="text-sm font-semibold">{t("appointments.ratingLabel")}</Label>
            <div className="flex gap-1.5 mt-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="focus:outline-none transition-transform hover:scale-110">
                  <Star className={`h-8 w-8 ${s <= rating ? "fill-gold text-gold" : "text-muted-foreground/20"} transition-colors`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">{t("appointments.commentLabel")}</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="mt-1.5 rounded-lg" placeholder={t("appointments.commentPlaceholder")} />
          </div>
          <Button
            size="lg"
            className="w-full rounded-full bg-gradient-to-r from-[#4A9B82] to-[#2D6D5F] hover:opacity-90"
            onClick={() => createReview.mutate({ appointmentId, professionalId, rating, comment: comment || undefined })}
            disabled={createReview.isPending}
          >
            {createReview.isPending ? t("appointments.submitting") : t("appointments.submitReview")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
