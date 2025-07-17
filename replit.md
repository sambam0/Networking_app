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
- **Database**: PostgreSQL with Neon (configured via DATABASE_URL)
- **Schema**: Shared schema definitions between client and server with relations
- **Storage**: DatabaseStorage implementation using PostgreSQL instead of in-memory storage

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

## Recent Changes

### Google OAuth Authentication Integration (July 2025)
- Complete Google OAuth authentication system with Passport.js integration
- Updated database schema to support Google sign-up users with new fields:
  - `googleId`: Unique identifier for Google OAuth users
  - `authProvider`: Track authentication method (email/google)
  - Made password field optional for Google OAuth users
- Created reusable Google sign-in button component with error handling
- Added Google sign-in buttons to both login and signup pages with visual separators
- Implemented conditional Google OAuth configuration that gracefully handles missing credentials
- Domain configuration updated to use `realconnect.ing` for proper OAuth callback URLs
- Enhanced user creation flow to support both email and Google authentication methods
- Added proper error handling for unconfigured Google OAuth credentials
- Updated all database queries to include new Google OAuth fields for type safety

### Enhanced Profile System with Location & Education (July 2025)
- Added separate fields for hometown, state, college, and high school in user profiles
- Updated database schema with new location and education columns
- Enhanced signup and profile forms with dedicated location and education sections
- Updated profile cards and modals to display new information with icons
- Maintained backward compatibility with legacy school field

### Enhanced Attendee Profile Display (July 2025)
- Redesigned attendee lists with comprehensive profile previews
- New enhanced attendee cards showing full profile information:
  - Location (hometown, state) with location icons
  - Education details (college, high school) with academic icons
  - Background and aspirations preview with truncated text
  - Interest badges with overflow indicators
  - Action buttons for connecting and viewing full profiles
- Improved responsive grid layout (2 columns on tablet, 3 on desktop)
- Better loading states with detailed skeleton components
- Enhanced user experience for discovering and connecting with event attendees

### One-Click Social Media Integration (July 2025)
- Comprehensive social media platform support with 8 major platforms:
  - LinkedIn, X (Twitter), Instagram, GitHub, YouTube, TikTok, Facebook, and personal websites
  - Quick setup feature with username-to-URL conversion for fast profile linking
  - One-click copy and external link buttons for easy sharing
  - Smart form validation with platform-specific URL checking
- Enhanced profile display with social media integration:
  - Color-coded social media buttons in profile modals and attendee cards
  - Direct link access with proper click handling (stops event propagation)
  - Professional presentation with platform-specific styling and icons
- Networking enhancement features:
  - Pro tips integration with best practices for social media networking
  - Enhanced attendee discovery through social profile previews
  - Quick connection facilitation through visible social media presence

### Advanced Recommendation Engine (July 2025)
- Enhanced people recommendation algorithm with sophisticated scoring:
  - Location matching: Same hometown (7 pts), same state (4 pts)
  - Education matching: Same college (8 pts), same high school (6 pts)
  - Shared interests (5 pts per interest)
  - Age proximity with graduated scoring
  - Background and aspirations similarity through keyword matching
- Improved event recommendations to consider attendee location and education
- Recommendations now provide meaningful matches based on 5 key criteria: location, education, interests, aspirations, and age

### Database Migration (January 2025)
- Migrated from in-memory storage to PostgreSQL database using Neon
- Added database relations between users, events, attendees, and connections
- Implemented DatabaseStorage class replacing MemStorage
- Successfully pushed schema to production database
- Updated all CRUD operations to use database instead of in-memory maps

The application is designed to be scalable and maintainable, with clear separation of concerns and modern development practices throughout the stack.