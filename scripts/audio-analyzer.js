const { Essentia, EssentiaWASM } = require("essentia.js");
const {
  EnvironmentConfigService,
} = require("../src/services/EnvironmentConfigService");
const { AnalyticsService } = require("../src/services/analytics-service");

class AudioAnalyzer {
  constructor() {
    this.config = EnvironmentConfigService.getInstance();
    this.analytics = AnalyticsService.getInstance();
    this.essentia = null;
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      try {
        const EssentiaModule = await EssentiaWASM.initialize();
        this.essentia = new Essentia(EssentiaModule);
        this.initialized = true;
      } catch (error) {
        console.error("Failed to initialize Essentia:", error);
        throw error;
      }
    }
  }

  async analyzeAudio(audioBuffer, options = {}) {
    await this.initialize();

    const {
      detectPitch = true,
      detectRhythm = true,
      detectDynamics = true,
      detectTimbre = true,
    } = options;

    try {
      const analysis = {
        timestamp: new Date().toISOString(),
        metrics: {},
      };

      if (detectPitch) {
        analysis.metrics.pitch = await this.analyzePitch(audioBuffer);
      }

      if (detectRhythm) {
        analysis.metrics.rhythm = await this.analyzeRhythm(audioBuffer);
      }

      if (detectDynamics) {
        analysis.metrics.dynamics = await this.analyzeDynamics(audioBuffer);
      }

      if (detectTimbre) {
        analysis.metrics.timbre = await this.analyzeTimbre(audioBuffer);
      }

      analysis.metrics.overall = this.calculateOverallScore(analysis.metrics);

      return analysis;
    } catch (error) {
      console.error("Error analyzing audio:", error);
      throw error;
    }
  }

  async analyzePitch(audioBuffer) {
    const pitchData = this.essentia.PitchYinProbabilistic(audioBuffer);
    const frequencies = pitchData.pitch;
    const confidences = pitchData.pitchConfidence;

    return {
      frequencies,
      confidences,
      statistics: this.calculatePitchStatistics(frequencies, confidences),
    };
  }

  async analyzeRhythm(audioBuffer) {
    const rhythmData = this.essentia.RhythmExtractor2013(audioBuffer);
    const { bpm, beats, bpmConfidence, estimates } = rhythmData;

    return {
      bpm,
      beats,
      bpmConfidence,
      estimates,
      stability: this.calculateRhythmStability(beats),
    };
  }

  async analyzeDynamics(audioBuffer) {
    const loudness = this.essentia.Loudness(audioBuffer);
    const dynamicComplexity = this.essentia.DynamicComplexity(audioBuffer);

    return {
      loudness,
      dynamicRange: dynamicComplexity.dynamicComplexity,
      dynamicCentroid: dynamicComplexity.loudnessCentroid,
    };
  }

  async analyzeTimbre(audioBuffer) {
    const mfcc = this.essentia.MFCC(audioBuffer);
    const spectralCentroid = this.essentia.SpectralCentroid(audioBuffer);
    const spectralRolloff = this.essentia.RollOff(audioBuffer);

    return {
      mfccCoefficients: mfcc.mfcc,
      spectralCentroid: spectralCentroid.centroid,
      spectralRolloff: spectralRolloff.rollOff,
    };
  }

  calculatePitchStatistics(frequencies, confidences) {
    const validPitches = frequencies.filter((_, i) => confidences[i] > 0.8);

    return {
      mean: this.mean(validPitches),
      variance: this.variance(validPitches),
      stability: this.calculateStability(validPitches),
    };
  }

  calculateRhythmStability(beats) {
    if (beats.length < 2) return 1;

    const intervals = [];
    for (let i = 1; i < beats.length; i++) {
      intervals.push(beats[i] - beats[i - 1]);
    }

    const meanInterval = this.mean(intervals);
    const variance = this.variance(intervals, meanInterval);

    return Math.max(0, 1 - variance / meanInterval);
  }

  calculateStability(values) {
    if (values.length < 2) return 1;

    const meanValue = this.mean(values);
    const variance = this.variance(values, meanValue);

    return Math.max(0, 1 - variance / meanValue);
  }

  mean(values) {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  variance(values, mean = null) {
    if (values.length < 2) return 0;
    const m = mean === null ? this.mean(values) : mean;
    return (
      values.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / values.length
    );
  }

  calculateOverallScore(metrics) {
    const weights = {
      pitch: 0.3,
      rhythm: 0.3,
      dynamics: 0.2,
      timbre: 0.2,
    };

    let score = 0;
    let totalWeight = 0;

    if (metrics.pitch) {
      score += weights.pitch * metrics.pitch.statistics.stability;
      totalWeight += weights.pitch;
    }

    if (metrics.rhythm) {
      score += weights.rhythm * metrics.rhythm.stability;
      totalWeight += weights.rhythm;
    }

    if (metrics.dynamics) {
      const dynamicsScore = (metrics.dynamics.dynamicRange + 1) / 2;
      score += weights.dynamics * dynamicsScore;
      totalWeight += weights.dynamics;
    }

    if (metrics.timbre) {
      const timbreScore = this.calculateTimbreScore(metrics.timbre);
      score += weights.timbre * timbreScore;
      totalWeight += weights.timbre;
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  calculateTimbreScore(timbreMetrics) {
    const mfccVariance = this.variance(timbreMetrics.mfccCoefficients);
    const normalizedVariance = Math.min(1, mfccVariance / 100);
    return 1 - normalizedVariance;
  }

  generateFeedback(analysis) {
    const feedback = {
      overall: this.getOverallFeedback(analysis.metrics.overall),
      specific: [],
    };

    if (analysis.metrics.pitch) {
      feedback.specific.push(this.getPitchFeedback(analysis.metrics.pitch));
    }

    if (analysis.metrics.rhythm) {
      feedback.specific.push(this.getRhythmFeedback(analysis.metrics.rhythm));
    }

    if (analysis.metrics.dynamics) {
      feedback.specific.push(
        this.getDynamicsFeedback(analysis.metrics.dynamics),
      );
    }

    return feedback;
  }

  getOverallFeedback(score) {
    if (score >= 0.9) {
      return "Excellent performance! Your playing shows great control and musicality.";
    } else if (score >= 0.7) {
      return "Good performance! There are some areas that could use refinement.";
    } else if (score >= 0.5) {
      return "Fair performance. Focus on the specific feedback below to improve.";
    } else {
      return "Keep practicing! Pay attention to the fundamentals outlined below.";
    }
  }

  getPitchFeedback(pitchMetrics) {
    const { stability } = pitchMetrics.statistics;

    if (stability >= 0.9) {
      return "Your pitch control is excellent, showing consistent and accurate intonation.";
    } else if (stability >= 0.7) {
      return "Your pitch is generally good, but there are some minor inconsistencies.";
    } else {
      return "Focus on maintaining steady pitch. Try using a tuner while practicing.";
    }
  }

  getRhythmFeedback(rhythmMetrics) {
    const { stability, bpmConfidence } = rhythmMetrics;

    if (stability >= 0.9 && bpmConfidence >= 0.9) {
      return "Your rhythm is very precise and steady.";
    } else if (stability >= 0.7 || bpmConfidence >= 0.7) {
      return "Your timing is good but could be more consistent. Try practicing with a metronome.";
    } else {
      return "Work on your rhythmic stability. Regular practice with a metronome will help.";
    }
  }

  getDynamicsFeedback(dynamicsMetrics) {
    const { dynamicRange } = dynamicsMetrics;

    if (dynamicRange >= 0.8) {
      return "Excellent dynamic control, showing good range between soft and loud passages.";
    } else if (dynamicRange >= 0.5) {
      return "Good dynamics, but try to expand your range between soft and loud passages.";
    } else {
      return "Work on varying your dynamics more to add expression to your playing.";
    }
  }

  async cleanup() {
    if (this.initialized && this.essentia) {
      this.essentia.delete();
      this.initialized = false;
    }
  }
}

// Export singleton instance
let instance = null;

function getInstance() {
  if (!instance) {
    instance = new AudioAnalyzer();
  }
  return instance;
}

module.exports = {
  getInstance,
};
