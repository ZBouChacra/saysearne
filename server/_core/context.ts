import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { verifyToken } from "./auth/jwt";
import * as db from "../db";

export type TrpcContext = {
    req: CreateExpressContextOptions["req"];
    res: CreateExpressContextOptions["res"];
    user: User | null;
};

export async function createContext(
    opts: CreateExpressContextOptions
): Promise<TrpcContext> {
    let user: User | null = null;

    try {
        const token = opts.req.cookies?.[COOKIE_NAME];
        if (token) {
            const payload = verifyToken(token);
            if (payload) {
                user = await db.getUserById(payload.userId) ?? null;
            }
        }
    } catch (error) {
        user = null;
    }

    return {
        req: opts.req,
        res: opts.res,
        user,
    };
}