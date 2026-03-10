import time
from typing import List, Dict, Any


class AttackTimeline:

    def __init__(self):
        self.events: List[Dict[str, Any]] = []

    def record_event(self, attacker_id, ip_address, user_agent, detections, risk):

        event = {
            "timestamp": time.strftime("%H:%M:%S"),
            "attacker_id": attacker_id,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "risk": risk,
            "detections": [d["type"] for d in detections],
        }

        self.events.append(event)

    def get_timeline(self):

        return self.events[-50:]
