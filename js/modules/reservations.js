"use strict";

export function isContractorNegotiationStatus(reservation, hasPendingReschedule = false) {
  return ["pending", "schedule_counter", "original_kept", "accepted", "working"].includes(reservation?.status)
    || Boolean(hasPendingReschedule);
}
