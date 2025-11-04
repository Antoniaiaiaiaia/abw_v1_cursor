import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MapPin, Link2 } from "lucide-react";

export interface Talent {
  id: string;
  userId?: string;
  name: string;
  title: string;
  location: string;
  bio: string;
  skills: string[];
  availability: string;
  rate: string;
  walletAddress?: string;
  avatar?: string;
  status?: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  createdAt?: string;
}

interface TalentCardProps {
  talent: Talent;
}

export function TalentCard({ talent }: TalentCardProps) {
  const initials = talent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Link to={`/talents/${talent.id}`}>
      <div className="group cursor-pointer border-b border-gray-100 py-6 transition-colors hover:bg-gray-50">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={talent.avatar} alt={talent.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h3 className="transition-colors group-hover:text-[var(--brand)]">
                {talent.name}
              </h3>
              <p className="text-gray-600">{talent.title}</p>
            </div>
            <Badge variant="outline" className="shrink-0">
              {talent.availability}
            </Badge>
          </div>

          <p className="text-gray-600 line-clamp-2">{talent.bio}</p>

          <div className="flex flex-wrap items-center gap-4 text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{talent.location}</span>
            </div>
            <span>·</span>
            <span>{talent.rate}</span>
            {talent.walletAddress && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Link2 className="h-4 w-4" />
                  <span className="font-mono">{talent.walletAddress}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {talent.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
