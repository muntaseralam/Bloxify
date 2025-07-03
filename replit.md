# Bloxify - Roblox Token Platform

## Overview

Bloxify is a full-stack web application that allows users to earn tokens by completing minigames and watching advertisements, which can then be redeemed for Roblox rewards. The platform features a quest-based progression system, VIP memberships, referral system, and administrative controls.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing  
- **State Management**: React hooks with localStorage persistence
- **HTTP Client**: Axios for API requests
- **Query Management**: TanStack React Query for data fetching

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Basic HTTP authentication
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with role-based access control

### Build System
- **Frontend Build**: Vite with React plugin
- **Backend Build**: ESBuild for server bundling
- **Development**: Hot module replacement via Vite dev server
- **TypeScript**: Shared type definitions across client/server/shared

## Key Components

### User Management System
- User registration and authentication
- Role-based access control (user, admin, owner)
- VIP membership system with expiration tracking
- Roblox integration via username verification

### Quest & Progression System
- Multi-step quest progression (minigame → ads → token generation)
- Daily quest limits (5 per day for regular users, unlimited for VIP)
- Progress tracking with localStorage persistence
- Token earning and redemption mechanics

### Advertisement Integration
- Multi-provider ad system (AdSense, Ezoic, Adsterra)
- Simulated ads for development environment
- Rewarded video ads, banner ads, and interstitials
- Ad completion tracking for token rewards

### Referral System
- Unique referral codes for each user
- Tracking of inviter/invitee relationships
- Automated payout system (1 token at 10 tokens earned, VIP bonuses)
- Roblox UserId integration for cross-platform tracking

### Administrative Dashboard
- User management with role assignment
- Statistics tracking (daily, monthly, yearly)
- User registration analytics
- Admin authentication with protected routes

## Data Flow

1. **User Registration**: New users create accounts with Roblox usernames
2. **Quest Initiation**: Users start quests through the waitlist interface
3. **Minigame Completion**: Canvas-based game with collision detection and scoring
4. **Ad Viewing**: Integration with ad providers for rewarded content
5. **Token Generation**: Cryptographic token creation upon quest completion
6. **Roblox Integration**: HTTP API for token verification in Roblox games
7. **Referral Processing**: Automatic payout calculation when referees earn tokens

## External Dependencies

### Core Runtime
- Node.js with ES modules
- PostgreSQL database (via Neon serverless)
- Express.js web framework

### Frontend Libraries
- React ecosystem (React Query, React Hook Form)
- Radix UI primitives for accessibility
- Tailwind CSS for styling
- Wouter for routing

### Backend Services
- Drizzle ORM for database operations
- Express session management
- Basic HTTP authentication
- Roblox API integration (user verification, gamepass checking)

### Ad Network Integrations
- Google AdSense for banner/display ads
- Ezoic for AI-optimized ad placements  
- Adsterra for interstitial and rewarded video ads

## Deployment Strategy

### Build Process
- Frontend: Vite build outputs to `dist/public`
- Backend: ESBuild bundles server to `dist/index.js`
- Database: Drizzle migrations in `migrations/` directory

### Environment Configuration
- `DATABASE_URL` required for PostgreSQL connection
- Ad network credentials configured via admin panel
- Production/development mode switching

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend  
├── shared/          # Shared types and schemas
├── migrations/      # Database migrations
└── dist/           # Build output
```

### Production Considerations
- Static file serving via Express
- Database connection pooling
- Ad network script loading
- Environment-specific configurations

## Changelog
- July 03, 2025: Implemented complete Roblox code redemption system with database tracking
- July 02, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.