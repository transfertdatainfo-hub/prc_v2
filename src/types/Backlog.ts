export type Backlog = {
  id: string;
  title: string;
  backlogType: 'folder' | 'task' | 'subtask';
  type: 'project' | 'sprint';
  description?: string | null;
  position: number;
  parentId?: string | null;
  userId: string;
  highlightColor?: string | null;
  status?: 'draft' | 'ready' | 'active' | 'in_progress' | 'done' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
};

export type BacklogNode = Backlog & {
  children: BacklogNode[];
};