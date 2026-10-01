import uvicorn
from app.config import HOST, PORT

if __name__ == "__main__":
    # reload=False is essential so file downloads into downloads/ do not trigger server reloads
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=False)
