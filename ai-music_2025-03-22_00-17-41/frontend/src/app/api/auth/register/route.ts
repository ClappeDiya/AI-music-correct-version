import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Log the registration attempt
    console.log("Registration attempt:", { ...body, password: "[REDACTED]" });

    // Format the data for Django backend
    const formattedData = {
      email: body.email?.trim(),
      password: body.password,
      first_name: body.firstName?.trim(),
      last_name: body.lastName?.trim(),
      username: body.email?.trim(), // Django requires a username, using email as username
    };

    // Validate required fields
    if (
      !formattedData.email ||
      !formattedData.password ||
      !formattedData.first_name ||
      !formattedData.last_name
    ) {
      return NextResponse.json(
        {
          error: "Please provide all required fields",
          fields: {
            email: !formattedData.email ? "Email is required" : null,
            password: !formattedData.password ? "Password is required" : null,
            first_name: !formattedData.first_name
              ? "First name is required"
              : null,
            last_name: !formattedData.last_name
              ? "Last name is required"
              : null,
          },
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/v1/auth/register/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formattedData),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Registration error:", data);

      // Handle specific error cases
      if (response.status === 400) {
        return NextResponse.json(
          {
            error: data.error || "Invalid registration data",
            fields: data.fields || {},
          },
          { status: 400 },
        );
      }

      if (response.status === 409) {
        return NextResponse.json(
          {
            error: "User with this email already exists",
            fields: data.fields || {},
          },
          { status: 409 },
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          {
            error:
              "Registration service is not available. Please try again later.",
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          error: data.error || "Registration failed. Please try again.",
        },
        { status: response.status },
      );
    }

    // Return the tokens and user data
    return NextResponse.json(
      {
        tokens: data.tokens,
        user: data.user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    );
  }
}
