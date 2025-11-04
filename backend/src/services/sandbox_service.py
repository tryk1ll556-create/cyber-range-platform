import uuid
from datetime import datetime
from models.sandbox import Sandbox

# Временная "база данных"
sandboxes_db = []
logs_db = []

class SandboxService:
    @staticmethod
    def create_sandbox(name: str, type: str, difficulty: str) -> Sandbox:
        sandbox_id = str(uuid.uuid4())[:8]
        
        new_sandbox = Sandbox(
            id=sandbox_id,
            name=name,
            status="created", 
            url=f"http://sandbox-{sandbox_id}.localhost",
            created_at=datetime.now(),
            type=type,
            difficulty=difficulty
        )
        
        sandboxes_db.append(new_sandbox)
        
        # Логируем создание
        logs_db.append({
            "sandbox_id": sandbox_id,
            "message": f"Песочница '{name}' создана",
            "timestamp": datetime.now().isoformat(),
            "level": "INFO"
        })
        
        return new_sandbox
    
    @staticmethod
    def get_all_sandboxes():
        return sandboxes_db
    
    @staticmethod
    def get_sandbox_by_id(sandbox_id: str):
        for sandbox in sandboxes_db:
            if sandbox.id == sandbox_id:
                return sandbox
        return None
    
    @staticmethod
    def get_logs():
        return logs_db