import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, action } = await request.json();

    // TODO: Connect to Django backend API
    // This is mock implementation for now
    console.log(`User action: ${action} on user ${userId}`);

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}ed user ${userId}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process recommendation feedback" },
      { status: 500 },
    );
  }
}
