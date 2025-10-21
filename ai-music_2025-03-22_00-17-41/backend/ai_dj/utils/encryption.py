from cryptography.fernet import Fernet
from django.conf import settings
import base64
import os
import re

def get_encryption_key():
    """
    Get or generate the encryption key.
    Uses the ENCRYPTION_KEY from settings if available, otherwise generates a new one.
    """
    key = getattr(settings, 'ENCRYPTION_KEY', None)
    if not key:
        key = base64.urlsafe_b64encode(os.urandom(32))
        # Store the key securely or notify admin to add it to settings
    return key

def encrypt(data: str) -> str:
    """
    Encrypt sensitive data using Fernet (symmetric encryption).
    
    Args:
        data: The string data to encrypt
        
    Returns:
        str: The encrypted data as a base64 string
    """
    if not data:
        return data
        
    try:
        key = get_encryption_key()
        f = Fernet(key)
        return f.encrypt(data.encode()).decode()
    except Exception as e:
        # Log the error but don't expose encryption details
        logger.error("Encryption error occurred", extra={'error_type': type(e).__name__})
        raise ValueError("Failed to encrypt data")

def decrypt(encrypted_data: str) -> str:
    """
    Decrypt data that was encrypted using encrypt().
    
    Args:
        encrypted_data: The encrypted string to decrypt
        
    Returns:
        str: The decrypted data
    """
    if not encrypted_data:
        return encrypted_data
        
    try:
        key = get_encryption_key()
        f = Fernet(key)
        return f.decrypt(encrypted_data.encode()).decode()
    except Exception as e:
        # Log the error but don't expose encryption details
        logger.error("Decryption error occurred", extra={'error_type': type(e).__name__})
        raise ValueError("Failed to decrypt data")

def encrypt_voice_command(command: str) -> str:
    """
    Specifically encrypt voice command data with additional validation.
    
    Args:
        command: The voice command to encrypt
        
    Returns:
        str: The encrypted command
    """
    if not isinstance(command, str):
        raise ValueError("Voice command must be a string")
        
    # Remove any sensitive patterns before encryption
    command = sanitize_voice_command(command)
    return encrypt(command)

def decrypt_voice_command(encrypted_command: str) -> str:
    """
    Specifically decrypt voice command data with validation.
    
    Args:
        encrypted_command: The encrypted voice command
        
    Returns:
        str: The decrypted command
    """
    decrypted = decrypt(encrypted_command)
    # Validate the decrypted command
    if not is_valid_voice_command(decrypted):
        raise ValueError("Invalid voice command format")
    return decrypted

def sanitize_voice_command(command: str) -> str:
    """
    Remove any potentially sensitive information from voice commands.
    
    Args:
        command: The voice command to sanitize
        
    Returns:
        str: The sanitized command
    """
    # Remove any patterns that might contain sensitive data
    # This is a basic implementation - expand based on requirements
    sensitive_patterns = [
        r'\b\d{4}\b',  # 4-digit numbers (potential pins)
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # email addresses
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # phone numbers
    ]
    
    sanitized = command
    for pattern in sensitive_patterns:
        sanitized = re.sub(pattern, '[REDACTED]', sanitized)
    return sanitized

def is_valid_voice_command(command: str) -> bool:
    """
    Validate that a voice command meets security requirements.
    
    Args:
        command: The voice command to validate
        
    Returns:
        bool: True if the command is valid
    """
    if not command:
        return False
        
    # Add validation rules as needed
    max_length = 1000  # Maximum reasonable length for a voice command
    if len(command) > max_length:
        return False
        
    # Check for any dangerous patterns
    dangerous_patterns = [
        r'<script',
        r'javascript:',
        r'data:',
        r'vbscript:',
    ]
    
    return not any(re.search(pattern, command.lower()) for pattern in dangerous_patterns) 