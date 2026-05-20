import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { verifyToken } from "./auth/jwt";
import { hashPassword, comparePassword, validatePassword } from "./auth/password";
import { generateOpenId } from "./auth/jwt";
import passport from "passport";

export function registerOAuthRoutes(app: Express) {
    // Register with email/password
    app.post("/api/auth/register", async (req: Request, res: Response) => {
        try {
            const { email, password, firstName, lastName } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: "Email and password are required" });
                return;
            }

            const passwordCheck = validatePassword(password);
            if (!passwordCheck.valid) {
                res.status(400).json({ error: passwordCheck.message });
                return;
            }

            const existingUser = await db.getUserByEmail(email);
            if (existingUser) {
                res.status(400).json({ error: "Email already registered" });
                return;
            }

            const passwordHash = await hashPassword(password);
            const openId = generateOpenId();

            await db.upsertUser({
                openId,
                email,
                passwordHash,
                firstName,
                lastName,
                name: `${firstName || ""} ${lastName || ""}`.trim(),
                loginMethod: "email",
                lastSignedIn: new Date(),
            });

            const user = await db.getUserByEmail(email);
            if (!user) {
                res.status(500).json({ error: "Failed to create user" });
                return;
            }

            const { generateToken } = await import("./auth/jwt");
            const token = generateToken({
                userId: user.id,
                email: user.email!,
                role: user.role,
                openId: user.openId,
            });

            const cookieOptions = getSessionCookieOptions(req);
            res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
            res.json({ success: true, user });
        } catch (error) {
            console.error("[Auth] Register failed", error);
            res.status(500).json({ error: "Registration failed" });
        }
    });

    // Login with email/password
    app.post("/api/auth/login", async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: "Email and password are required" });
                return;
            }

            const user = await db.getUserByEmail(email);
            if (!user || !user.passwordHash) {
                res.status(401).json({ error: "Invalid email or password" });
                return;
            }

            if (user.isLocked || (user.lockedUntil && user.lockedUntil > new Date())) {
                res.status(403).json({ error: "Account is locked. Please contact support." });
                return;
            }

            const isValid = await comparePassword(password, user.passwordHash);
            if (!isValid) {
                const failedAttempts = (user.failedLoginAttempts || 0) + 1;
                const updates: any = { failedLoginAttempts: failedAttempts };
                if (failedAttempts >= 5) {
                    updates.isLocked = true;
                    updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
                }
                await db.updateUserProfile(user.id, updates);
                res.status(401).json({ error: "Invalid email or password" });
                return;
            }

            await db.updateUserProfile(user.id, {
                failedLoginAttempts: 0,
                lastSignedIn: new Date(),
            });

            const { generateToken } = await import("./auth/jwt");
            const token = generateToken({
                userId: user.id,
                email: user.email!,
                role: user.role,
                openId: user.openId,
            });

            const cookieOptions = getSessionCookieOptions(req);
            res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
            res.json({ success: true, user });
        } catch (error) {
            console.error("[Auth] Login failed", error);
            res.status(500).json({ error: "Login failed" });
        }
    });

    // Google OAuth
    app.get("/api/auth/google",
        passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get("/api/auth/google/callback",
        passport.authenticate("google", { session: false, failureRedirect: "/login?error=google" }),
        async (req: Request, res: Response) => {
            try {
                const user = req.user as any;
                const { generateToken } = await import("./auth/jwt");
                const token = generateToken({
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    openId: user.openId,
                });
                const cookieOptions = getSessionCookieOptions(req);
                res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
                res.redirect("/");
            } catch (error) {
                console.error("[Auth] Google callback failed", error);
                res.redirect("/login?error=google");
            }
        }
    );
}