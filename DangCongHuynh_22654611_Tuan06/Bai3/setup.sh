#!/bin/bash

# ============================================
# Project Setup Script
# Service-Based Architecture with Spring Boot
# ============================================

set -e

echo "========================================="
echo "Setting up Service-Based Architecture"
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ Docker is not installed${NC}"
    echo "Please install Docker from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose found${NC}"

# Navigate to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "\n${BLUE}Building and starting services...${NC}"

# Build and start services
docker-compose build
docker-compose up -d

echo -e "\n${GREEN}✓ Services started${NC}"

echo -e "${BLUE}Waiting for services to be ready...${NC}"
sleep 30

# Check if services are running
if docker-compose ps | grep -q "running"; then
    echo -e "${GREEN}✓ All services are running${NC}"
else
    echo -e "${YELLOW}⚠ Some services may not be running${NC}"
    docker-compose ps
fi

echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Backend API: http://localhost:8080/api/tasks"
echo "2. Database: localhost:5432 (user: postgres, password: postgres)"
echo "3. View logs: docker-compose logs -f"
echo "4. For more info: see README.md or QUICKSTART.md"

echo -e "\n${YELLOW}To stop services: docker-compose down${NC}"
echo -e "${YELLOW}To stop and remove data: docker-compose down -v${NC}"
