import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkoutList from './pages/WorkoutList';
import WorkoutForm from './pages/WorkoutForm';
import WorkoutDetail from './pages/WorkoutDetail';
import Exercises from './pages/Exercises';
import ProgressPage from './pages/ProgressPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!token) return <Navigate to="/login" />;
  if (!user?.is_admin) return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="workouts" element={<WorkoutList />} />
        <Route path="workouts/new" element={<WorkoutForm />} />
        <Route path="workouts/:id" element={<WorkoutDetail />} />
        <Route path="workouts/:id/edit" element={<WorkoutForm />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="stats" element={<ProgressPage />} />
        <Route path="admin" element={<AdminRoute><Outlet /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
