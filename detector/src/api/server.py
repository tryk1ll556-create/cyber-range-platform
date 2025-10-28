#!/usr/bin/env python3
"""
API СЕРВЕР ДЛЯ СИСТЕМЫ ДЕТЕКТИРОВАНИЯ АТАК
"""

import sys
import os
import json
import time
from datetime import datetime
from typing import Dict, Any, List, Optional

# ===== НАСТРОЙКА ПУТЕЙ ИМПОРТА =====
current_dir = os.path.dirname(__file__)  # папка где находится server.py
src_path = os.path.abspath(os.path.join(current_dir, '..'))  # папка src
detector_path = os.path.abspath(os.path.join(current_dir, '..', '..'))  # папка detector

# Добавляем пути в правильном порядке
sys.path.insert(0, src_path)      # сначала папка src
sys.path.insert(0, detector_path) # потом папка detector

print("🔧 Настройка путей импорта:")
print(f"   Текущая папка: {current_dir}")
print(f"   Папка src: {src_path}")
print(f"   Папка detector: {detector_path}")

# ===== ИМПОРТ ВНЕШНИХ БИБЛИОТЕК =====
try:
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    HAS_FASTAPI = True
    print("✅ FastAPI и Pydantic успешно импортированы!")
except ImportError as e:
    print(f"⚠️  FastAPI не установлен: {e}")
    print("   Запускаем в упрощённом режиме...")
    HAS_FASTAPI = False
    # Создаем заглушки для типов
    class BaseModel:
        pass

# ===== ИМПОРТ НАШЕЙ СИСТЕМЫ =====
try:
    # Пробуем разные пути импорта
    from main import CyberRangeDetector
    print("✅ Система детектирования загружена (прямой импорт)!")
except ImportError as e:
    try:
        # Альтернативный путь
        from src.main import CyberRangeDetector
        print("✅ Система загружена (альтернативный путь)!")
    except ImportError as e2:
        print(f"❌ Критическая ошибка импорта: {e2}")
        print("Доступные пути в sys.path:")
        for path in sys.path:
            print(f"   - {path}")
        sys.exit(1)

# ===== ИНИЦИАЛИЗАЦИЯ ДЕТЕКТОРА =====
detector = CyberRangeDetector()
print("🎯 Детектор атак инициализирован!")

# ===== ХРАНИЛИЩЕ СОБЫТИЙ =====
events_storage = []
detected_attacks = []

# ===== FASTAPI ВЕРСИЯ =====
if HAS_FASTAPI:
    
    # Создаём приложение FastAPI
    app = FastAPI(
        title="Cyber Range Detector API",
        description="API для системы детектирования атак",
        version="1.0.0"
    )

    # Модели данных для API
    class LogData(BaseModel):
        method: str
        url: str
        params: Dict[str, Any]
        headers: Optional[Dict[str, str]] = None
        sandbox_id: str
        timestamp: Optional[str] = None

    class AnalysisRequest(BaseModel):
        logs: List[LogData]

    # === НОВАЯ МОДЕЛЬ ДЛЯ СОБЫТИЙ ОТ ДЕТЕКТОРА ===
    class SecurityEvent(BaseModel):
        """Модель для приема событий от детектора"""
        timestamp: float
        event_type: str
        source_ip: str
        destination_ip: str
        description: str
        payload: str = None
        user_agent: str = None
        method: str = "GET"

    # ===== ЭНДПОИНТЫ API =====
    
    @app.get("/")
    async def root():
        """Главная страница API"""
        return {
            "message": "Cyber Range Detector API работает!",
            "version": "1.0.0",
            "mode": "full",
            "endpoints": {
                "analyze_single": "POST /api/analyze - анализ одного запроса",
                "analyze_batch": "POST /api/analyze/batch - анализ нескольких запросов",
                "get_stats": "GET /api/stats - получение статистики", 
                "get_recent": "GET /api/attacks/recent - последние атаки",
                "health": "GET /health - проверка здоровья",
                "receive_events": "POST /api/events - прием событий от детектора",  # НОВЫЙ
                "get_events": "GET /api/events - получение событий"  # НОВЫЙ
            }
        }

    @app.get("/health")
    async def health_check():
        """Проверка здоровья сервиса"""
        return {
            "status": "healthy", 
            "service": "attack-detector",
            "detectors_loaded": True,
            "events_count": len(events_storage),  # НОВОЕ
            "attacks_count": len(detected_attacks)  # НОВОЕ
        }

    # === НОВЫЕ ENDPOINTS ДЛЯ ПРИЕМА СОБЫТИЙ ===

    @app.post("/api/events")
    async def receive_event(event: SecurityEvent):
        """Принимает события от детектора и анализирует на атаки"""
        try:
            print(f"📨 Получено событие: {event.event_type} от {event.source_ip}")
            
            # Сохраняем событие
            event_data = event.dict()
            event_data["received_at"] = datetime.now().isoformat()
            event_data["event_id"] = f"event_{int(time.time())}_{len(events_storage)}"
            events_storage.append(event_data)
            
            # Анализируем на атаки (упрощенная версия)
            is_attack = False
            attack_type = None
            
            # Простая логика детектирования
            if event.payload:
                payload_lower = event.payload.lower()
                if any(sql_keyword in payload_lower for sql_keyword in ['select', 'union', 'drop', 'insert', '1=1']):
                    is_attack = True
                    attack_type = "sql_injection"
                    print(f"🚨 Обнаружена SQL injection: {event.payload}")
                elif any(xss_keyword in payload_lower for xss_keyword in ['<script>', 'javascript:', 'onload=']):
                    is_attack = True
                    attack_type = "xss"
                    print(f"🚨 Обнаружена XSS атака: {event.payload}")
            
            # Если обнаружена атака, сохраняем отдельно
            if is_attack:
                attack_event = {
                    "event_id": f"attack_{int(time.time())}_{len(detected_attacks)}",
                    "timestamp": event.timestamp,
                    "attack_type": attack_type,
                    "source_ip": event.source_ip,
                    "destination_ip": event.destination_ip,
                    "description": event.description,
                    "payload": event.payload,
                    "detected_at": datetime.now().isoformat()
                }
                detected_attacks.append(attack_event)
            
            # Формируем ответ
            response = {
                "success": True,
                "message": "Событие получено и проанализировано",
                "event_id": event_data["event_id"],
                "is_attack": is_attack,
                "attack_type": attack_type,
                "received_data": {
                    "event_type": event.event_type,
                    "source_ip": event.source_ip,
                    "destination_ip": event.destination_ip,
                    "description": event.description
                }
            }
            
            return response
            
        except Exception as e:
            print(f"❌ Ошибка обработки события: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка обработки события: {str(e)}")

    @app.get("/api/events")
    async def get_events(limit: int = 10):
        """Возвращает последние события"""
        return {
            "success": True,
            "total_events": len(events_storage),
            "events": events_storage[-limit:] if events_storage else []
        }

    @app.get("/api/attacks")
    async def get_attacks(limit: int = 10):
        """Возвращает обнаруженные атаки"""
        return {
            "success": True,
            "total_attacks": len(detected_attacks),
            "attacks": detected_attacks[-limit:] if detected_attacks else []
        }

    # === СУЩЕСТВУЮЩИЕ ENDPOINTS ===

    @app.post("/api/analyze")
    async def analyze_single_request(log_data: LogData):
        """
        Анализирует один HTTP запрос на наличие атак
        """
        try:
            print(f"🔍 Анализ запроса: {log_data.method} {log_data.url}")
            
            result = detector.analyze_request(
                method=log_data.method,
                url=log_data.url,
                params=log_data.params,
                headers=log_data.headers,
                sandbox_id=log_data.sandbox_id
            )
            
            print(f"   Результат: {result['summary']['total_detections']} угроз")
            
            return {
                "success": True,
                "data": result,
                "sandbox_id": log_data.sandbox_id
            }
            
        except Exception as e:
            print(f"❌ Ошибка анализа: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка анализа: {str(e)}")

    @app.post("/api/analyze/batch")
    async def analyze_batch_requests(request: AnalysisRequest):
        """
        Анализирует несколько HTTP запросов одновременно
        """
        try:
            print(f"🔍 Пакетный анализ: {len(request.logs)} запросов")
            
            results = []
            total_detections = 0
            
            for i, log_data in enumerate(request.logs):
                result = detector.analyze_request(
                    method=log_data.method,
                    url=log_data.url,
                    params=log_data.params,
                    headers=log_data.headers,
                    sandbox_id=log_data.sandbox_id
                )
                results.append(result)
                total_detections += result['summary']['total_detections']
                
                if i % 10 == 0:  # Логируем каждые 10 запросов
                    print(f"   Обработано: {i+1}/{len(request.logs)}")
            
            print(f"   Итого: {total_detections} угроз в {len(results)} запросах")
            
            return {
                "success": True,
                "total_requests": len(results),
                "total_detections": total_detections,
                "results": results
            }
            
        except Exception as e:
            print(f"❌ Ошибка пакетного анализа: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка анализа: {str(e)}")

    @app.get("/api/stats")
    async def get_statistics():
        """Возвращает статистику работы системы"""
        try:
            memory_stats = detector.get_stats()
            db_stats = detector.get_database_stats()
            
            stats = {
                "success": True,
                "memory_stats": memory_stats,
                "database_stats": db_stats,
                "summary": {
                    "total_requests": db_stats['total_requests'],
                    "total_attacks": db_stats['detected_attacks'],
                    "attack_ratio": f"{(db_stats['detected_attacks'] / db_stats['total_requests'] * 100):.1f}%" if db_stats['total_requests'] > 0 else "0%",
                    "detectors": {
                        "sql_injection": db_stats['sql_injections'],
                        "xss": db_stats['xss_attacks'], 
                        "path_traversal": db_stats['path_traversals']
                    }
                },
                "events_stats": {  # НОВАЯ СТАТИСТИКА
                    "total_events": len(events_storage),
                    "detected_attacks": len(detected_attacks),
                    "events_attack_ratio": f"{(len(detected_attacks) / len(events_storage) * 100):.1f}%" if events_storage else "0%"
                }
            }
            
            print(f"📊 Статистика запрошена: {db_stats['total_requests']} запросов, {len(events_storage)} событий")
            return stats
            
        except Exception as e:
            print(f"❌ Ошибка получения статистики: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка получения статистики: {str(e)}")

    @app.get("/api/attacks/recent")
    async def get_recent_attacks(limit: int = 10):
        """Возвращает последние обнаруженные атаки"""
        try:
            recent_attacks = detector.get_recent_detections(limit)
            
            print(f"🕒 Запрошены последние {len(recent_attacks)} атак")
            
            return {
                "success": True,
                "limit": limit,
                "total": len(recent_attacks),
                "attacks": recent_attacks
            }
            
        except Exception as e:
            print(f"❌ Ошибка получения атак: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка получения атак: {str(e)}")

# ===== УПРОЩЁННАЯ ВЕРСИЯ (БЕЗ FASTAPI) =====
else:
    from http.server import HTTPServer, BaseHTTPRequestHandler
    import urllib.parse
    
    class APIHandler(BaseHTTPRequestHandler):
        
        def _send_json_response(self, code, data):
            """Отправляет JSON ответ"""
            self.send_response(code)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
        
        def _parse_query_params(self, path):
            """Парсит параметры запроса из URL"""
            if '?' in path:
                query_string = path.split('?', 1)[1]
                return dict(urllib.parse.parse_qsl(query_string))
            return {}
        
        def do_GET(self):
            """Обрабатывает GET запросы"""
            path = self.path.split('?')[0]  # Убираем параметры
            
            if path == '/health':
                self._send_json_response(200, {
                    "status": "healthy", 
                    "service": "attack-detector",
                    "mode": "simple"
                })
            
            elif path == '/':
                self._send_json_response(200, {
                    "message": "Cyber Range Detector API работает!",
                    "version": "1.0.0", 
                    "mode": "simple",
                    "endpoints": ["/health", "/api/stats", "POST /api/analyze"]
                })
            
            elif path == '/api/stats':
                try:
                    memory_stats = detector.get_stats()
                    db_stats = detector.get_database_stats()
                    self._send_json_response(200, {
                        "success": True,
                        "memory_stats": memory_stats,
                        "database_stats": db_stats
                    })
                except Exception as e:
                    self._send_json_response(500, {"error": str(e)})
            
            elif path == '/api/attacks/recent':
                try:
                    params = self._parse_query_params(self.path)
                    limit = int(params.get('limit', 10))
                    recent_attacks = detector.get_recent_detections(limit)
                    self._send_json_response(200, {
                        "success": True,
                        "attacks": recent_attacks
                    })
                except Exception as e:
                    self._send_json_response(500, {"error": str(e)})
            
            else:
                self._send_json_response(404, {"error": f"Endpoint {path} not found"})
        
        def do_POST(self):
            """Обрабатывает POST запросы"""
            path = self.path
            
            if path == '/api/analyze':
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                try:
                    data = json.loads(post_data.decode('utf-8'))
                    print(f"🔍 Анализ запроса: {data.get('method')} {data.get('url')}")
                    
                    result = detector.analyze_request(
                        method=data['method'],
                        url=data['url'],
                        params=data['params'],
                        headers=data.get('headers', {}),
                        sandbox_id=data.get('sandbox_id', 'unknown')
                    )
                    
                    self._send_json_response(200, {
                        "success": True,
                        "data": result
                    })
                    
                except Exception as e:
                    print(f"❌ Ошибка анализа: {e}")
                    self._send_json_response(400, {"error": str(e)})
            
            else:
                self._send_json_response(404, {"error": f"Endpoint {path} not found"})
        
        def log_message(self, format, *args):
            """Отключает стандартное логирование"""
            pass

    app = None

# ===== ЗАПУСК СЕРВЕРА =====
def run_server():
    """Запускает сервер в зависимости от доступных библиотек"""
    if HAS_FASTAPI:
        import uvicorn
        print("\n" + "="*50)
        print("🚀 ЗАПУСК ПОЛНОЦЕННОГО API СЕРВЕРА")
        print("="*50)
        print("📍 Документация: http://localhost:8001/docs")
        print("📍 Главная: http://localhost:8001/")
        print("📍 Здоровье: http://localhost:8001/health")
        print("📍 Статистика: http://localhost:8001/api/stats")
        print("📍 События: http://localhost:8001/api/events")  # НОВОЕ
        print("📍 Атаки: http://localhost:8001/api/attacks")   # НОВОЕ
        print("="*50)
        uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
    else:
        print("\n" + "="*50)
        print("🚀 ЗАПУСК УПРОЩЁННОГО HTTP СЕРВЕРА")
        print("="*50)
        print("📍 Главная: http://localhost:8001/")
        print("📍 Здоровье: http://localhost:8001/health")
        print("📍 Статистика: http://localhost:8001/api/stats")
        print("📍 Анализ: POST http://localhost:8001/api/analyze")
        print("="*50)
        server = HTTPServer(('0.0.0.0', 8001), APIHandler)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Сервер остановлен")

if __name__ == "__main__":
    run_server()