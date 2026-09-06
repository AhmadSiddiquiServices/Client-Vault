export interface TagListItem {
  _id: string;
  name: string;
  usage: number;
  createdAt: string;
  updatedAt: string;
}

export interface TagsResponse {
  success: boolean;
  message?: string;
  tags: TagListItem[];
}
