# Clinica Provider Schedule

A comprehensive scheduling and calendar management system for healthcare clinics. Enables efficient management of staff schedules, tracking of vacations and time-off, and clear coordination of clinic and medical assistant assignments for providers.

## Features

### Core Functionality
- **Provider Management**: Full CRUD operations with color coding and status management
- **Clinic Type Management**: Manage different clinic types (Emergency, Pediatrics, etc.)
- **Medical Assistant Management**: Track and assign MAs to shifts
- **Shift Scheduling**: Create and manage work shifts and vacation time
- **Recurring Shifts**: Support for daily, weekly, bi-weekly, and monthly recurring schedules
- **Exception Handling**: Edit individual instances of recurring shifts

### Calendar Views
- **Month View**: Overview with shift badges and vacation indicators
- **Week View**: Detailed daily columns with time displays
- **Drag & Drop**: Intuitive scheduling by dragging providers and shifts

### Advanced Features
- **Conflict Detection**: Real-time warnings for scheduling conflicts
- **Filtering System**: Filter by providers, clinic types, MAs, and vacations
- **User Roles**: Admin (full access) and User (read-only) modes
- **Data Management**: JSON import/export for backup and data migration
- **PDF Export**: Generate professional schedule reports with customization options

### PDF Export Options
- **View Types**: List view (detailed table) or Calendar view (visual layout)
- **Date Range**: Custom start and end dates
- **Filtering**: Include/exclude specific providers, clinics, MAs, and vacations
- **Output Options**: Portrait/landscape orientation, multiple paper sizes (A4, Letter, Legal)
- **Customization**: Optional custom titles for reports

## Run Locally

**Prerequisites:** Node.js (v16 or higher recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## Build for Production

```bash
npm run build
npm run preview
```

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: TailwindCSS (via CDN)
- **Drag & Drop**: @dnd-kit/core
- **PDF Generation**: jsPDF + html2canvas
- **Build Tool**: Vite
- **Data Storage**: LocalStorage (browser-based)

## Architecture

### Data Model
- **Providers**: Healthcare staff with color coding and status
- **Clinic Types**: Different clinic categories with visual identification
- **Medical Assistants**: Support staff assigned to shifts
- **Shifts**: Work periods with provider, clinic, MA, and time assignments
- **Recurring Rules**: Complex recurrence patterns with exception handling

### Key Components
- **App.tsx**: Main application with context providers and state management
- **Calendar Grids**: Month and week view components
- **Modal System**: Form-based operations for all CRUD functions
- **Drag & Drop**: Provider and shift dragging functionality
- **PDF Export**: Comprehensive export system with customization

## Usage

### Getting Started
1. Start by adding providers, clinic types, and medical assistants
2. Create shifts by dragging providers onto calendar days or using the "New Shift" button
3. Set up recurring shifts for regular schedules
4. Use filters to focus on specific staff or time periods
5. Export schedules as JSON for backup or PDF for reporting

### PDF Export Workflow
1. Click "Export" → "Print / Export to PDF"
2. Configure date range and view type
3. Select providers, clinics, and MAs to include
4. Choose output format (orientation, paper size)
5. Generate and download your custom PDF report

### Administrative Features
- Switch between Admin and User roles in the header
- Import existing schedule data via JSON upload
- Configure application settings (default view, week start day)
- Manage all data with full CRUD operations

## Version History

- **v0.0.2**: Added comprehensive PDF export functionality
- **v0.0.1**: Added PDF library dependencies
- **v0.0.0**: Initial application with core scheduling features

## Contributing

This is a production-ready healthcare scheduling application. For modifications or enhancements, please follow the existing code patterns and TypeScript conventions.

## License

Private/Internal Use
