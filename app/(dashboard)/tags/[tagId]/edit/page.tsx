import { TagForm } from "@/components/tags/TagForm";

const mockTag = {
  name: "production",
  description:
    "Used for credentials and projects that are currently running in the production environment.",
  type: "Environment" as const,
  color: "#00e676",
  status: "Active" as const,
};

export default async function EditTagPage() {
  return <TagForm mode="edit" tag={mockTag} />;
}
