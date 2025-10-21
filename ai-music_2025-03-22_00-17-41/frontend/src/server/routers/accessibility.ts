import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const accessibilityRouter = createTRPCRouter({
  getSettings: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const settings = await ctx.prisma.userAccessibilitySettings.findUnique({
        where: { userId: input.userId },
      });
      if (!settings) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Accessibility settings not found",
        });
      }
      return settings;
    }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        textSize: z.string(),
        colorContrast: z.string(),
        screenReaderSupport: z.boolean(),
        locale: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userAccessibilitySettings.update({
        where: { id: input.id },
        data: {
          textSize: input.textSize,
          colorContrast: input.colorContrast,
          screenReaderSupport: input.screenReaderSupport,
          locale: input.locale,
        },
      });
    }),

  createSettings: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        textSize: z.string(),
        colorContrast: z.string(),
        screenReaderSupport: z.boolean(),
        locale: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userAccessibilitySettings.create({
        data: {
          userId: input.userId,
          textSize: input.textSize,
          colorContrast: input.colorContrast,
          screenReaderSupport: input.screenReaderSupport,
          locale: input.locale,
        },
      });
    }),
});
