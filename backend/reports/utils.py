import hashlib
import json
from typing import Any, Dict, List, Optional
import pandas as pd
import numpy as np
from django.conf import settings
from django.core.cache import cache
from django.db.models import Q
from django.utils import timezone

def anonymize_data(data: List[Dict], fields_to_anonymize: List[str]) -> List[Dict]:
    """Anonymize sensitive fields in the data."""
    def anonymize_value(value: Any) -> str:
        if isinstance(value, str):
            # Hash the value for anonymization
            return hashlib.sha256(value.encode()).hexdigest()[:8]
        return str(value)

    anonymized_data = []
    for item in data:
        anonymized_item = item.copy()
        for field in fields_to_anonymize:
            if field in item:
                anonymized_item[field] = anonymize_value(item[field])
        anonymized_data.append(anonymized_item)
    
    return anonymized_data

def apply_privacy_rules(
    data: List[Dict],
    anonymization_rules: Dict,
    masking_rules: Dict,
    min_aggregation_size: int
) -> List[Dict]:
    """Apply privacy rules to the data."""
    # Convert to DataFrame for easier manipulation
    df = pd.DataFrame(data)
    
    # Apply anonymization
    for field, rule in anonymization_rules.items():
        if field in df.columns:
            if rule == 'hash':
                df[field] = df[field].apply(lambda x: hashlib.sha256(str(x).encode()).hexdigest()[:8])
            elif rule == 'range':
                df[field] = pd.qcut(df[field], q=5, labels=['Q1', 'Q2', 'Q3', 'Q4', 'Q5'])
    
    # Apply masking
    for field, rule in masking_rules.items():
        if field in df.columns:
            if rule == 'partial':
                df[field] = df[field].apply(lambda x: f"{str(x)[:2]}***{str(x)[-2:]}")
            elif rule == 'full':
                df[field] = '***'
    
    # Remove small groups
    if len(df) > 0:
        group_counts = df.groupby(list(anonymization_rules.keys())).size()
        valid_groups = group_counts[group_counts >= min_aggregation_size].index
        df = df[df[list(anonymization_rules.keys())].apply(tuple, axis=1).isin(valid_groups)]
    
    return df.to_dict('records')

def compute_metrics(params: Dict) -> Dict:
    """Compute metrics based on parameters."""
    metrics = {}
    
    # Get time range
    start_date = params.get('start_date')
    end_date = params.get('end_date')
    
    # Compute basic metrics
    metrics['total_users'] = compute_total_users(start_date, end_date)
    metrics['active_users'] = compute_active_users(start_date, end_date)
    metrics['revenue'] = compute_revenue(start_date, end_date)
    
    # Compute trends
    metrics['user_trend'] = compute_trend('users', start_date, end_date)
    metrics['revenue_trend'] = compute_trend('revenue', start_date, end_date)
    
    return metrics

def fetch_external_data(source: 'ExternalDataSource') -> Dict:
    """Fetch data from external sources."""
    import requests
    from requests.exceptions import RequestException
    
    try:
        response = requests.get(
            source.connection_details['url'],
            headers=source.connection_details.get('headers', {}),
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except RequestException as e:
        raise Exception(f"Failed to fetch external data: {str(e)}")

def compute_heatmap_data(
    x_field: str,
    y_field: str,
    value_field: str,
    filters: Optional[Dict] = None
) -> List[Dict]:
    """Compute data for heatmap visualization."""
    # Get data from database
    data = get_filtered_data(filters)
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Create pivot table for heatmap
    heatmap_data = df.pivot_table(
        values=value_field,
        index=y_field,
        columns=x_field,
        aggfunc='sum',
        fill_value=0
    )
    
    # Convert to format needed for visualization
    result = []
    for y in heatmap_data.index:
        for x in heatmap_data.columns:
            result.append({
                'x': x,
                'y': y,
                'value': float(heatmap_data.loc[y, x])
            })
    
    return result

def compute_geomap_data(
    location_field: str,
    metric_field: str,
    aggregation: str = 'sum'
) -> List[Dict]:
    """Compute data for geographical visualization."""
    # Get data from database
    data = get_location_data()
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    
    # Aggregate by location
    if aggregation == 'sum':
        agg_func = 'sum'
    elif aggregation == 'avg':
        agg_func = 'mean'
    else:
        agg_func = 'count'
    
    geo_data = df.groupby(location_field)[metric_field].agg(agg_func).reset_index()
    
    return geo_data.to_dict('records')

def compute_network_data(
    node_type: str,
    edge_type: str,
    metrics: List[str],
    depth: int = 1
) -> Dict:
    """Compute data for network graph visualization."""
    # Get nodes and edges from database
    nodes = get_network_nodes(node_type, depth)
    edges = get_network_edges(edge_type, nodes)
    
    # Compute metrics for nodes
    node_metrics = compute_node_metrics(nodes, metrics)
    
    return {
        'nodes': nodes,
        'edges': edges,
        'metrics': node_metrics
    }

def get_filtered_data(filters: Optional[Dict] = None) -> List[Dict]:
    """Get data with applied filters."""
    # Implementation depends on your data model
    pass

def get_location_data() -> List[Dict]:
    """Get location-based data."""
    # Implementation depends on your data model
    pass

def get_network_nodes(node_type: str, depth: int) -> List[Dict]:
    """Get nodes for network graph."""
    # Implementation depends on your data model
    pass

def get_network_edges(edge_type: str, nodes: List[Dict]) -> List[Dict]:
    """Get edges for network graph."""
    # Implementation depends on your data model
    pass

def compute_node_metrics(nodes: List[Dict], metrics: List[str]) -> Dict:
    """Compute metrics for network nodes."""
    # Implementation depends on your metrics
    pass

def compute_total_users(start_date: str, end_date: str) -> int:
    """Compute total users in date range."""
    # Implementation depends on your data model
    pass

def compute_active_users(start_date: str, end_date: str) -> int:
    """Compute active users in date range."""
    # Implementation depends on your data model
    pass

def compute_revenue(start_date: str, end_date: str) -> float:
    """Compute revenue in date range."""
    # Implementation depends on your data model
    pass

def compute_trend(metric_type: str, start_date: str, end_date: str) -> List[Dict]:
    """Compute trend data for given metric."""
    # Implementation depends on your data model
    pass
