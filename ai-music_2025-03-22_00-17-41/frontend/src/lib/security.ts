import type { Session } from "next-auth";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  PREMIUM: "premium",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function hasRole(session: Session | null, role: Role): boolean {
  if (!session?.user?.roles) {
    return false;
  }
  return session.user.roles.includes(role);
}

export function isAdmin(session: Session | null): boolean {
  return hasRole(session, ROLES.ADMIN);
}

export function isPremiumUser(session: Session | null): boolean {
  return hasRole(session, ROLES.PREMIUM);
}

export function canAccessFeature(
  session: Session | null,
  feature: string,
  requiredRoles: Role[] = [],
): boolean {
  if (!session) {
    return false;
  }

  // Admins have access to all features
  if (isAdmin(session)) {
    return true;
  }

  // If no specific roles are required, basic authenticated access is enough
  if (requiredRoles.length === 0) {
    return true;
  }

  // Check if user has any of the required roles
  return requiredRoles.some((role) => hasRole(session, role));
}

export function validatePermissions(
  session: Session | null,
  requiredRoles: Role[],
  errorMessage = "Insufficient permissions",
): void {
  if (!session) {
    throw new Error("Unauthorized");
  }

  const hasPermission = requiredRoles.some((role) => hasRole(session, role));
  if (!hasPermission) {
    throw new Error(errorMessage);
  }
}

export function getAccessLevel(session: Session | null): {
  isAdmin: boolean;
  isPremium: boolean;
  roles: Role[];
} {
  if (!session) {
    return {
      isAdmin: false,
      isPremium: false,
      roles: [],
    };
  }

  return {
    isAdmin: isAdmin(session),
    isPremium: isPremiumUser(session),
    roles: (session.user.roles || []) as Role[],
  };
}

export function sanitizeInput(input: string): string {
  // Remove any potentially dangerous characters or patterns
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .trim();
}

export function validateInput(
  input: string,
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    errorMessage?: string;
  } = {},
): boolean {
  const {
    minLength = 0,
    maxLength = Infinity,
    pattern,
    errorMessage = "Invalid input",
  } = options;

  if (input.length < minLength || input.length > maxLength) {
    throw new Error(errorMessage);
  }

  if (pattern && !pattern.test(input)) {
    throw new Error(errorMessage);
  }

  return true;
}

/**
 * Logs user actions for security auditing purposes
 * @param eventType The type of event to log
 * @param userRole The role of the user performing the action
 * @param metadata Additional data about the event
 * @returns Promise that resolves when the event is logged
 */
export async function logAuditEvent(
  eventType: string,
  userRole: string,
  metadata: Record<string, any>
): Promise<void> {
  // In a production environment, this would send the audit data to a secure logging service
  console.log(`AUDIT: ${eventType}`, { userRole, timestamp: new Date().toISOString(), metadata });
  
  // TODO: Implement actual audit logging service integration
  return Promise.resolve();
}
