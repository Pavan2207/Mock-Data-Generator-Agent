# 🚀 Deployment Guide

This guide covers deployment options for DataForge AI Mock-Data Generator Agent.

---

## Quick Deploy Options

### 1. Vercel (Recommended)

**Prerequisites:**
- Vercel account (free tier available)
- GitHub repository

**Steps:**

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit: DataForge AI"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to:
# - Link to your Vercel account
# - Import project
# - Configure build settings (auto-detected)
```

**Or use Vercel Dashboard:**
1. Visit https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Click "Deploy" (settings auto-detected)

**Build Settings:**
- Framework: Vite
- Build Command: `pnpm build`
- Output Directory: `dist`
- Install Command: `pnpm install`

---

### 2. Netlify

**Steps:**

1. **Build Locally**
```bash
pnpm build
```

2. **Deploy via Netlify CLI**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Production deployment
netlify deploy --prod
```

**Build Settings:**
- Build Command: `pnpm build`
- Publish Directory: `dist`
- Node Version: 18+

---

### 3. GitHub Pages

**Steps:**

1. **Install gh-pages**
```bash
pnpm add -D gh-pages
```

2. **Update vite.config.ts**
```typescript
export default defineConfig({
  base: '/dataforge-ai/', // Your repo name
  // ... rest of config
});
```

3. **Add deploy script to package.json**
```json
{
  "scripts": {
    "deploy": "vite build && gh-pages -d dist"
  }
}
```

4. **Deploy**
```bash
pnpm run deploy
```

5. **Enable GitHub Pages**
- Go to repository Settings > Pages
- Source: Deploy from branch `gh-pages`

---

### 4. Docker Deployment

**Create Dockerfile:**

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
    gzip_min_length 1000;
}
```

**Build and Run:**
```bash
# Build image
docker build -t dataforge-ai .

# Run container
docker run -p 8080:80 dataforge-ai
```

**Docker Compose (with PostgreSQL):**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:80"
    depends_on:
      - postgres

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: mockdata
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama

volumes:
  postgres_data:
  ollama_data:
```

**Run with Docker Compose:**
```bash
docker-compose up -d
```

---

## Environment Variables

Create `.env` file for environment-specific configuration:

```env
# API Configuration
VITE_API_BASE_URL=https://api.example.com
VITE_API_KEY=your_api_key_here

# Database Configuration
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=mockdata

# AI Configuration
VITE_OLLAMA_URL=http://localhost:11434
VITE_OPENAI_KEY=sk-...

# Discord Integration
VITE_DISCORD_WEBHOOK=https://discord.com/api/webhooks/...

# Feature Flags
VITE_ENABLE_AI=true
VITE_ENABLE_DB=true
```

**Access in code:**
```typescript
const apiKey = import.meta.env.VITE_API_KEY;
```

---

## Production Optimizations

### 1. Build Optimization

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
      },
    },
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          charts: ['recharts'],
          faker: ['@faker-js/faker'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
});
```

### 2. Performance

**Enable gzip compression** (nginx example):
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/css application/javascript application/json image/svg+xml;
```

**Add caching headers:**
```nginx
location /assets {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## Database Setup

### PostgreSQL with Docker

```bash
# Pull PostgreSQL image
docker pull postgres:16

# Run PostgreSQL container
docker run -d \
  --name postgres-mockdata \
  -e POSTGRES_DB=mockdata \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16
```

### Initialize Database Schema

```sql
-- Create schema for storing generated datasets
CREATE TABLE IF NOT EXISTS generated_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    schema_definition JSONB NOT NULL,
    row_count INTEGER NOT NULL,
    format VARCHAR(10) NOT NULL,
    file_path TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    user_id UUID
);

-- Create index for faster queries
CREATE INDEX idx_created_at ON generated_datasets(created_at DESC);
CREATE INDEX idx_user_id ON generated_datasets(user_id);
```

---

## AI Model Setup

### Ollama (Local AI)

**Install Ollama:**
```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh

# macOS
brew install ollama

# Windows
# Download from https://ollama.com/download
```

**Run Ollama:**
```bash
ollama serve
```

**Pull recommended models:**
```bash
# Fast, lightweight model
ollama pull llama2

# More powerful model
ollama pull mistral

# Specialized for code
ollama pull codellama
```

**Test Ollama:**
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Generate a realistic user name"
}'
```

---

## Monitoring & Analytics

### 1. Add Analytics (Optional)

**Google Analytics:**

```typescript
// src/app/lib/analytics.ts
export const trackEvent = (category: string, action: string, label?: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};
```

**Usage:**
```typescript
import { trackEvent } from './lib/analytics';

// Track data generation
trackEvent('Data Generation', 'Generate', `${rowCount} rows`);
```

### 2. Error Tracking

**Sentry Integration:**

```bash
pnpm add @sentry/react
```

```typescript
// src/app/App.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

---

## Health Checks

**Create health endpoint:**

```typescript
// src/app/health.ts
export async function checkHealth() {
  const checks = {
    app: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };

  // Check database
  try {
    // await db.query('SELECT 1');
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
  }

  // Check AI service
  try {
    // await fetch('http://localhost:11434/api/version');
    checks.ai = 'ok';
  } catch (error) {
    checks.ai = 'offline';
  }

  return checks;
}
```

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Backup & Recovery

### Database Backups

```bash
# Backup PostgreSQL
docker exec postgres-mockdata pg_dump -U postgres mockdata > backup.sql

# Restore PostgreSQL
docker exec -i postgres-mockdata psql -U postgres mockdata < backup.sql
```

### LocalStorage Export

```typescript
// Export all localStorage data
export function exportLocalStorage() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      data[key] = localStorage.getItem(key);
    }
  }
  return JSON.stringify(data, null, 2);
}

// Import localStorage data
export function importLocalStorage(jsonData: string) {
  const data = JSON.parse(jsonData);
  Object.entries(data).forEach(([key, value]) => {
    localStorage.setItem(key, value as string);
  });
}
```

---

## Troubleshooting

### Common Issues

**Build fails with "out of memory":**
```bash
# Increase Node memory limit
NODE_OPTIONS=--max_old_space_size=4096 pnpm build
```

**TypeScript errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Hot reload not working:**
```bash
# Update vite.config.ts
server: {
  watch: {
    usePolling: true
  }
}
```

---

## Performance Benchmarks

Expected performance metrics:

- **Build Time:** ~30-60 seconds
- **Bundle Size:** ~500KB (gzipped)
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **Data Generation:** 10,000 rows in <1s

---

## Support & Maintenance

### Regular Updates

```bash
# Check for outdated packages
pnpm outdated

# Update all packages
pnpm update

# Update specific package
pnpm update react react-dom
```

### Security Audits

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit --fix
```

---

**Need help with deployment?** Check the [README.md](./README.md) or open an issue!
