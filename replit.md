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
- July 3, 2025. Fixed data transmission from frontend to backend for multi-select fields: updated NewTaskForm to properly send technicians and assistants arrays to server, corrected task creation mutation to include array fields in API request payload
- July 3, 2025. Complete system reset: cleared all records from database (tasks, time_entries, workers), recreated clean worker dataset with 12 team members, system now ready for fresh multi-select functionality testing
- July 3, 2025. Expanded task type options: added 12 task types including ميكانيك 1, ميكانيك 2, كهربا 1, كهربا 2, فحص وتشخيص, فحص دوري, دوزان, طلب مخططات, تجريب في الخارج, اختبارات داخل الورشة, خدمات خارجية, حدادة - updated both NewTaskForm and EditTaskDialog components
- July 3, 2025. System maintenance: removed worker "علي" from database (ID 21), cleared all task references and associations, updated worker count to 11 active workers (kept "محمد العلي" as requested)
- July 3, 2025. Enhanced print functionality: added technicians and assistants columns to print report table, displays multiple names with comma separation for multi-select fields, maintains backward compatibility for single-select legacy data
- July 3, 2025. Added checkboxes for technicians and assistants in EditTaskDialog: users can now select multiple technicians and assistants when editing tasks, maintaining consistency with the create task form
- July 3, 2025. Added "برمجة" (programming) as a new task type option: expanded task types to 13 categories including programming for technical/software-related tasks
- July 4, 2025. Implemented timer type selection system: added manual vs automatic timer options during task creation, manual timers start in paused state requiring manual activation, automatic timers start immediately, enhanced precision with 100ms updates for both timer types, updated database schema and both create/edit forms to support timer type selection
- July 5, 2025. Fixed manual timer functionality: corrected data transmission to include timerType and consumedTime fields in API requests, manual timer tasks now automatically complete and go to final delivery status with recorded consumed time, enhanced NewTaskForm to properly send timer data to server
- July 5, 2025. Enhanced manual timer display: updated TaskHistoryTable and ArchiveView to show user-input consumed time for manual timer tasks instead of calculated duration, corrected efficiency calculations to use actual consumed time, updated print reports to display accurate manual timer data
- July 5, 2025. Improved automatic timer behavior: automatic timer tasks now start in paused state and begin counting only after successful task creation, ensuring timer starts precisely when user clicks create task button rather than during task creation process
- July 5, 2025. Database maintenance: cleaned all records and reset sequences for fresh system testing with improved timer functionality
- July 5, 2025. Fixed actual time calculation for manual timer tasks: updated calculateCurrentDuration function to properly use consumedTime for manual timer tasks instead of calculated time, ensuring accurate display in archive and history views
- July 5, 2025. Added color field to task management system: enhanced task creation and editing forms with color selection dropdown (12 color options), added color column to database schema, integrated color display across all system views including active timers, history table, archive view, and print reports
- July 5, 2025. Enhanced car brand selection with custom option: added "أخرى" (Other) option to car brand dropdown allowing users to input custom car brands, integrated into both task creation and editing forms, updated car model placeholder to remove year examples (now shows "A4" instead of "A4 2024")
- July 12, 2025. Implemented AUTO FILL functionality for task creation: when entering license plate number, system automatically searches customer database and fills car brand, model, and color from previously saved customer car data, enhanced user experience with real-time data lookup and toast notifications
- July 12, 2025. Implemented comprehensive authentication system with role-based permissions: created user authentication with PostgreSQL session storage, added protected routes, implemented finance user group with view-only permissions (dashboard, tasks, archive, customers read-only), added login/logout functionality with Arabic interface, integrated permission-based component rendering to hide create/edit/delete buttons for finance users
- July 12, 2025. Enhanced operator permissions for multi-tier access control: operator users can create/edit tasks, access dashboard and timers, view customer cards in read-only mode, but cannot add new workers - maintaining clear separation between operational and administrative functions
- July 12, 2025. Added third-tier viewer user "هبة" (password: 123456) with limited read-only access: can view dashboard, timers (no editing), task history (no editing), and customer cards (no editing) - final delivery and add worker sections completely hidden from this user group
- July 12, 2025. Enhanced viewer user restrictions: removed task creation capabilities from user "هبة" - NewTaskForm component now hidden from viewer users in both dashboard and timers tabs, ensuring complete read-only access
- July 12, 2025. Added fourth-tier supervisor user "روان" (password: 1234567) with view-only access similar to operator role: can access dashboard, timers, task history, archive, and customers but cannot create tasks or edit existing ones - maintains supervisory oversight without modification rights
- July 12, 2025. Updated supervisor user "روان" permissions: now allowed to create new tasks and edit existing ones, but cannot delete/cancel tasks - maintains balance between operational capability and data protection
- July 12, 2025. Implemented comprehensive parts request system: added parts_requests table with fields for engineer, car info (license/chassis/customer name), request reason (expense/loan), part name, quantity, and status tracking, integrated auto-search functionality for car data, created parts request form and management interface, added sequential numbering system (طلب-1, طلب-2, etc.), implemented role-based permissions for parts requests with read access for all users and create access for operators and supervisors
- July 12, 2025. Added comprehensive notification system for user "هبة": implemented sound alerts using Web Audio API, browser push notifications with permission requests, real-time WebSocket integration for instant notifications, visual notification badge counter on requests tab, custom event handling for new parts requests, notification display shows engineer name and part details
- July 12, 2025. Enhanced notification system with repeating alerts: implemented continuous 30-second repeating alerts for new parts requests, created persistent visual alert dialog that overlays the interface, added enhanced multi-tone audio sequences with higher volume and square wave patterns, integrated mobile vibration support, created manual stop controls for alerts, added comprehensive test functionality for verification
- July 13, 2025. Fixed Arabic text encoding issues: resolved character display problems by adding proper UTF-8 headers to server responses and client requests, enhanced authentication logging for troubleshooting, confirmed correct user credentials: Finance "ملك" (12345), Operator "بدوي" (0000), Viewer "هبة" (123456), Supervisor "روان" (1234567)
- July 13, 2025. Updated notification system for user "هبة": removed 30-second repeating alerts, implemented one-time notifications only when new parts requests are received, created specialized HabaNotificationDialog component with clean UI showing request details and "موافق" button, notification now triggers once per new request without repetition
- July 13, 2025. Enhanced parts request search functionality: fixed car search API endpoint to properly retrieve data from customer database, updated PartsRequestForm to use correct API endpoint (/api/car-search), added visual loading indicators during search, implemented Enter key support for quick search, enhanced error handling with detailed toast messages, auto-fill now works correctly for license plate, chassis number, and engine code fields
- July 13, 2025. Implemented role-based parts request management: updated user permissions so "بدوي" can only create parts requests (parts:create), "هبة" can approve/reject requests (parts:approve, parts:reject), added approval/rejection buttons with loading states for authorized users, integrated permission checking in PartsRequestForm to hide form from unauthorized users, enhanced RequestsList with approval/rejection mutations and proper permission-based UI rendering
- July 13, 2025. Enhanced parts request workflow with multi-stage approval: added "قيد التحضير" (in_preparation) and "بانتظار الاستلام" (awaiting_pickup) status stages, when "هبة" approves a request it moves to "in_preparation" status, added "جاهز للاستلام" button for "هبة" to move requests from "in_preparation" to "awaiting_pickup", updated status colors and labels in both RequestsList and PartsRequestsList components, implemented real-time status updates visible to both "بدوي" and "هبة" users
- July 13, 2025. Implemented complete parts request lifecycle with final delivery: added "وصلت القطعة بانتظار التسليم" (parts_arrived) status accessible by both users, created "تم الاستلام" (delivered) button exclusively for "بدوي" to finalize requests, integrated comprehensive timestamp tracking for all status changes, enhanced visual timeline with color-coded status indicators, implemented specialized notifications for "هبة" when parts are delivered, created automated WebSocket integration for real-time delivery notifications, added database fields for arrival and delivery tracking
- July 14, 2025. Successfully implemented final delivery button for user "بدوي": added teal-colored "تسليم" button in actions column of PartsRequestsList component, button appears only for non-completed requests (excluding rejected and delivered), clicking button directly changes request status to "delivered", resolved component identification issue (RequestsList vs PartsRequestsList), tested and confirmed functionality working correctly, system ready for clean testing with all data cleared
- July 14, 2025. Added customer creation permission to user "بدوي": updated user permissions to include "customers:write" alongside existing permissions, modified auth.ts for new user creation, updated existing user in database, "بدوي" can now create customer cards through the CustomerCard component with full write access
- July 17, 2025. Resolved persistent HTML loading errors and Vite script conflicts: created standalone HTML pages for login and dashboard to bypass Vite/React issues, added static file serving to Express server, implemented fallback system with /login.html and /dashboard.html pages, created comprehensive error handling for external Replit scripts, system now fully accessible through simple HTML interface without JavaScript framework dependencies
- July 21, 2025. Restored original parts request data after database schema updates: recovered authentic parts requests including "رانية الشلبي" customer data, implemented return part functionality with notifications, added notes system for parts requests with role-based editing permissions
- July 21, 2025. Implemented comprehensive automatic backup system: created backup.ts with automatic hourly backups of customers, customer cars, and parts requests data, added backup/restore API endpoints with admin permissions, created BackupManager component for manual backup creation and restoration, integrated automatic backup initialization on server startup, added JSON backup file format with timestamp and version tracking
- July 23, 2025. Implemented complete car receipt system for vehicle entry tracking: added carReceipts database table with fields for receipt number (استلام-1, استلام-2), customer details, car specifications, entry mileage, fuel level, repair type, entry notes, and received by tracking, created CarReceiptForm component with auto-search functionality for existing customer data, built CarReceiptsList component for viewing all receipts with detailed car and customer information display, added car receipt APIs with WebSocket integration for real-time updates, restricted access to "الاستقبال" and "فارس" user accounts only, integrated sequential receipt numbering system for organized tracking
- July 23, 2025. Enhanced car receipt system based on user feedback: removed phone number field from receipt form, changed odometer reading from automatic number to manual text input allowing custom entries, converted repair type from single dropdown to multi-line textarea supporting multiple repair requests, renamed "ملاحظات عند الدخول" to "الشكوى" (complaint field), updated database schema to use text field for odometer and repair type, enhanced UI display to show multi-line repair requests with proper formatting
- July 23, 2025. Implemented complete car status management workflow: added "حالة السيارات" (Car Status Management) tab for reception users, created workflow from car receipt → car status → workshop notification system, developed real-time notifications for "بدوي" user when cars are sent to workshop, added workshop entry confirmation system with "إدخال للورشة" functionality, integrated WebSocket communication for instant status updates across all system components
- July 23, 2025. Fixed car receipt creation issues: resolved count function import error in storage.ts, fixed TypeScript null value handling in CarReceiptForm fields, added proper sql import for receipt numbering system, successfully enabled car receipt saving functionality
- July 23, 2025. Added car status management access for "بدوي" user: extended dashboard navigation to include "حالة السيارات" tab for "بدوي" account, enabling workshop notification reception and car entry confirmation workflow, user can now see cars sent to workshop and confirm their entry

## User Preferences

Preferred communication style: Simple, everyday language.