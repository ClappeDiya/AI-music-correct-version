import { OverlayList } from "@/components/settings/OverlayList";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function OverlaysPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Behavior Triggered Overlays</h1>
        <Button asChild>
          <Link href="/settings/overlays/new">Create New Overlay</Link>
        </Button>
      </div>
      <OverlayList />
    </div>
  );
}
