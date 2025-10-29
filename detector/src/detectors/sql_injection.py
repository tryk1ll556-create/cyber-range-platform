import re
from typing import Dict, Any, Tuple, List

class SQLInjectionDetector:
    """Продвинутый детектор SQL-инъекций"""
    
    def __init__(self):
        self.patterns = {
            'union_based': [
                r"UNION\s+SELECT",
                r"UNION\s+ALL\s+SELECT",
                r"UNION\s+SELECT.*FROM",
                r"UNION\s+SELECT.*WHERE"
            ],
            'error_based': [
                r"'.*(OR|AND).*=.*",
                r"'.*;.*--",
                r"'.*/\*.*\*/"
            ],
            'boolean_based': [
                r"OR\s+1=1",
                r"AND\s+1=1", 
                r"OR\s+'1'='1",
                r"AND\s+'1'='1"
            ],
            'stacked_queries': [
                r";\s*DROP\s+TABLE",
                r";\s*INSERT\s+INTO",
                r";\s*UPDATE\s+.*SET",
                r";\s*DELETE\s+FROM"
            ]
        }
        
        self.risk_levels = {
            'union_based': 'HIGH',
            'stacked_queries': 'CRITICAL', 
            'error_based': 'MEDIUM',
            'boolean_based': 'LOW'
        }
    
    def detect(self, text: str) -> List[Dict[str, Any]]:
        """Обнаруживает SQL-инъекции в тексте"""
        detections = []
        
        for attack_type, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    detection = {
                        'type': 'SQL_INJECTION',
                        'subtype': attack_type.upper(),
                        'pattern': pattern,
                        'input_sample': text[:100],  # первые 100 символов
                        'risk_level': self.risk_levels[attack_type],
                        'confidence': 'HIGH'
                    }
                    detections.append(detection)
                    break  # не ищем другие паттерны этого типа
        
        return detections
    
    def analyze_http_request(self, method: str, url: str, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Анализирует HTTP запрос на SQL-инъекции"""
        all_detections = []
        
        # Проверяем URL
        url_detections = self.detect(url)
        for detection in url_detections:
            detection['location'] = 'URL'
            all_detections.append(detection)
        
        # Проверяем параметры запроса
        for param_name, param_value in params.items():
            if isinstance(param_value, str):
                param_detections = self.detect(param_value)
                for detection in param_detections:
                    detection['location'] = f'PARAM_{param_name}'
                    all_detections.append(detection)
        
        return all_detections

# Пример использования
if __name__ == "__main__":
    detector = SQLInjectionDetector()
    
    # Тестовые примеры
    test_cases = [
        "admin' OR 1=1--",
        "test' UNION SELECT username, password FROM users--",
        "123'; DROP TABLE users--",
        "normal_input"
    ]
    
    for test in test_cases:
        print(f"Анализируем: {test}")
        results = detector.detect(test)
        for result in results:
            print(f"  🚨 Обнаружено: {result['subtype']} | Риск: {result['risk_level']}")
        
        if not results:
            print("  ✅ Угроз не обнаружено")
        print()