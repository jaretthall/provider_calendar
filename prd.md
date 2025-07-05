# Clinica Provider Schedule - Product Requirements Document

## 1. Introduction

**Product Name:** Clinica Provider Schedule  
**Version:** 1.0.6  
**Purpose:** To provide a comprehensive scheduling and calendar management system for healthcare clinics. It enables efficient management of staff schedules, tracking of vacations and time-off, and clear coordination of clinic and medical assistant assignments for providers.  

**Brief Description:** Clinica Provider Schedule is a web-based application designed to streamline the complex task of scheduling healthcare professionals. It offers robust features for creating, viewing, and managing shifts, including recurring events and exceptions, with a strong emphasis on visual clarity, conflict prevention, and user-friendly data management. The application uses Supabase for cloud-based data storage and requires authentication for all access.

---

## 2. Goals

- **Efficient Scheduling:** Simplify and accelerate the process of creating and modifying staff schedules
- **Conflict Reduction:** Proactively identify and help prevent scheduling conflicts for providers
- **Enhanced Visibility:** Provide a clear, up-to-date view of all provider assignments, clinic utilization, and medical assistant allocations
- **Flexible Management:** Support complex scheduling needs through recurring shifts, vacation planning, and handling of exceptions to standard schedules
- **Improved Communication:** Serve as a central source of truth for scheduling information within the clinic
- **User Empowerment:** Offer customizable settings and straightforward data import/export capabilities for administrative flexibility
- **Secure Access:** Require authentication for all data access while providing emergency backup options

---

## 3. Target Audience

### Authenticated Users (All Users)
All users must sign in to access any application functionality. Every authenticated user has full editing privileges and administrative access to:
- View all schedules and calendar data
- Create, edit, and delete providers, clinic types, medical assistants, and shifts
- Import and export data
- Configure application settings
- Access all calendar views and filtering options

### Emergency Access
- **Viewer Account**: Pre-configured account with credentials displayed on login screen for quick read access
- **Admin Account**: Pre-configured account with credentials displayed on login screen for full administrative access
- **Local Admin Backup**: Emergency access using simple password for situations when cloud authentication is unavailable

---

## 4. Key Features & Functionality

### 4.1. Authentication & Access Control

#### Required Authentication
- **No anonymous access** - All users must sign in to use any application features
- **Single privilege level** - All authenticated users have full administrative access
- **Immediate login screen** - Users see authentication options immediately upon visiting the app

#### Authentication Options
**1. Quick Login Options (Displayed on Login Screen):**
- **Viewer Account**: `viewer@clinicamedicos.org` / `ViewerPass2025!`
- **Admin Account**: `admin@clinicamedicos.org` / `AdminPass2025!`

**2. Manual Authentication:**
- Email/password sign-in for existing users
- Email/password registration for new users (invitation-only model)
- Password reset functionality

**3. Emergency Backup Access:**
- Local admin mode using password `CPS2025!Admin`
- Available when cloud authentication is unavailable
- Provides full application functionality using local storage

#### User Registration
- **Closed registration model** - Only invited users or manually added accounts can access
- No self-registration without administrator approval
- Maintains security while allowing controlled access expansion

### 4.2. Core Data Management

#### Provider Management
- Create, Read, Update, Delete (CRUD) providers (authentication required)
- Assign a unique color for visual identification on the calendar
- Set provider status (Active/Inactive) to control their availability for scheduling

#### Clinic Type Management
- CRUD operations for clinic types (e.g., Emergency, Pediatrics) (authentication required)
- Assign a unique color for visual identification
- Set clinic type status (Active/Inactive)

#### Medical Assistant (MA) Management
- CRUD operations for MAs (authentication required)
- Assign a unique color
- Set MA status (Active/Inactive)

### 4.3. Shift Scheduling & Management

#### Shift Creation & Editing (Authentication Required)
- Assign a provider, clinic type (for non-vacation shifts), and one or more MAs
- Define start and end dates, and start and end times
- Add descriptive notes to shifts
- Automatically derive shift color based on provider/clinic or use default

#### Vacation/Time-Off
- Mark shifts as "Vacation" or "Time-off," visually distinct from work shifts (uses VACATION_COLOR)
- Vacation shifts do not require clinic type or MAs

#### Recurring Shifts
- Define shifts that repeat: Daily, Weekly, Bi-Weekly, Monthly
- For weekly/bi-weekly, specify days of the week
- For monthly, specify the day of the month
- Set an optional end date for the recurrence

#### Exception Handling for Recurring Shifts
- Option to edit a single occurrence of a recurring shift (creating an exception)
- Option to edit the entire series of a recurring shift
- Delete a single occurrence or the entire series (including all exceptions)

#### Shift Duplication (Authentication Required)
- **Drag-to-Duplicate:**
  - When a user drags a shift to a new date, the default action is to duplicate the shift (not move)
  - The original shift remains; a new shift is created at the drop location
- **Dialog-Based Duplication:**
  - In the Edit Shift dialog, provide a "Duplicate Shift" button
  - Duplicated shift opens as a new, editable instance
- **(Optional) Move Mode:**
  - Option to move (not duplicate) a shift if desired (toggle or modifier key)

#### Shift Deletion (Authentication Required)
- Delete individual shifts, specific occurrences of recurring shifts, or entire recurring series

### 4.4. Calendar & Visualization

#### Multiple Calendar Views
- **Month View:** Overview of shifts for the entire month. Displays a limited number of shift badges per day with a "more" indicator for overflow
- **Week View:** Detailed columnar view of shifts for each day of the selected week
- **Day View:** Granular hourly view from 6:00 AM to 10:00 PM with time slot-based shift display

#### Navigation
- Navigate to previous/next month, week, or day
- Quick navigation to "Today"
- Dynamic display of the current month/year, week range, or specific day

#### Visual Shift Representation (ShiftBadge)
- Color-coded badges for easy identification of providers/clinics
- Display provider initials (and MA initials/count in month view, full MA names in week view)
- Clear indication of shift times in week and day views

#### Vacation Visualization (VacationBar)
- Distinct bar at the bottom of a day cell (month view) or within the day column (week/day view) showing initials of vacationing providers

#### Conflict Highlighting
- Visual indicators (e.g., warning icon) on shifts that overlap with other shifts for the same provider

#### PDF Export (Available to All Authenticated Users)
**Fully Implemented with Comprehensive Options:**
- Flexible date range selection
- Multiple view types (List format and Calendar capture)
- Calendar view options (Month, Week, Day)
- Personnel filtering (Providers, Clinic Types, Medical Assistants)
- Include/exclude vacation and time-off
- Paper size options (A4, Letter, Legal)
- Orientation options (Portrait, Landscape)
- Custom report titles
- Summary statistics and metadata
- **(Planned) Export Controls:**
  - Fine-grained controls for which data to include/exclude
  - Option to export only selected shifts, departments, or filtered views
  - Improved UI for PDF export setup

### 4.5. User Interaction & Experience

#### Drag-and-Drop Scheduling (Authentication Required)
- Drag a provider from the sidebar onto a calendar day to initiate new shift creation for that provider on that day
- Drag an existing non-vacation shift badge on the calendar to reschedule it to a new date
- Non-recurring shifts are simply moved
- Instances of recurring shifts, when dragged, become new, separate (exception) occurrences on the target date, leaving the original series intact

#### Filtering System (Available to All Authenticated Users)
- Filter the calendar display by one or more Providers
- Filter by one or more Clinic Types
- Filter by one or more Medical Assistants
- Toggle visibility of Vacations/Time-off

#### Modal-Driven Operations
- Dedicated modals for creating/editing Providers, Clinic Types, MAs, and Shifts (authentication required)
- Modals for viewing shift details, confirming deletions, managing recurrence choices, import/export, and settings

#### Conflict Warnings
- Real-time warnings within the Shift Form if the configured shift times/dates conflict with existing shifts for the selected provider

#### Toast Notifications
- Non-intrusive feedback for actions (success, error, info, warning)

#### Responsive Sidebar
- Collapsible on smaller screens for better space utilization, with an overlay for mobile interaction

### 4.6. Data Handling

#### Cloud-First Architecture
The application uses Supabase for primary data storage:

**Supabase Cloud Storage:**
- PostgreSQL database with automatic backups
- Real-time data synchronization across devices
- Authenticated read/write access for all operations
- Single-user simplified architecture
- Automatic connection testing and status monitoring

**Emergency Local Storage Backup:**
- Available only in local admin mode when cloud is unavailable
- Provides basic functionality during connectivity issues
- Manual export/import for data transfer when needed

#### JSON Data Import (Authentication Required)
- Upload a JSON file or paste JSON content to import Providers, Clinic Types, MAs, and Shifts
- Comprehensive validation with file size and format checks
- Updates existing items if IDs match; otherwise, adds new items
- Provides detailed feedback on the import process with error handling
- Real-time validation and duplicate detection

#### JSON Data Export (Available to All Authenticated Users)
- Export all application data (Providers, Clinics, MAs, Shifts, User Settings) into a single JSON file for backup or transfer

### 4.7. Application Settings (Authentication Required)

- **Default Calendar View:** Set whether the calendar initially loads in 'Month', 'Week', or 'Day' view
- **Week Starts On:** Configure the calendar week to start on 'Sunday' or 'Monday'
- **Connection Status:** Display current data storage mode (Cloud/Local)

### 4.8. Multi-Department Scheduling (Planned v2+)
- **Department Model:**
  - Expand the database to include departments (e.g., Providers, Medical Assistants, Front Staff, Behavioral Health, Billing, etc.)
  - Each staff member is assigned to a department
- **Department Filtering:**
  - Add a department filter (e.g., dropdown or segmented control in the header)
  - Users can select which department to view/schedule
- **Role-Based Scheduling:**
  - Different managers can be responsible for scheduling their own department
  - Permissions and UI may adapt based on department selection (future enhancement)
- **Unified Application:**
  - All departments and schedules are managed in a single application and database
  - Filtering and UI context switch between departments

---

## 5. User Interface (UI) / User Experience (UX) Design

### Authentication Flow
- **Login Screen First:** Users immediately see authentication options upon visiting the application
- **Quick Access Cards:** Pre-configured viewer and admin account credentials clearly displayed
- **Manual Login Form:** Standard email/password form for custom accounts
- **Emergency Access:** Clearly marked backup option for local admin mode
- **No Bypass Options:** No guest access or anonymous browsing available

### Layout (Post-Authentication)
- **Header:** Contains application title, date navigation, view mode switcher (Month/Week/Day), action buttons (New Shift, Import, Export, Settings), and logout controls
- **Sidebar (Left):** Houses filtering options and management sections for Providers, Clinic Types, and MAs. Providers are draggable. Sections are collapsible. The sidebar itself is collapsible on smaller screens
- **Main Content Area:** Displays the selected calendar view (Month, Week, or Day)
- **Footer:** Displays application version (v1.0.6) and connection status (Supabase/Local Storage)

### Visual Design
- Clean, professional, and intuitive interface utilizing TailwindCSS
- Extensive use of color-coding for Providers, Clinic Types, MAs, and shift states (e.g., vacation) to enhance visual scanning and differentiation
- Production-ready styling with consistent spacing and typography

### Key UI Components
- Interactive Month, Week, and Day Calendar Grids
- Draggable elements (Provider items in sidebar, Shift Badges on calendar)
- Forms housed within Modals for focused data entry and operations
- Dropdowns, checkboxes, and radio buttons for selections and options
- Standardized buttons with icons for common actions (Add, Edit, Delete, Navigate)
- Color Picker component for consistent color selection
- Drag Overlay for visual feedback during drag operations
- Loading Spinner component for consistent loading states
- Error Boundary component for production error handling

### Accessibility
- ARIA attributes are used for modals, forms, and interactive elements to improve screen reader compatibility
- Focus management is implemented within modals
- Keyboard navigation support for interactive elements (e.g., calendar cells, draggable items)
- Proper labeling and descriptions for screen readers

### Responsiveness
- The layout adapts to different screen sizes, with features like the collapsible sidebar and adjusted text/element sizes for smaller viewports
- Touch-friendly controls for mobile devices
- Responsive grid layouts for optimal viewing on tablets and mobile

---

## 6. Data Model Overview

```typescript
Provider: { id, name, color, isActive, createdAt, updatedAt }
ClinicType: { id, name, color, isActive, createdAt, updatedAt }
MedicalAssistant: { id, name, color, isActive, createdAt, updatedAt }
Shift: { 
  id, providerId, clinicTypeId?, medicalAssistantIds?, title?, 
  startDate, endDate, startTime?, endTime?, isVacation, notes?, 
  color, recurringRule?, seriesId?, originalRecurringShiftId?, 
  isExceptionInstance?, exceptionForDate?, createdAt, updatedAt
}
RecurringRule: { frequency, interval?, daysOfWeek?, dayOfMonth?, endDate? }
User: { id, username, role }
UserSettings: { defaultCalendarView, weekStartsOn }
ToastMessage: { id, message, type, duration? }
PdfExportOptions: { 
  startDate, endDate, viewType, calendarView, includeProviderIds, 
  includeClinicTypeIds, includeMedicalAssistantIds, includeVacations, 
  orientation, paperSize, title 
}
```

---

## 7. Non-Functional Requirements

### Performance
The application renders calendar views and responds to user interactions (filtering, dragging, opening modals) smoothly and efficiently, even with large numbers of shifts. Conflict detection algorithms are optimized for performance. Production build includes optimized bundle splitting and lazy loading.

### Usability
The interface is intuitive for schedulers to learn and use efficiently. Authentication is straightforward with clear quick-access options. All application features are equally accessible to all authenticated users without complex permission systems.

### Security
- **Authentication Required:** All application functionality requires user authentication
- **Row Level Security (RLS):** Implemented in Supabase for data protection
- **Secure Authentication Flow:** Email/password with proper session management
- **Emergency Access Controls:** Local admin backup with secure password
- **Invitation-Only Registration:** Controlled user access expansion

### Reliability
- **Cloud-First Architecture:** Primary reliance on Supabase for data persistence
- **Automatic Failover:** Emergency local storage backup when cloud is unavailable
- **Comprehensive Error Boundaries:** Prevent application crashes
- **Real-time Conflict Detection:** Prevent scheduling errors
- **Connection Monitoring:** Automatic status checks and user notifications

### Cross-Browser Compatibility
The application functions correctly across modern web browsers (Chrome, Firefox, Safari, Edge) with comprehensive testing across different environments.

### Maintainability
- **Clean TypeScript Codebase:** Comprehensive type safety throughout
- **Well-organized Component Architecture:** Modular and reusable components
- **Comprehensive Error Handling:** Detailed logging and user feedback
- **Production-ready Build Configuration:** Optimized for deployment
- **Simplified Authentication Model:** Single privilege level reduces complexity

---

## 8. Technical Implementation Status

### ✅ Fully Implemented Features

**Authentication & Access Control:**
- Authentication-required architecture with immediate login screen
- Quick-access pre-configured accounts with displayed credentials
- Manual email/password authentication with registration
- Emergency local admin backup mode
- Secure session management and logout functionality

**Core Functionality:**
- Provider, Clinic Type, and Medical Assistant management with full CRUD operations
- Comprehensive shift scheduling with recurring patterns and exception handling
- All three calendar views (Month, Week, Day) with full functionality
- Advanced drag-and-drop scheduling interface
- Real-time conflict detection and warnings
- Comprehensive filtering system

**Data Management:**
- Supabase-first architecture with simplified data hooks
- Automatic connection testing and status monitoring
- Complete JSON import/export functionality
- Fully implemented PDF export with comprehensive options
- Emergency local storage fallback for offline situations

**User Experience:**
- Responsive design across all device sizes
- Comprehensive error handling with error boundaries
- Toast notification system
- Loading states and visual feedback
- Production-ready UI with TailwindCSS

### 🏗️ Production Readiness

The application is **production-ready** with:
- Version 1.0.6 released and stable
- Simplified authentication architecture requiring login for all access
- Comprehensive error handling and validation
- Performance optimizations and bundle splitting
- Cross-browser compatibility
- Responsive design for all screen sizes
- Comprehensive documentation for deployment
- Cloud-first data architecture with emergency backup options

---

## 9. Future Considerations / Potential Enhancements

- **Multi-User Role System:** Expand beyond single privilege level for different user types (viewers, editors, admins)
- **Advanced User Management:** User invitation system, role assignment, and access control refinements
- **Advanced Reporting:** Introduce features for generating reports on provider hours, clinic utilization, MA assignments, etc.
- **Shift Change Requests/Time-Off Requests:** Allow providers to request shift changes or time off directly within the application, subject to admin approval
- **Audit Trail:** Log significant changes to schedules and data for accountability and history tracking
- **Automated Scheduling Assistance:** Explore AI/ML-powered suggestions for optimal scheduling based on predefined rules or historical data
- **Mobile Application:** Develop a dedicated mobile application or further optimize the web interface for an improved mobile experience
- **External Calendar Integration:** Allow synchronization with external calendar platforms (e.g., Google Calendar, Outlook Calendar)
- **Real-time Notifications:** Push notifications for schedule changes and conflicts
- **Advanced Analytics:** Provider utilization metrics, scheduling pattern analysis, and optimization suggestions
- **Departmental Scheduling:** Full support for multi-department scheduling, department-based permissions, and cross-department reporting