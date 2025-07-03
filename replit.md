# نظام توزيع المهام - Task Distribution System

## Overview

This is a full-stack web application designed for task distribution and time tracking for automotive technicians across multiple car brands (Audi, Seat, Skoda, Volkswagen). The system provides real-time task management, time tracking, and worker status monitoring with Arabic language support.

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
- **Network Access**: Configured for local network access (0.0.0.0) to support multiple devices

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
- June 24, 2025. Added estimated time tracking and worker team details display
- June 24, 2025. Updated timezone to Syria local time (Damascus/UTC+3) for all dates and times
- June 24, 2025. Changed header color from blue to red-gray gradient and added task names display in dashboard
- June 24, 2025. Added worker attendance tracking with check buttons for present/absent status in dashboard
- June 24, 2025. Updated worker names list with: حسام، حسن، يحيى، غدير، سليمان، علي، زياد
- June 24, 2025. Removed worker management functionality from the system per user request
- June 25, 2025. Implemented delivery system with 3-star rating (مقبول، جيد، ممتاز) replacing archive functionality
- June 25, 2025. Changed "الأرشيف" to "استلام نهائي" and "أرشف" to "تسليم" throughout the system
- June 25, 2025. Added rating field to database and integrated with task completion workflow
- June 25, 2025. Added work efficiency percentage calculation comparing actual vs estimated time in final delivery view
- June 25, 2025. Enhanced archive display with complete task information including engineer, supervisor, and rating details
- June 25, 2025. Fixed calculation logic for work efficiency percentage and duration tracking for archived tasks
- June 25, 2025. Reset database with clean worker data for fresh system testing
- June 25, 2025. Updated task creation form with four separate fields: المهندس (Engineer), المشرف (Supervisor), الفني (Technician), المساعد (Assistant)
- June 25, 2025. Fixed form validation and input handling to prevent undefined value errors
- June 25, 2025. Added new workers: بدوي and عبد الحفيظ
- June 25, 2025. Implemented duplicate prevention logic in task form - each worker can only be selected once across all roles
- June 25, 2025. System reset with clean database - ready for production use with complete team setup
- June 25, 2025. Enhanced WebSocket handling for real-time updates across all components
- June 25, 2025. Final integration testing completed - all features working seamlessly
- June 26, 2025. Fixed worker ID mapping issue in task creation form (updated from +17 to +26 offset)
- June 26, 2025. Added company logo to dashboard header with V POWER TUNING branding
- June 29, 2025. Added task editing functionality - users can now modify task description and estimated time with data persistence
- June 29, 2025. Integrated edit task button in active timers and task history views for easy access
- June 29, 2025. Added "repair operation" field to tasks with database integration across all system components
- June 29, 2025. Changed archive task numbering from date-based to simple sequential numbers (1, 2, 3...)
- June 30, 2025. Added repair operation field to task editing and all system components
- June 30, 2025. Configured server for local network access to support multiple devices
- June 30, 2025. Created standalone server package for deployment on separate device
- June 30, 2025. Created production deployment package with automated setup scripts for independent server hosting
- June 30, 2025. Fixed deployment configuration for Replit Autoscale: updated server listen method, added health check endpoints, improved error handling, and enhanced database connection management
- June 30, 2025. Applied comprehensive deployment fixes: enhanced port binding for Autoscale, added /health and /ready endpoints, improved production error handling with graceful timeouts, created production build scripts with fallback frontend, validated server startup configuration
- June 30, 2025. Fixed critical task creation bug: resolved worker ID mapping issues, added repairOperation field to database schema, improved error handling in storage layer, validated form data flow from frontend to backend
- June 30, 2025. Implemented simple sequential task numbering system: changed from complex date-based numbering to simple incremental numbers starting from 1, reset database for clean numbering, enhanced WebSocket message handling for task updates and archiving
- July 1, 2025. Fixed engineer selection bug: separated engineer and technician form fields which were incorrectly sharing the same schema field, added technicianName field to database schema, corrected form display logic to show proper selected values for each role
- July 1, 2025. Fixed task display priority: changed all task views to show engineer name as primary instead of assistant name, added color-coded team member badges in active timers, updated task history and archive views to prioritize engineer display
- July 3, 2025. Implemented sequential delivery numbering system: added deliveryNumber field to database schema, created automatic numbering for archived tasks starting from 1, updated archive views to display delivery numbers instead of task IDs, applied retroactive numbering to existing archived tasks
- July 3, 2025. Added task type classification system: implemented taskType field with "ميكانيك" (mechanical) and "كهربا" (electrical) options, integrated into task creation form, active timers display, history table, archive view, and task editing functionality, updated server-side storage to handle new field
- July 3, 2025. Enhanced task editing during execution: expanded EditTaskDialog to include all task fields (description, repair operation, task type, car details, worker assignments, estimated time), fixed SelectItem empty value error by using "none" instead of empty string for unselected options
- July 3, 2025. Implemented task cancellation system: added CancelTaskDialog with reason input, created cancel API endpoint and database fields (isCancelled, cancellationReason, cancelledAt, cancelledBy), integrated cancellation into archive view with red styling and special "ملغاة" badge, cancelled tasks receive sequential delivery numbers and are stored in archive with cancellation details
- July 3, 2025. System maintenance: removed worker "أحمد" from database and cleared all references in existing tasks, updated worker count to 11 active workers
- July 3, 2025. Added new worker "محمد العلي" as technician to the system, total active workers now 12
- July 3, 2025. Implemented multiple selection for technicians and assistants: converted single select dropdowns to checkbox lists, added technicians and assistants array fields to database schema, updated all views (active timers, task history, archive) to display multiple team members with color-coded badges, resolved React hooks error by replacing Radix Checkbox with native HTML checkboxes

## User Preferences

Preferred communication style: Simple, everyday language.