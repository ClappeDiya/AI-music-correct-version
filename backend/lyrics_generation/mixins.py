from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

class UserSpecificMixin:
    """
    Mixin to enforce user-specific access control.
    Replaces tenant-based isolation with user-based security.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter queryset based on user access level and permissions.
        """
        queryset = super().get_queryset()
        user = self.request.user

        # If user is admin/superuser, return all records
        if user.is_superuser or user.is_staff:
            return queryset

        # Get model class
        model = queryset.model

        # Check if model has user field directly
        if hasattr(model, 'user'):
            return queryset.filter(user=user)

        # Check for related user field (e.g., through prompt.user)
        if hasattr(model, 'prompt') and hasattr(model.prompt.field.related_model, 'user'):
            return queryset.filter(prompt__user=user)
        
        # For models related to FinalLyrics
        if hasattr(model, 'final_lyrics') and hasattr(model.final_lyrics.field.related_model, 'user'):
            return queryset.filter(final_lyrics__user=user)

        return queryset.none()  # Default to no access if no user relation found 