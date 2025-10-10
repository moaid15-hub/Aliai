#!/bin/bash
# 🔧 Docker Build Troubleshooting Script
# Tests different Dockerfile approaches to fix pydantic-core build issues

set -e

echo "🐳 Docker Build Troubleshooting for pydantic-core issues"
echo "======================================================="

cd "$(dirname "$0")/backend"

# Function to test a dockerfile
test_dockerfile() {
    local dockerfile=$1
    local name=$2
    
    echo ""
    echo "📦 Testing: $name ($dockerfile)"
    echo "--------------------------------"
    
    if docker build -f "$dockerfile" -t "oqool-test-$name" .; then
        echo "✅ SUCCESS: $name build completed!"
        return 0
    else
        echo "❌ FAILED: $name build failed"
        return 1
    fi
}

# Test different approaches in order of preference
echo "Testing Dockerfiles in order of preference..."

# 1. Try minimal approach first (fastest)
if test_dockerfile "Dockerfile.minimal" "minimal"; then
    echo ""
    echo "🎉 SOLUTION FOUND: Use Dockerfile.minimal"
    echo "This uses only essential packages with binary wheels."
    echo ""
    echo "To use this solution:"
    echo "1. Update docker-compose.yml to use: dockerfile: Dockerfile.minimal"
    echo "2. Run: docker compose up -d --build"
    exit 0
fi

# 2. Try Alpine approach
if test_dockerfile "Dockerfile.alpine" "alpine"; then
    echo ""
    echo "🎉 SOLUTION FOUND: Use Dockerfile.alpine" 
    echo "This uses Alpine Linux with better package management."
    echo ""
    echo "To use this solution:"
    echo "1. docker-compose.yml already configured for Alpine"
    echo "2. Run: docker compose up -d --build"
    exit 0
fi

# 3. Try enhanced approach with Rust
if test_dockerfile "Dockerfile" "enhanced"; then
    echo ""
    echo "🎉 SOLUTION FOUND: Use enhanced Dockerfile with Rust"
    echo "This includes full Rust toolchain for compiling pydantic-core."
    echo ""
    echo "To use this solution:"
    echo "1. Update docker-compose.yml to use: dockerfile: Dockerfile"
    echo "2. Run: docker compose up -d --build"
    exit 0
fi

echo ""
echo "❌ ALL BUILDS FAILED"
echo "==================="
echo ""
echo "🔧 Manual Solutions to try:"
echo ""
echo "1. Use pre-built image:"
echo "   docker pull python:3.11-slim"
echo "   docker run -it python:3.11-slim pip install pydantic==2.5.3"
echo ""
echo "2. Try older Python version:"
echo "   Change FROM python:3.11-slim to FROM python:3.10-slim"
echo ""
echo "3. Use different pydantic version:"
echo "   Change pydantic==2.5.3 to pydantic==1.10.12"
echo ""
echo "4. Platform-specific build:"
echo "   docker build --platform=linux/amd64 -f Dockerfile ."

exit 1