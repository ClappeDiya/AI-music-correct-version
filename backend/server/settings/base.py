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
    'social_django',  # Social authentication
    
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
    'social_django.middleware.SocialAuthExceptionMiddleware',  # Social auth
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
                'social_django.context_processors.backends',  # Social auth
                'social_django.context_processors.login_redirect',  # Social auth
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

# ==================== SOCIAL AUTHENTICATION ====================
# Configuration for social-auth-app-django

AUTHENTICATION_BACKENDS = (
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.github.GithubOAuth2',
    'social_core.backends.apple.AppleIdAuth',
    'django.contrib.auth.backends.ModelBackend',  # Default Django auth
)

# Social Auth URLs
LOGIN_URL = '/auth/login/'
LOGIN_REDIRECT_URL = '/project/dashboard/'
LOGOUT_REDIRECT_URL = '/'
SOCIAL_AUTH_URL_NAMESPACE = 'social'

# Google OAuth2
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.getenv('GOOGLE_OAUTH2_CLIENT_ID', '')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.getenv('GOOGLE_OAUTH2_CLIENT_SECRET', '')
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
]

# GitHub OAuth2
SOCIAL_AUTH_GITHUB_KEY = os.getenv('GITHUB_OAUTH_CLIENT_ID', '')
SOCIAL_AUTH_GITHUB_SECRET = os.getenv('GITHUB_OAUTH_CLIENT_SECRET', '')
SOCIAL_AUTH_GITHUB_SCOPE = ['user:email']

# Apple Sign In
SOCIAL_AUTH_APPLE_ID_CLIENT = os.getenv('APPLE_CLIENT_ID', '')
SOCIAL_AUTH_APPLE_ID_TEAM = os.getenv('APPLE_TEAM_ID', '')
SOCIAL_AUTH_APPLE_ID_KEY = os.getenv('APPLE_KEY_ID', '')
SOCIAL_AUTH_APPLE_ID_SECRET = os.getenv('APPLE_PRIVATE_KEY', '')
SOCIAL_AUTH_APPLE_ID_SCOPE = ['email', 'name']

# Social Auth Pipeline
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
)

# Require email verification
SOCIAL_AUTH_REQUIRE_SOCIAL_AUTH_EMAIL_VERIFICATION = False

# Allow social account linking
SOCIAL_AUTH_ASSOCIATE_BY_EMAIL = True

# Disconnect action
SOCIAL_AUTH_DISCONNECT_PIPELINE = (
    'social_core.pipeline.disconnect.allowed_to_disconnect',
    'social_core.pipeline.disconnect.get_entries',
    'social_core.pipeline.disconnect.revoke_tokens',
    'social_core.pipeline.disconnect.disconnect',
)

# Protected user fields
SOCIAL_AUTH_PROTECTED_USER_FIELDS = ['email']

# JSON web token for API authentication
SOCIAL_AUTH_JSONFIELD_ENABLED = True
