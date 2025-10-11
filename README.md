# HomeServe - Home Service Management System

A modern, full-stack home service management platform connecting homeowners with trusted service providers.

## Features

- **Multi-role Authentication**: Customer, Provider, and Admin roles
- **Service Management**: Browse, book, and manage home services
- **Provider Portfolio**: Showcase work with image uploads
- **Booking System**: Schedule and track service appointments
- **Admin Dashboard**: Manage users, services, and bookings
- **Support System**: Complaints, ratings, and notifications
- **Payment Integration**: Mock payment processing

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running (see backend repo)

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env.local` file:
   \`\`\`env
   VITE_API_URL=http://localhost:5000
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `VITE_API_URL`: Backend API base URL (default: http://localhost:5000)

## Project Structure

\`\`\`
src/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   └── shared/            # Shared components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and API client
├── services/              # API service functions
└── types/                 # TypeScript type definitions
\`\`\`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Integration

The app connects to the backend API using Axios with automatic JWT token management. All API calls include the Authorization header when a user is logged in.

## Role-Based Access

- **Customer**: Browse services, book appointments, view bookings
- **Provider**: Manage profile, showcase work, handle bookings
- **Admin**: Manage users, services, categories, and system settings

## License

MIT
