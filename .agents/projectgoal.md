# Project Goal — Wellness Appointment Platform

## 1. How to Use This File

This file is the complete product brief for the project.

## 2. Product Overview

Build a polished, mobile-first appointment-booking product for a nutritionist or wellness practice. Use **Nourish** as the temporary product name unless the existing code already has a suitable name.

The product has two experiences that share one backend and one persistent database:

1. **Client app:** Clients can view upcoming and past consultations, book an available slot, confirm attendance, reschedule, and cancel.
2. **Nutritionist dashboard:** The nutritionist can see and manage appointments, add appointments manually, filter today's appointments, update appointment status, and follow up with clients.

For the demo, both experiences must be accessible without a login and easy to switch between. Make it clear which experience the user is viewing. This is a demo convenience only; do not represent an unauthenticated app as suitable for storing real clients' private information in production.

## 3. The Problem to Solve

A nutritionist currently manages appointments through WhatsApp and an Excel sheet. About one in four clients may not show up, and the nutritionist sometimes only discovers this after waiting. Cancellations and rescheduling can also leave consultation time unused.

The product should do more than store bookings. It should help the nutritionist:

- Understand the day's schedule and each appointment's current status.
- Reduce avoidable no-shows with clear appointment details, confirmations, reminders, and easy changes.
- Release a slot when a client cancels or successfully reschedules.
- Improve the chance of filling a released slot by notifying suitable waitlisted clients.
- Spend less time coordinating bookings manually.
- Give clients a calm, convenient experience they would be comfortable using again.

**Product principle:** Minimize unused consultation time while making booking and appointment changes simple and reliable. Reminders and waitlists can improve the chances of filling slots, but cannot guarantee attendance or a replacement booking.

## 4. Core User Flows

### 4.1 Client experience

- Open a friendly home screen showing the next appointment, or a useful empty state when there is no upcoming appointment.
- Book a consultation by choosing a date, choosing an available time slot, and entering a name and phone number.
- Review the booking details before confirming.
- View upcoming appointments and appointment history.
- Confirm attendance, when confirmation is supported.
- Reschedule or cancel an upcoming appointment.
- See clear feedback for loading, success, validation errors, unavailable slots, and network failures.

Because the demo does not have login, make the demo-client selection mechanism clear and simple. Do not imply that a name or phone number provides secure authentication. Ensure users can tell whose appointments they are viewing.

### 4.2 Nutritionist dashboard

- Show appointments with client name, phone, date, time, and status.
- Support these statuses with distinct visual treatments: **Booked**, **Done**, and **No-show**.
- Also represent **Cancelled** explicitly so a cancelled appointment is not confused with an active booking. Cancelled appointments should remain in history.
- Add an appointment manually using the same shared data store as client bookings.
- Filter the list to show today's appointments.
- Update appointment statuses and see changes reflected in the client view where relevant.
- See attendance-confirmation state, if implemented, and identify appointments needing follow-up.
- Access a prefilled WhatsApp follow-up message when useful. The nutritionist must send the message; do not claim it was sent automatically unless a real messaging integration is implemented and configured.

## 5. No-Shows, Cancellations, and Released Slots

Handle appointment changes carefully so available consultation time is not unnecessarily wasted.

### Cancellation

1. Mark the appointment as **Cancelled** rather than deleting it.
2. Immediately release the old time slot for future bookings.
3. Check for waitlisted clients whose preferences match the released slot, if the waitlist feature exists.
4. Show the released slot as available to clients after the backend confirms the cancellation.

### Rescheduling

1. Check whether the requested destination slot is available.
2. Secure the new slot and update the appointment safely.
3. Release the old slot only after the reschedule succeeds.
4. If the new slot is unavailable or the update fails, keep the original appointment unchanged.
5. Check whether a waitlisted client matches the released slot, if waitlisting exists.

### Waitlist

Treat a waitlist as a high-value enhancement after the core booking and dashboard flows work. A simple version can collect a client's name, phone, and preferred date or time window. When a matching slot is released, surface suitable waitlist entries to the nutritionist and provide a prefilled WhatsApp message or a clear way to contact the client.

Do not claim a released slot has been filled until a new booking is successfully saved. Do not reserve a slot for a waitlisted client unless the application has a real, time-limited hold and confirmation flow. Always re-check availability when the client books.

### No-show reduction

At minimum, implement one genuine feature that can help reduce no-shows. A practical starting point is a client attendance-confirmation action plus a dashboard indicator and a prefilled WhatsApp reminder/follow-up action. Avoid paid messaging integrations unless they are genuinely configured and necessary.

## 6. Technology and Architecture

Use the MERN stack. Prefer JavaScript unless the existing project already uses TypeScript consistently.

- **Frontend:** React with Vite, React Router, Tailwind CSS, and Lucide React icons.
- **Backend:** Node.js and Express.
- **Database:** MongoDB with Mongoose. Use a hosted MongoDB database when deploying.
- **HTTP requests:** Reuse the existing API client, or use Axios if no client exists.
- **Deployment:** Keep the frontend, backend, and database configuration suitable for a typical hosted frontend, Node API, and MongoDB deployment. Keep all environment-specific values configurable.

Reuse dependencies and conventions that are already present where reasonable. Do not introduce a large library to solve a small problem. Keep secrets in environment variables, never commit actual `.env` files or credentials, and provide an `.env.example` containing placeholder variable names only.

Keep responsibilities clearly separated without overengineering: frontend pages/components and API calls; backend routes/controllers, data models, validation, and business logic. Do not build microservices or an elaborate permissions system for this product.

## 7. Data Model and Business Rules

The backend is the single source of truth for appointments. Do not use hardcoded frontend arrays as the normal source of truth.

An appointment should store at least:

- Unique identifier.
- Client name.
- Phone number, nullable when not provided.
- Appointment date and start time in a consistent representation.
- Duration or end time.
- Status: Booked, Done, No-show, or Cancelled.
- Attendance-confirmation state, if the confirmation flow is implemented.
- Booking source, such as client or nutritionist, if useful.
- Created and updated timestamps.

### Required rules

1. **Prevent double booking.** The same active time slot cannot be booked by two appointments. Validate on the server and use an appropriate database-level uniqueness or conflict safeguard where possible. Frontend-only checks are insufficient. Handle competing booking requests safely.
2. **Keep history.** Cancellation changes the status to Cancelled and releases the slot; it must not delete the appointment record.
3. **Reschedule safely.** Validate the new slot before moving an existing appointment. A failed reschedule must not destroy the original booking.
4. **Calculate availability correctly.** Generate slots from configurable practice hours and slot duration, excluding occupied active slots and slots in the past. Keep the schedule configuration in one place.
5. **Handle time consistently.** Assume the practice timezone is `Asia/Kolkata` unless the existing project clearly establishes a different timezone. Store, compare, and display dates consistently. Avoid parsing choices that shift calendar dates because of UTC conversion.
6. **Persist status changes.** Dashboard status updates must go through the API, and the UI must reflect the saved result returned by the backend.
7. **Share the same data.** Client bookings and manually created dashboard appointments must use the same persistent collection. Changes should appear in the other experience after refetching or refreshing.
8. **Validate inputs.** Trim names, validate phone input reasonably for the demo, validate dates and times, and return helpful API errors. Never trust the frontend to determine whether a slot is free.
9. **Match the waitlist safely.** Matching a released slot to a waitlist entry is not itself a booking. Re-check availability when a replacement appointment is confirmed.
10. **Keep the demo safe.** Use only the synthetic sample records listed below. Do not add real personal information or imply that the public demo is secure for real client records.

If a practice schedule is not already defined, use configurable demo hours and a 30-minute slot duration. Clearly label any schedule choices as demo defaults rather than treating them as facts about a real practice.

## 8. Initial Demonstration Data

Create these five demonstration appointments. Seed them idempotently so restarting the app does not create duplicates.

| Client | Phone | Date as provided | Time as provided | Status |
|---|---|---|---|---|
| Riya Shah | 98200 11111 | 24/10/2026 | 10:00 | Booked |
| Arjun Mehta | 98200 22222 | 2026-10-24 | 11:30am | Booked |
| Riya Shah | 9820011111 | 25-10-2026 | 4 pm | Booked |
| Meera Iyer | Not provided | 23/10/2026 | 09:00 | Done |
| Kabir Rao | 98200 33333 | 22/10/2026 | 14:00 | No-show |

Data handling rules:

- Normalize stored dates and times even though the input formats differ.
- Preserve both of Riya Shah's appointments; they are separate bookings, not duplicates to merge.
- Normalize phone-number formatting for display where reasonable. Phone formatting alone is not a reliable basis for merging appointments.
- Keep Meera's phone number missing and display “Not provided.” Never invent it.
- The two Booked appointments dated 24 October 2026 are in the past relative to 25 October 2026. Preserve their supplied statuses and make them visible for review if useful. Do not automatically mark them No-show without evidence.
- Keep the sample records distinguishable from any new demo bookings.

## 9. UI and Visual Design Rules

### Overall direction

Create a calm, warm, modern wellness product that feels like a thoughtful consumer app—not a generic admin template, unfinished wireframe, or over-decorated interface.

Use a consistent visual system:

- Warm off-white or cream backgrounds.
- Deep forest green or muted sage as primary colours.
- Dark, readable text and restrained warm accents.
- Clear typography hierarchy, generous whitespace, consistent spacing, subtle borders and shadows, and medium rounded corners.
- A small, consistent set of design tokens for colours, spacing, radii, and typography.
- Lucide icons used consistently; do not use emoji as interface icons.
- Motion only when it improves feedback. Respect reduced-motion preferences where practical.
- Visible keyboard focus and adequate text/background contrast.

Avoid excessive gradients, unrelated accent colours, overuse of glassmorphism, excessive shadows, and decorative elements that reduce clarity. Use the design system consistently across both experiences.

### Client app

- Mobile-first, friendly, and welcoming.
- Make the next appointment the primary focus when one exists.
- Guide booking in a clear order: choose date, choose available time, enter details, review, and confirm.
- Visually distinguish selected, unavailable, past, and available slots.
- Use clear empty states, human-readable errors, loading indicators, and success feedback.
- Prefer cards and compact lists over wide admin tables on small screens.
- Keep primary actions obvious and avoid clutter.

### Nutritionist dashboard

- Visually consistent with the client app, but optimized for quick scanning and practical work.
- Summary counts are acceptable only when they help the nutritionist act; do not add analytics for decoration.
- Use responsive cards/lists on narrow screens and a well-spaced table or structured list on wider screens.
- Give Booked, Done, No-show, and Cancelled distinct colours and always show text labels as well; status must not be communicated through colour alone.
- Keep “Today” filtering, manual booking, and appointment status actions easy to find.

### Responsive and accessibility requirements

- Test common phone widths and desktop layouts.
- Prevent horizontal overflow, clipped modals, and forms that are difficult to use on a phone.
- Use comfortable touch targets, labelled fields, accessible validation messages, semantic HTML, and keyboard-accessible controls.
- Every button or control that appears interactive must perform its stated action. Do not leave dead buttons or decorative controls that imply functionality.

## 10. Engineering Rules for the Agent

1. **Inspect first.** Review the `app` folder, package files, routes, components, styling, data models, and existing behavior before editing. Do not assume a fresh project.
2. **Build in small steps.** Implement and verify one end-to-end flow at a time. Prioritize shared data and reliable booking behavior before optional features.
3. **Preserve working behavior.** Avoid broad rewrites when a focused change will work. Do not delete or overwrite existing work without understanding its purpose.
4. **Keep code maintainable.** Use clear names and small, purposeful modules. Avoid duplicated business logic and unnecessary abstraction.
5. **Use the backend as the authority.** Availability, booking conflicts, cancellations, rescheduling, and status updates must be validated and persisted by the backend.
6. **Handle failures.** Support validation errors, API failures, missing data, empty lists, loading states, unavailable slots, and duplicate booking attempts.
7. **Do not fake functionality.** Never fake persistence, show a success message when a request failed, or claim a reminder was sent automatically when only a link was opened.
8. **Avoid scope creep.** Do not add payments, a chatbot, microservices, elaborate analytics, or unnecessary authentication flows unless the existing project already depends on them or they are essential to a core requirement.
9. **Protect secrets.** Use environment variables, keep actual secrets out of source control and browser bundles, and provide an `.env.example` with placeholders.
10. **Review generated code.** Check AI-generated changes for correctness, security, outdated APIs, unused code, and assumptions. Do not claim a test passed unless it was actually run.
11. **Run checks.** Use the build, lint, and test scripts that exist in the project. Fix errors introduced by your changes and test key user flows.
12. **Document the product itself.** Keep the README focused on what the app does, its architecture, implemented features, assumptions, known limitations, environment setup, and commands to run it locally.
13. **When details are ambiguous,** make the smallest safe, practical assumption; keep configuration centralized where useful. Do not invent facts about the practice or user data.

## 11. Acceptance Checklist

The product is ready when the following are true:

- [ ] The app starts using the documented setup and environment variables.
- [ ] Users can clearly switch between the Client App and Nutritionist Dashboard.
- [ ] The five demonstration appointments load with correctly normalized dates, times, and supplied statuses.
- [ ] A client can book a valid available slot.
- [ ] Two clients cannot successfully book the same active slot, including competing requests.
- [ ] Clients can view upcoming and past appointments.
- [ ] Clients can cancel or reschedule upcoming appointments.
- [ ] Cancelling or successfully rescheduling releases the old slot, while a failed reschedule preserves the original booking.
- [ ] The nutritionist can add appointments manually, filter today's appointments, and update Booked / Done / No-show status.
- [ ] Client bookings and dashboard bookings share one persistent database and appear in both experiences.
- [ ] Loading, empty, success, validation, and error states are handled clearly.
- [ ] At least one genuine no-show-reduction feature is implemented.
- [ ] If the waitlist is implemented, matching released slots are surfaced accurately and cannot create double bookings.
- [ ] The interface is polished and usable on mobile and desktop.
- [ ] The app does not expose credentials or imply that the public demo is secure for real client records.

## 12. Implementation Priority

Work in this order. Do not move to a lower-priority item while a higher-priority flow is broken.

### P0 — Core product

1. Inspect the existing project and establish how it runs.
2. Implement the appointment model and idempotent demo-data seeding.
3. Implement the shared API and reliable double-booking protection.
4. Build client booking, upcoming/past views, cancellation, and rescheduling.
5. Build the nutritionist list, manual appointment creation, today's filter, and status updates.
6. Make the app responsive and handle loading, empty, success, and error states.
7. Verify the product in a production-like configuration if deployment is part of the current work.
8. Keep the README accurate and runnable.

### P1 — High-value product improvements

1. Add attendance confirmation and a prefilled WhatsApp reminder/follow-up action.
2. Add lightweight waitlist matching for slots released by cancellation or rescheduling.

### P2 — Polish

Make small visual refinements and add minor convenience features only after all core flows are stable. Avoid speculative features that increase complexity without solving the main problem.

## 13. Final Direction

Build the smallest complete product that genuinely helps a wellness practice manage appointments and reduce unused consultation time. Prioritize reliability, shared persistent data, thoughtful UX, and honest behavior over feature count. Treat this file and the existing `app` folder as the available project context. Inspect first, make sensible assumptions when needed, implement incrementally, and verify the actual behavior before describing a feature as complete.
