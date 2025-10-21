"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/voice_cloning/LoadingState";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/useToast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { voiceCloning } from "@/services/api/voice_cloning";
import type { VoiceModel } from "@/services/api/voice_cloning";

export default function VoiceCloningPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [models, setModels] = useState<VoiceModel[]>([]);
  const [recordingMode, setRecordingMode] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch voice models when component mounts
    async function fetchVoiceModels() {
      try {
        setIsLoading(true);
        const response = await voiceCloning.getVoiceModels();
        
        if (response && response.data) {
          setModels(response.data);
        }
      } catch (error) {
        console.error("Error fetching voice models:", error);
        toast({
          title: "Error",
          description: "Failed to load voice models. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    if (user) {
      fetchVoiceModels();
    } else {
      setIsLoading(false); // Stop loading if not authenticated
    }
  }, [user, toast]);
  
  const startRecording = () => {
    setRecordingMode(true);
    toast({
      title: "Recording mode activated",
      description: "Please speak clearly into your microphone.",
    });
    
    // In a real implementation, we would start the recording process here
    // and send the data to the backend for processing
  };

  const handleNewModel = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a voice model",
        variant: "destructive",
      });
      return;
    }
    
    // Add logic to create a new model
    toast({
      title: "Creating new model",
      description: "Follow the instructions to create your voice model",
    });
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Voice Cloning</h1>
      <p className="text-gray-500 mb-4">Create and manage your voice cloning models</p>
      
      {!user ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center py-6 text-gray-500">
              Please log in to access voice cloning features
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Record</CardTitle>
              <CardDescription>Record your voice to create a new voice model</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingState />
              ) : recordingMode ? (
                <div className="text-center py-4">
                  <div className="mb-4 text-red-500 animate-pulse">Recording...</div>
                  <Button onClick={() => setRecordingMode(false)} variant="outline" className="w-full">
                    Stop Recording
                  </Button>
                </div>
              ) : (
                <Button onClick={startRecording} className="w-full">
                  Start Recording
                </Button>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Models</CardTitle>
              <CardDescription>Your recently created voice models</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingState />
              ) : models.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No voice models created yet
                  <div className="mt-4">
                    <Button onClick={handleNewModel} size="sm">
                      Create First Model
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {models.map((model) => (
                    <div 
                      key={model.id}
                      className="p-3 border rounded-md hover:bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-gray-500">
                          Created: {new Date(model.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span 
                          className={`px-2 py-1 text-xs rounded-full ${
                            model.status === 'ready' 
                              ? 'bg-green-100 text-green-800' 
                              : model.status === 'training' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {model.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <Button onClick={handleNewModel} size="sm" className="w-full mt-4">
                    Create New Model
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
