import { CategoryForm } from "@/components/categories/CategoryForm";

const mockCategory = {
  name: "E-Commerce",
  description:
    "Credentials related to online stores, e-commerce platforms and store administration.",
  color: "#00e676",
  status: "Active" as const,
};

export default async function EditCategoryPage() {
  return <CategoryForm mode="edit" category={mockCategory} />;
}
