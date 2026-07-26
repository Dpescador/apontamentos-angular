import { Activity } from '../models/activity.model';
import { createId } from '../../../shared/utils/id.utils';

export const INITIAL_ACTIVITIES: Activity[] = [
  ];

function createSeed(
  date: string,
  taskId: string,
  task: string,
  itemsWorked: string,
  hours: number
): Activity {
  const createdAt = `${date}T12:00:00.000Z`;

  return {
    id: createId(),
    date,
    sprint: '',
    taskId,
    task,
    itemsWorked,
    hours,
    createdAt,
    updatedAt: createdAt
  };
}
