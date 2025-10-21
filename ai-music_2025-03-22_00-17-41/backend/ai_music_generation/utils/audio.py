"""
Audio processing utilities for AI music generation.
"""
import numpy as np
import soundfile as sf
import librosa


def load_audio_data(file_path, sr=44100):
    """
    Load audio file and return normalized audio data and sample rate.
    
    Args:
        file_path (str): Path to audio file
        sr (int): Target sample rate (default: 44100)
        
    Returns:
        tuple: (audio_data, sample_rate)
    """
    try:
        # Load audio file
        audio_data, sample_rate = librosa.load(file_path, sr=sr)
        
        # Normalize audio
        audio_data = librosa.util.normalize(audio_data)
        
        return audio_data, sample_rate
        
    except Exception as e:
        raise RuntimeError(f"Error loading audio file: {str(e)}")


def save_audio_data(audio_data, file_path, sr=44100):
    """
    Save audio data to file.
    
    Args:
        audio_data (np.ndarray): Audio data to save
        file_path (str): Output file path
        sr (int): Sample rate (default: 44100)
    """
    try:
        # Normalize before saving
        audio_data = librosa.util.normalize(audio_data)
        
        # Save to file
        sf.write(file_path, audio_data, sr)
        
    except Exception as e:
        raise RuntimeError(f"Error saving audio file: {str(e)}")


def extract_audio_features(audio_data, sr=44100):
    """
    Extract common audio features for analysis.
    
    Args:
        audio_data (np.ndarray): Audio data
        sr (int): Sample rate (default: 44100)
        
    Returns:
        dict: Dictionary of audio features
    """
    try:
        features = {
            # Spectral features
            'mfcc': librosa.feature.mfcc(y=audio_data, sr=sr),
            'spectral_centroid': librosa.feature.spectral_centroid(y=audio_data, sr=sr),
            'spectral_bandwidth': librosa.feature.spectral_bandwidth(y=audio_data, sr=sr),
            'spectral_rolloff': librosa.feature.spectral_rolloff(y=audio_data, sr=sr),
            
            # Rhythm features
            'tempo': librosa.beat.tempo(y=audio_data, sr=sr),
            'onset_env': librosa.onset.onset_strength(y=audio_data, sr=sr),
            
            # Harmony features
            'chroma': librosa.feature.chroma_stft(y=audio_data, sr=sr),
            'tonnetz': librosa.feature.tonnetz(y=librosa.effects.harmonic(audio_data), sr=sr),
            
            # Dynamic features
            'rms': librosa.feature.rms(y=audio_data),
            'zero_crossing_rate': librosa.feature.zero_crossing_rate(audio_data)
        }
        
        return features
        
    except Exception as e:
        raise RuntimeError(f"Error extracting audio features: {str(e)}")


def get_audio_segments(audio_data, sr=44100, segment_duration=30):
    """
    Split audio into fixed-duration segments.
    
    Args:
        audio_data (np.ndarray): Audio data
        sr (int): Sample rate (default: 44100)
        segment_duration (int): Segment duration in seconds (default: 30)
        
    Returns:
        list: List of audio segments
    """
    try:
        # Calculate samples per segment
        samples_per_segment = sr * segment_duration
        
        # Split audio into segments
        segments = []
        for i in range(0, len(audio_data), samples_per_segment):
            segment = audio_data[i:i + samples_per_segment]
            
            # Pad last segment if needed
            if len(segment) < samples_per_segment:
                segment = np.pad(
                    segment,
                    (0, samples_per_segment - len(segment)),
                    mode='constant'
                )
            
            segments.append(segment)
            
        return segments
        
    except Exception as e:
        raise RuntimeError(f"Error segmenting audio: {str(e)}")


def apply_audio_effects(audio_data, sr=44100, effects=None):
    """
    Apply audio effects to the input audio.
    
    Args:
        audio_data (np.ndarray): Input audio data
        sr (int): Sample rate (default: 44100)
        effects (dict): Dictionary of effects to apply
        
    Returns:
        np.ndarray: Processed audio data
    """
    if effects is None:
        return audio_data
        
    try:
        processed_audio = audio_data.copy()
        
        for effect, params in effects.items():
            if effect == 'pitch_shift':
                processed_audio = librosa.effects.pitch_shift(
                    processed_audio,
                    sr=sr,
                    n_steps=params.get('steps', 0)
                )
            elif effect == 'time_stretch':
                processed_audio = librosa.effects.time_stretch(
                    processed_audio,
                    rate=params.get('rate', 1.0)
                )
            elif effect == 'harmonic':
                processed_audio = librosa.effects.harmonic(
                    processed_audio,
                    margin=params.get('margin', 8)
                )
            elif effect == 'percussive':
                processed_audio = librosa.effects.percussive(
                    processed_audio,
                    margin=params.get('margin', 8)
                )
                
        return processed_audio
        
    except Exception as e:
        raise RuntimeError(f"Error applying audio effects: {str(e)}")
