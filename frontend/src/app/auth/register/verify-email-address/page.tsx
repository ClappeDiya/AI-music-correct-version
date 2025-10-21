"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function VerifyEmailAddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect_url") || "/dashboard";

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectUrl);
    }, 3000);
    return () => clearTimeout(timer);
  }, [router, redirectUrl]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Verifying your email and syncing your account, please wait...</p>
    </div>
  );
}
