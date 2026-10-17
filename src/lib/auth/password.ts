export const passwordRequirements = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "uppercase", label: "One uppercase letter (A–Z)", test: (value: string) => /[A-Z]/.test(value) },
  { id: "number", label: "One number (0–9)", test: (value: string) => /\d/.test(value) },
  { id: "symbol", label: "One special symbol (such as @, # or !)", test: (value: string) => /[\p{P}\p{S}]/u.test(value) },
] as const;

export function passwordRequirementResults(value: string) {
  return passwordRequirements.map((requirement) => ({
    ...requirement,
    met: requirement.test(value),
  }));
}

export function isStrongPassword(value: string) {
  return passwordRequirements.every((requirement) => requirement.test(value));
}

export function passwordErrorMessage(value: string) {
  const missing = passwordRequirementResults(value).filter((requirement) => !requirement.met);
  if (!missing.length) return "";
  return `Your password needs ${missing.map((requirement) => requirement.label.toLowerCase()).join(", ")}.`;
}
