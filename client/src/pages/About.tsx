import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Star, Globe, Heart, Loader2, Sparkles } from "lucide-react";

export default function About() {
  const { t, lang } = useLanguage();
  const { data: config, isLoading } = trpc.siteConfig.get.useQuery({ key: "about_us" });

  const aboutContent = config || null;
  const title = aboutContent
    ? (lang === "ar" && aboutContent.titleAr ? aboutContent.titleAr : aboutContent.title || t("about.title"))
    : t("about.title");
  const subtitle = aboutContent
    ? (lang === "ar" && aboutContent.subtitleAr ? aboutContent.subtitleAr : aboutContent.subtitle || t("about.subtitle"))
    : t("about.subtitle");
  const mission = aboutContent
    ? (lang === "ar" && aboutContent.missionAr ? aboutContent.missionAr : aboutContent.mission || t("about.missionP1"))
    : t("about.missionP1");
  const vision = aboutContent
    ? (lang === "ar" && aboutContent.visionAr ? aboutContent.visionAr : aboutContent.vision || t("about.missionP2"))
    : t("about.missionP2");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-[20%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-[10%] w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        </div>
        <div className="container relative py-20 md:py-28">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" /> {t("about.badge") || "ABOUT US"}
              </div>
              <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight">{title}</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">{subtitle}</p>
            </div>
          )}
        </div>
      </section>

      {/* Mission & Values */}
      <section className="container py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">{t("about.mission")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4 text-lg">{mission}</p>
            <p className="text-muted-foreground leading-relaxed text-lg">{vision}</p>
          </div>
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">{t("about.values")}</h2>
            <div className="space-y-5">
              {[
                { icon: Shield, title: t("about.trust"), desc: t("about.trustDesc"), gradient: "from-[#4A9B82]/15 to-[#2D6D5F]/10" },
                { icon: Star, title: t("about.meritocracy"), desc: t("about.meritocracyDesc"), gradient: "from-gold/15 to-gold-warm/10" },
                { icon: Globe, title: t("about.omnichannel"), desc: t("about.omnichannelDesc"), gradient: "from-[#2D6D5F]/15 to-[#4A9B82]/10" },
                { icon: Heart, title: t("about.community"), desc: t("about.communityDesc"), gradient: "from-gold-bright/15 to-gold/10" },
              ].map((v, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-card border border-border/40 hover:border-primary/30 transition-all hover:shadow-sm">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center shrink-0`}>
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold">{v.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-center mb-14">{t("about.howItWorks")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {[
              { step: "01", title: t("about.step1"), desc: t("about.step1Desc") },
              { step: "02", title: t("about.step2"), desc: t("about.step2Desc") },
              { step: "03", title: t("about.step3"), desc: t("about.step3Desc") },
            ].map((s, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-card border border-border/40 hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="text-5xl font-serif font-bold bg-gradient-to-br from-primary/30 to-gold/30 bg-clip-text text-transparent mb-4">{s.step}</div>
                <h3 className="font-serif font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
