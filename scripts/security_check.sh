#!/bin/bash
# ===========================================
# Security Checklist Verification Script
# ===========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check_pass() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}[✗]${NC} $1"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
    ((WARN++))
}

echo "========================================="
echo "Security Checklist Verification"
echo "========================================="
echo ""

# 1. Environment file check
echo "--- Environment Configuration ---"
if [ -f ".env" ]; then
    check_pass ".env file exists"
    
    # Check for placeholder values
    if grep -q "your_strong_password_here" .env 2>/dev/null; then
        check_fail "Database password not changed from default"
    else
        check_pass "Database password configured"
    fi
    
    if grep -q "your_32_char_random_string_here" .env 2>/dev/null; then
        check_fail "ADMIN_API_KEY not configured"
    else
        check_pass "ADMIN_API_KEY configured"
    fi
    
    if grep -q "your_jwt_secret" .env 2>/dev/null; then
        check_fail "JWT_SECRET not configured"
    else
        check_pass "JWT_SECRET configured"
    fi
    
    if grep -q "sk-xxxx" .env 2>/dev/null; then
        check_fail "DASHSCOPE_API_KEY not configured"
    else
        check_pass "DASHSCOPE_API_KEY configured"
    fi
else
    check_fail ".env file not found"
fi

echo ""
echo "--- File Permissions ---"

# Check script permissions
for script in scripts/*.sh; do
    if [ -x "$script" ]; then
        check_pass "$script is executable"
    else
        check_warn "$script is not executable (run: chmod +x $script)"
    fi
done

echo ""
echo "--- SSL Configuration ---"

if [ -f "nginx/ssl/fullchain.pem" ] && [ -f "nginx/ssl/privkey.pem" ]; then
    check_pass "SSL certificates present"
    
    # Check certificate expiry
    EXPIRY=$(openssl x509 -enddate -noout -in nginx/ssl/fullchain.pem 2>/dev/null | cut -d= -f2)
    if [ -n "$EXPIRY" ]; then
        EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$EXPIRY" +%s 2>/dev/null)
        NOW_EPOCH=$(date +%s)
        DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
        if [ $DAYS_LEFT -lt 30 ]; then
            check_warn "SSL certificate expires in $DAYS_LEFT days"
        else
            check_pass "SSL certificate valid for $DAYS_LEFT days"
        fi
    fi
else
    check_warn "SSL certificates not found (needed for production)"
fi

echo ""
echo "--- Docker Configuration ---"

if command -v docker &> /dev/null; then
    check_pass "Docker installed"
    
    if docker compose version &> /dev/null; then
        check_pass "Docker Compose available"
    else
        check_fail "Docker Compose not available"
    fi
else
    check_fail "Docker not installed"
fi

echo ""
echo "--- Nginx Configuration ---"

if [ -f "nginx/conf.d/default.conf" ]; then
    check_pass "Nginx site config exists"
    
    if grep -q "limit_req" nginx/conf.d/default.conf; then
        check_pass "Rate limiting configured"
    else
        check_warn "Rate limiting not found in Nginx config"
    fi
    
    if grep -q "X-Frame-Options" nginx/conf.d/default.conf; then
        check_pass "Security headers configured"
    else
        check_warn "Security headers not found"
    fi
else
    check_fail "Nginx site config not found"
fi

echo ""
echo "--- Code Security ---"

if grep -q "check_prompt_injection" backend/app/api/chat.py 2>/dev/null; then
    check_pass "Prompt injection protection enabled"
else
    check_warn "Prompt injection protection not found in chat.py"
fi

if grep -q "sanitize_input" backend/app/api/chat.py 2>/dev/null; then
    check_pass "Input sanitization enabled"
else
    check_warn "Input sanitization not found in chat.py"
fi

if [ -f "backend/app/core/security.py" ]; then
    check_pass "Security module exists"
else
    check_fail "Security module not found"
fi

echo ""
echo "========================================="
echo "Summary"
echo "========================================="
echo -e "${GREEN}Passed:${NC} $PASS"
echo -e "${RED}Failed:${NC} $FAIL"
echo -e "${YELLOW}Warnings:${NC} $WARN"
echo ""

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}❌ Security check FAILED. Please fix the issues above.${NC}"
    exit 1
elif [ $WARN -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Security check passed with warnings.${NC}"
    exit 0
else
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    exit 0
fi
