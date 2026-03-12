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
- [ ] No overlapping appointments validation

## Communication
- [x] Real-time chat interface
- [ ] Image and video sharing in chat - UI ready, upload integration pending
- [ ] Location sharing - UI ready, map integration pending
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
