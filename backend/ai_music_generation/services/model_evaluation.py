import numpy as np
from typing import Dict, List, Tuple, Any
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from ..models_shared_training import SharedModelGroup, ModelTrainingJob


class ModelEvaluator:
    """
    Service for evaluating shared AI models during and after training.
    Provides metrics calculation and validation functionality.
    """

    def __init__(self, group: SharedModelGroup, job: ModelTrainingJob):
        self.group = group
        self.job = job
        self.channel_layer = get_channel_layer()
        self.group_name = f'shared_model_{group.id}'

    def evaluate_batch(
        self,
        predictions: np.ndarray,
        targets: np.ndarray,
        epoch: int,
        batch: int
    ) -> Dict[str, float]:
        """
        Evaluate model performance for a single training batch.
        """
        metrics = self._calculate_batch_metrics(predictions, targets)
        
        # Update training job metrics
        self._update_job_metrics(metrics, epoch, batch)
        
        # Send real-time update
        self._send_metrics_update(metrics, epoch, batch)
        
        return metrics

    def evaluate_epoch(
        self,
        val_predictions: np.ndarray,
        val_targets: np.ndarray,
        epoch: int
    ) -> Dict[str, float]:
        """
        Evaluate model performance for an entire epoch.
        """
        # Calculate validation metrics
        val_metrics = self._calculate_validation_metrics(
            val_predictions,
            val_targets
        )
        
        # Update job metrics with validation results
        self._update_job_metrics(val_metrics, epoch, validation=True)
        
        # Send real-time update
        self._send_metrics_update(val_metrics, epoch, validation=True)
        
        return val_metrics

    def final_evaluation(
        self,
        test_predictions: np.ndarray,
        test_targets: np.ndarray
    ) -> Dict[str, Any]:
        """
        Perform final model evaluation on test set.
        """
        # Calculate comprehensive metrics
        final_metrics = self._calculate_final_metrics(
            test_predictions,
            test_targets
        )
        
        # Generate evaluation report
        report = self._generate_evaluation_report(final_metrics)
        
        # Update job with final results
        self.job.training_metrics.update({
            'final_evaluation': final_metrics,
            'evaluation_report': report
        })
        self.job.save()
        
        # Send final update
        self._send_metrics_update(
            final_metrics,
            final=True,
            report=report
        )
        
        return {
            'metrics': final_metrics,
            'report': report
        }

    def _calculate_batch_metrics(
        self,
        predictions: np.ndarray,
        targets: np.ndarray
    ) -> Dict[str, float]:
        """
        Calculate metrics for a training batch.
        """
        return {
            'loss': float(self._calculate_loss(predictions, targets)),
            'accuracy': float(self._calculate_accuracy(predictions, targets)),
            'precision': float(self._calculate_precision(predictions, targets)),
            'recall': float(self._calculate_recall(predictions, targets))
        }

    def _calculate_validation_metrics(
        self,
        predictions: np.ndarray,
        targets: np.ndarray
    ) -> Dict[str, float]:
        """
        Calculate metrics for validation set.
        """
        base_metrics = self._calculate_batch_metrics(predictions, targets)
        return {
            **base_metrics,
            'val_loss': base_metrics['loss'],
            'val_accuracy': base_metrics['accuracy'],
            'val_precision': base_metrics['precision'],
            'val_recall': base_metrics['recall']
        }

    def _calculate_final_metrics(
        self,
        predictions: np.ndarray,
        targets: np.ndarray
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive metrics for final evaluation.
        """
        base_metrics = self._calculate_validation_metrics(predictions, targets)
        
        # Add additional metrics for final evaluation
        additional_metrics = {
            'f1_score': self._calculate_f1_score(
                base_metrics['precision'],
                base_metrics['recall']
            ),
            'confusion_matrix': self._calculate_confusion_matrix(
                predictions,
                targets
            ).tolist(),
            'roc_auc': self._calculate_roc_auc(predictions, targets),
            'per_class_metrics': self._calculate_per_class_metrics(
                predictions,
                targets
            )
        }
        
        return {**base_metrics, **additional_metrics}

    def _generate_evaluation_report(
        self,
        metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive evaluation report.
        """
        return {
            'summary': {
                'overall_performance': self._assess_overall_performance(metrics),
                'strengths': self._identify_strengths(metrics),
                'weaknesses': self._identify_weaknesses(metrics),
                'recommendations': self._generate_recommendations(metrics)
            },
            'detailed_metrics': metrics,
            'visualization_data': self._prepare_visualization_data(metrics)
        }

    def _update_job_metrics(
        self,
        metrics: Dict[str, float],
        epoch: int,
        batch: int = None,
        validation: bool = False
    ):
        """
        Update training job metrics.
        """
        if 'history' not in self.job.training_metrics:
            self.job.training_metrics['history'] = []

        if validation:
            if len(self.job.training_metrics['history']) > epoch:
                self.job.training_metrics['history'][epoch].update(metrics)
            else:
                self.job.training_metrics['history'].append(metrics)
        else:
            if batch == 0:  # New epoch
                self.job.training_metrics['history'].append({})
            self.job.training_metrics['history'][epoch].update(metrics)

        self.job.save()

    def _send_metrics_update(
        self,
        metrics: Dict[str, Any],
        epoch: int = None,
        batch: int = None,
        validation: bool = False,
        final: bool = False,
        report: Dict[str, Any] = None
    ):
        """
        Send real-time metrics update via WebSocket.
        """
        update_data = {
            'type': 'training_metrics',
            'metrics': metrics,
            'is_validation': validation,
            'is_final': final
        }

        if epoch is not None:
            update_data['epoch'] = epoch
        if batch is not None:
            update_data['batch'] = batch
        if report is not None:
            update_data['report'] = report

        async_to_sync(self.channel_layer.group_send)(
            self.group_name,
            update_data
        )

    # Helper methods for metric calculations
    def _calculate_loss(
        self,
        predictions: np.ndarray,
        targets: np.ndarray
    ) -> float:
        """Calculate loss metric."""
        return float(np.mean((predictions - targets) ** 2))

    def _calculate_accuracy(
        self,
        predictions: np.ndarray,
        targets: np.ndarray
    ) -> float:
        """Calculate accuracy metric."""
        return float(np.mean(predictions.argmax(axis=1) == targets.argmax(axis=1)))

    def _calculate_precision(
        self,
        predictions: np.ndarray,
        targets: np.ndarray
    ) -> float:
        """Calculate precision metric."""
        true_positives = np.sum(predictions * targets)
        predicted_positives = np.sum(predictions)
        return float(true_positives / (predicted_positives + 1e-7))

    def _calculate_recall(
        self,
        predictions: np.ndarray,
        targets: np.ndarray
    ) -> float:
        """Calculate recall metric."""
        true_positives = np.sum(predictions * targets)
        actual_positives = np.sum(targets)
        return float(true_positives / (actual_positives + 1e-7))

    def _calculate_f1_score(
        self,
        precision: float,
        recall: float
    ) -> float:
        """Calculate F1 score."""
        return 2 * (precision * recall) / (precision + recall + 1e-7)

    def _calculate_confusion_matrix(
        self,
        predictions: np.ndarray,
        targets: np.ndarray
    ) -> np.ndarray:
        """Calculate confusion matrix."""
        pred_classes = predictions.argmax(axis=1)
        true_classes = targets.argmax(axis=1)
        n_classes = predictions.shape[1]
        matrix = np.zeros((n_classes, n_classes))
        
        for i in range(len(pred_classes)):
            matrix[true_classes[i]][pred_classes[i]] += 1
            
        return matrix

    def _calculate_roc_auc(
        self,
        predictions: np.ndarray,
        targets: np.ndarray
    ) -> float:
        """Calculate ROC AUC score."""
        # Simplified implementation for binary classification
        if predictions.shape[1] == 2:
            true_positive_rate, false_positive_rate = self._calculate_roc_curve(
                predictions[:, 1],
                targets[:, 1]
            )
            return np.trapz(true_positive_rate, false_positive_rate)
        return 0.0

    def _calculate_per_class_metrics(
        self,
        predictions: np.ndarray,
        targets: np.ndarray
    ) -> Dict[str, Dict[str, float]]:
        """Calculate metrics for each class."""
        n_classes = predictions.shape[1]
        metrics = {}
        
        for i in range(n_classes):
            class_pred = predictions[:, i]
            class_true = targets[:, i]
            
            metrics[f'class_{i}'] = {
                'precision': self._calculate_precision(class_pred, class_true),
                'recall': self._calculate_recall(class_pred, class_true),
                'accuracy': self._calculate_accuracy(class_pred, class_true)
            }
            
        return metrics

    def _assess_overall_performance(
        self,
        metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Assess overall model performance."""
        return {
            'accuracy_rating': self._rate_metric(metrics['accuracy']),
            'precision_rating': self._rate_metric(metrics['precision']),
            'recall_rating': self._rate_metric(metrics['recall']),
            'overall_rating': self._calculate_overall_rating(metrics)
        }

    def _identify_strengths(
        self,
        metrics: Dict[str, Any]
    ) -> List[str]:
        """Identify model strengths."""
        strengths = []
        
        if metrics['accuracy'] > 0.8:
            strengths.append('High overall accuracy')
        if metrics['precision'] > 0.8:
            strengths.append('High precision')
        if metrics['recall'] > 0.8:
            strengths.append('High recall')
            
        return strengths

    def _identify_weaknesses(
        self,
        metrics: Dict[str, Any]
    ) -> List[str]:
        """Identify model weaknesses."""
        weaknesses = []
        
        if metrics['accuracy'] < 0.6:
            weaknesses.append('Low overall accuracy')
        if metrics['precision'] < 0.6:
            weaknesses.append('Low precision')
        if metrics['recall'] < 0.6:
            weaknesses.append('Low recall')
            
        return weaknesses

    def _generate_recommendations(
        self,
        metrics: Dict[str, Any]
    ) -> List[str]:
        """Generate improvement recommendations."""
        recommendations = []
        
        if metrics['accuracy'] < 0.6:
            recommendations.append('Consider increasing model complexity')
        if metrics['precision'] < 0.6:
            recommendations.append('Focus on reducing false positives')
        if metrics['recall'] < 0.6:
            recommendations.append('Focus on reducing false negatives')
            
        return recommendations

    def _prepare_visualization_data(
        self,
        metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Prepare data for visualization."""
        return {
            'confusion_matrix': metrics['confusion_matrix'],
            'per_class_performance': metrics['per_class_metrics'],
            'training_history': self.job.training_metrics.get('history', [])
        }

    def _rate_metric(self, value: float) -> str:
        """Rate a metric value."""
        if value >= 0.9:
            return 'Excellent'
        elif value >= 0.8:
            return 'Good'
        elif value >= 0.6:
            return 'Fair'
        else:
            return 'Poor'

    def _calculate_overall_rating(
        self,
        metrics: Dict[str, Any]
    ) -> str:
        """Calculate overall model rating."""
        key_metrics = [
            metrics['accuracy'],
            metrics['precision'],
            metrics['recall']
        ]
        avg_performance = np.mean(key_metrics)
        return self._rate_metric(avg_performance)
