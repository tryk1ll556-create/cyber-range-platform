from datetime import datetime, timezone
from typing import List, Dict, Any


class AttackTimeline:

    def __init__(self):
        self.events: List[Dict[str, Any]] = []

    def record_event(self, attacker_id, ip_address, user_agent, detections, risk):

        # Маппинг типов атак в читаемый формат
        type_map = {
            "SQL_INJECTION": "SQL Injection",
            "XSS": "XSS",
            "PATH_TRAVERSAL": "Path Traversal",
            "COMMAND_INJECTION": "Command Injection",
            "CSRF": "CSRF",
            "FILE_INCLUSION": "File Inclusion",
        }

        detection_names = []
        for d in detections:
            detection_type = d["type"]
            detection_names.append(type_map.get(detection_type, detection_type))

        event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "attacker_id": attacker_id,
            "ip_address": ip_address,
            "risk": risk,
            "detections": detection_names,
        }

        self.events.append(event)

    def get_timeline(self, attacks_only: bool = False):
        events = self.events
        if attacks_only:
            events = [e for e in events if e.get("detections")]
        return events[-50:]