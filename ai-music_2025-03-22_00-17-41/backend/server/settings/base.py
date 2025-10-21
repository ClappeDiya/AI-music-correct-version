import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url
import base64

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from .env file
load_dotenv(os.path.join(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Django URL handling
APPEND_SLASH = True  # Ensure URLs end with a trailing slash (Django default)

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'corsheaders',
    'channels',
    'django_otp',
    'stripe',
    'django_otp.plugins.otp_totp',
    'rest_framework_simplejwt',
    
    # Local apps
    'user_management',
    'ai_music_generation',
    'genre_mixing',
    'multi_user',
    
    # AI DJ Core and Modules
    'ai_dj',
    'ai_dj.modules.biometrics',
    'ai_dj.modules.dj_personas',
    'ai_dj.modules.emotional_journey',
    'ai_dj.modules.hybrid_dj',
    'ai_dj.modules.voice_chat',
    'ai_dj.modules.voice_emotion',
    'ai_dj.modules.vr_dj',
    'ai_dj.modules.dj_chat',
    'ai_dj.modules.data_privacy',
    'ai_dj.modules.monitoring',
    
    # Additional Features
    'voice_cloning',
    'lyrics_generation',
    'virtual_studio',
    'mood_based_music',
    'social_community',
    'music_education',
    'copyright_free_music',
    'data_analytics',
    'accessibility_localization',
    'admin_tools',
    'billing_management',
    'reports',
    'future_capabilities',
    'settings_module',
    'server',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'ai_dj.middleware.SecurityMiddleware',
]

# Security Settings
SECURE_SSL_REDIRECT = False  # Set to True in production
SESSION_COOKIE_SECURE = False  # Set to True in production
CSRF_COOKIE_SECURE = False  # Set to True in production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Rate Limiting
MAX_API_ATTEMPTS_PER_MINUTE = 60

# Security Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'security': {
            'format': '{levelname} {asctime} {message} {extra}',
            'style': '{',
        },
    },
    'handlers': {
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'security.log'),
            'formatter': 'security',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'ai_dj.security': {
            'handlers': ['security_file', 'console'],
            'level': 'WARNING',
            'propagate': True,
        },
    },
}

ROOT_URLCONF = 'server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'server.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Maximum allowed form fields - increased to handle admin forms with many fields
DATA_UPLOAD_MAX_NUMBER_FIELDS = 2000

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'user': '100/day',
        'anon': '20/day',
        'music_generation': '50/day',
        'llm_requests': '100/day',
        'burst': '10/minute',
    },
}

# JWT settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# AI Music Generation API Keys
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
OPENAI_MODEL_NAME = os.getenv('OPENAI_MODEL', 'gpt-4o-audio-preview')

ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', '')
ANTHROPIC_MODEL_NAME = os.getenv('ANTHROPIC_MODEL', 'claude-3-opus-20240229')

MINIMAX_API_KEY = os.getenv('MINIMAX_API_KEY', '')
MINIMAX_MODEL_NAME = os.getenv('MINIMAX_MODEL', 'music-01')

MUBERT_API_KEY = os.getenv('MUBERT_API_KEY', '')
MUBERT_API_BASE = os.getenv('MUBERT_API_BASE', 'https://api.mubert.com/v2')

# Suno API Configuration
SUNO_API_KEY = os.getenv('SUNO_API_KEY', '')
SUNO_API_BASE = os.getenv('SUNO_API_BASE', 'https://apibox.erweima.ai')

# Default AI Provider Configuration
DEFAULT_AI_PROVIDER = os.getenv('DEFAULT_AI_PROVIDER', 'openai')
