---
name: run-laravel-react-practice
description: Build, run, and drive the laravel-react-practice full-stack app (Laravel API + React/Vite SPA). Use when asked to start the app, run the backend or frontend, run tests/lint, take a screenshot of the UI, or interact with the running Tasks/Users/Companies/Auth/Chatbot app.
---

This is a monorepo with two coupled halves that must run together: `backend/`
(Laravel 13 API on `:8000`) and `frontend/` (React 19 + Vite SPA on `:5173`).
The SPA is useless without the API (every screen after login is an
authenticated fetch), so "running the app" means both processes up plus a
browser driving the SPA. Drive it with the `mcp__playwright__browser_*` MCP
tools already available in this environment (`browser_navigate`,
`browser_snapshot`, `browser_click`, `browser_type`, `browser_fill_form`,
`browser_take_screenshot`, `browser_console_messages`) — no `chromium-cli` and
no custom driver script needed here. If those MCP tools aren't available in
a given session, fall back to the curl-only API smoke sequence under
"Fallback: API-only smoke test" below.

All paths below are relative to the repo root
(`c:\Users\Usuario\Documents\GitHub\laravel-react-practice`). This was
authored and verified on native Windows (PowerShell + Git-Bash), not a Linux
container — commands below use whichever shell actually worked.

## Prerequisites

- PHP 8.3+ with `pdo_pgsql`/`pgsql` extensions enabled (verified with PHP
  8.5.8). Check: `php -m | grep pgsql`.
- Composer 2.x.
- Node 20+ / npm (verified with Node 26.8.2 / npm 11.19.1).
- A running PostgreSQL server. On this machine it's already installed as a
  Windows service (`postgresql-x64-17` / `postgresql-x64-18`) — confirm with:

```powershell
Get-Service | Where-Object { $_.Name -like '*postgres*' }
```

No `psql` client is installed or needed — Laravel talks to Postgres directly
via `pdo_pgsql`.

## Setup

`backend/.env` and `backend/vendor/`, and `frontend/node_modules/`, are
already present and working in this checkout — `composer install` /
`npm install` are only needed on a fresh clone. If starting from scratch:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# DB_DATABASE=laravel_react_practice, DB_USERNAME=postgres, DB_PASSWORD=postgres
# must match a real Postgres role/db on the local server (see Prerequisites)
php artisan migrate

cd ../frontend
npm install
```

**Critical config coupling:** `backend/.env` has
`CORS_ALLOWED_ORIGINS=http://localhost:5173` — a single, exact origin, not a
wildcard. The frontend **must** be reachable at exactly
`http://localhost:5173`. See Gotchas.

## Build

Not needed for dev (`php artisan serve` and `vite` both run from source). For
a production frontend build: `cd frontend && npm run build` (runs `tsc -b`
then `vite build`).

## Run (agent path)

1. **Free port 5173** if a stale dev server already owns it (see Gotchas —
   this bit us on the first run of this skill):

```powershell
try { Get-NetTCPConnection -LocalPort 5173,5174 -State Listen -ErrorAction Stop |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force } } catch {}
```

2. **Start the backend** (from `backend/`), then poll until it serves:

```bash
cd backend
php artisan serve --port=8000 > /tmp/backend-serve.log 2>&1 &
timeout 30 bash -c 'until curl -sf -o /dev/null http://127.0.0.1:8000/api/tasks -H "Accept: application/json" 2>/dev/null || curl -s -o /dev/null http://127.0.0.1:8000/api/register -X POST; do sleep 1; done'
```

   A 401 `{"message":"Unauthenticated."}` from `GET /api/tasks` means it's up
   (that route requires auth — that response IS "ready").

3. **Start the frontend** (from `frontend/`), then poll until it serves —
   confirm in the log it bound to **5173 exactly**:

```bash
cd frontend
npm run dev > /tmp/frontend-dev.log 2>&1 &
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null 2>&1; do sleep 1; done'
grep -ac '5173' /tmp/frontend-dev.log    # must be >= 1 — else it bound elsewhere
```

   (Vite's log wraps `Local:` and the port in ANSI color codes, so a plain
   `grep -o 'localhost:[0-9]*'` or `grep 'Local:'` silently matches nothing —
   the escape codes split the tokens apart. Just grep for the literal port
   number.)

4. **Get an authenticated session.** Fastest and most reliable path is via
   the API (avoids re-typing the login form every run), then let the SPA
   pick up the token from a UI login instead — the app has no route for
   "paste a token," so drive the real login form:

```bash
curl -s -X POST http://127.0.0.1:8000/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"name":"Smoke Test","email":"smoke+'"$(date +%s)"'@example.com","password":"password123","password_confirmation":"password123"}'
```

   Use the `email`/`password` you just registered in the UI login form (step
   5) — registering via curl first just guarantees a known-good
   email/password pair without guessing whether one is already taken.
   (Alternative: `php artisan db:seed` creates `test@example.com` /
   `password`, but don't reseed a database with other data in it.)

5. **Drive the UI** with Playwright MCP tools:

```
browser_navigate  url=http://localhost:5173
browser_snapshot                                    # get current element refs
# on the "Iniciar sesión" screen:
browser_fill_form  fields=[
  {target: <email-textbox-ref>, name: "Email", type: "textbox", value: "smoke+...@example.com"},
  {target: <password-textbox-ref>, name: "Contraseña", type: "textbox", value: "password123"}
]
browser_click  target=<"Iniciar sesión"-button-ref>
browser_snapshot                                    # now on Tasks page
browser_type  target=<"Nueva tarea..."-textbox-ref>  text="Smoke test"
browser_click  target=<"Agregar"-button-ref>
browser_wait_for  text="Smoke test"
browser_take_screenshot  filename=tasks-page.png
browser_console_messages  level=error               # confirm nothing threw
```

   `target` must be the exact ref string from the most recent
   `browser_snapshot` (e.g. `f1e40`), not a human label — always re-snapshot
   after any action that can change the DOM before targeting the next
   element.

Screenshots land wherever `browser_take_screenshot`'s `filename` points
(relative paths land under `.playwright-mcp/` at the repo root in this
setup). Logs: `/tmp/backend-serve.log`, `/tmp/frontend-dev.log`.

**Stop cleanly** (Windows — no `pkill`/`lsof` on this box):

```powershell
try { Get-NetTCPConnection -LocalPort 8000,5173 -State Listen -ErrorAction Stop |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force } } catch {}
```

### Fallback: API-only smoke test (no Playwright available)

The whole domain surface is reachable with curl once you have a token —
useful when Playwright MCP isn't wired into a session:

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"smoke+...@example.com","password":"password123"}' | python -c 'import sys,json;print(json.load(sys.stdin)["token"])')

curl -s http://127.0.0.1:8000/api/me -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
curl -s http://127.0.0.1:8000/api/tasks -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
curl -s -X POST http://127.0.0.1:8000/api/tasks -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" -H "Content-Type: application/json" -d '{"title":"Smoke test task"}'
```

Other domains follow the same `Authorization: Bearer $TOKEN` pattern:
`/api/companies`, `/api/users` (+ `PATCH /api/users/{id}/toggle-active`),
`/api/chatbot/ask`. Swagger UI (human-readable route map, generated from the
OpenAPI annotations) is at `GET /api/documentation` once the backend is
running.

## Run (human path)

```bash
cd backend && php artisan serve      # -> http://localhost:8000, Ctrl-C to stop
cd frontend && npm run dev           # -> http://localhost:5173, Ctrl-C to stop
```

Open `http://localhost:5173` in a browser, register or log in, and use the
Tareas / Usuarios / Empresas tabs plus the chat bubble (bottom-right).

## Test

```bash
cd backend && php artisan test       # Pest — 2 tests, 2 assertions, passed
cd frontend && npm run lint          # oxlint — exits clean; a few pre-existing
                                      # react-hooks warnings are not failures
```

## Gotchas

- **CORS is pinned to exactly `http://localhost:5173`** in `backend/.env`
  (`CORS_ALLOWED_ORIGINS`) — not a wildcard, not "any localhost port". Vite
  silently falls back to 5174/5175/... if 5173 is already bound (e.g. by a
  stale dev server from a previous run), and the frontend still loads fine —
  it just fails every API call with a CORS error that only shows up in
  `browser_console_messages`, not visibly in the UI. Always free 5173 first
  and confirm the Vite log says `5173` before driving the UI.
- **Deleting a task, and logging out, both open a confirm `alertdialog`**
  ("¿Seguro que quieres borrar ... ?" / "¿Seguro que quieres cerrar sesión?")
  — clicking the trash icon or "Cerrar sesión" alone does not act; a second
  click on the confirm button inside the dialog ("Eliminar" /
  "Cerrar sesión") is required. Re-snapshot after the first click to get the
  dialog's own button refs — they're new elements, not the ones you just
  clicked.
- **Registration returns 422 on a repeated email.** The DB in this checkout
  already has prior users from earlier runs/dev work — always register with
  a fresh/unique email (e.g. timestamp-suffixed) for a smoke run rather than
  a fixed literal.
- **A 401 on `GET /api/tasks` is the readiness signal**, not a failure — that
  route requires `auth:sanctum` and 401ing (instead of connection-refused)
  is exactly what confirms `php artisan serve` is actually listening.
- **The browser can already be logged in** from a previous session — the
  React app persists the Sanctum token in `localStorage`, so
  `browser_navigate` to the SPA may land directly on the Tasks page instead
  of the login screen. Don't assume you'll see the login form; snapshot
  first and branch on what's actually there.

## Troubleshooting

- **`Access to fetch at '.../api/login' ... blocked by CORS policy`** in
  `browser_console_messages`: the frontend is bound to a port other than
  5173 (check `frontend`'s dev-server log). Kill whatever's holding 5173 and
  restart `npm run dev`.
- **`{"message":"The email has already been taken."}` (422) from
  `/api/register`**: reuse a unique/timestamped email instead of a fixed
  literal for smoke-testing.
- **`{"message":"Unauthenticated."}` (401) from any `/api/...` route other
  than `/register` or `/login`**: no/expired Bearer token — register or log
  in again and use the fresh token.
