import { TagForm } from "@/components/tags/TagForm";

type EditTagPageProps = {
  params: Promise<{
    tagId: string;
  }>;
};

export default async function EditTagPage({ params }: EditTagPageProps) {
  const { tagId } = await params;

  return <TagForm mode="edit" tagId={tagId} />;
}
