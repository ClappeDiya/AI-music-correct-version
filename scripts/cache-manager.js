const Redis = require("ioredis");
const {
  EnvironmentConfigService,
} = require("../src/services/EnvironmentConfigService");

class CacheManager {
  constructor() {
    this.config = EnvironmentConfigService.getInstance();
    this.redis = new Redis(process.env.REDIS_URL);
    this.prefix = "music_education:";
  }

  // Key generation helpers
  getLessonKey(lessonId) {
    return `${this.prefix}lesson:${lessonId}`;
  }

  getUserProgressKey(userId) {
    return `${this.prefix}progress:${userId}`;
  }

  getQuizKey(quizId) {
    return `${this.prefix}quiz:${quizId}`;
  }

  // Cache management
  async set(key, data, ttl) {
    try {
      const serialized = JSON.stringify(data);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      console.error(`Error setting cache for ${key}:`, error);
      throw error;
    }
  }

  async get(key) {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting cache for ${key}:`, error);
      throw error;
    }
  }

  async delete(key) {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Error deleting cache for ${key}:`, error);
      throw error;
    }
  }

  // Lesson caching
  async cacheLesson(lessonId, lessonData) {
    const key = this.getLessonKey(lessonId);
    const ttl = this.config.getCacheDuration("lesson");
    await this.set(key, lessonData, ttl);
  }

  async getCachedLesson(lessonId) {
    const key = this.getLessonKey(lessonId);
    return this.get(key);
  }

  async invalidateLessonCache(lessonId) {
    const key = this.getLessonKey(lessonId);
    await this.delete(key);
  }

  // User progress caching
  async cacheUserProgress(userId, progressData) {
    const key = this.getUserProgressKey(userId);
    const ttl = this.config.getCacheDuration("userProgress");
    await this.set(key, progressData, ttl);
  }

  async getCachedUserProgress(userId) {
    const key = this.getUserProgressKey(userId);
    return this.get(key);
  }

  async updateUserProgress(userId, progressUpdate) {
    const key = this.getUserProgressKey(userId);
    const currentProgress = (await this.getCachedUserProgress(userId)) || {};

    const updatedProgress = {
      ...currentProgress,
      ...progressUpdate,
      lastUpdated: new Date().toISOString(),
    };

    await this.cacheUserProgress(userId, updatedProgress);
    return updatedProgress;
  }

  // Quiz caching
  async cacheQuiz(quizId, quizData) {
    const key = this.getQuizKey(quizId);
    const ttl = this.config.getCacheDuration("lesson"); // Use same TTL as lessons
    await this.set(key, quizData, ttl);
  }

  async getCachedQuiz(quizId) {
    const key = this.getQuizKey(quizId);
    return this.get(key);
  }

  // Batch operations
  async batchGetLessons(lessonIds) {
    const pipeline = this.redis.pipeline();
    const keys = lessonIds.map((id) => this.getLessonKey(id));

    keys.forEach((key) => pipeline.get(key));
    const results = await pipeline.exec();

    return results.map(([err, data], index) => {
      if (err) {
        console.error(`Error getting lesson ${lessonIds[index]}:`, err);
        return null;
      }
      return data ? JSON.parse(data) : null;
    });
  }

  // Cache warming
  async warmLessonCache(lessonIds, fetchFunction) {
    const pipeline = this.redis.pipeline();
    const ttl = this.config.getCacheDuration("lesson");

    for (const lessonId of lessonIds) {
      try {
        const lessonData = await fetchFunction(lessonId);
        const key = this.getLessonKey(lessonId);
        pipeline.setex(key, ttl, JSON.stringify(lessonData));
      } catch (error) {
        console.error(`Error warming cache for lesson ${lessonId}:`, error);
      }
    }

    await pipeline.exec();
  }

  // Cache maintenance
  async clearExpiredKeys() {
    const keys = await this.redis.keys(`${this.prefix}*`);
    const pipeline = this.redis.pipeline();

    for (const key of keys) {
      pipeline.ttl(key);
    }

    const results = await pipeline.exec();
    const expiredKeys = keys.filter((key, index) => {
      const [err, ttl] = results[index];
      return !err && ttl <= 0;
    });

    if (expiredKeys.length > 0) {
      await this.redis.del(...expiredKeys);
      console.log(`Cleared ${expiredKeys.length} expired keys`);
    }
  }

  // Performance monitoring
  async getCacheStats() {
    const info = await this.redis.info();
    const keys = await this.redis.keys(`${this.prefix}*`);

    return {
      totalKeys: keys.length,
      lessonKeys: keys.filter((k) => k.includes("lesson:")).length,
      progressKeys: keys.filter((k) => k.includes("progress:")).length,
      quizKeys: keys.filter((k) => k.includes("quiz:")).length,
      redisInfo: info,
    };
  }

  // Cleanup
  async disconnect() {
    await this.redis.quit();
  }
}

// Export singleton instance
let instance = null;

function getInstance() {
  if (!instance) {
    instance = new CacheManager();
  }
  return instance;
}

module.exports = {
  getInstance,
};
