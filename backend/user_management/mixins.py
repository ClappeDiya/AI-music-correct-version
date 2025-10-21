from django.db import models
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.core.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

class UserSecurityMixin:
    """
    Mixin to ensure views enforce user-specific security and access control
    """
    permission_classes = [IsAuthenticated]
    
    @method_decorator(never_cache)
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied("Authentication required")
            
        # Set user context
        self.user = request.user
        return super().dispatch(request, *args, **kwargs)
    
    def get_queryset(self):
        """
        Filter queryset based on user's role and permissions
        """
        queryset = super().get_queryset()
        
        # If user is superuser, return unfiltered queryset
        if self.user.is_superuser:
            return queryset
            
        # If user is staff, apply staff-level filtering
        if self.user.is_staff:
            return self.get_staff_queryset(queryset)
            
        # For regular users, apply user-level filtering
        return self.get_user_queryset(queryset)
    
    def get_staff_queryset(self, queryset):
        """
        Apply staff-level filtering to queryset
        Override in views that need custom staff access rules
        """
        return queryset
    
    def get_user_queryset(self, queryset):
        """
        Apply user-level filtering to queryset
        Override in views that need custom user access rules
        """
        # By default, users can only see their own data
        return queryset.filter(user=self.user)

class UserResourceMixin:
    """
    Mixin for models that belong to specific users
    """
    def save(self, *args, **kwargs):
        if not self.user_id and hasattr(self, '_current_user'):
            self.user = self._current_user
        super().save(*args, **kwargs)
    
    @classmethod
    def get_user_viewable(cls, user):
        """
        Get queryset of objects viewable by the given user
        """
        if user.is_superuser:
            return cls.objects.all()
            
        if user.is_staff:
            return cls.get_staff_viewable(user)
            
        return cls.objects.filter(user=user)
    
    @classmethod
    def get_staff_viewable(cls, user):
        """
        Get queryset of objects viewable by staff users
        Override in models that need custom staff access rules
        """
        return cls.objects.all()