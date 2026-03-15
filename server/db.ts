import { eq, and, desc, asc, sql, like, or, gte, lte, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, categories, services, professions, professionImages,
  appointments, availability, chatRooms, chatMessages, reviews, alerts,
  advertisements, contactMessages, siteConfig
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
    .orderBy(desc(users.isStarred), desc(users.isPremium), desc(professions.avgRating), desc(professions.yearsOfExperience))
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
  let orderClause;
  const sortOrder = filters.sortOrder === 'asc' ? asc : desc;
  switch (filters.sortBy) {
    case 'age': orderClause = sortOrder(users.dateOfBirth); break;
    case 'stars': orderClause = sortOrder(professions.avgRating); break;
    case 'cost': orderClause = sortOrder(professions.costPerHour); break;
    case 'experience': orderClause = sortOrder(professions.yearsOfExperience); break;
    default: orderClause = desc(professions.avgRating);
  }

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
    .orderBy(orderClause)
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
  const end = endDate || new Date(appointmentDate.getTime() + 60 * 60 * 1000); // default 1 hour
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
  const result = await db.insert(chatMessages).values(data as any);
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
  const rooms = await getChatRoomsByUser(userId);
  let total = 0;
  for (const room of rooms) {
    const result = await db.select({ count: sql<number>`count(*)` }).from(chatMessages)
      .where(and(eq(chatMessages.roomId, room.id), sql`${chatMessages.senderId} != ${userId}`, eq(chatMessages.isRead, false)));
    total += result[0]?.count || 0;
  }
  return total;
}

// Reviews
export async function createReview(data: { appointmentId: number; reviewerId: number; professionalId: number; professionId?: number; rating: number; comment?: string }) {
  const db = await getDb(); if (!db) return null;
  const result = await db.insert(reviews).values(data);
  // Update avg rating for all professions of this professional
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
  const conditions: any[] = [eq(advertisements.isActive, true)];
  if (position) conditions.push(eq(advertisements.position, position as any));
  return db.select().from(advertisements).where(and(...conditions));
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

// Admin
export async function getAllUsers(page = 1, limit = 20) {
  const db = await getDb(); if (!db) return { results: [], total: 0 };
  const offset = (page - 1) * limit;
  const results = await db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(users);
  return { results, total: countResult[0]?.count || 0 };
}

export async function toggleUserLock(userId: number, isLocked: boolean) {
  const db = await getDb(); if (!db) return;
  await db.update(users).set({ isLocked }).where(eq(users.id, userId));
}

export async function toggleUserPremium(userId: number, isPremium: boolean) {
  const db = await getDb(); if (!db) return;
  await db.update(users).set({ isPremium }).where(eq(users.id, userId));
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
  const openId = `admin-created-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const result = await db.insert(users).values({ openId, name: data.name, email: data.email, role: data.role, profileType: data.profileType, lastSignedIn: new Date() });
  return result[0].insertId;
}

export async function getAdminStats() {
  const db = await getDb(); if (!db) return { totalUsers: 0, totalProfessionals: 0, totalBookings: 0, totalReviews: 0 };
  const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [profsCount] = await db.select({ count: sql<number>`count(DISTINCT userId)` }).from(professions);
  const [bookingsCount] = await db.select({ count: sql<number>`count(*)` }).from(appointments);
  const [reviewsCount] = await db.select({ count: sql<number>`count(*)` }).from(reviews);
  return {
    totalUsers: usersCount?.count || 0,
    totalProfessionals: profsCount?.count || 0,
    totalBookings: bookingsCount?.count || 0,
    totalReviews: reviewsCount?.count || 0,
  };
}
