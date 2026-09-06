import { CategoryForm } from "@/components/categories/CategoryForm";

type EditCategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { categoryId } = await params;

  return <CategoryForm mode="edit" categoryId={categoryId} />;
}
