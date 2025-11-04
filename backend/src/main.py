from fastapi import FastAPI
from datetime import datetime
import uuid

app = FastAPI(
    title="Cyber Range Platform",
    version="1.0.0"
)

# Простое хранилище в памяти
sandboxes = []
logs = []

@app.get("/")
def read_root():
    return {
        "message": "Кибербезопасность - это круто! 🚀",
        "status": "Сервер работает",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/sandbox/create")
def create_sandbox():
    sandbox_id = str(uuid.uuid4())[:8]
    
    new_sandbox = {
        "id": sandbox_id,
        "name": f"Уязвимое приложение {sandbox_id}",
        "status": "created",
        "url": f"http://sandbox-{sandbox_id}.localhost",
        "created_at": datetime.now().isoformat()
    }
    
    sandboxes.append(new_sandbox)
    
    # Добавляем лог
    log_entry = {
        "sandbox_id": sandbox_id,
        "message": f"Песочница {sandbox_id} создана",
        "timestamp": datetime.now().isoformat(),
        "level": "INFO"
    }
    logs.append(log_entry)
    
    return {
        "success": True,
        "sandbox": new_sandbox,
        "message": "Песочница создана успешно!"
    }

@app.get("/sandboxes")
def get_sandboxes():
    return {
        "count": len(sandboxes),
        "sandboxes": sandboxes
    }

@app.get("/logs")
def get_logs():
    return {
        "count": len(logs),
        "logs": logs
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Запуск сервера
if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Сервер запущен!")
    print("📚 Документация: http://localhost:8000/docs")
    print("🛑 Остановка: Ctrl+C")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)