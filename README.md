# BrainBolt – Running Guide (Step by Step)

This guide tells you **what to install**, **what to fill in** (if anything), and **how to run** the app.

---

## What you need on your laptop

You can run BrainBolt in two ways:

| Option | You need installed | Best for |
|--------|--------------------|----------|
| **A. With Docker** | Docker Desktop (includes Docker Compose) | Easiest; no separate MongoDB/Redis install |
| **B. Without Docker** | Node.js (v18+), MongoDB, Redis | If you already use Node/Mongo/Redis locally |

Choose **one** of the two options below.

---

# Option A: Run with Docker (recommended)

## Step 1 – Install Docker

1. **macOS / Windows**
   - Download **Docker Desktop**: https://www.docker.com/products/docker-desktop/
   - Install and open it. Wait until it says “Docker is running”.
2. **Linux**
   - Install Docker Engine and Docker Compose: https://docs.docker.com/engine/install/

**Check it works:** Open a terminal and run:
```bash
docker --version
docker compose version
```
You should see version numbers (no “command not found”).

---

## Step 2 – Nothing to fill in

You **don’t need** to create any `.env` file or fill in config. Defaults are:

- Backend port: `4000`
- Frontend port: `3000`
- MongoDB: inside Docker, port `27017`
- Redis: inside Docker, port `6379`

If you want to change something (e.g. ports), see **Optional: Custom config** at the end of this guide.

---

## Step 3 – Run the app

1. Open a terminal (Cursor terminal or any terminal).
2. Go to the project folder:
   ```bash
   cd /Users/ratankumar/PROJECT
   ```
   (Or the path where you cloned the project.)
3. Run:
   ```bash
   docker compose up --build
   ```
4. Wait until you see lines like:
   - `BrainBolt API listening on port 4000`
   - `Ready on http://localhost:3000` (or similar for Next.js)
5. Open your browser and go to: **http://localhost:3000**

**First run:** If the database is empty, the backend will seed 50 questions automatically. You can start the quiz right away.

To stop: press `Ctrl+C` in the terminal. To run in the background instead:
```bash
docker compose up --build -d
```
To stop later: `docker compose down`.

---

# Option B: Run without Docker

You will run the **backend** and **frontend** yourself. MongoDB and Redis must be running separately.

---

## Step 1 – Install Node.js (v18 or newer)

1. **Option 1 – Official installer**
   - Go to https://nodejs.org/
   - Download the **LTS** version and install.
2. **Option 2 – With Homebrew (macOS)**
   ```bash
   brew install node
   ```
3. **Option 3 – With nvm (any OS)**
   ```bash
   # Install nvm from https://github.com/nvm-sh/nvm
   nvm install 18
   nvm use 18
   ```

**Check:**
```bash
node -v
npm -v
```
You should see something like `v18.x.x` and `9.x.x` (or higher).

---

## Step 2 – Install MongoDB

1. **macOS (Homebrew):**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```
2. **Windows:** Use the installer from https://www.mongodb.com/try/download/community and install as a service.
3. **Linux:** Follow https://www.mongodb.com/docs/manual/administration/install-on-linux/

**Check:** MongoDB should be running on `localhost:27017` (default).

---

## Step 3 – Install Redis

1. **macOS (Homebrew):**
   ```bash
   brew install redis
   brew services start redis
   ```
2. **Windows:** Use WSL2 and install Redis there, or use a Redis port from the Microsoft Store / Redis for Windows.
3. **Linux:** e.g. `sudo apt install redis-server` (Ubuntu/Debian) and start the service.

**Check:** Redis should be running on `localhost:6379` (default).

---

## Step 4 – What to fill in (optional)

By default the backend uses:

- **MongoDB:** `mongodb://localhost:27017/brainbolt`
- **Redis:** `redis://localhost:6379`
- **Port:** `4000`

You only need to **create a file or set variables** if your setup is different (e.g. different host/port or password).

**If you need to change these:**

1. In the **backend** folder, create a file named `.env` (same folder as `package.json`).
2. Add lines (only the ones you need to change):

   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/brainbolt
   REDIS_URL=redis://localhost:6379
   ```

   Examples:
   - MongoDB on another port: `MONGO_URI=mongodb://localhost:27018/brainbolt`
   - Redis with password: `REDIS_URL=redis://:yourpassword@localhost:6379`
   - Backend on another port: `PORT=5000`

3. Save the file. The backend reads these when it starts.

**Frontend:** You don’t need to fill anything. It talks to the backend via `http://localhost:4000` when you run locally (Next.js rewrites `/api/v1/*` to the backend).

---

## Step 5 – Seed the database (first time only)

If this is the first time you’re running the app and the `brainbolt` database is empty, add questions:

```bash
cd /Users/ratankumar/PROJECT/backend
npm install
npm run seed
```

You should see: `Seeded 50 questions.`  
(If the backend starts with an empty DB, it can also auto-seed on first start; you can run `npm run seed` anytime to reset and re-seed.)

---

## Step 6 – Start backend and frontend

Use **two terminals** (e.g. two Cursor terminals).

**Terminal 1 – Backend**

```bash
cd /Users/ratankumar/PROJECT/backend
npm install
npm run dev
```

Wait until you see: `BrainBolt API listening on port 4000`.

**Terminal 2 – Frontend**

```bash
cd /Users/ratankumar/PROJECT/frontend
npm install
npm run dev
```

Wait until you see something like: `Ready on http://localhost:3000`.

---

## Step 7 – Open the app

In your browser go to: **http://localhost:3000**

You should see the BrainBolt home page. Use **Start Quiz** to play.

---

# Optional: Custom config (any option)

If you want to change ports or URLs:

**With Docker:** create a file `.env` in the **project root** (same folder as `docker-compose.yml`). You can set:

```env
# Example: change backend port
PORT=5000
```

Then in `docker-compose.yml` the backend service already uses `PORT` from the environment. For frontend port you’d change the `ports` section in `docker-compose.yml` (e.g. `"3001:3000"` to use 3001 on the host).

**Without Docker:** use the **backend** `.env` as in Step 4 above. Frontend port is fixed at 3000 when you run `npm run dev` unless you run `npm run dev -- -p 3001` (or set in `package.json`).

---

# Quick reference

| What | Value (default) |
|------|------------------|
| App (frontend) | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |
| Backend env file | `backend/.env` (optional) |
| Root env file (Docker) | `.env` in project root (optional) |

---

# Troubleshooting

- **“npm: command not found”**  
  Install Node.js (Step 1 of Option B) and make sure the terminal is restarted (or run `source ~/.zshrc` / open a new terminal).

- **“MongoDB connection error”**  
  Start MongoDB (Option B Step 2) or use Docker (Option A).

- **“Redis connection error”**  
  Start Redis (Option B Step 3) or use Docker (Option A).

- **“Port 3000 already in use”**  
  Another app is using 3000. Stop it or run the frontend on another port: `cd frontend && npm run dev -- -p 3001` and open http://localhost:3001.

- **“Port 4000 already in use”**  
  Set `PORT=4001` in `backend/.env` and restart the backend; the frontend will still proxy to it if you keep the rewrite as is (or set `BACKEND_URL=http://localhost:4001` when building/running the frontend if you use a custom backend URL).

- **No questions / empty quiz**  
  Run the seed: `cd backend && npm run seed` (Option B) or `docker compose run --rm seed` (Option A).
