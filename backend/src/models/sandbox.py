from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Sandbox(BaseModel):
    id: str
    name: str
    status: str
    url: str
    created_at: datetime
    type: str = "vulnerable-webapp"
    difficulty: str = "beginner"

class SandboxCreate(BaseModel):
    name: str
    type: str = "vulnerable-webapp"
    difficulty: str = "beginner"