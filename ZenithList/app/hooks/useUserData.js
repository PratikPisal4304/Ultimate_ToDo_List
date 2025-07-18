// app/hooks/useUserData.js
import { useMemo } from 'react';

/**
 * Custom hook to process and calculate gamification data for the user.
 * @param {Object} userData - The raw user data object from Firestore.
 * @returns {Object} - An object containing calculated level, points, progress, and streak.
 */
const useUserData = (userData) => {
  const gamificationData = useMemo(() => {
    const level = userData?.level || 1;
    const points = userData?.points || 0;
    // Calculate the points required to reach the next level.
    const pointsForNextLevel = level * 100;
    // Calculate the points accumulated within the current level.
    const pointsInCurrentLevel = points - ((level - 1) * 100);
    // Calculate the progress towards the next level as a percentage.
    const progress = pointsInCurrentLevel / 100;

    return {
      level,
      pointsInCurrentLevel,
      progress,
      streak: userData?.streak || 0,
    };
  }, [userData]);

  return gamificationData;
};

export default useUserData;