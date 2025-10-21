const {
  EnvironmentConfigService,
} = require("../src/services/EnvironmentConfigService");
const { AnalyticsService } = require("../src/services/analytics-service");
const { CacheManager } = require("./cache-manager");

class ExpertCourseManager {
  constructor() {
    this.config = EnvironmentConfigService.getInstance();
    this.analytics = AnalyticsService.getInstance();
    this.cache = CacheManager.getInstance();
  }

  async createCourse(courseData) {
    try {
      const course = {
        ...courseData,
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "draft",
      };

      // Validate course structure
      this.validateCourseStructure(course);

      // Generate unique identifiers for content
      course.sections = course.sections.map((section) => ({
        ...section,
        id: this.generateUniqueId(),
        lessons: section.lessons.map((lesson) => ({
          ...lesson,
          id: this.generateUniqueId(),
        })),
      }));

      // Store course data
      await this.storeCourse(course);

      // Track analytics
      this.analytics.trackEvent(
        "course_created",
        {
          courseId: course.id,
          expertId: course.expertId,
          sections: course.sections.length,
          totalLessons: course.sections.reduce(
            (sum, section) => sum + section.lessons.length,
            0,
          ),
        },
        course.expertId,
      );

      return course;
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  }

  async updateCourse(courseId, updates) {
    try {
      const course = await this.getCourse(courseId);
      if (!course) {
        throw new Error(`Course ${courseId} not found`);
      }

      // Create new version
      const newVersion = this.incrementVersion(course.version);

      const updatedCourse = {
        ...course,
        ...updates,
        version: newVersion,
        updatedAt: new Date().toISOString(),
        previousVersion: course.version,
      };

      // Validate updated course
      this.validateCourseStructure(updatedCourse);

      // Store updated course
      await this.storeCourse(updatedCourse);

      // Archive previous version
      await this.archiveCourseVersion(course);

      // Invalidate cache
      await this.cache.invalidateLessonCache(courseId);

      // Track analytics
      this.analytics.trackEvent(
        "course_updated",
        {
          courseId,
          expertId: course.expertId,
          fromVersion: course.version,
          toVersion: newVersion,
          updateType: this.determineUpdateType(course, updatedCourse),
        },
        course.expertId,
      );

      return updatedCourse;
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  }

  async publishCourse(courseId) {
    try {
      const course = await this.getCourse(courseId);
      if (!course) {
        throw new Error(`Course ${courseId} not found`);
      }

      // Validate course is ready for publication
      this.validateForPublication(course);

      const publishedCourse = {
        ...course,
        status: "published",
        publishedAt: new Date().toISOString(),
      };

      // Store published course
      await this.storeCourse(publishedCourse);

      // Track analytics
      this.analytics.trackEvent(
        "course_published",
        {
          courseId,
          expertId: course.expertId,
          version: course.version,
        },
        course.expertId,
      );

      return publishedCourse;
    } catch (error) {
      console.error("Error publishing course:", error);
      throw error;
    }
  }

  async getCourse(courseId) {
    try {
      // Try cache first
      const cached = await this.cache.getCachedLesson(courseId);
      if (cached) {
        return cached;
      }

      // Fetch from storage
      const course = await this.fetchCourseFromStorage(courseId);
      if (course) {
        // Cache for future requests
        await this.cache.cacheLesson(courseId, course);
      }

      return course;
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  }

  async getCourseVersion(courseId, version) {
    try {
      const archivedCourse = await this.fetchArchivedCourse(courseId, version);
      if (!archivedCourse) {
        throw new Error(
          `Course version ${version} not found for course ${courseId}`,
        );
      }
      return archivedCourse;
    } catch (error) {
      console.error("Error fetching course version:", error);
      throw error;
    }
  }

  validateCourseStructure(course) {
    const requiredFields = ["title", "description", "expertId", "sections"];
    for (const field of requiredFields) {
      if (!course[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!Array.isArray(course.sections) || course.sections.length === 0) {
      throw new Error("Course must have at least one section");
    }

    course.sections.forEach((section, index) => {
      if (!section.title || !Array.isArray(section.lessons)) {
        throw new Error(`Invalid section at index ${index}`);
      }

      section.lessons.forEach((lesson, lessonIndex) => {
        if (!lesson.title || !lesson.content) {
          throw new Error(
            `Invalid lesson at index ${lessonIndex} in section ${index}`,
          );
        }
      });
    });
  }

  validateForPublication(course) {
    // Check all required content is present
    this.validateCourseStructure(course);

    // Check for minimum content requirements
    if (
      course.sections.reduce(
        (sum, section) => sum + section.lessons.length,
        0,
      ) < 3
    ) {
      throw new Error("Course must have at least 3 lessons for publication");
    }

    // Check all lessons have necessary materials
    course.sections.forEach((section, sectionIndex) => {
      section.lessons.forEach((lesson, lessonIndex) => {
        if (!lesson.materials || lesson.materials.length === 0) {
          throw new Error(
            `Lesson ${lessonIndex} in section ${sectionIndex} must have learning materials`,
          );
        }
      });
    });

    // Check expert profile is complete
    if (
      !course.expertProfile ||
      !course.expertProfile.bio ||
      !course.expertProfile.credentials
    ) {
      throw new Error("Expert profile must be complete before publication");
    }
  }

  incrementVersion(version) {
    const [major, minor, patch] = version.split(".").map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  determineUpdateType(oldCourse, newCourse) {
    // Compare course structures to determine update type
    const structuralChange = this.hasStructuralChanges(oldCourse, newCourse);
    const contentChange = this.hasContentChanges(oldCourse, newCourse);

    if (structuralChange) return "structural";
    if (contentChange) return "content";
    return "metadata";
  }

  hasStructuralChanges(oldCourse, newCourse) {
    const oldStructure = oldCourse.sections.map((s) => ({
      id: s.id,
      lessonIds: s.lessons.map((l) => l.id),
    }));

    const newStructure = newCourse.sections.map((s) => ({
      id: s.id,
      lessonIds: s.lessons.map((l) => l.id),
    }));

    return JSON.stringify(oldStructure) !== JSON.stringify(newStructure);
  }

  hasContentChanges(oldCourse, newCourse) {
    const oldContent = this.extractContent(oldCourse);
    const newContent = this.extractContent(newCourse);
    return JSON.stringify(oldContent) !== JSON.stringify(newContent);
  }

  extractContent(course) {
    return course.sections.map((section) => ({
      id: section.id,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id,
        content: lesson.content,
        materials: lesson.materials,
      })),
    }));
  }

  generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Storage methods (to be implemented based on storage solution)
  async storeCourse(course) {
    // Implementation depends on storage solution (e.g., database, file system)
    console.log("Storing course:", course.id);
  }

  async fetchCourseFromStorage(courseId) {
    // Implementation depends on storage solution
    console.log("Fetching course:", courseId);
  }

  async archiveCourseVersion(course) {
    // Implementation depends on storage solution
    console.log("Archiving course version:", course.version);
  }

  async fetchArchivedCourse(courseId, version) {
    // Implementation depends on storage solution
    console.log("Fetching archived course:", courseId, version);
  }
}

// Export singleton instance
let instance = null;

function getInstance() {
  if (!instance) {
    instance = new ExpertCourseManager();
  }
  return instance;
}

module.exports = {
  getInstance,
};
