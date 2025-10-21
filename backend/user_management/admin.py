from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import (
    User,
    SubscriptionPlan,
    FeatureFlag,
    UserSubscription,
    SubscriptionHistory,
    EnvironmentSnapshot,
    UserIdentityBridge
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'language', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('language', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'email')
    ordering = ('-date_joined',)
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('email', 'language')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'duration_days')
    list_filter = ('duration_days',)
    search_fields = ('name', 'description')
    ordering = ('price',)

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'start_date', 'end_date', 'is_active')
    list_filter = ('plan', 'is_active')
    search_fields = ('user__username', 'plan__name')
    date_hierarchy = 'start_date'
    raw_id_fields = ('user',)

@admin.register(SubscriptionHistory)
class SubscriptionHistoryAdmin(admin.ModelAdmin):
    list_display = ('subscription', 'changed_by', 'change_date', 'change_type')
    list_filter = ('change_type', 'change_date')
    search_fields = ('subscription__user__username', 'changed_by__username')
    date_hierarchy = 'change_date'
    raw_id_fields = ('subscription', 'changed_by')

@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'enabled_for_all')
    list_filter = ('enabled_for_all',)
    search_fields = ('name', 'description')

@admin.register(EnvironmentSnapshot)
class EnvironmentSnapshotAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'is_encrypted', 'is_active')
    list_filter = ('is_encrypted', 'is_active', 'created_at')
    search_fields = ('user__username', 'description')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    raw_id_fields = ('user',)

@admin.register(UserIdentityBridge)
class UserIdentityBridgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'identity_type', 'provider_name', 'is_enabled', 'created_at')
    list_filter = ('identity_type', 'is_enabled')
    search_fields = ('user__username', 'provider_name')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('user',)
