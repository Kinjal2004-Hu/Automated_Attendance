import { useState } from "react";
import { trpc } from "@/utils/trpc";

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await trpc.ai.sendMessage.mutate({ message });
      return result.message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateAttendanceInsights = async (data: {
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    averageAttendance?: number;
    flaggedRecords?: number;
    classData?: Array<{
      className: string;
      attendance: number;
      students: number;
    }>;
  }) => {
    setLoading(true);
    setError(null);
    try {
      return await trpc.ai.generateAttendanceInsights.mutate(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate insights";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const analyzeStudent = async (data: {
    name: string;
    totalDaysInClass: number;
    attendanceCount: number;
    flaggedCount?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await trpc.ai.analyzeStudent.mutate(data);
      return result.analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze student";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (data: {
    period: string;
    metrics: Record<string, number>;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await trpc.ai.generateReport.mutate(data);
      return result.report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate report";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendMessage,
    generateAttendanceInsights,
    analyzeStudent,
    generateReport,
  };
}
