import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine, SessionLocal
from app.services.seed_data import seed_database

def main():
    print("Creating tables in database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("Seeding careers, skills, exams, scholarships, and admin user...")
        seed_database(db)
        print("Database seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    main()

