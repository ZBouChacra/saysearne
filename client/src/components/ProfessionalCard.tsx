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
      <div className={`group relative rounded-xl bg-card border transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
        isSpecial ? 'border-gold/40 shadow-md' : 'border-border/60 hover:border-primary/40'
      }`}>
        {/* Premium shimmer overlay */}
        {isSpecial && <div className="absolute inset-0 shimmer pointer-events-none rounded-xl" />}

        {/* Top accent line */}
        <div className={`h-1 w-full ${isSpecial ? 'bg-gradient-to-r from-gold via-gold-bright to-gold' : 'bg-gradient-to-r from-primary/40 via-purple-vivid/30 to-primary/40'}`} />

        <div className="p-5">
          {/* Badges */}
          {isSpecial && (
            <div className="flex gap-1.5 mb-3">
              {isPremium && (
                <Badge className="gap-1 bg-gradient-to-r from-gold to-gold-warm text-gold-foreground text-xs rounded-full px-2.5 border-0 shadow-sm">
                  <Crown className="h-3 w-3" /> {t("common.premium")}
                </Badge>
              )}
              {isStarred && (
                <Badge variant="outline" className="gap-1 border-gold/50 text-gold text-xs rounded-full px-2.5">
                  <Award className="h-3 w-3" /> {t("common.starred")}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-start gap-4">
            <Avatar className={`h-16 w-16 rounded-xl ${isSpecial ? 'ring-2 ring-gold/40 pulse-glow' : 'ring-2 ring-border'}`}>
              {profilePhoto ? (
                <img src={profilePhoto} alt={displayName} className="object-cover h-full w-full rounded-xl" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-vivid text-primary-foreground font-serif text-xl rounded-xl">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-bold text-lg group-hover:text-primary transition-colors truncate">
                {displayName}
              </h3>
              {serviceName && (
                <p className="text-sm text-primary/70 font-medium">{serviceName}</p>
              )}
              {locationStr && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-gold" /> {locationStr}
                </p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/40 flex-wrap">
            {rating > 0 && (
              <div className="flex items-center gap-1 bg-gold/10 px-2.5 py-1 rounded-full">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                <span className="text-sm font-bold">{rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({totalReviews})</span>
              </div>
            )}
            {costPerHour && (
              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                <DollarSign className="h-3.5 w-3.5" />
                {costPerHour}/hr
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
