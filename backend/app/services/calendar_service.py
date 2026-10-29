import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class CalendarService:
    @staticmethod
    def generate_calendar_link(title: str, description: str, date_str: str) -> str:
        """
        Generates a 1-click Google Calendar Event link.
        """
        clean_title = title.replace(" ", "+")
        clean_desc = description.replace(" ", "+")
        return f"https://calendar.google.com/calendar/render?action=TEMPLATE&text={clean_title}&details={clean_desc}&sf=true&output=xml"

calendar_service = CalendarService()

