/**
 * Product feature switches — keep gated UI in the codebase; turn on when sold/configured.
 *
 * Employee ops = role assignment, employee portal, task delegation (packer / deliveryman / etc.).
 * Default OFF until you explicitly enable the add-on.
 */
export function isEmployeeOpsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_EMPLOYEE_OPS_ENABLED === "true";
}
