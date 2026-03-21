export type UserRole = "ADMIN" | "ENGINEERING" | "APPROVER" | "OPERATIONS"

export const ROLE_PERMISSIONS = {
  canCreateECO: ["ADMIN", "ENGINEERING"] as UserRole[],
  canApproveECO: ["ADMIN", "APPROVER"] as UserRole[],
  canValidateECO: ["ADMIN", "ENGINEERING"] as UserRole[],
  canRejectECO: ["ADMIN", "APPROVER"] as UserRole[],
  canDragKanban: ["ADMIN", "ENGINEERING", "APPROVER"] as UserRole[],
  canViewSettings: ["ADMIN"] as UserRole[],
  canRollback: ["ADMIN"] as UserRole[],
  canViewReports: ["ADMIN", "ENGINEERING", "APPROVER"] as UserRole[],
}

export function hasPermission(role: UserRole, action: keyof typeof ROLE_PERMISSIONS): boolean {
  return (ROLE_PERMISSIONS[action] as UserRole[]).includes(role)
}

export function assertPermission(role: UserRole, action: keyof typeof ROLE_PERMISSIONS): void {
  if (!hasPermission(role, action)) {
    throw new Error(`Role ${role} does not have permission: ${action}`)
  }
}
