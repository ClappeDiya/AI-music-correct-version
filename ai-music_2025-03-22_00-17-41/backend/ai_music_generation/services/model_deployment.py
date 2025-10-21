import os
import json
import shutil
from typing import Dict, Any
from django.conf import settings
from django.utils import timezone
from ..models_shared_training import SharedModelGroup, ModelTrainingJob


class ModelDeploymentService:
    """
    Service for managing the deployment of trained shared models.
    Handles model versioning, artifact management, and serving.
    """

    def __init__(self):
        self.deployment_path = os.path.join(settings.MEDIA_ROOT, 'deployed_models')
        os.makedirs(self.deployment_path, exist_ok=True)

    def deploy_model(self, job: ModelTrainingJob) -> Dict[str, Any]:
        """
        Deploy a successfully trained model.
        """
        group = job.group
        version = group.model_version
        
        # Create deployment directory
        deploy_dir = self._create_deployment_directory(group.id, version)
        
        try:
            # Copy model artifacts
            artifact_paths = self._copy_model_artifacts(
                job.model_artifacts,
                deploy_dir
            )
            
            # Create deployment config
            config = self._create_deployment_config(
                group,
                job,
                artifact_paths
            )
            
            # Save deployment config
            config_path = os.path.join(deploy_dir, 'deployment.json')
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
            
            # Update deployment status
            self._update_deployment_status(
                group,
                version,
                'active',
                config
            )
            
            return {
                'status': 'success',
                'version': version,
                'config': config,
                'artifact_paths': artifact_paths
            }
            
        except Exception as e:
            # Handle deployment failure
            self._update_deployment_status(
                group,
                version,
                'failed',
                {'error': str(e)}
            )
            raise

    def rollback_deployment(
        self,
        group: SharedModelGroup,
        target_version: int
    ) -> Dict[str, Any]:
        """
        Rollback to a previous model version.
        """
        if target_version >= group.model_version:
            raise ValueError("Rollback version must be lower than current version")
        
        # Verify target version exists
        target_dir = os.path.join(
            self.deployment_path,
            f'group_{group.id}',
            f'version_{target_version}'
        )
        
        if not os.path.exists(target_dir):
            raise ValueError(f"Version {target_version} not found")
        
        try:
            # Load target version config
            config_path = os.path.join(target_dir, 'deployment.json')
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            # Update deployment status
            self._update_deployment_status(
                group,
                target_version,
                'active',
                config
            )
            
            return {
                'status': 'success',
                'version': target_version,
                'config': config
            }
            
        except Exception as e:
            raise RuntimeError(f"Rollback failed: {str(e)}")

    def get_deployment_status(
        self,
        group: SharedModelGroup
    ) -> Dict[str, Any]:
        """
        Get current deployment status.
        """
        version = group.model_version
        deploy_dir = os.path.join(
            self.deployment_path,
            f'group_{group.id}',
            f'version_{version}'
        )
        
        if not os.path.exists(deploy_dir):
            return {
                'status': 'not_deployed',
                'version': version
            }
        
        config_path = os.path.join(deploy_dir, 'deployment.json')
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        return {
            'status': 'active',
            'version': version,
            'config': config
        }

    def _create_deployment_directory(
        self,
        group_id: int,
        version: int
    ) -> str:
        """
        Create and prepare deployment directory.
        """
        deploy_dir = os.path.join(
            self.deployment_path,
            f'group_{group_id}',
            f'version_{version}'
        )
        os.makedirs(deploy_dir, exist_ok=True)
        return deploy_dir

    def _copy_model_artifacts(
        self,
        artifacts: Dict[str, str],
        deploy_dir: str
    ) -> Dict[str, str]:
        """
        Copy model artifacts to deployment directory.
        """
        deployed_paths = {}
        
        for name, source_path in artifacts.items():
            if not os.path.exists(source_path):
                raise FileNotFoundError(
                    f"Artifact not found: {source_path}"
                )
            
            # Create target path
            filename = os.path.basename(source_path)
            target_path = os.path.join(deploy_dir, filename)
            
            # Copy file
            shutil.copy2(source_path, target_path)
            deployed_paths[name] = target_path
        
        return deployed_paths

    def _create_deployment_config(
        self,
        group: SharedModelGroup,
        job: ModelTrainingJob,
        artifact_paths: Dict[str, str]
    ) -> Dict[str, Any]:
        """
        Create deployment configuration.
        """
        return {
            'group_id': group.id,
            'version': group.model_version,
            'deployed_at': timezone.now().isoformat(),
            'model_artifacts': artifact_paths,
            'training_config': group.training_config,
            'training_metrics': job.training_metrics,
            'style_tags': group.style_tags,
            'serving_config': {
                'batch_size': 32,
                'max_sequence_length': 1024,
                'temperature': 0.8
            }
        }

    def _update_deployment_status(
        self,
        group: SharedModelGroup,
        version: int,
        status: str,
        config: Dict[str, Any]
    ):
        """
        Update deployment status in the database.
        """
        group.deployment_status = status
        group.current_deployment = {
            'version': version,
            'status': status,
            'updated_at': timezone.now().isoformat(),
            'config': config
        }
        group.save()

    def cleanup_old_deployments(
        self,
        group: SharedModelGroup,
        keep_versions: int = 3
    ):
        """
        Clean up old model deployments.
        """
        group_dir = os.path.join(
            self.deployment_path,
            f'group_{group.id}'
        )
        
        if not os.path.exists(group_dir):
            return
        
        # List all version directories
        versions = []
        for item in os.listdir(group_dir):
            if item.startswith('version_'):
                try:
                    version = int(item.split('_')[1])
                    versions.append(version)
                except ValueError:
                    continue
        
        # Sort versions in descending order
        versions.sort(reverse=True)
        
        # Remove old versions
        for version in versions[keep_versions:]:
            version_dir = os.path.join(
                group_dir,
                f'version_{version}'
            )
            try:
                shutil.rmtree(version_dir)
            except Exception as e:
                print(f"Failed to remove version {version}: {str(e)}")

    def get_serving_model(
        self,
        group: SharedModelGroup
    ) -> Dict[str, Any]:
        """
        Get the currently serving model configuration.
        """
        status = self.get_deployment_status(group)
        
        if status['status'] != 'active':
            raise RuntimeError("No active model deployment found")
        
        return {
            'version': status['version'],
            'config': status['config'],
            'artifacts': status['config']['model_artifacts'],
            'serving_config': status['config']['serving_config']
        }
