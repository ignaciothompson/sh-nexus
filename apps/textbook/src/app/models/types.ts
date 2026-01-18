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

// Collection: notes
export interface Note extends BaseModel {
  title: string;
  content: string; // HTML or Text
  images: string[]; /* Filenames */
  is_favorite: boolean;
  color?: string;
  label?: string; // Relation ID to notes_label
  expand?: {
    label?: NoteLabel;
  };
}

// Collection: planner_items
export interface PlannerItem extends BaseModel {
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  order: number;
  description?: string; // Optional as not explicitly in schema but useful
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
