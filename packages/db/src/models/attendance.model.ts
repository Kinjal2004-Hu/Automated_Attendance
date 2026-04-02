import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Student model for face enrollment
const studentSchema = new Schema(
  {
    _id: { type: String },
    userId: { type: String, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    studentId: { type: String, unique: true },
    enrollmentDate: { type: Date },
    status: {
      type: String,
      enum: ["enrolled", "pending", "inactive"],
      default: "pending",
    },
    faceEmbeddingIds: [{ type: String, ref: "FaceEmbedding" }],
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: "student" }
);

// Face embedding model for storing face vectors
const faceEmbeddingSchema = new Schema(
  {
    _id: { type: String },
    studentId: { type: String, ref: "Student", required: true },
    embedding: {
      type: [Number], // Array of 128 float values
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length === 128;
        },
        message: "Embedding must contain exactly 128 values",
      },
    },
    source: { type: String, enum: ["enrollment_photo_1", "enrollment_photo_2", "enrollment_photo_3"] },
    uploadedAt: { type: Date, required: true },
    createdAt: { type: Date, required: true },
  },
  { collection: "face_embedding" }
);

// Class model for tracking class sessions
const classSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    courseCode: { type: String, required: true },
    facultyId: { type: String, ref: "User", required: true },
    date: { type: Date, required: true },
    startTime: { type: Date },
    endTime: { type: Date },
    status: {
      type: String,
      enum: ["not_started", "ongoing", "completed"],
      default: "not_started",
    },
    totalStudents: { type: Number, default: 0 },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: "class" }
);

// Attendance record model
const attendanceRecordSchema = new Schema(
  {
    _id: { type: String },
    classId: { type: String, ref: "Class", required: true },
    studentId: { type: String, ref: "Student", required: true },
    markedAt: { type: Date, required: true },
    confidenceScore: { type: Number, min: 0, max: 1 },
    recognitionMethod: {
      type: String,
      enum: ["face_matching", "manual_override"],
      default: "face_matching",
    },
    flagged: { type: Boolean, default: false },
    flagReason: {
      type: String,
      enum: ["not_recognized", "low_confidence", "manual_review"],
    },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: "attendance_record" }
);

// Processing job model for tracking async operations
const processingJobSchema = new Schema(
  {
    _id: { type: String },
    classId: { type: String, ref: "Class", required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    photoUrl: { type: String },
    detectedFaces: { type: Number, default: 0 },
    recognizedFaces: { type: Number, default: 0 },
    results: [
      {
        type: {
          studentId: String,
          confidence: Number,
          recognized: Boolean,
          faceIndex: Number,
        },
      },
    ],
    error: { type: String },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: "processing_job" }
);

// Create and export models
const Student = model("Student", studentSchema);
const FaceEmbedding = model("FaceEmbedding", faceEmbeddingSchema);
const Class = model("Class", classSchema);
const AttendanceRecord = model("AttendanceRecord", attendanceRecordSchema);
const ProcessingJob = model("ProcessingJob", processingJobSchema);

export { Student, FaceEmbedding, Class, AttendanceRecord, ProcessingJob };
