import { CategoryForm } from "@/components/categories/CategoryForm";

type NewCategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export default async function NewCategoryPage({
  params,
}: NewCategoryPageProps) {
  const { categoryId } = await params;

  return <CategoryForm mode="create" />;
}
