import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewPostPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" asChild>
          <Link href="/social" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feed
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="space-y-4">
          <div>
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              className="min-h-[200px]"
              placeholder="Share your thoughts..."
            />
          </div>

          <div className="flex justify-end">
            <Button>Post</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
