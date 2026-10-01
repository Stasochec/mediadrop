import os
import time
import logging
from pathlib import Path
from ..config import MEDIA_DIR, CACHE_MAX_AGE_SECONDS

logger = logging.getLogger("mediadrop.cleaner")

def cleanup_expired_files() -> int:
    """Removes downloaded media files older than CACHE_MAX_AGE_SECONDS (20 minutes)."""
    now = time.time()
    deleted_count = 0
    if not MEDIA_DIR.exists():
        return 0

    for file_path in MEDIA_DIR.iterdir():
        if file_path.is_file():
            try:
                mtime = file_path.stat().st_mtime
                if now - mtime > CACHE_MAX_AGE_SECONDS:
                    file_path.unlink()
                    deleted_count += 1
                    logger.info(f"Cleaned up expired file: {file_path.name}")
            except Exception as e:
                logger.warning(f"Failed to delete {file_path}: {e}")
    return deleted_count
