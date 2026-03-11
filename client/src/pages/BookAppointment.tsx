import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Loader2, ChevronLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function BookAppointment() {
  const { id } = useParams<{ id: string }>();
  const professionalId = Number(id);
  const { user, loading } = useAuth();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [professionId, setProfessionId] = useState<number | undefined>();
  const [booked, setBooked] = useState(false);

  const { data: profile, isLoading: loadingProfile } = trpc.professionals.profile.useQuery({ userId: professionalId });

  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => { setBooked(true); toast.success("Appointment requested!"); },
    onError: (err) => toast.error(err.message),
  });

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
            <h2 className="font-serif text-2xl font-bold mb-2">Appointment Requested!</h2>
            <p className="text-muted-foreground mb-6">The professional will review your request and respond soon.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/appointments"><Button>View My Appointments</Button></Link>
              <Link href={`/professional/${professionalId}`}><Button variant="outline">Back to Profile</Button></Link>
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
    if (!date || !time) { toast.error("Please select date and time"); return; }
    createMutation.mutate({
      professionalId,
      professionId,
      appointmentDate: new Date(`${date}T${time}`).toISOString(),
      description: description || undefined,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container py-8 flex-1">
        <Link href={`/professional/${professionalId}`}>
          <Button variant="ghost" size="sm" className="gap-1 mb-4"><ChevronLeft className="h-4 w-4" /> Back</Button>
        </Link>

        <div className="max-w-lg mx-auto">
          <h1 className="font-serif text-2xl font-bold mb-2">Book Appointment</h1>
          <p className="text-muted-foreground mb-6">with {displayName}</p>

          <form onSubmit={handleSubmit} className="border border-border bg-card p-6 space-y-4">
            {profile?.professions && profile.professions.length > 0 && (
              <div>
                <Label>Service</Label>
                <Select value={professionId?.toString() || "none"} onValueChange={(v) => setProfessionId(v === "none" ? undefined : Number(v))}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a service" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General Appointment</SelectItem>
                    {profile.professions.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.serviceName} - ${p.costPerHour}/hr</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="mt-1.5" required />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1.5" required />
              </div>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1.5" placeholder="Describe what you need..." />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={createMutation.isPending}>
              <Calendar className="h-4 w-4" /> {createMutation.isPending ? "Requesting..." : "Request Appointment"}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
