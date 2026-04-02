import { FormEvent, useState } from "react";
import { env } from "@Automated_Attendance/env/web";

type EnrollResponse = {
  success: boolean;
  studentId: string;
  embeddingsCount: number;
  totalEnrolled: number;
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

export function EnrollmentPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!name || !email || !studentId || files.length === 0) {
      setError("Fill all fields and upload at least one image.");
      return;
    }

    setLoading(true);
    try {
      const imagesBase64 = await Promise.all(files.map(fileToBase64));

      const response = await fetch(`${env.VITE_SERVER_URL}/api/students/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          studentId,
          imagesBase64,
        }),
      });

      const data = (await response.json()) as EnrollResponse | { message: string };
      if (!response.ok) {
        throw new Error("message" in data ? data.message : "Enrollment failed");
      }

      setMessage(
        `Enrolled ${studentId}. Saved ${data.embeddingsCount} embeddings. Total students: ${data.totalEnrolled}`,
      );
      setName("");
      setEmail("");
      setStudentId("");
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enrollment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">Enroll Student</h2>

      <form className="space-y-3 border p-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="w-full border px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="w-full border px-2 py-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm" htmlFor="studentId">
            Student ID
          </label>
          <input
            id="studentId"
            className="w-full border px-2 py-1"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm" htmlFor="photos">
            Face Photos
          </label>
          <input
            id="photos"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          <p className="text-xs">Selected: {files.length}</p>
        </div>

        <button className="border px-3 py-1" disabled={loading} type="submit">
          {loading ? "Submitting..." : "Enroll"}
        </button>
      </form>

      {message ? <p className="text-green-700">{message}</p> : null}
      {error ? <p className="text-red-700">{error}</p> : null}
    </section>
  );
}
