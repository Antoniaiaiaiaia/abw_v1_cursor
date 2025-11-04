import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { LogOut } from 'lucide-react';
import { createClient } from '../../utils/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/jobs');
  };

  const navItems = [
    { path: '/admin/jobs', label: '岗位审核' },
    { path: '/admin/talents', label: '求职信息审核' },
    { path: '/admin/company-emails', label: '企业邮箱认证审核' },
    { path: '/admin/manage', label: '管理员管理' },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-gray-200 bg-gray-50">
        <div className="sticky top-0 space-y-4 p-6">
          <div>
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block rounded-lg px-4 py-2 transition-colors ${
                  location.pathname === item.path
                    ? 'bg-gray-200 font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

