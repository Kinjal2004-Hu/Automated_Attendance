/**
 * Utility functions for exporting attendance data to CSV format
 */

export interface CSVRow {
  [key: string]: string | number | boolean;
}

export function generateCSV(data: CSVRow[], filename: string) {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        if (typeof value === "string") {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAttendanceCSV(
  records: any[],
  className: string,
  classId: string
) {
  const data = records.map((record) => ({
    "Student ID": record.studentId?.studentId || "N/A",
    Name: record.studentId?.name || "N/A",
    Email: record.studentId?.email || "N/A",
    "Marked At": new Date(record.markedAt).toLocaleDateString(),
    "Confidence Score": record.confidenceScore
      ? (record.confidenceScore * 100).toFixed(1) + "%"
      : "N/A",
    Method: record.recognitionMethod === "face_matching" ? "Auto" : "Manual",
    Status: record.flagged ? "Flagged" : "Present",
    "Flag Reason": record.flagReason || "-",
  }));

  generateCSV(
    data,
    `attendance_${className}_${classId}_${new Date().toISOString().split("T")[0]}.csv`
  );
}

export function exportAnalyticsCSV(data: any[]) {
  generateCSV(
    data,
    `analytics_${new Date().toISOString().split("T")[0]}.csv`
  );
}
