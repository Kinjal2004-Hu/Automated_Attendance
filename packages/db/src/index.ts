import { env } from "@Automated_Attendance/env/server";
import mongoose from "mongoose";

await mongoose.connect(env.DATABASE_URL).catch((error) => {
  console.log("Error connecting to database:", error);
});

const client = mongoose.connection.getClient().db("myDB");

export { client };
export { User, Session, Account, Verification } from "./models/auth.model";
export { Student, FaceEmbedding, Class, AttendanceRecord, ProcessingJob } from "./models/attendance.model";
