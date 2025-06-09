# Clinica Provider Schedule

A comprehensive healthcare scheduling and calendar management application built with React, TypeScript, and TailwindCSS.

## 🚀 **New: Supabase Cloud Integration**

**Version 0.2.0** introduces full cloud functionality with Supabase:
- 🔐 **Real Authentication** (email/password, password reset)
- ☁️ **Cloud Data Storage** (PostgreSQL with automatic backups)
- 👥 **Multi-User Support** (isolated data per user)
- 🔄 **Real-time Sync** (collaborative scheduling)
- 📱 **Cross-Device Access** (data synced everywhere)

See **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** for complete setup instructions.

## 📋 **Features**

### Core Functionality
- **Provider Management**: Create and manage healthcare providers with color coding
- **Clinic Type Management**: Organize different clinic specialties
- **Medical Assistant Management**: Track support staff assignments
- **Shift Scheduling**: Create, edit, and manage work shifts and vacations
- **Recurring Shifts**: Support for daily, weekly, bi-weekly, and monthly patterns
- **Conflict Detection**: Automatic detection and highlighting of scheduling conflicts
- **Drag & Drop**: Intuitive calendar interactions for quick scheduling

### Calendar Views
- **Month View**: Overview of all shifts with overflow handling
- **Week View**: Detailed weekly schedule with time slots
- **Day View**: Granular daily view with hourly time slots

### Advanced Features
- **Authentication**: Simple admin toggle (localStorage) or full Supabase auth
- **Data Export/Import**: JSON and PDF export capabilities
- **Filtering**: Advanced filtering by providers, clinics, MAs, and vacations
- **Settings**: Customizable calendar preferences
- **Error Handling**: Comprehensive error boundaries and validation
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🏗️ **Installation**

### Quick Start (localStorage mode)
```bash
git clone <repository-url>
cd clinica-provider-schedule
npm install
npm run dev
```

### Cloud Mode (with Supabase)
1. Follow the **localStorage setup** above
2. Create a Supabase project
3. Follow **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** for complete configuration
4. Add environment variables and run

## 🛠️ **Development**

### Available Scripts
```bash
npm run dev                    # Start development server
npm run build                  # Production build
npm run build:production       # Explicit production build
npm run preview               # Preview build locally
npm run type-check           # TypeScript validation
```

### Tech Stack
- **React 19** with TypeScript
- **TailwindCSS** for styling
- **Vite** for building and development
- **@dnd-kit** for drag and drop
- **jsPDF + html2canvas** for PDF export
- **Supabase** for cloud features (optional)

## 📊 **Architecture**

### Local Storage Mode
- Data stored in browser localStorage
- Simple admin/user role switching
- Full functionality offline
- No user isolation

### Supabase Cloud Mode
- PostgreSQL database with Row Level Security
- Real authentication with email/password
- User-isolated data
- Real-time synchronization
- Cross-device access

## 🔧 **Configuration**

### Environment Variables
```bash
# For Supabase integration (optional)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### User Settings
- Default calendar view (Month/Week/Day)
- Week start day (Sunday/Monday)
- Filtering preferences

## 📱 **Usage**

### Basic Workflow
1. **Setup**: Create providers, clinic types, and medical assistants
2. **Schedule**: Create shifts by dragging providers to calendar days
3. **Manage**: Edit shifts, handle recurring patterns, manage exceptions
4. **Export**: Generate PDF schedules or export data

### Authentication Modes
- **Demo Mode**: Click "Admin" toggle for full access
- **Cloud Mode**: Sign up/sign in with email and password

## 🔒 **Security**

### Local Storage Mode
- Data stored locally in browser
- No user authentication
- Single-user application

### Supabase Mode
- Row Level Security (RLS) enforced
- User data isolation
- Secure authentication
- Encrypted data transmission

## 📈 **Performance**

- Optimized bundle splitting for faster loading
- Efficient conflict detection algorithms
- Responsive design for all screen sizes
- Production-ready build configuration

## 🚀 **Deployment**

### Static Hosting (localStorage mode)
Deploy the `dist` folder to any static hosting service:
- Netlify
- Vercel  
- GitHub Pages
- Traditional web servers

### Cloud Deployment (Supabase mode)
1. Set up Supabase project
2. Configure environment variables
3. Deploy to any hosting service
4. Update Supabase auth settings

## 📝 **Documentation**

- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Complete Supabase integration guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment instructions
- **[finish_plan.md](finish_plan.md)** - Development roadmap and features

## 🆕 **What's New in v0.2.0**

### 🌟 Major Features
- **Supabase Integration**: Full cloud functionality
- **Real Authentication**: Email/password with password reset
- **Multi-User Support**: Isolated data per user
- **Error Boundaries**: Comprehensive error handling
- **Enhanced Validation**: Robust form and data validation

### 🔧 Technical Improvements
- TypeScript type safety improvements
- Production-ready build configuration
- Comprehensive test coverage preparation
- Advanced error handling throughout

## 🛣️ **Roadmap**

### ✅ Completed
- Core scheduling functionality
- Multiple calendar views
- PDF export
- Supabase integration
- Enhanced error handling

### 🔄 In Progress
- Real-time collaboration features
- Advanced reporting
- Mobile app optimization

### 📋 Planned
- Advanced analytics
- External calendar integration
- Automated scheduling suggestions
- Mobile applications

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 📞 **Support**

- Create an issue for bug reports
- Check documentation for setup help
- Review existing issues before creating new ones

---

**Built with ❤️ for healthcare professionals**
