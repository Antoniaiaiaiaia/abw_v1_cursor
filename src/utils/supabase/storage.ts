import { createClient } from './client';

const STORAGE_BUCKETS = {
  COMPANY_LOGOS: 'company-logos',
  USER_AVATARS: 'user-avatars',
} as const;

export function getStorageClient() {
  const supabase = createClient();
  return supabase.storage;
}

export function getCompanyLogoBucket() {
  return STORAGE_BUCKETS.COMPANY_LOGOS;
}

export function getUserAvatarBucket() {
  return STORAGE_BUCKETS.USER_AVATARS;
}

