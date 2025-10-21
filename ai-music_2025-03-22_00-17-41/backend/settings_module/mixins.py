from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import PermissionDenied
from django.db.models import Q


class UserSpecificMixin:
    """
    Mixin to enforce user-specific access control.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter queryset to only return objects the user has access to.
        """
        queryset = super().get_queryset()
        user = self.request.user

        # If user is admin/superuser, they can see all records
        if user.is_superuser or user.is_staff:
            return queryset

        # For models with direct user field
        if hasattr(queryset.model, 'user'):
            return queryset.filter(user=user)

        # For MultiUserComposite which uses participant_user_ids
        if queryset.model.__name__ == 'MultiUserComposite':
            return queryset.filter(participant_user_ids__contains=[user.id])

        return queryset.none()

    def perform_create(self, serializer):
        """
        Set the user automatically when creating objects.
        """
        if hasattr(serializer.Meta.model, 'user'):
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    def check_object_permissions(self, request, obj):
        """
        Check if user has permission to access specific object.
        """
        super().check_object_permissions(request, obj)
        user = request.user

        if user.is_superuser or user.is_staff:
            return

        # For models with direct user field
        if hasattr(obj, 'user') and obj.user != user:
            raise PermissionDenied("You don't have permission to access this object.")

        # For MultiUserComposite
        if isinstance(obj, MultiUserComposite):
            if user.id not in obj.participant_user_ids:
                raise PermissionDenied("You don't have permission to access this composite.") 