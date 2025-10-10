# 🚀 Quick Start Guide - VPS Deployment

## ⚡ Optimized Docker Setup (pydantic-core issues fixed)

### 🔧 Key Improvements:
- ✅ Uses `python:3.11` full image (not slim) for wider wheel availability
- ✅ `PIP_ONLY_BINARY=:all:` environment variable forces binary wheels
- ✅ Pre-installs pydantic with `--only-binary=:all:` flag
- ✅ Simplified requirements.txt with essential packages only
- ✅ Proper CORS configuration for oqool.net frontend

## 🚀 One-Command Deployment

### Quick Setup on Fresh Ubuntu VPS:
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker
apt-get install -y docker-compose-plugin
git clone https://github.com/moaid15-hub/nextjs-boilerplate.git
cd nextjs-boilerplate/frontend/src/app/docker-deploy
cp .env.example .env  # then edit values
docker compose up -d --build
```

### DNS Configuration:
Point Cloudflare A record: `api.oqool.net` -> your VPS IP (Proxy: ON)

### Expected Result:
`https://api.oqool.net/health` should return `{"ok": true}`

## ⚡ 5-Minute Setup

### 1️⃣ **Get a VPS:**
- DigitalOcean, Linode, Vultr ($5-10/month)
- Ubuntu 22.04 LTS recommended
- 1GB RAM minimum

### 2️⃣ **Set DNS (Cloudflare):**
```
Type: A Record
Name: api.oqool.net
Value: [YOUR_VPS_IP]
Proxy: ON (Orange Cloud)
```

### 3️⃣ **SSH to VPS and run:**
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker
sudo apt-get install -y docker-compose-plugin

# Get project
git clone https://github.com/moaid15-hub/nextjs-boilerplate.git
cd nextjs-boilerplate/frontend/src/app/docker-deploy

# Setup environment
cp .env.example .env
nano .env  # Edit your API keys

# Deploy
docker compose up -d --build
```

### 4️⃣ **Update Vercel:**
Add environment variable:
```
NEXT_PUBLIC_API_URL=https://api.oqool.net
```

### 5️⃣ **Test:**
```bash
curl https://api.oqool.net/health
# Should return: {"ok": true}
```

---

## 🔧 Key Features:

✅ **Auto SSL** - Caddy handles certificates automatically  
✅ **Rust Support** - Builds pydantic-core without errors  
✅ **Health Checks** - Automatic container monitoring  
✅ **CORS Ready** - Configured for oqool.net  
✅ **Production Ready** - Optimized Dockerfile  

---

## 📁 What's Included:

- `docker-compose.yml` - Multi-service orchestration
- `backend/Dockerfile` - Optimized Python 3.11 + Rust
- `Caddyfile` - Reverse proxy + SSL
- `requirements.txt` - Minimal dependencies
- `.env.example` - Environment template

---

## 🎯 Result:

**Frontend**: https://oqool.net (Vercel)  
**Backend**: https://api.oqool.net (Your VPS)  
**Database**: Supabase PostgreSQL  

**Total cost: ~$5-10/month for VPS**

---

## 🚨 Troubleshooting:

```bash
# Check logs
docker compose logs api
docker compose logs caddy

# Restart service
docker compose restart api

# Full rebuild
docker compose down
docker compose up -d --build

# Check containers
docker compose ps
```

**Now you have a production-ready deployment!** 🎉