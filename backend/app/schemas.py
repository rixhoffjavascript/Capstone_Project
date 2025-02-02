from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator, ValidationError
from typing import Optional, List, Dict
from fastapi import HTTPException, status

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str = Field(
        ..., 
        min_length=3, 
        max_length=50, 
        pattern="^[a-zA-Z0-9_]+$", 
        description="Username must be 3-50 characters and contain only letters, numbers, and underscores"
    )
    email: EmailStr = Field(
        ..., 
        description="Must be a valid email address"
    )
    role: str = Field(
        default="customer", 
        pattern="^(customer|employee)$", 
        description="Must be either 'customer' or 'employee'"
    )
    phone: Optional[str] = Field(
        None, 
        pattern=r"^\+?1?\d{9,15}$", 
        description="Optional phone number in international format"
    )
    address: Optional[str] = Field(
        None, 
        max_length=200, 
        description="Optional address"
    )

    @field_validator('email')
    def validate_email(cls, v):
        if '@' not in v or '.' not in v:
            raise ValueError("Please enter a valid email address")
        return v

    @field_validator('role')
    def validate_role(cls, v):
        if v not in ['customer', 'employee']:
            raise ValueError("Role must be either 'customer' or 'employee'")
        return v

    @field_validator('username')
    def validate_username(cls, v):
        if not v.strip():
            raise ValueError("Username is required")
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters long")
        if not v.replace('_', '').isalnum():
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v

class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Password must be at least 8 characters long and meet security requirements"
    )

    @field_validator('password')
    def validate_password(cls, v):
        from app.middlewares.passwordValidation import validate_password
        errors = validate_password(v)
        if errors:
            raise ValueError(errors)
        return v

class User(UserBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class MaterialBase(BaseModel):
    name: str = Field(
        ..., 
        min_length=1, 
        max_length=100, 
        description="Material name is required"
    )
    description: str = Field(
        ..., 
        min_length=1, 
        max_length=500, 
        description="Material description is required"
    )
    price_per_unit: float = Field(
        ..., 
        gt=0, 
        description="Price per unit must be greater than 0"
    )
    unit: str = Field(
        ..., 
        min_length=1, 
        max_length=20, 
        description="Unit of measurement is required (e.g., sq ft, linear ft)"
    )
    stock: int = Field(
        ..., 
        ge=0, 
        description="Stock quantity cannot be negative"
    )

    @field_validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError("Material name is required")
        return v

    @field_validator('description')
    def validate_description(cls, v):
        if not v.strip():
            raise ValueError("Material description is required")
        return v

    @field_validator('price_per_unit')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError("Price per unit must be greater than 0")
        return v

    @field_validator('stock')
    def validate_stock(cls, v):
        if v < 0:
            raise ValueError("Stock quantity cannot be negative")
        return v

    @field_validator('unit')
    def validate_unit(cls, v):
        if not v.strip():
            raise ValueError("Unit of measurement is required")
        return v

class MaterialCreate(MaterialBase):
    pass

class Material(MaterialBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class ServiceBase(BaseModel):
    name: str = Field(
        ..., 
        min_length=1, 
        max_length=100, 
        description="Service name is required"
    )
    description: str = Field(
        ..., 
        min_length=1, 
        max_length=500, 
        description="Service description is required"
    )
    base_price: float = Field(
        ..., 
        gt=0, 
        description="Base price must be greater than 0"
    )

    @field_validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError("Service name is required")
        return v

    @field_validator('description')
    def validate_description(cls, v):
        if not v.strip():
            raise ValueError("Service description is required")
        return v

    @field_validator('base_price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError("Base price must be greater than 0")
        return v

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class PaymentBase(BaseModel):
    amount: float = Field(gt=0, description="Payment amount must be greater than 0")
    currency: str = Field(default="USD", pattern="^(USD|EUR|GBP|CAD)$", description="Currency must be one of: USD, EUR, GBP, CAD")
    
class PaymentCreate(PaymentBase):
    source_id: str = Field(..., description="Payment source identifier")
    verification_token: Optional[str] = Field(None, description="Optional verification token")
    customer_id: Optional[str] = Field(None, description="Optional customer identifier")
    reference_id: Optional[str] = Field(None, description="Optional reference identifier")
    billing_contact: Optional[Dict] = Field(None, description="Optional billing contact information")
    verification_details: Optional[Dict] = Field(None, description="Optional verification details")

class PaymentUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|completed|failed)$")
    receipt_url: Optional[str] = None
    metadata: Optional[Dict] = None

class PaymentResponse(PaymentBase):
    id: int
    payment_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    receipt_url: Optional[str] = None
    payment_metadata: Optional[Dict] = Field(None, alias="payment_data")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class PaymentVerification(BaseModel):
    payment_id: str
    verification_token: str
