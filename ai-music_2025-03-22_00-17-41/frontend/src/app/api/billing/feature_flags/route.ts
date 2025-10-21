import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { api } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const featureFlags = await api.get<
      Array<{
        id: string;
        name: string;
        is_enabled: boolean;
        created_at: string;
      }>
    >(`/api/billing/feature_flags?user_id=${session.user.id}`);

    return NextResponse.json(featureFlags);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const featureFlag = await api.post<{
      id: string;
      name: string;
      is_enabled: boolean;
      created_at: string;
    }>("/api/billing/feature_flags", {
      ...body,
      user_id: session.user.id,
    });

    return NextResponse.json(featureFlag, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create feature flag" },
      { status: 500 },
    );
  }
}
