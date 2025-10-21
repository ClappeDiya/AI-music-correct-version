import { FeatureFlagList } from "@/components/billing/FeatureFlagList";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function FeatureFlagsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Feature Flags</h1>
        <Button asChild>
          <Link href="/billing/feature_flags/new">Create Feature Flag</Link>
        </Button>
      </div>

      <FeatureFlagList />
    </div>
  );
}
