from pydantic import BaseModel, Field
from typing import List, Optional

class InfoRequest(BaseModel):
    url: str = Field(..., description="URL of the video (YouTube, TikTok, X/Twitter)")

class FormatOption(BaseModel):
    id: str
    label: str
    ext: str
    quality: str
    is_audio_only: bool = False
    is_max: bool = False
    resolution: Optional[str] = None
    note: Optional[str] = None

class MediaInfoResponse(BaseModel):
    url: str
    platform: str # 'youtube', 'tiktok', 'twitter', 'other'
    title: str
    author: str
    thumbnail: Optional[str] = None
    duration: Optional[int] = None
    duration_str: Optional[str] = None
    max_resolution: Optional[str] = None
    formats: List[FormatOption]

class DownloadRequest(BaseModel):
    url: str
    format_id: str = "best_mp4"

class DownloadResponse(BaseModel):
    file_id: str
    filename: str
    download_url: str
    title: str
    filesize: Optional[int] = None
