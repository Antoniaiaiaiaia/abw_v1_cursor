import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, DollarSign, Globe, Twitter, ExternalLink } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Job } from '../components/JobCard';
import { CompanyEmailBadge } from '../components/CompanyEmailBadge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/jobs/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
      }
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">
        Loading job details...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-12 text-center text-gray-500">
        Job not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/jobs">
        <Button variant="ghost" className="mb-6 gap-2 px-0">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Button>
      </Link>

      <div className="space-y-6">
        {/* Company Info */}
        <div className="flex items-start gap-6 border-b border-gray-200 pb-6">
          {job.companyLogo && (
            <img
              src={job.companyLogo}
              alt={job.company}
              className="h-20 w-20 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="mt-2 text-xl text-gray-600">{job.company}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              {job.companyWebsite && (
                <a
                  href={job.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 hover:text-[var(--brand)]"
                >
                  <Globe className="h-4 w-4" />
                  <span>Website</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {job.companyTwitter && (
                <a
                  href={job.companyTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 hover:text-[var(--brand)]"
                >
                  <Twitter className="h-4 w-4" />
                  <span>Twitter</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {job.companyEmailVerified && <CompanyEmailBadge />}
            </div>
            {job.companyTokens && job.companyTokens.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.companyTokens.map((token) => (
                  <Badge key={token} variant="secondary">
                    {token}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Job Type</h3>
              <p className="text-gray-600">{job.type}</p>
            </div>
            <div>
              <h3 className="font-semibold">Location</h3>
              <p className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                {job.location}
              </p>
            </div>
            {job.baseCity && (
              <div>
                <h3 className="font-semibold">Base City</h3>
                <div className="mt-2">
                  <Badge variant="outline">{job.baseCity}</Badge>
                </div>
              </div>
            )}
            <div>
              <h3 className="font-semibold">Salary</h3>
              <p className="flex items-center gap-2 text-gray-600">
                <DollarSign className="h-4 w-4" />
                {job.salary}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Remote</h3>
              <p className="text-gray-600">{job.remote ? 'Yes' : 'No'}</p>
            </div>
            {job.hasEquities !== undefined && (
              <div>
                <h3 className="font-semibold">Equities</h3>
                <p className="text-gray-600">{job.hasEquities ? 'Yes' : 'No'}</p>
              </div>
            )}
            {job.acceptsRecruiters !== undefined && (
              <div>
                <h3 className="font-semibold">Accepts Recruiters</h3>
                <p className="text-gray-600">{job.acceptsRecruiters ? 'Yes' : 'No'}</p>
              </div>
            )}
            {job.experience && (
              <div>
                <h3 className="font-semibold">Experience Required</h3>
                <p className="text-gray-600">{job.experience}</p>
              </div>
            )}
            <div>
              <h3 className="font-semibold">Posted</h3>
              <p className="text-gray-600">{job.postedDate}</p>
            </div>
            {job.postedBy && (
              <div>
                <h3 className="font-semibold">Posted By</h3>
                <p className="text-gray-600">{job.postedBy}</p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold">Job Description</h3>
          <p className="mt-2 whitespace-pre-wrap text-gray-600">{job.description}</p>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div>
            <h3 className="font-semibold">Requirements</h3>
            <p className="mt-2 whitespace-pre-wrap text-gray-600">{job.requirements}</p>
          </div>
        )}

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div>
            <h3 className="font-semibold">Skills & Tags</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Application Method */}
        {job.applicationMethod && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold">How to Apply</h3>
            <p className="mt-2 whitespace-pre-wrap text-gray-600">{job.applicationMethod}</p>
          </div>
        )}
      </div>
    </div>
  );
}

