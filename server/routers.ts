import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Categories & Services
  categories: router({
    list: publicProcedure.query(async () => db.getAllCategories()),
    services: publicProcedure.input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => db.getServicesByCategory(input.categoryId)),
    allServices: publicProcedure.query(async () => db.getAllServices()),
  }),

  // Professionals
  professionals: router({
    top: publicProcedure.input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => db.getTopProfessionals(input?.limit || 5)),
    search: publicProcedure.input(z.object({
      categoryId: z.number().optional(),
      serviceId: z.number().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      sex: z.string().optional(),
      minAge: z.number().optional(),
      maxAge: z.number().optional(),
      nationality: z.string().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      hasOffice: z.boolean().optional(),
      minStars: z.number().optional(),
      minCost: z.number().optional(),
      maxCost: z.number().optional(),
      minExperience: z.number().optional(),
      maxExperience: z.number().optional(),
      hasTeam: z.boolean().optional(),
      hasImages: z.boolean().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.string().optional(),
      page: z.number().optional(),
      limit: z.number().optional(),
    })).query(async ({ input }) => db.searchProfessionals(input)),
    profile: publicProcedure.input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.userId);
        if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        const profs = await db.getProfessionsByUser(input.userId);
        const avail = await db.getAvailability(input.userId);
        const profsWithImages = await Promise.all(profs.map(async (p) => {
          const images = await db.getProfessionImages(p.id);
          const cats = await db.getAllCategories();
          const svcs = await db.getAllServices();
          return {
            ...p,
            images,
            categoryName: cats.find(c => c.id === p.categoryId)?.name,
            serviceName: svcs.find(s => s.id === p.serviceId)?.name,
          };
        }));
        return {
          id: user.id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          sex: user.sex,
          dateOfBirth: user.dateOfBirth,
          nationality: user.nationality,
          profilePhoto: user.profilePhoto,
          bannerPhoto: user.bannerPhoto,
          bio: user.bio,
          isPremium: user.isPremium,
          isStarred: user.isStarred,
          professions: profsWithImages,
          availability: avail,
        };
      }),
  }),

  // Profile Management
  profile: router({
    update: protectedProcedure.input(z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
      sex: z.enum(['male', 'female']).optional(),
      dateOfBirth: z.string().optional(),
      nationality: z.string().optional(),
      country: z.string().optional(),
      bio: z.string().optional(),
      profilePhoto: z.string().optional(),
      bannerPhoto: z.string().optional(),
      preferredLanguage: z.enum(['en', 'ar']).optional(),
    })).mutation(async ({ ctx, input }) => {
      const data: any = { ...input };
      if (input.dateOfBirth) data.dateOfBirth = new Date(input.dateOfBirth);
      await db.updateUserProfile(ctx.user.id, data);
      return { success: true };
    }),
    addProfession: protectedProcedure.input(z.object({
      categoryId: z.number(),
      serviceId: z.number(),
      costPerHour: z.string().optional(),
      yearsOfExperience: z.number().optional(),
      website: z.string().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      hasTeam: z.boolean().optional(),
      teamSize: z.number().optional(),
      hasOffice: z.boolean().optional(),
      officeAddress: z.string().optional(),
      officeCity: z.string().optional(),
      officeCountry: z.string().optional(),
      geographicAreas: z.array(z.string()).optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createProfession({ ...input, userId: ctx.user.id });
      return { id };
    }),
    updateProfession: protectedProcedure.input(z.object({
      id: z.number(),
      costPerHour: z.string().optional(),
      yearsOfExperience: z.number().optional(),
      website: z.string().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      hasTeam: z.boolean().optional(),
      teamSize: z.number().optional(),
      hasOffice: z.boolean().optional(),
      officeAddress: z.string().optional(),
      officeCity: z.string().optional(),
      officeCountry: z.string().optional(),
      geographicAreas: z.array(z.string()).optional(),
      isLocked: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const prof = await db.getProfessionById(input.id);
      if (!prof || prof.userId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
      const { id, ...data } = input;
      await db.updateProfession(id, data);
      return { success: true };
    }),
    deleteProfession: protectedProcedure.input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const prof = await db.getProfessionById(input.id);
        if (!prof || prof.userId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
        await db.deleteProfession(input.id);
        return { success: true };
      }),
    myProfessions: protectedProcedure.query(async ({ ctx }) => db.getProfessionsByUser(ctx.user.id)),
    setAvailability: protectedProcedure.input(z.object({
      slots: z.array(z.object({
        dayOfWeek: z.number(),
        startTime: z.string(),
        endTime: z.string(),
      })),
    })).mutation(async ({ ctx, input }) => {
      await db.setAvailability(ctx.user.id, input.slots);
      return { success: true };
    }),
    getAvailability: protectedProcedure.query(async ({ ctx }) => db.getAvailability(ctx.user.id)),
  }),

  // Appointments
  appointments: router({
    create: protectedProcedure.input(z.object({
      professionalId: z.number(),
      professionId: z.number().optional(),
      appointmentDate: z.string(),
      description: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createAppointment({
        clientId: ctx.user.id,
        professionalId: input.professionalId,
        professionId: input.professionId,
        appointmentDate: new Date(input.appointmentDate),
        description: input.description,
      });
      return { id };
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const appts = await db.getAppointmentsByUser(ctx.user.id);
      const enriched = await Promise.all(appts.map(async (a) => {
        const client = await db.getUserById(a.clientId);
        const professional = await db.getUserById(a.professionalId);
        return {
          ...a,
          clientName: client?.firstName ? `${client.firstName} ${client.lastName}` : client?.name,
          professionalName: professional?.firstName ? `${professional.firstName} ${professional.lastName}` : professional?.name,
          clientPhoto: client?.profilePhoto,
          professionalPhoto: professional?.profilePhoto,
        };
      }));
      return enriched;
    }),
    updateStatus: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.enum(['approved', 'cancelled', 'completed']),
    })).mutation(async ({ ctx, input }) => {
      const appt = await db.getAppointmentById(input.id);
      if (!appt) throw new TRPCError({ code: 'NOT_FOUND' });
      if (appt.professionalId !== ctx.user.id && appt.clientId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      await db.updateAppointmentStatus(input.id, input.status);
      return { success: true };
    }),
  }),

  // Chat
  chat: router({
    rooms: protectedProcedure.query(async ({ ctx }) => {
      const rooms = await db.getChatRoomsByUser(ctx.user.id);
      const enriched = await Promise.all(rooms.map(async (r) => {
        const otherId = r.user1Id === ctx.user.id ? r.user2Id : r.user1Id;
        const other = await db.getUserById(otherId);
        const messages = await db.getChatMessages(r.id, 1);
        return {
          ...r,
          otherUser: other ? { id: other.id, name: other.firstName ? `${other.firstName} ${other.lastName}` : other.name, profilePhoto: other.profilePhoto } : null,
          lastMessage: messages[0] || null,
        };
      }));
      return enriched;
    }),
    startChat: protectedProcedure.input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (input.userId === ctx.user.id) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot chat with yourself' });
        const room = await db.getOrCreateChatRoom(ctx.user.id, input.userId);
        return room;
      }),
    messages: protectedProcedure.input(z.object({ roomId: z.number(), limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        await db.markMessagesAsRead(input.roomId, ctx.user.id);
        return db.getChatMessages(input.roomId, input.limit || 50, input.offset || 0);
      }),
    send: protectedProcedure.input(z.object({
      roomId: z.number(),
      content: z.string().optional(),
      messageType: z.enum(['text', 'image', 'video', 'location']).optional(),
      mediaUrl: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.sendChatMessage({ ...input, senderId: ctx.user.id, messageType: input.messageType || 'text' });
      return { id };
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => db.getUnreadCount(ctx.user.id)),
  }),

  // Reviews
  reviews: router({
    byProfessional: publicProcedure.input(z.object({ professionalId: z.number() }))
      .query(async ({ input }) => db.getReviewsByProfessional(input.professionalId)),
    canReview: protectedProcedure.input(z.object({ professionalId: z.number() }))
      .query(async ({ ctx, input }) => db.hasCompletedBooking(ctx.user.id, input.professionalId)),
    create: protectedProcedure.input(z.object({
      appointmentId: z.number(),
      professionalId: z.number(),
      professionId: z.number().optional(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const canReview = await db.hasCompletedBooking(ctx.user.id, input.professionalId);
      if (!canReview) throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only review after a completed booking' });
      const id = await db.createReview({ ...input, reviewerId: ctx.user.id });
      return { id };
    }),
  }),

  // Alerts
  alerts: router({
    list: protectedProcedure.query(async ({ ctx }) => db.getAlertsByUser(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      name: z.string(),
      searchCriteria: z.any(),
      frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createAlert({ ...input, userId: ctx.user.id });
      return { id };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await db.deleteAlert(input.id); return { success: true }; }),
    run: protectedProcedure.input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const userAlerts = await db.getAlertsByUser(ctx.user.id);
        const alert = userAlerts.find(a => a.id === input.id);
        if (!alert) throw new TRPCError({ code: 'NOT_FOUND' });
        return db.searchProfessionals(alert.searchCriteria as any);
      }),
  }),

  // Ads
  ads: router({
    active: publicProcedure.input(z.object({ position: z.string().optional() }).optional())
      .query(async ({ input }) => db.getActiveAds(input?.position)),
  }),

  // Contact
  contact: router({
    send: publicProcedure.input(z.object({
      email: z.string().email(),
      subject: z.string(),
      description: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createContactMessage({ ...input, userId: ctx.user?.id });
      return { id, success: true };
    }),
  }),

  // Admin
  admin: router({
    stats: adminProcedure.query(async () => db.getAdminStats()),
    users: adminProcedure.input(z.object({ page: z.number().optional(), limit: z.number().optional() }))
      .query(async ({ input }) => db.getAllUsers(input.page || 1, input.limit || 20)),
    toggleLock: adminProcedure.input(z.object({ userId: z.number(), isLocked: z.boolean() }))
      .mutation(async ({ input }) => { await db.toggleUserLock(input.userId, input.isLocked); return { success: true }; }),
    togglePremium: adminProcedure.input(z.object({ userId: z.number(), isPremium: z.boolean() }))
      .mutation(async ({ input }) => { await db.toggleUserPremium(input.userId, input.isPremium); return { success: true }; }),
    toggleStarred: adminProcedure.input(z.object({ userId: z.number(), isStarred: z.boolean() }))
      .mutation(async ({ input }) => { await db.toggleUserStarred(input.userId, input.isStarred); return { success: true }; }),
    ads: router({
      list: adminProcedure.query(async () => db.getAllAds()),
      create: adminProcedure.input(z.object({
        title: z.string(),
        imageUrl: z.string(),
        linkUrl: z.string().optional(),
        position: z.enum(['home_banner', 'search_banner', 'sidebar']),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => { const id = await db.createAd(input); return { id }; }),
      update: adminProcedure.input(z.object({
        id: z.number(),
        title: z.string().optional(),
        imageUrl: z.string().optional(),
        linkUrl: z.string().optional(),
        position: z.enum(['home_banner', 'search_banner', 'sidebar']).optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => { const { id, ...data } = input; await db.updateAd(id, data); return { success: true }; }),
      delete: adminProcedure.input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => { await db.deleteAd(input.id); return { success: true }; }),
    }),
    contacts: adminProcedure.query(async () => db.getAllContactMessages()),
  }),
});

export type AppRouter = typeof appRouter;
