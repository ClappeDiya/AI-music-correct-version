import { db } from "./db";

interface UndoResult {
  success: boolean;
  error?: string;
  data?: any;
}

export async function undoPredictivePreference({
  userId,
  eventId,
}: {
  userId: string;
  eventId: string;
}): Promise<UndoResult> {
  try {
    // Find the event to undo
    const event = await db.predictivePreferenceEvent.findUnique({
      where: { id: eventId, userId },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // Revert the changes
    const reverted = await db.$transaction(async (tx) => {
      // Restore previous values
      await tx.userPreferences.update({
        where: { userId },
        data: event.previous_values,
      });

      // Mark event as undone
      await tx.predictivePreferenceEvent.update({
        where: { id: eventId },
        data: { undone: true },
      });

      return true;
    });

    return { success: true, data: reverted };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to undo preference",
    };
  }
}
