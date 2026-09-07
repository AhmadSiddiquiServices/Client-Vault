export interface CredentialClient {
  _id: string;
  name: string;
  company?: string;
}

export interface CredentialProject {
  _id: string;
  name: string;
  type?: string;
  status?: string;
}

export interface CredentialCategory {
  _id: string;
  name: string;
}

export interface CredentialTag {
  _id: string;
  name: string;
}

export interface CredentialListItem {
  _id: string;
  name: string;
  client: CredentialClient | null;
  projects: CredentialProject[];
  category: CredentialCategory | null;
  tags: CredentialTag[];
  username?: string;
  url?: string;
  notes?: string;
  isFavorite: boolean;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialsResponse {
  success: boolean;
  message?: string;
  credentials: CredentialListItem[];
}
