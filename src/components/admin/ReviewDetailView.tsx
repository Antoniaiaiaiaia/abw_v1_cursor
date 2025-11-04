import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Job } from '../JobCard';
import { Talent } from '../TalentCard';

interface ReviewDetailViewProps {
  type: 'job' | 'talent';
  data: Job | Talent;
  onBack: () => void;
  onApprove: () => void;
  onReject: (reason?: string) => void;
}

export function ReviewDetailView({
  type,
  data,
  onBack,
  onApprove,
  onReject,
}: ReviewDetailViewProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleReject = () => {
    if (showRejectForm) {
      onReject(rejectionReason);
    } else {
      setShowRejectForm(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-gray-100 px-4 py-3">
        <p className="text-sm text-gray-700">审核用页面，未对外公开</p>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <div className="flex gap-2">
          {!showRejectForm && (
            <>
              <Button variant="outline" onClick={onApprove}>
                Approve
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {showRejectForm && (
        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Rejection Reason</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => onReject(rejectionReason)}
            >
              Confirm Reject
            </Button>
            <Button variant="outline" onClick={() => setShowRejectForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 p-6">
        {type === 'job' ? (
          <JobDetailContent job={data as Job} />
        ) : (
          <TalentDetailContent talent={data as Talent} />
        )}
      </div>
    </div>
  );
}

function JobDetailContent({ job }: { job: Job }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{job.title}</h2>
        <p className="text-xl text-gray-600">{job.company}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-semibold">Location</p>
          <p className="text-sm text-gray-600">{job.location}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Type</p>
          <p className="text-sm text-gray-600">{job.type}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Salary</p>
          <p className="text-sm text-gray-600">{job.salary}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Category</p>
          <p className="text-sm text-gray-600">{job.category}</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold">Description</p>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.description}</p>
      </div>
      {job.requirements && (
        <div>
          <p className="text-sm font-semibold">Requirements</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.requirements}</p>
        </div>
      )}
      {job.applicationMethod && (
        <div>
          <p className="text-sm font-semibold">Application Method</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.applicationMethod}</p>
        </div>
      )}
    </div>
  );
}

function TalentDetailContent({ talent }: { talent: Talent }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{talent.name}</h2>
        <p className="text-xl text-gray-600">{talent.title}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-semibold">Location</p>
          <p className="text-sm text-gray-600">{talent.location}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Rate</p>
          <p className="text-sm text-gray-600">{talent.rate}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Availability</p>
          <p className="text-sm text-gray-600">{talent.availability}</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold">Bio</p>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{talent.bio}</p>
      </div>
      {talent.skills && talent.skills.length > 0 && (
        <div>
          <p className="text-sm font-semibold">Skills</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {talent.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

