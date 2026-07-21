export interface Activity {
  id: string;
  date: string;
  sprint: string;
  taskId: string;
  task: string;
  itemsWorked: string;
  hours: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityFile {
  version: 1;
  exportedAt: string;
  activities: Activity[];
}
