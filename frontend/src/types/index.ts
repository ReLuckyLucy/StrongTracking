export interface User {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string | null;
  user_id: string | null;
}

export interface WorkoutSet {
  id: string;
  exercise_id: string;
  exercise_name: string | null;
  set_number: number;
  weight_kg: number;
  reps: number;
}

export interface WorkoutSetCreate {
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
}

export interface Workout {
  id: string;
  date: string;
  notes: string | null;
  duration_minutes: number | null;
  created_at: string;
  sets: WorkoutSet[];
}

export interface WorkoutListItem {
  id: string;
  date: string;
  notes: string | null;
  duration_minutes: number | null;
  exercise_count: number;
}

export interface ProgressPoint {
  date: string;
  max_weight: number;
  avg_weight: number;
}

export interface HeatmapPoint {
  date: string;
  count: number;
}

export interface ExercisePR {
  exercise_id: string;
  exercise_name: string;
  max_weight: number;
  max_weight_date: string;
}

export interface Overview {
  total_workouts: number;
  current_streak: number;
  longest_streak: number;
  exercise_prs: ExercisePR[];
}

// Admin
export interface UserAdmin {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  workout_count: number;
  exercise_count: number;
  last_workout_date: string | null;
}

export interface UserList {
  users: UserAdmin[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminStats {
  total_users: number;
  total_workouts: number;
  total_exercises: number;
  new_users_this_week: number;
  active_users_this_week: number;
}
