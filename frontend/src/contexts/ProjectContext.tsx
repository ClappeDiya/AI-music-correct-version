"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define project-related types
export interface Track {
  id: string;
  name: string;
  audioUrl?: string;
  waveformData?: number[];
  instrumentalLayers?: {
    id: string;
    name: string;
    volume: number;
    pan: number;
    muted: boolean;
  }[];
}

export interface LyricsContent {
  id: string;
  trackId: string;
  content: string;
  language: string;
  timestampedContent?: {
    start_time: number;
    text: string;
  }[];
}

export interface VocalProfile {
  id: string;
  name: string;
  model: string;
  settings: Record<string, any>;
}

export interface MoodParameters {
  emotionalTone: string;
  intensity: number;
  tempo: number;
  complexity: number;
}

export interface GenreParameters {
  primaryGenre: string;
  influences: string[];
  era: string;
  experimentalFactor: number;
}

export interface Project {
  id: string;
  title: string;
  created: string;
  lastModified: string;
  tracks: Track[];
  lyrics: LyricsContent[];
  vocalProfiles: VocalProfile[];
  moodParameters: MoodParameters;
  genreParameters: GenreParameters;
  currentModule?: string;
  moduleStates: Record<string, any>;
}

// Define action types
type ProjectAction = 
  | { type: 'SET_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Partial<Project> }
  | { type: 'ADD_TRACK'; payload: Track }
  | { type: 'UPDATE_TRACK'; payload: { id: string; updates: Partial<Track> } }
  | { type: 'REMOVE_TRACK'; payload: string }
  | { type: 'SET_LYRICS'; payload: LyricsContent }
  | { type: 'UPDATE_MOOD'; payload: Partial<MoodParameters> }
  | { type: 'UPDATE_GENRE'; payload: Partial<GenreParameters> }
  | { type: 'SET_CURRENT_MODULE'; payload: string }
  | { type: 'SET_MODULE_STATE'; payload: { module: string; state: any } }
  | { type: 'CLEAR_PROJECT' };

// Default values for a new project
const defaultMoodParameters: MoodParameters = {
  emotionalTone: 'neutral',
  intensity: 50,
  tempo: 120,
  complexity: 50
};

const defaultGenreParameters: GenreParameters = {
  primaryGenre: 'pop',
  influences: [],
  era: 'contemporary',
  experimentalFactor: 30
};

const defaultProject: Project = {
  id: '',
  title: 'Untitled Project',
  created: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  tracks: [],
  lyrics: [],
  vocalProfiles: [],
  moodParameters: defaultMoodParameters,
  genreParameters: defaultGenreParameters,
  moduleStates: {}
};

// Create the context
interface ProjectContextType {
  project: Project;
  dispatch: React.Dispatch<ProjectAction>;
  createNewProject: (title?: string) => void;
  loadProject: (id: string) => Promise<void>;
  saveProject: () => Promise<void>;
  navigateToModule: (module: string, params?: Record<string, any>) => void;
  getSuggestedNextSteps: () => { module: string; title: string; description: string }[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Reducer function to handle project state updates
function projectReducer(state: Project, action: ProjectAction): Project {
  switch (action.type) {
    case 'SET_PROJECT':
      return action.payload;
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        ...action.payload,
        lastModified: new Date().toISOString()
      };
    
    case 'ADD_TRACK':
      return {
        ...state,
        tracks: [...state.tracks, action.payload],
        lastModified: new Date().toISOString()
      };
    
    case 'UPDATE_TRACK':
      return {
        ...state,
        tracks: state.tracks.map(track => 
          track.id === action.payload.id 
            ? { ...track, ...action.payload.updates } 
            : track
        ),
        lastModified: new Date().toISOString()
      };
    
    case 'REMOVE_TRACK':
      return {
        ...state,
        tracks: state.tracks.filter(track => track.id !== action.payload),
        lastModified: new Date().toISOString()
      };
    
    case 'SET_LYRICS':
      const existingLyricIndex = state.lyrics.findIndex(l => l.trackId === action.payload.trackId);
      let updatedLyrics = [...state.lyrics];
      
      if (existingLyricIndex >= 0) {
        updatedLyrics[existingLyricIndex] = action.payload;
      } else {
        updatedLyrics.push(action.payload);
      }
      
      return {
        ...state,
        lyrics: updatedLyrics,
        lastModified: new Date().toISOString()
      };
    
    case 'UPDATE_MOOD':
      return {
        ...state,
        moodParameters: {
          ...state.moodParameters,
          ...action.payload
        },
        lastModified: new Date().toISOString()
      };
    
    case 'UPDATE_GENRE':
      return {
        ...state,
        genreParameters: {
          ...state.genreParameters,
          ...action.payload
        },
        lastModified: new Date().toISOString()
      };
    
    case 'SET_CURRENT_MODULE':
      return {
        ...state,
        currentModule: action.payload
      };
    
    case 'SET_MODULE_STATE':
      return {
        ...state,
        moduleStates: {
          ...state.moduleStates,
          [action.payload.module]: action.payload.state
        }
      };
    
    case 'CLEAR_PROJECT':
      return {
        ...defaultProject,
        id: '',
        title: 'Untitled Project',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
    
    default:
      return state;
  }
}

// Provider component
export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, dispatch] = useReducer(projectReducer, defaultProject);
  const router = useRouter();

  // Load project data from localStorage on initial render (only in browser)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProject = localStorage.getItem('currentProject');
      if (savedProject) {
        try {
          // Instead of directly setting the state during render,
          // schedule it for after hydration is complete
          const parsedProject = JSON.parse(savedProject);
          dispatch({ type: 'SET_PROJECT', payload: parsedProject });
        } catch (error) {
          console.error('Failed to parse saved project:', error);
        }
      }
    }
  }, []);

  // Save project to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && project.id) {
      localStorage.setItem('currentProject', JSON.stringify(project));
    }
  }, [project]);

  // Create a new project
  const createNewProject = (title?: string) => {
    const newProject = {
      ...defaultProject,
      id: `project-${Date.now()}`,
      title: title || 'Untitled Project',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    dispatch({ type: 'SET_PROJECT', payload: newProject });
    
    // Navigate to project dashboard
    router.push('/project/dashboard');
  };

  // Load a project from the server
  const loadProject = async (id: string) => {
    try {
      // This would be an API call in production
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Failed to load project');
      
      const projectData = await response.json();
      dispatch({ type: 'SET_PROJECT', payload: projectData });
    } catch (error) {
      console.error('Error loading project:', error);
      // In development, we'll create a mock project
      const mockProject = {
        ...defaultProject,
        id,
        title: `Project ${id}`,
        created: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        lastModified: new Date().toISOString()
      };
      dispatch({ type: 'SET_PROJECT', payload: mockProject });
    }
  };

  // Save project to the server
  const saveProject = async () => {
    try {
      // This would be an API call in production
      // const response = await fetch(`/api/projects/${project.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(project)
      // });
      // if (!response.ok) throw new Error('Failed to save project');
      
      // For development, just update lastModified
      dispatch({ 
        type: 'UPDATE_PROJECT', 
        payload: { lastModified: new Date().toISOString() } 
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving project:', error);
      return Promise.reject(error);
    }
  };

  // Navigate to another module while preserving project context
  const navigateToModule = (module: string, params: Record<string, any> = {}) => {
    dispatch({ type: 'SET_CURRENT_MODULE', payload: module });
    
    // Build the URL with parameters
    let url = `/${module}`;
    if (project.id) {
      url += `?projectId=${project.id}`;
      
      // Add any additional parameters
      Object.entries(params).forEach(([key, value]) => {
        url += `&${key}=${value}`;
      });
    }
    
    router.push(url);
  };

  // Get AI-suggested next steps based on current project state
  const getSuggestedNextSteps = () => {
    const suggestions = [];
    
    // Example logic for suggestions based on project state
    if (project.tracks.length === 0) {
      suggestions.push({
        module: 'ai_music',
        title: 'Create a Track',
        description: 'Start by generating a musical track as the foundation of your project'
      });
    }
    
    if (project.tracks.length > 0 && project.lyrics.length === 0) {
      suggestions.push({
        module: 'lyrics',
        title: 'Add Lyrics',
        description: 'Your track is ready for lyrics. Add words to your music.'
      });
    }
    
    if (project.tracks.length > 0 && project.lyrics.length > 0 && project.vocalProfiles.length === 0) {
      suggestions.push({
        module: 'voice_cloning',
        title: 'Create Vocals',
        description: 'Turn your lyrics into vocals with AI voice generation'
      });
    }
    
    if (project.tracks.length > 0) {
      suggestions.push({
        module: 'virtual_studio',
        title: 'Mix Your Track',
        description: 'Refine your track with professional mixing tools'
      });
    }
    
    // Always include some options regardless of state
    if (suggestions.length < 3) {
      if (!suggestions.some(s => s.module === 'mood_music')) {
        suggestions.push({
          module: 'mood_music',
          title: 'Adjust Mood',
          description: 'Fine-tune the emotional quality of your music'
        });
      }
      
      if (!suggestions.some(s => s.module === 'genre_mixing')) {
        suggestions.push({
          module: 'genre_mixing',
          title: 'Blend Genres',
          description: 'Experiment with different genre influences'
        });
      }
    }
    
    return suggestions;
  };

  const value = {
    project,
    dispatch,
    createNewProject,
    loadProject,
    saveProject,
    navigateToModule,
    getSuggestedNextSteps
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

// Custom hook to use the project context
export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
} 