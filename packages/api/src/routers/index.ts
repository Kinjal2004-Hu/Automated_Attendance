import { protectedProcedure, publicProcedure, router } from "../index";
import { attendanceRouter } from "./attendance.router";
import { analyticsRouter } from "./analytics.router";
import { adminRouter } from "./admin.router";
import { aiRouter } from "./ai.router";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  attendance: attendanceRouter,
  analytics: analyticsRouter,
  admin: adminRouter,
  ai: aiRouter,
});
export type AppRouter = typeof appRouter;
