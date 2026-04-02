import { FormEvent, useState } from "react";
import { env } from "@Automated_Attendance/env/web";

type MatchResult = {
  face_index: number;
  student_id: string | null;
  confidence: number;
  recognized: boolean;
};

type ProcessResponse = {
  success: boolean;
  classId: string;
  detectedFaces: number;
  recognizedFaces: number;
  matches: MatchResult[];
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      const [, base64 = ""] = value.split(",");
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function FacultyDashboard() {
  const [classId, setClassId] = useState("");
  const [threshold, setThreshold] = useState("0.6");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ProcessResponse | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!classId || !file) {
      setError("Provide class ID and class photo.");
      return;
    }

    setLoading(true);
    try {
      const imageBase64 = await fileToBase64(file);
      const response = await fetch(`${env.VITE_SERVER_URL}/api/attendance/process-photo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId,
          imageBase64,
          threshold: Number(threshold),
        }),
      });

      const data = (await response.json()) as ProcessResponse | { message: string };
      if (!response.ok) {
        throw new Error("message" in data ? data.message : "Processing failed");
      }

      setResult(data as ProcessResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Mark Attendance</h2>

      <form className="space-y-3 border p-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm" htmlFor="classId">
            Class ID
          </label>
          <input
            id="classId"
            className="w-full border px-2 py-1"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm" htmlFor="threshold">
            Threshold
          </label>
          <input
            id="threshold"
            className="w-full border px-2 py-1"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm" htmlFor="photo">
            Class Photo
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <button className="border px-3 py-1" disabled={loading} type="submit">
          {loading ? "Processing..." : "Process"}
        </button>
      </form>

      {error ? <p className="text-red-700">{error}</p> : null}

      {result ? (
        <div className="space-y-2 border p-4">
          <p>Class: {result.classId}</p>
          <p>Total Faces: {result.detectedFaces}</p>
          <p>Recognized Faces: {result.recognizedFaces}</p>

          <table className="w-full border text-sm">
            <thead>
              <tr>
                <th className="border p-1 text-left">Face</th>
                <th className="border p-1 text-left">Student ID</th>
                <th className="border p-1 text-left">Confidence</th>
                <th className="border p-1 text-left">Recognized</th>
              </tr>
            </thead>
            <tbody>
              {result.matches.map((match) => (
                <tr key={match.face_index}>
                  <td className="border p-1">{match.face_index + 1}</td>
                  <td className="border p-1">{match.student_id || "-"}</td>
                  <td className="border p-1">{match.confidence.toFixed(3)}</td>
                  <td className="border p-1">{match.recognized ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
