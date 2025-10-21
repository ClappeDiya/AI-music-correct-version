import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { api } from "@/lib/db";
import { InstallmentPlanSchema } from "@/types/billing";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = InstallmentPlanSchema.parse(body);

    const installmentPlan = await api.post<{
      id: string;
      name: string;
      amount: number;
      frequency: string;
      start_date: string;
      end_date: string;
      user_id: string;
    }>("/api/billing/installment-plans", {
      ...validatedData,
      user_id: session.user.id,
    });

    return NextResponse.json(installmentPlan);
  } catch (error) {
    console.error("[INSTALLMENT_PLANS_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const installmentPlans = await api.get<
      Array<{
        id: string;
        name: string;
        amount: number;
        frequency: string;
        start_date: string;
        end_date: string;
      }>
    >(`/api/billing/installment-plans?user_id=${session.user.id}`);

    return NextResponse.json(installmentPlans);
  } catch (error) {
    console.error("[INSTALLMENT_PLANS_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
