import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfessionalCard from "@/components/ProfessionalCard";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Star, Shield, Search, Calendar, MessageSquare, ArrowRight, Loader2, Sparkles, ChevronLeft, ChevronRight, Zap, Globe, TrendingUp
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useState, useEffect, useCallback, useRef } from "react";

export default function Home() {
  const { t, lang } = useLanguage();
  const { data: topPros, isLoading: prosLoading } = trpc.professionals.top.useQuery({ limit: 5 });
  const { data: categories } = trpc.categories.active.useQuery();
  const { data: ads } = trpc.ads.active.useQuery({ position: "home_banner" });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section - Vivid */}
      <section className="relative overflow-hidden gradient-hero">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-[15%] w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-vivid/3 rounded-full blur-3xl" />
        </div>

        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
              <Sparkles className="h-4 w-4" />
              {t("home.hero.badge") || "Professional Services Marketplace"}
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
              {t("home.hero.title1")}{" "}
              <span className="bg-gradient-to-r from-primary via-purple-vivid to-gold bg-clip-text text-transparent">{t("home.hero.title2")}</span>{" "}
              {t("home.hero.title3")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">{t("home.hero.desc")}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/search">
                <Button size="lg" className="gap-2.5 rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90 shadow-lg shadow-primary/25 px-8 h-12 text-base">
                  <Search className="h-5 w-5" /> {t("home.findProfessionals")}
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="gap-2.5 rounded-full border-2 border-gold/50 hover:bg-gold/10 hover:border-gold px-8 h-12 text-base" onClick={() => { window.location.href = getLoginUrl(); }}>
                <Sparkles className="h-5 w-5 text-gold" /> {t("home.joinAsProfessional")}
              </Button>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-border/30">
              {[
                { icon: Globe, value: "50+", label: t("home.stat.countries") || "Countries" },
                { icon: Star, value: "10K+", label: t("home.stat.professionals") || "Professionals" },
                { icon: TrendingUp, value: "98%", label: t("home.stat.satisfaction") || "Satisfaction" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-serif">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ad Carousel */}
      {ads && ads.length > 0 && <AdCarousel ads={ads} />}

      {/* Top Rated */}
      <section className="container py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold-foreground text-xs font-semibold mb-3 border border-gold/20">
              <Star className="h-3.5 w-3.5 text-gold fill-gold" /> {t("home.topRatedBadge") || "TOP RATED"}
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">{t("home.topRated")}</h2>
            <p className="text-muted-foreground mt-2 text-lg">{t("home.topRatedDesc")}</p>
          </div>
          <Link href="/search">
            <Button variant="outline" className="gap-2 rounded-full border-2 hover:bg-primary/5 hover:border-primary/50">
              {t("home.viewAll")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {prosLoading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">{t("common.loading") || "Loading..."}</span>
            </div>
          </div>
        ) : topPros && topPros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {topPros.map((pro: any) => (
              <ProfessionalCard key={`${pro.userId}-${pro.professionId}`} userId={pro.userId} firstName={pro.firstName} lastName={pro.lastName} userName={pro.userName} profilePhoto={pro.profilePhoto} avgRating={pro.avgRating} totalReviews={pro.totalReviews} costPerHour={pro.costPerHour} yearsOfExperience={pro.yearsOfExperience} isPremium={pro.isPremium} isStarred={pro.isStarred} hasTeam={pro.hasTeam} country={pro.country} city={pro.city} hasOffice={pro.hasOffice} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border bg-muted/30">
            <Search className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">{t("home.noProfessionals")}</p>
          </div>
        )}
      </section>

      {/* Browse by Category */}
      {categories && categories.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-background via-muted/30 to-background">
          <div className="container">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3 border border-primary/20">
                <Zap className="h-3.5 w-3.5" /> {t("home.categoriesBadge") || "EXPLORE"}
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">{t("home.browseByCategory")}</h2>
              <p className="text-muted-foreground mt-2 text-lg max-w-xl mx-auto">{t("home.exploreCats")}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
              {categories.map((cat: any) => (
                <Link key={cat.id} href={`/search?categoryId=${cat.id}`}>
                  <div className="group relative bg-card rounded-xl border border-border/60 hover:border-primary/40 p-6 text-center transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon || "📋"}</div>
                    <h3 className="font-serif font-semibold text-sm group-hover:text-primary transition-colors">{lang === "ar" && cat.nameAr ? cat.nameAr : cat.name}</h3>
                    {cat.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{lang === "ar" && cat.descriptionAr ? cat.descriptionAr : cat.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why SaySerné */}
      <section className="container py-20">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold">{t("home.whySayserne")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {[
            { icon: Shield, title: t("home.verifiedReviews"), desc: t("home.verifiedReviewsDesc"), gradient: "from-primary/15 to-purple-vivid/10" },
            { icon: Search, title: t("home.advancedSearch"), desc: t("home.advancedSearchDesc"), gradient: "from-gold/15 to-gold-warm/10" },
            { icon: Calendar, title: t("home.easyBooking"), desc: t("home.easyBookingDesc"), gradient: "from-purple-vivid/15 to-primary/10" },
            { icon: MessageSquare, title: t("home.realtimeChat"), desc: t("home.realtimeChatDesc"), gradient: "from-gold-bright/15 to-gold/10" },
          ].map((item, i) => (
            <div key={i} className="group text-center p-7 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-1">
              <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-cta py-20 border-t border-border/30">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <Sparkles className="h-10 w-10 text-gold mx-auto mb-4" />
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">{t("home.readyToStart")}</h2>
            <p className="text-muted-foreground mb-10 text-lg leading-relaxed">{t("home.readyToStartDesc")}</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/search">
                <Button size="lg" className="gap-2.5 rounded-full bg-gradient-to-r from-primary to-purple-vivid hover:opacity-90 shadow-lg shadow-primary/25 px-8 h-12 text-base">
                  {t("home.browseProfessionals")}
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-full border-2 px-8 h-12 text-base hover:bg-primary/5" onClick={() => { window.location.href = getLoginUrl(); }}>
                {t("home.createAccount")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function AdCarousel({ ads }: { ads: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length);
    }, 1500);
  }, [ads.length]);

  useEffect(() => {
    if (ads.length > 1) startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [ads.length, startTimer]);

  const goTo = (idx: number) => {
    setCurrentIndex(idx);
    startTimer();
  };

  const goPrev = () => goTo((currentIndex - 1 + ads.length) % ads.length);
  const goNext = () => goTo((currentIndex + 1) % ads.length);

  return (
    <section className="bg-muted/30 border-y border-border/30">
      <div className="container py-5">
        <div className="relative overflow-hidden rounded-xl">
          <div className="flex items-center justify-center min-h-[100px]">
            <a
              href={ads[currentIndex]?.linkUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg overflow-hidden hover:shadow-lg transition-shadow block"
            >
              <img
                src={ads[currentIndex]?.imageUrl}
                alt={ads[currentIndex]?.title}
                className="h-24 md:h-32 w-auto max-w-full object-contain"
              />
            </a>
          </div>

          {ads.length > 1 && (
            <>
              <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-background border border-border/50 transition-all">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-background border border-border/50 transition-all">
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {ads.length > 1 && (
            <div className="flex justify-center gap-2 mt-3">
              {ads.map((_: any, i: number) => (
                <button key={i} onClick={() => goTo(i)} className={`h-2 rounded-full transition-all ${i === currentIndex ? 'bg-primary w-6' : 'bg-muted-foreground/20 w-2 hover:bg-muted-foreground/40'}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
