from rest_framework import permissions

class AnalyticsPermission(permissions.BasePermission):
    """
    Custom permission for analytics data access.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Allow read access to authenticated users with analytics permissions
        if request.method in permissions.SAFE_METHODS:
            return request.user.has_perm('data_analytics.view_analytics')
            
        # Require additional permissions for write operations
        return request.user.has_perm('data_analytics.change_analytics')

class PersonalDataPermission(permissions.BasePermission):
    """
    Permission for personal data access - ensures users can only access their own data.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id or request.user.is_staff 