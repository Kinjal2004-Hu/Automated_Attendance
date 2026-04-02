import os
import cv2
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from PIL import Image
import io
import logging

try:
    import face_recognition  # type: ignore
    FACE_RECOGNITION_AVAILABLE = True
except Exception:
    face_recognition = None
    FACE_RECOGNITION_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Attendance ML Service")

# Configuration
FACE_MATCH_THRESHOLD = float(os.getenv("FACE_MATCH_THRESHOLD", "0.6"))
MAX_PROCESSING_TIME = int(os.getenv("ML_PROCESSING_TIMEOUT_SECONDS", "60"))

# ============================================================================
# Request/Response Models
# ============================================================================

class FaceDetectionRequest(BaseModel):
    """Request to detect faces in an image"""
    image_base64: str  # Base64 encoded image

class FaceDetectionResponse(BaseModel):
    """Response with detected faces"""
    success: bool
    detected_faces: int
    faces: List[dict]  # Array of face data with bounding boxes and embeddings
    message: Optional[str] = None

class FaceMatchingRequest(BaseModel):
    """Request to match detected faces against embeddings"""
    detected_embeddings: List[List[float]]  # Array of 128-dim embeddings
    student_embeddings: dict  # { "student_id": [embeddings], ... }
    threshold: float = FACE_MATCH_THRESHOLD

class MatchResult(BaseModel):
    """Result of face matching"""
    face_index: int
    student_id: Optional[str] = None
    confidence: float
    recognized: bool

class FaceMatchingResponse(BaseModel):
    """Response with matching results"""
    success: bool
    matches: List[MatchResult]
    message: Optional[str] = None

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    face_recognition_available: bool

# ============================================================================
# Helper Functions
# ============================================================================

def base64_to_image(image_base64: str) -> np.ndarray:
    """Convert base64 string to OpenCV image"""
    try:
        import base64
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))
        return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception as e:
        logger.error(f"Error decoding image: {str(e)}")
        raise ValueError(f"Invalid image data: {str(e)}")

def image_to_rgb(image: np.ndarray) -> np.ndarray:
    """Convert BGR (OpenCV) to RGB (face_recognition)"""
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

def detect_faces_in_image(image: np.ndarray) -> List[tuple]:
    """Detect faces using face_recognition library
    Returns list of (top, right, bottom, left) for each face
    """
    try:
        if FACE_RECOGNITION_AVAILABLE and face_recognition is not None:
            rgb_image = image_to_rgb(image)
            face_locations = face_recognition.face_locations(rgb_image, model="hog")
            return face_locations

        # Fallback path when face_recognition/dlib is unavailable.
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        detector = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        detections = detector.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(40, 40),
        )

        face_locations: List[tuple] = []
        for (x, y, w, h) in detections:
            top = int(y)
            right = int(x + w)
            bottom = int(y + h)
            left = int(x)
            face_locations.append((top, right, bottom, left))

        return face_locations
    except Exception as e:
        logger.error(f"Error detecting faces: {str(e)}")
        raise

def extract_embeddings(image: np.ndarray, face_locations: List[tuple]) -> List[List[float]]:
    """Extract 128-dimensional face embeddings for detected faces"""
    try:
        if FACE_RECOGNITION_AVAILABLE and face_recognition is not None:
            rgb_image = image_to_rgb(image)
            embeddings = face_recognition.face_encodings(rgb_image, face_locations)
            return [emb.tolist() for emb in embeddings]

        # Fallback embedding: downsample each detected face to 16x8 grayscale => 128 values.
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        fallback_embeddings: List[List[float]] = []

        for (top, right, bottom, left) in face_locations:
            face_crop = gray[max(0, top):max(0, bottom), max(0, left):max(0, right)]
            if face_crop.size == 0:
                fallback_embeddings.append([0.0] * 128)
                continue

            resized = cv2.resize(face_crop, (16, 8), interpolation=cv2.INTER_AREA)
            normalized = (resized.astype(np.float32) / 255.0).flatten().tolist()
            fallback_embeddings.append(normalized)

        return fallback_embeddings
    except Exception as e:
        logger.error(f"Error extracting embeddings: {str(e)}")
        raise

def calculate_distance(embedding1: List[float], embedding2: List[float]) -> float:
    """Calculate L2 distance between two embeddings"""
    embedding1 = np.array(embedding1)
    embedding2 = np.array(embedding2)
    return float(np.linalg.norm(embedding1 - embedding2))

def match_embeddings(
    detected_embeddings: List[List[float]],
    student_embeddings: dict,
    threshold: float = FACE_MATCH_THRESHOLD
) -> List[MatchResult]:
    """Match detected embeddings against student embeddings"""
    results = []

    for face_idx, detected_emb in enumerate(detected_embeddings):
        best_match = {
            "student_id": None,
            "distance": float("inf"),
            "confidence": 0.0,
        }

        # Compare against all student embeddings
        for student_id, embeddings_list in student_embeddings.items():
            for student_emb in embeddings_list:
                distance = calculate_distance(detected_emb, student_emb)

                if distance < best_match["distance"]:
                    best_match["student_id"] = student_id
                    best_match["distance"] = distance

        # Calculate confidence (inverse of distance, bounded to [0, 1])
        confidence = max(0.0, min(1.0, 1.0 - best_match["distance"]))
        recognized = best_match["distance"] < threshold

        results.append(
            MatchResult(
                face_index=face_idx,
                student_id=best_match["student_id"] if recognized else None,
                confidence=confidence,
                recognized=recognized,
            )
        )

    return results

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        face_recognition_available=FACE_RECOGNITION_AVAILABLE,
    )

@app.post("/detect-faces", response_model=FaceDetectionResponse)
async def detect_faces(request: FaceDetectionRequest):
    """Detect all faces in an image and extract embeddings"""
    try:
        logger.info("Processing face detection request")

        # Decode image
        image = base64_to_image(request.image_base64)

        # Detect faces
        face_locations = detect_faces_in_image(image)
        logger.info(f"Detected {len(face_locations)} faces")

        if len(face_locations) == 0:
            return FaceDetectionResponse(
                success=True,
                detected_faces=0,
                faces=[],
                message="No faces detected",
            )

        # Extract embeddings
        embeddings = extract_embeddings(image, face_locations)

        # Format response
        faces = []
        for idx, (top, right, bottom, left) in enumerate(face_locations):
            faces.append({
                "face_index": idx,
                "bounding_box": {
                    "x": int(left),
                    "y": int(top),
                    "width": int(right - left),
                    "height": int(bottom - top),
                },
                "embedding": embeddings[idx],  # 128-dim vector
            })

        return FaceDetectionResponse(
            success=True,
            detected_faces=len(faces),
            faces=faces,
        )

    except ValueError as e:
        logger.error(f"Invalid input: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except Exception as e:
        logger.error(f"Error in face detection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Face detection failed: {str(e)}")

@app.post("/match-faces", response_model=FaceMatchingResponse)
async def match_faces(request: FaceMatchingRequest):
    """Match detected face embeddings against enrolled student embeddings"""
    try:
        logger.info(f"Matching {len(request.detected_embeddings)} faces against {len(request.student_embeddings)} students")

        # Validate input
        if not request.detected_embeddings:
            return FaceMatchingResponse(
                success=True,
                matches=[],
                message="No faces to match",
            )

        if not request.student_embeddings:
            return FaceMatchingResponse(
                success=True,
                matches=[
                    MatchResult(
                        face_index=idx,
                        student_id=None,
                        confidence=0.0,
                        recognized=False,
                    )
                    for idx in range(len(request.detected_embeddings))
                ],
                message="No enrolled students",
            )

        # Validate embedding dimensions
        for detected_emb in request.detected_embeddings:
            if len(detected_emb) != 128:
                raise ValueError(f"Invalid embedding dimension: expected 128, got {len(detected_emb)}")

        for embeddings_list in request.student_embeddings.values():
            for emb in embeddings_list:
                if len(emb) != 128:
                    raise ValueError(f"Invalid student embedding dimension: expected 128, got {len(emb)}")

        # Match embeddings
        matches = match_embeddings(
            request.detected_embeddings,
            request.student_embeddings,
            request.threshold,
        )

        recognized_count = sum(1 for m in matches if m.recognized)
        logger.info(f"Matched {recognized_count}/{len(matches)} faces")

        return FaceMatchingResponse(
            success=True,
            matches=matches,
        )

    except ValueError as e:
        logger.error(f"Invalid input: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except Exception as e:
        logger.error(f"Error in face matching: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Face matching failed: {str(e)}")

# ============================================================================
# Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_SERVICE_PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
