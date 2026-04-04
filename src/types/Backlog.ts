// src/types/Backlog.ts

export interface Backlog {
  id: string;
  title: string;
  backlogType: "folder" | "task" | "subtask";
  type: "project" | "sprint";
  description: string | null;
  position: number;
  parentId: string | null;
  userId: string;
  highlightColor: string | null;
  createdAt: Date;
  updatedAt: Date;
  children?: Backlog[];
}

export interface BacklogNode extends Backlog {
  children: BacklogNode[];
}