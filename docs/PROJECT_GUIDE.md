# Club Management Project Documentation

## 1. Project Overview
This is a comprehensive club management application built with **Nuxt 4**, **TailwindCSS**, **Vant UI**, and **Supabase**. It provides features for meditation tracking, event scheduling, and real-time messaging.

### Core Tech Stack
- **Frontend Framework**: Nuxt 4 (Vue 3)
- **Styling**: TailwindCSS
- **UI Components**: Vant UI
- **Backend & Auth**: Supabase
- **Internationalization**: @nuxtjs/i18n (Support for Traditional Chinese and English)

---

## 2. Main Features

### 🧘 Meditation Tracking
- **Meditation Timer**: Users can set target durations and record actual meditation time.
- **Statistics**: Visual representation of meditation history and consistency.
- **Service**: `app/services/meditationService.ts`
- **Composables**: `useMeditationTimer.ts`, `useMeditationStats.ts`

### 📅 Event Calendar
- **Monthly View**: Display events in a calendar grid.
- **Event Editor**: Create, edit, and delete events with location, time, and participant details.
- **Service**: `app/services/eventService.ts`
- **Composables**: `useCalendar.ts`, `useCalendarEditor.ts`

### 💬 Real-time Messaging
- **Direct Messaging (DM)**: One-on-one private chats.
- **Group Chats**: Shared conversation spaces for multiple members.
- **Real-time Updates**: Powered by Supabase Realtime for instant message delivery.
- **Service**: `app/services/eventService.ts` (Wait, messaging usually has its own, checking...)

### 👥 Social & Friends
- **Friend Invitations**: Send and accept friend requests.
- **Friends List**: Manage personal connections.
- **RLS Secured**: Strict data isolation using Supabase Row Level Security.

---

## 3. Database Schema (Supabase)

### Key Tables
- **`auth.users`**: Managed by Supabase Auth (includes metadata for `name` and `avatar_url`).
- **`meditation_sessions`**: Records each meditation activity.
- **`events`**: Stores calendar event details.
- **`conversations` & `conversation_members`**: Defines chat rooms and their participants.
- **`messages`**: Stores chat messages with support for text and images.
- **`friends` & `friend_invitations`**: Manages social relationships.

### Custom Functions
- `get_user_profiles(user_ids UUID[])`: Returns user names and avatars from metadata.
- `get_user_id_by_email(email TEXT)`: Helper to find users for friend requests.
- `accept_friend_invitation(invitation_id UUID)`: Atomic operation to accept requests and create bidirectional friend links.

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
- `supabase/migrations`: Database version control.

### Adding New Features
1. Define the database schema in `supabase/migrations`.
2. Update `app/types/database.types.ts` (usually via Supabase CLI).
3. Implement the backend logic in `app/services`.
4. Create composables for state management.
5. Build the UI in `app/pages` and `app/components`.
