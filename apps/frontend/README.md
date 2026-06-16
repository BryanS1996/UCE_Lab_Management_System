# Frontend - UCE Lab Management System

React-based web application for the UCE Lab Management System. Provides a modern, responsive interface for managing laboratory reservations, viewing laboratory information, and receiving real-time notifications.

## Technology Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useContext)
- **HTTP Client**: Axios
- **Real-time**: WebSocket (socket.io-client)

## Architecture

### Directory Structure

```
src/
├── components/
│   ├── AuthSection.tsx          # Authentication UI
│   ├── LaboratoriesSection.tsx   # Laboratory listing and management
│   ├── ReservationsSection.tsx   # Reservation creation and management
│   ├── NotificationsSection.tsx  # Notification display
│   ├── Sidebar.tsx               # Navigation sidebar
│   └── Header.tsx                # Top header with notifications
├── api.ts                        # API client configuration
├── App.tsx                       # Main application component
├── main.tsx                      # Application entry point
├── index.css                     # Global styles
└── vite-env.d.ts                # Vite type definitions
```

## Key Features

### Authentication
- User registration and login
- JWT token management (access + refresh tokens)
- Automatic token refresh on 401 errors
- Protected routes with authentication guards

### Laboratory Management
- View all available laboratories
- Filter by status (ACTIVE, MAINTENANCE, INACTIVE)
- Display laboratory details (capacity, location, description)
- Real-time availability updates

### Reservation Management
- Create new reservations
- Select laboratory from dropdown
- Choose date and time slots
- View reservation history
- Cancel reservations
- Real-time status updates

### Notifications
- Real-time notification delivery via WebSocket
- Unread notification count
- Mark notifications as read
- Notification history
- Different notification types (reservation created, confirmed, cancelled)

### UI/UX Features
- Modern, responsive design
- UCE brand colors (uce-navy, uce-blue)
- Sidebar navigation
- Notification bell with badge
- Smooth transitions and animations
- Mobile-friendly layout

## Environment Configuration

### Local Development
```env
VITE_API_URL=http://localhost:3010
VITE_WS_URL=ws://localhost:3013
```

### QA Environment
```env
VITE_API_URL=/api
VITE_WS_URL=ws://localhost:3013
```

### Production
```env
VITE_API_URL=/api
VITE_WS_URL=wss://your-domain.com
```

## API Communication

The frontend communicates with backend services through:

### REST API Endpoints

#### Auth Service
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

#### Laboratory Service
- `GET /api/laboratories` - Get all laboratories
- `GET /api/laboratories/:lab_id` - Get specific laboratory

#### Reservation Service
- `GET /api/reservations/my` - Get user's reservations
- `POST /api/reservations` - Create reservation
- `DELETE /api/reservations/:id` - Cancel reservation

#### Notification Service
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### WebSocket Connection

```typescript
const socket = io(VITE_WS_URL, {
  auth: { token: accessToken },
  query: { token: accessToken }
});

// Listen for notifications
socket.on('notification', (notification) => {
  // Handle new notification
});
```

## Component Architecture

### App.tsx
Main application component that manages:
- Authentication state (isLoggedIn, user info)
- WebSocket connection
- Layout (Sidebar + Header + Main Content)
- Routing between sections

### Sidebar.tsx
Navigation sidebar with:
- Dashboard link
- Laboratories link
- Reservations link
- Notifications link
- Logout functionality
- UCE-navy background
- Lucide-react icons

### Header.tsx
Top header component with:
- User greeting
- Notification bell with unread count badge
- Mobile menu toggle
- White background

### AuthSection.tsx
Authentication component with:
- Login form
- Registration form
- JWT token handling
- Auto-refresh on 401 errors
- Modern UI with uce-blue buttons

### LaboratoriesSection.tsx
Laboratory management component with:
- Laboratory listing
- Status filtering
- Laboratory details display
- Capacity and location information
- Reserve button integration

### ReservationsSection.tsx
Reservation management component with:
- Reservation creation form
- Laboratory selection dropdown
- Date and time slot selection
- Reservation history
- Cancel reservation functionality
- Real-time updates

### NotificationsSection.tsx
Notification display component with:
- Notification list
- Unread count display
- Mark as read functionality
- Notification type icons
- Real-time WebSocket updates

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd apps/frontend
npm install
```

### Running Locally

```bash
# Development mode with hot-reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Unit tests (when implemented)
npm test

# Test coverage (when implemented)
npm run test:coverage
```

## Docker Deployment

The frontend runs automatically with Docker Compose from the project root:

```bash
docker-compose -f docker-compose.qa.yml up -d frontend-qa
```

The frontend is served via Nginx on port 80 in the Docker container.

## Styling

### Tailwind CSS Configuration

Custom colors defined in `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'uce-navy': '#1e3a5f',
        'uce-blue': '#3b82f6',
      }
    }
  }
}
```

### Design System

- **Primary Color**: uce-blue (#3b82f6)
- **Secondary Color**: uce-navy (#1e3a5f)
- **Background**: White and light grays
- **Typography**: Modern sans-serif
- **Spacing**: Consistent 4px grid system
- **Border Radius**: rounded-xl (12px) for cards
- **Shadows**: shadow-xl for depth

## State Management

The application uses React Hooks for state management:

- `useState`: Component-level state
- `useEffect`: Side effects and data fetching
- `useContext`: Global state (authentication, notifications)
- `useCallback`: Memoized callbacks
- `useMemo`: Memoized values

## Error Handling

### API Errors
- 401 Unauthorized: Automatic token refresh
- 403 Forbidden: Redirect to login
- 404 Not Found: Display error message
- 500 Server Error: Display error message

### WebSocket Errors
- Connection failed: Retry with exponential backoff
- Authentication failed: Redirect to login
- Disconnection: Attempt reconnection

## Performance Optimization

- Code splitting with React.lazy
- Memoization with useMemo and useCallback
- Lazy loading of components
- Image optimization (when implemented)
- Bundle size optimization with Vite

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode support

## CI/CD

The frontend is included in the GitHub Actions CI/CD pipeline:
- **Build**: Docker image built and pushed to ECR
- **Test**: Unit tests run on every PR
- **Deploy**: Deployed to QA/Production environments

## Future Enhancements

- Advanced filtering and search
- Calendar view for reservations
- Laboratory floor plans
- Equipment booking
- User profile management
- Dark mode support
- Multi-language support
- PWA capabilities
- Offline support
