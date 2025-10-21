from rest_framework import permissions

class IsOwnerOrStaff(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or staff to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Staff members can access everything
        if request.user.is_staff:
            return True
            
        # Check if object has user_id field and matches the request user
        if hasattr(obj, 'user_id'):
            return obj.user_id == request.user.id
            
        return False

class HasRequiredRole(permissions.BasePermission):
    """
    Permission to check if user has required role for specific operations
    """
    def has_permission(self, request, view):
        # Add role-based checks here
        return True 