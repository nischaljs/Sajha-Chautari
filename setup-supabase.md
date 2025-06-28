# Supabase Setup Guide for Sajha Chautari

## 🚀 Quick Setup

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Create a New Project
Go to [supabase.com](https://supabase.com) and create a new project:
- Project name: `sajhachautari`
- Database password: Choose a strong password
- Region: Choose closest to your location

### 4. Get Your Project Credentials
After project creation, go to Settings > API and copy:
- Project URL
- Anon public key
- Service role key (keep this secret!)

### 5. Update Environment Variables

**Update `apps/web/.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

NEXT_PUBLIC_HTTP_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_HTTP_MAP=http://localhost:3000/uploads/maps/
NEXT_PUBLIC_HTTP_OBJECT=http://localhost:3000/uploads/objects/
NEXT_PUBLIC_HTTP_AVATARS=http://localhost:3000/uploads/avatars/
```

**Update `apps/http_server/.env`:**
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

### 6. Initialize Local Supabase (Optional for Development)
```bash
# Initialize Supabase in your project
supabase init

# Start local Supabase stack
supabase start

# This will give you local URLs:
# API URL: http://127.0.0.1:54321
# DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
# Studio URL: http://127.0.0.1:54323
```

### 7. Push Database Schema
```bash
# Generate Prisma client
npm run db:generate

# Push schema to Supabase
npm run db:push

# Seed the database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f supabase/seed.sql
```

### 8. Start Development Servers
```bash
# Start all services
npm run dev

# Or start individually:
# Terminal 1 - HTTP Server
cd apps/http_server && npm run dev

# Terminal 2 - WebSocket Server  
cd apps/websocket_server && npm run dev

# Terminal 3 - Web App
cd apps/web && npm run dev
```

## 🔧 Alternative: Use Local Supabase

If you prefer to develop locally:

1. **Start local Supabase:**
```bash
supabase start
```

2. **Use local environment variables:**
```env
# In apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# In apps/http_server/.env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

3. **Access local services:**
- Web App: http://localhost:3001
- Supabase Studio: http://127.0.0.1:54323
- API: http://localhost:3000

## 📊 Default Data

The project comes with pre-seeded data:

### Admin Account
- **Email:** admin@gmail.com
- **Password:** Admin@123

### Available Maps
1. **Central Park** - Outdoor environment with trees and benches
2. **Office Space** - Professional workspace with desks
3. **Cozy Cafe** - Social space with tables and plants
4. **Study Hall** - Academic environment with study areas

### Public Spaces
- Community Park (Central Park map)
- Co-working Office (Office Space map)
- Virtual Cafe (Cozy Cafe map)
- Study Together (Study Hall map)

## 🎮 Getting Started

1. **Register/Login** at http://localhost:3001
2. **Set up your profile** with nickname and avatar
3. **Join a public space** or create your own
4. **Move around** using WASD or arrow keys
5. **Interact** with other users in real-time

## 🛠️ Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Check if your Supabase project is active
- Ensure your IP is whitelisted in Supabase dashboard

### Socket Connection Issues
- Make sure WebSocket server is running on port 8000
- Check NEXT_PUBLIC_SOCKET_URL in web app environment
- Verify CORS settings allow your frontend domain

### File Upload Issues
- Check if upload directories exist in `apps/http_server/src/public/uploads/`
- Verify file permissions for upload directories
- Ensure multer configuration is correct

## 🚀 Production Deployment

For production deployment:

1. **Deploy to Vercel/Netlify** (Frontend)
2. **Deploy to Railway/Render** (Backend services)
3. **Use Supabase hosted database** (Production)
4. **Configure environment variables** for production URLs
5. **Set up file storage** (Supabase Storage or AWS S3)

## 📝 Notes

- The project uses Prisma as ORM with PostgreSQL
- Real-time features powered by Socket.io
- File uploads handled by Multer
- Authentication using JWT tokens
- CORS configured for cross-origin requests