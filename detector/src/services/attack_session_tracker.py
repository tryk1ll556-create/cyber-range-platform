from typing import Dict, Any, List
import time


class AttackSessionTracker:
    """
    Отслеживает серию атак от одного источника.
    Формирует attack sessions.
    """

    SESSION_TIMEOUT = 300  # 5 минут

    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def _get_session(self, attacker_id: str) -> Dict[str, Any]:

        now = time.time()

        if attacker_id not in self.sessions:
            self.sessions[attacker_id] = {
                "first_seen": now,
                "last_seen": now,
                "request_count": 0,
                "detections": [],
            }

        session = self.sessions[attacker_id]

        # если сессия старая — сбрасываем
        if now - session["last_seen"] > self.SESSION_TIMEOUT:
            session = {
                "first_seen": now,
                "last_seen": now,
                "request_count": 0,
                "detections": [],
            }
            self.sessions[attacker_id] = session

        return session

    def update_session(
        self,
        attacker_id: str,
        detections: List[Dict[str, Any]],
    ) -> Dict[str, Any]:

        session = self._get_session(attacker_id)

        session["last_seen"] = time.time()
        session["request_count"] += 1
        session["detections"].extend(detections)

        return session

    def analyze_session(self, attacker_id: str) -> Dict[str, Any]:

        if attacker_id not in self.sessions:
            return {}

        session = self.sessions[attacker_id]

        attack_types = set(d["type"] for d in session["detections"])

        result = {
            "request_count": session["request_count"],
            "attack_types": list(attack_types),
            "attack_campaign": False,
        }

        # Если много атак — считаем кампанией
        if session["request_count"] >= 3 and len(attack_types) >= 2:
            result["attack_campaign"] = True

        return result
