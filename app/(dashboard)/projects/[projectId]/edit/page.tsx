import { ProjectForm } from "@/components/projects/ProjectForm";

interface EditProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { projectId } = await params;

  return <ProjectForm mode="edit" projectId={projectId} />;
}
