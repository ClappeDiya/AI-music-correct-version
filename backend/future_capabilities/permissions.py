from rest_framework import permissions
from django.core.exceptions import ObjectDoesNotExist
from .models import PluginDeveloper, VRSession


class BaseModelPermission(permissions.BasePermission):
    """Base permission class with common functionality."""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner
        return obj.user == request.user


class VREnvironmentPermission(BaseModelPermission):
    """Custom permission for VR environment access."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Check if user has required permissions for VR environment
        return request.user.has_perm('future_capabilities.manage_vr_environment')

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            # Check if session is public or user is participant
            return obj.is_public or request.user in obj.participants.all()
            
        # Write permissions only for session owner or admin
        return obj.owner == request.user or request.user.is_staff


class NeuralDevicePermission(BaseModelPermission):
    """Custom permission for neural device access."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Check if user has required permissions for neural devices
        return request.user.has_perm('future_capabilities.manage_neural_devices')

    def has_object_permission(self, request, view, obj):
        # Only device owner can modify settings
        return obj.user == request.user


class PluginDeveloperPermission(permissions.BasePermission):
    """Custom permission for plugin developer access."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        try:
            # Check if user is a registered plugin developer
            PluginDeveloper.objects.get(user=request.user)
            return True
        except ObjectDoesNotExist:
            return False

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Only the developer can modify their own plugins
        return obj.developer.user == request.user


class PluginInstallationPermission(BaseModelPermission):
    """Custom permission for plugin installation management."""
    
    def has_permission(self, request, view):
        # All authenticated users can install plugins
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Users can only manage their own plugin installations
        return obj.user == request.user


class BiofeedbackPermission(BaseModelPermission):
    """Custom permission for biofeedback data access."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Check if user has required permissions for biofeedback data
        return request.user.has_perm('future_capabilities.manage_biofeedback')

    def has_object_permission(self, request, view, obj):
        # Only data owner can access their biofeedback data
        return obj.user == request.user


class AnalyticsPermission(permissions.BasePermission):
    """Custom permission for analytics data access."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            # Only staff can view analytics
            return request.user.is_staff
            
        # Only superusers can modify analytics data
        return request.user.is_superuser


class FeedbackPermission(BaseModelPermission):
    """Custom permission for feedback management."""
    
    def has_permission(self, request, view):
        # All authenticated users can provide feedback
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            # Staff can view all feedback
            if request.user.is_staff:
                return True
            # Users can only view their own feedback
            return obj.user == request.user
            
        # Users can only modify their own feedback
        return obj.user == request.user