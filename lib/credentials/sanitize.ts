interface CustomFieldLike {
  label: string;
  value: string;
  isSecret: boolean;
}

export function sanitizeCredential(credential: Record<string, unknown>) {
  const customFields = Array.isArray(credential.customFields)
    ? credential.customFields.map((field) => {
        const customField = field as CustomFieldLike;

        return {
          label: customField.label,
          isSecret: customField.isSecret,
          value: customField.isSecret ? null : customField.value,
        };
      })
    : [];

  const {
    secret: _secret,
    customFields: _customFields,
    ...safeCredential
  } = credential;

  return {
    ...safeCredential,
    customFields,
  };
}
