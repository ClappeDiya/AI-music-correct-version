"use client";

import { MusicEducationAuthProvider } from "@/contexts/MusicEducationAuthContext";

export default function MusicEducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MusicEducationAuthProvider>
      {children}
    </MusicEducationAuthProvider>
  );
}
