export interface BaseModel {
  id?: string;
  created?: string;
  updated?: string;
}

export interface Section extends BaseModel {
  title: string;
  order?: number;
  AppItems?: AppItem[];
  expand?: { 
    apps_via_section?: AppItem[];
  };
}

export interface AppItem extends BaseModel {
  name: string;
  url: string;
  icon?: string;
  iconUrl?: string;
  order?: number;
  section?: string; // Relation ID
  type?: 'app' | 'bookmark';
  templateId?: string;
  config?: Record<string, string>;
  healthCheck?: boolean;
}

export interface DashboardData {
  sections: Section[];
  bookmarks: AppItem[];
}
