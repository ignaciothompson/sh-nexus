// Note interface for the Notes manager
export interface Note {
  id: string;
  title: string;
  content: string;
  isMarked: boolean;
  created: string;
  updated: string;
}

// Task interface for the Kanban board
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  completedAt: string | null;
}
