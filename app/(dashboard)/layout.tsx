// app/(dashboard)/layout.tsx
'use client';

import ProtectedRoute from "@/components/auth/ProtectedRoutes";
import { AuthProvider } from "../contexts/AuthContext";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </AuthProvider>
  );
}