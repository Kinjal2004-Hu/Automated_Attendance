import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { X } from "lucide-react";
import z from "zod";
import { useForm } from "@tanstack/react-form";

interface AttendanceRecord {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    studentId: string;
  };
  classId: string;
  markedAt: string;
  confidenceScore?: number;
  recognitionMethod: "face_matching" | "manual_override";
  flagged: boolean;
  flagReason?: "not_recognized" | "low_confidence" | "manual_review";
}

interface EditAttendanceModalProps {
  record: AttendanceRecord;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  loading?: boolean;
}

export function EditAttendanceModal({
  record,
  onClose,
  onSave,
  loading = false,
}: EditAttendanceModalProps) {
  const form = useForm({
    defaultValues: {
      flagged: record.flagged,
      flagReason: record.flagReason || "not_recognized" as const,
      notes: "",
    },
    onSubmit: async ({ value }) => {
      await onSave(value);
    },
    validators: {
      onSubmit: z.object({
        flagged: z.boolean(),
        flagReason: z.enum(["not_recognized", "low_confidence", "manual_review"]),
        notes: z.string(),
      }),
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Edit Attendance Record
          </h2>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close edit attendance modal"
            title="Close"
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="p-6 space-y-6"
        >
          {/* Student Info (Read-only) */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">Student</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {record.studentId.name}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ID: {record.studentId.studentId}
            </p>
          </div>

          {/* Attendance Status (Read-only) */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">Attendance Status</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm">
                <span className="font-semibold text-slate-900 dark:text-white">Method: </span>
                <span className="text-slate-600 dark:text-slate-400 capitalize">
                  {record.recognitionMethod === "face_matching" ? "Automatic" : "Manual"}
                </span>
              </p>
              {record.confidenceScore && (
                <p className="text-sm">
                  <span className="font-semibold text-slate-900 dark:text-white">Confidence: </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {(record.confidenceScore * 100).toFixed(0)}%
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Flagged Status */}
          <form.Field name="flagged">
            {(field) => (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    aria-label="Flag this record for review"
                    title="Flag this record for review"
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                  />
                  <span>Flag this record for review</span>
                </Label>
              </div>
            )}
          </form.Field>

          {/* Flag Reason */}
          {form.state.values.flagged && (
            <form.Field name="flagReason">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="flagReason">Reason for Flag</Label>
                  <select
                    id="flagReason"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value as any)}
                    aria-label="Reason for flag"
                    title="Reason for flag"
                    className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="not_recognized">Not Recognized</option>
                    <option value="low_confidence">Low Confidence</option>
                    <option value="manual_review">Manual Review</option>
                  </select>
                </div>
              )}
            </form.Field>
          )}

          {/* Notes */}
          <form.Field name="notes">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <textarea
                  id="notes"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Add any notes about this record..."
                  className="w-full border border-slate-300 dark:border-slate-600 rounded px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-24 resize-none"
                />
              </div>
            )}
          </form.Field>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
