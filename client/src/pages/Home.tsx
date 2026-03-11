import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfessionalCard from "@/components/ProfessionalCard";
import {
  Search, Star, Shield, MessageSquare, Calendar, ArrowRight,
  Loader2, Crown, Sparkles, Users, Award
} from "lucide-react";
import { Link } from "wouter";

const ICON_MAP: Record<string, any> = {
  Home: () => <span className="text-2xl">🏠</span>,
  Heart: () => <span className="text-2xl">❤️</span>,
  GraduationCap: () => <span className="text-2xl">🎓</span>,
  Monitor: () => <span className="text-2xl">💻</span>,
  Palette: () => <span className="text-2xl">🎨</span>,
  Scale: () => <span className="text-2xl">⚖️</span>,
  PartyPopper: () => <span className="text-2xl">🎉</span>,
  Sparkles: () => <span className="text-2xl">✨</span>,
};

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: topPros, isLoading: loadingPros } = trpc.professionals.top.useQuery({ limit: 5 });
  const { data: categories, isLoading: loadingCats } = trpc.categories.list.useQuery();
  const { data: ads } = trpc.ads.active.useQuery({ position: "home_banner" });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container relative py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Find the Right
              <span className="text-primary block">Professional</span>
              for Every Need
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              SaySerné connects you with top-rated, verified professionals across every industry.
              Browse anonymously, book with confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/search">
                <Button size="lg" className="gap-2">
                  <Search className="h-4 w-4" />
                  Find Professionals
                </Button>
              </Link>
              {!isAuthenticated && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => { window.location.href = getLoginUrl(); }}
                >
                  Join as Professional
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      {ads && ads.length > 0 && (
        <section className="container py-6">
          <div className="overflow-hidden border border-border">
            {ads.map((ad) => (
              <a key={ad.id} href={ad.linkUrl || "#"} target="_blank" rel="noopener noreferrer" className="block">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 md:h-48 object-cover" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Top Rated Professionals */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold flex items-center gap-2">
              <Crown className="h-7 w-7 text-primary" />
              Top Rated Professionals
            </h2>
            <p className="text-muted-foreground mt-2">Highest rated professionals on the platform</p>
          </div>
          <Link href="/search">
            <Button variant="ghost" className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loadingPros ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : topPros && topPros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPros.map((pro, i) => (
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
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No professionals listed yet. Be the first to join!</p>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="border-t border-border bg-card/50 py-16">
        <div className="container">
          <h2 className="font-serif text-3xl font-bold mb-2">Browse by Category</h2>
          <p className="text-muted-foreground mb-8">Explore services across all industries</p>

          {loadingCats ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories?.map((cat) => {
                const IconComp = ICON_MAP[cat.icon || ""] || (() => <Sparkles className="h-6 w-6" />);
                return (
                  <Link key={cat.id} href={`/search?categoryId=${cat.id}`}>
                    <div className="group border border-border bg-card hover:border-primary/50 p-6 text-center transition-all cursor-pointer">
                      <div className="mb-3 flex justify-center">
                        <IconComp />
                      </div>
                      <h3 className="font-serif font-semibold group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <h2 className="font-serif text-3xl font-bold text-center mb-12">Why SaySerné?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: "Verified Reviews", desc: "Only clients with completed bookings can leave reviews" },
            { icon: Search, title: "Advanced Search", desc: "Filter by category, rating, cost, experience, and more" },
            { icon: Calendar, title: "Easy Booking", desc: "Request appointments with approval workflow" },
            { icon: MessageSquare, title: "Real-time Chat", desc: "Communicate directly with professionals" },
          ].map((f, i) => (
            <div key={i} className="text-center p-6">
              <div className="h-12 w-12 mx-auto mb-4 bg-primary/10 flex items-center justify-center">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary/5 py-16">
        <div className="container text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of professionals and clients on SaySerné. Create your profile today.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/search">
              <Button size="lg">Browse Professionals</Button>
            </Link>
            {!isAuthenticated && (
              <Button variant="outline" size="lg" onClick={() => { window.location.href = getLoginUrl(); }}>
                Create Account
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
