
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// The `auth` object is initialized with the Edge-compatible config.
const { auth } = NextAuth(authConfig);

// We export the `auth` function directly, which will be used as the middleware.
export default auth;

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes are protected internally)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - addon (Adobe Express addon files)
   * - Public pages like /, /login, /signup, etc.
   * This ensures that only the protected routes are checked by the middleware.
   */
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
