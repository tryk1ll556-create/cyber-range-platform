import re
import json
from typing import List, Dict, Any


class DetectionPipeline:

    # =====================================================
    # SQL INJECTION
    # =====================================================

    SQL_PATTERNS = [
        r"(\%27)|(\')|(\-\-)|(\%23)|(#)",
        r"(?i)(union(\s)+select)",
        r"(?i)(or(\s)+1=1)",
        r"(?i)(drop(\s)+table)",
        r"(?i)(insert(\s)+into)",
        r"(?i)(select(\s)+\*)",
    ]

    # =====================================================
    # XSS
    # =====================================================

    XSS_PATTERNS = [
        r"(?i)<script.*?>.*?</script>",
        r"(?i)javascript:",
        r"(?i)onerror=",
        r"(?i)onload=",
        r"(?i)<img.*?>",
        r"(?i)<svg.*?>",
    ]

    # =====================================================
    # PATH TRAVERSAL
    # =====================================================

    PATH_TRAVERSAL_PATTERNS = [
        r"\.\./",
        r"\.\.\\",
        r"/etc/passwd",
        r"boot.ini",
        r"win.ini",
    ]

    # =====================================================
    # POISON NULL BYTE
    # =====================================================

    NULL_BYTE_PATTERNS = [
        r"%00",
        r"%2500",
        r"\x00",
        r"\0",
        r"\\0",
        r"\u0000",
    ]

    # =====================================================
    # MAIN ANALYZE METHOD
    # =====================================================

    def analyze(
        self,
        method: str,
        url: str,
        params: Dict[str, Any]
    ) -> List[Dict[str, Any]]:

        detections = []

        payload = json.dumps(
            {
                "method": method,
                "url": url,
                "params": params
            },
            ensure_ascii=False
        ).lower()

        # =====================================================
        # SQL INJECTION
        # =====================================================

        for pattern in self.SQL_PATTERNS:

            if re.search(pattern, payload):

                detections.append({
                    "type": "SQL_INJECTION",
                    "risk_level": "HIGH",
                    "pattern": pattern,
                })

        # =====================================================
        # XSS
        # =====================================================

        for pattern in self.XSS_PATTERNS:

            if re.search(pattern, payload):

                detections.append({
                    "type": "XSS",
                    "risk_level": "HIGH",
                    "pattern": pattern,
                })

        # =====================================================
        # PATH TRAVERSAL
        # =====================================================

        for pattern in self.PATH_TRAVERSAL_PATTERNS:

            if re.search(pattern, payload):

                detections.append({
                    "type": "PATH_TRAVERSAL",
                    "risk_level": "HIGH",
                    "pattern": pattern,
                })

        # =====================================================
        # POISON NULL BYTE
        # =====================================================

        for pattern in self.NULL_BYTE_PATTERNS:

            if re.search(pattern, payload):

                detections.append({
                    "type": "POISON_NULL_BYTE",
                    "risk_level": "CRITICAL",
                    "pattern": pattern,
                })

        # =====================================================
        # REMOVE DUPLICATES
        # =====================================================

        unique = []

        seen = set()

        for detection in detections:

            key = (
                detection["type"],
                detection["pattern"]
            )

            if key not in seen:

                seen.add(key)

                unique.append(detection)

        return unique