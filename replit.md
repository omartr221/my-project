# Worker Time Tracking System

## Overview

This is a full-stack web application designed to track work time for automotive technicians across multiple car brands (Audi, Seat, Skoda, Volkswagen). The system provides real-time task management, time tracking, and worker status monitoring with Arabic language support.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with custom color schemes and Arabic RTL support
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite with hot module replacement and development optimizations

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with real-time WebSocket support
- **Real-time Communication**: WebSocket server for live updates across clients
- **Error Handling**: Comprehensive error middleware with structured responses

### Data Storage Solutions
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Connection**: Connection pooling with @neondatabase/serverless
- **Migrations**: Drizzle Kit for schema management and migrations

## Key Components

### Database Schema
- **Workers Table**: Stores worker information with categories (technician, assistant, supervisor, trainee)
- **Tasks Table**: Manages work tasks with car brand classification and status tracking
- **Time Entries Table**: Records detailed time tracking with work/pause periods
- **Relations**: Proper foreign key relationships with cascading operations

### API Endpoints
- **Worker Management**: CRUD operations for worker profiles
- **Task Management**: Create, update, pause, resume, and complete tasks
- **Time Tracking**: Automatic time entry creation and duration calculations
- **Statistics**: Real-time dashboard metrics and reporting
- **History**: Task completion records with filtering capabilities

### Real-time Features
- **WebSocket Integration**: Bi-directional communication for live updates
- **Client Synchronization**: Automatic UI updates when data changes
- **Connection Management**: Automatic reconnection with heartbeat monitoring
- **Broadcast System**: Multi-client update propagation

### UI Components
- **Dashboard**: Overview cards with key metrics and active task monitoring
- **Worker Grid**: Visual worker status with availability indicators
- **Timer Controls**: Start, pause, resume, and complete task functionality
- **Task History**: Paginated table with filtering and export capabilities
- **Form Management**: Validated forms with error handling and toast notifications

## Data Flow

1. **Task Creation**: User creates task → API validates → Database insert → WebSocket broadcast → UI update
2. **Time Tracking**: Timer start → Time entry creation → Periodic updates → Status synchronization
3. **Worker Status**: Task assignment → Worker availability update → Real-time grid refresh
4. **Statistics**: Database aggregation → Cache optimization → Dashboard metrics update

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL connection and query execution
- **drizzle-orm**: Type-safe database operations and schema management
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight client-side routing

### Development Tools
- **TypeScript**: Static type checking and enhanced development experience
- **Vite**: Fast build tool with HMR and optimized bundling
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **tsx**: TypeScript execution for development server

### Authentication & Sessions
- **connect-pg-simple**: PostgreSQL session store integration
- **express-session**: Session management middleware

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with native ES modules support
- **Database**: PostgreSQL 16 with automatic provisioning
- **Development Server**: Hot reload with error overlay and debugging tools
- **Port Configuration**: Frontend on 5000, WebSocket on same port

### Production Build
- **Frontend**: Vite production build with code splitting and optimization
- **Backend**: esbuild bundling with external dependencies
- **Static Assets**: Served from dist/public with proper caching headers
- **Environment**: Autoscale deployment target with health checks

### Configuration Management
- **Environment Variables**: DATABASE_URL for connection string
- **Build Scripts**: Separate development and production workflows
- **Asset Handling**: Optimized static file serving with proper MIME types

## Changelog

Changelog:
- June 24, 2025. Initial setup
- June 24, 2025. Added archive functionality with search capabilities for task management
- June 24, 2025. Enhanced archive with date filtering and print functionality for reporting

## User Preferences

Preferred communication style: Simple, everyday language.