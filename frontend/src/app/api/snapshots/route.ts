import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { api } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await req.json();

  try {
    const snapshot = await api.post<{
      id: string;
      name: string;
      description: string;
      created_at: string;
    }>("/api/snapshots", {
      user_id: session.user.id,
      name,
      description,
      data: {}, // Will be handled by Django backend
    });

    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create snapshot" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshots = await api.get<
      Array<{
        id: string;
        name: string;
        description: string;
        created_at: string;
      }>
    >(`/api/snapshots?user_id=${session.user.id}`);

    return NextResponse.json(snapshots);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch snapshots" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  try {
    const response = await api.put<{ success: boolean }>(
      `/api/snapshots/${id}/restore`,
      { user_id: session.user.id },
    );

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to restore snapshot" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  try {
    await api.delete(`/api/snapshots/${id}?user_id=${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete snapshot" },
      { status: 500 },
    );
  }
}
