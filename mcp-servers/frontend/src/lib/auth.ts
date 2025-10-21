import { cookies } from "next/headers";

/**
 * Get the authentication token
 */
export async function getToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) {
    throw new Error("No authentication token available");
  }
  return token;
}

/**
 * Verify the user with our backend
 */
export async function verifyWithBackend() {
  try {
    const token = await getToken();
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("No user found");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-token/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Important for cookies
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to authenticate with backend");
    }

    return await response.json();
  } catch (error) {
    console.error("Backend verification failed:", error);
    throw error;
  }
}

/**
 * Check if user is authenticated with backend
 */
export async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return false;
  try {
    // Verify with backend
    const backendAuth = await verifyWithBackend();
    return Boolean(backendAuth?.authenticated);
  } catch (error) {
    console.error("Auth check failed:", error);
    return false;
  }
}

/**
 * Get the current authenticated user data
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  
  if (!token) {
    return null;
  }

  try {
    // Properly decode the JWT token to get user information
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error("Invalid token format");
      return null;
    }

    // Decode the payload part of the JWT
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    
    // Extract user information from the payload
    // Adjust these fields based on your actual token structure
    const user = payload.user || payload;

    return {
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User',
      email: user.email,
      id: user.id,
      ...user
    };
  } catch (error) {
    console.error("Error decoding user token:", error);
    return null;
  }
}
