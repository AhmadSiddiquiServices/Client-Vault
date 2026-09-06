import { ProjectForm } from "@/components/projects/ProjectForm";

interface NewProjectPageProps {
  searchParams: Promise<{
    client?: string;
  }>;
}

export default async function NewProjectPage({
  searchParams,
}: NewProjectPageProps) {
  const params = await searchParams;

  return <ProjectForm mode="create" initialClientId={params.client} />;
}
