import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.database import SessionLocal
from app.models.user import User

def main():
    db = SessionLocal()
    users = db.query(User).all()
    print("Found users:")
    for u in users:
        print(f"ID: {u.id}, Email: {u.email}, Name: {u.full_name}, Role: {u.role}")
        # Update any Arjun Verma or demo user to Astro
        if "arjun" in u.email.lower() or "arjun" in u.full_name.lower():
            u.full_name = "Astro"
            u.email = "astro@pathfinder.ai"
            print(f"-> Updated user {u.id} to name 'Astro' and email 'astro@pathfinder.ai'")

    # Ensure there is an astro user
    astro_user = db.query(User).filter(User.full_name == "Astro").first()
    if not astro_user:
        # Check if there is any non-admin user
        normal_user = db.query(User).filter(User.role == "user").first()
        if normal_user:
            normal_user.full_name = "Astro"
            normal_user.email = "astro@pathfinder.ai"
            print(f"-> Renamed user {normal_user.id} to Astro")

    db.commit()
    db.close()
    print("User update complete.")

if __name__ == "__main__":
    main()
