// Data migration script
// This script migrates existing data to the new data model
// Run with: deno run --allow-net --allow-env scripts/migrate-data.ts

import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // Get all jobs from KV store
    const { data: jobs, error: jobsError } = await supabase
      .from('kv_store_66f4da3b')
      .select('*')
      .like('key', 'job:%');

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      return;
    }

    console.log(`Found ${jobs?.length || 0} jobs to migrate`);

    // Migrate jobs
    for (const jobItem of jobs || []) {
      const job = jobItem.value;
      
      // Skip mock data (jobs without userId or with test IDs)
      if (!job.userId || job.id?.startsWith('mock-')) {
        console.log(`Skipping mock job: ${job.id}`);
        continue;
      }

      // Add missing fields with default values
      const updatedJob = {
        ...job,
        status: job.status || 'approved',
        companyLogo: job.companyLogo || undefined,
        companyWebsite: job.companyWebsite || undefined,
        companyTwitter: job.companyTwitter || undefined,
        companyTokens: job.companyTokens || undefined,
        companyEmailVerified: job.companyEmailVerified || false,
        requirements: job.requirements || undefined,
        experience: job.experience || undefined,
        baseCity: job.baseCity || undefined,
        applicationMethod: job.applicationMethod || undefined,
        hasEquities: job.hasEquities || false,
        acceptsRecruiters: job.acceptsRecruiters || false,
        postedBy: job.postedBy || undefined,
        reviewedAt: job.reviewedAt || undefined,
        reviewedBy: job.reviewedBy || undefined,
        rejectionReason: job.rejectionReason || undefined,
      };

      // Update job in KV store
      await supabase
        .from('kv_store_66f4da3b')
        .update({ value: updatedJob })
        .eq('key', jobItem.key);

      console.log(`Migrated job: ${job.id}`);
    }

    // Get all talents from KV store
    const { data: talents, error: talentsError } = await supabase
      .from('kv_store_66f4da3b')
      .select('*')
      .like('key', 'talent:%');

    if (talentsError) {
      console.error('Error fetching talents:', talentsError);
      return;
    }

    console.log(`Found ${talents?.length || 0} talents to migrate`);

    // Migrate talents
    for (const talentItem of talents || []) {
      const talent = talentItem.value;
      
      // Skip mock data (talents without userId or with test IDs)
      if (!talent.userId || talent.id?.startsWith('mock-')) {
        console.log(`Skipping mock talent: ${talent.id}`);
        continue;
      }

      // Add missing fields with default values
      const updatedTalent = {
        ...talent,
        status: talent.status || 'approved',
        avatar: talent.avatar || undefined,
        reviewedAt: talent.reviewedAt || undefined,
        reviewedBy: talent.reviewedBy || undefined,
        rejectionReason: talent.rejectionReason || undefined,
      };

      // Update talent in KV store
      await supabase
        .from('kv_store_66f4da3b')
        .update({ value: updatedTalent })
        .eq('key', talentItem.key);

      console.log(`Migrated talent: ${talent.id}`);
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    Deno.exit(1);
  }
}

migrateData();

