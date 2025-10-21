"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from "@/components/ui/useToast";
import { VoiceRecorder } from "@/components/voice_cloning/VoiceRecorder";
import { AudioVisualizer } from "@/components/voice_cloning/AudioVisualizer";
import { AnalysisProgress } from "@/components/voice_cloning/AnalysisProgress";
import { AnalysisResults } from "@/components/voice_cloning/AnalysisResults";
import { Mic, Loader2 } from "lucide-react";
import { voiceCloning } from "@/services/api/voice_cloning";

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const { toast } = useToast();

  const handleRecordingComplete = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob);
      const response = await voiceCloning.startAnalysis(formData);
      setAnalysisId(response.data.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start analysis",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Record Voice Sample</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <VoiceRecorder 
                onRecordingComplete={handleRecordingComplete}
                onStreamChange={setAudioStream}
              />
              {audioStream && (
                <AudioVisualizer 
                  audioStream={audioStream}
                  type="waveform"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {analysisId && !analysisComplete && (
          <AnalysisProgress 
            analysisId={analysisId}
            onComplete={() => setAnalysisComplete(true)}
          />
        )}

        {analysisComplete && analysisId && (
          <AnalysisResults analysisId={analysisId} />
        )}
      </div>
    </div>
  );
} 

