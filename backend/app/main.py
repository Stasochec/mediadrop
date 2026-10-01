import asyncio
import logging
from urllib.parse import quote
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from .config import MEDIA_DIR, HOST, PORT
from .models.schemas import InfoRequest, MediaInfoResponse, DownloadRequest, DownloadResponse
from .services.extractor import extract_media_info, download_media
from .services.cleaner import cleanup_expired_files

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("mediadrop.main")

# Mapping of file_id to original download names
FILE_METADATA_STORE = {}

async def periodic_cleaner_task():
    """Runs cache cleanup every 5 minutes."""
    while True:
        try:
            await asyncio.sleep(300)
            cleaned = cleanup_expired_files()
            if cleaned > 0:
                logger.info(f"Periodic cleaner removed {cleaned} expired files.")
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in periodic cleaner: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure media dir exists and start background cleaner loop
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    cleaner_task = asyncio.create_task(periodic_cleaner_task())
    logger.info("MediaDrop API started successfully.")
    yield
    # Shutdown: cancel background cleaner loop
    cleaner_task.cancel()
    try:
        await cleaner_task
    except asyncio.CancelledError:
        pass
    logger.info("MediaDrop API shutdown completed.")

app = FastAPI(
    title="MediaDrop API",
    description="Universal Video Downloader API for YouTube, TikTok, and X/Twitter",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local dev, web, and capacitor apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "MediaDrop Universal Downloader",
        "version": "1.0.0"
    }

@app.post("/api/info", response_model=MediaInfoResponse)
async def get_info(request: InfoRequest):
    """Parses video metadata and all available qualities from given URL."""
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL не может быть пустым.")

    try:
        # Run blocking yt-dlp extractor in worker thread
        info = await asyncio.to_thread(extract_media_info, url)
        return info
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.exception("Unexpected error in /api/info")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении информации: {str(e)}")

@app.post("/api/download", response_model=DownloadResponse)
async def download_endpoint(request: DownloadRequest, background_tasks: BackgroundTasks):
    """Downloads requested media in non-blocking thread and returns streaming URL."""
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL не может быть пустым.")

    # Schedule background cache cleanup on downloads
    background_tasks.add_task(cleanup_expired_files)

    try:
        # Run blocking yt-dlp download in worker thread
        saved_file, title, final_name = await asyncio.to_thread(download_media, url, request.format_id)
        file_id = saved_file.stem
        FILE_METADATA_STORE[file_id] = final_name

        file_size = saved_file.stat().st_size if saved_file.exists() else None

        return DownloadResponse(
            file_id=file_id,
            filename=final_name,
            download_url=f"/api/stream/{file_id}",
            title=title,
            filesize=file_size
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.exception("Unexpected error in /api/download")
        raise HTTPException(status_code=500, detail=f"Не удалось скачать видео: {str(e)}")

@app.get("/api/stream/{file_id}")
async def stream_file(file_id: str):
    """Streams downloaded file with Content-Disposition attachment."""
    matched = list(MEDIA_DIR.glob(f"{file_id}.*"))
    if not matched or not matched[0].exists():
        raise HTTPException(status_code=404, detail="Файл не найден или срок его хранения истёк.")

    file_path = matched[0]
    filename = FILE_METADATA_STORE.get(file_id, file_path.name)
    encoded_filename = quote(filename)

    ext = file_path.suffix.lower()
    media_types = {
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mp3": "audio/mpeg",
        ".m4a": "audio/mp4",
        ".wav": "audio/wav"
    }
    media_type = media_types.get(ext, "application/octet-stream")

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
