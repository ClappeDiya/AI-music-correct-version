import { logAuditEvent } from "@/lib/security";

interface DunningConfig {
  maxAttempts: number;
  retryIntervals: number[]; // Days between attempts
  notificationChannels: ("email" | "sms" | "in_app")[];
}

interface DunningAttempt {
  attemptNumber: number;
  paymentIntentId: string;
  failureReason: string;
  nextAttemptDate: string;
}

// Default dunning configuration
const DEFAULT_CONFIG: DunningConfig = {
  maxAttempts: 3,
  retryIntervals: [3, 7, 14], // Retry after 3 days, then 7 days, then 14 days
  notificationChannels: ["email", "in_app"],
};

// Dunning status tracking
export interface DunningStatus {
  planId: string;
  userId: string;
  attempts: DunningAttempt[];
  status: "active" | "resolved" | "failed";
  lastAttemptDate: string;
  nextAttemptDate: string | null;
}

/**
 * Initialize dunning process for a failed payment
 */
export async function initiateDunning(
  planId: string,
  userId: string,
  paymentIntentId: string,
  failureReason: string,
): Promise<DunningStatus> {
  try {
    // Log dunning initiation
    await logAuditEvent("dunning_initiated", userId, {
      plan_id: planId,
      payment_intent_id: paymentIntentId,
      failure_reason: failureReason,
    });

    const nextAttemptDate = calculateNextAttemptDate(0);

    const dunningStatus: DunningStatus = {
      planId,
      userId,
      attempts: [
        {
          attemptNumber: 1,
          paymentIntentId,
          failureReason,
          nextAttemptDate: nextAttemptDate.toISOString(),
        },
      ],
      status: "active",
      lastAttemptDate: new Date().toISOString(),
      nextAttemptDate: nextAttemptDate.toISOString(),
    };

    // Store dunning status
    await storeDunningStatus(dunningStatus);

    // Schedule notifications
    await scheduleNotifications(dunningStatus);

    return dunningStatus;
  } catch (error) {
    console.error("Error initiating dunning:", error);
    throw error;
  }
}

/**
 * Process a dunning retry attempt
 */
export async function processDunningRetry(
  dunningStatus: DunningStatus,
): Promise<DunningStatus> {
  try {
    const currentAttempt = dunningStatus.attempts.length;

    if (currentAttempt >= DEFAULT_CONFIG.maxAttempts) {
      // Max attempts reached, mark as failed
      dunningStatus.status = "failed";
      dunningStatus.nextAttemptDate = null;

      await logAuditEvent(
        "dunning_max_attempts_reached",
        dunningStatus.userId,
        {
          plan_id: dunningStatus.planId,
          attempts: currentAttempt,
        },
      );

      await storeDunningStatus(dunningStatus);
      return dunningStatus;
    }

    // Attempt payment retry
    const retryResult = await retryPayment(dunningStatus);

    if (retryResult.success) {
      dunningStatus.status = "resolved";
      dunningStatus.nextAttemptDate = null;

      await logAuditEvent("dunning_payment_succeeded", dunningStatus.userId, {
        plan_id: dunningStatus.planId,
        attempt_number: currentAttempt + 1,
      });
    } else {
      // Payment failed again
      const nextAttemptDate = calculateNextAttemptDate(currentAttempt);

      dunningStatus.attempts.push({
        attemptNumber: currentAttempt + 1,
        paymentIntentId: retryResult.paymentIntentId,
        failureReason: retryResult.failureReason || "Unknown error",
        nextAttemptDate: nextAttemptDate.toISOString(),
      });

      dunningStatus.lastAttemptDate = new Date().toISOString();
      dunningStatus.nextAttemptDate = nextAttemptDate.toISOString();

      await logAuditEvent("dunning_payment_failed", dunningStatus.userId, {
        plan_id: dunningStatus.planId,
        attempt_number: currentAttempt + 1,
        next_attempt_date: nextAttemptDate,
      });

      // Schedule next notification
      await scheduleNotifications(dunningStatus);
    }

    await storeDunningStatus(dunningStatus);
    return dunningStatus;
  } catch (error) {
    console.error("Error processing dunning retry:", error);
    throw error;
  }
}

/**
 * Store dunning status in the database
 */
async function storeDunningStatus(status: DunningStatus): Promise<void> {
  const response = await fetch("/api/billing/dunning/status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(status),
  });

  if (!response.ok) {
    throw new Error("Failed to store dunning status");
  }
}

/**
 * Schedule notifications for the next dunning attempt
 */
async function scheduleNotifications(status: DunningStatus): Promise<void> {
  const response = await fetch("/api/notifications/schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: status.userId,
      type: "dunning_reminder",
      channels: DEFAULT_CONFIG.notificationChannels,
      scheduledDate: status.nextAttemptDate,
      data: {
        plan_id: status.planId,
        attempt_number: status.attempts.length,
        next_attempt_date: status.nextAttemptDate,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to schedule notifications");
  }
}

/**
 * Retry the failed payment
 */
async function retryPayment(status: DunningStatus): Promise<{
  success: boolean;
  paymentIntentId: string;
  failureReason?: string;
}> {
  const response = await fetch("/api/billing/payments/retry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: status.planId,
      user_id: status.userId,
    }),
  });

  const result = await response.json();
  return {
    success: response.ok,
    paymentIntentId: result.payment_intent_id,
    failureReason: result.failure_reason,
  };
}

/**
 * Calculate the next attempt date based on retry intervals
 */
function calculateNextAttemptDate(currentAttempt: number): Date {
  const daysToAdd =
    DEFAULT_CONFIG.retryIntervals[currentAttempt] ||
    DEFAULT_CONFIG.retryIntervals[DEFAULT_CONFIG.retryIntervals.length - 1];

  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date;
}
