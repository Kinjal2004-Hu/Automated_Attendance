import { devToolsMiddleware } from "@ai-sdk/devtools";
import { google } from "@ai-sdk/google";
import { createContext } from "@Automated_Attendance/api/context";
import { appRouter } from "@Automated_Attendance/api/routers/index";
import { auth } from "@Automated_Attendance/auth";
import { env } from "@Automated_Attendance/env/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { streamText, type UIMessage, convertToModelMessages, wrapLanguageModel } from "ai";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { detectFaces, healthCheck, matchFaces } from "./utils/ml-service";
import { aiService } from "./utils/ai-service";

const app = express();

type StudentRecord = {
  name: string;
  email: string;
  studentId: string;
  embeddings: number[][];
};

type AttendanceMatch = {
  faceIndex: number;
  studentId: string | null;
  confidence: number;
  recognized: boolean;
};

const enrolledStudents = new Map<string, StudentRecord>();
const attendanceByClass = new Map<string, AttendanceMatch[]>();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (
        origin === env.CORS_ORIGIN ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS blocked"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "25mb" }));

app.get("/api/health", async (_req, res) => {
  const mlHealthy = await healthCheck();
  res.status(200).json({
    server: "ok",
    mlService: mlHealthy ? "ok" : "down",
    enrolledStudents: enrolledStudents.size,
  });
});

app.post("/api/students/enroll", async (req, res) => {
  try {
    const { name, email, studentId, imagesBase64 } = req.body as {
      name?: string;
      email?: string;
      studentId?: string;
      imagesBase64?: string[];
    };

    if (!name || !email || !studentId) {
      res.status(400).json({ message: "name, email and studentId are required" });
      return;
    }

    if (!Array.isArray(imagesBase64) || imagesBase64.length === 0) {
      res.status(400).json({ message: "At least one image is required" });
      return;
    }

    const embeddings: number[][] = [];

    for (const imageBase64 of imagesBase64) {
      const detection = await detectFaces(imageBase64);
      if (detection.detected_faces > 0) {
        embeddings.push(detection.faces[0].embedding);
      }
    }

    if (embeddings.length === 0) {
      res.status(400).json({ message: "No faces detected in uploaded images" });
      return;
    }

    enrolledStudents.set(studentId, {
      name,
      email,
      studentId,
      embeddings,
    });

    res.status(200).json({
      success: true,
      studentId,
      embeddingsCount: embeddings.length,
      totalEnrolled: enrolledStudents.size,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Enrollment failed";
    res.status(500).json({ message });
  }
});

app.get("/api/students", (_req, res) => {
  res.status(200).json({
    students: Array.from(enrolledStudents.values()).map((s) => ({
      name: s.name,
      email: s.email,
      studentId: s.studentId,
      embeddingsCount: s.embeddings.length,
    })),
  });
});

app.post("/api/attendance/process-photo", async (req, res) => {
  try {
    const { classId, imageBase64, threshold } = req.body as {
      classId?: string;
      imageBase64?: string;
      threshold?: number;
    };

    if (!classId || !imageBase64) {
      res.status(400).json({ message: "classId and imageBase64 are required" });
      return;
    }

    const studentEmbeddings: Record<string, number[][]> = {};
    for (const [studentId, student] of enrolledStudents.entries()) {
      studentEmbeddings[studentId] = student.embeddings;
    }

    const detection = await detectFaces(imageBase64);
    const detectedEmbeddings = detection.faces.map((f) => f.embedding);

    const matching =
      detectedEmbeddings.length === 0
        ? { success: true, matches: [] as AttendanceMatch[] }
        : await matchFaces(
            detectedEmbeddings,
            studentEmbeddings,
            typeof threshold === "number" ? threshold : 0.6,
          );

    attendanceByClass.set(classId, matching.matches);

    res.status(200).json({
      success: true,
      classId,
      detectedFaces: detection.detected_faces,
      recognizedFaces: matching.matches.filter((m) => m.recognized).length,
      matches: matching.matches,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Processing failed";
    res.status(500).json({ message });
  }
});

app.get("/api/attendance/:classId", (req, res) => {
  const classId = req.params.classId;
  const matches = attendanceByClass.get(classId) || [];

  res.status(200).json({
    classId,
    totalFaces: matches.length,
    recognizedFaces: matches.filter((m) => m.recognized).length,
    matches,
  });
});

app.all("/api/auth{/*path}", toNodeHandler(auth));

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.post("/ai", async (req, res) => {
  const { messages = [] } = (req.body || {}) as { messages: UIMessage[] };
  const model = wrapLanguageModel({
    model: google("gemini-2.5-flash"),
    middleware: devToolsMiddleware(),
  });
  const result = streamText({
    model,
    messages: await convertToModelMessages(messages),
  });
  result.pipeUIMessageStreamToResponse(res);
});

// Bytez.js AI Endpoints

app.post("/api/ai/message", async (req, res) => {
  try {
    const { message } = req.body as { message?: string };

    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const response = await aiService.sendMessage(message);

    if (response.error) {
      res.status(500).json({ error: response.error });
      return;
    }

    res.status(200).json({ message: response.output });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to process message";
    res.status(500).json({ error: errorMessage });
  }
});

app.post("/api/ai/attendance-insights", async (req, res) => {
  try {
    const { totalStudents, presentToday, absentToday, averageAttendance, flaggedRecords, classData } = req.body as {
      totalStudents?: number;
      presentToday?: number;
      absentToday?: number;
      averageAttendance?: number;
      flaggedRecords?: number;
      classData?: Array<{ className: string; attendance: number; students: number }>;
    };

    if (totalStudents === undefined || presentToday === undefined || absentToday === undefined) {
      res.status(400).json({ error: "totalStudents, presentToday, and absentToday are required" });
      return;
    }

    const insights = await aiService.generateAttendanceInsights({
      totalStudents,
      presentToday,
      absentToday,
      averageAttendance: averageAttendance || 0,
      flaggedRecords: flaggedRecords || 0,
      classData,
    });

    res.status(200).json(insights);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to generate insights";
    res.status(500).json({ error: errorMessage });
  }
});

app.post("/api/ai/student-analysis", async (req, res) => {
  try {
    const { name, totalDaysInClass, attendanceCount, flaggedCount } = req.body as {
      name?: string;
      totalDaysInClass?: number;
      attendanceCount?: number;
      flaggedCount?: number;
    };

    if (!name || totalDaysInClass === undefined || attendanceCount === undefined) {
      res.status(400).json({ error: "name, totalDaysInClass, and attendanceCount are required" });
      return;
    }

    const analysis = await aiService.analyzeStudentPerformance({
      name,
      totalDaysInClass,
      attendanceCount,
      flaggedCount: flaggedCount || 0,
    });

    res.status(200).json({ analysis });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze student";
    res.status(500).json({ error: errorMessage });
  }
});

app.post("/api/ai/report", async (req, res) => {
  try {
    const { period, metrics } = req.body as {
      period?: string;
      metrics?: Record<string, number>;
    };

    if (!period || !metrics) {
      res.status(400).json({ error: "period and metrics are required" });
      return;
    }

    const report = await aiService.generateSummaryReport(period, metrics);

    res.status(200).json({ report });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to generate report";
    res.status(500).json({ error: errorMessage });
  }
});

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
