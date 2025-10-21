# Implementation Guide
## Step-by-Step Guide to Building the Unified Music Generation System

### Phase 1: Core Infrastructure (Week 1-2)

## 1.1 Database Schema Design

### Create Unified Models

```python
# backend/music_generation_unified/models.py

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

User = get_user_model()

class UnifiedComposition(models.Model):
    """
    Central composition model that tracks entire music creation lifecycle
    """
    # Production stages
    STAGE_CHOICES = [
        ('ideation', 'Ideation & Enhancement'),
        ('composition', 'Composition'),
        ('arrangement', 'Arrangement'),
        ('production', 'Production'),
        ('mixing', 'Mixing'),
        ('mastering', 'Mastering'),
        ('finalization', 'Finalization')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='compositions')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # Current stage and history
    current_stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='ideation')
    stage_history = models.JSONField(default=list)  # Track all stage transitions

    # Shared context that flows through all stages
    context = models.JSONField(default=dict)
    """
    Structure:
    {
        'musical': {...},
        'technical': {...},
        'creative': {...},
        'ai_decisions': {...}
    }
    """

    # Stage-specific data
    stage_data = models.JSONField(default=dict)
    """
    Structure:
    {
        'ideation': {...},
        'composition': {...},
        'arrangement': {...},
        'production': {...},
        'mixing': {...},
        'mastering': {...}
    }
    """

    # Version control
    version = models.PositiveIntegerField(default=1)
    parent_version = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)
    is_main_version = models.BooleanField(default=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Collaboration
    collaborators = models.ManyToManyField(User, related_name='collaborated_compositions', blank=True)
    is_public = models.BooleanField(default=False)

    # Status
    is_active = models.BooleanField(default=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', 'current_stage']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_public', 'is_active'])
        ]

    def __str__(self):
        return f"{self.title} - v{self.version} ({self.current_stage})"


class CompositionMedia(models.Model):
    """
    Stores all media files associated with a composition
    """
    MEDIA_TYPES = [
        ('audio_wav', 'Audio WAV'),
        ('audio_mp3', 'Audio MP3'),
        ('midi', 'MIDI'),
        ('stems', 'Stems'),
        ('reference', 'Reference Track'),
        ('preview', 'Preview')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    composition = models.ForeignKey(UnifiedComposition, on_delete=models.CASCADE, related_name='media_files')
    stage = models.CharField(max_length=20, choices=UnifiedComposition.STAGE_CHOICES)
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPES)
    file = models.FileField(upload_to='compositions/%Y/%m/%d/')
    metadata = models.JSONField(default=dict)  # Duration, format, bitrate, etc.
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['stage', 'created_at']


class PromptEnhancement(models.Model):
    """
    Tracks prompt enhancement history and results
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    composition = models.ForeignKey(UnifiedComposition, on_delete=models.CASCADE, related_name='enhancements')
    original_prompt = models.TextField()
    enhanced_prompt = models.TextField()
    enhancement_method = models.CharField(max_length=50, default='chain_of_thought')
    parameters = models.JSONField(default=dict)
    reasoning_trace = models.JSONField(default=list)  # Step-by-step reasoning
    confidence_score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
    user_accepted = models.BooleanField(null=True)  # True if accepted, False if rejected, None if auto
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class AIProviderTask(models.Model):
    """
    Tracks all AI provider calls and results
    """
    PROVIDERS = [
        ('suno', 'Suno'),
        ('udio', 'Udio'),
        ('musicgen', 'MusicGen'),
        ('openai', 'OpenAI'),
        ('anthropic', 'Anthropic'),
        ('stable_audio', 'Stable Audio')
    ]

    TASK_TYPES = [
        ('generation', 'Music Generation'),
        ('enhancement', 'Prompt Enhancement'),
        ('analysis', 'Audio Analysis'),
        ('transformation', 'Audio Transformation')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    composition = models.ForeignKey(UnifiedComposition, on_delete=models.CASCADE, related_name='ai_tasks')
    provider = models.CharField(max_length=20, choices=PROVIDERS)
    task_type = models.CharField(max_length=20, choices=TASK_TYPES)
    stage = models.CharField(max_length=20, choices=UnifiedComposition.STAGE_CHOICES)

    # Request/Response
    request_params = models.JSONField()
    response_data = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    # Metrics
    duration_ms = models.IntegerField(null=True)  # Processing time
    tokens_used = models.IntegerField(null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=4, null=True)

    # Status
    status = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['composition', 'provider']),
            models.Index(fields=['status', 'created_at'])
        ]
```

### 1.2 State Machine Implementation

```python
# backend/music_generation_unified/state_machine.py

from enum import Enum
from typing import Optional, List, Dict
from django.db import transaction
import logging

logger = logging.getLogger(__name__)


class ProductionStage(Enum):
    IDEATION = 'ideation'
    COMPOSITION = 'composition'
    ARRANGEMENT = 'arrangement'
    PRODUCTION = 'production'
    MIXING = 'mixing'
    MASTERING = 'mastering'
    FINALIZATION = 'finalization'


class InvalidTransitionError(Exception):
    pass


class ProductionStateMachine:
    """
    Manages the flow through music production stages
    """

    # Define valid transitions
    TRANSITIONS = {
        ProductionStage.IDEATION: [ProductionStage.COMPOSITION],
        ProductionStage.COMPOSITION: [ProductionStage.ARRANGEMENT, ProductionStage.IDEATION],
        ProductionStage.ARRANGEMENT: [ProductionStage.PRODUCTION, ProductionStage.COMPOSITION],
        ProductionStage.PRODUCTION: [ProductionStage.MIXING, ProductionStage.ARRANGEMENT],
        ProductionStage.MIXING: [ProductionStage.MASTERING, ProductionStage.PRODUCTION],
        ProductionStage.MASTERING: [ProductionStage.FINALIZATION, ProductionStage.MIXING],
        ProductionStage.FINALIZATION: [ProductionStage.MASTERING]
    }

    def __init__(self, composition):
        self.composition = composition
        self.current_stage = ProductionStage(composition.current_stage)

    def can_transition_to(self, target_stage: ProductionStage) -> bool:
        """Check if transition to target stage is valid"""
        valid_transitions = self.TRANSITIONS.get(self.current_stage, [])
        return target_stage in valid_transitions

    def get_valid_transitions(self) -> List[ProductionStage]:
        """Get list of valid next stages"""
        return self.TRANSITIONS.get(self.current_stage, [])

    @transaction.atomic
    def transition_to(self, target_stage: ProductionStage, context_updates: Dict = None):
        """
        Perform state transition with validation and context preservation
        """
        if not self.can_transition_to(target_stage):
            raise InvalidTransitionError(
                f"Cannot transition from {self.current_stage.value} to {target_stage.value}"
            )

        # Save current stage data
        self._save_stage_data()

        # Update stage history
        stage_history = self.composition.stage_history or []
        stage_history.append({
            'from': self.current_stage.value,
            'to': target_stage.value,
            'timestamp': timezone.now().isoformat(),
            'context_snapshot': self.composition.context
        })
        self.composition.stage_history = stage_history

        # Update current stage
        self.composition.current_stage = target_stage.value
        self.current_stage = target_stage

        # Update context if provided
        if context_updates:
            current_context = self.composition.context or {}
            current_context.update(context_updates)
            self.composition.context = current_context

        # Initialize new stage
        self._initialize_stage(target_stage)

        self.composition.save()

        logger.info(f"Composition {self.composition.id} transitioned from {self.current_stage.value} to {target_stage.value}")

    def _save_stage_data(self):
        """Save current stage data before transition"""
        stage_data = self.composition.stage_data or {}
        # Implementation specific to each stage
        stage_data[self.current_stage.value] = {
            'completed_at': timezone.now().isoformat(),
            # Add stage-specific data
        }
        self.composition.stage_data = stage_data

    def _initialize_stage(self, stage: ProductionStage):
        """Initialize new stage with default values"""
        stage_data = self.composition.stage_data or {}
        stage_data[stage.value] = {
            'started_at': timezone.now().isoformat(),
            'status': 'in_progress'
        }
        self.composition.stage_data = stage_data

    def get_stage_progress(self) -> Dict:
        """Get progress through all stages"""
        stages = list(ProductionStage)
        current_index = stages.index(self.current_stage)

        return {
            'current': self.current_stage.value,
            'completed': [s.value for s in stages[:current_index]],
            'remaining': [s.value for s in stages[current_index + 1:]],
            'progress_percentage': (current_index / len(stages)) * 100
        }
```

### 1.3 Context Manager

```python
# backend/music_generation_unified/context_manager.py

from typing import Dict, Any, Optional
import json


class CompositionContextManager:
    """
    Manages shared context that flows through all production stages
    """

    def __init__(self, composition):
        self.composition = composition
        self._context = composition.context or self._get_default_context()

    def _get_default_context(self) -> Dict:
        """Initialize with default context structure"""
        return {
            'musical': {
                'key': None,
                'scale': None,
                'tempo': 120,
                'time_signature': '4/4',
                'genre': [],
                'mood': {'valence': 0.5, 'arousal': 0.5},
                'structure': [],
                'chord_progression': {},
                'instruments': []
            },
            'technical': {
                'sample_rate': 48000,
                'bit_depth': 24,
                'channels': 2,
                'format': 'wav',
                'duration': None,
                'loudness_target': -14  # LUFS for streaming
            },
            'creative': {
                'inspiration': '',
                'references': [],
                'constraints': {},
                'preferences': {},
                'style_modifiers': []
            },
            'ai_decisions': {
                'prompt_enhancement': {},
                'generation_params': {},
                'model_selections': {},
                'processing_history': []
            }
        }

    def get(self, path: str, default: Any = None) -> Any:
        """
        Get value from context using dot notation
        Example: get('musical.tempo') returns 120
        """
        keys = path.split('.')
        value = self._context

        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default

        return value

    def set(self, path: str, value: Any):
        """
        Set value in context using dot notation
        Example: set('musical.tempo', 140)
        """
        keys = path.split('.')
        context = self._context

        # Navigate to the parent dict
        for key in keys[:-1]:
            if key not in context:
                context[key] = {}
            context = context[key]

        # Set the value
        context[keys[-1]] = value

        # Save to database
        self._save()

    def update(self, updates: Dict):
        """Update multiple context values at once"""
        def deep_merge(base: Dict, updates: Dict):
            for key, value in updates.items():
                if isinstance(value, dict) and key in base and isinstance(base[key], dict):
                    deep_merge(base[key], value)
                else:
                    base[key] = value

        deep_merge(self._context, updates)
        self._save()

    def add_to_list(self, path: str, value: Any):
        """Add item to a list in context"""
        current = self.get(path, [])
        if not isinstance(current, list):
            current = [current] if current else []
        current.append(value)
        self.set(path, current)

    def _save(self):
        """Save context back to composition"""
        self.composition.context = self._context
        self.composition.save(update_fields=['context', 'updated_at'])

    def get_stage_context(self, stage: str) -> Dict:
        """Get context relevant to a specific stage"""
        stage_contexts = {
            'composition': ['musical.key', 'musical.tempo', 'musical.genre', 'musical.mood'],
            'arrangement': ['musical.structure', 'musical.chord_progression', 'creative.references'],
            'production': ['musical.instruments', 'creative.style_modifiers', 'technical.format'],
            'mixing': ['technical.channels', 'musical.instruments', 'creative.preferences'],
            'mastering': ['technical.loudness_target', 'technical.format', 'technical.sample_rate']
        }

        relevant_paths = stage_contexts.get(stage, [])
        return {path: self.get(path) for path in relevant_paths}

    def validate(self) -> Dict[str, Any]:
        """Validate context completeness for current stage"""
        stage = self.composition.current_stage
        required_fields = self._get_required_fields(stage)

        missing = []
        for field in required_fields:
            if self.get(field) is None:
                missing.append(field)

        return {
            'valid': len(missing) == 0,
            'missing_fields': missing,
            'completeness': (len(required_fields) - len(missing)) / len(required_fields) * 100
        }

    def _get_required_fields(self, stage: str) -> List[str]:
        """Get required context fields for a stage"""
        requirements = {
            'ideation': [],
            'composition': ['musical.tempo', 'musical.key'],
            'arrangement': ['musical.structure', 'musical.chord_progression'],
            'production': ['musical.instruments', 'technical.duration'],
            'mixing': ['technical.channels', 'technical.sample_rate'],
            'mastering': ['technical.loudness_target', 'technical.format'],
            'finalization': ['technical.format']
        }
        return requirements.get(stage, [])
```

### Phase 2: Service Layer Architecture

## 2.1 Unified AI Router

```python
# backend/music_generation_unified/services/ai_router.py

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import asyncio
import logging

logger = logging.getLogger(__name__)


class AIProvider(ABC):
    """Base class for all AI providers"""

    @abstractmethod
    async def generate(self, params: Dict) -> Dict:
        pass

    @abstractmethod
    def supports_task(self, task_type: str) -> bool:
        pass

    @abstractmethod
    def get_capabilities(self) -> Dict:
        pass


class SunoProvider(AIProvider):
    """Suno V5 provider for complete song generation"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.suno.ai/v5"

    async def generate(self, params: Dict) -> Dict:
        # Implementation for Suno API
        pass

    def supports_task(self, task_type: str) -> bool:
        return task_type in ['full_song', 'vocal_generation', 'complete_track']

    def get_capabilities(self) -> Dict:
        return {
            'max_duration': 240,
            'supports_vocals': True,
            'supports_instruments': True,
            'quality': 'high',
            'generation_speed': 'fast'
        }


class UnifiedAIRouter:
    """
    Single routing system for all AI providers
    """

    def __init__(self):
        self.providers = {}
        self._initialize_providers()

    def _initialize_providers(self):
        """Initialize all available providers"""
        from django.conf import settings

        if settings.SUNO_API_KEY:
            self.providers['suno'] = SunoProvider(settings.SUNO_API_KEY)

        if settings.UDIO_API_KEY:
            self.providers['udio'] = UdioProvider(settings.UDIO_API_KEY)

        if settings.OPENAI_API_KEY:
            self.providers['openai'] = OpenAIProvider(settings.OPENAI_API_KEY)

        # Add more providers as needed

    async def route_request(self, task_type: str, params: Dict,
                          preferred_provider: Optional[str] = None) -> Dict:
        """
        Route request to appropriate provider
        """
        # Select provider
        provider = self._select_provider(task_type, preferred_provider)

        if not provider:
            raise ValueError(f"No provider available for task type: {task_type}")

        # Log routing decision
        logger.info(f"Routing {task_type} to {provider.__class__.__name__}")

        # Execute request
        try:
            result = await provider.generate(params)
            return {
                'provider': provider.__class__.__name__,
                'result': result,
                'success': True
            }
        except Exception as e:
            logger.error(f"Provider {provider.__class__.__name__} failed: {str(e)}")

            # Try fallback provider
            fallback = self._get_fallback_provider(task_type, provider)
            if fallback:
                logger.info(f"Trying fallback provider: {fallback.__class__.__name__}")
                result = await fallback.generate(params)
                return {
                    'provider': fallback.__class__.__name__,
                    'result': result,
                    'success': True,
                    'fallback_used': True
                }

            raise

    def _select_provider(self, task_type: str,
                        preferred: Optional[str] = None) -> Optional[AIProvider]:
        """Select best provider for task"""
        # Try preferred provider first
        if preferred and preferred in self.providers:
            provider = self.providers[preferred]
            if provider.supports_task(task_type):
                return provider

        # Find best provider based on task type
        task_provider_map = {
            'full_song': ['suno', 'udio'],
            'instrumental': ['musicgen', 'stable_audio'],
            'vocals': ['udio', 'suno'],
            'enhancement': ['anthropic', 'openai'],
            'lyrics': ['openai', 'anthropic']
        }

        preferred_order = task_provider_map.get(task_type, [])

        for provider_name in preferred_order:
            if provider_name in self.providers:
                provider = self.providers[provider_name]
                if provider.supports_task(task_type):
                    return provider

        # Return any provider that supports the task
        for provider in self.providers.values():
            if provider.supports_task(task_type):
                return provider

        return None

    def _get_fallback_provider(self, task_type: str,
                               failed_provider: AIProvider) -> Optional[AIProvider]:
        """Get fallback provider if primary fails"""
        for provider in self.providers.values():
            if provider != failed_provider and provider.supports_task(task_type):
                return provider
        return None

    def get_provider_status(self) -> Dict:
        """Get status of all providers"""
        status = {}
        for name, provider in self.providers.items():
            status[name] = {
                'available': True,  # Could ping API to check
                'capabilities': provider.get_capabilities()
            }
        return status
```

### Phase 3: Pipeline Implementation

## 3.1 Stage Processors

```python
# backend/music_generation_unified/pipeline/stages.py

from abc import ABC, abstractmethod
from typing import Dict, Any
import asyncio


class StageProcessor(ABC):
    """Base class for all stage processors"""

    def __init__(self, composition, context_manager, ai_router):
        self.composition = composition
        self.context = context_manager
        self.ai_router = ai_router

    @abstractmethod
    async def process(self) -> Dict:
        """Process the stage and return results"""
        pass

    @abstractmethod
    def validate_input(self) -> bool:
        """Validate that stage has required input"""
        pass

    @abstractmethod
    def get_required_context(self) -> List[str]:
        """Get list of required context fields"""
        pass


class CompositionStage(StageProcessor):
    """
    Stage 1: Create core musical elements
    """

    async def process(self) -> Dict:
        """Generate musical elements from enhanced prompt"""
        # Get context
        prompt = self.context.get('creative.enhanced_prompt')
        genre = self.context.get('musical.genre')
        mood = self.context.get('musical.mood')
        tempo = self.context.get('musical.tempo', 120)

        # Generate chord progression
        chord_task = self._generate_chords(prompt, genre, mood)

        # Generate melody
        melody_task = self._generate_melody(prompt, genre, mood, tempo)

        # Generate bass line
        bass_task = self._generate_bass(prompt, genre, tempo)

        # Generate rhythm pattern
        rhythm_task = self._generate_rhythm(genre, tempo)

        # Run in parallel
        results = await asyncio.gather(
            chord_task, melody_task, bass_task, rhythm_task
        )

        # Store results in context
        self.context.update({
            'musical.chord_progression': results[0],
            'musical.melody': results[1],
            'musical.bass_line': results[2],
            'musical.rhythm_pattern': results[3]
        })

        # Store in stage data
        stage_data = {
            'chord_progression': results[0],
            'melody': results[1],
            'bass_line': results[2],
            'rhythm_pattern': results[3],
            'generation_params': {
                'tempo': tempo,
                'genre': genre,
                'mood': mood
            }
        }

        return stage_data

    async def _generate_chords(self, prompt: str, genre: List[str], mood: Dict) -> Dict:
        """Generate chord progression"""
        params = {
            'task': 'chord_generation',
            'prompt': prompt,
            'genre': genre,
            'mood': mood,
            'output_format': 'chord_symbols'
        }

        result = await self.ai_router.route_request('music_theory', params)
        return result['result']

    async def _generate_melody(self, prompt: str, genre: List[str],
                               mood: Dict, tempo: int) -> Dict:
        """Generate melody line"""
        params = {
            'task': 'melody_generation',
            'prompt': prompt,
            'genre': genre,
            'mood': mood,
            'tempo': tempo,
            'output_format': 'midi'
        }

        result = await self.ai_router.route_request('melody', params)
        return result['result']

    def validate_input(self) -> bool:
        """Check if we have required input for composition"""
        required = self.get_required_context()
        for field in required:
            if self.context.get(field) is None:
                return False
        return True

    def get_required_context(self) -> List[str]:
        return ['creative.enhanced_prompt', 'musical.genre', 'musical.mood']


class ArrangementStage(StageProcessor):
    """
    Stage 2: Structure the musical elements
    """

    async def process(self) -> Dict:
        """Create song structure and arrangement"""
        # Get composition elements
        chord_progression = self.context.get('musical.chord_progression')
        melody = self.context.get('musical.melody')
        duration = self.context.get('technical.duration', 180)

        # Generate song structure
        structure = await self._generate_structure(duration)

        # Create sections
        sections = await self._create_sections(structure, chord_progression, melody)

        # Design transitions
        transitions = await self._design_transitions(sections)

        # Plan dynamics
        dynamics = await self._plan_dynamics(structure, self.context.get('musical.mood'))

        # Update context
        self.context.update({
            'musical.structure': structure,
            'musical.sections': sections,
            'musical.transitions': transitions,
            'musical.dynamics': dynamics
        })

        return {
            'structure': structure,
            'sections': sections,
            'transitions': transitions,
            'dynamics': dynamics
        }

    async def _generate_structure(self, duration: int) -> Dict:
        """Generate song structure based on duration and genre"""
        genre = self.context.get('musical.genre', [])

        # Standard pop structure
        if 'pop' in genre:
            structure = [
                {'name': 'intro', 'start': 0, 'duration': 8},
                {'name': 'verse1', 'start': 8, 'duration': 16},
                {'name': 'chorus1', 'start': 24, 'duration': 16},
                {'name': 'verse2', 'start': 40, 'duration': 16},
                {'name': 'chorus2', 'start': 56, 'duration': 16},
                {'name': 'bridge', 'start': 72, 'duration': 8},
                {'name': 'chorus3', 'start': 80, 'duration': 16},
                {'name': 'outro', 'start': 96, 'duration': 8}
            ]
        else:
            # Generate custom structure
            params = {
                'genre': genre,
                'duration': duration,
                'mood': self.context.get('musical.mood')
            }
            result = await self.ai_router.route_request('structure_generation', params)
            structure = result['result']

        return structure

    def validate_input(self) -> bool:
        return all(self.context.get(field) for field in self.get_required_context())

    def get_required_context(self) -> List[str]:
        return ['musical.chord_progression', 'musical.melody']


# Continue with ProductionStage, MixingStage, MasteringStage...
```

### Phase 4: API Implementation

## 4.1 REST API Views

```python
# backend/music_generation_unified/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import asyncio


class UnifiedCompositionViewSet(viewsets.ModelViewSet):
    """
    Main API for unified music generation
    """
    queryset = UnifiedComposition.objects.all()
    serializer_class = UnifiedCompositionSerializer

    @action(detail=False, methods=['post'])
    async def generate(self, request):
        """
        Start new music generation with optional enhancement
        """
        # Get input
        prompt = request.data.get('prompt')
        settings = request.data.get('settings', {})

        # Create composition
        composition = UnifiedComposition.objects.create(
            user=request.user,
            title=request.data.get('title', 'Untitled'),
            description=prompt
        )

        # Initialize context manager
        context_manager = CompositionContextManager(composition)

        # Enhance prompt if enabled
        if settings.get('enable_enhancement', True):
            enhancer = AutomaticPromptEnhancer()
            enhanced = await enhancer.enhance(prompt, request.user, settings)

            # Store enhancement
            PromptEnhancement.objects.create(
                composition=composition,
                original_prompt=prompt,
                enhanced_prompt=enhanced['prompt'],
                parameters=enhanced['parameters'],
                reasoning_trace=enhanced.get('reasoning', []),
                confidence_score=enhanced.get('confidence', 0.5)
            )

            context_manager.set('creative.enhanced_prompt', enhanced['prompt'])
            context_manager.update({'musical': enhanced['parameters']})
        else:
            context_manager.set('creative.enhanced_prompt', prompt)

        # Start pipeline
        pipeline = MusicGenerationPipeline(composition)
        asyncio.create_task(pipeline.run())

        return Response({
            'composition_id': str(composition.id),
            'status': 'processing',
            'current_stage': composition.current_stage
        })

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """Get current status of composition"""
        composition = self.get_object()
        state_machine = ProductionStateMachine(composition)

        return Response({
            'id': str(composition.id),
            'current_stage': composition.current_stage,
            'progress': state_machine.get_stage_progress(),
            'context': composition.context,
            'is_completed': composition.is_completed
        })

    @action(detail=True, methods=['post'])
    def advance_stage(self, request, pk=None):
        """Manually advance to next stage"""
        composition = self.get_object()
        state_machine = ProductionStateMachine(composition)

        target_stage = request.data.get('target_stage')
        if not target_stage:
            # Auto-advance to next valid stage
            valid_transitions = state_machine.get_valid_transitions()
            if not valid_transitions:
                return Response(
                    {'error': 'No valid transitions available'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            target_stage = valid_transitions[0]

        try:
            state_machine.transition_to(ProductionStage(target_stage))

            # Continue pipeline
            pipeline = MusicGenerationPipeline(composition)
            asyncio.create_task(pipeline.process_stage(target_stage))

            return Response({
                'success': True,
                'new_stage': target_stage,
                'message': f'Advanced to {target_stage}'
            })
        except InvalidTransitionError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def revise_stage(self, request, pk=None):
        """Revise current or previous stage"""
        composition = self.get_object()
        target_stage = request.data.get('stage', composition.current_stage)
        revisions = request.data.get('revisions', {})

        # Update context with revisions
        context_manager = CompositionContextManager(composition)
        context_manager.update(revisions)

        # Re-process stage
        pipeline = MusicGenerationPipeline(composition)
        asyncio.create_task(pipeline.process_stage(target_stage))

        return Response({
            'success': True,
            'stage': target_stage,
            'message': 'Revision initiated'
        })

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download final or intermediate audio files"""
        composition = self.get_object()
        format = request.query_params.get('format', 'mp3')
        stage = request.query_params.get('stage', 'final')

        # Get appropriate media file
        media = CompositionMedia.objects.filter(
            composition=composition,
            media_type=f'audio_{format}'
        ).order_by('-created_at').first()

        if not media:
            return Response(
                {'error': 'No audio file available'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Return file response
        from django.http import FileResponse
        return FileResponse(
            media.file,
            as_attachment=True,
            filename=f"{composition.title}.{format}"
        )
```

### Phase 5: Frontend Integration

## 5.1 React/Next.js Components

```typescript
// frontend/src/components/MusicGenerator.tsx

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { PromptEnhancer } from './PromptEnhancer';
import { PipelineProgress } from './PipelineProgress';
import { StageControls } from './StageControls';
import { AudioPlayer } from './AudioPlayer';

interface MusicGeneratorProps {
  userId: string;
}

export const MusicGenerator: React.FC<MusicGeneratorProps> = ({ userId }) => {
  const [prompt, setPrompt] = useState('');
  const [composition, setComposition] = useState(null);
  const [settings, setSettings] = useState({
    enableEnhancement: true,
    enhancementLevel: 'moderate',
    showReasoning: false
  });

  const ws = useWebSocket(`ws://localhost:8000/ws/composition/${composition?.id}/`);

  useEffect(() => {
    // Listen for WebSocket updates
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleUpdate(data);
      };
    }
  }, [ws]);

  const handleGenerate = async () => {
    const response = await fetch('/api/compositions/generate/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        settings,
        title: 'New Composition'
      })
    });

    const data = await response.json();
    setComposition(data);
  };

  const handleUpdate = (update: any) => {
    // Handle real-time updates
    if (update.type === 'stage_complete') {
      setComposition(prev => ({
        ...prev,
        current_stage: update.stage,
        progress: update.progress
      }));
    } else if (update.type === 'audio_ready') {
      setComposition(prev => ({
        ...prev,
        audio_url: update.url
      }));
    }
  };

  const handleStageControl = async (action: string, params: any) => {
    const response = await fetch(`/api/compositions/${composition.id}/${action}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await response.json();
    setComposition(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="music-generator">
      {/* Input Section */}
      <div className="input-section">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the music you want to create..."
          className="prompt-input"
        />

        <PromptEnhancer
          prompt={prompt}
          settings={settings}
          onSettingsChange={setSettings}
          onEnhanced={(enhanced) => {
            // Show enhanced version to user
            console.log('Enhanced:', enhanced);
          }}
        />

        <button
          onClick={handleGenerate}
          disabled={!prompt || composition?.status === 'processing'}
          className="generate-button"
        >
          Generate Music
        </button>
      </div>

      {/* Progress Section */}
      {composition && (
        <>
          <PipelineProgress
            currentStage={composition.current_stage}
            progress={composition.progress}
            stageData={composition.stage_data}
          />

          <StageControls
            composition={composition}
            onAdvance={() => handleStageControl('advance_stage', {})}
            onRevise={(stage, revisions) =>
              handleStageControl('revise_stage', { stage, revisions })
            }
            onRevert={(stage) =>
              handleStageControl('advance_stage', { target_stage: stage })
            }
          />

          {composition.audio_url && (
            <AudioPlayer
              url={composition.audio_url}
              title={composition.title}
              onDownload={() =>
                window.open(`/api/compositions/${composition.id}/download/`)
              }
            />
          )}
        </>
      )}
    </div>
  );
};
```

## Next Steps

1. **Set up development environment** with required dependencies
2. **Create database migrations** for new models
3. **Implement core services** (AI Router, Context Manager, State Machine)
4. **Build pipeline stages** one by one
5. **Create API endpoints** and test with Postman
6. **Develop frontend components** with real-time updates
7. **Integrate AI providers** (Suno, Udio, MusicGen)
8. **Add monitoring and logging** for debugging
9. **Write comprehensive tests** for each component
10. **Document API** and create user guides