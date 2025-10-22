export interface ActivityLog {
  id: string;
  actorId: string | null;
  action: string;
  meta: any;
  createdAt: Date;
}

export interface CreateActivityRequest {
  actorId?: string;
  action: string;
  meta?: any;
}
