import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Award, MapPin, Users, DollarSign, Building2, Clock } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfessionalCardProps {
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
  userName?: string | null;
  profilePhoto?: string | null;
  avgRating?: string | null;
  totalReviews?: number | null;
  costPerHour?: string | null;
  yearsOfExperience?: number | null;
  isPremium?: boolean | null;
  isStarred?: boolean | null;
  hasTeam?: boolean | null;
  hasOffice?: boolean | null;
  country?: string | null;
  city?: string | null;
  categoryName?: string;
  serviceName?: string;
}

export default function ProfessionalCard({
  userId, firstName, lastName, userName, profilePhoto,
  avgRating, totalReviews, costPerHour, yearsOfExperience,
  isPremium, isStarred, hasTeam, hasOffice, country, city,
  categoryName, serviceName,
}: ProfessionalCardProps) {
  const { t } = useLanguage();
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : userName || "Professional";
  const initials = firstName ? firstName.charAt(0) : displayName.charAt(0);
  const rating = parseFloat(avgRating || "0");
  const locationStr = [city, country].filter(Boolean).join(", ");
  const isSpecial = isPremium || isStarred;

  return (
    <Link href={`/professional/${userId}`}>
      <div className={`group relative rounded-xl bg-card border transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 overflow-hidden ${
        isSpecial ? 'border-accent/40 glow-gold' : 'border-border hover:border-primary/40'
      }`}>
        {isSpecial && <div className="absolute inset-0 shimmer pointer-events-none rounded-xl" />}

        {/* Top accent */}
        <div className={`h-1 w-full ${isSpecial ? 'bg-gradient-to-r from-accent via-gold-highlight to-accent' : 'bg-primary/30'}`} />

        <div className="p-4">
          {/* Badges */}
          {isSpecial && (
            <div className="flex gap-1.5 mb-3">
              {isPremium && (
                <Badge className="gap-1 bg-accent text-accent-foreground text-xs rounded-md px-2 border-0">
                  <Crown className="h-3 w-3" /> {t("common.premium")}
                </Badge>
              )}
              {isStarred && (
                <Badge variant="outline" className="gap-1 border-accent/50 text-accent text-xs rounded-md px-2">
                  <Award className="h-3 w-3" /> {t("common.starred")}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-start gap-3.5">
            <Avatar className={`h-14 w-14 rounded-xl ${isSpecial ? 'ring-2 ring-accent/40' : 'ring-2 ring-border'}`}>
              {profilePhoto ? (
                <img src={profilePhoto} alt={displayName} className="object-cover h-full w-full rounded-xl" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground font-serif text-lg rounded-xl">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-bold text-base group-hover:text-primary transition-colors truncate">
                {displayName}
              </h3>
              {serviceName && (
                <p className="text-sm text-primary/70 font-medium truncate">{serviceName}</p>
              )}
              {locationStr && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-accent shrink-0" /> {locationStr}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2.5 mt-3.5 pt-3 border-t border-border/40 flex-wrap">
            {rating > 0 && (
              <div className="flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded-md">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="text-sm font-bold">{rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({totalReviews})</span>
              </div>
            )}
            {costPerHour && (
              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                <DollarSign className="h-3.5 w-3.5" />{costPerHour}/hr
              </div>
            )}
            {yearsOfExperience && yearsOfExperience > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> {yearsOfExperience}y
              </div>
            )}
            {hasTeam && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" /> {t("common.team")}
              </div>
            )}
            {hasOffice && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" /> {t("profProfile.office")}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
