import { Metadata } from "next";
import { AIMusicClientLayout } from "./components/AIMusicClientLayout";

export const metadata: Metadata = {
  title: "AI Music Generation | Create unique music with AI",
  description:
    "Generate unique, personalized music using AI. Express your creativity and bring your musical ideas to life.",
  keywords: [
    "AI music",
    "music generation",
    "artificial intelligence",
    "creative tools",
    "music composition",
    "AI composer",
  ],
};

interface AIMusicLayoutProps {
  children: React.ReactNode;
}

export default function AIMusicLayout({ children }: AIMusicLayoutProps) {
  return <AIMusicClientLayout>{children}</AIMusicClientLayout>;
}
