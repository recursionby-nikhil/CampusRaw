# CampusRaw 🎥

> Real college. Unfiltered. No filter. No polish. No parents.

CampusRaw is a student-only video platform for authentic campus content. Public viewing, university-verified uploads. Built for the chaos that YouTube deletes and TikTok shadowbans.

---

## What is CampusRaw?

A video platform exclusively for university students. Upload clips, long videos, or post anonymously — your campus sees it first, the world sees it if it's good enough.

- 🏫 **Campus feed** — content from your university only
- 🌏 **National feed** — content from universities in your country
- 🌍 **Global feed** — the best content from campuses worldwide
- 👻 **Anonymous posting** — post without your name, reveal yourself later
- 🔥 **Vibe rating system** — fire, chaotic, important, cringe, wholesome (no stars)
- 🌡 **Heat score** — community-powered virality, no algorithm manipulation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Styling | Inline styles (DM Sans + Bebas Neue) |
| Video Storage | Cloudflare R2 (not added yet) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
campusraw/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Feed.jsx        # Main feed (campus/national/global)
│   │   │   ├── Signup.jsx      # University email signup
│   │   │   ├── Login.jsx       # Login page
│   │   │   ├── Profile.jsx     # User profile + posts
│   │   │   └── Admin.jsx       # God dashboard (role: god only)
│   │   ├── components/
│   │   │   ├── Comments.jsx    # Comments section
│   │   │   └── UploadModal.jsx # Video upload modal
│   │   └── App.jsx
├── server/                  # Node.js backend
│   ├── models/
│   │   ├── User.js             # User schema
│   │   └── Post.js             # Post schema
│   ├── routes/
│   │   ├── auth.js             # Signup + login
│   │   ├── posts.js            # Feed, upload, rate, comment
│   │   └── admin.js            # God-only routes
│   └── index.js
└── campusraw-landing.html   # Landing page (standalone)
```

---

## Local Setup

### Prerequisites
- Node.js v18+
- Git
- A MongoDB Atlas account (free)

### 1. Clone the repo

```bash
git clone https://github.com/YOURUSERNAME/campusraw.git
cd campusraw
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:

```env
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/campusraw
PORT=5000
JWT_SECRET=your_secret_key_here (this is in the development phase)
```

Start the backend:

```bash
nodemon index.js
```

You should see:
```
Server running on port 5000
MongoDB connected 🔥
```

### 3. Set up the frontend

```bash
cd ../client
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Environment Variables

### server/.env

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string (include `/campusraw` at the end) |
| `PORT` | Backend port (default 5000) |
| `JWT_SECRET` | Any long random string for signing JWT tokens |

---

## University Email Domains Supported

CampusRaw verifies university emails on signup. Currently supported domains:

- `.edu` — USA and others
- `.ac.in` — India
- `.ac.uk` — United Kingdom
- `.edu.au` — Australia
- `.ac.nz` — New Zealand
- `.edu.sg` — Singapore

To add more domains, edit `server/routes/auth.js`:

```javascript
const validDomains = ['.edu', '.ac.in', '.ac.uk', '.edu.au', '.ac.nz', '.edu.sg'];
```

---

## User Roles

| Role | Access |
|------|--------|
| `user` | Standard student — can post, comment, rate |
| `elevated` | Campus king — moderation access for their region |
| `god` | Platform owner — full admin dashboard access |

To make yourself god, sign up normally then go to MongoDB Atlas → campusraw → users → find your document → edit `role` to `"god"`.

---

## Key Features

### Anonymous Posting
Every post can be made anonymously. The backend always stores the real author (for moderation), but publicly only shows "Anonymous • University". The author can reveal themselves at any time from their profile page.

### Vibe Rating System
No stars. Users rate posts with vibes:
- 🔥 Fire
- 🤡 Chaotic  
- 📢 Important
- 💀 Cringe
- 🫶 Wholesome

Each vibe has a weight. Combined with comments and views, it calculates a **heat score** that determines feed visibility.

### Heat Score & Feed Promotion
Posts start in the campus feed. As heat score grows:
- Score > 10 → Trending
- Score > 40 → Promoted to national feed
- Score > 100 → Promoted to global feed

Community decides what goes viral. No algorithm.

---

## Roadmap

- [ ] Email OTP verification
- [ ] Forgot password / reset via email
- [ ] Cloudflare R2 video storage (will do at last)
- [ ] Follow / unfollow system
- [ ] Search (users + universities)
- [ ] Admin / god dashboard
- [ ] Mobile responsive design
- [ ] Dark / light theme toggle
- [ ] Voice / video rooms (v2)
- [ ] AI Study Buddy (v3)
- [ ] Gamification + leaderboards (v3)

---

## Contributing

CampusRaw uses an elevated student model for contributions. Select students from different universities help manage the platform regionally. If you're interested in becoming an elevated contributor, reach out.

---

## License

MIT — do what you want, just don't be boring.

---
