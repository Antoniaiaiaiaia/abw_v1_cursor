import { useState, useEffect } from 'react';
import { TalentCard, Talent } from '../../components/TalentCard';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ReviewDetailView } from '../../components/admin/ReviewDetailView';
import { createClient } from '../../utils/supabase/client';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner';

export default function TalentReview() {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);

  useEffect(() => {
    loadTalents();
  }, [statusFilter]);

  const loadTalents = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/admin/talents?status=${statusFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTalents(data.talents || []);
      }
    } catch (error) {
      console.error('Error loading talents:', error);
      toast.error('Failed to load talents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (talentId: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/admin/talents/${talentId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Talent approved successfully');
        await loadTalents();
        setSelectedTalent(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to approve talent');
      }
    } catch (error) {
      console.error('Error approving talent:', error);
      toast.error('Failed to approve talent');
    }
  };

  const handleReject = async (talentId: string, rejectionReason?: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/admin/talents/${talentId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rejectionReason: rejectionReason || '经历 / 删除部分过于模糊',
          }),
        }
      );

      if (response.ok) {
        toast.success('Talent rejected');
        await loadTalents();
        setSelectedTalent(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to reject talent');
      }
    } catch (error) {
      console.error('Error rejecting talent:', error);
      toast.error('Failed to reject talent');
    }
  };

  if (selectedTalent) {
    return (
      <ReviewDetailView
        type="talent"
        data={selectedTalent}
        onBack={() => setSelectedTalent(null)}
        onApprove={() => handleApprove(selectedTalent.id)}
        onReject={(reason) => handleReject(selectedTalent.id, reason)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">求职信息审核</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">待审核</SelectItem>
            <SelectItem value="approved">已通过</SelectItem>
            <SelectItem value="rejected">已拒绝</SelectItem>
            <SelectItem value="all">全部</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading talents...</div>
      ) : (
        <div className="space-y-4">
          {talents.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No talents found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {talents.map((talent) => (
                <div
                  key={talent.id}
                  onClick={() => setSelectedTalent(talent)}
                  className="cursor-pointer border-b border-gray-100 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{talent.name}</h3>
                      <p className="text-sm text-gray-600">{talent.title}</p>
                      <p className="text-xs text-gray-500">
                        用户: {(talent as any).userEmail || talent.userId || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        状态: {talent.status || 'pending'}
                      </p>
                      <p className="text-xs text-gray-500">
                        企业邮箱认证: {(talent as any).companyEmailVerified ? '是' : '否'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {talent.createdAt ? new Date(talent.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
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

