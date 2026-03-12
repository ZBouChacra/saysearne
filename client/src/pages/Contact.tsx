import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);

  const sendMutation = trpc.contact.send.useMutation({
    onSuccess: () => {
      setSent(true);
      toast.success(t("contact.sent"));
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !subject || !description) {
      toast.error(t("contact.fillAll"));
      return;
    }
    sendMutation.mutate({ email, subject, description });
  };

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-2">{t("contact.sentTitle")}</h2>
            <p className="text-muted-foreground">{t("contact.sentDesc")}</p>
            <Button className="mt-6" onClick={() => { setSent(false); setSubject(""); setDescription(""); }}>
              {t("contact.sendAnother")}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container py-16 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold mb-2">{t("contact.title")}</h1>
            <p className="text-muted-foreground">{t("contact.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 border border-border bg-card p-8">
            <div>
              <Label htmlFor="email">{t("contact.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="subject">{t("contact.subject")}</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("contact.subjectPlaceholder")}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="description">{t("contact.message")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("contact.messagePlaceholder")}
                rows={6}
                required
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="gap-2 w-full" disabled={sendMutation.isPending}>
              {sendMutation.isPending ? t("contact.sending") : <><Send className="h-4 w-4" /> {t("contact.send")}</>}
            </Button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
