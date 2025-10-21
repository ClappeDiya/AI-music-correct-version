import { musicEducationApi } from "./music_education-api";

interface AchievementTrigger {
  type:
    | "quiz_completion"
    | "lesson_completion"
    | "course_completion"
    | "skill_mastery";
  data: {
    score?: number;
    completionTime?: number;
    streakCount?: number;
    skillLevel?: number;
  };
}

class AchievementService {
  private static instance: AchievementService;

  private constructor() {}

  static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  async checkQuizAchievements(
    quizId: number,
    score: number,
    completionTime: number,
  ): Promise<void> {
    const trigger: AchievementTrigger = {
      type: "quiz_completion",
      data: { score, completionTime },
    };
    await this.triggerAchievementCheck(trigger);
  }

  async checkLessonAchievements(lessonId: number): Promise<void> {
    const trigger: AchievementTrigger = {
      type: "lesson_completion",
      data: {},
    };
    await this.triggerAchievementCheck(trigger);
  }

  async checkCourseAchievements(courseId: number): Promise<void> {
    const trigger: AchievementTrigger = {
      type: "course_completion",
      data: {},
    };
    await this.triggerAchievementCheck(trigger);
  }

  async checkSkillMasteryAchievements(
    skillId: number,
    level: number,
  ): Promise<void> {
    const trigger: AchievementTrigger = {
      type: "skill_mastery",
      data: { skillLevel: level },
    };
    await this.triggerAchievementCheck(trigger);
  }

  private async triggerAchievementCheck(
    trigger: AchievementTrigger,
  ): Promise<void> {
    try {
      const response = await musicEducationApi.checkAchievements(trigger);
      if (response.unlockedAchievements?.length > 0) {
        // Show achievement celebration for each unlocked achievement
        response.unlockedAchievements.forEach((achievement) => {
          this.showAchievementCelebration(achievement);
        });
      }
    } catch (error) {
      console.error("Failed to check achievements:", error);
    }
  }

  private showAchievementCelebration(achievement: any): void {
    // This will be handled by the MilestoneCelebration component
    const event = new CustomEvent("achievementUnlocked", {
      detail: achievement,
    });
    window.dispatchEvent(event);
  }
}

export const achievementService = AchievementService.getInstance();
