import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword, validatePassword } from "../_core/auth/password";
import { generateToken, generateOpenId, verifyToken } from "../_core/auth/jwt";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
    // Register with email/password
    register: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string().min(8),
                firstName: z.string().optional(),
                lastName: z.string().optional(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const db = await getDb();
            if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

            // Validate password
            const passwordCheck = validatePassword(input.password);
            if (!passwordCheck.valid) {
                throw new TRPCError({ code: "BAD_REQUEST", message: passwordCheck.message });
            }

            // Check if user exists
            const [existingUser] = await db.select().from(users).where(eq(users.email, input.email));
            if (existingUser) {
                throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
            }

            // Hash password
            const passwordHash = await hashPassword(input.password);
            const openId = generateOpenId();

            // Create user
            const [result] = await db.insert(users).values({
                openId,
                email: input.email,
                passwordHash,
                firstName: input.firstName,
                lastName: input.lastName,
                name: `${input.firstName || ""} ${input.lastName || ""}`.trim(),
                loginMethod: "email",
                lastSignedIn: new Date(),
            });

            const [newUser] = await db.select().from(users).where(eq(users.id, result.insertId));

            // Generate JWT
            const token = generateToken({
                userId: newUser.id,
                email: newUser.email!,
                role: newUser.role,
                openId: newUser.openId,
            });

            return { user: newUser, token };
        }),

    // Login with email/password
    login: publicProcedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

            // Find user
            const [user] = await db.select().from(users).where(eq(users.email, input.email));
            if (!user || !user.passwordHash) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
            }

            // Check if account is locked
            if (user.isLocked || (user.lockedUntil && user.lockedUntil > new Date())) {
                throw new TRPCError({ code: "FORBIDDEN", message: "Account is locked. Please contact support." });
            }

            // Verify password
            const isValid = await comparePassword(input.password, user.passwordHash);
            if (!isValid) {
                // Increment failed attempts
                const failedAttempts = (user.failedLoginAttempts || 0) + 1;
                const updates: any = { failedLoginAttempts: failedAttempts };

                // Lock account after 5 failed attempts
                if (failedAttempts >= 5) {
                    updates.isLocked = true;
                    updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
                }

                await db.update(users).set(updates).where(eq(users.id, user.id));
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
            }

            // Reset failed attempts
            await db.update(users).set({
                failedLoginAttempts: 0,
                lastSignedIn: new Date(),
            }).where(eq(users.id, user.id));

            // Generate JWT
            const token = generateToken({
                userId: user.id,
                email: user.email!,
                role: user.role,
                openId: user.openId,
            });

            return { user, token };
        }),

    // Get current user
    me: publicProcedure.query(async ({ ctx }) => {
        const token = ctx.token; // We'll add this to context
        if (!token) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
        }

        const payload = verifyToken(token);
        if (!payload) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
        }

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
        if (!user) {
            throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        return { user };
    }),

    // Logout
    logout: publicProcedure.mutation(() => {
        return { message: "Logged out successfully" };
    }),
});