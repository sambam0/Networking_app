import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import type { Express } from 'express';
import session from 'express-session';
import { storage } from './storage';

// Configure passport - only set up Google OAuth if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://realconnect.ing/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      const existingUser = await storage.getUserByGoogleId(profile.id);
      
      if (existingUser) {
        // User exists, log them in
        return done(null, existingUser);
      }

      // Check if user exists with this email (from regular signup)
      const existingEmailUser = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (existingEmailUser) {
        // Link Google account to existing user
        const updatedUser = await storage.updateUser(existingEmailUser.id, {
          googleId: profile.id,
          authProvider: 'google'
        });
        return done(null, updatedUser);
      }

      // Create new user from Google profile
      const newUser = await storage.createGoogleUser({
        googleId: profile.id,
        email: profile.emails?.[0]?.value || '',
        fullName: profile.displayName || '',
        username: profile.emails?.[0]?.value?.split('@')[0] || `user_${profile.id}`,
        authProvider: 'google',
        profilePhoto: profile.photos?.[0]?.value,
      });

      return done(null, newUser);
    } catch (error) {
      return done(error as Error, undefined);
    }
  }));
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export function setupAuth(app: Express) {
  // Configure session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
}

export { passport };