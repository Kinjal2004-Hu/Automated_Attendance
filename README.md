# 🎯 Automated Attendance System

A comprehensive attendance management system with facial recognition, AI-powered analytics, and role-based dashboards.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Flow](#project-flow)
- [Setup Instructions](#setup-instructions)
- [Running Services](#running-services)
- [API Documentation](#api-documentation)
- [Usage Examples](#usage-examples)

## 🎯 Project Overview

The Automated Attendance System is a full-stack application that automates attendance marking using:

- **Facial Recognition**: Python ML service for face detection and matching
- **Smart Enrollment**: Students enroll with face photos
- **Classroom Attendance**: Faculty capture attendance photos, AI identifies and marks present students
- **AI Analytics**: Bytez.js (GPT-4o) generates insights, recommendations, and reports
- **Role-Based Access**: Different dashboards for Students, Faculty, and Admins
- **Dashboard Analytics**: Interactive charts showing trends, statistics, and flagged records

### ✨ Key Features

- ✅ **Protected Routes** - All routes guarded with auth check
- ✅ **Role-Based Access** - Different UIs for student/faculty/admin
- ✅ **Facial Recognition** - Automatic attendance marking via face detection
- ✅ **Professional Dashboard** - Role-specific dashboards with stats
- ✅ **AI Analytics** - GPT-4o powered insights and recommendations
- ✅ **Interactive Charts** - Recharts visualizations (line, pie, bar)
- ✅ **Edit Attendance** - Modal-based record editing and flagging
- ✅ **CSV Export** - Download attendance data as CSV
- ✅ **Dark Mode** - Full dark mode support
- ✅ **Responsive Design** - Mobile-friendly layout
- ✅ **Form Validation** - Zod + React Form validation
- ✅ **Authentication** - Sign-up with role selection

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Frontend (React + Vite)                     │
│   ┌─────────────┬──────────────┬──────────────┐            │
│   │   Student   │    Faculty   │    Admin      │            │
│   │ Dashboard   │  Dashboard   │  Dashboard    │            │
│   └─────────────┴──────────────┴──────────────┘            │
└─────────────────────────────────────────────────────────────┘
                           ↓
                   tRPC + REST API
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express + tRPC)                       │
│  ┌──────────────┬────────────┬───────────┬─────────────┐  │
│  │ Attendance   │ Analytics  │ Admin     │ AI Router   │  │
│  │ Router       │ Router     │ Router    │ (Bytez.js)  │  │
│  └──────────────┴────────────┴───────────┴─────────────┘  │
└─────────────────────────────────────────────────────────────┘
         ↓                          ↓
  ┌────────────┐        ┌─────────────────┐
  │ MongoDB    │        │ ML Service      │
  │ Database   │        │ (Python/FastAPI)│
  │            │        │                 │
  │ - Users    │        │ - Face Detection│
  │ - Classes  │        │ - Face Matching │
  │ - Attendance        │ - Embeddings    │
  └────────────┘        └─────────────────┘
                              ↓
                    ┌──────────────────┐
                    │ Bytez.js API     │
                    │ (GPT-4o)         │
                    └──────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **UI Library**: shadcn-ui + Tailwind CSS v4
- **Forms**: @tanstack/react-form + Zod validation
- **HTTP**: tRPC + React Query
- **Charts**: Recharts (line, pie, bar charts)
- **Auth**: better-auth
- **Icons**: lucide-react

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **API**: tRPC (type-safe APIs)
- **Validation**: Zod
- **Auth**: better-auth with MongoDB adapter
- **ORM**: Mongoose

### Database
- **Primary**: MongoDB
- **Schema**: Mongoose

### ML Service
- **Framework**: FastAPI (Python)
- **Face Detection**: OpenCV
- **Face Recognition**: face-recognition library
- **Server**: Uvicorn

### AI Integration
- **Provider**: Bytez.js
- **Model**: GPT-4o
- **Features**: Insights, student analysis, report generation

### DevOps
- **Build System**: Turbo (monorepo)
- **Testing**: Vitest
- **Realtime**: Socket.io

## 📊 Project Flow

### 1️⃣ Enrollment Flow
```
Student signs up with role → Profile creation → Face enrollment
                              ↓
                     ML Service processes images
                              ↓
                   Face embeddings extracted & stored
```

### 2️⃣ Attendance Capture Flow
```
Faculty takes class photo → Backend receives
                            ↓
                   ML Service processes image
                            ↓
                 Face detection & matching vs enrolled students
                            ↓
                   Attendance records marked
                            ↓
           Faculty reviews, flags suspicious records
```

### 3️⃣ Analytics & AI Flow
```
Daily attendance data collected → Sent to Bytez.js (GPT-4o)
                                   ↓
                        AI analyzes patterns
                                   ↓
                     Generates insights & recommendations
                                   ↓
                  Displayed in Analytics Dashboard
```

### 4️⃣ Access Control Flow
```
User Login → better-auth validates → Role determined
                                      ↓
                              Protected routes check
                                      ↓
                          Display role-based dashboard
```

## 📦 Setup Instructions

### Prerequisites
- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **npm**: v10+ (included with Node)
- **Python**: v3.8+ ([Download](https://www.python.org/))
- **MongoDB**: Local or cloud instance ([Setup Guide](https://docs.mongodb.com/manual/installation/))

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd Automated_Attendance
```

### Step 2: Install Dependencies
```bash
# Install all workspace dependencies
npm install

# This installs:
# - Root packages
# - Frontend (apps/web)
# - Backend (apps/server)
# - Packages (api, auth, db, env)
```

### Step 3: Install ML Service Dependencies
```bash
cd apps/ml-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

#### Backend Configuration
Create `apps/server/.env`:
```env
# Authentication
BETTER_AUTH_SECRET=ulidvpula8CvztUjWywPmAvpw6ueGJUb
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173

# Database
DATABASE_URL=mongodb://localhost:27017/mydatabase

# AI Service (Bytez.js)
BYTEZ_API_KEY=3f2f23f370ffbb76a806b756ee5db640

# Optional: Google AI
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

#### Frontend Configuration
Create `apps/web/.env`:
```env
VITE_SERVER_URL=http://localhost:3000
```

#### ML Service Configuration
Create `apps/ml-service/.env`:
```env
FACE_MATCH_THRESHOLD=0.6
ML_PROCESSING_TIMEOUT_SECONDS=60
```

### Step 5: Database Setup
```bash
# Make sure MongoDB is running
mongod

# Verify connection in apps/server/.env
# DATABASE_URL=mongodb://localhost:27017/mydatabase
```

## 🚀 Running Services

### Option 1: Run All Services at Once (Recommended)
```bash
# From root directory
npm run dev

# This will start:
# ✓ Frontend (Vite) - http://localhost:5173
# ✓ Backend (Express) - http://localhost:3000
# ✓ Type checking in parallel
```

### Option 2: Run Individual Services

#### Frontend Only
```bash
npm run dev:web
# Runs on http://localhost:5173
```

#### Backend Only
```bash
npm run dev:server
# Runs on http://localhost:3000
```

#### ML Service
```bash
cd apps/ml-service

# Ensure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

python main.py
# Runs on http://localhost:8000
```

### Option 3: Production Build
```bash
# Build all services
npm run build

# Start production server
npm start
```

### Option 4: Type Checking
```bash
# Check TypeScript types
npm run check-types
```

## 🌐 Access the Application

After running `npm run dev`:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Web application |
| **API** | http://localhost:3000/trpc | tRPC endpoints |
| **ML Service** | http://localhost:8000 | Face detection API |
| **Health Check** | http://localhost:3000/api/health | Server status |

## 📡 API Documentation

### Authentication Endpoints
```
POST   /api/auth/sign-up        - Register new user with role
POST   /api/auth/sign-in        - Login user
POST   /api/auth/sign-out       - Logout user
GET    /api/auth/session        - Get current session
```

### Attendance API (tRPC)
```
attendance.getRecords          - Get attendance records (paginated)
attendance.createAttendance    - Mark student attendance
attendance.updateAttendance    - Update flagged status
attendance.deleteAttendance    - Delete attendance record
```

### ML Service Endpoints
```
POST   /detect-faces                - Detect faces in image
POST   /match-faces                 - Match faces vs embeddings
POST   /students/enroll             - Enroll student (with face photos)
GET    /students                    - Get enrolled students list
POST   /attendance/process-photo    - Process class attendance photo
GET    /attendance/:classId         - Get class attendance results
GET    /health                      - Health check
```

### AI Endpoints (Bytez.js / tRPC)
```
ai.sendMessage                      - Send custom message to GPT-4o
ai.generateAttendanceInsights       - Analyze attendance data
ai.analyzeStudent                   - Individual student analysis
ai.generateReport                   - Generate summary report

REST Endpoints:
POST   /api/ai/message              - Send message
POST   /api/ai/attendance-insights  - Get insights
POST   /api/ai/student-analysis     - Analyze student
POST   /api/ai/report               - Generate report
```

### Analytics API (tRPC)
```
analytics.getClassStatistics       - Class-wise statistics
analytics.getSystemOverview        - System-wide metrics
analytics.getAttendanceTrends      - Trends over 30 days
analytics.getTopFlaggedRecords     - Flagged records list
```

### Admin API (tRPC)
```
admin.listUsers                    - List users (paginated)
admin.updateUserRole               - Change user role
admin.removeUser                   - Delete user
admin.getSystemStats               - System statistics
```

## 💻 Usage Examples

### Using AI Hook (Frontend)
```typescript
import { useAI } from '@/hooks/useAI';

export function AnalyticsPage() {
  const { generateAttendanceInsights, loading, error } = useAI();

  const handleAnalyze = async () => {
    try {
      const insights = await generateAttendanceInsights({
        totalStudents: 100,
        presentToday: 85,
        absentToday: 15,
        averageAttendance: 87.5
      });
      console.log('Insights:', insights);
      // {
      //   summary: "Attendance is stable...",
      //   recommendations: ["...", "..."],
      //   flaggedIssues: [...]
      // }
    } catch (err) {
      console.error('Failed to generate insights', err);
    }
  };

  return (
    <button onClick={handleAnalyze} disabled={loading}>
      {loading ? 'Analyzing...' : 'Generate AI Insights'}
    </button>
  );
}
```

### Using tRPC (Frontend)
```typescript
import { trpc } from '@/utils/trpc';

export function Dashboard() {
  const analytics = await trpc.analytics.getSystemOverview.query();
  const insights = await trpc.ai.generateAttendanceInsights.mutate({
    totalStudents: 100,
    presentToday: 85,
    absentToday: 15
  });

  return <div>{/* Display insights */}</div>;
}
```

### REST API Call (Backend/External)
```bash
# Send message to AI
curl -X POST http://localhost:3000/api/ai/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Analyze attendance patterns"}'

# Generate insights
curl -X POST http://localhost:3000/api/ai/attendance-insights \
  -H "Content-Type: application/json" \
  -d '{
    "totalStudents": 100,
    "presentToday": 85,
    "absentToday": 15,
    "averageAttendance": 87.5
  }'

# ML Service: Process attendance photo
curl -X POST http://localhost:8000/attendance/process-photo \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "CS101",
    "imageBase64": "...",
    "threshold": 0.6
  }'
```

## 📁 Project Structure

```
Automated_Attendance/
├── apps/
│   ├── web/                    # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── routes/         # Page components for routing
│   │   │   ├── hooks/          # Custom hooks (useAI, etc.)
│   │   │   ├── utils/          # Utilities (trpc, export, attendance)
│   │   │   └── lib/            # Library setup (auth-client, utils)
│   │   ├── .env                # Frontend environment variables
│   │   └── package.json
│   │
│   ├── server/                 # Backend (Express + tRPC)
│   │   ├── src/
│   │   │   ├── utils/
│   │   │   │   ├── ml-service.ts    # ML Service integration
│   │   │   │   ├── ai-service.ts    # Bytez.js AI integration
│   │   │   │   └── export.ts        # CSV export utilities
│   │   │   └── index.ts        # Express server & endpoints
│   │   ├── .env                # Backend environment variables
│   │   └── package.json
│   │
│   └── ml-service/             # Python ML Service (FastAPI)
│       ├── main.py             # FastAPI application
│       ├── requirements.txt    # Python dependencies
│       ├── .env                # ML Service config
│       └── venv/               # Python virtual environment
│
├── packages/
│   ├── api/                    # tRPC API routers (shared)
│   │   └── src/
│   │       ├── routers/        # API route definitions
│   │       │   ├── index.ts          # Main appRouter
│   │       │   ├── attendance.router.ts
│   │       │   ├── analytics.router.ts
│   │       │   ├── admin.router.ts
│   │       │   └── ai.router.ts
│   │       └── index.ts        # API context & procedures
│   │
│   ├── auth/                   # Authentication setup
│   │   └── src/index.ts        # better-auth configuration
│   │
│   ├── db/                     # Database models
│   │   └── src/models/         # Database schemas
│   │
│   ├── env/                    # Environment variables
│   │   ├── src/
│   │   │   ├── server.ts       # Backend env schema
│   │   │   └── web.ts          # Frontend env schema
│   │
│   └── config/                 # Shared configuration
│       └── src/
│           └── tsconfig.json   # TypeScript configuration
│
├── package.json                # Root workspace configuration
├── CLAUDE.md                   # Project context for AI assistants
└── README.md                   # This file
```

## 🔐 Role-Based Access Control

### 👨‍🎓 Student Dashboard
- View own attendance records
- Download personal reports
- Enroll with face photos
- Check attendance statistics

### 👨‍🏫 Faculty Dashboard
- View class-wise attendance
- Capture attendance with photos
- Mark attendance manually
- Flag suspicious records
- View class statistics
- Generate class reports

### 👨‍💼 Admin Dashboard
- View system-wide statistics
- Manage user roles
- Remove/deactivate users
- View all attendance records
- Access complete analytics
- System configuration

## ⚙️ Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BETTER_AUTH_SECRET` | Session encryption secret | - | ✓ |
| `BETTER_AUTH_URL` | Auth service base URL | http://localhost:3000 | ✓ |
| `CORS_ORIGIN` | Frontend origin for CORS | http://localhost:5173 | ✓ |
| `DATABASE_URL` | MongoDB connection string | mongodb://localhost:27017/mydatabase | ✓ |
| `BYTEZ_API_KEY` | Bytez.js API key for GPT-4o | - | ✓ |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key (optional) | - | ✗ |
| `VITE_SERVER_URL` | Backend API URL (frontend) | http://localhost:3000 | ✓ |
| `FACE_MATCH_THRESHOLD` | Face matching accuracy (0-1) | 0.6 | ✗ |
| `ML_PROCESSING_TIMEOUT_SECONDS` | ML service timeout | 60 | ✗ |

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 📊 Command Reference

### Root Commands
```bash
npm run dev              # Start all services
npm run dev:web        # Start frontend only
npm run dev:server     # Start backend only
npm run build          # Build all services
npm run check-types    # Check TypeScript types
```

### Database Commands
```bash
npm run db:push        # Push database schema
npm run db:studio      # Open database UI
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB server
mongod

# Verify connection string
# DATABASE_URL=mongodb://localhost:27017/mydatabase
```

### ML Service Not Found
```bash
# Check if ML service is running
curl http://localhost:8000/health

# Ensure Python virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Verify dependencies
pip install -r requirements.txt
```

### Bytez.js API Key Invalid
```bash
# Verify API key in apps/server/.env
BYTEZ_API_KEY=3f2f23f370ffbb76a806b756ee5db640

# Restart backend service
npm run dev:server
```

### Frontend Can't Connect to Backend
```bash
# Verify both services are running
# Frontend: http://localhost:5173
# Backend: http://localhost:3000

# Check CORS_ORIGIN in apps/server/.env
CORS_ORIGIN=http://localhost:5173

# Check VITE_SERVER_URL in apps/web/.env
VITE_SERVER_URL=http://localhost:3000
```

### Face Recognition Not Detecting Faces
```bash
# Ensure ML service dependencies are installed
pip install face-recognition

# Check image quality and face visibility
# Faces should be clear and facing toward camera
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Express.js Guide](https://expressjs.com/en/starter/hello-world.html)
- [tRPC Documentation](https://trpc.io)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [better-auth](https://better-auth.com)

## 🐞 Known Issues

- Face detection accuracy depends on image quality and lighting
- Large batch attendance processing may take time (60s timeout)
- ML service requires significant memory for face embeddings

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👥 Team

Developed with modern TypeScript stack technologies

## 📞 Support & Contact

For support, questions, or bug reports:
- Check the troubleshooting section above
- Review API documentation
- Refer to CLAUDE.md for project context

---

**Last Updated**: April 2, 2026
**Status**: Production Ready ✅
**Version**: 1.0.0
