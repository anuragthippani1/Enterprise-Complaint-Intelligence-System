import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { Navigation } from "./components/Navigation";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { ComplaintList } from "./pages/ComplaintList";
import { ComplaintDetail } from "./pages/ComplaintDetail";
import { AdminPanel } from "./pages/AdminPanel";
import { Unauthorized } from "./pages/Unauthorized";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes for authenticated users */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <PrivateRoute>
                <ComplaintList />
              </PrivateRoute>
            }
          />
          <Route
            path="/complaints/:id"
            element={
              <PrivateRoute>
                <ComplaintDetail />
              </PrivateRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminPanel />
              </PrivateRoute>
            }
          />

          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
