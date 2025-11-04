import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createClient } from '../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.email) {
        setIsAdmin(false);
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
        const adminEmails = data.adminEmails || [];
        setIsAdmin(adminEmails.includes(session.user.email));
      } else {
        // 临时解决方案：如果 API 返回 404（Edge Function 未部署），且用户是 admin@admin.com，则允许访问
        if (response.status === 404 && session.user.email === 'admin@admin.com') {
          console.log('AdminRoute: Using fallback for admin@admin.com');
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/jobs" replace />;
  }

  return <>{children}</>;
}

