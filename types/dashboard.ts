import type { IActivity } from "@/models/Activity";

export interface DashboardStats {
  clients: number;
  projects: number;
  credentials: number;
}

export interface DashboardCredential {
  _id: string;
  name: string;
  client: {
    _id: string;
    name: string;
    company?: string;
  } | null;
  projects: {
    _id: string;
    name: string;
    type: string;
  }[];
  category: {
    _id: string;
    name: string;
  } | null;
  tags: {
    _id: string;
    name: string;
  }[];
  isFavorite: boolean;
  isShared: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface DashboardActivity {
  _id: string;
  action: IActivity["action"];
  entity: IActivity["entity"];
  entityId: string;
  description?: string;
  createdAt: string;
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  recentCredentials: DashboardCredential[];
  recentActivity: DashboardActivity[];
}
