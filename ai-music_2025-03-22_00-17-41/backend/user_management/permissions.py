from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user

class IsOwnerOrStaff(permissions.BasePermission):
    """
    Permission to only allow owners or staff to access an object.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user or request.user.is_staff

class CanAccessPublicResource(permissions.BasePermission):
    """
    Permission to access public resources.
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'is_public') and obj.is_public:
            return True
        return obj.user == request.user 