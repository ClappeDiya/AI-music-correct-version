import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url
import base64

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Add the backend directory to the Python path
sys.path.insert(0, str(BASE_DIR))

# Load environment variables from .env file
env_path = os.path.join(BASE_DIR, '.env')
load_dotenv(env_path)

# Print debug information
print(f"Loading .env from: {env_path}")
print(f"DEBUG env value: {os.getenv('DEBUG')}")

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True  # Force DEBUG to True for development

ALLOWED_HOSTS = ['localhost', '127.0.0.1']  # Default development hosts

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
    'django_filters',
    
    # Local apps
    'user_management',
    'ai_music_generation',
    'genre_mixing',
    'music_education',
    
    # AI DJ Core and Modules
    'ai_dj',
    'ai_dj.modules.monitoring',
    'ai_dj.modules.biometrics',
    'ai_dj.modules.dj_personas',
    'ai_dj.modules.emotional_journey',
    'ai_dj.modules.hybrid_dj',
    'ai_dj.modules.voice_chat',
    'ai_dj.modules.voice_emotion',
    'ai_dj.modules.vr_dj',
    'ai_dj.modules.dj_chat',
    'ai_dj.modules.data_privacy',
    
    # Additional Features
    'voice_cloning',
    'lyrics_generation',
    'virtual_studio',
    'mood_based_music',
    'social_community',
    'copyright_free_music',
    'data_analytics',
    'accessibility_localization',
    'admin_tools',
    'billing_management',
    'reports',
    'future_capabilities',
    'settings_module',
    'backend',
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
    'ai_dj.modules.monitoring.middleware.PerformanceMonitoringMiddleware',
    'ai_dj.modules.monitoring.middleware.CacheMiddleware',
    'virtual_studio.middleware.AuthenticationMiddleware',
    'music_education.middleware.MusicEducationAuthMiddleware',
]

# Enhanced Security Settings
SECURE_SSL_REDIRECT = False  # Set to False for local development
SESSION_COOKIE_SECURE = False  # Set to False for local development
CSRF_COOKIE_SECURE = False  # Set to False for local development
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
        'virtual_studio.auth': {
            'handlers': ['security_file', 'console'],
            'level': 'WARNING',
            'propagate': True,
        },
    },
}

# Encryption Settings
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', base64.urlsafe_b64encode(os.urandom(32)).decode())

ROOT_URLCONF = 'backend.urls'

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

WSGI_APPLICATION = 'backend.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'roo_ai_music_12_02_2025',
        'USER': 'md',
        'PASSWORD': 'dami44',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # For development only
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js development server
]

# Session settings
SESSION_COOKIE_SAMESITE = 'Lax'  # Allows cookies to work with redirects
SESSION_COOKIE_SECURE = False   # Set to True in production
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_AGE = 60 * 60 * 24  # 24 hours in seconds

# CSRF settings
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = False  # Set to True in production
CSRF_COOKIE_HTTPONLY = False  # JavaScript needs access
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000"]
CSRF_USE_SESSIONS = False

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'FORMAT_SUFFIX_KWARG': 'format',  # Add this line to fix the AttributeError
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'EXCEPTION_HANDLER': 'backend.utils.custom_exception_handler',
}

# JWT settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),  # Extended for development
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer', 'JWT'),  # Support both Bearer and JWT prefixes
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
}

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
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'user_management.User'

# Channels
ASGI_APPLICATION = 'backend.routing.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

# WebSocket URL
WEBSOCKET_URL = 'ws://localhost:8000/ws'

# OpenAI Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')  # Add OpenAI key configuration

# Caching Configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Celery Configuration for Background Tasks
CELERY_BROKER_URL = 'redis://127.0.0.1:6379/2'
CELERY_RESULT_BACKEND = 'redis://127.0.0.1:6379/2'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Auto-scaling Configuration
AUTO_SCALING = {
    'MIN_INSTANCES': 1,
    'MAX_INSTANCES': 10,
    'SCALE_UP_CPU_THRESHOLD': 80,
    'SCALE_DOWN_CPU_THRESHOLD': 30,
    'SCALE_UP_MEMORY_THRESHOLD': 85,
    'SCALE_DOWN_MEMORY_THRESHOLD': 40,
}
