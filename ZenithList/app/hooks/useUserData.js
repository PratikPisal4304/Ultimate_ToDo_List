// app/hooks/useUserData.js
import { useMemo } from 'react';

const useUserData = (userData) => {
  return useMemo(() => {
    if (!userData) {
      return { level: 1, pointsInCurrentLevel: 0, progress: 0, streak: 0 };
    }

    const { points = 0 } = userData;
    const level = Math.floor(points / 100) + 1;
    const pointsForLastLevel = (level - 1) * 100;
    const pointsInCurrentLevel = points - pointsForLastLevel;
    const progress = pointsInCurrentLevel / 100;

    return {
      level,
      pointsInCurrentLevel,
      progress,
      streak: userData.streak || 0,
    };
  }, [userData]);
};

export default useUserData;