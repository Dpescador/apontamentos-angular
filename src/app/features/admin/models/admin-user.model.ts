import { UserRole } from '../../../core/models/user-profile.model';

export interface AdminUserSummary {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastSignInAt: string | null;
  activityCount: number;
  totalHours: number;
}
