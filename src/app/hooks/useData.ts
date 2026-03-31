import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import type { Course, Lesson, Enrollment, LessonProgress } from '../../types/database';

interface UseCoursesOptions {
  publishedOnly?: boolean;
  featuredOnly?: boolean;
  category?: string;
  level?: string;
}

export function useCourses(options: UseCoursesOptions = {}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        published: options.publishedOnly !== false ? 'true' : 'false',
        page: 1,
        limit: 100,
      };
      
      if (options.featuredOnly) params.featured = 'true';
      if (options.category) params.category = options.category;
      if (options.level) params.level = options.level;

      const response = await api.courses.getAll(params);
      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [options.publishedOnly, options.featuredOnly, options.category, options.level]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
}

export function useCourse(slug: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourse = useCallback(async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      const response = await api.courses.getBySlug(slug);
      if (response.success && response.data) {
        setCourse(response.data);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, loading, error, refetch: fetchCourse };
}

export function useEnrollments(userId: string | undefined) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      const token = api.getToken();
      if (!token) {
        setEnrollments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.enrollments.getAll();
        if (response.success && response.data) {
          setEnrollments(response.data.map((e: any) => ({
            id: e.id,
            user_id: e.user_id,
            course_id: e.course_id,
            progress: e.progress,
            status: e.status,
            enrolled_at: e.enrolled_at,
            completed_at: e.completed_at,
          })));
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  return { enrollments, loading, error, refetch: () => {} };
}

export function useLessons(courseId: string | undefined) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!courseId) {
      setLessons([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.lessons.getByCourse(courseId);
      if (response.success && response.data) {
        setLessons(response.data);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return { lessons, loading, error, refetch: fetchLessons };
}

export function useEnrollment(courseId: string | undefined) {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEnrollment = useCallback(async () => {
    if (!courseId) {
      setEnrollment(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.enrollments.getByCourse(courseId);
      if (response.success && response.data) {
        setEnrollment(response.data);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  return { enrollment, loading, error, refetch: fetchEnrollment };
}

export function useLessonProgress(courseId: string | undefined) {
  const [progress, setProgress] = useState<Record<string, { is_completed: boolean; watched_seconds: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!courseId) {
      setProgress({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.progress.getCourse(courseId);
      if (response.success && response.data) {
        setProgress(response.data);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const markCompleted = async (lessonId: string) => {
    try {
      await api.progress.update({
        lesson_id: lessonId,
        is_completed: true,
        watched_seconds: 0,
      });
      await fetchProgress();
    } catch (err) {
      console.error('Error marking lesson completed:', err);
    }
  };

  return { progress, loading, error, markCompleted, refetch: fetchProgress };
}

export function useUserProgress(userId: string | undefined, lessonIds: string[]) {
  const [progress, setProgress] = useState<Record<string, { is_completed: boolean; watched_seconds: number }>>({});
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!userId || lessonIds.length === 0) {
      setProgress({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const lessonId = lessonIds[0];
      if (lessonId) {
        const lesson = await api.lessons.getById(lessonId);
        if (lesson.success && lesson.data) {
          const courseId = lesson.data.course_id;
          const response = await api.progress.getCourse(courseId);
          if (response.success && response.data) {
            setProgress(response.data);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, lessonIds.join(',')]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const updateProgress = async (lessonId: string, isCompleted: boolean, watchedSeconds: number) => {
    await api.progress.update({
      lesson_id: lessonId,
      is_completed: isCompleted,
      watched_seconds: watchedSeconds,
    });
    await fetchProgress();
  };

  return { progress, loading, updateProgress, refetch: fetchProgress };
}
