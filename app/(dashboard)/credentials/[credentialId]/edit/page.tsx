import { CredentialForm } from "@/components/credentials/CredentialForm";

const mockCredential = {
  name: "Shopify Admin",
  category: "E-Commerce",
  clientId: "1",
  projectId: "1",
  username: "admin@gumjoy.co.uk",
  password: "GumJoy_Admin_2026!",
  website: "https://admin.shopify.com",
  tags: ["shopify", "admin", "production"],
  notes:
    "Main Shopify administrator account used for managing products, orders, customers, discounts and store settings.",
  customFields: [
    {
      id: "store-url",
      label: "Store URL",
      value: "https://gumjoy.myshopify.com",
      type: "url" as const,
    },
    {
      id: "store-name",
      label: "Store Name",
      value: "GumJoy",
      type: "text" as const,
    },
    {
      id: "account-type",
      label: "Account Type",
      value: "Administrator",
      type: "text" as const,
    },
  ],
  favorite: true,
  status: "Active" as const,
};

export default async function EditCredentialPage() {
  return <CredentialForm mode="edit" credential={mockCredential} />;
}
