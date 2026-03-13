import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import PostDetailPage from "./pages/PostDetailPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PostFormPage from "./pages/PostFormPage";

export default function App() {
  const [role, setRole] = useState("user");

  const isAdmin = useMemo(() => role === "admin", [role]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar role={role} onRoleChange={setRole} />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />

          <Route
            path="/admin"
            element={
              isAdmin ? <AdminDashboardPage /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/admin/create"
            element={
              isAdmin ? (
                <PostFormPage mode="create" />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin/edit/:id"
            element={
              isAdmin ? (
                <PostFormPage mode="edit" />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}
