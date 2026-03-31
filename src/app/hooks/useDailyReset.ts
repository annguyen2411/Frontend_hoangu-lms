import { useState, useEffect } from 'react';

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function useDailyReset() {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return {
        hours,
        minutes,
        seconds,
        total: diff,
      };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      // Reset trigger when reaching midnight
      if (remaining.total <= 1000) {
        window.dispatchEvent(new CustomEvent('dailyReset'));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    return `${String(timeRemaining.hours).padStart(2, '0')}:${String(timeRemaining.minutes).padStart(2, '0')}:${String(timeRemaining.seconds).padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    formatTime,
  };
}
