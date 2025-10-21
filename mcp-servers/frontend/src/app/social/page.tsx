import { Suspense } from "react";
import Feed from "./components/Feed";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function SocialPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Community Feed</h1>
        <Button asChild>
          <Link href="/social/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading feed...</div>}>
        <Feed />
      </Suspense>
    </div>
  );
}
