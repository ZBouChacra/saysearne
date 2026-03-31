import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfessionalCard from "@/components/ProfessionalCard";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Star, Shield, Search, Calendar, MessageSquare, ArrowRight, Loader2, ChevronLeft, ChevronRight, Globe, TrendingUp
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

      {/* Hero - Clean OLX-inspired */}
      <section className="gradient-hero">
        <div className="container py-20 md:py-28">
          <div className="max-w-3xl animate-slide-up">
            <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-5">
              {t("home.hero.title1")}{" "}
              <span className="text-primary">{t("home.hero.title2")}</span>{" "}
              {t("home.hero.title3")}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">{t("home.hero.desc")}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/search">
                <Button size="lg" className="gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-12 text-base">
                  <Search className="h-5 w-5" /> {t("home.findProfessionals")}
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="gap-2 rounded-lg border-2 border-accent/50 hover:bg-accent/10 hover:border-accent px-6 h-12 text-base" onClick={() => { window.location.href = getLoginUrl(); }}>
                {t("home.joinAsProfessional")}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-border/30">
              {[
                { icon: Globe, value: "50+", label: t("home.stat.countries") || "Countries" },
                { icon: Star, value: "10K+", label: t("home.stat.professionals") || "Professionals" },
                { icon: TrendingUp, value: "98%", label: t("home.stat.satisfaction") || "Satisfaction" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
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
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 text-accent text-xs font-semibold mb-2">
              <Star className="h-3.5 w-3.5 fill-accent" /> {t("home.topRatedBadge") || "TOP RATED"}
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">{t("home.topRated")}</h2>
            <p className="text-muted-foreground mt-1">{t("home.topRatedDesc")}</p>
          </div>
          <Link href="/search">
            <Button variant="outline" className="gap-2 rounded-lg border-border hover:bg-primary/5 hover:border-primary/50">
              {t("home.viewAll")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {prosLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : topPros && topPros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {topPros.map((pro: any) => (
              <ProfessionalCard key={`${pro.userId}-${pro.professionId}`} userId={pro.userId} firstName={pro.firstName} lastName={pro.lastName} userName={pro.userName} profilePhoto={pro.profilePhoto} avgRating={pro.avgRating} totalReviews={pro.totalReviews} costPerHour={pro.costPerHour} yearsOfExperience={pro.yearsOfExperience} isPremium={pro.isPremium} isStarred={pro.isStarred} hasTeam={pro.hasTeam} country={pro.country} city={pro.city} hasOffice={pro.hasOffice} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl border border-dashed border-border bg-muted/20">
            <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("home.noProfessionals")}</p>
          </div>
        )}
      </section>

      {/* Browse by Category */}
      {categories && categories.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="font-serif text-2xl md:text-3xl font-bold">{t("home.browseByCategory")}</h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">{t("home.exploreCats")}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 stagger-children">
              {categories.map((cat: any) => (
                <Link key={cat.id} href={`/search?categoryId=${cat.id}`}>
                  <div className="group bg-card rounded-xl border border-border hover:border-primary/40 p-5 text-center transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon || "📋"}</div>
                    <h3 className="font-serif font-semibold text-sm group-hover:text-primary transition-colors">{lang === "ar" && cat.nameAr ? cat.nameAr : cat.name}</h3>
                    {cat.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lang === "ar" && cat.descriptionAr ? cat.descriptionAr : cat.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why SaySerné */}
      <section className="container py-16">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl md:text-3xl font-bold">{t("home.whySayserne")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {[
            { icon: Shield, title: t("home.verifiedReviews"), desc: t("home.verifiedReviewsDesc") },
            { icon: Search, title: t("home.advancedSearch"), desc: t("home.advancedSearchDesc") },
            { icon: Calendar, title: t("home.easyBooking"), desc: t("home.easyBookingDesc") },
            { icon: MessageSquare, title: t("home.realtimeChat"), desc: t("home.realtimeChatDesc") },
          ].map((item, i) => (
            <div key={i} className="text-center p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-base mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-cta py-16 border-t border-border/30">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">{t("home.readyToStart")}</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">{t("home.readyToStartDesc")}</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link href="/search">
                <Button size="lg" className="gap-2 rounded-lg bg-primary hover:bg-primary/90 px-6 h-12">
                  {t("home.browseProfessionals")}
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-lg border-2 px-6 h-12 hover:bg-primary/5" onClick={() => { window.location.href = getLoginUrl(); }}>
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

  const goTo = (idx: number) => { setCurrentIndex(idx); startTimer(); };
  const goPrev = () => goTo((currentIndex - 1 + ads.length) % ads.length);
  const goNext = () => goTo((currentIndex + 1) % ads.length);

  return (
    <section className="bg-muted/20 border-y border-border/30">
      <div className="container py-4">
        <div className="relative overflow-hidden rounded-lg">
          <div className="flex items-center justify-center min-h-[90px]">
            <a href={ads[currentIndex]?.linkUrl || "#"} target="_blank" rel="noopener noreferrer" className="rounded-lg overflow-hidden hover:shadow-md transition-shadow block">
              <img src={ads[currentIndex]?.imageUrl} alt={ads[currentIndex]?.title} className="h-20 md:h-28 w-auto max-w-full object-contain" />
            </a>
          </div>
          {ads.length > 1 && (
            <>
              <button onClick={goPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-background border border-border/50">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={goNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-background border border-border/50">
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          {ads.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-2.5">
              {ads.map((_: any, i: number) => (
                <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-primary w-5' : 'bg-muted-foreground/20 w-1.5 hover:bg-muted-foreground/40'}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
