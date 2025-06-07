import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
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
import Onboarding from "./pages/Onboarding";
import { Home } from "./pages/Home";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes for authenticated users */}
            <Route
              path="/dashboard"
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
                <PrivateRoute adminOnly>
                  <AdminPanel />
                </PrivateRoute>
              }
            />

            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
