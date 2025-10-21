'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Loader2, Sparkles, Download, RefreshCw } from 'lucide-react';
import {
  generateAnonymousMusic,
  checkAnonymousQuota,
  recordAnonymousGeneration,
  type GeneratedTrack
} from '@/services/api/anonymous_music';

export function InstantTrialSection() {
  const [generating, setGenerating] = useState(false);
  const [track, setTrack] = useState<GeneratedTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState({
    genre: 'electronic',
    mood: 'energetic',
    duration: 30,
  });

  const handleGenerate = async () => {
    // Check quota
    const quota = checkAnonymousQuota();
    if (!quota.canGenerate) {
      const resetTime = quota.resetTime?.toLocaleTimeString() || 'soon';
      setError(`Rate limit reached. You have ${quota.remaining} generations left. Resets at ${resetTime}`);
      return;
    }

    setGenerating(true);
    setError(null);
    setTrack(null);

    try {
      const result = await generateAnonymousMusic(params);
      setTrack(result);
      recordAnonymousGeneration();
    } catch (err: any) {
      setError(err.message || 'Failed to generate music');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section id="instant-trial" className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Try It Right Now</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            No signup required. Generate your first track in 10 seconds.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            <div className="space-y-6">
              {/* Generator Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Genre</Label>
                  <Select
                    value={params.genre}
                    onValueChange={(value) => setParams({ ...params, genre: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronic">Electronic</SelectItem>
                      <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                      <SelectItem value="lo-fi">Lo-Fi</SelectItem>
                      <SelectItem value="jazz">Jazz</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="classical">Classical</SelectItem>
                      <SelectItem value="ambient">Ambient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Mood</Label>
                  <Select
                    value={params.mood}
                    onValueChange={(value) => setParams({ ...params, mood: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="uplifting">Uplifting</SelectItem>
                      <SelectItem value="melancholic">Melancholic</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="mysterious">Mysterious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Duration</Label>
                  <Select
                    value={params.duration.toString()}
                    onValueChange={(value) => setParams({ ...params, duration: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds (Free limit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating... (this may take 10-30 seconds)
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Music
                  </>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Generated Track Display */}
              {track && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{track.title}</h3>
                      <p className="text-sm text-gray-500">
                        {params.genre} • {params.mood} • {params.duration}s
                      </p>
                    </div>
                  </div>

                  {/* Audio Player */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <audio controls className="w-full">
                      <source src={track.url} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleGenerate}
                      className="flex-1"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>

                    <Button
                      onClick={() => {
                        // Redirect to signup with track ID preserved
                        window.location.href = `/auth/register?track=${track.id}&returnTo=/project/dashboard`;
                      }}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download (Sign Up)
                    </Button>
                  </div>

                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                    <p className="text-sm text-center text-gray-700 dark:text-gray-300">
                      <strong>Sign up free</strong> to download in MP3, WAV, or STEMS format and create unlimited longer tracks!
                    </p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {!track && !generating && (
                <div className="text-center text-sm text-gray-500">
                  <p>Choose your preferences above and click Generate to create your first AI music track</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
