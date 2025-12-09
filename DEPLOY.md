# Deployment Guide

This guide provides comprehensive instructions for deploying the GeoAstro Compute application to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
  - [Option 1: Docker Deployment](#option-1-docker-deployment)
  - [Option 2: Traditional VPS Deployment](#option-2-traditional-vps-deployment)
  - [Option 3: Platform-as-a-Service (PaaS)](#option-3-platform-as-a-service-paas)
- [Production Considerations](#production-considerations)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ A server or hosting platform account
- ✅ Domain name (optional but recommended)
- ✅ SSL certificate (Let's Encrypt recommended for free SSL)
- ✅ Gemini API key (optional, for AI features)
- ✅ Git installed on your deployment server

---

## Environment Configuration

### 1. Environment Variables

Create a `.env` file in the root directory for production:

```bash
# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_WORKERS=4

# Frontend Configuration
VITE_API_URL=https://your-domain.com/api

# Optional: Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Security
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 2. Production Build

Build the frontend for production:

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

---

## Deployment Options

### Option 1: Docker Deployment

Docker provides the easiest and most consistent deployment method.

#### Step 1: Create Dockerfile for Backend

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY de421.bsp .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

#### Step 2: Create Dockerfile for Frontend

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Step 3: Create nginx.conf

Create `nginx.conf` for the frontend:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Step 4: Create docker-compose.yml

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: geoastro-backend
    restart: unless-stopped
    environment:
      - BACKEND_HOST=0.0.0.0
      - BACKEND_PORT=8000
    ports:
      - "8000:8000"
    networks:
      - geoastro-network

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: geoastro-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - geoastro-network

networks:
  geoastro-network:
    driver: bridge
```

#### Step 5: Deploy with Docker

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

### Option 2: Traditional VPS Deployment

Deploy to a VPS (DigitalOcean, Linode, AWS EC2, etc.)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx certbot python3-certbot-nginx

# Install PM2 for process management
sudo npm install -g pm2
```

#### Step 2: Clone and Setup Application

```bash
# Clone repository
git clone https://github.com/NetoRibeiro/GeoAstro-Compute.git
cd GeoAstro-Compute

# Setup Python virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install frontend dependencies and build
npm install
npm run build
```

#### Step 3: Configure Backend with PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'geoastro-backend',
    script: 'venv/bin/uvicorn',
    args: 'backend.main:app --host 0.0.0.0 --port 8000 --workers 4',
    cwd: '/path/to/GeoAstro-Compute',
    env: {
      PYTHONPATH: '/path/to/GeoAstro-Compute'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

Start the backend:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx

Create `/etc/nginx/sites-available/geoastro`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    root /path/to/GeoAstro-Compute/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/geoastro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Setup SSL with Let's Encrypt

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

### Option 3: Platform-as-a-Service (PaaS)

#### Deploying to Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable:
   - `VITE_API_URL`: Your backend URL
6. Deploy

**Backend (Railway):**

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Configure:
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables as needed
5. Deploy

#### Deploying to Heroku

Create `Procfile`:

```
web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

Create `runtime.txt`:

```
python-3.11.0
```

Deploy:

```bash
heroku create your-app-name
git push heroku main
```

---

## Production Considerations

### Security

1. **CORS Configuration:**
   Update `backend/main.py` to restrict CORS origins:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-domain.com"],  # Restrict to your domain
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Environment Variables:**
   - Never commit `.env` files to version control
   - Use secrets management for sensitive data
   - Rotate API keys regularly

3. **HTTPS:**
   - Always use HTTPS in production
   - Redirect HTTP to HTTPS
   - Use HSTS headers

### Performance Optimization

1. **Frontend:**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement caching headers
   - Minify and bundle assets

2. **Backend:**
   - Use multiple workers (4+ recommended)
   - Implement rate limiting
   - Add caching for expensive calculations
   - Use connection pooling

### Scaling

1. **Horizontal Scaling:**
   - Use load balancer (nginx, HAProxy)
   - Deploy multiple backend instances
   - Use Redis for session management

2. **Vertical Scaling:**
   - Increase server resources as needed
   - Monitor CPU and memory usage
   - Optimize database queries

---

## Monitoring and Maintenance

### Logging

**Backend Logging:**
```python
# Add to backend/main.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

**PM2 Logs:**
```bash
pm2 logs geoastro-backend
pm2 logs --lines 100
```

### Health Checks

Add health check endpoint in `backend/main.py`:

```python
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.1.012",
        "timestamp": datetime.now().isoformat()
    }
```

### Monitoring Tools

- **Uptime Monitoring:** UptimeRobot, Pingdom
- **Application Monitoring:** New Relic, DataDog
- **Error Tracking:** Sentry
- **Analytics:** Google Analytics, Plausible

### Backup Strategy

1. **Code:** Use Git for version control
2. **Data:** Regular database backups (if applicable)
3. **Configuration:** Backup nginx configs and environment files

### Updates and Maintenance

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install
pip install -r requirements.txt

# Rebuild frontend
npm run build

# Restart backend
pm2 restart geoastro-backend

# Reload nginx
sudo systemctl reload nginx
```

---

## Troubleshooting

### Common Issues

**Backend not starting:**
- Check Python version compatibility
- Verify all dependencies are installed
- Check port availability (8000)
- Review application logs

**Frontend build fails:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (v16+)
- Verify all environment variables are set

**502 Bad Gateway:**
- Ensure backend is running
- Check nginx proxy configuration
- Verify firewall rules
- Check backend logs for errors

**CORS errors:**
- Update CORS origins in backend
- Verify API URL in frontend environment variables
- Check nginx proxy headers

---

## Support

For issues and questions:
- **GitHub Issues:** [github.com/NetoRibeiro/GeoAstro-Compute/issues](https://github.com/NetoRibeiro/GeoAstro-Compute/issues)
- **Documentation:** [README.md](README.md)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/NetoRibeiro/">NetoRibeiro</a></p>
</div>
