// Create initial admin script
// This script creates the initial admin user and adds them to the admin list
// Run with: deno run --allow-net --allow-env scripts/create-admin.ts

import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from '../src/supabase/functions/server/kv_store.tsx';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createAdmin() {
  try {
    console.log('Creating initial admin user...');

    // Create admin user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'admin@admin.com',
      password: '123456',
      user_metadata: { name: 'admin' },
      email_confirm: true,
    });

    if (userError) {
      console.error('Error creating admin user:', userError);
      
      // Check if user already exists
      if (userError.message.includes('already registered')) {
        console.log('Admin user already exists, skipping creation...');
      } else {
        return;
      }
    } else {
      console.log('Admin user created successfully:', userData.user?.email);
    }

    // Get or create admin user
    const adminEmail = 'admin@admin.com';
    
    // Add admin email to admin list
    const adminEmails = await kv.get('admin:emails');
    const adminList = adminEmails || [];
    
    if (!adminList.includes(adminEmail)) {
      adminList.push(adminEmail);
      await kv.set('admin:emails', adminList);
      console.log('Admin email added to admin list:', adminEmail);
    } else {
      console.log('Admin email already in admin list:', adminEmail);
    }

    console.log('Initial admin setup completed successfully!');
    console.log('Admin credentials:');
    console.log('  Email: admin@admin.com');
    console.log('  Password: 123456');
  } catch (error) {
    console.error('Error creating admin:', error);
    Deno.exit(1);
  }
}

createAdmin();

