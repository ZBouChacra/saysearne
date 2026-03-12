import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfessionalCard from "@/components/ProfessionalCard";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Star, Shield, Search, Calendar, MessageSquare, ArrowRight, Loader2, Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { t, lang } = useLanguage();
  const { data: topPros, isLoading: prosLoading } = trpc.professionals.top.useQuery({ limit: 5 });
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: ads } = trpc.ads.active.useQuery({ position: "home_banner" });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-6">
              {t("home.hero.title1")}{" "}
              <span className="text-primary">{t("home.hero.title2")}</span>{" "}
              {t("home.hero.title3")}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">
              {t("home.hero.desc")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/search">
                <Button size="lg" className="gap-2">
                  <Search className="h-5 w-5" /> {t("home.findProfessionals")}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => { window.location.href = getLoginUrl(); }}
              >
                <Sparkles className="h-5 w-5" /> {t("home.joinAsProfessional")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      {ads && ads.length > 0 && (
        <section className="border-b border-border">
          <div className="container py-4">
            <div className="flex gap-4 overflow-x-auto">
              {ads.map((ad) => (
                <a
                  key={ad.id}
                  href={ad.linkUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 border border-border hover:border-primary/50 transition-all"
                >
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="h-24 w-auto object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Rated */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">{t("home.topRated")}</h2>
            <p className="text-muted-foreground mt-1">{t("home.topRatedDesc")}</p>
          </div>
          <Link href="/search">
            <Button variant="outline" className="gap-2">
              {t("home.viewAll")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {prosLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : topPros && topPros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPros.map((pro) => (
              <ProfessionalCard
                key={`${pro.userId}-${pro.professionId}`}
                userId={pro.userId}
                firstName={pro.firstName}
                lastName={pro.lastName}
                userName={pro.userName}
                profilePhoto={pro.profilePhoto}
                avgRating={pro.avgRating}
                totalReviews={pro.totalReviews}
                costPerHour={pro.costPerHour}
                yearsOfExperience={pro.yearsOfExperience}
                isPremium={pro.isPremium}
                isStarred={pro.isStarred}
                hasTeam={pro.hasTeam}
                country={pro.country}
                city={pro.city}
                hasOffice={pro.hasOffice}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-border">
            <p className="text-muted-foreground">{t("home.noProfessionals")}</p>
          </div>
        )}
      </section>

      {/* Browse by Category */}
      {categories && categories.length > 0 && (
        <section className="border-t border-border bg-card/50 py-16">
          <div className="container">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-center mb-2">{t("home.browseByCategory")}</h2>
            <p className="text-muted-foreground text-center mb-10">{t("home.exploreCats")}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/search?categoryId=${cat.id}`}>
                  <div className="border border-border bg-background hover:border-primary/50 p-6 text-center transition-all cursor-pointer group">
                    <div className="text-3xl mb-3">{cat.icon || "📋"}</div>
                    <h3 className="font-serif font-semibold group-hover:text-primary transition-colors">
                      {lang === "ar" && cat.nameAr ? cat.nameAr : cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {lang === "ar" && cat.descriptionAr ? cat.descriptionAr : cat.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why SaySerné */}
      <section className="container py-16">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-center mb-12">{t("home.whySayserne")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Shield, title: t("home.verifiedReviews"), desc: t("home.verifiedReviewsDesc") },
            { icon: Search, title: t("home.advancedSearch"), desc: t("home.advancedSearchDesc") },
            { icon: Calendar, title: t("home.easyBooking"), desc: t("home.easyBookingDesc") },
            { icon: MessageSquare, title: t("home.realtimeChat"), desc: t("home.realtimeChatDesc") },
          ].map((item, i) => (
            <div key={i} className="text-center p-6 border border-border bg-card">
              <div className="h-12 w-12 bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary/5 py-16">
        <div className="container text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">{t("home.readyToStart")}</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">{t("home.readyToStartDesc")}</p>
          <div className="flex justify-center gap-3">
            <Link href="/search">
              <Button size="lg">{t("home.browseProfessionals")}</Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => { window.location.href = getLoginUrl(); }}
            >
              {t("home.createAccount")}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
