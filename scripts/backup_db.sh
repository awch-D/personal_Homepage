#!/bin/bash
# ===========================================
# PostgreSQL Database Backup Script
# ===========================================
# Usage: ./backup_db.sh [full|manual]

set -e

# Configuration
BACKUP_DIR="/data/backups/postgres"
DB_CONTAINER="homepage-postgres"
DB_NAME="homepage"
DB_USER="arno"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_TYPE="${1:-full}"

# Aliyun OSS configuration (requires ossutil)
OSS_BUCKET="${OSS_BUCKET:-}"
OSS_PATH="postgres-backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup filename
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${BACKUP_TYPE}_${DATE}.sql.gz"

log_info "Starting backup: $BACKUP_FILE"

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    log_error "Container $DB_CONTAINER is not running!"
    exit 1
fi

# Execute backup
log_info "Dumping database..."
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --format=plain --no-owner | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_info "Backup completed: $BACKUP_FILE ($BACKUP_SIZE)"
else
    log_error "Backup failed!"
    exit 1
fi

# Verify backup integrity
log_info "Verifying backup integrity..."
if ! gunzip -t "$BACKUP_FILE" 2>/dev/null; then
    log_error "Backup file is corrupted!"
    exit 1
fi
log_info "Backup verification passed"

# Upload to OSS (optional)
if [ -n "$OSS_BUCKET" ] && command -v ossutil64 &> /dev/null; then
    log_info "Uploading to OSS..."
    ossutil64 cp "$BACKUP_FILE" "${OSS_BUCKET}/${OSS_PATH}/" --force
    if [ $? -eq 0 ]; then
        log_info "OSS upload completed"
    else
        log_warn "OSS upload failed, backup still saved locally"
    fi
fi

# Cleanup old backups
log_info "Cleaning up backups older than $RETENTION_DAYS days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
log_info "Deleted $DELETED_COUNT old backup(s)"

# Summary
log_info "========================================="
log_info "Backup Summary"
log_info "========================================="
log_info "File: $BACKUP_FILE"
log_info "Size: $BACKUP_SIZE"
log_info "Type: $BACKUP_TYPE"
log_info "Retention: $RETENTION_DAYS days"
log_info "========================================="

echo "[$(date)] Backup completed successfully"
