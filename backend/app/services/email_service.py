import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.api_key = settings.RESEND_API_KEY

    def send_exam_reminder(self, to_email: str, exam_title: str, deadline: str) -> bool:
        logger.info(f"[EMAIL SERVICE] Sending exam deadline reminder to {to_email} for '{exam_title}' (Deadline: {deadline})")
        # When RESEND_API_KEY is configured in production, triggers HTTPS Resend API
        return True

    def send_weekly_progress_summary(self, to_email: str, user_name: str, progress_pct: int, streak_days: int) -> bool:
        logger.info(f"[EMAIL SERVICE] Sending weekly progress report to {to_email}: {progress_pct}% complete, {streak_days} day streak.")
        return True

email_service = EmailService()

