import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  profileType: mysqlEnum("profileType", ["customer", "professional"]).default("customer").notNull(),
  firstName: varchar("firstName", { length: 50 }),
  lastName: varchar("lastName", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  sex: mysqlEnum("sex", ["male", "female"]),
  dateOfBirth: varchar("dateOfBirth", { length: 10 }), // dd/MM/yyyy format
  nationality: varchar("nationality", { length: 100 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  profilePhoto: text("profilePhoto"),
  bannerPhoto: text("bannerPhoto"),
  bio: text("bio"),
  portfolio: text("portfolio"), // rich text portfolio for professionals
  preferredLanguage: mysqlEnum("preferredLanguage", ["en", "ar"]).default("en"),
  isLocked: boolean("isLocked").default(false).notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  isStarred: boolean("isStarred").default(false).notNull(),
  professionalFee: decimal("professionalFee", { precision: 10, scale: 2 }),
  feeEnabled: boolean("feeEnabled").default(false).notNull(),
  failedLoginAttempts: int("failedLoginAttempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  icon: varchar("icon", { length: 50 }),
  isBlocked: boolean("isBlocked").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  isBlocked: boolean("isBlocked").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const professions = mysqlTable("professions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  serviceId: int("serviceId").notNull(),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  costPerHour: decimal("costPerHour", { precision: 10, scale: 2 }),
  yearsOfExperience: int("yearsOfExperience").default(0),
  website: varchar("website", { length: 255 }),
  hasTeam: boolean("hasTeam").default(false),
  teamSize: int("teamSize").default(0),
  hasOffice: boolean("hasOffice").default(false),
  officeAddress: text("officeAddress"),
  officeCity: varchar("officeCity", { length: 100 }),
  officeCountry: varchar("officeCountry", { length: 100 }),
  geographicAreas: json("geographicAreas"),
  isLocked: boolean("isLocked").default(false).notNull(),
  avgRating: decimal("avgRating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: int("totalReviews").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const professionImages = mysqlTable("profession_images", {
  id: int("id").autoincrement().primaryKey(),
  professionId: int("professionId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  professionalId: int("professionalId").notNull(),
  professionId: int("professionId"),
  serviceId: int("serviceId"),
  appointmentDate: timestamp("appointmentDate").notNull(),
  endDate: timestamp("endDate"),
  duration: int("duration").default(60),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "approved", "cancelled", "completed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const availability = mysqlTable("availability", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  professionId: int("professionId"),
  dayOfWeek: int("dayOfWeek").notNull(),
  startTime: varchar("startTime", { length: 5 }).notNull(),
  endTime: varchar("endTime", { length: 5 }).notNull(),
});

export const chatRooms = mysqlTable("chat_rooms", {
  id: int("id").autoincrement().primaryKey(),
  user1Id: int("user1Id").notNull(),
  user2Id: int("user2Id").notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  roomId: int("roomId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content"),
  messageType: mysqlEnum("messageType", ["text", "image", "video", "location"]).default("text").notNull(),
  mediaUrl: text("mediaUrl"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  appointmentId: int("appointmentId").notNull(),
  reviewerId: int("reviewerId").notNull(),
  professionalId: int("professionalId").notNull(),
  professionId: int("professionId"),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  searchCriteria: json("searchCriteria").notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly"]).default("daily").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const advertisements = mysqlTable("advertisements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  linkUrl: text("linkUrl"),
  position: mysqlEnum("position", ["home_banner", "search_banner", "sidebar"]).default("home_banner").notNull(),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  isLocked: boolean("isLocked").default(false).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "closed"]).default("pending").notNull(),
  adminReply: text("adminReply"),
  repliedAt: timestamp("repliedAt"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const siteConfig = mysqlTable("site_config", {
  id: int("id").autoincrement().primaryKey(),
  configKey: varchar("configKey", { length: 100 }).notNull().unique(),
  configValue: text("configValue"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Fee configuration: default fees and country-specific exceptions
export const feeConfig = mysqlTable("fee_config", {
  id: int("id").autoincrement().primaryKey(),
  feeType: mysqlEnum("feeType", ["premium", "advertisement"]).notNull(),
  country: varchar("country", { length: 100 }), // null = default, non-null = country-specific exception
  city: varchar("city", { length: 100 }), // null = country-level, non-null = city-specific exception
  feePerDay: decimal("feePerDay", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Listing order count configuration: max premium/ad slots per day
export const listingOrderConfig = mysqlTable("listing_order_config", {
  id: int("id").autoincrement().primaryKey(),
  configType: mysqlEnum("configType", ["premium", "advertisement"]).notNull(),
  country: varchar("country", { length: 100 }), // null = default, non-null = country-specific exception
  city: varchar("city", { length: 100 }), // null = country-level, non-null = city-specific exception
  maxCount: int("maxCount").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Premium batches: tracks premium subscription periods for users
export const premiumBatches = mysqlTable("premium_batches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  country: varchar("country", { length: 100 }),
  selectedDates: json("selectedDates").notNull(), // JSON array of date strings ["2025-01-01","2025-01-03",...]
  feePerDay: decimal("feePerDay", { precision: 10, scale: 2 }).notNull(),
  totalDays: int("totalDays").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "active", "cancelled", "expired"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Ad batches: tracks advertisement activation periods
export const adBatches = mysqlTable("ad_batches", {
  id: int("id").autoincrement().primaryKey(),
  advertisementId: int("advertisementId").notNull(),
  country: varchar("country", { length: 100 }),
  selectedDates: json("selectedDates").notNull(), // JSON array of date strings
  feePerDay: decimal("feePerDay", { precision: 10, scale: 2 }).notNull(),
  totalDays: int("totalDays").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "active", "cancelled", "expired"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Profession = typeof professions.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type Advertisement = typeof advertisements.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type SiteConfig = typeof siteConfig.$inferSelect;
export type FeeConfig = typeof feeConfig.$inferSelect;
export type ListingOrderConfig = typeof listingOrderConfig.$inferSelect;
export type PremiumBatch = typeof premiumBatches.$inferSelect;
export type AdBatch = typeof adBatches.$inferSelect;
