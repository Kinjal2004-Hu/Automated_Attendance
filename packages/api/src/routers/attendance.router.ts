import { protectedProcedure, publicProcedure, router } from "../index";
import {
  Student,
  FaceEmbedding,
  Class,
  AttendanceRecord,
  ProcessingJob,
} from "@Automated_Attendance/db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Validation schemas
const enrollStudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  studentId: z.string().min(2, "Student ID is required"),
  faceEmbeddings: z.array(z.array(z.number()).length(128)).min(1, "At least one face embedding required"),
});

const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  courseCode: z.string().min(1, "Course code is required"),
  date: z.date(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
});

const processClassPhotoSchema = z.object({
  classId: z.string(),
  detectedFaces: z.array(
    z.object({
      faceIndex: z.number(),
      embedding: z.array(z.number()).length(128),
      boundingBox: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      }),
    })
  ),
  processingMode: z.enum(["sync", "async"]),
});

const getProcessingStatusSchema = z.object({
  jobId: z.string(),
});

const markManualAttendanceSchema = z.object({
  classId: z.string(),
  studentId: z.string(),
  attended: z.boolean(),
});

// Helper function to generate unique IDs
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to calculate L2 distance between embeddings
function calculateDistance(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error("Embeddings must have the same length");
  }

  let sum = 0;
  for (let i = 0; i < embedding1.length; i++) {
    const diff = embedding1[i] - embedding2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

// Helper function to match faces against enrolled students
async function matchFaces(
  detectedEmbeddings: Array<{ faceIndex: number; embedding: number[] }>,
  threshold: number = 0.6
): Promise<
  Array<{
    faceIndex: number;
    studentId: string | null;
    confidence: number;
    recognized: boolean;
  }>
> {
  const results = [];

  // Get all enrolled students with their embeddings
  const enrolledStudents = await Student.find({ status: "enrolled" }).exec();
  const studentEmbeddings = await Promise.all(
    enrolledStudents.map(async (student) => {
      const embeddings = await FaceEmbedding.find({
        studentId: student._id,
      }).exec();
      return { student, embeddings };
    })
  );

  // Match each detected face
  for (const detected of detectedEmbeddings) {
    let bestMatch = {
      studentId: null as string | null,
      distance: Infinity,
      confidence: 0,
    };

    // Compare against all student embeddings
    for (const { student, embeddings } of studentEmbeddings) {
      for (const embedding of embeddings) {
        const distance = calculateDistance(
          detected.embedding,
          embedding.embedding as any
        );

        // Calculate confidence (inverse of distance)
        const confidence = Math.max(0, 1 - distance);

        if (distance < bestMatch.distance) {
          bestMatch = {
            studentId: student._id as string,
            distance,
            confidence,
          };
        }
      }
    }

    results.push({
      faceIndex: detected.faceIndex,
      studentId: bestMatch.studentId,
      confidence: bestMatch.confidence,
      recognized: bestMatch.distance < threshold,
    });
  }

  return results;
}

export const attendanceRouter = router({
  // Student enrollment procedure
  enrollStudent: protectedProcedure
    .input(enrollStudentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const studentId = generateId();
        const userId = ctx.session?.user?.id;

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        // Check if student already enrolled
        const existing = await Student.findOne({
          email: input.email,
        }).exec();

        if (existing && existing.status === "enrolled") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Student already enrolled",
          });
        }

        // Create or update student record
        const now = new Date();
        let student;

        if (existing) {
          student = existing;
          student.name = input.name;
          student.enrollmentDate = now;
          student.status = "enrolled";
        } else {
          student = new Student({
            _id: studentId,
            userId,
            name: input.name,
            email: input.email,
            studentId: input.studentId,
            enrollmentDate: now,
            status: "enrolled",
            faceEmbeddingIds: [],
            createdAt: now,
            updatedAt: now,
          });
        }

        // Store face embeddings
        const embeddingIds = [];
        for (let i = 0; i < input.faceEmbeddings.length; i++) {
          const embeddingId = generateId();
          const embedding = new FaceEmbedding({
            _id: embeddingId,
            studentId: student._id,
            embedding: input.faceEmbeddings[i],
            source: `enrollment_photo_${i + 1}`,
            uploadedAt: now,
            createdAt: now,
          });

          await embedding.save();
          embeddingIds.push(embeddingId);
        }

        student.faceEmbeddingIds = embeddingIds;
        student.updatedAt = now;
        await student.save();

        return {
          success: true,
          studentId: student._id,
          embeddingsCount: embeddingIds.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to enroll student",
        });
      }
    }),

  // Get enrollment status
  getMyEnrollmentStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session?.user?.id;

      if (!userId) {
        return { enrolled: false };
      }

      const student = await Student.findOne({
        userId,
        status: "enrolled",
      }).exec();

      return {
        enrolled: !!student,
        lastEnrolledAt: student?.enrollmentDate || null,
        studentId: student?._id || null,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get enrollment status",
      });
    }
  }),

  // Faculty creates a class
  createClass: protectedProcedure
    .input(createClassSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const facultyId = ctx.session?.user?.id;

        if (!facultyId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        const classId = generateId();
        const now = new Date();

        const newClass = new Class({
          _id: classId,
          name: input.name,
          courseCode: input.courseCode,
          facultyId,
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
          status: "not_started",
          createdAt: now,
          updatedAt: now,
        });

        await newClass.save();

        return {
          success: true,
          classId: newClass._id,
          status: "not_started",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create class",
        });
      }
    }),

  // Process class photo (sync or async)
  processClassPhoto: protectedProcedure
    .input(processClassPhotoSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const facultyId = ctx.session?.user?.id;

        if (!facultyId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        // Verify class exists and belongs to faculty
        const classRecord = await Class.findById(input.classId).exec();
        if (!classRecord || classRecord.facultyId !== facultyId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Class not found or access denied",
          });
        }

        const now = new Date();
        const jobId = generateId();

        // Match faces
        const matchResults = await matchFaces(input.detectedFaces);

        if (input.processingMode === "sync") {
          // Synchronous mode: process immediately
          const attendanceRecords = [];

          for (const match of matchResults) {
            if (match.recognized && match.studentId) {
              // Check for duplicates (same student appears twice)
              const existingRecord = await AttendanceRecord.findOne({
                classId: input.classId,
                studentId: match.studentId,
              }).exec();

              if (!existingRecord) {
                const recordId = generateId();
                const record = new AttendanceRecord({
                  _id: recordId,
                  classId: input.classId,
                  studentId: match.studentId,
                  markedAt: now,
                  confidenceScore: match.confidence,
                  recognitionMethod: "face_matching",
                  flagged: false,
                  createdAt: now,
                  updatedAt: now,
                });

                await record.save();
                attendanceRecords.push({
                  recordId,
                  studentId: match.studentId,
                  confidence: match.confidence,
                });
              }
            }
          }

          return {
            success: true,
            mode: "sync",
            jobId,
            status: "completed",
            results: {
              detectedFaces: input.detectedFaces.length,
              recognizedFaces: matchResults.filter((m) => m.recognized).length,
              attendanceRecords: attendanceRecords.length,
              matches: matchResults,
            },
          };
        } else {
          // Asynchronous mode: store job and return immediately
          const job = new ProcessingJob({
            _id: jobId,
            classId: input.classId,
            status: "pending",
            progress: 0,
            detectedFaces: input.detectedFaces.length,
            createdAt: now,
            updatedAt: now,
          });

          await job.save();

          // Process asynchronously in background (fire and forget)
          processClassPhotoAsync(
            input.classId,
            matchResults,
            jobId,
            now
          ).catch((error) => {
            console.error("Async processing failed:", error);
          });

          return {
            success: true,
            mode: "async",
            jobId,
            status: "pending",
          };
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process class photo",
        });
      }
    }),

  // Get processing status (for async mode)
  getProcessingStatus: publicProcedure
    .input(getProcessingStatusSchema)
    .query(async ({ input }) => {
      try {
        const job = await ProcessingJob.findById(input.jobId).exec();

        if (!job) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Job not found",
          });
        }

        return {
          jobId: job._id,
          status: job.status,
          progress: job.progress,
          detectedFaces: job.detectedFaces,
          recognizedFaces: job.recognizedFaces,
          error: job.error || null,
          results: job.status === "completed" ? job.results : null,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get processing status",
        });
      }
    }),

  // Get class attendance records
  getClassAttendance: protectedProcedure
    .input(z.object({ classId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const classRecord = await Class.findById(input.classId).exec();

        if (!classRecord) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Class not found",
          });
        }

        const records = await AttendanceRecord.find({
          classId: input.classId,
        })
          .populate("studentId")
          .exec();

        const summary = {
          present: records.filter((r) => !r.flagged).length,
          flagged: records.filter((r) => r.flagged).length,
        };

        return {
          classId: input.classId,
          className: classRecord.name,
          records,
          summary,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get attendance records",
        });
      }
    }),

  // Manual attendance marking
  markManualAttendance: protectedProcedure
    .input(markManualAttendanceSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const facultyId = ctx.session?.user?.id;

        if (!facultyId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        // Verify class belongs to faculty
        const classRecord = await Class.findById(input.classId).exec();
        if (!classRecord || classRecord.facultyId !== facultyId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Class not found or access denied",
          });
        }

        const now = new Date();

        if (input.attended) {
          // Check if record already exists
          const existing = await AttendanceRecord.findOne({
            classId: input.classId,
            studentId: input.studentId,
          }).exec();

          if (existing) {
            existing.recognitionMethod = "manual_override";
            existing.updatedAt = now;
            await existing.save();
          } else {
            const recordId = generateId();
            const record = new AttendanceRecord({
              _id: recordId,
              classId: input.classId,
              studentId: input.studentId,
              markedAt: now,
              recognitionMethod: "manual_override",
              flagged: false,
              createdAt: now,
              updatedAt: now,
            });

            await record.save();
          }
        } else {
          // Remove attendance record
          await AttendanceRecord.deleteOne({
            classId: input.classId,
            studentId: input.studentId,
          }).exec();
        }

        return {
          success: true,
          message: input.attended ? "Attendance marked" : "Attendance removed",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark manual attendance",
        });
      }
    }),

  // Update attendance record
  updateAttendance: protectedProcedure
    .input(
      z.object({
        recordId: z.string(),
        classId: z.string(),
        flagged: z.boolean().optional(),
        flagReason: z
          .enum(["not_recognized", "low_confidence", "manual_review"])
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const facultyId = ctx.session?.user?.id;

        if (!facultyId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        // Verify class belongs to faculty
        const classRecord = await Class.findById(input.classId).exec();
        if (!classRecord || classRecord.facultyId !== facultyId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Class not found or access denied",
          });
        }

        const record = await AttendanceRecord.findById(input.recordId).exec();
        if (!record || record.classId !== input.classId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Attendance record not found",
          });
        }

        if (input.flagged !== undefined) {
          record.flagged = input.flagged;
        }
        if (input.flagReason !== undefined) {
          record.flagReason = input.flagReason;
        }

        record.updatedAt = new Date();
        await record.save();

        return { success: true, record };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update attendance",
        });
      }
    }),

  // Delete attendance record
  deleteAttendance: protectedProcedure
    .input(
      z.object({
        recordId: z.string(),
        classId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const facultyId = ctx.session?.user?.id;

        if (!facultyId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        // Verify class belongs to faculty
        const classRecord = await Class.findById(input.classId).exec();
        if (!classRecord || classRecord.facultyId !== facultyId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Class not found or access denied",
          });
        }

        const result = await AttendanceRecord.findByIdAndDelete(
          input.recordId
        ).exec();

        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Attendance record not found",
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete attendance",
        });
      }
    }),
});

// Helper function for async processing
async function processClassPhotoAsync(
  classId: string,
  matchResults: Array<{
    faceIndex: number;
    studentId: string | null;
    confidence: number;
    recognized: boolean;
  }>,
  jobId: string,
  now: Date
): Promise<void> {
  try {
    const job = await ProcessingJob.findById(jobId).exec();
    if (!job) return;

    job.status = "processing";
    job.progress = 50;
    await job.save();

    // Mark attendance for recognized faces
    const attendanceResults = [];
    for (const match of matchResults) {
      if (match.recognized && match.studentId) {
        const existing = await AttendanceRecord.findOne({
          classId,
          studentId: match.studentId,
        }).exec();

        if (!existing) {
          const recordId = generateId();
          const record = new AttendanceRecord({
            _id: recordId,
            classId,
            studentId: match.studentId,
            markedAt: now,
            confidenceScore: match.confidence,
            recognitionMethod: "face_matching",
            flagged: false,
            createdAt: now,
            updatedAt: now,
          });

          await record.save();
          attendanceResults.push({
            studentId: match.studentId,
            confidence: match.confidence,
          });
        }
      }
    }

    job.status = "completed";
    job.progress = 100;
    job.recognizedFaces = matchResults.filter((m) => m.recognized).length;
    job.results = matchResults.map((m) => ({
      studentId: m.studentId || "unknown",
      confidence: m.confidence,
      recognized: m.recognized,
      faceIndex: m.faceIndex,
    }));
    job.updatedAt = new Date();
    await job.save();
  } catch (error) {
    const job = await ProcessingJob.findById(jobId).exec();
    if (job) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Unknown error";
      job.updatedAt = new Date();
      await job.save();
    }
  }
}
