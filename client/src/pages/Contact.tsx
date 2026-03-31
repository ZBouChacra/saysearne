import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Send, CheckCircle, MessageCircle, Clock, Shield } from "lucide-react";
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
          <div className="text-center p-10 max-w-md animate-slide-up">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="font-serif text-3xl font-bold mb-3">{t("contact.sentTitle")}</h2>
            <p className="text-muted-foreground text-lg mb-8">{t("contact.sentDesc")}</p>
            <Button size="lg" className="rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90 px-8" onClick={() => { setSent(false); setSubject(""); setDescription(""); }}>
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

      {/* Hero */}
      <section className="gradient-hero py-16 border-b border-border/30">
        <div className="container">
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20">
              <Mail className="h-4 w-4" />
              {t("contact.title")}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">{t("contact.title")}</h1>
            <p className="text-lg text-muted-foreground">{t("contact.subtitle")}</p>
          </div>
        </div>
      </section>

      <div className="container py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {/* Contact Info Cards */}
          <div className="space-y-5">
            {[
              { icon: MessageCircle, title: t("contact.chatTitle") || "Get in Touch", desc: t("contact.chatDesc") || "We're here to help with any questions about our platform.", color: "primary" },
              { icon: Clock, title: t("contact.responseTitle") || "Quick Response", desc: t("contact.responseDesc") || "We typically respond within 24 hours.", color: "gold" },
              { icon: Shield, title: t("contact.secureTitle") || "Secure & Private", desc: t("contact.secureDesc") || "Your information is kept confidential and secure.", color: "primary" },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-xl bg-card border border-border/60 hover:border-primary/30 transition-all hover:shadow-md group">
                <div className={`h-11 w-11 rounded-lg bg-${item.color === "gold" ? "gold" : "primary"}/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`h-5 w-5 text-${item.color === "gold" ? "gold" : "primary"}`} />
                </div>
                <h3 className="font-serif font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border/60 rounded-2xl p-8 shadow-sm">
              <div>
                <Label htmlFor="email" className="text-sm font-semibold">{t("contact.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="mt-1.5 rounded-lg h-11"
                />
              </div>
              <div>
                <Label htmlFor="subject" className="text-sm font-semibold">{t("contact.subject")}</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t("contact.subjectPlaceholder")}
                  required
                  className="mt-1.5 rounded-lg h-11"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-semibold">{t("contact.message")}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("contact.messagePlaceholder")}
                  rows={6}
                  required
                  className="mt-1.5 rounded-lg"
                />
              </div>
              <Button type="submit" size="lg" className="gap-2.5 w-full rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90 shadow-lg shadow-primary/20 h-12 text-base" disabled={sendMutation.isPending}>
                {sendMutation.isPending ? t("contact.sending") : <><Send className="h-5 w-5" /> {t("contact.send")}</>}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
