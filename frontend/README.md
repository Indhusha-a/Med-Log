# Med-Log Frontend

React + TypeScript + Vite frontend for Med-Log. Talks to two independent services: the FastAPI backend (CRUD, auth) and the ml-service (the chatbot), each secured by the same JWT the backend issues at login.

## Stack

Vite, React 19, TypeScript, React Router, Tailwind CSS v4 (CSS-first config via `@theme` in `src/index.css`), Framer Motion, Lucide React, React Hook Form + Zod, Axios.

## Running it

```powershell
npm install
Copy-Item .env.example .env   # defaults already point at localhost:8000 / :8010
npm run dev
```

Needs the backend (port 8000) and ml-service (port 8010) both running — see their own READMEs. Open `http://localhost:5173`.

## Structure

```
src/
  app/            AuthProvider, ToastProvider, RequireRole route guard
  components/     Button, Input, Select, TextArea, Modal, Card, StatusBadge,
                  EmptyState, Skeleton, Avatar, AccountMenu, ConfirmDialog, ErrorBanner
  layouts/        AppShell (sidebar+topbar) + one thin wrapper per role
  features/
    auth/         login/signup API calls
    appointments/ list/create/reschedule/cancel/resolve API calls + shared row/filter/modal components
    doctors/      doctor directory + slot API calls
    admin/        seed-doctor/list-users/health API calls
    profile/      patient profile API calls
    chatbot/      ChatWidget + ml-service API call
  pages/          one file per route
  services/       backendApi.ts / mlApi.ts - the two axios instances
  utils/          authStorage, authEvents, apiError, status, oneHourLock, dates, cn
  types/api.ts    mirrors the backend's Pydantic schemas field-for-field
```

## Design decisions worth knowing about

- **No stock photography or background video in the hero.** None of that exists for this project, and inventing it would mean shipping fake assets. The hero is a crafted gradient + Framer Motion composition instead, with a floating card previewing the app's actual UI shape (not real patient data).
- **JWT lives in `localStorage`**, not an HttpOnly cookie — the backend wasn't built with cookie-based auth, so this is the only option that exists. A 401 from either API clears the session and bounces to `/login` via `utils/authEvents.ts`, a tiny pub-sub that lets the axios interceptors (which run outside React) talk to `AuthProvider` without a circular import.
- **The 1-hour lock is recalculated client-side** in `utils/oneHourLock.ts` purely to disable buttons and show a reason — the backend remains the actual authority and is still what gets enforced if this check is ever bypassed (e.g. a stale page).
- **Found and fixed a real bug while building this**: the obvious `new Date().toISOString().slice(0, 10)` pattern for "today's date" converts to UTC first, so on a UTC+5:30 machine it silently shows tomorrow's date for several hours each evening — the exact same class of bug the backend hit once with slot timezones. Centralized into `utils/dates.ts::todayIso()`, which builds the string from local date parts instead, and replaced four separate inline copies of the buggy version.
- **Doctor availability page merges two endpoints.** The backend's `GET /doctors/{id}/slots` only returns *open* slots (`is_booked=false`) — there's no endpoint for a doctor's full day including booked ones. `DoctorSlotsPage` merges that with that day's appointments (each carrying its own booked slot) to show the complete picture, rather than inventing a backend capability that doesn't exist.
- **"Booked appointments" vs "History"** split client-side from one `GET /appointments/me` call, filtered by status — there's no separate history endpoint on the backend (see root plan's "Frontend plan" section for the full list of corrections against the original brainstorm).

## What's verified vs. not

TypeScript compiles clean (`npm run build`, strict mode, `verbatimModuleSyntax`, `noUnusedLocals`). The dev server, backend, and ml-service were all run together and confirmed reachable. **Actual click-through UI testing in a real browser has not been done from this environment** — there's no browser/screenshot tool available here. Open it yourself, click through signup → login → booking → cancel/reschedule → doctor resolve → admin create-doctor → the chat widget, and report back anything that looks or behaves wrong.

## Known gaps

- No frontend test suite (component/E2E) — the assessment's testing requirement is covered by backend + ml-service pytest; flagged here rather than silently skipped.
- No code-splitting yet — the production bundle is a single ~660KB chunk (Vite warns about this); fine for an assessment, worth revisiting with `React.lazy` per route if this grows.
