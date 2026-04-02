import Bytez from "bytez.js";
import { env } from "@Automated_Attendance/env/server";

interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AIResponse {
  error: string | null;
  output: string | null;
}

interface AttendanceInsight {
  summary: string;
  recommendations: string[];
  flaggedIssues: string[];
}

class AIService {
  private sdk: typeof Bytez;
  private initialized: boolean = false;

  constructor() {
    if (!env.BYTEZ_API_KEY) {
      throw new Error("BYTEZ_API_KEY is not configured in environment variables");
    }
    this.sdk = new Bytez(env.BYTEZ_API_KEY);
  }

  /**
   * Send a message to GPT-4o and get a response
   */
  async sendMessage(message: string): Promise<AIResponse> {
    try {
      const model = this.sdk.model("openai/gpt-4o");
      const result = await model.run([
        {
          role: "user",
          content: message,
        },
      ]);

      return {
        error: result.error || null,
        output: result.output || null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        error: errorMessage,
        output: null,
      };
    }
  }

  /**
   * Send a conversation with multiple messages
   */
  async sendConversation(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const model = this.sdk.model("openai/gpt-4o");
      const result = await model.run(
        messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      );

      return {
        error: result.error || null,
        output: result.output || null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        error: errorMessage,
        output: null,
      };
    }
  }

  /**
   * Generate attendance insights from attendance data
   */
  async generateAttendanceInsights(attendanceData: {
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    averageAttendance: number;
    flaggedRecords: number;
    classData?: Array<{
      className: string;
      attendance: number;
      students: number;
    }>;
  }): Promise<AttendanceInsight> {
    const prompt = `
You are an attendance analysis expert. Analyze the following attendance data and provide insights:

Total Students: ${attendanceData.totalStudents}
Present Today: ${attendanceData.presentToday}
Absent Today: ${attendanceData.absentToday}
Average Attendance Rate: ${attendanceData.averageAttendance}%
Flagged/Suspicious Records: ${attendanceData.flaggedRecords}

${
  attendanceData.classData
    ? `
Class-wise Breakdown:
${attendanceData.classData.map((c) => `- ${c.className}: ${c.attendance}% (${c.students} students)`).join("\n")}
`
    : ""
}

Please provide:
1. A brief summary of the attendance status
2. 3-5 actionable recommendations
3. Any flagged issues or patterns of concern

Format your response as JSON with keys: summary, recommendations (array), flaggedIssues (array)
`;

    const response = await this.sendMessage(prompt);

    if (response.error) {
      return {
        summary: "Unable to generate insights",
        recommendations: [],
        flaggedIssues: [response.error],
      };
    }

    try {
      const parsed = JSON.parse(response.output || "{}");
      return {
        summary: parsed.summary || "Analysis generated",
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        flaggedIssues: Array.isArray(parsed.flaggedIssues) ? parsed.flaggedIssues : [],
      };
    } catch {
      return {
        summary: response.output || "Analysis completed",
        recommendations: [],
        flaggedIssues: [],
      };
    }
  }

  /**
   * Analyze student performance
   */
  async analyzeStudentPerformance(studentData: {
    name: string;
    totalDaysInClass: number;
    attendanceCount: number;
    flaggedCount: number;
  }): Promise<string> {
    const attendancePercentage = (
      (studentData.attendanceCount / studentData.totalDaysInClass) *
      100
    ).toFixed(2);

    const prompt = `
Analyze the following student attendance data and provide a brief performance assessment:

Student Name: ${studentData.name}
Total Days in Class: ${studentData.totalDaysInClass}
Days Present: ${studentData.attendanceCount}
Attendance Rate: ${attendancePercentage}%
Flagged Records: ${studentData.flaggedCount}

Provide a constructive assessment in 2-3 sentences.
`;

    const response = await this.sendMessage(prompt);
    return response.output || "Unable to analyze student performance";
  }

  /**
   * Generate a summary report
   */
  async generateSummaryReport(period: string, metrics: Record<string, number>): Promise<string> {
    const metricsText = Object.entries(metrics)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join("\n");

    const prompt = `
Generate a professional summary report for the following attendance metrics for the period: ${period}

${metricsText}

Keep it concise and professional (3-4 paragraphs).
`;

    const response = await this.sendMessage(prompt);
    return response.output || "Report generation failed";
  }
}

// Export singleton instance
export const aiService = new AIService();
