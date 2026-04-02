import { z } from "zod";
import { protectedProcedure, router } from "../index";
import { AttendanceRecord, Class } from "@Automated_Attendance/db";

export const analyticsRouter = router({
  getClassStatistics: protectedProcedure
    .input(
      z.object({
        classId: z.string(),
        dateRange: z
          .object({
            start: z.date().optional(),
            end: z.date().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      const records = await AttendanceRecord.find({
        classId: input.classId,
        ...(input.dateRange?.start && {
          markedAt: {
            $gte: input.dateRange.start,
            ...(input.dateRange?.end && { $lte: input.dateRange.end }),
          },
        }),
      }).lean();

      const total = records.length;
      const present = records.filter((r) => !r.flagged).length;
      const flagged = records.filter((r) => r.flagged).length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        classId: input.classId,
        total,
        present,
        flagged,
        absentCount: total - present - flagged,
        percentage,
        averageConfidence:
          total > 0
            ? records.reduce((sum, r) => sum + (r.confidenceScore || 0), 0) /
              records.filter((r) => r.confidenceScore).length
            : 0,
      };
    }),

  getSystemOverview: protectedProcedure.query(async ({ ctx }) => {
    // Only admins can see system-wide stats
    if (ctx.session?.user.role !== "admin") {
      return {
        totalClasses: 0,
        totalAttendanceRecords: 0,
        totalFlaggedRecords: 0,
        averageAttendanceRate: 0,
      };
    }

    const classes = await Class.countDocuments();
    const records = await AttendanceRecord.find({}).lean();
    const totalRecords = records.length;
    const flaggedRecords = records.filter((r) => r.flagged).length;
    const presentRecords = records.filter((r) => !r.flagged).length;
    const averageAttendanceRate =
      totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

    return {
      totalClasses: classes,
      totalAttendanceRecords: totalRecords,
      totalFlaggedRecords: flaggedRecords,
      averageAttendanceRate,
    };
  }),

  getAttendanceTrends: protectedProcedure
    .input(
      z.object({
        classId: z.string().optional(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const query = input.classId
        ? {
            classId: input.classId,
            markedAt: { $gte: startDate },
          }
        : { markedAt: { $gte: startDate } };

      // If not admin or faculty, only show their own data
      if (ctx.session?.user.role === "student") {
        // Students can only see their own attendance
        return { dates: [], data: [] };
      }

      const records = await AttendanceRecord.find(query).lean();

      // Group by date
      const grouped: Record<
        string,
        { present: number; flagged: number; total: number }
      > = {};

      records.forEach((record) => {
        const dateKey = record.markedAt.toISOString().split("T")[0];
        if (!grouped[dateKey]) {
          grouped[dateKey] = { present: 0, flagged: 0, total: 0 };
        }
        grouped[dateKey].total++;
        if (record.flagged) {
          grouped[dateKey].flagged++;
        } else {
          grouped[dateKey].present++;
        }
      });

      const dates = Object.keys(grouped).sort();
      const data = dates.map((date) => ({
        date,
        present: grouped[date].present,
        flagged: grouped[date].flagged,
        total: grouped[date].total,
        percentage:
          grouped[date].total > 0
            ? Math.round(
                (grouped[date].present / grouped[date].total) * 100
              )
            : 0,
      }));

      return { dates, data };
    }),

  getTopFlaggedRecords: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        classId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Only faculty and admin can see flagged records
      if (ctx.session?.user.role === "student") {
        return [];
      }

      const query = {
        flagged: true,
        ...(input.classId && { classId: input.classId }),
      };

      const records = await AttendanceRecord.find(query)
        .sort({ markedAt: -1 })
        .limit(input.limit)
        .lean();

      return records.map((r) => ({
        _id: r._id?.toString(),
        classId: r.classId,
        studentId: r.studentId,
        flagReason: r.flagReason,
        confidenceScore: r.confidenceScore,
        markedAt: r.markedAt,
      }));
    }),
});
