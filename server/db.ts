import { eq, and, desc, asc, sql, like, or, gte, lte, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, categories, services, professions, professionImages,
  appointments, availability, chatRooms, chatMessages, reviews, alerts,
  advertisements, contactMessages, siteConfig, feeConfig, listingOrderConfig,
  premiumBatches, adBatches
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => { const value = user[field]; if (value === undefined) return; const normalized = value ?? null; values[field] = normalized; updateSet[field] = normalized; };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// Categories & Services
export async function getAllCategories() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function getActiveCategories() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(categories).where(eq(categories.isBlocked, false)).orderBy(asc(categories.name));
}

export async function getServicesByCategory(categoryId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(services).where(eq(services.categoryId, categoryId));
}

export async function getActiveServicesByCategory(categoryId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(services).where(and(eq(services.categoryId, categoryId), eq(services.isBlocked, false)));
}

export async function getAllServices() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(services);
}

export async function createCategory(data: { name: string; nameAr?: string; description?: string; descriptionAr?: string; icon?: string }) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(categories).values(data);
  return result[0].insertId;
}

export async function updateCategory(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function createService(data: { categoryId: number; name: string; nameAr?: string; description?: string; descriptionAr?: string }) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(services).values(data);
  return result[0].insertId;
}

export async function updateService(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(services).set(data).where(eq(services.id, id));
}

// Professions
export async function createProfession(data: any) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(professions).values(data);
  return result[0].insertId;
}

export async function getProfessionsByUser(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(professions).where(eq(professions.userId, userId));
}

export async function getProfessionById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(professions).where(eq(professions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProfession(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(professions).set(data).where(eq(professions.id, id));
}

export async function deleteProfession(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(availability).where(eq(availability.professionId, id));
  await db.delete(professions).where(eq(professions.id, id));
}

// Profession Images
export async function addProfessionImage(professionId: number, imageUrl: string) {
  const db = await getDb(); if (!db) return;
  await db.insert(professionImages).values({ professionId, imageUrl });
}

export async function getProfessionImages(professionId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(professionImages).where(eq(professionImages.professionId, professionId));
}

export async function deleteProfessionImage(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(professionImages).where(eq(professionImages.id, id));
}

// Top Professionals
export async function getTopProfessionals(limit = 5) {
  const db = await getDb(); if (!db) return [];
  return db.select({
    userId: professions.userId, professionId: professions.id, categoryId: professions.categoryId,
    serviceId: professions.serviceId, costPerHour: professions.costPerHour, yearsOfExperience: professions.yearsOfExperience,
    avgRating: professions.avgRating, totalReviews: professions.totalReviews, hasTeam: professions.hasTeam,
    teamSize: professions.teamSize, userName: users.name, firstName: users.firstName, lastName: users.lastName,
    profilePhoto: users.profilePhoto, isPremium: users.isPremium, isStarred: users.isStarred,
    country: professions.country, city: professions.city, hasOffice: professions.hasOffice,
  }).from(professions)
    .innerJoin(users, eq(professions.userId, users.id))
    .where(and(eq(professions.isLocked, false), eq(users.isLocked, false), eq(users.profileType, 'professional')))
    .orderBy(desc(users.isPremium), desc(users.isStarred), desc(professions.avgRating), desc(professions.yearsOfExperience))
    .limit(limit);
}

// Search Professionals
export async function searchProfessionals(filters: any) {
  const db = await getDb(); if (!db) return { results: [], total: 0 };
  const conditions: any[] = [eq(professions.isLocked, false), eq(users.isLocked, false), eq(users.profileType, 'professional')];
  if (filters.categoryId) conditions.push(eq(professions.categoryId, filters.categoryId));
  if (filters.serviceId) conditions.push(eq(professions.serviceId, filters.serviceId));
  if (filters.firstName) conditions.push(like(users.firstName, `%${filters.firstName}%`));
  if (filters.lastName) conditions.push(like(users.lastName, `%${filters.lastName}%`));
  if (filters.sex) conditions.push(eq(users.sex, filters.sex as any));
  if (filters.nationality) conditions.push(eq(users.nationality, filters.nationality));
  if (filters.country) conditions.push(eq(professions.country, filters.country));
  if (filters.city) conditions.push(like(professions.city, `%${filters.city}%`));
  if (filters.hasOffice) conditions.push(eq(professions.hasOffice, true));
  if (filters.minStars) conditions.push(gte(professions.avgRating, String(filters.minStars)));
  if (filters.minCost) conditions.push(gte(professions.costPerHour, String(filters.minCost)));
  if (filters.maxCost) conditions.push(lte(professions.costPerHour, String(filters.maxCost)));
  if (filters.minExperience) conditions.push(gte(professions.yearsOfExperience, filters.minExperience));
  if (filters.maxExperience) conditions.push(lte(professions.yearsOfExperience, filters.maxExperience));
  if (filters.hasTeam !== undefined) conditions.push(eq(professions.hasTeam, filters.hasTeam));

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  // Order: premium first, then starred, then by customer city/country proximity, then rating
  const results = await db.select({
    userId: professions.userId, professionId: professions.id, categoryId: professions.categoryId,
    serviceId: professions.serviceId, costPerHour: professions.costPerHour, yearsOfExperience: professions.yearsOfExperience,
    avgRating: professions.avgRating, totalReviews: professions.totalReviews, hasTeam: professions.hasTeam,
    teamSize: professions.teamSize, geographicAreas: professions.geographicAreas, userName: users.name,
    firstName: users.firstName, lastName: users.lastName, profilePhoto: users.profilePhoto,
    sex: users.sex, dateOfBirth: users.dateOfBirth, nationality: users.nationality,
    isPremium: users.isPremium, isStarred: users.isStarred, country: professions.country,
    city: professions.city, hasOffice: professions.hasOffice, officeAddress: professions.officeAddress,
    officeCity: professions.officeCity, officeCountry: professions.officeCountry,
  }).from(professions)
    .innerJoin(users, eq(professions.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(users.isPremium), desc(users.isStarred), desc(professions.avgRating))
    .limit(limit).offset(offset);

  const countResult = await db.select({ count: sql<number>`count(*)` }).from(professions)
    .innerJoin(users, eq(professions.userId, users.id)).where(and(...conditions));
  return { results, total: countResult[0]?.count || 0 };
}

// Appointments
export async function createAppointment(data: any) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(appointments).values(data);
  return result[0].insertId;
}

export async function checkAppointmentOverlap(professionalId: number, appointmentDate: Date, endDate?: Date) {
  const db = await getDb(); if (!db) return [];
  const end = endDate || new Date(appointmentDate.getTime() + 60 * 60 * 1000);
  return db.select().from(appointments)
    .where(and(
      eq(appointments.professionalId, professionalId),
      or(eq(appointments.status, 'pending'), eq(appointments.status, 'approved')),
      lte(appointments.appointmentDate, end),
      gte(sql`COALESCE(${appointments.endDate}, DATE_ADD(${appointments.appointmentDate}, INTERVAL 1 HOUR))`, appointmentDate)
    ));
}

export async function getAppointmentsForDate(professionalId: number, dateStr: string) {
  const db = await getDb(); if (!db) return [];
  const dayStart = new Date(`${dateStr}T00:00:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59`);
  return db.select().from(appointments)
    .where(and(
      eq(appointments.professionalId, professionalId),
      or(eq(appointments.status, 'pending'), eq(appointments.status, 'approved')),
      gte(appointments.appointmentDate, dayStart),
      lte(appointments.appointmentDate, dayEnd)
    ));
}

export async function getPendingAppointments(professionalId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select({
    id: appointments.id,
    appointmentDate: appointments.appointmentDate,
    endDate: appointments.endDate,
    status: appointments.status,
  }).from(appointments)
    .where(and(
      eq(appointments.professionalId, professionalId),
      or(eq(appointments.status, 'pending'), eq(appointments.status, 'approved'))
    ))
    .orderBy(asc(appointments.appointmentDate));
}

export async function getAppointmentsByUser(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(appointments)
    .where(or(eq(appointments.clientId, userId), eq(appointments.professionalId, userId)))
    .orderBy(desc(appointments.appointmentDate));
}

export async function getAppointmentById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAppointmentStatus(id: number, status: string) {
  const db = await getDb(); if (!db) return;
  await db.update(appointments).set({ status: status as any }).where(eq(appointments.id, id));
}

// Availability (per service/profession)
export async function setAvailability(userId: number, professionId: number | null, slots: { dayOfWeek: number; startTime: string; endTime: string }[]) {
  const db = await getDb(); if (!db) return;
  if (professionId) {
    await db.delete(availability).where(and(eq(availability.userId, userId), eq(availability.professionId, professionId)));
  } else {
    await db.delete(availability).where(and(eq(availability.userId, userId), sql`${availability.professionId} IS NULL`));
  }
  if (slots.length > 0) {
    await db.insert(availability).values(slots.map(s => ({ ...s, userId, professionId })));
  }
}

export async function getAvailability(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(availability).where(eq(availability.userId, userId));
}

export async function getAvailabilityByProfession(professionId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(availability).where(eq(availability.professionId, professionId));
}

// Chat
export async function getOrCreateChatRoom(user1Id: number, user2Id: number) {
  const db = await getDb(); if (!db) return null;
  const existing = await db.select().from(chatRooms)
    .where(or(
      and(eq(chatRooms.user1Id, user1Id), eq(chatRooms.user2Id, user2Id)),
      and(eq(chatRooms.user1Id, user2Id), eq(chatRooms.user2Id, user1Id))
    )).limit(1);
  if (existing.length > 0) return existing[0];
  const result = await db.insert(chatRooms).values({ user1Id, user2Id });
  return { id: result[0].insertId, user1Id, user2Id, lastMessageAt: new Date(), createdAt: new Date() };
}

export async function getChatRoomsByUser(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(chatRooms)
    .where(or(eq(chatRooms.user1Id, userId), eq(chatRooms.user2Id, userId)))
    .orderBy(desc(chatRooms.lastMessageAt));
}

export async function getAllChatRooms() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(chatRooms).orderBy(desc(chatRooms.lastMessageAt));
}

export async function getChatMessages(roomId: number, limit = 50, offset = 0) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(chatMessages)
    .where(eq(chatMessages.roomId, roomId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit).offset(offset);
}

export async function sendChatMessage(data: { roomId: number; senderId: number; content?: string; messageType?: string; mediaUrl?: string; latitude?: string; longitude?: string }) {
  const db = await getDb(); if (!db) return null;
  // Build insert values explicitly to avoid sending undefined for columns with defaults
  const insertValues: any = {
    roomId: data.roomId,
    senderId: data.senderId,
    messageType: data.messageType || 'text',
  };
  if (data.content !== undefined && data.content !== null) insertValues.content = data.content;
  if (data.mediaUrl !== undefined && data.mediaUrl !== null) insertValues.mediaUrl = data.mediaUrl;
  if (data.latitude !== undefined && data.latitude !== null) insertValues.latitude = data.latitude;
  if (data.longitude !== undefined && data.longitude !== null) insertValues.longitude = data.longitude;
  const result = await db.insert(chatMessages).values(insertValues);
  await db.update(chatRooms).set({ lastMessageAt: new Date() }).where(eq(chatRooms.id, data.roomId));
  return result[0].insertId;
}

export async function markMessagesAsRead(roomId: number, userId: number) {
  const db = await getDb(); if (!db) return;
  await db.update(chatMessages).set({ isRead: true })
    .where(and(eq(chatMessages.roomId, roomId), sql`${chatMessages.senderId} != ${userId}`, eq(chatMessages.isRead, false)));
}

export async function getUnreadCount(userId: number) {
  const db = await getDb(); if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(chatMessages)
    .innerJoin(chatRooms, eq(chatMessages.roomId, chatRooms.id))
    .where(and(
      sql`(${chatRooms.user1Id} = ${userId} OR ${chatRooms.user2Id} = ${userId})`,
      sql`${chatMessages.senderId} != ${userId}`,
      eq(chatMessages.isRead, false)
    ));
  return result[0]?.count || 0;
}

// Reviews
export async function createReview(data: { appointmentId: number; reviewerId: number; professionalId: number; professionId?: number; rating: number; comment?: string }) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(reviews).values(data);
  const professionsList = await db.select().from(professions).where(eq(professions.userId, data.professionalId));
  for (const prof of professionsList) {
    const profReviews = await db.select({ avg: sql<number>`AVG(rating)`, count: sql<number>`COUNT(*)` })
      .from(reviews).where(eq(reviews.professionalId, data.professionalId));
    await db.update(professions).set({ avgRating: String(profReviews[0]?.avg || 0), totalReviews: profReviews[0]?.count || 0 })
      .where(eq(professions.id, prof.id));
  }
  return result[0].insertId;
}

export async function getReviewsByProfessional(professionalId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select({
    id: reviews.id, rating: reviews.rating, comment: reviews.comment, createdAt: reviews.createdAt,
    reviewerName: users.name, reviewerFirstName: users.firstName, reviewerLastName: users.lastName, reviewerPhoto: users.profilePhoto,
  }).from(reviews).innerJoin(users, eq(reviews.reviewerId, users.id))
    .where(eq(reviews.professionalId, professionalId)).orderBy(desc(reviews.createdAt));
}

export async function hasCompletedBooking(clientId: number, professionalId: number) {
  const db = await getDb(); if (!db) return false;
  const result = await db.select({ count: sql<number>`count(*)` }).from(appointments)
    .where(and(eq(appointments.clientId, clientId), eq(appointments.professionalId, professionalId), eq(appointments.status, 'completed')));
  return (result[0]?.count || 0) > 0;
}

export async function hasReviewedAppointment(appointmentId: number, reviewerId: number) {
  const db = await getDb(); if (!db) return false;
  const result = await db.select({ count: sql<number>`count(*)` }).from(reviews)
    .where(and(eq(reviews.appointmentId, appointmentId), eq(reviews.reviewerId, reviewerId)));
  return (result[0]?.count || 0) > 0;
}

// Alerts
export async function createAlert(data: { userId: number; name: string; searchCriteria: any; frequency?: string }) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(alerts).values(data as any);
  return result[0].insertId;
}

export async function getAlertsByUser(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(alerts).where(eq(alerts.userId, userId)).orderBy(desc(alerts.createdAt));
}

export async function deleteAlert(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(alerts).where(eq(alerts.id, id));
}

// Advertisements
export async function getActiveAds(position?: string) {
  const db = await getDb(); if (!db) return [];
  const now = new Date();
  // Get ads that are active and within their date range (if set)
  const conditions: any[] = [eq(advertisements.isActive, true)];
  if (position) conditions.push(eq(advertisements.position, position as any));
  const allAds = await db.select().from(advertisements).where(and(...conditions));
  // Filter by date range if set
  return allAds.filter(ad => {
    if (ad.startDate && new Date(ad.startDate) > now) return false;
    if (ad.endDate && new Date(ad.endDate) < now) return false;
    return true;
  });
}

export async function createAd(data: any) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(advertisements).values(data);
  return result[0].insertId;
}

export async function updateAd(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(advertisements).set(data).where(eq(advertisements.id, id));
}

export async function deleteAd(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(advertisements).where(eq(advertisements.id, id));
}

export async function getAllAds() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(advertisements).orderBy(desc(advertisements.createdAt));
}

// Contact Messages
export async function createContactMessage(data: { userId?: number; email: string; subject: string; description: string }) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(contactMessages).values(data);
  return result[0].insertId;
}

export async function getAllContactMessages(statusFilter?: string) {
  const db = await getDb(); if (!db) return [];
  const conditions: any[] = [];
  if (statusFilter && statusFilter !== 'all') conditions.push(eq(contactMessages.status, statusFilter as any));
  if (conditions.length > 0) return db.select().from(contactMessages).where(and(...conditions)).orderBy(desc(contactMessages.createdAt));
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function updateContactMessage(id: number, data: { status?: string; adminReply?: string; repliedAt?: Date; isRead?: boolean }) {
  const db = await getDb(); if (!db) return;
  await db.update(contactMessages).set(data as any).where(eq(contactMessages.id, id));
}

export async function getContactMessageById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Site Config
export async function getSiteConfig(key: string) {
  const db = await getDb(); if (!db) return null;
  const result = await db.select().from(siteConfig).where(eq(siteConfig.configKey, key)).limit(1);
  return result.length > 0 ? result[0].configValue : null;
}

export async function setSiteConfig(key: string, value: string) {
  const db = await getDb(); if (!db) return;
  const existing = await db.select().from(siteConfig).where(eq(siteConfig.configKey, key)).limit(1);
  if (existing.length > 0) {
    await db.update(siteConfig).set({ configValue: value }).where(eq(siteConfig.configKey, key));
  } else {
    await db.insert(siteConfig).values({ configKey: key, configValue: value });
  }
}

// Fee Config
export async function getFeeConfigs(feeType?: string) {
  const db = await getDb(); if (!db) return [];
  if (feeType) return db.select().from(feeConfig).where(eq(feeConfig.feeType, feeType as any)).orderBy(asc(feeConfig.country));
  return db.select().from(feeConfig).orderBy(asc(feeConfig.feeType), asc(feeConfig.country));
}

export async function getFeeForCountry(feeType: string, country?: string, city?: string): Promise<string> {
  const db = await getDb(); if (!db) return '0';
  // Try city-specific first
  if (country && city) {
    const specific = await db.select().from(feeConfig)
      .where(and(eq(feeConfig.feeType, feeType as any), eq(feeConfig.country, country), eq(feeConfig.city, city))).limit(1);
    if (specific.length > 0) return String(specific[0].feePerDay);
  }
  // Try country-specific
  if (country) {
    const specific = await db.select().from(feeConfig)
      .where(and(eq(feeConfig.feeType, feeType as any), eq(feeConfig.country, country), sql`${feeConfig.city} IS NULL`)).limit(1);
    if (specific.length > 0) return String(specific[0].feePerDay);
  }
  // Fall back to default (country is null)
  const defaultFee = await db.select().from(feeConfig)
    .where(and(eq(feeConfig.feeType, feeType as any), sql`${feeConfig.country} IS NULL`, sql`${feeConfig.city} IS NULL`)).limit(1);
  return defaultFee.length > 0 ? String(defaultFee[0].feePerDay) : '0';
}

export async function upsertFeeConfig(feeType: string, country: string | null, city: string | null, feePerDay: string) {
  const db = await getDb(); if (!db) return;
  const conditions = country
    ? (city ? and(eq(feeConfig.feeType, feeType as any), eq(feeConfig.country, country), eq(feeConfig.city, city))
      : and(eq(feeConfig.feeType, feeType as any), eq(feeConfig.country, country), sql`${feeConfig.city} IS NULL`))
    : and(eq(feeConfig.feeType, feeType as any), sql`${feeConfig.country} IS NULL`, sql`${feeConfig.city} IS NULL`);
  const existing = await db.select().from(feeConfig).where(conditions).limit(1);
  if (existing.length > 0) {
    await db.update(feeConfig).set({ feePerDay }).where(eq(feeConfig.id, existing[0].id));
  } else {
    await db.insert(feeConfig).values({ feeType: feeType as any, country, city, feePerDay } as any);
  }
}

export async function deleteFeeConfig(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(feeConfig).where(eq(feeConfig.id, id));
}

// Listing Order Config
export async function getListingOrderConfigs(configType?: string) {
  const db = await getDb(); if (!db) return [];
  if (configType) return db.select().from(listingOrderConfig).where(eq(listingOrderConfig.configType, configType as any)).orderBy(asc(listingOrderConfig.country));
  return db.select().from(listingOrderConfig).orderBy(asc(listingOrderConfig.configType), asc(listingOrderConfig.country));
}

export async function getListingOrderForCountry(configType: string, country?: string, city?: string): Promise<number> {
  const db = await getDb(); if (!db) return 999;
  // Try city-specific first
  if (country && city) {
    const specific = await db.select().from(listingOrderConfig)
      .where(and(eq(listingOrderConfig.configType, configType as any), eq(listingOrderConfig.country, country), eq(listingOrderConfig.city, city))).limit(1);
    if (specific.length > 0) return specific[0].maxCount;
  }
  // Try country-specific
  if (country) {
    const specific = await db.select().from(listingOrderConfig)
      .where(and(eq(listingOrderConfig.configType, configType as any), eq(listingOrderConfig.country, country), sql`${listingOrderConfig.city} IS NULL`)).limit(1);
    if (specific.length > 0) return specific[0].maxCount;
  }
  const defaultConfig = await db.select().from(listingOrderConfig)
    .where(and(eq(listingOrderConfig.configType, configType as any), sql`${listingOrderConfig.country} IS NULL`, sql`${listingOrderConfig.city} IS NULL`)).limit(1);
  return defaultConfig.length > 0 ? defaultConfig[0].maxCount : 999;
}

export async function upsertListingOrderConfig(configType: string, country: string | null, city: string | null, maxCount: number) {
  const db = await getDb(); if (!db) return;
  const conditions = country
    ? (city ? and(eq(listingOrderConfig.configType, configType as any), eq(listingOrderConfig.country, country), eq(listingOrderConfig.city, city))
      : and(eq(listingOrderConfig.configType, configType as any), eq(listingOrderConfig.country, country), sql`${listingOrderConfig.city} IS NULL`))
    : and(eq(listingOrderConfig.configType, configType as any), sql`${listingOrderConfig.country} IS NULL`, sql`${listingOrderConfig.city} IS NULL`);
  const existing = await db.select().from(listingOrderConfig).where(conditions).limit(1);
  if (existing.length > 0) {
    await db.update(listingOrderConfig).set({ maxCount }).where(eq(listingOrderConfig.id, existing[0].id));
  } else {
    await db.insert(listingOrderConfig).values({ configType: configType as any, country, city, maxCount } as any);
  }
}

export async function deleteListingOrderConfig(id: number) {
  const db = await getDb(); if (!db) return;
  await db.delete(listingOrderConfig).where(eq(listingOrderConfig.id, id));
}

// Premium Batches
export async function createPremiumBatch(data: { userId: number; country?: string; startDate: Date; endDate: Date; feePerDay: string; totalDays: number; totalAmount: string; notes?: string }) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(premiumBatches).values(data as any);
  return result[0].insertId;
}

export async function getPremiumBatchesByUser(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(premiumBatches).where(eq(premiumBatches.userId, userId)).orderBy(desc(premiumBatches.createdAt));
}

export async function getAllPremiumBatches() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(premiumBatches).orderBy(desc(premiumBatches.createdAt));
}

export async function updatePremiumBatch(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(premiumBatches).set(data).where(eq(premiumBatches.id, id));
}

export async function getPremiumBatchById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(premiumBatches).where(eq(premiumBatches.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Count active/pending premium batches for a given date and country
export async function countPremiumBatchesForDate(date: Date, country?: string) {
  const db = await getDb(); if (!db) return 0;
  const conditions: any[] = [
    or(eq(premiumBatches.status, 'pending'), eq(premiumBatches.status, 'paid'), eq(premiumBatches.status, 'active')),
    lte(premiumBatches.startDate, date),
    gte(premiumBatches.endDate, date),
  ];
  if (country) conditions.push(eq(premiumBatches.country, country));
  const result = await db.select({ count: sql<number>`count(*)` }).from(premiumBatches).where(and(...conditions));
  return result[0]?.count || 0;
}

// Ad Batches
export async function createAdBatch(data: { advertisementId: number; country?: string; startDate: Date; endDate: Date; feePerDay: string; totalDays: number; totalAmount: string; notes?: string }) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(adBatches).values(data as any);
  return result[0].insertId;
}

export async function getAdBatchesByAd(advertisementId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(adBatches).where(eq(adBatches.advertisementId, advertisementId)).orderBy(desc(adBatches.createdAt));
}

export async function getAllAdBatches() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(adBatches).orderBy(desc(adBatches.createdAt));
}

export async function updateAdBatch(id: number, data: any) {
  const db = await getDb(); if (!db) return;
  await db.update(adBatches).set(data).where(eq(adBatches.id, id));
}

export async function getAdBatchById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(adBatches).where(eq(adBatches.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function countAdBatchesForDate(date: Date, country?: string) {
  const db = await getDb(); if (!db) return 0;
  const conditions: any[] = [
    or(eq(adBatches.status, 'pending'), eq(adBatches.status, 'paid'), eq(adBatches.status, 'active')),
    lte(adBatches.startDate, date),
    gte(adBatches.endDate, date),
  ];
  if (country) conditions.push(eq(adBatches.country, country));
  const result = await db.select({ count: sql<number>`count(*)` }).from(adBatches).where(and(...conditions));
  return result[0]?.count || 0;
}

// Get all batches (premium + ad) for payments view
export async function getAllBatchesForPayments(year?: number, month?: number) {
  const db = await getDb(); if (!db) return { premiumBatches: [], adBatches: [] };

  let premConditions: any[] = [];
  let adConditions: any[] = [];

  if (year && month) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    premConditions.push(gte(premiumBatches.startDate, startOfMonth));
    premConditions.push(lte(premiumBatches.startDate, endOfMonth));
    adConditions.push(gte(adBatches.startDate, startOfMonth));
    adConditions.push(lte(adBatches.startDate, endOfMonth));
  }

  const premResults = premConditions.length > 0
    ? await db.select().from(premiumBatches).where(and(...premConditions)).orderBy(asc(premiumBatches.startDate))
    : await db.select().from(premiumBatches).orderBy(asc(premiumBatches.startDate));

  const adResults = adConditions.length > 0
    ? await db.select().from(adBatches).where(and(...adConditions)).orderBy(asc(adBatches.startDate))
    : await db.select().from(adBatches).orderBy(asc(adBatches.startDate));

  return { premiumBatches: premResults, adBatches: adResults };
}

// Admin
export async function getAllUsers(page = 1, limit = 20, search?: string, typeFilter?: string) {
  const db = await getDb(); if (!db) return { results: [], total: 0 };
  const offset = (page - 1) * limit;
  const conditions: any[] = [];
  if (search) {
    conditions.push(or(
      like(users.firstName, `%${search}%`),
      like(users.lastName, `%${search}%`),
      like(users.email, `%${search}%`)
    ));
  }
  if (typeFilter && typeFilter !== 'all') {
    conditions.push(eq(users.profileType, typeFilter as any));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const results = whereClause
    ? await db.select().from(users).where(whereClause).orderBy(desc(users.createdAt)).limit(limit).offset(offset)
    : await db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
  const countResult = whereClause
    ? await db.select({ count: sql<number>`count(*)` }).from(users).where(whereClause)
    : await db.select({ count: sql<number>`count(*)` }).from(users);
  return { results, total: countResult[0]?.count || 0 };
}

export async function toggleUserLock(userId: number, isLocked: boolean) {
  const db = await getDb(); if (!db) return;
  await db.update(users).set({ isLocked }).where(eq(users.id, userId));
}

export async function toggleUserPremium(userId: number, isPremium: boolean) {
  const db = await getDb(); if (!db) return;
  // When removing premium, also disable the fee
  const updateData = isPremium ? { isPremium } : { isPremium, feeEnabled: false };
  await db.update(users).set(updateData).where(eq(users.id, userId));
}

export async function toggleUserStarred(userId: number, isStarred: boolean) {
  const db = await getDb(); if (!db) return;
  await db.update(users).set({ isStarred }).where(eq(users.id, userId));
}

export async function updateUserRole(userId: number, role: 'user' | 'admin') {
  const db = await getDb(); if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function updateUserFee(userId: number, fee: string, enabled: boolean) {
  const db = await getDb(); if (!db) return;
  await db.update(users).set({ professionalFee: fee, feeEnabled: enabled }).where(eq(users.id, userId));
}

export async function adminCreateUser(data: { email: string; name: string; role: 'user' | 'admin'; profileType: 'customer' | 'professional' }) {
  const db = await getDb(); if (!db) return null;
  // Check for duplicate email
  const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existing.length > 0) throw new Error('DUPLICATE_EMAIL');
  const openId = `admin-created-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const result = await db.insert(users).values({ openId, name: data.name, email: data.email, role: data.role, profileType: data.profileType, lastSignedIn: new Date() });
  return result[0].insertId;
}

export async function deleteReview(id: number) {
  const db = await getDb(); if (!db) return;
  const review = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  if (review.length > 0) {
    await db.delete(reviews).where(eq(reviews.id, id));
    const professionsList = await db.select().from(professions).where(eq(professions.userId, review[0].professionalId));
    for (const prof of professionsList) {
      const profReviews = await db.select({ avg: sql<number>`AVG(rating)`, count: sql<number>`COUNT(*)` })
        .from(reviews).where(eq(reviews.professionalId, review[0].professionalId));
      await db.update(professions).set({ avgRating: String(profReviews[0]?.avg || 0), totalReviews: profReviews[0]?.count || 0 })
        .where(eq(professions.id, prof.id));
    }
  }
}

export async function getAllReviews() {
  const db = await getDb(); if (!db) return [];
  // Join with reviewer and professional user data, plus profession data for country/city
  const result = await db.select({
    id: reviews.id, rating: reviews.rating, comment: reviews.comment, createdAt: reviews.createdAt,
    reviewerId: reviews.reviewerId, professionalId: reviews.professionalId, appointmentId: reviews.appointmentId,
    professionId: reviews.professionId,
    reviewerName: users.name, reviewerFirstName: users.firstName, reviewerLastName: users.lastName,
  }).from(reviews).innerJoin(users, eq(reviews.reviewerId, users.id)).orderBy(desc(reviews.createdAt));

  // Enrich with professional name and country/city
  const enriched = await Promise.all(result.map(async (r) => {
    const professional = await getUserById(r.professionalId);
    const profession = r.professionId ? await getProfessionById(r.professionId) : null;
    return {
      ...r,
      professionalName: professional?.firstName ? `${professional.firstName} ${professional.lastName}` : professional?.name,
      professionalCountry: profession?.country || professional?.country,
      professionalCity: profession?.city,
    };
  }));
  return enriched;
}

export async function getPremiumUsersReport() {
  const db = await getDb(); if (!db) return [];
  return db.select({
    id: users.id, name: users.name, firstName: users.firstName, lastName: users.lastName,
    email: users.email, isPremium: users.isPremium, isStarred: users.isStarred,
    professionalFee: users.professionalFee, feeEnabled: users.feeEnabled,
    profileType: users.profileType, createdAt: users.createdAt,
  }).from(users)
    .where(or(eq(users.isPremium, true), eq(users.isStarred, true), eq(users.feeEnabled, true)))
    .orderBy(desc(users.createdAt));
}

export async function getAdminStats() {
  const db = await getDb(); if (!db) return { totalUsers: 0, totalProfessionals: 0, totalBookings: 0, totalReviews: 0 };
  const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [profsCount] = await db.select({ count: sql<number>`count(DISTINCT userId)` }).from(professions);
  const [bookingsCount] = await db.select({ count: sql<number>`count(*)` }).from(appointments);
  const [reviewsCount] = await db.select({ count: sql<number>`count(*)` }).from(reviews);
  const [premiumCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.isPremium, true));
  const [starredCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.isStarred, true));
  const [feeEnabledCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.feeEnabled, true));
  const [adsCount] = await db.select({ count: sql<number>`count(*)` }).from(advertisements).where(eq(advertisements.isActive, true));

  // Profit stats
  const [premiumBatchTotal] = await db.select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` })
    .from(premiumBatches).where(eq(premiumBatches.status, 'paid'));
  const [adBatchTotal] = await db.select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` })
    .from(adBatches).where(eq(adBatches.status, 'paid'));
  const [pendingPremium] = await db.select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` })
    .from(premiumBatches).where(eq(premiumBatches.status, 'pending'));
  const [pendingAd] = await db.select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` })
    .from(adBatches).where(eq(adBatches.status, 'pending'));

  return {
    totalUsers: usersCount?.count || 0,
    totalProfessionals: profsCount?.count || 0,
    totalBookings: bookingsCount?.count || 0,
    totalReviews: reviewsCount?.count || 0,
    totalPremium: premiumCount?.count || 0,
    totalStarred: starredCount?.count || 0,
    totalFeeEnabled: feeEnabledCount?.count || 0,
    totalActiveAds: adsCount?.count || 0,
    totalPremiumRevenue: premiumBatchTotal?.total || 0,
    totalAdRevenue: adBatchTotal?.total || 0,
    pendingPremiumAmount: pendingPremium?.total || 0,
    pendingAdAmount: pendingAd?.total || 0,
  };
}

// Profit data for charts
export async function getMonthlyProfitData(year: number) {
  const db = await getDb(); if (!db) return [];
  const results = [];
  for (let month = 1; month <= 12; month++) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const [premPaid] = await db.select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` })
      .from(premiumBatches).where(and(eq(premiumBatches.status, 'paid'), gte(premiumBatches.paidAt, startOfMonth), lte(premiumBatches.paidAt, endOfMonth)));
    const [adPaid] = await db.select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` })
      .from(adBatches).where(and(eq(adBatches.status, 'paid'), gte(adBatches.paidAt, startOfMonth), lte(adBatches.paidAt, endOfMonth)));

    results.push({
      month,
      premiumRevenue: Number(premPaid?.total || 0),
      adRevenue: Number(adPaid?.total || 0),
      total: Number(premPaid?.total || 0) + Number(adPaid?.total || 0),
    });
  }
  return results;
}

export async function getDailyProfitData(year: number, month: number) {
  const db = await getDb(); if (!db) return [];
  const daysInMonth = new Date(year, month, 0).getDate();
  const results = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

    const [premPaid] = await db.select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` })
      .from(premiumBatches).where(and(eq(premiumBatches.status, 'paid'), gte(premiumBatches.paidAt, startOfDay), lte(premiumBatches.paidAt, endOfDay)));
    const [adPaid] = await db.select({ total: sql<number>`COALESCE(SUM(totalAmount), 0)` })
      .from(adBatches).where(and(eq(adBatches.status, 'paid'), gte(adBatches.paidAt, startOfDay), lte(adBatches.paidAt, endOfDay)));

    results.push({
      day,
      premiumRevenue: Number(premPaid?.total || 0),
      adRevenue: Number(adPaid?.total || 0),
      total: Number(premPaid?.total || 0) + Number(adPaid?.total || 0),
    });
  }
  return results;
}
