export type Report = {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
};

export type ReportInput = {
  userId: string;
  content: string;
};