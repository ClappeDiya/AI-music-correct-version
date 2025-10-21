"use client";

import { AuthProvider as DjangoAuthProvider } from "@/contexts/AuthContext";

// Transitioning from Clerk to Django centralized authentication
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <DjangoAuthProvider>
      {children}
    </DjangoAuthProvider>
  );
}
