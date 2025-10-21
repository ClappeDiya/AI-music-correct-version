import { NextResponse } from "next/server";

// This route previously handled Clerk webhooks, but is now deprecated as we've moved to custom auth
export async function POST(req: Request) {
  console.warn("Clerk webhook endpoint is deprecated - using custom authentication system now");
  
  // Return 200 response to prevent errors for any legacy webhook calls
  return NextResponse.json(
    { status: "deprecated", message: "This endpoint is deprecated. Using custom authentication now." },
    { status: 200 }
  );
}
