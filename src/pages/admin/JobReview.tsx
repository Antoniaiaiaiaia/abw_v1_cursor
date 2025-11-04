import { useState, useEffect } from 'react';
import { JobCard, Job } from '../../components/JobCard';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ReviewDetailView } from '../../components/admin/ReviewDetailView';
import { createClient } from '../../utils/supabase/client';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner';

export default function JobReview() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    loadJobs();
  }, [statusFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/admin/jobs?status=${statusFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/admin/jobs/${jobId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Job approved successfully');
        await loadJobs();
        setSelectedJob(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to approve job');
      }
    } catch (error) {
      console.error('Error approving job:', error);
      toast.error('Failed to approve job');
    }
  };

  const handleReject = async (jobId: string, rejectionReason?: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/admin/jobs/${jobId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rejectionReason: rejectionReason || '未通过审核，您的企业可能：\n- 不是 top20 交易所\n- 过于早期/看不出业务形态\n- 公开信息不足\n- 可持续运营公信力不足（如纯meme）',
          }),
        }
      );

      if (response.ok) {
        toast.success('Job rejected');
        await loadJobs();
        setSelectedJob(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to reject job');
      }
    } catch (error) {
      console.error('Error rejecting job:', error);
      toast.error('Failed to reject job');
    }
  };

  if (selectedJob) {
    return (
      <ReviewDetailView
        type="job"
        data={selectedJob}
        onBack={() => setSelectedJob(null)}
        onApprove={() => handleApprove(selectedJob.id)}
        onReject={(reason) => handleReject(selectedJob.id, reason)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">岗位审核</h1>
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
        <div className="py-12 text-center text-gray-500">Loading jobs...</div>
      ) : (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No jobs found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="cursor-pointer border-b border-gray-100 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.company}</p>
                      <p className="text-xs text-gray-500">
                        用户: {(job as any).userEmail || job.postedBy || job.userId || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        状态: {job.status || 'pending'}
                      </p>
                      <p className="text-xs text-gray-500">
                        企业邮箱认证: {(job as any).companyEmailVerified ? '是' : '否'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
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

