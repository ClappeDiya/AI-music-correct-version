from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class PrivacyPolicy(models.Model):
    """
    Model to store privacy policy versions and their content.
    """
    version = models.CharField(max_length=50)
    content = models.TextField()
    is_active = models.BooleanField(default=True)
    effective_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Privacy Policy')
        verbose_name_plural = _('Privacy Policies')
        ordering = ['-effective_date']

    def __str__(self):
        return f"Privacy Policy v{self.version}"


class UserConsent(models.Model):
    """
    Model to track user consent to privacy policies.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    policy = models.ForeignKey(PrivacyPolicy, on_delete=models.PROTECT)
    consented_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    is_active = models.BooleanField(default=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('User Consent')
        verbose_name_plural = _('User Consents')
        ordering = ['-consented_at']

    def __str__(self):
        return f"{self.user} - {self.policy.version}"


class DataRetentionPolicy(models.Model):
    """
    Model to define data retention policies for different types of data.
    """
    data_type = models.CharField(max_length=100)
    retention_period_days = models.IntegerField()
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Data Retention Policy')
        verbose_name_plural = _('Data Retention Policies')
        ordering = ['data_type']

    def __str__(self):
        return f"{self.data_type} - {self.retention_period_days} days"


class DataDeletionRequest(models.Model):
    """
    Model to track user requests for data deletion.
    """
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('processing', _('Processing')),
        ('completed', _('Completed')),
        ('rejected', _('Rejected')),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    request_type = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = _('Data Deletion Request')
        verbose_name_plural = _('Data Deletion Requests')
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.user} - {self.request_type}"


class DataAccessLog(models.Model):
    """
    Model to log data access events for auditing purposes.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    data_type = models.CharField(max_length=100)
    access_type = models.CharField(max_length=50)  # e.g., read, write, export
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    success = models.BooleanField(default=True)
    details = models.JSONField(default=dict)

    class Meta:
        verbose_name = _('Data Access Log')
        verbose_name_plural = _('Data Access Logs')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} - {self.data_type} - {self.access_type}"


class DataEncryptionKey(models.Model):
    """
    Model to manage encryption keys for sensitive data.
    """
    key_identifier = models.CharField(max_length=100, unique=True)
    encrypted_key = models.BinaryField()
    algorithm = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    rotated_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()

    class Meta:
        verbose_name = _('Data Encryption Key')
        verbose_name_plural = _('Data Encryption Keys')
        ordering = ['-created_at']

    def __str__(self):
        return self.key_identifier


class ComplianceReport(models.Model):
    """
    Model to store compliance reports and audits.
    """
    REPORT_TYPES = [
        ('gdpr', _('GDPR')),
        ('ccpa', _('CCPA')),
        ('hipaa', _('HIPAA')),
        ('audit', _('Internal Audit')),
    ]

    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    report_date = models.DateField()
    content = models.TextField()
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    is_compliant = models.BooleanField()
    findings = models.JSONField(default=list)
    action_items = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Compliance Report')
        verbose_name_plural = _('Compliance Reports')
        ordering = ['-report_date']

    def __str__(self):
        return f"{self.report_type} Report - {self.report_date}"


class PrivacySettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='data_privacy_settings')
    # ... rest of the model fields ... 