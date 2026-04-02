/**
 * Utility functions for attendance calculations and formatting
 */

export function calculateAttendancePercentage(
  attended: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((attended / total) * 100);
}

export function formatAttendancePercentage(percentage: number): string {
  return `${percentage}%`;
}

export function isAttendanceHealthy(percentage: number, threshold: number = 75): boolean {
  return percentage >= threshold;
}

export function getAttendanceStatus(percentage: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (percentage >= 90) {
    return {
      label: "Excellent",
      color: "text-green-700",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    };
  }
  if (percentage >= 75) {
    return {
      label: "Good",
      color: "text-blue-700",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    };
  }
  if (percentage >= 60) {
    return {
      label: "Fair",
      color: "text-orange-700",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    };
  }
  return {
    label: "Poor",
    color: "text-red-700",
    bgColor: "bg-red-100 dark:bg-red-900/20",
  };
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getDaysInDateRange(startDate: Date, endDate: Date): number {
  const timeDifference = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  flagged: number;
  total: number;
  percentage: number;
}

export function summarizeAttendance(records: any[]): AttendanceSummary {
  const total = records.length;
  const present = records.filter((r) => !r.flagged).length;
  const flagged = records.filter((r) => r.flagged).length;
  const absent = total - present - flagged;

  return {
    present,
    absent,
    flagged,
    total,
    percentage: calculateAttendancePercentage(present, total),
  };
}
