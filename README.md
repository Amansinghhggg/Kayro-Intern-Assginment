# Nourish — Holistic Wellness & Nutrition Practice Platform

> A calm, mobile-first appointment booking and practice management platform designed for a nutritionist or wellness practice to eliminate no-shows and reclaim unused consultation hours.

---

## 1. Overview & Problem Solved

Independent nutritionists and wellness practitioners frequently coordinate client appointments across fragmented WhatsApp threads and manual spreadsheets. This introduces critical operational friction:
- **High No-Show Rates**: Up to 1 in 4 clients fail to attend consultations without prior notice.
- **Vacant Hours**: Last-minute cancellations and reschedules leave valuable consultation slots empty.
- **Manual Overhead**: Practitioners waste time sending manual reminders and re-booking walk-in clients.

**Nourish** solves this with a cohesive, mobile-first dual-experience web platform connected to a single live MongoDB database:
1. **Client Portal**: Frictionless appointment booking, prominent next-consultation banner, one-click attendance confirmation (*"I'll Be There"*), safe rescheduling, and cancellation with immediate slot release.
2. **Nutritionist Dashboard**: Schedule management, quick date filters (*Today*, *Tomorrow*, *Custom Date*), live attendance status tracking, one-click WhatsApp reminders and follow-ups, manual booking for offline clients, and automated waitlist matching for released slots.
3. **Demo Persona Switcher**: Instant slide-out hamburger drawer to evaluate client and nutritionist experiences without login friction.

---

## 2. Key Features

### 2.1 Client Experience
- **Next Consultation Hero**: Highlights the client's nearest upcoming appointment with date, time, duration, client notes, attendance state, and instant actions.
- **One-Click Attendance Confirmation**: Clients confirm attendance directly with an *"I'll Be There"* button, giving the nutritionist certainty ahead of the consultation.
- **Touch-Friendly Booking Flow**:
  - Horizontal swipeable 7-day date rail with day names and dates.
  - Live available time slot grid (30-minute intervals within practice hours: `09:00 - 17:00`).
  - Mobile-optimized inputs preventing iOS Safari auto-zoom.
- **Segmented App Tab Navigation**: Seamless switching between *Upcoming Appointments*, *Book Slot*, and *Consultation History* without page reloading.
- **Safe Rescheduling**: Validates the new slot before moving the booking. The original booking is never released until the new slot is secured.
- **Immediate Slot Release on Cancellation**: Cancelling an appointment updates the record to `Cancelled` (preserving history) and frees the time slot instantly.
- **Consultation Waitlist**: Clients can register their date and time preferences if their desired slot is occupied.

### 2.2 Nutritionist Dashboard
- **Operational Schedule View**: Filter consultations by *Today (25 Oct)*, *Tomorrow*, *All Dates*, or *Custom Date*, with live search by client name.
- **Attendance & Status Monitoring**: Real-time status badges (*Booked*, *Done*, *No-show*, *Cancelled*) and attendance indicators (*Confirmed* vs. *Pending*).
- **Practice Metrics**: At-a-glance KPI cards tracking *Total in View*, *Active Bookings*, *Confirmed Attendance*, *Needs Follow-up*, *No-shows*, and *Completed*.
- **Prefilled WhatsApp Messaging**: Direct click-to-chat links (`wa.me`) with customizable message templates:
  - **Attendance Reminder**: For active bookings pending client confirmation.
  - **No-Show Follow-up**: Gentle, caring check-in for clients who missed their session.
  - **Waitlist Notification**: Alerting waitlisted clients when a cancelled slot frees up.
- **Manual Booking Modal**: Add walk-in, phone-call, or offline clients into any available slot.
- **Waitlist Drawer**: Review waitlisted clients, update their status, launch WhatsApp messages, or convert them directly into bookings.

### 2.3 Double-Booking Prevention & Race Condition Safeguard
Race conditions occurring when two clients attempt to book the exact same slot concurrently are strictly prevented at both the application and database layers:
1. **Compound Unique Partial Index**:
   ```javascript
   // backend/src/models/Appointment.js
   appointmentSchema.index(
     { date: 1, startTime: 1 },
     { unique: true, partialFilterExpression: { isActive: true } }
   );
   ```
2. **Active Status Synchronization**: A Mongoose `pre('save')` hook automatically keeps `isActive: true` for all active bookings and sets `isActive: false` only when status becomes `Cancelled`.
3. **Atomic 409 Conflict Handling**: If two requests hit the server simultaneously, the first write succeeds and the second triggers MongoDB error code `11000`. The server catches this collision and returns an HTTP `409 Conflict` with clear user feedback, prompting the second client to choose another available slot.
4. **Reschedule Safety**: Rescheduling performs an atomic pre-check on the target slot before updating the appointment, preventing any intermediate state where an appointment could be dropped or duplicated.

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8 | Ultra-fast client application with modern hooks and HMR |
| **Styling** | Tailwind CSS v4, Lucide React | Curated warm holistic wellness palette, fully responsive |
| **Backend** | Node.js, Express.js (ESM) | RESTful API server with modular controllers and routes |
| **Database** | MongoDB Atlas, Mongoose 8 | Document storage with partial unique indexing and schemas |
| **Fallback DB**| `mongodb-memory-server` | Zero-config in-memory database for local testing without Atlas |
| **Tooling** | Concurrently | Single-command root execution running frontend and backend |
| **Timezone** | `Asia/Kolkata` (IST) | Standardized practice timezone for slot generation and display |

---

## 4. Project Structure

```
Kayro-Intern-Assginment/
├── package.json                   # Root package: concurrently dev script
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB Atlas connection & memory fallback
│   │   │   └── schedule.js        # Practice hours (09:00-17:00), 30m slots, IST
│   │   ├── controllers/
│   │   │   ├── appointmentController.js  # Slots, booking, reschedule, cancel, confirm
│   │   │   └── waitlistController.js     # Waitlist CRUD and status updates
│   │   ├── models/
│   │   │   ├── Appointment.js     # Schema with partial unique index on active slots
│   │   │   ├── Waitlist.js        # Waitlist schema with date & time preferences
│   │   │   └── User.js            # User entity schema
│   │   ├── routes/
│   │   │   ├── appointmentRoutes.js
│   │   │   └── waitlistRoutes.js
│   │   ├── services/
│   │   │   └── seedService.js     # Idempotent demo data seeder (Section 8)
│   │   └── server.js              # Express app setup, CORS, error handling
│   ├── .env.example               # Backend environment template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ClientExperience/
    │   │   │   ├── ClientHome.jsx         # Client portal & segmented tab controller
    │   │   │   ├── NextAppointmentHero.jsx# Hero card with attendance confirmation
    │   │   │   ├── BookingFlow.jsx        # 7-day touch date rail & slot picker
    │   │   │   ├── RescheduleModal.jsx    # Date/time re-booking with rollback safety
    │   │   │   ├── CancelModal.jsx        # Slot release confirmation
    │   │   │   └── WaitlistModal.jsx      # Client waitlist registration
    │   │   ├── NutritionistDashboard/
    │   │   │   ├── NutritionistDashboard.jsx # Schedule, metrics, filters, actions
    │   │   │   ├── ManualBookingModal.jsx    # Walk-in / phone booking dialog
    │   │   │   ├── WhatsAppPreviewModal.jsx  # Editable prefilled wa.me generator
    │   │   │   └── WaitlistDrawer.jsx        # Waitlist management & slot notification
    │   │   ├── Common/
    │   │   │   ├── StatusBadge.jsx        # Status pills (Booked, Done, No-show, Cancelled)
    │   │   │   ├── AttendanceBadge.jsx    # Confirmed vs. Pending attendance chips
    │   │   │   └── Toast.jsx              # Floating notification toasts
    │   │   ├── Header.jsx                 # Top bar & slide-out demo switcher drawer
    │   │   └── App.jsx                    # Root coordinator and view router
    │   ├── services/
    │   │   └── api.js                     # Axios client with base URL configuration
    │   ├── utils/
    │   │   └── formatters.js              # Date/time, phone, and WhatsApp link generators
    │   └── index.css                      # Tailwind CSS & wellness color tokens
    ├── index.html                         # Viewport configuration (viewport-fit=cover)
    ├── vite.config.js                     # Vite config with @tailwindcss/vite & proxy
    └── package.json
```

---

## 5. Demonstration Data (Section 8)

The application automatically seeds the 5 required demo records idempotently on startup without creating duplicates:

| Client Name | Phone | Consultation Date | Time (IST) | Status | Attendance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Riya Shah** | `98200 11111` | `2026-10-24` | 10:00 &ndash; 10:30 | **Booked** | **Confirmed** |
| **Arjun Mehta** | `98200 22222` | `2026-10-24` | 11:30 &ndash; 12:00 | **Booked** | *Unconfirmed* |
| **Riya Shah** | `98200 11111` | `2026-10-25` | 16:00 &ndash; 16:30 | **Booked** | *Unconfirmed* |
| **Meera Iyer** | *Not provided* | `2026-10-23` | 09:00 &ndash; 09:30 | **Done** | &mdash; |
| **Kabir Rao** | `98200 33333` | `2026-10-22` | 14:00 &ndash; 14:30 | **No-show** | &mdash; |

Plus a sample waitlist candidate: **Devika Sen** (`98200 44444`) waiting for a slot on `2026-10-25`.

---

## 6. Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Step 1: Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/Amansinghhggg/Kayro-Intern-Assginment.git
cd Kayro-Intern-Assginment

# Install all dependencies (root, backend, and frontend)
npm run install:all
```

### Step 2: Configure Environment Variables
Create a `.env` file in the `backend/` folder (or copy from `backend/.env.example`):

```bash
# backend/.env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nourish?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
TIMEZONE=Asia/Kolkata
```

> **Note on Database**: If `MONGODB_URI` is left blank or omitted, Nourish will automatically spin up an embedded in-memory MongoDB instance (`mongodb-memory-server`) for instant local testing!

### Step 3: Launch Frontend and Backend Concurrently
From the root project directory, run:

```bash
npm run dev
```

This single command launches both servers simultaneously using `concurrently`:
- **Backend API Server**: `http://localhost:5000`
- **Frontend Web App**: `http://localhost:5173` (also accessible over your local network via `--host`)

Open `http://localhost:5173` in your browser or test on your mobile phone on the same Wi-Fi.

---

## 7. REST API Reference

### 7.1 Appointments

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/appointments` | List appointments (filterable by `date`, `status`, `clientName`) |
| `GET` | `/api/appointments/slots?date=YYYY-MM-DD` | Returns all 16 practice slots for a date with availability |
| `POST` | `/api/appointments` | Book a consultation slot (returns `409 Conflict` if occupied) |
| `POST` | `/api/appointments/:id/confirm` | Confirm client attendance (*"I'll Be There"*) |
| `POST` | `/api/appointments/:id/reschedule` | Move appointment to a new date/time and release old slot |
| `DELETE` | `/api/appointments/:id` | Cancel appointment and immediately release the slot |
| `PATCH` | `/api/appointments/:id/status` | Update status (`Booked`, `Done`, `No-show`, `Cancelled`) |

### 7.2 Waitlist

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/waitlist` | List all waitlist candidates |
| `POST` | `/api/waitlist` | Add a new candidate with date/time preference |
| `PATCH` | `/api/waitlist/:id/status` | Update candidate status (`Waiting`, `Notified`, `Booked`, `Cancelled`) |

---

## 8. Deployment Options

Nourish is production-ready and can be deployed with zero architectural friction:

### Option A: Monolithic Deployment on Render or Railway (Recommended for Demo)
Serve the compiled React static bundle directly from Express:
1. Build frontend: `npm run build --prefix frontend`.
2. Configure Express in `server.js` to serve `frontend/dist`.
3. Deploy as a single Web Service on [Render](https://render.com) or [Railway](https://railway.app).
4. Set environment variable `MONGODB_URI`.

### Option B: Decoupled Deployment
- **Frontend**: Deploy `frontend/` on [Vercel](https://vercel.com) or [Netlify](https://netlify.com) (Build command: `npm run build`, Output directory: `dist`). Set `VITE_API_URL` to your backend URL.
- **Backend**: Deploy `backend/` on [Render](https://render.com), [Railway](https://railway.app), or [Fly.io](https://fly.io) with `MONGODB_URI` and `CLIENT_URL` pointing to your Vercel domain.

---

## 9. Design System & Mobile Responsiveness

- **Color Palette**:
  - Forest Green (`#1B3E2E`, `#112A1F`): Calming, authoritative practice tone.
  - Warm Cream (`#FBF9F5`): Gentle, restorative background reducing screen fatigue.
  - Sage (`#527C65`, `#E8EFE9`): Soft accent for confirmations and secondary elements.
  - Terracotta (`#C86432`, `#E07A4B`): Attention-directing accent for attendance alerts and waitlists.
- **Mobile First**:
  - `viewport-fit=cover` and 100% boundary rules prevent iOS and Android horizontal overscroll.
  - Segmented tab control replaces overflowing tab bars.
  - 7-day horizontal touch rail for swift one-thumb date selection.
  - Fluid time slot grid formatted for 320px to 430px+ mobile screens.
  - Input font sizes set to `16px` on mobile to prevent iOS Safari auto-zooming on focus.

---

## 10. Assumptions & Limitations

1. **Authentication**: Authentication is deliberately bypassed in demo mode so evaluators can switch personas (*Client* vs. *Nutritionist*) and test different client scenarios with zero friction.
2. **Timezone**: Practice appointments operate on `Asia/Kolkata` (IST) between `09:00` and `17:00` (8 hours, 16 30-minute consultation slots per day).
3. **WhatsApp Messaging**: Uses standard WhatsApp click-to-chat links (`wa.me`) with prefilled text templates. The message is triggered by the practitioner directly, keeping communication personal and requiring no paid WhatsApp Business API credentials.