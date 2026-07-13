import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { StudentProvider } from "./context/StudentContext";
import api from "./services/api";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import ResetPassword from "./components/ResetPassword.jsx";

import StudentDashboard from "./components/student/StudentDashboard.jsx";
import FacultyDashboard from "./components/faculty/FacultyDashboard.jsx";
import CompanyDashboard from "./components/company/CompanyDashboard.jsx";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import LoadingSpinner from "./components/admin/shared/LoadingSpinner.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { SocketProvider } from "./context/SocketContext";

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------- SESSION PERSISTENCE ON REFRESH ---------- */
  useEffect(() => {
    // Don't check auth on public pages — prevents infinite loop on /login
    const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isPublicPage = publicPaths.some(p => location.pathname.startsWith(p));

    if (isPublicPage) {
      setIsLoading(false);
      return; // ← exit early, don't call /auth/me
    }

    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        const normalizedRole = res.data.user?.role?.toLowerCase?.() || res.data.user.role;
        const normalizedUser = { ...res.data.user, role: normalizedRole };
        setUser(normalizedUser);
        navigate(`/${normalizedRole}`);
      } catch (err) {
        // Expected on server restart or expired session
        // Silently redirect to login — no console error needed
        setUser(null);
        // Navigation handled by interceptor
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [location.pathname]);

  /* ---------- AUTH HANDLERS ---------- */
  const handleLoginSuccess = (userData) => {
    const normalizedRole = userData?.role?.toLowerCase?.() || userData.role;
    const normalizedUser = { ...userData, role: normalizedRole };
    setUser(normalizedUser);
    // Redirect to the intended page or their dashboard
    const from = location.state?.from?.pathname || `/${normalizedRole}`;
    navigate(from, { replace: true });
  };

  const handleAuthSwitch = (view) => {
    if (view === "register") {
      navigate("/register");
    } else if (view === "forgot") {
      navigate("/forgot-password");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed at server:", err);
    } finally {
      setUser(null);
      // Clear specific legacy local storage entries if they exist
      localStorage.removeItem("studentProfile");
      localStorage.removeItem("applications");
      localStorage.removeItem("notifications");
      localStorage.removeItem("projects");
      localStorage.removeItem("roadmap");
      localStorage.removeItem("prefillProfile");
      sessionStorage.clear(); // Clear any non-auth cache too to be safe
      navigate("/login", { replace: true });
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Verifying Identity..." />;
  }

  return (
    <SocketProvider user={user}>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!user ? <Login onLoginSuccess={handleLoginSuccess} onSwitch={handleAuthSwitch} /> : <Navigate to={`/${user.role}`} replace />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register onSwitch={(view) => view === "login" ? navigate("/login") : view === "forgot" ? navigate("/forgot-password") : null} onRegisterSuccess={handleLoginSuccess} /> : <Navigate to={`/${user.role}`} replace />} 
        />
        <Route path="/forgot-password" element={<ForgotPassword onSwitch={() => navigate("/login")} />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Role-Based Protected Routes */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRole="student" userRole={user?.role}>
            <StudentProvider>
              <StudentDashboard user={user} onLogout={handleLogout} />
            </StudentProvider>
          </ProtectedRoute>
        } />

        <Route path="/company/*" element={
          <ProtectedRoute allowedRole="company" userRole={user?.role}>
            <CompanyDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/faculty/*" element={
          <ProtectedRoute allowedRole="faculty" userRole={user?.role}>
            <FacultyDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/Admin" element={<Navigate to="/admin" replace />} />
        <Route path="/Admin/*" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin" userRole={user?.role}>
            <AdminDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRole="admin" userRole={user?.role}>
            <AdminDashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* Catch-all Redirects */}
        <Route path="/" element={<Navigate to={user ? `/${user.role?.toLowerCase()}` : "/login"} replace />} />
        <Route path="*" element={<Navigate to={user ? `/${user.role?.toLowerCase()}` : "/login"} replace />} />
      </Routes>
    </SocketProvider>
  );
};

export default App;
