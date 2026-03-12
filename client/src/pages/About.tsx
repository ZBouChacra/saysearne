import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Star, Users, Globe, Zap, Heart } from "lucide-react";

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container py-20">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">{t("about.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-4">{t("about.mission")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("about.missionP1")}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("about.missionP2")}
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold mb-4">{t("about.values")}</h2>
            <div className="space-y-4">
              {[
                { icon: Shield, title: t("about.trust"), desc: t("about.trustDesc") },
                { icon: Star, title: t("about.meritocracy"), desc: t("about.meritocracyDesc") },
                { icon: Globe, title: t("about.omnichannel"), desc: t("about.omnichannelDesc") },
                { icon: Heart, title: t("about.community"), desc: t("about.communityDesc") },
              ].map((v, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 bg-primary/10 flex items-center justify-center shrink-0">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card/50 py-16">
        <div className="container">
          <h2 className="font-serif text-2xl font-bold text-center mb-12">{t("about.howItWorks")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: t("about.step1"), desc: t("about.step1Desc") },
              { step: "02", title: t("about.step2"), desc: t("about.step2Desc") },
              { step: "03", title: t("about.step3"), desc: t("about.step3Desc") },
            ].map((s, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-4xl font-serif font-bold text-primary/20 mb-4">{s.step}</div>
                <h3 className="font-serif font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
