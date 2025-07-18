// app/hooks/useFilteredTasks.js
import { useMemo } from 'react';
import { isToday, isWithinInterval, addDays } from 'date-fns';

/**
 * Custom hook to filter and sort tasks based on a filter string.
 * @param {Array} tasks - The full array of task objects.
 * @param {String} filter - The active filter ('All', 'Today', 'Upcoming', 'Completed').
 * @returns {Array} - The memoized, filtered, and sorted list of tasks.
 */
const useFilteredTasks = (tasks, filter) => {
  const filteredTasks = useMemo(() => {
    const now = new Date();
    // Sort tasks by creation date in descending order (newest first)
    const sortedTasks = [...tasks].sort((a, b) =>
      (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0)
    );

    switch (filter) {
      case 'Today':
        return sortedTasks.filter(
          (t) => !t.isCompleted && t.dueDate && isToday(t.dueDate.toDate())
        );
      case 'Upcoming':
        // Filters tasks due within the next 7 days
        return sortedTasks.filter(
          (t) =>
            !t.isCompleted &&
            t.dueDate &&
            isWithinInterval(t.dueDate.toDate(), { start: now, end: addDays(now, 7) })
        );
      case 'Completed':
        return sortedTasks.filter((t) => t.isCompleted);
      case 'All':
      default:
        // Default case returns all non-completed tasks
        return sortedTasks.filter((t) => !t.isCompleted);
    }
  }, [tasks, filter]);

  return filteredTasks;
};

export default useFilteredTasks;