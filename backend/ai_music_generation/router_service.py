from typing import List, Dict, Any
from .models import ModelRouter, ModelRouterAssignment, ModelCapability, LLMProvider, AIMusicRequest
import json
import logging
from django.db import transaction
from django.utils import timezone
import uuid

logger = logging.getLogger(__name__)

class ModelRoutingService:
    """
    Service class that handles the core logic for model routing and orchestration.
    """
    
    TASK_TYPES = {
        'melody_generation': {
            'description': 'Generate the main melody line',
            'required_capabilities': ['melody_composition', 'musical_structure']
        },
        'chord_progression': {
            'description': 'Create harmonic chord progressions',
            'required_capabilities': ['harmony_analysis', 'chord_theory']
        },
        'orchestration': {
            'description': 'Arrange music for different instruments',
            'required_capabilities': ['instrument_knowledge', 'arrangement']
        },
        'rhythm_generation': {
            'description': 'Generate rhythmic patterns',
            'required_capabilities': ['rhythm_analysis', 'percussion']
        },
        'style_transfer': {
            'description': 'Apply musical style characteristics',
            'required_capabilities': ['style_recognition', 'musical_adaptation']
        }
    }

    def __init__(self, request_id: int):
        """Initialize with an AI music request ID."""
        self.request = AIMusicRequest.objects.get(id=request_id)
        self.router = None

    @transaction.atomic
    def initialize_router(self, routing_strategy: str = 'sequential') -> ModelRouter:
        """Create and initialize a new model router for the request."""
        self.router = ModelRouter.objects.create(
            request=self.request,
            routing_strategy=routing_strategy,
            task_breakdown={}
        )
        return self.router

    def analyze_prompt(self) -> Dict[str, Any]:
        """
        Analyze the prompt to identify required tasks and capabilities.
        Returns a structured breakdown of the music generation request.
        """
        prompt = self.request.prompt_text.lower()
        task_breakdown = {
            'identified_tasks': [],
            'musical_elements': {
                'genre': None,
                'mood': None,
                'tempo': None,
                'instruments': [],
                'structure': None
            },
            'complexity_level': None
        }

        # Detect melody generation task
        melody_keywords = ['melody', 'tune', 'song', 'melod', 'notes']
        if any(keyword in prompt for keyword in melody_keywords):
            task_breakdown['identified_tasks'].append('melody_generation')
            
        # Always include melody_generation if voice is mentioned
        voice_keywords = ['voice', 'sing', 'vocal', 'man voice', 'woman voice', 'female voice', 'male voice']
        if any(keyword in prompt for keyword in voice_keywords):
            if 'melody_generation' not in task_breakdown['identified_tasks']:
                task_breakdown['identified_tasks'].append('melody_generation')
            
            # Record voice type for reference
            if 'lady' in prompt or 'woman' in prompt or 'female' in prompt:
                task_breakdown['musical_elements']['voice_type'] = 'female'
            elif 'man' in prompt or 'male' in prompt:
                task_breakdown['musical_elements']['voice_type'] = 'male'
            else:
                task_breakdown['musical_elements']['voice_type'] = 'unspecified'
            
        # Detect chord progression task
        if 'chord' in prompt or 'harmony' in prompt or 'harmonic' in prompt:
            task_breakdown['identified_tasks'].append('chord_progression')
            
        # Detect orchestration task
        instrument_keywords = ['orchestra', 'band', 'ensemble', 'instrument', 'orchestration']
        if any(keyword in prompt for keyword in instrument_keywords):
            task_breakdown['identified_tasks'].append('orchestration')
            
        # Detect rhythm generation task
        rhythm_keywords = ['rhythm', 'beat', 'tempo', 'percussion', 'drums']
        if any(keyword in prompt for keyword in rhythm_keywords):
            task_breakdown['identified_tasks'].append('rhythm_generation')
            
        # Detect style transfer task
        style_keywords = ['style', 'like', 'genre', 'similar to', 'in the style of']
        if any(keyword in prompt for keyword in style_keywords):
            task_breakdown['identified_tasks'].append('style_transfer')
            
        # If no tasks were identified, default to melody generation
        if not task_breakdown['identified_tasks']:
            task_breakdown['identified_tasks'].append('melody_generation')

        # Update router with analysis results
        self.router.task_breakdown = task_breakdown
        self.router.save()
        return task_breakdown

    def select_providers(self) -> List[Dict[str, Any]]:
        """
        Select the most appropriate providers for each identified task.
        Returns a list of provider assignments.
        """
        assignments = []
        tasks = self.router.task_breakdown.get('identified_tasks', [])
        
        for task in tasks:
            # Get required capabilities for the task
            required_capabilities = self.TASK_TYPES[task]['required_capabilities']
            
            # Find providers with matching capabilities
            capable_providers = LLMProvider.objects.filter(
                capabilities__capability_type__in=required_capabilities,
                capabilities__confidence_score__gte=0.7,
                active=True
            ).distinct()

            if not capable_providers.exists():
                logger.warning(f"No capable providers found for task: {task}")
                continue

            # Select the best provider based on confidence score and latency
            best_provider = capable_providers.order_by(
                '-capabilities__confidence_score',
                'capabilities__latency_ms'
            ).first()

            # Create assignment
            assignment = ModelRouterAssignment.objects.create(
                router=self.router,
                provider=best_provider,
                task_type=task,
                priority=len(assignments)
            )
            assignments.append({
                'task': task,
                'provider': best_provider.name,
                'assignment_id': assignment.id
            })

        return assignments

    def execute_tasks(self) -> Dict[str, Any]:
        """
        Execute all tasks according to the routing strategy.
        Returns the combined results of all tasks.
        """
        results = {}
        assignments = self.router.assignments.all().order_by('priority')
        
        # Check if there are no assignments due to no capable providers
        if not assignments.exists():
            # Check if any tasks were identified but no providers were found
            tasks = self.router.task_breakdown.get('identified_tasks', [])
            if tasks:
                # There were tasks identified but no providers available
                error_msg = f"No capable providers found for tasks: {', '.join(tasks)}"
                logger.error(error_msg)
                
                # Return a structured error result with status information
                return {
                    'error': error_msg,
                    'status': 'failed',
                    'missing_providers_for': tasks,
                    'track': {
                        'id': f'error-{self.request.id}',
                        'requestId': str(self.request.id),
                        'url': '',
                        'status': 'failed',
                        'error': error_msg
                    }
                }
            else:
                # No tasks were identified from the prompt
                error_msg = "No music generation tasks could be identified from the prompt"
                logger.error(error_msg)
                return {
                    'error': error_msg,
                    'status': 'failed',
                    'track': {
                        'id': f'error-{self.request.id}',
                        'requestId': str(self.request.id),
                        'url': '',
                        'status': 'failed',
                        'error': error_msg
                    }
                }

        if self.router.routing_strategy == 'sequential':
            for assignment in assignments:
                try:
                    result = self._execute_single_task(assignment)
                    results[assignment.task_type] = result
                except Exception as e:
                    logger.error(f"Error executing task {assignment.task_type}: {str(e)}")
                    self._handle_task_failure(assignment, str(e))

        elif self.router.routing_strategy == 'parallel':
            # In a real implementation, this would use async execution
            for assignment in assignments:
                try:
                    result = self._execute_single_task(assignment)
                    results[assignment.task_type] = result
                except Exception as e:
                    logger.error(f"Error executing task {assignment.task_type}: {str(e)}")
                    self._handle_task_failure(assignment, str(e))

        # Set the request status based on results
        if not results:
            # If we have no results after execution, it's a failure
            self.request.status = 'failed'
            self.request.save()
            return {
                'error': 'All tasks failed to execute',
                'status': 'failed',
                'track': {
                    'id': f'error-{self.request.id}',
                    'requestId': str(self.request.id),
                    'url': '',
                    'status': 'failed',
                    'error': 'All tasks failed to execute'
                }
            }
        
        # Create final response structure
        final_result = {
            'status': 'completed',
            'results': results
        }
        
        # Include track data in the response
        # First, check if melody_generation was successful
        if 'melody_generation' in results and results['melody_generation'].get('status') == 'success':
            # If there's already a track in the melody_generation result, use it
            if 'track' in results['melody_generation']:
                final_result['track'] = results['melody_generation']['track']
            else:
                # Create a basic track structure
                track_id = f"track-{uuid.uuid4()}"
                final_result['track'] = {
                    'id': track_id,
                    'requestId': str(self.request.id),
                    'url': f"https://example.com/api/tracks/{track_id}.mp3",
                    'duration': 30.0,
                    'format': 'mp3',
                    'waveform': [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5],
                    'metadata': {
                        'tempo': 120,
                        'key': 'C Major',
                        'timeSignature': '4/4',
                        'instruments': ['piano', 'guitar', 'drums', 'bass']
                    }
                }
            
        # Update request status to completed
        self.request.status = 'completed'
        self.request.save()
            
        return final_result

    def _execute_single_task(self, assignment: ModelRouterAssignment) -> Dict[str, Any]:
        """Execute a single task using the assigned provider."""
        assignment.started_at = timezone.now()
        assignment.status = 'in_progress'
        assignment.save()

        try:
            # Here we would integrate with the actual provider's API
            # For now, we'll simulate the task execution
            result = self._simulate_task_execution(assignment)
            
            assignment.status = 'completed'
            assignment.completed_at = timezone.now()
            assignment.result = result
            assignment.save()
            
            return result

        except Exception as e:
            assignment.status = 'failed'
            assignment.error = {'message': str(e)}
            assignment.save()
            raise

    def _simulate_task_execution(self, assignment: ModelRouterAssignment) -> Dict[str, Any]:
        """Simulate task execution for development/testing."""
        task_type = assignment.task_type
        provider = assignment.provider

        # Simulate provider-specific processing
        result = {
            'provider': provider.name,
            'task_type': task_type,
            'status': 'success',
            'output': f"Simulated {task_type} output from {provider.name}",
            'metadata': {
                'processing_time_ms': 1500,
                'model_version': '1.0',
                'confidence': 0.85
            }
        }
        
        # For melody_generation, include a proper track structure
        if task_type == 'melody_generation' and provider.name == 'Suno':
            # Generate a mock track ID
            track_id = f"track-{uuid.uuid4()}"
            
            # Create a track structure matching what the frontend expects
            result['track'] = {
                'id': track_id,
                'requestId': str(self.request.id),
                'url': f"https://example.com/api/tracks/{track_id}.mp3",
                'duration': 30.0,
                'format': 'mp3',
                'waveform': [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5],
                'metadata': {
                    'tempo': 120,
                    'key': 'C Major',
                    'timeSignature': '4/4',
                    'instruments': ['piano', 'guitar', 'drums', 'bass']
                }
            }

        return result

    def _handle_task_failure(self, assignment: ModelRouterAssignment, error: str):
        """Handle task execution failures."""
        # Log the failure
        logger.error(f"Task {assignment.task_type} failed: {error}")

        # Update assignment status
        assignment.status = 'failed'
        assignment.error = {'message': error}
        assignment.save()

        # If we have fallback providers, try them
        fallback_provider = self._get_fallback_provider(assignment)
        if fallback_provider:
            logger.info(f"Attempting fallback for task {assignment.task_type} with provider {fallback_provider.name}")
            new_assignment = ModelRouterAssignment.objects.create(
                router=self.router,
                provider=fallback_provider,
                task_type=assignment.task_type,
                priority=assignment.priority + 0.1  # Keep relative ordering but insert after failed task
            )
            try:
                self._execute_single_task(new_assignment)
            except Exception as e:
                logger.error(f"Fallback also failed for task {assignment.task_type}: {str(e)}")

    def _get_fallback_provider(self, failed_assignment: ModelRouterAssignment) -> LLMProvider:
        """Get a fallback provider for a failed task."""
        task_type = failed_assignment.task_type
        failed_provider = failed_assignment.provider

        # Find alternative provider with similar capabilities
        fallback = LLMProvider.objects.filter(
            capabilities__capability_type__in=self.TASK_TYPES[task_type]['required_capabilities'],
            capabilities__confidence_score__gte=0.6,
            active=True
        ).exclude(id=failed_provider.id).order_by(
            '-capabilities__confidence_score'
        ).first()

        return fallback

    def get_execution_status(self) -> Dict[str, Any]:
        """Get the current status of all task executions."""
        assignments = self.router.assignments.all()
        
        # Count assignments by status
        total_tasks = assignments.count()
        completed_count = assignments.filter(status='completed').count()
        failed_count = assignments.filter(status='failed').count()
        in_progress_count = assignments.filter(status='in_progress').count()
        pending_count = assignments.filter(status='pending').count()
        
        # Determine overall status
        if failed_count == total_tasks:
            overall_status = 'failed'
        elif completed_count == total_tasks:
            overall_status = 'completed'
        elif in_progress_count > 0:
            overall_status = 'processing'
        else:
            overall_status = 'pending'
            
        # Create status response
        status_data = {
            'status': overall_status,
            'total_tasks': total_tasks,
            'completed': completed_count,
            'failed': failed_count,
            'in_progress': in_progress_count,
            'pending': pending_count,
            'task_details': []
        }
        
        # Add task details
        results = {}
        for assignment in assignments:
            status_data['task_details'].append({
                'task_type': assignment.task_type,
                'provider': assignment.provider.name,
                'status': assignment.status,
                'started_at': assignment.started_at,
                'completed_at': assignment.completed_at,
                'error': assignment.error
            })
            
            # Collect results from completed tasks
            if assignment.status == 'completed' and assignment.result:
                results[assignment.task_type] = assignment.result
        
        # If all tasks are completed, include results in response
        if overall_status == 'completed':
            status_data['results'] = results
            
            # Include track data if melody_generation was successful
            if 'melody_generation' in results and results['melody_generation'].get('status') == 'success':
                if 'track' in results['melody_generation']:
                    status_data['track'] = results['melody_generation']['track']
                else:
                    # Create a basic track structure if not present in the result
                    track_id = f"track-{uuid.uuid4()}"
                    status_data['track'] = {
                        'id': track_id,
                        'requestId': str(self.request.id),
                        'url': f"https://example.com/api/tracks/{track_id}.mp3",
                        'duration': 30.0,
                        'format': 'mp3',
                        'waveform': [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5],
                        'metadata': {
                            'tempo': 120,
                            'key': 'C Major',
                            'timeSignature': '4/4',
                            'instruments': ['piano', 'guitar', 'drums', 'bass']
                        }
                    }
            
        return status_data
