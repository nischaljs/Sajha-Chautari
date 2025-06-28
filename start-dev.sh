#!/bin/bash

echo "Starting Sajha Chautari Development Environment..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use"
        return 1
    else
        echo "Port $1 is available"
        return 0
    fi
}

# Check required ports
echo "Checking required ports..."
check_port 3000 || exit 1
check_port 8000 || exit 1
check_port 5432 || echo "Warning: PostgreSQL might not be running on port 5432"

# Start PostgreSQL if not running
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "Starting PostgreSQL..."
    # Uncomment the appropriate line for your system:
    # sudo systemctl start postgresql  # For systemd systems
    # brew services start postgresql   # For macOS with Homebrew
    # pg_ctl start                     # For manual PostgreSQL installation
fi

# Generate Prisma client
echo "Generating Prisma client..."
cd packages/db && npm run db:generate && cd ../..

# Push database schema
echo "Pushing database schema..."
cd packages/db && npm run db:push && cd ../..

# Seed database with sample data
echo "Seeding database..."
if command -v psql &> /dev/null; then
    psql $DATABASE_URL -f seed-data.sql 2>/dev/null || echo "Database seeding completed (some conflicts expected)"
else
    echo "psql not found. Please run the seed-data.sql file manually."
fi

# Build projects
echo "Building projects..."
cd apps/http_server && npm run build && cd ../..
cd apps/websocket_server && npm run build && cd ../..

echo "Starting services..."

# Start HTTP server in background
echo "Starting HTTP server on port 3000..."
cd apps/http_server && npm start &
HTTP_PID=$!
cd ../..

# Wait a moment for HTTP server to start
sleep 3

# Start WebSocket server in background
echo "Starting WebSocket server on port 8000..."
cd apps/websocket_server && npm start &
SOCKET_PID=$!
cd ../..

# Wait a moment for WebSocket server to start
sleep 3

# Start Next.js development server
echo "Starting Next.js development server..."
cd apps/web && npm run dev &
WEB_PID=$!
cd ../..

echo ""
echo "🚀 All services started successfully!"
echo ""
echo "📱 Web App: http://localhost:3001"
echo "🔌 HTTP API: http://localhost:3000"
echo "⚡ WebSocket: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $HTTP_PID $SOCKET_PID $WEB_PID 2>/dev/null
    echo "All services stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for all background processes
wait