# Automated_Attendance

This file provides context about the project for AI assistants.

## Project Overview

- **Ecosystem**: Typescript

## Tech Stack

- **Runtime**: node
- **Package Manager**: npm

### Frontend

- Framework: react-vite
- CSS: tailwind
- UI Library: shadcn-ui
- State: redux-toolkit

### Backend

- Framework: express
- API: trpc
- Validation: zod

### Database

- Database: mongodb
- ORM: mongoose

### Authentication

- Provider: better-auth

### Additional Features

- Testing: vitest
- Realtime: socket-io

## Project Structure

```
Automated_Attendance/
├── apps/
│   ├── web/         # Frontend application
│   └── server/      # Backend API
├── packages/
│   ├── api/         # API layer
│   ├── auth/        # Authentication
│   └── db/          # Database schema
```

## Common Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open database UI

## Maintenance

Keep Agents.md updated when:

- Adding/removing dependencies
- Changing project structure
- Adding new features or services
- Modifying build/dev workflows

AI assistants should suggest updates to this file when they notice relevant changes.
