# Sajha Chautari - 2D Metaverse Platform

A real-time 2D metaverse platform where users can create virtual spaces, interact with others, and move around in shared environments.

## 🚀 Features

- **Real-time multiplayer interaction** with WebSocket connections
- **Virtual spaces** with customizable maps and elements
- **Avatar system** with multiple character options
- **Admin dashboard** for creating maps, elements, and avatars
- **Public and private spaces** with capacity management
- **Collision detection** and movement validation
- **Responsive design** with mobile support

## 🏗️ Architecture

This is a monorepo built with Turborepo containing:

### Apps
- **`web`** - Next.js frontend application
- **`http_server`** - Express.js REST API server
- **`websocket_server`** - Socket.io WebSocket server

### Packages
- **`db`** - Prisma database schema and client
- **`schematype`** - Shared TypeScript types and Zod schemas
- **`ui`** - Shared React components
- **`eslint-config`** - Shared ESLint configurations
- **`typescript-config`** - Shared TypeScript configurations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, Socket.io, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **File Upload**: Multer for image handling
- **Real-time**: Socket.io for WebSocket connections

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- pnpm (recommended) or npm

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sajhachautari
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create `.env` files in the following locations:
   
   **`apps/http_server/.env`**:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/sajhachautari"
   JWT_SECRET="your-super-secret-jwt-key-here"
   PORT=3000
   NODE_ENV=development
   ```
   
   **`apps/websocket_server/.env`**:
   ```env
   HTTP_BASE_URL=http://localhost:3000/api/v1
   SOCKET_PORT=8000
   NODE_ENV=development
   ```
   
   **`apps/web/.env.local`**:
   ```env
   NEXT_PUBLIC_HTTP_URL=http://localhost:3000/api/v1
   NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
   NEXT_PUBLIC_HTTP_MAP=http://localhost:3000/uploads/maps/
   NEXT_PUBLIC_HTTP_OBJECT=http://localhost:3000/uploads/objects/
   NEXT_PUBLIC_HTTP_AVATARS=http://localhost:3000/uploads/avatars/
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb sajhachautari
   
   # Generate Prisma client and push schema
   cd packages/db
   npm run db:generate
   npm run db:push
   cd ../..
   
   # Seed with sample data
   psql $DATABASE_URL -f seed-data.sql
   ```

5. **Start development servers**
   ```bash
   # Option 1: Use the convenience script
   ./start-dev.sh
   
   # Option 2: Start manually
   # Terminal 1 - HTTP Server
   cd apps/http_server && npm run dev
   
   # Terminal 2 - WebSocket Server  
   cd apps/websocket_server && npm run dev
   
   # Terminal 3 - Web App
   cd apps/web && npm run dev
   ```

6. **Access the application**
   - Web App: http://localhost:3001
   - HTTP API: http://localhost:3000
   - WebSocket: http://localhost:8000

## 🎮 Default Content

The application comes with pre-seeded content:

### Default Admin Account
- **Email**: admin@gmail.com
- **Password**: Admin@123

### Sample Maps
1. **Central Park** - Outdoor environment with trees, benches, and fountain
2. **Office Space** - Professional workspace with desks and computers
3. **Cozy Cafe** - Social space with tables and plants
4. **Study Hall** - Academic environment with study tables and bookshelves

### Available Elements
- Trees, rocks, flowers, bushes (outdoor)
- Tables, chairs, computers, bookshelves (indoor)
- Decorative items like lamps, plants, fountains

## 🔧 Development

### Running Tests
```bash
# HTTP Server tests
cd apps/http_server && npm test

# Run specific test file
cd apps/http_server && npm test -- auth.test.ts
```

### Database Operations
```bash
# Generate Prisma client
cd packages/db && npm run db:generate

# Push schema changes
cd packages/db && npm run db:push

# Reset database (careful!)
cd packages/db && npx prisma db push --force-reset
```

### Building for Production
```bash
# Build all apps
pnpm build

# Build specific app
cd apps/web && npm run build
```

## 📁 Project Structure

```
sajhachautari/
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── http_server/         # Express.js API
│   └── websocket_server/    # Socket.io server
├── packages/
│   ├── db/                  # Prisma database
│   ├── schematype/          # Shared types
│   ├── ui/                  # Shared components
│   ├── eslint-config/       # ESLint configs
│   └── typescript-config/   # TypeScript configs
├── seed-data.sql           # Database seed file
├── start-dev.sh           # Development startup script
└── turbo.json             # Turborepo configuration
```

## 🎯 Key Features Explained

### Real-time Movement
- Users can move their avatars using WASD or arrow keys
- Movement is validated server-side for collision detection
- Real-time position updates via WebSocket

### Space Management
- Create public or private virtual spaces
- Set capacity limits and choose from available maps
- Join existing spaces or create new ones

### Admin Dashboard
- Create and manage maps with drag-and-drop editor
- Upload and organize elements (furniture, decorations)
- Manage user avatars and permissions

### Collision System
- Static elements block movement
- User-to-user collision prevention
- Boundary checking for map limits

## 🐛 Troubleshooting

### Common Issues

1. **Socket connection fails**
   - Check if WebSocket server is running on port 8000
   - Verify NEXT_PUBLIC_SOCKET_URL in web app environment

2. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL format
   - Run `npm run db:generate` after schema changes

3. **File upload issues**
   - Check upload directory permissions
   - Verify multer configuration in HTTP server

4. **Authentication problems**
   - Ensure JWT_SECRET is set in HTTP server
   - Check token expiration and format

### Performance Tips

- Use connection pooling for database
- Implement rate limiting for movement updates
- Optimize image sizes for faster loading
- Use Redis for session management in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with Turborepo for monorepo management
- Uses Prisma for type-safe database operations
- Socket.io for real-time communication
- Next.js for modern React development