import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getDb } from '../../../db'; // ← Updated path
import { users } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || '';

export function setupGoogleStrategy() {
    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const db = await getDb(); // ← Updated to use getDb()
                    if (!db) {
                        return done(new Error('Database not available'), undefined);
                    }

                    const googleId = `google_${profile.id}`;
                    const email = profile.emails?.[0]?.value;

                    if (!email) {
                        return done(new Error('No email found from Google'), undefined);
                    }

                    // Check if user exists
                    let [user] = await db.select().from(users).where(eq(users.openId, googleId));

                    if (!user) {
                        // Create new user
                        const [newUser] = await db.insert(users).values({
                            openId: googleId,
                            email,
                            name: profile.displayName,
                            firstName: profile.name?.givenName,
                            lastName: profile.name?.familyName,
                            profilePhoto: profile.photos?.[0]?.value,
                            loginMethod: 'google',
                            lastSignedIn: new Date(),
                        });

                        user = (await db.select().from(users).where(eq(users.id, newUser.insertId)))[0];
                    } else {
                        // Update last signed in
                        await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error as Error, undefined);
                }
            }
        )
    );
}