import os
import re
import uuid
import logging
from urllib.parse import urlparse
from pathlib import Path
from typing import Tuple, Dict, Any, List, Optional
import yt_dlp
from ..config import MEDIA_DIR, FFMPEG_PATH
from ..models.schemas import FormatOption, MediaInfoResponse

logger = logging.getLogger("mediadrop.extractor")

def detect_platform(url: str) -> str:
    """Detects video platform from URL."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if any(d in domain for d in ["youtube.com", "youtu.be"]):
            return "youtube"
        elif any(d in domain for d in ["tiktok.com"]):
            return "tiktok"
        elif any(d in domain for d in ["twitter.com", "x.com"]):
            return "twitter"
        else:
            return "other"
    except Exception:
        return "other"

def format_duration(seconds: Optional[int]) -> Optional[str]:
    """Converts seconds into readable string HH:MM:SS or MM:SS."""
    if not seconds or seconds < 0:
        return None
    mins, secs = divmod(int(seconds), 60)
    hours, mins = divmod(mins, 60)
    if hours > 0:
        return f"{hours:02d}:{mins:02d}:{secs:02d}"
    return f"{mins:02d}:{secs:02d}"

def sanitize_filename(name: str) -> str:
    """Sanitizes filename for safe header and filesystem storage."""
    clean = re.sub(r'[\\/*?:"<>|]', "", name)
    clean = clean.strip()
    return clean[:100] if clean else "media"

def get_base_ydl_opts() -> dict:
    opts: Dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "socket_timeout": 30,
        "updatetime": False,       # Critical for Windows: prevents [Errno 22] from invalid remote timestamps
        "no_part": True,          # Prevents antivirus locking .part files on Windows
        "nocheckcertificate": True,
        "restrictfilenames": True,
        "windowsfilenames": True,
    }
    if FFMPEG_PATH:
        opts["ffmpeg_location"] = FFMPEG_PATH
    return opts

def get_resolution_label(height: int) -> Tuple[str, str]:
    """Returns human-friendly quality label and note for a given pixel height."""
    if height >= 2160:
        return "4K Ultra HD", "3840x2160 (4K)"
    elif height >= 1440:
        return "2K QHD", "2560x1440 (2K)"
    elif height >= 1080:
        return "Full HD", "1920x1080 (1080p)"
    elif height >= 720:
        return "HD 720p", "1280x720 (720p)"
    elif height >= 480:
        return "SD 480p", "854x480 (480p)"
    elif height >= 360:
        return "360p", "640x360 (360p)"
    else:
        return f"{height}p", f"{height}p"

def extract_media_info(url: str) -> MediaInfoResponse:
    """Extracts metadata and real available resolutions without downloading."""
    platform = detect_platform(url)
    ydl_opts = get_base_ydl_opts()

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
        except yt_dlp.utils.DownloadError as e:
            logger.error(f"DownloadError extracting info for {url}: {e}")
            raise ValueError(f"Не удалось извлечь видео: {str(e)}")
        except Exception as e:
            logger.error(f"Error extracting info for {url}: {e}")
            raise ValueError(f"Ошибка при анализе ссылки: {str(e)}")

    if not info:
        raise ValueError("Метаданные не найдены по указанной ссылке.")

    title = info.get("title") or info.get("description") or "Медиафайл"
    if len(title) > 90:
        title = title[:87] + "..."

    author = info.get("uploader") or info.get("channel") or info.get("creator") or platform.capitalize()
    thumbnail = info.get("thumbnail")
    duration = info.get("duration")
    duration_str = format_duration(duration)

    # Inspect all available video streams to find real resolutions
    raw_formats = info.get("formats", [])
    available_heights = set()

    for fmt in raw_formats:
        h = fmt.get("height")
        vcodec = fmt.get("vcodec")
        if h and h > 0 and vcodec != "none":
            available_heights.add(h)

    # Standard bucket filtering: keep only standard target resolutions that are <= actual available max
    standard_targets = [2160, 1440, 1080, 720, 480, 360]
    matched_heights = []

    if available_heights:
        max_h = max(available_heights)
        for target in standard_targets:
            if target <= max_h:
                matched_heights.append(target)
        if not matched_heights:
            matched_heights.append(max_h)
    else:
        matched_heights = [1080, 720]

    matched_heights = sorted(list(set(matched_heights)), reverse=True)
    max_height = matched_heights[0] if matched_heights else 1080

    formats: List[FormatOption] = []

    for idx, h in enumerate(matched_heights):
        label, res_note = get_resolution_label(h)
        is_max = (idx == 0)
        note = "Максимальное качество (Оригинал)" if is_max else f"MP4 видео • {res_note}"

        formats.append(
            FormatOption(
                id=f"video_{h}",
                label=f"MP4 • {label}",
                ext="mp4",
                quality=f"{h}p",
                is_audio_only=False,
                is_max=is_max,
                resolution=res_note,
                note=note
            )
        )

    # Always add audio option (MP3)
    formats.append(
        FormatOption(
            id="mp3_audio",
            label="MP3 • Только аудио",
            ext="mp3",
            quality="320 kbps",
            is_audio_only=True,
            is_max=False,
            resolution=None,
            note="Оригинальная звуковая дорожка / музыка"
        )
    )

    max_res_label = f"{max_height}p ({get_resolution_label(max_height)[0]})"

    return MediaInfoResponse(
        url=url,
        platform=platform,
        title=title,
        author=author,
        thumbnail=thumbnail,
        duration=int(duration) if duration else None,
        duration_str=duration_str,
        max_resolution=max_res_label,
        formats=formats
    )

def download_media(url: str, format_id: str = "video_1080") -> Tuple[Path, str, str]:
    """
    Downloads media file using POSIX outtmpl and sanitized options to avoid [Errno 22].
    Returns (saved_file_path, original_title, final_filename).
    """
    file_id = uuid.uuid4().hex[:12]
    # Use forward slashes (as_posix) on Windows to prevent \b escaping errors ([Errno 22])
    out_template = f"{MEDIA_DIR.as_posix()}/{file_id}.%(ext)s"

    ydl_opts = get_base_ydl_opts()
    ydl_opts["outtmpl"] = out_template

    if format_id == "mp3_audio":
        ydl_opts["format"] = "bestaudio/best"
        if FFMPEG_PATH:
            ydl_opts["postprocessors"] = [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "320",
            }]
    elif format_id.startswith("video_"):
        try:
            target_h = int(format_id.replace("video_", ""))
            # Priority:
            # 1. Existing progressive mp4 <= target_h (fast direct download)
            # 2. Split video <= target_h + best audio
            # 3. Best overall
            ydl_opts["format"] = (
                f"best[height<={target_h}][ext=mp4]/"
                f"best[height<={target_h}]/"
                f"bestvideo[height<={target_h}][ext=mp4]+bestaudio[ext=m4a]/"
                f"bestvideo[height<={target_h}]+bestaudio/"
                f"best[height<={target_h}]/"
                f"best"
            )
        except ValueError:
            ydl_opts["format"] = "best[ext=mp4]/best/bestvideo+bestaudio"
        if FFMPEG_PATH:
            ydl_opts["merge_output_format"] = "mp4"
    else: # best_mp4 or fallback
        ydl_opts["format"] = "best[ext=mp4]/best/bestvideo+bestaudio"
        if FFMPEG_PATH:
            ydl_opts["merge_output_format"] = "mp4"

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=True)
        except Exception as e:
            logger.error(f"Download failed for {url}: {e}")
            raise ValueError(f"Ошибка при скачивании: {str(e)}")

    raw_title = info.get("title") or "video"
    clean_title = sanitize_filename(raw_title)

    # Locate the saved file by file_id prefix
    matched_files = list(MEDIA_DIR.glob(f"{file_id}.*"))
    if not matched_files:
        raise FileNotFoundError("Скачанный файл не найден на сервере.")

    saved_file = matched_files[0]
    final_ext = saved_file.suffix.lstrip(".")
    final_download_name = f"{clean_title}.{final_ext}"

    return saved_file, raw_title, final_download_name
