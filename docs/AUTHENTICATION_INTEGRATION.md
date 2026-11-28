# SmartSpend — Authentication Integration Guide (for Member 4)

## What the frontend now has

The frontend includes a complete authentication interface:

- **Login page** (tabbed with Register on one screen) — shown automatically when no session exists; all app pages are protected behind it.
- **Registration page** — full name, username, password, confirm-password; duplicate-username and mismatch errors displayed.
- **Show/hide password** toggles on both forms.
- **Logout button** in the topbar.
- **User profile chip** — avatar initials, full name, role (Student / Administrator, from the backend's `user`/`admin` roles).
- **Session handling** — the session object (username, fullName, role, token) is kept in `sessionStorage`; it survives page reloads but ends when the tab closes. Only the token/session is stored — never passwords, never financial data.
- **401 handling** — in live mode, any `401` response clears the session and returns the user to the login screen.
- **Authorization header** — once logged in, every API request carries `Authorization: Bearer <token>`.

## Frontend ↔ Java mapping (backend is a console app today)

The existing Java code already has everything the auth endpoints need — Member 4 only needs to expose them over HTTP:

| Frontend call | Java method to wrap (already exists) | Notes |
|---|---|---|
| `POST /api/auth/login` `{username, password}` | `UserStore.findUser(username)` + `User.login(password)` | Returns `{username, fullName, role, token}` or `401`. `role` = `"admin"` if `users[i] instanceof Admin`, else `"user"` |
| `POST /api/auth/register` `{username, password, fullName}` | `UserStore.register(username, password, fullName, false)` | `409`-style error if username taken; newly registered users get role `"user"` |
| `POST /api/auth/logout` | (no server state needed if tokens are stateless) | Return `204` |
| `GET /api/auth/me` | `UserStore.findUser()` + the session token | Returns the current user's `{username, fullName, role}` |

**Proposed session response (both login and register):**

```json
{ "username": "ali", "fullName": "Ali bin Ahmad", "role": "user", "token": "<server-generated>" }
```

**Proposed error format (consistent with the rest of the API):**

```json
{ "error": { "code": "INVALID_PASSWORD", "message": "Incorrect password. Please try again." } }
```

The demo accounts that `UserStore.loadUsers()` creates when `users.txt` is absent (`ali/1234`, `admin/admin`) match the mock accounts the frontend uses in demo mode, so the UI behaviour is identical before and after integration.

## Per-user data isolation

`Transaction.getOwner()` already exists in the backend. Once authenticated, Member 4 should filter all `/api/income`, `/api/expenses`, `/api/budgets`, `/api/savings`, `/api/alerts`, `/api/dashboard`, `/api/reports` responses to `owner == session.username` (admins may see all, matching the console app's admin menu). The frontend requires **no changes** for this — it simply renders whatever the server returns for the logged-in user.

## Mock mode vs live mode

- Mock mode simulates the exact same session shape and error messages in memory (accounts `ali/1234`, `admin/admin`; new registrations are held in memory only and reset on reload).
- The yellow "Demo data — not live" chip remains visible in mock mode.
- Switching to live mode (`api.js` → `mode: "live"`) moves auth to the real endpoints automatically; no UI code changes.
