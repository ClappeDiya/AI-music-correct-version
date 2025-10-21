from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import uuid


class LicenseTerm(models.Model):
    """
    Represents a global catalog of standard license terms.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the license term
    license_name = models.TextField(unique=True, verbose_name=_("License Name"), help_text=_("Name of the license (e.g., CC-BY, CC0).")) # Name of the license, must be unique
    description = models.TextField(null=True, blank=True, verbose_name=_("Description"), help_text=_("Description of the license terms.")) # Description of the license
    base_conditions = models.JSONField(null=True, blank=True, verbose_name=_("Base Conditions"), help_text=_("JSON object containing base conditions (e.g., attribution_required, commercial_use).")) # JSON object containing base conditions
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp of when the license term was created.")) # Timestamp of when the license term was created

    def __str__(self):
        return self.license_name

    class Meta:
        verbose_name = _("License Term")
        verbose_name_plural = _("License Terms")


class PaymentProvider(models.Model):
    """
    Represents a global payment provider.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the payment provider
    provider_name = models.TextField(unique=True, verbose_name=_("Provider Name"), help_text=_("Name of the payment provider (e.g., Stripe, PayPal).")) # Name of the payment provider, must be unique
    provider_details = models.JSONField(null=True, blank=True, verbose_name=_("Provider Details"), help_text=_("JSON object containing provider details (e.g., API key, supported currencies).")) # JSON object containing provider details
    active = models.BooleanField(default=True, verbose_name=_("Active"), help_text=_("Indicates if the payment provider is active.")) # Indicates if the payment provider is active
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp of when the payment provider was created.")) # Timestamp of when the payment provider was created

    def __str__(self):
        return self.provider_name

    class Meta:
        verbose_name = _("Payment Provider")
        verbose_name_plural = _("Payment Providers")


class Track(models.Model):
    """
    Represents a track uploaded by a user.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the track
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tracks', verbose_name=_("User"), help_text=_("User who uploaded the track.")) # User who uploaded the track
    title = models.TextField(verbose_name=_("Title"), help_text=_("Title of the track.")) # Title of the track
    file_url = models.TextField(verbose_name=_("File URL"), help_text=_("URL of the audio file in storage.")) # URL of the audio file in storage
    license = models.ForeignKey(LicenseTerm, on_delete=models.RESTRICT, verbose_name=_("License"), help_text=_("License terms for the track.")) # License terms for the track
    pricing = models.JSONField(null=True, blank=True, verbose_name=_("Pricing"), help_text=_("JSON object containing pricing details (e.g., price, currency, royalty_percentage).")) # JSON object containing pricing details
    metadata = models.JSONField(null=True, blank=True, verbose_name=_("Metadata"), help_text=_("JSON object containing track metadata (e.g., composer, genre, duration).")) # JSON object containing track metadata
    published_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Published At"), help_text=_("Timestamp of when the track was published.")) # Timestamp of when the track was published

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = _("Track")
        verbose_name_plural = _("Tracks")


class TrackLicense(models.Model):
    """
    Represents custom or adjusted licenses for a track.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the track license
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='track_licenses', verbose_name=_("Track"), help_text=_("Track this license applies to.")) # Track this license applies to
    custom_conditions = models.JSONField(null=True, blank=True, verbose_name=_("Custom Conditions"), help_text=_("JSON object containing custom license conditions (e.g., territory_restrictions, time_limited).")) # JSON object containing custom license conditions
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp of when the track license was created.")) # Timestamp of when the track license was created

    def __str__(self):
        return f"License for {self.track.title}"

    class Meta:
        verbose_name = _("Track License")
        verbose_name_plural = _("Track Licenses")


class TrackPurchase(models.Model):
    """
    Represents a track purchase or paid licensing transaction.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the track purchase
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='track_purchases', verbose_name=_("Track"), help_text=_("Track that was purchased.")) # Track that was purchased
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='track_purchases', verbose_name=_("Buyer"), help_text=_("User who purchased the track.")) # User who purchased the track
    payment_provider = models.ForeignKey(PaymentProvider, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_("Payment Provider"), help_text=_("Payment provider used for the purchase.")) # Payment provider used for the purchase
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Amount"), help_text=_("Amount paid for the track.")) # Amount paid for the track
    purchased_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Purchased At"), help_text=_("Timestamp of when the track was purchased.")) # Timestamp of when the track was purchased

    def __str__(self):
        return f"Purchase of {self.track.title} by {self.buyer}"

    class Meta:
        verbose_name = _("Track Purchase")
        verbose_name_plural = _("Track Purchases")


class TrackDownload(models.Model):
    """
    Represents a free track download.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the track download
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='track_downloads', verbose_name=_("Track"), help_text=_("Track that was downloaded.")) # Track that was downloaded
    downloader = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='track_downloads', verbose_name=_("Downloader"), help_text=_("User who downloaded the track.")) # User who downloaded the track
    downloaded_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Downloaded At"), help_text=_("Timestamp of when the track was downloaded.")) # Timestamp of when the track was downloaded

    def __str__(self):
        return f"Download of {self.track.title}"

    class Meta:
        verbose_name = _("Track Download")
        verbose_name_plural = _("Track Downloads")


class UsageAgreement(models.Model):
    """
    Represents a user's explicit acceptance of license terms for a track.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the usage agreement
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='usage_agreements', verbose_name=_("Track"), help_text=_("Track for which the license was agreed to.")) # Track for which the license was agreed to
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='usage_agreements', verbose_name=_("User"), help_text=_("User who agreed to the license terms.")) # User who agreed to the license terms
    agreed_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Agreed At"), help_text=_("Timestamp of when the license terms were agreed to.")) # Timestamp of when the license terms were agreed to
    agreement_details = models.JSONField(null=True, blank=True, verbose_name=_("Agreement Details"), help_text=_("JSON object containing a snapshot of the license conditions agreed to.")) # JSON object containing a snapshot of the license conditions agreed to

    def __str__(self):
         return f"Agreement for {self.track.title} by {self.user}"

    class Meta:
        verbose_name = _("Usage Agreement")
        verbose_name_plural = _("Usage Agreements")
        unique_together = ('track', 'user')


class TrackAnalytic(models.Model):
    """
    Represents aggregated analytics for a track.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the track analytic
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='track_analytics', verbose_name=_("Track"), help_text=_("Track for which analytics are stored.")) # Track for which analytics are stored
    analytics_data = models.JSONField(null=True, blank=True, verbose_name=_("Analytics Data"), help_text=_("JSON object containing analytics data (e.g., plays, unique_listeners, top_countries).")) # JSON object containing analytics data
    last_updated = models.DateTimeField(auto_now=True, verbose_name=_("Last Updated"), help_text=_("Timestamp of when the analytics data was last updated.")) # Timestamp of when the analytics data was last updated

    def __str__(self):
        return f"Analytics for {self.track.title}"

    class Meta:
        verbose_name = _("Track Analytic")
        verbose_name_plural = _("Track Analytics")


class RoyaltyTransaction(models.Model):
    """
    Represents a royalty payout to a creator.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the royalty transaction
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='royalty_transactions', verbose_name=_("Track"), help_text=_("Track for which the royalty was paid.")) # Track for which the royalty was paid
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='royalty_transactions', verbose_name=_("User"), help_text=_("Creator receiving the royalty.")) # Creator receiving the royalty
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Amount"), help_text=_("Amount of the royalty payout.")) # Amount of the royalty payout
    transaction_details = models.JSONField(null=True, blank=True, verbose_name=_("Transaction Details"), help_text=_("JSON object containing transaction details (e.g., month, total_streams, rate_per_stream).")) # JSON object containing transaction details
    processed_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Processed At"), help_text=_("Timestamp of when the royalty transaction was processed.")) # Timestamp of when the royalty transaction was processed

    def __str__(self):
        return f"Royalty for {self.track.title} to {self.user}"

    class Meta:
        verbose_name = _("Royalty Transaction")
        verbose_name_plural = _("Royalty Transactions")


class DynamicPricingRule(models.Model):
    """
    Represents rules for dynamic pricing adjustments.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the dynamic pricing rule
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='dynamic_pricing_rules', verbose_name=_("Track"), help_text=_("Track to which the pricing rule applies.")) # Track to which the pricing rule applies
    ruleset = models.JSONField(null=True, blank=True, verbose_name=_("Ruleset"), help_text=_("JSON object containing pricing rules (e.g., base_price, demand_factor, max_price, volume_thresholds).")) # JSON object containing pricing rules
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp of when the pricing rule was last updated.")) # Timestamp of when the pricing rule was last updated

    def __str__(self):
        return f"Pricing rule for {self.track.title}"

    class Meta:
        verbose_name = _("Dynamic Pricing Rule")
        verbose_name_plural = _("Dynamic Pricing Rules")


class ExternalUsageLog(models.Model):
    """
    Represents logs of external track usage detections.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the external usage log
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='external_usage_logs', verbose_name=_("Track"), help_text=_("Track for which external usage was detected.")) # Track for which external usage was detected
    source_info = models.JSONField(null=True, blank=True, verbose_name=_("Source Info"), help_text=_("JSON object containing source information (e.g., platform, video_url, timestamp).")) # JSON object containing source information
    detected_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Detected At"), help_text=_("Timestamp of when the external usage was detected.")) # Timestamp of when the external usage was detected

    def __str__(self):
        return f"External usage of {self.track.title}"

    class Meta:
        verbose_name = _("External Usage Log")
        verbose_name_plural = _("External Usage Logs")


class ConditionalLicenseEscalation(models.Model):
    """
    Represents conditions that alter license terms after certain usage events.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the conditional license escalation
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='conditional_license_escalations', verbose_name=_("Track"), help_text=_("Track for which the license escalation applies.")) # Track for which the license escalation applies
    condition_data = models.JSONField(null=True, blank=True, verbose_name=_("Condition Data"), help_text=_("JSON object containing conditions for license escalation (e.g., downloads_limit, new_terms).")) # JSON object containing conditions for license escalation
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp of when the license escalation was created.")) # Timestamp of when the license escalation was created

    def __str__(self):
        return f"License escalation for {self.track.title}"

    class Meta:
        verbose_name = _("Conditional License Escalation")
        verbose_name_plural = _("Conditional License Escalations")


class BrandedCatalog(models.Model):
    """
    Represents a branded sub-catalog of tracks.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the branded catalog
    catalog_name = models.TextField(verbose_name=_("Catalog Name"), help_text=_("Name of the branded catalog.")) # Name of the branded catalog
    branding_details = models.JSONField(null=True, blank=True, verbose_name=_("Branding Details"), help_text=_("JSON object containing branding details (e.g., logo_url, color_scheme, description).")) # JSON object containing branding details
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"), help_text=_("Timestamp of when the branded catalog was created.")) # Timestamp of when the branded catalog was created

    def __str__(self):
        return self.catalog_name

    class Meta:
        verbose_name = _("Branded Catalog")
        verbose_name_plural = _("Branded Catalogs")


class BrandedCatalogTrack(models.Model):
    """
    Represents the mapping of tracks to branded catalogs.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the branded catalog track
    catalog = models.ForeignKey(BrandedCatalog, on_delete=models.CASCADE, related_name='branded_catalog_tracks', verbose_name=_("Catalog"), help_text=_("Branded catalog to which the track belongs.")) # Branded catalog to which the track belongs
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='branded_catalog_tracks', verbose_name=_("Track"), help_text=_("Track that belongs to the branded catalog.")) # Track that belongs to the branded catalog
    featured = models.BooleanField(default=False, verbose_name=_("Featured"), help_text=_("Indicates if the track is featured in the catalog.")) # Indicates if the track is featured in the catalog

    def __str__(self):
        return f"{self.track.title} in {self.catalog.catalog_name}"

    class Meta:
        verbose_name = _("Branded Catalog Track")
        verbose_name_plural = _("Branded Catalog Tracks")
        unique_together = ('catalog', 'track')


class RegionalLegalFramework(models.Model):
    """
    Represents region-specific legal frameworks and conditions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the regional legal framework
    region_code = models.TextField(verbose_name=_("Region Code"), help_text=_("Code of the region (e.g., EU, US, ASIA).")) # Code of the region
    legal_conditions = models.JSONField(null=True, blank=True, verbose_name=_("Legal Conditions"), help_text=_("JSON object containing legal conditions (e.g., commercial_use_restrictions, reporting_interval).")) # JSON object containing legal conditions
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"), help_text=_("Timestamp of when the legal framework was last updated.")) # Timestamp of when the legal framework was last updated

    def __str__(self):
        return self.region_code

    class Meta:
        verbose_name = _("Regional Legal Framework")
        verbose_name_plural = _("Regional Legal Frameworks")


class TrackLegalMapping(models.Model):
    """
    Represents the mapping of tracks to relevant legal frameworks.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False) # Unique identifier for the track legal mapping
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='track_legal_mappings', verbose_name=_("Track"), help_text=_("Track that is mapped to the legal framework.")) # Track that is mapped to the legal framework
    framework = models.ForeignKey(RegionalLegalFramework, on_delete=models.CASCADE, related_name='track_legal_mappings', verbose_name=_("Framework"), help_text=_("Legal framework to which the track is mapped.")) # Legal framework to which the track is mapped
    last_synced = models.DateTimeField(auto_now=True, verbose_name=_("Last Synced"), help_text=_("Timestamp of when the track was last synced with the legal framework.")) # Timestamp of when the track was last synced with the legal framework

    def __str__(self):
        return f"Mapping of {self.track.title} to {self.framework.region_code}"

    class Meta:
        verbose_name = _("Track Legal Mapping")
        verbose_name_plural = _("Track Legal Mappings")
        unique_together = ('track', 'framework')
