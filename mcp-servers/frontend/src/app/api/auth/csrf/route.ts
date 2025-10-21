import { NextResponse } from "next/server";

export async function GET() {
  // Removed the external fetch call to Django's /api/csrf-token/
  // Returning a dummy token since NextAuth handles CSRF internally.
  return NextResponse.json({ csrfToken: "dummy-csrf-token" });
}
