import logging
import os
import sys
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, Request, HTTPException, Depends, status
from pydantic import ValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import text, and_, or_
from sqlalchemy.exc import SQLAlchemyError, OperationalError
from typing import List, Optional
from datetime import datetime, timedelta

# Configure logging for database operations
def log_db_error(e: Exception):
    """Log database errors with proper context"""
    logger.error(f"Database error: {str(e)}", exc_info=True)
    return HTTPException(
        status_code=503,
        detail={
            "status": "unhealthy",
            "message": "Database connection failed",
            "error": str(e)
        }
    )

from .models import User, Material, Service, Payment
from .schemas import (
    UserCreate, User as UserSchema,
    MaterialCreate, Material as MaterialSchema,
    ServiceCreate, Service as ServiceSchema,
    Token, TokenData,
    PaymentCreate, PaymentResponse, PaymentVerification
)

from .database import (
    engine, Base, get_db, SessionLocal,
    DB_POOL_SIZE, DB_MAX_OVERFLOW,
    DB_POOL_TIMEOUT, DB_POOL_RECYCLE
)
from .auth import (
    create_access_token,
    get_current_active_user,
    get_password_hash,
    verify_password,
    create_user,
    get_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from .middlewares.passwordValidation import validate_password

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Flooring CRM API",
    description="Backend API for Flooring CRM System",
    version="1.0.0"
)

# Configure CORS with specific origins
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://flooring-crm-frontend.onrender.com")
ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Local development
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    FRONTEND_URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin"],
    expose_headers=["Content-Type"],
    max_age=3600
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.utcnow()
    response = await call_next(request)
    end_time = datetime.utcnow()
    duration = (end_time - start_time).total_seconds() * 1000
    logger.info(
        f"Path: {request.url.path} "
        f"Method: {request.method} "
        f"Status: {response.status_code} "
        f"Duration: {duration:.2f}ms"
    )
    return response

@app.on_event("startup")
async def startup_event():
    try:
        # Get port from environment variable with better error handling
        try:
            port = int(os.environ.get("PORT", "8080"))
            if port <= 0:
                raise ValueError("Port must be a positive integer")
        except ValueError as e:
            logger.error(f"Invalid PORT environment variable: {str(e)}")
            port = 8080  # Fallback to default port
            
        host = os.environ.get("HOST", "0.0.0.0")
        env = os.environ.get("ENV", "production")
        
        # Log startup information
        logger.info("=== Application Startup ===")
        logger.info(f"Environment: {env}")
        logger.info(f"Host: {host}")
        logger.info(f"Port: {port}")
        logger.info(f"Process ID: {os.getpid()}")
        logger.info(f"Python Version: {sys.version}")
        logger.info(f"CORS origins: {ALLOWED_ORIGINS}")
        logger.info(f"Database URL: {os.getenv('DATABASE_URL', 'sqlite:///./flooring.db')}")
        
        # Create database tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Log deployment URLs
        logger.info("\n=== Deployment URLs ===")
        logger.info(f"Frontend URL: {FRONTEND_URL}")
        logger.info(f"Backend URL: {os.getenv('BACKEND_URL', 'Not configured')}")
        
        # Verify port binding
        logger.info("\n=== Port Binding ===")
        logger.info(f"Binding to: {host}:{port}")
        if "PORT" in os.environ:
            logger.info(f"Using PORT from environment: {os.environ['PORT']}")
        else:
            logger.warning("No PORT environment variable found, using default")
            
    except Exception as e:
        logger.error(f"Startup error: {str(e)}", exc_info=True)
        logger.error("Application startup failed - check configuration")
        raise

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "status": "healthy",
        "message": "Flooring CRM API is running",
        "docs_url": "/docs",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/healthz")
@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint for monitoring"""
    try:
        # Simple database connection test
        result = db.execute(text("SELECT 1")).scalar()
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "healthy",
                "message": "Service is operational",
                "version": "1.0.0",
                "environment": os.getenv("ENV", "production"),
                "timestamp": datetime.utcnow().isoformat(),
                "database": {
                    "status": "healthy",
                    "type": "postgresql",
                    "pool": {
                        "size": DB_POOL_SIZE,
                        "max_overflow": DB_MAX_OVERFLOW,
                        "timeout": DB_POOL_TIMEOUT,
                        "recycle": DB_POOL_RECYCLE
                    }
                }
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=200,
            content={
                "status": "degraded",
                "message": "Service is experiencing issues",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )



@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Validate role first
        if user.role not in ['customer', 'employee']:
            raise HTTPException(
                status_code=400,
                detail={
                    "status": "error",
                    "message": "Invalid role",
                    "errors": ["Role must be either 'customer' or 'employee'"]
                }
            )
        
        # Validate email format
        if '@' not in user.email or '.' not in user.email:
            raise HTTPException(
                status_code=400,
                detail={
                    "status": "error",
                    "message": "Invalid email format",
                    "errors": ["Please enter a valid email address"]
                }
            )
        
        # Check if username exists
        if get_user(db, user.username):
            raise HTTPException(
                status_code=400,
                detail={
                    "status": "error",
                    "message": "Registration failed",
                    "errors": ["Username is already registered. Please choose a different username."]
                }
            )
        
        # Check if email exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail={
                    "status": "error",
                    "message": "Registration failed",
                    "errors": ["Email is already registered. Please use a different email or login to your existing account."]
                }
            )
        
        # Validate username format
        if not user.username.strip() or len(user.username) < 3:
            raise HTTPException(
                status_code=400,
                detail={
                    "status": "error",
                    "message": "Invalid username",
                    "errors": ["Username must be at least 3 characters long"]
                }
            )
        
        if not user.username.replace('_', '').isalnum():
            raise HTTPException(
                status_code=400,
                detail={
                    "status": "error",
                    "message": "Invalid username",
                    "errors": ["Username can only contain letters, numbers, and underscores"]
                }
            )
        
        # Validate password last (since it's the most likely to fail)
        password_errors = validate_password(user.password)
        if password_errors:
            raise HTTPException(
                status_code=400,
                detail={
                    "status": "error",
                    "message": "Password validation failed",
                    "errors": password_errors
                }
            )
        
        # Create user
        db_user = create_user(db, user)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": db_user.username},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except ValidationError as e:
        # Handle Pydantic validation errors
        errors = []
        for error in e.errors():
            if error["type"] == "value_error.email":
                errors.append("Please enter a valid email address")
            elif error["type"] == "value_error.missing":
                field = error["loc"][-1]
                errors.append(f"{field.title()} is required")
            else:
                errors.append(error["msg"])
        
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": "Validation failed",
                "errors": errors
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "An unexpected error occurred during registration",
                "errors": ["Please try again later. If the problem persists, contact support."]
            }
        )

@app.post("/api/auth/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user and return access token"""
    try:
        # Validate required fields
        if not form_data.username or not form_data.username.strip():
            raise HTTPException(
                status_code=400,
                detail={
                    "status": "error",
                    "message": "Validation failed",
                    "errors": ["Username is required"]
                }
            )
        
        if not form_data.password or not form_data.password.strip():
            raise HTTPException(
                status_code=400,
                detail={
                    "status": "error",
                    "message": "Validation failed",
                    "errors": ["Password is required"]
                }
            )
        
        # Get user
        user = get_user(db, form_data.username)
        if not user:
            raise HTTPException(
                status_code=401,
                detail={
                    "status": "error",
                    "message": "Incorrect username or password",
                    "path": "/api/auth/login"
                }
            )
        
        # Verify password
        if not verify_password(form_data.password, str(user.hashed_password)):
            raise HTTPException(
                status_code=401,
                detail={
                    "status": "error",
                    "message": "Incorrect username or password",
                    "path": "/api/auth/login"
                }
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user.username},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "An unexpected error occurred during login",
                "errors": ["Please try again later. If the problem persists, contact support."]
            }
        )

@app.get("/api/auth/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user info"""
    return current_user

@app.get("/api/materials", response_model=List[MaterialSchema])
async def list_materials(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all materials with optional search and pagination"""
    query = db.query(Material)
    if search:
        search_filter = or_(
            Material.name.ilike(f"%{search}%"),
            Material.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    return query.offset(skip).limit(limit).all()

@app.post("/api/materials", response_model=MaterialSchema)
async def create_material(
    material: MaterialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new material (employee only)"""
    try:
        if str(current_user.role) != "employee":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "status": "error",
                    "message": "Permission denied",
                    "errors": ["Only employees can create materials. Please contact your administrator for access."]
                }
            )
        
        # Validate material data
        validation_errors = []
        if material.price_per_unit <= 0:
            validation_errors.append("Price per unit must be greater than 0")
        
        if material.stock < 0:
            validation_errors.append("Stock quantity cannot be negative")
            
        if not material.name.strip():
            validation_errors.append("Material name is required")
            
        if not material.description.strip():
            validation_errors.append("Material description is required")
            
        if not material.unit.strip():
            validation_errors.append("Unit of measurement is required")
            
        if validation_errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "status": "error",
                    "message": "Invalid material data",
                    "errors": validation_errors
                }
            )
        
        # Check for duplicate name
        existing_material = db.query(Material).filter(Material.name == material.name).first()
        if existing_material:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "status": "error",
                    "message": "Duplicate material",
                    "errors": ["A material with this name already exists. Please use a different name."]
                }
            )
        
        # Create material
        db_material = Material(
            name=material.name,
            description=material.description,
            price_per_unit=material.price_per_unit,
            unit=material.unit,
            stock=material.stock
        )
        
        db.add(db_material)
        db.commit()
        db.refresh(db_material)
        return db_material
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating material: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating material: {str(e)}"
        )

@app.get("/api/services", response_model=List[ServiceSchema])
async def list_services(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all services with optional search and pagination"""
    query = db.query(Service)
    if search:
        search_filter = or_(
            Service.name.ilike(f"%{search}%"),
            Service.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    return query.offset(skip).limit(limit).all()

@app.post("/api/services", response_model=ServiceSchema)
async def create_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new service (employee only)"""
    try:
        if str(current_user.role) != "employee":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "status": "error",
                    "message": "Permission denied",
                    "errors": ["Only employees can create services. Please contact your administrator for access."]
                }
            )
        
        # Validate service data
        validation_errors = []
        if service.base_price <= 0:
            validation_errors.append("Base price must be greater than 0")
            
        if not service.name.strip():
            validation_errors.append("Service name is required")
            
        if not service.description.strip():
            validation_errors.append("Service description is required")
            
        if validation_errors:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "status": "error",
                    "message": "Invalid service data",
                    "errors": validation_errors
                }
            )
        
        # Check for duplicate name
        existing_service = db.query(Service).filter(Service.name == service.name).first()
        if existing_service:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "status": "error",
                    "message": "Duplicate service",
                    "errors": ["A service with this name already exists. Please use a different name."]
                }
            )
        
        # Create service
        db_service = Service(
            name=service.name,
            description=service.description,
            base_price=service.base_price
        )
        
        db.add(db_service)
        db.commit()
        db.refresh(db_service)
        return db_service
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating service: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating service: {str(e)}"
        )

from fastapi.exceptions import RequestValidationError
from fastapi.security import OAuth2PasswordRequestForm

@app.exception_handler(RequestValidationError)
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError | RequestValidationError):
    """Global exception handler for Pydantic and FastAPI validation errors"""
    errors = []
    
    # Convert ValidationError to list of errors
    validation_errors = exc.errors() if isinstance(exc, ValidationError) else exc.errors()
    
    # Handle form validation errors first
    if isinstance(exc, RequestValidationError):
        form_errors = []
        for error in validation_errors:
            loc_str = str(error["loc"])
            if "form_data" in loc_str:
                if "username" in loc_str:
                    form_errors.append("Username is required")
                elif "password" in loc_str:
                    form_errors.append("Password is required")
        if form_errors:
            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "message": "Validation failed",
                    "errors": form_errors
                }
            )
    
    # Process other validation errors
    for error in validation_errors:
        # Get field name from error location
        field_parts = [str(loc) for loc in error["loc"] if loc != "body"]
        field_name = field_parts[-1] if field_parts else ""
        
        # Convert field name to label, handling numeric indices
        try:
            field_label = field_name.replace('_', ' ').title() if isinstance(field_name, str) else "Input"
        except AttributeError:
            field_label = "Input"
        
        # Handle different error types
        error_type = error.get("type", "")
        
        if error_type == "missing":
            errors.append(f"{field_label} is required")
            
        elif error_type == "value_error.email":
            errors.append("Please enter a valid email address")
            
        elif error_type == "value_error.missing":
            errors.append(f"{field_label} is required")
            
        elif error_type in ["greater_than", "greater_than_equal"]:
            ctx = error.get("ctx", {})
            limit = ctx.get("gt", ctx.get("ge", 0))
            if field_name == "price_per_unit":
                errors.append("Price per unit must be greater than 0")
            elif field_name == "base_price":
                errors.append("Base price must be greater than 0")
            elif field_name == "stock":
                errors.append("Stock quantity cannot be negative")
            elif field_name == "amount":
                errors.append("Payment amount must be greater than 0")
            else:
                if "greater than" in error["msg"]:
                    errors.append(f"{field_label} must be greater than {limit}")
                else:
                    errors.append(f"{field_label} cannot be negative")
                
        elif error_type == "string_pattern_mismatch":
            if field_name == "role":
                errors.append("Role must be either 'customer' or 'employee'")
            elif field_name == "currency":
                errors.append("Currency must be one of: USD, EUR, GBP, CAD")
            elif field_name == "username":
                errors.append("Username can only contain letters, numbers, and underscores")
            elif field_name == "phone":
                errors.append("Please enter a valid phone number")
            else:
                errors.append(error.get("msg", f"Invalid {field_label.lower()} format"))
                
        elif error_type == "string_too_short":
            min_length = error.get("ctx", {}).get("min_length", "")
            errors.append(f"{field_label} must be at least {min_length} characters long")
            
        elif error_type == "string_too_long":
            max_length = error.get("ctx", {}).get("max_length", "")
            errors.append(f"{field_label} cannot be longer than {max_length} characters")
            
        elif error_type == "value_error.any_str.min_length":
            min_length = error.get("ctx", {}).get("limit_value", "")
            errors.append(f"{field_label} must be at least {min_length} characters long")
            
        elif error_type == "value_error.any_str.max_length":
            max_length = error.get("ctx", {}).get("limit_value", "")
            errors.append(f"{field_label} cannot be longer than {max_length} characters")
            
        else:
            # Use custom error message if available, otherwise format the default message
            message = error.get("msg", "").replace("Value error, ", "").replace("String should", "Must")
            if message:
                # Clean up common validation messages
                message = message.replace("ensure this value", field_label)
                message = message.replace("str type", field_label)
                errors.append(message)

    # Deduplicate errors while preserving order
    seen = set()
    unique_errors = []
    for error in errors:
        if error not in seen:
            seen.add(error)
            unique_errors.append(error)

    return JSONResponse(
        status_code=400,
        content={
            "status": "error",
            "message": "Validation failed",
            "errors": unique_errors
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Global exception handler for HTTP exceptions"""
    if isinstance(exc.detail, dict) and "errors" in exc.detail:
        # Preserve custom error format if it exists
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": str(exc.detail),
            "path": request.url.path
        }
    )

@app.delete("/api/materials/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a material (employee only)"""
    if str(current_user.role) != "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employees can delete materials"
        )
    
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Material not found"
        )
    
    db.delete(material)
    db.commit()
    return None

@app.delete("/api/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a service (employee only)"""
    if str(current_user.role) != "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employees can delete services"
        )
    
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    db.delete(service)
    db.commit()
    return None

@app.post("/api/payments/process", response_model=PaymentResponse)
async def process_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Process a payment for services or materials"""
    try:
        # Validate payment amount
        if payment.amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment amount must be greater than 0"
            )
        
        # Generate unique payment ID
        payment_id = f"pay_{int(datetime.utcnow().timestamp())}_{current_user.id}"
        
        try:
            # Create payment record
            db_payment = Payment(
                payment_id=payment_id,
                amount=payment.amount,
                currency=payment.currency,
                status="pending",
                user_id=current_user.id,
                payment_data={
                    "source_id": payment.source_id,
                    "customer_id": payment.customer_id,
                    "reference_id": payment.reference_id,
                    "billing_contact": payment.billing_contact,
                    "verification_details": payment.verification_details
                }
            )
            
            db.add(db_payment)
            db.commit()
            db.refresh(db_payment)
            
            # In a real application, you would integrate with a payment processor here
            # For now, we'll simulate a successful payment
            # Update payment record with new values
            db.query(Payment).filter(Payment.id == db_payment.id).update({
                Payment.status: "completed",
                Payment.receipt_url: f"https://receipts.example.com/{payment_id}",
                Payment.updated_at: datetime.utcnow()
            })
            db.commit()
            db.refresh(db_payment)
            
            logger.info(f"Payment processed successfully: {payment_id}")
            return db_payment
            
        except SQLAlchemyError as e:
            logger.error(f"Database error processing payment: {str(e)}")
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error occurred while processing payment"
            )
        except Exception as e:
            logger.error(f"Unexpected error processing payment: {str(e)}")
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred while processing payment"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment processing error: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing the payment. Please try again later."
        )

@app.get("/api/payments/{payment_id}", response_model=PaymentResponse)
async def get_payment_status(
    payment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get payment status"""
    payment = db.query(Payment).filter(
        Payment.payment_id == payment_id,
        Payment.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    return payment

@app.post("/api/payments/verify", response_model=PaymentResponse)
async def verify_payment(
    verification: PaymentVerification,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Verify a payment"""
    payment = db.query(Payment).filter(
        Payment.payment_id == verification.payment_id,
        Payment.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # In a real application, verify the payment with the payment processor
    # For now, we'll simulate verification
    db.query(Payment).filter(Payment.id == payment.id).update({
        Payment.status: "completed",
        Payment.updated_at: datetime.utcnow()
    })
    db.commit()
    db.refresh(payment)
    
    return payment



@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unexpected errors"""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "An unexpected error occurred",
            "path": request.url.path
        }
    )
