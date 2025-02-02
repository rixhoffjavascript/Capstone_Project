
# Flooring CRM System

A comprehensive CRM system for flooring businesses with material management, service scheduling, and secure payment processing.

## Deployment URLs

- Frontend: https://session-recovery-app-2wgd757z.devinapps.com
- Backend API: https://app-zyqywrfy.fly.dev

## Features

- 🔐 Secure Authentication & Authorization
  - Role-based access control (Customer/Employee)
  - JWT token authentication
  - Password validation with security requirements
  - Session management

- 📦 Material Management
  - Add/Remove materials
  - Track inventory
  - Price management
  - Material categorization

- 🛠 Service Management
  - Service creation and management
  - Pricing configuration
  - Service scheduling
  - Employee assignment

- 💳 Payment Processing
  - Secure Square payment integration
  - Payment status tracking
  - Receipt generation
  - Transaction history

- 🎨 Modern UI/UX
  - Responsive design
  - Mobile-friendly interface
  - Real-time validation
  - Loading states and error handling

## Technology Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Square Web Payments SDK
- React Router for navigation

### Backend
- FastAPI (Python)
- PostgreSQL database
- SQLAlchemy ORM
- JWT authentication
- Poetry for dependency management

### Deployment
- Frontend: Static hosting (Render/Netlify)
- Backend: Container deployment (Fly.io)
- Database: Managed PostgreSQL
- NGINX for reverse proxy

## Environment Setup

### Frontend Configuration
```env
# API Configuration
REACT_APP_API_URL=https://app-zyqywrfy.fly.dev

# Frontend Configuration
VITE_APP_URL=https://session-recovery-app-2wgd757z.devinapps.com

# Square Payment Configuration
REACT_APP_SQUARE_APP_ID=your_square_app_id
REACT_APP_SQUARE_LOCATION_ID=your_square_location_id
REACT_APP_SQUARE_ENV=sandbox
```

### Backend Configuration
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/flooring_crm

# Authentication
SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=["*"]

# Environment
ENV=development
PORT=8080
HOST=0.0.0.0
```

## Installation & Setup

### Frontend Setup
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
```

### Backend Setup
```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies
poetry install

# Initialize database
poetry run python migrations/create_tables.py

# Create test user
poetry run python create_test_user.py

# Run development server
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

## Testing

### Backend Tests
```bash
# Run all tests
poetry run pytest

# Run specific test files
poetry run pytest test_endpoints.py
poetry run pytest test_payments.py
```

### Frontend Tests
```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## API Documentation

### Authentication Endpoints
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Material Management
- GET `/api/materials` - List materials
- POST `/api/materials` - Create material
- DELETE `/api/materials/{id}` - Delete material

### Service Management
- GET `/api/services` - List services
- POST `/api/services` - Create service
- DELETE `/api/services/{id}` - Delete service

### Payment Processing
- POST `/api/payments/process` - Process payment
- GET `/api/payments/{id}` - Get payment details
- POST `/api/payments/verify` - Verify payment

## Security Features

- Password Requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
  - No common patterns or repeated characters

- API Security:
  - JWT token authentication
  - Role-based access control
  - Request rate limiting
  - CORS configuration
  - Input validation
  - Error handling

## Deployment

### Frontend Deployment
1. Build the frontend:
```bash
npm run build
```

2. Configure environment variables
3. Deploy to hosting service (Render/Netlify)

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Deploy using Fly.io:
```bash
fly launch
fly deploy
```

## Error Handling

The application implements comprehensive error handling:

- Frontend:
  - Form validation
  - API error handling
  - Network error recovery
  - Loading states
  - User feedback

- Backend:
  - Input validation
  - Database error handling
  - Authentication errors
  - Payment processing errors
  - Rate limiting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT true,
    phone VARCHAR(20),
    address VARCHAR(200)
);
```

### Materials Table
```sql
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
);
```

### Services Table
```sql
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL
);
```

### Payments Table
```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_id VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Caching Configuration

The application implements caching at multiple levels:

### Frontend Caching
- Static assets cached using NGINX with optimal settings
- Browser caching configured with appropriate cache-control headers
- Service worker for offline functionality (PWA-ready)

### API Response Caching
- Response caching for static content
- Cache-Control headers for API responses
- ETags for resource versioning

### NGINX Caching Configuration
```nginx
# Static file caching
location /assets {
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
}

# API response caching
location /api/ {
    proxy_cache api_cache;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    proxy_cache_valid 200 5m;
    proxy_cache_valid 404 1m;
}
```

## License

MIT License - See LICENSE file for details
