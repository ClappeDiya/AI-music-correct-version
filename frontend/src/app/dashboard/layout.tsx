import React from "react";
import AuthCheck from "@/components/auth/AuthCheck";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthCheck />
      {children}
    </>
  );
} 