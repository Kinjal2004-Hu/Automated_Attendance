import { env } from "@Automated_Attendance/env/server";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const ML_SERVICE_URL = env.ML_SERVICE_URL || "http://localhost:8000";
const REQUEST_TIMEOUT = 60000; // 60 seconds

export interface FaceDetectionResult {
  success: boolean;
  detected_faces: number;
  faces: Array<{
    face_index: number;
    bounding_box: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    embedding: number[];
  }>;
  message?: string;
}

export interface FaceMatchingResult {
  success: boolean;
  matches: Array<{
    face_index: number;
    student_id: string | null;
    confidence: number;
    recognized: boolean;
  }>;
  message?: string;
}

/**
 * Convert image file to base64 string
 */
export async function imageToBase64(imagePath: string): Promise<string> {
  try {
    const imageBuffer = await fs.promises.readFile(imagePath);
    return imageBuffer.toString("base64");
  } catch (error) {
    throw new Error(`Failed to read image file: ${error}`);
  }
}

/**
 * Convert buffer to base64 string
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

/**
 * Detect faces in an image
 * @param imageBase64 - Base64 encoded image
 * @returns Detection results with embeddings
 */
export async function detectFaces(
  imageBase64: string
): Promise<FaceDetectionResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${ML_SERVICE_URL}/detect-faces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_base64: imageBase64,
      }),
      signal: controller.signal as any,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`ML Service error: ${response.status} - ${errorData}`);
    }

    const result = (await response.json()) as FaceDetectionResult;
    return result;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Face detection request timed out");
    }
    throw error;
  }
}

/**
 * Match detected face embeddings against student embeddings
 * @param detectedEmbeddings - Array of 128-dim face embeddings
 * @param studentEmbeddings - Map of student IDs to their embeddings
 * @param threshold - Matching threshold (default 0.6)
 * @returns Matching results
 */
export async function matchFaces(
  detectedEmbeddings: number[][],
  studentEmbeddings: Record<string, number[][]>,
  threshold: number = 0.6
): Promise<FaceMatchingResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${ML_SERVICE_URL}/match-faces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        detected_embeddings: detectedEmbeddings,
        student_embeddings: studentEmbeddings,
        threshold,
      }),
      signal: controller.signal as any,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`ML Service error: ${response.status} - ${errorData}`);
    }

    const result = (await response.json()) as FaceMatchingResult;
    return result;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Face matching request timed out");
    }
    throw error;
  }
}

/**
 * Perform full face detection and matching in one call
 * @param imageBase64 - Base64 encoded image
 * @param studentEmbeddings - Map of student IDs to their embeddings
 * @returns Combined detection and matching results
 */
export async function detectAndMatchFaces(
  imageBase64: string,
  studentEmbeddings: Record<string, number[][]>,
  threshold: number = 0.6
): Promise<FaceMatchingResult> {
  try {
    // First, detect faces
    const detectionResult = await detectFaces(imageBase64);

    if (!detectionResult.success || detectionResult.detected_faces === 0) {
      return {
        success: true,
        matches: [],
        message: "No faces detected",
      };
    }

    // Extract embeddings from detected faces
    const detectedEmbeddings = detectionResult.faces.map((f) => f.embedding);

    // Then match against student embeddings
    const matchingResult = await matchFaces(
      detectedEmbeddings,
      studentEmbeddings,
      threshold
    );

    return matchingResult;
  } catch (error) {
    throw new Error(`Face detection and matching failed: ${error}`);
  }
}

/**
 * Check if ML service is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${ML_SERVICE_URL}/health`, {
      signal: controller.signal as any,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Retry a function call with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(
    `Failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}
