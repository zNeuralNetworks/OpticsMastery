#!/bin/bash
set -e

# Optics Master Docker Control Script
# Usage: ./docker-control.sh [start|stop|logs|stats|update|rebuild]

CONTAINER_NAME="optics-master"
IMAGE_NAME="optics-master:latest"
HOST_PORT="${HOST_PORT:-${PORT:-8080}}"
CONTAINER_PORT="${CONTAINER_PORT:-8080}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}→${NC} $1"
}

start_container() {
    print_info "Starting Optics Master on host port $HOST_PORT..."
    
    # Check if already running
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_error "Container already running"
        return 1
    fi
    
    # Check if stopped container exists
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_info "Removing stopped container..."
        docker rm "$CONTAINER_NAME"
    fi
    
    # Run container
    docker run -d \
        --name "$CONTAINER_NAME" \
        -p "$HOST_PORT:$CONTAINER_PORT" \
        -e "PORT=$CONTAINER_PORT" \
        --restart unless-stopped \
        "$IMAGE_NAME"
    
    # Wait for health check
    sleep 3
    
    # Verify health
    if curl -s http://localhost:$HOST_PORT > /dev/null 2>&1; then
        print_status "Container started successfully"
        print_info "Access at: http://localhost:$HOST_PORT"
    else
        print_error "Container may not have started properly. Check logs with: $0 logs"
        return 1
    fi
}

stop_container() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_error "Container not running"
        return 1
    fi
    
    print_info "Stopping container..."
    docker stop "$CONTAINER_NAME"
    docker rm "$CONTAINER_NAME"
    print_status "Container stopped"
}

view_logs() {
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_error "Container does not exist"
        return 1
    fi
    
    print_info "Showing logs (Ctrl+C to exit)..."
    docker logs -f "$CONTAINER_NAME"
}

view_stats() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_error "Container not running"
        return 1
    fi
    
    print_info "Container statistics:"
    docker stats --no-stream "$CONTAINER_NAME"
}

update_image() {
    print_info "Pulling latest image..."
    docker pull "$IMAGE_NAME"
    print_status "Image updated"
    
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_info "Restarting container with new image..."
        stop_container
        start_container
    fi
}

rebuild_image() {
    print_info "Building Docker image..."
    
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found in current directory"
        return 1
    fi
    
    docker build -t "$IMAGE_NAME" -f Dockerfile .
    print_status "Image built successfully"
    
    print_info "Restart container to apply changes: $0 start"
}

status_container() {
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_status "Container is running"
        
        # Show health
        HEALTH=$(docker inspect "$CONTAINER_NAME" --format='{{.State.Health.Status}}' 2>/dev/null || echo "N/A")
        print_info "Health status: $HEALTH"
        
        # Show port
        PORT_INFO=$(docker port "$CONTAINER_NAME" 2>/dev/null | head -1)
        print_info "Port mapping: $PORT_INFO"
        
        # Show access URL
        print_info "Access at: http://localhost:$HOST_PORT"
    elif docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_error "Container exists but is stopped"
        print_info "To start: $0 start"
    else
        print_error "Container does not exist"
        print_info "To start: $0 start"
    fi
}

# Main
case "${1:-status}" in
    start)
        start_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        stop_container 2>/dev/null || true
        start_container
        ;;
    logs)
        view_logs
        ;;
    stats)
        view_stats
        ;;
    update)
        update_image
        ;;
    rebuild)
        rebuild_image
        ;;
    status)
        status_container
        ;;
    *)
        echo "Optics Master Docker Control"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start       - Start container (default host port 8080)"
        echo "  stop        - Stop and remove container"
        echo "  restart     - Restart container"
        echo "  logs        - View container logs (live)"
        echo "  stats       - Show container resource usage"
        echo "  status      - Show container status"
        echo "  update      - Pull latest image and restart"
        echo "  rebuild     - Rebuild image from Dockerfile"
        echo ""
        echo "Examples:"
        echo "  $0 start                 # Start container"
        echo "  $0 logs                  # View live logs"
        echo "  $0 stop                  # Stop container"
        echo "  HOST_PORT=3000 $0 start  # Serve locally at http://localhost:3000"
        echo "  CONTAINER_PORT=9090 $0 start # Override container listen port"
        echo ""
        exit 1
        ;;
esac
