import { z } from "zod";
import { adminProcedure, router } from "../index";
import { User } from "@Automated_Attendance/db";

export const adminRouter = router({
  listUsers: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        role: z.enum(["student", "faculty", "admin"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const query = input.role ? { role: input.role } : {};

      const skip = (input.page - 1) * input.limit;

      const [users, total] = await Promise.all([
        User.find(query)
          .skip(skip)
          .limit(input.limit)
          .lean(),
        User.countDocuments(query),
      ]);

      return {
        users: users.map((u) => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          emailVerified: u.emailVerified,
          createdAt: u.createdAt,
        })),
        total,
        page: input.page,
        pages: Math.ceil(total / input.limit),
      };
    }),

  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        newRole: z.enum(["student", "faculty", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const user = await User.findByIdAndUpdate(
        input.userId,
        { role: input.newRole, updatedAt: new Date() },
        { new: true }
      ).lean();

      if (!user) {
        throw new Error("User not found");
      }

      return {
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  removeUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      // Soft delete by marking as inactive via a flag
      // For now, we'll just delete the user
      await User.findByIdAndDelete(input.userId);

      return { success: true };
    }),

  getSystemStats: adminProcedure.query(async () => {
    const { User: UserModel, Class, AttendanceRecord } = await import(
      "@Automated_Attendance/db"
    );

    const [totalUsers, totalStudents, totalFaculty, totalAdmin, totalClasses, totalRecords] =
      await Promise.all([
        UserModel.countDocuments(),
        UserModel.countDocuments({ role: "student" }),
        UserModel.countDocuments({ role: "faculty" }),
        UserModel.countDocuments({ role: "admin" }),
        Class.countDocuments(),
        AttendanceRecord.countDocuments(),
      ]);

    return {
      totalUsers,
      totalStudents,
      totalFaculty,
      totalAdmin,
      totalClasses,
      totalAttendanceRecords: totalRecords,
      userDistribution: {
        students: totalStudents,
        faculty: totalFaculty,
        admins: totalAdmin,
      },
    };
  }),
});
