import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Star, Crown, Award, MapPin, Users, DollarSign, Calendar, MessageSquare,
  Loader2, Globe, Clock, Briefcase, ChevronLeft
} from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ProfessionalProfile() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const { user, isAuthenticated } = useAuth();

  const { data: profile, isLoading } = trpc.professionals.profile.useQuery({ userId });
  const { data: reviewsData } = trpc.reviews.byProfessional.useQuery({ professionalId: userId });

  const startChatMutation = trpc.chat.startChat.useMutation({
    onSuccess: () => toast.success("Chat started! Go to your Chats to continue."),
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Professional not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = profile.firstName && profile.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : profile.name || "Professional";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container py-8 flex-1">
        <Link href="/search">
          <Button variant="ghost" size="sm" className="gap-1 mb-4">
            <ChevronLeft className="h-4 w-4" /> Back to Search
          </Button>
        </Link>

        {/* Profile Header */}
        <div className="border border-border bg-card p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24 border-2 border-border shrink-0">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt={displayName} className="object-cover h-full w-full" />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary font-serif text-3xl">
                  {displayName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h1 className="font-serif text-2xl md:text-3xl font-bold">{displayName}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    {profile.isPremium && (
                      <Badge className="gap-1 bg-primary text-primary-foreground">
                        <Crown className="h-3 w-3" /> Premium
                      </Badge>
                    )}
                    {profile.isStarred && (
                      <Badge variant="outline" className="gap-1 border-primary text-primary">
                        <Award className="h-3 w-3" /> Starred
                      </Badge>
                    )}
                  </div>
                </div>

                {isAuthenticated && user?.id !== userId && (
                  <div className="flex gap-2">
                    <Link href={`/book/${userId}`}>
                      <Button className="gap-2">
                        <Calendar className="h-4 w-4" /> Book Appointment
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => startChatMutation.mutate({ userId })}
                      disabled={startChatMutation.isPending}
                    >
                      <MessageSquare className="h-4 w-4" /> Chat
                    </Button>
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="text-muted-foreground mt-4 leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="professions">
          <TabsList>
            <TabsTrigger value="professions">Services ({profile.professions.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviewsData?.length || 0})</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="professions" className="mt-4">
            {profile.professions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.professions.map((prof) => (
                  <div key={prof.id} className="border border-border bg-card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-serif font-semibold text-lg">{prof.serviceName}</h3>
                        <p className="text-sm text-muted-foreground">{prof.categoryName}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-medium">{parseFloat(prof.avgRating || "0").toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {prof.costPerHour && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" /> {prof.costPerHour}/hr
                        </span>
                      )}
                      {prof.yearsOfExperience && prof.yearsOfExperience > 0 && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" /> {prof.yearsOfExperience} years
                        </span>
                      )}
                      {prof.hasTeam && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> Team of {prof.teamSize}
                        </span>
                      )}
                    </div>

                    {prof.images && prof.images.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto">
                        {prof.images.map((img) => (
                          <img key={img.id} src={img.imageUrl} alt="Portfolio" className="h-20 w-20 object-cover border border-border" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border">
                <p className="text-muted-foreground">No services listed yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            {reviewsData && reviewsData.length > 0 ? (
              <div className="space-y-4">
                {reviewsData.map((review) => (
                  <div key={review.id} className="border border-border bg-card p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        {review.reviewerPhoto ? (
                          <img src={review.reviewerPhoto} alt="" className="object-cover h-full w-full" />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {(review.reviewerFirstName || review.reviewerName || "U").charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {review.reviewerFirstName ? `${review.reviewerFirstName} ${review.reviewerLastName}` : review.reviewerName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border">
                <p className="text-muted-foreground">No reviews yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="availability" className="mt-4">
            {profile.availability && profile.availability.length > 0 ? (
              <div className="border border-border bg-card p-5">
                <div className="space-y-2">
                  {profile.availability.map((slot, i) => (
                    <div key={i} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                      <span className="font-medium w-28">{DAYS[slot.dayOfWeek]}</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border">
                <p className="text-muted-foreground">No availability set</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
