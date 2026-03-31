import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';

export function useAdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.courses.getAll({ published: 'false', limit: 100 });
      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const createCourse = async (course: any) => {
    const response = await api.courses.create(course);
    if (response.success) {
      await fetchCourses();
    }
    return response;
  };

  const updateCourse = async (id: string, updates: any) => {
    const response = await api.courses.update(id, updates);
    if (response.success) {
      await fetchCourses();
    }
    return response;
  };

  const deleteCourse = async (id: string) => {
    const response = await api.courses.delete(id);
    if (response.success) {
      await fetchCourses();
    }
    return response;
  };

  return { courses, loading, error, createCourse, updateCourse, deleteCourse, refetch: fetchCourses };
}

export function useAdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.admin.getUsers({ limit: 100 });
      if (response.success && response.data) {
        setStudents(response.data);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading, error, refetch: fetchStudents };
}

export function useAdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.admin.getOrders({ limit: 100 });
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (id: string, status: string) => {
    const response = await api.admin.updateOrder(id, status);
    if (response.success) {
      await fetchOrders();
    }
    return response;
  };

  return { orders, loading, error, updateOrderStatus, refetch: fetchOrders };
}

export function useAdminStats() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    totalEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.admin.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}

export function useGamificationData() {
  const [quests, setQuests] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGamificationData = useCallback(async () => {
    try {
      setLoading(true);
      const [questsRes, achievementsRes, leaderboardRes] = await Promise.all([
        api.gamification.getQuests(),
        api.gamification.getAchievements(),
        api.gamification.getLeaderboard(),
      ]);

      if (questsRes.success) setQuests(questsRes.data || []);
      if (achievementsRes.success) setAchievements(achievementsRes.data || []);
      if (leaderboardRes.success) setLeaderboard(leaderboardRes.data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  const completeQuest = async (id: string) => {
    const response = await api.gamification.completeQuest(id);
    if (response.success) {
      await fetchGamificationData();
    }
    return response;
  };

  return { quests, achievements, leaderboard, loading, error, completeQuest, refetch: fetchGamificationData };
}

export function useShopData() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.shop.getItems();
      if (response.success && response.data) {
        setItems(response.data);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const purchaseItem = async (itemId: string) => {
    const response = await api.shop.purchase(itemId);
    if (response.success) {
      await fetchItems();
    }
    return response;
  };

  return { items, loading, error, purchaseItem, refetch: fetchItems };
}
