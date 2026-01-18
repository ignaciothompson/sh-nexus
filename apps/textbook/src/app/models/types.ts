export interface BaseModel {
  id: string;
  created: string;
  updated: string;
}

// Collection: notes_label
export interface NoteLabel extends BaseModel {
  name: string;
  color?: string; // assuming labels might have colors
}

// Note types
export type NoteType = 'text' | 'todo';

// Collection: notes
export interface Note extends BaseModel {
  title: string;
  content: string; // HTML or Text
  images: string[]; /* Filenames */
  is_favorite: boolean;
  color?: string;
  label?: string; // Relation ID to notes_label
  note_type?: NoteType; // Type of note (text or todo)
  todo_items?: TodoItem[]; // For todo notes
  expand?: {
    label?: NoteLabel;
  };
}

// Collection: planner_projects
export interface PlannerProject extends BaseModel {
  name: string;
  icon: string;
  color: string;
}

// Type definitions for planner
export type PlannerCardType = 'text' | 'todo' | 'progress' | 'note';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

// Collection: planner_items
export interface PlannerItem extends BaseModel {
  title: string;
  status: 'blocked' | 'pending' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  order: number;
  description?: string;
  project?: string; // Relation to planner_projects
  tags?: string[]; // Array of tag strings
  card_type?: PlannerCardType; // Type of card
  todo_items?: TodoItem[]; // For todo-list cards
  progress_value?: number; // For progress bar cards (0-100)
  linked_items?: string[]; // Array of related planner_item IDs
  expand?: {
    project?: PlannerProject;
    linked_items?: PlannerItem[];
  };
}


// Collection: books
export interface Book extends BaseModel {
  title: string;
  icon?: string;
  icon_color?: string; // Color class for the icon (e.g., 'text-purple-400')
  description?: string;
  order?: number; // For custom ordering
  is_section?: boolean; // Flag to mark this as a section separator
  // Helper for frontend, not in DB
  expand?: {
    pages?: Page[];
  };
}

// Collection: pages
export interface Page extends BaseModel {
  book: string; // Relation ID
  title: string;
  icon?: string;
  content: string; // HTML from Tiptap editor
  is_favorite: boolean;
  parent_page?: string; // Relation ID
  order?: number; // For custom ordering within a book
}

export type WidgetType = 'quick-note' | 'favorites' | 'calendar' | 'quick-access';
