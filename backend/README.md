# Flooring CRM Backend

Professional Flooring Company Management System Backend built with FastAPI and PostgreSQL.

## Environment Configuration

### Database Settings
```env
# WARNING: Never commit actual database credentials. Use environment variables!
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>

# Database Pool Configuration
DB_POOL_SIZE=<pool_size>          # Maximum number of database connections in the pool
DB_MAX_OVERFLOW=<max_overflow>    # Maximum number of connections that can be created beyond pool_size
DB_POOL_TIMEOUT=<timeout>         # Seconds to wait before giving up on getting a connection from the pool
DB_POOL_RECYCLE=<recycle_time>    # Seconds after which a connection is automatically recycled
```

### Server Settings
```env
# Configure these based on your deployment environment
PORT=<port>               # Server port (e.g., 8080)
HOST=<host>              # Server host (e.g., 0.0.0.0)
ENV=<environment>        # Environment (development/production)
```

### Security Settings
```env
# CRITICAL: Generate strong unique values for production!
# Never use default values or share these credentials
SECRET_KEY=<your_generated_secret_key>
ACCESS_TOKEN_EXPIRE_MINUTES=<expiry_time>
```

> ⚠️ **Security Warning**: 
> - Never commit real credentials or secrets to version control
> - Generate strong, unique secrets for production environments
> - Use environment variables to manage sensitive configuration
> - Regularly rotate credentials and access tokens

## Deployment

The application is deployed on Render.com with separate services for frontend and backend. The deployment configurations are defined in:

- Backend: `render.yaml` in the root directory
- Frontend: `render.yaml` in the frontend directory

### Service URLs
- Frontend: https://flooring-crm-frontend.onrender.com
- Backend API: https://flooring-crm-api.onrender.com

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT signing key (auto-generated)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT token expiry (default: 30)
- `DB_POOL_SIZE`: Database connection pool size (default: 5)
- `DB_MAX_OVERFLOW`: Maximum pool overflow (default: 10)
- `DB_POOL_TIMEOUT`: Pool timeout in seconds (default: 30)
- `DB_POOL_RECYCLE`: Connection recycle time in seconds (default: 1800)

### Health Check
The application provides a health check endpoint at `/healthz` that verifies:
- Database connectivity
- Connection pool status
- Application configuration

## Database Schema

The database schema for the Flooring CRM system is documented in:

- `docs/database_schema.dbml` - DBML format for visualization tools
- `docs/database_schema.md` - Detailed documentation with diagrams and validation rules

Core entities:
- Users (customers and employees)
- Materials (inventory items)
- Services (offered services)

View the complete documentation in the docs directory for entity relationships, field constraints, and validation rules.

## Health Check Endpoint

The `/healthz` endpoint provides detailed system health information including:
- Database connection status
- Database pool configuration
- Server environment details
- Timestamp

Example response:
```json
{
    "status": "healthy",
    "message": "Service is operational",
    "version": "1.0.0",
    "environment": "production",
    "timestamp": "2024-01-31T12:00:00.000Z",
    "database": {
        "status": "connected",
        "type": "postgresql",
        "pool": {
            "status": "connected",
            "type": "postgresql",
            "host": "your-db-host",
            "pool_size": 5,
            "max_overflow": 10,
            "pool_timeout": 30,
            "pool_recycle": 1800
        }
    }
}
```

## Deployment

### Heroku Deployment
1. Set up environment variables in Heroku:
   ```bash
   heroku config:set DATABASE_URL=your_database_url
   heroku config:set SECRET_KEY=your_secret_key
   heroku config:set DB_POOL_SIZE=5
   heroku config:set DB_MAX_OVERFLOW=10
   heroku config:set DB_POOL_TIMEOUT=30
   heroku config:set DB_POOL_RECYCLE=1800
   ```

2. Deploy to Heroku:
   ```bash
   git push heroku main
   ```

3. Verify deployment:
   ```bash
   curl https://your-app-name.herokuapp.com/healthz
   ```

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/flooring-crm-backend.git
   cd flooring-crm-backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   poetry install
   ```

4. Set up environment variables:
   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

5. Run the development server:
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

## Testing

Run tests with:
```bash
poetry run pytest
```

## Caching Configuration

The application uses Redis for caching with the following configuration:

```env
REDIS_URL=redis://localhost:6379/0  # Redis connection URL
REDIS_TTL=3600                      # Cache TTL in seconds
```

### Cache Keys and Patterns
- `materials:{id}` - Individual material cache
- `services:{id}` - Individual service cache
- `user:{id}` - User profile cache
- `catalog:*` - Product catalog cache pattern

### Cache Invalidation
Cache entries are automatically invalidated:
- On resource updates
- When TTL expires
- Through admin panel manual purge

## Client-Side Routing

The frontend application uses React Router for client-side routing. Key routes:

```typescript
// Public Routes
/                   - Home page
/login              - User login
/register           - User registration
/shop-by-room       - Room-based shopping
/project-gallery    - Project showcase
/design-services    - Design consultation
/request-quote      - Quote request form

// Protected Routes (requires authentication)
/account            - User account management
/manage-materials   - Material management (employee only)
/manage-services    - Service management (employee only)
```

### Route Protection
- Authentication state managed via localStorage
- Role-based access control (customer/employee)
- Automatic redirect to login for protected routes

### Deployment Configuration
The frontend deployment includes proper routing configuration:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This ensures proper handling of client-side routes in production.

## License

Copyright © 2024 Flooring CRM. All rights reserved.
