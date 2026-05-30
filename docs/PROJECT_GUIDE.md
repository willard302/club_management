# Club Management Project Documentation

## 1. Project Overview
This is a comprehensive club management application built with **Nuxt 4**, **TailwindCSS**, **Vant UI**, and **Supabase**. It provides features for event scheduling and user management.

### Core Tech Stack
- **Frontend Framework**: Nuxt 4 (Vue 3)
- **Styling**: TailwindCSS
- **UI Components**: Vant UI
- **Backend & Auth**: Supabase
- **Internationalization**: @nuxtjs/i18n (Support for Traditional Chinese and English)

---

## 2. Main Features

### 📅 Event Calendar
- **Monthly View**: Display events in a calendar grid.
- **Event Editor**: Create, edit, and delete events with location, time, and participant details.
- **Service**: `app/services/eventService.ts`
- **Composables**: `useCalendar.ts`, `useCalendarEditor.ts`

---

## 3. Database Schema (Supabase)

### Key Tables
- **`auth.users`**: Managed by Supabase Auth (Private credentials).
- **`public.profiles`**: **(Recommended Architecture)** Extends user information for public display and relational queries.
  - `id`: UUID (Foreign Key to auth.users)
  - `name`: User display name.
  - `avatar_url`: Profile picture link.
  - `department`: Club group or division.
  - `phone_number`: Contact number.
  - `points`: Membership reward points.
  - `bio`: Short biography.
  - `dob`: Date of birth.
- **`events`**: Stores calendar event details.

### Why Use a `profiles` Table?
1. **Relational Power**: Allows joining user data with events and sessions easily.
2. **Type Safety**: Enforces proper data types (DATE, INTEGER) instead of generic JSON.
3. **Performance**: Indexed queries for rankings (points) or filtering (department).
4. **Automation**: A PostgreSQL trigger automatically creates a profile when a new user signs up.

### Custom Functions
- `handle_new_user()`: Trigger function to sync Auth users to public profiles.

---

## 4. UI/UX Standards
- **Mobile-First Design**: Optimized for a 430px width (iPhone-like) viewport.
- **Theming**: Sky blue (`sky-600`) as the primary accent color.
- **Global Components**:
  - `AppHeader`: Consistent page navigation and branding.
  - `Tabbar`: Dynamic bottom navigation.
  - `Toast`: Global notification system.

---

## 5. Development Guide

### Folder Structure
- `app/components`: Reusable Vue components.
- `app/composables`: Shared logic and state management.
- `app/pages`: Route-based views.
- `app/services`: API interactions with Supabase.
- `app/types`: TypeScript interfaces and database types.
- `supabase/full_schema.sql`: Full database schema definition.

### Adding New Features
1. Define the database schema in `supabase/full_schema.sql`.
2. Update `app/types/database.types.ts` (usually via Supabase CLI).
3. Implement the backend logic in `app/services`.
4. Create composables for state management.
5. Build the UI in `app/pages` and `app/components`.
