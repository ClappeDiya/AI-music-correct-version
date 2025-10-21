export interface LessonContent {
  theory: {
    sections: {
      title: string;
      content: string;
      examples?: string[];
    }[];
  };
  practical: {
    steps: {
      title: string;
      instructions: string;
      tips?: string[];
    }[];
  };
  interactive?: {
    exercises: {
      type: "chord-progression" | "arrangement" | "mixing";
      title: string;
      description: string;
      data: any;
    }[];
  };
}

export interface LessonVersion {
  version: string;
  content: LessonContent;
  createdAt: string;
  updatedAt: string;
  changes?: string[];
}

export interface LessonSummary {
  id: number;
  courseId: number;
  title: string;
  description: string;
  currentVersion: string;
  versions: LessonVersion[];
  order: number;
  type: "theory" | "practical" | "mixed";
  topics: string[];
  prerequisites?: number[];
  estimatedDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserLessonProgress {
  userId: number;
  lessonId: number;
  currentStep: number;
  completedSteps: number[];
  version: string;
  lastAccessedAt: string;
  completedAt?: string;
  progress: number;
}

export type QuestionType = "multiple-choice" | "true-false" | "fill-in-blank";

export interface QuestionFeedback {
  correct: boolean;
  explanation: string;
  suggestions?: string[];
  relatedConcepts?: string[];
}

export interface QuestionBase {
  id: number;
  type: QuestionType;
  text: string;
  explanation?: string;
  points: number;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: "multiple-choice";
  options: string[];
  correctAnswer: string;
}

export interface TrueFalseQuestion extends QuestionBase {
  type: "true-false";
  correctAnswer: boolean;
}

export interface FillInBlankQuestion extends QuestionBase {
  type: "fill-in-blank";
  correctAnswer: string;
  caseSensitive?: boolean;
  acceptableAnswers?: string[];
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillInBlankQuestion;

export interface QuizAttemptAnswer {
  questionId: number;
  answer: string | boolean;
  feedback?: QuestionFeedback;
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  userId: number;
  answers: QuizAttemptAnswer[];
  score: number;
  timeSpent: number;
  completedAt: string;
  feedback: {
    overallFeedback: string;
    strengths: string[];
    areasForImprovement: string[];
    suggestedResources?: string[];
  };
}

export interface PracticalExercise {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  type: "audio" | "visual" | "mixed";
  requirements: {
    audioRequired?: boolean;
    screenshotRequired?: boolean;
    duration?: number;
    fileTypes?: string[];
  };
  rubric: {
    criteria: {
      name: string;
      description: string;
      weight: number;
    }[];
    totalPoints: number;
    passingScore: number;
  };
}

export interface PracticalSubmission {
  id: number;
  exerciseId: number;
  userId: number;
  audioUrl?: string;
  screenshotUrls?: string[];
  feedback?: {
    overallScore: number;
    criteriaScores: {
      criteriaName: string;
      score: number;
      feedback: string;
    }[];
    comments: string;
    suggestions: string[];
  };
  submittedAt: string;
  evaluatedAt?: string;
}

export interface VideoNote {
  id: string;
  timestamp: number;
  text: string;
  createdAt: string;
}

export interface DownloadableMaterial {
  id: string;
  title: string;
  description: string;
  url: string;
  fileType: string;
}

export interface WatchHistory {
  lastWatched: string;
  progress: number;
  notes: VideoNote[];
}

export interface LessonSection {
  title: string;
  content: string;
  examples?: string[];
  videoUrl?: string;
  materials?: DownloadableMaterial[];
}

export interface LessonStep {
  title: string;
  instructions: string;
  tips?: string[];
  videoUrl?: string;
  materials?: DownloadableMaterial[];
}

export interface InteractiveExercise {
  type: "chord-progression" | "arrangement" | "mixing";
  title: string;
  description: string;
  data: any;
  videoUrl?: string;
  materials?: DownloadableMaterial[];
}

export interface LessonContent {
  theory: {
    sections: LessonSection[];
  };
  practical: {
    steps: LessonStep[];
  };
  interactive?: {
    exercises: InteractiveExercise[];
  };
}

export interface LessonDetail {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  orderInCourse: number;
  course: number;
  content: LessonContent;
  version: string;
  updatedAt: string;
  watchHistory?: WatchHistory;
  totalQuizzes: number;
  isCompleted: boolean;
  progress?: number;
}
