import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/security";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      roles: Role[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    roles: Role[];
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles: Role[];
    accessToken?: string;
  }
}
