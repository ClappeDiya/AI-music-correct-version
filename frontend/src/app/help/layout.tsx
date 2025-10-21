import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center | AI Music',
  description: 'Get assistance, learn about features, and find answers to common questions about AI Music.',
};

interface HelpLayoutProps {
  children: ReactNode;
}

export default function HelpLayout({ children }: HelpLayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 