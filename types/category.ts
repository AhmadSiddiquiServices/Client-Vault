export interface CategoryListItem {
  _id: string;
  name: string;
  description?: string;
  color: string;
  credentialsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  message?: string;
  categories: CategoryListItem[];
}
