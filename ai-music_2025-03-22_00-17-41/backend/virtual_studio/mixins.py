from rest_framework import permissions
from django.db.models import Q
import logging

logger = logging.getLogger('virtual_studio.auth')

class UserSpecificMixin:
    """
    Mixin to handle user-specific access control.
    
    This mixin ensures that users can only access:
    1. Their own data (created or owned by them)
    2. Data they have collaboration rights on
    3. Public data
    
    All queries are filtered based on the authenticated user from the request.
    """
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if not user.is_authenticated:
            logger.warning(
                "Unauthenticated user attempted to access protected data",
                extra={
                    'path': self.request.path,
                    'method': self.request.method
                }
            )
            return queryset.none()

        if user.is_superuser:
            return queryset

        # Handle different model types
        if hasattr(queryset.model, 'user'):
            # Direct user ownership
            return queryset.filter(
                Q(user=user) |
                Q(collaborators=user) |
                Q(is_public=True)
            ).distinct()
        
        elif hasattr(queryset.model, 'created_by'):
            # Created by user or public items
            return queryset.filter(
                Q(created_by=user) |
                Q(is_public=True)
            )
        
        elif hasattr(queryset.model, 'session'):
            # Related to session (tracks, effects, etc.)
            return queryset.filter(
                Q(session__user=user) |
                Q(session__collaborators=user) |
                Q(session__is_public=True)
            ).distinct()

        return queryset

    def perform_create(self, serializer):
        if hasattr(serializer.Meta.model, 'user'):
            serializer.save(user=self.request.user)
        elif hasattr(serializer.Meta.model, 'created_by'):
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()