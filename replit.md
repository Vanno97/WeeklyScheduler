# Weekly Agenda Calendar App

## Overview

A full-stack calendar application built with React, Express.js, and PostgreSQL. The app allows users to manage appointments and categories with a clean, modern interface featuring a weekly calendar view, appointment scheduling, and email notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints for appointments and categories
- **Validation**: Zod schemas for request/response validation
- **Session Management**: PostgreSQL-based session storage

### Key Design Decisions
- **Monorepo Structure**: Shared schemas and types between client and server
- **TypeScript Throughout**: End-to-end type safety
- **Component-First UI**: Reusable shadcn/ui components
- **Mobile-First Design**: Responsive layout with dedicated mobile components

## Key Components

### Database Schema
- **Categories Table**: Stores appointment categories with colors
- **Appointments Table**: Stores appointment details with foreign key to categories
- **Session Storage**: PostgreSQL-based session management

### API Endpoints
- `GET /api/categories` - Fetch all categories
- `POST /api/categories` - Create new category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/appointments` - Fetch appointments (with date range filtering)
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Frontend Components
- **Calendar Grid**: Weekly view with time slots and appointment display
- **Event Modal**: Form for creating/editing appointments
- **Category Modal**: Management interface for categories
- **Mobile Menu**: Touch-friendly navigation for mobile devices
- **Week Navigation**: Controls for navigating between weeks

### Services
- **Notification Service**: Email notifications for upcoming appointments
- **Scheduler Service**: Conflict detection and appointment scheduling
- **Storage Service**: Abstracted data access layer with in-memory fallback

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **Server Processing**: Express routes handle requests with Zod validation
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **Response Handling**: Structured JSON responses with error handling
5. **UI Updates**: React components re-render based on query cache updates

### State Management Flow
- Server state managed by TanStack Query with automatic caching
- Form state handled by React Hook Form with Zod validation
- UI state managed by React hooks and context where needed

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database queries
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing
- **react-hook-form**: Form management
- **zod**: Schema validation

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **@types/node**: Node.js type definitions
- **drizzle-kit**: Database migrations and schema management

### Email Service
- **nodemailer**: Email sending functionality
- Configurable SMTP settings via environment variables
- HTML email templates for appointment reminders

## Deployment Strategy

### Development Setup
- Vite dev server for frontend with hot reload
- Express server with TypeScript compilation via tsx
- Database migrations managed through Drizzle Kit
- Environment variables for database and email configuration

### Production Build
- Frontend built to `dist/public` directory
- Backend bundled with esbuild for Node.js runtime
- Static file serving from Express in production
- Database schema pushed via `drizzle-kit push`

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment detection
- SMTP settings for email notifications (optional)
- Session secret for secure sessions

### Key Features
- **Conflict Detection**: Prevents overlapping appointments
- **Email Notifications**: 30-minute reminder emails
- **Responsive Design**: Works on desktop and mobile
- **Data Persistence**: PostgreSQL with automatic migrations
- **Type Safety**: End-to-end TypeScript integration
- **Error Handling**: Comprehensive error boundaries and API error handling