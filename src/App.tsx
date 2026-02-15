import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Operations from './pages/Operations';
import SegmentOperations from './pages/SegmentOperations';
import ValidationOperations from './pages/ValidationOperations';
import Cautions from './pages/Cautions';
import Stocks from './pages/Stocks';
import CashFlow from './pages/CashFlow';
import FinancialOperations from './pages/FinancialOperations';
import Partners from './pages/Partners';
import Contracts from './pages/Contracts';
import Systems from './pages/Systems';
import Airline from './pages/Airlines';
import Destinations from './pages/Destinations';
import Services from './pages/Services';
import Audit from './pages/Audits';
import ChangeLogs from './pages/ChangeLogs';
import Synchronisations from './pages/Synchronisation';
import Profile from './pages/Profile';
import { PublicRoute } from './auth/PublicRoute';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { useEffect } from 'react';
import { supabaseSyncService } from './services/SupabaseSyncService';


function App() {

  useEffect(() => {
    const interval = setInterval(() => {
      supabaseSyncService.fullSync();
    }, 1000 * 60 * 2); // toutes les 2 min

    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Login accessible uniquement si pas encore authentifié */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Routes protégées */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/operation_sergments" element={<SegmentOperations />} />
          <Route path="/validation_operations" element={<ValidationOperations />} />
          <Route path="/cautions" element={<Cautions />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/cash_flow" element={<CashFlow />} />
          <Route path="/financial_operations" element={<FinancialOperations />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/contract" element={<Contracts />} />
          <Route path="/systems" element={<Systems />} />
          <Route path="/airlines" element={<Airline />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/services" element={<Services />} />
          <Route path="/audits" element={<Audit />} />
          <Route path="/change_logs" element={<ChangeLogs />} />
          <Route path="/synchronisations" element={<Synchronisations />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;