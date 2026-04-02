# Automated Attendance System with Deep Learning

A complete attendance management system that automatically detects and recognizes students in class photos using deep learning.

## Features

✅ **Student Face Enrollment** - Students can enroll with multiple face photos from different angles
✅ **Facial Recognition** - Deep learning-based automatic student detection and recognition
✅ **Class Photo Processing** - Faculty uploads class photo and system automatically marks attendance
✅ **Face Embeddings** - Uses 128-dimensional face embeddings for secure and efficient matching
✅ **Async Processing** - Supports both synchronous and asynchronous photo processing
✅ **Web & Mobile Support** - Works on desktop browsers and mobile devices
✅ **Attendance Records** - View, filter, and export attendance history
✅ **Confidence Scoring** - Shows confidence score for each recognized face
✅ **Manual Overrides** - Faculty can manually approve or mark attendance
✅ **Unrecognized Face Flagging** - Unknown faces are flagged, not auto-marked

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Web/Mobile)           │
│  - Student Enrollment Page                              │
│  - Faculty Dashboard                                    │
│  - Attendance Records Viewer                            │
└────────────────┬────────────────────────────────────────┘
                 │ (HTTP/WebSocket)
                 │
┌────────────────▼────────────────────────────────────────┐
│            Node.js/Express Backend (tRPC)               │
│  - Authentication & Authorization                       │
│  - Face Enrollment API                                 │
│  - Class Management API                                │
│  - Attendance Recording                                │
│  - ML Service Integration                              │
└────────────────┬────────────────────────────────────────┘
         ┌───────┴────────┐
         │                │
    ┌────▼───────┐  ┌────▼────────────┐
    │  MongoDB   │  │  Python ML      │
    │  Database  │  │  Service        │
    │            │  │  (FastAPI)      │
    │ - Students │  │ - Face Detection│
    │ - Classes  │  │ - Embeddings    │
    │ - Records  │  │ - Matching      │
    └────────────┘  └────────────────┘
```

## Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router 7** - Client-side routing
- **React Query** - Data fetching & caching
- **React Form** - Form handling
- **Tailwind CSS** - Styling
- **Zod** - Schema validation
- **tRPC Client** - Type-safe API calls

### Backend (Node.js)
- **Express.js** - Web framework
- **tRPC** - Type-safe RPC framework
- **Mongoose** - MongoDB ODM
- **Better Auth** - Authentication
- **Socket.io** - Real-time updates
- **TypeScript** - Type safety

### Backend (Python)
- **FastAPI** - Web framework
- **face_recognition** - Face detection & recognition (ResNet-based)
- **OpenCV** - Image processing
- **Pydantic** - Data validation
- **NumPy** - Numerical computing

### Database
- **MongoDB** - Document database

## Project Structure

```
Automated_Attendance/
├── apps/
│   ├── web/                          # React frontend
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── enroll.tsx        # Student enrollment page
│   │   │   │   ├── faculty-dashboard.tsx  # Faculty dashboard
│   │   │   │   └── attendance-records.tsx # Records viewer
│   │   │   ├── components/
│   │   │   │   ├── face-capture.tsx  # Camera capture component
│   │   │   │   └── face-upload.tsx   # File upload component
│   │   │   └── utils/
│   │   │       └── trpc.ts           # tRPC client
│   │   └── package.json
│   ├── server/                       # Express backend
│   │   ├── src/
│   │   │   ├── utils/
│   │   │   │   └── ml-service.ts    # ML service client
│   │   │   └── index.ts
│   │   └── package.json
│   └── ml-service/                   # Python ML microservice
│       ├── main.py                   # FastAPI app
│       ├── requirements.txt          # Python dependencies
│       └── Dockerfile               # Containerization
├── packages/
│   ├── api/                          # tRPC routers
│   │   ├── src/
│   │   │   ├── routers/
│   │   │   │   ├── index.ts
│   │   │   │   └── attendance.router.ts  # NEW
│   │   │   ├── context.ts
│   │   │   └── index.ts
│   │   └── package.json
│   ├── db/                           # Database layer
│   │   ├── src/
│   │   │   ├── models/
│   │   │   │   ├── auth.model.ts
│   │   │   │   └── attendance.model.ts  # NEW
│   │   │   └── index.ts
│   │   └── package.json
│   ├── auth/                         # Authentication
│   ├── env/                          # Environment setup
│   └── config/                       # TypeScript config
└── package.json
```

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+
- MongoDB (local or cloud)
- Git

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd Automated_Attendance
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install workspace dependencies (runs automatically)
npm install
```

### Step 3: Set Up Environment Variables

Create `.env.local` files in the following locations:

**apps/server/.env**
```
# Database
DATABASE_URL=mongodb://localhost:27017

# CORS
CORS_ORIGIN=http://localhost:5173

# ML Service
ML_SERVICE_URL=http://localhost:8000
FACE_MATCH_THRESHOLD=0.6

# Authentication
VITE_SERVER_URL=http://localhost:3000
```

**apps/web/.env**
```
VITE_SERVER_URL=http://localhost:3000
```

**apps/ml-service/.env**
```
ML_SERVICE_PORT=8000
FACE_MATCH_THRESHOLD=0.6
ML_PROCESSING_TIMEOUT_SECONDS=60
```

### Step 4: Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud service
# Just update DATABASE_URL in .env
```

### Step 5: Start Python ML Service

```bash
cd apps/ml-service

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start service
python main.py
```

The ML service will be available at `http://localhost:8000`

Health check: `curl http://localhost:8000/health`

### Step 6: Start Backend Server

```bash
# In root directory or apps/server
npm run dev

# Or use tsx for development
cd apps/server
npm run dev
```

Backend runs on `http://localhost:3000`

### Step 7: Start Frontend

```bash
# In new terminal
cd apps/web
npm run dev
```

Frontend runs on `http://localhost:5173`

### Step 8: Access the Application

- **Home**: http://localhost:5173
- **Student Enrollment**: http://localhost:5173/enroll
- **Faculty Dashboard**: http://localhost:5173/faculty-dashboard
- **Attendance Records**: http://localhost:5173/attendance-records
- **ML Service Docs**: http://localhost:8000/docs

## Usage Guide

### For Students

1. **Enroll with Face Photos**
   - Navigate to `/enroll`
   - Fill in personal information (name, email, student ID)
   - Capture or upload 2-3 face photos from different angles
   - Click "Complete Enrollment"
   - System extracts 128-dim face embeddings and stores them

### For Faculty

1. **Create a Class**
   - Go to Faculty Dashboard (`/faculty-dashboard`)
   - Enter or create a class
   - Set class name, course code, date/time

2. **Upload Class Photo**
   - Upload/capture a clear photo of the entire class
   - Choose processing mode:
     - **Sync**: Immediate results (blocks until done)
     - **Async**: Background processing (better UX)
   - Click "Process Photo"

3. **Review Results**
   - System detects all faces in the photo
   - Recognized students are shown with confidence scores
   - Unrecognized faces are flagged
   - Review and click "Mark Attendance"

4. **View Records**
   - Go to Attendance Records (`/attendance-records`)
   - Search by class ID
   - View attendance with filtering
   - Export to CSV

## API Documentation

### tRPC Endpoints (Backend)

**Attendance Router** (`/trpc/attendance`)

**Student Endpoints:**
- `enrollStudent` - POST: Enroll student with face embeddings
- `getMyEnrollmentStatus` - GET: Check enrollment status

**Faculty Endpoints:**
- `createClass` - POST: Create a new class
- `processClassPhoto` - POST: Process class photo and detect faces
- `getProcessingStatus` - GET: Check async job status
- `getClassAttendance` - GET: Retrieve attendance records
- `markManualAttendance` - POST: Manually mark/unmark attendance

### Python ML Service API

**FastAPI Endpoints** (http://localhost:8000)

- `GET /health` - Health check
- `POST /detect-faces` - Detect faces in image and extract embeddings
- `POST /match-faces` - Match embeddings against enrolled students

See http://localhost:8000/docs for interactive documentation

## Database Schema

### Student Collection
```javascript
{
  _id: String,
  userId: ObjectId (ref: User),
  name: String,
  email: String,
  studentId: String (unique),
  enrollmentDate: Date,
  status: "enrolled" | "pending" | "inactive",
  faceEmbeddingIds: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### FaceEmbedding Collection
```javascript
{
  _id: String,
  studentId: ObjectId (ref: Student),
  embedding: [Number] (128 values),
  source: "enrollment_photo_1" | "enrollment_photo_2" |  "enrollment_photo_3",
  uploadedAt: Date,
  createdAt: Date
}
```

### Class Collection
```javascript
{
  _id: String,
  name: String,
  courseCode: String,
  facultyId: ObjectId (ref: User),
  date: Date,
  startTime: Date,
  endTime: Date,
  status: "not_started" | "ongoing" | "completed",
  createdAt: Date,
  updatedAt: Date
}
```

### AttendanceRecord Collection
```javascript
{
  _id: String,
  classId: ObjectId (ref: Class),
  studentId: ObjectId (ref: Student),
  markedAt: Date,
  confidenceScore: Number (0-1),
  recognitionMethod: "face_matching" | "manual_override",
  flagged: Boolean,
  flagReason: "not_recognized" | "low_confidence",
  createdAt: Date,
  updatedAt: Date
}
```

## Configuration

### Face Matching Threshold

Default: `0.6`

The threshold determines how strict face matching is:
- **Lower (0.4-0.5)**: More liberal, higher false positives
- **Default (0.6)**: Balanced accuracy
- **Higher (0.7-0.8)**: More strict, higher false negatives

Adjust in `.env`:
```
FACE_MATCH_THRESHOLD=0.6
```

### Maximum Photo Sizes

- Enrollment photos: 10MB each
- Class photos: 20MB

### Timeout Settings

- ML processing: 60 seconds (default)
- Request timeout: 30 seconds

## Performance Considerations

### Face Recognition Accuracy

Factors affecting accuracy:
- Photo quality (lighting, clarity)
- Face angle (front-facing is best)
- Multiple enrollment photos improve accuracy
- Threshold tuning may be needed for your use case

### Scalability

- **Local deployment**: Works for small classes (10-50 students)
- **Multi-server**: Run multiple ML service instances with load balancer
- **Cloud deployment**: Use Docker containers on Kubernetes/ECS
- **Database**: MongoDB scaling via sharding for large datasets

### Optimization Tips

1. **Reduce image size**: Downscale class photos for faster processing
2. **Batch processing**: Process multiple classes asynchronously
3. **Caching**: Cache embeddings to avoid recomputation
4. **Model optimization**: Use ONNX for faster inference

## Security Considerations

1. **Face Data Privacy**
   - Face embeddings are stored, not original photos (optional)
   - Embeddings cannot be reversed to original photos
   - Implement role-based access control

2. **Authentication**
   - Uses better-auth with session tokens
   - Implement MFA for faculty accounts
   - Secure token storage in httpOnly cookies

3. **API Security**
   - Validate all inputs with Zod schemas
   - Use CORS with specific origins
   - Rate limiting on API endpoints
   - HTTPS in production

## Troubleshooting

### ML Service Not Responding

```bash
# Check if service is running
curl http://localhost:8000/health

# Check logs
# Look for error messages in ML service terminal

# Restart service
# Kill process and restart
```

### Face Not Detected

- Ensure photo is clear and well-lit
- Face should be at least 20x20 pixels
- Try different angles or lighting conditions
- Check image format and size

### Low Recognition Accuracy

- Enroll with photos in different lighting conditions
- Increase number of enrollment photos
- Adjust FACE_MATCH_THRESHOLD in .env
- Ensure good quality class photo

### Database Connection Issues

```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017"

# Or check Atlas connection string
# Update DATABASE_URL if needed
```

## Development

### Build for Production

```bash
# Frontend
cd apps/web
npm run build

# Backend
cd apps/server
npm run build

# Python ML Service
# Build Docker image
cd apps/ml-service
docker build -t attendance-ml-service .
```

### Run Tests

```bash
# Backend tests
npm test

# Frontend tests
cd apps/web
npm run test
```

### Code Quality

```bash
# Type checking
npm run check-types

# Linting (if configured)
npm run lint
```

## Deployment

### Docker Deployment

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up

# View logs
docker-compose logs -f
```

### Cloud Deployment (AWS/GCP/Azure)

1. **Frontend**: Deploy to S3/CloudFront or Vercel/Netlify
2. **Backend**: Deploy to EC2/App Engine/App Service
3. **ML Service**: Deploy to ECS/Cloud Run/Container Instances
4. **Database**: Use managed MongoDB Atlas or RDS

## API Rate Limits (Recommended)

- `/enroll`: 10 requests per hour per user
- `/process-photo`: 100 requests per day per faculty
- `/match-faces`: No limit (backend service)

## Future Enhancements

- [ ] Real-time live class monitoring
- [ ] Mobile app (React Native)
- [ ] Iris/fingerprint recognition as fallback
- [ ] Advanced analytics dashboard
- [ ] Integration with student information system
- [ ] SMS/Email attendance notifications
- [ ] Liveness detection (prevent photos attacks)
- [ ] Batch enrollment from student database
- [ ] Calendar-based class scheduling
- [ ] Automated reports generation

## License

[Add your license here]

## Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Email: support@attendance.system
- Documentation: [Add docs link]

## Contributors

[Add contributor guidelines]

---

**Last Updated**: March 2026
**Version**: 1.0.0
