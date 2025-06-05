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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigation />
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
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
