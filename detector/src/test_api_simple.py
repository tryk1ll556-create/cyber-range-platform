import urllib.request
import json
import time

def test_api_simple():
    """Простой тест API без использования requests"""
    
    # URL твоего API сервера (порт 8001!)
    api_url = "http://localhost:8001"
    
    print("🔍 Тестируем API сервер...")
    print(f"📡 URL: {api_url}")
    
    try:
        # Тест 1: Проверка здоровья сервера
        print("\n1. Проверка здоровья сервера...")
        health_url = f"{api_url}/health"
        
        with urllib.request.urlopen(health_url) as response:
            data = response.read().decode('utf-8')
            result = json.loads(data)
            print(f"✅ Health check: {result}")
        
        # Тест 2: Отправка тестового события
        print("\n2. Отправка тестового события...")
        event_url = f"{api_url}/api/events"
        
        # Создаем тестовое событие
        test_event = {
            "timestamp": time.time(),
            "event_type": "test_connection",
            "source_ip": "192.168.1.100",
            "destination_ip": "10.0.0.1",
            "description": "Тестовое событие от детектора"
        }
        
        # Кодируем данные в JSON
        json_data = json.dumps(test_event).encode('utf-8')
        
        # Создаем запрос
        req = urllib.request.Request(
            event_url,
            data=json_data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        # Отправляем запрос
        with urllib.request.urlopen(req) as response:
            data = response.read().decode('utf-8')
            result = json.loads(data)
            print(f"✅ Событие отправлено: {result}")

        # Тест 3: Проверка статистики
        print("\n3. Проверка статистики...")
        stats_url = f"{api_url}/api/stats"
        
        with urllib.request.urlopen(stats_url) as response:
            data = response.read().decode('utf-8')
            result = json.loads(data)
            print(f"✅ Статистика: {result}")
            
        print("\n🎉 Все тесты пройдены успешно! API сервер работает корректно!")
            
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        print("Проверь, что API сервер запущен на localhost:8001")

if __name__ == "__main__":
    test_api_simple()