import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, TrendingUp, PieChart, BarChart3, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface AttendanceTrend {
  date: string;
  present: number;
  absent: number;
  flagged: number;
  percentage: number;
}

interface ClassStatistic {
  name: string;
  percentage: number;
  count: number;
}

interface StudentStatistic {
  name: string;
  attended: number;
  absent: number;
}

interface FlaggedRecord {
  id: string;
  studentName: string;
  className: string;
  reason: string;
  date: string;
}

// Mock data for demonstration
const mockTrendData: AttendanceTrend[] = [
  { date: "Jan 1", present: 24, absent: 8, flagged: 2, percentage: 75 },
  { date: "Jan 8", present: 28, absent: 5, flagged: 1, percentage: 84 },
  { date: "Jan 15", present: 22, absent: 10, flagged: 2, percentage: 68 },
  { date: "Jan 22", present: 26, absent: 6, flagged: 2, percentage: 81 },
  { date: "Jan 29", present: 29, absent: 4, flagged: 1, percentage: 87 },
  { date: "Feb 5", present: 25, absent: 7, flagged: 2, percentage: 78 },
  { date: "Feb 12", present: 30, absent: 3, flagged: 1, percentage: 90 },
];

const mockClassData: ClassStatistic[] = [
  { name: "CS101", percentage: 82, count: 41 },
  { name: "CS202", percentage: 76, count: 38 },
  { name: "MATH101", percentage: 85, count: 43 },
  { name: "ENG201", percentage: 79, count: 40 },
  { name: "PHY101", percentage: 88, count: 44 },
];

const mockStudentData: StudentStatistic[] = [
  { name: "John Doe", attended: 12, absent: 2 },
  { name: "Jane Smith", attended: 13, absent: 1 },
  { name: "Bob Johnson", attended: 10, absent: 4 },
  { name: "Alice Brown", attended: 14, absent: 0 },
  { name: "Charlie Wilson", attended: 11, absent: 3 },
];

const mockFlaggedRecords: FlaggedRecord[] = [
  {
    id: "1",
    studentName: "Bob Johnson",
    className: "CS101",
    reason: "Low Confidence",
    date: "2024-02-12",
  },
  {
    id: "2",
    studentName: "Charlie Wilson",
    className: "CS202",
    reason: "Not Recognized",
    date: "2024-02-11",
  },
  {
    id: "3",
    studentName: "Bob Johnson",
    className: "MATH101",
    reason: "Manual Review",
    date: "2024-02-10",
  },
];

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedClass, setSelectedClass] = useState<string>("");

  const handleExportCSV = () => {
    const csvContent = [
      ["Date", "Present", "Absent", "Flagged", "Percentage"].join(","),
      ...mockTrendData.map((d) =>
        [d.date, d.present, d.absent, d.flagged, d.percentage].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          View detailed attendance analytics and statistics
        </p>
      </section>

      {/* Filters */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="mt-2"
          />
        </div>
        <div className="flex items-end">
          <Button className="w-full" onClick={handleExportCSV}>
            <Download size={18} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">Average Attendance</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">82%</p>
          <p className="text-xs text-green-600 mt-2">↑ 3% from last month</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Marked</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">182</p>
          <p className="text-xs text-slate-500 mt-2">In last 30 days</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">Flagged Records</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">12</p>
          <p className="text-xs text-slate-500 mt-2">Awaiting review</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">Classes Tracked</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">5</p>
          <p className="text-xs text-slate-500 mt-2">Active courses</p>
        </Card>
      </section>

      {/* Attendance Trends */}
      <section>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={24} className="text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Attendance Trends (Last 30 Days)
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={mockTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="present"
                stroke="#10b981"
                name="Present"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="absent"
                stroke="#ef4444"
                name="Absent"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="flagged"
                stroke="#f59e0b"
                name="Flagged"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Class-wise Distribution */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <RechartsPieChart size={24} className="text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Attendance by Class
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={mockClassData}
                dataKey="percentage"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {mockClassData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </Card>

        {/* Class Statistics Table */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Class Details
          </h2>
          <div className="space-y-4">
            {mockClassData.map((cls) => (
              <div
                key={cls.name}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{cls.name}</p>
                  <p className="text-sm text-slate-500">Attendance: {cls.count} records</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">{cls.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Student-wise Statistics */}
      <section>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={24} className="text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Student-wise Attendance
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mockStudentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
              <Legend />
              <Bar dataKey="attended" fill="#10b981" name="Attended" radius={[8, 8, 0, 0]} />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* Flagged Records */}
      <section>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle size={24} className="text-orange-600" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Flagged Records
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Student
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Class
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Reason
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockFlaggedRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="py-3 px-4 text-slate-900 dark:text-white">
                      {record.studentName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {record.className}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded text-xs font-medium">
                        {record.reason}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default AnalyticsPage;
