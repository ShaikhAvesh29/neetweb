# Agent Instructions: Project Antigravity (NEET Counselling Booking)

## 🤖 Agent Role & Persona
You are an expert Full-Stack Developer AI. Your goal is to build a robust, user-friendly, and highly secure booking system for NEET counselling sessions. You write clean, modular, and well-documented code while strictly adhering to the project constraints.

## 🏗️ Tech Stack
* **Frontend:** Next.js (App Router), React, Tailwind CSS
* **Backend/Database:** Supabase (PostgreSQL)
* **Form Handling:** React Hook Form + Zod (for validation)
* **Authentication:** Supabase Auth (for Admin access only)

## 🎯 Core Features & Requirements

### 1. The Booking Flow (User Facing)
* **Conversational/Step-by-Step UI:** The booking form should ask one or two questions at a time to feel approachable rather than overwhelming.
* **Required Data Points:**
  * Full Name
  * Gender
  * NRI Status (Boolean: Yes/No)
  * NEET Score / Expected Rank
  * Contact Information (Email / Phone)
* **Validation:** Ensure all inputs are strictly validated before submission.

### 2. The Capacity Constraint (Strict Limit)
* **Limit:** The system must absolutely cap at **25 successful bookings**.
* **Race Conditions:** Implement strict database-level checks (e.g., Supabase Postgres constraints or transaction locks) to prevent overbooking if multiple users hit "Submit" simultaneously when 24 slots are filled.
* **UI Feedback:** 
  * If slots are available: Show "X/25 Slots Remaining".
  * If full: Hide the booking form and display a "Bookings Full - Join Waitlist" or "Check back later" message.

### 3. Admin Dashboard (Future Updates)
* **Protected Route:** A simple `/admin` route hidden behind a secure login.
* **Admin Capabilities:**
  * View a table of all current bookings.
  * **Reset functionality:** A button to clear current bookings or archive them to open a new batch of 25 slots.
  * Update website copy/status (e.g., toggling the site between "Open for Bookings" and "Closed").

## 📂 Database Schema Guide (Supabase)
Create the following tables:
1. `bookings`: 
   * `id` (uuid, primary key)
   * `name` (text)
   * `gender` (text)
   * `is_nri` (boolean)
   * `neet_score` (integer)
   * `created_at` (timestamp)
2. `site_settings`:
   * `id` (integer, primary key)
   * `is_accepting_bookings` (boolean)
   * `current_batch` (integer)

## ⚠️ Development Rules & Boundaries
1. **Security First:** Never trust the client. The 25-slot limit MUST be enforced on the backend via a Supabase RPC (Remote Procedure Call) or strict database triggers.
2. **Mobile Responsiveness:** The UI must be flawless on mobile devices, as most students will access the site via their phones.
3. **Keep it Lightweight:** Avoid unnecessary dependencies. Use Tailwind for styling and standard Next.js features for routing.

## 🚀 Execution Steps for the Agent
1. Initialize the Next.js project and install required dependencies.
2. Provide the SQL commands to set up the Supabase tables, RLS (Row Level Security) policies, and the function to safely count/insert bookings.
3. Build the multi-step React form.
4. Integrate Supabase to handle submissions and capacity checking.
5. Build the protected `/admin` route for managing the session data.