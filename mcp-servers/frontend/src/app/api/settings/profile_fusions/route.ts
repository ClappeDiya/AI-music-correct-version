import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createFusion } from "@/lib/fusion";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { source_profiles, fusion_parameters } = await req.json();

    const result = await createFusion({
      userId: session.user.id,
      sourceProfileIds: source_profiles,
      parameters: fusion_parameters,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create fusion" },
      { status: 500 },
    );
  }
}
