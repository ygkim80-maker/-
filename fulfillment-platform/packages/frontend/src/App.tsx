import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './store/auth';
import { api } from './hooks/api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inbound from './pages/wms/Inbound';
import Receiving from './pages/wms/Receiving';
import Inventory from './pages/wms/Inventory';
import Locations from './pages/wms/Locations';
import Items from './pages/wms/Items';
import CycleCount from './pages/wms/CycleCount';
import Outbound from './pages/wms/Outbound';
import Picking from './pages/wms/Picking';
import Orders from './pages/oms/Orders';
import OrderDetail from './pages/oms/OrderDetail';
import Channels from './pages/oms/Channels';
import Shipments from './pages/tms/Shipments';
import Carriers from './pages/tms/Carriers';
import DockSchedule from './pages/yms/DockSchedule';
import Workers from './pages/lms/Workers';
import Tasks from './pages/lms/Tasks';
import Productivity from './pages/lms/Productivity';
import ShipperPortal from './pages/shipper/ShipperPortal';
import AIAssistant from './pages/ai/AIAssistant';
import Reports from './pages/reports/Reports';

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
    return <div className="h-screen flex items-center justify-center text-gray-400">로딩 중...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/wms/inbound" element={<Inbound />} />
        <Route path="/wms/receiving" element={<Receiving />} />
        <Route path="/wms/inventory" element={<Inventory />} />
        <Route path="/wms/locations" element={<Locations />} />
        <Route path="/wms/items" element={<Items />} />
        <Route path="/wms/cycle-count" element={<CycleCount />} />
        <Route path="/wms/outbound" element={<Outbound />} />
        <Route path="/wms/picking" element={<Picking />} />
        <Route path="/oms/orders" element={<Orders />} />
        <Route path="/oms/orders/:id" element={<OrderDetail />} />
        <Route path="/oms/channels" element={<Channels />} />
        <Route path="/tms/shipments" element={<Shipments />} />
        <Route path="/tms/carriers" element={<Carriers />} />
        <Route path="/yms/dock" element={<DockSchedule />} />
        <Route path="/lms/workers" element={<Workers />} />
        <Route path="/lms/tasks" element={<Tasks />} />
        <Route path="/lms/productivity" element={<Productivity />} />
        <Route path="/shipper" element={<ShipperPortal />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
