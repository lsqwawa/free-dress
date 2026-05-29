import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import AuthLayout from '@/layouts/AuthLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import UsersPage from '@/pages/users';
import UserDetailPage from '@/pages/users/detail';
import ClothesPage from '@/pages/clothes';
import OutfitsPage from '@/pages/outfits';
import TryOnPage from '@/pages/tryon';
import MembershipPage from '@/pages/membership';
import SystemPage from '@/pages/system';
import NotFoundPage from '@/pages/NotFound';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Admin (protected) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="clothes" element={<ClothesPage />} />
          <Route path="outfits" element={<OutfitsPage />} />
          <Route path="tryon" element={<TryOnPage />} />
          <Route path="membership" element={<MembershipPage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
