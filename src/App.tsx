import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ZoneManagement from "./pages/ZoneManagement";
import PlateLookup from "./pages/PlateLookup";
import ParkingHistory from "./pages/ParkingHistory";
import NotFound from "./pages/NotFound";
import FiscalDashboard from "./pages/fiscal/FiscalDashboard";
import NotificationLookup from "./pages/NotificationLookup";
import NotificationRecognition from "./pages/NotificationRecognition";
import NotificationPayment from "./pages/NotificationPayment";
import FiscalSettlements from "./pages/fiscal/FiscalSettlements";
import AdminSettlementReview from "./pages/admin/AdminSettlementReview";
import AdminCreateFiscal from "./pages/admin/AdminCreateFiscal";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Public routes */}
            <Route path="/notificacao" element={<NotificationLookup />} />
            <Route path="/notificacao/:numero" element={<NotificationLookup />} />
            <Route path="/notificacao/:numero/reconhecer" element={<NotificationRecognition />} />
            <Route path="/notificacao/:numero/pagamento" element={<NotificationPayment />} />
            
            {/* Admin routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/zones"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ZoneManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plate-lookup"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PlateLookup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ParkingHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settlements"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettlementReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fiscals/new"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCreateFiscal />
                </ProtectedRoute>
              }
            />
            
            {/* Fiscal routes */}
            <Route
              path="/fiscal/dashboard"
              element={
                <ProtectedRoute allowedRoles={['fiscal', 'admin']}>
                  <FiscalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fiscal/settlements"
              element={
                <ProtectedRoute allowedRoles={['fiscal', 'admin']}>
                  <FiscalSettlements />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
