export type ClientStatus = "active" | "inactive" | "archived";

export interface ClientListItem {
  _id: string;
  name: string;
  company?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  status: ClientStatus;
  notes?: string;
  projectsCount: number;
  credentialsCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientsResponse {
  success: boolean;
  clients: ClientListItem[];
}
