
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './db-client-promise';
import connectDB from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import UserModel from '@/models/user';
import { authConfig } from '@/auth.config'; // We import the base config

if (!process.env.AUTH_SECRET) {
  throw new Error('Missing AUTH_SECRET environment variable. Please set it in your .env file.');
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_PERIOD = 15 * 60 * 1000; // 15 minutes

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // Spread the base config
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: 'jwt' },
  // Now, we define the full list of providers here, in the Node.js environment.
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        await connectDB();
        const user = await UserModel.findOne({ email: credentials.email as string });

        if (user) {
            if (user.lockoutExpires && user.lockoutExpires > new Date()) {
                const remainingTime = Math.ceil((user.lockoutExpires.getTime() - Date.now()) / 60000);
                throw new Error(`Account is locked. Please try again in ${remainingTime} minutes.`);
            }

            if (user.password) {
                const isMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );
                if (isMatch) {
                    user.failedLoginAttempts = 0;
                    user.lockoutExpires = undefined;
                    await user.save();
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                        subscriptionPlan: user.subscriptionPlan,
                    };
                }
            }
            
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
                user.lockoutExpires = new Date(Date.now() + LOCKOUT_PERIOD);
            }
            await user.save();
        } else {
            await bcrypt.compare(credentials.password as string, '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFG');
        }
        
        throw new Error('Invalid email or password.');
      },
    }),
  ],
  // We can override callbacks here to add DB logic
  callbacks: {
    ...authConfig.callbacks, // Keep the base callbacks
    // This JWT callback can now safely access the database
    async jwt({ token, user, trigger, session }) {
      if (user) { // On initial sign-in
        token.id = user.id;
        token.role = user.role;
        token.subscriptionPlan = user.subscriptionPlan;
      }
      
      // This ensures the token is always up-to-date with the DB
      if (token.id) {
        try {
          await connectDB();
          const dbUser = await UserModel.findById(token.id);
          if (dbUser) {
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.picture = dbUser.image;
            token.role = dbUser.role;
            token.subscriptionPlan = dbUser.subscriptionPlan;
          } else {
            return null; // User not found, invalidate token
          }
        } catch (error) {
           console.error("Error refreshing JWT token:", error);
           return null;
        }
      }
      return token;
    },
    // Session callback remains the same, it just passes data from the token.
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'user' | 'brand_manager' | 'admin';
        session.user.subscriptionPlan = token.subscriptionPlan as 'free' | 'pro' | 'enterprise';
      }
      return session;
    },
  },
});
