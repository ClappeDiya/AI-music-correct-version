"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Mic,
  Music2,
  Record,
  Volume2,
  VolumeX,
  Timer,
  Metronome,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { virtualStudioApi } from "@/services/virtual_studio/api";

interface TransportBarProps {
  sessionId: string;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

interface RecordingState {
  isRecording: boolean;
  type: "audio" | "midi" | null;
  startTime: number | null;
  duration: number;
}

export function TransportBar({
  sessionId,
  onPlaybackStateChange,
  onRecordingStateChange,
}: TransportBarProps) {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(duration);
  const [tempo, setTempo] = useState(120);
  const [isMetronomeEnabled, setIsMetronomeEnabled] = useState(false);

  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    type: null,
    startTime: null,
    duration: 0,
  });

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const midiInputRef = useRef<WebMidi.MIDIInput | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize Web Audio API
    audioContextRef.current = new AudioContext();

    // Initialize MIDI
    if (navigator.requestMIDIAccess) {
      navigator
        .requestMIDIAccess()
        .then((access) => {
          access.inputs.forEach((input) => {
            midiInputRef.current = input;
            input.onmidimessage = handleMIDIMessage;
          });
        })
        .catch((err) => console.error("MIDI access denied:", err));
    }

    return () => {
      audioContextRef.current?.close();
      stopRecording();
    };
  }, []);

  // Update recording duration
  useEffect(() => {
    if (recordingState.isRecording && recordingState.startTime) {
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingState((prev) => ({
          ...prev,
          duration: (Date.now() - prev.startTime!) / 1000,
        }));
      }, 100);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [recordingState.isRecording, recordingState.startTime]);

  const handleMIDIMessage = (event: WebMidi.MIDIMessageEvent) => {
    if (recordingState.isRecording && recordingState.type === "midi") {
      // Store MIDI data with timestamp
      const midiData = {
        data: Array.from(event.data),
        timestamp: Date.now() - (recordingState.startTime || 0),
      };
      // Send MIDI data to backend
      virtualStudioApi
        .recordMIDIEvent(sessionId, midiData)
        .catch((error) => console.error("Error recording MIDI:", error));
    }
  };

  const startRecording = async (type: "audio" | "midi") => {
    if (type === "audio") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorderRef.current = new MediaRecorder(stream);
        recordedChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(recordedChunksRef.current, {
            type: "audio/wav",
          });
          await virtualStudioApi.uploadRecording(sessionId, audioBlob);
        };

        mediaRecorderRef.current.start();
      } catch (error) {
        console.error("Error starting audio recording:", error);
        return;
      }
    }

    setRecordingState({
      isRecording: true,
      type,
      startTime: Date.now(),
      duration: 0,
    });
    onRecordingStateChange?.(true);
  };

  const stopRecording = () => {
    if (recordingState.isRecording) {
      if (recordingState.type === "audio" && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }

      setRecordingState({
        isRecording: false,
        type: null,
        startTime: null,
        duration: 0,
      });
      onRecordingStateChange?.(false);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    onPlaybackStateChange?.(!isPlaying);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    // Implement seek logic
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(0.5);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Main Transport Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleSeek(0)}>
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button variant="default" size="icon" onClick={togglePlayback}>
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSeek(currentTime + 10)}
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <Toggle
              pressed={isLooping}
              onPressedChange={toggleLoop}
              aria-label="Toggle loop"
            >
              <Repeat className="h-4 w-4" />
            </Toggle>
          </div>

          {/* Recording Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant={
                recordingState.type === "audio" ? "destructive" : "outline"
              }
              size="icon"
              onClick={() =>
                recordingState.type === "audio"
                  ? stopRecording()
                  : startRecording("audio")
              }
            >
              <Mic className="h-4 w-4" />
            </Button>

            <Button
              variant={
                recordingState.type === "midi" ? "destructive" : "outline"
              }
              size="icon"
              onClick={() =>
                recordingState.type === "midi"
                  ? stopRecording()
                  : startRecording("midi")
              }
            >
              <Music2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={([value]) => handleVolumeChange(value)}
              className="w-24"
            />
          </div>
        </div>

        {/* Time Display and Seek Bar */}
        <div className="flex items-center gap-2">
          <span className="text-sm tabular-nums">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={([value]) => handleSeek(value)}
            className="flex-1"
          />
          <span className="text-sm tabular-nums">{formatTime(duration)}</span>
        </div>

        {/* Additional Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Tempo Control */}
            <div className="flex items-center gap-2">
              <Metronome className="h-4 w-4" />
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-16 px-2 py-1 text-sm rounded-md border"
                min={20}
                max={300}
                aria-label="Tempo in BPM"
              />
              <span className="text-sm">BPM</span>
            </div>

            {/* Metronome Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={isMetronomeEnabled}
                onCheckedChange={setIsMetronomeEnabled}
              />
              <Label>Metronome</Label>
            </div>
          </div>

          {/* Recording Status */}
          {recordingState.isRecording && (
            <div className="flex items-center gap-2">
              <Record className="h-4 w-4 text-destructive animate-pulse" />
              <Timer className="h-4 w-4" />
              <span className="text-sm tabular-nums">
                {formatTime(recordingState.duration)}
              </span>
            </div>
          )}
        </div>

        {/* Loop Region (when enabled) */}
        {isLooping && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Loop Region</span>
              <span>
                {formatTime(loopStart)} - {formatTime(loopEnd)}
              </span>
            </div>
            <Slider
              value={[loopStart, loopEnd]}
              max={duration}
              step={0.1}
              onValueChange={([start, end]) => {
                setLoopStart(start);
                setLoopEnd(end);
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
