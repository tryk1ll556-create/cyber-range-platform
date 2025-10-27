#!/usr/bin/env python3
"""
ГЛАВНЫЙ МОДУЛЬ СИСТЕМЫ ДЕТЕКТИРОВАНИЯ АТАК
"""

# ПРАВИЛЬНЫЕ ИМПОРТЫ
from detectors.sql_injection import SQLInjectionDetector
from detectors.xss_detector import XSSDetector
from detectors.path_traversal import PathTraversalDetector
from database.db_manager import DatabaseManager

from typing import Dict, Any, List
import json

class CyberRangeDetector:
    """Основной класс системы детектирования"""
    
    def __init__(self):
        self.sql_detector = SQLInjectionDetector()
        self.xss_detector = XSSDetector()
        self.path_traversal_detector = PathTraversalDetector()
        self.db_manager = DatabaseManager()
        
        self.stats = {
            'total_requests': 0,
            'detected_attacks': 0,
            'sql_injections': 0,
            'xss_attacks': 0,
            'path_traversals': 0
        }
    
    def analyze_request(self, method: str, url: str, params: Dict[str, Any], headers: Dict[str, str] = None, sandbox_id: str = None) -> Dict[str, Any]:
        """Анализирует HTTP запрос на различные атаки"""
        self.stats['total_requests'] += 1
        
        all_detections = []
        
        # Анализ SQL-инъекций
        sql_detections = self.sql_detector.analyze_http_request(method, url, params)
        all_detections.extend(sql_detections)
        
        # Анализ XSS
        for param_name, param_value in params.items():
            if isinstance(param_value, str):
                xss_detections = self.xss_detector.detect(param_value)
                for detection in xss_detections:
                    detection['location'] = f'PARAM_{param_name}'
                    all_detections.append(detection)
        
        # Анализ URL на XSS
        xss_url_detections = self.xss_detector.detect(url)
        for detection in xss_url_detections:
            detection['location'] = 'URL'
            all_detections.append(detection)
        
        # Анализ Path Traversal
        for param_name, param_value in params.items():
            if isinstance(param_value, str):
                path_detections = self.path_traversal_detector.detect(param_value)
                for detection in path_detections:
                    detection['location'] = f'PARAM_{param_name}'
                    all_detections.append(detection)
        
        path_url_detections = self.path_traversal_detector.detect(url)
        for detection in path_url_detections:
            detection['location'] = 'URL'
            all_detections.append(detection)
        
        # Сохраняем запрос и обнаружения в базу данных
        request_id = self.db_manager.save_request(method, url, params, sandbox_id)
        if all_detections:
            self.db_manager.save_detections(request_id, all_detections)
        
        # Обновляем статистику в базе
        self.db_manager.update_statistics({
            'total_requests': 1,
            'detected_attacks': 1 if all_detections else 0,
            'sql_injections': len([d for d in all_detections if d['type'] == 'SQL_INJECTION']),
            'xss_attacks': len([d for d in all_detections if d['type'] == 'XSS']),
            'path_traversals': len([d for d in all_detections if d['type'] == 'PATH_TRAVERSAL'])
        })
        
        # Обновляем статистику в памяти
        if all_detections:
            self.stats['detected_attacks'] += 1
            self.stats['sql_injections'] += len([d for d in all_detections if d['type'] == 'SQL_INJECTION'])
            self.stats['xss_attacks'] += len([d for d in all_detections if d['type'] == 'XSS'])
            self.stats['path_traversals'] += len([d for d in all_detections if d['type'] == 'PATH_TRAVERSAL'])
        
        return {
            'request_info': {
                'method': method,
                'url': url,
                'params_count': len(params),
                'request_id': request_id
            },
            'detections': all_detections,
            'summary': {
                'total_detections': len(all_detections),
                'risk_level': self._calculate_risk_level(all_detections),
                'recommendation': self._get_recommendation(all_detections)
            }
        }
    
    def _calculate_risk_level(self, detections: List[Dict[str, Any]]) -> str:
        """Определяет общий уровень риска"""
        if not detections:
            return 'LOW'
        
        risk_scores = {'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1}
        max_risk = max([risk_scores.get(d['risk_level'], 0) for d in detections])
        
        if max_risk >= 4:
            return 'CRITICAL'
        elif max_risk >= 3:
            return 'HIGH'
        elif max_risk >= 2:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _get_recommendation(self, detections: List[Dict[str, Any]]) -> str:
        """Возвращает рекомендации по безопасности"""
        if not detections:
            return "Запрос безопасен"
        
        attack_types = set([d['type'] for d in detections])
        
        recommendations = []
        if 'SQL_INJECTION' in attack_types:
            recommendations.append("Используйте параметризованные запросы для защиты от SQL-инъекций")
        if 'XSS' in attack_types:
            recommendations.append("Применяйте экранирование вывода для защиты от XSS")
        if 'PATH_TRAVERSAL' in attack_types:
            recommendations.append("Валидируйте входные параметры файловых путей")
        
        return "; ".join(recommendations)
    
    def get_stats(self) -> Dict[str, Any]:
        """Возвращает статистику работы системы"""
        return self.stats
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Возвращает статистику из базы данных"""
        return self.db_manager.get_daily_stats()
    
    def get_recent_detections(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Возвращает последние обнаруженные атаки из базы данных"""
        return self.db_manager.get_recent_detections(limit)

# ТЕСТИРОВАНИЕ СИСТЕМЫ
def main():
    print("🔍 ЗАПУСК СИСТЕМЫ ДЕТЕКТИРОВАНИЯ АТАК")
    print("=" * 60)
    
    detector = CyberRangeDetector()
    
    # Тестовые запросы
    test_requests = [
        {
            'method': 'GET',
            'url': '/search',
            'params': {'q': "apple"},
            'sandbox_id': 'sandbox_001'
        },
        {
            'method': 'GET', 
            'url': '/login',
            'params': {'username': "admin' OR 1=1--", 'password': "123"},
            'sandbox_id': 'sandbox_001'
        },
        {
            'method': 'POST',
            'url': '/comment',
            'params': {'text': "<script>alert('XSS')</script>"},
            'sandbox_id': 'sandbox_002'
        },
        {
            'method': 'GET',
            'url': '/user?id=1; DROP TABLE users--',
            'params': {},
            'sandbox_id': 'sandbox_001'
        },
        {
            'method': 'GET',
            'url': '/download',
            'params': {'file': "../../etc/passwd"},
            'sandbox_id': 'sandbox_003'
        }
    ]
    
    for i, request in enumerate(test_requests, 1):
        print(f"\n📨 ТЕСТОВЫЙ ЗАПРОС #{i}:")
        print(f"   Метод: {request['method']}")
        print(f"   URL: {request['url']}")
        print(f"   Параметры: {request['params']}")
        print(f"   Sandbox ID: {request['sandbox_id']}")
        
        result = detector.analyze_request(**request)
        
        print(f"\n   📊 РЕЗУЛЬТАТЫ:")
        print(f"   ID запроса: {result['request_info']['request_id']}")
        print(f"   Уровень риска: {result['summary']['risk_level']}")
        print(f"   Обнаружено угроз: {result['summary']['total_detections']}")
        print(f"   Рекомендация: {result['summary']['recommendation']}")
        
        if result['detections']:
            print(f"\n   🚨 ОБНАРУЖЕННЫЕ АТАКИ:")
            for detection in result['detections']:
                print(f"     - {detection['type']} ({detection.get('subtype', 'DIRECT')})")
                print(f"       Риск: {detection['risk_level']} | Локация: {detection['location']}")
    
    # Вывод статистики из памяти
    print("\n" + "=" * 60)
    print("📈 СТАТИСТИКА РАБОТЫ СИСТЕМЫ (в памяти):")
    stats = detector.get_stats()
    print(f"   Всего запросов: {stats['total_requests']}")
    print(f"   Запросов с атаками: {stats['detected_attacks']}")
    print(f"   SQL-инъекций: {stats['sql_injections']}")
    print(f"   XSS атак: {stats['xss_attacks']}")
    print(f"   Path Traversal атак: {stats['path_traversals']}")
    
    # Вывод статистики из базы данных
    print("\n📊 СТАТИСТИКА ИЗ БАЗЫ ДАННЫХ (за сегодня):")
    db_stats = detector.get_database_stats()
    print(f"   Всего запросов: {db_stats['total_requests']}")
    print(f"   Запросов с атаками: {db_stats['detected_attacks']}")
    print(f"   SQL-инъекций: {db_stats['sql_injections']}")
    print(f"   XSS атак: {db_stats['xss_attacks']}")
    print(f"   Path Traversal атак: {db_stats['path_traversals']}")
    
    # Вывод последних обнаружений из базы
    print("\n🕒 ПОСЛЕДНИЕ ОБНАРУЖЕННЫЕ АТАКИ:")
    recent_detections = detector.get_recent_detections(3)
    for detection in recent_detections:
        print(f"   - {detection['method']} {detection['url']}")
        print(f"     {detection['type']} ({detection['subtype']}) | Риск: {detection['risk_level']}")
    
    print("=" * 60)

if __name__ == "__main__":
    main()