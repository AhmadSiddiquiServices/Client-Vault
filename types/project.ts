export type ProjectStatus = "active" | "inactive" | "completed" | "archived";

export type ProjectType =
  | "website"
  | "shopify-store"
  | "mobile-app"
  | "api"
  | "saas"
  | "internal-system"
  | "server"
  | "other";

export interface ProjectClient {
  _id: string;
  name: string;
  company?: string;
}

export interface ProjectListItem {
  _id: string;
  name: string;
  client: ProjectClient | null;
  type: ProjectType;
  url?: string;
  description?: string;
  status: ProjectStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  success: boolean;
  message?: string;
  projects: ProjectListItem[];
}

export interface ProjectClientsResponse {
  success: boolean;
  message?: string;
  clients: {
    _id: string;
    name: string;
    company?: string;
  }[];
}
