import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copyright-Free Music",
  description: "Browse and manage copyright-free music tracks",
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Add any module-specific layout components here */}
      <main>{children}</main>
    </div>
  );
}
