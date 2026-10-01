import os
import tempfile
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_DIR = Path(os.environ.get("MEDIA_DIR", BASE_DIR / "downloads"))
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

# Cache lifetime
CACHE_MAX_AGE_SECONDS = int(os.environ.get("CACHE_MAX_AGE_SECONDS", 20 * 60)) # 20 minutes

# Try to get ffmpeg path from imageio-ffmpeg
FFMPEG_PATH = None
try:
    import imageio_ffmpeg
    FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    pass

# Host and Port
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", 8000))
