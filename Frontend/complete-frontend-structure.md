# Complete Next.js Frontend Implementation for AI Model Review Platform

## Project Structure

```
modelmate-frontend/
├── app/
│   ├── layout.js                      # Root layout
│   ├── page.js                        # Home page
│   ├── globals.css                    # Global styles
│   ├── loading.js                     # Loading UI
│   ├── error.js                       # Error boundary
│   ├── not-found.js                   # 404 page
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.js                # Login page
│   │   ├── register/
│   │   │   └── page.js               # Register page
│   │   └── forgot-password/
│   │       └── page.js            # Forgot password
│   ├── models/
│   │   ├── page.js               # Models listing
│   │   ├── compare/
│   │   │   └── page.js            # Model comparison
│   │   └── [id]/
│   │       ├── page.js              # Model detail
│   │       ├── reviews/
│   │       │   └── page.js         # Model reviews
│   │       ├── discussions/
│   │       │   └── page.js           # Model discussions
│   │       └── review/
│   │           └── page.js         # Write review
│   ├── categories/
│   │   ├── page.js                   # Categories listing
│   │   └── [slug]/
│   │       └── page.js             # Category detail
│   ├── discussions/
│   │   ├── page.js                # All discussions
│   │   ├── create/
│   │   │   └── page.js            # Create discussion
│   │   └── [id]/
│   │       └── page.js              # Discussion detail
│   ├── profile/
│   │   ├── page.js                  # User profile
│   │   ├── settings/
│   │   │   └── page.js             # Profile settings
│   │   ├── reviews/
│   │   │   └── page.js             # User reviews
│   │   └── discussions/
│   │       └── page.js          # User discussions
│   ├── search/
│   │   └── page.js              # Search results
│   └── _components/
│       ├── ui/                       # Reusable UI components
│       │   ├── Button.js
│       │   ├── Input.js
│       │   ├── Card.js
│       │   ├── Modal.js
│       │   ├── Dropdown.js
│       │   ├── Badge.js
│       │   ├── Pagination.js
│       │   ├── Rating.js
│       │   └── LoadingSpinner.js
│       ├── layout/                   # Layout components
│       │   ├── Header.js
│       │   ├── Navbar.js
│       │   ├── Footer.js 
│       │   └── Sidebar.js
│       ├── forms/                    # Form components
│       │   ├── LoginForm.js
│       │   ├── RegisterForm.js
│       │   ├── ReviewForm.js
│       │   └── DiscussionForm.js
│       ├── model/                    # Model-related components
│       │   ├── ModelCard.js
│       │   ├── ModelGrid.js
│       │   ├── ModelDetail.js
│       │   ├── ModelCompare.js
│       │   └── ModelStats.js
│       ├── review/                   # Review components
│       │   ├── ReviewCard.js 
│       │   ├── ReviewList.js 
│       │   └── ReviewStats.js 
│       ├── discussion/               # Discussion components
│       │   ├── DiscussionCard.js 
│       │   ├── DiscussionList.js
│       │   └── CommentThread.js
│       ├── auth/                     # Auth components
│       │   ├── AuthGuard.js
│       │   └── AuthStatus.js 
│       └── common/                   # Common components
│           ├── SearchBar.js 
│           ├── FilterPanel.js 
│           ├── SortOptions.js 
│           └── ErrorBoundary.js 
├── lib/
│   ├── api.js                        # API client
│   ├── auth.js                       # Authentication utilities
│   ├── utils.js                      # Utility functions
│   └── hooks/                        # Custom hooks
│       ├── useAuth.js
│       ├── useApi.js
│       └── useLocalStorage.js
├── styles/
│   └── components.css              # Component-specific styles
├── public/
│   ├── images/
│   └── icons/
├── .env.local                        # Environment variables
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind configuration
└── package.json                      # Dependencies
```

## Key Features

### 1. **Responsive Design**
- Mobile-first approach with Tailwind CSS
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid layouts and responsive navigation

### 2. **Error Handling**
- Global error boundary for unhandled errors
- API error handling with retry mechanisms
- Form validation with user-friendly error messages
- Loading states and error states for all components

### 3. **Authentication**
- JWT-based authentication with refresh tokens
- Protected routes with AuthGuard component
- Persistent login state with localStorage
- Login, register, and forgot password flows

### 4. **State Management**
- SWR for data fetching with caching
- Custom hooks for common operations
- Local state management with useState/useReducer

### 5. **API Integration**
- Axios client with interceptors for JWT handling
- Automatic token refresh
- Request/response logging and error handling
- API endpoints for all backend operations

### 6. **UI Components**
- Reusable component library
- Consistent design system
- Accessibility features (ARIA labels, keyboard navigation)
- Loading states and skeleton screens

### 7. **Performance**
- Server-side rendering with Next.js App Router
- Image optimization with next/image
- Code splitting and lazy loading
- Caching strategies with SWR

### 8. **Search & Filtering**
- Global search functionality
- Category-based filtering
- Sorting options (rating, date, popularity)
- Pagination for large datasets

### 9. **User Experience**
- Smooth transitions and animations
- Intuitive navigation
- Breadcrumb navigation
- Toast notifications for user feedback

### 10. **Security**
- Input sanitization
- CSRF protection
- Secure API communication
- Role-based access control

## Installation Instructions

1. **Initialize Project**
   ```bash
   npx create-next-app modelmate-frontend --no-ts --no-src-dir --app --eslint --tailwind --import-alias '@/'
   cd modelmate-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install axios swr jwt-decode
   npm install @headlessui/react @heroicons/react
   npm install react-hot-toast
   npm install date-fns
   ```

3. **Environment Setup**
   ```bash
   # .env.local
   NEXT_PUBLIC_API_BASE=http://localhost:8000
   NEXT_PUBLIC_APP_NAME=ModelMate
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Development Guidelines

### 1. **Component Development**
- Use functional components with hooks
- Follow single responsibility principle
- Implement proper prop validation
- Add TypeScript-style JSDoc comments

### 2. **Error Handling**
- Wrap API calls in try-catch blocks
- Provide fallback UI for failed states
- Log errors for debugging
- Show user-friendly error messages

### 3. **Responsive Design**
- Use Tailwind's responsive utilities
- Test on multiple screen sizes
- Implement touch-friendly interfaces
- Optimize for mobile performance

### 4. **Code Organization**
- Group related components
- Use barrel exports for clean imports
- Follow consistent naming conventions
- Implement proper file structure

### 5. **Testing Strategy**
- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for critical user flows
- Visual regression tests for UI components

This structure provides a complete, production-ready frontend that follows modern React/Next.js best practices while maintaining clean code organization and excellent user experience.