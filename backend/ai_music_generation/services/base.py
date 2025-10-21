"""
Base service class for AI music generation services.
"""
from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)


class BaseAIService(ABC):
    """
    Base class for AI services in the music generation system.
    """
    
    def __init__(self):
        """Initialize the service."""
        self.logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")

    @abstractmethod
    def process(self, *args, **kwargs):
        """
        Process the input data.
        Must be implemented by child classes.
        """
        pass

    def validate_input(self, data):
        """
        Validate input data.
        Override in child classes for specific validation.
        """
        if data is None:
            raise ValueError("Input data cannot be None")
        return True

    def handle_error(self, error):
        """
        Handle and log errors.
        """
        self.logger.error(f"Error in {self.__class__.__name__}: {str(error)}")
        return {
            'error': str(error),
            'success': False
        }

    def preprocess_data(self, data):
        """
        Preprocess input data.
        Override in child classes for specific preprocessing.
        """
        return data

    def postprocess_results(self, results):
        """
        Postprocess results.
        Override in child classes for specific postprocessing.
        """
        return results
