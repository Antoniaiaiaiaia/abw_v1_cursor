import { projectId } from './supabase/info';
import { createClient } from './supabase/client';

export async function uploadCompanyLogo(file: File): Promise<string> {
  return uploadImageViaAPI(file, 'company-logo');
}

export async function uploadUserAvatar(file: File): Promise<string> {
  return uploadImageViaAPI(file, 'user-avatar');
}

export async function uploadImageViaAPI(file: File, type: 'company-logo' | 'user-avatar'): Promise<string> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('file', file);

  const endpoint = type === 'company-logo' 
    ? 'upload/company-logo'
    : 'upload/user-avatar';

  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  const data = await response.json();
  return data.url;
}

