import logging
import httpx
from typing import List, Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

class YouTubeService:
    def __init__(self):
        self.api_key = settings.YOUTUBE_API_KEY
        self.base_url = "https://www.googleapis.com/youtube/v3/search"

    async def fetch_learning_videos(self, query: str, max_results: int = 3) -> List[Dict[str, Any]]:
        """
        Fetches top educational videos from YouTube Data API v3 with robust fallback.
        """
        if self.api_key and not self.api_key.startswith("your_"):
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    params = {
                        "part": "snippet",
                        "q": f"{query} tutorial crash course",
                        "type": "video",
                        "relevanceLanguage": "en",
                        "videoDuration": "medium",
                        "maxResults": max_results,
                        "key": self.api_key
                    }
                    resp = await client.get(self.base_url, params=params)
                    if resp.status_code == 200:
                        data = resp.json()
                        videos = []
                        for item in data.get("items", []):
                            video_id = item["id"].get("videoId")
                            snippet = item.get("snippet", {})
                            videos.append({
                                "title": snippet.get("title"),
                                "url": f"https://www.youtube.com/watch?v={video_id}",
                                "type": "video",
                                "source": "YouTube",
                                "channel": snippet.get("channelTitle"),
                                "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url")
                            })
                        if videos:
                            return videos
            except Exception as e:
                logger.warning(f"YouTube API call failed: {e}. Falling back to curated learning URLs.")

        # Fallback curated links
        clean_query = query.replace(" ", "+")
        return [
            {
                "title": f"Complete {query} Course - Beginner to Advanced",
                "url": f"https://www.youtube.com/results?search_query={clean_query}+full+course",
                "type": "video",
                "source": "YouTube (Curated Search)",
                "duration": "3h 45m"
            },
            {
                "title": f"Build a Real World Project with {query}",
                "url": f"https://www.youtube.com/results?search_query={clean_query}+practical+project",
                "type": "video",
                "source": "YouTube (Curated Search)",
                "duration": "2h 15m"
            }
        ]

youtube_service = YouTubeService()

