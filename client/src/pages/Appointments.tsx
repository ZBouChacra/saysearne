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
  const { data: appointments, isLoading } = trpc.appointments.list.useQuery(undefined, { enabled: !!user });
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.appointments.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated!"); utils.appointments.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  if (loading) return <div className="min-h-screen flex flex-col bg-background"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></div>;
  if (!user) { window.location.href = getLoginUrl(); return null; }

  const asClient = appointments?.filter(a => a.clientId === user.id) || [];
  const asProfessional = appointments?.filter(a => a.professionalId === user.id) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <h1 className="font-serif text-3xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="h-7 w-7 text-primary" /> My Appointments
        </h1>

        <Tabs defaultValue="client">
          <TabsList>
            <TabsTrigger value="client">As Client ({asClient.length})</TabsTrigger>
            <TabsTrigger value="professional">As Professional ({asProfessional.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="client" className="mt-4">
            <AppointmentList
              appointments={asClient}
              isLoading={isLoading}
              role="client"
              userId={user.id}
              onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })}
              isPending={updateStatusMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="professional" className="mt-4">
            <AppointmentList
              appointments={asProfessional}
              isLoading={isLoading}
              role="professional"
              userId={user.id}
              onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })}
              isPending={updateStatusMutation.isPending}
            />
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
  const [reviewApptId, setReviewApptId] = useState<number | null>(null);

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No appointments yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appt) => (
        <div key={appt.id} className="border border-border bg-card p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">
                  {role === "client" ? appt.professionalName : appt.clientName}
                </h3>
                <Badge variant="outline" className={STATUS_COLORS[appt.status]}>
                  {appt.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {new Date(appt.appointmentDate).toLocaleString()}
              </div>
              {appt.description && (
                <p className="text-sm text-muted-foreground mt-2">{appt.description}</p>
              )}
            </div>

            <div className="flex gap-2">
              {role === "professional" && appt.status === "pending" && (
                <>
                  <Button size="sm" className="gap-1" onClick={() => onUpdateStatus(appt.id, "approved")} disabled={isPending}>
                    <Check className="h-3 w-3" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => onUpdateStatus(appt.id, "cancelled")} disabled={isPending}>
                    <X className="h-3 w-3" /> Decline
                  </Button>
                </>
              )}
              {role === "professional" && appt.status === "approved" && (
                <Button size="sm" className="gap-1" onClick={() => onUpdateStatus(appt.id, "completed")} disabled={isPending}>
                  <CheckCircle className="h-3 w-3" /> Complete
                </Button>
              )}
              {role === "client" && appt.status === "pending" && (
                <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => onUpdateStatus(appt.id, "cancelled")} disabled={isPending}>
                  <X className="h-3 w-3" /> Cancel
                </Button>
              )}
              {role === "client" && appt.status === "completed" && (
                <ReviewDialog appointmentId={appt.id} professionalId={appt.professionalId} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewDialog({ appointmentId, professionalId }: { appointmentId: number; professionalId: number }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => { toast.success("Review submitted!"); setOpen(false); utils.appointments.list.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1"><Star className="h-3 w-3" /> Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-serif">Leave a Review</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="focus:outline-none">
                  <Star className={`h-6 w-6 ${s <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Comment (optional)</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="mt-1.5" placeholder="Share your experience..." />
          </div>
          <Button
            className="w-full"
            onClick={() => createReview.mutate({ appointmentId, professionalId, rating, comment: comment || undefined })}
            disabled={createReview.isPending}
          >
            {createReview.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
