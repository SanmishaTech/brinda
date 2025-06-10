export const ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.MEMBER]: "Member",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
