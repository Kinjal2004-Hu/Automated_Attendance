import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "../utils/trpc";

interface AttendanceRecord {
  _id: string;
  classId: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    studentId: string;
  };
  markedAt: string;
  confidenceScore?: number;
  recognitionMethod: "face_matching" | "manual_override";
  flagged: boolean;
  flagReason?: string;
}

interface ClassData {
  classId: string;
  className: string;
  records: AttendanceRecord[];
  summary: {
    present: number;
    flagged: number;
  };
}

export function AttendanceRecordsPage() {
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [filter, setFilter] = useState<"all" | "present" | "flagged">("all");

  // Load attendance records
  const handleLoadRecords = async () => {
    if (!classId) {
      toast.error("Please enter a class ID");
      return;
    }

    setLoading(true);

    try {
      // Mock: In real implementation, call backend API
      // For now, generate mock data
      const mockData: ClassData = {
        classId,
        className: "CS101 - Introduction to Programming",
        records: [
          {
            _id: "1",
            classId,
            studentId: {
              _id: "stu1",
              name: "John Doe",
              email: "john@example.com",
              studentId: "STU001",
            },
            markedAt: new Date().toISOString(),
            confidenceScore: 0.95,
            recognitionMethod: "face_matching",
            flagged: false,
          },
          {
            _id: "2",
            classId,
            studentId: {
              _id: "stu2",
              name: "Jane Smith",
              email: "jane@example.com",
              studentId: "STU002",
            },
            markedAt: new Date().toISOString(),
            confidenceScore: 0.87,
            recognitionMethod: "face_matching",
            flagged: false,
          },
          {
            _id: "3",
            classId,
            studentId: {
              _id: "stu3",
              name: "Bob Johnson",
              email: "bob@example.com",
              studentId: "STU003",
            },
            markedAt: new Date().toISOString(),
            confidenceScore: 0.45,
            recognitionMethod: "manual_override",
            flagged: true,
            flagReason: "low_confidence",
          },
        ],
        summary: {
          present: 2,
          flagged: 1,
        },
      };

      setClassData(mockData);
      toast.success("Attendance records loaded");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load records";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!classData) return;

    const rows = classData.records.map((record) => [
      record.studentId.studentId,
      record.studentId.name,
      record.studentId.email,
      "Present",
      record.recognitionMethod,
      record.confidenceScore?.toFixed(2) || "N/A",
      record.flagged ? "Yes" : "No",
    ]);

    const csv = [
      ["Student ID", "Name", "Email", "Status", "Recognition Method", "Confidence", "Flagged"],
      ...rows,
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${classData.classId}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("CSV file downloaded");
  };

  // Filter records
  const filteredRecords =
    classData?.records.filter((record) => {
      if (filter === "present") return !record.flagged;
      if (filter === "flagged") return record.flagged;
      return true;
    }) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance Records
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage attendance for classes
          </p>
        </div>

        {/* Search Section */}
        {!classData && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Load Attendance Records
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="classId">Class ID</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="classId"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    placeholder="Enter class ID (e.g., CS101)"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleLoadRecords();
                      }
                    }}
                  />
                  <Button
                    onClick={handleLoadRecords}
                    disabled={!classId || loading}
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Load Records
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Results Section */}
        {classData && (
          <div className="space-y-6">
            {/* Class Info & Summary */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {classData.className}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Class ID: {classData.classId}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setClassData(null);
                      setClassId("");
                    }}
                  >
                    Back
                  </Button>
                  <Button onClick={handleExportCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">
                    {classData.records.length}
                  </div>
                  <p className="text-sm text-blue-700 mt-1">Total Students</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">
                    {classData.summary.present}
                  </div>
                  <p className="text-sm text-green-700 mt-1">Present</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">
                    {classData.summary.flagged}
                  </div>
                  <p className="text-sm text-orange-700 mt-1">Flagged</p>
                </div>
              </div>
            </Card>

            {/* Filter */}
            <Card className="p-6">
              <div className="flex gap-2">
                {["all", "present", "flagged"].map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "default" : "outline"}
                    onClick={() => setFilter(f as typeof filter)}
                    className="capitalize"
                  >
                    {f === "all" ? "All" : f === "present" ? "Present" : "Flagged"}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Records Table */}
            <Card className="p-6 overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Attendance List
              </h3>

              {filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No records found for the selected filter
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Student ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Confidence
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Method
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr
                        key={record._id}
                        className={`border-b hover:bg-gray-50 ${
                          record.flagged ? "bg-orange-50" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {record.studentId.studentId}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {record.studentId.name}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {record.studentId.email}
                        </td>
                        <td className="py-3 px-4">
                          {record.confidenceScore ? (
                            <span className="text-gray-700">
                              {(record.confidenceScore * 100).toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              record.recognitionMethod === "face_matching"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {record.recognitionMethod === "face_matching"
                              ? "Auto"
                              : "Manual"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              record.flagged
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {record.flagged ? "Flagged" : "Present"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
