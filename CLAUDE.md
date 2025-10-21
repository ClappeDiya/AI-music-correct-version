# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Music Generation and Voice Cloning platform with Django REST backend and Next.js frontend. The application features multi-tenant architecture, real-time audio processing, AI-powered music generation, voice cloning, and comprehensive user management.

**Tech Stack:**
- Backend: Django 5.0.6 + Django REST Framework + PostgreSQL
- Frontend: Next.js 15.1.0 + TypeScript + shadcn/ui
- AI/ML: librosa, spacy, scipy for audio processing
- Task Queue: Celery
- Authentication: JWT (djangorestframework-simplejwt) + django-otp
- Payment: Stripe integration

## Development Environment Setup

### Python Environment (macOS)
**CRITICAL**: Use Python 3.12.x, NOT 3.13+. Python 3.13 has compatibility issues with scipy, tree-sitter-languages, and other scientific packages.

```bash
# Install Python 3.12 via Homebrew
brew install python@3.12

# Create virtual environment
cd backend
/opt/homebrew/bin/python3.12 -m venv .venv
source .venv/bin/activate  # macOS/Linux
```

### Backend Setup

```bash
cd backend

# Install dependencies (Python 3.12 required!)
.venv/bin/pip install --upgrade pip setuptools wheel
.venv/bin/pip install -r requirements.txt

# Additional packages not in requirements.txt (install if missing):
.venv/bin/pip install dj-database-url channels django-otp djangorestframework-simplejwt celery
.venv/bin/pip install spacy librosa pydub tinytag mutagen audioread ffmpeg-python
.venv/bin/pip install anthropic cohere replicate google-cloud-aiplatform

# Start PostgreSQL (Homebrew)
brew services start postgresql@14

# Create database
createdb roo_ai_music_12_02_2025

# Run migrations (use --skip-checks to bypass URL import issues during first setup)
.venv/bin/python manage.py migrate --skip-checks

# Create superuser
DJANGO_SUPERUSER_PASSWORD='password' .venv/bin/python manage.py createsuperuser --username admin --email admin@example.com --noinput

# Run development server
.venv/bin/python manage.py runserver --skip-checks
```

**Important Django Settings:**
- Settings module: `server.settings.development` (set in manage.py)
- Database: PostgreSQL at localhost:5432
- Environment variables loaded from `backend/.env`
- Use `--skip-checks` flag when running server to avoid URL configuration check errors during development

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server (Windows-style commands in package.json)
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

**Frontend URLs:**
- Development: http://localhost:3000
- Redirects to `/auth/login` when not authenticated

## Architecture

### Backend Django Apps Structure

The backend is organized into 30+ Django apps, grouped by functionality:

**Core Applications:**
- `user_management` - Authentication, user profiles, permissions
- `ai_music_generation` - Music generation API, model integration
- `voice_cloning` - Voice cloning and TTS features
- `music_education` - Educational content and tutorials

**AI DJ Platform (`ai_dj`):**
Modular AI DJ system with submodules:
- `ai_dj.modules.monitoring` - Performance monitoring middleware
- `ai_dj.modules.biometrics` - Biometric data integration
- `ai_dj.modules.dj_personas` - AI personality management
- `ai_dj.modules.emotional_journey` - Emotion-based music curation
- `ai_dj.modules.hybrid_dj` - Human-AI collaboration
- `ai_dj.modules.voice_chat` - Voice interaction
- `ai_dj.modules.voice_emotion` - Emotion detection
- `ai_dj.modules.vr_dj` - VR environment support
- `ai_dj.modules.dj_chat` - Text-based AI chat
- `ai_dj.modules.data_privacy` - Privacy controls

**Feature Modules:**
- `genre_mixing` - Genre blending and transitions
- `mood_based_music` - Mood-based recommendations
- `lyrics_generation` - AI-powered lyrics
- `virtual_studio` - DAW-like features
- `social_community` - Social features
- `copyright_free_music` - License-free music catalog
- `data_analytics` - Usage analytics
- `billing_management` - Subscription and payments
- `reports` - Reporting system
- `future_capabilities` - Feature flag management
- `settings_module` - Multi-user settings
- `accessibility_localization` - i18n/a11y
- `admin_tools` - Admin utilities

**Middleware Stack (Order Matters):**
```python
# Standard Django middleware
SecurityMiddleware, SessionMiddleware, CorsMiddleware,
CommonMiddleware, CsrfViewMiddleware, AuthenticationMiddleware,
MessagesMiddleware, ClickjackingMiddleware,

# Custom middleware
ai_dj.middleware.SecurityMiddleware,
ai_dj.modules.monitoring.middleware.PerformanceMonitoringMiddleware,
ai_dj.modules.monitoring.middleware.CacheMiddleware,
virtual_studio.middleware.AuthenticationMiddleware,
music_education.middleware.MusicEducationAuthMiddleware
```

### API URL Structure

Main API routes in `server/urls.py`:

```
/admin/                        - Django admin
/api/v1/                       - API root
  /recommendations/            - Music recommendations
  /analytics/                  - Data analytics
  /music-education/            - Educational content
  /monitoring/                 - System monitoring
  /identity/                   - User identity
  /user-preferences/           - User settings
  /voice-chat/                 - Voice chat
  /dj-chat/                    - Text chat
  /vr-dj/                      - VR features
  /biometrics/                 - Biometric data
  /data-privacy/               - Privacy controls
  /emotional-journey/          - Emotion tracking
  /hybrid-dj/                  - Hybrid DJ
/api/voice_cloning/            - Voice cloning
/api/ai-dj/                    - AI DJ
/api/ai-music-requests/        - Music generation
/api/mood-based-music/         - Mood music
```

### Authentication Flow

1. JWT-based authentication with SimpleJWT
2. Two-factor authentication via django-otp
3. Session-based auth for Django admin
4. Frontend stores JWT in cookies (access + refresh tokens)
5. Middleware: `virtual_studio.middleware.AuthenticationMiddleware` and `music_education.middleware.MusicEducationAuthMiddleware`

### Database

PostgreSQL with multi-tenant support (django-tenants):
- Database: `roo_ai_music_12_02_2025`
- Schema-based isolation for tenants
- Connection pooling via psycopg 3.2.3

### Async Task Processing

Celery task files located in app-specific `tasks.py`:
- `music_education/tasks.py` - Performance analysis, mixing sessions
- Configure Celery broker in `.env` (Redis recommended)

## Common Commands

### Backend

```bash
# Run server (skip URL checks during development)
.venv/bin/python manage.py runserver --skip-checks

# Migrations
.venv/bin/python manage.py makemigrations
.venv/bin/python manage.py migrate --skip-checks

# Create superuser
.venv/bin/python manage.py createsuperuser

# Django shell
.venv/bin/python manage.py shell

# Run tests
.venv/bin/python manage.py test

# Check deployment readiness
.venv/bin/python manage.py check --deploy

# Collect static files
.venv/bin/python manage.py collectstatic --noinput
```

### Frontend

```bash
# Development server
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint

# E2E tests (Playwright)
npm run test
```

## Environment Configuration

### Backend `.env` (backend/.env)

Required variables:
```bash
DJANGO_SETTINGS_MODULE=server.settings.development
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
SECRET_KEY=your-secret-key

# Database
DATABASE_NAME=roo_ai_music_12_02_2025
DATABASE_USER=md
DATABASE_PASSWORD=your-password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=1440

# AI Provider API Keys
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-audio-preview
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...
SUNO_API_KEY=...

# Payment
STRIPE_SECRET_KEY=sk_test_...
```

### Frontend `.env.local` (frontend/.env.local)

Configure API endpoints to point to Django backend:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Key Architectural Patterns

### Multi-Tenant Architecture
- Each tenant has isolated schema via django-tenants
- Tenant context managed by middleware
- Settings stored in `settings_module` app

### AI Provider Abstraction
AI providers (OpenAI, Anthropic, Cohere, Replicate) are abstracted in:
- `mood_based_music/ai_providers.py` - Provider factory pattern
- Supports multiple LLM backends for music generation

### Audio Processing Pipeline
Audio processing uses:
- `librosa` - Feature extraction, audio analysis
- `spacy` - NLP for lyrics/text processing
- `pydub`, `mutagen`, `tinytag` - Audio metadata
- `soundfile` - Audio I/O

### Real-time Features
- Django Channels for WebSocket support
- Used in voice chat, real-time collaboration
- ASGI application configured

### Security Layers
1. Enhanced Django security settings (CSP, HSTS, XSS protection)
2. Custom `ai_dj.middleware.SecurityMiddleware`
3. Rate limiting: `MAX_API_ATTEMPTS_PER_MINUTE = 60`
4. Encryption key for sensitive data
5. Security logging to `logs/security.log`

## Known Issues & Workarounds

### Python 3.13 Incompatibility
**Problem**: scipy, tree-sitter-languages, and other packages don't have pre-built wheels for Python 3.13.
**Solution**: Use Python 3.12.x exclusively.

### Django URL Check Failures
**Problem**: URL imports fail during `manage.py check` due to missing dependencies being imported at module level.
**Solution**: Use `--skip-checks` flag: `python manage.py runserver --skip-checks`

### NumPy Version Conflicts
**Problem**: pylance requires numpy<2.0, but spacy/thinc need numpy>=2.0.
**Solution**: Install numpy 1.26.4 (compatible with most packages): `pip install "numpy<2,>=1.22"`

### Missing Requirements
Some packages are not in `requirements.txt` but are required:
- `dj-database-url` - Database URL parsing
- `channels` - WebSocket support
- `celery` - Task queue
- `anthropic`, `cohere`, `replicate` - AI providers

Install manually if encountering import errors.

## Testing

### Backend Tests
```bash
# Run all tests
.venv/bin/python manage.py test

# Run specific app
.venv/bin/python manage.py test user_management

# Run with coverage
.venv/bin/pip install coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests
```bash
# Playwright E2E tests
npm run test

# Run specific test file
npx playwright test tests/auth.spec.ts
```

## Production Deployment Considerations

1. **Security**: Set `DEBUG=False`, configure proper `SECRET_KEY`, enable SSL redirects
2. **Database**: Use connection pooling, configure backups
3. **Static Files**: Run `collectstatic`, serve via CDN
4. **Celery**: Set up Redis broker, run Celery worker/beat processes
5. **Monitoring**: Enable Sentry (`sentry-sdk` installed)
6. **CORS**: Restrict `CORS_ALLOWED_ORIGINS` to production domains
7. **Environment Variables**: Never commit `.env` files

## Audio File Handling

Supported formats: MP3, WAV, FLAC, OGG, M4A
- Upload processing via `ai_music_generation` app
- Feature extraction: melody, harmony, rhythm, tempo
- Storage: Configure Django storage backend (local/S3/GCS via `django-storages`)

## Multi-Language Support

- `next-i18next` for frontend internationalization
- `django-modeltranslation` for backend model translation
- Locale files in `accessibility_localization` app

## Development Workflow

1. Feature branches from `main`
2. Run migrations after model changes
3. Use `--skip-checks` during active development
4. Test both frontend and backend before committing
5. Ensure PostgreSQL and Redis are running
6. Check logs in `backend/logs/` for security events
