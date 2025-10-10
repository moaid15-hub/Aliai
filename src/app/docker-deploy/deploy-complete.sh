#!/bin/bash
# 🚀 Complete VPS Deployment Script - Fixes pydantic-core build issues
# Run this script on your VPS to deploy Oqool AI API

set -e

echo "🚀 Oqool AI VPS Deployment Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Install Docker if not present
install_docker() {
    print_step "Checking Docker installation..."
    
    if command_exists docker; then
        print_success "Docker is already installed"
        docker --version
    else
        print_step "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        print_success "Docker installed successfully"
        print_warning "Please log out and back in for Docker permissions to take effect"
    fi
    
    # Install docker-compose if not present
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose is available"
    else
        print_step "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose installed"
    fi
}

# 2. Setup project files
setup_project() {
    print_step "Setting up project files..."
    
    # Create directory if not exists
    mkdir -p ~/oqool-api
    cd ~/oqool-api
    
    # Download deployment files from GitHub
    print_step "Downloading deployment files..."
    
    # Create .env file
    cat > .env << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database URL (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# API Keys
ANTHROPIC_API_KEY=your-anthropic-api-key-here
OPENAI_API_KEY=your-openai-api-key-here

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=production
EOF
    
    print_warning "Please edit .env file with your actual credentials!"
    print_warning "nano .env"
    
}

# 3. Create deployment files locally
create_deployment_files() {
    print_step "Creating deployment files..."
    
    # Create backend directory
    mkdir -p backend
    
    # Create main.py
    cat > backend/main.py << 'EOF'
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import Dict, Any
import httpx

app = FastAPI(title="Oqool AI API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://oqool.net", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    status: str = "success"

@app.get("/")
async def root():
    return {"message": "Oqool AI API is running!", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is operational"}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(chat_message: ChatMessage):
    try:
        # Simple echo response for now - replace with actual AI logic
        response_text = f"Echo: {chat_message.message}"
        
        return ChatResponse(
            response=response_text,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

    # Create requirements.minimal.txt (safest approach)
    cat > backend/requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn==0.24.0
python-dotenv==1.0.0
httpx==0.25.2
pydantic==2.5.3
psycopg2-binary==2.9.9
EOF

    # Create emergency Dockerfile (pre-built base)
    cat > backend/Dockerfile << 'EOF'
FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11-slim

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir --only-binary=:all: -r requirements.txt

# Copy application
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

    # Create docker-compose.yml
    cat > docker-compose.yml << 'EOF'
version: "3.9"

name: oqool_api

services:
  api:
    build: ./backend
    env_file: .env
    environment:
      - PORT=8000
    restart: unless-stopped
    expose:
      - "8000"

  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    restart: unless-stopped
    depends_on:
      - api

volumes:
  caddy_data:
  caddy_config:
EOF

    # Create Caddyfile
    cat > Caddyfile << 'EOF'
api.oqool.net {
    reverse_proxy api:8000
    
    # Security headers
    header {
        # Enable HSTS
        Strict-Transport-Security "max-age=31536000; includeSubdomains; preload"
        # Prevent XSS attacks
        X-XSS-Protection "1; mode=block"
        # Prevent content type sniffing
        X-Content-Type-Options "nosniff"
        # Prevent clickjacking
        X-Frame-Options "SAMEORIGIN"
        # Remove server header
        -Server
    }
    
    # Enable gzip compression
    encode gzip
    
    # Logging
    log {
        output file /var/log/caddy/access.log
        format console
    }
}
EOF

    print_success "Deployment files created successfully!"
}

# 4. Deploy the application
deploy_application() {
    print_step "Deploying application..."
    
    cd ~/oqool-api
    
    # Build and start services
    print_step "Building Docker containers..."
    
    # Try different deployment strategies
    if docker compose up -d --build; then
        print_success "Deployment successful with main docker-compose!"
    else
        print_warning "Main deployment failed, trying emergency approach..."
        
        # Create emergency compose file
        cat > docker-compose.emergency.yml << 'EOF'
version: "3.9"
name: oqool_emergency
services:
  api:
    image: tiangolo/uvicorn-gunicorn-fastapi:python3.11-slim
    env_file: .env
    environment:
      - MODULE_NAME=main
      - VARIABLE_NAME=app
    volumes:
      - ./backend:/app
    restart: unless-stopped
    expose:
      - "8000"
    command: >
      sh -c "
        pip install --no-cache-dir --only-binary=:all: 
        fastapi uvicorn python-dotenv httpx pydantic psycopg2-binary &&
        cd /app && uvicorn main:app --host 0.0.0.0 --port 8000
      "
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    restart: unless-stopped
    depends_on:
      - api
volumes:
  caddy_data:
  caddy_config:
EOF
        
        if docker compose -f docker-compose.emergency.yml up -d; then
            print_success "Emergency deployment successful!"
        else
            print_error "Both deployment methods failed. Check logs with: docker compose logs"
            exit 1
        fi
    fi
    
    # Wait a moment for services to start
    sleep 10
    
    # Check if services are running
    print_step "Checking service status..."
    docker compose ps
    
    print_success "Deployment completed!"
}

# 5. Verify deployment
verify_deployment() {
    print_step "Verifying deployment..."
    
    # Test local connection
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        print_success "Local API health check passed!"
    else
        print_warning "Local API health check failed - checking logs..."
        docker compose logs api | tail -20
    fi
    
    print_step "Deployment verification complete!"
    echo ""
    echo "🎉 Next Steps:"
    echo "1. Configure DNS: Point api.oqool.net to this server's IP"
    echo "2. Edit .env file with your actual API keys"
    echo "3. Test API: curl https://api.oqool.net/health"
    echo "4. Update Vercel environment: NEXT_PUBLIC_API_URL=https://api.oqool.net"
    echo ""
    echo "📝 Useful Commands:"
    echo "• View logs: docker compose logs -f"
    echo "• Restart: docker compose restart"
    echo "• Update: docker compose pull && docker compose up -d"
    echo "• Stop: docker compose down"
}

# Main execution
main() {
    print_step "Starting Oqool AI VPS deployment..."
    
    install_docker
    setup_project
    create_deployment_files
    deploy_application
    verify_deployment
    
    print_success "🚀 Oqool AI API deployment completed successfully!"
}

# Run main function
main "$@"