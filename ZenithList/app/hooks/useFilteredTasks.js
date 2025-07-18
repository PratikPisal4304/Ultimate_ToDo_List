// app/hooks/useFilteredTasks.js
import { useMemo } from 'react';
import { isToday, isWithinInterval, addDays } from 'date-fns';

const useFilteredTasks = (tasks, filter) => {
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const sortedTasks = [...tasks].sort((a, b) =>
      (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0)
    );

    switch (filter) {
      case 'Today':
        return sortedTasks.filter(
          (t) => !t.isCompleted && t.dueDate && isToday(t.dueDate.toDate())
        );
      case 'Upcoming':
        return sortedTasks.filter(
          (t) =>
            !t.isCompleted &&
            t.dueDate &&
            isWithinInterval(t.dueDate.toDate(), { start: now, end: addDays(now, 7) })
        );
      case 'Completed':
        return sortedTasks.filter((t) => t.isCompleted);
      case 'Active':
        return sortedTasks.filter((t) => !t.isCompleted);
      case 'All':
      default:
        return sortedTasks;
    }
  }, [tasks, filter]);

  return filteredTasks;
};

export default useFilteredTasks;