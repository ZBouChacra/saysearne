import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

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
    active: publicProcedure.query(async () => db.getActiveCategories()),
    services: publicProcedure.input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => db.getServicesByCategory(input.categoryId)),
    activeServices: publicProcedure.input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => db.getActiveServicesByCategory(input.categoryId)),
    allServices: publicProcedure.query(async () => db.getAllServices()),
  }),

  // Professionals
  professionals: router({
    top: publicProcedure.input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => db.getTopProfessionals(input?.limit || 5)),
    search: publicProcedure.input(z.object({
      categoryId: z.number().optional(), serviceId: z.number().optional(),
      firstName: z.string().optional(), lastName: z.string().optional(),
      sex: z.string().optional(), minAge: z.number().optional(), maxAge: z.number().optional(),
      nationality: z.string().optional(), country: z.string().optional(), city: z.string().optional(),
      hasOffice: z.boolean().optional(), minStars: z.number().optional(),
      minCost: z.number().optional(), maxCost: z.number().optional(),
      minExperience: z.number().optional(), maxExperience: z.number().optional(),
      hasTeam: z.boolean().optional(), hasImages: z.boolean().optional(),
      sortBy: z.string().optional(), sortOrder: z.string().optional(),
      page: z.number().optional(), limit: z.number().optional(),
    })).query(async ({ input }) => db.searchProfessionals(input)),
    profile: publicProcedure.input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.userId);
        if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        const profs = await db.getProfessionsByUser(input.userId);
        const cats = await db.getAllCategories();
        const svcs = await db.getAllServices();
        const profsWithImages = await Promise.all(profs.map(async (p) => {
          const images = await db.getProfessionImages(p.id);
          const avail = await db.getAvailabilityByProfession(p.id);
          return {
            ...p, images, availability: avail,
            categoryName: cats.find(c => c.id === p.categoryId)?.name,
            categoryNameAr: cats.find(c => c.id === p.categoryId)?.nameAr,
            serviceName: svcs.find(s => s.id === p.serviceId)?.name,
            serviceNameAr: svcs.find(s => s.id === p.serviceId)?.nameAr,
          };
        }));
        return {
          id: user.id, name: user.name, firstName: user.firstName, lastName: user.lastName,
          email: user.email, phone: user.phone, sex: user.sex, dateOfBirth: user.dateOfBirth,
          nationality: user.nationality, country: user.country, profilePhoto: user.profilePhoto,
          bannerPhoto: user.bannerPhoto, bio: user.bio, isPremium: user.isPremium,
          isStarred: user.isStarred, profileType: user.profileType,
          professions: profsWithImages,
        };
      }),
    pendingSlots: publicProcedure.input(z.object({ professionalId: z.number() }))
      .query(async ({ input }) => db.getPendingAppointments(input.professionalId)),
  }),

  // Profile Management
  profile: router({
    update: protectedProcedure.input(z.object({
      firstName: z.string().optional(), lastName: z.string().optional(),
      phone: z.string().optional(), sex: z.enum(['male', 'female']).optional(),
      dateOfBirth: z.string().optional(), nationality: z.string().optional(),
      country: z.string().optional(), bio: z.string().optional(),
      profilePhoto: z.string().optional(), bannerPhoto: z.string().optional(),
      preferredLanguage: z.enum(['en', 'ar']).optional(),
      profileType: z.enum(['customer', 'professional']).optional(),
    })).mutation(async ({ ctx, input }) => {
      await db.updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
    addProfession: protectedProcedure.input(z.object({
      categoryId: z.number(), serviceId: z.number(),
      costPerHour: z.string().optional(), yearsOfExperience: z.number().optional(),
      website: z.string().optional(), country: z.string().optional(), city: z.string().optional(),
      hasTeam: z.boolean().optional(), teamSize: z.number().optional(),
      hasOffice: z.boolean().optional(), officeAddress: z.string().optional(),
      officeCity: z.string().optional(), officeCountry: z.string().optional(),
      geographicAreas: z.array(z.string()).optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createProfession({ ...input, userId: ctx.user.id });
      return { id };
    }),
    updateProfession: protectedProcedure.input(z.object({
      id: z.number(), costPerHour: z.string().optional(), yearsOfExperience: z.number().optional(),
      website: z.string().optional(), country: z.string().optional(), city: z.string().optional(),
      hasTeam: z.boolean().optional(), teamSize: z.number().optional(),
      hasOffice: z.boolean().optional(), officeAddress: z.string().optional(),
      officeCity: z.string().optional(), officeCountry: z.string().optional(),
      geographicAreas: z.array(z.string()).optional(), isLocked: z.boolean().optional(),
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
    myProfessions: protectedProcedure.query(async ({ ctx }) => {
      const profs = await db.getProfessionsByUser(ctx.user.id);
      const cats = await db.getAllCategories();
      const svcs = await db.getAllServices();
      return profs.map(p => ({
        ...p,
        categoryName: cats.find(c => c.id === p.categoryId)?.name,
        categoryNameAr: cats.find(c => c.id === p.categoryId)?.nameAr,
        serviceName: svcs.find(s => s.id === p.serviceId)?.name,
        serviceNameAr: svcs.find(s => s.id === p.serviceId)?.nameAr,
      }));
    }),
    setAvailability: protectedProcedure.input(z.object({
      professionId: z.number().nullable(),
      slots: z.array(z.object({ dayOfWeek: z.number(), startTime: z.string(), endTime: z.string() })),
    })).mutation(async ({ ctx, input }) => {
      await db.setAvailability(ctx.user.id, input.professionId, input.slots);
      return { success: true };
    }),
    getAvailability: protectedProcedure.query(async ({ ctx }) => db.getAvailability(ctx.user.id)),
  }),

  // Appointments
  appointments: router({
    checkOverlap: publicProcedure.input(z.object({
      professionalId: z.number(), date: z.string(),
    })).query(async ({ input }) => {
      return db.getAppointmentsForDate(input.professionalId, input.date);
    }),
    create: protectedProcedure.input(z.object({
      professionalId: z.number(), professionId: z.number().optional(),
      serviceId: z.number().optional(), appointmentDate: z.string(),
      duration: z.number().optional(),
      endDate: z.string().optional(), description: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const appointmentDate = new Date(input.appointmentDate);
      const durationMs = (input.duration || 60) * 60000;
      const endDate = input.endDate ? new Date(input.endDate) : new Date(appointmentDate.getTime() + durationMs);
      const overlaps = await db.checkAppointmentOverlap(input.professionalId, appointmentDate, endDate);
      if (overlaps.length > 0) {
        throw new TRPCError({ code: 'CONFLICT', message: 'This time slot conflicts with an existing appointment. Please choose another time.' });
      }
      const id = await db.createAppointment({
        clientId: ctx.user.id, professionalId: input.professionalId,
        professionId: input.professionId, serviceId: input.serviceId,
        appointmentDate, endDate, duration: input.duration || 60, description: input.description,
      });
      const professional = await db.getUserById(input.professionalId);
      const client = await db.getUserById(ctx.user.id);
      const clientName = client?.firstName ? `${client.firstName} ${client.lastName}` : client?.name || 'A client';
      try {
        await notifyOwner({ title: 'New Appointment Request', content: `${clientName} has requested an appointment with ${professional?.firstName || professional?.name} on ${appointmentDate.toLocaleDateString()}.` });
      } catch (e) { console.warn('Notification failed:', e); }
      return { id };
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const appts = await db.getAppointmentsByUser(ctx.user.id);
      const cats = await db.getAllCategories();
      const svcs = await db.getAllServices();
      const enriched = await Promise.all(appts.map(async (a) => {
        const client = await db.getUserById(a.clientId);
        const professional = await db.getUserById(a.professionalId);
        const prof = a.professionId ? await db.getProfessionById(a.professionId) : null;
        return {
          ...a,
          clientName: client?.firstName ? `${client.firstName} ${client.lastName}` : client?.name,
          professionalName: professional?.firstName ? `${professional.firstName} ${professional.lastName}` : professional?.name,
          clientPhoto: client?.profilePhoto, professionalPhoto: professional?.profilePhoto,
          serviceName: a.serviceId ? svcs.find(s => s.id === a.serviceId)?.name : (prof ? svcs.find(s => s.id === prof.serviceId)?.name : null),
          categoryName: prof ? cats.find(c => c.id === prof.categoryId)?.name : null,
          hasReviewed: false,
        };
      }));
      for (const appt of enriched) {
        if (appt.status === 'completed' && appt.clientId === ctx.user.id) {
          appt.hasReviewed = await db.hasReviewedAppointment(appt.id, ctx.user.id);
        }
      }
      return enriched;
    }),
    updateStatus: protectedProcedure.input(z.object({
      id: z.number(), status: z.enum(['approved', 'cancelled', 'completed']),
    })).mutation(async ({ ctx, input }) => {
      const appt = await db.getAppointmentById(input.id);
      if (!appt) throw new TRPCError({ code: 'NOT_FOUND' });
      if (appt.professionalId !== ctx.user.id && appt.clientId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' });
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
        return { roomId: room?.id || null, room };
      }),
    messages: protectedProcedure.input(z.object({ roomId: z.number(), limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        await db.markMessagesAsRead(input.roomId, ctx.user.id);
        return db.getChatMessages(input.roomId, input.limit || 50, input.offset || 0);
      }),
    send: protectedProcedure.input(z.object({
      roomId: z.number(), content: z.string().optional(),
      messageType: z.enum(['text', 'image', 'video', 'location']).optional(),
      mediaUrl: z.string().optional(),
      latitude: z.string().optional(), longitude: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.sendChatMessage({ ...input, senderId: ctx.user.id, messageType: input.messageType || 'text' });
      return { id };
    }),
    uploadMedia: protectedProcedure.input(z.object({
      roomId: z.number(), fileName: z.string(), fileData: z.string(),
      fileType: z.string(), type: z.enum(['image', 'video']),
    })).mutation(async ({ ctx, input }) => {
      const dataUrl = `data:${input.fileType};base64,${input.fileData}`;
      return { url: dataUrl, fileName: input.fileName, type: input.type };
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
      appointmentId: z.number(), professionalId: z.number(),
      professionId: z.number().optional(), rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const canReview = await db.hasCompletedBooking(ctx.user.id, input.professionalId);
      if (!canReview) throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only review after a completed booking' });
      const alreadyReviewed = await db.hasReviewedAppointment(input.appointmentId, ctx.user.id);
      if (alreadyReviewed) throw new TRPCError({ code: 'CONFLICT', message: 'You have already reviewed this appointment' });
      const id = await db.createReview({ ...input, reviewerId: ctx.user.id });
      return { id };
    }),
  }),

  // Alerts
  alerts: router({
    list: protectedProcedure.query(async ({ ctx }) => db.getAlertsByUser(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      name: z.string(), searchCriteria: z.any(),
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
      email: z.string().email(), subject: z.string(), description: z.string(),
      userId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      const id = await db.createContactMessage({ ...input, userId: input.userId || ctx.user?.id });
      try {
        await notifyOwner({ title: `SaySerné >> Contact Us >> ${input.subject}`, content: `From: ${input.email}\n\n${input.description}` });
      } catch (e) { console.warn('Contact notification failed:', e); }
      return { id, success: true };
    }),
  }),

  // Site Config
  siteConfig: router({
    get: publicProcedure.input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const value = await db.getSiteConfig(input.key);
        return value ? JSON.parse(value) : null;
      }),
  }),

  // Admin
  admin: router({
    stats: adminProcedure.query(async () => db.getAdminStats()),
    users: adminProcedure.input(z.object({
      page: z.number().optional(), limit: z.number().optional(),
      search: z.string().optional(), typeFilter: z.string().optional(),
    })).query(async ({ input }) => db.getAllUsers(input.page || 1, input.limit || 20, input.search, input.typeFilter)),
    userDetail: adminProcedure.input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.userId);
        if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
        const profs = await db.getProfessionsByUser(input.userId);
        const cats = await db.getAllCategories();
        const svcs = await db.getAllServices();
        const profsWithDetails = await Promise.all(profs.map(async (p) => {
          const images = await db.getProfessionImages(p.id);
          const avail = await db.getAvailabilityByProfession(p.id);
          return {
            ...p, images, availability: avail,
            categoryName: cats.find(c => c.id === p.categoryId)?.name,
            serviceName: svcs.find(s => s.id === p.serviceId)?.name,
          };
        }));
        const appts = await db.getAppointmentsByUser(input.userId);
        const batches = await db.getPremiumBatchesByUser(input.userId);
        return { ...user, professions: profsWithDetails, appointments: appts, premiumBatches: batches };
      }),
    toggleLock: adminProcedure.input(z.object({ userId: z.number(), isLocked: z.boolean() }))
      .mutation(async ({ input }) => { await db.toggleUserLock(input.userId, input.isLocked); return { success: true }; }),
    togglePremium: adminProcedure.input(z.object({ userId: z.number(), isPremium: z.boolean() }))
      .mutation(async ({ input }) => { await db.toggleUserPremium(input.userId, input.isPremium); return { success: true }; }),
    toggleStarred: adminProcedure.input(z.object({ userId: z.number(), isStarred: z.boolean() }))
      .mutation(async ({ input }) => { await db.toggleUserStarred(input.userId, input.isStarred); return { success: true }; }),
    updateRole: adminProcedure.input(z.object({ userId: z.number(), role: z.enum(['user', 'admin']) }))
      .mutation(async ({ input }) => { await db.updateUserRole(input.userId, input.role); return { success: true }; }),
    updateFee: adminProcedure.input(z.object({ userId: z.number(), fee: z.string(), enabled: z.boolean() }))
      .mutation(async ({ input }) => { await db.updateUserFee(input.userId, input.fee, input.enabled); return { success: true }; }),
    createUser: adminProcedure.input(z.object({
      email: z.string().email(), name: z.string(),
      role: z.enum(['user', 'admin']), profileType: z.enum(['customer', 'professional']),
    })).mutation(async ({ input }) => {
      try {
        const id = await db.adminCreateUser(input);
        return { id };
      } catch (e: any) {
        if (e.message === 'DUPLICATE_EMAIL') {
          throw new TRPCError({ code: 'CONFLICT', message: 'A user with this email already exists' });
        }
        throw e;
      }
    }),
    // Categories & Services management
    categories: router({
      list: adminProcedure.query(async () => db.getAllCategories()),
      create: adminProcedure.input(z.object({
        name: z.string(), nameAr: z.string().optional(),
        description: z.string().optional(), descriptionAr: z.string().optional(), icon: z.string().optional(),
      })).mutation(async ({ input }) => { const id = await db.createCategory(input); return { id }; }),
      update: adminProcedure.input(z.object({
        id: z.number(), name: z.string().optional(), nameAr: z.string().optional(),
        description: z.string().optional(), descriptionAr: z.string().optional(),
        icon: z.string().optional(), isBlocked: z.boolean().optional(),
      })).mutation(async ({ input }) => { const { id, ...data } = input; await db.updateCategory(id, data); return { success: true }; }),
    }),
    services: router({
      list: adminProcedure.query(async () => db.getAllServices()),
      create: adminProcedure.input(z.object({
        categoryId: z.number(), name: z.string(), nameAr: z.string().optional(),
        description: z.string().optional(), descriptionAr: z.string().optional(),
      })).mutation(async ({ input }) => { const id = await db.createService(input); return { id }; }),
      update: adminProcedure.input(z.object({
        id: z.number(), name: z.string().optional(), nameAr: z.string().optional(),
        description: z.string().optional(), descriptionAr: z.string().optional(), isBlocked: z.boolean().optional(),
      })).mutation(async ({ input }) => { const { id, ...data } = input; await db.updateService(id, data); return { success: true }; }),
    }),
    // Ads
    ads: router({
      list: adminProcedure.query(async () => db.getAllAds()),
      create: adminProcedure.input(z.object({
        title: z.string(), imageUrl: z.string(), linkUrl: z.string().optional(),
        position: z.enum(['home_banner', 'search_banner', 'sidebar']), isActive: z.boolean().optional(),
        country: z.string().optional(), city: z.string().optional(),
      })).mutation(async ({ input }) => { const id = await db.createAd(input); return { id }; }),
      update: adminProcedure.input(z.object({
        id: z.number(), title: z.string().optional(), imageUrl: z.string().optional(),
        linkUrl: z.string().optional(), position: z.enum(['home_banner', 'search_banner', 'sidebar']).optional(),
        isActive: z.boolean().optional(), country: z.string().optional(), city: z.string().optional(),
      })).mutation(async ({ input }) => { const { id, ...data } = input; await db.updateAd(id, data); return { success: true }; }),
      delete: adminProcedure.input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => { await db.deleteAd(input.id); return { success: true }; }),
    }),
    // Contact messages with status
    contacts: adminProcedure.input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => db.getAllContactMessages(input?.status)),
    contactReply: adminProcedure.input(z.object({
      id: z.number(), status: z.enum(['pending', 'in_progress', 'closed']),
      adminReply: z.string().optional(),
    })).mutation(async ({ input }) => {
      const msg = await db.getContactMessageById(input.id);
      if (!msg) throw new TRPCError({ code: 'NOT_FOUND' });
      const updateData: any = { status: input.status };
      if (input.adminReply) { updateData.adminReply = input.adminReply; updateData.repliedAt = new Date(); }
      updateData.isRead = true;
      await db.updateContactMessage(input.id, updateData);
      try {
        const statusText = input.status === 'in_progress' ? 'In Progress' : input.status === 'closed' ? 'Closed' : 'Pending';
        await notifyOwner({
          title: `Contact Status Updated: ${msg.subject}`,
          content: `Status changed to ${statusText} for message from ${msg.email}.${input.adminReply ? `\nReply: ${input.adminReply}` : ''}`
        });
      } catch (e) { console.warn('Status notification failed:', e); }
      return { success: true };
    }),
    // Review moderation
    reviews: router({
      list: adminProcedure.query(async () => db.getAllReviews()),
      delete: adminProcedure.input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => { await db.deleteReview(input.id); return { success: true }; }),
    }),
    // Payment reconciliation
    premiumReport: adminProcedure.query(async () => db.getPremiumUsersReport()),
    // Chat monitoring
    chatRooms: adminProcedure.query(async () => {
      const rooms = await db.getAllChatRooms();
      const enriched = await Promise.all(rooms.map(async (r) => {
        const user1 = await db.getUserById(r.user1Id);
        const user2 = await db.getUserById(r.user2Id);
        const messages = await db.getChatMessages(r.id, 1);
        return {
          ...r,
          user1: user1 ? { id: user1.id, name: user1.firstName ? `${user1.firstName} ${user1.lastName}` : user1.name, profilePhoto: user1.profilePhoto } : null,
          user2: user2 ? { id: user2.id, name: user2.firstName ? `${user2.firstName} ${user2.lastName}` : user2.name, profilePhoto: user2.profilePhoto } : null,
          lastMessage: messages[0] || null,
        };
      }));
      return enriched;
    }),
    chatMessages: adminProcedure.input(z.object({ roomId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        const messages = await db.getChatMessages(input.roomId, input.limit || 100);
        const enriched = await Promise.all(messages.map(async (m) => {
          const sender = await db.getUserById(m.senderId);
          return { ...m, senderName: sender?.firstName ? `${sender.firstName} ${sender.lastName}` : sender?.name };
        }));
        return enriched;
      }),
    // Site config
    siteConfig: router({
      get: adminProcedure.input(z.object({ key: z.string() }))
        .query(async ({ input }) => {
          const value = await db.getSiteConfig(input.key);
          return value || null;
        }),
      set: adminProcedure.input(z.object({ key: z.string(), value: z.string() }))
        .mutation(async ({ input }) => { await db.setSiteConfig(input.key, input.value); return { success: true }; }),
    }),
    // Fee Config
    feeConfig: router({
      list: adminProcedure.input(z.object({ feeType: z.string().optional() }).optional())
        .query(async ({ input }) => db.getFeeConfigs(input?.feeType)),
      getFee: adminProcedure.input(z.object({ feeType: z.string(), country: z.string().optional() }))
        .query(async ({ input }) => db.getFeeForCountry(input.feeType, input.country)),
      upsert: adminProcedure.input(z.object({
        feeType: z.enum(['premium', 'advertisement']),
        country: z.string().nullable(),
        city: z.string().nullable().optional(),
        feePerDay: z.string(),
      })).mutation(async ({ input }) => {
        await db.upsertFeeConfig(input.feeType, input.country, input.city || null, input.feePerDay);
        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => { await db.deleteFeeConfig(input.id); return { success: true }; }),
    }),
    // Listing Order Config
    listingOrderConfig: router({
      list: adminProcedure.input(z.object({ configType: z.string().optional() }).optional())
        .query(async ({ input }) => db.getListingOrderConfigs(input?.configType)),
      getCount: adminProcedure.input(z.object({ configType: z.string(), country: z.string().optional(), city: z.string().optional() }))
        .query(async ({ input }) => db.getListingOrderForCountry(input.configType, input.country, input.city)),
      upsert: adminProcedure.input(z.object({
        configType: z.enum(['premium', 'advertisement']),
        country: z.string().nullable(),
        city: z.string().nullable().optional(),
        maxCount: z.number(),
      })).mutation(async ({ input }) => {
        await db.upsertListingOrderConfig(input.configType, input.country, input.city || null, input.maxCount);
        return { success: true };
      }),
      delete: adminProcedure.input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => { await db.deleteListingOrderConfig(input.id); return { success: true }; }),
    }),
    // Premium Batches
    premiumBatches: router({
      create: adminProcedure.input(z.object({
        userId: z.number(), country: z.string().optional(),
        startDate: z.string(), endDate: z.string(),
        feePerDay: z.string(), totalDays: z.number(), totalAmount: z.string(),
        notes: z.string().optional(),
      })).mutation(async ({ input }) => {
        const id = await db.createPremiumBatch({
          ...input, startDate: new Date(input.startDate), endDate: new Date(input.endDate),
        });
        return { id };
      }),
      byUser: adminProcedure.input(z.object({ userId: z.number() }))
        .query(async ({ input }) => db.getPremiumBatchesByUser(input.userId)),
      all: adminProcedure.query(async () => db.getAllPremiumBatches()),
      updateStatus: adminProcedure.input(z.object({
        id: z.number(), status: z.enum(['pending', 'paid', 'active', 'cancelled', 'expired']),
      })).mutation(async ({ input }) => {
        const updateData: any = { status: input.status };
        if (input.status === 'paid') updateData.paidAt = new Date();
        await db.updatePremiumBatch(input.id, updateData);
        // If paid, set user as premium
        if (input.status === 'paid') {
          const batch = await db.getPremiumBatchById(input.id);
          if (batch) await db.toggleUserPremium(batch.userId, true);
        }
        return { success: true };
      }),
      countForDate: adminProcedure.input(z.object({ date: z.string(), country: z.string().optional() }))
        .query(async ({ input }) => db.countPremiumBatchesForDate(new Date(input.date), input.country)),
    }),
    // Ad Batches
    adBatches: router({
      create: adminProcedure.input(z.object({
        advertisementId: z.number(), country: z.string().optional(),
        startDate: z.string(), endDate: z.string(),
        feePerDay: z.string(), totalDays: z.number(), totalAmount: z.string(),
        notes: z.string().optional(),
      })).mutation(async ({ input }) => {
        const id = await db.createAdBatch({
          ...input, startDate: new Date(input.startDate), endDate: new Date(input.endDate),
        });
        return { id };
      }),
      byAd: adminProcedure.input(z.object({ advertisementId: z.number() }))
        .query(async ({ input }) => db.getAdBatchesByAd(input.advertisementId)),
      all: adminProcedure.query(async () => db.getAllAdBatches()),
      updateStatus: adminProcedure.input(z.object({
        id: z.number(), status: z.enum(['pending', 'paid', 'active', 'cancelled', 'expired']),
      })).mutation(async ({ input }) => {
        const updateData: any = { status: input.status };
        if (input.status === 'paid') updateData.paidAt = new Date();
        await db.updateAdBatch(input.id, updateData);
        // If paid, activate the ad
        if (input.status === 'paid') {
          const batch = await db.getAdBatchById(input.id);
          if (batch) await db.updateAd(batch.advertisementId, { isActive: true });
        }
        return { success: true };
      }),
      countForDate: adminProcedure.input(z.object({ date: z.string(), country: z.string().optional() }))
        .query(async ({ input }) => db.countAdBatchesForDate(new Date(input.date), input.country)),
    }),
    // Payments
    payments: router({
      list: adminProcedure.input(z.object({
        year: z.number().optional(), month: z.number().optional(),
      }).optional()).query(async ({ input }) => {
        const data = await db.getAllBatchesForPayments(input?.year, input?.month);
        // Enrich premium batches with user info
        const enrichedPremium = await Promise.all(data.premiumBatches.map(async (b) => {
          const user = await db.getUserById(b.userId);
          return {
            ...b, type: 'premium' as const,
            userName: user?.firstName ? `${user.firstName} ${user.lastName}` : user?.name,
            userEmail: user?.email,
          };
        }));
        // Enrich ad batches with ad info
        const enrichedAd = await Promise.all(data.adBatches.map(async (b) => {
          const ads = await db.getAllAds();
          const ad = ads.find(a => a.id === b.advertisementId);
          return {
            ...b, type: 'advertisement' as const,
            adTitle: ad?.title || `Ad #${b.advertisementId}`,
          };
        }));
        // Sort: pending first, then by start date
        const all = [...enrichedPremium, ...enrichedAd].sort((a, b) => {
          const statusOrder: any = { pending: 0, paid: 1, active: 2, expired: 3, cancelled: 4 };
          const sa = statusOrder[a.status] ?? 5;
          const sb = statusOrder[b.status] ?? 5;
          if (sa !== sb) return sa - sb;
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        });
        return all;
      }),
      profitData: adminProcedure.input(z.object({
        year: z.number(), month: z.number().optional(),
      })).query(async ({ input }) => {
        if (input.month) {
          return { type: 'daily' as const, data: await db.getDailyProfitData(input.year, input.month) };
        }
        return { type: 'monthly' as const, data: await db.getMonthlyProfitData(input.year) };
      }),
    }),
    // Send message to user (from admin reviews)
    sendMessage: adminProcedure.input(z.object({
      userId: z.number(), message: z.string(),
    })).mutation(async ({ ctx, input }) => {
      // Create or get chat room between admin and user
      const room = await db.getOrCreateChatRoom(ctx.user.id, input.userId);
      if (!room) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create chat room' });
      await db.sendChatMessage({
        roomId: room.id, senderId: ctx.user.id,
        content: input.message, messageType: 'text',
      });
      return { success: true, roomId: room.id };
    }),
  }),
});

export type AppRouter = typeof appRouter;
