import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { authService } from "./services/authService.ts";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import LeadsPage from "./pages/LeadsPage.tsx";
import PipelinePage from "./pages/PipelinePage.tsx";
import ProposalsPage from "./pages/ProposalsPage.tsx";
import ProjectsPage from "./pages/ProjectsPage.tsx";
import TasksPage from "./pages/TasksPage.tsx";
import ChatPage from "./pages/ChatPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import ChatPanel from "./components/ChatPanel.tsx";
import MainLayout from "./components/MainLayout.tsx";
import { ToastProvider } from "./components/ui/Toast.tsx";

const ProtectedRoute = () => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout />;
};

export default function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Wait for Firebase to restore auth state before making routing decisions.
    // Without this, isAuthenticated() returns false on page refresh and users
    // get bounced to /login even when they have a valid session.
    authService.waitForAuthReady().then(() => setAuthReady(true));
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/proposals" element={<ProposalsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

