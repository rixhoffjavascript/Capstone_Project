from fastapi import HTTPException, Request
from typing import List

SPECIAL_CHARS = "!@#$%^&*(),.?\":{}|<>"

def validate_password(password: str) -> List[str]:
    errors: List[str] = []
    
    if not password:
        errors.append('Password is required')
        return errors

    if len(password) < 8:
        errors.append(f'Password must be at least 8 characters long (currently {len(password)} characters)')
    
    if not any(c.isupper() for c in password):
        errors.append('Password must contain at least one uppercase letter (A-Z)')
    
    if not any(c.islower() for c in password):
        errors.append('Password must contain at least one lowercase letter (a-z)')
    
    if not any(c.isdigit() for c in password):
        errors.append('Password must contain at least one number (0-9)')
    
    if not any(c in SPECIAL_CHARS for c in password):
        errors.append(f'Password must contain at least one special character from: {SPECIAL_CHARS}')
    
    if 'password' in password.lower():
        errors.append('Password cannot contain the word "password" (try using a unique phrase instead)')
    
    import re
    if re.search(r'(.)\1{2,}', password):
        errors.append('Password cannot contain repeated characters (e.g., "aaa" - try mixing different characters)')
    
    if re.match(r'^[A-Z][a-z]+\d+[!@#$%^&*(),.?":{}|<>]?$', password):
        errors.append('Password is too predictable (avoid patterns like "Password123!")')
    
    if password.isdigit():
        errors.append('Password cannot consist of only numbers - mix in letters and special characters')
    
    return errors

async def passwordValidation(request: Request):
    if request.method == "POST":
        try:
            body = await request.json()
            if "password" in body:
                errors = validate_password(body["password"])
                if errors:
                    raise HTTPException(
                        status_code=400,
                        detail={
                            "status": "error",
                            "message": "Password validation failed: " + "; ".join(errors),
                            "errors": errors
                        }
                    )
        except ValueError:
            # If request body cannot be parsed as JSON, let it pass
            # The route handler will handle the validation
            pass
    return None
