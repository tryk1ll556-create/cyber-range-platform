from fastapi import APIRouter, HTTPException
from models.sandbox import SandboxCreate
from services.sandbox_service import SandboxService

router = APIRouter()

@router.post("/sandboxes")
def create_sandbox(sandbox_data: SandboxCreate):
    sandbox = SandboxService.create_sandbox(
        name=sandbox_data.name,
        type=sandbox_data.type,
        difficulty=sandbox_data.difficulty
    )
    return {
        "success": True,
        "sandbox": sandbox,
        "message": "Песочница создана успешно!"
    }

@router.get("/sandboxes")
def get_sandboxes():
    sandboxes = SandboxService.get_all_sandboxes()
    return {
        "count": len(sandboxes),
        "sandboxes": sandboxes
    }

@router.get("/sandboxes/{sandbox_id}")
def get_sandbox(sandbox_id: str):
    sandbox = SandboxService.get_sandbox_by_id(sandbox_id)
    if not sandbox:
        raise HTTPException(status_code=404, detail="Песочница не найдена")
    return sandbox

@router.delete("/sandboxes/{sandbox_id}")
def delete_sandbox(sandbox_id: str):
    # Здесь будет логика удаления
    return {"message": f"Песочница {sandbox_id} удалена", "success": True}