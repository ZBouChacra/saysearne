import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import bcrypt from "bcrypt";
import type { Express, Request, Response } from "express";
import { nanoid } from "nanoid";
import { sdk } from "./sdk";
import { getSessionCookieOptions } from "./cookies";
import * as db from "../db";
import { ENV } from "./env";

// ─── Email / Password ────────────────────────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const existing = await db.getUserByEmail(email);
  if (existing) return { success: false, error: "Email already in use" };

  const passwordHash = await bcrypt.hash(password, 12);
  const openId = `email_${nanoid()}`;

  await db.upsertUser({
    openId,
    email,
    name,
    passwordHash,
    loginMethod: "email",
    lastSignedIn: new Date(),
  });

  return { success: true };
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ user: Awaited<ReturnType<typeof db.getUserByEmail>> | undefined; error?: string }> {
  const user = await db.getUserByEmail(email);
  if (!user || !user.passwordHash) return { user: undefined, error: "Invalid email or password" };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { user: undefined, error: "Invalid email or password" };

  return { user };
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export function registerOAuthRoutes(app: Express) {
  // Google OAuth — redirect user to Google
  app.get("/api/oauth/google", (_req: Request, res: Response) => {
    if (!ENV.googleClientId) {
      res.status(500).json({ error: "Google OAuth is not configured" });
      return;
    }

    const redirectUri = `${ENV.appUrl}/api/oauth/google/callback`;
    const params = new URLSearchParams({
      client_id: ENV.googleClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
    });

    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  // Google OAuth — callback after Google redirects back
  app.get("/api/oauth/google/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    if (!code) {
      res.redirect("/login?error=google_failed");
      return;
    }

    try {
      // Exchange code for tokens
      const redirectUri = `${ENV.appUrl}/api/oauth/google/callback`;
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
      if (!tokenData.access_token) throw new Error("No access token from Google");

      // Get user info from Google
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const googleUser = await userInfoRes.json() as { id: string; email: string; name: string };

      const openId = `google_${googleUser.id}`;

      // Upsert user in DB
      await db.upsertUser({
        openId,
        email: googleUser.email,
        name: googleUser.name,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(openId);
      if (!user) throw new Error("User not found after upsert");

      // Create session
      const sessionToken = await sdk.createSessionToken(openId, {
        name: user.name ?? "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect("/");
    } catch (error) {
      console.error("[OAuth] Google callback failed", error);
      res.redirect("/login?error=google_failed");
    }
  });
}
