# نظام توزيع المهام - Task Distribution System

## Overview
This is a full-stack web application for task distribution and time tracking for automotive technicians across multiple car brands (Audi, Seat, Skoda, Volkswagen). The system provides real-time task management, time tracking, and worker status monitoring with Arabic language support. It aims to streamline operations, improve efficiency, and enhance communication within the automotive service industry.

## User Preferences
Preferred communication style: Simple, everyday language.

## Worker Names (Updated September 17, 2025)
Current active workers in the system:
- خالد
- حكيم
- محمد العلي
- أنس
- عامر
- زياد
- علي

## Recent Changes (September 3, 2025)
### Task Duration Tracking System Improvements (Complete Fix)
- **CRITICAL**: Fixed actual duration calculation and display across ALL system components
- Enhanced duration tracking to match timer display exactly when "إنهاء" is pressed
- Implemented comprehensive duration storage in `totalPausedDuration` field (in seconds)
- Fixed `finishTask`: Now calculates and saves duration from `time_entries` when completing tasks
- Fixed `deliverTask`: Now calculates and saves duration from `time_entries` when archiving tasks
- Fixed `getTaskHistory`: Uses stored `totalPausedDuration` for completed tasks awaiting delivery
- Fixed `getArchivedTasks`: Uses stored `totalPausedDuration` for archived tasks
- Fixed `TaskHistoryTable.tsx`: Simplified to use `totalDuration` directly
- Fixed `TaskDistribution.tsx`: Uses `totalDuration` for consistent display
- Fixed `ArchiveView.tsx`: Uses `totalDuration` for accurate archived task display
- Updated all 21 existing archived tasks to display correct actual duration
- System now automatically calculates and saves proper duration at ALL stages
- Efficiency percentage calculation: (estimated time ÷ actual time) × 100
- **Result**: Actual duration displays correctly in timer, task log, archive, and distribution views

### Camera-Based License Plate Recognition System (September 2, 2025)
- Integrated Anthropic AI (Claude Sonnet 4) for license plate text recognition from images
- Advanced AI-powered OCR system with high accuracy for Syrian license plates
- Added LicensePlateCamera component for uploading and analyzing license plate photos
- Automatic customer data lookup based on extracted license plate numbers
- Auto-fill reception form with customer information when license plate is recognized
- Camera accessible from reception form for streamlined car registration process
- Fallback OCR systems available if AI service fails

### System Administration Centralization (Previous)
- All system modifications and permissions management now centralized under فارس account
- فارس has complete administrative control over all system features and user permissions
- Unified timestamp handling using Syrian timezone (UTC+3) across all parts requests
- Auto-refresh functionality implemented for parts requests (5-second intervals)
- Simplified time formatting to 24-hour format without complex timezone conversions

### Car Delivery System for بدوي
- Added new "تسليم السيارة" tab visible only to بدوي account
- Tab displays cars currently in workshop status ("في الورشة" or "workshop")
- Each car has a green "تسليم للاستقبال" button for delivery to reception
- Button updates car status from "في الورشة" to "في الاستقبال" via PATCH /api/car-status/{id}
- Proper API integration with real-time updates and WebSocket notifications
- Enhanced CarStatusDisplay component with role-based button visibility
- Removed workshop tab from بدوي account (only has car delivery functionality now)

### Customer Delivery System for Reception
- Added "تسليم للزبون" tab for reception account showing cars returned from workshop
- Complete car information display including parts used and service details
- Cars filter out from reception view once delivered to customer

### Parts Request System Improvements
- Fixed timestamp consistency across all parts request operations
- Implemented proper Syrian timezone handling (UTC+3) for all timestamps
- Parts requests now auto-refresh every 5 seconds without manual refresh
- Sequential numbering system reset and properly functioning

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **UI Components**: Radix UI with shadcn/ui
- **Styling**: Tailwind CSS (custom colors, Arabic RTL support)
- **State Management**: TanStack Query (React Query)
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **API Design**: RESTful API with real-time WebSocket support
- **Real-time Communication**: WebSocket server for live updates
- **Error Handling**: Comprehensive error middleware

### Data Storage
- **Database**: PostgreSQL (Production - Permanent storage)
- **ORM**: Drizzle ORM with DatabaseStorage implementation
- **Connection**: Connection pooling (@neondatabase/serverless)
- **Migrations**: Drizzle Kit
- **Migration Status**: Successfully migrated from Memory Storage to PostgreSQL

### Key Features and Design Patterns
- **Database Schema**: Workers, Tasks, Time Entries tables with proper relationships.
- **API Endpoints**: CRUD for workers, tasks, time tracking, statistics, history.
- **Real-time Features**: WebSocket for bi-directional communication, client synchronization, broadcast system.
- **UI Components**: Dashboard, Worker Grid, Timer Controls, Task History, Form Management.
- **Task Management**: Create, update, pause, resume, complete, edit, cancel tasks. Includes estimated time, repair operations, and various task types (e.g., mechanical, electrical, programming).
- **Team Management**: Support for multiple technicians and assistants per task.
- **Delivery System**: 3-star rating for task completion, work efficiency calculation.
- **Car Management**: Car receipt system with sequential numbering, car status management workflow (reception, workshop entry, postponement). Includes customer and car data auto-fill. Enhanced with flexible car model selection (includes "أخرى" option for custom models) and automatic uppercase conversion for engine codes.
- **Authentication & Authorization**: Role-based access control (finance, operator, viewer, supervisor, reception, workshop). Protected routes and permission-based component rendering. Centralized administration under فارس account with full system control.
- **Parts Request System**: Multi-stage approval workflow (in preparation, awaiting pickup, parts arrived, delivered), sequential numbering, real-time notifications for approver.
- **Notifications**: Sound alerts, browser push notifications, visual badges for new requests, red notification badge for parts requests in "الطلبات" tab.
- **Data Management**: Automatic hourly backups (customers, cars, parts requests), manual backup/restore.
- **Desktop Application**: Electron-based desktop application functionality.
- **Search Functionality**: Customer search limited to name, license plate number, and chassis number (phone number excluded for reception users for privacy).

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL connection
- **drizzle-orm**: ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Client-side routing

### Development Tools
- **TypeScript**: Static type checking
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **tsx**: TypeScript execution

### Authentication & Sessions
- **connect-pg-simple**: PostgreSQL session store
- **express-session**: Session management middleware

### Desktop Application
- **Electron**: For desktop application functionality.