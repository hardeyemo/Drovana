export const appRoles = ["customer", "rider", "business", "admin"] as const;
export type AppRole = (typeof appRoles)[number];

export const roleHome: Record<AppRole, string> = {
  customer: "/account",
  rider: "/rider/dashboard",
  business: "/business/dashboard",
  admin: "/admin/dashboard",
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && appRoles.includes(value as AppRole);
}
