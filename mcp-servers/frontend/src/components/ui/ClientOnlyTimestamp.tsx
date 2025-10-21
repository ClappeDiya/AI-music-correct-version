"use client";

import React, { useState, useEffect } from 'react';
import { formatDateTime } from '@/lib/utils';

interface ClientOnlyTimestampProps {
  timestamp: string | number | Date;
  prefix?: string;
  className?: string;
}

export function ClientOnlyTimestamp({ 
  timestamp, 
  prefix = "Last updated", 
  className = "text-muted-foreground"
}: ClientOnlyTimestampProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // During SSR, return a placeholder to prevent hydration mismatch
  if (!mounted) {
    return <span className={className}>{prefix} recently</span>;
  }
  
  return <span className={className}>{prefix}: {formatDateTime(timestamp)}</span>;
} 