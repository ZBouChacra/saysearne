# SaySerné - Project TODO

## Design & Theming
- [x] Dark purple/black/gold color palette with day/night mode
- [x] Global typography (Playfair Display + Montserrat)
- [x] Responsive layout system

## Database Schema
- [x] Users table (extended with profile fields)
- [x] Categories & Services tables
- [x] Professions table (multi-profession per user)
- [x] Appointments table with status workflow
- [x] Chat rooms & messages tables
- [x] Reviews/ratings table
- [x] Alerts table (saved searches)
- [x] Advertisements table
- [x] Premium placements table

## Public Pages
- [x] Home page with top 5 rated professionals and ad banners
- [x] About Us page
- [x] Contact Us page
- [x] Professional search (direct name + categorized)
- [x] Advanced filtering (sex, age, nationality, stars, cost, experience, team, images)
- [x] Search sorting (age, stars, cost, experience)

## Authentication
- [x] Registration with validation (name, email, password rules) - via Manus OAuth
- [x] Login with email/password - via Manus OAuth
- [ ] Forgot password with email reset - handled by OAuth provider
- [ ] Account lockout after 3 failed attempts - schema ready, needs OAuth integration
- [ ] Password reset flow - handled by OAuth provider

## Professional Profiles
- [x] Profile editing (photo, banner, personal info)
- [x] Multi-profession management (category, service, cost, experience)
- [x] Portfolio images display
- [x] Geographic area coverage
- [x] Team size configuration
- [ ] Share profession link

## Booking System
- [x] Appointment creation with date/time selection
- [x] Approval workflow (pending → approved/cancelled)
- [x] Calendar view with status colors
- [ ] Automatic expiration of pending appointments
- [x] No overlapping appointments validation

## Communication
- [x] Real-time chat interface
- [x] Image and video sharing in chat
- [x] Location sharing
- [x] Unread message indicators

## Reviews & Ratings
- [x] Star rating system (1-5)
- [x] Only verified booking clients can review
- [x] Review listing on professional profiles

## Monetization
- [x] Premium placement for top-section visibility
- [x] Starred professional status
- [x] Ad banner management

## Alerts
- [x] Save search criteria as alerts
- [x] Alert listing and management
- [x] Run saved alerts

## Back-Office Admin
- [x] Admin dashboard with analytics
- [x] User management (lock/unlock profiles)
- [x] Content moderation (contact messages)
- [x] Advertisement management
- [ ] System jobs monitoring

## Settings
- [x] Notification preferences (alert frequency, appointment reminders)
- [x] Day/Night mode toggle

## Tests
- [x] Auth tests (me, logout)
- [x] Categories tests (list, allServices, services)
- [x] Professionals tests (top, search, profile not found)
- [x] Ads tests (active, with position filter)
- [x] Contact tests (send)
- [x] Admin tests (stats, users, forbidden for non-admin, ads list, contacts)
- [x] Protected route tests (profile, appointments, chat, alerts, reviews)

## Bilingual & Localization (New)
- [x] i18n system with English and Arabic translations
- [x] RTL layout support for Arabic
- [x] Language switcher in Navbar
- [x] Default mode changed to light

## Country/City & Office (New)
- [x] Add country field to user profile
- [x] Professional profiles are country/city specific
- [x] Team members count per country
- [x] Office/physical location flag and address per profession
- [x] Country/city filters in search
- [x] Update professional profile page with country/city/office info
- [x] Update search filters for country and city

## Bug Fixes & Enhancements (Round 2)
- [x] 1. Fix locked users not working in admin
- [x] 2. Admin: view user details and their full configuration
- [x] 3. Admin: view chats between users
- [x] 4. Contact us messages should also be sent by email to admin
- [x] 5. Appointments should not overlap; show pending slots to new customers
- [x] 6. Booking notification: mobile and web notification to professional
- [x] 7. Chat: ability to share images, small videos, and locations
- [x] 8. Fix reviews and stars for customers (missing UI)
- [x] 9. Book appointment at service level (not professional level); chat stays at customer level
- [x] 10. Admin: charge professionals a fee for accounts (configurable per professional)
- [x] 11. Gender: only Male/Female; DOB: dd/MM/yyyy; Nationality and Country as dropdowns
- [x] 12. Show My Services and Availability only when profile type is Professional (default: Customer)
- [x] 13. Availability should be related/configured per service
- [x] 14. Admin: configure and update categories/services; block a category or service
- [x] 15. Service work location country/city as dropdowns; Geographic Areas via Google Maps
- [x] 16. Admin: configure the About Us page content
- [x] 17. Starred and premium options only for professionals, not customers
- [x] 18. Admin: manage users, set admin role, create users
- [x] 19. Fix: categories on home page not translated to Arabic
- [x] 20. Advertisements: auto-flip carousel with 1.5s interval when page width < ad width
- [x] 21. Contact messages: status (Pending/In Progress/Closed), filter, admin reply, auto-email on status change

## UI Redesign & Mobile App (Round 3)
- [x] Fix RTL arrow directions in Arabic mode (arrows should not flip)
- [x] Redesign UI to be more vivid and alive (gradients, animations, richer colors)
- [ ] Set up Capacitor for APK and iOS app generation (requires native toolchain)
- [ ] Generate APK build configuration (requires Android Studio)
- [ ] Provide iOS build configuration (requires Xcode on macOS)

## Bug Fixes (Round 4)
- [x] Fix: availability table missing professionId column causing error on /professional/:id page

## Design Overhaul & Fixes (Round 5)
- [x] 1. Redesign like OLX.com.lb with new verdigris/gold/purple color palette
- [x] 2. Apply new color palette: Verdigris (#4A9B82, #7BB69D, #2D6D5F, #69AA94, #38594D), Gold (#D4A757, #B7873D, #FFE082), Purple (#3D1A5D, #1F045D, #1F082D)
- [x] 3. Admin: ability to remove inappropriate reviews
- [x] 4. Chat button redirects to chat instance directly
- [x] 5. Fix chat not working (nothing being found)
- [x] 6. Fix unable to edit a category or service in admin
- [x] 7. Admin: check premium user payment status, ad payments, reconciliation report
- [x] 8. Change logo to uploaded Phoenician ship emblem
- [ ] 9. Mobile version guidance (iOS and Android via Capacitor) - requires native toolchain

## Feedback Round 6 (25 Items)
- [x] 1. Anonymous user: show Chat & Book Appointment buttons, redirect to login on click
- [x] 2. Professional listing: order by premium first, then starred, then by customer city/country
- [x] 3. Advertisement listing: order by customer city then country
- [x] 4. Contact Us: hide email if logged in (link message to user); show & require email if anonymous
- [x] 5. Admin/Config: default fee for premium users and ads (per day, USD); country-specific exceptions
- [x] 6. Admin/Config: default listing order count for premium and ads; country-specific exceptions
- [x] 7. Admin/Dashboard: daily and monthly profit diagrams
- [x] 8. Admin/Users: searchable dropdown for Type, plus search by first name, last name, email
- [x] 9. Admin/Users: reject duplicate emails
- [x] 10. Admin/Users: when setting premium, fetch default fee from Config (editable), set duration via calendar (start >= today)
- [x] 11. Admin/Users: disable calendar days when premium count equals listing order count for country
- [x] 12. Admin/Users: calculate total charge for premium batch; one-to-many batches with batch ID
- [x] 13. Admin/Users: premium batch starts as Pending; set Paid from Admin/Payments; auto-cancel if unpaid at start
- [x] 14. Admin/Advertisements: search by ad title
- [x] 15. Admin/Advertisements: ability to edit any ad
- [x] 16. Admin/Advertisements: set city and country when configuring an ad
- [x] 17. Admin/Advertisements: set duration via calendar with default fee from Config (editable), start >= today
- [x] 18. Admin/Advertisements: disable calendar days when ad count equals listing order count for country
- [x] 19. Admin/Advertisements: calculate total charge for ad batch; one-to-many batches with batch ID
- [x] 20. Admin/Advertisements: ad batch starts as Pending; set Paid from Admin/Payments; auto-cancel if unpaid at start
- [x] 21. Admin/Payments: track premium and ad payments; show near-due and pending batches first
- [x] 22. Admin/Payments: filter by year/month; export to CSV
- [x] 23. Admin/Reviews: include professional name, country, city; search by Review ID, Customer, Professional
- [x] 24. Admin/Reviews: ability to send message to user directly
- [x] 25. Fix: Chat room redirect shows error - chat_messages insert fails with params roomId, senderId (missing latitude/longitude columns)

## Feedback Round 7
- [x] 1. Fix: about.badge, contact.chatTitle, contact.chatDesc, contact.responseTitle, contact.responseDesc, contact.secureTitle, contact.secureDesc, search.subtitle not rendered (translation keys showing instead of values)
- [x] 2. Contact Us email: update subject to "SaySerné >> Contact Us >> {SUBJECT}"
- [x] 3. When removing someone as Premium, the Fee should be automatically disabled
- [ ] 4. Replace start/end date inputs with calendar for Premium and Adv batches (keep overlap/count behavior) - IN PROGRESS
- [x] 5. Add City field for User
- [x] 6. Add City field for Advertisement
- [ ] 7. Remove the Premium toggle button from the admin/Users screen - IN PROGRESS (user becomes premium after batch creation + payment)
- [ ] 8. Add batch management inside the Advertisement detail (not separate) - IN PROGRESS
- [x] 9. Default value for Adv should come from Config, with exception per country - backend ready
- [ ] 10. Admin/Config: Country and City to be dropdowns; settings for Premium, Order Count and Adv - IN PROGRESS
- [ ] 11. Any ordering to be based on the current User Country and City - IN PROGRESS
- [x] 12. Fix: ziad.bouchacra@gmail.com found as both User and Admin (duplicate) - added unique index on openId, deleted 117 ghost users
- [x] 13. Fix: when accessing admin/users, empty users are being created - fixed by adding unique constraint on openId
- [x] 14. Fix: Chat count always shows 0 (not getting real unread count) - optimized query with single SQL join
