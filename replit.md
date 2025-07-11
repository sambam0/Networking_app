# RealConnect - Event Networking Application

## Overview

RealConnect is a modern full-stack web application designed to facilitate authentic connections at events and parties. The application allows users to create events, join events via QR codes, browse attendee profiles, and connect with other participants based on shared interests and backgrounds.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with in-memory storage
- **File Uploads**: Multer for handling profile photos
- **Development**: Hot reloading with Vite integration

### Database Strategy
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via DATABASE_URL)
- **Schema**: Shared schema definitions between client and server
- **Development**: In-memory storage implementation for development/testing

## Key Components

### Authentication System
- Session-based authentication using Express sessions
- User registration with comprehensive profile creation
- Protected routes requiring authentication
- Password-based login system

### Event Management
- Event creation with host assignment
- QR code generation for event access
- Event discovery and joining functionality
- Attendee management and tracking

### Profile System
- Rich user profiles with interests, background, and aspirations
- Profile photo uploads with file validation
- Social media links integration
- Interest-based matching

### Connection System
- User-to-user connections within events
- Connection tracking and management
- Profile browsing and discovery

### UI/UX Components
- Responsive design with mobile-first approach
- Dark/light theme support
- Toast notifications for user feedback
- Modal dialogs for detailed interactions
- Loading states and error handling

## Data Flow

1. **User Authentication**: Users register/login → Session created → Access to protected routes
2. **Event Creation**: Authenticated users create events → QR codes generated → Events stored
3. **Event Joining**: Users scan QR codes → Join events → Added to attendee list
4. **Profile Discovery**: Event attendees browse profiles → View detailed information
5. **Connection Making**: Users connect with others → Connections tracked per event

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- TanStack Query for data fetching
- Radix UI for accessible components
- Tailwind CSS for styling
- React Hook Form with Zod validation
- Lucide React for icons

### Backend Dependencies
- Express.js with session support
- Drizzle ORM with PostgreSQL adapter
- Multer for file uploads
- Zod for schema validation
- Nanoid for unique ID generation

### Development Tools
- Vite for build tooling
- TypeScript for type safety
- ESBuild for server bundling
- Replit-specific plugins for development

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with hot reloading
- tsx for running TypeScript server code
- Integrated development with Replit cartographer

### Production Build
- Vite builds optimized frontend bundle
- ESBuild bundles server code with external dependencies
- Static files served from dist/public
- Express server serves both API and static assets

### Environment Configuration
- DATABASE_URL for PostgreSQL connection
- SESSION_SECRET for session encryption
- NODE_ENV for environment-specific behavior
- File upload configuration with size limits

The application is designed to be scalable and maintainable, with clear separation of concerns and modern development practices throughout the stack.