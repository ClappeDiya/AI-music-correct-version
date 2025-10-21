import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HybridDJLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-6 space-y-6">
          <Skeleton className="w-full h-[600px] rounded-lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
