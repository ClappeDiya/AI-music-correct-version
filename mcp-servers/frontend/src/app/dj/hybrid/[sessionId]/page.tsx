import { HybridDJ } from "@/components/HybridDJ";
import { Metadata } from "next";

interface HybridDJPageProps {
  params: {
    sessionId: string;
  };
}

export const metadata: Metadata = {
  title: "Hybrid DJ Experience | AI Music",
  description: "Blend human expertise with AI assistance for the perfect mix",
};

export default function HybridDJPage({ params }: HybridDJPageProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <HybridDJ sessionId={params.sessionId} />
    </div>
  );
}
