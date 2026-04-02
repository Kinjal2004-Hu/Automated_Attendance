import { z } from "zod";
import { publicProcedure, router } from "../index";
import { aiService } from "../../utils/ai-service";

export const aiRouter = router({
  sendMessage: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ input }) => {
      const response = await aiService.sendMessage(input.message);
      if (response.error) {
        throw new Error(response.error);
      }
      return { message: response.output };
    }),

  generateAttendanceInsights: publicProcedure
    .input(
      z.object({
        totalStudents: z.number(),
        presentToday: z.number(),
        absentToday: z.number(),
        averageAttendance: z.number().optional(),
        flaggedRecords: z.number().optional(),
        classData: z
          .array(
            z.object({
              className: z.string(),
              attendance: z.number(),
              students: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await aiService.generateAttendanceInsights({
        totalStudents: input.totalStudents,
        presentToday: input.presentToday,
        absentToday: input.absentToday,
        averageAttendance: input.averageAttendance || 0,
        flaggedRecords: input.flaggedRecords || 0,
        classData: input.classData,
      });
    }),

  analyzeStudent: publicProcedure
    .input(
      z.object({
        name: z.string(),
        totalDaysInClass: z.number(),
        attendanceCount: z.number(),
        flaggedCount: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const analysis = await aiService.analyzeStudentPerformance({
        name: input.name,
        totalDaysInClass: input.totalDaysInClass,
        attendanceCount: input.attendanceCount,
        flaggedCount: input.flaggedCount || 0,
      });
      return { analysis };
    }),

  generateReport: publicProcedure
    .input(
      z.object({
        period: z.string(),
        metrics: z.record(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      const report = await aiService.generateSummaryReport(input.period, input.metrics);
      return { report };
    }),
});
