import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { CompanyEmailBadge } from './CompanyEmailBadge';
import { createClient } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';

interface CompanyEmailFormProps {
  currentStatus?: 'pending' | 'pass' | 'no';
  companyEmail?: string;
  onSuccess?: () => void;
}

export function CompanyEmailForm({ currentStatus, companyEmail, onSuccess }: CompanyEmailFormProps) {
  const [email, setEmail] = useState(companyEmail || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/settings/company-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companyEmail: email }),
        }
      );

      if (response.ok) {
        toast.success('Company email application submitted successfully');
        setEmail('');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting company email:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStatus === 'pass') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CompanyEmailBadge />
          <span className="text-sm text-gray-600">{companyEmail}</span>
        </div>
      </div>
    );
  }

  if (currentStatus === 'pending') {
    return (
      <div className="space-y-2">
        <Badge variant="outline">Pending Review</Badge>
        <p className="text-sm text-gray-600">
          Your company email application is under review: {companyEmail}
        </p>
      </div>
    );
  }

  if (currentStatus === 'no') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Badge variant="destructive">Rejected</Badge>
          <p className="text-sm text-gray-600">
            未通过：企业邮箱与域名未对应
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyEmail">Company Email</Label>
            <Input
              id="companyEmail"
              type="email"
              placeholder="your@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Reapply'}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyEmail">Company Email</Label>
        <Input
          id="companyEmail"
          type="email"
          placeholder="your@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Apply for Verification'}
      </Button>
    </form>
  );
}

