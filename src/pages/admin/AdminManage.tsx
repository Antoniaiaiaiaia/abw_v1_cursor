import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { createClient } from '../../utils/supabase/client';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export default function AdminManage() {
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/admin/manage`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAdminEmails(data.adminEmails || []);
      } else {
        let errorMessage = 'Failed to load admins';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
            console.error('Load admins error:', error);
          } else {
            const text = await response.text();
            console.error('Load admins error (non-JSON):', text);
            if (response.status === 404) {
              errorMessage = '后端 API 未部署。请先部署 Supabase Edge Function。';
            } else {
              errorMessage = `Failed to load admins (Status: ${response.status})`;
            }
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
          if (response.status === 404) {
            errorMessage = '后端 API 未部署。请先部署 Supabase Edge Function。';
          } else {
            errorMessage = `Failed to load admins (Status: ${response.status})`;
          }
        }
        toast.error(errorMessage);
        setAdminEmails([]); // 清空列表，避免显示过时的数据
      }
    } catch (error) {
      console.error('Error loading admins:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load admins';
      toast.error(errorMessage);
      setAdminEmails([]); // 清空列表，避免显示过时的数据
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter an email');
      return;
    }

    try {
      setIsAdding(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/admin/manage`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: newEmail.trim() }),
        }
      );

      console.log('Add admin response status:', response.status);

      if (response.ok) {
        toast.success('Admin added successfully');
        setNewEmail('');
        await loadAdmins();
      } else {
        let errorMessage = 'Failed to add admin';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
            console.error('Add admin error:', error);
          } else {
            const text = await response.text();
            console.error('Add admin error (non-JSON):', text);
            if (response.status === 404) {
              errorMessage = '后端 API 未部署。请先部署 Supabase Edge Function。';
            } else {
              errorMessage = `Failed to add admin (Status: ${response.status})`;
            }
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
          if (response.status === 404) {
            errorMessage = '后端 API 未部署。请先部署 Supabase Edge Function。';
          } else {
            errorMessage = `Failed to add admin (Status: ${response.status})`;
          }
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add admin';
      toast.error(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (adminEmails.length === 1) {
      toast.error('Cannot remove the last admin');
      return;
    }

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/admin/manage/${encodeURIComponent(email)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Admin removed successfully');
        await loadAdmins();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove admin');
      }
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Failed to remove admin');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading admins...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">管理员管理</h1>
        <p className="mt-2 text-gray-600">Manage administrator email addresses</p>
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 p-6">
        <div className="space-y-2">
          <Label htmlFor="newEmail">Add Admin Email</Label>
          <div className="flex gap-2">
            <Input
              id="newEmail"
              type="email"
              placeholder="admin@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd();
                }
              }}
            />
            <Button onClick={handleAdd} disabled={isAdding}>
              {isAdding ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Current Admins</Label>
          <div className="space-y-2">
            {adminEmails.length === 0 ? (
              <p className="text-sm text-gray-500">No admins found</p>
            ) : (
              adminEmails.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                  <span className="text-sm">{email}</span>
                  {adminEmails.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(email)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

