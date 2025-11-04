import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Link2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Talent } from '../components/TalentCard';
import { CompanyEmailBadge } from '../components/CompanyEmailBadge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TalentWithEmail extends Talent {
  companyEmailVerified?: boolean;
}

export default function TalentDetail() {
  const { id } = useParams<{ id: string }>();
  const [talent, setTalent] = useState<TalentWithEmail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTalent();
  }, [id]);

  const loadTalent = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/talents/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTalent(data.talent);
      }
    } catch (error) {
      console.error('Error loading talent:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">
        Loading talent details...
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="py-12 text-center text-gray-500">
        Talent not found
      </div>
    );
  }

  const initials = talent.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/talents">
        <Button variant="ghost" className="mb-6 gap-2 px-0">
          <ArrowLeft className="h-4 w-4" />
          Back to Talents
        </Button>
      </Link>

      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-6 border-b border-gray-200 pb-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={talent.avatar} alt={talent.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{talent.name}</h1>
              {talent.companyEmailVerified && <CompanyEmailBadge />}
            </div>
            <p className="mt-2 text-xl text-gray-600">{talent.title}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{talent.location}</span>
              </div>
              <span>·</span>
              <span>{talent.rate}</span>
              {talent.walletAddress && (
                <>
                  <span>·</span>
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    <span className="font-mono">{talent.walletAddress}</span>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4">
              <Badge variant="outline">{talent.availability}</Badge>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <h3 className="font-semibold">About</h3>
          <p className="mt-2 whitespace-pre-wrap text-gray-600">{talent.bio}</p>
        </div>

        {/* Skills */}
        {talent.skills && talent.skills.length > 0 && (
          <div>
            <h3 className="font-semibold">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {talent.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

