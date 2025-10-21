"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { aiDjApi } from "@/lib/api/services/AiDj";
import { useAiDj } from "@/hooks/useAiDj";
import Cookies from "js-cookie";

/**
 * Test component to verify centralized authentication
 */
export default function TestAuthPage() {
  const [apiResults, setApiResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { startSession, currentSession, endSession } = useAiDj();
  
  const runTest = async (name: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      console.log(`Running test: ${name}`);
      const result = await testFn();
      console.log(`Test ${name} result:`, result);
      setApiResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: true, 
          data: result, 
          timestamp: new Date().toISOString() 
        } 
      }));
    } catch (error) {
      console.error(`Test ${name} failed:`, error);
      setApiResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: false, 
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString() 
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  // Test getting sessions directly via API service
  const testGetSessions = () => runTest('getSessions', async () => {
    return await aiDjApi.getSessions({ limit: 5 });
  });

  // Test creating a session via API service
  const testCreateSession = () => runTest('createSession', async () => {
    return await aiDjApi.createSession({ 
      mood_settings: { energy: 0.7, valence: 0.8 } 
    });
  });

  // Test using the hook to start a session
  const testStartSessionHook = () => runTest('startSessionHook', async () => {
    const session = await startSession({ energy: 0.6, valence: 0.7 });
    return session;
  });

  // Test using the hook to end a session
  const testEndSessionHook = () => runTest('endSessionHook', async () => {
    await endSession();
    return { success: true, message: "Session ended successfully" };
  });

  // Test cookie presence
  const testCookies = () => {
    const dashboardCookie = Cookies.get("dashboard_session");
    setApiResults(prev => ({
      ...prev,
      cookies: {
        success: true,
        data: {
          dashboardCookie: dashboardCookie || null,
          cookiesPresent: !!dashboardCookie
        },
        timestamp: new Date().toISOString()
      }
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Test Page</h1>
      <p className="mb-6">
        This page tests the centralized authentication implementation for the AI DJ module.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Current Session:</strong>{" "}
                {currentSession ? (
                  <span className="text-green-500">Active</span>
                ) : (
                  <span className="text-red-500">None</span>
                )}
              </div>
              <div>
                <strong>Session ID:</strong> {currentSession?.id || "N/A"}
              </div>
              <div>
                <strong>Dashboard Cookie:</strong>{" "}
                {Cookies.get("dashboard_session") ? (
                  <span className="text-green-500">Present</span>
                ) : (
                  <span className="text-red-500">Missing</span>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={testCookies} variant="outline">
              Check Cookies
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test API Operations</CardTitle>
            <CardDescription>Test the API service directly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={testGetSessions} 
                disabled={loading.getSessions}
                className="w-full"
              >
                {loading.getSessions ? "Loading..." : "Get Sessions"}
              </Button>
              <Button 
                onClick={testCreateSession} 
                disabled={loading.createSession}
                className="w-full"
              >
                {loading.createSession ? "Loading..." : "Create Session"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Hook Operations</CardTitle>
            <CardDescription>Test the useAiDj hook implementation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={testStartSessionHook} 
                disabled={loading.startSessionHook}
                className="w-full"
              >
                {loading.startSessionHook ? "Loading..." : "Start Session (Hook)"}
              </Button>
              <Button 
                onClick={testEndSessionHook} 
                disabled={loading.endSessionHook || !currentSession}
                className="w-full"
              >
                {loading.endSessionHook ? "Loading..." : "End Session (Hook)"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Results of API and Hook tests</CardDescription>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            {Object.entries(apiResults).length > 0 ? (
              Object.entries(apiResults).map(([key, result]) => (
                <div key={key} className="mb-4 p-3 border rounded">
                  <div className="font-medium">{key}</div>
                  <div className={result.success ? "text-green-500" : "text-red-500"}>
                    {result.success ? "Success" : "Failed"}
                  </div>
                  <div className="text-xs text-gray-500">{result.timestamp}</div>
                  {result.error && (
                    <div className="text-red-500 mt-1">{result.error}</div>
                  )}
                  {result.data && (
                    <pre className="text-xs mt-1 bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500">No test results yet</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={() => window.location.href = "/dashboard"} variant="outline">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
