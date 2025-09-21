# MentalCheck Sports Training Platform

## Overview

This project is a comprehensive dual-platform sports training and mental health system. It includes a full-stack **Web Application** for managing sports training, athlete performance, and club administration with role-based access. Complementing this is a **Mobile Application (MentalCheck)** built with React Native/Expo, focusing on sports training timers, mental health evaluation, and cross-device synchronization. The system supports multiple user roles: athletes (deportistas), trainers (entrenadores), and administrators (admin), providing extensive training management and mental health support. The project aims to provide a robust solution for sports clubs and individual athletes to manage their physical and mental well-being effectively.

## User Preferences

Preferred communication style: Simple, everyday language.
Terminology: Refer to users as "deportistas" instead of "estudiantes" or "practicantes". The system now handles multiple sports, not just Judo - avoid sport-specific references in UI.

## System Architecture

The system comprises a Web Application, a Mobile Application (MentalCheck), and a shared backend.

### Web Application Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Shadcn/ui (Radix UI base) with Tailwind CSS (HSL color system)
- **State Management**: TanStack Query
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Custom React context with Supabase Auth
- **Key Features**: Training session management, technique library, progress tracking, tactical planning, club management, and a gamification system with achievement badges.

### Mobile Application Architecture (MentalCheck)
- **Framework**: React Native (0.79) with Expo SDK 53 and React 19
- **UI Framework**: React Native Paper + MaterialIcons
- **Navigation**: React Navigation v6
- **Storage**: AsyncStorage for local persistence
- **Notifications**: Expo Notifications
- **Audio**: Expo AV
- **Build System**: EAS Build
- **Key Features**: Advanced customizable timer system (Tabata, stopwatch), mental health evaluation with integrated analytics, cross-device synchronization without a central backend, and native mobile features like push notifications and screen wake locks.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **Database**: PostgreSQL (Neon serverless)
- **Session Management**: PostgreSQL-backed sessions using `connect-pg-simple`
- **Authentication & Authorization**: Multi-role system (practicante, entrenador, admin), JWT-based via Supabase, role-based access control via database functions, and protected routes.

### Data Models
The system employs a comprehensive schema including `Users`, `User roles`, `Training sessions`, `Techniques`, `Tactical notes`, `Weight tracking`, `Nutrition entries`, `Clubs`, `Trainer assignments`, `Achievement badges`, and `User achievements`.

### Core Architectural Decisions
- **Type-safe database operations**: Drizzle ORM ensures end-to-end type safety.
- **Role-based access control**: Implemented via PostgreSQL functions and React Query for efficient client-side caching.
- **Media file management**: Supabase Storage with optimistic UI updates.
- **Cross-platform mobile development**: React Native with Expo SDK for rapid development and native feature access.
- **Local data persistence and offline functionality**: AsyncStorage in mobile app for uninterrupted user experience.
- **Device-to-device synchronization**: Shared storage keys and unique device codes enable simple cross-device data sync without a dedicated backend.

## External Dependencies

### Web Application Dependencies
- **Database & Backend Services**: Neon Database (PostgreSQL), Supabase (Authentication, file storage)
- **UI & Styling**: Radix UI, Tailwind CSS, Lucide React, Recharts
- **Development Tools**: Drizzle Kit, ESBuild, TSX
- **Form & Validation**: React Hook Form, Zod, Hookform Resolvers

### Mobile Application Dependencies
- **Core Framework**: Expo SDK 53, React Native 0.79, React 19
- **UI & Navigation**: React Native Paper, React Navigation v6, MaterialIcons
- **Native Features**: Expo Notifications, Expo AV, Expo Haptics, AsyncStorage
- **Development & Build**: EAS Build, Expo CLI, TypeScript