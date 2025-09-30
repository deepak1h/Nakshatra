# Nakshatra - Celestial Astrology Platform

## Overview

Nakshatra is a comprehensive full-stack astrology web application that combines traditional Vedic astrology with modern technology. The platform offers personalized Kundali (birth chart) readings, an e-commerce store for celestial products, and an AI-powered astrological chatbot. Built with a cosmic-themed design featuring deep blues, purples, and golds, the application provides users with spiritual guidance and astrological insights through multiple service channels.

## Recent Changes

**September 28, 2025**: Successfully imported and configured for Replit environment
- Migrated database configuration from Neon serverless to local PostgreSQL
- Fixed SSL certificate issues in database connectivity  
- Configured Vite dev server to work with Replit proxy (host: 0.0.0.0, port: 5000)
- Set up development workflow for seamless frontend/backend integration
- Configured deployment settings for production (VM target)
- All API endpoints verified working (products, auth, promotional banners)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using **React with TypeScript** and employs a component-based architecture. The application uses **Vite** as the build tool and development server, providing fast hot module replacement and optimized builds. The UI framework is **shadcn/ui** with **Radix UI** primitives for accessible components, styled with **Tailwind CSS** for a cosmic-themed design system.

**State Management**: The application uses React Context for global state (CartContext) and **TanStack Query (React Query)** for server state management, providing efficient data fetching, caching, and synchronization.

**Routing**: Implemented with **Wouter**, a lightweight client-side routing solution that provides navigation without the overhead of larger routing libraries.

**Styling**: A comprehensive design system using CSS custom properties for theming, with cosmic color variables (cosmic-navy, cosmic-purple, cosmic-gold) and typography using Inter and Playfair Display fonts.

### Backend Architecture
The server-side follows a **REST API architecture** built with **Express.js and TypeScript**. The application uses a modular approach with separate files for routes, storage operations, and external service integrations.

**API Structure**: RESTful endpoints organized by feature domains:
- Products API (`/api/products`)
- Orders API (`/api/orders`) 
- Kundali requests (`/api/kundali`)
- Chat functionality (`/api/chat`)
- Contact forms (`/api/contact`)

**Service Layer**: Dedicated service modules for AI integration (Gemini AI) and business logic separation from routing concerns.

**Error Handling**: Centralized error handling middleware with proper HTTP status codes and structured error responses.

### Data Storage Solutions
**Database**: PostgreSQL with **Drizzle ORM** for type-safe database operations and schema management. The database is hosted on **Neon** (serverless PostgreSQL).

**Schema Design**: Well-structured relational database with tables for:
- Users (authentication and profile data)
- Products (e-commerce catalog)
- Orders and OrderItems (transaction management)
- KundaliRequests (astrology service orders)
- ChatMessages (AI conversation history)
- ContactMessages (customer inquiries)

**Database Features**: Uses UUID primary keys, proper foreign key relationships, JSON fields for complex data (shipping addresses), and timestamp tracking for audit trails.

### Authentication and Authorization
The application architecture supports user authentication through a users table schema, though the specific authentication implementation (sessions, JWT, OAuth) is not explicitly defined in the current codebase. The system is designed to handle user-specific data and personalized experiences.

## External Dependencies

### AI Integration
**Google Gemini AI**: Integrated through `@google/genai` for the AstroAI chat feature. Provides personalized astrological guidance with a specialized system prompt that ensures responses are mystical, accurate, and empathetic while staying within astrological domain expertise.

### Payment Processing
**Stripe**: Full integration with `@stripe/stripe-js` and `@stripe/react-stripe-js` for secure payment processing of Kundali orders and product purchases.

**PayPal**: Alternative payment processing through `@paypal/paypal-server-sdk` for additional payment flexibility.

### Database and Hosting
**Neon Database**: Serverless PostgreSQL hosting with connection pooling through `@neondatabase/serverless`.

**Drizzle Kit**: Database migration and schema management tools for maintaining database structure.

### Development and Build Tools
**Vite**: Modern build tool with React plugin for development and production builds.

**Replit Integration**: Development environment integration with error overlays and cartographer plugin for Replit-specific features.

### UI and Styling
**Radix UI**: Comprehensive set of accessible, unstyled UI primitives for building the component library.

**Tailwind CSS**: Utility-first CSS framework with custom theme configuration for the cosmic design system.

**Lucide React**: Icon library providing consistent iconography throughout the application.

### Form and Data Management
**React Hook Form**: Efficient form state management with validation through `@hookform/resolvers`.

**Zod**: Runtime type validation and schema validation for API endpoints and form data.

**TanStack Query**: Server state management with caching, background updates, and optimistic updates.