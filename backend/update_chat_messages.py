import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.database import SessionLocal
from app.models.chat import ChatMessage
from app.models.user import User

def main():
    db = SessionLocal()
    # Update all users to Astro if they were Arjun
    users = db.query(User).all()
    for u in users:
        if "arjun" in u.full_name.lower():
            u.full_name = "Astro"
            u.email = "astro@pathfinder.ai"
            print(f"Updated user {u.id} to Astro")
    
    # Update any chat messages mentioning Arjun
    msgs = db.query(ChatMessage).all()
    for m in msgs:
        if "Arjun" in m.content:
            m.content = m.content.replace("Arjun", "Astro")
            print(f"Updated ChatMessage {m.id}")
            
    db.commit()
    db.close()
    print("Database message & user update done.")

if __name__ == "__main__":
    main()
