from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        return False


class IsSessionOwnerOrCollaborator(permissions.BasePermission):
    """
    Custom permission to only allow session owners and collaborators to access session-related objects.
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'session'):
            session = obj.session
        else:
            session = obj

        return (
            session.user == request.user or
            request.user in session.collaborators.all() or
            session.is_public
        )


class IsPublicOrOwner(permissions.BasePermission):
    """
    Custom permission to allow access to public items or owners.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS and getattr(obj, 'is_public', False):
            return True

        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        
        return False 