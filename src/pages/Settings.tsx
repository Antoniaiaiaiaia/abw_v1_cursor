import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { CompanyEmailForm } from '../components/CompanyEmailForm';
import { CompanyEmailBadge } from '../components/CompanyEmailBadge';
import { createClient } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { uploadUserAvatar } from '../utils/upload';
import { toast } from 'sonner';

export default function Settings() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/settings`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setName(data.user.name || '');
        setAvatarUrl(data.user.avatar || '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please upload an image smaller than 5MB');
      return;
    }

    setAvatar(file);
    setIsUploadingAvatar(true);

    try {
      const url = await uploadUserAvatar(file);
      setAvatarUrl(url);
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
      setAvatar(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/settings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            avatar: avatarUrl,
          }),
        }
      );

      if (response.ok) {
        toast.success('Settings saved successfully');
        await loadSettings();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center text-gray-500">
        Loading settings...
      </div>
    );
  }

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        <div>
          <h2>Settings</h2>
          <p className="mt-2 text-gray-600">
            Manage your account settings and profile information
          </p>
        </div>

        <div className="space-y-6 rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
                <p className="text-sm text-gray-500">
                  请上传小于 5MB 的图片
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="Your display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {userData?.email && (
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={userData.email} disabled />
              </div>
            )}

            <div className="flex items-center gap-2">
              {userData?.companyEmailVerified && <CompanyEmailBadge />}
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving || isUploadingAvatar}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="space-y-6 rounded-lg border border-gray-200 p-6">
          <div>
            <h3 className="font-semibold">Company Email Verification</h3>
            <p className="mt-2 text-sm text-gray-600">
              Apply for company email verification to show your verified status
            </p>
          </div>
          <CompanyEmailForm
            currentStatus={userData?.companyEmailStatus}
            companyEmail={userData?.companyEmail}
            onSuccess={loadSettings}
          />
        </div>
      </div>
    </div>
  );
}

