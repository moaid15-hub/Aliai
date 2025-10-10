from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Supabase PostgreSQL connection
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# بناء connection string من Supabase
# Format: postgresql://postgres:[password]@[host]:5432/postgres
DATABASE_URL = os.getenv("DATABASE_URL") or f"postgresql://postgres.jeheolxkyitotuljezkp:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()