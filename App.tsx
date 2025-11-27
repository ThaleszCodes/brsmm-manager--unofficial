import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';
import Orders from './pages/Orders';
import Services from './pages/Services';
import Copies from './pages/Copies';
import Settings from './pages/Settings';
import { getSession, getOrders, updateOrderStatus } from './services/storage';
import { checkOrderStatus } from './services/brsmm';

// Protected Route Wrapper
interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuth = getSession();
  return isAuth ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {

  // CRON JOB SIMULATION
  // Runs every 5 minutes (300000ms) to check pending orders
  useEffect(() => {
    const runCron = async () => {
        if (!getSession()) return;
        
        console.log("Running Status Update Cron...");
        try {
            const orders = await getOrders();
            // Check pending or processing
            const activeOrders = orders.filter(o => ['pending', 'processing', 'in_progress'].includes(o.status));

            for (const order of activeOrders) {
                try {
                    const res = await checkOrderStatus(order.brsmm_order_id);
                    if (res.status !== order.status) {
                        await updateOrderStatus(order.id, {
                            status: res.status as any,
                            remains: res.remains,
                            start_count: res.start_count
                        });
                    }
                } catch (e) {
                    console.error(`Cron error for order ${order.id}`, e);
                }
            }
        } catch (error) {
            console.error("Cron failed to fetch orders", error);
        }
    };

    const intervalId = setInterval(runCron, 300000); // 5 minutes
    
    // Initial run after 5 seconds to update fresh data
    const initialTimeout = setTimeout(runCron, 5000);

    return () => {
        clearInterval(intervalId);
        clearTimeout(initialTimeout);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/new-order" element={<PrivateRoute><NewOrder /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/services" element={<PrivateRoute><Services /></PrivateRoute>} />
        <Route path="/copies" element={<PrivateRoute><Copies /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;