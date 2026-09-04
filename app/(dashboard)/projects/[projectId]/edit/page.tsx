import { ProjectForm } from "@/components/projects/ProjectForm";

const mockProject = {
  name: "GumJoy E-Commerce Website",
  clientId: "1",
  type: "Shopify Store",
  url: "https://gumjoy.co.uk",
  status: "Active" as const,
  description:
    "GumJoy's main e-commerce website built on Shopify for selling fruit juice gummy sweets.",
  tags: ["shopify", "e-commerce", "production"],
};

export default async function EditProjectPage() {
  return <ProjectForm mode="edit" project={mockProject} />;
}
