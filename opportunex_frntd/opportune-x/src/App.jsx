import React, { useState, useEffect } from "react";
import { StudentProvider } from "./context/StudentContext";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";

import StudentDashboard from "./components/student/StudentDashboard.jsx";
import FacultyDashboard from "./components/faculty/FacultyDashboard.jsx";
import CompanyDashboard from "./components/company/CompanyDashboard.jsx";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import LoadingSpinner from "./components/admin/shared/LoadingSpinner.jsx";

const App = () => {
  // Triggering refresh
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [collegeId, setCollegeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authPage, setAuthPage] = useState("login"); // login | register | forgot

  /* ---------- CHECK SESSION ON LOAD ---------- */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const savedRole = sessionStorage.getItem("role");
    const savedCollegeId = sessionStorage.getItem("collegeId");

    if (token && savedRole && savedCollegeId) {
      setIsAuthenticated(true);
      setRole(savedRole.toLowerCase());
      setCollegeId(savedCollegeId);
    } else {
      setIsAuthenticated(false);
      setRole(null);
      setCollegeId(null);
    }
    setIsLoading(false);
  }, []);

  /* ---------- AUTH HANDLERS ---------- */
  const handleLoginSuccess = (token, userRole, userCollegeId) => {
    if (!token || !userRole || !userCollegeId) return;

    const normalizedRole = userRole.toLowerCase();

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("role", normalizedRole);
    sessionStorage.setItem("collegeId", userCollegeId);

    setIsAuthenticated(true);
    setRole(normalizedRole);
    setCollegeId(userCollegeId);
    setAuthPage("login");
  };

  const handleLogout = () => {
    /* ---------- CLEAR SESSION ---------- */
    sessionStorage.clear();

    /* ---------- CLEAR LOCAL STUDENT DATA ---------- */
    localStorage.removeItem("studentProfile");
    localStorage.removeItem("applications");
    localStorage.removeItem("notifications");
    localStorage.removeItem("projects");
    localStorage.removeItem("roadmap");
    localStorage.removeItem("prefillProfile");

    setIsAuthenticated(false);
    setRole(null);
    setCollegeId(null);
    setAuthPage("login");
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="OpportuneX Secure Sync..." />;
  }

  /* ---------- AUTH SCREENS ---------- */
  if (!isAuthenticated) {
    if (authPage === "login") {
      return (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitch={setAuthPage}
        />
      );
    }

    if (authPage === "register") {
      return (
        <Register
          onSwitch={setAuthPage}
          onRegisterSuccess={handleLoginSuccess}
        />
      );
    }

    if (authPage === "forgot") {
      return <ForgotPassword onSwitch={setAuthPage} />;
    }
  }

  try {
    /* ---------- ROLE-BASED DASHBOARD ---------- */
    switch (role) {
      case "student":
        return (
          <StudentProvider>
            <StudentDashboard onLogout={handleLogout} />
          </StudentProvider>
        );

      case "faculty":
        return <FacultyDashboard onLogout={handleLogout} />;

      case "company":
        return <CompanyDashboard onLogout={handleLogout} />;

      case "admin":
        return <AdminDashboard onLogout={handleLogout} />;

      default:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
            <h1 className="text-3xl font-black text-gray-900 mb-4">Identity Sync Error</h1>
            <p className="text-red-500 font-bold mb-8 italic">
              Received Invalid System Role: "{role}"
            </p>
            <div className="space-x-4">
              <button
                onClick={handleLogout}
                className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
              >
                Reset Session
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 border-2 border-gray-900 rounded-2xl font-black hover:bg-gray-50 transition-colors"
              >
                Force Reload
              </button>
            </div>
          </div>
        );
    }
  } catch (err) {
    console.error("CRITICAL RENDER ERROR:", err);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-red-50">
        <h1 className="text-2xl font-bold text-red-700">Dashboard Initialization Failed</h1>
        <p className="mt-2 text-red-600 font-mono text-sm max-w-lg bg-white p-4 rounded-lg border border-red-200 mt-6">
          {err.message}
        </p>
        <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-red-600 text-white rounded-lg">Retry Sync</button>
      </div>
    );
  }
};

export default App;
