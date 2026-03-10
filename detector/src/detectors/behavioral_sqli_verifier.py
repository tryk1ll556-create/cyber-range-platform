import os
import re
from typing import List, Dict, Any


class BehavioralSQLiVerifier:
    """
    Поведенческий верификатор SQL-инъекций.
    Проверяет, была ли успешная эксплуатация через honeypot-индикатор.
    """

    def __init__(self):
        # Honeypot-маркер в базе
        self.honeypot_email = "honeypot_cyberrange_12345@test.com"
        self.pattern = re.compile(re.escape(self.honeypot_email), re.IGNORECASE)

    def verify_from_access_log(self, log_file_path: str) -> bool:
        """
        Проверяет лог-файл на наличие honeypot-маркера.
        Если найден — атака была успешной.
        """
        if not log_file_path:
            return False

        if not os.path.exists(log_file_path):
            return False

        try:
            with open(log_file_path, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    if self.pattern.search(line):
                        return True
        except Exception:
            return False

        return False

    def enhance_detections(
        self,
        detections: List[Dict[str, Any]],
        log_file_path: str = None,
    ) -> List[Dict[str, Any]]:
        """
        Усиливает риск детекций, если подтверждена успешная эксплуатация.
        """

        if not detections:
            return detections

        if not self.verify_from_access_log(log_file_path):
            return detections

        # Если honeypot найден — усиливаем SQL-инъекции
        for detection in detections:
            if detection["type"] == "SQL_INJECTION":
                detection["risk_level"] = "CRITICAL"
                detection["confidence"] = "CONFIRMED"
                detection["behavioral_confirmed"] = True

        return detections
