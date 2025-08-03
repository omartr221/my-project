# نظام توزيع المهام - Task Distribution System

## Overview
This is a full-stack web application for task distribution and time tracking for automotive technicians across multiple car brands (Audi, Seat, Skoda, Volkswagen). The system provides real-time task management, time tracking, and worker status monitoring with Arabic language support. It aims to streamline operations, improve efficiency, and enhance communication within the automotive service industry.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Database**: SQLite (local file-based database)
- **Database Operations**: Direct SQLite with better-sqlite3
- **Data Sanitization**: Custom sanitization system for security
- **Schema**: Raw SQL schema with manual table creation
- **Date**: 2025-08-03 - Migrated from PostgreSQL to SQLite for offline capability
- **Status**: ✅ All critical bugs fixed - schema conflicts resolved, TypeScript errors eliminated

### Key Features and Design Patterns
- **Database Schema**: Workers, Tasks, Time Entries tables with proper relationships.
- **API Endpoints**: CRUD for workers, tasks, time tracking, statistics, history.
- **Real-time Features**: WebSocket for bi-directional communication, client synchronization, broadcast system.
- **UI Components**: Dashboard, Worker Grid, Timer Controls, Task History, Form Management.
- **Task Management**: Create, update, pause, resume, complete, edit, cancel tasks. Includes estimated time, repair operations, and various task types (e.g., mechanical, electrical, programming).
- **Team Management**: Support for multiple technicians and assistants per task.
- **Delivery System**: 3-star rating for task completion, work efficiency calculation.
- **Car Management**: Car receipt system with sequential numbering, car status management workflow (reception, workshop entry, postponement). Includes customer and car data auto-fill.
- **Authentication & Authorization**: Role-based access control (finance, operator, viewer, supervisor, reception, workshop). Protected routes and permission-based component rendering.
- **Parts Request System**: Multi-stage approval workflow (in preparation, awaiting pickup, parts arrived, delivered), sequential numbering, real-time notifications for approver.
- **Notifications**: Sound alerts, browser push notifications, visual badges for new requests.
- **Data Management**: Automatic hourly backups (customers, cars, parts requests), manual backup/restore.
- **Desktop Application**: Electron-based desktop application functionality.

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