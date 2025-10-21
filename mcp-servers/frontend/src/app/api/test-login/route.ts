import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  // Optionally, you can log or verify form data:
  // const email = formData.get('email');
  // const password = formData.get('password');

  // For test purposes, simply redirect to /dashboard
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
