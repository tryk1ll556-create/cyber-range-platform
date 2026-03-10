from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseDetector(ABC):
    """
    Абстрактный базовый класс для всех детекторов атак.
    Каждый детектор обязан реализовать метод detect().
    """

    @abstractmethod
    def detect(self, input_data: str) -> List[Dict[str, Any]]:
        """
        Анализирует входные данные и возвращает список обнаружений.
        """
        pass

    @abstractmethod
    def get_detector_name(self) -> str:
        """
        Возвращает имя детектора.
        """
        pass
