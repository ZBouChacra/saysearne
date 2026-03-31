import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Star, Crown, Award, MapPin, Users, DollarSign, Calendar, MessageSquare,
  Loader2, Clock, Briefcase, ChevronLeft, Building2
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";

const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function ProfessionalProfile() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const { user, isAuthenticated } = useAuth();
  const { t, lang } = useLanguage();
  const DAYS = lang === "ar" ? DAYS_AR : DAYS_EN;

  const { data: profile, isLoading } = trpc.professionals.profile.useQuery({ userId });
  const { data: reviewsData } = trpc.reviews.byProfessional.useQuery({ professionalId: userId });

  const [, navigate] = useLocation();
  const startChatMutation = trpc.chat.startChat.useMutation({
    onSuccess: (data: any) => {
      if (data?.roomId) {
        navigate(`/chats?room=${data.roomId}`);
      } else {
        navigate('/chats');
      }
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">{t("profProfile.notFound")}</p></div>
        <Footer />
      </div>
    );
  }

  const displayName = profile.firstName && profile.lastName
    ? `${profile.firstName} ${profile.lastName}` : profile.name || "Professional";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Header */}
      <section className="gradient-hero py-10 border-b border-border/30">
        <div className="container">
          <Link href="/search">
            <Button variant="ghost" size="sm" className="gap-1.5 mb-5 rounded-full hover:bg-primary/10">
              <ChevronLeft className="h-4 w-4 rtl-flip" /> {t("profProfile.backToSearch")}
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row gap-6 animate-slide-up">
            <Avatar className="h-28 w-28 border-4 border-primary/20 shrink-0 shadow-xl shadow-primary/10">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt={displayName} className="object-cover h-full w-full" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-[#4A9B82]/20 to-[#2D6D5F]/20 text-primary font-serif text-4xl">
                  {displayName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="font-serif text-3xl md:text-4xl font-bold">{displayName}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    {profile.isPremium && (
                      <Badge className="gap-1.5 bg-gradient-to-r from-[#4A9B82] to-[#2D6D5F] text-white rounded-full px-3 py-1">
                        <Crown className="h-3.5 w-3.5" /> {t("common.premium")}
                      </Badge>
                    )}
                    {profile.isStarred && (
                      <Badge variant="outline" className="gap-1.5 border-gold text-gold rounded-full px-3 py-1">
                        <Award className="h-3.5 w-3.5" /> {t("common.starred")}
                      </Badge>
                    )}
                  </div>
                </div>

                {isAuthenticated && user?.id !== userId && (
                  <div className="flex gap-2.5">
                    <Link href={`/book/${userId}`}>
                      <Button size="lg" className="gap-2.5 rounded-full bg-gradient-to-r from-[#4A9B82] to-[#2D6D5F] hover:opacity-90 shadow-md shadow-primary/20 px-6">
                        <Calendar className="h-4 w-4" /> {t("profProfile.bookAppointment")}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2.5 rounded-full hover:bg-primary/5 hover:border-primary/40 px-6"
                      onClick={() => startChatMutation.mutate({ userId })}
                      disabled={startChatMutation.isPending}
                    >
                      <MessageSquare className="h-4 w-4" /> {t("profProfile.chat")}
                    </Button>
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8 flex-1">
        <Tabs defaultValue="professions">
          <TabsList className="bg-muted/50 rounded-full p-1">
            <TabsTrigger value="professions" className="rounded-full">{t("profProfile.services")} ({profile.professions.length})</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full">{t("profProfile.reviews")} ({reviewsData?.length || 0})</TabsTrigger>
            <TabsTrigger value="availability" className="rounded-full">{t("profProfile.availability")}</TabsTrigger>
          </TabsList>

          <TabsContent value="professions" className="mt-6">
            {profile.professions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {profile.professions.map((prof) => (
                  <div key={prof.id} className="bg-card border border-border/60 rounded-xl p-6 hover:border-primary/30 transition-all hover:shadow-md group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-serif font-bold text-lg group-hover:text-primary transition-colors">{lang === "ar" && prof.serviceNameAr ? prof.serviceNameAr : prof.serviceName}</h3>
                        <p className="text-sm text-muted-foreground">{lang === "ar" && prof.categoryNameAr ? prof.categoryNameAr : prof.categoryName}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-bold text-primary text-sm">{parseFloat(prof.avgRating || "0").toFixed(1)}</span>
                      </div>
                    </div>

                    {(prof.country || prof.city) && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {[prof.city, prof.country].filter(Boolean).join(", ")}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {prof.costPerHour && (
                        <span className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1">
                          <DollarSign className="h-3.5 w-3.5 text-gold" /> {prof.costPerHour}/hr
                        </span>
                      )}
                      {prof.yearsOfExperience && prof.yearsOfExperience > 0 && (
                        <span className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1">
                          <Briefcase className="h-3.5 w-3.5 text-primary" /> {prof.yearsOfExperience} {t("profProfile.years")}
                        </span>
                      )}
                      {prof.hasTeam && (
                        <span className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1">
                          <Users className="h-3.5 w-3.5 text-primary" /> {t("common.team")}: {prof.teamSize}
                        </span>
                      )}
                    </div>

                    {prof.hasOffice && (
                      <div className="mt-4 p-3.5 bg-primary/5 border border-primary/10 rounded-lg text-sm">
                        <p className="font-semibold flex items-center gap-1.5 mb-1 text-primary">
                          <Building2 className="h-3.5 w-3.5" /> {t("profProfile.office")}
                        </p>
                        <p className="text-muted-foreground">
                          {[prof.officeAddress, prof.officeCity, prof.officeCountry].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    )}

                    {prof.images && prof.images.length > 0 && (
                      <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                        {prof.images.map((img) => (
                          <img key={img.id} src={img.imageUrl} alt="Portfolio" className="h-20 w-20 object-cover rounded-lg border border-border/40" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20">
                <p className="text-muted-foreground">{t("profProfile.noServices")}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {reviewsData && reviewsData.length > 0 ? (
              <div className="space-y-4">
                {reviewsData.map((review) => (
                  <div key={review.id} className="bg-card border border-border/60 rounded-xl p-5 hover:border-primary/20 transition-all">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-11 w-11 ring-2 ring-border/30">
                        {review.reviewerPhoto ? (
                          <img src={review.reviewerPhoto} alt="" className="object-cover h-full w-full" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-[#4A9B82]/20 to-[#2D6D5F]/20 text-primary text-sm font-bold">
                            {(review.reviewerFirstName || review.reviewerName || "U").charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">
                            {review.reviewerFirstName ? `${review.reviewerFirstName} ${review.reviewerLastName}` : review.reviewerName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-gold text-gold" : "text-muted-foreground/20"}`} />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20">
                <p className="text-muted-foreground">{t("profProfile.noReviews")}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="availability" className="mt-6">
            {profile.professions && profile.professions.some((p: any) => p.availability && p.availability.length > 0) ? (
              <div className="space-y-5">
                {profile.professions.filter((p: any) => p.availability && p.availability.length > 0).map((p: any) => (
                  <div key={p.id} className="bg-card border border-border/60 rounded-xl p-6">
                    <h4 className="font-serif font-bold text-base mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      {lang === 'ar' && p.serviceNameAr ? p.serviceNameAr : p.serviceName} — {p.country}{p.city ? `, ${p.city}` : ''}
                    </h4>
                    <div className="space-y-2">
                      {p.availability.map((slot: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 py-2.5 border-b border-border/30 last:border-0">
                          <span className="font-medium w-28 text-sm">{DAYS[slot.dayOfWeek]}</span>
                          <span className="text-muted-foreground flex items-center gap-1.5 text-sm bg-muted/50 rounded-full px-3 py-1">
                            <Clock className="h-3.5 w-3.5" /> {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/20">
                <p className="text-muted-foreground">{t("profProfile.noAvailability")}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
