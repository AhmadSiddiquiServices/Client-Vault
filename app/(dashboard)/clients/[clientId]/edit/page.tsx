import { ClientForm } from "@/components/clients/ClientForm";

const mockClient = {
  name: "GumJoy",
  contactPerson: "John Smith",
  email: "enquiries@gumjoy.co.uk",
  phone: "+44 7377 615576",
  website: "https://gumjoy.co.uk",
  address: "38 Lomond Road, M22 5JD\nUnited Kingdom",
  status: "Active" as const,
  notes: "Gummies (fruit juice candies) business.",
};

export default async function EditClientPage() {
  return <ClientForm mode="edit" client={mockClient} />;
}
