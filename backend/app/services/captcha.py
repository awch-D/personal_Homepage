import random
import string
import base64
from io import BytesIO
from captcha.image import ImageCaptcha
from typing import Tuple

from app.core.redis import get_redis

class CaptchaService:
    def __init__(self):
        self.image = ImageCaptcha(width=160, height=60)
        self.ttl = 300  # 5 minutes
    
    def generate(self) -> Tuple[str, str, str]:
        """
        Generate a new captcha
        Returns: (captcha_id, code, base64_image)
        """
        # Generate random 4-char code
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        
        # Generate unique ID
        captcha_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=32))
        
        # Generate image
        data = self.image.generate(code)
        
        # Convert to base64
        image_b64 = base64.b64encode(data.read()).decode('utf-8')
        
        return captcha_id, code, f"data:image/png;base64,{image_b64}"
    
    async def save_code(self, captcha_id: str, code: str):
        """Save code to Redis"""
        redis_client = await get_redis()
        # Case insensitive storage
        await redis_client.setex(f"captcha:{captcha_id}", self.ttl, code.lower())
    
    async def verify(self, captcha_id: str, code: str) -> bool:
        """Verify code and delete if valid (one-time use)"""
        if not captcha_id or not code:
            return False
            
        redis_client = await get_redis()
        key = f"captcha:{captcha_id}"
        
        stored_code = await redis_client.get(key)
        if not stored_code:
            return False
            
        # Handle bytes from Redis
        if isinstance(stored_code, bytes):
            stored_code = stored_code.decode("utf-8")
            
        # Verify (case insensitive)
        is_valid = stored_code == code.lower()
        
        # Delete after use (prevent replay)
        await redis_client.delete(key)
        
        return is_valid

captcha_service = CaptchaService()
