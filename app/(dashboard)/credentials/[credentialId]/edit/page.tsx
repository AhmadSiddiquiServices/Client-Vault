import { CredentialForm } from "@/components/credentials/CredentialForm";

type EditCredentialPageProps = {
  params: Promise<{
    credentialId: string;
  }>;
};

export default async function EditCredentialPage({
  params,
}: EditCredentialPageProps) {
  const { credentialId } = await params;

  return <CredentialForm mode="edit" credentialId={credentialId} />;
}
