"""
Серверная часть интегрированной платформы для управления процессами
оценки защищенности веб-приложений и образовательным контентом

Выполнил: Зеленов Артём Владимирович
Группа: 4-10ЗС-1
Руководитель: Большаков Сергей Владимирович
Год: 2026
Тема: Разработка серверной части интегрированной платформы для управления
процессами оценки защищенности веб-приложений и образовательным контентом
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid
import json
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Импортируем нашу базу данных
from database import get_db, UserModel, SandboxModel, ContentModel, LogModel

# ============== МОДЕЛИ PYDANTIC (для API) ==============


class UserBase(BaseModel):
    """Базовая модель пользователя для API"""

    username: str
    email: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """Модель для создания пользователя"""

    password: str


class User(UserBase):
    """Полная модель пользователя для ответов API"""

    id: str
    role: str
    created_at: datetime
    last_active: datetime
    experience_points: int
    completed_labs: List[str]

    class Config:
        from_attributes = True  # Позволяет работать с SQLAlchemy моделями


class SandboxBase(BaseModel):
    """Базовая модель песочницы"""

    name: str
    description: Optional[str] = None
    difficulty: str = "beginner"  # beginner, intermediate, advanced
    type: str = "webapp"  # webapp, api, database, network
    tags: List[str] = []
    image: str = "vulnerable-webapp:latest"


class SandboxCreate(SandboxBase):
    """Модель для создания песочницы"""

    pass


class Sandbox(SandboxBase):
    """Полная модель песочницы для ответов API"""

    id: str
    status: str  # created, starting, running, stopping, stopped, error
    url: Optional[str] = None
    container_id: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    stopped_at: Optional[datetime] = None
    owner_id: str
    vulnerabilities: List[str]  # Список уязвимостей в песочнице
    access_count: int

    class Config:
        from_attributes = True


class LogEntry(BaseModel):
    """Модель лога"""

    id: str
    user_id: Optional[str] = None
    sandbox_id: Optional[str] = None
    action: str
    timestamp: datetime
    details: Optional[str] = None

    class Config:
        from_attributes = True


# ============== СОЗДАНИЕ ПРИЛОЖЕНИЯ ==============

app = FastAPI(
    title="CyberRange Platform",
    description="""
    Интегрированная платформа для управления процессами оценки защищенности 
    веб-приложений и образовательным контентом.
    
    Разработано в рамках выпускной квалификационной работы
    Студент: Зеленов Артём Владимирович
    Группа: 4-10ЗС-1
    Руководитель: Большаков Сергей Владимирович
    Год: 2026
    """,
    version="1.0.0",
    contact={"name": "Зеленов Артём Владимирович", "group": "4-10ЗС-1", "year": 2026},
)

# Разрешаем запросы с других доменов (для фронтенда)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене заменить на конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==============


def generate_sandbox_url(sandbox_id: str) -> str:
    """Генерирует URL для доступа к песочнице"""
    return f"http://localhost:8080/sandbox/{sandbox_id}"


def log_action(
    db: Session,
    action: str,
    user_id: str = None,
    sandbox_id: str = None,
    details: str = None,
):
    """
    Запись лога в базу данных
    """
    # Создаем словарь с данными, исключая None значения
    log_data = {
        "id": str(uuid.uuid4())[:8],
        "action": action,
        "timestamp": datetime.now(),
    }

    # Добавляем поля только если они не None
    if user_id is not None:
        log_data["user_id"] = user_id
    if sandbox_id is not None:
        log_data["sandbox_id"] = sandbox_id
    if details is not None:
        log_data["details"] = details

    # Создаем объект лога
    log = LogModel(**log_data)

    db.add(log)
    db.commit()


# ============== ЭНДПОЙНТЫ ДЛЯ ПРОВЕРКИ ==============


@app.get("/")
def read_root():
    """Главная страница API"""
    return {
        "message": "CyberRange Platform API",
        "student": "Зеленов Артём Владимирович",
        "group": "4-10ЗС-1",
        "topic": "Разработка серверной части интегрированной платформы для управления процессами оценки защищенности веб-приложений и образовательным контентом",
        "supervisor": "Большаков Сергей Владимирович",
        "year": 2026,
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "docs": "/docs",
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Проверка подключения к базе данных"""
    try:
        # Пробуем выполнить простой запрос
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.now().isoformat(),
    }


# ============== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ==============


@app.post("/users/register", response_model=User, status_code=201)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""

   # Проверяем, нет ли уже такого пользователя
existing = db.query(UserModel).filter(
    (UserModel.username == user_data.username) | 
    (UserModel.email == user_model.email)
).first()

if existing:
    raise HTTPException(
        status_code=400,
        detail="Пользователь с таким именем или email уже существует"
    )
  # Создаем нового пользователя
new_user = UserModel(
    id=str(uuid.uuid4())[:8],
    username=user_data.username,
    email=user_data.email,
    full_name=user_data.full_name,
    password_hash=user_data.password,  # В реальном проекте нужно хешировать!
    role="student",
    created_at=datetime.now(),
    last_active=datetime.now(),
    experience_points=0,
    completed_labs="[]"  # ← ИСПРАВЛЕНО: строка, а не список
)

    # Сохраняем в базу
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Логируем действие
    log_action(
        db,
        "user_registered",
        new_user.id,
        None,
        f"Регистрация пользователя {user_data.username}",
    )

    # Преобразуем JSON строку обратно в список для ответа
    user_dict = {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "role": new_user.role,
        "created_at": new_user.created_at,
        "last_active": new_user.last_active,
        "experience_points": new_user.experience_points,
        "completed_labs": json.loads(new_user.completed_labs),
    }

    return user_dict


@app.get("/users", response_model=List[dict])
def get_all_users(db: Session = Depends(get_db)):
    """Список всех пользователей"""
    users = db.query(UserModel).all()
    result = []

    for user in users:
        user_dict = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "created_at": user.created_at,
            "last_active": user.last_active,
            "experience_points": user.experience_points,
            "completed_labs": json.loads(user.completed_labs),
        }
        result.append(user_dict)

    return result


@app.get("/users/{user_id}", response_model=dict)
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Получить пользователя по ID"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    user_dict = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "created_at": user.created_at,
        "last_active": user.last_active,
        "experience_points": user.experience_points,
        "completed_labs": json.loads(user.completed_labs),
    }

    return user_dict


# ============== УПРАВЛЕНИЕ ПЕСОЧНИЦАМИ ==============


@app.post("/sandboxes", response_model=dict, status_code=201)
def create_sandbox(
    sandbox_data: SandboxCreate, owner_id: str = "guest", db: Session = Depends(get_db)
):
    """Создание новой песочницы (уязвимого веб-приложения)"""

    sandbox_id = str(uuid.uuid4())[:8]

    # Предустановленные уязвимости для разных типов песочниц
    vuln_map = {
        "webapp": ["SQL Injection", "XSS", "CSRF", "IDOR", "File Inclusion"],
        "api": [
            "Broken Authentication",
            "Mass Assignment",
            "Injection",
            "Rate Limiting",
        ],
        "database": ["Weak Passwords", "Unencrypted Data", "Privilege Escalation"],
        "network": ["Open Ports", "Weak Protocols", "Misconfiguration"],
    }

    # Создаем новую песочницу
    new_sandbox = SandboxModel(
        id=sandbox_id,
        name=sandbox_data.name,
        description=sandbox_data.description,
        difficulty=sandbox_data.difficulty,
        type=sandbox_data.type,
        tags=json.dumps(sandbox_data.tags),
        image=sandbox_data.image,
        status="created",
        created_at=datetime.now(),
        owner_id=owner_id,
        vulnerabilities=json.dumps(vuln_map.get(sandbox_data.type, ["Unknown"])),
        access_count=0,
    )

    # Сохраняем в базу
    db.add(new_sandbox)
    db.commit()
    db.refresh(new_sandbox)

    # Логируем
    log_action(
        db,
        "sandbox_created",
        owner_id,
        sandbox_id,
        f"Создана песочница {sandbox_data.name}",
    )

    # Преобразуем JSON поля обратно в списки для ответа
    sandbox_dict = {
        "id": new_sandbox.id,
        "name": new_sandbox.name,
        "description": new_sandbox.description,
        "difficulty": new_sandbox.difficulty,
        "type": new_sandbox.type,
        "tags": json.loads(new_sandbox.tags) if new_sandbox.tags else [],
        "image": new_sandbox.image,
        "status": new_sandbox.status,
        "url": new_sandbox.url,
        "container_id": new_sandbox.container_id,
        "created_at": new_sandbox.created_at,
        "started_at": new_sandbox.started_at,
        "stopped_at": new_sandbox.stopped_at,
        "owner_id": new_sandbox.owner_id,
        "vulnerabilities": (
            json.loads(new_sandbox.vulnerabilities)
            if new_sandbox.vulnerabilities
            else []
        ),
        "access_count": new_sandbox.access_count,
    }

    return sandbox_dict


@app.post("/sandboxes/{sandbox_id}/start")
def start_sandbox(sandbox_id: str, db: Session = Depends(get_db)):
    """Запуск песочницы"""
    sandbox = db.query(SandboxModel).filter(SandboxModel.id == sandbox_id).first()

    if not sandbox:
        raise HTTPException(status_code=404, detail="Песочница не найдена")

    # Обновляем статус
    sandbox.status = "running"
    sandbox.started_at = datetime.now()
    sandbox.url = generate_sandbox_url(sandbox_id)
    sandbox.container_id = (
        f"container_{sandbox_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    )

    db.commit()
    db.refresh(sandbox)

    # Логируем
    log_action(
        db, "sandbox_started", sandbox.owner_id, sandbox_id, "Песочница запущена"
    )

    return {
        "success": True,
        "sandbox_id": sandbox_id,
        "status": "running",
        "url": sandbox.url,
    }


@app.post("/sandboxes/{sandbox_id}/stop")
def stop_sandbox(sandbox_id: str, db: Session = Depends(get_db)):
    """Остановка песочницы"""
    sandbox = db.query(SandboxModel).filter(SandboxModel.id == sandbox_id).first()

    if not sandbox:
        raise HTTPException(status_code=404, detail="Песочница не найдена")

    # Обновляем статус
    sandbox.status = "stopped"
    sandbox.stopped_at = datetime.now()

    db.commit()

    # Логируем
    log_action(
        db, "sandbox_stopped", sandbox.owner_id, sandbox_id, "Песочница остановлена"
    )

    return {"success": True, "sandbox_id": sandbox_id, "status": "stopped"}


@app.get("/sandboxes", response_model=List[dict])
def get_all_sandboxes(db: Session = Depends(get_db)):
    """Список всех песочниц"""
    sandboxes = db.query(SandboxModel).all()
    result = []

    for s in sandboxes:
        s_dict = {
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "difficulty": s.difficulty,
            "type": s.type,
            "tags": json.loads(s.tags) if s.tags else [],
            "image": s.image,
            "status": s.status,
            "url": s.url,
            "container_id": s.container_id,
            "created_at": s.created_at,
            "started_at": s.started_at,
            "stopped_at": s.stopped_at,
            "owner_id": s.owner_id,
            "vulnerabilities": (
                json.loads(s.vulnerabilities) if s.vulnerabilities else []
            ),
            "access_count": s.access_count,
        }
        result.append(s_dict)

    return result


@app.get("/sandboxes/{sandbox_id}", response_model=dict)
def get_sandbox(sandbox_id: str, db: Session = Depends(get_db)):
    """Получить песочницу по ID"""
    sandbox = db.query(SandboxModel).filter(SandboxModel.id == sandbox_id).first()

    if not sandbox:
        raise HTTPException(status_code=404, detail="Песочница не найдена")

    # Увеличиваем счетчик просмотров
    sandbox.access_count += 1
    db.commit()

    s_dict = {
        "id": sandbox.id,
        "name": sandbox.name,
        "description": sandbox.description,
        "difficulty": sandbox.difficulty,
        "type": sandbox.type,
        "tags": json.loads(sandbox.tags) if sandbox.tags else [],
        "image": sandbox.image,
        "status": sandbox.status,
        "url": sandbox.url,
        "container_id": sandbox.container_id,
        "created_at": sandbox.created_at,
        "started_at": sandbox.started_at,
        "stopped_at": sandbox.stopped_at,
        "owner_id": sandbox.owner_id,
        "vulnerabilities": (
            json.loads(sandbox.vulnerabilities) if sandbox.vulnerabilities else []
        ),
        "access_count": sandbox.access_count,
    }

    return s_dict


@app.delete("/sandboxes/{sandbox_id}")
def delete_sandbox(sandbox_id: str, db: Session = Depends(get_db)):
    """Удаление песочницы"""
    sandbox = db.query(SandboxModel).filter(SandboxModel.id == sandbox_id).first()

    if not sandbox:
        raise HTTPException(status_code=404, detail="Песочница не найдена")

    # Логируем перед удалением
    log_action(db, "sandbox_deleted", sandbox.owner_id, sandbox_id, "Песочница удалена")

    # Удаляем
    db.delete(sandbox)
    db.commit()

    return {"success": True, "message": f"Песочница {sandbox_id} удалена"}


# ============== ЛОГИ ==============


@app.get("/logs", response_model=List[dict])
def get_logs(limit: int = 100, db: Session = Depends(get_db)):
    """Получение последних логов"""
    logs = db.query(LogModel).order_by(LogModel.timestamp.desc()).limit(limit).all()

    result = []
    for log in logs:
        result.append(
            {
                "id": log.id,
                "user_id": log.user_id,
                "sandbox_id": log.sandbox_id,
                "action": log.action,
                "timestamp": log.timestamp,
                "details": log.details,
            }
        )

    return result


@app.get("/logs/sandbox/{sandbox_id}")
def get_sandbox_logs(sandbox_id: str, db: Session = Depends(get_db)):
    """Логи конкретной песочницы"""
    logs = (
        db.query(LogModel)
        .filter(LogModel.sandbox_id == sandbox_id)
        .order_by(LogModel.timestamp.desc())
        .all()
    )

    result = []
    for log in logs:
        result.append(
            {
                "id": log.id,
                "user_id": log.user_id,
                "sandbox_id": log.sandbox_id,
                "action": log.action,
                "timestamp": log.timestamp,
                "details": log.details,
            }
        )

    return result


# ============== ЗАПУСК СЕРВЕРА ==============

if __name__ == "__main__":
    import uvicorn

    print("=" * 60)
    print("🚀 CyberRange Platform - Серверная часть")
    print("=" * 60)
    print("Студент: Зеленов Артём Владимирович")
    print("Группа: 4-10ЗС-1")
    print("Тема: Разработка серверной части интегрированной платформы")
    print("       для управления процессами оценки защищенности")
    print("       веб-приложений и образовательным контентом")
    print("-" * 60)
    print("📁 База данных: ./data/cyberrange.db")
    print("📚 Документация: http://localhost:8000/docs")
    print("🛑 Остановка: Ctrl+C")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
