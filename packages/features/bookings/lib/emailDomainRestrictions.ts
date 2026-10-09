export const parseEmailDomainList = (list?: string) =>
  list
    ?.split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean) ?? [];

export const getEmailDomainViolation = ({
  email,
  excludedDomains,
  requiredDomains,
}: {
  email: string;
  excludedDomains: string[];
  requiredDomains: string[];
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (excludedDomains.some((domain) => normalizedEmail.includes(domain))) {
    return "exclude_emails_match_found_error_message";
  }

  const hasRequiredDomain = requiredDomains.some((domain) => normalizedEmail.includes(domain));

  return null;
};
