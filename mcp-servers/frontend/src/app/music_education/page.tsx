import { Metadata } from "next";
// Import with full path to avoid TypeScript module resolution issues
import MusicEducationClient from "../../app/music_education/client";

export const metadata: Metadata = {
  title: "Music Education",
  description: "Learn music with our comprehensive education platform",
};

export default function MusicEducationPage() {
  return <MusicEducationClient />;
}
