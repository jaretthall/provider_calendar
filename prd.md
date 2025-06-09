# Clinica Provider Schedule - Product Requirements Document

## 1. Introduction

**Product Name:** Clinica Provider Schedule  
**Purpose:** To provide a comprehensive scheduling and calendar management system for healthcare clinics. It enables efficient management of staff schedules, tracking of vacations and time-off, and clear coordination of clinic and medical assistant assignments for providers.  

**Brief Description:** Clinica Provider Schedule is a web-based application designed to streamline the complex task of scheduling healthcare professionals. It offers robust features for creating, viewing, and managing shifts, including recurring events and exceptions, with a strong emphasis on visual clarity, conflict prevention, and user-friendly data management.

---

## 2. Goals

- **Efficient Scheduling:** Simplify and accelerate the process of creating and modifying staff schedules
- **Conflict Reduction:** Proactively identify and help prevent scheduling conflicts for providers
- **Enhanced Visibility:** Provide a clear, up-to-date view of all provider assignments, clinic utilization, and medical assistant allocations
- **Flexible Management:** Support complex scheduling needs through recurring shifts, vacation planning, and handling of exceptions to standard schedules
- **Improved Communication:** Serve as a central source of truth for scheduling information within the clinic
- **User Empowerment:** Offer customizable settings and straightforward data import/export capabilities for administrative flexibility

---

## 3. Target Audience

### Clinic Administrators/Schedulers
Primary users responsible for inputting, managing, and overseeing all schedules. They require full control over provider, clinic, MA, and shift data.

### Healthcare Providers (e.g., Doctors, Nurses)
Users who need to view their assigned shifts, clinic duties, and vacation periods.

### Medical Assistants (MAs)
Users who need to view their assignments with specific providers or shifts.

---

## 4. Key Features & Functionality

### 4.1. Core Data Management

#### Provider Management
- Create, Read, Update, Delete (CRUD) providers
- Assign a unique color for visual identification on the calendar
- Set provider status (Active/Inactive) to control their availability for scheduling

#### Clinic Type Management
- CRUD operations for clinic types (e.g., Emergency, Pediatrics)
- Assign a unique color for visual identification
- Set clinic type status (Active/Inactive)

#### Medical Assistant (MA) Management
- CRUD operations for MAs
- Assign a unique color
- Set MA status (Active/Inactive)

### 4.2. Shift Scheduling & Management

#### Shift Creation & Editing
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

#### Shift Duplication (Admin only)
- Duplicate an existing single shift instance as a new, non-recurring shift
- Duplicate an entire recurring series as a new, independent series

#### Shift Deletion (Admin only)
- Delete individual shifts, specific occurrences of recurring shifts, or entire recurring series

### 4.3. Calendar & Visualization

#### Multiple Calendar Views
- **Month View:** Overview of shifts for the entire month. Displays a limited number of shift badges per day with a "more" indicator for overflow
- **Week View:** Detailed columnar view of shifts for each day of the selected week

#### Navigation
- Navigate to previous/next month or week
- Quick navigation to "Today"
- Dynamic display of the current month/year or week range

#### Visual Shift Representation (ShiftBadge)
- Color-coded badges for easy identification of providers/clinics
- Display provider initials (and MA initials/count in month view, full MA names in week view)
- Clear indication of shift times in week view

#### Vacation Visualization (VacationBar)
- Distinct bar at the bottom of a day cell (month view) or within the day column (week view) showing initials of vacationing providers

#### Conflict Highlighting
- Visual indicators (e.g., warning icon) on shifts that overlap with other shifts for the same provider

### 4.4. User Interaction & Experience

#### Drag-and-Drop Scheduling (Admin only)
- Drag a provider from the sidebar onto a calendar day to initiate new shift creation for that provider on that day
- Drag an existing non-vacation shift badge on the calendar to reschedule it to a new date
- Non-recurring shifts are simply moved
- Instances of recurring shifts, when dragged, become new, separate (exception) occurrences on the target date, leaving the original series intact

#### Filtering System
- Filter the calendar display by one or more Providers
- Filter by one or more Clinic Types
- Filter by one or more Medical Assistants
- Toggle visibility of Vacations/Time-off

#### Modal-Driven Operations
- Dedicated modals for creating/editing Providers, Clinic Types, MAs, and Shifts
- Modals for viewing shift details, confirming deletions, managing recurrence choices, import/export, and settings

#### Conflict Warnings
- Real-time warnings within the Shift Form if the configured shift times/dates conflict with existing shifts for the selected provider

#### Toast Notifications
- Non-intrusive feedback for actions (success, error, info, warning)

#### Responsive Sidebar
- Collapsible on smaller screens for better space utilization, with an overlay for mobile interaction

### 4.5. User Roles & Permissions

#### Anonymous Users (Not Signed In)
- ✅ **READ-ONLY ACCESS**: Can view all schedules, providers, clinics, medical assistants, and shift data
- ✅ **Calendar Navigation**: Can navigate between views (Month, Week, Day) and dates
- ✅ **Filtering**: Can use all filtering options to view specific data
- ✅ **Export**: Can export data to PDF (view-only export options)
- ❌ **Import Restrictions**: Cannot access import functionality
- ❌ **No Editing**: Cannot create, edit, or delete any data
- ❌ **No Settings Access**: Cannot modify application settings

#### Authenticated Users (Signed In)
- ✅ **FULL ACCESS**: Complete read/write access to all features
- ✅ **Data Management**: Can create, edit, delete providers, clinics, MAs, and shifts
- ✅ **Import/Export**: Full access to import and export functionality
- ✅ **Settings Management**: Can modify application settings
- ✅ **Drag-and-Drop**: Can perform all drag-and-drop operations
- ✅ **Advanced Features**: Access to all administrative functions

#### Authentication Model
- **No login required for viewing** - Users can immediately access and browse all schedule data
- **Login only required for editing** - Authentication is only prompted when users attempt to create, edit, or import data
- **Seamless transition** - Users can sign in at any time to gain editing privileges without losing their current view

### 4.6. Data Handling

#### Data Persistence
All application data (Providers, Clinics, MAs, Shifts, User Settings) is stored in the browser's LocalStorage.

#### JSON Data Import
- Upload a JSON file or paste JSON content to import Providers, Clinic Types, MAs, and Shifts
- Updates existing items if IDs match; otherwise, adds new items
- Provides feedback on the import process

#### JSON Data Export
- Export all application data (Providers, Clinics, MAs, Shifts, User Settings) into a single JSON file for backup or transfer

#### PDF Export (Placeholder)
- UI option to "Print / Export to PDF," leading to a setup modal
- The setup modal currently indicates this feature is under development, outlining future customization options (date range, view type, specific personnel, orientation, paper size)

### 4.7. Application Settings (Admin only)

- **Default Calendar View:** Set whether the calendar initially loads in 'Month' or 'Week' view
- **Week Starts On:** Configure the calendar week to start on 'Sunday' or 'Monday'

---

## 5. User Interface (UI) / User Experience (UX) Design

### Layout
- **Header:** Contains application title, date navigation, view mode switcher, action buttons (New Shift, Import, Export, Settings), and user role switcher
- **Sidebar (Left):** Houses filtering options and management sections for Providers, Clinic Types, and MAs. Providers are draggable. Sections are collapsible. The sidebar itself is collapsible on smaller screens
- **Main Content Area:** Displays the selected calendar view (Month or Week)

### Visual Design
- Clean, professional, and intuitive interface utilizing TailwindCSS
- Extensive use of color-coding for Providers, Clinic Types, MAs, and shift states (e.g., vacation) to enhance visual scanning and differentiation

### Key UI Components
- Interactive Month and Week Calendar Grids
- Draggable elements (Provider items in sidebar, Shift Badges on calendar)
- Forms housed within Modals for focused data entry and operations
- Dropdowns, checkboxes, and radio buttons for selections and options
- Standardized buttons with icons for common actions (Add, Edit, Delete, Navigate)
- Color Picker component for consistent color selection
- Drag Overlay for visual feedback during drag operations

### Accessibility
- ARIA attributes are used for modals, forms, and interactive elements to improve screen reader compatibility
- Focus management is implemented within modals
- Keyboard navigation support for interactive elements (e.g., calendar cells, draggable items)

### Responsiveness
- The layout adapts to different screen sizes, with features like the collapsible sidebar and adjusted text/element sizes for smaller viewports

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
  isExceptionInstance?, exceptionForDate?, createdAt, updatedAt, 
  createdByUserId? 
}
RecurringRule: { frequency, interval?, daysOfWeek?, dayOfMonth?, endDate? }
User: { id, username, role }
UserSettings: { defaultCalendarView, weekStartsOn }
ToastMessage: { id, message, type, duration? }
```

---

## 7. Non-Functional Requirements

### Performance
The application should render calendar views and respond to user interactions (filtering, dragging, opening modals) smoothly and efficiently, especially with a large number of shifts. Conflict detection should be performant.

### Usability
The interface must be intuitive for schedulers to learn and use efficiently. Viewing schedules should be straightforward for all users.

### Reliability
Data stored in LocalStorage should be consistently saved and retrieved. Error handling for API calls (if any were present) and user input should be robust.

### Offline Functionality
Due to the use of LocalStorage as the primary data store, the application functions offline, with all data and functionality available without an internet connection.

### Cross-Browser Compatibility
The application should function correctly across modern web browsers (e.g., Chrome, Firefox, Safari, Edge).

### Maintainability
Code should be clean, well-organized, and documented (as per general guidelines).

---

## 8. Future Considerations / Potential Enhancements

- **Full PDF Export Implementation:** Develop the PDF export feature with the planned customization options (date range, views, personnel selection, layout)
- **"Day" Calendar View:** Implement a daily calendar view for a more granular look at a single day's schedule
- **User Authentication & Authorization:** Implement a proper user login system with secure credential management, moving beyond the current local role-switching mechanism
- **Cloud Data Synchronization:** Allow data to be stored and synchronized with a cloud backend for multi-user collaboration, data backup, and access across multiple devices
- **Advanced Reporting:** Introduce features for generating reports on provider hours, clinic utilization, MA assignments, etc.
- **Shift Change Requests/Time-Off Requests:** Allow providers to request shift changes or time off directly within the application, subject to admin approval
- **Audit Trail:** Log significant changes to schedules and data for accountability and history tracking
- **Automated Scheduling Assistance:** Explore AI/ML-powered suggestions for optimal scheduling based on predefined rules or historical data
- **Mobile Application:** Develop a dedicated mobile application or further optimize the web interface for an improved mobile experience
- **External Calendar Integration:** Allow synchronization with external calendar platforms (e.g., Google Calendar, Outlook Calendar)