#!/bin/bash
# ===========================================
# PostgreSQL Database Restore Script
# ===========================================
# Usage: ./restore_db.sh <backup_file>

set -e

# Configuration
DB_CONTAINER="homepage-postgres"
DB_NAME="homepage"
DB_USER="arno"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

# Check arguments
if [ -z "$1" ]; then
    log_error "Usage: $0 <backup_file>"
    echo "Available backups:"
    ls -lh /data/backups/postgres/*.sql.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Verify backup integrity
log_info "Verifying backup file..."
if ! gunzip -t "$BACKUP_FILE" 2>/dev/null; then
    log_error "Backup file is corrupted!"
    exit 1
fi
log_info "Backup file verified"

# Confirm restore
log_warn "This will OVERWRITE the current database!"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    log_info "Restore cancelled"
    exit 0
fi

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    log_error "Container $DB_CONTAINER is not running!"
    exit 1
fi

log_info "Starting restore from: $BACKUP_FILE"

# Drop existing connections
log_info "Terminating existing connections..."
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
    2>/dev/null || true

# Drop and recreate database
log_info "Recreating database..."
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Enable pgvector extension
log_info "Enabling pgvector extension..."
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Restore from backup
log_info "Restoring data..."
gunzip -c "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    log_info "Restore completed successfully!"
else
    log_error "Restore failed!"
    exit 1
fi

# Verify restore
log_info "Verifying restore..."
TABLES=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
log_info "Found $TABLES tables in restored database"

# Check embeddings count
EMBEDDINGS=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM embeddings;" 2>/dev/null || echo "0")
log_info "Embeddings count: $EMBEDDINGS"

log_info "========================================="
log_info "Restore Summary"
log_info "========================================="
log_info "Backup: $BACKUP_FILE"
log_info "Database: $DB_NAME"
log_info "Tables: $TABLES"
log_info "Embeddings: $EMBEDDINGS"
log_info "========================================="

# Clear Redis cache
log_info "Clearing Redis cache..."
docker exec homepage-redis redis-cli FLUSHDB 2>/dev/null || log_warn "Failed to clear Redis cache"

log_info "Restore process completed!"
