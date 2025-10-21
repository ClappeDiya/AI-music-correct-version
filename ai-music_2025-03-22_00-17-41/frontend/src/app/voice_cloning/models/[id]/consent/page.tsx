"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/useToast";
import { PermissionManager } from '@/components/voice_cloning/PermissionManager';
import {
  VoiceModelPermission,
  VoiceModelConsentScope,
  voiceCloning,
} from "@/services/api/voice_cloning";
import { Loader2, Shield } from "lucide-react";

interface Props {
  params: {
    id: string;
  };
}

export default function ModelConsentPage({ params }: Props) {
  const [permissions, setPermissions] = useState<VoiceModelPermission[]>([]);
  const [consentScopes, setConsentScopes] = useState<VoiceModelConsentScope[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConsentData();
  }, [params.id]);

  const loadConsentData = async () => {
    try {
      const [permissionsResponse, scopesResponse] = await Promise.all([
        voiceCloning.getModelPermissions(parseInt(params.id)),
        voiceCloning.getConsentScopes(parseInt(params.id)),
      ]);

      setPermissions(permissionsResponse.data);
      setConsentScopes(scopesResponse.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load consent data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Consent Management</h1>
      </div>

      <Tabs defaultValue="permissions">
        <TabsList>
          <TabsTrigger value="permissions">User Permissions</TabsTrigger>
          <TabsTrigger value="scopes">Usage Scopes</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <PermissionManager
                modelId={parseInt(params.id)}
                permissions={permissions}
                onUpdate={loadConsentData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scopes">
          <Card>
            <CardHeader>
              <CardTitle>Usage Scopes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consentScopes.map((scope) => (
                  <Card key={scope.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <h4 className="font-medium">Scope Details</h4>
                        <pre className="bg-muted p-4 rounded-lg overflow-auto">
                          {JSON.stringify(scope.scope_data, null, 2)}
                        </pre>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(scope.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 