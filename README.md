# Zoptero - Multi-vendor Marketplace & Classifieds

A production-ready Next.js 15+ application with Convex real-time database, Clerk authentication, and a multi-vendor marketplace architecture.

## Tech Stack

- **Frontend**: Next.js 15+, Tailwind CSS, React 19, React Context for UI state
- **Backend/DB**: Convex (Schema-first, real-time sync)
- **Auth**: Clerk with Convex integration (jwt-auth)
- **Storage**: Cloudflare R2/Images (external to Convex, storing URL strings in Convex)
- **Deployment**: Vercel

## Installation

Follow these steps to get your project up and running locally:

1. Clone the repository:

   ```sh
   git clone https://github.com/zoptero/zoptero.com-1.git
   cd zoptero.com-1
   ```

2. Install dependencies:

   ```sh
   pnpm install
   ```

3. Run the development server:

   ```sh
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the result.

## Minimum System Requirements

- Node.js version 20 and above

## Project Architecture

### Core Principles & Rules

1. **PERFORMANCE**: Use 'dynamic imports' for heavy components. Always prioritize minimizing "Time to First Byte" (TTFB).

2. **ONBOARDING & AUTH**: Use the "Optimistic Redirect" pattern. Ensure 'OnboardingGuard' handles transitions via React Context to prevent infinite recursion and UI flickers.

3. **DATA FLOW**: Implement "Multi-tenancy" inside a single Convex project. Use 'searchIndex' for marketplace listings.

4. **CODE QUALITY**: Write type-safe code. Avoid prop drilling; favor composition and Context API for global state. Use 'useRef' for redirect locks.

5. **MARKETPLACE**: Treat listings as a core entity with 'category' and 'keywords' arrays for fast filtering.

### Current Status

- Production-ready onboarding flow is implemented using OnboardingProvider + OnboardingGuard.
- Currently transitioning into building a Multi-vendor Marketplace + Classifieds board.
- The system is designed to be highly scalable and fast.

## Development Guidelines

### Role: Senior Full-Stack Architect

You are a Senior Full-Stack Architect specialized in Next.js (App Router), Convex (Real-time DB), and Clerk (Auth).

### Code Standards

- **Production-ready**: Ensure all code follows production standards with proper error handling and clean structure.
- **Performance**: Prioritize "Lazy loading" and "Edge-compatible" solutions.
- **Architecture**: Always check if changes align with the current Next.js + Convex + Clerk architecture.

### Key Patterns

- **Optimistic Redirect**: For onboarding and auth flows
- **Multi-tenancy**: Inside a single Convex project
- **Search Indexing**: For marketplace listings
- **Context API**: For global state management
- **Type Safety**: All code must be type-safe

### File Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - React components (organized by feature)
- `convex/` - Convex backend functions and schema
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and helpers
- `public/` - Static assets

## Deployment

The project is deployed on Vercel. Ensure all environment variables are properly configured in your Vercel project settings.

## Contributing

When contributing to this project:

1. Follow the established architecture patterns
2. Write type-safe code
3. Use dynamic imports for heavy components
4. Test for performance and edge cases
5. Ensure all changes are production-ready