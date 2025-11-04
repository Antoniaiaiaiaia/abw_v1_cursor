import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import { JobsList } from '../components/JobsList';
import { TalentsList } from '../components/TalentsList';
import { CreateJobForm } from '../components/CreateJobForm';
import { CreateProfileForm } from '../components/CreateProfileForm';
import JobDetail from '../pages/JobDetail';
import TalentDetail from '../pages/TalentDetail';
import Settings from '../pages/Settings';
import AdminLayout from '../pages/admin/AdminLayout';
import JobReview from '../pages/admin/JobReview';
import TalentReview from '../pages/admin/TalentReview';
import CompanyEmailReview from '../pages/admin/CompanyEmailReview';
import AdminManage from '../pages/admin/AdminManage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminRoute from '../components/auth/AdminRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/jobs" replace />,
      },
      {
        path: 'jobs',
        element: <JobsList />,
      },
      {
        path: 'jobs/:id',
        element: <JobDetail />,
      },
      {
        path: 'talents',
        element: <TalentsList />,
      },
      {
        path: 'talents/:id',
        element: <TalentDetail />,
      },
      {
        path: 'create-job',
        element: (
          <ProtectedRoute>
            <CreateJobForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'create-profile',
        element: (
          <ProtectedRoute>
            <CreateProfileForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/admin/jobs" replace />,
          },
          {
            path: 'jobs',
            element: <JobReview />,
          },
          {
            path: 'talents',
            element: <TalentReview />,
          },
          {
            path: 'company-emails',
            element: <CompanyEmailReview />,
          },
          {
            path: 'manage',
            element: <AdminManage />,
          },
        ],
      },
    ],
  },
]);

