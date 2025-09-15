from sqlmodel import create_engine, SQLModel, Session, text
from dotenv import load_dotenv
import os
from app.models.workflow import Workflow

# Load environment variables from .env
load_dotenv()

# Fetch variables
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")
DATABASE_URL = f"postgresql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"


engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("DATABASE_ECHO", "false").lower() == "true",
    pool_pre_ping=True,
    pool_recycle=3600,
)


def create_db_and_tables():
    try:
        SQLModel.metadata.create_all(engine)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        raise


def get_session():
    return Session(engine)


def test_connection():
    try:
        with Session(engine) as session:
            # Try a simple query
            result = session.exec(text("SELECT version()")).first()
            print("✅ Database connection successful!")
            print(f"Connected to: {HOST}:{PORT}/{DBNAME}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print(f"Attempted connection to: {HOST}:{PORT}/{DBNAME}")
        return False


if __name__ == "__main__":
    print("Testing database connection...")
    if test_connection():
        print("\n🎉 Connection successful! Creating tables...")
        create_db_and_tables()
    else:
        print("\n❌ Connection failed. Check your .env file and Supabase settings.")
