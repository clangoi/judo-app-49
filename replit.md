# Judo Training Management System

## Overview

This is a full-stack web application for managing judo training, athlete performance tracking, and club management. The system serves multiple user roles including athletes (practicantes), trainers (entrenadores), and administrators (admin) with role-based access control and comprehensive training management features.

## User Preferences

Preferred communication style: Simple, everyday language.
Terminology: Refer to users as "deportistas" instead of "estudiantes" or "practicantes". The system now handles multiple sports, not just Judo - avoid sport-specific references in UI.

## Recent Changes (July 19, 2025)

### Access Control Improvements
- ✓ Restricted nutritional evolution chart visibility to administrators only
- ✓ Integrated useUserRoles hook in Graficos.tsx for role-based access control
- ✓ Applied conditional rendering using isAdmin() function

### Sports Management Bug Fixes
- ✓ Completely rewrote AdminSports.tsx component to resolve persistent editing bugs
- ✓ Implemented cleaner modal state management with modalOpen and editingId
- ✓ Eliminated event handler conflicts through code restructuring
- ✓ Improved form submission and field interaction reliability

### Weight Categories Implementation
- ✓ Expanded sports database schema to include weight_categories (JSONB column)
- ✓ Created comprehensive weight category management in AdminSports.tsx
- ✓ Implemented gender-specific (masculino, femenino, mixto) weight categories
- ✓ Added age-category-specific weight divisions
- ✓ Applied database migration to add weight_categories column to existing sports table

### Technical Improvements
- Enhanced role-based access control implementation
- Improved component architecture for better maintainability
- Resolved form event conflicts in modal dialogs
- Enhanced type safety for weight category structures

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom design system using HSL color values
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: React Router v6 for client-side navigation
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Custom React context with Supabase Auth

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (specifically configured for Neon serverless)
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **Development**: Hot module replacement via Vite in development mode

### Directory Structure
```
├── client/          # Frontend React application
├── server/          # Express.js backend
├── shared/          # Shared schemas and types
└── migrations/      # Database migration files
```

## Key Components

### Authentication & Authorization
- **Multi-role system**: practicante (athlete), entrenador (trainer), admin
- **JWT-based authentication** through Supabase
- **Role-based access control** implemented via database functions
- **Protected routes** with AuthGuard component

### Data Models (Schema)
- **Users table**: Basic user authentication data
- **User roles**: Role assignment and management
- **Training sessions**: Physical preparation and judo-specific training
- **Techniques**: Judo technique documentation with media
- **Tactical notes**: Strategy and tactical planning
- **Weight tracking**: Weight management and progress
- **Nutrition entries**: Meal and nutrition tracking
- **Clubs**: Organization management
- **Trainer assignments**: Trainer-athlete relationships
- **Achievement badges**: Gamification milestone definitions
- **User achievements**: Individual achievement progress and completion

### Core Features
1. **Training Session Management**
   - Physical preparation sessions with exercise tracking
   - Judo-specific training with randori documentation
   - Video and image uploads for technique analysis

2. **Technique Library**
   - Comprehensive judo technique database
   - Categorized by belt levels
   - Media attachments (photos, videos, YouTube links)

3. **Progress Tracking**
   - Weight monitoring with trend analysis
   - Training frequency and intensity tracking
   - Performance analytics and visualizations

4. **Tactical Planning**
   - Opponent analysis and strategy documentation
   - Match preparation notes
   - Multimedia tactical resources

5. **Club Management**
   - Multi-club support with logo management
   - Trainer-athlete assignment system
   - Administrative oversight capabilities

6. **Gamification System**
   - Achievement badge system with multiple categories
   - Automatic progress tracking and milestone detection
   - Visual achievement notifications and progress statistics
   - Badge categories: training, technique, consistency, weight, nutrition

## Data Flow

1. **Authentication Flow**
   - Users authenticate via Supabase Auth
   - Role verification through database functions
   - Session persistence with PostgreSQL backend

2. **Data Management Flow**
   - Frontend components use React Query for caching
   - API calls routed through Express.js middleware
   - Drizzle ORM handles database operations
   - Real-time updates via query invalidation

3. **File Upload Flow**
   - Media files uploaded to Supabase Storage
   - URLs stored in PostgreSQL database
   - Optimistic updates in React Query cache

## External Dependencies

### Database & Backend Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Supabase**: Authentication and file storage services

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Recharts**: Data visualization library

### Development Tools
- **Drizzle Kit**: Database migration management
- **ESBuild**: Production build optimization
- **TSX**: TypeScript execution for development

### Form & Validation
- **React Hook Form**: Performant form handling
- **Zod**: Runtime type validation
- **Hookform Resolvers**: Integration between RHF and Zod

## Deployment Strategy

### Development
- **Hot Module Replacement**: Vite dev server with Express.js integration
- **Live Reloading**: Automatic restart on server file changes
- **Type Checking**: Continuous TypeScript compilation checking

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `drizzle-kit push`

### Environment Configuration
- **Database URL**: Required for PostgreSQL connection
- **Supabase Config**: Authentication and storage credentials
- **Session Security**: PostgreSQL session store configuration

### Architectural Decisions

**Problem**: Need for type-safe database operations
**Solution**: Drizzle ORM with shared schema definitions
**Rationale**: Provides end-to-end type safety from database to frontend while maintaining flexibility

**Problem**: Complex role-based access control
**Solution**: PostgreSQL functions with React Query integration
**Rationale**: Leverages database-level security with efficient client-side caching

**Problem**: Media file management
**Solution**: Supabase Storage with optimistic UI updates
**Rationale**: Scalable file hosting with seamless user experience

**Problem**: Real-time data synchronization
**Solution**: React Query with strategic cache invalidation
**Rationale**: Maintains data consistency while minimizing unnecessary API calls