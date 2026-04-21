FROM python:3.10-slim

WORKDIR /app

# Копируем requirements.txt из папки backend
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем всё содержимое папки src
COPY src/ ./src/

# Запускаем сервер
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]