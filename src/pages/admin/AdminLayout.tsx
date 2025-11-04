import { Outlet, Link, useLocation } from 'react-router-dom';
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
    { path: '/admin/talents', label: '求职审核' },
    { path: '/admin/company-emails', label: '企业邮箱' },
    { path: '/admin/manage', label: '管理员管理' },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-64 shrink-0 border-r border-gray-200">
        <div className="sticky top-0 py-8 px-6">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`py-2 text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'text-[var(--brand)] font-medium'
                    : 'text-gray-600 hover:text-[var(--brand)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 py-2 text-sm text-gray-600 transition-colors hover:text-[var(--brand)]"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 pl-8">
        <div className="py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

