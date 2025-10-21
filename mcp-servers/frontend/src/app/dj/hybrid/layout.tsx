import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Hybrid DJ Experience | AI Music",
    template: "%s | Hybrid DJ Experience | AI Music",
  },
  description: "Blend human expertise with AI assistance for the perfect mix",
};

export default function HybridDJLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Hybrid DJ</h2>
      </div>
      {children}
    </div>
  );
}
