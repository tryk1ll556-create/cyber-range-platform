import re
from typing import Dict, Any, List
from .base_detector import BaseDetector


class SQLInjectionDetector(BaseDetector):
    """
    Продвинутый детектор SQL-инъекций.
    Реализует унифицированный интерфейс BaseDetector.
    """

    def __init__(self):
        self.patterns = {
            "union_based": [
                r"UNION\s+SELECT",
                r"UNION\s+ALL\s+SELECT",
                r"UNION\s+SELECT.*FROM",
                r"UNION\s+SELECT.*WHERE",
            ],
            "error_based": [r"'.*(OR|AND).*=.*", r"'.*;.*--", r"'.*/\*.*\*/"],
            "boolean_based": [
                r"OR\s+1=1",
                r"AND\s+1=1",
                r"OR\s+'1'='1",
                r"AND\s+'1'='1",
            ],
            "stacked_queries": [
                r";\s*DROP\s+TABLE",
                r";\s*INSERT\s+INTO",
                r";\s*UPDATE\s+.*SET",
                r";\s*DELETE\s+FROM",
            ],
        }

        self.risk_levels = {
            "union_based": "HIGH",
            "stacked_queries": "CRITICAL",
            "error_based": "MEDIUM",
            "boolean_based": "LOW",
        }

    def get_detector_name(self) -> str:
        return "SQLInjectionDetector"

    def detect(self, input_data: str) -> List[Dict[str, Any]]:
        """
        Унифицированный метод обнаружения.
        Анализирует строку и возвращает список детекций.
        """
        detections = []

        if not isinstance(input_data, str):
            return detections

        for attack_type, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, input_data, re.IGNORECASE):
                    detection = {
                        "type": "SQL_INJECTION",
                        "subtype": attack_type.upper(),
                        "pattern": pattern,
                        "input_sample": input_data[:200],
                        "risk_level": self.risk_levels.get(attack_type, "LOW"),
                        "confidence": "HIGH",
                        "detector": self.get_detector_name(),
                    }
                    detections.append(detection)
                    break  # один паттерн на подтип

        return detections
