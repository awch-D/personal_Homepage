#!/bin/bash
# ===========================================
# Deployment Script
# ===========================================
# Usage: ./deploy.sh [start|stop|restart|status|logs]

set -e

# Configuration
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Check environment file
check_env() {
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        log_error ".env file not found!"
        log_info "Copy from template: cp .env.example .env"
        exit 1
    fi
}

# Start services
start() {
    check_env
    log_info "Starting services..."
    docker compose -f "$COMPOSE_FILE" up -d
    log_info "Waiting for services to be ready..."
    sleep 5
    status
}

# Stop services
stop() {
    log_info "Stopping services..."
    docker compose -f "$COMPOSE_FILE" down
    log_info "Services stopped"
}

# Restart services
restart() {
    log_info "Restarting services..."
    docker compose -f "$COMPOSE_FILE" restart
    sleep 3
    status
}

# Show status
status() {
    echo -e "\n${BLUE}=== Service Status ===${NC}\n"
    docker compose -f "$COMPOSE_FILE" ps
    
    echo -e "\n${BLUE}=== Health Check ===${NC}\n"
    
    # Check backend health
    if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
        log_info "Backend: ${GREEN}Healthy${NC}"
    else
        log_warn "Backend: ${RED}Unhealthy${NC}"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_info "Frontend: ${GREEN}Healthy${NC}"
    else
        log_warn "Frontend: ${RED}Unhealthy${NC}"
    fi
    
    # Check database
    if docker exec homepage-postgres pg_isready -U arno > /dev/null 2>&1; then
        log_info "Database: ${GREEN}Healthy${NC}"
    else
        log_warn "Database: ${RED}Unhealthy${NC}"
    fi
    
    # Check Redis
    if docker exec homepage-redis redis-cli ping > /dev/null 2>&1; then
        log_info "Redis: ${GREEN}Healthy${NC}"
    else
        log_warn "Redis: ${RED}Unhealthy${NC}"
    fi
    
    echo ""
}

# Show logs
logs() {
    SERVICE="${2:-}"
    if [ -n "$SERVICE" ]; then
        docker compose -f "$COMPOSE_FILE" logs -f "$SERVICE"
    else
        docker compose -f "$COMPOSE_FILE" logs -f
    fi
}

# Build images
build() {
    log_info "Building images..."
    docker compose -f "$COMPOSE_FILE" build
    log_info "Build completed"
}

# Import profile data
import_profile() {
    log_info "Importing profile data..."
    docker compose -f "$COMPOSE_FILE" exec backend python scripts/import_profile.py
}

# Usage
usage() {
    echo "Usage: $0 {start|stop|restart|status|logs|build|import}"
    echo ""
    echo "Commands:"
    echo "  start    - Start all services"
    echo "  stop     - Stop all services"
    echo "  restart  - Restart all services"
    echo "  status   - Show service status and health"
    echo "  logs     - Show logs (optional: service name)"
    echo "  build    - Build Docker images"
    echo "  import   - Import profile data"
    exit 1
}

# Main
case "${1:-}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs "$@"
        ;;
    build)
        build
        ;;
    import)
        import_profile
        ;;
    *)
        usage
        ;;
esac
