import { client } from "@Automated_Attendance/db";
import { env } from "@Automated_Attendance/env/server";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

export const auth = betterAuth({
  database: mongodbAdapter(client),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ["student", "faculty", "admin"],
        required: false,
        defaultValue: "student",
        input: false, // don't allow user to set role during signup (handled separately)
      },
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
});
