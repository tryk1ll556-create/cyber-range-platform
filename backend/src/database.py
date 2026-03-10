from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Создаем папку для базы данных если её нет
os.makedirs("./data", exist_ok=True)

# Подключение к SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./data/cyberrange.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Нужно для SQLite
)

# Сессии для работы с БД
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()


# Модель пользователя
class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=True)
    password_hash = Column(String)  # В реальном проекте хешировать!
    role = Column(String, default="student")
    created_at = Column(DateTime, default=datetime.now)
    last_active = Column(DateTime, default=datetime.now)
    experience_points = Column(Integer, default=0)
    completed_labs = Column(Text, default="[]")  # Храним как JSON строку


# Модель песочницы
class SandboxModel(Base):
    __tablename__ = "sandboxes"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    difficulty = Column(String, default="beginner")
    type = Column(String, default="webapp")
    tags = Column(Text, default="[]")
    image = Column(String, default="vulnerable-webapp:latest")
    status = Column(String, default="created")
    url = Column(String, nullable=True)
    container_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    started_at = Column(DateTime, nullable=True)
    stopped_at = Column(DateTime, nullable=True)
    owner_id = Column(String, index=True)
    vulnerabilities = Column(Text, default="[]")
    access_count = Column(Integer, default=0)


# Модель образовательного контента
class ContentModel(Base):
    __tablename__ = "educational_content"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    content_type = Column(String)
    difficulty = Column(String)
    tags = Column(Text, default="[]")
    estimated_time = Column(Integer)
    content = Column(Text)  # HTML/Markdown
    author_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now)
    related_sandboxes = Column(Text, default="[]")
    views_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)


# Модель логов (ИСПРАВЛЕНО - добавлен sandbox_id)
class LogModel(Base):
    __tablename__ = "logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True, index=True)
    sandbox_id = Column(String, nullable=True, index=True)  # ← ДОБАВЛЕНО!
    action = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.now)
    details = Column(Text, nullable=True)


# Создаем таблицы в базе данных
Base.metadata.create_all(bind=engine)


# Функция для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
