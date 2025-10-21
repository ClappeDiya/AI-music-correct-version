from django_filters import rest_framework as filters
from .models import (
    TrackAnalyticsAggregate,
    GenreTrend,
    GeographicInsight,
    GenreMixingSession
)
from django.db.models import JSONField

class TrackAnalyticsFilter(filters.FilterSet):
    start_date = filters.DateTimeFilter(field_name='last_updated', lookup_expr='gte')
    end_date = filters.DateTimeFilter(field_name='last_updated', lookup_expr='lte')
    
    class Meta:
        model = TrackAnalyticsAggregate
        fields = ['track', 'aggregate_data']
        filter_overrides = {
            JSONField: {
                'filter_class': filters.CharFilter,
                'extra': lambda f: {
                    'lookup_expr': 'icontains',
                }
            },
        }

class GenreTrendFilter(filters.FilterSet):
    class Meta:
        model = GenreTrend
        fields = ['genre', 'trend_data', 'last_updated'] 
        filter_overrides = {
            JSONField: {
                'filter_class': filters.CharFilter,
                'extra': lambda f: {
                    'lookup_expr': 'icontains',
                }
            },
        } 