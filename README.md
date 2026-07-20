# WarmConnect - Interest & Activity Based Dating App

A full-stack dating application built with React, FastAPI, and PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Framer Motion, Tailwind CSS |
| Backend | Python 3.11, FastAPI, SQLAlchemy |
| Database | PostgreSQL 15 |
| Auth | JWT with bcrypt |
| Matching | Interest/Activity/Distance/Age scoring algorithm |
| Deployment | Docker Compose |

## Quick Start (Local Development)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL in .env or config.py
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker (All-in-One)
```bash
docker-compose up --build -d
```

## Deployment

- **Alibaba Cloud**: See [DEPLOY_ALIBABA.md](DEPLOY_ALIBABA.md)
- **Railway**: Add `railway.json` and push
- **AWS/GCP/Azure**: Use ECS/Cloud Run/Container Instances with the same Docker Compose setup

## Features

- Interest & activity-based matching with compatibility scoring
- Tinder-style swipe cards with geolocation filtering
- Real-time chat with read receipts
- Multi-step registration with interest/activity selection
- Warm, inviting UI with glassmorphism design
- Demo data auto-seeded on first run

## Demo Accounts

| Email | Password | Name |
|-------|----------|------|
| demo1@warmconnect.com | demo123 | Emma |
| demo2@warmconnect.com | demo123 | James |
| demo3@warmconnect.com | demo123 | Sofia |
| demo4@warmconnect.com | demo123 | Michael |
| demo5@warmconnect.com | demo123 | Ava |
| demo6@warmconnect.com | demo123 | Daniel |

## License

MIT
