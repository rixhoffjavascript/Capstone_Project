"""Database migration script for creating tables with IDENTITY columns."""
import os
import sys
import logging
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError, ProgrammingError

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, logger
from app.models import Base

def create_tables():
    """Create database tables with proper IDENTITY columns."""
    try:
        # Drop existing tables first
        logger.info("Dropping existing tables...")
        Base.metadata.drop_all(bind=engine)
        
        # Create all tables using SQLAlchemy models
        logger.info("Creating tables using SQLAlchemy models...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Verify table creation
        inspector = inspect(engine)
        for table_name in inspector.get_table_names():
            logger.info(f"\nTable {table_name} structure:")
            for column in inspector.get_columns(table_name):
                logger.info(f"  {column['name']}: {column['type']} "
                          f"(nullable: {column['nullable']}, "
                          f"default: {column.get('default')})")
            
            for index in inspector.get_indexes(table_name):
                logger.info(f"  Index: {index['name']} "
                          f"(unique: {index['unique']}, "
                          f"columns: {index['column_names']})")
                
            for fk in inspector.get_foreign_keys(table_name):
                logger.info(f"  Foreign key: {fk['name']} "
                          f"(columns: {fk['constrained_columns']}, "
                          f"references: {fk['referred_table']}.{fk['referred_columns']})")
                
        return True
        
    except SQLAlchemyError as e:
        logger.error(f"Error creating tables: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise

if __name__ == "__main__":
    create_tables()
