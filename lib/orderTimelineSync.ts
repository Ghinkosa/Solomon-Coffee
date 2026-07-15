/** Pipeline order for fulfillment timeline (higher = further along). */
const STATUS_RANK: Record<string, number> = {
  pending: 0,
  address_confirmed: 1,
  order_confirmed: 2,
  packed: 3,
  ready_for_delivery: 4,
  out_for_delivery: 5,
  delivered: 6,
  completed: 7,
};

function makeHistoryKey() {
  return `sh${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrderStatusRank(status: string | null | undefined): number {
  if (!status) return 0;
  return STATUS_RANK[status] ?? 0;
}

export type OrderTimelineSnapshot = {
  status?: string;
  addressConfirmedAt?: string | null;
  addressConfirmedBy?: string | null;
  orderConfirmedAt?: string | null;
  orderConfirmedBy?: string | null;
  packedAt?: string | null;
  packedBy?: string | null;
  dispatchedAt?: string | null;
  dispatchedBy?: string | null;
  deliveredAt?: string | null;
  deliveredBy?: string | null;
  statusHistory?: Array<Record<string, unknown>>;
};

/**
 * When admin (or API) sets `status`, fill missing timeline timestamps so the
 * customer OrderTimeline (which keys off *At fields) stays in sync.
 * Existing timestamps are never overwritten.
 */
export function buildTimelineFieldsForStatus(
  newStatus: string,
  existing: OrderTimelineSnapshot,
  actorEmail: string,
  options?: { notes?: string },
): Record<string, unknown> {
  const now = new Date().toISOString();
  const actor = actorEmail || "admin";
  const patch: Record<string, unknown> = {};
  const rank = getOrderStatusRank(newStatus);

  if (newStatus === "cancelled") {
    // Caller usually sets cancelledAt; still ensure history entry below.
  } else if (rank >= 1 && !existing.addressConfirmedAt) {
    patch.addressConfirmedAt = now;
    patch.addressConfirmedBy = actor;
  }

  if (rank >= 2 && !existing.orderConfirmedAt) {
    patch.orderConfirmedAt = now;
    patch.orderConfirmedBy = actor;
  }

  if (rank >= 3 && !existing.packedAt) {
    patch.packedAt = now;
    patch.packedBy = actor;
  }

  if (rank >= 4 && !existing.dispatchedAt) {
    patch.dispatchedAt = now;
    patch.dispatchedBy = actor;
  }

  if (rank >= 6 && !existing.deliveredAt) {
    patch.deliveredAt = now;
    patch.deliveredBy = actor;
  }

  const history = Array.isArray(existing.statusHistory)
    ? [...existing.statusHistory]
    : [];
  history.push({
    _key: makeHistoryKey(),
    status: newStatus,
    changedBy: actor,
    changedByRole: "admin",
    changedAt: now,
    notes: options?.notes ?? "Status updated in admin console",
  });
  patch.statusHistory = history;

  return patch;
}

/**
 * Whether a timeline step should show as completed from either an explicit
 * timestamp or an admin status jump past that step.
 */
export function isTimelineStepComplete(
  status: string | undefined,
  minStatus: string,
  timestamp?: string | null,
  extraSignal?: boolean,
): boolean {
  if (timestamp) return true;
  if (extraSignal) return true;
  return getOrderStatusRank(status) >= getOrderStatusRank(minStatus);
}
