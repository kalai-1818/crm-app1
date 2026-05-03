import React, { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { authService } from "./services/authService.ts";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import MainLayout from "./components/MainLayout.tsx";
import { ToastProvider } from "./components/ui/Toast.tsx";

// Lazy load all pages — loads only when user visits that page
const DashboardPage = lazy(() => import("./pages/DashboardPage.tsx"));
const LeadsPage = lazy(() => import("./pages/LeadsPage.tsx"));
const PipelinePage = lazy(() => import("./pages/PipelinePage.tsx"));
const ProposalsPage = lazy(() => import("./pages/ProposalsPage.tsx"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage.tsx"));
const TasksPage = lazy(() => import("./pages/TasksPage.tsx"));
const ChatPage = lazy(() => import("./pages/ChatPage.tsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.tsx"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = () => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout />;
};

export default function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    authService.waitForAuthReady().then(() => setAuthReady(true));
  }, []);

  if (!authReady) return <PageLoader />;

  return (
    <BrowserRouter>
      <ToastProvider>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  );
}