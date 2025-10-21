import { NextResponse } from "next/server";
import axios from "axios";

const djangoApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DJANGO_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function GET() {
  try {
    const response = await djangoApi.get("/translations/");
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch translations" },
      { status: 500 },
    );
  }
}
