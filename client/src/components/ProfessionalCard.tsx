import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Award, MapPin, Users, DollarSign } from "lucide-react";
import { Link } from "wouter";

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
  categoryName?: string;
  serviceName?: string;
}

export default function ProfessionalCard({
  userId, firstName, lastName, userName, profilePhoto,
  avgRating, totalReviews, costPerHour, yearsOfExperience,
  isPremium, isStarred, hasTeam, categoryName, serviceName,
}: ProfessionalCardProps) {
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : userName || "Professional";
  const initials = firstName ? firstName.charAt(0) : displayName.charAt(0);
  const rating = parseFloat(avgRating || "0");

  return (
    <Link href={`/professional/${userId}`}>
      <div className="group relative border border-border bg-card hover:border-primary/50 p-5 transition-all cursor-pointer">
        {(isPremium || isStarred) && (
          <div className="absolute top-3 right-3 flex gap-1">
            {isPremium && (
              <Badge variant="default" className="gap-1 bg-primary text-primary-foreground text-xs">
                <Crown className="h-3 w-3" /> Premium
              </Badge>
            )}
            {isStarred && (
              <Badge variant="outline" className="gap-1 border-primary text-primary text-xs">
                <Award className="h-3 w-3" /> Starred
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-border">
            {profilePhoto ? (
              <img src={profilePhoto} alt={displayName} className="object-cover h-full w-full" />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary font-serif text-lg">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-lg group-hover:text-primary transition-colors truncate">
              {displayName}
            </h3>
            {serviceName && (
              <p className="text-sm text-muted-foreground">{serviceName}</p>
            )}

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({totalReviews})</span>
                </div>
              )}
              {costPerHour && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  {costPerHour}/hr
                </div>
              )}
              {yearsOfExperience && yearsOfExperience > 0 && (
                <span className="text-xs text-muted-foreground">{yearsOfExperience}y exp</span>
              )}
              {hasTeam && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" /> Team
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
