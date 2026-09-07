# AgroVoice — Standalone (HTML/CSS/JS + Oracle 11g)

Plain frontend + a tiny Node.js API that connects to **Oracle 11g**.
You will run this on your own computer (not inside Lovable).

```
standalone/
├── frontend/          ← plain HTML / CSS / JS (open in browser)
└── backend/           ← Node.js + Express + oracledb
    ├── server.js
    ├── db.js
    ├── package.json
    └── sql/schema.sql ← run this in Oracle first
```

## 1. Prerequisites (install once on your PC)

1. **Oracle 11g** already installed and running (you have this).
2. **Oracle Instant Client** (needed by the `oracledb` Node driver):
   - Download “Instant Client Basic” for your OS from Oracle.
   - Windows: unzip to e.g. `C:\oracle\instantclient_21_13` and add that
     folder to your `PATH`.
   - macOS/Linux: follow Oracle's install page for `LD_LIBRARY_PATH`.
3. **Node.js 18+** — https://nodejs.org

## 2. Create the database tables

Open SQL*Plus or SQL Developer, connect as your user, and run:

```
@backend/sql/schema.sql
```

## 3. Configure the backend

```
cd standalone/backend
copy .env.example .env       (Windows)   |   cp .env.example .env  (mac/linux)
```

Edit `.env` and set:

```
ORACLE_USER=system
ORACLE_PASSWORD=your_password
ORACLE_CONNECT_STRING=localhost:1521/XE
PORT=3001
```

`XE` is the default Oracle 11g Express service name. If you use a different
SID/service, change it (e.g. `localhost:1521/ORCL`).

## 4. Install and run the backend

```
cd standalone/backend
npm install
npm start
```

You should see: `AgroVoice API listening on http://localhost:3001`

Test it:

```
curl http://localhost:3001/api/health
```

## 5. Open the frontend

Just double-click `frontend/index.html` — or, better, serve it so `fetch`
works cleanly:

```
cd standalone/frontend
npx serve .
```

Open http://localhost:3000 (or whatever port `serve` prints).

The frontend talks to the backend at `http://localhost:3001`. If you change
the backend port, edit the `API_BASE` constant at the top of
`frontend/js/app.js`.

## Why not connect the browser directly to Oracle?

Browsers speak HTTP, Oracle speaks its own TCP protocol (TNS). They cannot
talk directly, and even if they could, your DB password would be visible to
every visitor. The tiny Node backend is the standard bridge.
