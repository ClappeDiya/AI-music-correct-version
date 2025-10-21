import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UserIdentityBridge } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bridges = await UserIdentityBridge.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        provider: true,
        type: true,
        isEnabled: true,
        config: true,
        createdAt: true,
      },
    });
    return NextResponse.json(bridges);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch identity bridges" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, provider } = await request.json();

  try {
    const bridge = await UserIdentityBridge.create({
      data: {
        userId: session.user.id,
        type,
        provider,
        isEnabled: false,
        config: {},
      },
    });
    return NextResponse.json(bridge);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create identity bridge" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, enable } = await request.json();

  try {
    const bridge = await UserIdentityBridge.update({
      where: { id, userId: session.user.id },
      data: { isEnabled: enable },
    });
    return NextResponse.json(bridge);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update identity bridge" },
      { status: 500 },
    );
  }
}
