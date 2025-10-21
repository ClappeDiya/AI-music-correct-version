import { useCallback } from 'react';
import { useProject, MoodParameters, GenreParameters } from '@/contexts/ProjectContext';

// Define return type for the hook
interface UseCreativeParametersReturn {
  // Mood parameters
  mood: MoodParameters;
  updateMood: (updates: Partial<MoodParameters>) => void;
  propagateMoodToMusic: () => void;
  propagateMoodToLyrics: () => void;
  
  // Genre parameters
  genre: GenreParameters;
  updateGenre: (updates: Partial<GenreParameters>) => void;
  propagateGenreToMusic: () => void;
  
  // General parameter utilities
  applyPreset: (presetName: string) => void;
  getCompatibleParameters: (moduleA: string, moduleB: string) => Record<string, any>;
  getRecommendedParameters: (targetModule: string) => Record<string, any>;
}

/**
 * Hook for managing creative parameters shared between different modules
 */
export function useCreativeParameters(): UseCreativeParametersReturn {
  const { project, dispatch } = useProject();
  
  // Get mood parameters
  const mood = project.moodParameters;
  
  // Update mood parameters
  const updateMood = useCallback((updates: Partial<MoodParameters>) => {
    dispatch({ type: 'UPDATE_MOOD', payload: updates });
  }, [dispatch]);
  
  // Propagate mood parameters to music generation settings
  const propagateMoodToMusic = useCallback(() => {
    // Map mood parameters to music generation parameters
    const musicParams = {
      tempo: mood.tempo,
      complexity: mood.complexity,
      emotionalTone: mood.emotionalTone
    };
    
    // Store these in the module state
    dispatch({
      type: 'SET_MODULE_STATE',
      payload: {
        module: 'ai_music',
        state: {
          ...project.moduleStates.ai_music,
          generationParameters: {
            ...project.moduleStates.ai_music?.generationParameters,
            ...musicParams
          }
        }
      }
    });
  }, [dispatch, mood, project.moduleStates.ai_music]);
  
  // Propagate mood parameters to lyrics generation
  const propagateMoodToLyrics = useCallback(() => {
    // Map mood to lyrics parameters
    const lyricsParams = {
      emotionalTone: mood.emotionalTone,
      intensity: mood.intensity
    };
    
    // Store in module state
    dispatch({
      type: 'SET_MODULE_STATE',
      payload: {
        module: 'lyrics',
        state: {
          ...project.moduleStates.lyrics,
          generationParameters: {
            ...project.moduleStates.lyrics?.generationParameters,
            ...lyricsParams
          }
        }
      }
    });
  }, [dispatch, mood, project.moduleStates.lyrics]);
  
  // Get genre parameters
  const genre = project.genreParameters;
  
  // Update genre parameters
  const updateGenre = useCallback((updates: Partial<GenreParameters>) => {
    dispatch({ type: 'UPDATE_GENRE', payload: updates });
  }, [dispatch]);
  
  // Propagate genre parameters to music generation
  const propagateGenreToMusic = useCallback(() => {
    // Map genre parameters to music generation
    const musicGenreParams = {
      genre: genre.primaryGenre,
      influences: genre.influences,
      era: genre.era,
      experimentalLevel: genre.experimentalFactor
    };
    
    // Store in module state
    dispatch({
      type: 'SET_MODULE_STATE',
      payload: {
        module: 'ai_music',
        state: {
          ...project.moduleStates.ai_music,
          generationParameters: {
            ...project.moduleStates.ai_music?.generationParameters,
            ...musicGenreParams
          }
        }
      }
    });
  }, [dispatch, genre, project.moduleStates.ai_music]);
  
  // Apply a predefined preset of creative parameters
  const applyPreset = useCallback((presetName: string) => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') return;
    
    // Define presets for different creative styles
    const presets: Record<string, { mood: Partial<MoodParameters>, genre: Partial<GenreParameters> }> = {
      'upbeat_pop': {
        mood: {
          emotionalTone: 'happy',
          intensity: 70,
          tempo: 128,
          complexity: 45
        },
        genre: {
          primaryGenre: 'pop',
          influences: ['electronic', 'dance'],
          era: 'contemporary',
          experimentalFactor: 20
        }
      },
      'melancholic_indie': {
        mood: {
          emotionalTone: 'melancholic',
          intensity: 60,
          tempo: 85,
          complexity: 65
        },
        genre: {
          primaryGenre: 'indie',
          influences: ['folk', 'alternative'],
          era: '2010s',
          experimentalFactor: 40
        }
      },
      'epic_cinematic': {
        mood: {
          emotionalTone: 'epic',
          intensity: 90,
          tempo: 110,
          complexity: 80
        },
        genre: {
          primaryGenre: 'cinematic',
          influences: ['orchestral', 'electronic'],
          era: 'contemporary',
          experimentalFactor: 30
        }
      },
      'chill_lofi': {
        mood: {
          emotionalTone: 'relaxed',
          intensity: 30,
          tempo: 80,
          complexity: 50
        },
        genre: {
          primaryGenre: 'lofi',
          influences: ['jazz', 'hiphop'],
          era: 'contemporary',
          experimentalFactor: 25
        }
      },
      'energetic_edm': {
        mood: {
          emotionalTone: 'energetic',
          intensity: 85,
          tempo: 140,
          complexity: 60
        },
        genre: {
          primaryGenre: 'edm',
          influences: ['house', 'trance'],
          era: 'contemporary',
          experimentalFactor: 35
        }
      }
    };
    
    // Apply the selected preset if it exists
    const selectedPreset = presets[presetName];
    if (selectedPreset) {
      if (selectedPreset.mood) {
        updateMood(selectedPreset.mood);
      }
      
      if (selectedPreset.genre) {
        updateGenre(selectedPreset.genre);
      }
    }
  }, [updateMood, updateGenre]);
  
  // Get parameters that are compatible between two modules
  const getCompatibleParameters = useCallback((moduleA: string, moduleB: string) => {
    // Define parameter compatibility between modules
    const compatibilityMap: Record<string, Record<string, string[]>> = {
      'mood_music': {
        'ai_music': ['tempo', 'emotionalTone', 'complexity'],
        'lyrics': ['emotionalTone', 'intensity'],
        'voice_cloning': ['emotionalTone', 'intensity']
      },
      'ai_music': {
        'lyrics': ['tempo', 'emotionalTone'],
        'genre_mixing': ['primaryGenre', 'influences', 'experimentalFactor']
      },
      'genre_mixing': {
        'ai_music': ['primaryGenre', 'influences', 'era'],
        'virtual_studio': ['primaryGenre']
      }
    };
    
    // Get compatible parameters
    const compatibleParams: Record<string, any> = {};
    
    // Check direct compatibility
    if (compatibilityMap[moduleA]?.[moduleB]) {
      const paramNames = compatibilityMap[moduleA][moduleB];
      
      // Get values from appropriate source based on parameter type
      paramNames.forEach(param => {
        if (param in mood) {
          compatibleParams[param] = (mood as any)[param];
        } else if (param in genre) {
          compatibleParams[param] = (genre as any)[param];
        }
      });
    }
    
    // Also check reverse compatibility
    if (compatibilityMap[moduleB]?.[moduleA]) {
      const paramNames = compatibilityMap[moduleB][moduleA];
      
      paramNames.forEach(param => {
        if (param in mood && !(param in compatibleParams)) {
          compatibleParams[param] = (mood as any)[param];
        } else if (param in genre && !(param in compatibleParams)) {
          compatibleParams[param] = (genre as any)[param];
        }
      });
    }
    
    return compatibleParams;
  }, [mood, genre]);
  
  // Get AI-recommended parameters for a target module based on project state
  const getRecommendedParameters = useCallback((targetModule: string) => {
    // This would ideally call an AI service to get smart recommendations
    // For now, we'll implement a simpler rule-based approach
    
    const recommendations: Record<string, any> = {};
    
    switch (targetModule) {
      case 'lyrics':
        // Recommend lyric parameters based on existing music
        if (project.tracks.length > 0) {
          recommendations.theme = mood.emotionalTone === 'happy' ? 'uplifting' : 
                                 mood.emotionalTone === 'melancholic' ? 'reflective' : 
                                 'descriptive';
          
          recommendations.structure = genre.primaryGenre === 'pop' ? 'verse-chorus' :
                                     genre.primaryGenre === 'rap' ? 'verses' :
                                     'free-form';
        }
        break;
        
      case 'voice_cloning':
        // Recommend vocal style based on genre and mood
        if (project.lyrics.length > 0) {
          recommendations.expressiveness = mood.intensity > 70 ? 'high' : 
                                         mood.intensity < 30 ? 'low' : 
                                         'medium';
          
          recommendations.style = genre.primaryGenre === 'pop' ? 'commercial' :
                                genre.primaryGenre === 'rock' ? 'powerful' :
                                genre.primaryGenre === 'jazz' ? 'expressive' :
                                'neutral';
        }
        break;
        
      case 'virtual_studio':
        // Recommend mixing parameters based on genre
        recommendations.reverb = genre.primaryGenre === 'pop' ? 'medium' :
                               genre.primaryGenre === 'rock' ? 'small' :
                               genre.primaryGenre === 'ambient' ? 'large' :
                               'medium';
                               
        recommendations.compression = genre.primaryGenre === 'edm' ? 'heavy' :
                                    genre.primaryGenre === 'classical' ? 'light' :
                                    'medium';
        break;
    }
    
    return recommendations;
  }, [project, mood, genre]);
  
  return {
    mood,
    updateMood,
    propagateMoodToMusic,
    propagateMoodToLyrics,
    
    genre,
    updateGenre,
    propagateGenreToMusic,
    
    applyPreset,
    getCompatibleParameters,
    getRecommendedParameters
  };
} 