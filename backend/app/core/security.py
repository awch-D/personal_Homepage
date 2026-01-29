"""
Security utilities - Prompt injection protection and input sanitization
"""
import re
import hashlib
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Dangerous patterns for prompt injection detection
INJECTION_PATTERNS = [
    r"ignore\s+(previous|above|all)\s+(instructions?|prompts?)",
    r"disregard\s+(previous|above|all)",
    r"forget\s+(everything|all|previous)",
    r"you\s+are\s+now\s+a",
    r"act\s+as\s+(if\s+you\s+are|a)",
    r"pretend\s+(to\s+be|you\s+are)",
    r"system\s*:\s*",
    r"<\|.*?\|>",
]

# Compiled patterns for efficiency
COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]


def check_prompt_injection(text: str) -> bool:
    """
    Check if text contains potential prompt injection patterns
    
    Returns:
        True if injection detected, False otherwise
    """
    for pattern in COMPILED_PATTERNS:
        if pattern.search(text):
            logger.warning(f"Prompt injection detected: {text[:100]}...")
            return True
    return False


def sanitize_input(text: str, max_length: int = 2000) -> str:
    """
    Sanitize user input
    
    - Truncate to max length
    - Remove control characters
    - Strip whitespace
    """
    # Truncate
    if len(text) > max_length:
        text = text[:max_length]
    
    # Remove control characters (except newlines and tabs)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    
    # Strip
    return text.strip()


def mask_content(content: str, max_visible: int = 50) -> str:
    """
    Mask content for safe logging
    
    Shows first N characters + hash suffix
    """
    if len(content) <= max_visible:
        return content
    
    visible = content[:max_visible]
    content_hash = hashlib.md5(content.encode()).hexdigest()[:8]
    return f"{visible}...[{content_hash}]"


class SafeLogger:
    """Logger wrapper that automatically masks sensitive fields"""
    
    SENSITIVE_FIELDS = ["message", "content", "query", "response", "messages"]
    
    def __init__(self, logger_name: str):
        self.logger = logging.getLogger(logger_name)
    
    def _mask_dict(self, data: dict) -> dict:
        """Mask sensitive fields in dict"""
        masked = {}
        for key, value in data.items():
            if key.lower() in self.SENSITIVE_FIELDS:
                if isinstance(value, str):
                    masked[key] = mask_content(value)
                elif isinstance(value, list):
                    masked[key] = f"[{len(value)} items]"
                else:
                    masked[key] = "[masked]"
            else:
                masked[key] = value
        return masked
    
    def info(self, msg: str, **kwargs):
        if kwargs:
            kwargs = self._mask_dict(kwargs)
        self.logger.info(msg, extra=kwargs)
    
    def warning(self, msg: str, **kwargs):
        if kwargs:
            kwargs = self._mask_dict(kwargs)
        self.logger.warning(msg, extra=kwargs)
    
    def error(self, msg: str, **kwargs):
        if kwargs:
            kwargs = self._mask_dict(kwargs)
        self.logger.error(msg, extra=kwargs)
    
    def debug(self, msg: str, **kwargs):
        if kwargs:
            kwargs = self._mask_dict(kwargs)
        self.logger.debug(msg, extra=kwargs)
