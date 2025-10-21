from rest_framework import permissions
from django.db.models import Q

class SRLMixin:
    """
    Mixin to handle Security Role Level (SRL) access control.
    Replaces tenant-based isolation with user-specific access control.
    """
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Staff/admin users can see all records
        if user.is_staff or user.is_superuser:
            return queryset
            
        # For regular users, filter based on model type
        model_name = queryset.model.__name__
        
        if model_name == 'UserAccessibilitySettings':
            return queryset.filter(user=user)
            
        elif model_name == 'LocalizedFormat':
            return queryset.filter(
                Q(user=user) | Q(user__isnull=True)  # User's formats + defaults
            )
            
        elif model_name == 'GenreLocalization':
            # All users can see genre localizations
            return queryset
            
        elif model_name == 'UserGenrePreferences':
            return queryset.filter(
                Q(user=user) | Q(is_shared=True)  # User's preferences + shared ones
            )
            
        elif model_name in ['BrailleHapticProfile', 'VoiceSynthesisProfile']:
            return queryset.filter(
                Q(user=user) | Q(user__isnull=True)  # User's profiles + defaults
            )
            
        elif model_name == 'AccessibilityUsageLog':
            return queryset.filter(user=user)
            
        elif model_name == 'AccessibilityRecommendation':
            return queryset.filter(user=user)
            
        # For other models (Language, Locale, Translation, etc.), 
        # return all records as they are shared resources
        return queryset

    def perform_create(self, serializer):
        """Automatically set user field if applicable"""
        if hasattr(serializer.Meta.model, 'user'):
            serializer.save(user=self.request.user)
        else:
            serializer.save() 