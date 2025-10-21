import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const getCsrfToken = async () => {
  const response = await fetch(
    `${process.env.DJANGO_API_URL || "http://localhost:8000"}/api/csrf/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to retrieve CSRF token");
  }

  const data = await response.json();
  return data.csrf_token;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("Attempting authentication...");

          const apiUrl = process.env.DJANGO_API_URL || "http://localhost:8000";
          console.log("Using API URL:", apiUrl);

          const response = await fetch(`${apiUrl}/api/auth/login/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": await getCsrfToken(),
            },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Authentication failed");
          }

          const data = await response.json();
          console.log("Auth response status:", response.status);
          console.log("Auth response data:", data);

          const user = {
            id: data.user.id.toString(),
            email: data.user.email,
            name: data.user.first_name || data.user.email,
            accessToken: data.access,
            refreshToken: data.refresh,
          };

          console.log("Auth successful, returning user:", user);
          return user;
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(
            error instanceof Error ? error.message : "Authentication failed",
          );
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error", // Fix the error page path
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    jwt: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = { id: token.id, name: token.name, email: token.email };
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl + "/dashboard";
    },
  },
  events: {
    signIn: async (message) => {
      console.log("NextAuth signIn event:", message);
    },
    session: async (message) => {
      console.log("NextAuth session event:", message);
    },
    error: async (message) => {
      console.error("NextAuth error:", message);
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
