"use client";

import React from 'react';
import { ProjectProvider } from '@/contexts/ProjectContext';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <div className="min-h-screen">
        {children}
      </div>
    </ProjectProvider>
  );
} 