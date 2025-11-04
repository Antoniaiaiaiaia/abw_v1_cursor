import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import * as auth from './auth.ts';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Health check
app.get('/make-server-66f4da3b/health', (c) => {
  return c.json({ status: 'ok' });
});

// Auth routes
app.post('/make-server-66f4da3b/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Authorization error during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Error in signup route: ${error}`);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Jobs routes
app.get('/make-server-66f4da3b/jobs', async (c) => {
  try {
    const category = c.req.query('category');
    
    const jobs = await kv.getByPrefix('job:');
    
    // Only return approved jobs
    let filteredJobs = jobs.filter((job: any) => job.status === 'approved' || !job.status);
    
    if (category && category !== 'all') {
      filteredJobs = filteredJobs.filter((job: any) => job.category === category);
    }

    return c.json({ jobs: filteredJobs });
  } catch (error) {
    console.log(`Error fetching jobs: ${error}`);
    return c.json({ error: 'Failed to fetch jobs' }, 500);
  }
});

app.get('/make-server-66f4da3b/jobs/:id', async (c) => {
  try {
    const jobId = c.req.param('id');
    const job = await kv.get(jobId);
    
    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    // Get user's company email verification status if userId exists
    if (job.userId) {
      try {
        const { data: { user } } = await supabase.auth.admin.getUserById(job.userId);
        if (user?.user_metadata?.companyEmailVerified) {
          job.companyEmailVerified = true;
        }
      } catch (error) {
        console.log(`Error fetching user info: ${error}`);
      }
    }

    return c.json({ job });
  } catch (error) {
    console.log(`Error fetching job: ${error}`);
    return c.json({ error: 'Failed to fetch job' }, 500);
  }
});

app.post('/make-server-66f4da3b/jobs', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Authorization error while creating job: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const jobData = await c.req.json();
    const jobId = `job:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    
    const job = {
      ...jobData,
      id: jobId,
      userId: user.id,
      createdAt: new Date().toISOString(),
      postedDate: 'Just now',
      status: 'pending',
    };

    await kv.set(jobId, job);

    return c.json({ success: true, job });
  } catch (error) {
    console.log(`Error creating job: ${error}`);
    return c.json({ error: 'Failed to create job' }, 500);
  }
});

// Talents routes
app.get('/make-server-66f4da3b/talents', async (c) => {
  try {
    const talents = await kv.getByPrefix('talent:');
    // Only return approved talents
    const filteredTalents = talents.filter((talent: any) => talent.status === 'approved' || !talent.status);
    return c.json({ talents: filteredTalents });
  } catch (error) {
    console.log(`Error fetching talents: ${error}`);
    return c.json({ error: 'Failed to fetch talents' }, 500);
  }
});

app.get('/make-server-66f4da3b/talents/:id', async (c) => {
  try {
    const talentId = c.req.param('id');
    const talent = await kv.get(talentId);
    
    if (!talent) {
      return c.json({ error: 'Talent not found' }, 404);
    }

    // Get user's company email verification status if userId exists
    if (talent.userId) {
      try {
        const { data: { user } } = await supabase.auth.admin.getUserById(talent.userId);
        if (user?.user_metadata?.companyEmailVerified) {
          talent.companyEmailVerified = true;
        }
      } catch (error) {
        console.log(`Error fetching user info: ${error}`);
      }
    }

    return c.json({ talent });
  } catch (error) {
    console.log(`Error fetching talent: ${error}`);
    return c.json({ error: 'Failed to fetch talent' }, 500);
  }
});

app.post('/make-server-66f4da3b/talents', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.log(`Authorization error while creating talent profile: ${authError?.message}`);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const talentData = await c.req.json();
    const talentId = `talent:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    
    const talent = {
      ...talentData,
      id: talentId,
      userId: user.id,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    await kv.set(talentId, talent);

    return c.json({ success: true, talent });
  } catch (error) {
    console.log(`Error creating talent profile: ${error}`);
    return c.json({ error: 'Failed to create talent profile' }, 500);
  }
});

// Image upload routes
app.post('/make-server-66f4da3b/upload/company-logo', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only PNG, JPG, and GIF are allowed.' }, 400);
    }

    // Validate file size (240x240px max)
    // Note: In Deno, we need to read the file to check dimensions
    // For now, we'll just check file size (assuming max 100KB for 240x240px)
    if (file.size > 100 * 1024) {
      return c.json({ error: 'File too large. Maximum size is 240x240px.' }, 400);
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const fileBuffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from('company-logos')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.log(`Error uploading to storage: ${error.message}`);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('company-logos')
      .getPublicUrl(fileName);

    return c.json({ url: publicUrl });
  } catch (error) {
    console.log(`Error uploading company logo: ${error}`);
    return c.json({ error: 'Failed to upload company logo' }, 500);
  }
});

app.post('/make-server-66f4da3b/upload/user-avatar', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File too large. Maximum size is 5MB.' }, 400);
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const fileBuffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from('user-avatars')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.log(`Error uploading to storage: ${error.message}`);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(fileName);

    return c.json({ url: publicUrl });
  } catch (error) {
    console.log(`Error uploading user avatar: ${error}`);
    return c.json({ error: 'Failed to upload user avatar' }, 500);
  }
});

// Admin routes
app.get('/make-server-66f4da3b/admin/manage', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || !user.email) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isUserAdmin = await auth.isAdmin(user.email);
    if (!isUserAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const adminEmails = await auth.getAdminEmails();
    return c.json({ adminEmails });
  } catch (error) {
    console.log(`Error getting admin emails: ${error}`);
    return c.json({ error: 'Failed to get admin emails' }, 500);
  }
});

app.post('/make-server-66f4da3b/admin/manage', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || !user.email) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isUserAdmin = await auth.isAdmin(user.email);
    if (!isUserAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const { email } = await c.req.json();
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    await auth.addAdminEmail(email);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error adding admin email: ${error}`);
    return c.json({ error: error instanceof Error ? error.message : 'Failed to add admin email' }, 500);
  }
});

app.delete('/make-server-66f4da3b/admin/manage/:email', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || !user.email) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isUserAdmin = await auth.isAdmin(user.email);
    if (!isUserAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const email = c.req.param('email');
    await auth.removeAdminEmail(email);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error removing admin email: ${error}`);
    return c.json({ error: error instanceof Error ? error.message : 'Failed to remove admin email' }, 500);
  }
});

// Review routes
app.get('/make-server-66f4da3b/admin/jobs', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || !user.email) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isUserAdmin = await auth.isAdmin(user.email);
    if (!isUserAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const status = c.req.query('status') || 'pending';
    const jobs = await kv.getByPrefix('job:');
    
    let filteredJobs = jobs;
    if (status !== 'all') {
      filteredJobs = jobs.filter((job: any) => job.status === status);
    }

    // Enrich jobs with user information
    const enrichedJobs = await Promise.all(
      filteredJobs.map(async (job: any) => {
        if (job.userId) {
          try {
            const { data: { user } } = await supabase.auth.admin.getUserById(job.userId);
            if (user) {
              return {
                ...job,
                userEmail: user.email,
                companyEmailVerified: user.user_metadata?.companyEmailVerified || false,
              };
            }
          } catch (error) {
            console.log(`Error fetching user info for job ${job.id}: ${error}`);
          }
        }
        return job;
      })
    );

    return c.json({ jobs: enrichedJobs });
  } catch (error) {
    console.log(`Error fetching jobs for review: ${error}`);
    return c.json({ error: 'Failed to fetch jobs' }, 500);
  }
});

app.post('/make-server-66f4da3b/admin/jobs/:id/approve', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || !user.email) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isUserAdmin = await auth.isAdmin(user.email);
    if (!isUserAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const jobId = c.req.param('id');
    const job = await kv.get(jobId);
    
    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    job.status = 'approved';
    job.reviewedAt = new Date().toISOString();
    job.reviewedBy = user.id;

    await kv.set(jobId, job);

    return c.json({ success: true, job });
  } catch (error) {
    console.log(`Error approving job: ${error}`);
    return c.json({ error: 'Failed to approve job' }, 500);
  }
});

app.post('/make-server-66f4da3b/admin/jobs/:id/reject', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || !user.email) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isUserAdmin = await auth.isAdmin(user.email);
    if (!isUserAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const jobId = c.req.param('id');
    const { rejectionReason } = await c.req.json();
    const job = await kv.get(jobId);
    
    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    job.status = 'rejected';
    job.reviewedAt = new Date().toISOString();
    job.reviewedBy = user.id;
    job.rejectionReason = rejectionReason || '未通过审核，您的企业可能：\n- 不是 top20 交易所\n- 过于早期/看不出业务形态\n- 公开信息不足\n- 可持续运营公信力不足（如纯meme）';

    await kv.set(jobId, job);

    return c.json({ success: true, job });
  } catch (error) {
    console.log(`Error rejecting job: ${error}`);
    return c.json({ error: 'Failed to reject job' }, 500);
  }
});

app.get('/make-server-66f4da3b/admin/talents', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || !user.email) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isUserAdmin = await auth.isAdmin(user.email);
    if (!isUserAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const status = c.req.query('status') || 'pending';
    const talents = await kv.getByPrefix('talent:');
    
    let filteredTalents = talents;
    if (status !== 'all') {
      filteredTalents = talents.filter((talent: any) => talent.status === status);
    }

    // Enrich talents with user information
    const enrichedTalents = await Promise.all(
      filteredTalents.map(async (talent: any) => {
        if (talent.userId) {
          try {
            const { data: { user } } = await supabase.auth.admin.getUserById(talent.userId);
            if (user) {
              return {
                ...talent,
                userEmail: user.email,
                companyEmailVerified: user.user_metadata?.companyEmailVerified || false,
              };
            }
          } catch (error) {
            console.log(`Error fetching user info for talent ${talent.id}: ${error}`);
          }
        }
        return talent;
      })
    );

    return c.json({ talents: enrichedTalents });
  } catch (error) {
    console.log(`Error fetching talents for review: ${error}`);
    return c.json({ error: 'Failed to fetch talents' }, 500);
  }
});

app.post('/make-server-66f4da3b/admin/talents/:id/approve', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || !user.email) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isUserAdmin = await auth.isAdmin(user.email);
    if (!isUserAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const talentId = c.req.param('id');
    const talent = await kv.get(talentId);
    
    if (!talent) {
      return c.json({ error: 'Talent not found' }, 404);
    }

    talent.status = 'approved';
    talent.reviewedAt = new Date().toISOString();
    talent.reviewedBy = user.id;

    await kv.set(talentId, talent);

    return c.json({ success: true, talent });
  } catch (error) {
    console.log(`Error approving talent: ${error}`);
    return c.json({ error: 'Failed to approve talent' }, 500);
  }
});

app.post('/make-server-66f4da3b/admin/talents/:id/reject', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || !user.email) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isUserAdmin = await auth.isAdmin(user.email);
    if (!isUserAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const talentId = c.req.param('id');
    const { rejectionReason } = await c.req.json();
    const talent = await kv.get(talentId);
    
    if (!talent) {
      return c.json({ error: 'Talent not found' }, 404);
    }

    talent.status = 'rejected';
    talent.reviewedAt = new Date().toISOString();
    talent.reviewedBy = user.id;
    talent.rejectionReason = rejectionReason || '经历 / 删除部分过于模糊';

    await kv.set(talentId, talent);

    return c.json({ success: true, talent });
  } catch (error) {
    console.log(`Error rejecting talent: ${error}`);
    return c.json({ error: 'Failed to reject talent' }, 500);
  }
});

// Company email verification routes
app.get('/make-server-66f4da3b/admin/company-emails', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || !user.email) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isUserAdmin = await auth.isAdmin(user.email);
    if (!isUserAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const status = c.req.query('status') || 'pending';
    const applications = await kv.getByPrefix('company-email:');
    
    let filteredApplications = applications;
    if (status !== 'all') {
      filteredApplications = applications.filter((app: any) => app.status === status);
    }

    return c.json({ applications: filteredApplications });
  } catch (error) {
    console.log(`Error fetching company email applications: ${error}`);
    return c.json({ error: 'Failed to fetch applications' }, 500);
  }
});

app.post('/make-server-66f4da3b/admin/company-emails/:id/approve', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || !user.email) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isUserAdmin = await auth.isAdmin(user.email);
    if (!isUserAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const appId = c.req.param('id');
    const application = await kv.get(appId);
    
    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }

    application.status = 'pass';
    application.reviewedAt = new Date().toISOString();
    application.reviewedBy = user.id;

    // Update user's company email status
    const { data: { user: targetUser } } = await supabase.auth.admin.getUserById(application.userId);
    if (targetUser) {
      await supabase.auth.admin.updateUserById(application.userId, {
        user_metadata: {
          ...targetUser.user_metadata,
          companyEmail: application.companyEmail,
          companyEmailVerified: true,
          companyEmailStatus: 'pass',
        },
      });
    }

    await kv.set(appId, application);

    return c.json({ success: true, application });
  } catch (error) {
    console.log(`Error approving company email: ${error}`);
    return c.json({ error: 'Failed to approve company email' }, 500);
  }
});

app.post('/make-server-66f4da3b/admin/company-emails/:id/reject', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || !user.email) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const isUserAdmin = await auth.isAdmin(user.email);
    if (!isUserAdmin) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const appId = c.req.param('id');
    const application = await kv.get(appId);
    
    if (!application) {
      return c.json({ error: 'Application not found' }, 404);
    }

    application.status = 'no';
    application.reviewedAt = new Date().toISOString();
    application.reviewedBy = user.id;
    application.rejectionReason = '未通过：企业邮箱与域名未对应';

    // Update user's company email status
    const { data: { user: targetUser } } = await supabase.auth.admin.getUserById(application.userId);
    if (targetUser) {
      await supabase.auth.admin.updateUserById(application.userId, {
        user_metadata: {
          ...targetUser.user_metadata,
          companyEmailStatus: 'no',
        },
      });
    }

    await kv.set(appId, application);

    return c.json({ success: true, application });
  } catch (error) {
    console.log(`Error rejecting company email: ${error}`);
    return c.json({ error: 'Failed to reject company email' }, 500);
  }
});

app.post('/make-server-66f4da3b/settings/company-email', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { companyEmail } = await c.req.json();
    if (!companyEmail) {
      return c.json({ error: 'Company email is required' }, 400);
    }

    const appId = `company-email:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const application = {
      id: appId,
      userId: user.id,
      userEmail: user.email,
      companyEmail,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await kv.set(appId, application);

    // Update user metadata
    const { data: { user: currentUser } } = await supabase.auth.admin.getUserById(user.id);
    if (currentUser) {
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...currentUser.user_metadata,
          companyEmail,
          companyEmailStatus: 'pending',
        },
      });
    }

    return c.json({ success: true, application });
  } catch (error) {
    console.log(`Error submitting company email application: ${error}`);
    return c.json({ error: 'Failed to submit application' }, 500);
  }
});

// Settings routes
app.get('/make-server-66f4da3b/settings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        avatar: user.user_metadata?.avatar,
        companyEmail: user.user_metadata?.companyEmail,
        companyEmailVerified: user.user_metadata?.companyEmailVerified || false,
        companyEmailStatus: user.user_metadata?.companyEmailStatus || 'no',
      },
    });
  } catch (error) {
    console.log(`Error getting settings: ${error}`);
    return c.json({ error: 'Failed to get settings' }, 500);
  }
});

app.post('/make-server-66f4da3b/settings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, avatar } = await c.req.json();

    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        name: name || user.user_metadata?.name,
        avatar: avatar || user.user_metadata?.avatar,
      },
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating settings: ${error}`);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

Deno.serve(app.fetch);
