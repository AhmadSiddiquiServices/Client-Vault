import { ClientForm } from "@/components/clients/ClientForm";

interface EditClientPageProps {
  params: Promise<{
    clientId: string;
  }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { clientId } = await params;

  return <ClientForm mode="edit" clientId={clientId} />;
}
