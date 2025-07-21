
import type { NextAuthConfig } from 'next-auth';

// This file is now safe for the Edge runtime.
// It only contains configuration needed for middleware (Edge) and does not
// contain the full provider setup, which may rely on Node.js APIs.
// The full provider list is defined in `src/lib/auth.ts`.

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [
    // Providers are defined in the main `auth.ts` file.
    // This array is intentionally left empty for the middleware config.
    // We only need the `pages` and `callbacks` for route protection.
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard');

      if (isAdminRoute) {
        // If it's an admin route, user must be logged in and have the 'admin' role.
        if (isLoggedIn && auth.user.role === 'admin') {
          return true;
        }
        return false; // Redirect unauthenticated or non-admin users.
      } else if (isDashboardRoute) {
        // For any other dashboard route, user just needs to be logged in.
        return isLoggedIn;
      }
      
      // By default, allow access to public routes. The matcher in middleware.ts
      // will ensure this callback only runs for protected routes.
      return true;
    },
    // We keep JWT and session callbacks here, but the main logic for populating
    // the token from the DB will be in `src/lib/auth.ts` to keep this file Edge-friendly.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subscriptionPlan = user.subscriptionPlan;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      if (session.user && token.role) {
        session.user.role = token.role as 'user' | 'brand_manager' | 'admin';
      }
       if (session.user && token.subscriptionPlan) {
        session.user.subscriptionPlan = token.subscriptionPlan as 'free' | 'pro' | 'enterprise';
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
