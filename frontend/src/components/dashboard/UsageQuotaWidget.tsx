'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Zap, TrendingUp } from 'lucide-react';

interface UsageData {
  monthly: {
    used: number;
    limit: number;
    remaining: number;
  };
  daily: {
    used: number;
    limit: number;
    remaining: number;
  };
  plan: string;
  can_generate: boolean;
}

export function UsageQuotaWidget() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/v1/usage-quota/`, {
        credentials: 'include',
      });
      const data = await response.json();
      setUsage(data);
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !usage) return null;

  const isPro = usage.plan === 'pro';
  const monthlyPercent = isPro ? 100 : (usage.monthly.used / usage.monthly.limit) * 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          {isPro ? 'Pro Plan' : 'Free Plan'}
        </CardTitle>
        <Zap className={`h-4 w-4 ${isPro ? 'text-yellow-500' : 'text-gray-400'}`} />
      </CardHeader>

      <CardContent className="space-y-4">
        {isPro ? (
          <div className="text-center py-4">
            <TrendingUp className="h-12 w-12 mx-auto text-green-500 mb-2" />
            <p className="text-lg font-semibold">Unlimited Generations</p>
            <p className="text-sm text-gray-500">You're on the Pro plan</p>
          </div>
        ) : (
          <>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>This Month</span>
                <span className="font-medium">
                  {usage.monthly.used} / {usage.monthly.limit}
                </span>
              </div>
              <Progress value={monthlyPercent} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Today</span>
                <span className="font-medium">
                  {usage.daily.used} / {usage.daily.limit}
                </span>
              </div>
              <Progress
                value={(usage.daily.used / usage.daily.limit) * 100}
                className="h-2"
              />
            </div>

            {!usage.can_generate && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You've reached your limit. Upgrade to Pro for unlimited access.
                </p>
              </div>
            )}

            <Button className="w-full" size="sm" asChild>
              <a href="/pricing">Upgrade to Pro</a>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
