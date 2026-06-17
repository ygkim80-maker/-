import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './store/auth';
import { api } from './hooks/api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import JobForm from './pages/JobForm';
import Applications from './pages/Applications';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';

function Protected({ children }: { children: JSX.Element }) {
  const token = useAuth((s) => s.token);
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  const { token, user, loadUser, logout } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (token && !user) {
      api
        .get('/auth/me')
        .then((res) => loadUser(res.data))
        .catch(() => logout())
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-400">
        로딩 중...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/jobs/new" element={<JobForm />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
