from rest_framework import permissions
from django.db.models import Q
from django.core.exceptions import PermissionDenied

class SRLPermission(permissions.BasePermission):
    """
    Custom permission class to enforce Security Role Level (SRL) access control.
    """
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return False
            
        # Superusers have full access
        if request.user.is_superuser:
            return True
            
        # Check user roles/permissions
        if hasattr(view, 'required_roles'):
            return request.user.groups.filter(name__in=view.required_roles).exists()
            
        return True

    def has_object_permission(self, request, view, obj):
        # Superusers have full access
        if request.user.is_superuser:
            return True
            
        # Check if object has user-specific access
        if hasattr(obj, 'user_id'):
            return obj.user_id == request.user.id
            
        # Check if object has group-specific access
        if hasattr(obj, 'group_id'):
            return request.user.groups.filter(id=obj.group_id).exists()
            
        return True

class SRLMixin:
    """
    Mixin to enforce Security Role Level (SRL) access control.
    """
    permission_classes = [SRLPermission]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.is_superuser:
            return queryset

        # Apply user-specific filtering
        user_filter = Q()
        if 'user_id' in [f.name for f in queryset.model._meta.fields]:
            user_filter |= Q(user_id=user.id)
            
        # Apply group-based filtering
        group_filter = Q()
        if 'group_id' in [f.name for f in queryset.model._meta.fields]:
            user_groups = user.groups.values_list('id', flat=True)
            group_filter |= Q(group_id__in=user_groups)

        return queryset.filter(user_filter | group_filter)

    def perform_create(self, serializer):
        # Automatically set user_id on creation if field exists
        if 'user_id' in [f.name for f in serializer.Meta.model._meta.fields]:
            serializer.save(user_id=self.request.user.id)
        else:
            serializer.save() 