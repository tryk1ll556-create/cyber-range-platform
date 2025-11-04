import os
import re

class BehavioralSQLiVerifier:
    def __init__(self):
        # Это наша "ловушка" — секретный email в БД уязвимого приложения
        self.honeypot_email = "honeypot_cyberrange_12345@test.com"
        self.pattern = re.compile(re.escape(self.honeypot_email), re.IGNORECASE)

    def verify_from_access_log(self, log_file_path: str) -> bool:
        """
        Читает файл логов и ищет нашу ловушку.
        Если нашёл — значит, SQL-инъекция сработала.
        """
        if not os.path.exists(log_file_path):
            return False

        try:
            with open(log_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                for line in f:
                    if self.pattern.search(line):
                        return True
        except Exception as e:
            print(f"⚠️ Ошибка чтения лога {log_file_path}: {e}")
            return False
        return False