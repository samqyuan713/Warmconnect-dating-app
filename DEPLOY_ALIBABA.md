# WarmConnect - Alibaba Cloud Deployment Guide

## Overview
This guide deploys the full WarmConnect dating app (backend + frontend + PostgreSQL) on a single Alibaba Cloud ECS instance using Docker Compose. Everything runs on one server for simplicity and cost savings.

---

## Step 1: Sign Up for Alibaba Cloud Free Trial

1. Go to https://www.alibabacloud.com
2. Click "Free Trial" and create an account
3. Complete real-name verification (required for all Chinese cloud providers)
4. You will receive ~$300 USD credit valid for 12 months

---

## Step 2: Create an ECS Instance (Free Tier Eligible)

1. Go to **Elastic Compute Service (ECS)** → **Instances**
2. Click **Create Instance**
3. Configure:

| Setting | Recommended Value |
|---------|-----------------|
| Billing Method | Pay-As-You-Go (covered by free trial) |
| Region | Choose closest to you (e.g., Singapore, Hong Kong, or a China region) |
| Instance Type | `ecs.t6-c2m1.large` (2 vCPU, 1GB RAM) - **free tier eligible** |
| Image | Ubuntu 22.04 LTS 64-bit |
| System Disk | 40GB ESSD Entry (free tier) |
| Network | Default VPC |
| Public IP | Assign IPv4 Address (Auto) |
| Security Group | Create new (see Step 3) |
| Login | Password or SSH Key Pair |

4. Click **Create Instance**
5. Note down the **Public IP Address**

---

## Step 3: Configure Security Group (Firewall Rules)

1. Go to **Security Groups** → select your instance's security group
2. Click **Add Rules** and add:

| Type | Port Range | Source | Purpose |
|------|-----------|--------|---------|
| Custom TCP | 22/22 | 0.0.0.0/0 | SSH access |
| Custom TCP | 80/80 | 0.0.0.0/0 | HTTP (frontend) |
| Custom TCP | 8000/8000 | 0.0.0.0/0 | API (optional, nginx proxies it) |

> **Note:** For production, restrict port 22 to your IP only.

---

## Step 4: Connect to Your Server

```bash
# Replace with your actual public IP
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y
```

---

## Step 5: Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install -y docker-compose-plugin

# Or for older versions:
apt install -y docker-compose

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Add your user to docker group (log out and back in after)
usermod -aG docker $USER
```

Verify:
```bash
docker --version
docker-compose --version
```

---

## Step 6: Upload Your Project

### Option A: Using Git (Recommended)

```bash
# On your local machine, push to GitHub first
cd warmconnect-dating-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/warmconnect.git
git push -u origin main

# On the server
cd ~
git clone https://github.com/YOUR_USERNAME/warmconnect.git
cd warmconnect
```

### Option B: Using SCP (Direct file transfer)

```bash
# On your local machine
zip -r warmconnect.zip warmconnect-dating-app/
scp warmconnect.zip root@YOUR_SERVER_IP:/root/

# On the server
unzip warmconnect.zip
cd warmconnect-dating-app
```

---

## Step 7: Configure Environment

```bash
cd ~/warmconnect-dating-app

# Create .env file
cp .env.example .env

# Edit .env with a strong secret key
nano .env
```

`.env` contents:
```
DATABASE_URL=postgresql://dating_user:dating_pass@postgres:5432/dating_db
SECRET_KEY=replace-with-64-char-random-string-here-abc123xyz789
```

Generate a strong secret key:
```bash
openssl rand -hex 32
```

---

## Step 8: Deploy with Docker Compose

```bash
cd ~/warmconnect-dating-app

# Build and start all services
docker-compose up --build -d

# Check logs
docker-compose logs -f

# Check all containers are running
docker-compose ps
```

You should see 3 containers running:
- `warmconnect-db` (PostgreSQL)
- `warmconnect-api` (FastAPI backend)
- `warmconnect-web` (Nginx + React frontend)

---

## Step 9: Access Your App

Open your browser:
```
http://YOUR_SERVER_IP
```

- **Frontend**: `http://YOUR_SERVER_IP`
- **API Docs**: `http://YOUR_SERVER_IP/api/docs` (Swagger UI)
- **API Base**: `http://YOUR_SERVER_IP/api`

The first load will seed demo data automatically. Login with:
- Email: `demo1@warmconnect.com`
- Password: `demo123`

---

## Step 10: Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Restart services
docker-compose restart backend
docker-compose restart

# Stop everything
docker-compose down

# Stop and remove data (WARNING: deletes database)
docker-compose down -v

# Update after code changes
git pull
docker-compose up --build -d

# Enter database
docker exec -it warmconnect-db psql -U dating_user -d dating_db

# Backup database
docker exec warmconnect-db pg_dump -U dating_user dating_db > backup.sql

# Restore database
cat backup.sql | docker exec -i warmconnect-db psql -U dating_user -d dating_db
```

---

## Step 11: Add a Domain (Optional but Recommended)

1. Buy/register a domain (e.g., from Alibaba Cloud Domains, Namecheap, Cloudflare)
2. Add an A record pointing to your server IP
3. Install Certbot for HTTPS:

```bash
apt install -y certbot python3-certbot-nginx

# Stop nginx container temporarily
docker-compose stop frontend

# Get certificate
certbot certonly --standalone -d yourdomain.com

# Update nginx.conf to use SSL certificates
# Then restart
docker-compose up -d
```

---

## Step 12: Monitoring & Maintenance

```bash
# Check disk usage
df -h

# Check memory
free -h

# Check CPU
top

# Clean up old Docker images
docker system prune -a

# Auto-restart on crash (already configured in docker-compose.yml)
# restart: unless-stopped
```

---

## Troubleshooting

### Port 80 already in use
```bash
# Find what's using port 80
sudo lsof -i :80

# Stop it
sudo systemctl stop apache2
sudo systemctl disable apache2
```

### Database connection failed
```bash
# Check if postgres is healthy
docker-compose ps
docker-compose logs postgres

# Wait a bit and restart backend
docker-compose restart backend
```

### Frontend shows blank page
```bash
# Check nginx logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build -d frontend
```

### Out of memory (t6 instance has only 1GB)
```bash
# Add swap space
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## Cost Estimate (After Free Trial)

| Component | Spec | Monthly Cost |
|-----------|------|-------------|
| ECS t6-c2m1.large | 2 vCPU, 1GB RAM | ~$8-12 USD |
| Public IP | 1 IPv4 | ~$1-3 USD |
| Traffic | 100GB/month | ~$2-4 USD |
| **Total** | | **~$11-19 USD/month** |

> With the $300 free trial credit, this runs completely free for **15-25 months**.

---

## Architecture Diagram

```
                    User Browser
                         |
                         v
    +------------------------------------------+
    |  Alibaba Cloud ECS (t6-c2m1.large)       |
    |  Ubuntu 22.04 + Docker Compose            |
    |                                            |
    |  +------------------+  +----------------+ |
    |  | Nginx (Port 80)  |  | FastAPI        | |
    |  | React Frontend   |  | (Port 8000)    | |
    |  | Serves static    |  | API endpoints  | |
    |  | Proxies /api     |->| Auth, swipes   | |
    |  +------------------+  | Matching, chat | |
    |           |            +----------------+ |
    |           |                    |            |
    |           v                    v            |
    |  +--------------------------------------+    |
    |  | PostgreSQL 15 (Port 5432)            |    |
    |  | Users, Matches, Messages, Interests  |    |
    |  +--------------------------------------+    |
    +------------------------------------------+
```

---

## Next Steps After Deployment

1. **Set up CI/CD**: Use GitHub Actions to auto-deploy on push
2. **Add monitoring**: Install `htop`, `netdata`, or Alibaba Cloud Monitor
3. **Configure backups**: Automated daily database backups to OSS
4. **Scale up**: When you outgrow the t6 instance, upgrade to t6-c4m2 or use SLB for load balancing
5. **Add CDN**: Use Alibaba Cloud CDN for static assets

---

Happy deploying! 
