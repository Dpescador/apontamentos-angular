import { Activity } from '../models/activity.model';
import { createId } from '../../../shared/utils/id.utils';

export const INITIAL_ACTIVITIES: Activity[] = [
  createSeed('2026-07-01', 'TASK 1412342', 'Cerimônias e Reuniões', 'Planning', 1),
  createSeed('2026-07-01', 'TASK 1402012', 'US022', '', 3),
  createSeed('2026-07-01', 'TASK 1412342', 'Cerimônias e Reuniões', 'Nova data de entrega', 3),
  createSeed('2026-07-01', 'TASK 1412342', 'Cerimônias e Reuniões', 'Devs', 1),
  createSeed('2026-07-02', 'TASK 1412342', 'Cerimônias e Reuniões', 'Daily', 0.5),
  createSeed('2026-07-02', 'TASK 1402012', 'US022', '', 6),
  createSeed('2026-07-02', 'TASK 1412342', 'Cerimônias e Reuniões', 'Devs', 1),
  createSeed('2026-07-02', 'TASK 1412342', 'Cerimônias e Reuniões', 'P.O.', 0.5),
  createSeed('2026-07-03', 'TASK 1412342', 'Cerimônias e Reuniões', 'Daily', 0.5),
  createSeed('2026-07-03', 'TASK 1412342', 'Cerimônias e Reuniões', 'ConectaVisaRS', 1.5),
  createSeed('2026-07-03', 'TASK 1412342', 'Cerimônias e Reuniões', 'Eixos', 0.5),
  createSeed('2026-07-03', 'TASK 1412342', 'Cerimônias e Reuniões', 'Devs', 0.5),
  createSeed('2026-07-03', 'TASK 1402012', 'US022', '', 5),
  createSeed('2026-07-06', 'TASK 1412342', 'Cerimônias e Reuniões', 'Daily', 0.5),
  createSeed('2026-07-06', 'TASK 1412342', 'Cerimônias e Reuniões', 'SIVISA', 3),
  createSeed('2026-07-06', 'TASK 1412342', 'Cerimônias e Reuniões', 'Devs', 0.5),
  createSeed('2026-07-06', 'PRODUCT BACKLOG ITEM 1415084', '', 'Ajustes', 2),
  createSeed('2026-07-06', 'TASK 1402012', 'US022', '', 2),
  createSeed('2026-07-07', 'TASK 1412342', 'Cerimônias e Reuniões', 'Daily', 0.5),
  createSeed('2026-07-07', 'TASK 1412342', 'Cerimônias e Reuniões', 'Uxs e Devs', 0.5),
  createSeed('2026-07-07', 'TASK 1402012', 'US022', '', 7),
  createSeed('2026-07-08', 'TASK 1412342', 'Cerimônias e Reuniões', 'Daily', 1),
  createSeed('2026-07-08', 'TASK 1412342', 'Cerimônias e Reuniões', 'Nova estrutura do BD', 1.5)
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
