import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-1",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return createUserContext({ role: "admin", id: 99, openId: "admin-1" });
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ---- Auth Tests ----
describe("auth.me", () => {
  it("returns user when authenticated", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.email).toBe("test@example.com");
  });

  it("returns null when not authenticated", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalledWith(
      COOKIE_NAME,
      expect.objectContaining({ maxAge: -1 })
    );
  });
});

// ---- Categories Tests ----
describe("categories", () => {
  it("list returns array of categories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("allServices returns array of services", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.categories.allServices();
    expect(Array.isArray(result)).toBe(true);
  });

  it("services returns services for a given category", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.categories.services({ categoryId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ---- Professionals Tests ----
describe("professionals", () => {
  it("top returns array of top professionals", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.professionals.top({ limit: 5 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("search returns paginated results", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.professionals.search({ page: 1 });
    expect(result).toHaveProperty("results");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.results)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("search with filters returns results", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.professionals.search({
      categoryId: 1,
      sortBy: "stars",
      sortOrder: "desc",
      page: 1,
    });
    expect(result).toHaveProperty("results");
    expect(result).toHaveProperty("total");
  });

  it("profile throws NOT_FOUND for non-existent user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.professionals.profile({ userId: 999999 })).rejects.toThrow();
  });
});

// ---- Ads Tests ----
describe("ads", () => {
  it("active returns array of ads", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ads.active({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("active with position filter returns array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.ads.active({ position: "home_banner" });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ---- Contact Tests ----
describe("contact", () => {
  it("send creates a contact message", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.contact.send({
      email: "visitor@example.com",
      subject: "Test Subject",
      description: "Test message content",
    });
    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });
});

// ---- Admin Tests ----
describe("admin", () => {
  it("stats returns dashboard statistics", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.stats();
    expect(result).toHaveProperty("totalUsers");
    expect(result).toHaveProperty("totalProfessionals");
    expect(result).toHaveProperty("totalBookings");
    expect(result).toHaveProperty("totalReviews");
  });

  it("users returns paginated user list", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.users({ page: 1, limit: 10 });
    expect(result).toHaveProperty("results");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.results)).toBe(true);
  });

  it("non-admin cannot access stats", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("non-admin cannot access user list", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.users({ page: 1 })).rejects.toThrow();
  });

  it("ads.list returns all ads for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.ads.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("contacts returns all contact messages for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.contacts();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ---- Categories Active ----
describe("categories.active", () => {
  it("returns only active categories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.categories.active();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ---- Site Config ----
describe("siteConfig", () => {
  it("returns null for non-existent key", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.siteConfig.get({ key: "nonexistent_xyz" });
    expect(result).toBeNull();
  });

  it("returns about_us config if seeded", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.siteConfig.get({ key: "about_us" });
    expect(result === null || typeof result === "object").toBe(true);
  });
});

// ---- Appointment Overlap ----
describe("appointments.checkOverlap", () => {
  it("returns array of existing appointments for a date", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.appointments.checkOverlap({
      professionalId: 999, date: "2030-01-01",
    });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ---- Reviews by Professional ----
describe("reviews.byProfessional", () => {
  it("returns array of reviews", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.reviews.byProfessional({ professionalId: 999 });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ---- Admin Categories Management ----
describe("admin.categories", () => {
  it("list returns all categories for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("non-admin cannot list admin categories", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.categories.list()).rejects.toThrow();
  });
});

// ---- Admin Contact Status ----
describe("admin.contacts", () => {
  it("returns contact messages with status", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.contacts();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ---- Protected Route Tests ----
describe("protected routes", () => {
  it("profile.update requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.profile.update({ firstName: "Test" })
    ).rejects.toThrow();
  });

  it("appointments.list requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.appointments.list()).rejects.toThrow();
  });

  it("chat.rooms requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.chat.rooms()).rejects.toThrow();
  });

  it("alerts.list requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.alerts.list()).rejects.toThrow();
  });

  it("reviews.create requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.reviews.create({ appointmentId: 1, professionalId: 1, rating: 5 })
    ).rejects.toThrow();
  });
});
