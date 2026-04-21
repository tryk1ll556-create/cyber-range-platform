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
from typing import List, Optional, Dict, Any
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
        from_attributes = True

class SandboxBase(BaseModel):
    """Базовая модель песочницы"""
    name: str
    description: Optional[str] = None
    difficulty: str = "beginner"
    type: str = "webapp"
    tags: List[str] = []
    image: str = "vulnerable-webapp:latest"

class SandboxCreate(SandboxBase):
    """Модель для создания песочницы"""
    pass

class Sandbox(SandboxBase):
    """Полная модель песочницы для ответов API"""
    id: str
    status: str
    url: Optional[str] = None
    container_id: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    stopped_at: Optional[datetime] = None
    owner_id: str
    vulnerabilities: List[str]
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

# ============== ОБРАЗОВАТЕЛЬНЫЕ МОДЕЛИ ==============

class ContentBase(BaseModel):
    """Базовая модель учебного контента"""
    title: str
    description: str
    content_type: str  # article, video, lab, quiz
    difficulty: str  # beginner, intermediate, advanced
    tags: List[str] = []
    estimated_time: int  # в минутах
    content: str  # HTML/Markdown контент

class ContentCreate(ContentBase):
    """Модель для создания контента"""
    related_sandboxes: List[str] = []
    prerequisites: List[str] = []

class Content(ContentBase):
    """Полная модель учебного контента"""
    id: str
    author_id: str
    created_at: datetime
    updated_at: datetime
    related_sandboxes: List[str] = []
    prerequisites: List[str] = []
    views_count: int
    rating: float
    
    class Config:
        from_attributes = True

class LabWorkBase(BaseModel):
    """Базовая модель лабораторной работы"""
    title: str
    description: str
    sandbox_id: str  # ID песочницы для выполнения
    difficulty: str = "beginner"
    tasks: List[dict]  # Список заданий
    flags: List[str]  # Список флагов для сдачи
    max_score: int = 100
    time_limit: Optional[int] = None  # в минутах

class LabWorkCreate(LabWorkBase):
    """Модель для создания лабораторной работы"""
    pass

class LabWork(LabWorkBase):
    """Полная модель лабораторной работы"""
    id: str
    created_at: datetime
    author_id: str
    completed_count: int = 0
    average_score: float = 0.0
    
    class Config:
        from_attributes = True

class LabAttempt(BaseModel):
    """Модель попытки выполнения лабораторной работы"""
    id: str
    user_id: str
    lab_id: str
    sandbox_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    score: Optional[int] = None
    status: str  # in_progress, completed, failed
    flags_found: List[str] = []
    time_spent: Optional[int] = None  # в секундах
    
    class Config:
        from_attributes = True

class QuizQuestion(BaseModel):
    """Модель вопроса для теста"""
    id: str
    question: str
    options: List[str]
    correct_answer: int  # индекс правильного ответа
    explanation: Optional[str] = None
    points: int = 10

class QuizBase(BaseModel):
    """Базовая модель теста"""
    title: str
    description: str
    questions: List[QuizQuestion]
    time_limit: Optional[int] = None  # в минутах
    passing_score: int = 70  # проходной балл в процентах

class QuizCreate(QuizBase):
    """Модель для создания теста"""
    pass

class Quiz(QuizBase):
    """Полная модель теста"""
    id: str
    author_id: str
    created_at: datetime
    attempts_count: int = 0
    
    class Config:
        from_attributes = True

class QuizAttempt(BaseModel):
    """Модель попытки прохождения теста"""
    id: str
    user_id: str
    quiz_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    answers: List[int] = []  # индексы выбранных ответов
    score: Optional[int] = None
    passed: bool = False
    
    class Config:
        from_attributes = True

# ============== ВРЕМЕННЫЕ ХРАНИЛИЩА (для образовательного модуля) ==============
# В реальном проекте нужно создать отдельные таблицы в database.py

# Учебный контент (временно, пока не добавили в БД)
educational_content_db = []

# Лабораторные работы
labs_db = []

# Попытки выполнения лабораторных работ
lab_attempts_db = []

# Тесты
quizzes_db = []

# Попытки прохождения тестов
quiz_attempts_db = []

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
    contact={
        "name": "Зеленов Артём Владимирович",
        "group": "4-10ЗС-1",
        "year": 2026
    }
)

# Разрешаем запросы с других доменов
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==============

def generate_sandbox_url(sandbox_id: str) -> str:
    return "http://localhost:8080"

def log_action(db: Session, action: str, user_id: str = None, sandbox_id: str = None, details: str = None):
    """
    Запись лога в базу данных
    """
    log_data = {
        "id": str(uuid.uuid4())[:8],
        "action": action,
        "timestamp": datetime.now()
    }
    
    if user_id is not None:
        log_data["user_id"] = user_id
    if sandbox_id is not None:
        log_data["sandbox_id"] = sandbox_id
    if details is not None:
        log_data["details"] = details
    
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
        "docs": "/docs"
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Проверка подключения к базе данных"""
    try:
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.now().isoformat()
    }

# ============== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ==============

@app.post("/users/register", response_model=User, status_code=201)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    
    # Проверяем, нет ли уже такого пользователя
    existing = db.query(UserModel).filter(
        (UserModel.username == user_data.username) | 
        (UserModel.email == user_data.email)
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
        password_hash=user_data.password,
        role="student",
        created_at=datetime.now(),
        last_active=datetime.now(),
        experience_points=0,
        completed_labs="[]"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    log_action(db, "user_registered", new_user.id, None, f"Регистрация пользователя {user_data.username}")
    
    user_dict = {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "role": new_user.role,
        "created_at": new_user.created_at,
        "last_active": new_user.last_active,
        "experience_points": new_user.experience_points,
        "completed_labs": json.loads(new_user.completed_labs)
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
            "completed_labs": json.loads(user.completed_labs)
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
        "completed_labs": json.loads(user.completed_labs)
    }
    
    return user_dict

# ============== ЛОГИН ==============

@app.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user or user.password_hash != password:
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "experience_points": user.experience_points
    }

# ============== УПРАВЛЕНИЕ ПЕСОЧНИЦАМИ ==============

@app.post("/sandboxes", response_model=dict, status_code=201)
def create_sandbox(sandbox_data: SandboxCreate, owner_id: str = "guest", db: Session = Depends(get_db)):
    """Создание новой песочницы"""
    
    sandbox_id = str(uuid.uuid4())[:8]
    
    vuln_map = {
        "webapp": ["SQL Injection", "XSS", "CSRF", "IDOR", "File Inclusion"],
        "api": ["Broken Authentication", "Mass Assignment", "Injection", "Rate Limiting"],
        "database": ["Weak Passwords", "Unencrypted Data", "Privilege Escalation"],
        "network": ["Open Ports", "Weak Protocols", "Misconfiguration"]
    }
    
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
        access_count=0
    )
    
    db.add(new_sandbox)
    db.commit()
    db.refresh(new_sandbox)
    
    log_action(db, "sandbox_created", owner_id, sandbox_id, f"Создана песочница {sandbox_data.name}")
    
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
        "vulnerabilities": json.loads(new_sandbox.vulnerabilities) if new_sandbox.vulnerabilities else [],
        "access_count": new_sandbox.access_count
    }
    
    return sandbox_dict

@app.post("/sandboxes/{sandbox_id}/start")
def start_sandbox(sandbox_id: str, db: Session = Depends(get_db)):
    """Запуск песочницы"""
    sandbox = db.query(SandboxModel).filter(SandboxModel.id == sandbox_id).first()
    
    if not sandbox:
        raise HTTPException(status_code=404, detail="Песочница не найдена")
    
    sandbox.status = "running"
    sandbox.started_at = datetime.now()
    sandbox.url = generate_sandbox_url(sandbox_id)
    sandbox.container_id = f"container_{sandbox_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    db.commit()
    db.refresh(sandbox)
    
    log_action(db, "sandbox_started", sandbox.owner_id, sandbox_id, "Песочница запущена")
    
    return {
        "success": True,
        "sandbox_id": sandbox_id,
        "status": "running",
        "url": sandbox.url
    }

@app.post("/sandboxes/{sandbox_id}/stop")
def stop_sandbox(sandbox_id: str, db: Session = Depends(get_db)):
    """Остановка песочницы"""
    sandbox = db.query(SandboxModel).filter(SandboxModel.id == sandbox_id).first()
    
    if not sandbox:
        raise HTTPException(status_code=404, detail="Песочница не найдена")
    
    sandbox.status = "stopped"
    sandbox.stopped_at = datetime.now()
    
    db.commit()
    
    log_action(db, "sandbox_stopped", sandbox.owner_id, sandbox_id, "Песочница остановлена")
    
    return {
        "success": True,
        "sandbox_id": sandbox_id,
        "status": "stopped"
    }

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
            "vulnerabilities": json.loads(s.vulnerabilities) if s.vulnerabilities else [],
            "access_count": s.access_count
        }
        result.append(s_dict)
    
    return result

@app.get("/sandboxes/{sandbox_id}", response_model=dict)
def get_sandbox(sandbox_id: str, db: Session = Depends(get_db)):
    """Получить песочницу по ID"""
    sandbox = db.query(SandboxModel).filter(SandboxModel.id == sandbox_id).first()
    
    if not sandbox:
        raise HTTPException(status_code=404, detail="Песочница не найдена")
    
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
        "vulnerabilities": json.loads(sandbox.vulnerabilities) if sandbox.vulnerabilities else [],
        "access_count": sandbox.access_count
    }
    
    return s_dict

@app.delete("/sandboxes/{sandbox_id}")
def delete_sandbox(sandbox_id: str, db: Session = Depends(get_db)):
    """Удаление песочницы"""
    sandbox = db.query(SandboxModel).filter(SandboxModel.id == sandbox_id).first()
    
    if not sandbox:
        raise HTTPException(status_code=404, detail="Песочница не найдена")
    
    log_action(db, "sandbox_deleted", sandbox.owner_id, sandbox_id, "Песочница удалена")
    
    db.delete(sandbox)
    db.commit()
    
    return {
        "success": True,
        "message": f"Песочница {sandbox_id} удалена"
    }

# ============== ЛОГИ ==============

@app.get("/logs", response_model=List[dict])
def get_logs(limit: int = 100, db: Session = Depends(get_db)):
    """Получение последних логов"""
    logs = db.query(LogModel).order_by(LogModel.timestamp.desc()).limit(limit).all()
    
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "user_id": log.user_id,
            "sandbox_id": log.sandbox_id,
            "action": log.action,
            "timestamp": log.timestamp,
            "details": log.details
        })
    
    return result

@app.get("/logs/sandbox/{sandbox_id}")
def get_sandbox_logs(sandbox_id: str, db: Session = Depends(get_db)):
    """Логи конкретной песочницы"""
    logs = db.query(LogModel).filter(LogModel.sandbox_id == sandbox_id).order_by(LogModel.timestamp.desc()).all()
    
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "user_id": log.user_id,
            "sandbox_id": log.sandbox_id,
            "action": log.action,
            "timestamp": log.timestamp,
            "details": log.details
        })
    
    return result

# ============== УЧЕБНЫЙ КОНТЕНТ ==============

@app.post("/content", response_model=Content, status_code=201)
def create_content(
    content_data: ContentCreate, 
    author_id: str = "teacher", 
    db: Session = Depends(get_db)
):
    """Создание нового учебного материала"""
    
    content_id = str(uuid.uuid4())[:8]
    
    # Создаем запись в БД
    new_content = ContentModel(
        id=content_id,
        title=content_data.title,
        description=content_data.description,
        content_type=content_data.content_type,
        difficulty=content_data.difficulty,
        tags=json.dumps(content_data.tags),
        estimated_time=content_data.estimated_time,
        content=content_data.content,
        author_id=author_id,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        related_sandboxes=json.dumps(content_data.related_sandboxes),
        views_count=0,
        rating=0.0
    )
    
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    
    # Логируем действие
    log_action(db, "content_created", author_id, None, f"Создан материал: {content_data.title}")
    
    # Формируем ответ
    content_dict = {
        "id": new_content.id,
        "title": new_content.title,
        "description": new_content.description,
        "content_type": new_content.content_type,
        "difficulty": new_content.difficulty,
        "tags": json.loads(new_content.tags) if new_content.tags else [],
        "estimated_time": new_content.estimated_time,
        "content": new_content.content,
        "author_id": new_content.author_id,
        "created_at": new_content.created_at,
        "updated_at": new_content.updated_at,
        "related_sandboxes": json.loads(new_content.related_sandboxes) if new_content.related_sandboxes else [],
        "views_count": new_content.views_count,
        "rating": new_content.rating
    }
    
    return content_dict

@app.get("/content", response_model=List[dict])
def get_all_content(
    content_type: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Получение списка всех учебных материалов с фильтрацией"""
    
    query = db.query(ContentModel)
    
    if content_type:
        query = query.filter(ContentModel.content_type == content_type)
    if difficulty:
        query = query.filter(ContentModel.difficulty == difficulty)
    if search:
        query = query.filter(ContentModel.title.contains(search) | ContentModel.description.contains(search))
    
    contents = query.all()
    result = []
    
    for c in contents:
        content_dict = {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "content_type": c.content_type,
            "difficulty": c.difficulty,
            "tags": json.loads(c.tags) if c.tags else [],
            "estimated_time": c.estimated_time,
            "author_id": c.author_id,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "views_count": c.views_count,
            "rating": c.rating
        }
        result.append(content_dict)
    
    return result

@app.get("/content/{content_id}", response_model=dict)
def get_content(content_id: str, db: Session = Depends(get_db)):
    """Получение конкретного учебного материала"""
    
    content = db.query(ContentModel).filter(ContentModel.id == content_id).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Материал не найден")
    
    # Увеличиваем счетчик просмотров
    content.views_count += 1
    db.commit()
    
    content_dict = {
        "id": content.id,
        "title": content.title,
        "description": content.description,
        "content_type": content.content_type,
        "difficulty": content.difficulty,
        "tags": json.loads(content.tags) if content.tags else [],
        "estimated_time": content.estimated_time,
        "content": content.content,
        "author_id": content.author_id,
        "created_at": content.created_at,
        "updated_at": content.updated_at,
        "related_sandboxes": json.loads(content.related_sandboxes) if content.related_sandboxes else [],
        "views_count": content.views_count,
        "rating": content.rating
    }
    
    return content_dict

@app.put("/content/{content_id}")
def update_content(content_id: str, content_data: ContentCreate, db: Session = Depends(get_db)):
    """Обновление учебного материала"""
    
    content = db.query(ContentModel).filter(ContentModel.id == content_id).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Материал не найден")
    
    # Обновляем поля
    content.title = content_data.title
    content.description = content_data.description
    content.content_type = content_data.content_type
    content.difficulty = content_data.difficulty
    content.tags = json.dumps(content_data.tags)
    content.estimated_time = content_data.estimated_time
    content.content = content_data.content
    content.updated_at = datetime.now()
    
    db.commit()
    
    return {"success": True, "message": "Материал обновлен"}

@app.delete("/content/{content_id}")
def delete_content(content_id: str, db: Session = Depends(get_db)):
    """Удаление учебного материала"""
    
    content = db.query(ContentModel).filter(ContentModel.id == content_id).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Материал не найден")
    
    db.delete(content)
    db.commit()
    
    log_action(db, "content_deleted", None, None, f"Удален материал: {content.title}")
    
    return {"success": True, "message": "Материал удален"}

@app.post("/content/{content_id}/rate")
def rate_content(content_id: str, rating: float, db: Session = Depends(get_db)):
    """Оценка материала пользователем (1-5)"""
    
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Рейтинг должен быть от 1 до 5")
    
    content = db.query(ContentModel).filter(ContentModel.id == content_id).first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Материал не найден")
    
    # Обновляем рейтинг (простое среднее арифметическое)
    if content.rating == 0:
        content.rating = rating
    else:
        content.rating = (content.rating + rating) / 2
    
    db.commit()
    
    return {
        "success": True,
        "content_id": content_id,
        "new_rating": content.rating
    }

# ============== ЛАБОРАТОРНЫЕ РАБОТЫ ==============

@app.post("/labs", response_model=LabWork, status_code=201)
def create_lab(lab_data: LabWorkCreate, author_id: str = "teacher"):
    """Создание новой лабораторной работы"""
    
    lab_id = str(uuid.uuid4())[:8]
    
    new_lab = LabWork(
        id=lab_id,
        title=lab_data.title,
        description=lab_data.description,
        sandbox_id=lab_data.sandbox_id,
        difficulty=lab_data.difficulty,
        tasks=lab_data.tasks,
        flags=lab_data.flags,
        max_score=lab_data.max_score,
        time_limit=lab_data.time_limit,
        created_at=datetime.now(),
        author_id=author_id,
        completed_count=0,
        average_score=0.0
    )
    
    labs_db.append(new_lab.dict())
    
    return new_lab

@app.get("/labs", response_model=List[LabWork])
def get_all_labs(
    difficulty: Optional[str] = None,
    sandbox_id: Optional[str] = None
):
    """Получение списка всех лабораторных работ с фильтрацией"""
    
    result = labs_db.copy()
    
    if difficulty:
        result = [lab for lab in result if lab["difficulty"] == difficulty]
    if sandbox_id:
        result = [lab for lab in result if lab["sandbox_id"] == sandbox_id]
    
    return result

@app.get("/labs/{lab_id}", response_model=LabWork)
def get_lab(lab_id: str):
    """Получение конкретной лабораторной работы"""
    
    for lab in labs_db:
        if lab["id"] == lab_id:
            return lab
    
    raise HTTPException(status_code=404, detail="Лабораторная работа не найдена")

@app.put("/labs/{lab_id}")
def update_lab(lab_id: str, lab_data: LabWorkCreate):
    """Обновление лабораторной работы"""
    
    for i, lab in enumerate(labs_db):
        if lab["id"] == lab_id:
            # Обновляем поля
            labs_db[i]["title"] = lab_data.title
            labs_db[i]["description"] = lab_data.description
            labs_db[i]["sandbox_id"] = lab_data.sandbox_id
            labs_db[i]["difficulty"] = lab_data.difficulty
            labs_db[i]["tasks"] = lab_data.tasks
            labs_db[i]["flags"] = lab_data.flags
            labs_db[i]["max_score"] = lab_data.max_score
            labs_db[i]["time_limit"] = lab_data.time_limit
            return {"success": True, "message": "Лабораторная работа обновлена"}
    
    raise HTTPException(status_code=404, detail="Лабораторная работа не найдена")

@app.delete("/labs/{lab_id}")
def delete_lab(lab_id: str):
    """Удаление лабораторной работы"""
    
    for i, lab in enumerate(labs_db):
        if lab["id"] == lab_id:
            labs_db.pop(i)
            return {"success": True, "message": "Лабораторная работа удалена"}
    
    raise HTTPException(status_code=404, detail="Лабораторная работа не найдена")

@app.post("/labs/{lab_id}/start")
def start_lab(lab_id: str, user_id: str):
    """Начало выполнения лабораторной работы"""
    
    # Проверяем существование лабораторной работы
    lab_exists = False
    lab_sandbox_id = None
    
    for lab in labs_db:
        if lab["id"] == lab_id:
            lab_exists = True
            lab_sandbox_id = lab["sandbox_id"]
            break
    
    if not lab_exists:
        raise HTTPException(status_code=404, detail="Лабораторная работа не найдена")
    
    # Проверяем, нет ли уже активной попытки
    for attempt in lab_attempts_db:
        if attempt["user_id"] == user_id and attempt["lab_id"] == lab_id and attempt["status"] == "in_progress":
            return {
                "success": True,
                "attempt_id": attempt["id"],
                "message": "Продолжаем существующую попытку"
            }
    
    # Создаем новую попытку
    attempt_id = str(uuid.uuid4())[:8]
    new_attempt = LabAttempt(
        id=attempt_id,
        user_id=user_id,
        lab_id=lab_id,
        sandbox_id=lab_sandbox_id,
        started_at=datetime.now(),
        status="in_progress",
        flags_found=[]
    )
    
    lab_attempts_db.append(new_attempt.dict())
    
    return {
        "success": True,
        "attempt_id": attempt_id,
        "message": "Лабораторная работа начата"
    }

@app.post("/labs/attempt/{attempt_id}/submit")
def submit_lab(attempt_id: str, flags: List[str]):
    """Сдача лабораторной работы (отправка найденных флагов)"""
    
    # Находим попытку
    attempt_index = None
    attempt = None
    
    for i, a in enumerate(lab_attempts_db):
        if a["id"] == attempt_id:
            attempt_index = i
            attempt = a
            break
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Попытка не найдена")
    
    if attempt["status"] != "in_progress":
        raise HTTPException(status_code=400, detail="Эта попытка уже завершена")
    
    # Находим лабораторную работу
    lab = None
    for l in labs_db:
        if l["id"] == attempt["lab_id"]:
            lab = l
            break

    if not lab:
        raise HTTPException(status_code=404, detail="Лабораторная работа не найдена")

    # Проверяем флаги
    correct_flags = set(lab["flags"])
    submitted_flags = set(flags)
    found_flags = list(correct_flags & submitted_flags)

    # Рассчитываем время выполнения
    started = datetime.fromisoformat(attempt["started_at"])
    time_spent = int((datetime.now() - started).total_seconds())

    # Рассчитываем score
    score = int((len(found_flags) / len(correct_flags)) * lab["max_score"])

    # Обновляем попытку
    lab_attempts_db[attempt_index]["completed_at"] = datetime.now()
    lab_attempts_db[attempt_index]["score"] = score
    lab_attempts_db[attempt_index]["status"] = "completed" if score >= 70 else "failed"
    lab_attempts_db[attempt_index]["flags_found"] = found_flags
    lab_attempts_db[attempt_index]["time_spent"] = time_spent

    # Обновляем статистику лабораторной работы
    for i, l in enumerate(labs_db):
        if l["id"] == lab["id"]:
            labs_db[i]["completed_count"] = l.get("completed_count", 0) + 1
            old_avg = l.get("average_score", 0)
            old_count = l.get("completed_count", 0)
            if old_count > 0:
                labs_db[i]["average_score"] = (old_avg * old_count + score) / (old_count + 1)
            else:
                labs_db[i]["average_score"] = score
            break

    return {
        "success": True,
        "score": score,
        "status": attempt["status"],
        "flags_found": found_flags,
        "total_flags": len(correct_flags),
        "time_spent": time_spent,
        "message": "Лабораторная работа сдана!" if score >= 70 else "Попробуйте еще раз"
    }

@app.get("/labs/attempt/user/{user_id}")
def get_user_attempts(user_id: str):
    """Получение всех попыток пользователя"""
    user_attempts = [a for a in lab_attempts_db if a["user_id"] == user_id]
    user_attempts.sort(key=lambda x: x["started_at"], reverse=True)
    return user_attempts

# ============== ТЕСТЫ ==============

@app.post("/quizzes", response_model=Quiz, status_code=201)
def create_quiz(quiz_data: QuizCreate, author_id: str = "teacher"):
    quiz_id = str(uuid.uuid4())[:8]
    new_quiz = Quiz(
        id=quiz_id,
        title=quiz_data.title,
        description=quiz_data.description,
        questions=[q.dict() for q in quiz_data.questions],
        time_limit=quiz_data.time_limit,
        passing_score=quiz_data.passing_score,
        author_id=author_id,
        created_at=datetime.now(),
        attempts_count=0
    )
    quizzes_db.append(new_quiz.dict())
    return new_quiz

@app.get("/quizzes", response_model=List[Quiz])
def get_all_quizzes():
    return quizzes_db

@app.get("/quizzes/{quiz_id}", response_model=Quiz)
def get_quiz(quiz_id: str):
    for quiz in quizzes_db:
        if quiz["id"] == quiz_id:
            return quiz
    raise HTTPException(status_code=404, detail="Тест не найден")

@app.post("/quizzes/{quiz_id}/start")
def start_quiz(quiz_id: str, user_id: str):
    quiz_exists = any(q["id"] == quiz_id for q in quizzes_db)
    if not quiz_exists:
        raise HTTPException(status_code=404, detail="Тест не найден")
    attempt_id = str(uuid.uuid4())[:8]
    new_attempt = QuizAttempt(
        id=attempt_id,
        user_id=user_id,
        quiz_id=quiz_id,
        started_at=datetime.now(),
        answers=[]
    )
    quiz_attempts_db.append(new_attempt.dict())
    return {"success": True, "attempt_id": attempt_id, "message": "Тест начат"}

@app.post("/quizzes/attempt/{attempt_id}/submit")
def submit_quiz(attempt_id: str, answers: List[int]):
    attempt = next((a for a in quiz_attempts_db if a["id"] == attempt_id), None)
    if not attempt:
        raise HTTPException(status_code=404, detail="Попытка не найдена")
    quiz = next((q for q in quizzes_db if q["id"] == attempt["quiz_id"]), None)
    if not quiz:
        raise HTTPException(status_code=404, detail="Тест не найден")
    total_points = 0
    earned_points = 0
    for i, q in enumerate(quiz["questions"]):
        total_points += q["points"]
        if i < len(answers) and answers[i] == q["correct_answer"]:
            earned_points += q["points"]
    score = int((earned_points / total_points) * 100) if total_points else 0
    passed = score >= quiz["passing_score"]
    for i, a in enumerate(quiz_attempts_db):
        if a["id"] == attempt_id:
            quiz_attempts_db[i]["completed_at"] = datetime.now()
            quiz_attempts_db[i]["answers"] = answers
            quiz_attempts_db[i]["score"] = score
            quiz_attempts_db[i]["passed"] = passed
            break
    for i, q in enumerate(quizzes_db):
        if q["id"] == quiz["id"]:
            quizzes_db[i]["attempts_count"] = q.get("attempts_count", 0) + 1
            break
    return {
        "success": True,
        "score": score,
        "correct_answers": sum(1 for i, q in enumerate(quiz["questions"]) if i < len(answers) and answers[i] == q["correct_answer"]),
        "total_questions": len(quiz["questions"]),
        "passed": passed,
        "message": "Тест пройден!" if passed else "Тест не пройден"
    }

# ============== ПРОГРЕСС ПОЛЬЗОВАТЕЛЯ ==============

@app.get("/users/{user_id}/progress")
def get_user_progress(user_id: str, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    lab_attempts = [a for a in lab_attempts_db if a["user_id"] == user_id]
    completed_labs = set()
    lab_scores = []
    for attempt in lab_attempts:
        if attempt["status"] == "completed":
            completed_labs.add(attempt["lab_id"])
            if attempt.get("score"):
                lab_scores.append(attempt["score"])
    quiz_attempts = [a for a in quiz_attempts_db if a["user_id"] == user_id]
    passed_quizzes = 0
    quiz_scores = []
    for attempt in quiz_attempts:
        if attempt.get("passed"):
            passed_quizzes += 1
        if attempt.get("score"):
            quiz_scores.append(attempt["score"])
    viewed_content = json.loads(user.completed_labs) if user.completed_labs else []
    total_score = sum(lab_scores) + sum(quiz_scores) * 10
    user.experience_points = total_score
    user.completed_labs = json.dumps(list(completed_labs))
    db.commit()
    return {
        "user_id": user_id,
        "username": user.username,
        "experience_points": total_score,
        "statistics": {
            "completed_labs": len(completed_labs),
            "total_lab_attempts": len(lab_attempts),
            "average_lab_score": sum(lab_scores) / len(lab_scores) if lab_scores else 0,
            "passed_quizzes": passed_quizzes,
            "total_quiz_attempts": len(quiz_attempts),
            "average_quiz_score": sum(quiz_scores) / len(quiz_scores) if quiz_scores else 0,
            "viewed_content": len(viewed_content)
        },
        "recent_activities": []
    }

@app.get("/users/{user_id}/activities")
def get_user_activities(user_id: str, limit: int = 10):
    activities = []
    for attempt in lab_attempts_db:
        if attempt["user_id"] == user_id:
            activities.append({
                "type": "lab_attempt",
                "lab_id": attempt["lab_id"],
                "status": attempt["status"],
                "score": attempt.get("score"),
                "timestamp": attempt["started_at"]
            })
    for attempt in quiz_attempts_db:
        if attempt["user_id"] == user_id:
            activities.append({
                "type": "quiz_attempt",
                "quiz_id": attempt["quiz_id"],
                "passed": attempt.get("passed"),
                "score": attempt.get("score"),
                "timestamp": attempt["started_at"]
            })
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:limit]

@app.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(UserModel).all()
    leaderboard = []
    for user in users:
        lab_attempts = [a for a in lab_attempts_db if a["user_id"] == user.id]
        completed_labs = len([a for a in lab_attempts if a["status"] == "completed"])
        total_score = user.experience_points or 0
        leaderboard.append({
            "user_id": user.id,
            "username": user.username,
            "experience_points": total_score,
            "completed_labs": completed_labs,
            "avatar": None
        })
    leaderboard.sort(key=lambda x: x["experience_points"], reverse=True)
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1
    return leaderboard

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