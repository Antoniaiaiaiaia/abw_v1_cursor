import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { MapPin, DollarSign } from "lucide-react";

export interface Job {
  id: string;
  userId?: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyWebsite?: string;
  companyTwitter?: string;
  companyTokens?: string[];
  companyEmailVerified?: boolean;
  location: string;
  baseCity?: string;
  salary: string;
  type: string;
  category: string;
  remote?: boolean;
  tags: string[];
  description: string;
  requirements?: string;
  experience?: string;
  applicationMethod?: string;
  hasEquities?: boolean;
  acceptsRecruiters?: boolean;
  postedBy?: string;
  postedDate: string;
  status?: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  createdAt?: string;
}

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link to={`/jobs/${job.id}`}>
      <div className="group cursor-pointer border-b border-gray-100 py-6 transition-colors hover:bg-gray-50">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="transition-colors group-hover:text-[var(--brand)]">
                {job.title}
              </h3>
              <p className="text-gray-600">{job.company}</p>
            </div>
            <Badge variant="outline" className="shrink-0">
              {job.type}
            </Badge>
          </div>

          <p className="text-gray-600 line-clamp-2">{job.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{job.salary}</span>
            </div>
            <span>·</span>
            <span>{job.postedDate}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
