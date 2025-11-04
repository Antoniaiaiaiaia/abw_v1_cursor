import * as kv from './kv_store.ts';

const ADMIN_KEY = 'admin:emails';

export async function isAdmin(email: string): Promise<boolean> {
  try {
    const adminEmails = await kv.get(ADMIN_KEY);
    if (!adminEmails || !Array.isArray(adminEmails)) {
      return false;
    }
    return adminEmails.includes(email);
  } catch (error) {
    console.log(`Error checking admin status: ${error}`);
    return false;
  }
}

export async function getAdminEmails(): Promise<string[]> {
  try {
    const adminEmails = await kv.get(ADMIN_KEY);
    if (!adminEmails || !Array.isArray(adminEmails)) {
      return [];
    }
    return adminEmails;
  } catch (error) {
    console.log(`Error getting admin emails: ${error}`);
    return [];
  }
}

export async function addAdminEmail(email: string): Promise<void> {
  try {
    const adminEmails = await getAdminEmails();
    if (!adminEmails.includes(email)) {
      adminEmails.push(email);
      await kv.set(ADMIN_KEY, adminEmails);
    }
  } catch (error) {
    console.log(`Error adding admin email: ${error}`);
    throw error;
  }
}

export async function removeAdminEmail(email: string): Promise<void> {
  try {
    const adminEmails = await getAdminEmails();
    const filtered = adminEmails.filter((e: string) => e !== email);
    if (filtered.length === 0) {
      throw new Error('Cannot remove the last admin');
    }
    await kv.set(ADMIN_KEY, filtered);
  } catch (error) {
    console.log(`Error removing admin email: ${error}`);
    throw error;
  }
}

