import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { createClient } from '../../utils/supabase/client';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner';

interface CompanyEmailApplication {
  id: string;
  userId: string;
  userEmail: string;
  companyEmail: string;
  status: 'pending' | 'pass' | 'no';
  createdAt: string;
  rejectionReason?: string;
}

export default function CompanyEmailReview() {
  const [applications, setApplications] = useState<CompanyEmailApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/admin/company-emails?status=${statusFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/admin/company-emails/${appId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Company email approved successfully');
        await loadApplications();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to approve company email');
      }
    } catch (error) {
      console.error('Error approving company email:', error);
      toast.error('Failed to approve company email');
    }
  };

  const handleReject = async (appId: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/admin/company-emails/${appId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Company email rejected');
        await loadApplications();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to reject company email');
      }
    } catch (error) {
      console.error('Error rejecting company email:', error);
      toast.error('Failed to reject company email');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">企业邮箱认证审核</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">待审核</SelectItem>
            <SelectItem value="pass">已通过</SelectItem>
            <SelectItem value="no">已拒绝</SelectItem>
            <SelectItem value="all">全部</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading applications...</div>
      ) : (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No applications found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {applications.map((app) => (
                <div key={app.id} className="border-b border-gray-100 py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">User: {app.userEmail}</p>
                      <p className="text-sm text-gray-600">Company Email: {app.companyEmail}</p>
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                      {app.rejectionReason && (
                        <p className="text-xs text-red-600">{app.rejectionReason}</p>
                      )}
                    </div>
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(app.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(app.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {app.status === 'pass' && (
                      <span className="text-sm text-green-600">已通过</span>
                    )}
                    {app.status === 'no' && (
                      <span className="text-sm text-red-600">已拒绝</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

